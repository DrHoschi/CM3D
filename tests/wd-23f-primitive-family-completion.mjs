import assert from 'node:assert/strict';
import { AppStore } from '../src/application/store.js';
import { installPrimitiveFamily } from '../src/application/primitive-family.js';
import { validateProject } from '../src/model/project.js';

const store=new AppStore();
installPrimitiveFamily(store);

const sphereId=store.addSphere();
const coneId=store.addCone();
const planeId=store.addPlane();
const tubeId=store.addTube();
const torusId=store.addTorus();

assert.equal(store.getObject(sphereId).type,'primitive.sphere');
assert.equal(store.getObject(coneId).type,'primitive.cone');
assert.deepEqual(store.getObject(coneId).data,{radius:0.5,height:1,segments:32});
assert.equal(store.getObject(planeId).type,'primitive.plane');
assert.deepEqual(store.getObject(planeId).data,{width:1,height:1});
assert.equal(store.getObject(tubeId).type,'primitive.tube');
assert.deepEqual(store.getObject(tubeId).data,{innerRadius:0.35,outerRadius:0.5,height:1,segments:32});
assert.equal(store.getObject(torusId).type,'primitive.torus');
assert.deepEqual(store.getObject(torusId).data,{majorRadius:0.5,tubeRadius:0.15,radialSegments:16,tubularSegments:48});

for(const id of [sphereId,coneId,planeId,tubeId,torusId])assert.deepEqual(store.getObject(id).data.sourceRef,undefined,'Primitive must remain source-independent');

store.setGeometry(coneId,{radius:0.75,height:2,segments:24});
assert.deepEqual(store.getObject(coneId).data,{radius:0.75,height:2,segments:24});
store.setGeometry(planeId,{width:3,height:2});
assert.deepEqual(store.getObject(planeId).data,{width:3,height:2});
store.setGeometry(tubeId,{innerRadius:0.4,outerRadius:0.8,height:2,segments:40});
assert.deepEqual(store.getObject(tubeId).data,{innerRadius:0.4,outerRadius:0.8,height:2,segments:40});
store.setGeometry(torusId,{majorRadius:1,tubeRadius:0.2,radialSegments:20,tubularSegments:64});
assert.deepEqual(store.getObject(torusId).data,{majorRadius:1,tubeRadius:0.2,radialSegments:20,tubularSegments:64});

const saved=structuredClone(store.project);
assert.equal(validateProject(saved).valid,true,'F047/F048 project must validate');
const reloaded=new AppStore();
installPrimitiveFamily(reloaded);
reloaded.replaceProject(saved);
assert.deepEqual(reloaded.getObject(tubeId).data,store.getObject(tubeId).data,'Save→Reload must preserve primitive parameters');

const beforeUndo=structuredClone(store.getObject(torusId).data);
store.setGeometry(torusId,{majorRadius:1.5});
assert.equal(store.getObject(torusId).data.majorRadius,1.5);
store.undo();
assert.deepEqual(store.getObject(torusId).data,beforeUndo,'Undo must restore primitive parameters');
store.redo();
assert.equal(store.getObject(torusId).data.majorRadius,1.5,'Redo must restore primitive edit');

console.log('WD-23F Primitive Family Completion: PASS');
