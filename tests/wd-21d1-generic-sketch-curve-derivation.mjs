import assert from 'node:assert/strict';
import fs from 'node:fs';
import { deriveSketchCurves, reverseDerivedCurve, CURVE_DERIVATION_SEGMENTS } from '../src/model/sketch-curve-derivation.js';

const sketch = {
  objectId: 'sketch:d1',
  type: 'sketch',
  data: {
    plane: 'localXY',
    points: {
      'point:z': { pointId: 'point:z', x: 0, y: 0 },
      'point:a': { pointId: 'point:a', x: 2, y: 0 },
      'point:coincident-1': { pointId: 'point:coincident-1', x: 5, y: 5 },
      'point:coincident-2': { pointId: 'point:coincident-2', x: 5, y: 5 },
      'point:arc-start': { pointId: 'point:arc-start', x: 0, y: 3 },
      'point:arc-end': { pointId: 'point:arc-end', x: 2, y: 3 },
      'point:spline-start': { pointId: 'point:spline-start', x: 0, y: 6 },
      'point:spline-end': { pointId: 'point:spline-end', x: 3, y: 6 }
    },
    lines: {
      'line:z': { lineId: 'line:z', startPointId: 'point:z', endPointId: 'point:a' },
      'line:a': { lineId: 'line:a', startPointId: 'point:coincident-1', endPointId: 'point:coincident-2' }
    },
    circles: {
      'circle:b': { circleId: 'circle:b', center: { x: 8, y: 2 }, radius: 1 }
    },
    arcs: {
      'arc:a': { arcId: 'arc:a', startPointId: 'point:arc-start', endPointId: 'point:arc-end', control: { x: 1, y: 4 } }
    },
    splines: {
      'spline:a': { splineId: 'spline:a', startPointId: 'point:spline-start', endPointId: 'point:spline-end', controls: [{ controlId: 'control:1', x: 1, y: 8 }, { controlId: 'control:2', x: 2, y: 8 }] }
    }
  }
};

const before = JSON.stringify(sketch);
const first = deriveSketchCurves(sketch);
const second = deriveSketchCurves(sketch);
assert.equal(first.diagnostics.length, 0);
assert.equal(JSON.stringify(sketch), before, 'D.1 must not mutate persistent sketch data');
assert.equal(CURVE_DERIVATION_SEGMENTS, 64);

assert.deepEqual(first.curves.map(curve => `${curve.kind}:${curve.elementId}`), [
  'line:line:a', 'line:line:z', 'circle:circle:b', 'arc:arc:a', 'spline:spline:a'
], 'registry traversal plus stable element ID ordering must be deterministic');
assert.deepEqual(first.curves.map(curve => `${curve.kind}:${curve.elementId}`), second.curves.map(curve => `${curve.kind}:${curve.elementId}`));

const line = first.curves.find(curve => curve.elementId === 'line:z');
assert.equal(line.closed, false);
assert.equal(line.analytic, false);
assert.equal(line.startPointId, 'point:z');
assert.equal(line.endPointId, 'point:a');
assert.deepEqual(line.tessellation, [{ x: 0, y: 0 }, { x: 2, y: 0 }]);
assert.equal(line.source.lineId, 'line:z');

const coincident = first.curves.find(curve => curve.elementId === 'line:a');
assert.equal(coincident.startPointId, 'point:coincident-1');
assert.equal(coincident.endPointId, 'point:coincident-2');
assert.notEqual(coincident.startPointId, coincident.endPointId, 'coordinate equality must not create topology identity');

const circle = first.curves.find(curve => curve.kind === 'circle');
assert.equal(circle.closed, true);
assert.equal(circle.analytic, true);
assert.equal(circle.startPointId, null);
assert.equal(circle.endPointId, null);
assert.equal(circle.tessellation.length, 65);
assert.equal(circle.source.circleId, 'circle:b');
assert.ok(!('pointId' in circle.source), 'Circle must receive no synthetic topology point');

const arc = first.curves.find(curve => curve.kind === 'arc');
assert.equal(arc.closed, false);
assert.equal(arc.analytic, true);
assert.equal(arc.startPointId, 'point:arc-start');
assert.equal(arc.endPointId, 'point:arc-end');
assert.equal(arc.tessellation.length, 65);
assert.deepEqual(arc.tessellation[0], { x: 0, y: 3 });
assert.ok(Math.abs(arc.tessellation.at(-1).x - 2) < 1e-12 && Math.abs(arc.tessellation.at(-1).y - 3) < 1e-12);

const spline = first.curves.find(curve => curve.kind === 'spline');
assert.equal(spline.closed, false);
assert.equal(spline.analytic, true);
assert.equal(spline.startPointId, 'point:spline-start');
assert.equal(spline.endPointId, 'point:spline-end');
assert.equal(spline.tessellation.length, 65);
assert.deepEqual(spline.source.controls.map(control => control.controlId), ['control:1', 'control:2']);

const reversed = reverseDerivedCurve(spline);
assert.equal(reversed.startPointId, spline.endPointId);
assert.equal(reversed.endPointId, spline.startPointId);
assert.deepEqual(reversed.tessellation[0], spline.tessellation.at(-1));
assert.deepEqual(reversed.traversal.forward, { startPointId: spline.endPointId, endPointId: spline.startPointId });
assert.equal(reverseDerivedCurve(circle), circle, 'closed Circle orientation must not invent endpoints');

assert.ok(Object.isFrozen(first));
assert.ok(Object.isFrozen(first.curves));
assert.ok(Object.isFrozen(spline.source.controls), 'derived source snapshot must remain read-only');

const source = fs.readFileSync(new URL('../src/model/sketch-curve-derivation.js', import.meta.url), 'utf8');
assert.match(source, /SketchElementRegistry/);
assert.match(source, /buildArcRenderPoints/);
assert.match(source, /buildSplineRenderPoints/);
assert.doesNotMatch(source, /createExtrudeFromSketch|StableReference|deriveClosedSketchProfiles|CLOSED_CONTOUR|OPEN_PATH/);

const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.match(main, /const BUILD_ID = 'WD-21D\.[1-9](?:-R\d+)?'/);
assert.match(main, /document\.title = `CyberMotion 3D – \$\{BUILD_ID\}`/);
assert.match(main, /buildLabel\.textContent = BUILD_ID/);

console.log('WD-21D.1 Generic Sketch Curve/Edge Derivation Contract: PASS');