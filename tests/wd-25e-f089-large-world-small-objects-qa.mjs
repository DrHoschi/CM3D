import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createLargeSceneFixture } from './fixtures/wd-25d-large-scene-fixture.mjs';
import { createLargeWorldSmallObjectsQaMatrix, F089_REPRESENTATIVE_OPERATIONS } from './fixtures/wd-25e-large-world-small-objects-fixture.mjs';

const matrix = createLargeWorldSmallObjectsQaMatrix();
const largeScene = createLargeSceneFixture();
const performanceSource = fs.readFileSync('src/runtime-three/performance-instrumentation.js', 'utf8');

assert.equal(matrix.length, 9, 'F089 matrix must cover three world ranges x three object sizes');
assert.deepEqual([...new Set(matrix.map((entry) => entry.worldCoordinate))], [0, 10_000, 100_000]);
assert.deepEqual([...new Set(matrix.map((entry) => entry.objectSize))], [0.05, 0.01, 1]);
assert.equal(new Set(matrix.map((entry) => entry.id)).size, matrix.length, 'F089 cases must have stable unique ids');

for (const entry of matrix) {
  assert.ok(Number.isFinite(entry.position.x));
  assert.ok(Number.isFinite(entry.position.y));
  assert.ok(Number.isFinite(entry.position.z));
  assert.ok(entry.objectSize > 0);
  assert.equal(entry.size.x, entry.objectSize);
  assert.equal(entry.size.y, entry.objectSize);
  assert.equal(entry.size.z, entry.objectSize);
}

assert.ok(matrix.some((entry) => entry.worldCoordinate === 100_000 && entry.objectSize === 0.01), 'combined F089 stress case must exist');
assert.ok(matrix.some((entry) => entry.worldCoordinate === 0 && entry.objectSize === 1), 'origin/control case must exist');
assert.equal(largeScene.expectedObjectCount, 1020, 'F086 deterministic large-scene basis must remain available');
assert.deepEqual(F089_REPRESENTATIVE_OPERATIONS, [
  'render-visibility',
  'select-pick',
  'focus-camera-navigation',
  'transform',
  'multi-selection',
  'save-reload',
  'undo-redo',
  'f086-snapshot'
]);

assert.match(performanceSource, /requestAnimationFrame/, 'F086 frame instrumentation must remain available to F089 QA');
assert.match(performanceSource, /objectCount/);
assert.match(performanceSource, /pickableCount/);
assert.doesNotMatch(performanceSource, /floatingOrigin|originRebas|instancing|\bLOD\b|culling/i, 'WD-25E must not introduce optimization policy through F086 instrumentation');

console.log('WD-25E F089 focused regression PASS');
