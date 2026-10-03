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
assert.match(ui, /transformPolicy\s*:\s*'preserve-world-root-transform'/);
assert.match(ui, /hierarchyPolicy\s*:\s*'preserve-descendants'/);
// WD-27A freezes adapter-supported for the GLB/GLTF path, but later format
// adapters may specialize the descriptor policy (for example geometry-only).
assert.match(ui, /materialPolicy\s*:\s*[^,}]*['"]adapter-supported['"]/);
// WD-27A freezes exportWithDescriptor(...) as the central export authority;
// the caller may pass a local descriptor variable or create it inline.
assert.match(ui, /interchange\.exportWithDescriptor\s*\(/);

assert.match(interchange, /function normalizeExportDescriptor/);
assert.match(interchange, /async function exportWithDescriptor/);
// WD-27A requires GLB and GLTF to remain accepted by the central descriptor;
// later interchange blocks may add further formats without breaking that contract.
assert.match(interchange, /['"]glb['"]/);
assert.match(interchange, /['"]gltf['"]/);
assert.match(interchange, /includes\(format\)/);
assert.match(interchange, /scope = descriptor\.scope === 'selection' \? 'selection' : 'scene'/);
assert.match(interchange, /units !== 'm' \|\| scale !== 1/);
assert.match(interchange, /const exportScene = options => exportWithDescriptor\(options\)/);
assert.doesNotMatch(interchange, /OBJLoader|STLLoader|OBJExporter|STLExporter/);

console.log('WD-27A central export workflow regression PASS');
