import { ReferenceState, ReferenceTargetKind, createStableReference, resolveStableReference, sameStableReference } from './stable-reference.js';
import {
  GlobalConstructionAxisDefinition,
  GlobalConstructionAxisId,
  GlobalWorkPlaneId,
  SYSTEM_CONSTRUCTION_OWNER_ID,
  resolveWorkPlaneDefinition,
  validateConstructionAxisDefinition
} from '../model/construction-reference.js';
import { extrudePlanarFaceDefinition } from '../model/planar-face-reference.js';

export const SnapGeometryKind = Object.freeze({ POINT:'POINT', LINE:'LINE', PLANE:'PLANE' });
const priority = Object.freeze({ POINT:3, LINE:2, PLANE:1 });
const supportedKinds = new Set([
  ReferenceTargetKind.SKETCH_POINT,
  ReferenceTargetKind.CONSTRUCTION_AXIS,
  ReferenceTargetKind.WORK_PLANE,
  ReferenceTargetKind.PLANAR_FACE
]);

const finitePoint = value => !!value && Number.isFinite(value.x) && Number.isFinite(value.y) && Number.isFinite(value.z);
const add = (a,b) => ({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z});
const subtract = (a,b) => ({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z});
const scale = (v,s) => ({x:v.x*s,y:v.y*s,z:v.z*s});
const dot = (a,b) => a.x*b.x+a.y*b.y+a.z*b.z;
const cross = (a,b) => ({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x});
const length = v => Math.hypot(v.x,v.y,v.z);
const normalize = v => { const l=length(v); return l>0?scale(v,1/l):null; };
const distance = (a,b) => length(subtract(a,b));

const rotateEulerXYZ = (vector, rotation = {x:0,y:0,z:0}) => {
  let {x,y,z}=vector;
  const cx=Math.cos(rotation.x??0), sx=Math.sin(rotation.x??0);
  const cy=Math.cos(rotation.y??0), sy=Math.sin(rotation.y??0);
  const cz=Math.cos(rotation.z??0), sz=Math.sin(rotation.z??0);
  [y,z]=[y*cx-z*sx,y*sx+z*cx];
  [x,z]=[x*cy+z*sy,-x*sy+z*cy];
  [x,y]=[x*cz-y*sz,x*sz+y*cz];
  return {x,y,z};
};

const frameFromDefinition = definition => {
  if (!definition) return null;
  const zAxis=normalize(definition.normal);
  if (!zAxis) return null;
  const xAxis=normalize(subtract(definition.xAxis,scale(zAxis,dot(definition.xAxis,zAxis))));
  if (!xAxis) return null;
  const yAxis=normalize(cross(zAxis,xAxis));
  return yAxis?{origin:{...definition.origin},xAxis,yAxis,zAxis}:null;
};

const localSketchPointToWorld = (store, sketch, point) => {
  const planeRef=sketch.data?.planeRef;
  if (planeRef?.targetKind === ReferenceTargetKind.WORK_PLANE) {
    const resolved=resolveWorkPlaneDefinition(store,planeRef);
    const frame=resolved.state===ReferenceState.RESOLVED?frameFromDefinition(resolved.definition):null;
    if (frame) return add(frame.origin,add(scale(frame.xAxis,point.x),scale(frame.yAxis,point.y)));
  }
  if (planeRef?.targetKind === ReferenceTargetKind.PLANAR_FACE) {
    const owner=store.getObject?.(planeRef.ownerId)??null;
    const frame=frameFromDefinition(extrudePlanarFaceDefinition(owner,planeRef.targetId));
    if (frame) return add(frame.origin,add(scale(frame.xAxis,point.x),scale(frame.yAxis,point.y)));
  }
  const transform=sketch.transform??{};
  const scaled={x:point.x*(transform.scale?.x??1),y:point.y*(transform.scale?.y??1),z:0};
  const rotated=rotateEulerXYZ(scaled,transform.rotation);
  return add(rotated,transform.position??{x:0,y:0,z:0});
};

