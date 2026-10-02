import { recognizeProfileIdentity, recognizePathIdentity } from '../model/sketch-profile-path-identity.js';
import { resolveSketchPlaneBinding } from './sketch-plane-binding.js';
import { ReferenceState, ReferenceTargetKind, createReferenceResolution, resolveStableReference } from './stable-reference.js';

const EPS=1e-9;
const add=(a,b)=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z});
const sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z});
const scale=(v,s)=>({x:v.x*s,y:v.y*s,z:v.z*s});
const dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z;
const cross=(a,b)=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x});
const length=v=>Math.hypot(v.x,v.y,v.z);
const normalize=v=>{const l=length(v);return l>EPS?scale(v,1/l):null;};
const rotateQuaternion=(v,q={x:0,y:0,z:0,w:1})=>{const x=q.x??0,y=q.y??0,z=q.z??0,w=q.w??1;const ix=w*v.x+y*v.z-z*v.y,iy=w*v.y+z*v.x-x*v.z,iz=w*v.z+x*v.y-y*v.x,iw=-x*v.x-y*v.y-z*v.z;return{x:ix*w+iw*-x+iy*-z-iz*-y,y:iy*w+iw*-y+iz*-x-ix*-z,z:iz*w+iw*-z+ix*-y-iy*-x};};

function sketchFrame(store,sketch){
  const binding=resolveSketchPlaneBinding(store,sketch);
  if(binding.frame)return {origin:{...binding.frame.origin},xAxis:{...binding.frame.xAxis},yAxis:{...binding.frame.yAxis},normal:normalize(cross(binding.frame.xAxis,binding.frame.yAxis))};
  const t=sketch.transform??{},s=t.scale??{x:1,y:1,z:1},origin=t.position??{x:0,y:0,z:0};
  const xAxis=normalize(rotateQuaternion({x:s.x??1,y:0,z:0},t.rotation)),yAxis=normalize(rotateQuaternion({x:0,y:s.y??1,z:0},t.rotation));
  return {origin:{x:Number(origin.x??0),y:Number(origin.y??0),z:Number(origin.z??0)},xAxis,yAxis,normal:normalize(cross(xAxis,yAxis))};
}
const toWorld=(frame,p)=>add(frame.origin,add(scale(frame.xAxis,Number(p.x)),scale(frame.yAxis,Number(p.y))));
const clone2=points=>(points??[]).map(p=>({x:Number(p.x),y:Number(p.y)}));
const profileCache=profile=>({profileKey:profile?.profileKey??null,points:clone2(profile?.outerContour?.points??profile?.points),holes:(profile?.holes??[]).map(h=>({points:clone2(h?.points)}))});

function worldPath(store,sketch,path){
  const frame=sketchFrame(store,sketch);if(!frame.xAxis||!frame.yAxis||!frame.normal)return null;
  const points=[];
  for(const curve of path?.curves??[])for(let i=0;i<(curve.tessellation??[]).length;i+=1){const p=toWorld(frame,curve.tessellation[i]),last=points.at(-1);if(last&&i===0&&length(sub(last,p))<=EPS)continue;points.push(p);}
  return points.length>=2?{points,frame}:null;
}
function tangents(points){return points.map((p,i)=>normalize(sub(points[Math.min(points.length-1,i+1)],points[Math.max(0,i-1)])));}
function transportNormal(normal,fromT,toT){
  const axis=cross(fromT,toT),sin=length(axis),cos=Math.max(-1,Math.min(1,dot(fromT,toT)));
  if(sin<=EPS){if(cos>=0)return normal;return scale(normal,-1);}
  const u=scale(axis,1/sin);return add(add(scale(normal,cos),scale(cross(u,normal),sin)),scale(u,dot(u,normal)*(1-cos)));
}
export function deriveSweepFrames(points,preferredNormal){
  if(!Array.isArray(points)||points.length<2)return null;const ts=tangents(points);if(ts.some(t=>!t))return null;
  let n=sub(preferredNormal,scale(ts[0],dot(preferredNormal,ts[0])));n=normalize(n);
  if(!n){const fallback=Math.abs(ts[0].z)<0.9?{x:0,y:0,z:1}:{x:0,y:1,z:0};n=normalize(sub(fallback,scale(ts[0],dot(fallback,ts[0]))));}
  if(!n)return null;const frames=[];
  for(let i=0;i<points.length;i+=1){if(i)n=normalize(sub(transportNormal(n,ts[i-1],ts[i]),scale(ts[i],dot(transportNormal(n,ts[i-1],ts[i]),ts[i]))));if(!n)return null;const b=normalize(cross(ts[i],n));if(!b)return null;n=normalize(cross(b,ts[i]));frames.push({origin:{...points[i]},tangent:{...ts[i]},normal:{...n},binormal:{...b}});}
  return frames;
}
const blocked=(object,resolution,message)=>{object.data.profile=null;object.data.pathPoints=[];object.data.frames=[];object.extensions??={};object.extensions.recomputeState={state:ReferenceState.BLOCKED,upstreamState:resolution?.state??ReferenceState.INVALID,diagnostics:[{code:`UPSTREAM_${resolution?.state??ReferenceState.INVALID}`,message},...(resolution?.diagnostics??[])]};};
const invalid=(object,reference,code,message)=>{const r=createReferenceResolution(reference,ReferenceState.INVALID,[{code,message}]);object.data.profile=null;object.data.pathPoints=[];object.data.frames=[];object.extensions??={};object.extensions.recomputeState={state:ReferenceState.INVALID,upstreamState:null,diagnostics:r.diagnostics};return r;};

