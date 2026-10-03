import fs from 'node:fs';
import assert from 'node:assert/strict';

const runtime = fs.readFileSync(new URL('../src/runtime-three/gltf-interchange.js', import.meta.url), 'utf8');
const ui = fs.readFileSync(new URL('../src/ui/gltf-panel.js', import.meta.url), 'utf8');
const model = fs.readFileSync(new URL('../src/model/project.js', import.meta.url), 'utf8');

for (const symbol of ['OBJLoader','STLLoader','OBJExporter','STLExporter']) assert.match(runtime, new RegExp(symbol));
assert.match(runtime, /INTERCHANGE_ASSET_KIND = 'model\.interchange\.source'/);
assert.match(runtime, /EXTERNAL_INTERCHANGE_TYPE = 'external\.interchange'/);
assert.match(runtime, /async function importInterchangeFile/);
assert.match(runtime, /\['glb','gltf','obj','stl'\]\.includes\(format\)/);
assert.match(runtime, /format==='obj'/);
assert.match(runtime, /format==='stl'/);
assert.match(runtime, /materialPolicy:format==='stl'\?'geometry-only'/);
assert.match(runtime, /store\.pushHistory\(before,`\$\{format\.toUpperCase\(\)\} importieren`\)/);

assert.match(model, /createExternalInterchangeObject/);
assert.match(model, /asset\.kind==='model\.interchange\.source'/);
assert.match(model, /o\.type==='external\.interchange'/);
assert.match(model, /\['obj','stl'\]\.includes\(asset\.format\)/);

assert.match(ui, /OBJ \/ STL importieren/);
assert.match(ui, /value="obj">OBJ/);
assert.match(ui, /value="stl">STL/);
assert.match(ui, /interchange\.importInterchangeFile\(file\)/);
assert.match(ui, /interchange\.exportWithDescriptor\(createDescriptor\(\)\)/);
assert.match(ui, /STL exportiert reine Dreiecksgeometrie/);
assert.doesNotMatch(ui, /CMO|CMU/);

console.log('WD-27B OBJ STL interchange regression PASS');
