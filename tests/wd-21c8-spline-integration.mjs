import assert from 'node:assert/strict';
import fs from 'node:fs';
import { installSketchMutationContract } from '../src/application/sketch-mutation.js';
import { installGenericSketchElementMutationContract } from '../src/application/sketch-element-mutation-extension.js';
import { installSketchSplineCreationContract } from '../src/application/sketch-spline-creation.js';
import { installGenericEndpointConnectivityContract } from '../src/application/sketch-endpoint-connectivity-extension.js';
import { buildSplineRenderPoints, SPLINE_RENDER_SEGMENTS } from '../src/application/sketch-spline-geometry.js';
import { createProject, createSketchObject, migrateAndValidateProject } from '../src/model/project.js';

const project = createProject('WD-21C.8');
const sketch = createSketchObject(project, 'Spline Sketch');
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
installSketchSplineCreationContract(store);
installGenericEndpointConnectivityContract(store);

const created = store.addSketchSplineFromPoints(sketch.objectId,{x:0,y:0},[{x:1,y:2},{x:2,y:2}],{x:3,y:0});
assert.ok(created?.splineId);
assert.equal(store.undoStack.length,1,'spline creation must be one history entry');
let authoritativeSketch = store.getObject(sketch.objectId);
let spline = authoritativeSketch.data.splines[created.splineId];
assert.ok(spline);
assert.equal(spline.startPointId,created.startPointId);
assert.equal(spline.endPointId,created.endPointId);
assert.deepEqual(spline.controls.map(control=>control.controlId),created.controlIds);
assert.equal(new Set(created.controlIds).size,2);

const beforeInvalid = JSON.stringify(authoritativeSketch.data);
assert.equal(store.addSketchSplineFromPoints(sketch.objectId,{x:0,y:0},[],{x:1,y:1}),null,'at least one control is required');
assert.equal(JSON.stringify(store.getObject(sketch.objectId).data),beforeInvalid,'invalid creation must leave no partial state');
assert.equal(store.undoStack.length,1);

const startId=spline.startPointId,endId=spline.endPointId,controlIds=spline.controls.map(control=>control.controlId);
assert.equal(store.setSketchSplineGeometry(sketch.objectId,spline.splineId,{
  start:{x:-1,y:0},end:{x:4,y:0},
  controls:spline.controls.map((control,index)=>({controlId:control.controlId,x:control.x,y:control.y+index+1}))
}),true);
authoritativeSketch=store.getObject(sketch.objectId); spline=authoritativeSketch.data.splines[created.splineId];
assert.equal(spline.startPointId,startId); assert.equal(spline.endPointId,endId);
assert.deepEqual(spline.controls.map(control=>control.controlId),controlIds);
assert.equal(store.undoStack.length,2);

const rejectedControls=structuredClone(spline.controls); rejectedControls[0].controlId='replacement';
const beforeRejected=JSON.stringify(store.getObject(sketch.objectId).data);
assert.equal(store.setSketchSplineGeometry(sketch.objectId,spline.splineId,{start:{x:-1,y:0},end:{x:4,y:0},controls:rejectedControls}),false);
assert.equal(JSON.stringify(store.getObject(sketch.objectId).data),beforeRejected,'control identity replacement must be rejected');

const second=store.addSketchSplineFromPoints(sketch.objectId,{x:6,y:0},[{x:7,y:1}],{x:8,y:0});
assert.ok(second);
assert.equal(store.connectSketchPoints(sketch.objectId,startId,second.startPointId).survivorPointId,startId);
authoritativeSketch=store.getObject(sketch.objectId);
assert.equal(authoritativeSketch.data.splines[second.splineId].startPointId,startId);
const secondControlIds=authoritativeSketch.data.splines[second.splineId].controls.map(control=>control.controlId);
const detached=store.disconnectSketchElementFromPoint(sketch.objectId,startId,'spline',second.splineId);
assert.ok(detached?.newPointId);
authoritativeSketch=store.getObject(sketch.objectId);
assert.deepEqual(authoritativeSketch.data.splines[second.splineId].controls.map(control=>control.controlId),secondControlIds,'connectivity must not touch controls');

assert.equal(SPLINE_RENDER_SEGMENTS,64);
const quadratic=buildSplineRenderPoints({x:0,y:0},[{x:1,y:2}],{x:2,y:0},8);
assert.equal(quadratic.length,9);
assert.deepEqual(quadratic[0],{x:0,y:0});
assert.deepEqual(quadratic.at(-1),{x:2,y:0});
assert.ok(Math.abs(quadratic[4].x-1)<1e-12 && Math.abs(quadratic[4].y-1)<1e-12,'de Casteljau midpoint must be deterministic');

const roundTrip=migrateAndValidateProject(JSON.parse(JSON.stringify(store.project))).project;
const saved=roundTrip.scene.objects[sketch.objectId].data.splines[created.splineId];
assert.equal(saved.splineId,created.splineId);
assert.equal(saved.startPointId,startId); assert.equal(saved.endPointId,endId);
assert.deepEqual(saved.controls.map(control=>control.controlId),controlIds);

const app=fs.readFileSync(new URL('../src/application/sketch-spline-creation.js',import.meta.url),'utf8');
assert.match(app,/addSketchSplineFromPoints/); assert.match(app,/setSketchSplineGeometry/); assert.match(app,/runSketchMutation/);
assert.match(app,/historyEntriesPerCreation: 1/); assert.match(app,/evaluator: 'de-casteljau'/);
assert.doesNotMatch(app,/createExtrudeFromSketch|TransformControls/);

const geometry=fs.readFileSync(new URL('../src/application/sketch-spline-geometry.js',import.meta.url),'utf8');
assert.match(geometry,/deCasteljau/); assert.match(geometry,/SPLINE_RENDER_SEGMENTS = 64/);

const integration=fs.readFileSync(new URL('../src/ui/sketch-spline-integration.js',import.meta.url),'utf8');
assert.match(integration,/installSketchSplineIntegration/); assert.match(integration,/buildSplineRenderPoints/);
assert.match(integration,/Splines \(\$\{splines\.length\}\)/); assert.match(integration,/cm3dDerivedSplineTessellation/);
assert.match(integration,/Spline abschließen/); assert.match(integration,/SPLINE_RENDER_SEGMENTS/);
assert.doesNotMatch(integration,/TransformControls|createExtrudeFromSketch|closedSpline\s*:\s*true/);

const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert.match(main,/const BUILD_ID = 'WD-21C\.8(?:-R\d+)?'/);
assert.match(main,/installSketchSplineCreationContract/); assert.match(main,/installSketchSplineIntegration/);

console.log('WD-21C.8 Spline Creation, Rendering & Editing Integration: PASS');
