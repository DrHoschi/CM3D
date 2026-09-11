import assert from 'node:assert/strict';
import fs from 'node:fs';
import { deriveSketchProfileRegions } from '../src/model/sketch-profile-region-derivation.js';

const sketch = data => ({ objectId: 'sketch:d3', type: 'sketch', data: { plane: 'localXY', points: {}, lines: {}, circles: {}, arcs: {}, splines: {}, ...data } });

const rectangle = (prefix, x0, y0, x1, y1) => ({
  points: {
    [`${prefix}:p1`]: { pointId:`${prefix}:p1`, x:x0, y:y0 },
    [`${prefix}:p2`]: { pointId:`${prefix}:p2`, x:x1, y:y0 },
    [`${prefix}:p3`]: { pointId:`${prefix}:p3`, x:x1, y:y1 },
    [`${prefix}:p4`]: { pointId:`${prefix}:p4`, x:x0, y:y1 }
  },
  lines: {
    [`${prefix}:l1`]: { lineId:`${prefix}:l1`, startPointId:`${prefix}:p1`, endPointId:`${prefix}:p2` },
    [`${prefix}:l2`]: { lineId:`${prefix}:l2`, startPointId:`${prefix}:p2`, endPointId:`${prefix}:p3` },
    [`${prefix}:l3`]: { lineId:`${prefix}:l3`, startPointId:`${prefix}:p3`, endPointId:`${prefix}:p4` },
    [`${prefix}:l4`]: { lineId:`${prefix}:l4`, startPointId:`${prefix}:p4`, endPointId:`${prefix}:p1` }
  }
});

const rect = rectangle('r', 0, 0, 10, 8);
const rectSketch = sketch(rect);
const rectBefore = JSON.stringify(rectSketch);
const rectResult = deriveSketchProfileRegions(rectSketch);
assert.equal(rectResult.profileRegions.length, 1);
assert.equal(rectResult.profileRegions[0].holes.length, 0);
assert.equal(rectResult.profileRegions[0].outerContour.nestingDepth, 0);
assert.equal(JSON.stringify(rectSketch), rectBefore, 'D.3 must not mutate sketch data');
assert.ok(Object.isFrozen(rectResult));
assert.ok(Object.isFrozen(rectResult.profileRegions));

const circleNesting = sketch({ circles: {
  outer: { circleId:'outer', center:{x:0,y:0}, radius:10 },
  hole: { circleId:'hole', center:{x:0,y:0}, radius:7 },
  island: { circleId:'island', center:{x:0,y:0}, radius:4 },
  innerHole: { circleId:'innerHole', center:{x:0,y:0}, radius:2 },
  separate: { circleId:'separate', center:{x:30,y:0}, radius:3 }
}});
const nested = deriveSketchProfileRegions(circleNesting);
assert.equal(nested.profileRegions.length, 3, 'outer, island and separate must each create regions');
const outerRegion = nested.profileRegions.find(region => region.outerContour.componentKey === 'circle:outer');
const islandRegion = nested.profileRegions.find(region => region.outerContour.componentKey === 'circle:island');
const separateRegion = nested.profileRegions.find(region => region.outerContour.componentKey === 'circle:separate');
assert.ok(outerRegion && islandRegion && separateRegion);
assert.deepEqual(outerRegion.holes.map(hole => hole.componentKey), ['circle:hole']);
assert.equal(outerRegion.outerContour.nestingDepth, 0);
assert.equal(outerRegion.holes[0].nestingDepth, 1);
assert.deepEqual(islandRegion.holes.map(hole => hole.componentKey), ['circle:innerHole']);
assert.equal(islandRegion.outerContour.nestingDepth, 2);
assert.equal(islandRegion.holes[0].nestingDepth, 3);
assert.equal(separateRegion.outerContour.nestingDepth, 0);

const reordered = sketch({ circles: Object.fromEntries(Object.entries(circleNesting.data.circles).reverse()) });
const reorderedResult = deriveSketchProfileRegions(reordered);
assert.deepEqual(
  reorderedResult.profileRegions.map(region => [region.profileKey, region.holes.map(hole => hole.componentKey)]),
  nested.profileRegions.map(region => [region.profileKey, region.holes.map(hole => hole.componentKey)]),
  'profile/hole ordering must not depend on collection insertion order'
);

const mixedArc = sketch({
  points: {
    a:{pointId:'a',x:-3,y:0}, b:{pointId:'b',x:3,y:0}
  },
  lines:{ base:{lineId:'base',startPointId:'a',endPointId:'b'} },
  arcs:{ dome:{arcId:'dome',startPointId:'b',endPointId:'a',control:{x:0,y:3}} }
});
const mixedArcResult = deriveSketchProfileRegions(mixedArc);
assert.equal(mixedArcResult.profileRegions.length, 1);
assert.deepEqual(mixedArcResult.profileRegions[0].outerContour.sourceElements.map(source => source.kind).sort(), ['arc','line']);

const mixedSpline = sketch({
  points: {
    a:{pointId:'a',x:-3,y:0}, b:{pointId:'b',x:3,y:0}
  },
  lines:{ base:{lineId:'base',startPointId:'a',endPointId:'b'} },
  splines:{ cap:{splineId:'cap',startPointId:'b',endPointId:'a',controls:[{controlId:'c1',x:2,y:3},{controlId:'c2',x:-2,y:3}]} }
});
const mixedSplineResult = deriveSketchProfileRegions(mixedSpline);
assert.equal(mixedSplineResult.profileRegions.length, 1);
assert.deepEqual(mixedSplineResult.profileRegions[0].outerContour.sourceElements.map(source => source.kind).sort(), ['line','spline']);

const open = sketch({
  points:{a:{pointId:'a',x:0,y:0},b:{pointId:'b',x:1,y:0}},
  lines:{l:{lineId:'l',startPointId:'a',endPointId:'b'}}
});
assert.equal(deriveSketchProfileRegions(open).profileRegions.length, 0, 'open paths must never become profile regions');

const branching = sketch({
  points:{a:{pointId:'a',x:0,y:0},b:{pointId:'b',x:1,y:0},c:{pointId:'c',x:2,y:0},d:{pointId:'d',x:1,y:1}},
  lines:{l1:{lineId:'l1',startPointId:'a',endPointId:'b'},l2:{lineId:'l2',startPointId:'b',endPointId:'c'},l3:{lineId:'l3',startPointId:'b',endPointId:'d'}}
});
assert.equal(deriveSketchProfileRegions(branching).profileRegions.length, 0, 'invalid branching components must never become regions');

const source = fs.readFileSync(new URL('../src/model/sketch-profile-region-derivation.js', import.meta.url), 'utf8');
assert.match(source, /deriveSketchPathGraph/);
assert.match(source, /CLOSED_CONTOUR/);
assert.doesNotMatch(source, /createExtrudeFromSketch|StableReference|selectRef|recompute/);

const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.match(main, /const BUILD_ID = 'WD-21D\.3'/);
assert.match(main, /document\.title = `CyberMotion 3D – \$\{BUILD_ID\}`/);
assert.match(main, /buildLabel\.textContent = BUILD_ID/);

console.log('WD-21D.3 Closed Profile Region & Nesting Derivation: PASS');
