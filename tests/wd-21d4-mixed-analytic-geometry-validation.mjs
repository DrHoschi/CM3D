import assert from 'node:assert/strict';
import fs from 'node:fs';
import { deriveSketchProfileRegions } from '../src/model/sketch-profile-region-derivation.js';
import { validateSketchProfileGeometry, SketchGeometryValidity as V } from '../src/model/sketch-geometry-validation.js';

const sketch = data => ({ objectId: 'sketch:d4', type: 'sketch', data: { plane: 'localXY', points: {}, lines: {}, circles: {}, arcs: {}, splines: {}, ...data } });
const point = (pointId, x, y) => ({ pointId, x, y });

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

const validRect = sketch(rectangle('r', 0, 0, 10, 8));
const validRectBefore = JSON.stringify(validRect);
const d3Before = JSON.stringify(deriveSketchProfileRegions(validRect));
const validRectResult = validateSketchProfileGeometry(validRect);
assert.equal(validRectResult.status, V.VALID);
assert.equal(validRectResult.contourValidations.length, 1);
assert.equal(validRectResult.contourValidations[0].status, V.VALID);
assert.equal(validRectResult.profileRegionValidations[0].status, V.VALID);
assert.equal(JSON.stringify(validRect), validRectBefore, 'D.4 must not mutate persistent sketch data');
assert.equal(JSON.stringify(deriveSketchProfileRegions(validRect)), d3Before, 'D.4 must not mutate D.3 derived data');
assert.ok(Object.isFrozen(validRectResult));
assert.ok(Object.isFrozen(validRectResult.diagnostics));
assert.equal(validRectResult.diagnostics.some(d => d.code === 'D4_SELF_INTERSECTION'), false, 'legal adjacent shared topology endpoints must not be self intersections');

const circle = sketch({ circles:{ c:{circleId:'c',center:{x:0,y:0},radius:4} } });
assert.equal(validateSketchProfileGeometry(circle).status, V.VALID);

const mixedArc = sketch({
  points:{ a:point('a',-3,0), b:point('b',3,0) },
  lines:{ base:{lineId:'base',startPointId:'a',endPointId:'b'} },
  arcs:{ dome:{arcId:'dome',startPointId:'b',endPointId:'a',control:{x:0,y:3}} }
});
const mixedArcResult = validateSketchProfileGeometry(mixedArc);
assert.equal(mixedArcResult.status, V.VALID);
assert.deepEqual(mixedArcResult.contourValidations[0].sourceElements.map(source => source.kind).sort(), ['arc','line']);

const mixedSpline = sketch({
  points:{ a:point('a',-3,0), b:point('b',3,0) },
  lines:{ base:{lineId:'base',startPointId:'a',endPointId:'b'} },
  splines:{ cap:{splineId:'cap',startPointId:'b',endPointId:'a',controls:[{controlId:'c1',x:2,y:3},{controlId:'c2',x:-2,y:3}]} }
});
const mixedSplineResult = validateSketchProfileGeometry(mixedSpline);
assert.equal(mixedSplineResult.status, V.VALID);
assert.deepEqual(mixedSplineResult.contourValidations[0].sourceElements.map(source => source.kind).sort(), ['line','spline']);

const bowTie = sketch({
  points:{ a:point('a',0,0), b:point('b',4,4), c:point('c',0,4), d:point('d',4,0) },
  lines:{
    l1:{lineId:'l1',startPointId:'a',endPointId:'b'},
    l2:{lineId:'l2',startPointId:'b',endPointId:'c'},
    l3:{lineId:'l3',startPointId:'c',endPointId:'d'},
    l4:{lineId:'l4',startPointId:'d',endPointId:'a'}
  }
});
const bowTieResult = validateSketchProfileGeometry(bowTie);
assert.equal(bowTieResult.status, V.INVALID);
assert.ok(bowTieResult.diagnostics.some(d => d.code === 'D4_SELF_INTERSECTION'));
assert.ok(bowTieResult.diagnostics.some(d => d.code === 'D4_ZERO_AREA_OR_DEGENERATE_CONTOUR'));

const zeroArea = sketch({
  points:{ a:point('a',0,0), b:point('b',2,0), c:point('c',4,0) },
  lines:{
    l1:{lineId:'l1',startPointId:'a',endPointId:'b'},
    l2:{lineId:'l2',startPointId:'b',endPointId:'c'},
    l3:{lineId:'l3',startPointId:'c',endPointId:'a'}
  }
});
const zeroAreaResult = validateSketchProfileGeometry(zeroArea);
assert.equal(zeroAreaResult.status, V.INVALID);
assert.ok(zeroAreaResult.diagnostics.some(d => d.code === 'D4_ZERO_AREA_OR_DEGENERATE_CONTOUR'));

