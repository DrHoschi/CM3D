const cleanExportName = value => String(value || 'cm3d-export')
  .replace(/\.(glb|gltf|obj|stl)$/i, '')
  .replace(/[\\/:*?"<>|]+/g, '_')
  .trim() || 'cm3d-export';

export function installGltfPanel(store, interchange) {
  const q = selector => document.querySelector(selector);
  const fileMenu = q('#file-menu');
  const toolInspector = q('#tool-inspector');
  if (!fileMenu || !toolInspector) return;
  const menuBlock = document.createElement('div');
  menuBlock.innerHTML = `
    <div class="menu-separator"></div>
    <div class="menu-inline column"><span>3D-Modell importieren</span><small class="muted">GLB/GLTF oder OBJ/STL; Dateityp wird nach Auswahl geprüft</small></div>
    <button id="import-gltf-model" class="menu-item"><svg class="cm-icon"><use href="#import"></use></svg><span>GLB / GLTF importieren</span></button>
    <input id="gltf-model-input" type="file" multiple hidden/>
    <button id="import-obj-stl-model" class="menu-item"><svg class="cm-icon"><use href="#import"></use></svg><span>OBJ / STL importieren</span></button>
    <input id="obj-stl-model-input" type="file" accept=".obj,.stl" hidden/>
    <div class="menu-separator"></div>
    <button id="start-model-export" class="menu-item"><svg class="cm-icon"><use href="#export-json"></use></svg><span>Exportieren…</span></button>`;
  while (menuBlock.firstChild) fileMenu.appendChild(menuBlock.firstChild);
  const exportPanel = document.createElement('div'); exportPanel.id='tool-inspector-export'; exportPanel.hidden=true;
  exportPanel.innerHTML=`
    <div class="tool-inspector-title"><svg class="cm-icon"><use href="#export-json"></use></svg><strong>Exportieren</strong></div>
    <label>Ziel <select id="model-export-scope"><option value="scene">Ganze Szene</option><option value="selection">Auswahl + Unterobjekte</option></select></label>
    <label>Format <select id="model-export-format"><option value="glb" selected>GLB</option><option value="gltf">GLTF</option><option value="obj">OBJ</option><option value="stl">STL</option></select></label>
    <label>Dateiname <input id="model-export-name" type="text" autocomplete="off"/></label>
    <label>Einheit <output>m · Maßstab 1</output></label>
    <label>Transform <output>Weltlage der Export-Wurzeln erhalten</output></label>
    <label>Hierarchie <output id="model-export-hierarchy">Adapterabhängig</output></label>
    <label>Materialien <output id="model-export-materials">Adapterabhängig</output></label>
    <div id="model-export-note" class="muted">Austauschformate sind kein natives CM3D-Projektbackup.</div>
    <div class="button-row"><button id="cancel-model-export" type="button">Abbrechen</button><button id="confirm-model-export" class="primary" type="button">Exportieren</button></div>`;
  toolInspector.appendChild(exportPanel);
  const gltfInput=q('#gltf-model-input'), interchangeInput=q('#obj-stl-model-input'), gltfImport=q('#import-gltf-model'), interchangeImport=q('#import-obj-stl-model'), startExport=q('#start-model-export'), scope=q('#model-export-scope'), format=q('#model-export-format'), name=q('#model-export-name'), confirmExport=q('#confirm-model-export'), cancelExport=q('#cancel-model-export'), fileMenuButton=q('[data-menu-toggle="file-menu"]'), status=q('#status'), hierarchy=q('#model-export-hierarchy'), materials=q('#model-export-materials'), note=q('#model-export-note');
  const unit=()=>store.project?.settings?.units?.lengthDisplayUnit||'m'; const setStatus=message=>{if(status)status.textContent=`${message} · Einheit: ${unit()}`;};
  const closeFileMenu=()=>{if(!fileMenu.hidden)fileMenuButton?.click();}; const hideExport=()=>{exportPanel.hidden=true;const otherVisible=[...toolInspector.children].some(child=>child!==exportPanel&&child.hidden===false);if(!otherVisible)toolInspector.hidden=true;};
  const syncScope=()=>{const available=store.selection.selectedObjectIds.length>0,option=scope?.querySelector('option[value="selection"]');if(option)option.disabled=!available;if(!available&&scope?.value==='selection')scope.value='scene';};
  const syncFormatHelp=()=>{const f=format?.value||'glb';if(hierarchy)hierarchy.textContent=f==='stl'?'Nicht im Format enthalten':f==='obj'?'Objekt-/Gruppenstruktur soweit Adapter unterstützt':'Unterobjekte erhalten';if(materials)materials.textContent=f==='stl'?'Nicht im Format enthalten (nur Geometrie)':'Vom Formatadapter unterstützt';if(note)note.textContent=f==='stl'?'STL exportiert reine Dreiecksgeometrie ohne CM3D-Material-, Hierarchie- oder Feature-Semantik.':f==='obj'?'OBJ ist ein Austauschformat; native CM3D-Feature-Historie wird nicht übertragen.':'GLB/GLTF ist ein Austauschformat und kein natives CM3D-Projektbackup.';};
  const showExport=()=>{for(const child of toolInspector.children)if(child!==exportPanel)child.hidden=true;exportPanel.hidden=false;toolInspector.hidden=false;syncScope();syncFormatHelp();name.value=cleanExportName(store.project?.project?.name||'cm3d-export');name.focus();closeFileMenu();};
  const createDescriptor=()=>({scope:scope?.value==='selection'?'selection':'scene',format:String(format?.value||'glb').toLowerCase(),fileName:cleanExportName(name?.value||store.project?.project?.name||'cm3d-export'),units:'m',scale:1,transformPolicy:'preserve-world-root-transform',hierarchyPolicy:'preserve-descendants',materialPolicy:format?.value==='stl'?'geometry-only':'adapter-supported'});
  gltfImport?.addEventListener('click',()=>{closeFileMenu();gltfInput?.click();}); interchangeImport?.addEventListener('click',()=>{closeFileMenu();interchangeInput?.click();});
  gltfInput?.addEventListener('change',async event=>{const files=[...(event.target.files||[])];try{if(!files.length)return;setStatus('GLB/GLTF wird geprüft …');const result=await interchange.importFiles(files);setStatus(`3D-Modell importiert: ${result.fileName}`);}catch(error){console.error(error);setStatus(error?.message||'GLB/GLTF-Import fehlgeschlagen.');alert(error?.message||String(error));}finally{gltfInput.value='';}});
  interchangeInput?.addEventListener('change',async event=>{const file=event.target.files?.[0];try{if(!file)return;setStatus('OBJ/STL wird geprüft …');const result=await interchange.importInterchangeFile(file);setStatus(`${result.format.toUpperCase()}-Modell importiert: ${result.fileName}`);}catch(error){console.error(error);setStatus(error?.message||'OBJ/STL-Import fehlgeschlagen.');alert(error?.message||String(error));}finally{interchangeInput.value='';}});
  startExport?.addEventListener('click',showExport); cancelExport?.addEventListener('click',hideExport); format?.addEventListener('change',syncFormatHelp);
  confirmExport?.addEventListener('click',async()=>{const oldText=confirmExport.textContent;confirmExport.disabled=true;confirmExport.textContent='Exportiere …';try{const result=await interchange.exportWithDescriptor(createDescriptor());setStatus(`3D-Modell exportiert: ${result.fileName}`);hideExport();}catch(error){console.error(error);setStatus(error?.message||'Export fehlgeschlagen.');alert(error?.message||String(error));}finally{confirmExport.disabled=false;confirmExport.textContent=oldText;}});
  for(const button of [q('#start-extrude'),q('#modeling-extrude')])button?.addEventListener('click',()=>{exportPanel.hidden=true;}); document.addEventListener('keydown',event=>{if(event.key==='Escape')hideExport();});
  store.subscribe(event=>{if(event.type==='externalAssetReady')setStatus(`${String(event.format||'3D').toUpperCase()}-Modell im Viewport bereit.`);if(event.type==='externalAssetError')setStatus(event.error?.message||'Externes 3D-Asset konnte nicht geladen werden.');if(['selectionChanged','projectChanged','projectLoaded','historyChanged'].includes(event.type))syncScope();}); syncScope();
}
