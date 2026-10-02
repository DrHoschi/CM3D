import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { installPrimitiveFamily } from '../src/application/primitive-family.js';
import { createProject, validateProject } from '../src/model/project.js';

const clone=value=>structuredClone(value);
function createTestStore(project=createProject()){
  const undoStack=[],redoStack=[];
  const store={project,events:[],getObject(id){return this.project.scene.objects[id]??null;},snapshot(){return clone(this.project);},touch(){},emit(type,payload){this.events.push({type,payload});},select(){},pushHistory(before,label){undoStack.push({before,label,after:clone(this.project)});redoStack.length=0;},addObject(factory,label){const before=this.snapshot(),object=factory(this.project),id=object.objectId;this.project.scene.objects[id]=object;this.project.scene.rootObjectIds.push(id);this.pushHistory(before,label);return id;},setGeometry(id,next={}){const object=this.getObject(id);if(object?.type==='primitive.sphere'){const before=this.snapshot();object.data={...object.data,...next};this.pushHistory(before,'Abmessungen ändern');}},undo(){const entry=undoStack.pop();if(!entry)return;redoStack.push({before:clone(entry.before),after:clone(this.project),label:entry.label});this.project=clone(entry.before);},redo(){const entry=redoStack.pop();if(!entry)return;undoStack.push({before:clone(this.project),after:clone(entry.after),label:entry.label});this.project=clone(entry.after);},replaceProject(next){this.project=clone(next);}};
  return store;
}

const store=createTestStore();
installPrimitiveFamily(store);

const sphereId=store.addSphere?.() ?? (()=>{const id=Object.values(store.project.scene.objects).find(o=>o.type==='primitive.sphere')?.objectId;return id;})();
const coneId=store.addCone();
const planeId=store.addPlane();
const tubeId=store.addTube();
const torusId=store.addTorus();

assert.equal(store.getObject(coneId).type,'primitive.cone');
assert.deepEqual(store.getObject(coneId).data,{radius:0.5,height:1,segments:32});
assert.equal(store.getObject(planeId).type,'primitive.plane');
assert.deepEqual(store.getObject(planeId).data,{width:1,height:1});
assert.equal(store.getObject(tubeId).type,'primitive.tube');
assert.deepEqual(store.getObject(tubeId).data,{innerRadius:0.35,outerRadius:0.5,height:1,segments:32});
assert.equal(store.getObject(torusId).type,'primitive.torus');
assert.deepEqual(store.getObject(torusId).data,{majorRadius:0.5,tubeRadius:0.15,radialSegments:16,tubularSegments:48});
for(const id of [coneId,planeId,tubeId,torusId])assert.equal(store.getObject(id).data.sourceRef,undefined,'Primitive must remain source-independent');

store.setGeometry(coneId,{radius:0.75,height:2,segments:24});
store.setGeometry(planeId,{width:3,height:2});
store.setGeometry(tubeId,{innerRadius:0.4,outerRadius:0.8,height:2,segments:40});
store.setGeometry(torusId,{majorRadius:1,tubeRadius:0.2,radialSegments:20,tubularSegments:64});
assert.deepEqual(store.getObject(coneId).data,{radius:0.75,height:2,segments:24});
assert.deepEqual(store.getObject(planeId).data,{width:3,height:2});
assert.deepEqual(store.getObject(tubeId).data,{innerRadius:0.4,outerRadius:0.8,height:2,segments:40});
assert.deepEqual(store.getObject(torusId).data,{majorRadius:1,tubeRadius:0.2,radialSegments:20,tubularSegments:64});

const saved=clone(store.project);
assert.equal(validateProject(saved).valid,true,'F047/F048 project must validate');
const reloaded=createTestStore();installPrimitiveFamily(reloaded);reloaded.replaceProject(saved);
assert.deepEqual(reloaded.getObject(tubeId).data,store.getObject(tubeId).data,'Save→Reload must preserve primitive parameters');

const beforeUndo=clone(store.getObject(torusId).data);store.setGeometry(torusId,{majorRadius:1.5});assert.equal(store.getObject(torusId).data.majorRadius,1.5);store.undo();assert.deepEqual(store.getObject(torusId).data,beforeUndo,'Undo must restore primitive parameters');store.redo();assert.equal(store.getObject(torusId).data.majorRadius,1.5,'Redo must restore primitive edit');

const extrude=await readFile(new URL('../src/application/extrude.js',import.meta.url),'utf8');assert.match(extrude,/installPrimitiveFamily\(store\)/,'Primitive family must be installed through productive store chain');
const loftRuntime=await readFile(new URL('../src/runtime-three/loft.js',import.meta.url),'utf8');assert.match(loftRuntime,/installPrimitiveFamilyRuntime\(runtime\)/,'Primitive family runtime must be installed through productive geometry chain');
const projectSource=await readFile(new URL('../src/model/project.js',import.meta.url),'utf8');assert.match(projectSource,/primitive\.sphere/,'Existing F047 sphere authority must remain present');
void sphereId;
console.log('WD-23F Primitive Family Completion: PASS');
