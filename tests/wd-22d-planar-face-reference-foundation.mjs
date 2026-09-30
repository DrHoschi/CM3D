import assert from 'node:assert/strict';
import { buildDependencyGraph } from '../src/application/dependency-graph.js';
import { createStableReference, ReferenceState, ReferenceTargetKind, resolveStableReference } from '../src/application/stable-reference.js';
import { ExtrudePlanarFaceId, extrudePlanarFaceDefinition } from '../src/model/planar-face-reference.js';
import { serializeProjectFile, parseProjectFileText } from '../src/persistence/project-file.js';

const identityTransform=()=>({position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0},scale:{x:1,y:1,z:1}});
const sourceRef=createStableReference(ReferenceTargetKind.SKETCH,'sketch_1','sketch_1');
const extrude=(direction='positive',depth=10)=>({objectId:'extrude_1',type:'feature.extrude',name:'Extrude',parentId:null,transform:identityTransform(),data:{sourceSketchRef:sourceRef,depth,direction,profile:{points:[{x:0,y:0},{x:1,y:0},{x:1,y:1}]}},extensions:{}});
const consumer={objectId:'consumer_1',type:'synthetic.consumer',name:'Consumer',parentId:null,transform:identityTransform(),data:{},extensions:{}};
const project={schemaVersion:'0.2.0',projectId:'wd22d',name:'WD-22D',scene:{rootObjectIds:['extrude_1','consumer_1'],objects:{extrude_1:extrude(),consumer_1:consumer}},metadata:{}};
const store={project,getObject(id){return this.project.scene.objects[id]??null;}};
const ref=id=>createStableReference(ReferenceTargetKind.PLANAR_FACE,'extrude_1',id);

for(const id of Object.values(ExtrudePlanarFaceId))assert.equal(resolveStableReference(store,ref(id)).state,ReferenceState.RESOLVED);
assert.equal(resolveStableReference(store,ref('SIDE_17')).state,ReferenceState.MISSING);
assert.equal(resolveStableReference(store,createStableReference(ReferenceTargetKind.PLANAR_FACE,'missing_owner',ExtrudePlanarFaceId.CAP_START)).state,ReferenceState.MISSING);

const wrong={...consumer,objectId:'wrong_owner'};store.project.scene.objects.wrong_owner=wrong;
assert.equal(resolveStableReference(store,createStableReference(ReferenceTargetKind.PLANAR_FACE,'wrong_owner',ExtrudePlanarFaceId.CAP_START)).state,ReferenceState.INVALID);
delete store.project.scene.objects.wrong_owner;

const expected={
  positive:{CAP_START:[0,-1],CAP_END:[10,1]},
  negative:{CAP_START:[0,1],CAP_END:[-10,-1]},
  symmetric:{CAP_START:[-5,-1],CAP_END:[5,1]}
};
for(const direction of Object.keys(expected)){
  store.project.scene.objects.extrude_1=extrude(direction,10);
  for(const id of Object.values(ExtrudePlanarFaceId)){
    const definition=extrudePlanarFaceDefinition(store.getObject('extrude_1'),id);
    assert.equal(definition.origin.z,expected[direction][id][0]);
    assert.equal(definition.normal.z,expected[direction][id][1]);
    assert.deepEqual(definition.xAxis,{x:1,y:0,z:0});
  }
}

store.project.scene.objects.extrude_1=extrude('positive',10);
const stableRef=ref(ExtrudePlanarFaceId.CAP_END);
const before=extrudePlanarFaceDefinition(store.getObject('extrude_1'),stableRef.targetId);
store.project.scene.objects.extrude_1.data.depth=25;
const after=extrudePlanarFaceDefinition(store.getObject('extrude_1'),stableRef.targetId);
assert.equal(stableRef.targetId,ExtrudePlanarFaceId.CAP_END);
assert.equal(before.origin.z,10);assert.equal(after.origin.z,25);

const declared=[{dependentObjectId:'consumer_1',reference:stableRef,kind:'PLANAR_FACE_TO_CONSUMER'}];
let graph=buildDependencyGraph(store,declared);
assert.equal(graph.dependenciesOf('consumer_1').length,1);
assert.equal(graph.dependenciesOf('consumer_1')[0].sourceObjectId,'extrude_1');
assert.equal(graph.dependenciesOf('consumer_1')[0].state,ReferenceState.RESOLVED);

store.project.scene.objects.extrude_1.extensions.recomputeState={state:'BLOCKED',upstreamState:'MISSING',diagnostics:[]};
assert.equal(resolveStableReference(store,stableRef).state,ReferenceState.BLOCKED);
graph=buildDependencyGraph(store,declared);
assert.equal(graph.nodeState('consumer_1').state,'BLOCKED');
delete store.project.scene.objects.extrude_1.extensions.recomputeState;

store.project.scene.objects.extrude_1.data.depth=0;
assert.equal(resolveStableReference(store,stableRef).state,ReferenceState.INVALID);
store.project.scene.objects.extrude_1=extrude('positive',10);

const persisted={...project,scene:{...project.scene,objects:{...project.scene.objects,consumer_1:{...consumer,data:{faceRef:stableRef}}}}};
const reloaded=parseProjectFileText(serializeProjectFile(persisted));
assert.deepEqual(reloaded.scene.objects.consumer_1.data.faceRef,stableRef);
assert.equal(reloaded.schemaVersion,'0.2.0');

console.log('WD-22D Planar Face Reference Foundation regression: PASS');
