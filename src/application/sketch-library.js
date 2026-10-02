import { createLibraryEntry } from './library-registry.js';
import { createSketchObject } from '../model/project.js';
import { validateSketchTopology } from '../model/sketch-topology.js';

const id=prefix=>`${prefix}_${crypto.randomUUID()}`;
const values=map=>Object.values(map??{});
const canonicalIds=ids=>[...ids].sort((a,b)=>a.localeCompare(b));
const canonicalHoleSets=sets=>sets.map(canonicalIds).sort((a,b)=>a.join('|').localeCompare(b.join('|')));

export function createSketchLibraryEntry(store,sketchId,{name=null,category='Sketch'}={}){
  const sketch=store?.getObject?.(sketchId)??store?.project?.scene?.objects?.[sketchId];
  if(sketch?.type!=='sketch')return {ok:false,message:'Skizze fehlt.'};
  const topology=validateSketchTopology(sketch);if(!topology.valid)return {ok:false,message:topology.errors.join('\n')};
  const data=structuredClone(sketch.data??{});delete data.planeRef;data.plane='localXY';
  const result=createLibraryEntry({entryKind:'sketch',name:name??sketch.name??'Skizze',category,payload:{sketchData:data}});
  return result.ok?result:{ok:false,message:result.errors.join('\n')};
}

function remapData(source){
  const point=new Map(values(source.points).map(p=>[p.pointId,id('pt')]));
  const line=new Map(values(source.lines).map(e=>[e.lineId,id('ln')]));
  const circle=new Map(values(source.circles).map(e=>[e.circleId,id('circle')]));
  const arc=new Map(values(source.arcs).map(e=>[e.arcId,id('arc')]));
  const spline=new Map(values(source.splines).map(e=>[e.splineId,id('spline')]));
  const element=new Map([...line,...circle,...arc,...spline]);
  const profile=new Map(values(source.profileIdentities).map(e=>[e.profileId,id('profile')]));
  const path=new Map(values(source.pathIdentities).map(e=>[e.pathId,id('path')]));
  const points={};for(const p of values(source.points)){const pointId=point.get(p.pointId);points[pointId]={...structuredClone(p),pointId};}
  const lines={};for(const e of values(source.lines)){const lineId=line.get(e.lineId);lines[lineId]={...structuredClone(e),lineId,startPointId:point.get(e.startPointId),endPointId:point.get(e.endPointId)};}
  const circles={};for(const e of values(source.circles)){const circleId=circle.get(e.circleId);circles[circleId]={...structuredClone(e),circleId};}
  const arcs={};for(const e of values(source.arcs)){const arcId=arc.get(e.arcId);arcs[arcId]={...structuredClone(e),arcId,startPointId:point.get(e.startPointId),endPointId:point.get(e.endPointId)};}
  const splines={};for(const e of values(source.splines)){const splineId=spline.get(e.splineId);splines[splineId]={...structuredClone(e),splineId,startPointId:point.get(e.startPointId),endPointId:point.get(e.endPointId),controls:(e.controls??[]).map(c=>({...structuredClone(c),controlId:id('ctrl')}))};}
  const profileIdentities={};for(const e of values(source.profileIdentities)){const profileId=profile.get(e.profileId);profileIdentities[profileId]={...structuredClone(e),profileId,source:{...structuredClone(e.source),outerElementIds:canonicalIds((e.source?.outerElementIds??[]).map(x=>element.get(x))),holeElementIdSets:canonicalHoleSets((e.source?.holeElementIdSets??[]).map(set=>set.map(x=>element.get(x))))}};}
  const pathIdentities={};for(const e of values(source.pathIdentities)){const pathId=path.get(e.pathId);pathIdentities[pathId]={...structuredClone(e),pathId,source:{...structuredClone(e.source),elementIds:canonicalIds((e.source?.elementIds??[]).map(x=>element.get(x)))}};}
  return {plane:'localXY',points,lines,circles,arcs,splines,profileIdentities,pathIdentities};
}

export function insertSketchLibraryEntry(store,entry){
  if(!entry||entry.entryKind!=='sketch'||!entry.payload?.sketchData)return {ok:false,message:'Sketch-LibraryEntry ist ungültig.'};
  const before=store.snapshot(),sketch=createSketchObject(store.project,entry.name);sketch.data=remapData(entry.payload.sketchData);sketch.parentId=null;sketch.layerId=null;
  const validation=validateSketchTopology(sketch);if(!validation.valid)return {ok:false,message:validation.errors.join('\n')};
  store.project.scene.objects[sketch.objectId]=sketch;store.project.scene.rootObjectIds.push(sketch.objectId);store.touch();store.pushHistory(before,'Sketch-Vorlage einfügen');store.emit('objectCreated',{objectId:sketch.objectId});store.select?.(sketch.objectId);
  return {ok:true,objectId:sketch.objectId};
}
