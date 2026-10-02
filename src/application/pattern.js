import { ReferenceTargetKind, ReferenceState, resolveStableReference } from './stable-reference.js';
import { createFeatureBodyOutputReference, declareFeatureOutputDependency, evaluateSequentialFeatureChain } from './feature-output.js';
import { referenceGeometryForReference, ReferenceGeometryKind, normalizeVector } from './reference-geometry.js';

export const PatternKind=Object.freeze({LINEAR:'LINEAR',RADIAL:'RADIAL'});
const uuid=()=>`obj_${crypto.randomUUID()}`;
const identityTransform=()=>({position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0,w:1},scale:{x:1,y:1,z:1},pivot:{x:0,y:0,z:0}});
const finiteVector=v=>!!v&&Number.isFinite(v.x)&&Number.isFinite(v.y)&&Number.isFinite(v.z);
const validCount=value=>Number.isInteger(value)&&value>=2;

export function validatePatternFeatureObject(object){
  const errors=[];
  if(object?.type!=='feature.pattern')errors.push('Pattern feature type must be feature.pattern.');
  const data=object?.data??{},sourceRef=data.sourceRef;
  if(sourceRef?.targetKind!==ReferenceTargetKind.FEATURE_OUTPUT||!sourceRef?.ownerId||sourceRef?.targetId!=='body-output')errors.push('Pattern sourceRef must reference FEATURE_OUTPUT body-output.');
  if(!Object.values(PatternKind).includes(data.kind))errors.push('Pattern kind must be LINEAR or RADIAL.');
  if(!validCount(data.count))errors.push('Pattern count must be an integer >= 2.');
  if(data.kind===PatternKind.LINEAR){
    if(!finiteVector(data.direction)||!normalizeVector(data.direction))errors.push('Linear pattern requires a finite non-zero direction.');
    if(!Number.isFinite(data.spacing)||data.spacing===0)errors.push('Linear pattern spacing must be finite and non-zero.');
  }
  if(data.kind===PatternKind.RADIAL){
    if(data.axisRef?.targetKind!==ReferenceTargetKind.CONSTRUCTION_AXIS||!data.axisRef?.ownerId||!data.axisRef?.targetId)errors.push('Radial pattern axisRef must reference CONSTRUCTION_AXIS.');
    if(!Number.isFinite(data.angle)||data.angle===0)errors.push('Radial pattern angle must be finite and non-zero.');
  }
  return errors;
}

function createPattern(project,data,name){
  const object={objectId:uuid(),type:'feature.pattern',name,parentId:null,order:project.scene.rootObjectIds.length,transform:identityTransform(),data:structuredClone(data),materialIds:[],flags:{visible:true,locked:false},extensions:{}};
  const errors=validatePatternFeatureObject(object);if(errors.length)throw new Error(errors.join('\n'));return object;
}
export const createLinearPatternFeature=(project,sourceRef,direction,count,spacing,name='Lineares Pattern')=>createPattern(project,{kind:PatternKind.LINEAR,sourceRef,direction,count,spacing},name);
export const createRadialPatternFeature=(project,sourceRef,axisRef,count,angle,name='Radiales Pattern')=>createPattern(project,{kind:PatternKind.RADIAL,sourceRef,axisRef,count,angle},name);

export function declarePatternDependencies(object){
  if(object?.type!=='feature.pattern')return [];
  const source=declareFeatureOutputDependency(object.objectId,object.data.sourceRef,'SOURCE_BODY_TO_PATTERN');
  const axis=object.data.kind===PatternKind.RADIAL?{sourceId:object.data.axisRef.ownerId,targetId:object.objectId,kind:'AXIS_TO_PATTERN',reference:structuredClone(object.data.axisRef)}:null;
  return [source,axis].filter(Boolean);
}

export function recomputePatternFeature(store,objectId){
  const object=store.getObject(objectId);if(object?.type!=='feature.pattern')return null;
  const errors=validatePatternFeatureObject(object),sourceResolution=resolveStableReference(store,object.data.sourceRef);
  let axisResolution=null,axisGeometry=null;
  if(object.data.kind===PatternKind.RADIAL){axisResolution=resolveStableReference(store,object.data.axisRef);if(axisResolution.state===ReferenceState.RESOLVED)axisGeometry=referenceGeometryForReference(store,object.data.axisRef);if(axisResolution.state===ReferenceState.RESOLVED&&axisGeometry?.kind!==ReferenceGeometryKind.LINE)errors.push('Radial pattern axisRef must resolve to line geometry.');}
  const dependencies=declarePatternDependencies(object),chain=evaluateSequentialFeatureChain(store,dependencies);
  const firstBad=[sourceResolution,axisResolution].filter(Boolean).find(item=>item.state!==ReferenceState.RESOLVED);
  const state=errors.length?'INVALID':firstBad?.state??chain.stateOf(objectId)?.state??'READY';
  object.extensions??={};object.extensions.recomputeState={state,diagnostics:[...errors.map(message=>({code:'PATTERN_INVALID',message})),...(firstBad?.diagnostics??[])]};
  return {state,resolutions:{source:sourceResolution,axis:axisResolution},dependencies,axisGeometry,outputRef:createFeatureBodyOutputReference(objectId)};
}

export function installPatternFoundation(store){
  store.addLinearPattern=(sourceRef,direction,count,spacing)=>store.addObject(project=>createLinearPatternFeature(project,sourceRef,direction,count,spacing),'Lineares Pattern erzeugen');
  store.addRadialPattern=(sourceRef,axisRef,count,angle)=>store.addObject(project=>createRadialPatternFeature(project,sourceRef,axisRef,count,angle),'Radiales Pattern erzeugen');
  store.setPatternParameters=(id,next={})=>{const object=store.getObject(id);if(object?.type!=='feature.pattern')return false;const before=store.snapshot(),candidate=structuredClone(object);candidate.data={...candidate.data,...structuredClone(next)};if(validatePatternFeatureObject(candidate).length)return false;object.data=candidate.data;recomputePatternFeature(store,id);store.touch();store.pushHistory(before,'Pattern ändern');store.emit('geometryChanged',{objectId:id});return true;};
  store.recomputePattern=id=>recomputePatternFeature(store,id);
  return {kinds:Object.values(PatternKind)};
}
