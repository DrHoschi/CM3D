import assert from 'node:assert/strict';
import fs from 'node:fs';
import { deriveClosedSketchProfiles, getSingleExtrudableProfile } from '../src/model/sketch-profile.js';
import { deriveSketchCurves } from '../src/model/sketch-curve-derivation.js';
import { deriveSketchPathGraph } from '../src/model/sketch-path-graph-derivation.js';
import { deriveSketchProfileRegions } from '../src/model/sketch-profile-region-derivation.js';
import { validateSketchProfileGeometry, SketchGeometryValidity as V } from '../src/model/sketch-geometry-validation.js';
import { deriveSketchProfilesAndPaths } from '../src/model/sketch-profile-path-derivation.js';

const point = (pointId, x, y) => ({ pointId, x, y });
const sketch = data => ({ objectId:'sketch:d6', type:'sketch', data:{ plane:'localXY', points:{}, lines:{}, circles:{}, arcs:{}, splines:{}, ...data } });

const lineRectangle = sketch({
  points:{ a:point('a',0,0), b:point('b',4,0), c:point('c',4,3), d:point('d',0,3) },
  lines:{
    l1:{lineId:'l1',startPointId:'a',endPointId:'b'},
    l2:{lineId:'l2',startPointId:'b',endPointId:'c'},
    l3:{lineId:'l3',startPointId:'c',endPointId:'d'},
    l4:{lineId:'l4',startPointId:'d',endPointId:'a'}
  }
});

// Legacy line-only authority and new D.1-D.5 derivation must coexist without redirecting legacy extrusion.
const legacyClosed = deriveClosedSketchProfiles(lineRectangle);
const legacyExtrude = getSingleExtrudableProfile(lineRectangle);
const combinedClosed = deriveSketchProfilesAndPaths(lineRectangle);
assert.equal(legacyClosed.profiles.length, 1);
assert.equal(legacyExtrude.valid, true);
assert.equal(combinedClosed.profiles.length, 1);
assert.equal(combinedClosed.openPaths.length, 0);
assert.equal(combinedClosed.status, V.VALID);

const openLine = sketch({
  points:{ a:point('a',0,0), b:point('b',2,0) },
  lines:{ l:{lineId:'l',startPointId:'a',endPointId:'b'} }
});
assert.equal(getSingleExtrudableProfile(openLine).valid, false);
assert.equal(deriveSketchProfilesAndPaths(openLine).openPaths.length, 1);

// New analytic profile capability must not implicitly expand the frozen legacy extrusion boundary.
const circle = sketch({ circles:{ c:{circleId:'c',center:{x:0,y:0},radius:2} } });
assert.equal(deriveSketchProfilesAndPaths(circle).profiles.length, 1);
assert.equal(deriveSketchProfilesAndPaths(circle).status, V.VALID);
assert.equal(getSingleExtrudableProfile(circle).valid, false);

const outerHole = sketch({
  points:{
    a:point('a',0,0), b:point('b',10,0), c:point('c',10,10), d:point('d',0,10),
    e:point('e',2,2), f:point('f',4,2), g:point('g',4,4), h:point('h',2,4)
  },
  lines:{
    o1:{lineId:'o1',startPointId:'a',endPointId:'b'}, o2:{lineId:'o2',startPointId:'b',endPointId:'c'},
    o3:{lineId:'o3',startPointId:'c',endPointId:'d'}, o4:{lineId:'o4',startPointId:'d',endPointId:'a'},
    h1:{lineId:'h1',startPointId:'e',endPointId:'f'}, h2:{lineId:'h2',startPointId:'f',endPointId:'g'},
    h3:{lineId:'h3',startPointId:'g',endPointId:'h'}, h4:{lineId:'h4',startPointId:'h',endPointId:'e'}
  }
});
const holeCombined = deriveSketchProfilesAndPaths(outerHole);
assert.equal(holeCombined.profiles.length, 1);
assert.equal(holeCombined.profiles[0].holes.length, 1);
assert.equal(getSingleExtrudableProfile(outerHole).valid, false, 'legacy extrusion must still reject multiple line-only loops');

// Cross-layer determinism and non-mutation: one read through every frozen D.1-D.5 authority.
const before = JSON.stringify(lineRectangle);
const snapshot = input => ({
  d1: deriveSketchCurves(input),
  d2: deriveSketchPathGraph(input),
  d3: deriveSketchProfileRegions(input),
  d4: validateSketchProfileGeometry(input),
  d5: deriveSketchProfilesAndPaths(input)
});
const first = snapshot(lineRectangle);
assert.equal(JSON.stringify(lineRectangle), before);
for (const value of Object.values(first)) assert.ok(Object.isFrozen(value), 'each D.1-D.5 top-level read model must remain frozen');

const reordered = structuredClone(lineRectangle);
for (const collection of ['points','lines','circles','arcs','splines']) {
  reordered.data[collection] = Object.fromEntries(Object.entries(reordered.data[collection]).reverse());
}
assert.deepEqual(snapshot(reordered), first, 'D.1-D.5 integrated derivation must be insertion-order independent');

// Negative scope: D.6 must remain regression-only and legacy extrusion must not consume D.5.
const legacySource = fs.readFileSync(new URL('../src/model/sketch-profile.js', import.meta.url), 'utf8');
assert.doesNotMatch(legacySource, /deriveSketchProfilesAndPaths|sketch-profile-path-derivation|StableReference|SelectionRef/i);

const mainSource = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.match(mainSource, /const BUILD_ID = '(?:WD-21D\.5|WD-21G\.1)'/, 'D.6 must not change visible product build identity');
assert.doesNotMatch(mainSource, /WD-21D\.6/);

const d5Source = fs.readFileSync(new URL('../src/model/sketch-profile-path-derivation.js', import.meta.url), 'utf8');
assert.doesNotMatch(d5Source, /StableReference|SelectionRef|createExtrudeFromSketch|trim|split|heal/i);

console.log('WD-21D.6 Derivation Regression / Compatibility Gate: PASS');
