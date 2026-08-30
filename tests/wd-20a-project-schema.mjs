import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { migrateAndValidateProject, SCHEMA_VERSION } from '../src/model/project.js';
import { parseProjectFileText } from '../src/persistence/project-file.js';
import { parseMergeFileText } from '../src/persistence/partial-project.js';

const fixtureUrl = new URL('../test-assets/wd-20a/v1-project-0.1.0.cm3d.json', import.meta.url);
const raw = await readFile(fixtureUrl, 'utf8');
const v1 = JSON.parse(raw);

const migrated = migrateAndValidateProject(v1);
assert.equal(migrated.migrated, true);
assert.equal(migrated.fromVersion, '0.1.0');
assert.equal(migrated.toVersion, SCHEMA_VERSION);
assert.equal(migrated.project.schemaVersion, '0.2.0');
assert.equal(migrated.project.project.projectId, 'prj_wd20a_v1_regression');
assert.equal(migrated.project.scene.objects.obj_wd20a_box.objectId, 'obj_wd20a_box');
assert.equal(migrated.project.scene.objects.obj_wd20a_box.materialIds[0], 'mat_wd20a_standard');
assert.deepEqual(migrated.project.scene.objects.obj_wd20a_box.transform, v1.scene.objects.obj_wd20a_box.transform);
assert.deepEqual(migrated.project.scene.objects.obj_wd20a_box.data, v1.scene.objects.obj_wd20a_box.data);
assert.equal(migrated.project.scene.objects.obj_wd20a_box.extensions.wd20aMarker, 'preserve-me');
assert.equal(migrated.project.extensions.wd20aProjectMarker, 'preserve-project-data');

const current = migrateAndValidateProject(migrated.project);
assert.equal(current.migrated, false);
assert.equal(current.project.schemaVersion, '0.2.0');

const fileLoaded = parseProjectFileText(raw);
assert.equal(fileLoaded.schemaVersion, '0.2.0');
assert.equal(fileLoaded.project.projectId, 'prj_wd20a_v1_regression');

const mergeLoaded = parseMergeFileText(raw);
assert.equal(mergeLoaded.format, 'CM3D_PARTIAL');
assert.deepEqual(mergeLoaded.roots, ['obj_wd20a_box']);
assert.equal(mergeLoaded.objects.obj_wd20a_box.extensions.wd20aMarker, 'preserve-me');

const unsupported = structuredClone(v1);
unsupported.schemaVersion = '9.9.9';
assert.throws(() => migrateAndValidateProject(unsupported), /Nicht unterstützte schemaVersion: 9\.9\.9/);
assert.throws(() => parseProjectFileText(JSON.stringify(unsupported)), /9\.9\.9/);

const missingVersion = structuredClone(v1);
delete missingVersion.schemaVersion;
assert.throws(() => migrateAndValidateProject(missingVersion), /schemaVersion fehlt/);

const invalidV1 = structuredClone(v1);
delete invalidV1.materials.mat_wd20a_standard;
assert.throws(() => migrateAndValidateProject(invalidV1), /Material mat_wd20a_standard fehlt/);

console.log('WD-20A project schema regression: PASS');
