import assert from 'node:assert/strict';
import { createBoxObject, createProject, createSphereObject, migrateAndValidateProject, validateProject } from '../src/model/project.js';
import { importBaseColorTexture } from '../src/application/material.js';
import { applyMaterialLibraryEntry, applyMaterialPreset, createMaterialLibraryEntry, MATERIAL_PRESETS } from '../src/application/material-library.js';

const store={project:createProject('WD-26F'),history:[],events:[],snapshot(){return structuredClone(this.project);},pushHistory(before,label){this.history.push({before,after:this.snapshot(),label});},touch(){this.project.project.modifiedAt=new Date().toISOString();},emit(type,payload){this.events.push({type,payload});},getObject(id){return this.project.scene.objects[id]??null;}};
const add=o=>{store.project.scene.objects[o.objectId]=o;store.project.scene.rootObjectIds.push(o.objectId);return o;};
const a=add(createBoxObject(store.project,'A')),b=add(createSphereObject(store.project,'B'));
assert.ok(MATERIAL_PRESETS.length>=3);

let before=store.history.length;const preset=applyMaterialPreset(store,'brushed-metal',[a.objectId,b.objectId]);assert.equal(preset.ok,true);assert.equal(store.history.length,before+1,'preset application must be atomic');assert.equal(a.materialIds[0],preset.materialId);assert.equal(b.materialIds[0],preset.materialId);assert.equal(store.project.materials[preset.materialId].properties.metallic,0.85);

const png='data:image/png;base64,iVBORw0KGgo=';assert.equal(importBaseColorTexture(store,preset.materialId,{name:'metal.png',mimeType:'image/png',dataUrl:png}).ok,true);const sourceAssetId=store.project.materials[preset.materialId].textureRefs.baseColor;
const made=createMaterialLibraryEntry(store,preset.materialId,{name:'Metal textured',category:'QA'});assert.equal(made.ok,true);assert.equal(made.entry.entryKind,'material');assert.equal(made.entry.name,'Metal textured');assert.equal(made.entry.category,'QA');assert.equal(made.entry.payload.materialDefinition.textureRefs.baseColor,'texture:baseColor');assert.equal(JSON.stringify(made.entry).includes(sourceAssetId),false,'library payload must not retain project-local assetId');assert.equal(made.entry.payload.assets[0].dataUrl,png);

before=store.history.length;const applied=applyMaterialLibraryEntry(store,made.entry,[a.objectId]);assert.equal(applied.ok,true);assert.equal(store.history.length,before+1,'library application must be atomic');assert.notEqual(applied.materialId,preset.materialId,'library application creates a project-local material definition');assert.equal(a.materialIds[0],applied.materialId);assert.equal(b.materialIds[0],preset.materialId,'unselected object keeps previous shared material');const copiedAssetId=store.project.materials[applied.materialId].textureRefs.baseColor;assert.ok(copiedAssetId);assert.notEqual(copiedAssetId,sourceAssetId,'library texture must receive a new project-local assetId');assert.equal(store.project.assets.find(x=>x.assetId===copiedAssetId).dataUrl,png);

const validation=validateProject(store.project);assert.equal(validation.valid,true,validation.errors.join('\n'));const roundtrip=migrateAndValidateProject(JSON.parse(JSON.stringify(store.project))).project;assert.equal(roundtrip.materials[applied.materialId].textureRefs.baseColor,copiedAssetId);assert.equal(roundtrip.assets.find(x=>x.assetId===copiedAssetId).dataUrl,png);assert.equal(roundtrip.scene.objects[a.objectId].materialIds[0],applied.materialId);

const invalid=structuredClone(made.entry);invalid.payload.assets[0].dataUrl='broken';assert.equal(applyMaterialLibraryEntry(store,invalid,[a.objectId]).ok,false);
console.log('WD-26F Material Presets & Material Library Application focused regression PASS');
