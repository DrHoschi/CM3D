import assert from 'node:assert/strict';
import { AppStore } from '../src/application/store.js';
import { installProfilePathIdentityRegistrationLifecycle } from '../src/application/profile-path-identity-registration.js';
import { recognizePathIdentity } from '../src/model/sketch-profile-path-identity.js';
import { createProject, createSketchObject } from '../src/model/project.js';
import { saveProject, loadProject } from '../src/persistence/storage.js';

class MemoryStorage {
  constructor() { this.map = new Map(); }
  get length() { return this.map.size; }
  key(index) { return [...this.map.keys()][index] ?? null; }
  getItem(key) { return this.map.has(String(key)) ? this.map.get(String(key)) : null; }
  setItem(key, value) { this.map.set(String(key), String(value)); }
  removeItem(key) { this.map.delete(String(key)); }
  clear() { this.map.clear(); }
}
globalThis.localStorage = new MemoryStorage();

const project = createProject('WD-21G.1 productive path roundtrip');
const sketch = createSketchObject(project, 'Roundtrip sketch');
project.scene.objects[sketch.objectId] = sketch;
project.scene.rootObjectIds.push(sketch.objectId);

const point = (id, x, y) => { sketch.data.points[id] = { pointId:id, x, y }; };
const line = (id, a, b) => { sketch.data.lines[id] = { lineId:id, startPointId:a, endPointId:b }; };

// Three disconnected open paths make visible Pfad-N ordering observable.
point('a0',0,0); point('a1',1,0); point('a2',2,0);
line('a_line_1','a0','a1'); line('a_line_2','a1','a2');
point('b0',0,2); point('b1',1,2);
line('b_line_1','b0','b1');
point('c0',0,4); point('c1',1,4); point('c2',2,4); point('c3',3,4);
line('c_line_1','c0','c1'); line('c_line_2','c1','c2'); line('c_line_3','c2','c3');

const store = new AppStore();
store.replaceProject(project);
const lifecycle = installProfilePathIdentityRegistrationLifecycle(store);
const registered = lifecycle.reconcileAll();
assert.equal(registered.length, 1);
assert.equal(Object.keys(store.getObject(sketch.objectId).data.pathIdentities).length, 3);

const sorted = values => [...values].sort((a,b) => a.localeCompare(b));
const evidence = currentSketch => Object.values(currentSketch.data.pathIdentities ?? {})
  .map(identity => {
    const recognition = recognizePathIdentity(currentSketch, identity);
    assert.equal(recognition.state, 'RESOLVED');
    const recognizedSourceIds = sorted((recognition.target?.curves ?? []).map(curve => curve.elementId));
    return {
      pathId: identity.pathId,
      sourceElementIds: sorted(identity.source.elementIds),
      recognizedSourceIds
    };
  })
  .sort((a,b) => a.pathId.localeCompare(b.pathId))
  .map((entry, index) => ({ ...entry, visiblePathNumber:index + 1 }));

const before = evidence(store.getObject(sketch.objectId));
assert.equal(before.length, 3);
for (const row of before) assert.deepEqual(row.recognizedSourceIds, row.sourceElementIds);

const saved = saveProject(store.project);
const loadedProject = loadProject(saved.projectId);
store.replaceProject(loadedProject); // emits productive projectLoaded; installed lifecycle reconciles synchronously.

const afterSketch = store.getObject(sketch.objectId);
const after = evidence(afterSketch);
assert.deepEqual(after, before, 'PathId -> source.elementIds -> Pfad-N -> recognized geometry must survive productive save/load.');

const postLoadReconcile = lifecycle.reconcileAll();
assert.deepEqual(postLoadReconcile, [], 'Reload must not register replacement path identities.');
assert.deepEqual(evidence(store.getObject(sketch.objectId)), before);

console.log('WD-21G.1 productive save/reload path stability regression: PASS');
