import { extrudePlanarFaceDefinition, isExtrudePlanarFaceId, validateExtrudePlanarFaceOwner } from './planar-face-reference.js';

export const ConstructionReferenceObjectType = Object.freeze({
  WORK_PLANE: 'construction.workPlane',
  AXIS: 'construction.axis'
});

export const SYSTEM_CONSTRUCTION_OWNER_ID = 'system:construction';

export const GlobalWorkPlaneId = Object.freeze({
  XY: 'GLOBAL_XY',
  XZ: 'GLOBAL_XZ',
  YZ: 'GLOBAL_YZ'
});

export const GlobalConstructionAxisId = Object.freeze({
  X: 'GLOBAL_X',
  Y: 'GLOBAL_Y',
  Z: 'GLOBAL_Z'
});

export const WorkPlaneDerivationKind = Object.freeze({ OFFSET: 'OFFSET' });

const vector = (x, y, z) => ({ x, y, z });

export const GlobalWorkPlaneDefinition = Object.freeze({
  [GlobalWorkPlaneId.XY]: Object.freeze({ origin:Object.freeze(vector(0,0,0)), normal:Object.freeze(vector(0,0,1)), xAxis:Object.freeze(vector(1,0,0)) }),
  [GlobalWorkPlaneId.XZ]: Object.freeze({ origin:Object.freeze(vector(0,0,0)), normal:Object.freeze(vector(0,1,0)), xAxis:Object.freeze(vector(1,0,0)) }),
  [GlobalWorkPlaneId.YZ]: Object.freeze({ origin:Object.freeze(vector(0,0,0)), normal:Object.freeze(vector(1,0,0)), xAxis:Object.freeze(vector(0,1,0)) })
});

export const GlobalConstructionAxisDefinition = Object.freeze({
  [GlobalConstructionAxisId.X]: Object.freeze({ origin:Object.freeze(vector(0,0,0)), direction:Object.freeze(vector(1,0,0)) }),
  [GlobalConstructionAxisId.Y]: Object.freeze({ origin:Object.freeze(vector(0,0,0)), direction:Object.freeze(vector(0,1,0)) }),
  [GlobalConstructionAxisId.Z]: Object.freeze({ origin:Object.freeze(vector(0,0,0)), direction:Object.freeze(vector(0,0,1)) })
});

const finiteVector = value => !!value && Number.isFinite(value.x) && Number.isFinite(value.y) && Number.isFinite(value.z);
const lengthSquared = value => value.x * value.x + value.y * value.y + value.z * value.z;
const crossLengthSquared = (a, b) => {
  const x = a.y * b.z - a.z * b.y;
  const y = a.z * b.x - a.x * b.z;
  const z = a.x * b.y - a.y * b.x;
  return x * x + y * y + z * z;
};
const normalize = value => {
  const length = Math.hypot(value.x, value.y, value.z);
  return length > 0 ? { x:value.x/length, y:value.y/length, z:value.z/length } : null;
};
const cloneDefinition = definition => ({ origin:{...definition.origin}, normal:{...definition.normal}, xAxis:{...definition.xAxis} });

export function isGlobalWorkPlaneId(targetId) { return Object.values(GlobalWorkPlaneId).includes(targetId); }
export function isGlobalConstructionAxisId(targetId) { return Object.values(GlobalConstructionAxisId).includes(targetId); }

export function validateWorkPlaneDefinition(definition, label = 'WorkPlane.definition') {
  const errors = [];
  if (!definition || typeof definition !== 'object' || Array.isArray(definition)) return [`${label} fehlt oder ist ungültig.`];
  if (!finiteVector(definition.origin)) errors.push(`${label}.origin muss ein endlicher 3D-Vektor sein.`);
  if (!finiteVector(definition.normal) || lengthSquared(definition.normal) === 0) errors.push(`${label}.normal muss ein endlicher Nicht-Null-Vektor sein.`);
  if (!finiteVector(definition.xAxis) || lengthSquared(definition.xAxis) === 0) errors.push(`${label}.xAxis muss ein endlicher Nicht-Null-Vektor sein.`);
  if (finiteVector(definition.normal) && finiteVector(definition.xAxis) && lengthSquared(definition.normal) > 0 && lengthSquared(definition.xAxis) > 0 && crossLengthSquared(definition.normal, definition.xAxis) <= 1e-20) errors.push(`${label}.normal und xAxis dürfen nicht parallel sein.`);
  return errors;
}

