import assert from 'node:assert/strict';
import { createProject, createBoxObject, createSphereObject, migrateAndValidateProject, validateProject } from '../src/model/project.js';
import { assignMaterialToObjects, createLocalMaterialVariant, createMaterial, materialBindingForObject, removeMaterialFromObjects } from '../src/application/material.js';

const store={project:createProject('WD-26B'),history:[],events:[],snapshot(){return structuredClone(this.project);},pushHistory(before,label){this.history.push({before,after:this.snapshot(),label});},touch(){this.project.project.modifiedAt=new Date().toISOString();},emit(type,payload){this.events.push({type,payload});},getObject(id){return this.project.scene.objects[id]??null;}};
const add=o=>{store.project.scene.objects[o.objectId]=o;store.project.scene.rootObjectIds.push(o.objectId);return o;};
const a=add(createBoxObject(store.project,'A')),b=add(createSphereObject(store.project,'B'));
const initialShared=a.materialIds[0];
const second=createMaterial(store,{name:'Second',baseColor:'#123456'}).materialId;

// Mixed state: A remains on the original shared definition while B becomes local.
assert.equal(createLocalMaterialVariant(store,b.objectId).ok,true);
assert.equal(materialBindingForObject(store,a.objectId).materialId,initialShared);
assert.equal(materialBindingForObject(store,b.objectId).mode,'local');

const historyBeforeAssign=store.history.length;
const assigned=assignMaterialToObjects(store,[a.objectId,b.objectId],second);
assert.equal(assigned.ok,true);
assert.deepEqual(new Set(assigned.changedObjectIds),new Set([a.objectId,b.objectId]));
assert.equal(store.history.length,historyBeforeAssign+1,'multi assignment must create exactly one history entry');
for(const object of [a,b]){
  assert.deepEqual(object.materialIds,[second]);
  assert.equal(object.materialBinding,undefined,'shared multi assignment must resolve local binding');
  assert.deepEqual(materialBindingForObject(store,object.objectId),{mode:'shared',materialId:second});
}

const historyBeforeRemove=store.history.length;
const removed=removeMaterialFromObjects(store,[a.objectId,b.objectId]);
assert.equal(removed.ok,true);
assert.equal(store.history.length,historyBeforeRemove+1,'multi removal must create exactly one history entry');
for(const object of [a,b]){assert.deepEqual(object.materialIds,[]);assert.equal(object.materialBinding,undefined);assert.equal(materialBindingForObject(store,object.objectId),null);}
assert.ok(store.project.materials[initialShared],'removal must not delete shared MaterialDefinition');
assert.ok(store.project.materials[second],'removal must not delete assigned MaterialDefinition');

const validation=validateProject(store.project);assert.equal(validation.valid,true,validation.errors.join('\n'));
const roundtrip=migrateAndValidateProject(JSON.parse(JSON.stringify(store.project))).project;
assert.deepEqual(roundtrip.scene.objects[a.objectId].materialIds,[]);
assert.deepEqual(roundtrip.scene.objects[b.objectId].materialIds,[]);
assert.ok(roundtrip.materials[second],'Save -> Reload must retain unbound MaterialDefinitions');

// Existing history snapshots provide the project states required by the store's Undo/Redo path.
const assignHistory=store.history.find(h=>h.label==='Material mehreren Objekten zuweisen');
const removeHistory=store.history.find(h=>h.label==='Material von mehreren Objekten entfernen');
assert.ok(assignHistory?.before&&assignHistory?.after);
assert.ok(removeHistory?.before&&removeHistory?.after);
assert.deepEqual(removeHistory.before.scene.objects[a.objectId].materialIds,[second]);
assert.deepEqual(removeHistory.after.scene.objects[a.objectId].materialIds,[]);

console.log('WD-26B Material Assignment / Removal focused regression PASS');