const outerHole = sketch(mergeData(rectangle('outer',0,0,10,10), rectangle('hole',2,2,4,4)));
assert.equal(validateSketchProfileGeometry(outerHole).status, V.VALID);

const touchingHole = sketch(mergeData(
  rectangle('outer',0,0,10,10),
  triangle('hole',{x:0,y:3},{x:2,y:2},{x:2,y:4})
));
const touchingHoleResult = validateSketchProfileGeometry(touchingHole);
assert.equal(touchingHoleResult.status, V.AMBIGUOUS);
assert.ok(touchingHoleResult.diagnostics.some(d => d.code === 'D4_INTER_CONTOUR_BOUNDARY_CONTACT'));

const crossingHole = sketch(mergeData(rectangle('outer',0,0,10,10), rectangle('hole',-1,2,3,5)));
const crossingHoleResult = validateSketchProfileGeometry(crossingHole);
assert.equal(crossingHoleResult.status, V.INVALID);
assert.ok(crossingHoleResult.diagnostics.some(d => d.code === 'D4_INTER_CONTOUR_INTERSECTION'));

const crossingIndependent = sketch(mergeData(rectangle('left',0,0,4,4), rectangle('right',2,-1,6,3)));
const crossingIndependentResult = validateSketchProfileGeometry(crossingIndependent);
assert.equal(crossingIndependentResult.status, V.INVALID);
assert.ok(crossingIndependentResult.diagnostics.some(d => d.code === 'D4_INTER_CONTOUR_INTERSECTION'));

const touchingIndependent = sketch(mergeData(
  rectangle('left',0,0,4,4),
  triangle('right',{x:4,y:2},{x:6,y:1},{x:6,y:3})
));
const touchingIndependentResult = validateSketchProfileGeometry(touchingIndependent);
assert.equal(touchingIndependentResult.status, V.AMBIGUOUS);
assert.ok(touchingIndependentResult.diagnostics.some(d => d.code === 'D4_INTER_CONTOUR_BOUNDARY_CONTACT'));

const mixedIntersection = sketch(mergeData(
  rectangle('box', -2, -1, 2, 1),
  { circles:{ c:{circleId:'c',center:{x:2,y:0},radius:1} } }
));
const mixedIntersectionResult = validateSketchProfileGeometry(mixedIntersection);
assert.notEqual(mixedIntersectionResult.status, V.VALID, 'Circle↔Line boundary contact must not be silently valid');
const mixedFinding = mixedIntersectionResult.diagnostics.find(d => d.code === 'D4_INTER_CONTOUR_BOUNDARY_CONTACT' || d.code === 'D4_INTER_CONTOUR_INTERSECTION');
assert.ok(mixedFinding);
assert.ok(mixedFinding.sources.some(source => source.kind === 'circle'));
assert.ok(mixedFinding.sources.some(source => source.kind === 'line'));

const reordered = structuredClone(outerHole);
for (const collection of ['points','lines','circles','arcs','splines']) reordered.data[collection] = Object.fromEntries(Object.entries(reordered.data[collection]).reverse());
const normalize = result => ({
  status:result.status,
  contours:result.contourValidations.map(item=>({componentKey:item.componentKey,status:item.status,sources:item.sourceElements})),
  profiles:result.profileRegionValidations,
  diagnostics:result.diagnostics
});
assert.deepEqual(normalize(validateSketchProfileGeometry(reordered)), normalize(validateSketchProfileGeometry(outerHole)), 'D.4 ordering must not depend on collection insertion order');

const source = fs.readFileSync(new URL('../src/model/sketch-geometry-validation.js', import.meta.url), 'utf8');
assert.match(source, /deriveSketchProfileRegions/);
assert.match(source, /VALID/);
assert.match(source, /INVALID/);
assert.match(source, /AMBIGUOUS/);
assert.match(source, /UNRESOLVED/);
assert.doesNotMatch(source, /createExtrudeFromSketch|StableReference|selectRef|recompute|trim|split|heal/i);

const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.match(main, /const BUILD_ID = 'WD-21D\.4(?:-R\d+)?'/);
assert.match(main, /document\.title = `CyberMotion 3D – \$\{BUILD_ID\}`/);
assert.match(main, /buildLabel\.textContent = BUILD_ID/);

console.log('WD-21D.4 Mixed Analytic Geometry Validation: PASS');
