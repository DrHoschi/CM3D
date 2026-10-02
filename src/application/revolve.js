import { recognizeProfileIdentity } from '../model/sketch-profile-path-identity.js';
import { resolveSketchPlaneBinding } from './sketch-plane-binding.js';
import { referenceGeometryForReference, ReferenceGeometryKind, addVector, subtractVector, scaleVector, dotVector, crossVector, normalizeVector, vectorLength } from './reference-geometry.js';
import { ReferenceState, ReferenceTargetKind, createReferenceResolution, resolveStableReference } from './stable-reference.js';

const EPS=1e-8;
const clonePoints=points=>(points??[]).map(point=>({x:Number(point.x),y:Number(point.y)}));
const rotateQuaternion=(v,q={x:0,y:0,z:0,w:1})=>{const x=q.x??0,y=q.y??0,z=q.z??0,w=q.w??1;const ix=w*v.x+y*v.z-z*v.y,iy=w*v.y+z*v.x-x*v.z,iz=w*v.z+x*v.y-y*v.x,iw=-x*v.x-y*v.y-z*v.z;return{x:ix*w+iw*-x+iy*-z-iz*-y,y:iy*w+iw*-y+iz*-x-ix*-z,z:iz*w+iw*-z+ix*-y-iy*-x};};
const sketchPointToWorld=(store,sketch,point)=>{const binding=resolveSketchPlaneBinding(store,sketch);if(binding.frame){const f=binding.frame;return addVector(f.origin,addVector(scaleVector(f.xAxis,point.x),scaleVector(f.yAxis,point.y)));}const t=sketch.transform??{},s=t.scale??{x:1,y:1,z:1},p=t.position??{x:0,y:0,z:0};return addVector(p,rotateQuaternion({x:point.x*(s.x??1),y:point.y*(s.y??1),z:0},t.rotation));};
const profileCache=profile=>({profileKey:profile?.profileKey??null,points:clonePoints(profile?.outerContour?.points??profile?.points),holes:(profile?.holes??[]).map(hole=>({points:clonePoints(hole?.points)}))});
const blocked=(object,resolution,message)=>{object.data.profile=null;object.data.revolveProfile=[];object.data.axis=null;object.extensions??={};object.extensions.recomputeState={state:ReferenceState.BLOCKED,upstreamState:resolution?.state??ReferenceState.INVALID,diagnostics:[{code:`UPSTREAM_${resolution?.state??ReferenceState.INVALID}`,message},...(resolution?.diagnostics??[])]};};
const invalid=(object,reference,code,message)=>{const resolution=createReferenceResolution(reference,ReferenceState.INVALID,[{code,message}]);object.data.revolveProfile=[];object.extensions??={};object.extensions.recomputeState={state:ReferenceState.INVALID,upstreamState:null,diagnostics:resolution.diagnostics};return resolution;};

