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

const finiteVector = value => !!value
  && Number.isFinite(value.x)
  && Number.isFinite(value.y)
  && Number.isFinite(value.z);

const lengthSquared = value => value.x * value.x + value.y * value.y + value.z * value.z;
const crossLengthSquared = (a, b) => {
  const x = a.y * b.z - a.z * b.y;
  const y = a.z * b.x - a.x * b.z;
  const z = a.x * b.y - a.y * b.x;
  return x * x + y * y + z * z;
};

export function isGlobalWorkPlaneId(targetId) {
  return Object.values(GlobalWorkPlaneId).includes(targetId);
}

export function isGlobalConstructionAxisId(targetId) {
  return Object.values(GlobalConstructionAxisId).includes(targetId);
}

export function validateWorkPlaneDefinition(definition, label = 'WorkPlane.definition') {
  const errors = [];
  if (!definition || typeof definition !== 'object' || Array.isArray(definition)) return [`${label} fehlt oder ist ungültig.`];
  if (!finiteVector(definition.origin)) errors.push(`${label}.origin muss ein endlicher 3D-Vektor sein.`);
  if (!finiteVector(definition.normal) || lengthSquared(definition.normal) === 0) errors.push(`${label}.normal muss ein endlicher Nicht-Null-Vektor sein.`);
  if (!finiteVector(definition.xAxis) || lengthSquared(definition.xAxis) === 0) errors.push(`${label}.xAxis muss ein endlicher Nicht-Null-Vektor sein.`);
  if (finiteVector(definition.normal) && finiteVector(definition.xAxis)
    && lengthSquared(definition.normal) > 0 && lengthSquared(definition.xAxis) > 0
    && crossLengthSquared(definition.normal, definition.xAxis) <= 1e-20) {
    errors.push(`${label}.normal und xAxis dürfen nicht parallel sein.`);
  }
  return errors;
}

export function validateConstructionAxisDefinition(definition, label = 'ConstructionAxis.definition') {
  const errors = [];
  if (!definition || typeof definition !== 'object' || Array.isArray(definition)) return [`${label} fehlt oder ist ungültig.`];
  if (!finiteVector(definition.origin)) errors.push(`${label}.origin muss ein endlicher 3D-Vektor sein.`);
  if (!finiteVector(definition.direction) || lengthSquared(definition.direction) === 0) errors.push(`${label}.direction muss ein endlicher Nicht-Null-Vektor sein.`);
  return errors;
}

export function validateConstructionReferenceObject(object) {
  const errors = [];
  if (object?.type === ConstructionReferenceObjectType.WORK_PLANE) {
    if (typeof object.data?.workPlaneId !== 'string' || !object.data.workPlaneId) errors.push(`WorkPlane ${object?.objectId ?? 'unbekannt'} benötigt workPlaneId.`);
    errors.push(...validateWorkPlaneDefinition(object.data?.definition, `WorkPlane ${object?.objectId ?? 'unbekannt'}.definition`));
  } else if (object?.type === ConstructionReferenceObjectType.AXIS) {
    if (typeof object.data?.constructionAxisId !== 'string' || !object.data.constructionAxisId) errors.push(`ConstructionAxis ${object?.objectId ?? 'unbekannt'} benötigt constructionAxisId.`);
    errors.push(...validateConstructionAxisDefinition(object.data?.definition, `ConstructionAxis ${object?.objectId ?? 'unbekannt'}.definition`));
  }
  return errors;
}
