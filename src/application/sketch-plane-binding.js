import { GlobalWorkPlaneDefinition, SYSTEM_CONSTRUCTION_OWNER_ID } from '../model/construction-reference.js';
import { extrudePlanarFaceDefinition } from '../model/planar-face-reference.js';
import { ReferenceState, ReferenceTargetKind, resolveStableReference } from './stable-reference.js';

const dot = (a,b) => a.x*b.x + a.y*b.y + a.z*b.z;
const length = v => Math.hypot(v.x,v.y,v.z);
const scale = (v,s) => ({x:v.x*s,y:v.y*s,z:v.z*s});
const subtract = (a,b) => ({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z});
const cross = (a,b) => ({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x});
const normalize = v => { const l=length(v); return l>0?scale(v,1/l):null; };

export function isSketchPlaneReference(reference) {
  return !!reference
    && [ReferenceTargetKind.WORK_PLANE, ReferenceTargetKind.PLANAR_FACE].includes(reference.targetKind)
    && typeof reference.ownerId === 'string' && reference.ownerId.length > 0
    && typeof reference.targetId === 'string' && reference.targetId.length > 0
    && reference.subTargetId == null;
}

export function isSketchWorkPlaneReference(reference) {
  return isSketchPlaneReference(reference) && reference.targetKind === ReferenceTargetKind.WORK_PLANE;
}

export function planeDefinitionForReference(store, reference) {
  const resolution = resolveStableReference(store, reference);
  if (resolution.state !== ReferenceState.RESOLVED) return { resolution, definition:null };
  if (reference.targetKind === ReferenceTargetKind.WORK_PLANE) {
    if (reference.ownerId === SYSTEM_CONSTRUCTION_OWNER_ID) {
      return { resolution, definition:GlobalWorkPlaneDefinition[reference.targetId] ?? null };
    }
    const owner = store.getObject?.(reference.ownerId) ?? null;
    return { resolution, definition:owner?.data?.definition ?? null };
  }
  if (reference.targetKind === ReferenceTargetKind.PLANAR_FACE) {
    const owner = store.getObject?.(reference.ownerId) ?? null;
    return { resolution, definition:extrudePlanarFaceDefinition(owner, reference.targetId) };
  }
  return { resolution, definition:null };
}

export function workPlaneDefinitionForReference(store, reference) {
  return planeDefinitionForReference(store, reference);
}

export function frameFromWorkPlaneDefinition(definition) {
  if (!definition) return null;
  const zAxis=normalize(definition.normal);
  if (!zAxis) return null;
  const projected=subtract(definition.xAxis,scale(zAxis,dot(definition.xAxis,zAxis)));
  const xAxis=normalize(projected);
  if (!xAxis) return null;
  const yAxis=normalize(cross(zAxis,xAxis));
  if (!yAxis) return null;
  return {
    origin:{...definition.origin},
    xAxis,
    yAxis,
    zAxis
  };
}

export function resolveSketchPlaneBinding(store, sketch) {
  if (sketch?.type !== 'sketch') return { mode:'INVALID', resolution:null, frame:null };
  const reference=sketch.data?.planeRef ?? null;
  if (!reference) return { mode:'LEGACY_LOCAL_XY', resolution:null, frame:null };
  if (!isSketchPlaneReference(reference)) return { mode:'BOUND', resolution:null, frame:null };
  const { resolution, definition }=planeDefinitionForReference(store,reference);
  return {
    mode:'BOUND',
    resolution,
    frame:resolution.state===ReferenceState.RESOLVED?frameFromWorkPlaneDefinition(definition):null
  };
}