export function validateConstructionAxisDefinition(definition, label = 'ConstructionAxis.definition') {
  const errors = [];
  if (!definition || typeof definition !== 'object' || Array.isArray(definition)) return [`${label} fehlt oder ist ungültig.`];
  if (!finiteVector(definition.origin)) errors.push(`${label}.origin muss ein endlicher 3D-Vektor sein.`);
  if (!finiteVector(definition.direction) || lengthSquared(definition.direction) === 0) errors.push(`${label}.direction muss ein endlicher Nicht-Null-Vektor sein.`);
  return errors;
}

export function validateWorkPlaneDerivation(derivation, label = 'WorkPlane.derivation') {
  const errors = [];
  if (!derivation || typeof derivation !== 'object' || Array.isArray(derivation)) return [`${label} fehlt oder ist ungültig.`];
  if (derivation.kind !== WorkPlaneDerivationKind.OFFSET) errors.push(`${label}.kind muss OFFSET sein.`);
  const ref = derivation.sourceRef;
  if (!ref || typeof ref !== 'object' || Array.isArray(ref)) errors.push(`${label}.sourceRef fehlt oder ist ungültig.`);
  else {
    if (!['WORK_PLANE','PLANAR_FACE'].includes(ref.targetKind)) errors.push(`${label}.sourceRef.targetKind muss WORK_PLANE oder PLANAR_FACE sein.`);
    if (typeof ref.ownerId !== 'string' || !ref.ownerId) errors.push(`${label}.sourceRef.ownerId fehlt.`);
    if (typeof ref.targetId !== 'string' || !ref.targetId) errors.push(`${label}.sourceRef.targetId fehlt.`);
    if (ref.subTargetId != null) errors.push(`${label}.sourceRef.subTargetId ist nicht zulässig.`);
  }
  if (!Number.isFinite(derivation.offsetMm)) errors.push(`${label}.offsetMm muss endlich sein.`);
  return errors;
}

export function validateConstructionReferenceObject(object) {
  const errors = [];
  if (object?.type === ConstructionReferenceObjectType.WORK_PLANE) {
    const label = `WorkPlane ${object?.objectId ?? 'unbekannt'}`;
    if (typeof object.data?.workPlaneId !== 'string' || !object.data.workPlaneId) errors.push(`${label} benötigt workPlaneId.`);
    const hasDefinition = object.data?.definition != null;
    const hasDerivation = object.data?.derivation != null;
    if (hasDefinition === hasDerivation) errors.push(`${label} benötigt exakt definition oder derivation.`);
    else if (hasDefinition) errors.push(...validateWorkPlaneDefinition(object.data.definition, `${label}.definition`));
    else errors.push(...validateWorkPlaneDerivation(object.data.derivation, `${label}.derivation`));
  } else if (object?.type === ConstructionReferenceObjectType.AXIS) {
    if (typeof object.data?.constructionAxisId !== 'string' || !object.data.constructionAxisId) errors.push(`ConstructionAxis ${object?.objectId ?? 'unbekannt'} benötigt constructionAxisId.`);
    errors.push(...validateConstructionAxisDefinition(object.data?.definition, `ConstructionAxis ${object?.objectId ?? 'unbekannt'}.definition`));
  }
  return errors;
}

