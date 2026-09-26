import assert from 'node:assert/strict';
import { createProject, createSketchObject, migrateAndValidateProject, validateProject } from '../src/model/project.js';
import { deriveSketchProfilesAndPaths } from '../src/model/sketch-profile-path-derivation.js';
import {
  createProfileIdentity,
  createPathIdentity,
  recognizeProfileIdentity,
  recognizePathIdentity
} from '../src/model/sketch-profile-path-identity.js';
import {
  ReferenceTargetKind,
  ReferenceState,
  createStableReference,
  sameStableReference,
  resolveStableReference
} from '../src/application/stable-reference.js';

function sketch(id = 'sketch_e') {
  return {
    objectId:id, type:'sketch', name:'WD-21E', parentId:null, order:0,
    transform:{position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0,w:1},scale:{x:1,y:1,z:1},pivot:{x:0,y:0,z:0}},
    data:{plane:'localXY',points:{},lines:{},circles:{},arcs:{},splines:{},profileIdentities:{},pathIdentities:{}},
    materialIds:[], flags:{visible:true,locked:false}, extensions:{}
  };
}

function point(s, id, x, y) { s.data.points[id] = { pointId:id, x, y }; }
function line(s, id, a, b) { s.data.lines[id] = { lineId:id, startPointId:a, endPointId:b }; }

function addSquare(s, prefix, x0, y0, size) {
  point(s, `${prefix}p0`, x0, y0); point(s, `${prefix}p1`, x0 + size, y0);
  point(s, `${prefix}p2`, x0 + size, y0 + size); point(s, `${prefix}p3`, x0, y0 + size);
  line(s, `${prefix}l0`, `${prefix}p0`, `${prefix}p1`);
  line(s, `${prefix}l1`, `${prefix}p1`, `${prefix}p2`);
  line(s, `${prefix}l2`, `${prefix}p2`, `${prefix}p3`);
  line(s, `${prefix}l3`, `${prefix}p3`, `${prefix}p0`);
}

function storeFor(s) {
  return { getObject(id) { return id === s.objectId ? s : null; } };
}

// New sketches own empty persistent identity maps; loaded 0.2.0 sketches are normalized without a schema bump.
const project = createProject('WD-21E');
const created = createSketchObject(project, 'Identity sketch');
assert.deepEqual(created.data.profileIdentities, {});
assert.deepEqual(created.data.pathIdentities, {});
const legacyCurrent = structuredClone(project);
legacyCurrent.scene.objects[created.objectId] = created;
legacyCurrent.scene.rootObjectIds.push(created.objectId);
delete legacyCurrent.scene.objects[created.objectId].data.profileIdentities;
delete legacyCurrent.scene.objects[created.objectId].data.pathIdentities;
const normalized = migrateAndValidateProject(legacyCurrent);
assert.equal(normalized.migrated, false);
assert.deepEqual(normalized.project.scene.objects[created.objectId].data.profileIdentities, {});
assert.deepEqual(normalized.project.scene.objects[created.objectId].data.pathIdentities, {});

// Profile identity: outer + holes, canonical persistent source IDs only.
const profileSketch = sketch('sketch_profile');
addSquare(profileSketch, 'o', 0, 0, 10);
addSquare(profileSketch, 'h', 2, 2, 2);
const profileDerived = deriveSketchProfilesAndPaths(profileSketch);
assert.equal(profileDerived.profiles.length, 1);
assert.equal(profileDerived.profiles[0].holes.length, 1);
const profileIdentity = createProfileIdentity(profileDerived.profiles[0], 'profile_fixed');
assert.equal(profileIdentity.profileId, 'profile_fixed');
assert.deepEqual(profileIdentity.source.outerElementIds, ['ol0','ol1','ol2','ol3']);
assert.deepEqual(profileIdentity.source.holeElementIdSets, [['hl0','hl1','hl2','hl3']]);
assert.equal('points' in profileIdentity, false);
profileSketch.data.profileIdentities[profileIdentity.profileId] = structuredClone(profileIdentity);
assert.equal(recognizeProfileIdentity(profileSketch, profileIdentity).state, ReferenceState.RESOLVED);

// Geometry moves while stable source IDs/topology remain: identity survives.
profileSketch.data.points.op0.x = -1;
profileSketch.data.points.op3.x = -1;
assert.equal(recognizeProfileIdentity(profileSketch, profileIdentity).state, ReferenceState.RESOLVED);

// A required persistent source identity disappearing is MISSING.
const missingProfileSketch = structuredClone(profileSketch);
delete missingProfileSketch.data.lines.ol0;
assert.equal(recognizeProfileIdentity(missingProfileSketch, profileIdentity).state, ReferenceState.MISSING);

// Same source elements still exist but no longer form a profile: INVALID.
const invalidProfileSketch = structuredClone(profileSketch);
point(invalidProfileSketch, 'break', 20, 20);
invalidProfileSketch.data.lines.ol3.endPointId = 'break';
assert.equal(recognizeProfileIdentity(invalidProfileSketch, profileIdentity).state, ReferenceState.INVALID);

