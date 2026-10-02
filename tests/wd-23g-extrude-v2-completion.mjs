import assert from 'node:assert/strict';
import fs from 'node:fs';

const application=fs.readFileSync(new URL('../src/application/extrude.js',import.meta.url),'utf8');
const runtime=fs.readFileSync(new URL('../src/runtime-three/extrude.js',import.meta.url),'utf8');
const inspector=fs.readFileSync(new URL('../src/ui/feature-parameters-inspector.js',import.meta.url),'utf8');
const wd23a=fs.readFileSync(new URL('./wd-23a-extrude-v2-foundation.mjs',import.meta.url),'utf8');

// F044 multi-profile authority remains the WD-23A PROFILE-reference contract.
assert.match(application,/sourceProfileRefs/);
assert.match(application,/profiles:\[\]/);
assert.match(runtime,/object\.data\?\.profiles/);
assert.match(runtime,/new THREE\.ExtrudeGeometry\(shapes/);
assert.match(wd23a,/derived\.profiles\.length,2/);
assert.match(wd23a,/extrude\.data\.profiles\.length,2/);

// F044 direction/reverse is productive and editable, not merely cached data.
assert.match(inspector,/VALID_DIRECTIONS = new Set\(\['positive','negative','symmetric'\]\)/);
assert.match(inspector,/store\.setExtrudeParameters/);
assert.match(inspector,/object\.data\.direction = direction/);
assert.match(inspector,/store\.pushHistory\(before, 'Extrusionsparameter ändern'\)/);
assert.match(inspector,/store\.emit\('geometryChanged'/);
assert.match(runtime,/direction === 'negative'/);
assert.match(runtime,/direction === 'symmetric'/);

// New F044 extrudes still start deterministically positive; reverse is a parameter edit.
assert.match(application,/direction:'positive'/);

// Boundary: WD-23G must not introduce RB-05/F052 boolean execution into Extrude.
assert.doesNotMatch(application,/boolean|subtract|union|difference/i);
assert.doesNotMatch(runtime,/CSG|boolean|subtract|union|difference/i);

console.log('WD-23G Extrude V2 Completion regression: PASS');
