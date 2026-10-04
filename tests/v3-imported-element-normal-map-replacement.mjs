import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createProject, createExternalGltfObject, validateProject, SCHEMA_VERSION } from '../src/model/project.js';

const project = createProject('Imported normal-map replacement');
const modelAssetId = 'asset_model_normal_test';
project.assets.push({ assetId: modelAssetId, kind: 'model.gltf.bundle', format: 'glb', entryFile: 'asset.glb', files: [{ name: 'asset.glb', dataUrl: 'data:model/gltf-binary;base64,AA==' }], extensions: {} });
const root = createExternalGltfObject(project, modelAssetId, 'Asset');
project.scene.objects[root.objectId] = root;
project.scene.rootObjectIds.push(root.objectId);
const sourceKey = `imported:${root.objectId}:node:1/0`;
const missingKey = `imported:${root.objectId}:node:missing`;
const textureAssetId = 'asset_normal_override';
project.assets.push({ assetId: textureAssetId, kind: 'image.texture', format: 'png', mimeType: 'image/png', name: 'normal.png', dataUrl: 'data:image/png;base64,AA==' });
root.data.importedOverrides = {
  material: { [sourceKey]: { baseColor: '#123456', metallic: 0.4, roughness: 0.7, opacity: 0.9 } },
  texture: {
    [sourceKey]: { baseColor: 'asset_albedo_existing', normalMap: textureAssetId },
    [missingKey]: { normalMap: textureAssetId }
  }
};
assert.equal(validateProject(project).valid, true, 'normal-map override must remain valid without schema migration');
assert.equal(project.schemaVersion, SCHEMA_VERSION);
assert.equal(Object.keys(project.scene.objects).length, 1, 'normal-map replacement must not create imported scene objects');
const reloaded = JSON.parse(JSON.stringify(project));
assert.equal(reloaded.scene.objects[root.objectId].data.importedOverrides.texture[sourceKey].normalMap, textureAssetId, 'normal-map reference must survive save/reload');
assert.equal(reloaded.assets.find(asset => asset.assetId === textureAssetId)?.kind, 'image.texture');
assert.ok(reloaded.scene.objects[root.objectId].data.importedOverrides.texture[missingKey], 'unresolved keys remain persistent and non-blocking');
assert.equal(reloaded.scene.objects[root.objectId].data.importedOverrides.texture[sourceKey].baseColor, 'asset_albedo_existing', 'normal-map override coexists with base-color texture');
assert.deepEqual(reloaded.scene.objects[root.objectId].data.importedOverrides.material[sourceKey], { baseColor: '#123456', metallic: 0.4, roughness: 0.7, opacity: 0.9 });

const uiSource = readFileSync(new URL('../src/ui/imported-structure.js', import.meta.url), 'utf8');
const modelSource = readFileSync(new URL('../src/model/project.js', import.meta.url), 'utf8');
const interchangeSource = readFileSync(new URL('../src/runtime-three/gltf-interchange.js', import.meta.url), 'utf8');
assert.match(uiSource, /data\?\.importedOverrides\?\.texture/);
assert.match(uiSource, /kind: 'image\.texture'/);
assert.match(uiSource, /!Array\.isArray\(node\.material\)/);
assert.match(uiSource, /ensureLocalMaterial/);
assert.match(uiSource, /texture\.colorSpace = slot === 'baseColor' \? THREE\.SRGBColorSpace : THREE\.NoColorSpace/, 'normal maps use linear data color space');
assert.match(uiSource, /material\.normalMap = texture \|\| base\?\.normalMap \|\| null/);
assert.match(uiSource, /node\.material\.normalMap = base\.normalMap \|\| null/);
assert.match(uiSource, /store\.pushHistory\(before, 'Importierte Normal Map ersetzen'\)/);
assert.match(uiSource, /store\.pushHistory\(before, 'Importierte Normal Map entfernen'\)/);
assert.match(uiSource, /material-normal-map-file/);
assert.match(uiSource, /importedNormalMapDiagnostics/);
assert.match(uiSource, /applyNormalMaps\(rootObjectId\)/);
assert.doesNotMatch(uiSource, /INVALID|BLOCKED/);
assert.doesNotMatch(modelSource, /importedOverrides/, 'model schema remains unchanged');
assert.match(interchangeSource, /new GLTFExporter\(\)/);
assert.match(interchangeSource, /new OBJExporter\(\)/);
assert.match(interchangeSource, /new STLExporter\(\)/);
console.log('PASS v3 imported element normal-map replacement contract');
