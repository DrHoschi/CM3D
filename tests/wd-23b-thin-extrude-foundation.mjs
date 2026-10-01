import assert from 'node:assert/strict';
import { createStableReference, ReferenceState, ReferenceTargetKind } from '../src/application/stable-reference.js';
import { buildDependencyGraph, DependencyNodeState } from '../src/application/dependency-graph.js';
import { deriveThinExtrudeContour, syncThinExtrudeSourceReference, ThinExtrudeSide } from '../src/application/thin-extrude.js';
import { createPathIdentity } from '../src/model/sketch-profile-path-identity.js';
import { deriveSketchProfilesAndPaths } from '../src/model/sketch-profile-path-derivation.js';
import { createProject, createSketchObject } from '../src/model/project.js';
import { parseProjectFileText, serializeProjectFile } from '../src/persistence/project-file.js';

const project=createProject('WD-23B Thin Extrude');
const sketch=createSketchObject(project,'Open Path');
project.scene.objects[sketch.objectId]=sketch;project.scene.rootObjectIds.push(sketch.objectId);
sketch.data.points.a={pointId:'a',x:0,y:0};sketch.data.points.b={pointId:'b',x:4,y:0};sketch.data.points.c={pointId:'c',x:4,y:3};
sketch.data.lines.ab={lineId:'ab',startPointId:'a',endPointId:'b'};sketch.data.lines.bc={lineId:'bc',startPointId:'b',endPointId:'c'};
let derived=deriveSketchProfilesAndPaths(sketch);assert.equal(derived.openPaths.length,1);
const identity=createPathIdentity(derived.openPaths[0],'path_1');sketch.data.pathIdentities[identity.pathId]=structuredClone(identity);
const sourceRef=createStableReference(ReferenceTargetKind.PATH,sketch.objectId,identity.pathId);
const thin={objectId:'thin-1',type:'feature.thin-extrude',name:'Thin Extrude',parentId:null,order:1,transform:structuredClone(sketch.transform),data:{sourceRef,thickness:2,side:ThinExtrudeSide.CENTER,depth:5,direction:'positive',contour:[]},materialIds:[],flags:{visible:true,locked:false},extensions:{}};
project.scene.objects[thin.objectId]=thin;project.scene.rootObjectIds.push(thin.objectId);
const store={project,getObject(id){return this.project.scene.objects[id]??null;}};

let resolution=syncThinExtrudeSourceReference(store,thin);assert.equal(resolution.state,ReferenceState.RESOLVED);assert.equal(thin.extensions.recomputeState.state,'READY');assert.ok(thin.data.contour.length>=4);
const centered=structuredClone(thin.data.contour);thin.data.side=ThinExtrudeSide.LEFT;assert.equal(syncThinExtrudeSourceReference(store,thin).state,ReferenceState.RESOLVED);assert.notDeepEqual(thin.data.contour,centered);
thin.data.side=ThinExtrudeSide.RIGHT;assert.equal(syncThinExtrudeSourceReference(store,thin).state,ReferenceState.RESOLVED);assert.notDeepEqual(thin.data.contour,centered);
thin.data.side=ThinExtrudeSide.CENTER;

const before=structuredClone(thin.data.contour);sketch.data.points.c.x=6;resolution=syncThinExtrudeSourceReference(store,thin);assert.equal(resolution.state,ReferenceState.RESOLVED);assert.notDeepEqual(thin.data.contour,before);
const graph=buildDependencyGraph(store);assert.equal(graph.nodeState(thin.objectId).state,DependencyNodeState.READY);assert.equal(graph.dependenciesOf(thin.objectId)[0].kind,'PATH_TO_THIN_EXTRUDE');assert.equal(graph.dependenciesOf(thin.objectId)[0].sourceObjectId,sketch.objectId);

const savedIdentity=sketch.data.pathIdentities[identity.pathId];delete sketch.data.pathIdentities[identity.pathId];resolution=syncThinExtrudeSourceReference(store,thin);assert.equal(resolution.state,ReferenceState.MISSING);assert.equal(thin.extensions.recomputeState.state,ReferenceState.BLOCKED);assert.deepEqual(thin.data.contour,[]);sketch.data.pathIdentities[identity.pathId]=savedIdentity;assert.equal(syncThinExtrudeSourceReference(store,thin).state,ReferenceState.RESOLVED);

const reloaded=parseProjectFileText(serializeProjectFile(project));const reloadedStore={project:reloaded,getObject(id){return this.project.scene.objects[id]??null;}};const reloadedThin=reloaded.scene.objects[thin.objectId];assert.deepEqual(reloadedThin.data.sourceRef,sourceRef);assert.equal(syncThinExtrudeSourceReference(reloadedStore,reloadedThin).state,ReferenceState.RESOLVED);assert.ok(reloadedThin.data.contour.length>=4);

const path=deriveSketchProfilesAndPaths(sketch).openPaths[0];assert.ok(deriveThinExtrudeContour(path,2,ThinExtrudeSide.CENTER));assert.equal(deriveThinExtrudeContour(path,0,ThinExtrudeSide.CENTER),null);
console.log('WD-23B Thin Extrude Foundation regression: PASS');
