import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BooleanOperation, createBooleanFeature, declareBooleanDependencies, recomputeBooleanFeature, installBooleanFoundation } from '../src/application/boolean.js';
import { createFeatureBodyOutputReference } from '../src/application/feature-output.js';

const identity=()=>({position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0,w:1},scale:{x:1,y:1,z:1},pivot:{x:0,y:0,z:0}});
const feature=(id,state='READY')=>({objectId:id,type:'feature.test-solid',name:id,parentId:null,order:0,transform:identity(),data:{},materialIds:[],flags:{visible:true,locked:false},extensions:{recomputeState:{state}}});
const objects={a:feature('a'),b:feature('b')};
const project={scene:{rootObjectIds:['a','b'],objects}};
const targetRef=createFeatureBodyOutputReference('a'),toolRef=createFeatureBodyOutputReference('b');
const boolean=createBooleanFeature(project,targetRef,toolRef,BooleanOperation.SUBTRACT,'Cut');
objects[boolean.objectId]=boolean;project.scene.rootObjectIds.push(boolean.objectId);
const store={project,getObject(id){return this.project.scene.objects[id]??null;}};

assert.equal(boolean.data.operation,'SUBTRACT');
assert.equal(boolean.data.targetRef.ownerId,'a');
assert.equal(boolean.data.toolRef.ownerId,'b');
assert.notEqual(boolean.data.targetRef.ownerId,boolean.data.toolRef.ownerId);
const deps=declareBooleanDependencies(boolean);
assert.deepEqual(deps.map(d=>[d.kind,d.reference.ownerId]),[['TARGET_BODY_TO_BOOLEAN','a'],['TOOL_BODY_TO_BOOLEAN','b']]);
let result=recomputeBooleanFeature(store,boolean.objectId);
assert.equal(result.state,'READY');
assert.equal(result.outputRef.ownerId,boolean.objectId);

objects.a.extensions.recomputeState={state:'BLOCKED'};
result=recomputeBooleanFeature(store,boolean.objectId);
assert.equal(result.state,'BLOCKED');
objects.a.extensions.recomputeState={state:'READY'};
assert.equal(recomputeBooleanFeature(store,boolean.objectId).state,'READY');

const saved=JSON.stringify(project),reloaded=JSON.parse(saved),reloadedBoolean=reloaded.scene.objects[boolean.objectId];
assert.equal(reloadedBoolean.data.operation,'SUBTRACT');
assert.deepEqual(reloadedBoolean.data.targetRef,targetRef);
assert.deepEqual(reloadedBoolean.data.toolRef,toolRef);

const historyStore={
  project:reloaded,undoStack:[],redoStack:[],listeners:[],
  getObject(id){return this.project.scene.objects[id]??null;},snapshot(){return structuredClone(this.project);},touch(){},emit(){},
  pushHistory(before,label){this.undoStack.push({before,after:this.snapshot(),label});this.redoStack=[];},
  addObject(factory,label){const before=this.snapshot(),o=factory(this.project);this.project.scene.objects[o.objectId]=o;this.project.scene.rootObjectIds.push(o.objectId);this.pushHistory(before,label);return o.objectId;}
};
installBooleanFoundation(historyStore);
const id=historyStore.addBoolean(targetRef,toolRef,BooleanOperation.UNION);
assert.equal(historyStore.getObject(id).data.operation,'UNION');
assert.equal(historyStore.undoStack.at(-1).label,'Boolean erzeugen');
historyStore.setBooleanOperation(id,BooleanOperation.INTERSECT);
assert.equal(historyStore.getObject(id).data.operation,'INTERSECT');
assert.equal(historyStore.undoStack.at(-1).label,'Boolean Operation ändern');
const undoEntry=historyStore.undoStack.at(-1);historyStore.project=structuredClone(undoEntry.before);
assert.equal(historyStore.getObject(id).data.operation,'UNION');
historyStore.project=structuredClone(undoEntry.after);
assert.equal(historyStore.getObject(id).data.operation,'INTERSECT');

const runtimeSource=fs.readFileSync(new URL('../src/runtime-three/boolean.js',import.meta.url),'utf8');
assert.match(runtimeSource,/three-bvh-csg@0\.0\.18/);
assert.match(runtimeSource,/UNION:ADDITION/);
assert.match(runtimeSource,/SUBTRACT:SUBTRACTION/);
assert.match(runtimeSource,/INTERSECT:INTERSECTION/);
assert.match(runtimeSource,/evaluator\.evaluate\(targetBrush,toolBrush,operation\)/);
assert.doesNotMatch(runtimeSource,/boundingBox|Box3|fallback/i);
const runtimeChain=fs.readFileSync(new URL('../src/runtime-three/primitive-family.js',import.meta.url),'utf8');
assert.match(runtimeChain,/installBooleanRuntime\(runtime\)/);
const appChain=fs.readFileSync(new URL('../src/application/primitive-family.js',import.meta.url),'utf8');
assert.match(appChain,/installBooleanFoundation\(store\)/);

console.log('WD-24B Boolean Foundation: PASS');
