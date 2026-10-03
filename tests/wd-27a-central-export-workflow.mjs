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
// WD-27A freezes scene | selection as the central descriptor scopes, not the
// concrete local normalization expression used by later adapter implementations.
assert.match(interchange, /['"]scene['"]/);
assert.match(interchange, /['"]selection['"]/);
assert.match(interchange, /descriptor\.scope/);
// WD-27A freezes meters and scale 1 for the GLB/GLTF descriptor contract, not
// the exact boolean expression used to validate those values.
assert.match(interchange, /descriptor\.units\s*\|\|\s*['"]m['"]/);
assert.match(interchange, /descriptor\.scale\s*\?\?\s*1/);
assert.match(interchange, /units\s*,\s*scale/);
// WD-27A freezes exportScene as a compatibility delegation to the central
// exportWithDescriptor(...) authority, not a particular whitespace style.
assert.match(interchange, /const\s+exportScene\s*=\s*options\s*=>\s*exportWithDescriptor\s*\(\s*options\s*\)/);
assert.doesNotMatch(interchange, /OBJLoader|STLLoader|OBJExporter|STLExporter/);

console.log('WD-27A central export workflow regression PASS');
