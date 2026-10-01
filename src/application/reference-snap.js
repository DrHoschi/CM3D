import { ReferenceTargetKind, createStableReference, sameStableReference } from './stable-reference.js';
import { GlobalConstructionAxisId, GlobalWorkPlaneId, SYSTEM_CONSTRUCTION_OWNER_ID } from '../model/construction-reference.js';
import {
  ReferenceGeometryKind,
  pointDistance,
  projectPointToReferenceGeometry,
  referenceGeometryForReference
} from './reference-geometry.js';

export const SnapGeometryKind = ReferenceGeometryKind;
const priority = Object.freeze({ POINT:3, LINE:2, PLANE:1 });

export const snapGeometryForReference = referenceGeometryForReference;
export const projectPointToSnapGeometry = projectPointToReferenceGeometry;

const referenceKey = ref => `${ref.targetKind}:${ref.ownerId}:${ref.targetId}:${ref.subTargetId??''}`;
const isExcluded = (reference, excludedReferences=[]) => excludedReferences.some(item=>sameStableReference(item,reference));

export function createSnapCandidate(store, reference, point, {tolerance=Infinity,excludedReferences=[]}={}) {
  if (isExcluded(reference,excludedReferences)) return null;
  const geometry=referenceGeometryForReference(store,reference);
  const projected=projectPointToReferenceGeometry(point,geometry);
  if (!geometry||!projected) return null;
  const d=pointDistance(point,projected);
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
  const objects=store?.project?.scene?.objects??{};
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
