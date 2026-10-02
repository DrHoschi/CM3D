import { ReferenceTargetKind, ReferenceState, resolveStableReference } from './stable-reference.js';
import { createFeatureBodyOutputReference, declareFeatureOutputDependency, evaluateSequentialFeatureChain } from './feature-output.js';
import { referenceGeometryForReference, ReferenceGeometryKind } from './reference-geometry.js';

const planeKinds=new Set([ReferenceTargetKind.WORK_PLANE,ReferenceTargetKind.PLANAR_FACE]);
const uuid=()=>`obj_${crypto.randomUUID()}`;
const identityTransform=()=>({position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0,w:1},scale:{x:1,y:1,z:1},pivot:{x:0,y:0,z:0}});

export function validateMirrorFeatureObject(object){
  const errors=[];
  if(object?.type!=='feature.mirror')errors.push('Mirror feature type must be feature.mirror.');
  const sourceRef=object?.data?.sourceRef;
  if(sourceRef?.targetKind!==ReferenceTargetKind.FEATURE_OUTPUT||!sourceRef?.ownerId||sourceRef?.targetId!=='body-output')errors.push('Mirror sourceRef must reference FEATURE_OUTPUT body-output.');
  const planeRef=object?.data?.planeRef;
  if(!planeKinds.has(planeRef?.targetKind)||!planeRef?.ownerId||!planeRef?.targetId)errors.push('Mirror planeRef must reference WORK_PLANE or PLANAR_FACE.');
  return errors;
}

export function createMirrorFeature(project,sourceRef,planeRef,name='Mirror'){
  const object={objectId:uuid(),type:'feature.mirror',name,parentId:null,order:project.scene.rootObjectIds.length,transform:identityTransform(),data:{sourceRef:structuredClone(sourceRef),planeRef:structuredClone(planeRef)},materialIds:[],flags:{visible:true,locked:false},extensions:{}};
  const errors=validateMirrorFeatureObject(object);if(errors.length)throw new Error(errors.join('\n'));
  return object;
}

export function declareMirrorDependencies(object){
  if(object?.type!=='feature.mirror')return [];
  const source=declareFeatureOutputDependency(object.objectId,object.data.sourceRef,'SOURCE_BODY_TO_MIRROR');
  return [source,{sourceId:object.data.planeRef.ownerId,targetId:object.objectId,kind:'PLANE_TO_MIRROR',reference:structuredClone(object.data.planeRef)}].filter(Boolean);
}

export function recomputeMirrorFeature(store,objectId){
  const object=store.getObject(objectId);if(object?.type!=='feature.mirror')return null;
  const errors=validateMirrorFeatureObject(object);
  const sourceResolution=resolveStableReference(store,object.data.sourceRef);
  const planeResolution=resolveStableReference(store,object.data.planeRef);
  const planeGeometry=planeResolution.state===ReferenceState.RESOLVED?referenceGeometryForReference(store,object.data.planeRef):null;
  if(planeResolution.state===ReferenceState.RESOLVED&&planeGeometry?.kind!==ReferenceGeometryKind.PLANE)errors.push('Mirror planeRef must resolve to plane geometry.');
  const dependencies=declareMirrorDependencies(object);
  const chain=evaluateSequentialFeatureChain(store,dependencies);
  const firstBad=[sourceResolution,planeResolution].find(item=>item.state!==ReferenceState.RESOLVED);
  const state=errors.length?'INVALID':firstBad?.state??chain.stateOf(objectId)?.state??'READY';
  object.extensions??={};object.extensions.recomputeState={state,diagnostics:[...errors.map(message=>({code:'MIRROR_INVALID',message})),...(firstBad?.diagnostics??[])]};
  return {state,resolutions:{source:sourceResolution,plane:planeResolution},dependencies,planeGeometry,outputRef:createFeatureBodyOutputReference(objectId)};
}

export function installMirrorFoundation(store){
  store.addMirror=(sourceRef,planeRef)=>store.addObject(project=>createMirrorFeature(project,sourceRef,planeRef),'Mirror erzeugen');
  store.setMirrorPlane=(id,planeRef)=>{const object=store.getObject(id);if(object?.type!=='feature.mirror'||!planeKinds.has(planeRef?.targetKind))return false;const before=store.snapshot();object.data.planeRef=structuredClone(planeRef);recomputeMirrorFeature(store,id);store.touch();store.pushHistory(before,'Mirror Ebene ändern');store.emit('geometryChanged',{objectId:id});return true;};
  store.recomputeMirror=id=>recomputeMirrorFeature(store,id);
  return {planeKinds:[...planeKinds]};
}
