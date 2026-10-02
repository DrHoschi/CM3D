import assert from 'node:assert/strict';
import { AppStore } from '../src/application/store.js';
import { buildDependencyGraph } from '../src/application/dependency-graph.js';
import { validateProject } from '../src/model/project.js';

const close=(a,b,eps=1e-9)=>Math.abs(a-b)<=eps;
const assertWorldEqual=(a,b,label)=>{
  for(const k of ['x','y','z']) assert.ok(close(a.position[k],b.position[k]),`${label}: position.${k}`);
  for(const k of ['x','y','z']) assert.ok(close(a.scale[k],b.scale[k]),`${label}: scale.${k}`);
  const dot=Math.abs(a.rotation.x*b.rotation.x+a.rotation.y*b.rotation.y+a.rotation.z*b.rotation.z+a.rotation.w*b.rotation.w);
  assert.ok(close(dot,1,1e-8),`${label}: rotation`);
};
const graphSnapshot=graph=>JSON.stringify({
  cycles:graph.cycles,
  nodes:[...graph.nodes.entries()].map(([id,n])=>[id,n.state,n.upstreamState]),
  edges:[...graph.outgoing.entries()].map(([id,edges])=>[id,edges.map(e=>[e.sourceObjectId,e.dependentObjectId,e.kind,e.state])])
});

const store=new AppStore();
const a=store.addBox(), b=store.addBox(), c=store.addBox();
store.setTransformFromEuler(a,{position:{x:2,y:3,z:4},rotationDeg:{x:10,y:20,z:30},scale:{x:1,y:1,z:1}});
store.setTransformFromEuler(b,{position:{x:-1,y:5,z:2},rotationDeg:{x:0,y:45,z:0},scale:{x:1,y:1,z:1}});
store.setTransformFromEuler(c,{position:{x:7,y:-2,z:1},rotationDeg:{x:15,y:0,z:5},scale:{x:1,y:1,z:1}});

// Root -> parent keeps world transform and removes the object from roots.
const worldA=store.getWorldTransform(a);
assert.equal(store.reparent(a,b),true);
assert.equal(store.getObject(a).parentId,b);
assert.equal(store.project.scene.rootObjectIds.includes(a),false);
assertWorldEqual(store.getWorldTransform(a),worldA,'root->parent');

// Parent -> root keeps world transform and appends a deterministic root order.
const nestedWorld=store.getWorldTransform(a);
assert.equal(store.reparent(a,null),true);
assert.equal(store.getObject(a).parentId,null);
assert.equal(store.project.scene.rootObjectIds.at(-1),a);
assert.equal(store.getObject(a).order,store.project.scene.rootObjectIds.length-1);
assertWorldEqual(store.getWorldTransform(a),nestedWorld,'parent->root');

// Nested group/assembly hierarchy uses the same parentId authority.
store.select(a,false);store.select(b,false,true);
const group=store.groupSelected();
assert.ok(group);assert.equal(store.getObject(a).parentId,group);assert.equal(store.getObject(b).parentId,group);
store.select(group,false);store.select(c,false,true);
const assembly=store.assemblySelected();
assert.ok(assembly);assert.equal(store.getObject(group).parentId,assembly);assert.equal(store.getObject(c).parentId,assembly);
assert.equal(store.canReparent(assembly,a),false,'cycle guard must reject descendant parent');
assert.equal(store.reparent(assembly,a),false,'cycle reparent must be rejected');
assert.equal(validateProject(store.project).valid,true);

// Child order is deterministic and contiguous for the current parent.
const assemblyChildren=Object.values(store.project.scene.objects).filter(o=>o.parentId===assembly).sort((x,y)=>x.order-y.order);
assert.deepEqual(assemblyChildren.map(o=>o.order),[0,1]);

// Reparent is one undoable transaction and redo restores it.
const beforeParent=store.getObject(a).parentId;
const beforeWorld=store.getWorldTransform(a);
assert.equal(store.reparent(a,assembly),true);
assert.equal(store.getObject(a).parentId,assembly);
assertWorldEqual(store.getWorldTransform(a),beforeWorld,'reparent before undo');
assert.equal(store.undo(),true);assert.equal(store.getObject(a).parentId,beforeParent);assertWorldEqual(store.getWorldTransform(a),beforeWorld,'undo');
assert.equal(store.redo(),true);assert.equal(store.getObject(a).parentId,assembly);assertWorldEqual(store.getWorldTransform(a),beforeWorld,'redo');

// Save/reload boundary: project snapshot preserves hierarchy without a second authority.
const persisted=structuredClone(store.project);
const loaded=new AppStore();loaded.replaceProject(persisted);
assert.equal(loaded.getObject(a).parentId,assembly);
assert.deepEqual(loaded.project.scene.rootObjectIds,persisted.scene.rootObjectIds);
assert.equal(validateProject(loaded.project).valid,true);

// Hard boundary: structural reparenting must not mutate the feature dependency graph.
const beforeGraph=graphSnapshot(buildDependencyGraph(loaded));
const target=loaded.getObject(a);const targetWorld=loaded.getWorldTransform(a);
assert.equal(loaded.reparent(a,null),true);
const afterGraph=graphSnapshot(buildDependencyGraph(loaded));
assert.equal(afterGraph,beforeGraph,'Scene Parent must not alter Feature Dependency graph');
assertWorldEqual(loaded.getWorldTransform(a),targetWorld,'dependency-boundary reparent');
assert.equal(target.objectId,a);

console.log('WD-25A Scene Hierarchy / Structural Parent Foundation: PASS');
