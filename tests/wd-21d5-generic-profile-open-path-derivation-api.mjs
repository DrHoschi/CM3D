import assert from 'node:assert/strict';
import fs from 'node:fs';
import { deriveSketchPathGraph } from '../src/model/sketch-path-graph-derivation.js';
import { deriveSketchProfileRegions } from '../src/model/sketch-profile-region-derivation.js';
import { validateSketchProfileGeometry, SketchGeometryValidity as V } from '../src/model/sketch-geometry-validation.js';
import { deriveSketchProfilesAndPaths } from '../src/model/sketch-profile-path-derivation.js';

const point = (pointId, x, y) => ({ pointId, x, y });
const sketch = data => ({ objectId: 'sketch:d5', type: 'sketch', data: { plane: 'localXY', points: {}, lines: {}, circles: {}, arcs: {}, splines: {}, ...data } });

const rectangle = (prefix, x0, y0, x1, y1) => ({
  points: {
    [`${prefix}:p1`]: point(`${prefix}:p1`, x0, y0),
    [`${prefix}:p2`]: point(`${prefix}:p2`, x1, y0),
    [`${prefix}:p3`]: point(`${prefix}:p3`, x1, y1),
    [`${prefix}:p4`]: point(`${prefix}:p4`, x0, y1)
  },
  lines: {
    [`${prefix}:l1`]: { lineId:`${prefix}:l1`, startPointId:`${prefix}:p1`, endPointId:`${prefix}:p2` },
    [`${prefix}:l2`]: { lineId:`${prefix}:l2`, startPointId:`${prefix}:p2`, endPointId:`${prefix}:p3` },
    [`${prefix}:l3`]: { lineId:`${prefix}:l3`, startPointId:`${prefix}:p3`, endPointId:`${prefix}:p4` },
    [`${prefix}:l4`]: { lineId:`${prefix}:l4`, startPointId:`${prefix}:p4`, endPointId:`${prefix}:p1` }
  }
});

const triangle = (prefix, a, b, c) => ({
  points: {
    [`${prefix}:p1`]: point(`${prefix}:p1`, a.x, a.y),
    [`${prefix}:p2`]: point(`${prefix}:p2`, b.x, b.y),
    [`${prefix}:p3`]: point(`${prefix}:p3`, c.x, c.y)
  },
  lines: {
    [`${prefix}:l1`]: { lineId:`${prefix}:l1`, startPointId:`${prefix}:p1`, endPointId:`${prefix}:p2` },
    [`${prefix}:l2`]: { lineId:`${prefix}:l2`, startPointId:`${prefix}:p2`, endPointId:`${prefix}:p3` },
    [`${prefix}:l3`]: { lineId:`${prefix}:l3`, startPointId:`${prefix}:p3`, endPointId:`${prefix}:p1` }
  }
});

const mergeData = (...parts) => parts.reduce((result, part) => {
  for (const key of ['points','lines','circles','arcs','splines']) Object.assign(result[key], part[key] ?? {});
  return result;
}, { points:{}, lines:{}, circles:{}, arcs:{}, splines:{} });

const openLine = sketch({
  points:{ a:point('a',0,0), b:point('b',2,0) },
  lines:{ l:{lineId:'l',startPointId:'a',endPointId:'b'} }
});
const openLineResult = deriveSketchProfilesAndPaths(openLine);
assert.equal(openLineResult.profiles.length, 0);
assert.equal(openLineResult.openPaths.length, 1);
assert.equal(openLineResult.openPaths[0].startPointId, 'a');
assert.equal(openLineResult.openPaths[0].endPointId, 'b');

