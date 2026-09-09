import assert from 'node:assert/strict';
import fs from 'node:fs';
import { installSketchMutationContract } from '../src/application/sketch-mutation.js';
import { installGenericSketchElementMutationContract } from '../src/application/sketch-element-mutation-extension.js';
import { installSketchArcCreationContract } from '../src/application/sketch-arc-creation.js';
import { installGenericEndpointConnectivityContract } from '../src/application/sketch-endpoint-connectivity-extension.js';
import { createProject, createSketchObject, migrateAndValidateProject } from '../src/model/project.js';

const project = createProject('WD-21C.7');
const sketch = createSketchObject(project, 'Arc Sketch');
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
installSketchArcCreationContract(store);
installGenericEndpointConnectivityContract(store);

const created = store.addSketchArcFromPoints(sketch.objectId,{x:0,y:0},{x:2,y:0},{x:1,y:1});
assert.ok(created?.arcId);
assert.equal(store.undoStack.length,1,'arc creation must be one history entry');
const liveSketch = store.getObject(sketch.objectId);
const arc = liveSketch.data.arcs[created.arcId];
assert.ok(arc);
assert.equal(arc.startPointId,created.startPointId);
assert.equal(arc.endPointId,created.endPointId);
assert.deepEqual(arc.control,{x:1,y:1});
assert.deepEqual(liveSketch.data.points[created.startPointId],{pointId:created.startPointId,x:0,y:0});
assert.deepEqual(liveSketch.data.points[created.endPointId],{pointId:created.endPointId,x:2,y:0});

const beforeInvalid = JSON.stringify(store.project.scene.objects[sketch.objectId].data);
assert.equal(store.addSketchArcFromPoints(sketch.objectId,{x:0,y:0},{x:2,y:0},{x:1,y:0}),null,'collinear arc must be rejected');
assert.equal(JSON.stringify(store.project.scene.objects[sketch.objectId].data),beforeInvalid,'invalid arc must leave no persistent partial points');
assert.equal(store.undoStack.length,1,'invalid arc must create no history entry');

const startId = arc.startPointId, endId = arc.endPointId;
assert.equal(store.setSketchArcGeometry(sketch.objectId,arc.arcId,{start:{x:-1,y:0},end:{x:3,y:0},control:{x:1,y:2}}),true);
assert.equal(store.undoStack.length,2);
assert.equal(arc.startPointId,startId);
assert.equal(arc.endPointId,endId);
assert.deepEqual(liveSketch.data.points[startId],{pointId:startId,x:-1,y:0});
assert.deepEqual(liveSketch.data.points[endId],{pointId:endId,x:3,y:0});
assert.deepEqual(arc.control,{x:1,y:2});

const second = store.addSketchArcFromPoints(sketch.objectId,{x:5,y:0},{x:7,y:0},{x:6,y:1});
assert.ok(second);
const sourcePoint = second.startPointId;
assert.equal(store.connectSketchPoints(sketch.objectId,startId,sourcePoint).survivorPointId,startId,'C.6 must connect Arc endpoints');
assert.equal(liveSketch.data.arcs[second.arcId].startPointId,startId);
assert.deepEqual(liveSketch.data.arcs[second.arcId].control,{x:6,y:1},'connect must not change arc control');
const disconnected = store.disconnectSketchElementFromPoint(sketch.objectId,startId,'arc',second.arcId);
assert.ok(disconnected?.newPointId,'C.6 must disconnect Arc endpoints');
assert.deepEqual(liveSketch.data.arcs[second.arcId].control,{x:6,y:1},'disconnect must not change arc control');

const roundTrip = migrateAndValidateProject(JSON.parse(JSON.stringify(store.project))).project;
const savedArc = roundTrip.scene.objects[sketch.objectId].data.arcs[created.arcId];
assert.equal(savedArc.arcId,created.arcId);
assert.equal(savedArc.startPointId,startId);
assert.equal(savedArc.endPointId,endId);
assert.deepEqual(savedArc.control,{x:1,y:2});

const appContract = fs.readFileSync(new URL('../src/application/sketch-arc-creation.js',import.meta.url),'utf8');
assert.match(appContract,/addSketchArcFromPoints/);
assert.match(appContract,/setSketchArcGeometry/);
assert.match(appContract,/runSketchMutation/);
assert.match(appContract,/historyEntriesPerCreation: 1/);
assert.doesNotMatch(appContract,/addSketchSpline|setSketchSpline/);

const integration = fs.readFileSync(new URL('../src/ui/sketch-arc-integration.js',import.meta.url),'utf8');
assert.match(integration,/installSketchArcIntegration/);
assert.match(integration,/runtime\.toggleSketchInput\('arc'\)/);
assert.match(integration,/addSketchArcFromPoints/);
assert.match(integration,/setSketchArcGeometry/);
assert.match(integration,/Bögen \(\$\{arcs\.length\}\)/);
assert.match(integration,/Skizzenbogen/);
assert.match(integration,/cm3dDerivedArcTessellation/);
assert.match(integration,/ARC_RENDER_SEGMENTS = 64/);
assert.doesNotMatch(integration,/renderSegments\s*[:=]/);
assert.doesNotMatch(integration,/addSketchSpline|setSketchSpline|createExtrudeFromSketch|TransformControls/);

const main = fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert.match(main,/const BUILD_ID = 'WD-21C\.7'/);
assert.match(main,/installSketchArcCreationContract/);
assert.match(main,/installSketchArcIntegration/);

console.log('WD-21C.7 Arc Creation, Rendering & Editing Integration: PASS');
