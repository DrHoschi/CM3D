import assert from 'node:assert/strict';
import fs from 'node:fs';
import { sharedLibraryRegistry } from '../src/application/library-runtime.js';
import { addLibraryEntry, createLibraryEntry, listLibraryEntries, validateLibraryRegistry } from '../src/application/library-registry.js';

sharedLibraryRegistry.entries.splice(0);
for(const entryKind of ['material','sketch','object','assembly']){
  const made=createLibraryEntry({entryKind,name:`${entryKind} entry`,category:`${entryKind} category`,payload:{kind:entryKind}});
  assert.equal(made.ok,true);
  assert.equal(addLibraryEntry(sharedLibraryRegistry,made.entry).ok,true);
}
assert.equal(validateLibraryRegistry(sharedLibraryRegistry).valid,true);
assert.equal(sharedLibraryRegistry.entries.length,4);
for(const entryKind of ['material','sketch','object','assembly']){
  const entries=listLibraryEntries(sharedLibraryRegistry,{entryKind});
  assert.equal(entries.length,1);
  assert.equal(entries[0].entryKind,entryKind);
  assert.equal(entries[0].payload.kind,entryKind);
}

for(const file of ['src/ui/material-panel.js','src/ui/sketch-library-panel.js','src/ui/object-library-panel.js','src/ui/assembly-library-panel.js']){
  const source=fs.readFileSync(file,'utf8');
  assert.match(source,/sharedLibraryRegistry/);
  assert.doesNotMatch(source,/createLibraryRegistry\s*\(/,`${file} must not create a private runtime registry`);
}
const runtimeSource=fs.readFileSync('src/application/library-runtime.js','utf8');
assert.match(runtimeSource,/sharedLibraryRegistry\s*=\s*createLibraryRegistry\(\)/);
assert.doesNotMatch(runtimeSource,/localStorage|sessionStorage|indexedDB|project\.library/i);
console.log('WD-26J Shared Library Registry Runtime Authority focused regression PASS');
