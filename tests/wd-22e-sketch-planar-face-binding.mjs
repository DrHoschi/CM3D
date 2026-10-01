import assert from 'node:assert/strict';
import { buildDependencyGraph, DependencyNodeState, validateDependencyEdge } from '../src/application/dependency-graph.js';
import { resolveSketchPlaneBinding } from '../src/application/sketch-plane-binding.js';
import { createStableReference, ReferenceState, ReferenceTargetKind } from '../src/application/stable-reference.js';
import { ExtrudePlanarFaceId } from '../src/model/planar-face-reference.js';
import { createProject, createSketchObject, validateProject } from '../src/model/project.js';
import { serializeProjectFile, parseProjectFileText } from '../src/persistence/project-file.js';

const identityTransform=()=>({position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0,w:1},scale:{x:1,y:1,z:1},pivot:{x:0,y:0,z:0}});
const insert=(project,object)=>{project.scene.objects[object.objectId]=object;project.scene.rootObjectIds.push(object.objectId);};
const sketchRef=id=>createStableReference(ReferenceTargetKind.SKETCH,id,id);
const faceRef=(extrudeId,faceId=ExtrudePlanarFaceId.CAP_END)=>createStableReference(ReferenceTargetKind.PLANAR_FACE,extrudeId,faceId);
const extrude=(id,sourceSketchId,depth=10,direction='positive')=>({
  objectId:id,type:'feature.extrude',name:id,parentId:null,order:0,transform:identityTransform(),
  data:{sourceSketchRef:sketchRef(sourceSketchId),depth,direction,profile:{points:[{x:0,y:0},{x:1,y:0},{x:1,y:1}]}},
  materialIds:[],flags:{visible:true,locked:false},extensions:{}
});
const storeFor=project=>({project,getObject(id){return this.project.scene.objects[id]??null;}});

const legacy=createSketchObject(createProject('legacy'),'Legacy');
assert.equal(resolveSketchPlaneBinding(storeFor(createProject('empty')),legacy).mode,'LEGACY_LOCAL_XY');

const project=createProject('WD-22E');
const source=createSketchObject(project,'Source');
const bound=createSketchObject(project,'Face Bound');
const feature=extrude('extrude_1',source.objectId,10,'positive');
insert(project,source);insert(project,feature);insert(project,bound);
bound.data.planeRef=faceRef(feature.objectId,ExtrudePlanarFaceId.CAP_END);
assert.equal(validateProject(project).valid,true);
const store=storeFor(project);

let binding=resolveSketchPlaneBinding(store,bound);
assert.equal(binding.mode,'BOUND');
assert.equal(binding.resolution.state,ReferenceState.RESOLVED);
assert.deepEqual(binding.frame.origin,{x:0,y:0,z:10});
assert.deepEqual(binding.frame.xAxis,{x:1,y:0,z:0});
assert.deepEqual(binding.frame.yAxis,{x:0,y:1,z:0});
assert.deepEqual(binding.frame.zAxis,{x:0,y:0,z:1});

bound.data.planeRef=faceRef(feature.objectId,ExtrudePlanarFaceId.CAP_START);
binding=resolveSketchPlaneBinding(store,bound);
assert.deepEqual(binding.frame.origin,{x:0,y:0,z:0});
assert.deepEqual(binding.frame.zAxis,{x:0,y:0,z:-1});
assert.deepEqual(binding.frame.yAxis,{x:0,y:-1,z:0});

bound.data.planeRef=faceRef(feature.objectId,ExtrudePlanarFaceId.CAP_END);
const persistedRef=structuredClone(bound.data.planeRef);
feature.data.depth=25;
binding=resolveSketchPlaneBinding(store,bound);
assert.deepEqual(bound.data.planeRef,persistedRef);
assert.equal(binding.frame.origin.z,25);

