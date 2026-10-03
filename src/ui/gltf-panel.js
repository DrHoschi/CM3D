const cleanExportName = value => String(value || 'cm3d-export')
  .replace(/\.(glb|gltf)$/i, '')
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
    <div class="menu-inline column"><span>3D-Modell importieren</span><small class="muted">GLB oder GLTF; Dateityp wird nach Auswahl geprüft</small></div>
    <button id="import-gltf-model" class="menu-item">
      <svg class="cm-icon"><use href="#import"></use></svg>
      <span>GLB / GLTF importieren</span>
    </button>
    <input id="gltf-model-input" type="file" multiple hidden/>
    <div class="menu-separator"></div>
    <button id="start-model-export" class="menu-item">
      <svg class="cm-icon"><use href="#export-json"></use></svg>
      <span>Exportieren…</span>
    </button>
  `;
  while (menuBlock.firstChild) fileMenu.appendChild(menuBlock.firstChild);

  const exportPanel = document.createElement('div');
  exportPanel.id = 'tool-inspector-export';
  exportPanel.hidden = true;
  exportPanel.innerHTML = `
    <div class="tool-inspector-title"><svg class="cm-icon"><use href="#export-json"></use></svg><strong>Exportieren</strong></div>
    <label>Ziel <select id="model-export-scope"><option value="scene">Ganze Szene</option><option value="selection">Auswahl + Unterobjekte</option></select></label>
    <label>Format <select id="model-export-format"><option value="glb" selected>GLB</option><option value="gltf">GLTF</option></select></label>
    <label>Dateiname <input id="model-export-name" type="text" autocomplete="off"/></label>
    <label>Einheit <output id="model-export-units">m · glTF-Standard</output></label>
    <label>Maßstab <output id="model-export-scale">1</output></label>
    <label>Transform <output>Weltlage der Export-Wurzeln erhalten</output></label>
    <label>Hierarchie <output>Unterobjekte erhalten</output></label>
    <label>Materialien <output>Vom GLB/GLTF-Adapter unterstützt</output></label>
    <div class="muted">GLB/GLTF ist ein Austauschformat und kein natives CM3D-Projektbackup. Skizzen, Editorhilfen und native Feature-Historie werden nicht als Projektzustand exportiert.</div>
    <div class="button-row"><button id="cancel-model-export" type="button">Abbrechen</button><button id="confirm-model-export" class="primary" type="button">Exportieren</button></div>
  `;
  toolInspector.appendChild(exportPanel);

  const input = q('#gltf-model-input');
  const importButton = q('#import-gltf-model');
  const startExport = q('#start-model-export');
  const scope = q('#model-export-scope');
  const format = q('#model-export-format');
  const name = q('#model-export-name');
  const confirmExport = q('#confirm-model-export');
  const cancelExport = q('#cancel-model-export');
  const fileMenuButton = q('[data-menu-toggle="file-menu"]');
  const status = q('#status');

  const unit = () => store.project?.settings?.units?.lengthDisplayUnit || 'm';
  const setStatus = message => { if (status) status.textContent = `${message} · Einheit: ${unit()}`; };
  const closeFileMenu = () => {
    if (!fileMenu.hidden) fileMenuButton?.click();
  };
  const hideExport = () => {
    exportPanel.hidden = true;
    const otherVisible = [...toolInspector.children].some(child => child !== exportPanel && child.hidden === false);
    if (!otherVisible) toolInspector.hidden = true;
  };
  const syncScope = () => {
    const selectionAvailable = store.selection.selectedObjectIds.length > 0;
    const selectionOption = scope?.querySelector('option[value="selection"]');
    if (selectionOption) selectionOption.disabled = !selectionAvailable;
    if (!selectionAvailable && scope?.value === 'selection') scope.value = 'scene';
  };
  const showExport = () => {
    for (const child of toolInspector.children) if (child !== exportPanel) child.hidden = true;
    exportPanel.hidden = false;
    toolInspector.hidden = false;
    syncScope();
    name.value = cleanExportName(store.project?.project?.name || 'cm3d-export');
    name.focus();
    closeFileMenu();
  };
  const createDescriptor = () => ({
    scope: scope?.value === 'selection' ? 'selection' : 'scene',
    format: String(format?.value || 'glb').toLowerCase(),
    fileName: cleanExportName(name?.value || store.project?.project?.name || 'cm3d-export'),
    units: 'm',
    scale: 1,
    transformPolicy: 'preserve-world-root-transform',
    hierarchyPolicy: 'preserve-descendants',
    materialPolicy: 'adapter-supported'
  });

  importButton?.addEventListener('click', () => {
    closeFileMenu();
    input?.click();
  });

  if (input) input.addEventListener('change', async event => {
    const files = [...(event.target.files || [])];
    try {
      if (!files.length) return;
      setStatus('GLB/GLTF wird geprüft …');
      const result = await interchange.importFiles(files);
      setStatus(`3D-Modell importiert: ${result.fileName}`);
    } catch (error) {
      console.error(error);
      setStatus(error?.message || 'GLB/GLTF-Import fehlgeschlagen.');
      alert(error?.message || String(error));
    } finally {
      input.value = '';
    }
  });

  startExport?.addEventListener('click', showExport);
  cancelExport?.addEventListener('click', hideExport);
  confirmExport?.addEventListener('click', async () => {
    const oldText = confirmExport.textContent;
    confirmExport.disabled = true;
    confirmExport.textContent = 'Exportiere …';
    try {
      const descriptor = createDescriptor();
      const result = await interchange.exportWithDescriptor(descriptor);
      setStatus(`3D-Modell exportiert: ${result.fileName}`);
      hideExport();
    } catch (error) {
      console.error(error);
      setStatus(error?.message || 'Export fehlgeschlagen.');
      alert(error?.message || String(error));
    } finally {
      confirmExport.disabled = false;
      confirmExport.textContent = oldText;
    }
  });

  for (const button of [q('#start-extrude'), q('#modeling-extrude')]) {
    button?.addEventListener('click', () => { exportPanel.hidden = true; });
  }
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hideExport(); });

  store.subscribe(event => {
    if (event.type === 'externalAssetReady') setStatus('GLB/GLTF-Modell im Viewport bereit.');
    if (event.type === 'externalAssetError') {
      const message = event.error?.message || 'GLB/GLTF-Asset konnte nicht geladen werden.';
      setStatus(message);
    }
    if (['selectionChanged', 'projectChanged', 'projectLoaded', 'historyChanged'].includes(event.type)) syncScope();
  });

  syncScope();
}
