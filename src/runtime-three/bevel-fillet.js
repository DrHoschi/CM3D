import { bevelGeometryByStableEdges, filletGeometryByStableEdges } from './bevel-fillet-kernel.js';
import { publishFeatureEdgeIdentities } from '../application/edge-identity.js';

export function installBevelFilletRuntime(runtime){
  const baseGeometryFor=runtime.geometryFor.bind(runtime),evaluating=new Set();
  runtime.geometryFor=object=>{
    if(object?.type!=='feature.edge-modifier'){
      const geometry=baseGeometryFor(object);
      if(geometry&&String(object?.type??'').startsWith('feature.'))publishFeatureEdgeIdentities(object,geometry);
      return geometry;
    }
    if(evaluating.has(object.objectId))return null;
    evaluating.add(object.objectId);
    try{
      const source=runtime.store.getObject(object.data?.sourceRef?.ownerId);if(!source)return null;
      const sourceGeometry=baseGeometryFor(source);if(!sourceGeometry)return null;
      try{
        publishFeatureEdgeIdentities(source,sourceGeometry);
        const amount=Number(object.data?.amount),refs=object.data?.edgeRefs??[];
        const geometry=object.data?.mode==='BEVEL'
          ?bevelGeometryByStableEdges(sourceGeometry,refs,amount)
          :object.data?.mode==='FILLET'?filletGeometryByStableEdges(sourceGeometry,refs,amount):null;
        if(geometry)publishFeatureEdgeIdentities(object,geometry);
        return geometry;
      }finally{sourceGeometry.dispose?.();}
    }finally{evaluating.delete(object.objectId);}
  };
  return runtime;
}
