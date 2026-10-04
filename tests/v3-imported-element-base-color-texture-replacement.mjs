import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createProject, createExternalGltfObject, validateProject, SCHEMA_VERSION } from '../src/model/project.js';

const project = createProject('Imported base-color texture replacement');
const modelAssetId = 'asset_model_texture_test';
project.assets.push({ assetId: modelAssetId, kind: 'model.gltf.bundle', format: 'glb', entryFile: 'asset.glb', files: [{ name: 'asset.glb', dataUrl: 'data:model/gltf-binary;base64,AA==' }], extensions: {} });
const root = createExternalGltfObject(project, modelAssetId, 'Asset');
project.scene.objects[root.objectId] = root;
project.scene.rootObjectIds.push(root.objectId);
const sourceKey = `imported:${root.objectId}:node:1/0`;
const missingKey = `imported:${root.objectId}:node:missing`;
const textureAssetId = 'asset_texture_override';
project.assets.push({ assetId: textureAssetId, kind: 'image.texture', format: 'png', mimeType: 'image/png', name: 'albedo.png', dataUrl: 'data:image/png;base64,AA==' });
root.data.importedOverrides = {
  material: { [sourceKey]: { baseColor: '#123456', metallic: 0.4, roughness: 0.7, opacity: 0.9 } },
  texture: {
    [sourceKey]: { baseColor: textureAssetId },
    [missingKey]: { baseColor: textureAssetId }
  }
};
assert.equal(validateProject(project).valid, true, 'optional imported texture override must remain valid without schema migration');
assert.equal(project.schemaVersion, SCHEMA_VERSION);
assert.equal(Object.keys(project.scene.objects).length, 1, 'texture replacement must not create imported scene.objects');
const reloaded = JSON.parse(JSON.stringify(project));
assert.equal(reloaded.scene.objects[root.objectId].data.importedOverrides.texture[sourceKey].baseColor, textureAssetId, 'source-key to texture asset reference must survive save/reload');
assert.equal(reloaded.assets.find(asset => asset.assetId === textureAssetId)?.kind, 'image.texture', 'replacement texture must reuse the existing image.texture asset contract');
assert.ok(reloaded.scene.objects[root.objectId].data.importedOverrides.texture[missingKey], 'unresolved source-key texture overrides remain persistent and non-blocking');
assert.deepEqual(reloaded.scene.objects[root.objectId].data.importedOverrides.material[sourceKey], { baseColor: '#123456', metallic: 0.4, roughness: 0.7, opacity: 0.9 }, 'material parameter overrides must coexist with texture replacement');

const uiSource = readFileSync(new URL('../src/ui/imported-structure.js', import.meta.url), 'utf8');
const modelSource = readFileSync(new URL('../src/model/project.js', import.meta.url), 'utf8');
const interchangeSource = readFileSync(new URL('../src/runtime-three/gltf-interchange.js', import.meta.url), 'utf8');

assert.match(uiSource, /data\?\.importedOverrides\?\.texture/, 'texture overrides must use the existing external.gltf override container');
assert.match(uiSource, /kind: 'image\.texture'/, 'replacement must reuse the existing image.texture asset kind');
assert.match(uiSource, /IMAGE_MIME = \/\^image\\\/\(png\|jpeg\|webp\)\$\//, 'only PNG, JPEG and WebP are accepted');
assert.match(uiSource, /!Array\.isArray\(node\.material\)/, 'only single-material imported meshes are editable');
assert.match(uiSource, /ensureLocalMaterial/, 'texture replacement must share the existing clone-on-override material boundary');
assert.match(uiSource, /node\.material === base\) node\.material = base\.clone\(\)/, 'shared GLTF material must be cloned before local texture mutation');
assert.match(uiSource, /texture\.colorSpace = THREE\.SRGBColorSpace/, 'base-color replacement must hydrate as sRGB');
assert.match(uiSource, /material\.map = texture \|\| base\?\.map \|\| null/, 'runtime projection must target material.map and fall back to the original GLTF map');
assert.match(uiSource, /node\.material\.map = base\.map \|\| null/, 'removing or losing an override must restore the original GLTF base map');
assert.match(uiSource, /store\.pushHistory\(before, 'Importierte Basisfarbtextur ersetzen'\)/, 'texture replacement must create undo history');
assert.match(uiSource, /store\.pushHistory\(before, 'Importierte Basisfarbtextur entfernen'\)/, 'texture removal must create undo history');
assert.match(uiSource, /FileReader/, 'existing inspector file input must feed the imported texture override');
assert.match(uiSource, /readAsDataURL\(file\)/, 'replacement image must persist through the embedded data-url asset contract');
assert.match(uiSource, /importedTextureDiagnostics/, 'missing source keys/assets must be diagnosed non-blockingly');
assert.match(uiSource, /applyTextures\(rootObjectId\)/, 'texture overrides must reapply after imported structure hydration');
assert.doesNotMatch(uiSource, /normalMap\s*=|roughnessMap\s*=|metalnessMap\s*=|aoMap\s*=|emissiveMap\s*=/, 'no additional texture slots may be opened');
assert.doesNotMatch(uiSource, /INVALID|BLOCKED/, 'missing texture overrides must not enter reference invalidation/recompute');
assert.doesNotMatch(modelSource, /importedOverrides/, 'texture block must not change schema/model foundation');
assert.match(interchangeSource, /new GLTFExporter\(\)/, 'GLTF export continues from the hydrated runtime material state');
assert.match(interchangeSource, /new OBJExporter\(\)/, 'existing OBJ export contract remains unchanged');
assert.match(interchangeSource, /new STLExporter\(\)/, 'existing STL geometry-only contract remains unchanged');

console.log('PASS v3 imported element base-color texture replacement contract');
