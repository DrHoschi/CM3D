const cleanExportName = value => String(value || 'cm3d-export')
  .replace(/\.(glb|gltf)$/i, '')
  .replace(/[\\/:*?"<>|]+/g, '_')
  .trim() || 'cm3d-export';

export function installGltfPanel(store, interchange) {
  const q = selector => document.querySelector(selector);
  const fileMenu = q('#file-menu');
  const toolInspector = q('#tool-inspector');
  const extrudePanel = q('#tool-inspector-extrude');
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
    <div class="menu-inline column"><span>3D-Modell exportieren</span><small class="muted">WD-11B: Ganze Szene</small></div>
    <button id="start-gltf-export" class="menu-item">
      <svg class="cm-icon"><use href="#export-json"></use></svg>
      <span>Ganze Szene als GLB / GLTF …</span>
    </button>
    <button class="menu-item" disabled><svg class="cm-icon"><use href="#export-json"></use></svg><span>Auswahl / Teilprojekt <em>folgt separat</em></span></button>
  `;
  while (menuBlock.firstChild) fileMenu.appendChild(menuBlock.firstChild);

  const exportPanel = document.createElement('div');
  exportPanel.id = 'tool-inspector-export';
  exportPanel.hidden = true;
  exportPanel.innerHTML = `
    <div class="tool-inspector-title"><svg class="cm-icon"><use href="#export-json"></use></svg><strong>Exportieren</strong></div>
    <label>Exportieren <output>Ganze Szene</output></label>
    <label>Format <select id="gltf-export-format"><option value="glb" selected>GLB</option><option value="gltf">GLTF</option></select></label>
    <label>Dateiname <input id="gltf-export-name" type="text" autocomplete="off"/></label>
    <label>Einheit <output>m · glTF-Standard</output></label>
    <div class="muted">Auswahl, Baugruppe, Teilprojekt und abweichende Ursprungsoptionen bleiben außerhalb von WD-11B.</div>
    <div class="button-row"><button id="cancel-gltf-export" type="button">Abbrechen</button><button id="confirm-gltf-export" class="primary" type="button">Exportieren</button></div>
  `;
  toolInspector.appendChild(exportPanel);

  const input = q('#gltf-model-input');
  const importButton = q('#import-gltf-model');
  const startExport = q('#start-gltf-export');
  const format = q('#gltf-export-format');
  const name = q('#gltf-export-name');
  const confirmExport = q('#confirm-gltf-export');
  const cancelExport = q('#cancel-gltf-export');
  const fileMenuButton = q('[data-menu-toggle="file-menu"]');
  const status = q('#status');

  const unit = () => store.project?.settings?.units?.lengthDisplayUnit || 'm';
  const setStatus = message => { if (status) status.textContent = `${message} · Einheit: ${unit()}`; };
  const closeFileMenu = () => {
    if (!fileMenu.hidden) fileMenuButton?.click();
  };
  const hideExport = () => {
    exportPanel.hidden = true;
    if (extrudePanel?.hidden !== false) toolInspector.hidden = true;
  };
  const showExport = () => {
    if (extrudePanel) extrudePanel.hidden = true;
    exportPanel.hidden = false;
    toolInspector.hidden = false;
    name.value = cleanExportName(store.project?.project?.name || 'cm3d-export');
    name.focus();
    closeFileMenu();
  };

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
      const result = await interchange.exportScene({ format: format.value, fileName: name.value });
      setStatus(`3D-Modell exportiert: ${result.fileName}`);
      hideExport();
    } catch (error) {
      console.error(error);
      setStatus(error?.message || 'GLB/GLTF-Export fehlgeschlagen.');
      alert(error?.message || String(error));
    } finally {
      confirmExport.disabled = false;
      confirmExport.textContent = oldText;
    }
  });

  for (const button of [q('#start-extrude'), q('#modeling-extrude')]) {
    button?.addEventListener('click', () => { exportPanel.hidden = true; });
  }
  document.addEventListener('keydown', event => { if (event.key === 'Escape') exportPanel.hidden = true; });

  store.subscribe(event => {
    if (event.type === 'externalAssetReady') setStatus('GLB/GLTF-Modell im Viewport bereit.');
    if (event.type === 'externalAssetError') {
      const message = event.error?.message || 'GLB/GLTF-Asset konnte nicht geladen werden.';
      setStatus(message);
    }
    if (event.type === 'projectChanged' || event.type === 'projectLoaded') {
      if (exportPanel.hidden === false) name.value = cleanExportName(store.project?.project?.name || 'cm3d-export');
    }
  });

  document.title = 'CyberMotion 3D – WD-11B';
  const buildLabel = q('.brand small');
  if (buildLabel) buildLabel.textContent = 'WD-11B';
}
