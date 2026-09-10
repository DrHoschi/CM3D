import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  SketchElementKind,
  SketchElementRegistry,
  getSketchElement,
  getSketchElementPointIds,
  validateSketchTopology
} from '../src/model/sketch-topology.js';
import { createProject, createSketchObject, migrateAndValidateProject, validateProject } from '../src/model/project.js';

assert.deepEqual(Object.values(SketchElementKind).sort(), ['arc','circle','line','spline']);
assert.equal(SketchElementRegistry.line.collection, 'lines');
assert.equal(SketchElementRegistry.circle.collection, 'circles');
assert.equal(SketchElementRegistry.arc.collection, 'arcs');
assert.equal(SketchElementRegistry.spline.collection, 'splines');

const project = createProject('WD-21C.2');
const sketch = createSketchObject(project, 'Registry Sketch');
project.scene.objects[sketch.objectId] = sketch;
project.scene.rootObjectIds.push(sketch.objectId);
assert.deepEqual(sketch.data.circles, {});
assert.deepEqual(sketch.data.arcs, {});
assert.deepEqual(sketch.data.splines, {});

sketch.data.points.pt_a = { pointId:'pt_a', x:0, y:0 };
sketch.data.points.pt_b = { pointId:'pt_b', x:2, y:0 };
sketch.data.lines.ln_1 = { lineId:'ln_1', startPointId:'pt_a', endPointId:'pt_b' };
sketch.data.circles.c_1 = { circleId:'c_1', center:{x:5,y:5}, radius:2 };
sketch.data.arcs.a_1 = { arcId:'a_1', startPointId:'pt_a', endPointId:'pt_b', control:{x:1,y:1} };
sketch.data.splines.s_1 = { splineId:'s_1', startPointId:'pt_a', endPointId:'pt_b', controls:[{controlId:'ctl_1',x:1,y:2}] };

assert.equal(getSketchElement(sketch,'c_1','circle')?.kind,'circle');
assert.equal(getSketchElement(sketch,'a_1','arc')?.kind,'arc');
assert.equal(getSketchElement(sketch,'s_1','spline')?.kind,'spline');
assert.deepEqual(getSketchElementPointIds(sketch,'c_1','circle'),[]);
assert.deepEqual(getSketchElementPointIds(sketch,'a_1','arc'),['pt_a','pt_b']);
assert.deepEqual(getSketchElementPointIds(sketch,'s_1','spline'),['pt_a','pt_b']);
assert.equal(validateSketchTopology(sketch).valid,true);
assert.equal(validateProject(project).valid,true);

const roundTrip = migrateAndValidateProject(JSON.parse(JSON.stringify(project)));
assert.equal(roundTrip.project.scene.objects[sketch.objectId].data.circles.c_1.circleId,'c_1');
assert.equal(roundTrip.project.scene.objects[sketch.objectId].data.arcs.a_1.arcId,'a_1');
assert.equal(roundTrip.project.scene.objects[sketch.objectId].data.splines.s_1.controls[0].controlId,'ctl_1');

const old020 = structuredClone(project);
delete old020.scene.objects[sketch.objectId].data.circles;
delete old020.scene.objects[sketch.objectId].data.arcs;
delete old020.scene.objects[sketch.objectId].data.splines;
const normalized020 = migrateAndValidateProject(old020);
assert.equal(normalized020.migrated,false);
assert.deepEqual(normalized020.project.scene.objects[sketch.objectId].data.circles,{});
assert.deepEqual(normalized020.project.scene.objects[sketch.objectId].data.arcs,{});
assert.deepEqual(normalized020.project.scene.objects[sketch.objectId].data.splines,{});

const old010 = structuredClone(old020);
old010.schemaVersion='0.1.0';
const migrated010 = migrateAndValidateProject(old010);
assert.equal(migrated010.migrated,true);
assert.equal(migrated010.project.schemaVersion,'0.2.0');
assert.deepEqual(migrated010.project.scene.objects[sketch.objectId].data.circles,{});

const invalidCircle = structuredClone(sketch);
invalidCircle.data.circles.c_1.radius = 0;
assert.equal(validateSketchTopology(invalidCircle).valid,false);
const invalidArc = structuredClone(sketch);
invalidArc.data.arcs.a_1.control = {x:1,y:0};
assert.equal(validateSketchTopology(invalidArc).valid,false);
const invalidSpline = structuredClone(sketch);
invalidSpline.data.splines.s_1.controls = [];
assert.equal(validateSketchTopology(invalidSpline).valid,false);

const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.match(main, /const BUILD_ID = '(?:WD-21C\.[2-9](?:-R\d+)?|WD-21D\.1(?:-R\d+)?)'/);

console.log('WD-21C.2 Generic Sketch Element Registry & Persistence Foundation: PASS');
