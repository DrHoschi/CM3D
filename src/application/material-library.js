import { createLibraryEntry } from './library-registry.js';

const uuid=prefix=>`${prefix}_${crypto.randomUUID()}`;
export const MATERIAL_PRESETS=Object.freeze([
  {presetId:'matte-gray',name:'Mattgrau',category:'Basis',material:{type:'pbr.standard',properties:{baseColor:'#808080',metallic:0,roughness:0.8,opacity:1},textureRefs:{},extensions:{presetId:'matte-gray'}}},
  {presetId:'brushed-metal',name:'Metall',category:'Basis',material:{type:'pbr.standard',properties:{baseColor:'#a8adb3',metallic:0.85,roughness:0.28,opacity:1},textureRefs:{},extensions:{presetId:'brushed-metal'}}},
  {presetId:'clear-plastic',name:'Kunststoff transparent',category:'Basis',material:{type:'pbr.standard',properties:{baseColor:'#d7e6ef',metallic:0,roughness:0.2,opacity:0.45},textureRefs:{},extensions:{presetId:'clear-plastic'}}}
]);

const textureAsset=(project,assetId)=>project?.assets?.find(asset=>asset.assetId===assetId&&asset.kind==='image.texture')??null;
const materialPayload=(project,material)=>{
  const definition={type:material.type,properties:structuredClone(material.properties??{}),textureRefs:{},extensions:structuredClone(material.extensions??{})};
  const assets=[];
  const sourceId=material.textureRefs?.baseColor,source=sourceId?textureAsset(project,sourceId):null;
  if(source){definition.textureRefs.baseColor='texture:baseColor';assets.push({libraryAssetKey:'texture:baseColor',kind:'image.texture',format:source.format,mimeType:source.mimeType,name:source.name,dataUrl:source.dataUrl});}
  return {materialDefinition:definition,assets};
};

export function createMaterialLibraryEntry(store,materialId,{name=null,category='Material'}={}){
  const material=store?.project?.materials?.[materialId];if(!material)return {ok:false,message:'Material fehlt.'};
  const result=createLibraryEntry({entryKind:'material',name:name??material.name??'Material',category,payload:materialPayload(store.project,material)});
  return result.ok?result:{ok:false,message:result.errors.join('\n')};
}

function instantiateMaterial(store,{name,definition,assets=[]}){
  const materialId=uuid('mat'),textureRefs={};store.project.assets??=[];
  for(const asset of assets){if(asset.kind!=='image.texture')continue;const assetId=uuid('asset');store.project.assets.push({assetId,kind:'image.texture',format:asset.format,mimeType:asset.mimeType,name:asset.name,dataUrl:asset.dataUrl});if(asset.libraryAssetKey==='texture:baseColor')textureRefs.baseColor=assetId;}
  store.project.materials[materialId]={materialId,name,type:definition.type??'pbr.standard',properties:structuredClone(definition.properties??{}),textureRefs,extensions:structuredClone(definition.extensions??{})};return materialId;
}
function assignWithoutHistory(store,objectIds,materialId){const changed=[];for(const id of [...new Set(objectIds??[])]){const object=store.getObject(id);if(!object||['sketch','group','assembly','external.gltf'].includes(object.type))continue;object.materialIds=[materialId];delete object.materialBinding;changed.push(id);}return changed;}
function applyTemplate(store,{name,definition,assets=[]},objectIds,label){if(!store?.project?.materials)return {ok:false,message:'Material-Map fehlt.'};const before=store.snapshot(),materialId=instantiateMaterial(store,{name,definition,assets}),changedObjectIds=assignWithoutHistory(store,objectIds,materialId);store.touch();store.pushHistory(before,label);store.emit('materialChanged',{materialId,objectIds:changedObjectIds,mode:'shared'});for(const objectId of changedObjectIds)store.emit('geometryChanged',{objectId});return {ok:true,materialId,changedObjectIds};}

export function applyMaterialPreset(store,presetId,objectIds=[]){const preset=MATERIAL_PRESETS.find(item=>item.presetId===presetId);if(!preset)return {ok:false,message:'Material-Preset fehlt.'};return applyTemplate(store,{name:preset.name,definition:preset.material},objectIds,'Material-Preset anwenden');}
export function applyMaterialLibraryEntry(store,entry,objectIds=[]){if(!entry||entry.entryKind!=='material'||!entry.payload?.materialDefinition)return {ok:false,message:'Material-LibraryEntry ist ungültig.'};const assets=entry.payload.assets??[];for(const asset of assets)if(asset.kind!=='image.texture'||typeof asset.dataUrl!=='string'||!asset.dataUrl.startsWith(`data:${asset.mimeType};base64,`))return {ok:false,message:'Material-Library-Textur ist ungültig.'};return applyTemplate(store,{name:entry.name,definition:entry.payload.materialDefinition,assets},objectIds,'Material aus Bibliothek anwenden');}
