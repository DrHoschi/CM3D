import assert from 'node:assert/strict';
import fs from 'node:fs';

const gizmo = fs.readFileSync(new URL('../src/ui/sketch-gizmo.js', import.meta.url), 'utf8');
const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

assert.match(main, /const BUILD_ID = 'WD-21C\.[5-9](?:-R\d+)?'/);
assert.match(main, /applyBuildIdentity\(\)/);

assert.match(gizmo, /version: 'WD-21C\.5'/);
assert.match(gizmo, /manipulationKinds: Object\.freeze\(\['point', 'line', 'circle'\]\)/);
assert.match(gizmo, /kind: 'circle'/);
assert.match(gizmo, /circle\.center\.x/);
assert.match(gizmo, /circle\.center\.y/);
assert.match(gizmo, /circle\.radius = drag\.adapter\.initial\.radius/);
assert.match(gizmo, /store\.runSketchMutation\(drag\.sketchId, drag\.adapter\.label/);
assert.match(gizmo, /\{ selectionChanged: true \}/);
assert.match(gizmo, /restoreInitial\(drag\)/);
assert.match(gizmo, /window\.addEventListener\('pointercancel', cancelDrag, true\)/);
assert.match(gizmo, /mixedCircleSelectionIncluded: false/);
assert.match(gizmo, /centralCommit: 'runSketchMutation'/);

assert.doesNotMatch(gizmo, /document\.title\s*=/);
assert.doesNotMatch(gizmo, /brand small/);
assert.doesNotMatch(gizmo, /WD-12B/);
assert.doesNotMatch(gizmo, /\b(?:arc|spline)\b/i, 'C.5 must not add Arc/Spline manipulation');
assert.doesNotMatch(gizmo, /circle\.radius\s*=\s*drag\.adapter\.initial\.radius\s*[+*\/\-]/, 'Circle move must not change radius');

console.log('WD-21C.5 Generic Sketch Element Manipulation Contract regression: PASS');
