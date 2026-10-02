import * as THREE from 'three';
import { installBooleanRuntime } from './boolean.js';

function tubeGeometry(data){
  const shape=new THREE.Shape();
  shape.absarc(0,0,data.outerRadius,0,Math.PI*2,false);
  const hole=new THREE.Path();
  hole.absarc(0,0,data.innerRadius,0,Math.PI*2,true);
  shape.holes.push(hole);
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:data.height,bevelEnabled:false,curveSegments:data.segments??32});
  geometry.translate(0,0,-data.height/2);
  geometry.rotateX(Math.PI/2);
  return geometry;
}

export function installPrimitiveFamilyRuntime(runtime){
  const legacyGeometryFor=runtime.geometryFor.bind(runtime);
  runtime.geometryFor=object=>{
    const data=object?.data??{};
    if(object?.type==='primitive.cone')return new THREE.ConeGeometry(data.radius,data.height,data.segments??32);
    if(object?.type==='primitive.plane')return new THREE.PlaneGeometry(data.width,data.height);
    if(object?.type==='primitive.tube')return tubeGeometry(data);
    if(object?.type==='primitive.torus')return new THREE.TorusGeometry(data.majorRadius,data.tubeRadius,data.radialSegments??16,data.tubularSegments??48);
    return legacyGeometryFor(object);
  };
  installBooleanRuntime(runtime);
  return runtime;
}
