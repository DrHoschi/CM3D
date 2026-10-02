const uuid=prefix=>`${prefix}_${crypto.randomUUID()}`;
const HEX=/^#[0-9a-fA-F]{6}$/;

const cloneProperties=material=>structuredClone(material?.properties??{});

export function createMaterial(store,{name='Material',baseColor='#b8bcc2'}={}){
  if(!store?.project?.materials)return {ok:false,message:'Material-Map fehlt.'};
  if(!HEX.test(baseColor))return {ok:false,message:'Ungültige Basisfarbe.'};
  const before=store.snapshot();
  const materialId=uuid('mat');
  store.project.materials[materialId]={materialId,name:String(name||'Material'),type:'pbr.standard',properties:{baseColor:baseColor.toLowerCase(),metallic:0,roughness:0.6,opacity:1},textureRefs:{},extensions:{}};
  store.touch();store.pushHistory(before,'Material erzeugen');store.emit('materialChanged',{materialId});
  return {ok:true,materialId};
}

export function materialBindingForObject(store,objectId){
  const object=store?.getObject?.(objectId);
  if(!object)return null;
  const explicit=object.materialBinding;
  if(explicit?.mode==='local'&&explicit.materialId&&store.project.materials?.[explicit.materialId])return explicit;
  const materialId=explicit?.materialId??object.materialIds?.[0]??null;
  return materialId?{mode:'shared',materialId}:null;
}

export function assignMaterial(store,objectId,materialId){
  const object=store?.getObject?.(objectId),material=store?.project?.materials?.[materialId];
  if(!object)return {ok:false,message:'Objekt fehlt.'};
  if(!material)return {ok:false,message:'Material fehlt.'};
  if(object.type==='sketch'||object.type==='group'||object.type==='assembly')return {ok:false,message:'Dieser Objekttyp erhält in WD-10A kein Oberflächenmaterial.'};
  const binding=materialBindingForObject(store,objectId);
  if(binding?.mode==='shared'&&binding.materialId===materialId&&!object.materialBinding)return {ok:true,unchanged:true};
  const before=store.snapshot();
  object.materialIds=[materialId];
  delete object.materialBinding;
  store.touch();store.pushHistory(before,'Material zuweisen');store.emit('materialChanged',{objectId,materialId,mode:'shared'});store.emit('geometryChanged',{objectId});
  return {ok:true};
}

export function createLocalMaterialVariant(store,objectId){
  const object=store?.getObject?.(objectId);
  if(!object)return {ok:false,message:'Objekt fehlt.'};
  const binding=materialBindingForObject(store,objectId);
  const source=binding?.materialId?store.project.materials?.[binding.materialId]:null;
  if(!source)return {ok:false,message:'Ausgangsmaterial fehlt.'};
  if(binding.mode==='local')return {ok:true,unchanged:true,materialId:binding.materialId};
  const before=store.snapshot();
  const materialId=uuid('mat');
  store.project.materials[materialId]={...structuredClone(source),materialId,name:`${source.name||'Material'} – Lokal`,properties:cloneProperties(source),extensions:{...(structuredClone(source.extensions??{})),localVariantOf:source.materialId}};
  object.materialIds=[materialId];
  object.materialBinding={mode:'local',materialId,sourceMaterialId:source.materialId};
  store.touch();store.pushHistory(before,'Lokale Materialvariante erzeugen');store.emit('materialChanged',{objectId,materialId,mode:'local',sourceMaterialId:source.materialId});store.emit('geometryChanged',{objectId});
  return {ok:true,materialId};
}

export function setMaterialBaseColor(store,materialId,baseColor){
  const material=store?.project?.materials?.[materialId];
  if(!material)return {ok:false,message:'Material fehlt.'};
  if(!HEX.test(baseColor))return {ok:false,message:'Ungültige Basisfarbe.'};
  const color=baseColor.toLowerCase();if(material.properties?.baseColor===color)return {ok:true,unchanged:true};
  const before=store.snapshot();material.properties??={};material.properties.baseColor=color;store.touch();store.pushHistory(before,'Materialfarbe ändern');store.emit('materialChanged',{materialId});
  for(const object of Object.values(store.project.scene.objects))if(materialBindingForObject(store,object.objectId)?.materialId===materialId)store.emit('geometryChanged',{objectId:object.objectId});
  return {ok:true};
}

export function materialForObject(store,objectId){const binding=materialBindingForObject(store,objectId);return binding?.materialId?store.project.materials?.[binding.materialId]??null:null;}
