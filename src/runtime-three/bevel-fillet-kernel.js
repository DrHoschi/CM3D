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
export function filletGeometryByStableEdges(geometry,edgeRefs,radius,segments=FILLET_SEGMENTS,materialIndex=0){
  if(!Number.isFinite(Number(radius))||Number(radius)<=0)throw new RangeError('Fillet radius must be positive and finite.');
  if(!Number.isInteger(segments)||segments<2)throw new RangeError('Fillet requires at least two deterministic round segments.');
  if(!Number.isInteger(materialIndex)||materialIndex<0)throw new RangeError('Fillet material index must be a nonnegative integer.');
  let current=geometry.clone(),refs=edgeRefs.map(ref=>({...ref}));
  try{
    for(const width of filletStageWidths(Number(radius),segments)){
      const topology=validatedTopology(current),selection=selectStableEdges(topology,refs);
      const next=selection.beveledGeometry(width,materialIndex);
      const selected=selection.edges();
      if(selected.length!==1){next.dispose?.();throw new RangeError('F102 foundation supports exactly one stable EDGE per fillet feature.');}
      const original=topologyEdgeIdentity(topology,selected[0]);
      const nextTopology=validatedTopology(next);
      const candidates=nextTopology.edges().map(edge=>({edge,id:topologyEdgeIdentity(nextTopology,edge)}));
      const prior=new Set(topology.edges().map(edge=>topologyEdgeIdentity(topology,edge)));
      const generated=candidates.filter(candidate=>!prior.has(candidate.id));
      if(!generated.length){next.dispose?.();throw new RangeError(`Fillet stage did not create a new tangent ridge from ${original}.`);}
      generated.sort((a,b)=>a.id.localeCompare(b.id));
      refs=[{...refs[0],subTargetId:generated[0].id}];
      current.dispose?.();current=next;
    }
    validatedTopology(current);
    current.computeVertexNormals();current.computeBoundingBox();current.computeBoundingSphere();
    return current;
  }catch(error){current.dispose?.();throw error;}
}
