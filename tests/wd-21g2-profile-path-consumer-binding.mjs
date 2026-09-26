import assert from 'node:assert/strict';
import { buildDependencyGraph, DependencyNodeState } from '../src/application/dependency-graph.js';
import { createFeatureConsumerBinding, declaredFeatureConsumerDependencies } from '../src/application/feature-consumer-binding.js';
import { ReferenceState, ReferenceTargetKind } from '../src/application/stable-reference.js';
import { createProfileIdentity, createPathIdentity } from '../src/model/sketch-profile-path-identity.js';
import { deriveSketchProfilesAndPaths } from '../src/model/sketch-profile-path-derivation.js';
import { createGroupObject, createProject, createSketchObject, validateProject } from '../src/model/project.js';
import { parseProjectFileText, serializeProjectFile } from '../src/persistence/project-file.js';

const project=createProject('WD-21G.2 consumer binding');
const sketch=createSketchObject(project,'Consumer source');
project.scene.objects[sketch.objectId]=sketch;
project.scene.rootObjectIds.push(sketch.objectId);

const point=(id,x,y)=>{sketch.data.points[id]={pointId:id,x,y};};
const line=(id,a,b)=>{sketch.data.lines[id]={lineId:id,startPointId:a,endPointId:b};};
point('a',0,0);point('b',2,0);point('c',2,2);point('d',0,2);
line('ab','a','b');line('bc','b','c');line('cd','c','d');line('da','d','a');
point('e',3,0);point('f',4,0);point('g',5,0);point('h',6,0);point('i',7,0);
line('ef','e','f');line('fg','f','g');line('gh','g','h');line('hi','h','i');

const derived=deriveSketchProfilesAndPaths(sketch);
const profileIdentity=createProfileIdentity(derived.profiles[0],'profile_consumer_1');
const pathIdentity=createPathIdentity(derived.openPaths[0],'path_consumer_1');
sketch.data.profileIdentities[profileIdentity.profileId]=profileIdentity;
sketch.data.pathIdentities[pathIdentity.pathId]=pathIdentity;

const makeConsumer=(id,type,sourceRef)=>{
  const object=createGroupObject(project,id);
  delete project.scene.objects[object.objectId];
  object.objectId=id;
  object.type=type;
  object.name=id;
  object.data={sourceRef};
  object.order=project.scene.rootObjectIds.length;
  project.scene.objects[id]=object;
  project.scene.rootObjectIds.push(id);
  return object;
};
const profileRef=createFeatureConsumerBinding(ReferenceTargetKind.PROFILE,sketch.objectId,profileIdentity.profileId);
const pathRef=createFeatureConsumerBinding(ReferenceTargetKind.PATH,sketch.objectId,pathIdentity.pathId);
const profileConsumer=makeConsumer('feature_profile_consumer','feature.synthetic-profile-consumer',profileRef);
const pathConsumer=makeConsumer('feature_path_consumer','feature.synthetic-path-consumer',pathRef);

const store={
  project,
  getObject(id){return this.project.scene.objects[id]??null;}
};
const dependencies=()=>declaredFeatureConsumerDependencies(store);
let declared=dependencies();
assert.equal(declared.length,2);
assert.deepEqual(declared.map(item=>item.kind).sort(),['PATH_CONSUMER','PROFILE_CONSUMER']);
assert.deepEqual(profileConsumer.data.sourceRef,profileRef);
assert.deepEqual(pathConsumer.data.sourceRef,pathRef);

let graph=buildDependencyGraph(store,declared);
assert.equal(graph.dependenciesOf(profileConsumer.objectId)[0].state,ReferenceState.RESOLVED);
assert.equal(graph.dependenciesOf(pathConsumer.objectId)[0].state,ReferenceState.RESOLVED);
assert.equal(graph.nodeState(profileConsumer.objectId).state,DependencyNodeState.READY);
assert.equal(graph.nodeState(pathConsumer.objectId).state,DependencyNodeState.READY);

