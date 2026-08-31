import assert from 'node:assert/strict';
import {
  ReferenceTargetKind,
  ReferenceState,
  createStableReference,
  sameStableReference,
  createReferenceResolution,
  resolveStableReference,
  blockReferenceResolution
} from '../src/application/stable-reference.js';

const objects = {
  obj_box: { objectId:'obj_box', type:'primitive.box' },
  obj_sketch: {
    objectId:'obj_sketch', type:'sketch',
    data:{ lines:{ line_1:{ lineId:'line_1' } }, points:{ point_1:{ pointId:'point_1' } } }
  },
  obj_feature: { objectId:'obj_feature', type:'feature.extrude' }
};
const store = { getObject(id){ return objects[id] ?? null; } };

const sketchRef = createStableReference(ReferenceTargetKind.SKETCH, 'obj_sketch', 'obj_sketch');
assert.deepEqual(sketchRef, { targetKind:'SKETCH', ownerId:'obj_sketch', targetId:'obj_sketch' });
assert.equal(sameStableReference(sketchRef, createStableReference(ReferenceTargetKind.SKETCH, 'obj_sketch', 'obj_sketch')), true);
assert.throws(() => createStableReference('UNKNOWN', 'a', 'b'));

assert.equal(resolveStableReference(store, sketchRef).state, ReferenceState.RESOLVED);
assert.equal(resolveStableReference(store, createStableReference(ReferenceTargetKind.OBJECT, 'obj_box', 'obj_box')).state, ReferenceState.RESOLVED);
assert.equal(resolveStableReference(store, createStableReference(ReferenceTargetKind.FEATURE, 'obj_feature', 'obj_feature')).state, ReferenceState.RESOLVED);
assert.equal(resolveStableReference(store, createStableReference(ReferenceTargetKind.SKETCH_ELEMENT, 'obj_sketch', 'line_1')).state, ReferenceState.RESOLVED);
assert.equal(resolveStableReference(store, createStableReference(ReferenceTargetKind.SKETCH_POINT, 'obj_sketch', 'point_1')).state, ReferenceState.RESOLVED);

const missing = resolveStableReference(store, createStableReference(ReferenceTargetKind.SKETCH, 'obj_missing', 'obj_missing'));
assert.equal(missing.state, ReferenceState.MISSING);
assert.equal(missing.reference.targetId, 'obj_missing');
assert.equal(missing.diagnostics[0].code, 'OWNER_MISSING');

const wrongKind = resolveStableReference(store, createStableReference(ReferenceTargetKind.SKETCH, 'obj_box', 'obj_box'));
assert.equal(wrongKind.state, ReferenceState.INVALID);
assert.equal(wrongKind.diagnostics[0].code, 'TARGET_KIND_MISMATCH');

const missingLineRef = createStableReference(ReferenceTargetKind.SKETCH_ELEMENT, 'obj_sketch', 'line_missing');
const missingLine = resolveStableReference(store, missingLineRef);
assert.equal(missingLine.state, ReferenceState.MISSING);
assert.equal(missingLine.reference.targetId, 'line_missing');
assert.equal(missingLine.diagnostics[0].code, 'SUBTARGET_MISSING');

const unresolved = createReferenceResolution(sketchRef);
assert.equal(unresolved.state, ReferenceState.UNRESOLVED);
const blocked = blockReferenceResolution(unresolved, 'UPSTREAM_INVALID', 'Vorgelagerte Referenz ist ungültig.');
assert.equal(blocked.state, ReferenceState.BLOCKED);
assert.equal(blocked.diagnostics.at(-1).code, 'UPSTREAM_INVALID');

console.log('WD-20C StableReference regression: PASS');
