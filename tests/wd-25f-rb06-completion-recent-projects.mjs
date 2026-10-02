import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createLargeSceneFixture } from './fixtures/wd-25d-large-scene-fixture.mjs';

const recent = fs.readFileSync('src/ui/recent-projects.js', 'utf8');
const storage = fs.readFileSync('src/persistence/storage.js', 'utf8');
const main = fs.readFileSync('src/main.js', 'utf8');
const app = fs.readFileSync('src/ui/app.js', 'utf8');
const tree = fs.readFileSync('src/ui/object-tree-scalability.js', 'utf8');
const hierarchyTest = fs.readFileSync('tests/wd-25a-scene-hierarchy-parent-foundation.mjs', 'utf8');

// F003: Recent Projects is a projection over the existing storage index and quick reopen
// delegates to the existing load authority, which migrates + validates before replacement.
assert.match(recent, /listProjects\(\)\.slice\(0, MAX_RECENT\)/);
assert.match(recent, /loadProject\(projectId\)/);
assert.match(recent, /store\.replaceProject\(project\)/);
assert.match(storage, /migrateAndValidateProject\(candidate\)\.project/);
assert.match(storage, /modifiedAt/);
assert.match(main, /installRecentProjects\(store,appUI\)/);
assert.doesNotMatch(recent, /localStorage\.(?:setItem|removeItem)/, 'Recent Projects must not create a second persistence authority');
assert.doesNotMatch(recent, /selectedObjectIds\s*=/, 'Recent Projects must not create a second selection authority');
assert.doesNotMatch(recent, /dependency|dependsOn/i, 'Recent Projects must not alter feature dependency semantics');

// RB-06 combined contract evidence: existing selection authority supports additive object
// selection, tree scalability/search remains projection-only, hierarchy Save->Reload remains
// covered, and the deterministic large-scene fixture remains available.
assert.match(app, /store\.select\(o\.objectId,true,true\)/, 'Object tree must retain additive multi-selection');
assert.match(tree, /deriveSearchVisibleIds/);
assert.match(tree, /collapsed/);
assert.doesNotMatch(tree, /selectedObjectIds\s*=(?!=)/, 'Tree/search must not create a second selection authority');
assert.match(hierarchyTest, /parentId/);
assert.match(hierarchyTest, /rootObjectIds/);

const largeScene = createLargeSceneFixture();
assert.equal(largeScene.expectedObjectCount, 1020, 'Deterministic F086 large-scene fixture must retain 1,020 objects');
assert.equal(Object.keys(largeScene.scene.objects).length, largeScene.expectedObjectCount, 'Large-scene expected count must match generated scene semantics');
assert.equal(largeScene.scene.rootObjectIds.length, 20, 'Large-scene fixture must retain its 20 deterministic root groups');

console.log('WD-25F RB-06 completion / Recent Projects focused regression PASS');
