import assert from 'node:assert/strict';
import {
  SelectionTargetKind,
  createSelectionRef,
  sameSelectionRef,
  selectionRefsFromLegacy,
  installSelectionRefFoundation
} from '../src/application/selection-ref.js';

const objects = {
  obj_box: { objectId: 'obj_box', type: 'primitive.box' },
  obj_sketch: { objectId: 'obj_sketch', type: 'sketch', data: { lines: { line_1: {} }, points: { point_1: {} } } }
};
const listeners = new Set();
const store = {
  selection: { selectedObjectIds: [], activeObjectId: null, sketchElement: null, sketchElements: [] },
  sketchMultiSelectEnabled: false,
  getObject(id) { return objects[id] ?? null; },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  emit(type) { for (const fn of listeners) fn({ type }); },
  select(id, notify = true, additive = false) {
    if (!this.getObject(id)) return false;
    if (additive) {
      const ids = new Set(this.selection.selectedObjectIds);
      ids.add(id);
      this.selection.selectedObjectIds = [...ids];
    } else {
      this.selection.selectedObjectIds = [id];
    }
    this.selection.activeObjectId = id;
    this.selection.sketchElement = null;
    this.selection.sketchElements = [];
    if (notify) this.emit('selectionChanged');
    return true;
  },
  clearSelection(notify = true) {
    this.selection.selectedObjectIds = [];
    this.selection.activeObjectId = null;
    this.selection.sketchElement = null;
    this.selection.sketchElements = [];
    if (notify) this.emit('selectionChanged');
  },
  setSketchMultiSelectEnabled(enabled, notify = true) {
    this.sketchMultiSelectEnabled = !!enabled;
    if (notify) this.emit('selectionChanged');
  },
  selectSketchElement(sketchId, kind, elementId, notify = true) {
    const sketch = this.getObject(sketchId);
    const map = kind === 'line' ? sketch?.data?.lines : sketch?.data?.points;
    if (!map?.[elementId]) return false;
    this.selection.selectedObjectIds = [sketchId];
    this.selection.activeObjectId = sketchId;
    const next = { sketchId, kind, elementId };
    if (this.sketchMultiSelectEnabled) this.selection.sketchElements.push(next);
    else this.selection.sketchElements = [next];
    this.selection.sketchElement = next;
    if (notify) this.emit('selectionChanged');
    return true;
  }
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

store.clearSelection(false);
installSelectionRefFoundation(store);
assert.equal(store.selectRef(createSelectionRef(SelectionTargetKind.OBJECT, 'obj_box', 'obj_box')), true);
assert.deepEqual(store.getPrimarySelectionRef(), { targetKind: 'OBJECT', ownerId: 'obj_box', targetId: 'obj_box' });
assert.equal(store.selectRef(createSelectionRef(SelectionTargetKind.SKETCH_ELEMENT, 'obj_sketch', 'line_1')), true);
assert.deepEqual(store.getPrimarySelectionRef(), { targetKind: 'SKETCH_ELEMENT', ownerId: 'obj_sketch', targetId: 'line_1' });
assert.equal(store.selectRef(createSelectionRef(SelectionTargetKind.SKETCH_POINT, 'obj_sketch', 'point_1'), true, true), true);
assert.equal(store.sketchMultiSelectEnabled, true);
assert.deepEqual(store.getSelectionRefs(), [
  { targetKind: 'SKETCH_ELEMENT', ownerId: 'obj_sketch', targetId: 'line_1' },
  { targetKind: 'SKETCH_POINT', ownerId: 'obj_sketch', targetId: 'point_1' }
]);
store.clearSelectionRefs();
assert.deepEqual(store.getSelectionRefs(), []);
assert.equal(store.getPrimarySelectionRef(), null);

console.log('WD-20B SelectionRef regression: PASS');
