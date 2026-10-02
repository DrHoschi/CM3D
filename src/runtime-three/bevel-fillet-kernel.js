import { meshTopologyWelded, meshSelection } from 'https://cdn.jsdelivr.net/gh/mizchi/three-mbt@bcb6352abf2cc620184f1c1d75a857e523a60cdc/js/topology.js';

// three-mbt topology code is MIT licensed (Copyright (c) 2026 mizchi).
// The dependency is pinned to an exact upstream commit so the topology contract
// used by WD-24C cannot change underneath a saved CM3D project.

const q=value=>Math.round(Number(value)*1e6)/1e6;
const pointKey=p=>[q(p.x),q(p.y),q(p.z)].join(',');
const edgeKey=(a,b)=>{
  const left=pointKey(a),right=pointKey(b);
  return `edge:${left.localeCompare(right)<=0?`${left}|${right}`:`${right}|${left}`}`;
};

function topologyEdgeIdentity(topology,edge){
  const [a,b]=topology.edgeVertices(edge).map(vertex=>topology.vertexPosition(vertex));
  return edgeKey(a,b);
}

function selectStableEdges(topology,edgeRefs){
  const requested=new Set((edgeRefs??[]).map(ref=>ref?.subTargetId).filter(Boolean));
  if(!requested.size)throw new RangeError('At least one stable EDGE reference is required.');
  const selection=meshSelection(topology),matched=new Set();
  for(const edge of topology.edges()){
    const identity=topologyEdgeIdentity(topology,edge);
    if(requested.has(identity)){selection.setEdge(edge,true);matched.add(identity);}
  }
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
  const topology=validatedTopology(geometry);
  const selection=selectStableEdges(topology,edgeRefs);
  return selection.beveledGeometry(Number(width),Number(materialIndex));
}

export function filletGeometryByStableEdges(){
  // F102 intentionally remains closed until a genuine segmented-round topology
  // operation exists. A chamfer, vertex displacement or silently repeated bevel
  // is not accepted as a Fillet implementation.
  throw new RangeError('F102 segmented fillet kernel is not implemented yet.');
}
