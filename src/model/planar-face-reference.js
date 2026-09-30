export const ExtrudePlanarFaceId = Object.freeze({
  CAP_START: 'CAP_START',
  CAP_END: 'CAP_END'
});

const faceIds = new Set(Object.values(ExtrudePlanarFaceId));
const directions = new Set(['positive', 'negative', 'symmetric']);
const finiteNumber = value => Number.isFinite(value);
const finiteVector3 = value => !!value
  && finiteNumber(value.x)
  && finiteNumber(value.y)
  && finiteNumber(value.z);

export function isExtrudePlanarFaceId(value) {
  return faceIds.has(value);
}

export function validateExtrudePlanarFaceOwner(owner) {
  const errors = [];
  if (!owner || owner.type !== 'feature.extrude') {
    errors.push('Planare Extrude-Fläche benötigt einen feature.extrude-Eigentümer.');
    return errors;
  }
  const depth = owner.data?.depth;
  const direction = owner.data?.direction;
  if (!finiteNumber(depth) || depth <= 0) errors.push('Extrude-Tiefe muss endlich und größer als 0 sein.');
  if (!directions.has(direction)) errors.push('Extrude-Richtung ist ungültig.');
  if (!owner.data?.sourceSketchRef) errors.push('Extrude besitzt keine stabile Quellskizzen-Referenz.');
  if (!owner.data?.profile) errors.push('Extrude besitzt kein berechenbares Profil.');
  const transform = owner.transform;
  if (!finiteVector3(transform?.position)) errors.push('Extrude-Position ist ungültig.');
  if (!finiteVector3(transform?.rotation)) errors.push('Extrude-Rotation ist ungültig.');
  if (!finiteVector3(transform?.scale) || transform.scale.x === 0 || transform.scale.y === 0 || transform.scale.z === 0) {
    errors.push('Extrude-Skalierung ist ungültig.');
  }
  return errors;
}

const rotateEulerXYZ = (vector, rotation) => {
  let { x, y, z } = vector;
  const cx = Math.cos(rotation.x), sx = Math.sin(rotation.x);
  const cy = Math.cos(rotation.y), sy = Math.sin(rotation.y);
  const cz = Math.cos(rotation.z), sz = Math.sin(rotation.z);

  [y, z] = [y * cx - z * sx, y * sx + z * cx];
  [x, z] = [x * cy + z * sy, -x * sy + z * cy];
  [x, y] = [x * cz - y * sz, x * sz + y * cz];
  return { x, y, z };
};

const normalize = vector => {
  const length = Math.hypot(vector.x, vector.y, vector.z);
  return length > 0 ? { x: vector.x / length, y: vector.y / length, z: vector.z / length } : null;
};

export function localExtrudeCapDefinition(owner, faceId) {
  if (validateExtrudePlanarFaceOwner(owner).length || !isExtrudePlanarFaceId(faceId)) return null;
  const depth = owner.data.depth;
  const direction = owner.data.direction;
  let startZ = 0;
  let endZ = depth;
  let startNormalZ = -1;
  let endNormalZ = 1;

  if (direction === 'negative') {
    startZ = 0;
    endZ = -depth;
    startNormalZ = 1;
    endNormalZ = -1;
  } else if (direction === 'symmetric') {
    startZ = -depth / 2;
    endZ = depth / 2;
  }

  const start = faceId === ExtrudePlanarFaceId.CAP_START;
  return {
    origin: { x: 0, y: 0, z: start ? startZ : endZ },
    normal: { x: 0, y: 0, z: start ? startNormalZ : endNormalZ },
    xAxis: { x: 1, y: 0, z: 0 }
  };
}

export function extrudePlanarFaceDefinition(owner, faceId) {
  const local = localExtrudeCapDefinition(owner, faceId);
  if (!local) return null;
  const { position, rotation, scale } = owner.transform;
  const scaledOrigin = {
    x: local.origin.x * scale.x,
    y: local.origin.y * scale.y,
    z: local.origin.z * scale.z
  };
  const rotatedOrigin = rotateEulerXYZ(scaledOrigin, rotation);
  const normal = normalize(rotateEulerXYZ({
    x: local.normal.x / scale.x,
    y: local.normal.y / scale.y,
    z: local.normal.z / scale.z
  }, rotation));
  const xAxis = normalize(rotateEulerXYZ({ x: scale.x, y: 0, z: 0 }, rotation));
  if (!normal || !xAxis) return null;
  return {
    origin: {
      x: position.x + rotatedOrigin.x,
      y: position.y + rotatedOrigin.y,
      z: position.z + rotatedOrigin.z
    },
    normal,
    xAxis
  };
}
