import assert from 'node:assert/strict';
import { createProject, createWorkPlaneObject, createOffsetWorkPlaneObject, migrateAndValidateProject, validateProject } from '../src/model/project.js';
import { SYSTEM_CONSTRUCTION_OWNER_ID, GlobalWorkPlaneId, resolveWorkPlaneDefinition } from '../src/model/construction-reference.js';
import { createStableReference, ReferenceState, ReferenceTargetKind, resolveStableReference } from '../src/application/stable-reference.js';
import { buildDependencyGraph } from '../src/application/dependency-graph.js';

const add=(project,object)=>{project.scene.objects[object.objectId]=object;project.scene.rootObjectIds.push(object.objectId);};
const storeFor=project=>({project,getObject:id=>project.scene.objects[id]??null});
const wpRef=object=>createStableReference(ReferenceTargetKind.WORK_PLANE,object.objectId,object.data.workPlaneId);
const globalXY=createStableReference(ReferenceTargetKind.WORK_PLANE,SYSTEM_CONSTRUCTION_OWNER_ID,GlobalWorkPlaneId.XY);

const project=createProject('WD-22F');
const free=createWorkPlaneObject(project,'Free',{origin:{x:1,y:2,z:3},normal:{x:0,y:0,z:1},xAxis:{x:1,y:0,z:0}});add(project,free);
const offsetGlobal=createOffsetWorkPlaneObject(project,globalXY,100,'Offset Global');add(project,offsetGlobal);
const offsetFree=createOffsetWorkPlaneObject(project,wpRef(free),-25,'Offset Free');add(project,offsetFree);
let store=storeFor(project);
assert.equal(validateProject(project).valid,true);
assert.deepEqual(resolveWorkPlaneDefinition(store,wpRef(free)).definition.origin,{x:1,y:2,z:3});
assert.deepEqual(resolveWorkPlaneDefinition(store,wpRef(offsetGlobal)).definition.origin,{x:0,y:0,z:100});
assert.deepEqual(resolveWorkPlaneDefinition(store,wpRef(offsetFree)).definition.origin,{x:1,y:2,z:-22});
assert.equal(resolveStableReference(store,wpRef(offsetFree)).state,ReferenceState.RESOLVED);

const chained=createOffsetWorkPlaneObject(project,wpRef(offsetGlobal),50,'Chain');add(project,chained);store=storeFor(project);
assert.deepEqual(resolveWorkPlaneDefinition(store,wpRef(chained)).definition.origin,{x:0,y:0,z:150});

const extrude={objectId:'obj_extrude',type:'feature.extrude',name:'Extrude',parentId:null,order:99,transform:{position:{x:10,y:20,z:30},rotation:{x:0,y:0,z:0,w:1},scale:{x:1,y:1,z:1},pivot:{x:0,y:0,z:0}},data:{depth:40,direction:'positive',sourceSketchRef:{targetKind:'SKETCH',ownerId:'unused',targetId:'unused'},profile:{}},materialIds:[],flags:{visible:true,locked:false},extensions:{}};add(project,extrude);
const faceRef=createStableReference(ReferenceTargetKind.PLANAR_FACE,extrude.objectId,'CAP_END');
const offsetFace=createOffsetWorkPlaneObject(project,faceRef,10,'Face Offset');add(project,offsetFace);store=storeFor(project);
assert.deepEqual(resolveWorkPlaneDefinition(store,wpRef(offsetFace)).definition.origin,{x:10,y:20,z:80});
extrude.data.depth=60;
assert.deepEqual(resolveWorkPlaneDefinition(store,wpRef(offsetFace)).definition.origin,{x:10,y:20,z:100});
assert.deepEqual(offsetFace.data.derivation.sourceRef,faceRef);
assert.equal('definition' in offsetFace.data,false);

const graph=buildDependencyGraph(store);
assert.ok(graph.dependenciesOf(offsetFree.objectId).some(edge=>edge.sourceObjectId===free.objectId&&edge.kind==='PLANE_REFERENCE_TO_DERIVED_WORK_PLANE'));
assert.ok(graph.dependenciesOf(offsetFace.objectId).some(edge=>edge.sourceObjectId===extrude.objectId));
assert.equal(graph.dependenciesOf(offsetGlobal.objectId).length,0);

const roundtrip=JSON.parse(JSON.stringify(project));
const migrated=migrateAndValidateProject(roundtrip).project;
const reloaded=migrated.scene.objects[offsetFace.objectId];
assert.equal('definition' in reloaded.data,false);
assert.equal(reloaded.data.derivation.offsetMm,10);
assert.deepEqual(reloaded.data.derivation.sourceRef,faceRef);

const missing=createOffsetWorkPlaneObject(project,{targetKind:'WORK_PLANE',ownerId:'missing',targetId:'wp_missing'},5,'Missing');add(project,missing);store=storeFor(project);
assert.equal(resolveWorkPlaneDefinition(store,wpRef(missing)).state,ReferenceState.MISSING);

const invalid=createOffsetWorkPlaneObject(project,globalXY,Number.NaN,'Invalid');add(project,invalid);store=storeFor(project);
assert.equal(resolveWorkPlaneDefinition(store,wpRef(invalid)).state,ReferenceState.INVALID);

extrude.extensions.recomputeState={state:'BLOCKED'};
assert.equal(resolveWorkPlaneDefinition(store,wpRef(offsetFace)).state,ReferenceState.BLOCKED);
delete extrude.extensions.recomputeState;

const cycleA=createOffsetWorkPlaneObject(project,globalXY,1,'Cycle A');add(project,cycleA);
const cycleB=createOffsetWorkPlaneObject(project,wpRef(cycleA),1,'Cycle B');add(project,cycleB);
cycleA.data.derivation.sourceRef=wpRef(cycleB);store=storeFor(project);
assert.equal(resolveWorkPlaneDefinition(store,wpRef(cycleA)).state,ReferenceState.BLOCKED);
const cycleGraph=buildDependencyGraph(store);
assert.equal(cycleGraph.hasCycles,true);
assert.equal(cycleGraph.nodeState(cycleA.objectId).state,'BLOCKED');
assert.equal(cycleGraph.nodeState(cycleB.objectId).state,'BLOCKED');

const both=createWorkPlaneObject(project,'Both');both.data.derivation={kind:'OFFSET',sourceRef:globalXY,offsetMm:1};
assert.equal(validateProject({...project,scene:{...project.scene,objects:{[both.objectId]:both}}}).valid,false);

console.log('WD-22F derived work plane foundation regression PASS');
