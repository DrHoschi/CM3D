const MAX_MESSAGES = 40;
const MAX_EVENTS = 60;

function pretty(value) {
  try { return JSON.stringify(value, null, 2); }
  catch (error) { return `Nicht serialisierbar: ${error?.message || String(error)}`; }
}

function createPanel() {
  const host = document.querySelector('.inspector-panel');
  if (!host) return null;
  const panel = document.createElement('section');
  panel.id = 'diagnostics-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <div class="diagnostics-head">
      <strong>Diagnose</strong>
      <button id="diagnostics-close" type="button">Schließen</button>
    </div>
    <details open>
      <summary>Status / Meldungen</summary>
      <pre id="diagnostics-status"></pre>
    </details>
    <details>
      <summary>Selection / Auswahlstatus</summary>
      <pre id="diagnostics-selection"></pre>
    </details>
    <details>
      <summary>Scene JSON</summary>
      <pre id="diagnostics-scene"></pre>
    </details>
    <details>
      <summary>Diagnose / Konsole</summary>
      <pre id="diagnostics-console"></pre>
    </details>`;
  host.appendChild(panel);
  return panel;
}

function addToolButton() {
  const tools = document.querySelector('[data-context="tools"]');
  if (!tools || document.querySelector('#show-diagnostics')) return null;
  const button = document.createElement('button');
  button.id = 'show-diagnostics';
  button.type = 'button';
  button.className = 'tool-button';
  button.innerHTML = '<span class="icon-tile">≡</span><span>Diagnose</span>';
  tools.appendChild(button);
  return button;
}

export function installInspectorDiagnostics(store, runtime, ui) {
  const panel = createPanel();
  const button = addToolButton();
  const host = document.querySelector('.inspector-panel');
  if (!panel || !button || !host) return null;

  // Author CSS on inspector children (for example form{display:flex}) can override
  // the browser's native [hidden] rule. Hide the inherited inspector surface with
  // an explicit important display rule while diagnostics owns the right panel.
  const normalInspectorChildren = [...host.children].filter(child => child !== panel);
  const setNormalInspectorVisible = visible => {
    for (const child of normalInspectorChildren) {
      if (visible) child.style.removeProperty('display');
      else child.style.setProperty('display', 'none', 'important');
    }
  };

  const statusOut = panel.querySelector('#diagnostics-status');
  const selectionOut = panel.querySelector('#diagnostics-selection');
  const sceneOut = panel.querySelector('#diagnostics-scene');
  const consoleOut = panel.querySelector('#diagnostics-console');
  const closeButton = panel.querySelector('#diagnostics-close');
  const messages = [];
  const events = [];

  const stamp = () => new Date().toLocaleTimeString();
  const pushMessage = (kind, text) => {
    messages.push({ time: stamp(), kind, text: String(text ?? '') });
    if (messages.length > MAX_MESSAGES) messages.splice(0, messages.length - MAX_MESSAGES);
    renderStatus();
  };
  const pushEvent = event => {
    events.push({ time: stamp(), type: event?.type || 'unknown', objectId: event?.objectId ?? null });
    if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
    renderConsole();
  };

  const renderStatus = () => {
    const current = ui.status?.textContent || '';
    const history = messages.map(entry => `[${entry.time}] ${entry.kind}: ${entry.text}`).join('\n');
    statusOut.textContent = `Aktuell: ${current || '—'}${history ? `\n\n${history}` : ''}`;
  };

  const renderSelection = () => {
    const activeId = store.selection?.activeObjectId ?? null;
    const activeObject = activeId ? store.getObject(activeId) : null;
    selectionOut.textContent = pretty({
      selectedObjectIds: [...(store.selection?.selectedObjectIds ?? [])],
      activeObjectId: activeId,
      hoveredObjectId: store.selection?.hoveredObjectId ?? null,
      activeObject: activeObject ? {
        objectId: activeObject.objectId,
        type: activeObject.type,
        name: activeObject.name,
        parentId: activeObject.parentId,
        visible: activeObject.flags?.visible !== false,
        locked: activeObject.flags?.locked === true
      } : null
    });
  };

  const renderScene = () => {
    sceneOut.textContent = pretty(store.project?.scene ?? null);
  };

  const renderConsole = () => {
    const summary = {
      projectId: store.project?.project?.projectId ?? null,
      schemaVersion: store.project?.schemaVersion ?? null,
      objectCount: Object.keys(store.project?.scene?.objects ?? {}).length,
      rootCount: store.project?.scene?.rootObjectIds?.length ?? 0,
      assetCount: store.project?.assets?.length ?? 0,
      materialCount: Object.keys(store.project?.materials ?? {}).length,
      undoDepth: store.undoStack?.length ?? 0,
      redoDepth: store.redoStack?.length ?? 0,
      runtimeNodes: runtime?.objectMap?.size ?? 0,
      pickables: runtime?.pickables?.length ?? 0,
      toolMode: store.toolMode,
      coordinateSpace: store.coordinateSpace,
      snap: store.snap
    };
    const eventText = events.map(entry => `[${entry.time}] ${entry.type}${entry.objectId ? ` · ${entry.objectId}` : ''}`).join('\n');
    consoleOut.textContent = `${pretty(summary)}${eventText ? `\n\nLetzte Store-Ereignisse\n${eventText}` : ''}`;
  };

  const renderAll = () => {
    renderStatus();
    renderSelection();
    renderScene();
    renderConsole();
  };

  const open = () => {
    setNormalInspectorVisible(false);
    panel.hidden = false;
    panel.style.removeProperty('display');
    button.classList.add('active');
    renderAll();
  };
  const close = () => {
    panel.hidden = true;
    panel.style.setProperty('display', 'none', 'important');
    setNormalInspectorVisible(true);
    button.classList.remove('active');
    ui.render?.();
  };

  button.addEventListener('click', () => panel.hidden ? open() : close());
  closeButton.addEventListener('click', close);

  const baseSetStatus = ui.setStatus.bind(ui);
  ui.setStatus = message => {
    baseSetStatus(message);
    pushMessage('INFO', message);
  };
  const baseFail = ui.fail.bind(ui);
  ui.fail = error => {
    pushMessage('ERROR', error?.message || String(error));
    return baseFail(error);
  };

  const unsubscribe = store.subscribe(event => {
    pushEvent(event);
    if (!panel.hidden) {
      if (['selectionChanged', 'projectChanged', 'projectLoaded', 'objectCreated', 'objectChanged', 'geometryChanged', 'visibilityChanged', 'lockChanged', 'historyChanged'].includes(event.type)) {
        renderSelection();
        renderScene();
      }
      renderConsole();
    }
  });

  window.addEventListener('error', event => pushMessage('ERROR', event.message || 'Unbekannter Fensterfehler'));
  window.addEventListener('unhandledrejection', event => pushMessage('ERROR', event.reason?.message || String(event.reason || 'Unhandled Promise Rejection')));

  panel.style.setProperty('display', 'none', 'important');
  pushMessage('INFO', 'WD-18 Diagnose bereit.');
  document.title = 'CyberMotion 3D – WD-18';
  const buildLabel = document.querySelector('.brand small');
  if (buildLabel) buildLabel.textContent = 'WD-18';

  return { panel, button, open, close, renderAll, unsubscribe };
}
