import { ReferenceState, ReferenceTargetKind, resolveStableReference } from './stable-reference.js';
import { createFeatureBodyOutputReference, declareFeatureOutputDependency } from './feature-output.js';

export const EdgeModifierMode=Object.freeze({BEVEL:'BEVEL',FILLET:'FILLET'});
const modes=new Set(Object.values(EdgeModifierMode));
const positive=value=>Number.isFinite(Number(value))&&Number(value)>0;
const uuid=()=>`obj_${crypto.randomUUID()}`;
const identityTransform=()=>({position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0,w:1},scale:{x:1,y:1,z:1},pivot:{x:0,y:0,z:0}});

export function validateEdgeModifierObject(object){
  const errors=[];
  if(object?.type!=='feature.edge-modifier')errors.push('Edge modifier type must be feature.edge-modifier.');
  if(!modes.has(object?.data?.mode))errors.push('Mode must be BEVEL or FILLET.');
  if(!positive(object?.data?.amount))errors.push('Amount must be positive.');
  if(!Array.isArray(object?.data?.edgeRefs)||object.data.edgeRefs.length<1)errors.push('At least one EDGE reference is required.');
  for(const ref of object?.data?.edgeRefs??[])if(ref?.targetKind!==ReferenceTargetKind.EDGE)errors.push('All selected references must be EDGE references.');
  return errors;
}

export function createEdgeModifierFeature(project,sourceRef,edgeRefs,mode=EdgeModifierMode.FILLET,amount=0.05,name='Fillet'){
  const object={objectId:uuid(),type:'feature.edge-modifier',name,parentId:null,order:project.scene.rootObjectIds.length,transform:identityTransform(),data:{sourceRef:structuredClone(sourceRef),edgeRefs:structuredClone(edgeRefs),mode,amount:Number(amount)},materialIds:[],flags:{visible:true,locked:false},extensions:{}};
  const errors=validateEdgeModifierObject(object);if(errors.length)throw new Error(errors.join('\n'));return object;
}

export function declareEdgeModifierDependencies(object){
  if(object?.type!=='feature.edge-modifier')return[];
  return [declareFeatureOutputDependency(object.objectId,object.data.sourceRef,'BODY_TO_EDGE_MODIFIER')].filter(Boolean);
}

export function recomputeEdgeModifier(store,id){
  const object=store.getObject(id);if(object?.type!=='feature.edge-modifier')return null;
  const errors=validateEdgeModifierObject(object);
  const source=resolveStableReference(store,object.data.sourceRef);
  const edges=object.data.edgeRefs.map(ref=>resolveStableReference(store,ref));
  const bad=[source,...edges].find(item=>item.state!==ReferenceState.RESOLVED);
  const state=errors.length?'INVALID':bad?.state??'READY';
  object.extensions??={};object.extensions.recomputeState={state,diagnostics:[...errors.map(message=>({code:'EDGE_MODIFIER_INVALID',message})),...(bad?.diagnostics??[])]};
  return {state,source,edges,dependencies:declareEdgeModifierDependencies(object),outputRef:createFeatureBodyOutputReference(id)};
}

export function installBevelFilletFoundation(store){
  store.addEdgeModifier=(sourceRef,edgeRefs,mode=EdgeModifierMode.FILLET,amount=0.05)=>store.addObject(project=>createEdgeModifierFeature(project,sourceRef,edgeRefs,mode,amount,mode==='BEVEL'?'Bevel':'Fillet'),`${mode} erzeugen`);
  store.setEdgeModifierAmount=(id,amount)=>{const object=store.getObject(id);if(object?.type!=='feature.edge-modifier'||!positive(amount))return false;const before=store.snapshot();object.data.amount=Number(amount);recomputeEdgeModifier(store,id);store.touch();store.pushHistory(before,'Kantenradius ändern');store.emit('geometryChanged',{objectId:id});return true;};
  store.recomputeEdgeModifier=id=>recomputeEdgeModifier(store,id);
  return {modes:[...modes]};
}
