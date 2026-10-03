import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createProject, createExternalGltfObject, validateProject, SCHEMA_VERSION } from '../src/model/project.js';

const project = createProject('Imported visibility');
const assetId = 'asset_visibility_test';
project.assets.push({ assetId, kind: 'model.gltf.bundle', format: 'glb', entryFile: 'asset.glb', files: [{ name: 'asset.glb', dataUrl: 'data:model/gltf-binary;base64,AA==' }], extensions: {} });
const root = createExternalGltfObject(project, assetId, 'Asset');
project.scene.objects[root.objectId] = root;
project.scene.rootObjectIds.push(root.objectId);
const sourceKey = `imported:${root.objectId}:node:1/0`;
root.data.importedOverrides = { visibility: { [sourceKey]: false, [`imported:${root.objectId}:node:missing`]: false } };
assert.equal(validateProject(project).valid, true, 'optional imported visibility overrides must remain valid without schema migration');
assert.equal(project.schemaVersion, SCHEMA_VERSION);
assert.equal(project.scene.objects[root.objectId].type, 'external.gltf');
assert.equal(Object.keys(project.scene.objects).length, 1, 'visibility overrides must not create imported scene.objects');
const reloaded = JSON.parse(JSON.stringify(project));
assert.equal(reloaded.scene.objects[root.objectId].data.importedOverrides.visibility[sourceKey], false, 'visibility override must survive save/reload serialization');
assert.equal(reloaded.scene.objects[root.objectId].data.importedOverrides.visibility[`imported:${root.objectId}:node:missing`], false, 'unresolved source keys remain persistent and non-blocking');

const uiSource = readFileSync(new URL('../src/ui/imported-structure.js', import.meta.url), 'utf8');
const runtimeSource = readFileSync(new URL('../src/runtime-three/gltf-interchange.js', import.meta.url), 'utf8');
const modelSource = readFileSync(new URL('../src/model/project.js', import.meta.url), 'utf8');
assert.match(uiSource, /data\.importedOverrides\.visibility/);
assert.match(uiSource, /store\.snapshot\(\)/, 'mutation must snapshot for undo/redo');
assert.match(uiSource, /store\.pushHistory\(/, 'mutation must enter existing undo/redo history');
assert.match(uiSource, /node\.visible = isVisible/, 'persisted override must project to runtime visibility');
assert.match(uiSource, /unresolvedSourceKeys/, 'unresolved source keys must be diagnosed without blocking');
assert.match(uiSource, /delete object\.data\.importedOverrides\.visibility\[sourceKey\]/, 'visible default must remove sparse override');
assert.match(uiSource, /pickables\.filter\(node => node\.visible !== false\)/, 'hidden imported elements must not intercept imported subselection picking');
assert.match(runtimeSource, /onlyVisible:true/, 'GLB\/GLTF export must respect projected runtime visibility');
assert.doesNotMatch(uiSource, /project\.scene\.objects\s*\[/, 'imported visibility UI must not create scene objects');
assert.doesNotMatch(uiSource, /INVALID|BLOCKED/, 'unresolved overrides must not enter reference invalidation/recompute');
assert.doesNotMatch(modelSource, /importedOverrides/, 'V3 visibility block must not change the V2 schema/model foundation');

console.log('PASS v3 imported element visibility overrides contract');
