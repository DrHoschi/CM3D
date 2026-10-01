import assert from 'node:assert/strict';
import { ReferenceTargetKind } from '../src/application/stable-reference.js';
import { SYSTEM_CONSTRUCTION_OWNER_ID } from '../src/model/construction-reference.js';
import { ReferenceAlignState, referenceAlignResult, commitReferenceAlign } from '../src/application/reference-align.js';

const pointRef=(ownerId,targetId)=>({ownerId,targetKind:ReferenceTargetKind.SKETCH_POINT,targetId});
const axisRef=targetId=>({ownerId:SYSTEM_CONSTRUCTION_OWNER_ID,targetKind:ReferenceTargetKind.CONSTRUCTION_AXIS,targetId});

function storeFor(objects) {
  let mutations=0;
  const store={
    objects,
    getObject(id){return this.objects[id]??null;},
    runSketchMutation(id,label,mutate){mutations+=1; return mutate(this.objects[id]);}
  };
  Object.defineProperty(store,'mutations',{get:()=>mutations});
  return store;
}

const sketch={objectId:'sketch-a',type:'sketch',transform:{position:{x:10,y:20,z:0},rotation:{x:0,y:0,z:0},scale:{x:2,y:2,z:1}},data:{points:{p1:{pointId:'p1',x:1,y:2},p2:{pointId:'p2',x:5,y:2}},lines:{}}};
const store=storeFor({'sketch-a':sketch});

const pointToPoint=referenceAlignResult(store,pointRef('sketch-a','p1'),pointRef('sketch-a','p2'));
assert.equal(pointToPoint.state,ReferenceAlignState.VALID);
assert.deepEqual(pointToPoint.translationWorld,{x:8,y:0,z:0});
assert.equal(commitReferenceAlign(store,pointToPoint),true);
assert.equal(store.mutations,1);
assert.deepEqual(sketch.data.points.p1,{pointId:'p1',x:5,y:2});

const noOp=referenceAlignResult(store,pointRef('sketch-a','p1'),pointRef('sketch-a','p2'));
assert.equal(noOp.state,ReferenceAlignState.NO_OP);
assert.equal(commitReferenceAlign(store,noOp),false);
assert.equal(store.mutations,1,'no-op must not create a mutation/history transaction');

sketch.data.points.p1={pointId:'p1',x:2,y:3};
const toXAxis=referenceAlignResult(store,pointRef('sketch-a','p1'),axisRef('GLOBAL_X'));
assert.equal(toXAxis.state,ReferenceAlignState.VALID);
assert.equal(toXAxis.targetPositionWorld.y,0);

const plane={objectId:'plane-a',type:'construction-reference',data:{definition:{kind:'WORK_PLANE',mode:'FREE',origin:{x:0,y:0,z:5},normal:{x:0,y:0,z:1},xAxis:{x:1,y:0,z:0}}}};
store.objects['plane-a']=plane;
const planeReference={ownerId:'plane-a',targetKind:ReferenceTargetKind.WORK_PLANE,targetId:'PLANE'};
const toPlane=referenceAlignResult(store,pointRef('sketch-a','p1'),planeReference);
assert.notEqual(toPlane.state,ReferenceAlignState.INVALID);
assert.equal(toPlane.targetPositionWorld.z,5);

const lockedSketch={...sketch,objectId:'locked',locked:true,data:{...sketch.data,points:{p:{pointId:'p',x:0,y:0}}}};
store.objects.locked=lockedSketch;
const lockedResult=referenceAlignResult(store,pointRef('locked','p'),pointRef('sketch-a','p2'));
const beforeMutations=store.mutations;
assert.equal(commitReferenceAlign(store,lockedResult),false);
assert.equal(store.mutations,beforeMutations,'locked sketch must not enter mutation authority');

const unsupported=referenceAlignResult(store,axisRef('GLOBAL_X'),pointRef('sketch-a','p2'));
assert.equal(unsupported.state,ReferenceAlignState.INVALID);
assert.equal(unsupported.reason,'UNSUPPORTED_SOURCE');

const missing=referenceAlignResult(store,pointRef('sketch-a','missing'),pointRef('sketch-a','p2'));
assert.equal(missing.state,ReferenceAlignState.INVALID);
assert.equal(missing.reason,'UNRESOLVED_SOURCE');

const alignSource=await import('../src/application/reference-align.js').then(()=>import('node:fs')).then(fs=>fs.readFileSync(new URL('../src/application/reference-align.js',import.meta.url),'utf8'));
assert.doesNotMatch(alignSource,/setWorldTransform|setTransformFromEuler|rotation\s*=|scale\s*=/);
assert.doesNotMatch(alignSource,/dependency|constraint|persist/i);
assert.match(alignSource,/runSketchMutation/);

console.log('WD-22I Reference-Aware Align Foundation regression: PASS');