export function snapGeometryForReference(store, reference) {
  if (!reference || !supportedKinds.has(reference.targetKind)) return null;
  const resolution=resolveStableReference(store,reference);
  if (resolution.state!==ReferenceState.RESOLVED) return null;

  if (reference.targetKind===ReferenceTargetKind.SKETCH_POINT) {
    const sketch=store.getObject?.(reference.ownerId)??null;
    const point=sketch?.data?.points?.[reference.targetId]??null;
    const position=point?localSketchPointToWorld(store,sketch,point):null;
    return finitePoint(position)?{kind:SnapGeometryKind.POINT,position}:null;
  }

  if (reference.targetKind===ReferenceTargetKind.CONSTRUCTION_AXIS) {
    let definition=null;
    if (reference.ownerId===SYSTEM_CONSTRUCTION_OWNER_ID) definition=GlobalConstructionAxisDefinition[reference.targetId]??null;
    else {
      const owner=store.getObject?.(reference.ownerId)??null;
      if (!validateConstructionAxisDefinition(owner?.data?.definition).length) definition=owner.data.definition;
    }
    const direction=definition?normalize(definition.direction):null;
    return definition&&direction?{kind:SnapGeometryKind.LINE,origin:{...definition.origin},direction}:null;
  }

  if (reference.targetKind===ReferenceTargetKind.WORK_PLANE) {
    const resolved=resolveWorkPlaneDefinition(store,reference);
    const normal=resolved.state===ReferenceState.RESOLVED?normalize(resolved.definition?.normal):null;
    return normal?{kind:SnapGeometryKind.PLANE,origin:{...resolved.definition.origin},normal}:null;
  }

  const owner=store.getObject?.(reference.ownerId)??null;
  const definition=extrudePlanarFaceDefinition(owner,reference.targetId);
  const normal=definition?normalize(definition.normal):null;
  return normal?{kind:SnapGeometryKind.PLANE,origin:{...definition.origin},normal}:null;
}

export function projectPointToSnapGeometry(point, geometry) {
  if (!finitePoint(point)||!geometry) return null;
  if (geometry.kind===SnapGeometryKind.POINT) return {...geometry.position};
  if (geometry.kind===SnapGeometryKind.LINE) {
    const delta=subtract(point,geometry.origin);
    return add(geometry.origin,scale(geometry.direction,dot(delta,geometry.direction)));
  }
  if (geometry.kind===SnapGeometryKind.PLANE) {
    const delta=subtract(point,geometry.origin);
    return subtract(point,scale(geometry.normal,dot(delta,geometry.normal)));
  }
  return null;
}

const referenceKey = ref => `${ref.targetKind}:${ref.ownerId}:${ref.targetId}:${ref.subTargetId??''}`;
const isExcluded = (reference, excludedReferences=[]) => excludedReferences.some(item=>sameStableReference(item,reference));

export function createSnapCandidate(store, reference, point, {tolerance=Infinity,excludedReferences=[]}={}) {
  if (isExcluded(reference,excludedReferences)) return null;
  const geometry=snapGeometryForReference(store,reference);
  const projected=projectPointToSnapGeometry(point,geometry);
  if (!geometry||!projected) return null;
  const d=distance(point,projected);
  if (!Number.isFinite(d)||d>tolerance) return null;
  return {reference:{...reference},targetKind:reference.targetKind,geometryKind:geometry.kind,geometry,position:projected,distance:d,priority:priority[geometry.kind]??0};
}

export function chooseSnapCandidate(candidates=[]) {
  return candidates.filter(Boolean).slice().sort((a,b)=>b.priority-a.priority||a.distance-b.distance||referenceKey(a.reference).localeCompare(referenceKey(b.reference)))[0]??null;
}

export function resolveReferenceSnap(store, point, references, options={}) {
  const candidates=(references??[]).map(reference=>createSnapCandidate(store,reference,point,options)).filter(Boolean);
  const candidate=chooseSnapCandidate(candidates);
  if (!candidate) return {snapped:false,position:{...point},reference:null,targetKind:null,geometryKind:null,candidate:null};
  return {snapped:true,position:{...candidate.position},reference:{...candidate.reference},targetKind:candidate.targetKind,geometryKind:candidate.geometryKind,candidate};
}

export function enumerateReferenceSnapTargets(store) {
  const refs=[];
  for (const targetId of Object.values(GlobalWorkPlaneId)) refs.push(createStableReference(ReferenceTargetKind.WORK_PLANE,SYSTEM_CONSTRUCTION_OWNER_ID,targetId));
  for (const targetId of Object.values(GlobalConstructionAxisId)) refs.push(createStableReference(ReferenceTargetKind.CONSTRUCTION_AXIS,SYSTEM_CONSTRUCTION_OWNER_ID,targetId));
  const objects=store?.project?.objects??{};
  for (const object of Object.values(objects)) {
    if (object?.type==='sketch') {
      for (const pointId of Object.keys(object.data?.points??{})) refs.push(createStableReference(ReferenceTargetKind.SKETCH_POINT,object.objectId,pointId));
    } else if (object?.type==='construction.workPlane' && object.data?.workPlaneId) refs.push(createStableReference(ReferenceTargetKind.WORK_PLANE,object.objectId,object.data.workPlaneId));
    else if (object?.type==='construction.axis' && object.data?.constructionAxisId) refs.push(createStableReference(ReferenceTargetKind.CONSTRUCTION_AXIS,object.objectId,object.data.constructionAxisId));
    else if (object?.type==='feature.extrude') {
      refs.push(createStableReference(ReferenceTargetKind.PLANAR_FACE,object.objectId,'CAP_START'));
      refs.push(createStableReference(ReferenceTargetKind.PLANAR_FACE,object.objectId,'CAP_END'));
    }
  }
  return refs;
}
