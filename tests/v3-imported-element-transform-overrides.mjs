import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createProject, createExternalGltfObject, validateProject, SCHEMA_VERSION } from '../src/model/project.js';

const project = createProject('Imported transform');
const assetId = 'asset_transform_test';
project.assets.push({ assetId, kind: 'model.gltf.bundle', format: 'glb', entryFile: 'asset.glb', files: [{ name: 'asset.glb', dataUrl: 'data:model/gltf-binary;base64,AA==' }], extensions: {} });
const root = createExternalGltfObject(project, assetId, 'Asset');
project.scene.objects[root.objectId] = root;
project.scene.rootObjectIds.push(root.objectId);
const sourceKey = `imported:${root.objectId}:node:1/0`;
const missingKey = `imported:${root.objectId}:node:missing`;
const rootTransformBefore = structuredClone(root.transform);
root.data.importedOverrides = {
  visibility: { [sourceKey]: false },
  transform: {
    [sourceKey]: {
      position: { x: 1, y: 2, z: 3 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      scale: { x: 2, y: 2, z: 2 }
    },
    [missingKey]: {
      position: { x: 9, y: 9, z: 9 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      scale: { x: 1, y: 1, z: 1 }
    }
  }
};
assert.equal(validateProject(project).valid, true, 'optional imported transform overrides must remain valid without schema migration');
assert.equal(project.schemaVersion, SCHEMA_VERSION);
assert.deepEqual(root.transform, rootTransformBefore, 'imported element transforms must not mutate the external.gltf root transform');
assert.equal(Object.keys(project.scene.objects).length, 1, 'transform overrides must not create imported scene.objects');
const reloaded = JSON.parse(JSON.stringify(project));
assert.deepEqual(reloaded.scene.objects[root.objectId].data.importedOverrides.transform[sourceKey].position, { x: 1, y: 2, z: 3 }, 'local transform override must survive save/reload');
assert.ok(reloaded.scene.objects[root.objectId].data.importedOverrides.transform[missingKey], 'unresolved source-key transform overrides remain persistent and non-blocking');
assert.equal(reloaded.scene.objects[root.objectId].data.importedOverrides.visibility[sourceKey], false, 'existing visibility overrides must remain intact');

const uiSource = readFileSync(new URL('../src/ui/imported-structure.js', import.meta.url), 'utf8');
const runtimeSource = readFileSync(new URL('../src/runtime-three/runtime.js', import.meta.url), 'utf8');
const interchangeSource = readFileSync(new URL('../src/runtime-three/gltf-interchange.js', import.meta.url), 'utf8');
const modelSource = readFileSync(new URL('../src/model/project.js', import.meta.url), 'utf8');

assert.match(uiSource, /data\.importedOverrides\.transform/);
assert.match(uiSource, /runtimeNode\(selected\.rootObjectId, selected\.sourceKey\)/, 'gizmo target must resolve through the existing source-key runtime identity');
assert.match(uiSource, /runtime\.transform\.attach\(node\)/, 'imported subselection must attach the existing TransformControls to the imported runtime node');
assert.match(uiSource, /runtime\.commitTransform = finalCommit => commitImportedTransform\(finalCommit\) \|\| baseCommitTransform\(finalCommit\)/, 'imported commit must delegate native transforms back to the frozen runtime path');
assert.match(uiSource, /store\.pushHistory\(runtime\.dragBefore/, 'one existing drag snapshot must feed undo\/redo history');
assert.match(uiSource, /position: \{ x: node\.position\.x/, 'persisted override must use node-local position');
assert.match(uiSource, /rotation: \{ x: node\.quaternion\.x/, 'persisted override must use node-local quaternion');
assert.match(uiSource, /scale: \{ x: node\.scale\.x/, 'persisted override must use node-local scale');
assert.match(uiSource, /applyTransforms\(rootObjectId\)/, 'persisted transforms must reapply after imported structure hydration');
assert.match(uiSource, /importedTransformDiagnostics/, 'unresolved transform source keys must be diagnosed without blocking');
assert.match(uiSource, /importedOverrides\.visibility/, 'visibility override contract must remain present');
assert.doesNotMatch(uiSource, /INVALID|BLOCKED/, 'unresolved transform overrides must not enter reference invalidation/recompute');
assert.doesNotMatch(modelSource, /importedOverrides/, 'transform block must not change schema/model foundation');
assert.match(interchangeSource, /SkeletonUtils\.clone/, 'exports must continue from the hydrated runtime tree');
assert.match(interchangeSource, /new GLTFExporter\(\)/);
assert.match(interchangeSource, /new OBJExporter\(\)/);
assert.match(interchangeSource, /new STLExporter\(\)/);
assert.match(runtimeSource, /commitTransform\(finalCommit\)/, 'native runtime transform contract remains available');
assert.doesNotMatch(uiSource, /pivot\s*:/, 'transform override persistence must not introduce pivot/origin semantics');

console.log('PASS v3 imported element transform overrides contract');
