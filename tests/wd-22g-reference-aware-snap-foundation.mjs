import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createProject, createWorkPlaneObject } from '../src/model/project.js';
import { GlobalConstructionAxisId, GlobalWorkPlaneId, SYSTEM_CONSTRUCTION_OWNER_ID } from '../src/model/construction-reference.js';
import { createStableReference, ReferenceTargetKind } from '../src/application/stable-reference.js';
import { SnapGeometryKind, chooseSnapCandidate, createSnapCandidate, resolveReferenceSnap } from '../src/application/reference-snap.js';

const project=createProject('WD-22G');
const sketch={objectId:'sketch_a',type:'sketch',name:'Sketch',parentId:null,order:1,transform:{position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0},scale:{x:1,y:1,z:1}},data:{points:{p1:{pointId:'p1',x:10,y:10},p2:{pointId:'p2',x:20,y:10}},lines:{},circles:{}},materialIds:[],flags:{visible:true,locked:false},extensions:{}};
project.scene.objects[sketch.objectId]=sketch;project.scene.rootObjectIds.push(sketch.objectId);
const free=createWorkPlaneObject(project,'Free',{origin:{x:0,y:0,z:5},normal:{x:0,y:0,z:1},xAxis:{x:1,y:0,z:0}});project.scene.objects[free.objectId]=free;project.scene.rootObjectIds.push(free.objectId);
const store={project,getObject:id=>project.scene.objects[id]??null};

const pointRef=createStableReference(ReferenceTargetKind.SKETCH_POINT,sketch.objectId,'p1');
const axisRef=createStableReference(ReferenceTargetKind.CONSTRUCTION_AXIS,SYSTEM_CONSTRUCTION_OWNER_ID,GlobalConstructionAxisId.X);
const planeRef=createStableReference(ReferenceTargetKind.WORK_PLANE,SYSTEM_CONSTRUCTION_OWNER_ID,GlobalWorkPlaneId.XY);
const freePlaneRef=createStableReference(ReferenceTargetKind.WORK_PLANE,free.objectId,free.data.workPlaneId);
const raw={x:10.2,y:10.1,z:0.2};

const pointCandidate=createSnapCandidate(store,pointRef,raw,{tolerance:1});
const axisCandidate=createSnapCandidate(store,axisRef,{x:1,y:0.1,z:0},{tolerance:1});
const planeCandidate=createSnapCandidate(store,planeRef,{x:1,y:2,z:0.1},{tolerance:1});
assert.equal(pointCandidate.geometryKind,SnapGeometryKind.POINT);
assert.equal(axisCandidate.geometryKind,SnapGeometryKind.LINE);
assert.equal(planeCandidate.geometryKind,SnapGeometryKind.PLANE);
assert.deepEqual(pointCandidate.position,{x:10,y:10,z:0});
assert.deepEqual(axisCandidate.position,{x:1,y:0,z:0});
assert.deepEqual(planeCandidate.position,{x:1,y:2,z:0});
assert.equal(chooseSnapCandidate([planeCandidate,axisCandidate,pointCandidate]).geometryKind,SnapGeometryKind.POINT);

const excluded=resolveReferenceSnap(store,raw,[pointRef],{tolerance:1,excludedReferences:[pointRef]});
assert.equal(excluded.snapped,false);
const outside=resolveReferenceSnap(store,{x:100,y:100,z:100},[pointRef],{tolerance:1});
assert.equal(outside.snapped,false);
const before=JSON.stringify(project);
const snapped=resolveReferenceSnap(store,raw,[planeRef,axisRef,pointRef,freePlaneRef],{tolerance:20});
assert.equal(snapped.snapped,true);
assert.equal(snapped.targetKind,ReferenceTargetKind.SKETCH_POINT);
assert.equal(JSON.stringify(project),before);

const missing=createStableReference(ReferenceTargetKind.SKETCH_POINT,sketch.objectId,'missing');
assert.equal(createSnapCandidate(store,missing,raw,{tolerance:100}),null);
const invalidAxis={objectId:'axis_bad',type:'construction.axis',name:'Bad',parentId:null,order:3,transform:{position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0},scale:{x:1,y:1,z:1}},data:{constructionAxisId:'axis_bad',definition:{origin:{x:0,y:0,z:0},direction:{x:0,y:0,z:0}}},materialIds:[],flags:{visible:true,locked:false},extensions:{}};
project.scene.objects[invalidAxis.objectId]=invalidAxis;
const invalidRef=createStableReference(ReferenceTargetKind.CONSTRUCTION_AXIS,invalidAxis.objectId,'axis_bad');
assert.equal(createSnapCandidate(store,invalidRef,raw,{tolerance:100}),null);

const gizmo=fs.readFileSync(new URL('../src/ui/sketch-gizmo.js',import.meta.url),'utf8');
assert.match(gizmo,/resolveReferenceSnap/);
assert.match(gizmo,/enumerateReferenceSnapTargets/);
assert.match(gizmo,/excludedReferences/);
assert.match(gizmo,/runSketchMutation/);
assert.match(gizmo,/referenceTarget[\s\S]*else[\s\S]*snap\(rawTarget\.x\)/);

console.log('WD-22G reference-aware snap foundation regression PASS');
