import { deriveSketchPathGraph, SketchPathComponentClassification } from './sketch-path-graph-derivation.js';

const EPSILON = 1e-9;

const deepFreeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
};

const clonePoint = point => ({ x: Number(point.x), y: Number(point.y) });

function contourPoints(component) {
  const points = [];
  for (const curve of component.curves ?? []) {
    const samples = Array.isArray(curve.tessellation) ? curve.tessellation : [];
    for (let index = 0; index < samples.length; index += 1) {
      const point = clonePoint(samples[index]);
      const previous = points.at(-1);
      if (previous && Math.abs(previous.x - point.x) <= EPSILON && Math.abs(previous.y - point.y) <= EPSILON) continue;
      points.push(point);
    }
  }
  if (points.length > 1) {
    const first = points[0];
    const last = points.at(-1);
    if (Math.abs(first.x - last.x) <= EPSILON && Math.abs(first.y - last.y) <= EPSILON) points.pop();
  }
  return points;
}

function signedArea(points) {
  let sum = 0;
  for (let index = 0; index < points.length; index += 1) {
    const a = points[index];
    const b = points[(index + 1) % points.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return sum / 2;
}

function pointOnSegment(point, a, b) {
  const cross = (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
  if (Math.abs(cross) > EPSILON) return false;
  const dot = (point.x - a.x) * (point.x - b.x) + (point.y - a.y) * (point.y - b.y);
  return dot <= EPSILON;
}

function classifyPointInPolygon(point, polygon) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const a = polygon[previous];
    const b = polygon[index];
    if (pointOnSegment(point, a, b)) return 'BOUNDARY';
    const crosses = ((a.y > point.y) !== (b.y > point.y))
      && (point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x);
    if (crosses) inside = !inside;
  }
  return inside ? 'INSIDE' : 'OUTSIDE';
}

function sourceRefs(component) {
  return (component.curves ?? []).map(curve => deepFreeze({ kind: curve.kind, elementId: curve.elementId }));
}

function derivedContour(component) {
  const points = contourPoints(component);
  const area = points.length >= 3 ? signedArea(points) : 0;
  return {
    componentKey: component.componentKey,
    curves: component.curves,
    sourceElements: deepFreeze(sourceRefs(component)),
    points: deepFreeze(points),
    signedArea: area,
    winding: area > 0 ? 'CCW' : area < 0 ? 'CW' : 'DEGENERATE',
    absoluteArea: Math.abs(area),
    parentComponentKey: null,
    nestingDepth: null
  };
}

function chooseParent(contour, candidates, diagnostics) {
  if (!contour.points.length) return null;
  const probe = contour.points[0];
  const containers = [];
  for (const candidate of candidates) {
    if (candidate.componentKey === contour.componentKey) continue;
    const relation = classifyPointInPolygon(probe, candidate.points);
    if (relation === 'BOUNDARY') {
      diagnostics.push({
        code: 'AMBIGUOUS_BOUNDARY_CONTACT',
        componentKey: contour.componentKey,
        candidateParentComponentKey: candidate.componentKey
      });
      continue;
    }
    if (relation === 'INSIDE') containers.push(candidate);
  }
  containers.sort((a, b) => a.absoluteArea - b.absoluteArea || a.componentKey.localeCompare(b.componentKey));
  return containers[0] ?? null;
}

function resolveDepth(contour, byKey, resolving = new Set()) {
  if (contour.nestingDepth !== null) return contour.nestingDepth;
  if (!contour.parentComponentKey) return 0;
  if (resolving.has(contour.componentKey)) return 0;
  resolving.add(contour.componentKey);
  const parent = byKey.get(contour.parentComponentKey);
  const depth = parent ? resolveDepth(parent, byKey, resolving) + 1 : 0;
  resolving.delete(contour.componentKey);
  return depth;
}

function freezeContourView(contour) {
  return deepFreeze({
    componentKey: contour.componentKey,
    curves: contour.curves,
    sourceElements: contour.sourceElements,
    points: contour.points,
    signedArea: contour.signedArea,
    winding: contour.winding,
    nestingDepth: contour.nestingDepth,
    parentComponentKey: contour.parentComponentKey
  });
}

export function deriveSketchProfileRegions(sketch) {
  const graph = deriveSketchPathGraph(sketch);
  const diagnostics = [...graph.diagnostics];
  const closedComponents = graph.components.filter(component => component.classification === SketchPathComponentClassification.CLOSED_CONTOUR);
  const contours = closedComponents.map(derivedContour).sort((a, b) => a.componentKey.localeCompare(b.componentKey));
  const classifiable = [];
  const unclassifiedContours = [];

  for (const contour of contours) {
    if (contour.points.length < 3 || contour.absoluteArea <= EPSILON) {
      diagnostics.push({ code: 'D3_UNCLASSIFIED_GEOMETRY', componentKey: contour.componentKey, reason: 'INSUFFICIENT_OR_ZERO_AREA_DERIVED_SAMPLES' });
      unclassifiedContours.push(freezeContourView({ ...contour, nestingDepth: 0 }));
      continue;
    }
    classifiable.push(contour);
  }

  for (const contour of classifiable) {
    const parent = chooseParent(contour, classifiable, diagnostics);
    contour.parentComponentKey = parent?.componentKey ?? null;
  }

  const byKey = new Map(classifiable.map(contour => [contour.componentKey, contour]));
  for (const contour of classifiable) contour.nestingDepth = resolveDepth(contour, byKey);

  const profileRegions = [];
  for (const contour of classifiable.filter(item => item.nestingDepth % 2 === 0)) {
    const holes = classifiable
      .filter(candidate => candidate.parentComponentKey === contour.componentKey && candidate.nestingDepth === contour.nestingDepth + 1)
      .sort((a, b) => a.componentKey.localeCompare(b.componentKey))
      .map(freezeContourView);
    profileRegions.push(deepFreeze({
      profileKey: `profile:${contour.componentKey}`,
      nestingDepth: contour.nestingDepth,
      outerContour: freezeContourView(contour),
      holes: deepFreeze(holes)
    }));
  }

  profileRegions.sort((a, b) => a.profileKey.localeCompare(b.profileKey));
  diagnostics.sort((a, b) => `${a.componentKey ?? ''}:${a.code ?? ''}`.localeCompare(`${b.componentKey ?? ''}:${b.code ?? ''}`));

  return deepFreeze({
    profileRegions,
    unclassifiedContours: deepFreeze(unclassifiedContours),
    diagnostics
  });
}
