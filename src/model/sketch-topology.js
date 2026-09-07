export const SketchElementKind = Object.freeze({
  LINE: 'line',
  CIRCLE: 'circle',
  ARC: 'arc',
  SPLINE: 'spline'
});

export const SketchElementRegistry = Object.freeze({
  [SketchElementKind.LINE]: Object.freeze({ collection: 'lines', idField: 'lineId', topologyEndpoints: true }),
  [SketchElementKind.CIRCLE]: Object.freeze({ collection: 'circles', idField: 'circleId', topologyEndpoints: false }),
  [SketchElementKind.ARC]: Object.freeze({ collection: 'arcs', idField: 'arcId', topologyEndpoints: true }),
  [SketchElementKind.SPLINE]: Object.freeze({ collection: 'splines', idField: 'splineId', topologyEndpoints: true })
});

const EPSILON = 1e-10;

export function isSketchObject(sketch) {
  return sketch?.type === 'sketch';
}

export function getSketchElementDefinition(kind) {
  return SketchElementRegistry[kind] ?? null;
}

export function getSketchElementCollection(sketch, kind) {
  if (!isSketchObject(sketch)) return null;
  const definition = getSketchElementDefinition(kind);
  return definition ? sketch.data?.[definition.collection] ?? null : null;
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
  if ([SketchElementKind.LINE, SketchElementKind.ARC, SketchElementKind.SPLINE].includes(resolved.kind)) {
    return [resolved.element.startPointId, resolved.element.endPointId];
  }
  return [];
}

export function sketchElementsShareTopologyPoint(sketch, firstElementId, secondElementId) {
  const first = new Set(getSketchElementPointIds(sketch, firstElementId));
  return getSketchElementPointIds(sketch, secondElementId).some(pointId => first.has(pointId));
}

function validateElementMap(sketch, kind, errors) {
  const definition = getSketchElementDefinition(kind);
  const collection = sketch.data?.[definition.collection];
  if (!collection || Array.isArray(collection) || typeof collection !== 'object') {
    errors.push(`Skizzen-Collection ${definition.collection} fehlt für ${sketch.objectId}.`);
    return;
  }
  for (const [key, element] of Object.entries(collection)) {
    if (key !== element?.[definition.idField]) errors.push(`${definition.idField}-Schlüssel stimmt nicht mit ID überein: ${key}`);
  }
}

function validateEndpointElement(sketch, element, label, errors) {
  if (!getSketchPoint(sketch, element.startPointId) || !getSketchPoint(sketch, element.endPointId)) {
    errors.push(`${label} referenziert fehlende Punkte in ${sketch.objectId}.`);
  }
  if (element.startPointId === element.endPointId) errors.push(`${label} benötigt zwei verschiedene Punkte.`);
}

export function validateSketchTopology(sketch) {
  const errors = [];
  if (!isSketchObject(sketch)) return { valid: false, errors: ['Objekt ist keine Skizze.'] };
  if (sketch.data?.plane !== 'localXY') errors.push(`Ungültige Skizzenebene für ${sketch.objectId}.`);
  if (!sketch.data?.points || Array.isArray(sketch.data.points) || typeof sketch.data.points !== 'object') {
    errors.push(`Skizzenpunkte fehlen für ${sketch.objectId}.`);
  }

  for (const kind of Object.values(SketchElementKind)) validateElementMap(sketch, kind, errors);

  for (const [pointKey, point] of Object.entries(sketch.data?.points ?? {})) {
    if (pointKey !== point.pointId) errors.push(`Punktschlüssel stimmt nicht mit pointId überein: ${pointKey}`);
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) errors.push(`Ungültiger Skizzenpunkt ${pointKey} in ${sketch.objectId}.`);
  }

  for (const [lineKey, line] of Object.entries(sketch.data?.lines ?? {})) {
    validateEndpointElement(sketch, line, `Skizzenlinie ${lineKey}`, errors);
  }

  for (const [circleKey, circle] of Object.entries(sketch.data?.circles ?? {})) {
    if (!Number.isFinite(circle.center?.x) || !Number.isFinite(circle.center?.y)) errors.push(`Ungültiger Kreismittelpunkt ${circleKey} in ${sketch.objectId}.`);
    if (!(Number.isFinite(circle.radius) && circle.radius > 0)) errors.push(`Ungültiger Kreisradius ${circleKey} in ${sketch.objectId}.`);
  }

  for (const [arcKey, arc] of Object.entries(sketch.data?.arcs ?? {})) {
    validateEndpointElement(sketch, arc, `Skizzenbogen ${arcKey}`, errors);
    if (!Number.isFinite(arc.control?.x) || !Number.isFinite(arc.control?.y)) {
      errors.push(`Ungültiger Kontrollpunkt für Skizzenbogen ${arcKey}.`);
      continue;
    }
    const a = getSketchPoint(sketch, arc.startPointId), b = getSketchPoint(sketch, arc.endPointId), c = arc.control;
    if (a && b) {
      const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
      if (Math.abs(cross) <= EPSILON) errors.push(`Skizzenbogen ${arcKey} benötigt einen nicht kollinearen Kontrollpunkt.`);
    }
  }

  for (const [splineKey, spline] of Object.entries(sketch.data?.splines ?? {})) {
    validateEndpointElement(sketch, spline, `Skizzenspline ${splineKey}`, errors);
    if (!Array.isArray(spline.controls) || spline.controls.length < 1) {
      errors.push(`Skizzenspline ${splineKey} benötigt mindestens einen Kontrollpunkt.`);
      continue;
    }
    const controlIds = new Set();
    for (const control of spline.controls) {
      if (!control?.controlId || controlIds.has(control.controlId)) errors.push(`Ungültige oder doppelte controlId in Skizzenspline ${splineKey}.`);
      else controlIds.add(control.controlId);
      if (!Number.isFinite(control?.x) || !Number.isFinite(control?.y)) errors.push(`Ungültiger Kontrollpunkt in Skizzenspline ${splineKey}.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// WD-21A topology invariant: geometric coincidence alone never creates connectivity.
// Two element endpoints are topologically connected only when they reference the same pointId.
export function areSketchEndpointsTopologicallyConnected(firstPointId, secondPointId) {
  return !!firstPointId && firstPointId === secondPointId;
}
