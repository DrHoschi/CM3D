import { getSingleExtrudableProfile } from '../model/sketch-profile.js';
import { recognizeProfileIdentity } from '../model/sketch-profile-path-identity.js';
import { installDomainTransactionBoundary, wrapDomainMutation } from './domain-transaction.js';
import { installPrimitiveFamily } from './primitive-family.js';
import {
  ReferenceTargetKind,
  ReferenceState,
  createStableReference,
  createReferenceResolution,
  resolveStableReference
} from './stable-reference.js';

const uuid = (prefix) => `${prefix}_${crypto.randomUUID()}`;
const clonePoints = points => (points ?? []).map(point => ({ x:Number(point.x), y:Number(point.y) }));
const profileCache = (profile, sourceRef = null) => ({
  sourceRef: sourceRef ? structuredClone(sourceRef) : null,
  profileKey: profile?.profileKey ?? null,
  points: clonePoints(profile?.outerContour?.points ?? profile?.points),
  holes: (profile?.holes ?? []).map(hole => ({ points:clonePoints(hole?.points) })),
  winding: profile?.outerContour?.winding ?? profile?.winding ?? null,
  signedArea: Number(profile?.outerContour?.signedArea ?? profile?.signedArea ?? 0)
});

const blockExtrude = (object, resolution, message = 'Extrusionsberechnung ist blockiert, weil eine Quellreferenz nicht auflösbar ist.') => {
  object.data ??= {};
  object.extensions ??= {};
  if (Array.isArray(object.data.sourceProfileRefs) && object.data.sourceProfileRefs.length) object.data.profiles = [];
  else object.data.profile = null;
  object.extensions.sketchDependency = {status:'invalid',diagnostics:(resolution?.diagnostics ?? []).map(item => ({ code:item.code, message:item.message }))};
  object.extensions.recomputeState = {state:ReferenceState.BLOCKED,upstreamState:resolution?.state ?? ReferenceState.INVALID,diagnostics:[{code:`UPSTREAM_${resolution?.state ?? ReferenceState.INVALID}`,message},...(resolution?.diagnostics ?? []).map(item => ({ code:item.code, message:item.message }))]};
};

function recomputeProfileSources(store, object) {
  const refs = object.data?.sourceProfileRefs;if (!Array.isArray(refs) || !refs.length) return null;
  const profiles = [],resolutions = [];
  for (const reference of refs) {
    const resolution = resolveStableReference(store, reference);resolutions.push(resolution);
    if (resolution.state !== ReferenceState.RESOLVED) {blockExtrude(object,resolution,`Extrusionsberechnung ist blockiert, weil die Profilreferenz ${resolution.state} ist.`);object.extensions.sourceProfileReferences=resolutions.map(item=>({state:item.state,diagnostics:item.diagnostics}));return resolution;}
    const sketch=store.getObject?.(reference.ownerId)??null,identity=sketch?.data?.profileIdentities?.[reference.targetId]??null,recognized=recognizeProfileIdentity(sketch,identity);
    if(recognized.state!==ReferenceState.RESOLVED||!recognized.target){const failed=createReferenceResolution(reference,recognized.state,recognized.diagnostics??[]);resolutions[resolutions.length-1]=failed;blockExtrude(object,failed,`Extrusionsberechnung ist blockiert, weil das Profil ${recognized.state} ist.`);object.extensions.sourceProfileReferences=resolutions.map(item=>({state:item.state,diagnostics:item.diagnostics}));return failed;}
    profiles.push(profileCache(recognized.target,reference));
  }
  object.data.profiles=profiles;object.extensions.sourceProfileReferences=resolutions.map(item=>({state:item.state,diagnostics:item.diagnostics}));object.extensions.sketchDependency={status:'valid',diagnostics:[]};object.extensions.recomputeState={state:'READY',upstreamState:null,diagnostics:[]};return createReferenceResolution(refs[0],ReferenceState.RESOLVED,[]);
}

export function syncExtrudeSourceReference(store, object) {
  if(object?.type!=='feature.extrude')return null;object.data??={};object.extensions??={};
  if(Array.isArray(object.data.sourceProfileRefs)&&object.data.sourceProfileRefs.length)return recomputeProfileSources(store,object);
  let reference=object.data.sourceSketchRef??null;if(!reference&&object.data.sourceSketchId){reference=createStableReference(ReferenceTargetKind.SKETCH,object.data.sourceSketchId,object.data.sourceSketchId);object.data.sourceSketchRef=reference;}
  if(!reference){const resolution=createReferenceResolution(createStableReference(ReferenceTargetKind.SKETCH,object.objectId,object.objectId),ReferenceState.UNRESOLVED,[{code:'SOURCE_REFERENCE_MISSING',message:'Extrusion besitzt keine Quellskizzen-Referenz.'}]);object.extensions.sourceSketchReference={state:resolution.state,diagnostics:resolution.diagnostics};return resolution;}
  const resolution=resolveStableReference(store,reference);object.extensions.sourceSketchReference={state:resolution.state,diagnostics:resolution.diagnostics};if(resolution.state===ReferenceState.RESOLVED)object.extensions.recomputeState={state:'READY',upstreamState:null,diagnostics:[]};else if([ReferenceState.MISSING,ReferenceState.INVALID].includes(resolution.state))blockExtrude(object,resolution,`Extrusionsberechnung ist blockiert, weil die Quellreferenz ${resolution.state} ist.`);return resolution;
}

