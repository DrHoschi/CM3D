export const FORMAT = 'CM3D_PROJECT';
export const SCHEMA_VERSION = '0.1.0';

const uuid = (prefix) => `${prefix}_${crypto.randomUUID()}`;
const transform = () => ({ position:{x:0,y:0,z:0}, rotation:{x:0,y:0,z:0,w:1}, scale:{x:1,y:1,z:1}, pivot:{x:0,y:0,z:0} });

export function createProject(name = 'Neues CM3D Projekt') {
  const materialId = uuid('mat');
  return { format:FORMAT, schemaVersion:SCHEMA_VERSION, project:{projectId:uuid('prj'),name,createdAt:new Date().toISOString(),modifiedAt:new Date().toISOString()}, settings:{units:{lengthDisplayUnit:'m'}}, scene:{rootObjectIds:[],objects:{}}, materials:{[materialId]:{materialId,name:'Standard',type:'pbr.standard',properties:{baseColor:'#b8bcc2',metallic:0,roughness:0.6,opacity:1},textureRefs:{},extensions:{}}}, assets:[], extensions:{} };
}

function baseObject(project,type,name,data={},material=true){
  const objectId=uuid('obj'), materialId=Object.keys(project.materials)[0]??null;
  return { objectId,type,name,parentId:null,order:project.scene.rootObjectIds.length,transform:transform(),data,materialIds:material&&materialId?[materialId]:[],flags:{visible:true,locked:false},extensions:{} };
}

export const createBoxObject=(project,name='Würfel')=>baseObject(project,'primitive.box',name,{size:{x:1,y:1,z:1}});
export const createSphereObject=(project,name='Kugel')=>baseObject(project,'primitive.sphere',name,{radius:0.5,segments:32});
export const createCylinderObject=(project,name='Zylinder')=>baseObject(project,'primitive.cylinder',name,{radius:0.5,height:1,segments:32});
export const createGroupObject=(project,name='Gruppe')=>baseObject(project,'group',name,{},false);
export const createAssemblyObject=(project,name='Baugruppe')=>baseObject(project,'assembly',name,{assembly:{kind:'generic'}},false);
export const createSketchObject=(project,name='Skizze')=>baseObject(project,'sketch',name,{plane:'localXY',points:{},lines:{}},false);
export const createSketchPoint=(x=0,y=0)=>({pointId:uuid('pt'),x:Number(x),y:Number(y)});
export const createSketchLine=(startPointId,endPointId)=>({lineId:uuid('ln'),startPointId,endPointId});

export function validateProject(project) {
  const errors=[];
  if(!project||project.format!==FORMAT)errors.push('Ungültiges CM3D-Format.');
  if(project?.schemaVersion!==SCHEMA_VERSION)errors.push(`Nicht unterstützte schemaVersion: ${project?.schemaVersion??'fehlt'}`);
  if(!project?.project?.projectId)errors.push('projectId fehlt.');
  if(!project?.scene?.objects||typeof project.scene.objects!=='object')errors.push('scene.objects fehlt oder ist ungültig.');
  if(!project?.materials||Array.isArray(project.materials)||typeof project.materials!=='object')errors.push('materials muss eine Material-Map sein.');
  if(project?.scene?.objects){
    const objects=project.scene.objects;
    for(const [key,o] of Object.entries(objects)){
      if(key!==o.objectId)errors.push(`Objektschlüssel stimmt nicht mit objectId überein: ${key}`);
      if(o.parentId!==null&&!objects[o.parentId])errors.push(`Parent fehlt für ${o.objectId}.`);
      if(o.parentId===o.objectId)errors.push(`Objekt darf nicht eigener Parent sein: ${o.objectId}.`);
      for(const materialId of o.materialIds??[])if(!project.materials?.[materialId])errors.push(`Material ${materialId} fehlt für ${o.objectId}.`);
      const t=o.transform;
      if(!t)errors.push(`Transform fehlt für ${o.objectId}.`); else {
        const values=[t.position?.x,t.position?.y,t.position?.z,t.rotation?.x,t.rotation?.y,t.rotation?.z,t.rotation?.w,t.scale?.x,t.scale?.y,t.scale?.z,t.pivot?.x,t.pivot?.y,t.pivot?.z];
        if(values.some(v=>!Number.isFinite(v)))errors.push(`Ungültige Transformwerte für ${o.objectId}.`);
        if([t.scale?.x,t.scale?.y,t.scale?.z].some(v=>v===0))errors.push(`Nullskalierung für ${o.objectId}.`);
      }
      if(o.type==='primitive.box'&&['x','y','z'].some(k=>!(o.data?.size?.[k]>0)))errors.push(`Ungültige Box-Abmessung für ${o.objectId}.`);
      if(o.type==='primitive.sphere'&&!(o.data?.radius>0))errors.push(`Ungültiger Kugelradius für ${o.objectId}.`);
      if(o.type==='primitive.cylinder'&&(!(o.data?.radius>0)||!(o.data?.height>0)))errors.push(`Ungültige Zylinderabmessung für ${o.objectId}.`);
      if(o.type==='sketch'){
        if(o.data?.plane!=='localXY')errors.push(`Ungültige Skizzenebene für ${o.objectId}.`);
        if(!o.data?.points||Array.isArray(o.data.points)||typeof o.data.points!=='object')errors.push(`Skizzenpunkte fehlen für ${o.objectId}.`);
        if(!o.data?.lines||Array.isArray(o.data.lines)||typeof o.data.lines!=='object')errors.push(`Skizzenlinien fehlen für ${o.objectId}.`);
        for(const [pointKey,p] of Object.entries(o.data?.points??{})){
          if(pointKey!==p.pointId)errors.push(`Punktschlüssel stimmt nicht mit pointId überein: ${pointKey}`);
          if(!Number.isFinite(p.x)||!Number.isFinite(p.y))errors.push(`Ungültiger Skizzenpunkt ${pointKey} in ${o.objectId}.`);
        }
        for(const [lineKey,l] of Object.entries(o.data?.lines??{})){
          if(lineKey!==l.lineId)errors.push(`Linienschlüssel stimmt nicht mit lineId überein: ${lineKey}`);
          if(!o.data?.points?.[l.startPointId]||!o.data?.points?.[l.endPointId])errors.push(`Skizzenlinie ${lineKey} referenziert fehlende Punkte in ${o.objectId}.`);
          if(l.startPointId===l.endPointId)errors.push(`Skizzenlinie ${lineKey} benötigt zwei verschiedene Punkte.`);
        }
      }
      const seen=new Set([o.objectId]); let parent=o.parentId;
      while(parent){if(seen.has(parent)){errors.push(`Parent-Zyklus bei ${o.objectId}.`);break;}seen.add(parent);parent=objects[parent]?.parentId??null;}
    }
  }
  return {valid:errors.length===0,errors};
}
