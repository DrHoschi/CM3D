import assert from 'node:assert/strict';
import { syncExtrudeSourceReference } from '../src/application/extrude.js';
import { buildDependencyGraph, DependencyNodeState } from '../src/application/dependency-graph.js';
import { createStableReference, ReferenceState, ReferenceTargetKind, resolveStableReference } from '../src/application/stable-reference.js';
import { createProfileIdentity } from '../src/model/sketch-profile-path-identity.js';
import { deriveSketchProfilesAndPaths } from '../src/model/sketch-profile-path-derivation.js';
import { createProject, createSketchObject } from '../src/model/project.js';
import { parseProjectFileText, serializeProjectFile } from '../src/persistence/project-file.js';

const project=createProject('WD-23A Extrude V2');
const sketch=createSketchObject(project,'Profiles');
project.scene.objects[sketch.objectId]=sketch;
project.scene.rootObjectIds.push(sketch.objectId);
const point=(id,x,y)=>{sketch.data.points[id]={pointId:id,x,y};};
const line=(id,a,b)=>{sketch.data.lines[id]={lineId:id,startPointId:a,endPointId:b};};
const square=(prefix,x)=>{
  point(`${prefix}a`,x,0);point(`${prefix}b`,x+2,0);point(`${prefix}c`,x+2,2);point(`${prefix}d`,x,2);
  line(`${prefix}ab`,`${prefix}a`,`${prefix}b`);line(`${prefix}bc`,`${prefix}b`,`${prefix}c`);line(`${prefix}cd`,`${prefix}c`,`${prefix}d`);line(`${prefix}da`,`${prefix}d`,`${prefix}a`);
};
square('p',0);square('q',5);
let derived=deriveSketchProfilesAndPaths(sketch);
assert.equal(derived.profiles.length,2);
const identities=derived.profiles.map((profile,index)=>createProfileIdentity(profile,`profile_${index+1}`));
for(const identity of identities)sketch.data.profileIdentities[identity.profileId]=structuredClone(identity);
const refs=identities.map(identity=>createStableReference(ReferenceTargetKind.PROFILE,sketch.objectId,identity.profileId));
const extrude={
  objectId:'extrude-v2',type:'feature.extrude',name:'Extrude V2',parentId:null,order:1,
  transform:{position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0,w:1},scale:{x:1,y:1,z:1},pivot:{x:0,y:0,z:0}},
  data:{sourceProfileRefs:structuredClone(refs),profiles:[],depth:10,direction:'symmetric'},
  materialIds:[],flags:{visible:true,locked:false},extensions:{}
};
project.scene.objects[extrude.objectId]=extrude;project.scene.rootObjectIds.push(extrude.objectId);
const store={project,getObject(id){return this.project.scene.objects[id]??null;}};

// Multi-profile references recompute into deterministic geometry caches.
let resolution=syncExtrudeSourceReference(store,extrude);
assert.equal(resolution.state,ReferenceState.RESOLVED);
assert.equal(extrude.extensions.recomputeState.state,'READY');
assert.equal(extrude.data.profiles.length,2);
assert.deepEqual(extrude.data.sourceProfileRefs,refs);
const beforeX=extrude.data.profiles[0].points.map(point=>point.x);
sketch.data.points.pa.x=-1;
resolution=syncExtrudeSourceReference(store,extrude);
assert.equal(resolution.state,ReferenceState.RESOLVED);
assert.notDeepEqual(extrude.data.profiles[0].points.map(point=>point.x),beforeX);
assert.equal(extrude.data.direction,'symmetric');
assert.equal(extrude.data.depth,10);

// Dependency projection is PROFILE -> owning sketch -> extrude.
let graph=buildDependencyGraph(store);
assert.equal(graph.nodeState(extrude.objectId).state,DependencyNodeState.READY);
assert.equal(graph.dependenciesOf(extrude.objectId).length,2);
assert.ok(graph.dependenciesOf(extrude.objectId).every(edge=>edge.kind==='PROFILE_TO_EXTRUDE'));
assert.ok(graph.dependenciesOf(extrude.objectId).every(edge=>edge.sourceObjectId===sketch.objectId));

// Missing profile identity blocks the complete V2 output; no partial body is kept.
const saved=sketch.data.profileIdentities[identities[1].profileId];
delete sketch.data.profileIdentities[identities[1].profileId];
resolution=syncExtrudeSourceReference(store,extrude);
assert.equal(resolution.state,ReferenceState.MISSING);
assert.equal(extrude.extensions.recomputeState.state,ReferenceState.BLOCKED);
assert.deepEqual(extrude.data.profiles,[]);
graph=buildDependencyGraph(store);
assert.equal(graph.nodeState(extrude.objectId).state,DependencyNodeState.BLOCKED);
sketch.data.profileIdentities[identities[1].profileId]=saved;
assert.equal(syncExtrudeSourceReference(store,extrude).state,ReferenceState.RESOLVED);
assert.equal(extrude.data.profiles.length,2);

// Productive Save -> Reload preserves PROFILE bindings and recomputable cache.
const reloaded=parseProjectFileText(serializeProjectFile(project));
const reloadedStore={project:reloaded,getObject(id){return this.project.scene.objects[id]??null;}};
const reloadedExtrude=reloaded.scene.objects[extrude.objectId];
assert.deepEqual(reloadedExtrude.data.sourceProfileRefs,refs);
assert.equal(syncExtrudeSourceReference(reloadedStore,reloadedExtrude).state,ReferenceState.RESOLVED);
assert.equal(reloadedExtrude.data.profiles.length,2);

// Legacy single-profile extrudes remain accepted by the dependency graph.
const legacy={...structuredClone(extrude),objectId:'legacy-extrude',data:{sourceSketchId:sketch.objectId,sourceSketchRef:createStableReference(ReferenceTargetKind.SKETCH,sketch.objectId,sketch.objectId),depth:4,direction:'negative',profile:{points:[{x:0,y:0},{x:1,y:0},{x:0,y:1}]}}};
project.scene.objects[legacy.objectId]=legacy;project.scene.rootObjectIds.push(legacy.objectId);
assert.equal(syncExtrudeSourceReference(store,legacy).state,ReferenceState.RESOLVED);
assert.equal(legacy.data.direction,'negative');
assert.equal(buildDependencyGraph(store).nodeState(legacy.objectId).state,DependencyNodeState.READY);

// Existing WD-22D planar cap references remain resolvable for the V2 extrude object.
const capRef=createStableReference(ReferenceTargetKind.PLANAR_FACE,extrude.objectId,'CAP_END');
assert.equal(resolveStableReference(store,capRef).state,ReferenceState.RESOLVED);

console.log('WD-23A Extrude V2 Foundation regression: PASS');
