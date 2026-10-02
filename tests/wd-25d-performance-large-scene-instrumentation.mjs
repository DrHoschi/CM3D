import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createLargeSceneFixture } from './fixtures/wd-25d-large-scene-fixture.mjs';

const performanceSource=fs.readFileSync('src/runtime-three/performance-instrumentation.js','utf8');
const diagnosticsSource=fs.readFileSync('src/ui/inspector-diagnostics.js','utf8');
const fixture=createLargeSceneFixture();

assert.equal(fixture.expectedObjectCount,1020,'fixture object count must be deterministic');
assert.equal(Object.keys(fixture.scene.objects).length,fixture.expectedObjectCount);
assert.equal(fixture.scene.rootObjectIds.length,20);
assert.match(performanceSource,/renderer\?\.info\?\.render/,'renderer.info.render must remain the renderer metric source');
assert.match(performanceSource,/requestAnimationFrame/,'frame timing must be sampled as derived runtime state');
assert.match(performanceSource,/drawCalls/);
assert.match(performanceSource,/triangles/);
assert.match(performanceSource,/objectCount/);
assert.match(diagnosticsSource,/Performance/,'diagnostics must expose performance visibly');
assert.match(diagnosticsSource,/installPerformanceInstrumentation\(runtime\)/,'diagnostics must install the runtime instrumentation once');
assert.doesNotMatch(performanceSource,/localStorage|saveProject|pushHistory|undoStack|redoStack/,'performance instrumentation must not persist or create history');
assert.doesNotMatch(diagnosticsSource,/F089|large-world|threshold|optimization/i,'WD-25D must not evaluate F089 or optimize');
console.log('WD-25D focused regression PASS');
