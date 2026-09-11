import assert from 'node:assert/strict';
import fs from 'node:fs';
import { deriveSketchCurves } from '../src/model/sketch-curve-derivation.js';
import { deriveSketchPathGraph, SketchPathComponentClassification as C } from '../src/model/sketch-path-graph-derivation.js';

const point = (pointId, x, y) => ({ pointId, x, y });
const baseSketch = data => ({ objectId: 'sketch:d2', type: 'sketch', data: { plane: 'localXY', points: {}, lines: {}, circles: {}, arcs: {}, splines: {}, ...data } });

const single = baseSketch({ points: { b: point('b', 1, 0), a: point('a', 0, 0) }, lines: { l1: { lineId: 'l1', startPointId: 'b', endPointId: 'a' } } });
const singleResult = deriveSketchPathGraph(single);
assert.equal(singleResult.components.length, 1);
assert.equal(singleResult.components[0].classification, C.OPEN_PATH);
assert.equal(singleResult.components[0].startPointId, 'a');
assert.equal(singleResult.components[0].endPointId, 'b');
assert.equal(singleResult.components[0].curves[0].startPointId, 'a');

const mixed = baseSketch({
  points: { a: point('a',0,0), b: point('b',2,0), c: point('c',4,0), d: point('d',6,0) },
  lines: { z: { lineId:'z', startPointId:'b', endPointId:'a' } },
  arcs: { a: { arcId:'a', startPointId:'b', endPointId:'c', control:{x:3,y:1} } },
  splines: { s: { splineId:'s', startPointId:'d', endPointId:'c', controls:[{controlId:'sc',x:5,y:1}] } }
});
const mixedBefore = JSON.stringify(mixed);
const d1Before = JSON.stringify(deriveSketchCurves(mixed));
const mixedResult = deriveSketchPathGraph(mixed);
assert.equal(mixedResult.components.length, 1);
assert.equal(mixedResult.components[0].classification, C.OPEN_PATH);
assert.equal(mixedResult.components[0].startPointId, 'a');
assert.equal(mixedResult.components[0].endPointId, 'd');
assert.deepEqual(mixedResult.components[0].curves.map(c => c.elementId), ['z','a','s']);
assert.equal(JSON.stringify(mixed), mixedBefore);
assert.equal(JSON.stringify(deriveSketchCurves(mixed)), d1Before);

const ring = baseSketch({
  points: { a:point('a',0,0), b:point('b',2,0), c:point('c',1,2) },
  lines: { l2:{lineId:'l2',startPointId:'b',endPointId:'a'}, l1:{lineId:'l1',startPointId:'c',endPointId:'b'} },
  arcs: { ar:{arcId:'ar',startPointId:'a',endPointId:'c',control:{x:0,y:1}} }
});
const ringResult = deriveSketchPathGraph(ring);
assert.equal(ringResult.components.length,1);
assert.equal(ringResult.components[0].classification,C.CLOSED_CONTOUR);
assert.equal(ringResult.components[0].curves.length,3);
assert.equal(ringResult.components[0].startPointId,null);

const circleSketch = baseSketch({ circles:{ c:{circleId:'c',center:{x:1,y:1},radius:2} } });
const circleResult = deriveSketchPathGraph(circleSketch);
assert.equal(circleResult.components[0].classification,C.CLOSED_CONTOUR);
assert.equal(circleResult.components[0].curves.length,1);
assert.equal(circleResult.components[0].curves[0].kind,'circle');
assert.equal(circleResult.components[0].curves[0].startPointId,null);

const branch = baseSketch({
  points:{ a:point('a',0,0), b:point('b',1,0), c:point('c',2,0), d:point('d',1,1) },
  lines:{ x:{lineId:'x',startPointId:'a',endPointId:'b'}, y:{lineId:'y',startPointId:'b',endPointId:'c'}, z:{lineId:'z',startPointId:'b',endPointId:'d'} }
});
const branchResult=deriveSketchPathGraph(branch);
assert.equal(branchResult.components[0].classification,C.INVALID_COMPONENT);
assert.ok(branchResult.diagnostics.some(d=>d.code==='BRANCHING_COMPONENT'));

const coincident = baseSketch({
  points:{ a:point('a',0,0), b1:point('b1',1,0), b2:point('b2',1,0), c:point('c',2,0) },
  lines:{ one:{lineId:'one',startPointId:'a',endPointId:'b1'}, two:{lineId:'two',startPointId:'b2',endPointId:'c'} }
});
assert.equal(deriveSketchPathGraph(coincident).components.length,2,'coordinate coincidence with different pointId must not connect components');

const reordered = structuredClone(mixed);
reordered.data.points = Object.fromEntries(Object.entries(reordered.data.points).reverse());
reordered.data.lines = Object.fromEntries(Object.entries(reordered.data.lines).reverse());
const signature = result => result.components.map(component => ({ classification:component.classification, componentKey:component.componentKey, startPointId:component.startPointId, endPointId:component.endPointId, curves:component.curves.map(curve=>`${curve.kind}:${curve.elementId}:${curve.startPointId}->${curve.endPointId}`) }));
assert.deepEqual(signature(deriveSketchPathGraph(reordered)), signature(mixedResult));

const source=fs.readFileSync(new URL('../src/model/sketch-path-graph-derivation.js',import.meta.url),'utf8');
assert.match(source,/deriveSketchCurves/);
assert.match(source,/reverseDerivedCurve/);
assert.doesNotMatch(source,/deriveClosedSketchProfiles|getSingleExtrudableProfile|createExtrudeFromSketch|StableReference|signedArea|winding|hole|nest/i);
const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert.match(main,/const BUILD_ID = 'WD-21D\.2'/);
assert.match(main,/document\.title = `CyberMotion 3D – \$\{BUILD_ID\}`/);
assert.match(main,/buildLabel\.textContent = BUILD_ID/);

console.log('WD-21D.2 Deterministic Contour & Open Path Graph Derivation: PASS');
