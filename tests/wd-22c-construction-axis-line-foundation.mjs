import assert from 'node:assert/strict';
import {
  GlobalConstructionAxisDefinition,
  GlobalConstructionAxisId,
  SYSTEM_CONSTRUCTION_OWNER_ID
} from '../src/model/construction-reference.js';
import {
  createStableReference,
  ReferenceState,
  ReferenceTargetKind,
  resolveStableReference
} from '../src/application/stable-reference.js';
import {
  createConstructionAxisObject,
  createProject,
  createSketchLine,
  createSketchObject,
  createSketchPoint,
  validateProject
} from '../src/model/project.js';
import { deriveSketchCurves } from '../src/model/sketch-curve-derivation.js';
import { deriveSketchProfilesAndPaths } from '../src/model/sketch-profile-path-derivation.js';
import { getSketchElement, isConstructionSketchLine, validateSketchTopology } from '../src/model/sketch-topology.js';
import { parseProjectFileText, serializeProjectFile } from '../src/persistence/project-file.js';

const storeFor = project => ({ getObject:id => project.scene.objects[id] ?? null });
const insert = (project, object) => { project.scene.objects[object.objectId]=object; project.scene.rootObjectIds.push(object.objectId); };

const project=createProject('WD-22C');
const store=storeFor(project);
for (const id of Object.values(GlobalConstructionAxisId)) {
  const ref=createStableReference(ReferenceTargetKind.CONSTRUCTION_AXIS,SYSTEM_CONSTRUCTION_OWNER_ID,id);
  assert.equal(resolveStableReference(store,ref).state,ReferenceState.RESOLVED);
  assert.deepEqual(GlobalConstructionAxisDefinition[id].origin,{x:0,y:0,z:0});
}
assert.deepEqual(GlobalConstructionAxisDefinition.GLOBAL_X.direction,{x:1,y:0,z:0});
assert.deepEqual(GlobalConstructionAxisDefinition.GLOBAL_Y.direction,{x:0,y:1,z:0});
assert.deepEqual(GlobalConstructionAxisDefinition.GLOBAL_Z.direction,{x:0,y:0,z:1});
const unknownGlobal=createStableReference(ReferenceTargetKind.CONSTRUCTION_AXIS,SYSTEM_CONSTRUCTION_OWNER_ID,'GLOBAL_UNKNOWN');
assert.equal(resolveStableReference(store,unknownGlobal).state,ReferenceState.MISSING);

const axis=createConstructionAxisObject(project,'Axis');
insert(project,axis);
const axisRef=createStableReference(ReferenceTargetKind.CONSTRUCTION_AXIS,axis.objectId,axis.data.constructionAxisId);
assert.equal(resolveStableReference(store,axisRef).state,ReferenceState.RESOLVED);
axis.data.definition.direction={x:0,y:0,z:0};
assert.equal(resolveStableReference(store,axisRef).state,ReferenceState.INVALID);
axis.data.definition.direction={x:0,y:0,z:1};
const missingAxisRef=createStableReference(ReferenceTargetKind.CONSTRUCTION_AXIS,'obj_missing','axis_missing');
assert.equal(resolveStableReference(store,missingAxisRef).state,ReferenceState.MISSING);

const sketch=createSketchObject(project,'Sketch');
insert(project,sketch);
const p1=createSketchPoint(0,0),p2=createSketchPoint(10,0),p3=createSketchPoint(10,10),p4=createSketchPoint(0,10);
for(const p of [p1,p2,p3,p4]) sketch.data.points[p.pointId]=p;
const boundary=[createSketchLine(p1.pointId,p2.pointId),createSketchLine(p2.pointId,p3.pointId),createSketchLine(p3.pointId,p4.pointId),createSketchLine(p4.pointId,p1.pointId)];
for(const line of boundary) sketch.data.lines[line.lineId]=line;
const before=deriveSketchProfilesAndPaths(sketch);
assert.equal(before.profiles.length,1);

const c1=createSketchPoint(0,5),c2=createSketchPoint(10,5);
sketch.data.points[c1.pointId]=c1; sketch.data.points[c2.pointId]=c2;
const construction=createSketchLine(c1.pointId,c2.pointId,{construction:true});
sketch.data.lines[construction.lineId]=construction;
assert.equal(isConstructionSketchLine(construction),true);
assert.equal(getSketchElement(sketch,construction.lineId)?.element,construction);
assert.equal(validateSketchTopology(sketch).valid,true);
assert.equal(deriveSketchCurves(sketch).curves.some(curve=>curve.elementId===construction.lineId),false);
const after=deriveSketchProfilesAndPaths(sketch);
assert.equal(after.profiles.length,1);
assert.deepEqual(after.profiles.map(p=>p.profileKey),before.profiles.map(p=>p.profileKey));
assert.deepEqual(after.openPaths,before.openPaths);

const normal=createSketchLine(c1.pointId,c2.pointId);
assert.equal(normal.construction,undefined);
const invalid=structuredClone(sketch);
invalid.data.lines[construction.lineId].construction='yes';
assert.equal(validateSketchTopology(invalid).valid,false);

assert.equal(validateProject(project).valid,true);
const reloaded=parseProjectFileText(serializeProjectFile(project));
const loadedLine=reloaded.scene.objects[sketch.objectId].data.lines[construction.lineId];
assert.equal(loadedLine.lineId,construction.lineId);
assert.equal(loadedLine.construction,true);
assert.equal(reloaded.schemaVersion,'0.2.0');

console.log('WD-22C Construction Axis / Line Reference Foundation regression: PASS');