// Multiple profiles stay independently addressable.
const multi = sketch('sketch_multi');
addSquare(multi, 'a', 0, 0, 2);
addSquare(multi, 'b', 5, 0, 2);
const multiDerived = deriveSketchProfilesAndPaths(multi);
assert.equal(multiDerived.profiles.length, 2);
const pA = createProfileIdentity(multiDerived.profiles[0], 'profile_a');
const pB = createProfileIdentity(multiDerived.profiles[1], 'profile_b');
assert.notDeepEqual(pA.source, pB.source);
assert.equal(recognizeProfileIdentity(multi, pA).state, ReferenceState.RESOLVED);
assert.equal(recognizeProfileIdentity(multi, pB).state, ReferenceState.RESOLVED);

// Open path identity survives geometry movement and does not use derived componentKey as persistent identity.
const pathSketch = sketch('sketch_path');
for (const [id,x,y] of [['p0',0,0],['p1',1,0],['p2',2,0],['p3',3,0],['p4',4,0]]) point(pathSketch,id,x,y);
line(pathSketch,'l0','p0','p1'); line(pathSketch,'l1','p1','p2'); line(pathSketch,'l2','p2','p3'); line(pathSketch,'l3','p3','p4');
const pathDerived = deriveSketchProfilesAndPaths(pathSketch);
assert.equal(pathDerived.openPaths.length, 1);
const pathIdentity = createPathIdentity(pathDerived.openPaths[0], 'path_fixed');
assert.deepEqual(pathIdentity.source.elementIds, ['l0','l1','l2','l3']);
assert.equal('componentKey' in pathIdentity, false);
pathSketch.data.pathIdentities[pathIdentity.pathId] = structuredClone(pathIdentity);
pathSketch.data.points.p2.y = 1;
assert.equal(recognizePathIdentity(pathSketch, pathIdentity).state, ReferenceState.RESOLVED);

// Split into multiple plausible surviving components without deleting source IDs: UNRESOLVED.
const splitPath = structuredClone(pathSketch);
point(splitPath,'q0',10,0); point(splitPath,'q1',11,0);
splitPath.data.lines.l1.startPointId = 'q0';
splitPath.data.lines.l1.endPointId = 'q1';
assert.equal(recognizePathIdentity(splitPath, pathIdentity).state, ReferenceState.UNRESOLVED);

// One non-path topology using the same surviving IDs: INVALID.
const invalidPath = structuredClone(pathSketch);
invalidPath.data.lines.l3.endPointId = 'p0';
assert.equal(recognizePathIdentity(invalidPath, pathIdentity).state, ReferenceState.INVALID);
const missingPath = structuredClone(pathSketch);
delete missingPath.data.lines.l2;
assert.equal(recognizePathIdentity(missingPath, pathIdentity).state, ReferenceState.MISSING);

// StableReference PROFILE/PATH bridge preserves ownerId/targetId and existing equality semantics.
const profileRef = createStableReference(ReferenceTargetKind.PROFILE, profileSketch.objectId, profileIdentity.profileId);
const pathRef = createStableReference(ReferenceTargetKind.PATH, pathSketch.objectId, pathIdentity.pathId);
assert.equal(sameStableReference(profileRef, createStableReference(ReferenceTargetKind.PROFILE, profileSketch.objectId, profileIdentity.profileId)), true);
assert.equal(resolveStableReference(storeFor(profileSketch), profileRef).state, ReferenceState.RESOLVED);
assert.equal(resolveStableReference(storeFor(pathSketch), pathRef).state, ReferenceState.RESOLVED);
const missingIdentityRef = createStableReference(ReferenceTargetKind.PATH, pathSketch.objectId, 'path_missing');
const missingIdentityResolution = resolveStableReference(storeFor(pathSketch), missingIdentityRef);
assert.equal(missingIdentityResolution.state, ReferenceState.MISSING);
assert.equal(missingIdentityResolution.reference.ownerId, pathSketch.objectId);
assert.equal(missingIdentityResolution.reference.targetId, 'path_missing');

// Structural validation rejects non-canonical/malformed identity records.
const invalidProject = createProject('invalid identity');
const invalidSketch = createSketchObject(invalidProject, 'invalid');
invalidProject.scene.objects[invalidSketch.objectId] = invalidSketch;
invalidProject.scene.rootObjectIds.push(invalidSketch.objectId);
invalidSketch.data.pathIdentities.bad = { pathId:'other', source:{ elementIds:['z','a'] } };
const validation = validateProject(invalidProject);
assert.equal(validation.valid, false);
assert.equal(validation.errors.some(error => error.includes('pathId-Schlüssel') || error.includes('elementIds')), true);

console.log('WD-21E profile/path identity and StableReference foundation: PASS');
