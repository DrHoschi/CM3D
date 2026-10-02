import { ReferenceTargetKind, ReferenceState, resolveStableReference } from './stable-reference.js';
import { createFeatureBodyOutputReference, declareFeatureOutputDependency, evaluateSequentialFeatureChain } from './feature-output.js';

export const BooleanOperation = Object.freeze({ UNION:'UNION', SUBTRACT:'SUBTRACT', INTERSECT:'INTERSECT' });
const operations = new Set(Object.values(BooleanOperation));
const uuid = () => `obj_${crypto.randomUUID()}`;
const identityTransform = () => ({ position:{x:0,y:0,z:0}, rotation:{x:0,y:0,z:0,w:1}, scale:{x:1,y:1,z:1}, pivot:{x:0,y:0,z:0} });

export function validateBooleanFeatureObject(object) {
  const errors=[];
  if(object?.type!=='feature.boolean') errors.push('Boolean feature type must be feature.boolean.');
  if(!operations.has(object?.data?.operation)) errors.push('Boolean operation must be UNION, SUBTRACT or INTERSECT.');
  for(const key of ['targetRef','toolRef']){
    const ref=object?.data?.[key];
    if(ref?.targetKind!==ReferenceTargetKind.FEATURE_OUTPUT) errors.push(`Boolean ${key} must be FEATURE_OUTPUT.`);
    if(!ref?.ownerId||ref?.targetId!=='body-output') errors.push(`Boolean ${key} must reference body-output.`);
  }
  return errors;
}

export function createBooleanFeature(project,targetRef,toolRef,operation=BooleanOperation.UNION,name='Boolean') {
  const object={objectId:uuid(),type:'feature.boolean',name,parentId:null,order:project.scene.rootObjectIds.length,transform:identityTransform(),data:{operation,targetRef:structuredClone(targetRef),toolRef:structuredClone(toolRef)},materialIds:[],flags:{visible:true,locked:false},extensions:{}};
  const errors=validateBooleanFeatureObject(object); if(errors.length) throw new Error(errors.join('\n'));
  return object;
}

export function declareBooleanDependencies(object){
  if(object?.type!=='feature.boolean') return [];
  return [
    declareFeatureOutputDependency(object.objectId,object.data.targetRef,'TARGET_BODY_TO_BOOLEAN'),
    declareFeatureOutputDependency(object.objectId,object.data.toolRef,'TOOL_BODY_TO_BOOLEAN')
  ].filter(Boolean);
}

export function recomputeBooleanFeature(store,objectId){
  const object=store.getObject(objectId); if(object?.type!=='feature.boolean') return null;
  const errors=validateBooleanFeatureObject(object);
  const resolutions=['targetRef','toolRef'].map(key=>resolveStableReference(store,object.data[key]));
  const dependencies=declareBooleanDependencies(object);
  const chain=evaluateSequentialFeatureChain(store,dependencies);
  const firstBad=resolutions.find(item=>item.state!==ReferenceState.RESOLVED);
  const state=errors.length?'INVALID':firstBad?.state??chain.stateOf(objectId)?.state??'READY';
  object.extensions ??= {}; object.extensions.recomputeState={state,diagnostics:[...errors.map(message=>({code:'BOOLEAN_INVALID',message})),...(firstBad?.diagnostics??[])]};
  return {state,resolutions,dependencies,outputRef:createFeatureBodyOutputReference(objectId)};
}

export function installBooleanFoundation(store){
  store.addBoolean=(targetRef,toolRef,operation=BooleanOperation.UNION)=>store.addObject(project=>createBooleanFeature(project,targetRef,toolRef,operation),'Boolean erzeugen');
  store.setBooleanOperation=(id,operation)=>{const object=store.getObject(id);if(object?.type!=='feature.boolean'||!operations.has(operation))return false;const before=store.snapshot();object.data.operation=operation;recomputeBooleanFeature(store,id);store.touch();store.pushHistory(before,'Boolean Operation ändern');store.emit('geometryChanged',{objectId:id});return true;};
  store.recomputeBoolean=id=>recomputeBooleanFeature(store,id);
  return {operations:[...operations]};
}
