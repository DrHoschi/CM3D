import assert from 'node:assert/strict';
import fs from 'node:fs';
import { installSketchMutationContract } from '../src/application/sketch-mutation.js';
import { validateSketchTopology } from '../src/model/sketch-topology.js';
import { createStableReference, resolveStableReference, ReferenceState, ReferenceTargetKind } from '../src/application/stable-reference.js';
import { createSelectionRef, resolveSelectionSketchTarget, SelectionTargetKind } from '../src/application/selection-ref.js';

const makeStore = sketch => {
  const events = [];
  const store = {
    project: {
      project: { modifiedAt: 'initial' },
      scene: { objects: { [sketch.objectId]: structuredClone(sketch) } }
    },
    selection: { sketchElement: null },
    undoStack: [],
    redoStack: [],
    snapshot() { return structuredClone(this.project); },
    pushHistory(before, label) {
      this.undoStack.push({ before, after: this.snapshot(), label });
      this.redoStack = [];
    },
    getObject(id) { return this.project.scene.objects[id] ?? null; },
    touch() { this.project.project.modifiedAt = `touch-${this.undoStack.length + 1}`; },
    emit(type, payload = {}) { events.push({ type, ...payload }); },
    refreshDependentExtrudesFromSketch() { return []; }
  };
  installSketchMutationContract(store);
  return { store, events };
};

const sketch = {
  objectId: 'sketch_connect',
  type: 'sketch',
  data: {
    plane: 'localXY',
    points: {
      pt_survivor: { pointId: 'pt_survivor', x: 0, y: 0 },
      pt_source: { pointId: 'pt_source', x: 2, y: 1 },
      pt_a: { pointId: 'pt_a', x: -1, y: 0 },
      pt_b: { pointId: 'pt_b', x: 3, y: 1 }
    },
    lines: {
      ln_a: { lineId: 'ln_a', startPointId: 'pt_a', endPointId: 'pt_survivor' },
      ln_b: { lineId: 'ln_b', startPointId: 'pt_source', endPointId: 'pt_b' }
    }
  }
};

const { store, events } = makeStore(sketch);
const survivorRef = createStableReference(ReferenceTargetKind.SKETCH_POINT, sketch.objectId, 'pt_survivor');
const sourceRef = createStableReference(ReferenceTargetKind.SKETCH_POINT, sketch.objectId, 'pt_source');
const lineRef = createStableReference(ReferenceTargetKind.SKETCH_ELEMENT, sketch.objectId, 'ln_b', 'line');
const sourceSelection = createSelectionRef(SelectionTargetKind.SKETCH_POINT, sketch.objectId, 'pt_source');

const beforeConnect = store.snapshot();
const result = store.connectSketchPoints(sketch.objectId, 'pt_survivor', 'pt_source');
assert.deepEqual(result, {
  survivorPointId: 'pt_survivor',
  sourcePointId: 'pt_source',
  rewiredLineIds: ['ln_b']
});

const connected = store.getObject(sketch.objectId);
assert.equal(connected.data.points.pt_source, undefined, 'merge source must be removed');
assert.deepEqual(connected.data.points.pt_survivor, { pointId: 'pt_survivor', x: 0, y: 0 }, 'survivor coordinate and identity stay authoritative');
assert.equal(connected.data.lines.ln_b.startPointId, 'pt_survivor', 'source line must be rewired to survivor');
assert.equal(connected.data.lines.ln_b.endPointId, 'pt_b');
assert.equal(validateSketchTopology(connected).valid, true);
assert.equal(store.undoStack.length, 1, 'connect is one atomic history entry');
assert.equal(store.undoStack[0].label, 'Skizzenendpunkte verbinden');

assert.equal(resolveStableReference(store, survivorRef).state, ReferenceState.RESOLVED);
assert.equal(resolveStableReference(store, sourceRef).state, ReferenceState.MISSING, 'removed source ref must not rebind to survivor');
assert.equal(resolveStableReference(store, lineRef).state, ReferenceState.RESOLVED);
assert.equal(resolveSelectionSketchTarget(store, sourceSelection), null, 'removed source selection must resolve to null');

// Undo restores exact source identity and original incidence; redo restores the exact connect result.
const connectHistory = store.undoStack.at(-1);
store.project = structuredClone(connectHistory.before);
const undoSketch = store.getObject(sketch.objectId);
assert.deepEqual(store.project, beforeConnect);
assert.equal(undoSketch.data.points.pt_source.pointId, 'pt_source');
assert.equal(undoSketch.data.lines.ln_b.startPointId, 'pt_source');
assert.equal(resolveStableReference(store, sourceRef).state, ReferenceState.RESOLVED);
store.project = structuredClone(connectHistory.after);
const redoSketch = store.getObject(sketch.objectId);
assert.equal(redoSketch.data.points.pt_source, undefined);
assert.equal(redoSketch.data.lines.ln_b.startPointId, 'pt_survivor');
assert.equal(resolveStableReference(store, sourceRef).state, ReferenceState.MISSING);

assert.ok(events.some(event => event.type === 'geometryChanged' && event.topologyMutation === true));
assert.ok(events.some(event => event.type === 'selectionChanged'));

// Reject same point, missing point and a merge that would collapse a line to start=end.
const historyBeforeRejects = store.undoStack.length;
assert.equal(store.connectSketchPoints(sketch.objectId, 'pt_survivor', 'pt_survivor'), false);
assert.equal(store.connectSketchPoints(sketch.objectId, 'pt_survivor', 'pt_missing'), false);
assert.equal(store.undoStack.length, historyBeforeRejects);

const directPairSketch = {
  objectId: 'sketch_pair',
  type: 'sketch',
  data: {
    plane: 'localXY',
    points: {
      pt_left: { pointId: 'pt_left', x: 0, y: 0 },
      pt_right: { pointId: 'pt_right', x: 1, y: 0 }
    },
    lines: {
      ln_pair: { lineId: 'ln_pair', startPointId: 'pt_left', endPointId: 'pt_right' }
    }
  }
};
const { store: pairStore } = makeStore(directPairSketch);
const pairBefore = pairStore.snapshot();
assert.equal(pairStore.connectSketchPoints('sketch_pair', 'pt_left', 'pt_right'), false, 'directly connected pair must reject instead of creating a zero-length topological line');
assert.deepEqual(pairStore.project, pairBefore);
assert.equal(pairStore.undoStack.length, 0);

// B.2 exposes no UI action; only the internal contract and build identity are added.
const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.match(main, /const BUILD_ID = 'WD-21B\.2'/);
const mutationSource = fs.readFileSync(new URL('../src/application/sketch-mutation.js', import.meta.url), 'utf8');
assert.match(mutationSource, /connectSketchPoints/);
assert.doesNotMatch(main, /connectSketchPoints\(/, 'B.2 must not wire a visible connect action yet');

console.log('WD-21B.2 Deterministic Endpoint Connect Mutation Contract: PASS');
