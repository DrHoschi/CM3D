import assert from 'node:assert/strict';
import fs from 'node:fs';
import { installSketchMutationContract } from '../src/application/sketch-mutation.js';
import { installGenericSketchElementMutationContract } from '../src/application/sketch-element-mutation-extension.js';
import { validateSketchTopology } from '../src/model/sketch-topology.js';
import { createStableReference, ReferenceState, ReferenceTargetKind, resolveStableReference } from '../src/application/stable-reference.js';

const sketch = {
  objectId:'sketch_c3', type:'sketch',
  data:{
    plane:'localXY',
    points:{
      pt_a:{pointId:'pt_a',x:0,y:0},
      pt_b:{pointId:'pt_b',x:2,y:0},
      pt_c:{pointId:'pt_c',x:2,y:2},
      pt_d:{pointId:'pt_d',x:0,y:2}
    },
    lines:{ ln_keep:{lineId:'ln_keep',startPointId:'pt_a',endPointId:'pt_d'} },
    circles:{}, arcs:{}, splines:{}
  }
};

const events=[];
const store={
  project:{project:{modifiedAt:'initial'},scene:{objects:{sketch_c3:structuredClone(sketch)}}},
  selection:{sketchElement:null}, undoStack:[], redoStack:[],
  snapshot(){return structuredClone(this.project);},
  pushHistory(before,label){this.undoStack.push({before,after:this.snapshot(),label});this.redoStack=[];},
  getObject(id){return this.project.scene.objects[id]??null;},
  touch(){this.project.project.modifiedAt=`touch-${this.undoStack.length+1}`;},
  emit(type,payload={}){events.push({type,...payload});},
  refreshDependentExtrudesFromSketch(){return [];}
};

installSketchMutationContract(store);
const contract=installGenericSketchElementMutationContract(store);
assert.equal(contract.version,'WD-21C.3');
assert.equal(contract.transactionPath,'runSketchMutation');
assert.equal(contract.analyticGeometryIdentity,true);
assert.equal(contract.derivedTessellationPersisted,false);
assert.equal(contract.fixedSegmentCountRequired,false);
assert.equal(contract.regularPolygonFeatureIncluded,false);
assert.equal(contract.connectivityExtensionIncluded,false);
assert.equal(contract.profilePathDerivationIncluded,false);
for(const name of contract.mutationMethods)assert.equal(store[name].__cm3dMutationOwner,'central-sketch-mutation');

const circleId=store.addSketchCircle('sketch_c3',{x:5,y:5},2);
assert.ok(circleId);
assert.deepEqual(store.getObject('sketch_c3').data.circles[circleId],{circleId,center:{x:5,y:5},radius:2});
assert.equal('renderSegments' in store.getObject('sketch_c3').data.circles[circleId],false);
assert.equal(store.undoStack.length,1);
const circleRef=createStableReference(ReferenceTargetKind.SKETCH_ELEMENT,'sketch_c3',circleId,'circle');
assert.equal(resolveStableReference(store,circleRef).state,ReferenceState.RESOLVED);
assert.equal(store.setSketchCircle('sketch_c3',circleId,{center:{x:6,y:5},radius:3}),true);
assert.equal(store.getObject('sketch_c3').data.circles[circleId].circleId,circleId);
assert.equal(store.undoStack.length,2);

const arcId=store.addSketchArc('sketch_c3','pt_a','pt_b',{x:1,y:1});
assert.ok(arcId);
assert.equal(store.getObject('sketch_c3').data.arcs[arcId].arcId,arcId);
assert.equal(store.undoStack.length,3);
const historyBeforeInvalidArc=store.undoStack.length;
const beforeInvalidArc=store.snapshot();
assert.equal(store.setSketchArc('sketch_c3',arcId,{startPointId:'pt_a',endPointId:'pt_b',control:{x:1,y:0}}),false);
assert.equal(store.undoStack.length,historyBeforeInvalidArc);
assert.deepEqual(store.project,beforeInvalidArc);

const splineId=store.addSketchSpline('sketch_c3','pt_b','pt_c',[{x:2.5,y:0.5},{x:2.5,y:1.5}]);
assert.ok(splineId);
const spline=store.getObject('sketch_c3').data.splines[splineId];
const controlIds=spline.controls.map(item=>item.controlId);
assert.equal(new Set(controlIds).size,2);
assert.equal(store.undoStack.length,4);
assert.equal(store.setSketchSpline('sketch_c3',splineId,{
  startPointId:'pt_b',endPointId:'pt_c',
  controls:spline.controls.map((item,index)=>({controlId:item.controlId,x:item.x+0.25*(index+1),y:item.y}))
}),true);
assert.deepEqual(store.getObject('sketch_c3').data.splines[splineId].controls.map(item=>item.controlId),controlIds);
assert.equal(store.undoStack.length,5);

const beforeControlIdMutation=store.snapshot();
const historyBeforeControlIdMutation=store.undoStack.length;
const changedControls=structuredClone(store.getObject('sketch_c3').data.splines[splineId].controls);
changedControls[0].controlId='ctl_replacement';
assert.equal(store.setSketchSpline('sketch_c3',splineId,{startPointId:'pt_b',endPointId:'pt_c',controls:changedControls}),false);
assert.deepEqual(store.project,beforeControlIdMutation);
assert.equal(store.undoStack.length,historyBeforeControlIdMutation);

// Deleting an arc removes only endpoint points that are truly orphaned across line/arc/spline collections.
store.selection.sketchElement={sketchId:'sketch_c3',kind:'arc',elementId:arcId};
assert.equal(store.deleteSketchElement(),true);
assert.equal(store.getObject('sketch_c3').data.arcs[arcId],undefined);
assert.ok(store.getObject('sketch_c3').data.points.pt_a,'pt_a is still used by ln_keep');
assert.ok(store.getObject('sketch_c3').data.points.pt_b,'pt_b is still used by spline');

// Circle deletion makes its exact stable reference MISSING; no geometric rebinding.
store.selection.sketchElement={sketchId:'sketch_c3',kind:'circle',elementId:circleId};
assert.equal(store.deleteSketchElement(),true);
assert.equal(resolveStableReference(store,circleRef).state,ReferenceState.MISSING);

// Undo snapshot restores exact element and control identities.
const circleDeleteHistory=store.undoStack.at(-1);
store.project=structuredClone(circleDeleteHistory.before);
assert.equal(resolveStableReference(store,circleRef).state,ReferenceState.RESOLVED);
assert.equal(store.getObject('sketch_c3').data.circles[circleId].circleId,circleId);
store.project=structuredClone(circleDeleteHistory.after);
assert.equal(resolveStableReference(store,circleRef).state,ReferenceState.MISSING);

assert.equal(validateSketchTopology(store.getObject('sketch_c3')).valid,true);
assert.ok(events.some(event=>event.type==='geometryChanged'&&event.topologyMutation===true));

const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert.match(main,/const BUILD_ID = 'WD-21C\.3'/);
assert.match(main,/installGenericSketchElementMutationContract/);
assert.doesNotMatch(main,/sketch-circle|sketch-arc|sketch-spline/);
const source=fs.readFileSync(new URL('../src/application/sketch-element-mutation-extension.js',import.meta.url),'utf8');
assert.doesNotMatch(source,/renderSegments|tessellat|N-Gon|regularPolygon/i);

console.log('WD-21C.3 Generic Sketch Element Mutation Contract: PASS');
