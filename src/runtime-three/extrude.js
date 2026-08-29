import * as THREE from 'three';

export function installExtrudeRuntime(runtime) {
  const baseGeometryFor = runtime.geometryFor.bind(runtime);
  runtime.geometryFor = object => {
    if (object?.type !== 'feature.extrude') return baseGeometryFor(object);
    const points = object.data?.profile?.points;
    const depth = Number(object.data?.depth);
    if (!Array.isArray(points) || points.length < 3 || !Number.isFinite(depth) || depth <= 0) return null;

    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, points[0].y);
    for (let i=1;i<points.length;i++) shape.lineTo(points[i].x, points[i].y);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,steps:1});
    const direction = object.data?.direction ?? 'positive';
    if (direction === 'negative') geometry.translate(0,0,-depth);
    if (direction === 'symmetric') geometry.translate(0,0,-depth/2);
    geometry.computeVertexNormals();
    return geometry;
  };
}
