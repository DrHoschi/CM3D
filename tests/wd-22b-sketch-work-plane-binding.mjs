import assert from 'node:assert/strict';
import { buildDependencyGraph, DependencyNodeState } from '../src/application/dependency-graph.js';
import { frameFromWorkPlaneDefinition, resolveSketchPlaneBinding } from '../src/application/sketch-plane-binding.js';
import { createStableReference, ReferenceState, ReferenceTargetKind, resolveStableReference } from '../src/application/stable-reference.js';
import { GlobalWorkPlaneId, SYSTEM_CONSTRUCTION_OWNER_ID } from '../src/model/construction-reference.js';
import { createProject, createSketchObject, createWorkPlaneObject, validateProject } from '../src/model/project.js';
import { createPartialProject, mergePartialProject } from '../src/persistence/partial-project.js';
import { parseProjectFileText, serializeProjectFile } from '../src/persistence/project-file.js';

const insert=(project,object)=>{project.scene.objects[object.objectId]=object;project.scene.rootObjectIds.push(object.objectId);};

class TestStore {
  constructor(project=createProject('test')) {
    this.project=structuredClone(project);
    this.selection={selectedObjectIds:[],activeObjectId:null,hoveredObjectId:null};
  }
  getObject(id){return this.project.scene.objects[id]??null;}
  replaceProject(project){this.project=structuredClone(project);this.clearSelection();}
  select(id,notify=true,additive=false){
    if(!id||!this.getObject(id))return;
    if(additive){
      const selected=new Set(this.selection.selectedObjectIds);
      selected.has(id)?selected.delete(id):selected.add(id);
      this.selection.selectedObjectIds=[...selected];
      this.selection.activeObjectId=selected.has(id)?id:(this.selection.selectedObjectIds.at(-1)??null);
    } else {
      this.selection.selectedObjectIds=[id];
      this.selection.activeObjectId=id;
    }
  }
  clearSelection(){this.selection.selectedObjectIds=[];this.selection.activeObjectId=null;this.selection.hoveredObjectId=null;}
  snapshot(){return structuredClone(this.project);}
  getWorldTransform(id){return structuredClone(this.getObject(id)?.transform ?? {position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0,w:1},scale:{x:1,y:1,z:1}});}
  touch(){}
  pushHistory(){}
  emit(){}
}

const legacy=createSketchObject(createProject('legacy'));
assert.equal(legacy.data.plane,'localXY');
assert.equal(legacy.data.planeRef,undefined);

const project=createProject('WD-22B');
const plane=createWorkPlaneObject(project,'Plane',{origin:{x:4,y:5,z:6},normal:{x:0,y:0,z:2},xAxis:{x:2,y:0,z:2}});
const sketch=createSketchObject(project,'Bound');
insert(project,plane);insert(project,sketch);
sketch.data.planeRef=createStableReference(ReferenceTargetKind.WORK_PLANE,plane.objectId,plane.data.workPlaneId);
assert.equal(validateProject(project).valid,true);

const store=new TestStore(project);
const binding=resolveSketchPlaneBinding(store,store.getObject(sketch.objectId));
assert.equal(binding.mode,'BOUND');
assert.equal(binding.resolution.state,ReferenceState.RESOLVED);
assert.deepEqual(binding.frame.origin,{x:4,y:5,z:6});
assert.deepEqual(binding.frame.xAxis,{x:1,y:0,z:0});
assert.deepEqual(binding.frame.yAxis,{x:0,y:1,z:0});
assert.deepEqual(binding.frame.zAxis,{x:0,y:0,z:1});

for(const id of Object.values(GlobalWorkPlaneId)){
  const globalRef=createStableReference(ReferenceTargetKind.WORK_PLANE,SYSTEM_CONSTRUCTION_OWNER_ID,id);
  const globalSketch=createSketchObject(store.project,'Global');
  globalSketch.data.planeRef=globalRef;
  const resolved=resolveSketchPlaneBinding(store,globalSketch);
  assert.equal(resolved.resolution.state,ReferenceState.RESOLVED);
  assert.ok(resolved.frame);
}

