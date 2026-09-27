import assert from 'node:assert/strict';
import { buildDependencyGraph, DependencyNodeState } from '../src/application/dependency-graph.js';
import { createStableReference, ReferenceState, ReferenceTargetKind, resolveStableReference } from '../src/application/stable-reference.js';
import { GlobalWorkPlaneId, SYSTEM_CONSTRUCTION_OWNER_ID } from '../src/model/construction-reference.js';
import { createConstructionAxisObject, createGroupObject, createProject, createWorkPlaneObject, validateProject } from '../src/model/project.js';
import { parseProjectFileText, serializeProjectFile } from '../src/persistence/project-file.js';
import { mergePartialProject, PARTIAL_FORMAT, PARTIAL_SCHEMA_VERSION } from '../src/persistence/partial-project.js';

const project=createProject('WD-22A construction reference foundation');
const plane=createWorkPlaneObject(project,'Plane A');
const axis=createConstructionAxisObject(project,'Axis A');
for(const object of [plane,axis]){
  project.scene.objects[object.objectId]=object;
  project.scene.rootObjectIds.push(object.objectId);
}

const store={
  project,
  selection:{selectedObjectIds:[],activeObjectId:null,hoveredObjectId:null},
  getObject(id){return this.project.scene.objects[id]??null;}
};

const planeRef=createStableReference(ReferenceTargetKind.WORK_PLANE,plane.objectId,plane.data.workPlaneId);
const axisRef=createStableReference(ReferenceTargetKind.CONSTRUCTION_AXIS,axis.objectId,axis.data.constructionAxisId);
assert.equal(resolveStableReference(store,planeRef).state,ReferenceState.RESOLVED);
assert.equal(resolveStableReference(store,axisRef).state,ReferenceState.RESOLVED);

for(const targetId of Object.values(GlobalWorkPlaneId)){
  const globalRef=createStableReference(ReferenceTargetKind.WORK_PLANE,SYSTEM_CONSTRUCTION_OWNER_ID,targetId);
  assert.equal(resolveStableReference(store,globalRef).state,ReferenceState.RESOLVED);
}
const missingGlobal=createStableReference(ReferenceTargetKind.WORK_PLANE,SYSTEM_CONSTRUCTION_OWNER_ID,'GLOBAL_UNKNOWN');
assert.equal(resolveStableReference(store,missingGlobal).state,ReferenceState.MISSING);

// Stable IDs are authoritative: missing and invalid states never select a replacement.
const missingIdentity=createStableReference(ReferenceTargetKind.WORK_PLANE,plane.objectId,'wp_missing');
assert.equal(resolveStableReference(store,missingIdentity).state,ReferenceState.MISSING);
assert.equal(missingIdentity.targetId,'wp_missing');

const savedNormal=plane.data.definition.normal;
plane.data.definition.normal={x:0,y:0,z:0};
const invalidPlane=resolveStableReference(store,planeRef);
assert.equal(invalidPlane.state,ReferenceState.INVALID);
assert.equal(invalidPlane.diagnostics[0].code,'CONSTRUCTION_DEFINITION_INVALID');
assert.equal(planeRef.targetId,plane.data.workPlaneId);
plane.data.definition.normal=savedNormal;

const wrongOwner=createStableReference(ReferenceTargetKind.WORK_PLANE,axis.objectId,axis.data.constructionAxisId);
assert.equal(resolveStableReference(store,wrongOwner).state,ReferenceState.INVALID);

// Persistent construction objects are ordinary dependency sources; immutable global planes are not graph nodes.
const consumer=createGroupObject(project,'Synthetic construction consumer');
project.scene.objects[consumer.objectId]=consumer;
project.scene.rootObjectIds.push(consumer.objectId);
let graph=buildDependencyGraph(store,[{dependentObjectId:consumer.objectId,reference:planeRef,kind:'WORK_PLANE_CONSUMER'}]);
assert.equal(graph.dependenciesOf(consumer.objectId)[0].sourceObjectId,plane.objectId);
assert.equal(graph.dependenciesOf(consumer.objectId)[0].state,ReferenceState.RESOLVED);
assert.equal(graph.nodeState(consumer.objectId).state,DependencyNodeState.READY);

const globalXY=createStableReference(ReferenceTargetKind.WORK_PLANE,SYSTEM_CONSTRUCTION_OWNER_ID,GlobalWorkPlaneId.XY);
graph=buildDependencyGraph(store,[{dependentObjectId:consumer.objectId,reference:globalXY,kind:'WORK_PLANE_CONSUMER'}]);
assert.deepEqual(graph.dependenciesOf(consumer.objectId),[]);
assert.equal(graph.nodeState(consumer.objectId).state,DependencyNodeState.READY);

// Project validation and productive file roundtrip preserve the domain identities without a schema bump.
assert.equal(validateProject(project).valid,true);
const reloaded=parseProjectFileText(serializeProjectFile(project));
assert.equal(reloaded.schemaVersion,'0.2.0');
assert.equal(reloaded.scene.objects[plane.objectId].data.workPlaneId,plane.data.workPlaneId);
assert.deepEqual(reloaded.scene.objects[plane.objectId].data.definition,plane.data.definition);
assert.equal(reloaded.scene.objects[axis.objectId].data.constructionAxisId,axis.data.constructionAxisId);

const invalidProject=structuredClone(project);
invalidProject.scene.objects[axis.objectId].data.definition.direction={x:0,y:0,z:0};
const invalidValidation=validateProject(invalidProject);
assert.equal(invalidValidation.valid,false);
assert.match(invalidValidation.errors.join('\n'),/direction muss ein endlicher Nicht-Null-Vektor sein/);

// Partial-project import remaps Scene Object identity but keeps the construction target identity stable.
const partial={
  format:PARTIAL_FORMAT,
  schemaVersion:PARTIAL_SCHEMA_VERSION,
  createdAt:new Date().toISOString(),
  sourceProject:{projectId:project.project.projectId,name:project.project.name},
  roots:[plane.objectId],
  objects:{[plane.objectId]:structuredClone(plane)},
  materials:{},
  assets:[],
  extensions:{}
};
const targetProject=createProject('Partial target');
const targetStore={
  project:targetProject,
  selection:{selectedObjectIds:[],activeObjectId:null,hoveredObjectId:null},
  snapshot(){return structuredClone(this.project);},
  touch(){},
  emit(){},
  pushHistory(){},
  getObject(id){return this.project.scene.objects[id]??null;}
};
const imported=mergePartialProject(targetStore,partial);
assert.equal(imported.objectCount,1);
const importedPlane=targetStore.project.scene.objects[imported.rootIds[0]];
assert.notEqual(importedPlane.objectId,plane.objectId);
assert.equal(importedPlane.data.workPlaneId,plane.data.workPlaneId);
assert.deepEqual(importedPlane.data.definition,plane.data.definition);

console.log('WD-22A Construction Reference Foundation regression: PASS');
