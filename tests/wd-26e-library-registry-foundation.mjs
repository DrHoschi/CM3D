import assert from 'node:assert/strict';
import { addLibraryEntry, createLibraryEntry, createLibraryRegistry, getLibraryEntry, libraryEntryKinds, listLibraryEntries, validateLibraryEntry, validateLibraryRegistry } from '../src/application/library-registry.js';

const registry=createLibraryRegistry();
assert.deepEqual(libraryEntryKinds().sort(),['assembly','material','object','sketch']);
assert.equal(validateLibraryRegistry(registry).valid,true);

const payloads={
  material:{materialDefinition:{name:'Steel',type:'pbr.standard',properties:{baseColor:'#888888'}}},
  sketch:{sketch:{elements:[],planeId:'plane_xy'}},
  object:{object:{type:'box',parameters:{width:10,height:20,depth:30}}},
  assembly:{root:{name:'Assembly'},objects:[]}
};

const ids=new Set();
for(const entryKind of libraryEntryKinds()){
  const created=createLibraryEntry({entryKind,name:`${entryKind} sample`,category:'QA',payload:payloads[entryKind]});
  assert.equal(created.ok,true,created.errors?.join('\n'));
  assert.ok(created.entry.libraryEntryId.startsWith('lib_'));
  assert.equal(ids.has(created.entry.libraryEntryId),false,'stable identity must be unique');ids.add(created.entry.libraryEntryId);
  assert.equal(created.entry.schema,'cm3d.library-entry');assert.equal(created.entry.version,1);
  assert.equal(addLibraryEntry(registry,created.entry).ok,true);
  payloads[entryKind].mutated=true;
  assert.equal(getLibraryEntry(registry,created.entry.libraryEntryId).payload.mutated,undefined,'registry payload must be serialized/copied, not linked to caller state');
}

assert.equal(registry.entries.length,4);
assert.equal(listLibraryEntries(registry,{category:'QA'}).length,4);
assert.equal(listLibraryEntries(registry,{entryKind:'material'}).length,1);
assert.equal(validateLibraryRegistry(registry).valid,true);

const duplicate=structuredClone(registry.entries[0]);
assert.equal(addLibraryEntry(registry,duplicate).ok,false,'duplicate LibraryEntryId must be rejected');
assert.equal(validateLibraryEntry({...duplicate,entryKind:'linked-instance'}).valid,false);
assert.equal(validateLibraryEntry({...duplicate,name:''}).valid,false);
assert.equal(validateLibraryEntry({...duplicate,category:''}).valid,false);
assert.equal(validateLibraryEntry({...duplicate,version:2}).valid,false);
assert.equal(validateLibraryEntry({...duplicate,payload:null}).valid,false);

const persisted=JSON.parse(JSON.stringify(registry));
assert.equal(validateLibraryRegistry(persisted).valid,true,'registry contract must be serializable independently of project persistence');
assert.deepEqual(persisted,registry);

console.log('WD-26E Library Registry Foundation focused regression PASS');