const graph=buildDependencyGraph(store);
assert.equal(graph.nodeState(sketch.objectId).state,DependencyNodeState.READY);
assert.equal(graph.dependenciesOf(sketch.objectId).length,1);
assert.equal(graph.dependenciesOf(sketch.objectId)[0].sourceObjectId,plane.objectId);

const missing=structuredClone(store.getObject(sketch.objectId));
missing.objectId='obj_missing_plane_sketch';
missing.data.planeRef={...missing.data.planeRef,ownerId:'obj_missing_plane'};
store.project.scene.objects[missing.objectId]=missing;
store.project.scene.rootObjectIds.push(missing.objectId);
const missingBinding=resolveSketchPlaneBinding(store,missing);
assert.equal(missingBinding.resolution.state,ReferenceState.MISSING);
assert.equal(missingBinding.frame,null);
assert.equal(buildDependencyGraph(store).nodeState(missing.objectId).state,DependencyNodeState.BLOCKED);

const invalidPlane=store.getObject(plane.objectId);
const savedDefinition=structuredClone(invalidPlane.data.definition);
invalidPlane.data.definition.normal={x:0,y:0,z:0};
assert.equal(resolveSketchPlaneBinding(store,store.getObject(sketch.objectId)).resolution.state,ReferenceState.INVALID);
assert.equal(resolveSketchPlaneBinding(store,store.getObject(sketch.objectId)).frame,null);
invalidPlane.data.definition=savedDefinition;

const beforePoints=structuredClone(store.getObject(sketch.objectId).data.points);
const reloaded=parseProjectFileText(serializeProjectFile(store.project));
assert.deepEqual(reloaded.scene.objects[sketch.objectId].data.planeRef,sketch.data.planeRef);
assert.deepEqual(reloaded.scene.objects[sketch.objectId].data.points,beforePoints);
assert.equal(reloaded.schemaVersion,'0.2.0');

store.select(plane.objectId,false);
store.select(sketch.objectId,false,true);
const joint=createPartialProject(store);
const jointTarget=sketch.data.planeRef.targetId;
const jointDest=new TestStore();
mergePartialProject(jointDest,joint);
const importedSketch=Object.values(jointDest.project.scene.objects).find(o=>o.type==='sketch');
const importedPlane=Object.values(jointDest.project.scene.objects).find(o=>o.type==='construction.workPlane');
assert.ok(importedSketch&&importedPlane);
assert.equal(importedSketch.data.planeRef.ownerId,importedPlane.objectId);
assert.equal(importedSketch.data.planeRef.targetId,jointTarget);
assert.equal(resolveStableReference(jointDest,importedSketch.data.planeRef).state,ReferenceState.RESOLVED);

store.clearSelection(false);
store.select(sketch.objectId,false);
const isolated=createPartialProject(store);
const isolatedDest=new TestStore();
mergePartialProject(isolatedDest,isolated);
const isolatedSketch=Object.values(isolatedDest.project.scene.objects).find(o=>o.type==='sketch');
assert.ok(isolatedSketch);
assert.equal(isolatedSketch.data.planeRef.ownerId,plane.objectId);
assert.equal(isolatedSketch.data.planeRef.targetId,plane.data.workPlaneId);
assert.equal(resolveStableReference(isolatedDest,isolatedSketch.data.planeRef).state,ReferenceState.MISSING);
assert.equal(resolveSketchPlaneBinding(isolatedDest,isolatedSketch).frame,null);

const projected=frameFromWorkPlaneDefinition({origin:{x:0,y:0,z:0},normal:{x:0,y:0,z:1},xAxis:{x:1,y:0,z:1}});
assert.deepEqual(projected.xAxis,{x:1,y:0,z:0});

console.log('WD-22B Sketch Work Plane Reference Binding regression: PASS');
