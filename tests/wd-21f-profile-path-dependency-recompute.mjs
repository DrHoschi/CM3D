import assert from 'node:assert/strict';
import { createStableReference, ReferenceTargetKind, ReferenceState } from '../src/application/stable-reference.js';
import { createProfileIdentity, createPathIdentity } from '../src/model/sketch-profile-path-identity.js';
import { buildDependencyGraph, createDependencyEdge, visitDependents } from '../src/application/dependency-graph.js';

const line=(id,a,b)=>({lineId:id,startPointId:a,endPointId:b});
const point=(id,x,y)=>({pointId:id,x,y});
const sketch={objectId:'sketch',type:'sketch',data:{
  plane:'localXY',
  points:{a:point('a',0,0),b:point('b',2,0),c:point('c',2,2),d:point('d',0,2),e:point('e',3,0),f:point('f',4,0)},
  lines:{ab:line('ab','a','b'),bc:line('bc','b','c'),cd:line('cd','c','d'),da:line('da','d','a'),ef:line('ef','e','f')},
  circles:{},arcs:{},splines:{},profileIdentities:{},pathIdentities:{}
}};
const featureProfile={objectId:'feature_profile',type:'feature.synthetic',data:{}};
const featurePath={objectId:'feature_path',type:'feature.synthetic',data:{}};
const objects={sketch,feature_profile:featureProfile,feature_path:featurePath};
const store={project:{scene:{objects}},getObject(id){return objects[id]??null;}};

const derived=(await import('../src/model/sketch-profile-path-derivation.js')).deriveSketchProfilesAndPaths(sketch);
const profileIdentity=createProfileIdentity(derived.profiles[0],'profile_1');
const pathIdentity=createPathIdentity(derived.openPaths[0],'path_1');
sketch.data.profileIdentities.profile_1=profileIdentity;
sketch.data.pathIdentities.path_1=pathIdentity;

const profileRef=createStableReference(ReferenceTargetKind.PROFILE,'sketch','profile_1');
const pathRef=createStableReference(ReferenceTargetKind.PATH,'sketch','path_1');
const declared=[
  {dependentObjectId:'feature_profile',reference:profileRef,kind:'PROFILE_DEPENDENCY'},
  {dependentObjectId:'feature_path',reference:pathRef,kind:'PATH_DEPENDENCY'}
];

let graph=buildDependencyGraph(store,declared);
assert.equal(graph.dependenciesOf('feature_profile')[0].sourceObjectId,'sketch');
assert.equal(graph.dependenciesOf('feature_profile')[0].state,ReferenceState.RESOLVED);
assert.equal(graph.dependenciesOf('feature_path')[0].sourceObjectId,'sketch');
assert.equal(graph.dependenciesOf('feature_path')[0].state,ReferenceState.RESOLVED);
assert.equal(createDependencyEdge(store,'feature_profile',profileRef).sourceObjectId,'sketch');

sketch.data.points.a.x=-1;
graph=buildDependencyGraph(store,declared);
assert.equal(graph.dependenciesOf('feature_profile')[0].state,ReferenceState.RESOLVED);

const visited=[];
visitDependents(store,'sketch',(object,edge)=>visited.push([object.objectId,edge.kind]),declared);
assert.deepEqual(visited,[['feature_path','PATH_DEPENDENCY'],['feature_profile','PROFILE_DEPENDENCY']].sort((a,b)=>a[0].localeCompare(b[0])));

const savedAB=sketch.data.lines.ab;
delete sketch.data.lines.ab;
graph=buildDependencyGraph(store,declared);
assert.equal(graph.dependenciesOf('feature_profile')[0].state,ReferenceState.MISSING);
assert.equal(graph.nodeState('feature_profile').state,ReferenceState.BLOCKED);
assert.equal(graph.nodeState('feature_profile').upstreamState,ReferenceState.MISSING);
sketch.data.lines.ab=savedAB;

const savedDA=sketch.data.lines.da;
sketch.data.lines.da={...savedDA,endPointId:'b'};
graph=buildDependencyGraph(store,declared);
assert.equal(graph.dependenciesOf('feature_profile')[0].state,ReferenceState.INVALID);
assert.equal(graph.nodeState('feature_profile').state,ReferenceState.BLOCKED);
assert.equal(graph.nodeState('feature_profile').upstreamState,ReferenceState.INVALID);
sketch.data.lines.da=savedDA;

graph=buildDependencyGraph(store,declared);
assert.equal(graph.dependenciesOf('feature_profile')[0].state,ReferenceState.RESOLVED);
assert.equal(graph.nodeState('feature_profile').state,'READY');

const split=sketch.data.lines.ef;
sketch.data.lines.ef={...split,endPointId:'e'};
graph=buildDependencyGraph(store,declared);
assert.notEqual(graph.dependenciesOf('feature_path')[0].state,ReferenceState.RESOLVED);
assert.equal(graph.nodeState('feature_path').state,ReferenceState.BLOCKED);
sketch.data.lines.ef=split;

assert.equal(buildDependencyGraph(store).dependenciesOf('feature_profile').length,0);
console.log('WD-21F Profile/Path Dependency & Recompute Foundation regression: PASS');
