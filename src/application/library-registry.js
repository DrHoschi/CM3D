const ENTRY_KINDS=new Set(['material','sketch','object','assembly']);
const SCHEMA='cm3d.library-entry';
const VERSION=1;

const newId=()=>`lib_${crypto.randomUUID()}`;
const isRecord=value=>!!value&&typeof value==='object'&&!Array.isArray(value);

export function createLibraryRegistry(){return {schema:'cm3d.library-registry',version:1,entries:[]};}

export function createLibraryEntry({libraryEntryId=newId(),entryKind,name,category='Uncategorized',payload,schema=SCHEMA,version=VERSION}={}){
  const entry={libraryEntryId,entryKind,name:String(name??'').trim(),category:String(category??'').trim()||'Uncategorized',schema,version,payload:structuredClone(payload)};
  const validation=validateLibraryEntry(entry);
  if(!validation.valid)return {ok:false,errors:validation.errors};
  return {ok:true,entry};
}

export function validateLibraryEntry(entry){
  const errors=[];
  if(!isRecord(entry))return {valid:false,errors:['LibraryEntry muss ein Objekt sein.']};
  if(typeof entry.libraryEntryId!=='string'||!entry.libraryEntryId.trim())errors.push('LibraryEntryId fehlt.');
  if(!ENTRY_KINDS.has(entry.entryKind))errors.push('EntryKind ist ungültig.');
  if(typeof entry.name!=='string'||!entry.name.trim())errors.push('Name fehlt.');
  if(typeof entry.category!=='string'||!entry.category.trim())errors.push('Kategorie fehlt.');
  if(entry.schema!==SCHEMA)errors.push('LibraryEntry-Schema ist ungültig.');
  if(entry.version!==VERSION)errors.push('LibraryEntry-Version ist ungültig.');
  if(!isRecord(entry.payload))errors.push('Serialisierter Payload muss ein Objekt sein.');
  return {valid:errors.length===0,errors};
}

export function validateLibraryRegistry(registry){
  const errors=[];
  if(!isRecord(registry)||registry.schema!=='cm3d.library-registry'||registry.version!==1||!Array.isArray(registry.entries))return {valid:false,errors:['Library Registry ist ungültig.']};
  const ids=new Set();
  registry.entries.forEach((entry,index)=>{
    const result=validateLibraryEntry(entry);
    for(const error of result.errors)errors.push(`entries[${index}]: ${error}`);
    if(ids.has(entry?.libraryEntryId))errors.push(`entries[${index}]: LibraryEntryId ist doppelt.`);
    ids.add(entry?.libraryEntryId);
  });
  return {valid:errors.length===0,errors};
}

export function addLibraryEntry(registry,entry){
  const registryValidation=validateLibraryRegistry(registry);if(!registryValidation.valid)return {ok:false,errors:registryValidation.errors};
  const validation=validateLibraryEntry(entry);if(!validation.valid)return {ok:false,errors:validation.errors};
  if(registry.entries.some(candidate=>candidate.libraryEntryId===entry.libraryEntryId))return {ok:false,errors:['LibraryEntryId ist bereits vorhanden.']};
  registry.entries.push(structuredClone(entry));
  return {ok:true,libraryEntryId:entry.libraryEntryId};
}

export function getLibraryEntry(registry,libraryEntryId){return registry?.entries?.find(entry=>entry.libraryEntryId===libraryEntryId)??null;}
export function listLibraryEntries(registry,{entryKind=null,category=null}={}){return (registry?.entries??[]).filter(entry=>(!entryKind||entry.entryKind===entryKind)&&(!category||entry.category===category));}
export const libraryEntryKinds=()=>[...ENTRY_KINDS];