// Geometry may move while the persistent source identity remains the authority.
sketch.data.points.a.x=-1;
graph=buildDependencyGraph(store,dependencies());
assert.equal(graph.dependenciesOf(profileConsumer.objectId)[0].state,ReferenceState.RESOLVED);

// Missing identity blocks the consumer and must not rebind to another profile.
const savedProfileIdentity=sketch.data.profileIdentities[profileIdentity.profileId];
delete sketch.data.profileIdentities[profileIdentity.profileId];
graph=buildDependencyGraph(store,dependencies());
assert.equal(graph.dependenciesOf(profileConsumer.objectId)[0].state,ReferenceState.MISSING);
assert.equal(graph.nodeState(profileConsumer.objectId).state,DependencyNodeState.BLOCKED);
assert.equal(profileConsumer.data.sourceRef.targetId,profileIdentity.profileId);
sketch.data.profileIdentities[profileIdentity.profileId]=savedProfileIdentity;

// Invalid recognized profile blocks without replacing the binding.
const savedDA=sketch.data.lines.da;
sketch.data.lines.da={...savedDA,endPointId:'b'};
graph=buildDependencyGraph(store,dependencies());
assert.equal(graph.dependenciesOf(profileConsumer.objectId)[0].state,ReferenceState.INVALID);
assert.equal(graph.nodeState(profileConsumer.objectId).state,DependencyNodeState.BLOCKED);
assert.equal(profileConsumer.data.sourceRef.targetId,profileIdentity.profileId);
sketch.data.lines.da=savedDA;

// Ambiguous/open-path recognition blocks without heuristic rebinding.
const savedFG=sketch.data.lines.fg;
sketch.data.points.q0={pointId:'q0',x:10,y:0};
sketch.data.points.q1={pointId:'q1',x:11,y:0};
sketch.data.lines.fg={...savedFG,startPointId:'q0',endPointId:'q1'};
graph=buildDependencyGraph(store,dependencies());
assert.equal(graph.dependenciesOf(pathConsumer.objectId)[0].state,ReferenceState.UNRESOLVED);
assert.equal(graph.nodeState(pathConsumer.objectId).state,DependencyNodeState.BLOCKED);
assert.equal(pathConsumer.data.sourceRef.targetId,pathIdentity.pathId);
sketch.data.lines.fg=savedFG;
delete sketch.data.points.q0;delete sketch.data.points.q1;

// The same identities resolving again restore READY.
graph=buildDependencyGraph(store,dependencies());
assert.equal(graph.dependenciesOf(profileConsumer.objectId)[0].state,ReferenceState.RESOLVED);
assert.equal(graph.dependenciesOf(pathConsumer.objectId)[0].state,ReferenceState.RESOLVED);
assert.equal(graph.nodeState(profileConsumer.objectId).state,DependencyNodeState.READY);
assert.equal(graph.nodeState(pathConsumer.objectId).state,DependencyNodeState.READY);

// Productive project-file roundtrip preserves the binding structurally.
const serialized=serializeProjectFile(project);
const reloaded=parseProjectFileText(serialized);
assert.deepEqual(reloaded.scene.objects[profileConsumer.objectId].data.sourceRef,profileRef);
assert.deepEqual(reloaded.scene.objects[pathConsumer.objectId].data.sourceRef,pathRef);

// Validation checks the binding shape, not its current resolution state.
const unresolvedButPersistable=structuredClone(project);
delete unresolvedButPersistable.scene.objects[sketch.objectId].data.profileIdentities[profileIdentity.profileId];
assert.equal(validateProject(unresolvedButPersistable).valid,true);

const invalidBinding=structuredClone(project);
invalidBinding.scene.objects[profileConsumer.objectId].data.sourceRef={targetKind:'SKETCH',ownerId:sketch.objectId,targetId:sketch.objectId};
const invalidResult=validateProject(invalidBinding);
assert.equal(invalidResult.valid,false);
assert.match(invalidResult.errors.join('\n'),/targetKind muss PROFILE oder PATH sein/);

console.log('WD-21G.2 PROFILE/PATH Consumer Binding Foundation regression: PASS');
