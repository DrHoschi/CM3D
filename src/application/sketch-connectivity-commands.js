const selectedSketchElements = store => {
  const selected = store.getSelectedSketchElements?.();
  if (Array.isArray(selected) && selected.length) return selected.map(item => ({ ...item }));
  const fallback = store.selection?.sketchElement;
  return fallback ? [{ ...fallback }] : [];
};

const sameSketch = items => items.length > 0 && items.every(item => item.sketchId === items[0].sketchId);

const pointIncidenceCount = (sketch, pointId) => Object.values(sketch?.data?.lines ?? {}).reduce((count, line) => (
  count + (line.startPointId === pointId || line.endPointId === pointId ? 1 : 0)
), 0);

export function deriveSketchConnectivityCommandState(store) {
  const selected = selectedSketchElements(store);
  const state = {
    selected,
    connect: { enabled: false, sketchId: null, survivorPointId: null, sourcePointId: null },
    disconnect: { enabled: false, sketchId: null, pointId: null, lineId: null }
  };

  if (selected.length !== 2 || !sameSketch(selected)) return state;
  const sketchId = selected[0].sketchId;
  const sketch = store.getObject?.(sketchId);
  if (sketch?.type !== 'sketch') return state;

  if (selected.every(item => item.kind === 'point')) {
    const source = selected[0];
    const survivor = selected[1];
    const points = sketch.data?.points ?? {};
    if (!points[source.elementId] || !points[survivor.elementId] || source.elementId === survivor.elementId) return state;
    const directPair = Object.values(sketch.data?.lines ?? {}).some(line => (
      (line.startPointId === survivor.elementId && line.endPointId === source.elementId)
      || (line.startPointId === source.elementId && line.endPointId === survivor.elementId)
    ));
    if (!directPair) {
      state.connect = {
        enabled: true,
        sketchId,
        survivorPointId: survivor.elementId,
        sourcePointId: source.elementId
      };
    }
    return state;
  }

  const point = selected.find(item => item.kind === 'point');
  const lineSelection = selected.find(item => item.kind === 'line');
  if (!point || !lineSelection) return state;
  const pointRecord = sketch.data?.points?.[point.elementId];
  const line = sketch.data?.lines?.[lineSelection.elementId];
  if (!pointRecord || !line) return state;
  const incident = line.startPointId === point.elementId || line.endPointId === point.elementId;
  if (!incident || pointIncidenceCount(sketch, point.elementId) < 2) return state;

  state.disconnect = {
    enabled: true,
    sketchId,
    pointId: point.elementId,
    lineId: lineSelection.elementId
  };
  return state;
}

function normalizeSelection(store, items, command) {
  store.selection.sketchElements = items.map(item => ({ ...item }));
  store.selection.sketchElement = store.selection.sketchElements.at(-1) ?? null;
  store.emit?.('selectionChanged', {
    connectivityCommand: command,
    sketchElements: structuredClone(store.selection.sketchElements)
  });
}

export function installSketchConnectivityCommands(store) {
  if (!store || typeof store.connectSketchPoints !== 'function' || typeof store.disconnectSketchLineFromPoint !== 'function') {
    throw new Error('SketchConnectivityCommands require the WD-21B connectivity mutation contracts.');
  }

  store.getSketchConnectivityCommandState = () => deriveSketchConnectivityCommandState(store);

  store.connectSelectedSketchPoints = () => {
    const state = deriveSketchConnectivityCommandState(store).connect;
    if (!state.enabled) return false;
    const result = store.connectSketchPoints(state.sketchId, state.survivorPointId, state.sourcePointId);
    if (result === false) return false;
    normalizeSelection(store, [{ sketchId: state.sketchId, kind: 'point', elementId: state.survivorPointId }], 'connect');
    return result;
  };

  store.disconnectSelectedSketchEndpoint = () => {
    const state = deriveSketchConnectivityCommandState(store).disconnect;
    if (!state.enabled) return false;
    const result = store.disconnectSketchLineFromPoint(state.sketchId, state.pointId, state.lineId);
    if (result === false) return false;
    normalizeSelection(store, [
      { sketchId: state.sketchId, kind: 'line', elementId: state.lineId },
      { sketchId: state.sketchId, kind: 'point', elementId: result.newPointId }
    ], 'disconnect');
    return result;
  };

  return Object.freeze({
    version: 'WD-21B.4',
    connectSelection: 'two-points-same-sketch-last-selected-survives',
    disconnectSelection: 'one-shared-point-plus-one-incident-line',
    visibleUi: false
  });
}
