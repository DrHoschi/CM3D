import { SketchElementKind, SketchElementRegistry, getSketchPoint } from './sketch-topology.js';
import { buildArcRenderPoints } from '../application/sketch-arc-geometry.js';
import { buildSplineRenderPoints } from '../application/sketch-spline-geometry.js';

export const CURVE_DERIVATION_SEGMENTS = 64;

const deepFreeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
};

const snapshot = value => deepFreeze(structuredClone(value));
const freezePoints = points => deepFreeze(points.map(point => ({ x: Number(point.x), y: Number(point.y) })));

function buildCirclePoints(circle, segments = CURVE_DERIVATION_SEGMENTS) {
  const cx = Number(circle?.center?.x), cy = Number(circle?.center?.y), radius = Number(circle?.radius);
  if (![cx, cy, radius].every(Number.isFinite) || !(radius > 0)) return [];
  const count = Math.max(8, Math.floor(Number(segments) || CURVE_DERIVATION_SEGMENTS));
  const points = [];
  for (let index = 0; index <= count; index += 1) {
    const angle = Math.PI * 2 * (index / count);
    points.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
  }
  return points;
}

function traversal(startPointId, endPointId) {
  return deepFreeze({
    forward: { startPointId: startPointId ?? null, endPointId: endPointId ?? null },
    reverse: { startPointId: endPointId ?? null, endPointId: startPointId ?? null }
  });
}

function deriveOne(sketch, kind, elementId, element, segments) {
  if (kind === SketchElementKind.CIRCLE) {
    const tessellation = buildCirclePoints(element, segments);
    if (!tessellation.length) return { diagnostic: { code: 'INVALID_CURVE_GEOMETRY', kind, elementId } };
    return { curve: deepFreeze({
      kind, elementId, closed: true, analytic: true,
      startPointId: null, endPointId: null,
      traversal: traversal(null, null), source: snapshot(element), tessellation: freezePoints(tessellation)
    }) };
  }

  const startPointId = element?.startPointId ?? null;
  const endPointId = element?.endPointId ?? null;
  const start = getSketchPoint(sketch, startPointId);
  const end = getSketchPoint(sketch, endPointId);
  if (!start || !end) return { diagnostic: { code: 'MISSING_TOPOLOGY_POINT', kind, elementId, startPointId, endPointId } };

  let tessellation = [];
  if (kind === SketchElementKind.LINE) tessellation = [{ x: start.x, y: start.y }, { x: end.x, y: end.y }];
  else if (kind === SketchElementKind.ARC) tessellation = buildArcRenderPoints(start, end, element.control, segments);
  else if (kind === SketchElementKind.SPLINE) tessellation = buildSplineRenderPoints(start, element.controls, end, segments);
  if (!tessellation.length) return { diagnostic: { code: 'INVALID_CURVE_GEOMETRY', kind, elementId } };

  return { curve: deepFreeze({
    kind, elementId, closed: false, analytic: kind !== SketchElementKind.LINE,
    startPointId, endPointId,
    traversal: traversal(startPointId, endPointId), source: snapshot(element), tessellation: freezePoints(tessellation)
  }) };
}

export function deriveSketchCurves(sketch, { segments = CURVE_DERIVATION_SEGMENTS } = {}) {
  if (sketch?.type !== 'sketch') {
    return deepFreeze({ curves: [], diagnostics: [{ code: 'NOT_SKETCH' }] });
  }

  const curves = [];
  const diagnostics = [];
  for (const kind of Object.values(SketchElementKind)) {
    const definition = SketchElementRegistry[kind];
    const collection = sketch.data?.[definition.collection] ?? {};
    for (const elementId of Object.keys(collection).sort()) {
      const result = deriveOne(sketch, kind, elementId, collection[elementId], segments);
      if (result.curve) curves.push(result.curve);
      if (result.diagnostic) diagnostics.push(deepFreeze(result.diagnostic));
    }
  }
  return deepFreeze({ curves, diagnostics });
}

export function reverseDerivedCurve(curve) {
  if (!curve) return null;
  if (curve.closed) return curve;
  return deepFreeze({
    ...curve,
    startPointId: curve.endPointId,
    endPointId: curve.startPointId,
    traversal: traversal(curve.endPointId, curve.startPointId),
    tessellation: freezePoints([...curve.tessellation].reverse())
  });
}
