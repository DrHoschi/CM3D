const uuid=prefix=>`${prefix}_${crypto.randomUUID()}`;
const HEX=/^#[0-9a-fA-F]{6}$/;

export function createMaterial(store,{name='Material',baseColor='#b8bcc2'}={}){
  if(!store?.project?.materials)return {ok:false,message:'Material-Map fehlt.'};
  if(!HEX.test(baseColor))return {ok:false,message:'Ungültige Basisfarbe.'};
  const before=store.snapshot();
  const materialId=uuid('mat');
  store.project.materials[materialId]={materialId,name:String(name||'Material'),type:'pbr.standard',properties:{baseColor:baseColor.toLowerCase(),metallic:0,roughness:0.6,opacity:1},textureRefs:{},extensions:{}};
  store.touch();store.pushHistory(before,'Material erzeugen');store.emit('materialChanged',{materialId});
  return {ok:true,materialId};
}

export function assignMaterial(store,objectId,materialId){
  const object=store?.getObject?.(objectId),material=store?.project?.materials?.[materialId];
  if(!object)return {ok:false,message:'Objekt fehlt.'};
  if(!material)return {ok:false,message:'Material fehlt.'};
  if(object.type==='sketch'||object.type==='group'||object.type==='assembly')return {ok:false,message:'Dieser Objekttyp erhält in WD-10A kein Oberflächenmaterial.'};
  if(object.materialIds?.length===1&&object.materialIds[0]===materialId)return {ok:true,unchanged:true};
  const before=store.snapshot();object.materialIds=[materialId];store.touch();store.pushHistory(before,'Material zuweisen');store.emit('materialChanged',{objectId,materialId});store.emit('geometryChanged',{objectId});
  return {ok:true};
}

export function setMaterialBaseColor(store,materialId,baseColor){
  const material=store?.project?.materials?.[materialId];
  if(!material)return {ok:false,message:'Material fehlt.'};
  if(!HEX.test(baseColor))return {ok:false,message:'Ungültige Basisfarbe.'};
  const color=baseColor.toLowerCase();if(material.properties?.baseColor===color)return {ok:true,unchanged:true};
  const before=store.snapshot();material.properties??={};material.properties.baseColor=color;store.touch();store.pushHistory(before,'Materialfarbe ändern');store.emit('materialChanged',{materialId});
  for(const object of Object.values(store.project.scene.objects))if(object.materialIds?.includes(materialId))store.emit('geometryChanged',{objectId:object.objectId});
  return {ok:true};
}

export function materialForObject(store,objectId){const object=store?.getObject?.(objectId);return object?.materialIds?.[0]?store.project.materials?.[object.materialIds[0]]??null:null;}
