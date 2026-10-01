import {
  ReferenceGeometryKind,
  dotVector,
  normalizeVector,
  pointDistance,
  projectPointToReferenceGeometry,
  referenceGeometryForReference
} from './reference-geometry.js';

export const MeasurementState = Object.freeze({ VALID:'VALID', INVALID:'INVALID' });
export const MeasurementKind = Object.freeze({ DISTANCE:'DISTANCE', ANGLE:'ANGLE' });
export const MeasurementUnit = Object.freeze({ METER:'METER', RADIAN:'RADIAN' });
export const MeasurementRelation = Object.freeze({
  POINT_POINT:'POINT_POINT',
  POINT_LINE:'POINT_LINE',
  POINT_PLANE:'POINT_PLANE',
  LINE_LINE:'LINE_LINE',
  PLANE_PLANE:'PLANE_PLANE'
});
export const MeasurementInvalidReason = Object.freeze({
  UNRESOLVED_REFERENCE:'UNRESOLVED_REFERENCE',
  UNSUPPORTED_RELATION:'UNSUPPORTED_RELATION',
  DEGENERATE_GEOMETRY:'DEGENERATE_GEOMETRY'
});

const invalid = (references, reason) => ({
  state:MeasurementState.INVALID,
  kind:null,
  value:null,
  unit:null,
  references:references.map(reference=>reference?{...reference}:reference),
  relation:null,
  reason
});

const valid = (references, relation, kind, unit, value) => ({
  state:MeasurementState.VALID,
  kind,
  value,
  unit,
  references:references.map(reference=>({...reference})),
  relation,
  reason:null
});

const acuteAngle = (a,b) => {
  const na=normalizeVector(a), nb=normalizeVector(b);
  if (!na||!nb) return null;
  const cosine=Math.min(1,Math.max(-1,Math.abs(dotVector(na,nb))));
  const angle=Math.acos(cosine);
  return Number.isFinite(angle)?angle:null;
};

export function measureReferences(store, referenceA, referenceB) {
  const references=[referenceA,referenceB];
  const a=referenceGeometryForReference(store,referenceA);
  const b=referenceGeometryForReference(store,referenceB);
  if (!a||!b) return invalid(references,MeasurementInvalidReason.UNRESOLVED_REFERENCE);

  if (a.kind===ReferenceGeometryKind.POINT && b.kind===ReferenceGeometryKind.POINT) {
    const value=pointDistance(a.position,b.position);
    return Number.isFinite(value)?valid(references,MeasurementRelation.POINT_POINT,MeasurementKind.DISTANCE,MeasurementUnit.METER,value):invalid(references,MeasurementInvalidReason.DEGENERATE_GEOMETRY);
  }

  if ((a.kind===ReferenceGeometryKind.POINT && b.kind===ReferenceGeometryKind.LINE)||(a.kind===ReferenceGeometryKind.LINE && b.kind===ReferenceGeometryKind.POINT)) {
    const point=a.kind===ReferenceGeometryKind.POINT?a.position:b.position;
    const line=a.kind===ReferenceGeometryKind.LINE?a:b;
    const projected=projectPointToReferenceGeometry(point,line);
    const value=projected?pointDistance(point,projected):NaN;
    return Number.isFinite(value)?valid(references,MeasurementRelation.POINT_LINE,MeasurementKind.DISTANCE,MeasurementUnit.METER,value):invalid(references,MeasurementInvalidReason.DEGENERATE_GEOMETRY);
  }

  if ((a.kind===ReferenceGeometryKind.POINT && b.kind===ReferenceGeometryKind.PLANE)||(a.kind===ReferenceGeometryKind.PLANE && b.kind===ReferenceGeometryKind.POINT)) {
    const point=a.kind===ReferenceGeometryKind.POINT?a.position:b.position;
    const plane=a.kind===ReferenceGeometryKind.PLANE?a:b;
    const projected=projectPointToReferenceGeometry(point,plane);
    const value=projected?pointDistance(point,projected):NaN;
    return Number.isFinite(value)?valid(references,MeasurementRelation.POINT_PLANE,MeasurementKind.DISTANCE,MeasurementUnit.METER,value):invalid(references,MeasurementInvalidReason.DEGENERATE_GEOMETRY);
  }

  if (a.kind===ReferenceGeometryKind.LINE && b.kind===ReferenceGeometryKind.LINE) {
    const value=acuteAngle(a.direction,b.direction);
    return value!==null?valid(references,MeasurementRelation.LINE_LINE,MeasurementKind.ANGLE,MeasurementUnit.RADIAN,value):invalid(references,MeasurementInvalidReason.DEGENERATE_GEOMETRY);
  }

  if (a.kind===ReferenceGeometryKind.PLANE && b.kind===ReferenceGeometryKind.PLANE) {
    const value=acuteAngle(a.normal,b.normal);
    return value!==null?valid(references,MeasurementRelation.PLANE_PLANE,MeasurementKind.ANGLE,MeasurementUnit.RADIAN,value):invalid(references,MeasurementInvalidReason.DEGENERATE_GEOMETRY);
  }

  return invalid(references,MeasurementInvalidReason.UNSUPPORTED_RELATION);
}
