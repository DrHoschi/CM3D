import { createLibraryEntry } from './library-registry.js';

const uuid=prefix=>`${prefix}_${crypto.randomUUID()}`;
const PORTABLE_TYPES=new Set(['primitive.box','primitive.sphere','primitive.cylinder','external.gltf']);
const assetById=(project,id)=>project?.assets?.find(asset=>asset.assetId===id)??null;

function portableMaterial(project,materialId,key){
  const material=project?.materials?.[materialId];if(!material)return {ok:false,message:`Material ${materialId} fehlt.`};
  const definition={libraryMaterialKey:key,name:material.name??'Material',type:material.type??'pbr.standard',properties:structuredClone(material.properties??{}),textureRefs:{},extensions:structuredClone(material.extensions??{}),assets:[]};
  const textureId=material.textureRefs?.baseColor;
  if(textureId){const texture=assetById(project,textureId);if(!texture||texture.kind!=='image.texture')return {ok:false,message:`Textur-Asset ${textureId} fehlt oder ist ungültig.`};const assetKey=`${key}:texture:baseColor`;definition.textureRefs.baseColor=assetKey;definition.assets.push({libraryAssetKey:assetKey,kind:'image.texture',format:texture.format,mimeType:texture.mimeType,name:texture.name,dataUrl:texture.dataUrl});}
  return {ok:true,definition};
}

function portablePayload(project,object){
  if(!PORTABLE_TYPES.has(object.type))return {ok:false,message:`Objekttyp ${object.type} ist nicht als unabhängiges Einzelobjekt portabel.`};
  if(object.parentId!=null)return {ok:false,message:'Objekt mit Parent gehört in eine Baugruppen-/Hierarchievorlage.'};
  if(object.data?.sourceRef||object.data?.sourceSketchRef||(Array.isArray(object.data?.sourceProfileRefs)&&object.data.sourceProfileRefs.length))return {ok:false,message:'Objekt besitzt externe Feature-Abhängigkeiten und ist nicht isoliert portabel.'};
  const materials=[];const materialKeys=[];
  for(const [index,materialId] of (object.materialIds??[]).entries()){const key=`material:${index}`;const made=portableMaterial(project,materialId,key);if(!made.ok)return made;materials.push(made.definition);materialKeys.push(key);}
  let materialBinding=null;
  if(object.materialBinding){const index=(object.materialIds??[]).indexOf(object.materialBinding.materialId);if(index<0)return {ok:false,message:'MaterialBinding verweist nicht auf die Objektmaterialien.'};materialBinding={mode:object.materialBinding.mode,materialKey:`material:${index}`};if(object.materialBinding.mode==='local'){const sourceIndex=(object.materialIds??[]).indexOf(object.materialBinding.sourceMaterialId);if(sourceIndex<0)return {ok:false,message:'Lokales MaterialBinding besitzt eine externe sourceMaterialId und ist nicht isoliert portabel.'};materialBinding.sourceMaterialKey=`material:${sourceIndex}`;}}
  let modelAsset=null,data=structuredClone(object.data??{});
  if(object.type==='external.gltf'){const asset=assetById(project,data.assetId);if(!asset||asset.kind!=='model.gltf.bundle')return {ok:false,message:'GLTF-Modellasset fehlt oder ist ungültig.'};modelAsset={libraryAssetKey:'model:primary',kind:asset.kind,format:asset.format,name:asset.name,entryFile:asset.entryFile,files:structuredClone(asset.files??[])};data.assetId='model:primary';}
  return {ok:true,payload:{object:{type:object.type,name:object.name,transform:structuredClone(object.transform),data,flags:structuredClone(object.flags??{}),extensions:structuredClone(object.extensions??{}),materialKeys,materialBinding},materials,modelAsset}};
}

