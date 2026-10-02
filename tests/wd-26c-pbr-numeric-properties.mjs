import assert from 'node:assert/strict';
import { createProject, createBoxObject, createSphereObject, migrateAndValidateProject, validateProject } from '../src/model/project.js';
import { createLocalMaterialVariant, materialBindingForObject, setMaterialMetallic, setMaterialOpacity, setMaterialRoughness } from '../src/application/material.js';

const store={project:createProject('WD-26C'),history:[],events:[],snapshot(){return structuredClone(this.project);},pushHistory(before,label){this.history.push({before,after:this.snapshot(),label});},touch(){this.project.project.modifiedAt=new Date().toISOString();},emit(type,payload){this.events.push({type,payload});},getObject(id){return this.project.scene.objects[id]??null;}};
const add=o=>{store.project.scene.objects[o.objectId]=o;store.project.scene.rootObjectIds.push(o.objectId);return o;};
const a=add(createBoxObject(store.project,'A')),b=add(createSphereObject(store.project,'B'));
const sharedId=a.materialIds[0];b.materialIds=[sharedId];

const historyBefore=store.history.length;
assert.equal(setMaterialMetallic(store,sharedId,0.75).ok,true);
assert.equal(setMaterialRoughness(store,sharedId,'0.25').ok,true);
assert.equal(setMaterialOpacity(store,sharedId,0.4).ok,true);
assert.equal(store.history.length,historyBefore+3,'each user property change creates one history entry');
assert.deepEqual(store.project.materials[sharedId].properties,{baseColor:'#b8bcc2',metallic:0.75,roughness:0.25,opacity:0.4});
assert.ok(store.events.filter(e=>e.type==='geometryChanged'&&[a.objectId,b.objectId].includes(e.payload.objectId)).length>=6,'shared definition changes must propagate to all bound objects');

for(const invalid of [-0.01,1.01,NaN,Infinity,'nope'])assert.equal(setMaterialMetallic(store,sharedId,invalid).ok,false);
assert.equal(store.project.materials[sharedId].properties.metallic,0.75,'invalid values must not mutate the material');

const local=createLocalMaterialVariant(store,b.objectId);assert.equal(local.ok,true);
const localId=local.materialId;assert.equal(materialBindingForObject(store,b.objectId).mode,'local');
assert.equal(setMaterialRoughness(store,localId,0.9).ok,true);
assert.equal(store.project.materials[localId].properties.roughness,0.9);
assert.equal(store.project.materials[sharedId].properties.roughness,0.25,'local variant editing must not mutate the shared definition');

const validation=validateProject(store.project);assert.equal(validation.valid,true,validation.errors.join('\n'));
const roundtrip=migrateAndValidateProject(JSON.parse(JSON.stringify(store.project))).project;
assert.equal(roundtrip.materials[sharedId].properties.metallic,0.75);
assert.equal(roundtrip.materials[sharedId].properties.roughness,0.25);
assert.equal(roundtrip.materials[sharedId].properties.opacity,0.4);
assert.equal(roundtrip.materials[localId].properties.roughness,0.9);
assert.equal(roundtrip.scene.objects[b.objectId].materialBinding.materialId,localId);

const opacityHistory=store.history.find(h=>h.label==='Material opacity ändern');assert.ok(opacityHistory?.before&&opacityHistory?.after,'numeric property change must carry Undo/Redo snapshots');
assert.equal(opacityHistory.before.materials[sharedId].properties.opacity,1);
assert.equal(opacityHistory.after.materials[sharedId].properties.opacity,0.4);

console.log('WD-26C PBR Numeric Properties focused regression PASS');
