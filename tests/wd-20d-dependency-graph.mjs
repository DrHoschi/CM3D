import assert from 'node:assert/strict';
import { createStableReference, ReferenceTargetKind } from '../src/application/stable-reference.js';
import { buildDependencyGraph, DependencyNodeState } from '../src/application/dependency-graph.js';

const objects = {
  sketch_a: { objectId:'sketch_a', type:'sketch', data:{ lines:{}, points:{} } },
  sketch_b: { objectId:'sketch_b', type:'sketch', data:{ lines:{}, points:{} } },
  box_a: { objectId:'box_a', type:'primitive.box' },
  extrude_a: {
    objectId:'extrude_a', type:'feature.extrude',
    data:{ sourceSketchRef:createStableReference(ReferenceTargetKind.SKETCH,'sketch_a','sketch_a') }
  },
  extrude_b: {
    objectId:'extrude_b', type:'feature.extrude',
    data:{ sourceSketchRef:createStableReference(ReferenceTargetKind.SKETCH,'sketch_a','sketch_a') }
  },
  extrude_missing: {
    objectId:'extrude_missing', type:'feature.extrude',
    data:{ sourceSketchRef:createStableReference(ReferenceTargetKind.SKETCH,'gone_sketch','gone_sketch') }
  },
  extrude_invalid: {
    objectId:'extrude_invalid', type:'feature.extrude',
    data:{ sourceSketchRef:createStableReference(ReferenceTargetKind.SKETCH,'box_a','box_a') }
  },
  extrude_no_ref: { objectId:'extrude_no_ref', type:'feature.extrude', data:{} }
};

const store = {
  project:{ scene:{ objects } },
  getObject(id){ return this.project.scene.objects[id] ?? null; }
};

const graph = buildDependencyGraph(store);
assert.equal(graph.nodes.size, Object.keys(objects).length);
assert.deepEqual(graph.dependentsOf('sketch_a').map(edge => edge.dependentObjectId), ['extrude_a','extrude_b']);
assert.deepEqual(graph.dependenciesOf('extrude_a').map(edge => edge.sourceObjectId), ['sketch_a']);
assert.equal(graph.nodeState('extrude_a').state, DependencyNodeState.READY);
assert.equal(graph.nodeState('extrude_missing').state, DependencyNodeState.MISSING);
assert.equal(graph.nodeState('extrude_missing').diagnostics[0].code, 'OWNER_MISSING');
assert.equal(graph.nodeState('extrude_invalid').state, DependencyNodeState.INVALID);
assert.equal(graph.nodeState('extrude_invalid').diagnostics[0].code, 'TARGET_KIND_MISMATCH');
assert.equal(graph.nodeState('extrude_no_ref').state, DependencyNodeState.MISSING);
assert.equal(graph.nodeState('extrude_no_ref').diagnostics[0].code, 'SOURCE_REFERENCE_MISSING');
assert.deepEqual(graph.dependentsOf('sketch_b'), []);
assert.equal(graph.nodeState('unknown'), null);

// Returned edges are projections; callers cannot mutate the graph's stored StableReference.
const projected = graph.dependentsOf('sketch_a')[0];
projected.reference.targetId = 'tampered';
assert.equal(graph.dependentsOf('sketch_a')[0].reference.targetId, 'sketch_a');

console.log('WD-20D.1 Dependency Graph regression: PASS');
