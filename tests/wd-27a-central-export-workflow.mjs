import fs from 'node:fs';
import assert from 'node:assert/strict';

const ui = fs.readFileSync(new URL('../src/ui/gltf-panel.js', import.meta.url), 'utf8');
const interchange = fs.readFileSync(new URL('../src/runtime-three/gltf-interchange.js', import.meta.url), 'utf8');

assert.match(ui, /id="start-model-export"/);
assert.match(ui, />Exportieren…</);
assert.doesNotMatch(ui, /start-gltf-selection-export/);
assert.doesNotMatch(ui, /Ganze Szene als GLB \/ GLTF/);
assert.match(ui, /id="model-export-scope"/);
assert.match(ui, /value="scene"/);
assert.match(ui, /value="selection"/);
assert.match(ui, /id="model-export-format"/);
assert.match(ui, /kein natives CM3D-Projektbackup/);
assert.match(ui, /transformPolicy: 'preserve-world-root-transform'/);
assert.match(ui, /hierarchyPolicy: 'preserve-descendants'/);
assert.match(ui, /materialPolicy: 'adapter-supported'/);
assert.match(ui, /interchange\.exportWithDescriptor\(descriptor\)/);

assert.match(interchange, /function normalizeExportDescriptor/);
assert.match(interchange, /async function exportWithDescriptor/);
assert.match(interchange, /\['glb', 'gltf'\]\.includes\(format\)/);
assert.match(interchange, /scope = descriptor\.scope === 'selection' \? 'selection' : 'scene'/);
assert.match(interchange, /units !== 'm' \|\| scale !== 1/);
assert.match(interchange, /const exportScene = options => exportWithDescriptor\(options\)/);
assert.doesNotMatch(interchange, /OBJLoader|STLLoader|OBJExporter|STLExporter/);

console.log('WD-27A central export workflow regression PASS');