export function createObjectLibraryEntry(store,objectId,{name=null,category='Object'}={}){
  const object=store?.getObject?.(objectId)??store?.project?.scene?.objects?.[objectId];if(!object)return {ok:false,message:'Objekt fehlt.'};
  const portable=portablePayload(store.project,object);if(!portable.ok)return portable;
  const result=createLibraryEntry({entryKind:'object',name:name??object.name??'Objekt',category,payload:portable.payload});return result.ok?result:{ok:false,message:result.errors.join('\n')};
}

function instantiateTexture(store,asset){const assetId=uuid('asset');store.project.assets.push({assetId,kind:'image.texture',format:asset.format,mimeType:asset.mimeType,name:asset.name,dataUrl:asset.dataUrl});return assetId;}
function instantiateMaterial(store,definition){const materialId=uuid('mat'),textureRefs={};for(const asset of definition.assets??[]){if(asset.kind!=='image.texture'||typeof asset.dataUrl!=='string'||!asset.dataUrl.startsWith(`data:${asset.mimeType};base64,`))throw new Error('Portable Materialtextur ist ungültig.');const assetId=instantiateTexture(store,asset);if(definition.textureRefs?.baseColor===asset.libraryAssetKey)textureRefs.baseColor=assetId;}store.project.materials[materialId]={materialId,name:definition.name,type:definition.type,properties:structuredClone(definition.properties??{}),textureRefs,extensions:structuredClone(definition.extensions??{})};return materialId;}
function instantiateModelAsset(store,asset){if(!asset||asset.kind!=='model.gltf.bundle'||!['glb','gltf'].includes(asset.format)||!asset.entryFile||!Array.isArray(asset.files)||!asset.files.length)throw new Error('Portables GLTF-Modellasset ist ungültig.');const assetId=uuid('asset');store.project.assets.push({assetId,kind:asset.kind,format:asset.format,name:asset.name,entryFile:asset.entryFile,files:structuredClone(asset.files)});return assetId;}

export function insertObjectLibraryEntry(store,entry){
  if(!entry||entry.entryKind!=='object'||!entry.payload?.object)return {ok:false,message:'Object-LibraryEntry ist ungültig.'};const source=entry.payload.object;if(!PORTABLE_TYPES.has(source.type))return {ok:false,message:`Objekttyp ${source.type} ist nicht portabel.`};
  const before=store.snapshot();try{store.project.assets??=[];const materialMap=new Map();for(const definition of entry.payload.materials??[])materialMap.set(definition.libraryMaterialKey,instantiateMaterial(store,definition));const data=structuredClone(source.data??{});if(source.type==='external.gltf')data.assetId=instantiateModelAsset(store,entry.payload.modelAsset);const materialIds=(source.materialKeys??[]).map(key=>materialMap.get(key)).filter(Boolean);const objectId=uuid('obj');const object={objectId,type:source.type,name:entry.name??source.name??'Objekt',parentId:null,order:store.project.scene.rootObjectIds.length,layerId:null,transform:structuredClone(source.transform),data,materialIds,flags:structuredClone(source.flags??{visible:true,locked:false}),extensions:structuredClone(source.extensions??{})};if(source.materialBinding){const materialId=materialMap.get(source.materialBinding.materialKey);if(!materialId)throw new Error('MaterialBinding kann nicht aufgelöst werden.');object.materialBinding={mode:source.materialBinding.mode,materialId};if(source.materialBinding.mode==='local'){const sourceMaterialId=materialMap.get(source.materialBinding.sourceMaterialKey);if(!sourceMaterialId)throw new Error('Local-Variant-Quelle kann nicht aufgelöst werden.');object.materialBinding.sourceMaterialId=sourceMaterialId;}}store.project.scene.objects[objectId]=object;store.project.scene.rootObjectIds.push(objectId);store.touch();store.pushHistory(before,'Objekt aus Bibliothek einfügen');store.emit('objectCreated',{objectId});store.select?.(objectId);return {ok:true,objectId};}catch(error){store.project=before;return {ok:false,message:error?.message??String(error)};}
}
