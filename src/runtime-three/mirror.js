import * as THREE from 'three';
import { referenceGeometryForReference, ReferenceGeometryKind } from '../application/reference-geometry.js';
import { publishFeatureEdgeIdentities } from '../application/edge-identity.js';

function reflectedGeometry(sourceGeometry,plane){
  if(!sourceGeometry||plane?.kind!==ReferenceGeometryKind.PLANE)return null;
  const geometry=sourceGeometry.clone();
  const position=geometry.getAttribute('position');if(!position)return null;
  const origin=new THREE.Vector3(plane.origin.x,plane.origin.y,plane.origin.z);
  const normal=new THREE.Vector3(plane.normal.x,plane.normal.y,plane.normal.z).normalize();
  const point=new THREE.Vector3();
  for(let i=0;i<position.count;i++){
    point.fromBufferAttribute(position,i);
    point.addScaledVector(normal,-2*point.clone().sub(origin).dot(normal));
    position.setXYZ(i,point.x,point.y,point.z);
  }
  if(geometry.index){
    const index=geometry.index;
    for(let i=0;i<index.count;i+=3){const b=index.getX(i+1);index.setX(i+1,index.getX(i+2));index.setX(i+2,b);}
    index.needsUpdate=true;
  }else{
    const attrs=Object.values(geometry.attributes);
    for(let i=0;i<position.count;i+=3)for(const attr of attrs)for(let c=0;c<attr.itemSize;c++){const b=attr.getComponent(i+1,c);attr.setComponent(i+1,c,attr.getComponent(i+2,c));attr.setComponent(i+2,c,b);}
  }
  position.needsUpdate=true;
  geometry.deleteAttribute('normal');geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
  return geometry;
}

export function installMirrorRuntime(runtime){
  const baseGeometryFor=runtime.geometryFor.bind(runtime),evaluating=new Set();
  runtime.geometryFor=object=>{
    if(object?.type!=='feature.mirror')return baseGeometryFor(object);
    if(evaluating.has(object.objectId))return null;
    evaluating.add(object.objectId);
    try{
      const source=runtime.store.getObject(object.data?.sourceRef?.ownerId);if(!source)return null;
      const sourceGeometry=baseGeometryFor(source);if(!sourceGeometry)return null;
      try{
        const plane=referenceGeometryForReference(runtime.store,object.data?.planeRef);if(plane?.kind!==ReferenceGeometryKind.PLANE)return null;
        const geometry=reflectedGeometry(sourceGeometry,plane);
        if(geometry)publishFeatureEdgeIdentities(object,geometry);
        return geometry;
      }finally{sourceGeometry.dispose?.();}
    }finally{evaluating.delete(object.objectId);}
  };
  return runtime;
}
