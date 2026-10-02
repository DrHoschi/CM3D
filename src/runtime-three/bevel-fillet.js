import * as THREE from 'three';
import { publishFeatureEdgeIdentities } from '../application/edge-identity.js';

function cloneGeometry(geometry){const clone=geometry?.clone?.()??null;if(clone){clone.computeVertexNormals();clone.computeBoundingBox();clone.computeBoundingSphere();}return clone;}

function selectedVertices(geometry,edgeRefs){
  const ids=new Set((edgeRefs??[]).map(ref=>ref.subTargetId));
  const position=geometry?.getAttribute?.('position');if(!position)return new Set();
  const selected=new Set();
  const key=p=>[Math.round(p.x*1e6)/1e6,Math.round(p.y*1e6)/1e6,Math.round(p.z*1e6)/1e6].join(',');
  for(let i=0;i<position.count;i++){
    const p={x:position.getX(i),y:position.getY(i),z:position.getZ(i)};
    for(const id of ids)if(id.includes(key(p)))selected.add(i);
  }
  return selected;
}

function applyConstantEdgeModifier(source,object){
  const geometry=cloneGeometry(source);if(!geometry)return null;
  const position=geometry.getAttribute('position'),normal=geometry.getAttribute('normal');
  const selected=selectedVertices(geometry,object.data?.edgeRefs);
  const amount=Number(object.data?.amount??0);
  const factor=object.data?.mode==='BEVEL'?0.5:0.35;
  for(const i of selected){position.setXYZ(i,position.getX(i)-normal.getX(i)*amount*factor,position.getY(i)-normal.getY(i)*amount*factor,position.getZ(i)-normal.getZ(i)*amount*factor);}
  position.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}

export function installBevelFilletRuntime(runtime){
  const base=runtime.geometryFor.bind(runtime);
  runtime.geometryFor=object=>{
    if(object?.type!=='feature.edge-modifier'){
      const geometry=base(object);
      if(geometry&&String(object?.type??'').startsWith('feature.'))publishFeatureEdgeIdentities(object,geometry);
      return geometry;
    }
    const source=runtime.store.getObject(object.data?.sourceRef?.ownerId);if(!source)return null;
    const sourceGeometry=base(source);if(!sourceGeometry)return null;
    publishFeatureEdgeIdentities(source,sourceGeometry);
    const geometry=applyConstantEdgeModifier(sourceGeometry,object);sourceGeometry.dispose?.();
    if(geometry)publishFeatureEdgeIdentities(object,geometry);return geometry;
  };
  return runtime;
}
