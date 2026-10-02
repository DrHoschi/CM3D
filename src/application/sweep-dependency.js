import { createDependencyEdge, DependencyNodeState } from './dependency-graph.js';
import { ReferenceState } from './stable-reference.js';

export function sweepDeclaredDependencies(store){
  const dependencies=[];
  for(const object of Object.values(store?.project?.scene?.objects??{})){
    if(object?.type!=='feature.sweep')continue;
    if(object.data?.sourceProfileRef)dependencies.push({dependentObjectId:object.objectId,reference:object.data.sourceProfileRef,kind:'PROFILE_TO_SWEEP'});
    if(object.data?.sourcePathRef)dependencies.push({dependentObjectId:object.objectId,reference:object.data.sourcePathRef,kind:'PATH_TO_SWEEP'});
  }
  return dependencies;
}
export function sweepDependencyState(store,object){
  if(object?.type!=='feature.sweep')return null;
  const refs=[[object.data?.sourceProfileRef,'PROFILE_TO_SWEEP'],[object.data?.sourcePathRef,'PATH_TO_SWEEP']];
  if(refs.some(([ref])=>!ref))return {state:DependencyNodeState.MISSING,upstreamState:null,diagnostics:[{code:'SOURCE_REFERENCE_MISSING',message:'Sweep benötigt PROFILE- und PATH-Referenz.'}]};
  for(const [ref,kind] of refs){const edge=createDependencyEdge(store,object.objectId,ref,kind);if(!edge||edge.state!==ReferenceState.RESOLVED){const state=edge?.state??ReferenceState.INVALID;return {state:DependencyNodeState.BLOCKED,upstreamState:state,diagnostics:[{code:`UPSTREAM_${state}`,message:`Sweep ist blockiert, weil ${kind} ${state} ist.`},...(edge?.diagnostics??[])]};}}
  return {state:DependencyNodeState.READY,upstreamState:null,diagnostics:[]};
}
