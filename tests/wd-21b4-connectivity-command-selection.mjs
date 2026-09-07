import assert from 'node:assert/strict';
import fs from 'node:fs';
import { installSketchMutationContract } from '../src/application/sketch-mutation.js';
import { installSketchConnectivityCommands, deriveSketchConnectivityCommandState } from '../src/application/sketch-connectivity-commands.js';

const makeStore = sketch => {
  const events = [];
  const store = {
    project: { project: { modifiedAt: 'initial' }, scene: { objects: { [sketch.objectId]: structuredClone(sketch) } } },
    selection: { sketchElement: null, sketchElements: [], selectedObjectIds: [] },
    undoStack: [], redoStack: [],
    snapshot() { return structuredClone(this.project); },
    pushHistory(before, label) { this.undoStack.push({ before, after: this.snapshot(), label }); this.redoStack = []; },
    getObject(id) { return this.project.scene.objects[id] ?? null; },
    getSelectedSketchElements() { return this.selection.sketchElements.length ? this.selection.sketchElements : this.selection.sketchElement ? [this.selection.sketchElement] : []; },
    touch() { this.project.project.modifiedAt = `touch-${this.undoStack.length + 1}`; },
    emit(type, payload = {}) { events.push({ type, ...payload }); },
    refreshDependentExtrudesFromSketch() { return []; }
  };
  installSketchMutationContract(store);
  const contract = installSketchConnectivityCommands(store);
  return { store, events, contract };
};

const sketch = {
  objectId: 'sketch_cmd', type: 'sketch', data: { plane: 'localXY',
    points: {
      pt_a: { pointId: 'pt_a', x: 0, y: 0 },
      pt_b: { pointId: 'pt_b', x: 2, y: 0 },
      pt_left: { pointId: 'pt_left', x: -1, y: 0 },
      pt_right: { pointId: 'pt_right', x: 3, y: 0 }
    },
    lines: {
      ln_left: { lineId: 'ln_left', startPointId: 'pt_left', endPointId: 'pt_a' },
      ln_right: { lineId: 'ln_right', startPointId: 'pt_b', endPointId: 'pt_right' }
    }
  }
};

const { store, events, contract } = makeStore(sketch);
assert.equal(contract.version, 'WD-21B.4');
assert.equal(contract.visibleUi, false);

store.selection.sketchElements = [
  { sketchId: sketch.objectId, kind: 'point', elementId: 'pt_a' },
  { sketchId: sketch.objectId, kind: 'point', elementId: 'pt_b' }
];
store.selection.sketchElement = store.selection.sketchElements.at(-1);
let state = deriveSketchConnectivityCommandState(store);
assert.equal(state.connect.enabled, true);
assert.equal(state.connect.sourcePointId, 'pt_a');
assert.equal(state.connect.survivorPointId, 'pt_b', 'last selected point must be deterministic survivor');
assert.equal(state.disconnect.enabled, false);

const connectResult = store.connectSelectedSketchPoints();
assert.ok(connectResult);
assert.equal(store.getObject(sketch.objectId).data.points.pt_a, undefined);
assert.equal(store.getObject(sketch.objectId).data.lines.ln_left.endPointId, 'pt_b');
assert.deepEqual(store.selection.sketchElements, [
  { sketchId: sketch.objectId, kind: 'point', elementId: 'pt_b' }
]);
assert.deepEqual(store.selection.sketchElement, { sketchId: sketch.objectId, kind: 'point', elementId: 'pt_b' });
assert.ok(events.some(event => event.type === 'selectionChanged' && event.connectivityCommand === 'connect'));

store.selection.sketchElements = [
  { sketchId: sketch.objectId, kind: 'line', elementId: 'ln_left' },
  { sketchId: sketch.objectId, kind: 'point', elementId: 'pt_b' }
];
store.selection.sketchElement = store.selection.sketchElements.at(-1);
state = store.getSketchConnectivityCommandState();
assert.equal(state.disconnect.enabled, true);
assert.equal(state.disconnect.pointId, 'pt_b');
assert.equal(state.disconnect.lineId, 'ln_left');
assert.equal(state.connect.enabled, false);

const disconnectResult = store.disconnectSelectedSketchEndpoint();
assert.ok(disconnectResult?.newPointId);
assert.equal(store.getObject(sketch.objectId).data.lines.ln_left.endPointId, disconnectResult.newPointId);
assert.deepEqual(store.selection.sketchElements, [
  { sketchId: sketch.objectId, kind: 'line', elementId: 'ln_left' },
  { sketchId: sketch.objectId, kind: 'point', elementId: disconnectResult.newPointId }
]);
assert.deepEqual(store.selection.sketchElement, { sketchId: sketch.objectId, kind: 'point', elementId: disconnectResult.newPointId });
assert.ok(events.some(event => event.type === 'selectionChanged' && event.connectivityCommand === 'disconnect'));

const historyBeforeReject = store.undoStack.length;
store.selection.sketchElements = [{ sketchId: sketch.objectId, kind: 'point', elementId: 'pt_b' }];
store.selection.sketchElement = store.selection.sketchElements[0];
assert.equal(store.getSketchConnectivityCommandState().connect.enabled, false);
assert.equal(store.getSketchConnectivityCommandState().disconnect.enabled, false);
assert.equal(store.connectSelectedSketchPoints(), false);
assert.equal(store.disconnectSelectedSketchEndpoint(), false);
assert.equal(store.undoStack.length, historyBeforeReject);

const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.match(main, /const BUILD_ID = 'WD-21B\.[4-9]'/);
assert.match(main, /installSketchConnectivityCommands\(store\)/);

console.log('WD-21B.4 Connectivity Command & Selection Semantics Integration: PASS');
