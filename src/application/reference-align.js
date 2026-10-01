import { ReferenceTargetKind } from './stable-reference.js';
import {
  ReferenceGeometryKind,
  finitePoint,
  pointDistance,
  projectPointToReferenceGeometry,
  referenceGeometryForReference,
  subtractVector,
  worldPointToSketchLocal
} from './reference-geometry.js';

export const ReferenceAlignKind = Object.freeze({ TRANSLATION:'TRANSLATION' });
export const ReferenceAlignState = Object.freeze({ VALID:'VALID', INVALID:'INVALID', NO_OP:'NO_OP' });

const EPSILON = 1e-9;
const targetKinds = new Set([
  ReferenceTargetKind.SKETCH_POINT,
  ReferenceTargetKind.CONSTRUCTION_AXIS,
  ReferenceTargetKind.WORK_PLANE,
  ReferenceTargetKind.PLANAR_FACE
]);

const invalid = reason => Object.freeze({ state:ReferenceAlignState.INVALID, kind:ReferenceAlignKind.TRANSLATION, reason });

export function referenceAlignResult(store, sourceReference, targetReference) {
  if (sourceReference?.targetKind!==ReferenceTargetKind.SKETCH_POINT) return invalid('UNSUPPORTED_SOURCE');
  if (!targetKinds.has(targetReference?.targetKind)) return invalid('UNSUPPORTED_TARGET');

  const sourceGeometry=referenceGeometryForReference(store,sourceReference);
  if (sourceGeometry?.kind!==ReferenceGeometryKind.POINT || !finitePoint(sourceGeometry.position)) return invalid('UNRESOLVED_SOURCE');
  const targetGeometry=referenceGeometryForReference(store,targetReference);
  if (!targetGeometry) return invalid('UNRESOLVED_TARGET');

  const targetPositionWorld=projectPointToReferenceGeometry(sourceGeometry.position,targetGeometry);
  if (!finitePoint(targetPositionWorld)) return invalid('INVALID_TARGET_GEOMETRY');
  const translationWorld=subtractVector(targetPositionWorld,sourceGeometry.position);
  const state=pointDistance(sourceGeometry.position,targetPositionWorld)<=EPSILON?ReferenceAlignState.NO_OP:ReferenceAlignState.VALID;
  return Object.freeze({
    state,
    kind:ReferenceAlignKind.TRANSLATION,
    reason:null,
    sourceReference:Object.freeze({...sourceReference}),
    targetReference:Object.freeze({...targetReference}),
    sourcePositionWorld:Object.freeze({...sourceGeometry.position}),
    targetPositionWorld:Object.freeze({...targetPositionWorld}),
    translationWorld:Object.freeze({...translationWorld})
  });
}

export function commitReferenceAlign(store, result, label='Referenzbasiert ausrichten') {
  if (!store || result?.state===ReferenceAlignState.INVALID || result?.state===ReferenceAlignState.NO_OP) return false;
  const source=result?.sourceReference;
  if (source?.targetKind!==ReferenceTargetKind.SKETCH_POINT) return false;
  const sketch=store.getObject?.(source.ownerId)??null;
  if (sketch?.type!=='sketch' || typeof store.runSketchMutation!=='function') return false;
  if (sketch.locked===true || sketch.data?.locked===true) return false;

  const local=worldPointToSketchLocal(store,sketch,result.targetPositionWorld);
  if (!local) return false;
  return store.runSketchMutation(source.ownerId,label,current => {
    const point=current.data?.points?.[source.targetId];
    if (!point) return false;
    if (Math.abs(point.x-local.x)<=EPSILON && Math.abs(point.y-local.y)<=EPSILON) return false;
    point.x=local.x;
    point.y=local.y;
    return true;
  },{selectionChanged:true})!==false;
}

export function alignReference(store, sourceReference, targetReference, label) {
  const result=referenceAlignResult(store,sourceReference,targetReference);
  return Object.freeze({ result, committed:commitReferenceAlign(store,result,label) });
}