const mixedOpen = sketch({
  points:{ a:point('a',0,0), b:point('b',2,0), c:point('c',4,0), d:point('d',6,0) },
  lines:{ z:{lineId:'z',startPointId:'b',endPointId:'a'} },
  arcs:{ a:{arcId:'a',startPointId:'b',endPointId:'c',control:{x:3,y:1}} },
  splines:{ s:{splineId:'s',startPointId:'d',endPointId:'c',controls:[{controlId:'sc',x:5,y:1}]} }
});
const mixedOpenResult = deriveSketchProfilesAndPaths(mixedOpen);
assert.equal(mixedOpenResult.openPaths.length, 1);
assert.deepEqual(mixedOpenResult.openPaths[0].curves.map(curve => `${curve.kind}:${curve.elementId}`), ['line:z','arc:a','spline:s']);
assert.deepEqual(mixedOpenResult.openPaths[0].curves.map(curve => [curve.startPointId, curve.endPointId]), [['a','b'],['b','c'],['c','d']]);

const circle = sketch({ circles:{ c:{circleId:'c',center:{x:0,y:0},radius:4} } });
const circleResult = deriveSketchProfilesAndPaths(circle);
assert.equal(circleResult.profiles.length, 1);
assert.equal(circleResult.openPaths.length, 0);
assert.equal(circleResult.profiles[0].validationStatus, V.VALID);
assert.equal(circleResult.status, V.VALID);

const multiple = sketch(mergeData(rectangle('left',0,0,4,4), rectangle('right',10,0,14,4)));
assert.equal(deriveSketchProfilesAndPaths(multiple).profiles.length, 2);

const outerHole = sketch(mergeData(rectangle('outer',0,0,10,10), rectangle('hole',2,2,4,4)));
const outerHoleResult = deriveSketchProfilesAndPaths(outerHole);
assert.equal(outerHoleResult.profiles.length, 1);
assert.deepEqual(outerHoleResult.profiles[0].holes.map(hole => hole.componentKey), ['line:hole:l1|line:hole:l2|line:hole:l3|line:hole:l4']);
assert.equal(outerHoleResult.profiles[0].validationStatus, V.VALID);

const nested = sketch({ circles:{
  outer:{circleId:'outer',center:{x:0,y:0},radius:10},
  hole:{circleId:'hole',center:{x:0,y:0},radius:7},
  island:{circleId:'island',center:{x:0,y:0},radius:4},
  innerHole:{circleId:'innerHole',center:{x:0,y:0},radius:2}
}});
const nestedResult = deriveSketchProfilesAndPaths(nested);
assert.equal(nestedResult.profiles.length, 2);
const outerProfile = nestedResult.profiles.find(profile => profile.outerContour.componentKey === 'circle:outer');
const islandProfile = nestedResult.profiles.find(profile => profile.outerContour.componentKey === 'circle:island');
assert.ok(outerProfile && islandProfile);
assert.deepEqual(outerProfile.holes.map(hole => hole.componentKey), ['circle:hole']);
assert.deepEqual(islandProfile.holes.map(hole => hole.componentKey), ['circle:innerHole']);

const branching = sketch({
  points:{ a:point('a',0,0), b:point('b',1,0), c:point('c',2,0), d:point('d',1,1) },
  lines:{ x:{lineId:'x',startPointId:'a',endPointId:'b'}, y:{lineId:'y',startPointId:'b',endPointId:'c'}, z:{lineId:'z',startPointId:'b',endPointId:'d'} }
});
const branchingResult = deriveSketchProfilesAndPaths(branching);
assert.equal(branchingResult.invalidComponents.length, 1);
assert.equal(branchingResult.invalidComponents[0].classification, 'INVALID_COMPONENT');
assert.equal(branchingResult.diagnostics.filter(diagnostic => diagnostic.code === 'BRANCHING_COMPONENT').length, 1, 'upstream D.2/D.3 diagnostics must not be duplicated through D.4 upstreamDiagnostics');

const selfCross = sketch({
  points:{ a:point('a',0,0), b:point('b',4,4), c:point('c',0,4), d:point('d',4,0), e:point('e',2,-1) },
  lines:{
    l1:{lineId:'l1',startPointId:'a',endPointId:'b'},
    l2:{lineId:'l2',startPointId:'b',endPointId:'c'},
    l3:{lineId:'l3',startPointId:'c',endPointId:'d'},
    l4:{lineId:'l4',startPointId:'d',endPointId:'e'},
    l5:{lineId:'l5',startPointId:'e',endPointId:'a'}
  }
});
const selfCrossResult = deriveSketchProfilesAndPaths(selfCross);
assert.equal(selfCrossResult.status, V.INVALID);
assert.ok(selfCrossResult.profiles.some(profile => profile.validationStatus === V.INVALID), 'invalid D.4 profiles must remain visible');
assert.ok(selfCrossResult.diagnostics.some(diagnostic => diagnostic.code === 'D4_SELF_INTERSECTION'));

