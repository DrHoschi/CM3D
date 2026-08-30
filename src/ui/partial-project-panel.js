import { downloadPartialProject, mergePartialProject, partialProjectFileName, readMergeFile } from '../persistence/partial-project.js';

export function installPartialProjectPanel(store) {
  const q = selector => document.querySelector(selector);
  const fileMenu = q('#file-menu');
  const toolInspector = q('#tool-inspector');
  if (!fileMenu || !toolInspector) return;

  const menuBlock = document.createElement('div');
  menuBlock.innerHTML = `
    <div class="menu-separator"></div>
    <div class="menu-inline column"><span>CM3D-Objekte / Teilprojekt</span><small class="muted">Auswahl exportieren oder in ein geöffnetes Projekt dazuladen</small></div>
    <button id="export-partial-project" class="menu-item">
      <svg class="cm-icon"><use href="#export-json"></use></svg>
      <span>Auswahl als Teilprojekt exportieren …</span>
    </button>
    <button id="merge-project-objects" class="menu-item">
      <svg class="cm-icon"><use href="#import"></use></svg>
      <span>CM3D-Objekte dazuladen …</span>
    </button>
    <input id="merge-project-file-input" type="file" hidden/>
  `;
  while (menuBlock.firstChild) fileMenu.appendChild(menuBlock.firstChild);

  const exportPanel = document.createElement('div');
  exportPanel.id = 'tool-inspector-partial-export';
  exportPanel.hidden = true;
  exportPanel.innerHTML = `
    <div class="tool-inspector-title"><svg class="cm-icon"><use href="#export-json"></use></svg><strong>Teilprojekt exportieren</strong></div>
    <label>Exportieren <output>Auswahl + Unterobjekte</output></label>
    <label>Format <output>CM3D Teilprojekt</output></label>
    <label>Dateiname <input id="partial-export-name" type="text" autocomplete="off"/></label>
    <div class="muted">Benötigte Materialien und eingebettete GLB/GLTF-Assets werden automatisch mitgeführt.</div>
    <div class="button-row"><button id="cancel-partial-export" type="button">Abbrechen</button><button id="confirm-partial-export" class="primary" type="button">Exportieren</button></div>
  `;
  toolInspector.appendChild(exportPanel);

  const exportButton = q('#export-partial-project');
  const mergeButton = q('#merge-project-objects');
  const mergeInput = q('#merge-project-file-input');
  const name = q('#partial-export-name');
  const confirm = q('#confirm-partial-export');
  const cancel = q('#cancel-partial-export');
  const fileMenuButton = q('[data-menu-toggle="file-menu"]');
  const status = q('#status');

  const unit = () => store.project?.settings?.units?.lengthDisplayUnit || 'm';
  const setStatus = message => { if (status) status.textContent = `${message} · Einheit: ${unit()}`; };
  const closeFileMenu = () => { if (!fileMenu.hidden) fileMenuButton?.click(); };
  const hidePanel = () => {
    exportPanel.hidden = true;
    const otherVisible = [...toolInspector.children].some(child => child !== exportPanel && child.hidden === false);
    if (!otherVisible) toolInspector.hidden = true;
  };
  const showPanel = () => {
    for (const child of toolInspector.children) if (child !== exportPanel) child.hidden = true;
    exportPanel.hidden = false;
    toolInspector.hidden = false;
    name.value = partialProjectFileName(store).replace(/\.cm3d-part\.json$/i, '');
    name.focus();
    closeFileMenu();
  };
  const syncSelection = () => { if (exportButton) exportButton.disabled = store.selection.selectedObjectIds.length === 0; };

  exportButton?.addEventListener('click', showPanel);
  cancel?.addEventListener('click', hidePanel);
  confirm?.addEventListener('click', () => {
    try {
      const result = downloadPartialProject(store, name.value);
      setStatus(`Teilprojekt exportiert: ${result.fileName} · ${result.objectCount} Objekt(e)`);
      hidePanel();
    } catch (error) {
      console.error(error);
      setStatus(error?.message || 'Teilprojekt-Export fehlgeschlagen.');
      alert(error?.message || String(error));
    }
  });

  mergeButton?.addEventListener('click', () => {
    closeFileMenu();
    mergeInput?.click();
  });

  mergeInput?.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    try {
      if (!file) return;
      setStatus('CM3D-Objekte werden geprüft …');
      const partial = await readMergeFile(file);
      const result = mergePartialProject(store, partial);
      setStatus(`CM3D-Objekte dazugeladen: ${result.objectCount} Objekt(e)`);
    } catch (error) {
      console.error(error);
      setStatus(error?.message || 'CM3D-Objekte konnten nicht dazugeladen werden.');
      alert(error?.message || String(error));
    } finally {
      mergeInput.value = '';
    }
  });

  document.addEventListener('keydown', event => { if (event.key === 'Escape') hidePanel(); });
  store.subscribe(event => {
    if (['selectionChanged', 'projectChanged', 'projectLoaded', 'historyChanged'].includes(event.type)) syncSelection();
  });

  syncSelection();
  document.title = 'CyberMotion 3D – WD-11C';
  const buildLabel = q('.brand small');
  if (buildLabel) buildLabel.textContent = 'WD-11C';
}
