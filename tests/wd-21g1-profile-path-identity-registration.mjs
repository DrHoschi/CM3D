import assert from 'node:assert/strict';
import { createProject, createSketchObject, migrateAndValidateProject } from '../src/model/project.js';
import { recognizeProfileIdentity, recognizePathIdentity } from '../src/model/sketch-profile-path-identity.js';
import { ReferenceState } from '../src/application/stable-reference.js';
import { reconcileProfilePathIdentities } from '../src/application/profile-path-identity-registration.js';

const project = createProject('WD-21G.1 identity lifecycle');
const sketch = createSketchObject(project, 'Lifecycle sketch');
project.scene.objects[sketch.objectId] = sketch;
project.scene.rootObjectIds.push(sketch.objectId);

const point = (id, x, y) => { sketch.data.points[id] = { pointId: id, x, y }; };
const line = (id, a, b) => { sketch.data.lines[id] = { lineId: id, startPointId: a, endPointId: b }; };
point('a',0,0); point('b',2,0); point('c',2,2); point('d',0,2);
line('ab','a','b'); line('bc','b','c'); line('cd','c','d'); line('da','d','a');
point('e',4,0); point('f',5,0); point('g',6,0);
line('ef','e','f'); line('fg','f','g');

const history = [];
const events = [];
const store = {
  project,
  getObject(id) { return this.project.scene.objects[id] ?? null; },
  snapshot() { return structuredClone(this.project); },
  pushHistory(before, label) { history.push({ before, after: structuredClone(this.project), label }); },
  touch() { this.project.project.modifiedAt = new Date().toISOString(); },
  emit(type, detail) { events.push({ type, detail }); }
};

const first = reconcileProfilePathIdentities(store, sketch.objectId);
assert.equal(first.changed, true);
assert.equal(first.profileIds.length, 1);
assert.equal(first.pathIds.length, 1);
assert.equal(history.length, 1);
const profileId = first.profileIds[0];
const pathId = first.pathIds[0];
const profileIdentity = structuredClone(sketch.data.profileIdentities[profileId]);
const pathIdentity = structuredClone(sketch.data.pathIdentities[pathId]);

const second = reconcileProfilePathIdentities(store, sketch.objectId);
assert.equal(second.changed, false);
assert.deepEqual(second.profileIds, []);
assert.deepEqual(second.pathIds, []);
assert.equal(history.length, 1);
assert.deepEqual(Object.keys(sketch.data.profileIdentities), [profileId]);
assert.deepEqual(Object.keys(sketch.data.pathIdentities), [pathId]);

sketch.data.points.a.x = -1;
sketch.data.points.d.x = -1;
assert.equal(recognizeProfileIdentity(sketch, sketch.data.profileIdentities[profileId]).state, ReferenceState.RESOLVED);
const moved = reconcileProfilePathIdentities(store, sketch.objectId);
assert.equal(moved.changed, false);
assert.deepEqual(moved.profileIds, []);
assert.deepEqual(moved.pathIds, []);
assert.equal(Object.keys(sketch.data.profileIdentities).length, 1);
assert.equal(Object.keys(sketch.data.pathIdentities).length, 1);
assert.deepEqual(sketch.data.profileIdentities[profileId], profileIdentity);

delete sketch.data.lines.ab;
assert.equal(recognizeProfileIdentity(sketch, sketch.data.profileIdentities[profileId]).state, ReferenceState.MISSING);
const damaged = reconcileProfilePathIdentities(store, sketch.objectId);
assert.equal(damaged.changed, false);
assert.deepEqual(damaged.profileIds, []);
assert.deepEqual(damaged.pathIds, []);
assert.equal(Object.keys(sketch.data.profileIdentities).length, 1);
assert.equal(Object.keys(sketch.data.pathIdentities).length, 1);
assert.equal(recognizePathIdentity(sketch, sketch.data.pathIdentities[pathId]).state, ReferenceState.RESOLVED);

const saved = structuredClone(store.project);
const loaded = migrateAndValidateProject(saved);
assert.equal(loaded.valid, true);
assert.deepEqual(loaded.project.scene.objects[sketch.objectId].data.profileIdentities[profileId], sketch.data.profileIdentities[profileId]);
assert.deepEqual(loaded.project.scene.objects[sketch.objectId].data.pathIdentities[pathId], pathIdentity);

console.log('WD-21G.1 Profile/Path identity registration lifecycle regression: PASS');
