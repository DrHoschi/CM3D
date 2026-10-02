import * as THREE from 'three';

export function installRevolveRuntime(runtime){
  const baseGeometryFor=runtime.geometryFor.bind(runtime);
  runtime.geometryFor=object=>{
    if(object?.type!=='feature.revolve')return baseGeometryFor(object);
    const profile=object.data?.revolveProfile,axis=object.data?.axis,angleDeg=Number(object.data?.angleDeg),direction=object.data?.direction??'positive';
    if(!Array.isArray(profile)||profile.length<2||!axis||!Number.isFinite(angleDeg)||angleDeg<=0||angleDeg>360)return null;
    const points=profile.map(point=>new THREE.Vector2(Number(point.radius),Number(point.axial)));
    if(points.some(point=>!Number.isFinite(point.x)||!Number.isFinite(point.y)))return null;
    const phiLength=THREE.MathUtils.degToRad(angleDeg)*(direction==='negative'?-1:1);
    const geometry=new THREE.LatheGeometry(points,Math.max(8,Math.ceil(angleDeg/10)),0,phiLength);
    const x=new THREE.Vector3(axis.xAxis.x,axis.xAxis.y,axis.xAxis.z),y=new THREE.Vector3(axis.direction.x,axis.direction.y,axis.direction.z),z=new THREE.Vector3(axis.zAxis.x,axis.zAxis.y,axis.zAxis.z);
    const matrix=new THREE.Matrix4().makeBasis(x,y,z);matrix.setPosition(axis.origin.x,axis.origin.y,axis.origin.z);geometry.applyMatrix4(matrix);geometry.computeVertexNormals();return geometry;
  };
}
