export const SketchElementKind = Object.freeze({
  LINE: 'line'
});

const elementCollections = Object.freeze({
  [SketchElementKind.LINE]: 'lines'
});

export function isSketchObject(sketch) {
  return sketch?.type === 'sketch';
}

export function getSketchElementCollection(sketch, kind) {
  if (!isSketchObject(sketch)) return null;
  const key = elementCollections[kind];
  return key ? sketch.data?.[key] ?? null : null;
}

export function getSketchElement(sketch, elementId, kind = null) {
  if (!isSketchObject(sketch) || !elementId) return null;
  if (kind) {
    const collection = getSketchElementCollection(sketch, kind);
    const element = collection?.[elementId] ?? null;
    return element ? { kind, element } : null;
  }
  for (const candidateKind of Object.values(SketchElementKind)) {
    const collection = getSketchElementCollection(sketch, candidateKind);
    if (collection?.[elementId]) return { kind: candidateKind, element: collection[elementId] };
  }
  return null;
}

export function getSketchPoint(sketch, pointId) {
  if (!isSketchObject(sketch) || !pointId) return null;
  return sketch.data?.points?.[pointId] ?? null;
}

export function getSketchElementPointIds(sketch, elementId, kind = null) {
  const resolved = getSketchElement(sketch, elementId, kind);
  if (!resolved) return [];
  if (resolved.kind === SketchElementKind.LINE) {
    return [resolved.element.startPointId, resolved.element.endPointId];
  }
  return [];
}

export function sketchElementsShareTopologyPoint(sketch, firstElementId, secondElementId) {
  const first = new Set(getSketchElementPointIds(sketch, firstElementId));
  return getSketchElementPointIds(sketch, secondElementId).some(pointId => first.has(pointId));
}

export function validateSketchTopology(sketch) {
  const errors = [];
  if (!isSketchObject(sketch)) return { valid: false, errors: ['Objekt ist keine Skizze.'] };
  if (sketch.data?.plane !== 'localXY') errors.push(`Ungültige Skizzenebene für ${sketch.objectId}.`);
  if (!sketch.data?.points || Array.isArray(sketch.data.points) || typeof sketch.data.points !== 'object') {
    errors.push(`Skizzenpunkte fehlen für ${sketch.objectId}.`);
  }
  if (!sketch.data?.lines || Array.isArray(sketch.data.lines) || typeof sketch.data.lines !== 'object') {
    errors.push(`Skizzenlinien fehlen für ${sketch.objectId}.`);
  }
  for (const [pointKey, point] of Object.entries(sketch.data?.points ?? {})) {
    if (pointKey !== point.pointId) errors.push(`Punktschlüssel stimmt nicht mit pointId überein: ${pointKey}`);
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) errors.push(`Ungültiger Skizzenpunkt ${pointKey} in ${sketch.objectId}.`);
  }
  for (const [lineKey, line] of Object.entries(sketch.data?.lines ?? {})) {
    if (lineKey !== line.lineId) errors.push(`Linienschlüssel stimmt nicht mit lineId überein: ${lineKey}`);
    if (!getSketchPoint(sketch, line.startPointId) || !getSketchPoint(sketch, line.endPointId)) {
      errors.push(`Skizzenlinie ${lineKey} referenziert fehlende Punkte in ${sketch.objectId}.`);
    }
    if (line.startPointId === line.endPointId) errors.push(`Skizzenlinie ${lineKey} benötigt zwei verschiedene Punkte.`);
  }
  return { valid: errors.length === 0, errors };
}

// WD-21A topology invariant: geometric coincidence alone never creates connectivity.
// Two element endpoints are topologically connected only when they reference the same pointId.
export function areSketchEndpointsTopologicallyConnected(firstPointId, secondPointId) {
  return !!firstPointId && firstPointId === secondPointId;
}
