import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createMirrorFeature, declareMirrorDependencies, recomputeMirrorFeature, installMirrorFoundation } from '../src/application/mirror.js';
import { createFeatureBodyOutputReference } from '../src/application/feature-output.js';
import { createStableReference, ReferenceTargetKind } from '../src/application/stable-reference.js';
import { SYSTEM_CONSTRUCTION_OWNER_ID, GlobalWorkPlaneId } from '../src/model/construction-reference.js';

const identity=()=>({position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0,w:1},scale:{x:1,y:1,z:1},pivot:{x:0,y:0,z:0}});
const source={objectId:'source',type:'feature.test-solid',name:'Source',parentId:null,order:0,transform:identity(),data:{},materialIds:[],flags:{visible:true,locked:false},extensions:{recomputeState:{state:'READY'}}};
const objects={source};const project={scene:{rootObjectIds:['source'],objects}};
const sourceRef=createFeatureBodyOutputReference('source');
const planeRef=createStableReference(ReferenceTargetKind.WORK_PLANE,SYSTEM_CONSTRUCTION_OWNER_ID,GlobalWorkPlaneId.YZ);
const mirror=createMirrorFeature(project,sourceRef,planeRef);objects[mirror.objectId]=mirror;project.scene.rootObjectIds.push(mirror.objectId);
const store={project,getObject(id){return this.project.scene.objects[id]??null;}};

assert.equal(mirror.type,'feature.mirror');assert.equal(mirror.data.sourceRef.targetKind,'FEATURE_OUTPUT');assert.equal(mirror.data.planeRef.targetKind,'WORK_PLANE');
const deps=declareMirrorDependencies(mirror);assert.equal(deps.length,2);assert.equal(deps[0].kind,'SOURCE_BODY_TO_MIRROR');assert.equal(deps[1].kind,'PLANE_TO_MIRROR');
let result=recomputeMirrorFeature(store,mirror.objectId);assert.equal(result.state,'READY');assert.equal(result.outputRef.ownerId,mirror.objectId);assert.equal(result.planeGeometry.kind,'PLANE');
source.extensions.recomputeState={state:'BLOCKED'};assert.equal(recomputeMirrorFeature(store,mirror.objectId).state,'BLOCKED');source.extensions.recomputeState={state:'READY'};assert.equal(recomputeMirrorFeature(store,mirror.objectId).state,'READY');
const saved=JSON.stringify(project),reloaded=JSON.parse(saved);assert.deepEqual(reloaded.scene.objects[mirror.objectId].data.sourceRef,sourceRef);assert.deepEqual(reloaded.scene.objects[mirror.objectId].data.planeRef,planeRef);

const historyStore={project:reloaded,undoStack:[],redoStack:[],getObject(id){return this.project.scene.objects[id]??null;},snapshot(){return structuredClone(this.project);},touch(){},emit(){},pushHistory(before,label){this.undoStack.push({before,after:this.snapshot(),label});this.redoStack=[];},addObject(factory,label){const before=this.snapshot(),o=factory(this.project);this.project.scene.objects[o.objectId]=o;this.project.scene.rootObjectIds.push(o.objectId);this.pushHistory(before,label);return o.objectId;}};
installMirrorFoundation(historyStore);const id=historyStore.addMirror(sourceRef,planeRef);assert.equal(historyStore.getObject(id).type,'feature.mirror');assert.equal(historyStore.undoStack.at(-1).label,'Mirror erzeugen');
const before=structuredClone(historyStore.project);historyStore.project=structuredClone(historyStore.undoStack.at(-1).before);assert.equal(historyStore.getObject(id),null);historyStore.project=before;assert.equal(historyStore.getObject(id).type,'feature.mirror');

const runtime=fs.readFileSync(new URL('../src/runtime-three/mirror.js',import.meta.url),'utf8');assert.match(runtime,/addScaledVector\(normal,-2\*/);assert.match(runtime,/computeVertexNormals\(\)/);assert.match(runtime,/index\.setX\(i\+1,index\.getX\(i\+2\)\)/);assert.doesNotMatch(runtime,/scale\.x\s*=\s*-1|scale\.set\s*\(\s*-1/);
const runtimeChain=fs.readFileSync(new URL('../src/runtime-three/primitive-family.js',import.meta.url),'utf8');assert.equal((runtimeChain.match(/installMirrorRuntime\(runtime\)/g)||[]).length,1);
const appChain=fs.readFileSync(new URL('../src/application/primitive-family.js',import.meta.url),'utf8');assert.equal((appChain.match(/installMirrorFoundation\(store\)/g)||[]).length,1);
console.log('WD-24D Mirror Foundation: PASS');
