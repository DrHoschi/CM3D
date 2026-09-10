import assert from 'node:assert/strict';
import fs from 'node:fs';

const tree = fs.readFileSync(new URL('../src/ui/object-tree-scalability.js', import.meta.url), 'utf8');
const runtime = fs.readFileSync(new URL('../src/runtime-three/runtime.js', import.meta.url), 'utf8');
const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const circle = fs.readFileSync(new URL('../src/ui/sketch-circle-integration.js', import.meta.url), 'utf8');
const arc = fs.readFileSync(new URL('../src/ui/sketch-arc-integration.js', import.meta.url), 'utf8');
const spline = fs.readFileSync(new URL('../src/ui/sketch-spline-integration.js', import.meta.url), 'utf8');
const connectivity = fs.readFileSync(new URL('../src/application/sketch-connectivity-commands.js', import.meta.url), 'utf8');
const visibility = fs.readFileSync(new URL('../src/ui/object-visibility.js', import.meta.url), 'utf8');

assert.match(tree, /const revealSketchTarget = target =>/);
assert.match(tree, /target\.sketchId/);
assert.match(tree, /target\.kind/);
assert.match(tree, /target\.elementId/);
assert.match(tree, /item\.dataset\.sketchElement === target\.elementId/);
assert.match(tree, /item\.dataset\.sketchElementKind === target\.kind/);
assert.match(tree, /const sketchTarget = store\.selection\.sketchElement/);
assert.match(tree, /if \(sketchTarget\) revealSketchTarget\(sketchTarget\)/);
assert.match(tree, /revealParentChain\(sketch\.parentId\)/);
assert.doesNotMatch(tree, /setObjectVisible|toggleObjectVisible|visibilityChanged/);

assert.match(runtime, /focusSelection\(\)\{const selectedElement=this\.store\.selection\.sketchElement/);
assert.match(runtime, /selectedElement\?\.sketchId\?\?this\.store\.selection\.activeObjectId/);
assert.match(runtime, /child\.userData\?\.cm3dSketchElement/);
assert.match(runtime, /meta\?\.sketchId===selectedElement\.sketchId/);
assert.match(runtime, /meta\?\.kind===selectedElement\.kind/);
assert.match(runtime, /meta\?\.elementId===selectedElement\.elementId/);
assert.match(runtime, /if\(matched\)focusNode=matched/);
assert.match(runtime, /new THREE\.Box3\(\)\.setFromObject\(focusNode\)/);
assert.doesNotMatch(runtime, /setObjectVisible|toggleObjectVisible/);

for (const source of [circle, arc, spline]) {
  assert.match(source, /cm3dSketchElement/);
}
assert.match(circle, /kind: 'circle'/);
assert.match(arc, /kind: 'arc'/);
assert.match(spline, /kind: 'spline'/);
assert.match(connectivity, /version: 'WD-21C\.6'/);
assert.match(visibility, /export function installObjectVisibility/);

assert.match(main, /const BUILD_ID = 'WD-21C\.8-R\d+'/);
assert.match(main, /document\.title = `CyberMotion 3D – \$\{BUILD_ID\}`/);
assert.match(main, /buildLabel\.textContent = BUILD_ID/);

console.log('WD-21C.8-R1 Generic Sketch Element Selection Synchronization Correction: PASS');