export function syncRevolveSourceReferences(store,object){
  if(object?.type!=='feature.revolve')return null;object.data??={};object.extensions??={};
  const profileRef=object.data.sourceProfileRef,axisRef=object.data.axisRef,angleDeg=Number(object.data.angleDeg),direction=object.data.direction??'positive';
  if(profileRef?.targetKind!==ReferenceTargetKind.PROFILE)return invalid(object,profileRef??axisRef,'PROFILE_REFERENCE_REQUIRED','Revolve benötigt genau eine stabile PROFILE-Referenz.');
  if(axisRef?.targetKind!==ReferenceTargetKind.CONSTRUCTION_AXIS)return invalid(object,axisRef??profileRef,'AXIS_REFERENCE_REQUIRED','Revolve benötigt eine stabile CONSTRUCTION_AXIS-Referenz.');
  if(!Number.isFinite(angleDeg)||angleDeg<=0||angleDeg>360||!['positive','negative'].includes(direction))return invalid(object,profileRef,'INVALID_REVOLVE_PARAMETERS','Revolve-Winkel oder Richtung ist ungültig.');
  const profileResolution=resolveStableReference(store,profileRef);if(profileResolution.state!==ReferenceState.RESOLVED){blocked(object,profileResolution,`Revolve ist blockiert, weil die Profilreferenz ${profileResolution.state} ist.`);return profileResolution;}
  const axisResolution=resolveStableReference(store,axisRef);if(axisResolution.state!==ReferenceState.RESOLVED){blocked(object,axisResolution,`Revolve ist blockiert, weil die Achsenreferenz ${axisResolution.state} ist.`);return axisResolution;}
  const sketch=store.getObject?.(profileRef.ownerId)??null,identity=sketch?.data?.profileIdentities?.[profileRef.targetId]??null,recognized=recognizeProfileIdentity(sketch,identity);
  if(recognized.state!==ReferenceState.RESOLVED||!recognized.target){const failed=createReferenceResolution(profileRef,recognized.state,recognized.diagnostics??[]);blocked(object,failed,`Revolve ist blockiert, weil das Profil ${recognized.state} ist.`);return failed;}
  const axisGeometry=referenceGeometryForReference(store,axisRef);if(axisGeometry?.kind!==ReferenceGeometryKind.LINE)return invalid(object,axisRef,'INVALID_REVOLVE_AXIS','Revolve-Achse besitzt keine gültige Liniengeometrie.');
  const yAxis=normalizeVector(axisGeometry.direction);if(!yAxis)return invalid(object,axisRef,'INVALID_REVOLVE_AXIS','Revolve-Achse ist degeneriert.');
  const localPoints=recognized.target?.outerContour?.points??recognized.target?.points??[],worldPoints=localPoints.map(point=>sketchPointToWorld(store,sketch,point));
  let xAxis=null;for(const point of worldPoints){const d=subtractVector(point,axisGeometry.origin),radial=subtractVector(d,scaleVector(yAxis,dotVector(d,yAxis)));if(vectorLength(radial)>EPS){xAxis=normalizeVector(radial);break;}}
  if(!xAxis)return invalid(object,profileRef,'DEGENERATE_REVOLVE_PROFILE','Profil liegt vollständig auf der Revolve-Achse.');
  const zAxis=normalizeVector(crossVector(xAxis,yAxis));if(!zAxis)return invalid(object,axisRef,'INVALID_REVOLVE_FRAME','Revolve-Frame konnte nicht gebildet werden.');
  xAxis=normalizeVector(crossVector(yAxis,zAxis));
  const revolved=worldPoints.map(point=>{const d=subtractVector(point,axisGeometry.origin);return{radius:dotVector(d,xAxis),axial:dotVector(d,yAxis),offPlane:dotVector(d,zAxis)};});
  if(revolved.some(point=>!Number.isFinite(point.radius)||!Number.isFinite(point.axial)||Math.abs(point.offPlane)>1e-6))return invalid(object,profileRef,'PROFILE_AXIS_NOT_COPLANAR','Profil und Revolve-Achse müssen in einer gemeinsamen Ebene liegen.');
  const signs=new Set(revolved.filter(point=>Math.abs(point.radius)>EPS).map(point=>Math.sign(point.radius)));if(signs.size>1)return invalid(object,profileRef,'PROFILE_CROSSES_AXIS','Profil darf die Revolve-Achse berühren, aber nicht kreuzen.');
  const sign=[...signs][0]??1;object.data.profile=profileCache(recognized.target);object.data.revolveProfile=revolved.map(point=>({radius:Math.abs(point.radius),axial:point.axial}));object.data.axis={origin:{...axisGeometry.origin},direction:{...yAxis},xAxis:{...xAxis},zAxis:{...zAxis},radialSign:sign};object.extensions.recomputeState={state:'READY',upstreamState:null,diagnostics:[]};return createReferenceResolution(profileRef,ReferenceState.RESOLVED,[]);
}

export function syncAllRevolveSourceReferences(store){const results=[];for(const object of Object.values(store?.project?.scene?.objects??{}))if(object?.type==='feature.revolve')results.push({objectId:object.objectId,resolution:syncRevolveSourceReferences(store,object)});return results;}
