import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createProject, createExternalGltfObject, validateProject, SCHEMA_VERSION } from '../src/model/project.js';

const project = createProject('Imported material overrides');
const assetId = 'asset_material_test';
project.assets.push({ assetId, kind: 'model.gltf.bundle', format: 'glb', entryFile: 'asset.glb', files: [{ name: 'asset.glb', dataUrl: 'data:model/gltf-binary;base64,AA==' }], extensions: {} });
const root = createExternalGltfObject(project, assetId, 'Asset');
project.scene.objects[root.objectId] = root;
project.scene.rootObjectIds.push(root.objectId);
const sourceKey = `imported:${root.objectId}:node:1/0`;
const missingKey = `imported:${root.objectId}:node:missing`;
root.data.importedOverrides = {
  visibility: { [sourceKey]: false },
  transform: { [sourceKey]: { position: { x: 1, y: 2, z: 3 }, rotation: { x: 0, y: 0, z: 0, w: 1 }, scale: { x: 1, y: 1, z: 1 } } },
  material: {
    [sourceKey]: { baseColor: '#123456', metallic: 0.75, roughness: 0.25, opacity: 0.6 },
    [missingKey]: { roughness: 0.9 }
  }
};
assert.equal(validateProject(project).valid, true, 'optional imported material overrides must remain valid without schema migration');
assert.equal(project.schemaVersion, SCHEMA_VERSION);
assert.equal(Object.keys(project.scene.objects).length, 1, 'material overrides must not create imported scene.objects');
const reloaded = JSON.parse(JSON.stringify(project));
assert.deepEqual(reloaded.scene.objects[root.objectId].data.importedOverrides.material[sourceKey], { baseColor: '#123456', metallic: 0.75, roughness: 0.25, opacity: 0.6 }, 'material override must survive save/reload');
assert.ok(reloaded.scene.objects[root.objectId].data.importedOverrides.material[missingKey], 'unresolved source-key material overrides remain persistent and non-blocking');
assert.equal(reloaded.scene.objects[root.objectId].data.importedOverrides.visibility[sourceKey], false, 'visibility contract remains intact');
assert.ok(reloaded.scene.objects[root.objectId].data.importedOverrides.transform[sourceKey], 'transform contract remains intact');

const uiSource = readFileSync(new URL('../src/ui/imported-structure.js', import.meta.url), 'utf8');
const modelSource = readFileSync(new URL('../src/model/project.js', import.meta.url), 'utf8');
const interchangeSource = readFileSync(new URL('../src/runtime-three/gltf-interchange.js', import.meta.url), 'utf8');

assert.match(uiSource, /data\?\.importedOverrides\?\.material/, 'material overrides must use the existing external.gltf override container');
assert.match(uiSource, /!Array\.isArray\(node\.material\)/, 'only single-material imported meshes are editable');
assert.match(uiSource, /node\.material === base\) node\.material = base\.clone\(\)/, 'first override must clone a shared GLTF material before mutation');
assert.match(uiSource, /baseMaterials/, 'hydrated base material identity must be retained for deterministic reapply');
assert.match(uiSource, /\['baseColor','metallic','roughness','opacity'\]/, 'material parameter scope remains limited to the four authorized properties');
assert.match(uiSource, /Number\(value\) >= 0 && Number\(value\) <= 1/, 'numeric PBR overrides must validate the normalized 0..1 range');
assert.match(uiSource, /store\.pushHistory\(before, `Importiertes Material \$\{property\}`\)/, 'each accepted material edit must create one undo history entry');
assert.match(uiSource, /applyMaterials\(rootObjectId\)/, 'material overrides must reapply after imported structure hydration');
assert.match(uiSource, /importedMaterialDiagnostics/, 'unresolved source keys must be diagnosed without blocking');
assert.match(uiSource, /Importiertes Multi-\/Nicht-Mesh · Material read-only/, 'multi-material and non-mesh imported elements remain read-only');
assert.doesNotMatch(uiSource, /INVALID|BLOCKED/, 'unresolved material overrides must not enter reference invalidation/recompute');
assert.doesNotMatch(modelSource, /importedOverrides/, 'material block must not change schema/model foundation');
assert.match(interchangeSource, /new GLTFExporter\(\)/, 'GLTF export continues from the hydrated runtime material state');
assert.match(interchangeSource, /new OBJExporter\(\)/, 'existing OBJ export contract remains unchanged');
assert.match(interchangeSource, /new STLExporter\(\)/, 'existing STL export contract remains unchanged');

console.log('PASS v3 imported element material parameter overrides contract');
