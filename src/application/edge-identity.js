import { ReferenceState, ReferenceTargetKind, createStableReference, resolveStableReference } from './stable-reference.js';

const q=value=>Math.round(Number(value)*1e6)/1e6;
const pointKey=p=>[q(p.x),q(p.y),q(p.z)].join(',');
const ordered=(a,b)=>a.localeCompare(b)<=0?[a,b]:[b,a];

export function createEdgeIdentity(a,b){
  const [start,end]=ordered(pointKey(a),pointKey(b));
  return {edgeId:`edge:${start}|${end}`,start,end};
}

export function createFeatureEdgeReference(featureObjectId,edgeIdentity){
  if(!edgeIdentity?.edgeId)throw new Error('Edge reference requires a stable edge identity.');
  return createStableReference(ReferenceTargetKind.EDGE,featureObjectId,'body-output',edgeIdentity.edgeId);
}

export function resolveFeatureEdgeReference(store,reference){
  if(reference?.targetKind!==ReferenceTargetKind.EDGE)return resolveStableReference(store,reference);
  const ownerRef=createStableReference(ReferenceTargetKind.FEATURE_OUTPUT,reference.ownerId,reference.targetId);
  const ownerResolution=resolveStableReference(store,ownerRef);
  if(ownerResolution.state!==ReferenceState.RESOLVED)return {...ownerResolution,reference:{...reference}};
  const identities=store.getObject(reference.ownerId)?.extensions?.edgeIdentities??{};
  if(!identities[reference.subTargetId])return {reference:{...reference},state:ReferenceState.MISSING,diagnostics:[{code:'EDGE_IDENTITY_MISSING',message:`Edge identity missing: ${reference.subTargetId}`}]};
  return {reference:{...reference},state:ReferenceState.RESOLVED,diagnostics:[]};
}

export function recognizeGeometryEdges(geometry){
  const position=geometry?.getAttribute?.('position');
  if(!position)return {};
  const counts=new Map(),points=new Map();
  const index=geometry.index;
  const vertex=i=>({x:position.getX(i),y:position.getY(i),z:position.getZ(i)});
  const triangleCount=index?index.count/3:position.count/3;
  for(let t=0;t<triangleCount;t++){
    const ids=index?[index.getX(t*3),index.getX(t*3+1),index.getX(t*3+2)]:[t*3,t*3+1,t*3+2];
    for(const [i,j] of [[0,1],[1,2],[2,0]]){
      const a=vertex(ids[i]),b=vertex(ids[j]),identity=createEdgeIdentity(a,b);
      counts.set(identity.edgeId,(counts.get(identity.edgeId)??0)+1);points.set(identity.edgeId,identity);
    }
  }
  const result={};
  for(const [id,count] of counts){if(count<=2)result[id]={...points.get(id),adjacentTriangleCount:count};}
  return result;
}

export function publishFeatureEdgeIdentities(object,geometry){
  object.extensions??={};
  object.extensions.edgeIdentities=recognizeGeometryEdges(geometry);
  return object.extensions.edgeIdentities;
}
