import assert from 'node:assert/strict';
import fs from 'node:fs';
import { installSketchMutationContract, auditSketchMutationOwnership } from '../src/application/sketch-mutation.js';
import { validateSketchTopology } from '../src/model/sketch-topology.js';
import { createStableReference, resolveStableReference, ReferenceState, ReferenceTargetKind } from '../src/application/stable-reference.js';

const makeStore = sketch => {
  const events = [];
  const store = {
    project: { project: { modifiedAt: 'initial' }, scene: { objects: { [sketch.objectId]: structuredClone(sketch) } } },
    selection: { sketchElement: null }, undoStack: [], redoStack: [],
    snapshot() { return structuredClone(this.project); },
    pushHistory(before, label) { this.undoStack.push({ before, after: this.snapshot(), label }); this.redoStack = []; },
    getObject(id) { return this.project.scene.objects[id] ?? null; },
    touch() { this.project.project.modifiedAt = `touch-${this.undoStack.length + 1}`; },
    emit(type, payload = {}) { events.push({ type, ...payload }); },
    refreshDependentExtrudesFromSketch() { return []; }
  };
  const contract = installSketchMutationContract(store);
  return { store, events, contract };
};

const sketch = {
  objectId: 'sketch_disconnect', type: 'sketch', data: { plane: 'localXY',
    points: {
      pt_shared: { pointId: 'pt_shared', x: 1.25, y: -0.5 },
      pt_a: { pointId: 'pt_a', x: 0, y: 0 },
      pt_b: { pointId: 'pt_b', x: 2, y: 0 }
    },
    lines: {
      ln_a: { lineId: 'ln_a', startPointId: 'pt_a', endPointId: 'pt_shared' },
      ln_b: { lineId: 'ln_b', startPointId: 'pt_shared', endPointId: 'pt_b' }
    }
  }
};

const { store, events, contract } = makeStore(sketch);
assert.equal(contract.connectivityExtension, 'WD-21B.3');
assert.equal(contract.disconnectPolicy.minimumIncidence, 2);
assert.equal(auditSketchMutationOwnership(store).valid, true);
assert.equal(validateSketchTopology(store.getObject(sketch.objectId)).valid, true);

const sharedRef = createStableReference(ReferenceTargetKind.SKETCH_POINT, sketch.objectId, 'pt_shared');
const lineRef = createStableReference(ReferenceTargetKind.SKETCH_ELEMENT, sketch.objectId, 'ln_b', 'line');
const before = store.snapshot();
const result = store.disconnectSketchLineFromPoint(sketch.objectId, 'pt_shared', 'ln_b');
assert.ok(result);
assert.equal(result.originalPointId, 'pt_shared');
assert.equal(result.lineId, 'ln_b');
assert.equal(result.endpoint, 'start');
assert.ok(result.newPointId && result.newPointId !== 'pt_shared');

const disconnected = store.getObject(sketch.objectId);
assert.deepEqual(disconnected.data.points.pt_shared, { pointId: 'pt_shared', x: 1.25, y: -0.5 });
assert.deepEqual(disconnected.data.points[result.newPointId], { pointId: result.newPointId, x: 1.25, y: -0.5 });
assert.equal(disconnected.data.lines.ln_a.endPointId, 'pt_shared');
assert.equal(disconnected.data.lines.ln_b.startPointId, result.newPointId);
assert.equal(disconnected.data.lines.ln_b.endPointId, 'pt_b');
assert.equal(validateSketchTopology(disconnected).valid, true);
assert.equal(store.undoStack.length, 1);
assert.equal(store.undoStack[0].label, 'Skizzenendpunkt trennen');
assert.equal(resolveStableReference(store, sharedRef).state, ReferenceState.RESOLVED);
assert.equal(resolveStableReference(store, lineRef).state, ReferenceState.RESOLVED);

const history = store.undoStack.at(-1);
store.project = structuredClone(history.before);
assert.deepEqual(store.project, before);
assert.equal(store.getObject(sketch.objectId).data.points[result.newPointId], undefined);
assert.equal(store.getObject(sketch.objectId).data.lines.ln_b.startPointId, 'pt_shared');
store.project = structuredClone(history.after);
assert.equal(store.getObject(sketch.objectId).data.points[result.newPointId].pointId, result.newPointId);
assert.equal(store.getObject(sketch.objectId).data.lines.ln_b.startPointId, result.newPointId);

assert.ok(events.some(event => event.type === 'geometryChanged' && event.topologyMutation === true));
assert.ok(events.some(event => event.type === 'selectionChanged'));

const rejectSketch = { objectId: 'sketch_reject', type: 'sketch', data: { plane: 'localXY', points: {
  pt_a: { pointId: 'pt_a', x: 0, y: 0 }, pt_b: { pointId: 'pt_b', x: 1, y: 0 }, pt_c: { pointId: 'pt_c', x: 2, y: 0 }
}, lines: { ln_only: { lineId: 'ln_only', startPointId: 'pt_a', endPointId: 'pt_b' } } } };
const { store: rejectStore } = makeStore(rejectSketch);
const rejectBefore = rejectStore.snapshot();
assert.equal(rejectStore.disconnectSketchLineFromPoint('sketch_reject', 'pt_a', 'ln_only'), false);
assert.equal(rejectStore.disconnectSketchLineFromPoint('sketch_reject', 'pt_c', 'ln_only'), false);
assert.equal(rejectStore.disconnectSketchLineFromPoint('sketch_reject', 'pt_missing', 'ln_only'), false);
assert.equal(rejectStore.disconnectSketchLineFromPoint('sketch_reject', 'pt_a', 'ln_missing'), false);
assert.deepEqual(rejectStore.project, rejectBefore);
assert.equal(rejectStore.undoStack.length, 0);

const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.match(main, /const BUILD_ID = 'WD-21B\.[3-9]'/);
console.log('WD-21B.3 Deterministic Endpoint Disconnect Mutation Contract: PASS');
