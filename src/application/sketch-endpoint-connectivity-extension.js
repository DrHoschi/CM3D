import { SketchElementRegistry, getSketchElementDefinition } from '../model/sketch-topology.js';
import { createSketchPoint } from '../model/project.js';

const MUTATION_OWNER = 'central-sketch-mutation';

function markMutationOwner(fn) {
  Object.defineProperty(fn, '__cm3dMutationOwner', { value: MUTATION_OWNER, configurable: false });
  return fn;
}

function endpointEntries(sketch) {
  const entries = [];
  for (const [kind, definition] of Object.entries(SketchElementRegistry)) {
    if (!definition.topologyEndpoints) continue;
    for (const [elementId, element] of Object.entries(sketch.data?.[definition.collection] ?? {})) {
      entries.push({ kind, elementId, element });
    }
  }
  return entries;
}

function resolveEndpointElement(sketch, kind, elementId) {
  const definition = getSketchElementDefinition(kind);
  if (!definition?.topologyEndpoints) return null;
  const element = sketch.data?.[definition.collection]?.[elementId] ?? null;
  return element ? { kind, elementId, element } : null;
}

function pointIncidenceCount(sketch, pointId) {
  return endpointEntries(sketch).reduce((count, { element }) => (
    count + (element.startPointId === pointId || element.endPointId === pointId ? 1 : 0)
  ), 0);
}

function hasDirectPair(sketch, firstPointId, secondPointId) {
  return endpointEntries(sketch).some(({ element }) => (
    (element.startPointId === firstPointId && element.endPointId === secondPointId)
    || (element.startPointId === secondPointId && element.endPointId === firstPointId)
  ));
}

export function installGenericEndpointConnectivityContract(store) {
  if (!store || typeof store.runSketchMutation !== 'function') {
    throw new Error('WD-21C.6 requires the central runSketchMutation contract.');
  }
  if (store.__cm3dGenericEndpointConnectivityInstalled) return store.genericEndpointConnectivityContract;

  store.connectSketchPoints = markMutationOwner((sketchId, survivorPointId, sourcePointId) => {
    if (!survivorPointId || !sourcePointId || survivorPointId === sourcePointId) return false;
    return store.runSketchMutation(sketchId, 'Skizzenendpunkte verbinden', sketch => {
      const points = sketch.data?.points ?? {};
      if (!points[survivorPointId] || !points[sourcePointId]) return false;
      if (hasDirectPair(sketch, survivorPointId, sourcePointId)) return false;

      const rewiredElements = [];
      for (const { kind, elementId, element } of endpointEntries(sketch)) {
        let changed = false;
        if (element.startPointId === sourcePointId) {
          element.startPointId = survivorPointId;
          changed = true;
        }
        if (element.endPointId === sourcePointId) {
          element.endPointId = survivorPointId;
          changed = true;
        }
        if (changed) rewiredElements.push({ kind, elementId });
      }

      delete points[sourcePointId];
      return {
        survivorPointId,
        sourcePointId,
        rewiredElements,
        rewiredLineIds: rewiredElements.filter(item => item.kind === 'line').map(item => item.elementId)
      };
    }, { selectionChanged: true });
  });

  store.disconnectSketchElementFromPoint = markMutationOwner((sketchId, pointId, kind, elementId) => {
    if (!pointId || !kind || !elementId) return false;
    return store.runSketchMutation(sketchId, 'Skizzenendpunkt trennen', sketch => {
      const points = sketch.data?.points ?? {};
      const point = points[pointId];
      const resolved = resolveEndpointElement(sketch, kind, elementId);
      if (!point || !resolved) return false;

      const { element } = resolved;
      const endpoint = element.startPointId === pointId
        ? 'start'
        : element.endPointId === pointId
          ? 'end'
          : null;
      if (!endpoint || pointIncidenceCount(sketch, pointId) < 2) return false;

      const detachedPoint = createSketchPoint(point.x, point.y);
      points[detachedPoint.pointId] = detachedPoint;
      if (endpoint === 'start') element.startPointId = detachedPoint.pointId;
      else element.endPointId = detachedPoint.pointId;

      return {
        originalPointId: pointId,
        newPointId: detachedPoint.pointId,
        elementKind: kind,
        elementId,
        ...(kind === 'line' ? { lineId: elementId } : {}),
        endpoint
      };
    }, { selectionChanged: true });
  });

  store.disconnectSketchLineFromPoint = markMutationOwner((sketchId, pointId, lineId) => (
    store.disconnectSketchElementFromPoint(sketchId, pointId, 'line', lineId)
  ));

  store.genericEndpointConnectivityContract = Object.freeze({
    version: 'WD-21C.6',
    mutationOwner: MUTATION_OWNER,
    topologyAuthority: 'pointId',
    endpointEligibility: 'registry-topologyEndpoints-true',
    endpointKinds: Object.freeze(Object.entries(SketchElementRegistry).filter(([, definition]) => definition.topologyEndpoints).map(([kind]) => kind)),
    controlPointsAreTopology: false,
    geometricRebinding: false,
    transactionPath: 'runSketchMutation',
    visibleArcSplineFunctionIncluded: false
  });
  Object.defineProperty(store, '__cm3dGenericEndpointConnectivityInstalled', { value: true });
  return store.genericEndpointConnectivityContract;
}
