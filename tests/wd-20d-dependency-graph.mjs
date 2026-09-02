import assert from 'node:assert/strict';
import { createStableReference, ReferenceTargetKind, ReferenceState } from '../src/application/stable-reference.js';
import { syncExtrudeSourceReference } from '../src/application/extrude.js';
import { buildDependencyGraph, DependencyNodeState, visitDependents, enforceBlockedDependencyState } from '../src/application/dependency-graph.js';

const objects = {
  sketch_a: { objectId:'sketch_a', type:'sketch', data:{ lines:{}, points:{} } },
  sketch_b: { objectId:'sketch_b', type:'sketch', data:{ lines:{}, points:{} } },
  box_a: { objectId:'box_a', type:'primitive.box' },
  extrude_a: {
    objectId:'extrude_a', type:'feature.extrude',
    data:{ sourceSketchId:'legacy_wrong_id', sourceSketchRef:createStableReference(ReferenceTargetKind.SKETCH,'sketch_a','sketch_a') }
  },
  extrude_b: {
    objectId:'extrude_b', type:'feature.extrude',
    data:{ sourceSketchId:'sketch_a', sourceSketchRef:createStableReference(ReferenceTargetKind.SKETCH,'sketch_a','sketch_a') }
  },
  extrude_missing: {
    objectId:'extrude_missing', type:'feature.extrude',
    data:{ sourceSketchRef:createStableReference(ReferenceTargetKind.SKETCH,'gone_sketch','gone_sketch'), profile:{ points:[{x:0,y:0},{x:1,y:0},{x:0,y:1}] } },
    extensions:{}
  },
  extrude_invalid: {
    objectId:'extrude_invalid', type:'feature.extrude',
    data:{ sourceSketchRef:createStableReference(ReferenceTargetKind.SKETCH,'box_a','box_a'), profile:{ points:[{x:0,y:0},{x:1,y:0},{x:0,y:1}] } },
    extensions:{}
  },
  extrude_no_ref: { objectId:'extrude_no_ref', type:'feature.extrude', data:{ sourceSketchId:'sketch_a' } }
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

// WD-20D.3: source-reference failure stays MISSING/INVALID on the edge, while the dependent computation becomes BLOCKED.
assert.equal(graph.nodeState('extrude_missing').state, DependencyNodeState.BLOCKED);
assert.equal(graph.nodeState('extrude_missing').upstreamState, ReferenceState.MISSING);
assert.equal(graph.nodeState('extrude_missing').diagnostics[0].code, 'UPSTREAM_MISSING');
assert.equal(graph.dependenciesOf('extrude_missing')[0].state, ReferenceState.MISSING);
assert.equal(graph.dependenciesOf('extrude_missing')[0].reference.targetId, 'gone_sketch');
assert.equal(graph.nodeState('extrude_invalid').state, DependencyNodeState.BLOCKED);
assert.equal(graph.nodeState('extrude_invalid').upstreamState, ReferenceState.INVALID);
assert.equal(graph.nodeState('extrude_invalid').diagnostics[0].code, 'UPSTREAM_INVALID');
assert.equal(graph.dependenciesOf('extrude_invalid')[0].state, ReferenceState.INVALID);
assert.equal(graph.dependenciesOf('extrude_invalid')[0].reference.targetId, 'box_a');

assert.equal(graph.nodeState('extrude_no_ref').state, DependencyNodeState.MISSING);
assert.equal(graph.nodeState('extrude_no_ref').diagnostics[0].code, 'SOURCE_REFERENCE_MISSING');
assert.deepEqual(graph.dependentsOf('sketch_b'), []);
assert.equal(graph.nodeState('unknown'), null);

// Returned edges are projections; callers cannot mutate the graph's stored StableReference.
const projected = graph.dependentsOf('sketch_a')[0];
projected.reference.targetId = 'tampered';
assert.equal(graph.dependentsOf('sketch_a')[0].reference.targetId, 'sketch_a');

// WD-20D.2: recompute traversal follows only RESOLVED StableReference graph edges, never legacy sourceSketchId.
const visited = [];
const changed = visitDependents(store, 'sketch_a', (dependent, edge) => {
  visited.push({ objectId:dependent.objectId, sourceObjectId:edge.sourceObjectId });
  dependent.extensions ??= {};
  dependent.extensions.graphRecomputeVisited = true;
});
assert.deepEqual(changed, ['extrude_a','extrude_b']);
assert.deepEqual(visited, [
  { objectId:'extrude_a', sourceObjectId:'sketch_a' },
  { objectId:'extrude_b', sourceObjectId:'sketch_a' }
]);
assert.equal(objects.extrude_a.extensions.graphRecomputeVisited, true);
assert.equal(objects.extrude_b.extensions.graphRecomputeVisited, true);
assert.equal(objects.extrude_no_ref.extensions, undefined);
assert.equal(objects.extrude_missing.extensions.graphRecomputeVisited, undefined);
assert.equal(objects.extrude_invalid.extensions.graphRecomputeVisited, undefined);

// Broken upstream references deterministically clear stale cached geometry and mark runtime recompute BLOCKED.
const blockedIds = enforceBlockedDependencyState(store);
assert.deepEqual(blockedIds, ['extrude_invalid','extrude_missing']);
assert.equal(objects.extrude_missing.data.profile, null);
assert.equal(objects.extrude_missing.extensions.recomputeState.state, ReferenceState.BLOCKED);
assert.equal(objects.extrude_missing.extensions.recomputeState.upstreamState, ReferenceState.MISSING);
assert.equal(objects.extrude_invalid.data.profile, null);
assert.equal(objects.extrude_invalid.extensions.recomputeState.state, ReferenceState.BLOCKED);
assert.equal(objects.extrude_invalid.extensions.recomputeState.upstreamState, ReferenceState.INVALID);

// StableReference sync exposes the same split: reference keeps root cause, dependent computation is BLOCKED.
const missingResolution = syncExtrudeSourceReference(store, objects.extrude_missing);
assert.equal(missingResolution.state, ReferenceState.MISSING);
assert.equal(objects.extrude_missing.data.sourceSketchRef.targetId, 'gone_sketch');
assert.equal(objects.extrude_missing.extensions.sourceSketchReference.state, ReferenceState.MISSING);
assert.equal(objects.extrude_missing.extensions.recomputeState.state, ReferenceState.BLOCKED);
assert.equal(objects.extrude_missing.extensions.recomputeState.upstreamState, ReferenceState.MISSING);

const invalidResolution = syncExtrudeSourceReference(store, objects.extrude_invalid);
assert.equal(invalidResolution.state, ReferenceState.INVALID);
assert.equal(objects.extrude_invalid.data.sourceSketchRef.targetId, 'box_a');
assert.equal(objects.extrude_invalid.extensions.sourceSketchReference.state, ReferenceState.INVALID);
assert.equal(objects.extrude_invalid.extensions.recomputeState.state, ReferenceState.BLOCKED);
assert.equal(objects.extrude_invalid.extensions.recomputeState.upstreamState, ReferenceState.INVALID);

console.log('WD-20D.3 Dependency Graph + deterministic BLOCKED propagation regression: PASS');
