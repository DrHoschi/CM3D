import assert from 'node:assert/strict';
import { createProject, createWorkPlaneObject } from '../src/model/project.js';
import { GlobalConstructionAxisId, GlobalWorkPlaneId, SYSTEM_CONSTRUCTION_OWNER_ID } from '../src/model/construction-reference.js';
import { createStableReference, ReferenceTargetKind } from '../src/application/stable-reference.js';
import { referenceGeometryForReference, ReferenceGeometryKind } from '../src/application/reference-geometry.js';
import { createSnapCandidate, SnapGeometryKind } from '../src/application/reference-snap.js';
import {
  MeasurementInvalidReason,
  MeasurementKind,
  MeasurementRelation,
  MeasurementState,
  MeasurementUnit,
  measureReferences
} from '../src/application/reference-measurement.js';

const project=createProject('WD-22H');
const sketch={objectId:'sketch_measure',type:'sketch',name:'Measure Sketch',parentId:null,order:1,transform:{position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0},scale:{x:1,y:1,z:1}},data:{points:{p0:{pointId:'p0',x:0,y:0},p1:{pointId:'p1',x:3,y:4}},lines:{},circles:{}},materialIds:[],flags:{visible:true,locked:false},extensions:{}};
project.scene.objects[sketch.objectId]=sketch;project.scene.rootObjectIds.push(sketch.objectId);
const free=createWorkPlaneObject(project,'Z5',{origin:{x:0,y:0,z:5},normal:{x:0,y:0,z:1},xAxis:{x:1,y:0,z:0}});project.scene.objects[free.objectId]=free;project.scene.rootObjectIds.push(free.objectId);
const store={project,getObject:id=>project.scene.objects[id]??null};

const p0=createStableReference(ReferenceTargetKind.SKETCH_POINT,sketch.objectId,'p0');
const p1=createStableReference(ReferenceTargetKind.SKETCH_POINT,sketch.objectId,'p1');
const xAxis=createStableReference(ReferenceTargetKind.CONSTRUCTION_AXIS,SYSTEM_CONSTRUCTION_OWNER_ID,GlobalConstructionAxisId.X);
const yAxis=createStableReference(ReferenceTargetKind.CONSTRUCTION_AXIS,SYSTEM_CONSTRUCTION_OWNER_ID,GlobalConstructionAxisId.Y);
const xy=createStableReference(ReferenceTargetKind.WORK_PLANE,SYSTEM_CONSTRUCTION_OWNER_ID,GlobalWorkPlaneId.XY);
const xz=createStableReference(ReferenceTargetKind.WORK_PLANE,SYSTEM_CONSTRUCTION_OWNER_ID,GlobalWorkPlaneId.XZ);
const z5=createStableReference(ReferenceTargetKind.WORK_PLANE,free.objectId,free.data.workPlaneId);

assert.equal(referenceGeometryForReference(store,p1).kind,ReferenceGeometryKind.POINT);
assert.equal(SnapGeometryKind,ReferenceGeometryKind);
assert.equal(createSnapCandidate(store,p1,{x:3.1,y:4,z:0},{tolerance:1}).geometryKind,ReferenceGeometryKind.POINT);

const pointPoint=measureReferences(store,p0,p1);
assert.deepEqual({state:pointPoint.state,kind:pointPoint.kind,relation:pointPoint.relation,unit:pointPoint.unit,value:pointPoint.value},{state:MeasurementState.VALID,kind:MeasurementKind.DISTANCE,relation:MeasurementRelation.POINT_POINT,unit:MeasurementUnit.METER,value:5});
assert.equal(measureReferences(store,p0,p0).value,0);

const pointLine=measureReferences(store,p1,xAxis);
assert.equal(pointLine.relation,MeasurementRelation.POINT_LINE);
assert.equal(pointLine.value,4);
assert.equal(measureReferences(store,xAxis,p1).value,4);

const pointPlane=measureReferences(store,p0,z5);
assert.equal(pointPlane.relation,MeasurementRelation.POINT_PLANE);
assert.equal(pointPlane.value,5);
assert.equal(measureReferences(store,z5,p0).value,5);

const lineAngle=measureReferences(store,xAxis,yAxis);
assert.equal(lineAngle.kind,MeasurementKind.ANGLE);
assert.equal(lineAngle.unit,MeasurementUnit.RADIAN);
assert.ok(Math.abs(lineAngle.value-Math.PI/2)<1e-12);
assert.equal(measureReferences(store,xAxis,xAxis).value,0);

const planeAngle=measureReferences(store,xy,xz);
assert.equal(planeAngle.relation,MeasurementRelation.PLANE_PLANE);
assert.ok(Math.abs(planeAngle.value-Math.PI/2)<1e-12);
assert.equal(measureReferences(store,xy,xy).value,0);

const missing=createStableReference(ReferenceTargetKind.SKETCH_POINT,sketch.objectId,'missing');
const missingResult=measureReferences(store,missing,p0);
assert.equal(missingResult.state,MeasurementState.INVALID);
assert.equal(missingResult.reason,MeasurementInvalidReason.UNRESOLVED_REFERENCE);
assert.equal(missingResult.value,null);

const unsupported=measureReferences(store,xAxis,xy);
assert.equal(unsupported.state,MeasurementState.INVALID);
assert.equal(unsupported.reason,MeasurementInvalidReason.UNSUPPORTED_RELATION);

const before=JSON.stringify(project);
measureReferences(store,p1,z5);
assert.equal(JSON.stringify(project),before,'Measurement must remain read-only and non-persistent');

console.log('WD-22H reference-aware measurement foundation regression PASS');
