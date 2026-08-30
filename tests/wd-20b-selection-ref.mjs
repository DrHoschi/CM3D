import assert from 'node:assert/strict';
import {
  SelectionTargetKind,
  createSelectionRef,
  sameSelectionRef,
  selectionRefsFromLegacy
} from '../src/application/selection-ref.js';

const objects = {
  obj_box: { objectId: 'obj_box', type: 'primitive.box' },
  obj_sketch: { objectId: 'obj_sketch', type: 'sketch' }
};
const store = {
  selection: { selectedObjectIds: [], activeObjectId: null, sketchElement: null, sketchElements: [] },
  getObject(id) { return objects[id] ?? null; }
};

assert.deepEqual(createSelectionRef(SelectionTargetKind.OBJECT, 'obj_box', 'obj_box'), {
  targetKind: 'OBJECT', ownerId: 'obj_box', targetId: 'obj_box'
});
assert.throws(() => createSelectionRef('UNKNOWN', 'a', 'b'));
assert.equal(sameSelectionRef(
  createSelectionRef(SelectionTargetKind.OBJECT, 'obj_box', 'obj_box'),
  createSelectionRef(SelectionTargetKind.OBJECT, 'obj_box', 'obj_box')
), true);

store.selection.selectedObjectIds = ['obj_box', 'obj_sketch'];
assert.deepEqual(selectionRefsFromLegacy(store), [
  { targetKind: 'OBJECT', ownerId: 'obj_box', targetId: 'obj_box' },
  { targetKind: 'SKETCH', ownerId: 'obj_sketch', targetId: 'obj_sketch' }
]);

store.selection.sketchElement = { sketchId: 'obj_sketch', kind: 'line', elementId: 'line_1' };
store.selection.sketchElements = [];
assert.deepEqual(selectionRefsFromLegacy(store), [
  { targetKind: 'SKETCH_ELEMENT', ownerId: 'obj_sketch', targetId: 'line_1' }
]);

store.selection.sketchElements = [
  { sketchId: 'obj_sketch', kind: 'line', elementId: 'line_1' },
  { sketchId: 'obj_sketch', kind: 'point', elementId: 'point_1' }
];
assert.deepEqual(selectionRefsFromLegacy(store), [
  { targetKind: 'SKETCH_ELEMENT', ownerId: 'obj_sketch', targetId: 'line_1' },
  { targetKind: 'SKETCH_POINT', ownerId: 'obj_sketch', targetId: 'point_1' }
]);

console.log('WD-20B SelectionRef regression: PASS');
