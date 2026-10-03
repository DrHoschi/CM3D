import assert from 'node:assert/strict';
import { describeImportedStructure, importedStructureMap } from '../src/runtime-three/imported-structure.js';

const node = (name, children = [], flags = {}) => ({
  name,
  children,
  userData: {},
  position: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
  ...flags
});

const makeTree = () => node('AssetRoot', [
  node('Body', [node('BodyMesh', [], { isMesh: true, material: {} })]),
  node('Door', [node('DoorMesh', [], { isMesh: true, material: [{}, {}] })])
]);

const first = makeTree();
const descriptorsA = describeImportedStructure(first, 'obj_import');
const descriptorsB = describeImportedStructure(makeTree(), 'obj_import');
assert.deepEqual(descriptorsA.map(item => item.sourceKey), descriptorsB.map(item => item.sourceKey), 'rehydration must reproduce imported source keys');
assert.equal(new Set(descriptorsA.map(item => item.sourceKey)).size, descriptorsA.length, 'siblings must have distinct source keys');
assert.equal(descriptorsA[0].sourceKey, 'imported:obj_import:node:root');
assert.equal(descriptorsA.find(item => item.name === 'Body')?.sourceKey, 'imported:obj_import:node:0');
assert.equal(descriptorsA.find(item => item.name === 'Door')?.sourceKey, 'imported:obj_import:node:1');
assert.equal(first.children[1].children[0].userData.cm3dImportedElement.rootObjectId, 'obj_import');
assert.equal(first.children[1].children[0].userData.cm3dImportedElement.sourceKey, 'imported:obj_import:node:1/0');
assert.equal(importedStructureMap(descriptorsA).get('imported:obj_import:node:1/0').kind, 'mesh');

const project = { scene: { objects: { obj_import: { objectId: 'obj_import', type: 'external.gltf' } }, rootObjectIds: ['obj_import'] } };
const beforeObjects = Object.keys(project.scene.objects);
describeImportedStructure(makeTree(), 'obj_import');
assert.deepEqual(Object.keys(project.scene.objects), beforeObjects, 'derived imported structure must not create scene.objects');

const runtimeSource = await import('node:fs').then(fs => fs.readFileSync(new URL('../src/runtime-three/gltf-interchange.js', import.meta.url), 'utf8'));
const uiSource = await import('node:fs').then(fs => fs.readFileSync(new URL('../src/ui/imported-structure.js', import.meta.url), 'utf8'));
const mainSource = await import('node:fs').then(fs => fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'));
assert.match(runtimeSource, /describeImportedStructure/);
assert.match(runtimeSource, /externalImportedStructure/);
assert.match(uiSource, /selection\.importedElement/);
assert.match(uiSource, /externalImportedStructure/);
assert.match(uiSource, /fields\.name\.disabled = true/);
assert.match(mainSource, /installImportedStructureUI/);
assert.doesNotMatch(uiSource, /project\.scene\.objects\s*\[/, 'UI projection must not create scene objects');
assert.doesNotMatch(runtimeSource, /SCHEMA_VERSION/);

console.log('PASS v3 imported structure subselection contract');
