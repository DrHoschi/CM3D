import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SelectionTargetKind, createSelectionRef, installSelectionRefFoundation } from '../src/application/selection-ref.js';
import { resolveStableReference, ReferenceState } from '../src/application/stable-reference.js';

const sketch = {
  objectId:'sketch_g1', type:'sketch',
  data:{
    points:{
      a:{pointId:'a',x:0,y:0}, b:{pointId:'b',x:2,y:0}, c:{pointId:'c',x:2,y:2}, d:{pointId:'d',x:0,y:2},
      p0:{pointId:'p0',x:4,y:0}, p1:{pointId:'p1',x:5,y:0}, p2:{pointId:'p2',x:6,y:0}
    },
    lines:{
      l0:{lineId:'l0',startPointId:'a',endPointId:'b'}, l1:{lineId:'l1',startPointId:'b',endPointId:'c'},
      l2:{lineId:'l2',startPointId:'c',endPointId:'d'}, l3:{lineId:'l3',startPointId:'d',endPointId:'a'},
      q0:{lineId:'q0',startPointId:'p0',endPointId:'p1'}, q1:{lineId:'q1',startPointId:'p1',endPointId:'p2'}
    },
    circles:{}, arcs:{}, splines:{},
    profileIdentities:{ profile_g1:{profileId:'profile_g1',source:{outerElementIds:['l0','l1','l2','l3'],holeElementIdSets:[]}} },
    pathIdentities:{ path_g1:{pathId:'path_g1',source:{elementIds:['q0','q1']}} }
  }
};
const listeners = new Set();
const store = {
  selection:{selectedObjectIds:[],activeObjectId:null,sketchElement:null,sketchElements:[]},
  sketchMultiSelectEnabled:false,
  getObject(id){ return id === sketch.objectId ? sketch : null; },
  subscribe(fn){ listeners.add(fn); return()=>listeners.delete(fn); },
  emit(type,payload={}){ for(const fn of listeners) fn({type,...payload}); },
  select(id,notify=true){ if(id!==sketch.objectId)return false; this.selection.selectedObjectIds=[id];this.selection.activeObjectId=id;this.selection.sketchElement=null;this.selection.sketchElements=[];if(notify)this.emit('selectionChanged');return true; },
  clearSelection(notify=true){this.selection.selectedObjectIds=[];this.selection.activeObjectId=null;this.selection.sketchElement=null;this.selection.sketchElements=[];if(notify)this.emit('selectionChanged');},
  setSketchMultiSelectEnabled(enabled){this.sketchMultiSelectEnabled=!!enabled;}
};

installSelectionRefFoundation(store);
const profileRef=createSelectionRef(SelectionTargetKind.PROFILE,sketch.objectId,'profile_g1');
const pathRef=createSelectionRef(SelectionTargetKind.PATH,sketch.objectId,'path_g1');
assert.equal(resolveStableReference(store,profileRef).state,ReferenceState.RESOLVED);
assert.equal(resolveStableReference(store,pathRef).state,ReferenceState.RESOLVED);
assert.equal(store.selectRef(profileRef),true);
assert.deepEqual(store.getPrimarySelectionRef(),profileRef);
assert.equal(store.selectRef(pathRef,true,true),true);
assert.deepEqual(store.getSelectionRefs(),[profileRef,pathRef]);
assert.deepEqual(store.getPrimarySelectionRef(),pathRef);
assert.equal(store.sketchMultiSelectEnabled,true);

// Selection keeps the same logical PathId when topology becomes invalid; no fallback/rebinding.
sketch.data.lines.q1.endPointId='p0';
store.emit('selectionChanged');
assert.deepEqual(store.getPrimarySelectionRef(),pathRef);
assert.equal(resolveStableReference(store,pathRef).state,ReferenceState.INVALID);

// A missing identity cannot be newly selected.
assert.equal(store.selectRef(createSelectionRef(SelectionTargetKind.PATH,sketch.objectId,'missing')),false);

const projectionSource = await readFile(new URL('../src/ui/profile-path-selection.js', import.meta.url), 'utf8');
assert.match(projectionSource, /cm3dProfilePathSelectionOverlay/);
assert.match(projectionSource, /clearOverlays\(\)/);
assert.match(projectionSource, /PointsMaterial\(\{ color, size:6, sizeAttenuation:false/);
assert.match(projectionSource, /kind === 'PROFILE' \? 0x63d6ff : 0xff8bd8/);
assert.doesNotMatch(projectionSource, /child\.material\.color\.set\(kind === 'PROFILE'/);

// Touch tree selection reuses the existing sketch multi-selection mode; desktop modifiers remain supported.
assert.match(projectionSource, /store\.selectRef\(ref, true, store\.sketchMultiSelectEnabled \|\| event\.metaKey \|\| event\.ctrlKey \|\| event\.shiftKey\)/);

// Tree labels are projected from a deterministic persistent-identity order.
assert.match(projectionSource, /\.sort\(\(a, b\) => a\.id\.localeCompare\(b\.id\)\)/);

// The productive PROFILE/PATH bridge must publish selectionChanged only after refs/primaryRef are current.
const mainSource = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
const derivedSelectionBranch = mainSource.match(/if\(\['PROFILE','PATH'\]\.includes\(ref\.targetKind\)\)\{[\s\S]*?return true;\}/)?.[0] ?? '';
assert.ok(derivedSelectionBranch, 'productive PROFILE/PATH selection branch must exist');
const syncIndex = derivedSelectionBranch.lastIndexOf('syncSelectionRefs()');
const emitIndex = derivedSelectionBranch.lastIndexOf("store.emit('selectionChanged'");
assert.ok(syncIndex >= 0 && emitIndex >= 0 && syncIndex < emitIndex,
  'PROFILE/PATH selection refs and primaryRef must be synchronized before first selectionChanged notification');

console.log('WD-21G.1 profile/path selection regression: PASS');
