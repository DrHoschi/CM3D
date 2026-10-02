import * as THREE from 'three';
import { PatternKind } from '../application/pattern.js';
import { referenceGeometryForReference, ReferenceGeometryKind } from '../application/reference-geometry.js';
import { publishFeatureEdgeIdentities } from '../application/edge-identity.js';

function transformedClone(source,matrix){const g=source.clone();g.applyMatrix4(matrix);return g;}
function mergedGeometry(parts){
  if(!parts.length)return null;
  const nonIndexed=parts.map(g=>g.index?g.toNonIndexed():g.clone()),positions=[],normals=[];
  for(const g of nonIndexed){const p=g.getAttribute('position'),n=g.getAttribute('normal');if(!p){nonIndexed.forEach(x=>x.dispose?.());return null;}positions.push(...p.array);if(n)normals.push(...n.array);}
  const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));if(normals.length===positions.length)out.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));else out.computeVertexNormals();out.computeBoundingBox();out.computeBoundingSphere();nonIndexed.forEach(g=>g.dispose?.());return out;
}
function linearParts(source,data){const d=new THREE.Vector3(data.direction.x,data.direction.y,data.direction.z).normalize();return Array.from({length:data.count},(_,i)=>transformedClone(source,new THREE.Matrix4().makeTranslation(d.x*data.spacing*i,d.y*data.spacing*i,d.z*data.spacing*i)));}
function radialParts(source,data,axis){
  if(axis?.kind!==ReferenceGeometryKind.LINE)return [];
  const origin=new THREE.Vector3(axis.origin.x,axis.origin.y,axis.origin.z),direction=new THREE.Vector3(axis.direction.x,axis.direction.y,axis.direction.z).normalize();
  return Array.from({length:data.count},(_,i)=>{if(i===0)return source.clone();const angle=data.angle*i/(data.count-1),toOrigin=new THREE.Matrix4().makeTranslation(-origin.x,-origin.y,-origin.z),rotation=new THREE.Matrix4().makeRotationAxis(direction,angle),back=new THREE.Matrix4().makeTranslation(origin.x,origin.y,origin.z);return transformedClone(source,new THREE.Matrix4().multiplyMatrices(back,rotation).multiply(toOrigin));});
}
export function installPatternRuntime(runtime){
  const baseGeometryFor=runtime.geometryFor.bind(runtime),evaluating=new Set();
  runtime.geometryFor=object=>{
    if(object?.type!=='feature.pattern')return baseGeometryFor(object);if(evaluating.has(object.objectId))return null;evaluating.add(object.objectId);
    try{const source=runtime.store.getObject(object.data?.sourceRef?.ownerId);if(!source)return null;const sourceGeometry=baseGeometryFor(source);if(!sourceGeometry)return null;try{let parts=[];if(object.data.kind===PatternKind.LINEAR)parts=linearParts(sourceGeometry,object.data);else if(object.data.kind===PatternKind.RADIAL){const axis=referenceGeometryForReference(runtime.store,object.data.axisRef);parts=radialParts(sourceGeometry,object.data,axis);}const geometry=mergedGeometry(parts);parts.forEach(g=>g.dispose?.());if(geometry)publishFeatureEdgeIdentities(object,geometry);return geometry;}finally{sourceGeometry.dispose?.();}}finally{evaluating.delete(object.objectId);}
  };return runtime;
}