export function syncAllExtrudeSourceReferences(store){const results=[];for(const object of Object.values(store.project?.scene?.objects??{})){if(object?.type!=='feature.extrude')continue;results.push({objectId:object.objectId,resolution:syncExtrudeSourceReference(store,object)});}return results;}

export function installExtrudeSourceReferenceSync(store) {
  installPrimitiveFamily(store);
  const historyCapable=typeof store?.snapshot==='function'&&typeof store?.pushHistory==='function';
  if(historyCapable){installDomainTransactionBoundary(store);queueMicrotask(()=>{wrapDomainMutation(store,'setSketchPoint');wrapDomainMutation(store,'setSketchLineEndpoints');wrapDomainMutation(store,'deleteSketchElement');});}
  const sync=()=>syncAllExtrudeSourceReferences(store);const unsubscribe=store.subscribe?.(event=>{if(['projectLoaded','projectChanged','geometryChanged'].includes(event.type))sync();})??(()=>{});sync();return{sync,unsubscribe};
}

function insertExtrude(store,sketch,data,label='Skizze extrudieren'){
  const before=store.snapshot(),materialId=Object.keys(store.project.materials??{})[0]??null,objectId=uuid('obj'),parentId=sketch.parentId??null,order=parentId===null?store.project.scene.rootObjectIds.length:Object.values(store.project.scene.objects).filter(object=>object.parentId===parentId).length;
  const object={objectId,type:'feature.extrude',name:`Extrude ${sketch.name||'Skizze'}`,parentId,order,transform:structuredClone(sketch.transform),data,materialIds:materialId?[materialId]:[],flags:{visible:true,locked:false},extensions:{}};
  syncExtrudeSourceReference(store,object);if(object.extensions.recomputeState?.state===ReferenceState.BLOCKED)return{ok:false,reason:'INVALID_PROFILE_REFERENCE',diagnostics:object.extensions.recomputeState.diagnostics};
  store.project.scene.objects[objectId]=object;if(parentId===null)store.project.scene.rootObjectIds.push(objectId);store.touch();store.select(objectId,false);store.pushHistory(before,label);store.emit('objectCreated',{objectId});store.emit('selectionChanged');return{ok:true,objectId};
}

export function createExtrudeFromProfileRefs(store,sourceProfileRefs,depth=1){const refs=Array.isArray(sourceProfileRefs)?sourceProfileRefs:[];if(!refs.length||refs.some(ref=>ref?.targetKind!==ReferenceTargetKind.PROFILE))return{ok:false,reason:'INVALID_PROFILE_REFERENCE',message:'Mindestens eine gültige PROFILE-Referenz ist erforderlich.'};const ownerIds=[...new Set(refs.map(ref=>ref.ownerId))];if(ownerIds.length!==1)return{ok:false,reason:'MULTIPLE_SOURCE_SKETCHES',message:'WD-23A unterstützt Profile aus genau einer Quellskizze.'};const sketch=store.getObject(ownerIds[0]);if(sketch?.type!=='sketch')return{ok:false,reason:'NO_SKETCH',message:'Quellskizze nicht gefunden.'};const d=Number(depth);if(!Number.isFinite(d)||d<=0)return{ok:false,reason:'INVALID_DEPTH',message:'Extrusionshöhe muss größer als 0 sein.'};return insertExtrude(store,sketch,{sourceProfileRefs:refs.map(ref=>structuredClone(ref)),profiles:[],depth:d,direction:'positive'},'Profile extrudieren');}

export function createExtrudeFromSketch(store,sketchId,depth=1){const sketch=store.getObject(sketchId);if(sketch?.type!=='sketch')return{ok:false,reason:'NO_SKETCH',message:'Bitte eine Skizze auswählen.'};const d=Number(depth);if(!Number.isFinite(d)||d<=0)return{ok:false,reason:'INVALID_DEPTH',message:'Extrusionshöhe muss größer als 0 sein.'};const derived=getSingleExtrudableProfile(sketch);if(!derived.valid)return{ok:false,reason:'INVALID_PROFILE',diagnostics:derived.diagnostics,message:derived.diagnostics.map(x=>x.message).join('\n')||'Skizze enthält kein eindeutig extrudierbares Profil.'};const profile=derived.profile,sourceSketchRef=createStableReference(ReferenceTargetKind.SKETCH,sketch.objectId,sketch.objectId);return insertExtrude(store,sketch,{sourceSketchId:sketch.objectId,sourceSketchRef,depth:d,direction:'positive',profile:{signature:profile.signature,pointIds:[...profile.pointIds],lineIds:[...profile.lineIds],points:profile.points.map(p=>({x:p.x,y:p.y})),winding:profile.winding,signedArea:profile.signedArea}});}
