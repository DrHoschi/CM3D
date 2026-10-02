import assert from 'node:assert/strict';
import { createProject, createBoxObject, migrateAndValidateProject, validateProject } from '../src/model/project.js';
import { assignMaterial, createLocalMaterialVariant, materialBindingForObject, materialForObject, setMaterialBaseColor } from '../src/application/material.js';

const events=[];
const store={
  project:createProject('WD-26A'),
  history:[],
  snapshot(){return structuredClone(this.project);},
  pushHistory(before,label){this.history.push({before,label});},
  touch(){this.project.project.modifiedAt=new Date().toISOString();},
  emit(type,payload){events.push({type,payload});},
  getObject(id){return this.project.scene.objects[id]??null;}
};
const add=o=>{store.project.scene.objects[o.objectId]=o;store.project.scene.rootObjectIds.push(o.objectId);return o;};
const a=add(createBoxObject(store.project,'A'));
const b=add(createBoxObject(store.project,'B'));
const sharedId=a.materialIds[0];

assert.deepEqual(materialBindingForObject(store,a.objectId),{mode:'shared',materialId:sharedId},'legacy materialIds must project as shared binding');
assert.equal(materialForObject(store,a.objectId).materialId,sharedId);
assert.equal(assignMaterial(store,b.objectId,sharedId).ok,true);

assert.equal(setMaterialBaseColor(store,sharedId,'#112233').ok,true);
assert.equal(materialForObject(store,a.objectId).properties.baseColor,'#112233');
assert.equal(materialForObject(store,b.objectId).properties.baseColor,'#112233','shared definition must affect all shared bindings');

const local=createLocalMaterialVariant(store,a.objectId);
assert.equal(local.ok,true);
assert.notEqual(local.materialId,sharedId);
assert.deepEqual(materialBindingForObject(store,a.objectId),{mode:'local',materialId:local.materialId,sourceMaterialId:sharedId});
assert.equal(store.project.scene.objects[a.objectId].materialIds[0],local.materialId,'compatibility materialIds must mirror effective local material');
assert.equal(setMaterialBaseColor(store,local.materialId,'#abcdef').ok,true);
assert.equal(materialForObject(store,a.objectId).properties.baseColor,'#abcdef');
assert.equal(materialForObject(store,b.objectId).properties.baseColor,'#112233','local variant must not mutate shared definition');

const validation=validateProject(store.project);
assert.equal(validation.valid,true,validation.errors.join('\n'));
const roundtrip=migrateAndValidateProject(JSON.parse(JSON.stringify(store.project))).project;
assert.equal(roundtrip.scene.objects[a.objectId].materialBinding.mode,'local');
assert.equal(roundtrip.scene.objects[a.objectId].materialBinding.sourceMaterialId,sharedId);
assert.equal(roundtrip.materials[local.materialId].properties.baseColor,'#abcdef');

const legacy=createProject('Legacy-compatible');
const legacyObject=createBoxObject(legacy,'Legacy box');
legacy.scene.objects[legacyObject.objectId]=legacyObject;legacy.scene.rootObjectIds.push(legacyObject.objectId);
assert.equal(validateProject(legacy).valid,true,'materialIds-only projects must remain valid');
assert.equal(migrateAndValidateProject(JSON.parse(JSON.stringify(legacy))).project.scene.objects[legacyObject.objectId].materialBinding,undefined,'legacy shared bindings need no eager migration');

assert.ok(store.history.some(h=>h.label==='Lokale Materialvariante erzeugen'),'local variant creation must participate in undo history');
assert.ok(store.history.some(h=>h.label==='Materialfarbe ändern'),'material edits must participate in undo history');
assert.ok(events.some(e=>e.type==='geometryChanged'&&e.payload.objectId===a.objectId));

console.log('WD-26A Material Binding & Local Variant Foundation focused regression PASS');
