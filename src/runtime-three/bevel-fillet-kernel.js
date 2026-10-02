import { meshTopologyWelded, meshSelection } from 'https://cdn.jsdelivr.net/gh/mizchi/three-mbt@bcb6352abf2cc620184f1c1d75a857e523a60cdc/js/topology.js';

// three-mbt topology code is MIT licensed (Copyright (c) 2026 mizchi).
// The dependency is pinned to an exact upstream commit so the topology contract
// used by WD-24C cannot change underneath a saved CM3D project.

const q=value=>Math.round(Number(value)*1e6)/1e6;
const pointKey=p=>[q(p.x),q(p.y),q(p.z)].join(',');
const edgeKey=(a,b)=>{const left=pointKey(a),right=pointKey(b);return `edge:${left.localeCompare(right)<=0?`${left}|${right}`:`${right}|${left}`}`;};
function topologyEdgeIdentity(topology,edge){const [a,b]=topology.edgeVertices(edge).map(vertex=>topology.vertexPosition(vertex));return edgeKey(a,b);}
function selectStableEdges(topology,edgeRefs){
  const requested=new Set((edgeRefs??[]).map(ref=>ref?.subTargetId).filter(Boolean));
  if(!requested.size)throw new RangeError('At least one stable EDGE reference is required.');
  const selection=meshSelection(topology),matched=new Set();
  for(const edge of topology.edges()){const identity=topologyEdgeIdentity(topology,edge);if(requested.has(identity)){selection.setEdge(edge,true);matched.add(identity);}}
  const missing=[...requested].filter(identity=>!matched.has(identity));
  if(missing.length)throw new RangeError(`Stable EDGE identity could not be recognized: ${missing.join(', ')}`);
  return selection;
}
function validatedTopology(geometry){
  const topology=meshTopologyWelded(geometry,0);
  if(topology.boundaryEdges().length)throw new RangeError('Edge modifier requires a closed manifold solid.');
  if(topology.nonmanifoldEdges().length)throw new RangeError('Edge modifier requires manifold edges.');
  if(topology.inconsistentEdges().length)throw new RangeError('Edge modifier requires consistent winding.');
  if(topology.degenerateFaces().length)throw new RangeError('Edge modifier rejects degenerate faces.');
  return topology;
}
export function bevelGeometryByStableEdges(geometry,edgeRefs,width,materialIndex=0){
  if(!Number.isFinite(Number(width))||Number(width)<=0)throw new RangeError('Bevel width must be positive and finite.');
  const topology=validatedTopology(geometry),selection=selectStableEdges(topology,edgeRefs);
  return selection.beveledGeometry(Number(width),Number(materialIndex));
}

// F102 uses the same stable-edge/manifold authority as F053. The fillet is
// represented by deterministic successive tangent chamfers whose setback
// follows a quarter-circle. Each stage is a genuine topology edit performed by
// the pinned half-edge kernel; source vertices are never displaced in place.
// The number of stages is explicit and fixed for the foundation contract.
export const FILLET_SEGMENTS=6;
function filletStageWidths(radius,segments){
  const widths=[];
  for(let i=1;i<=segments;i++){
    const a0=(i-1)*Math.PI/(2*segments),a1=i*Math.PI/(2*segments);
    const delta=radius*(Math.tan(a1/2)-Math.tan(a0/2));
    if(!Number.isFinite(delta)||delta<=0)throw new RangeError('Fillet radius cannot produce a valid segmented round.');
    widths.push(delta);
  }
  return widths;
}
function edgeMidpoint(topology,edge){const [a,b]=topology.edgeVertices(edge).map(vertex=>topology.vertexPosition(vertex));return{x:(a.x+b.x)/2,y:(a.y+b.y)/2,z:(a.z+b.z)/2};}
function distanceSquared(a,b){const x=a.x-b.x,y=a.y-b.y,z=a.z-b.z;return x*x+y*y+z*z;}
function deterministicSuccessorRefs(topology,selection,nextTopology,refs){
  const selected=selection.edges();
  if(selected.length!==refs.length)throw new RangeError('F102 selected EDGE set is not uniquely recognized.');
  const prior=new Set(topology.edges().map(edge=>topologyEdgeIdentity(topology,edge)));
  const generated=nextTopology.edges().filter(edge=>!prior.has(topologyEdgeIdentity(nextTopology,edge)));
  const remaining=new Set(generated);
  const orderedSelected=[...selected].sort((a,b)=>topologyEdgeIdentity(topology,a).localeCompare(topologyEdgeIdentity(topology,b)));
  const byId=new Map(refs.map(ref=>[ref.subTargetId,ref]));
  const nextRefs=[];
  for(const edge of orderedSelected){
    const originalId=topologyEdgeIdentity(topology,edge),origin=edgeMidpoint(topology,edge);
    const candidates=[...remaining].map(candidate=>({edge:candidate,id:topologyEdgeIdentity(nextTopology,candidate),distance:distanceSquared(origin,edgeMidpoint(nextTopology,candidate))})).sort((a,b)=>a.distance-b.distance||a.id.localeCompare(b.id));
    if(!candidates.length)throw new RangeError(`Fillet stage did not create a new tangent ridge from ${originalId}.`);
    if(candidates.length>1&&Math.abs(candidates[0].distance-candidates[1].distance)<=1e-12)throw new RangeError(`Fillet successor EDGE is ambiguous for ${originalId}.`);
    const chosen=candidates[0];remaining.delete(chosen.edge);
    const sourceRef=byId.get(originalId);if(!sourceRef)throw new RangeError(`Stable EDGE identity could not be recognized: ${originalId}`);
    nextRefs.push({...sourceRef,subTargetId:chosen.id});
  }
  return nextRefs;
}
export function filletGeometryByStableEdges(geometry,edgeRefs,radius,segments=FILLET_SEGMENTS,materialIndex=0){
  if(!Number.isFinite(Number(radius))||Number(radius)<=0)throw new RangeError('Fillet radius must be positive and finite.');
  if(!Number.isInteger(segments)||segments<2)throw new RangeError('Fillet requires at least two deterministic round segments.');
  if(!Number.isInteger(materialIndex)||materialIndex<0)throw new RangeError('Fillet material index must be a nonnegative integer.');
  let current=geometry.clone(),refs=edgeRefs.map(ref=>({...ref}));
  try{
    for(const width of filletStageWidths(Number(radius),segments)){
      const topology=validatedTopology(current),selection=selectStableEdges(topology,refs);
      const next=selection.beveledGeometry(width,materialIndex);
      const nextTopology=validatedTopology(next);
      refs=deterministicSuccessorRefs(topology,selection,nextTopology,refs);
      current.dispose?.();current=next;
    }
    validatedTopology(current);
    current.computeVertexNormals();current.computeBoundingBox();current.computeBoundingSphere();
    return current;
  }catch(error){current.dispose?.();throw error;}
}
