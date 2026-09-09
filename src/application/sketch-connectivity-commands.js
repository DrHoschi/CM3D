import { SketchElementRegistry, getSketchElementDefinition } from '../model/sketch-topology.js';

const selectedSketchElements = store => {
  const selected = store.getSelectedSketchElements?.();
  if (Array.isArray(selected) && selected.length) return selected.map(item => ({ ...item }));
  const fallback = store.selection?.sketchElement;
  return fallback ? [{ ...fallback }] : [];
};

const sameSketch = items => items.length > 0 && items.every(item => item.sketchId === items[0].sketchId);

const endpointEntries = sketch => {
  const entries = [];
  for (const [kind, definition] of Object.entries(SketchElementRegistry)) {
    if (!definition.topologyEndpoints) continue;
    for (const [elementId, element] of Object.entries(sketch?.data?.[definition.collection] ?? {})) {
      entries.push({ kind, elementId, element });
    }
  }
  return entries;
};

const pointIncidenceCount = (sketch, pointId) => endpointEntries(sketch).reduce((count, { element }) => (
  count + (element.startPointId === pointId || element.endPointId === pointId ? 1 : 0)
), 0);

const directPairExists = (sketch, firstPointId, secondPointId) => endpointEntries(sketch).some(({ element }) => (
  (element.startPointId === firstPointId && element.endPointId === secondPointId)
  || (element.startPointId === secondPointId && element.endPointId === firstPointId)
));

export function deriveSketchConnectivityCommandState(store) {
  const selected = selectedSketchElements(store);
  const state = {
    selected,
    connect: { enabled: false, sketchId: null, survivorPointId: null, sourcePointId: null },
    disconnect: { enabled: false, sketchId: null, pointId: null, elementKind: null, elementId: null }
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
    if (!directPairExists(sketch, survivor.elementId, source.elementId)) {
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
  const elementSelection = selected.find(item => item.kind !== 'point');
  if (!point || !elementSelection) return state;
  const definition = getSketchElementDefinition(elementSelection.kind);
  if (!definition?.topologyEndpoints) return state;
  const pointRecord = sketch.data?.points?.[point.elementId];
  const element = sketch.data?.[definition.collection]?.[elementSelection.elementId];
  if (!pointRecord || !element) return state;
  const incident = element.startPointId === point.elementId || element.endPointId === point.elementId;
  if (!incident || pointIncidenceCount(sketch, point.elementId) < 2) return state;

  state.disconnect = {
    enabled: true,
    sketchId,
    pointId: point.elementId,
    elementKind: elementSelection.kind,
    elementId: elementSelection.elementId
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
  if (!store || typeof store.connectSketchPoints !== 'function' || typeof store.disconnectSketchElementFromPoint !== 'function') {
    throw new Error('SketchConnectivityCommands require the WD-21C.6 generic endpoint connectivity contract.');
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
    const result = store.disconnectSketchElementFromPoint(state.sketchId, state.pointId, state.elementKind, state.elementId);
    if (result === false) return false;
    normalizeSelection(store, [
      { sketchId: state.sketchId, kind: state.elementKind, elementId: state.elementId },
      { sketchId: state.sketchId, kind: 'point', elementId: result.newPointId }
    ], 'disconnect');
    return result;
  };

  return Object.freeze({
    version: 'WD-21C.6',
    connectSelection: 'two-points-same-sketch-last-selected-survives',
    disconnectSelection: 'one-shared-point-plus-one-incident-endpoint-element',
    endpointEligibility: 'registry-topologyEndpoints-true',
    visibleUi: false
  });
}
