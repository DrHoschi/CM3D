import assert from 'node:assert/strict';
import { ReferenceTargetKind, ReferenceState, resolveStableReference } from '../src/application/stable-reference.js';
import { buildDependencyGraph } from '../src/application/dependency-graph.js';
import { createFeatureBodyOutputReference, declareFeatureOutputDependency, evaluateSequentialFeatureChain } from '../src/application/feature-output.js';

const objects = {
  extrude:{objectId:'extrude',type:'feature.extrude',data:{sourceSketchRef:{targetKind:ReferenceTargetKind.SKETCH,ownerId:'sketch',targetId:'sketch'}},extensions:{recomputeState:{state:'READY'}}},
  sketch:{objectId:'sketch',type:'sketch',data:{},extensions:{}},
  modifierA:{objectId:'modifierA',type:'feature.test-modifier',data:{},extensions:{}},
  modifierB:{objectId:'modifierB',type:'feature.test-modifier',data:{},extensions:{}}
};
const store={project:{scene:{objects}},getObject(id){return this.project.scene.objects[id]??null;}};

const extrudeOutput=createFeatureBodyOutputReference('extrude');
assert.equal(extrudeOutput.targetKind,ReferenceTargetKind.FEATURE_OUTPUT);
assert.equal(extrudeOutput.ownerId,'extrude');
assert.equal(extrudeOutput.targetId,'body-output');
assert.equal(resolveStableReference(store,extrudeOutput).state,ReferenceState.RESOLVED);

const aOutput=createFeatureBodyOutputReference('modifierA');
const dependencies=[
  declareFeatureOutputDependency('modifierA',extrudeOutput),
  declareFeatureOutputDependency('modifierB',aOutput)
];
const graph=buildDependencyGraph(store,dependencies);
assert.equal(graph.dependenciesOf('modifierA')[0].sourceObjectId,'extrude');
assert.equal(graph.dependenciesOf('modifierB')[0].sourceObjectId,'modifierA');

let chain=evaluateSequentialFeatureChain(store,dependencies);
assert.equal(chain.stateOf('modifierA').state,'READY');
assert.equal(chain.stateOf('modifierB').state,'READY');
assert.ok(chain.orderedObjectIds.indexOf('extrude')<chain.orderedObjectIds.indexOf('modifierA'));
assert.ok(chain.orderedObjectIds.indexOf('modifierA')<chain.orderedObjectIds.indexOf('modifierB'));

objects.extrude.extensions.recomputeState={state:'BLOCKED'};
assert.equal(resolveStableReference(store,extrudeOutput).state,ReferenceState.BLOCKED);
chain=evaluateSequentialFeatureChain(store,dependencies);
assert.equal(chain.stateOf('modifierA').state,'BLOCKED');
assert.equal(chain.stateOf('modifierB').state,'BLOCKED');

objects.extrude.extensions.recomputeState={state:'READY'};
chain=evaluateSequentialFeatureChain(store,dependencies);
assert.equal(chain.stateOf('modifierA').state,'READY');
assert.equal(chain.stateOf('modifierB').state,'READY');

console.log('WD-24A Sequential Body / Feature Output Foundation: PASS');
