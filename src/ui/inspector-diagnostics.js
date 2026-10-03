import { installPerformanceInstrumentation } from '../runtime-three/performance-instrumentation.js';

const MAX_MESSAGES = 40;
const MAX_EVENTS = 60;
const DIAGNOSTIC_EXPORT_VERSION = 1;

function pretty(value) {
  try { return JSON.stringify(value, null, 2); }
  catch (error) { return `Nicht serialisierbar: ${error?.message || String(error)}`; }
}

const cloneDiagnostics = diagnostics => Array.isArray(diagnostics)
  ? diagnostics.map(item => ({ code:item?.code ?? null, message:item?.message ?? '' }))
  : [];

export function projectReferenceDiagnostics(store) {
  const objects = Object.values(store?.project?.scene?.objects ?? {})
    .filter(object => object?.data?.sourceSketchRef || object?.extensions?.sourceSketchReference || object?.extensions?.recomputeState)
    .sort((a, b) => String(a.objectId).localeCompare(String(b.objectId)));

  return objects.map(object => ({
    objectId: object.objectId,
    type: object.type,
    name: object.name ?? null,
    sourceReference: object.data?.sourceSketchRef ? { ...object.data.sourceSketchRef } : null,
    referenceState: object.extensions?.sourceSketchReference?.state ?? 'UNRESOLVED',
    referenceDiagnostics: cloneDiagnostics(object.extensions?.sourceSketchReference?.diagnostics),
    recomputeState: object.extensions?.recomputeState?.state ?? null,
    upstreamState: object.extensions?.recomputeState?.upstreamState ?? null,
    recomputeDiagnostics: cloneDiagnostics(object.extensions?.recomputeState?.diagnostics)
  }));
}

function selectionSnapshot(store) {
  const activeId = store.selection?.activeObjectId ?? null;
  const activeObject = activeId ? store.getObject(activeId) : null;
  return {
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
  };
}