export function resolveWorkPlaneDefinition(store, reference, visited = new Set()) {
  const result = (state, definition = null, diagnostics = []) => ({ state, definition, diagnostics });
  if (!reference || reference.targetKind !== 'WORK_PLANE') return result('INVALID', null, [{code:'WORK_PLANE_REFERENCE_INVALID',message:'WORK_PLANE-Referenz fehlt oder ist ungültig.'}]);
  if (reference.ownerId === SYSTEM_CONSTRUCTION_OWNER_ID) {
    const definition = GlobalWorkPlaneDefinition[reference.targetId];
    return definition ? result('RESOLVED', cloneDefinition(definition)) : result('MISSING', null, [{code:'SYSTEM_WORK_PLANE_MISSING',message:`Globale Arbeitsebene fehlt: ${reference.targetId}`}]);
  }
  const owner = store?.getObject?.(reference.ownerId) ?? null;
  if (!owner) return result('MISSING', null, [{code:'OWNER_MISSING',message:`Referenz-Eigentümer fehlt: ${reference.ownerId}`}]);
  if (owner.type !== ConstructionReferenceObjectType.WORK_PLANE) return result('INVALID', null, [{code:'OWNER_KIND_MISMATCH',message:`${reference.ownerId} ist keine Arbeitsebene.`}]);
  if (owner.data?.workPlaneId !== reference.targetId) return result('MISSING', null, [{code:'IDENTITY_MISSING',message:`Persistente WorkPlane-Identität fehlt: ${reference.targetId}`}]);
  if (visited.has(owner.objectId)) return result('BLOCKED', null, [{code:'DEPENDENCY_CYCLE',message:`WorkPlane-Zyklus bei ${owner.objectId}.`}]);
  if (owner.data?.definition != null) {
    const errors = validateWorkPlaneDefinition(owner.data.definition);
    return errors.length ? result('INVALID', null, errors.map(message=>({code:'CONSTRUCTION_DEFINITION_INVALID',message}))) : result('RESOLVED', cloneDefinition(owner.data.definition));
  }
  const errors = validateWorkPlaneDerivation(owner.data?.derivation);
  if (errors.length) return result('INVALID', null, errors.map(message=>({code:'WORK_PLANE_DERIVATION_INVALID',message})));
  const nextVisited = new Set(visited); nextVisited.add(owner.objectId);
  const sourceRef = owner.data.derivation.sourceRef;
  let source;
  if (sourceRef.targetKind === 'WORK_PLANE') source = resolveWorkPlaneDefinition(store, sourceRef, nextVisited);
  else {
    const sourceOwner = store?.getObject?.(sourceRef.ownerId) ?? null;
    if (!sourceOwner) source = result('MISSING', null, [{code:'OWNER_MISSING',message:`Referenz-Eigentümer fehlt: ${sourceRef.ownerId}`}]);
    else if (sourceOwner.type !== 'feature.extrude') source = result('INVALID', null, [{code:'OWNER_KIND_MISMATCH',message:`${sourceRef.ownerId} ist keine Extrusion.`}]);
    else if (!isExtrudePlanarFaceId(sourceRef.targetId)) source = result('MISSING', null, [{code:'PLANAR_FACE_MISSING',message:`Planare Extrude-Fläche fehlt: ${sourceRef.targetId}`}]);
    else if (sourceOwner.extensions?.recomputeState?.state === 'BLOCKED') source = result('BLOCKED', null, [{code:'OWNER_BLOCKED',message:`Extrusion ${sourceRef.ownerId} ist blockiert.`}]);
    else {
      const faceErrors = validateExtrudePlanarFaceOwner(sourceOwner);
      const definition = faceErrors.length ? null : extrudePlanarFaceDefinition(sourceOwner, sourceRef.targetId);
      source = faceErrors.length || !definition ? result('INVALID', null, faceErrors.map(message=>({code:'PLANAR_FACE_OWNER_INVALID',message}))) : result('RESOLVED', definition);
    }
  }
  if (source.state !== 'RESOLVED') return source;
  const normal = normalize(source.definition.normal);
  if (!normal) return result('INVALID', null, [{code:'SOURCE_NORMAL_INVALID',message:'Quellnormalenvektor ist ungültig.'}]);
  const offset = owner.data.derivation.offsetMm;
  return result('RESOLVED', {
    origin:{ x:source.definition.origin.x + normal.x*offset, y:source.definition.origin.y + normal.y*offset, z:source.definition.origin.z + normal.z*offset },
    normal:{...source.definition.normal},
    xAxis:{...source.definition.xAxis}
  });
}
