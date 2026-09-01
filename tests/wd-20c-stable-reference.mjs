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
import {
  syncExtrudeSourceReference,
  syncAllExtrudeSourceReferences,
  installExtrudeSourceReferenceSync
} from '../src/application/extrude.js';

const objects = {
  obj_box: { objectId:'obj_box', type:'primitive.box' },
  obj_sketch: {
    objectId:'obj_sketch', type:'sketch',
    data:{ lines:{ line_1:{ lineId:'line_1' } }, points:{ point_1:{ pointId:'point_1' } } }
  },
  obj_feature: { objectId:'obj_feature', type:'feature.extrude' }
};
const listeners = new Set();
const store = {
  project:{ scene:{ objects } },
  getObject(id){ return this.project.scene.objects[id] ?? null; },
  subscribe(fn){ listeners.add(fn); return () => listeners.delete(fn); },
  emit(type){ for (const fn of listeners) fn({ type }); }
};

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

// WD-20C.2: legacy sourceSketchId is bridged without replacement or rebinding.
const legacyExtrude = {
  objectId:'obj_extrude_legacy',
  type:'feature.extrude',
  data:{ sourceSketchId:'obj_sketch' },
  extensions:{}
};
objects[legacyExtrude.objectId] = legacyExtrude;
const legacyResolution = syncExtrudeSourceReference(store, legacyExtrude);
assert.deepEqual(legacyExtrude.data.sourceSketchRef, {
  targetKind:'SKETCH', ownerId:'obj_sketch', targetId:'obj_sketch'
});
assert.equal(legacyExtrude.data.sourceSketchId, 'obj_sketch');
assert.equal(legacyResolution.state, ReferenceState.RESOLVED);
assert.equal(legacyExtrude.extensions.sourceSketchReference.state, ReferenceState.RESOLVED);

// Missing targets keep the original stable ID and become MISSING.
const missingExtrude = {
  objectId:'obj_extrude_missing',
  type:'feature.extrude',
  data:{ sourceSketchId:'obj_deleted_sketch' },
  extensions:{}
};
objects[missingExtrude.objectId] = missingExtrude;
const missingExtrudeResolution = syncExtrudeSourceReference(store, missingExtrude);
assert.equal(missingExtrude.data.sourceSketchRef.targetId, 'obj_deleted_sketch');
assert.equal(missingExtrude.data.sourceSketchId, 'obj_deleted_sketch');
assert.equal(missingExtrudeResolution.state, ReferenceState.MISSING);
assert.equal(missingExtrude.extensions.sourceSketchReference.state, ReferenceState.MISSING);

const all = syncAllExtrudeSourceReferences(store);
assert.equal(all.some(item => item.objectId === 'obj_extrude_legacy' && item.resolution.state === ReferenceState.RESOLVED), true);
assert.equal(all.some(item => item.objectId === 'obj_extrude_missing' && item.resolution.state === ReferenceState.MISSING), true);

// WD-20C.3: already loaded and later loaded legacy extrudes are synchronized automatically.
const syncController = installExtrudeSourceReferenceSync(store);
assert.equal(typeof syncController.sync, 'function');
assert.equal(typeof syncController.unsubscribe, 'function');

const loadedSketch = {
  objectId:'obj_loaded_sketch',
  type:'sketch',
  data:{ lines:{}, points:{} }
};
const loadedLegacyExtrude = {
  objectId:'obj_loaded_extrude',
  type:'feature.extrude',
  data:{ sourceSketchId:'obj_loaded_sketch' },
  extensions:{}
};
store.project.scene.objects[loadedSketch.objectId] = loadedSketch;
store.project.scene.objects[loadedLegacyExtrude.objectId] = loadedLegacyExtrude;
store.emit('projectLoaded');
assert.deepEqual(loadedLegacyExtrude.data.sourceSketchRef, {
  targetKind:'SKETCH', ownerId:'obj_loaded_sketch', targetId:'obj_loaded_sketch'
});
assert.equal(loadedLegacyExtrude.extensions.sourceSketchReference.state, ReferenceState.RESOLVED);

const loadedMissingExtrude = {
  objectId:'obj_loaded_missing_extrude',
  type:'feature.extrude',
  data:{ sourceSketchId:'obj_loaded_deleted_sketch' },
  extensions:{}
};
store.project.scene.objects[loadedMissingExtrude.objectId] = loadedMissingExtrude;
store.emit('projectChanged');
assert.equal(loadedMissingExtrude.data.sourceSketchRef.targetId, 'obj_loaded_deleted_sketch');
assert.equal(loadedMissingExtrude.data.sourceSketchId, 'obj_loaded_deleted_sketch');
assert.equal(loadedMissingExtrude.extensions.sourceSketchReference.state, ReferenceState.MISSING);

syncController.unsubscribe();
console.log('WD-20C StableReference regression: PASS');