function sceneSummary(store, runtime) {
  return {
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
}

export function createDiagnosticSnapshot({ store, runtime, ui, performanceInstrumentation, messages = [], events = [], exportedAt = new Date().toISOString() }) {
  return {
    diagnosticExportVersion: DIAGNOSTIC_EXPORT_VERSION,
    exportedAt,
    project: {
      projectId: store.project?.project?.projectId ?? null,
      schemaVersion: store.project?.schemaVersion ?? null
    },
    diagnostics: {
      currentStatus: ui.status?.textContent || '',
      messages: messages.map(entry => ({ ...entry })),
      references: projectReferenceDiagnostics(store)
    },
    performance: performanceInstrumentation?.snapshot?.() ?? null,
    selection: selectionSnapshot(store),
    sceneSummary: sceneSummary(store, runtime),
    events: events.map(entry => ({ ...entry }))
  };
}

function diagnosticFilename(date = new Date()) {
  return `cybermotion-diagnostics-${date.toISOString().replace(/[:.]/g, '-')}.json`;
}

export function downloadDiagnosticSnapshot(snapshot, date = new Date()) {
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = diagnosticFilename(date);
  link.click();
  URL.revokeObjectURL(url);
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
      <button id="diagnostics-export" type="button">Diagnose exportieren</button>
      <button id="diagnostics-close" type="button">Schließen</button>
    </div>
    <details open>
      <summary>Status / Meldungen</summary>
      <pre id="diagnostics-status"></pre>
    </details>
    <details open>
      <summary>Performance</summary>
      <pre id="diagnostics-performance"></pre>
    </details>
    <details open>
      <summary>Referenzen / Recompute</summary>
      <pre id="diagnostics-references"></pre>
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
  const performanceInstrumentation = installPerformanceInstrumentation(runtime);
  const panel = createPanel();
  const button = addToolButton();
  const host = document.querySelector('.inspector-panel');
  if (!panel || !button || !host) return null;

  const normalInspectorChildren = [...host.children].filter(child => child !== panel);
  const setNormalInspectorVisible = visible => {
    for (const child of normalInspectorChildren) {
      if (visible) child.style.removeProperty('display');
      else child.style.setProperty('display', 'none', 'important');
    }
  };

  const statusOut = panel.querySelector('#diagnostics-status');
  const performanceOut = panel.querySelector('#diagnostics-performance');
  const referencesOut = panel.querySelector('#diagnostics-references');
  const selectionOut = panel.querySelector('#diagnostics-selection');
  const sceneOut = panel.querySelector('#diagnostics-scene');
  const consoleOut = panel.querySelector('#diagnostics-console');
  const exportButton = panel.querySelector('#diagnostics-export');
  const closeButton = panel.querySelector('#diagnostics-close');
  const messages = [];
  const events = [];
  let performanceTimer = null;

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

  const renderPerformance = () => {
    const snapshot = performanceInstrumentation?.snapshot?.() ?? null;
    performanceOut.textContent = snapshot ? pretty(snapshot) : 'Performance-Instrumentierung nicht verfügbar.';
  };

  const renderReferences = () => {
    const projection = projectReferenceDiagnostics(store);
    referencesOut.textContent = projection.length ? pretty(projection) : 'Keine Referenz-/Recompute-Diagnosen vorhanden.';
  };

  const renderSelection = () => {
    selectionOut.textContent = pretty(selectionSnapshot(store));
  };

  const renderScene = () => {
    sceneOut.textContent = pretty(store.project?.scene ?? null);
  };

  const renderConsole = () => {
    const summary = sceneSummary(store, runtime);
    const eventText = events.map(entry => `[${entry.time}] ${entry.type}${entry.objectId ? ` · ${entry.objectId}` : ''}`).join('\n');
    consoleOut.textContent = `${pretty({ projectId: store.project?.project?.projectId ?? null, schemaVersion: store.project?.schemaVersion ?? null, ...summary })}${eventText ? `\n\nLetzte Store-Ereignisse\n${eventText}` : ''}`;
  };

  const renderAll = () => {
    renderStatus();
    renderPerformance();
    renderReferences();
    renderSelection();
    renderScene();
    renderConsole();
  };

  const stopPerformanceRefresh = () => {
    if (performanceTimer != null) {
      clearInterval(performanceTimer);
      performanceTimer = null;
    }
  };

  const open = () => {
    setNormalInspectorVisible(false);
    panel.hidden = false;
    panel.style.removeProperty('display');
    button.classList.add('active');
    renderAll();
    stopPerformanceRefresh();
    performanceTimer = setInterval(() => {
      if (!panel.hidden) renderPerformance();
    }, 1000);
  };
  const close = () => {
    stopPerformanceRefresh();
    panel.hidden = true;
    panel.style.setProperty('display', 'none', 'important');
    setNormalInspectorVisible(true);
    button.classList.remove('active');
    ui.render?.();
  };

  const exportDiagnostics = () => {
    const now = new Date();
    const snapshot = createDiagnosticSnapshot({ store, runtime, ui, performanceInstrumentation, messages, events, exportedAt: now.toISOString() });
    downloadDiagnosticSnapshot(snapshot, now);
  };

  button.addEventListener('click', () => panel.hidden ? open() : close());
  exportButton.addEventListener('click', exportDiagnostics);
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
      if (['selectionChanged', 'projectChanged', 'projectLoaded', 'objectCreated', 'objectChanged', 'geometryChanged', 'visibilityChanged', 'lockChanged', 'historyChanged', 'sketchDependenciesChanged'].includes(event.type)) {
        renderReferences();
        renderSelection();
        renderScene();
      }
      renderConsole();
    }
  });

  window.addEventListener('error', event => pushMessage('ERROR', event.message || 'Unbekannter Fensterfehler'));
  window.addEventListener('unhandledrejection', event => pushMessage('ERROR', event.reason?.message || String(event.reason || 'Unhandled Promise Rejection')));

  panel.style.setProperty('display', 'none', 'important');
  pushMessage('INFO', 'Referenzdiagnose bereit.');

  return {
    panel,
    button,
    open,
    close,
    renderAll,
    renderReferences,
    renderPerformance,
    createDiagnosticSnapshot: () => createDiagnosticSnapshot({ store, runtime, ui, performanceInstrumentation, messages, events }),
    exportDiagnostics,
    performanceInstrumentation,
    unsubscribe,
    dispose() {
      stopPerformanceRefresh();
      performanceInstrumentation?.dispose?.();
      unsubscribe?.();
    }
  };
}
