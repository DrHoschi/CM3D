import assert from 'node:assert/strict';
import fs from 'node:fs';
import { installSketchMutationContract, auditSketchMutationOwnership } from '../src/application/sketch-mutation.js';
import { createProject, createSketchObject, migrateAndValidateProject, validateProject } from '../src/model/project.js';
import { createStableReference, resolveStableReference, ReferenceState, ReferenceTargetKind } from '../src/application/stable-reference.js';
import { createSelectionRef, resolveSelectionSketchTarget, SelectionTargetKind } from '../src/application/selection-ref.js';

const project = createProject('WD-21A.4 Gate');
const sketch = createSketchObject(project, 'Gate Sketch');
project.scene.objects[sketch.objectId] = sketch;
project.scene.rootObjectIds.push(sketch.objectId);

const events = [];
const store = {
  project,
  selection: { sketchElement: null },
  undoStack: [],
  redoStack: [],
  historyLimit: 100,
  snapshot() { return structuredClone(this.project); },
  pushHistory(before, label) {
    this.undoStack.push({ before, after: this.snapshot(), label });
    this.redoStack = [];
    this.emit('historyChanged');
  },
  getObject(id) { return this.project.scene.objects[id] ?? null; },
  touch() { this.project.project.modifiedAt = new Date().toISOString(); },
  emit(type, payload = {}) { events.push({ type, ...payload }); },
  refreshDependentExtrudesFromSketch() { return []; }
};

const contract = installSketchMutationContract(store);
assert.equal(contract.version, 'WD-21A.3', 'A.4 integrates the frozen A.3 mutation contract instead of redefining it');
assert.equal(contract.ownershipVerified, true);
assert.equal(contract.topologyAuthority, 'pointId');

// All runtime-active sketch write entry points must be owned by the central mutation contract.
const ownership = auditSketchMutationOwnership(store);
assert.equal(ownership.valid, true);
assert.equal(ownership.invalid.length, 0);
for (const method of ownership.methods) assert.equal(method.owner, 'central-sketch-mutation', `${method.name} must be centrally owned`);

// Create a closed rectangle through the central path and keep stable logical IDs.
const rectangle = store.addSketchRectangle(sketch.objectId, { x: 0, y: 0 }, { x: 2, y: 1 });
assert.ok(rectangle);
assert.equal(rectangle.pointIds.length, 4);
assert.equal(rectangle.lineIds.length, 4);
assert.equal(validateProject(store.project).valid, true);
assert.equal(store.undoStack.length, 1);

const pointId = rectangle.pointIds[0];
const lineId = rectangle.lineIds[0];
const pointRef = createStableReference(ReferenceTargetKind.SKETCH_POINT, sketch.objectId, pointId);
const lineRef = createStableReference(ReferenceTargetKind.SKETCH_ELEMENT, sketch.objectId, lineId, 'line');
const pointSelection = createSelectionRef(SelectionTargetKind.SKETCH_POINT, sketch.objectId, pointId);
const lineSelection = createSelectionRef(SelectionTargetKind.SKETCH_ELEMENT, sketch.objectId, lineId, 'line');
assert.equal(resolveStableReference(store, pointRef).state, ReferenceState.RESOLVED);
assert.equal(resolveStableReference(store, lineRef).state, ReferenceState.RESOLVED);
assert.equal(resolveSelectionSketchTarget(store, pointSelection)?.target?.pointId, pointId);
assert.equal(resolveSelectionSketchTarget(store, lineSelection)?.target?.lineId, lineId);

// Editing keeps references resolved and creates one atomic history entry.
const beforeEditHistory = store.undoStack.length;
assert.equal(store.setSketchPoint(sketch.objectId, pointId, { x: -0.25, y: 0.25 }), true);
assert.equal(store.undoStack.length, beforeEditHistory + 1);
assert.equal(resolveStableReference(store, pointRef).state, ReferenceState.RESOLVED);
assert.equal(resolveStableReference(store, lineRef).state, ReferenceState.RESOLVED);
assert.equal(validateProject(store.project).valid, true);

// Save/load round-trip preserves 0.2.0 topology and exact IDs.
const saved = JSON.parse(JSON.stringify(store.project));
const loaded = migrateAndValidateProject(saved);
assert.equal(loaded.migrated, false);
assert.equal(loaded.project.schemaVersion, '0.2.0');
assert.equal(loaded.project.scene.objects[sketch.objectId].data.points[pointId].pointId, pointId);
assert.equal(loaded.project.scene.objects[sketch.objectId].data.lines[lineId].lineId, lineId);

// V1 / schema 0.1.0 compatibility migration preserves sketch topology and IDs.
const legacy = structuredClone(saved);
legacy.schemaVersion = '0.1.0';
const migrated = migrateAndValidateProject(legacy);
assert.equal(migrated.migrated, true);
assert.equal(migrated.fromVersion, '0.1.0');
assert.equal(migrated.toVersion, '0.2.0');
assert.equal(migrated.project.scene.objects[sketch.objectId].data.points[pointId].pointId, pointId);
assert.equal(migrated.project.scene.objects[sketch.objectId].data.lines[lineId].lineId, lineId);
assert.equal(validateProject(migrated.project).valid, true);

// Deleting the referenced line produces a deterministic missing reference; no geometric rebinding.
store.selection.sketchElement = { sketchId: sketch.objectId, kind: 'line', elementId: lineId };
assert.equal(store.deleteSketchElement(), true);
assert.equal(resolveStableReference(store, lineRef).state, ReferenceState.MISSING);
assert.equal(resolveSelectionSketchTarget(store, lineSelection), null);
assert.equal(validateProject(store.project).valid, true);

// Undo snapshot restores exact logical identity; redo snapshot removes it again.
const deleteHistory = store.undoStack.at(-1);
store.project = structuredClone(deleteHistory.before);
assert.equal(resolveStableReference(store, lineRef).state, ReferenceState.RESOLVED);
assert.equal(store.getObject(sketch.objectId).data.lines[lineId].lineId, lineId);
store.project = structuredClone(deleteHistory.after);
assert.equal(resolveStableReference(store, lineRef).state, ReferenceState.MISSING);

// Event chain must show geometry mutation and selection notification after controlled writes.
assert.ok(events.some(event => event.type === 'geometryChanged' && event.topologyMutation === true));
assert.ok(events.some(event => event.type === 'selectionChanged'));

// Bootstrap/build consistency: sketch editing is installed first, then the central contract becomes authoritative.
const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const editingInstall = main.indexOf('installSketchEditing(store, runtime, appUI);');
const mutationInstall = main.indexOf('const sketchMutationContract = installSketchMutationContract(store);');
assert.ok(editingInstall >= 0 && mutationInstall > editingInstall, 'central mutation contract must be the final sketch write owner after legacy UI installation');
assert.match(main, /const BUILD_ID = 'WD-21A\.4'/);
assert.doesNotMatch(main, /const BUILD_ID = 'WD-21A\.3'/);

console.log('WD-21A.4 Foundation Integration & Contract Coverage Gate: PASS');
