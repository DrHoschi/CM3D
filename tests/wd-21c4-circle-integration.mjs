import assert from 'node:assert/strict';
import fs from 'node:fs';
import { installSketchMutationContract } from '../src/application/sketch-mutation.js';
import { installGenericSketchElementMutationContract } from '../src/application/sketch-element-mutation-extension.js';
import { createProject, createSketchObject, migrateAndValidateProject } from '../src/model/project.js';

const project = createProject('WD-21C.4');
const sketch = createSketchObject(project, 'Circle Sketch');
project.scene.objects[sketch.objectId] = sketch;
project.scene.rootObjectIds.push(sketch.objectId);
const store = {
  project,
  selection:{sketchElement:null},
  undoStack:[], redoStack:[],
  snapshot(){return structuredClone(this.project);},
  pushHistory(before,label){this.undoStack.push({before,after:this.snapshot(),label});this.redoStack=[];},
  getObject(id){return this.project.scene.objects[id]??null;},
  touch(){this.project.project.modifiedAt='touched';},
  emit(){},
  refreshDependentExtrudesFromSketch(){return [];}
};
installSketchMutationContract(store);
installGenericSketchElementMutationContract(store);
const circleId = store.addSketchCircle(sketch.objectId,{x:1.25,y:-2.5},3.75);
assert.ok(circleId);
assert.deepEqual(store.getObject(sketch.objectId).data.circles[circleId],{circleId,center:{x:1.25,y:-2.5},radius:3.75});
assert.equal(store.getObject(sketch.objectId).data.points[circleId],undefined,'circle center is not a topology point');
assert.equal(store.undoStack.length,1);
assert.equal(store.setSketchCircle(sketch.objectId,circleId,{center:{x:2,y:3},radius:4}),true);
assert.equal(store.undoStack.length,2);
assert.equal(store.getObject(sketch.objectId).data.circles[circleId].circleId,circleId);
const roundTrip = migrateAndValidateProject(JSON.parse(JSON.stringify(store.project))).project;
assert.deepEqual(roundTrip.scene.objects[sketch.objectId].data.circles[circleId],{circleId,center:{x:2,y:3},radius:4});
store.selection.sketchElement={sketchId:sketch.objectId,kind:'circle',elementId:circleId};
assert.equal(store.deleteSketchElement(),true);
assert.equal(store.getObject(sketch.objectId).data.circles[circleId],undefined);
assert.equal(store.undoStack.length,3);

const integration = fs.readFileSync(new URL('../src/ui/sketch-circle-integration.js',import.meta.url),'utf8');
assert.match(integration,/installSketchCircleIntegration/);
assert.match(integration,/runtime\.toggleSketchInput\('circle'\)/);
assert.match(integration,/store\.addSketchCircle/);
assert.match(integration,/store\.setSketchCircle/);
assert.match(integration,/data\?\.circles/);
assert.match(integration,/kind: 'circle'/);
assert.match(integration,/Kreise \(\$\{circles\.length\}\)/);
assert.match(integration,/Skizzenkreis/);
assert.match(integration,/cm3dDerivedCircleTessellation/);
assert.match(integration,/CIRCLE_RENDER_SEGMENTS = 64/);
assert.doesNotMatch(integration,/renderSegments\s*[:=]/);
assert.doesNotMatch(integration,/addSketchArc|addSketchSpline|setSketchArc|setSketchSpline/);
assert.doesNotMatch(integration,/addRegularPolygon|setRegularPolygon|addFacetedArc|createExtrudeFromSketch/);

const main = fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert.match(main,/const BUILD_ID = 'WD-21C\.4'/);
assert.match(main,/installSketchCircleIntegration/);

console.log('WD-21C.4 Circle Creation, Rendering & Editing Integration: PASS');
