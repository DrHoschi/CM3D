import assert from 'node:assert/strict';
import fs from 'node:fs';

const kernel=fs.readFileSync(new URL('../src/runtime-three/bevel-fillet-kernel.js',import.meta.url),'utf8');
const application=fs.readFileSync(new URL('../src/application/bevel-fillet.js',import.meta.url),'utf8');
const runtime=fs.readFileSync(new URL('../src/runtime-three/bevel-fillet.js',import.meta.url),'utf8');

assert.match(application,/edgeRefs:structuredClone\(edgeRefs\)/,'Application must persist the complete edgeRefs array.');
assert.match(application,/object\.data\.edgeRefs\.map\(ref=>resolveStableReference\(store,ref\)\)/,'Recompute must resolve every stable EDGE reference.');
assert.match(runtime,/filletGeometryByStableEdges\(sourceGeometry,refs,amount\)/,'Runtime must forward the complete stable EDGE set once.');
assert.doesNotMatch(kernel,/supports exactly one stable EDGE per fillet feature/,'F102 must not retain the single-edge foundation restriction.');
assert.match(kernel,/deterministicSuccessorRefs/,'F102 must track every selected edge deterministically between segment stages.');
assert.match(kernel,/selected\.length!==refs\.length/,'Every requested EDGE must have exactly one selected predecessor.');
assert.match(kernel,/Fillet successor EDGE is ambiguous/,'Ambiguous successor recognition must stop instead of silently rebinding.');
assert.match(kernel,/remaining\.delete\(chosen\.edge\)/,'One generated successor ridge may be consumed by only one selected predecessor.');
assert.match(kernel,/nextRefs\.push\(\{\.\.\.sourceRef,subTargetId:chosen\.id\}\)/,'All stable EDGE refs must advance to their deterministic successor identities.');
assert.match(kernel,/FILLET_SEGMENTS=6/,'The existing constant segmented fillet contract must remain unchanged.');
assert.doesNotMatch(kernel,/clamp|multi.?radius|tangency.?propagation|face.?fillet/i,'WD-24G must not introduce excluded fillet behavior.');
console.log('WD-24G F102 Multi-Edge Fillet Completion: PASS');