export function syncSweepSourceReferences(store,object){
  if(object?.type!=='feature.sweep')return null;object.data??={};object.extensions??={};const profileRef=object.data.sourceProfileRef,pathRef=object.data.sourcePathRef;
  if(profileRef?.targetKind!==ReferenceTargetKind.PROFILE)return invalid(object,profileRef??pathRef,'PROFILE_REFERENCE_REQUIRED','Sweep benötigt genau eine stabile PROFILE-Referenz.');
  if(pathRef?.targetKind!==ReferenceTargetKind.PATH)return invalid(object,pathRef??profileRef,'PATH_REFERENCE_REQUIRED','Sweep benötigt genau eine stabile PATH-Referenz.');
  const pr=resolveStableReference(store,profileRef);if(pr.state!==ReferenceState.RESOLVED){blocked(object,pr,`Sweep ist blockiert, weil die Profilreferenz ${pr.state} ist.`);return pr;}
  const rr=resolveStableReference(store,pathRef);if(rr.state!==ReferenceState.RESOLVED){blocked(object,rr,`Sweep ist blockiert, weil die Pfadreferenz ${rr.state} ist.`);return rr;}
  const ps=store.getObject?.(profileRef.ownerId)??null,pi=ps?.data?.profileIdentities?.[profileRef.targetId]??null,p=recognizeProfileIdentity(ps,pi);
  if(p.state!==ReferenceState.RESOLVED||!p.target){const f=createReferenceResolution(profileRef,p.state,p.diagnostics??[]);blocked(object,f,`Sweep ist blockiert, weil das Profil ${p.state} ist.`);return f;}
  const rs=store.getObject?.(pathRef.ownerId)??null,ri=rs?.data?.pathIdentities?.[pathRef.targetId]??null,r=recognizePathIdentity(rs,ri);
  if(r.state!==ReferenceState.RESOLVED||!r.target){const f=createReferenceResolution(pathRef,r.state,r.diagnostics??[]);blocked(object,f,`Sweep ist blockiert, weil der Pfad ${r.state} ist.`);return f;}
  const wp=worldPath(store,rs,r.target);if(!wp)return invalid(object,pathRef,'DEGENERATE_SWEEP_PATH','Sweep-Pfad besitzt keine gültige räumliche Länge.');
  const pf=sketchFrame(store,ps),frames=deriveSweepFrames(wp.points,pf.normal);if(!frames)return invalid(object,pathRef,'INVALID_SWEEP_FRAME','Reproduzierbarer Sweep-Frame konnte nicht gebildet werden.');
  object.data.profile=profileCache(p.target);object.data.pathPoints=wp.points.map(x=>({...x}));object.data.frames=frames;object.extensions.recomputeState={state:'READY',upstreamState:null,diagnostics:[]};return createReferenceResolution(profileRef,ReferenceState.RESOLVED,[]);
}
export function syncAllSweepSourceReferences(store){const out=[];for(const object of Object.values(store?.project?.scene?.objects??{}))if(object?.type==='feature.sweep')out.push({objectId:object.objectId,resolution:syncSweepSourceReferences(store,object)});return out;}
