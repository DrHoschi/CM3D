import assert from 'node:assert/strict';
import fs from 'node:fs';
import { installSketchMutationContract } from '../src/application/sketch-mutation.js';

const makeStore = sketch => {
  const store = {
    project: { project: { modifiedAt: 'initial' }, scene: { objects: { [sketch.objectId]: structuredClone(sketch) } } },
    selection: { sketchElement: null }, undoStack: [], redoStack: [],
    snapshot() { return structuredClone(this.project); },
    pushHistory(before, label) { this.undoStack.push({ before, after: this.snapshot(), label }); this.redoStack = []; },
    getObject(id) { return this.project.scene.objects[id] ?? null; },
    touch() { this.project.project.modifiedAt = `touch-${this.undoStack.length + 1}`; },
    emit() {}, refreshDependentExtrudesFromSketch() { return []; }
  };
  installSketchMutationContract(store);
  return { store };
};

const sketch = { objectId:'sketch_disconnect', type:'sketch', data:{ plane:'localXY', points:{
  pt_shared:{pointId:'pt_shared',x:1,y:1}, pt_left:{pointId:'pt_left',x:0,y:1}, pt_right:{pointId:'pt_right',x:2,y:1}
}, lines:{
  ln_left:{lineId:'ln_left',startPointId:'pt_left',endPointId:'pt_shared'},
  ln_right:{lineId:'ln_right',startPointId:'pt_shared',endPointId:'pt_right'}
} } };

const { store } = makeStore(sketch);
const result = store.disconnectSketchLineFromPoint(sketch.objectId, 'pt_shared', 'ln_left');
assert.ok(result?.newPointId);
assert.equal(result.originalPointId, 'pt_shared');
assert.equal(result.lineId, 'ln_left');
assert.equal(result.endpoint, 'end');
assert.equal(store.getObject(sketch.objectId).data.lines.ln_left.endPointId, result.newPointId);
assert.equal(store.getObject(sketch.objectId).data.lines.ln_right.startPointId, 'pt_shared');
assert.deepEqual(store.getObject(sketch.objectId).data.points[result.newPointId], { pointId: result.newPointId, x:1, y:1 });
assert.deepEqual(store.getObject(sketch.objectId).data.points.pt_shared, { pointId:'pt_shared', x:1, y:1 });
assert.equal(store.undoStack.length, 1);

const history = store.undoStack.at(-1);
store.project = structuredClone(history.before);
assert.equal(store.getObject(sketch.objectId).data.lines.ln_left.endPointId, 'pt_shared');
assert.equal(store.getObject(sketch.objectId).data.points[result.newPointId], undefined);
store.project = structuredClone(history.after);
assert.equal(store.getObject(sketch.objectId).data.lines.ln_left.endPointId, result.newPointId);
assert.ok(store.getObject(sketch.objectId).data.points[result.newPointId]);

const rejectSketch = { objectId:'sketch_reject', type:'sketch', data:{ plane:'localXY', points:{
  pt_a:{pointId:'pt_a',x:0,y:0}, pt_b:{pointId:'pt_b',x:1,y:0}, pt_c:{pointId:'pt_c',x:2,y:0}
}, lines:{ ln_only:{lineId:'ln_only',startPointId:'pt_a',endPointId:'pt_b'} } } };
const { store: rejectStore } = makeStore(rejectSketch);
const rejectBefore = rejectStore.snapshot();
assert.equal(rejectStore.disconnectSketchLineFromPoint('sketch_reject', 'pt_a', 'ln_only'), false);
assert.equal(rejectStore.disconnectSketchLineFromPoint('sketch_reject', 'pt_c', 'ln_only'), false);
assert.equal(rejectStore.disconnectSketchLineFromPoint('sketch_reject', 'pt_missing', 'ln_only'), false);
assert.equal(rejectStore.disconnectSketchLineFromPoint('sketch_reject', 'pt_a', 'ln_missing'), false);
assert.deepEqual(rejectStore.project, rejectBefore);
assert.equal(rejectStore.undoStack.length, 0);

const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.match(main, /const BUILD_ID = 'WD-21(?:B\.[3-9]|[C-Z]\.\d+)(?:-R\d+)?'/);
console.log('WD-21B.3 Deterministic Endpoint Disconnect Mutation Contract: PASS');