import * as THREE from 'three';

const addContour = (path, points) => {
  if (!Array.isArray(points) || points.length < 3) return false;
  path.moveTo(points[0].x, points[0].y);
  for (let index=1; index<points.length; index += 1) path.lineTo(points[index].x, points[index].y);
  path.closePath();
  return true;
};

const shapeForProfile = profile => {
  const shape = new THREE.Shape();
  if (!addContour(shape, profile?.points)) return null;
  for (const hole of profile?.holes ?? []) {
    const path = new THREE.Path();
    if (addContour(path, hole?.points)) shape.holes.push(path);
  }
  return shape;
};

export function installExtrudeRuntime(runtime) {
  const baseGeometryFor = runtime.geometryFor.bind(runtime);
  runtime.geometryFor = object => {
    if (!['feature.extrude','feature.thin-extrude'].includes(object?.type)) return baseGeometryFor(object);
    const depth = Number(object.data?.depth);
    if (!Number.isFinite(depth) || depth <= 0) return null;

    const profiles = object.type === 'feature.thin-extrude'
      ? Array.isArray(object.data?.contour) && object.data.contour.length ? [{ points:object.data.contour, holes:[] }] : []
      : Array.isArray(object.data?.profiles) && object.data.profiles.length
        ? object.data.profiles
        : object.data?.profile
          ? [{ ...object.data.profile, holes:[] }]
          : [];
    const shapes = profiles.map(shapeForProfile).filter(Boolean);
    if (!shapes.length) return null;

    const geometry = new THREE.ExtrudeGeometry(shapes,{depth,bevelEnabled:false,steps:1});
    const direction = object.data?.direction ?? 'positive';
    if (direction === 'negative') geometry.translate(0,0,-depth);
    if (direction === 'symmetric') geometry.translate(0,0,-depth/2);
    geometry.computeVertexNormals();
    return geometry;
  };
}
