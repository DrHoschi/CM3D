import { addLibraryEntry, listLibraryEntries } from '../application/library-registry.js';
import { sharedLibraryRegistry } from '../application/library-runtime.js';
import { createSketchLibraryEntry, insertSketchLibraryEntry } from '../application/sketch-library.js';

export function installSketchLibraryPanel(store){
  const host=document.querySelector('#inspector');if(!host)return null;const registry=sharedLibraryRegistry;
  const panel=document.createElement('fieldset');panel.id='sketch-library-fields';panel.innerHTML='<legend>Skizzenvorlagen</legend><label>Vorlage <select id="sketch-library-select"></select></label><div class="button-row"><button id="sketch-library-save" type="button">Als Vorlage speichern</button><button id="sketch-library-insert" type="button">Vorlage einfügen</button></div>';
  host.appendChild(panel);const select=panel.querySelector('#sketch-library-select'),save=panel.querySelector('#sketch-library-save'),insert=panel.querySelector('#sketch-library-insert');
  const render=()=>{const active=store.getObject(store.selection.activeObjectId),current=select.value;panel.hidden=active?.type!=='sketch'&&!listLibraryEntries(registry,{entryKind:'sketch'}).length;save.disabled=active?.type!=='sketch';select.replaceChildren();for(const entry of listLibraryEntries(registry,{entryKind:'sketch'}))select.appendChild(new Option(`${entry.category} · ${entry.name}`,entry.libraryEntryId));if([...select.options].some(o=>o.value===current))select.value=current;insert.disabled=!select.value;};
  save.onclick=()=>{const sketch=store.getObject(store.selection.activeObjectId);if(sketch?.type!=='sketch')return;const name=prompt('Name der Skizzenvorlage',sketch.name);if(name==null)return;const category=prompt('Kategorie','Sketch');if(category==null)return;const made=createSketchLibraryEntry(store,sketch.objectId,{name,category});if(!made.ok){alert(made.message);return;}const added=addLibraryEntry(registry,made.entry);if(!added.ok){alert(added.errors.join('\n'));return;}render();select.value=made.entry.libraryEntryId;insert.disabled=false;};
  insert.onclick=()=>{const entry=registry.entries.find(e=>e.libraryEntryId===select.value),result=insertSketchLibraryEntry(store,entry);if(!result.ok)alert(result.message);render();};
  store.subscribe(e=>{if(['selectionChanged','projectChanged','projectLoaded','objectCreated','historyChanged'].includes(e.type))render();});render();return {registry,render};
}
