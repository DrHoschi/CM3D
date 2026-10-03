import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/ui/object-tree-reparent-dnd.js', import.meta.url), 'utf8');
const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

assert.match(source, /new Set\(\['group', 'assembly'\]\)/, 'Only group and assembly may be structural drop parents.');
assert.match(source, /store\.canReparent\(sourceId, parentId\)/, 'Drop validity must delegate to canReparent().');
assert.match(source, /store\.reparent\(draggedObjectId, object\.objectId\)/, 'Container drop must delegate to reparent().');
assert.match(source, /store\.reparent\(draggedObjectId, null\)/, 'Root drop must delegate to reparent(source, null).');
assert.match(source, /if \(!canDrop\(draggedObjectId, object\.objectId\)\) return;/, 'Invalid or cyclic container drops must stop before reparent().');
assert.match(source, /if \(!canDrop\(draggedObjectId, null\)\) return;/, 'Invalid root drops must stop before reparent().');
assert.match(source, /row\.draggable = true/, 'Normal object rows must be draggable.');
assert.match(source, /event\.target\?\.closest\?\.\('\.tree-item'\)/, 'Root drop must be limited to the tree empty/root area.');
assert.doesNotMatch(source, /\.parentId\s*=|rootObjectIds\s*\.(?:push|splice)|\.order\s*=|\.transform\s*=/, 'DnD UI must not mutate hierarchy, order or transforms directly.');
assert.match(main, /import \{ installObjectTreeReparentDnD \} from '\.\/ui\/object-tree-reparent-dnd\.js';/, 'Main must import the F112 adapter.');
assert.match(main, /installObjectTreeReparentDnD\(store,appUI\)/, 'Main must install the F112 adapter.');

console.log('WD-29C F112 Object Tree Drag-and-Drop Reparenting: PASS');
