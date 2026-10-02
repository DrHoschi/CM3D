import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/ui/object-tree-scalability.js', import.meta.url), 'utf8');

assert.match(source, /let searchQuery = '';/, 'search must remain derived UI state');
assert.match(source, /normalizeSearch\(object\?\.name\)\.includes\(query\)/, 'search must match object names');
assert.match(source, /normalizeSearch\(object\?\.objectId\)\.includes\(query\)/, 'search must match stable object identity');
assert.match(source, /while \(current\)/, 'matching objects must derive their parent chain');
assert.match(source, /visible\.add\(current\.objectId\)/, 'matching parent chains must be part of the visible projection');
assert.match(source, /searchVisibleIds && !searchVisibleIds\.has\(object\.objectId\)/, 'tree rendering must filter only through the derived projection');
assert.match(source, /collapsed\.has\(object\.objectId\) && !searchQuery/, 'search must reveal matching paths without mutating persisted collapse state');
assert.match(source, /store\.selection|revealObject/, 'existing selection/reveal authority must remain in use');
assert.doesNotMatch(source, /\.parentId\s*=(?!=)/, 'search must not mutate scene hierarchy');
assert.doesNotMatch(source, /\.layerId\s*=(?!=)/, 'search must not mutate layer membership');
assert.doesNotMatch(source, /selectedObjectIds\s*=(?!=)/, 'search must not create a second selection authority');
assert.doesNotMatch(source, /dependency|dependsOn/i, 'search must not introduce dependency semantics');
assert.doesNotMatch(source, /localStorage\.setItem\([^\n]*search/i, 'search query must not be persisted');

console.log('WD-25C object-tree search/filter focused regression PASS');
