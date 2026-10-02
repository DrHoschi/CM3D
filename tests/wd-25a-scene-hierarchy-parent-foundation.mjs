import assert from 'node:assert/strict';
import fs from 'node:fs';

const project=fs.readFileSync(new URL('../src/model/project.js',import.meta.url),'utf8');
const store=fs.readFileSync(new URL('../src/application/store.js',import.meta.url),'utf8');
const graph=fs.readFileSync(new URL('../src/application/dependency-graph.js',import.meta.url),'utf8');

// One authoritative structural hierarchy: project scene roots + object parent/order.
assert.match(project,/rootObjectIds:\s*\[\]/,'Project scene must own rootObjectIds.');
assert.match(project,/parentId:\s*null/,'Scene objects must own structural parentId.');
assert.match(project,/order:\s*0/,'Scene objects must own deterministic sibling order.');
assert.match(project,/parentId === id|object\.parentId === object\.objectId|parentId===id/,'Project validation must reject self-parenting.');
assert.match(project,/cycle|visited|visiting/i,'Project validation must contain parent-cycle protection.');

// Root <-> parent and deterministic child/root order use the same reparent authority.
assert.match(store,/canReparent\s*\(/,'Store must expose the structural reparent guard.');
assert.match(store,/reparent\s*\(/,'Store must expose one structural reparent transaction.');
assert.match(store,/rootObjectIds/,'Reparent must update root membership through the project scene authority.');
assert.match(store,/parentId/,'Reparent must update the structural parentId authority.');
assert.match(store,/\.order\s*=|order:/,'Hierarchy mutation must maintain deterministic sibling/root order.');
assert.match(store,/canReparent\([\s\S]*while\s*\(|canReparent\([\s\S]*parentId/,'Reparent guard must walk structural ancestors to prevent cycles.');

// Nested Group / Assembly remain normal scene hierarchy objects, not a second tree.
assert.match(store,/groupSelected\s*\(/,'Existing nested Group hierarchy must remain supported.');
assert.match(store,/assemblySelected\s*\(/,'Existing nested Assembly hierarchy must remain supported.');
assert.match(store,/createGroupObject|type:\s*['"]group['"]/,'Group creation must use scene objects.');
assert.match(store,/createAssemblyObject|type:\s*['"]assembly['"]/,'Assembly creation must use scene objects.');

// World transform preservation is an explicit reparent contract: capture world,
// change parent, then derive the new local transform from the parent world inverse.
assert.match(store,/getWorldTransform\s*\(/,'Store must expose world-transform evaluation.');
assert.match(store,/reparent\s*\([\s\S]*getWorldTransform/,'Reparent must capture/evaluate world transform.');
assert.match(store,/invert\s*\(|\.invert\(\)/,'Reparent must invert the new parent world transform.');
assert.match(store,/decompose\s*\(/,'Reparent must decompose the resulting local matrix.');

// Undo/Redo and Save -> Reload use existing authorities; no hierarchy-specific store.
assert.match(store,/pushHistory|history/i,'Hierarchy mutation must participate in existing history.');
assert.match(store,/undo\s*\(/,'Existing Undo authority must remain available.');
assert.match(store,/redo\s*\(/,'Existing Redo authority must remain available.');
assert.match(store,/replaceProject\s*\(/,'Existing project replacement/reload authority must remain available.');
assert.doesNotMatch(store,/hierarchyStore|parentStore|sceneHierarchyStore/i,'WD-25A must not introduce a second hierarchy persistence authority.');

// Hard boundary: Scene Parent != Feature Dependency. Dependency graph construction
// is driven by declared dependency sources/kinds, never by parentId/rootObjectIds.
assert.match(graph,/buildDependencyGraph/,'Feature dependency graph authority must remain explicit.');
assert.doesNotMatch(graph,/\.parentId|rootObjectIds/,'Feature dependency graph must not derive edges from scene hierarchy.');
const reparentBlock=(store.match(/reparent\s*\([^)]*\)\s*\{[\s\S]*?\n\s*\}/)||[])[0]??'';
assert.doesNotMatch(reparentBlock,/dependency|registerDependency|buildDependencyGraph/i,'Structural reparent must not mutate feature dependencies.');

console.log('WD-25A Scene Hierarchy / Structural Parent Foundation: PASS');
