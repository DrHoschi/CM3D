import assert from 'node:assert/strict';
import fs from 'node:fs';
import { installSketchMutationContract } from '../src/application/sketch-mutation.js';
import { areSketchEndpointsTopologicallyConnected, validateSketchTopology } from '../src/model/sketch-topology.js';

const sketch = {
  objectId: 'sketch_a',
  type: 'sketch',
  data: {
    plane: 'localXY',
    points: {
      pt_shared: { pointId:'pt_shared', x:0, y:0 },
      pt_a: { pointId:'pt_a', x:1, y:0 },
      pt_b: { pointId:'pt_b', x:0, y:1 }
    },
    lines: {
      ln_a: { lineId:'ln_a', startPointId:'pt_shared', endPointId:'pt_a' },
      ln_b: { lineId:'ln_b', startPointId:'pt_shared', endPointId:'pt_b' }
    }
  }
};

const events = [];
const store = {
  project: { project:{ modifiedAt:'initial' }, scene:{ objects:{ sketch_a: structuredClone(sketch) } } },
  selection: { sketchElement:null },
  undoStack: [],
  redoStack: [],
  snapshot() { return structuredClone(this.project); },
  pushHistory(before, label) {
    this.undoStack.push({ before, after:this.snapshot(), label });
    this.redoStack = [];
  },
  getObject(id) { return this.project.scene.objects[id] ?? null; },
  touch() { this.project.project.modifiedAt = `touch-${this.undoStack.length + 1}`; },
  emit(type, payload = {}) { events.push({ type, ...payload }); },
  refreshDependentExtrudesFromSketch(sketchId) {
    assert.equal(sketchId, 'sketch_a');
    return [];
  }
};

const contract = installSketchMutationContract(store);
assert.equal(contract.version, 'WD-21A.3');
assert.equal(contract.topologyAuthority, 'pointId');
assert.equal(validateSketchTopology(store.getObject('sketch_a')).valid, true);

assert.equal(store.setSketchPoint('sketch_a', 'pt_shared', { x:2, y:3 }), true);
assert.deepEqual(store.getObject('sketch_a').data.points.pt_shared, { pointId:'pt_shared', x:2, y:3 });
assert.equal(store.getObject('sketch_a').data.lines.ln_a.startPointId, 'pt_shared');
assert.equal(store.getObject('sketch_a').data.lines.ln_b.startPointId, 'pt_shared');
assert.equal(store.undoStack.length, 1);

const segment = store.addSketchSegment('sketch_a', { x:2, y:3 }, { x:4, y:3 });
assert.ok(segment);
assert.notEqual(segment.startPointId, 'pt_shared');
assert.equal(areSketchEndpointsTopologicallyConnected(segment.startPointId, 'pt_shared'), false);
assert.equal(store.undoStack.length, 2);

store.selection.sketchElement = { sketchId:'sketch_a', kind:'line', elementId:'ln_a' };
const beforeDelete = store.snapshot();
assert.equal(store.deleteSketchElement(), true);
assert.equal(store.getObject('sketch_a').data.lines.ln_a, undefined);
assert.ok(store.getObject('sketch_a').data.lines.ln_b);
assert.ok(store.getObject('sketch_a').data.points.pt_shared);
assert.equal(store.undoStack.length, 3);

const deleteHistory = store.undoStack.at(-1);
store.project = structuredClone(deleteHistory.before);
assert.ok(store.getObject('sketch_a').data.lines.ln_a);
assert.equal(store.getObject('sketch_a').data.lines.ln_a.lineId, 'ln_a');
assert.equal(store.getObject('sketch_a').data.lines.ln_a.startPointId, 'pt_shared');
store.project = structuredClone(deleteHistory.after);
assert.equal(store.getObject('sketch_a').data.lines.ln_a, undefined);
assert.ok(store.getObject('sketch_a').data.points.pt_shared);

const beforeInvalid = store.snapshot();
const historyBeforeInvalid = store.undoStack.length;
const invalidResult = store.runSketchMutation('sketch_a', 'Ungültiger Test', current => {
  current.data.lines.ln_b.endPointId = 'pt_missing';
  return true;
});
assert.equal(invalidResult, false);
assert.deepEqual(store.project, beforeInvalid);
assert.equal(store.undoStack.length, historyBeforeInvalid);
assert.equal(validateSketchTopology(store.getObject('sketch_a')).valid, true);

const historyBeforeNoop = store.undoStack.length;
assert.equal(store.setSketchPoint('sketch_a', 'pt_shared', { x:2, y:3 }), false);
assert.equal(store.undoStack.length, historyBeforeNoop);

const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.match(main, /const BUILD_ID = 'WD-21(?:A\.[3-9]|[B-Z]\.\d+)(?:-R\d+)?'/);
assert.doesNotMatch(main, /const BUILD_ID = 'WD-21A\.2(?:-R\d+)?'/);

assert.ok(events.some(event => event.type === 'geometryChanged' && event.topologyMutation === true));
console.log('WD-21A.3 Central Sketch Topology Mutation Contract regression: PASS');
