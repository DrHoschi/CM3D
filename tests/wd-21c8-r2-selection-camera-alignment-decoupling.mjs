import assert from 'node:assert/strict';
import fs from 'node:fs';

const gizmo = fs.readFileSync(new URL('../src/ui/sketch-gizmo.js', import.meta.url), 'utf8');
const runtime = fs.readFileSync(new URL('../src/runtime-three/runtime.js', import.meta.url), 'utf8');
const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

assert.match(gizmo, /const syncSelectionCamera = \(\) =>/);
assert.match(gizmo, /const adapter = adapterForSelection\(\)/);
assert.match(gizmo, /if \(adapter\) return alignCameraToSketch\(\)/);
assert.match(gizmo, /runtime\.focusSelection\(\)/);
assert.match(gizmo, /if \(align && primary\(\) && !adapterForSelection\(\)\)/);
assert.match(gizmo, /dispose\(\);\s*syncSelectionCamera\(\);\s*return;/s);
assert.match(gizmo, /if \(align && state\.suppressNextSelectionAlign\)/);
assert.match(gizmo, /state\.suppressNextSelectionAlign = false/);
assert.match(gizmo, /manipulationKinds: Object\.freeze\(\['point', 'line', 'circle'\]\)/);
assert.doesNotMatch(gizmo, /manipulationKinds:[^\n]*(?:arc|spline)/);

assert.match(runtime, /focusSelection\(\)\{const selectedElement=this\.store\.selection\.sketchElement/);
assert.match(runtime, /child\.userData\?\.cm3dSketchElement/);
assert.match(runtime, /meta\?\.sketchId===selectedElement\.sketchId/);
assert.match(runtime, /meta\?\.kind===selectedElement\.kind/);
assert.match(runtime, /meta\?\.elementId===selectedElement\.elementId/);
assert.match(runtime, /if\(matched\)focusNode=matched/);

assert.match(main, /const BUILD_ID = 'WD-21C\.8-R2'/);
assert.match(main, /document\.title = `CyberMotion 3D – \$\{BUILD_ID\}`/);
assert.match(main, /buildLabel\.textContent = BUILD_ID/);

console.log('WD-21C.8-R2 Generic Sketch Selection Camera Alignment Decoupling Correction: PASS');
