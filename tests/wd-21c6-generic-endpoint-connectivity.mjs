import assert from 'node:assert/strict';
import fs from 'node:fs';
import { installSketchMutationContract } from '../src/application/sketch-mutation.js';
import { installGenericSketchElementMutationContract } from '../src/application/sketch-element-mutation-extension.js';
import { installGenericEndpointConnectivityContract } from '../src/application/sketch-endpoint-connectivity-extension.js';
import { installSketchConnectivityCommands, deriveSketchConnectivityCommandState } from '../src/application/sketch-connectivity-commands.js';

const makeStore = sketch => {
  const store = {
    project: { project: { modifiedAt: 'initial' }, scene: { objects: { [sketch.objectId]: structuredClone(sketch) } } },
    selection: { sketchElement: null, sketchElements: [] }, undoStack: [], redoStack: [],
    snapshot() { return structuredClone(this.project); },
    pushHistory(before, label) { this.undoStack.push({ before, after: this.snapshot(), label }); this.redoStack = []; },
    getObject(id) { return this.project.scene.objects[id] ?? null; },
    touch() { this.project.project.modifiedAt = `touch-${this.undoStack.length + 1}`; },
    emit() {}, refreshDependentExtrudesFromSketch() { return []; },
    getSelectedSketchElements() { return this.selection.sketchElements; }
  };
  installSketchMutationContract(store);
  installGenericSketchElementMutationContract(store);
  installGenericEndpointConnectivityContract(store);
  installSketchConnectivityCommands(store);
  return store;
};

const sketch = { objectId:'sketch_c6', type:'sketch', data:{ plane:'localXY', points:{
  p_survivor:{pointId:'p_survivor',x:10,y:10}, p_source:{pointId:'p_source',x:1,y:1},
  p_l:{pointId:'p_l',x:0,y:1}, p_r:{pointId:'p_r',x:2,y:1}, p_u:{pointId:'p_u',x:1,y:2}
}, lines:{ ln:{lineId:'ln',startPointId:'p_l',endPointId:'p_source'} }, circles:{
  c1:{circleId:'c1',center:{x:1,y:1},radius:2}
}, arcs:{
  a1:{arcId:'a1',startPointId:'p_source',endPointId:'p_r',control:{x:1.5,y:2}}
}, splines:{
  s1:{splineId:'s1',startPointId:'p_u',endPointId:'p_source',controls:[{controlId:'ctl1',x:0.5,y:1.5}]}
} } };

const store = makeStore(sketch);
const arcControlBefore = structuredClone(store.getObject('sketch_c6').data.arcs.a1.control);
const splineControlsBefore = structuredClone(store.getObject('sketch_c6').data.splines.s1.controls);
const circleBefore = structuredClone(store.getObject('sketch_c6').data.circles.c1);
const connectResult = store.connectSketchPoints('sketch_c6','p_survivor','p_source');
assert.ok(connectResult);
assert.deepEqual(connectResult.rewiredElements.map(item => `${item.kind}:${item.elementId}`).sort(), ['arc:a1','line:ln','spline:s1']);
assert.deepEqual(connectResult.rewiredLineIds, ['ln']);
assert.equal(store.getObject('sketch_c6').data.points.p_source, undefined);
assert.equal(store.getObject('sketch_c6').data.lines.ln.endPointId, 'p_survivor');
assert.equal(store.getObject('sketch_c6').data.arcs.a1.startPointId, 'p_survivor');
assert.equal(store.getObject('sketch_c6').data.splines.s1.endPointId, 'p_survivor');
assert.deepEqual(store.getObject('sketch_c6').data.arcs.a1.control, arcControlBefore);
assert.deepEqual(store.getObject('sketch_c6').data.splines.s1.controls, splineControlsBefore);
assert.deepEqual(store.getObject('sketch_c6').data.circles.c1, circleBefore);
assert.equal(store.undoStack.length, 1);

const disconnectResult = store.disconnectSketchElementFromPoint('sketch_c6','p_survivor','arc','a1');
assert.ok(disconnectResult?.newPointId);
assert.equal(disconnectResult.elementKind, 'arc');
assert.equal(disconnectResult.elementId, 'a1');
assert.equal(store.getObject('sketch_c6').data.arcs.a1.startPointId, disconnectResult.newPointId);
assert.equal(store.getObject('sketch_c6').data.lines.ln.endPointId, 'p_survivor');
assert.equal(store.getObject('sketch_c6').data.splines.s1.endPointId, 'p_survivor');
assert.deepEqual(store.getObject('sketch_c6').data.arcs.a1.control, arcControlBefore);
assert.deepEqual(store.getObject('sketch_c6').data.points[disconnectResult.newPointId], { pointId: disconnectResult.newPointId, x:10, y:10 });
assert.equal(store.undoStack.length, 2);

store.selection.sketchElements = [
  { sketchId:'sketch_c6', kind:'point', elementId:'p_survivor' },
  { sketchId:'sketch_c6', kind:'spline', elementId:'s1' }
];
let state = deriveSketchConnectivityCommandState(store);
assert.equal(state.disconnect.enabled, true);
assert.equal(state.disconnect.elementKind, 'spline');
assert.equal(state.disconnect.elementId, 's1');

store.selection.sketchElements = [
  { sketchId:'sketch_c6', kind:'point', elementId:'p_survivor' },
  { sketchId:'sketch_c6', kind:'circle', elementId:'c1' }
];
state = deriveSketchConnectivityCommandState(store);
assert.equal(state.disconnect.enabled, false);

const pairSketch = { objectId:'pair', type:'sketch', data:{ plane:'localXY', points:{
  a:{pointId:'a',x:0,y:0}, b:{pointId:'b',x:1,y:0}
}, lines:{}, circles:{}, arcs:{ ar:{arcId:'ar',startPointId:'a',endPointId:'b',control:{x:0.5,y:1}} }, splines:{} } };
const pairStore = makeStore(pairSketch);
const beforePair = pairStore.snapshot();
assert.equal(pairStore.connectSketchPoints('pair','a','b'), false);
assert.deepEqual(pairStore.project, beforePair);
assert.equal(pairStore.undoStack.length, 0);

const lineCompatSketch = { objectId:'line_compat', type:'sketch', data:{ plane:'localXY', points:{
  shared:{pointId:'shared',x:0,y:0}, left:{pointId:'left',x:-1,y:0}, right:{pointId:'right',x:1,y:0}
}, lines:{ l1:{lineId:'l1',startPointId:'left',endPointId:'shared'}, l2:{lineId:'l2',startPointId:'shared',endPointId:'right'} }, circles:{}, arcs:{}, splines:{} } };
const lineStore = makeStore(lineCompatSketch);
const lineResult = lineStore.disconnectSketchLineFromPoint('line_compat','shared','l1');
assert.ok(lineResult?.newPointId);
assert.equal(lineResult.lineId, 'l1');
assert.equal(lineResult.elementKind, 'line');
assert.equal(lineStore.getObject('line_compat').data.lines.l2.startPointId, 'shared');

const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.match(main, /const BUILD_ID = 'WD-21C\.6(?:-R\d+)?'/);
assert.match(main, /installGenericEndpointConnectivityContract/);
const extensionSource = fs.readFileSync(new URL('../src/application/sketch-endpoint-connectivity-extension.js', import.meta.url), 'utf8');
assert.match(extensionSource, /topologyEndpoints/);
assert.doesNotMatch(extensionSource, /circle\.center|arc\.control|spline\.controls/);
console.log('WD-21C.6 Generic Endpoint Element Connectivity Contract: PASS');