const touching = sketch(mergeData(
  rectangle('outer',0,0,10,10),
  triangle('touch',{x:0,y:3},{x:2,y:2},{x:2,y:4})
));
const touchingResult = deriveSketchProfilesAndPaths(touching);
assert.equal(touchingResult.status, V.AMBIGUOUS);
assert.ok(touchingResult.profiles.some(profile => profile.validationStatus === V.AMBIGUOUS));
assert.ok(touchingResult.diagnostics.some(diagnostic => diagnostic.code === 'D4_INTER_CONTOUR_BOUNDARY_CONTACT'));

const zeroArea = sketch({
  points:{ a:point('a',0,0), b:point('b',2,0), c:point('c',4,0) },
  lines:{ l1:{lineId:'l1',startPointId:'a',endPointId:'b'}, l2:{lineId:'l2',startPointId:'b',endPointId:'c'}, l3:{lineId:'l3',startPointId:'c',endPointId:'a'} }
});
const zeroAreaResult = deriveSketchProfilesAndPaths(zeroArea);
assert.equal(zeroAreaResult.unclassifiedContours.length, 1);
assert.ok(zeroAreaResult.diagnostics.some(diagnostic => diagnostic.code === 'D3_UNCLASSIFIED_GEOMETRY'));

const beforeSketch = JSON.stringify(outerHole);
const beforeD2 = JSON.stringify(deriveSketchPathGraph(outerHole));
const beforeD3 = JSON.stringify(deriveSketchProfileRegions(outerHole));
const beforeD4 = JSON.stringify(validateSketchProfileGeometry(outerHole));
deriveSketchProfilesAndPaths(outerHole);
assert.equal(JSON.stringify(outerHole), beforeSketch, 'D.5 must not mutate persistent sketch data');
assert.equal(JSON.stringify(deriveSketchPathGraph(outerHole)), beforeD2, 'D.5 must not mutate D.2 derived data');
assert.equal(JSON.stringify(deriveSketchProfileRegions(outerHole)), beforeD3, 'D.5 must not mutate D.3 derived data');
assert.equal(JSON.stringify(validateSketchProfileGeometry(outerHole)), beforeD4, 'D.5 must not mutate D.4 validation data');
assert.ok(Object.isFrozen(outerHoleResult));
assert.ok(Object.isFrozen(outerHoleResult.profiles));
assert.ok(Object.isFrozen(outerHoleResult.profiles[0].outerContour));

const reordered = structuredClone(outerHole);
for (const collection of ['points','lines','circles','arcs','splines']) reordered.data[collection] = Object.fromEntries(Object.entries(reordered.data[collection]).reverse());
assert.deepEqual(deriveSketchProfilesAndPaths(reordered), deriveSketchProfilesAndPaths(outerHole), 'D.5 output must be insertion-order independent');

const source = fs.readFileSync(new URL('../src/model/sketch-profile-path-derivation.js', import.meta.url), 'utf8');
assert.match(source, /deriveSketchPathGraph/);
assert.match(source, /deriveSketchProfileRegions/);
assert.match(source, /validateSketchProfileGeometry/);
assert.doesNotMatch(source, /deriveSketchCurves|createExtrudeFromSketch|getSingleExtrudableProfile|StableReference|selectRef|recompute|trim|split|heal/i);

const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.match(main, /const BUILD_ID = 'WD-21D\.5'/);
assert.match(main, /document\.title = `CyberMotion 3D – \$\{BUILD_ID\}`/);
assert.match(main, /buildLabel\.textContent = BUILD_ID/);

console.log('WD-21D.5 Generic Profile / Open Path Derivation API: PASS');