let graph=buildDependencyGraph(store);
const planeEdge=graph.dependenciesOf(bound.objectId).find(edge=>edge.kind==='PLANE_REFERENCE_TO_SKETCH');
assert.ok(planeEdge);
assert.equal(planeEdge.sourceObjectId,feature.objectId);
assert.equal(planeEdge.state,ReferenceState.RESOLVED);
assert.equal(graph.nodeState(bound.objectId).state,DependencyNodeState.READY);

const savedRef=structuredClone(bound.data.planeRef);
bound.data.planeRef=faceRef('missing_extrude');
binding=resolveSketchPlaneBinding(store,bound);
assert.equal(binding.resolution.state,ReferenceState.MISSING);assert.equal(binding.frame,null);
bound.data.planeRef=savedRef;
feature.data.depth=0;
binding=resolveSketchPlaneBinding(store,bound);
assert.equal(binding.resolution.state,ReferenceState.INVALID);assert.equal(binding.frame,null);
feature.data.depth=25;
feature.extensions.recomputeState={state:'BLOCKED',upstreamState:'MISSING',diagnostics:[]};
binding=resolveSketchPlaneBinding(store,bound);
assert.equal(binding.resolution.state,ReferenceState.BLOCKED);assert.equal(binding.frame,null);
delete feature.extensions.recomputeState;

const reloaded=parseProjectFileText(serializeProjectFile(project));
assert.deepEqual(reloaded.scene.objects[bound.objectId].data.planeRef,persistedRef);
const reloadedBinding=resolveSketchPlaneBinding(storeFor(reloaded),reloaded.scene.objects[bound.objectId]);
assert.equal(reloadedBinding.resolution.state,ReferenceState.RESOLVED);
assert.equal(reloadedBinding.frame.origin.z,25);

// Before a future binding mutation writes planeRef, the existing guard rejects the new Extrude -> Sketch edge.
const guardProject=createProject('WD-22E cycle guard');
const guardSketch=createSketchObject(guardProject,'Guard');
const guardExtrude=extrude('extrude_guard',guardSketch.objectId);
insert(guardProject,guardSketch);insert(guardProject,guardExtrude);
const guardGraph=buildDependencyGraph(storeFor(guardProject));
const guardResult=validateDependencyEdge(guardGraph,guardExtrude.objectId,guardSketch.objectId);
assert.equal(guardResult.allowed,false);
assert.equal(guardResult.code,'DEPENDENCY_CYCLE');

// Persisted direct cycle is also detected and blocked.
guardSketch.data.planeRef=faceRef(guardExtrude.objectId);
const directGraph=buildDependencyGraph(storeFor(guardProject));
assert.equal(directGraph.hasCycles,true);
assert.equal(directGraph.nodeState(guardSketch.objectId).state,DependencyNodeState.BLOCKED);
assert.equal(directGraph.nodeState(guardExtrude.objectId).state,DependencyNodeState.BLOCKED);

// Indirect cycle: A -> ExtrudeA -> B -> ExtrudeB -> A.
const indirectProject=createProject('WD-22E indirect cycle');
const sketchA=createSketchObject(indirectProject,'A');
const sketchB=createSketchObject(indirectProject,'B');
const extrudeA=extrude('extrude_a',sketchA.objectId);
const extrudeB=extrude('extrude_b',sketchB.objectId);
insert(indirectProject,sketchA);insert(indirectProject,extrudeA);insert(indirectProject,sketchB);insert(indirectProject,extrudeB);
sketchA.data.planeRef=faceRef(extrudeB.objectId);
sketchB.data.planeRef=faceRef(extrudeA.objectId);
const indirectGraph=buildDependencyGraph(storeFor(indirectProject));
assert.equal(indirectGraph.hasCycles,true);
for(const id of [sketchA.objectId,extrudeA.objectId,sketchB.objectId,extrudeB.objectId])assert.equal(indirectGraph.nodeState(id).state,DependencyNodeState.BLOCKED);

console.log('WD-22E Sketch Planar Face Binding regression: PASS');
