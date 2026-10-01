import { ReferenceState, ReferenceTargetKind, resolveStableReference } from './stable-reference.js';
import {
  GlobalConstructionAxisDefinition,
  SYSTEM_CONSTRUCTION_OWNER_ID,
  resolveWorkPlaneDefinition,
  validateConstructionAxisDefinition
} from '../model/construction-reference.js';
import { extrudePlanarFaceDefinition } from '../model/planar-face-reference.js';

export const ReferenceGeometryKind = Object.freeze({ POINT:'POINT', LINE:'LINE', PLANE:'PLANE' });

const supportedKinds = new Set([
  ReferenceTargetKind.SKETCH_POINT,
  ReferenceTargetKind.CONSTRUCTION_AXIS,
  ReferenceTargetKind.WORK_PLANE,
  ReferenceTargetKind.PLANAR_FACE
]);

export const finitePoint = value => !!value && Number.isFinite(value.x) && Number.isFinite(value.y) && Number.isFinite(value.z);
export const addVector = (a,b) => ({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z});
export const subtractVector = (a,b) => ({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z});
export const scaleVector = (v,s) => ({x:v.x*s,y:v.y*s,z:v.z*s});
export const dotVector = (a,b) => a.x*b.x+a.y*b.y+a.z*b.z;
export const crossVector = (a,b) => ({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x});
export const vectorLength = v => Math.hypot(v.x,v.y,v.z);
export const normalizeVector = v => { const l=vectorLength(v); return Number.isFinite(l)&&l>0?scaleVector(v,1/l):null; };
export const pointDistance = (a,b) => vectorLength(subtractVector(a,b));

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
  const zAxis=normalizeVector(definition.normal);
  if (!zAxis) return null;
  const xAxis=normalizeVector(subtractVector(definition.xAxis,scaleVector(zAxis,dotVector(definition.xAxis,zAxis))));
  if (!xAxis) return null;
  const yAxis=normalizeVector(crossVector(zAxis,xAxis));
  return yAxis?{origin:{...definition.origin},xAxis,yAxis,zAxis}:null;
};

const localSketchPointToWorld = (store, sketch, point) => {
  const planeRef=sketch.data?.planeRef;
  if (planeRef?.targetKind === ReferenceTargetKind.WORK_PLANE) {
    const resolved=resolveWorkPlaneDefinition(store,planeRef);
    const frame=resolved.state===ReferenceState.RESOLVED?frameFromDefinition(resolved.definition):null;
    if (frame) return addVector(frame.origin,addVector(scaleVector(frame.xAxis,point.x),scaleVector(frame.yAxis,point.y)));
  }
  if (planeRef?.targetKind === ReferenceTargetKind.PLANAR_FACE) {
    const owner=store.getObject?.(planeRef.ownerId)??null;
    const frame=frameFromDefinition(extrudePlanarFaceDefinition(owner,planeRef.targetId));
    if (frame) return addVector(frame.origin,addVector(scaleVector(frame.xAxis,point.x),scaleVector(frame.yAxis,point.y)));
  }
  const transform=sketch.transform??{};
  const scaled={x:point.x*(transform.scale?.x??1),y:point.y*(transform.scale?.y??1),z:0};
  const rotated=rotateEulerXYZ(scaled,transform.rotation);
  return addVector(rotated,transform.position??{x:0,y:0,z:0});
};

export function referenceGeometryForReference(store, reference) {
  if (!reference || !supportedKinds.has(reference.targetKind)) return null;
  const resolution=resolveStableReference(store,reference);
  if (resolution.state!==ReferenceState.RESOLVED) return null;

  if (reference.targetKind===ReferenceTargetKind.SKETCH_POINT) {
    const sketch=store.getObject?.(reference.ownerId)??null;
    const point=sketch?.data?.points?.[reference.targetId]??null;
    const position=point?localSketchPointToWorld(store,sketch,point):null;
    return finitePoint(position)?{kind:ReferenceGeometryKind.POINT,position}:null;
  }

  if (reference.targetKind===ReferenceTargetKind.CONSTRUCTION_AXIS) {
    let definition=null;
    if (reference.ownerId===SYSTEM_CONSTRUCTION_OWNER_ID) definition=GlobalConstructionAxisDefinition[reference.targetId]??null;
    else {
      const owner=store.getObject?.(reference.ownerId)??null;
      if (!validateConstructionAxisDefinition(owner?.data?.definition).length) definition=owner.data.definition;
    }
    const direction=definition?normalizeVector(definition.direction):null;
    return definition&&finitePoint(definition.origin)&&direction?{kind:ReferenceGeometryKind.LINE,origin:{...definition.origin},direction}:null;
  }

  if (reference.targetKind===ReferenceTargetKind.WORK_PLANE) {
    const resolved=resolveWorkPlaneDefinition(store,reference);
    const normal=resolved.state===ReferenceState.RESOLVED?normalizeVector(resolved.definition?.normal):null;
    return normal&&finitePoint(resolved.definition?.origin)?{kind:ReferenceGeometryKind.PLANE,origin:{...resolved.definition.origin},normal}:null;
  }

  const owner=store.getObject?.(reference.ownerId)??null;
  const definition=extrudePlanarFaceDefinition(owner,reference.targetId);
  const normal=definition?normalizeVector(definition.normal):null;
  return normal&&finitePoint(definition?.origin)?{kind:ReferenceGeometryKind.PLANE,origin:{...definition.origin},normal}:null;
}

export function projectPointToReferenceGeometry(point, geometry) {
  if (!finitePoint(point)||!geometry) return null;
  if (geometry.kind===ReferenceGeometryKind.POINT) return {...geometry.position};
  if (geometry.kind===ReferenceGeometryKind.LINE) {
    const direction=normalizeVector(geometry.direction);
    if (!finitePoint(geometry.origin)||!direction) return null;
    const delta=subtractVector(point,geometry.origin);
    return addVector(geometry.origin,scaleVector(direction,dotVector(delta,direction)));
  }
  if (geometry.kind===ReferenceGeometryKind.PLANE) {
    const normal=normalizeVector(geometry.normal);
    if (!finitePoint(geometry.origin)||!normal) return null;
    const delta=subtractVector(point,geometry.origin);
    return subtractVector(point,scaleVector(normal,dotVector(delta,normal)));
  }
  return null;
}
