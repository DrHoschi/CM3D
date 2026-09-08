import assert from 'node:assert/strict';
import fs from 'node:fs';
import { installSketchMutationContract } from '../src/application/sketch-mutation.js';
import { createStableReference, resolveStableReference, ReferenceState, ReferenceTargetKind } from '../src/application/stable-reference.js';

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

const sketch = { objectId:'sketch_connect', type:'sketch', data:{ plane:'localXY', points:{
  pt_survivor:{pointId:'pt_survivor',x:10,y:10}, pt_source:{pointId:'pt_source',x:1,y:1},
  pt_left:{pointId:'pt_left',x:0,y:1}, pt_right:{pointId:'pt_right',x:2,y:1}
}, lines:{
  ln_left:{lineId:'ln_left',startPointId:'pt_left',endPointId:'pt_source'},
  ln_right:{lineId:'ln_right',startPointId:'pt_source',endPointId:'pt_right'}
} } };

const { store } = makeStore(sketch);
const survivorRef = createStableReference(ReferenceTargetKind.SKETCH_POINT, sketch.objectId, 'pt_survivor');
const sourceRef = createStableReference(ReferenceTargetKind.SKETCH_POINT, sketch.objectId, 'pt_source');
const before = store.snapshot();
const result = store.connectSketchPoints(sketch.objectId, 'pt_survivor', 'pt_source');
assert.ok(result);
assert.equal(result.survivorPointId, 'pt_survivor');
assert.equal(result.sourcePointId, 'pt_source');
assert.deepEqual(result.rewiredLineIds.sort(), ['ln_left','ln_right']);
assert.equal(store.getObject(sketch.objectId).data.points.pt_source, undefined);
assert.deepEqual(store.getObject(sketch.objectId).data.points.pt_survivor, { pointId:'pt_survivor', x:10, y:10 });
assert.equal(store.getObject(sketch.objectId).data.lines.ln_left.endPointId, 'pt_survivor');
assert.equal(store.getObject(sketch.objectId).data.lines.ln_right.startPointId, 'pt_survivor');
assert.equal(resolveStableReference(store, survivorRef).state, ReferenceState.RESOLVED);
assert.equal(resolveStableReference(store, sourceRef).state, ReferenceState.MISSING);
assert.equal(store.undoStack.length, 1);

const history = store.undoStack.at(-1);
store.project = structuredClone(history.before);
assert.deepEqual(store.project, before);
assert.equal(resolveStableReference(store, sourceRef).state, ReferenceState.RESOLVED);
store.project = structuredClone(history.after);
assert.equal(resolveStableReference(store, sourceRef).state, ReferenceState.MISSING);
assert.equal(store.getObject(sketch.objectId).data.lines.ln_left.endPointId, 'pt_survivor');

const directPairSketch = { objectId:'sketch_pair', type:'sketch', data:{ plane:'localXY', points:{
  pt_left: { pointId: 'pt_left', x: 0, y: 0 }, pt_right: { pointId: 'pt_right', x: 1, y: 0 }
}, lines: { ln_pair: { lineId: 'ln_pair', startPointId: 'pt_left', endPointId: 'pt_right' } } } };
const { store: pairStore } = makeStore(directPairSketch);
const pairBefore = pairStore.snapshot();
assert.equal(pairStore.connectSketchPoints('sketch_pair', 'pt_left', 'pt_right'), false);
assert.deepEqual(pairStore.project, pairBefore);
assert.equal(pairStore.undoStack.length, 0);

const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.match(main, /const BUILD_ID = 'WD-21(?:B\.[2-9]|[C-Z]\.\d+)(?:-R\d+)?'/);
const mutationSource = fs.readFileSync(new URL('../src/application/sketch-mutation.js', import.meta.url), 'utf8');
assert.match(mutationSource, /connectSketchPoints/);
assert.doesNotMatch(main, /connectSketchPoints\(/, 'B.2 must not wire a visible connect action directly');
console.log('WD-21B.2 Deterministic Endpoint Connect Mutation Contract: PASS');