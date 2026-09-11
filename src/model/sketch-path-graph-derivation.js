import { deriveSketchCurves, reverseDerivedCurve } from './sketch-curve-derivation.js';

export const SketchPathComponentClassification = Object.freeze({
  CLOSED_CONTOUR: 'CLOSED_CONTOUR',
  OPEN_PATH: 'OPEN_PATH',
  INVALID_COMPONENT: 'INVALID_COMPONENT'
});

const deepFreeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
};

const curveKey = curve => `${curve.kind}:${curve.elementId}`;
const sorted = values => [...values].sort((a, b) => String(a).localeCompare(String(b)));

function componentKey(curves) {
  return curves.map(curveKey).sort().join('|');
}

function buildEndpointGraph(curves) {
  const byPoint = new Map();
  const byKey = new Map();
  for (const curve of curves) {
    const key = curveKey(curve);
    byKey.set(key, curve);
    for (const pointId of [curve.startPointId, curve.endPointId]) {
      if (!pointId) continue;
      if (!byPoint.has(pointId)) byPoint.set(pointId, []);
      byPoint.get(pointId).push(key);
    }
  }
  for (const keys of byPoint.values()) keys.sort();
  return { byPoint, byKey };
}

function collectComponent(seedKey, graph, unvisited) {
  const found = new Set();
  const queue = [seedKey];
  while (queue.length) {
    queue.sort();
    const key = queue.shift();
    if (found.has(key)) continue;
    const curve = graph.byKey.get(key);
    if (!curve) continue;
    found.add(key);
    unvisited.delete(key);
    for (const pointId of [curve.startPointId, curve.endPointId]) {
      for (const neighbor of graph.byPoint.get(pointId) ?? []) if (!found.has(neighbor)) queue.push(neighbor);
    }
  }
  return sorted(found).map(key => graph.byKey.get(key));
}

function degreesFor(curves, graph) {
  const degrees = new Map();
  const keys = new Set(curves.map(curveKey));
  for (const curve of curves) {
    for (const pointId of [curve.startPointId, curve.endPointId]) {
      if (!pointId) continue;
      const degree = (graph.byPoint.get(pointId) ?? []).filter(key => keys.has(key)).length;
      degrees.set(pointId, degree);
    }
  }
  return degrees;
}

function orientedCurveFrom(curve, pointId) {
  if (curve.startPointId === pointId) return curve;
  if (curve.endPointId === pointId) return reverseDerivedCurve(curve);
  return null;
}

function traverse(curves, graph, startPointId, firstKey = null) {
  const allowed = new Set(curves.map(curveKey));
  const used = new Set();
  const ordered = [];
  let currentPointId = startPointId;

  while (used.size < allowed.size) {
    const choices = (graph.byPoint.get(currentPointId) ?? [])
      .filter(key => allowed.has(key) && !used.has(key))
      .sort();
    let nextKey = choices[0] ?? null;
    if (ordered.length === 0 && firstKey) nextKey = choices.includes(firstKey) ? firstKey : null;
    if (!nextKey) return null;
    const source = graph.byKey.get(nextKey);
    const oriented = orientedCurveFrom(source, currentPointId);
    if (!oriented) return null;
    ordered.push(oriented);
    used.add(nextKey);
    currentPointId = oriented.endPointId;
  }
  return { curves: ordered, endPointId: currentPointId };
}

function canonicalClosedTraversal(curves, graph) {
  const firstKey = sorted(curves.map(curveKey))[0];
  const first = graph.byKey.get(firstKey);
  if (!first) return null;
  const candidates = sorted([first.startPointId, first.endPointId]);
  const traversals = candidates.map(startPointId => traverse(curves, graph, startPointId, firstKey))
    .filter(result => result && result.endPointId === result.curves[0]?.startPointId && result.curves.length === curves.length);
  if (!traversals.length) return null;
  traversals.sort((a, b) => {
    const aSignature = a.curves.map(curve => `${curveKey(curve)}:${curve.startPointId}->${curve.endPointId}`).join('|');
    const bSignature = b.curves.map(curve => `${curveKey(curve)}:${curve.startPointId}->${curve.endPointId}`).join('|');
    return aSignature.localeCompare(bSignature);
  });
  return traversals[0];
}

function invalidComponent(curves, code, pointIds = []) {
  const key = componentKey(curves);
  return {
    component: deepFreeze({
      classification: SketchPathComponentClassification.INVALID_COMPONENT,
      componentKey: key,
      curves: deepFreeze([...curves].sort((a, b) => curveKey(a).localeCompare(curveKey(b)))),
      startPointId: null,
      endPointId: null
    }),
    diagnostic: deepFreeze({ code, componentKey: key, pointIds: sorted(pointIds) })
  };
}

function deriveEndpointComponent(curves, graph) {
  const degrees = degreesFor(curves, graph);
  const branching = [...degrees.entries()].filter(([, degree]) => degree > 2).map(([pointId]) => pointId);
  if (branching.length) return invalidComponent(curves, 'BRANCHING_COMPONENT', branching);

  const degreeOne = sorted([...degrees.entries()].filter(([, degree]) => degree === 1).map(([pointId]) => pointId));
  const invalidDegree = [...degrees.entries()].filter(([, degree]) => degree !== 1 && degree !== 2).map(([pointId]) => pointId);
  if (invalidDegree.length) return invalidComponent(curves, 'INVALID_COMPONENT_DEGREE', invalidDegree);

  if (degreeOne.length === 2) {
    const startPointId = degreeOne[0];
    const traversal = traverse(curves, graph, startPointId);
    if (!traversal || traversal.curves.length !== curves.length || traversal.endPointId !== degreeOne[1]) {
      return invalidComponent(curves, 'NON_ORDERABLE_COMPONENT');
    }
    return { component: deepFreeze({
      classification: SketchPathComponentClassification.OPEN_PATH,
      componentKey: componentKey(curves),
      curves: deepFreeze(traversal.curves),
      startPointId,
      endPointId: degreeOne[1]
    }), diagnostic: null };
  }

  if (degreeOne.length === 0 && [...degrees.values()].every(degree => degree === 2)) {
    const traversal = canonicalClosedTraversal(curves, graph);
    if (!traversal) return invalidComponent(curves, 'NON_ORDERABLE_COMPONENT');
    return { component: deepFreeze({
      classification: SketchPathComponentClassification.CLOSED_CONTOUR,
      componentKey: componentKey(curves),
      curves: deepFreeze(traversal.curves),
      startPointId: null,
      endPointId: null
    }), diagnostic: null };
  }

  return invalidComponent(curves, 'INVALID_COMPONENT_DEGREE', degreeOne);
}

export function deriveSketchPathGraph(sketch) {
  const derived = deriveSketchCurves(sketch);
  const diagnostics = [...derived.diagnostics];
  const components = [];
  const circles = derived.curves.filter(curve => curve.closed && curve.startPointId == null && curve.endPointId == null);
  const endpointCurves = derived.curves.filter(curve => !curve.closed && curve.startPointId && curve.endPointId);

  for (const circle of circles.sort((a, b) => curveKey(a).localeCompare(curveKey(b)))) {
    components.push(deepFreeze({
      classification: SketchPathComponentClassification.CLOSED_CONTOUR,
      componentKey: curveKey(circle),
      curves: deepFreeze([circle]),
      startPointId: null,
      endPointId: null
    }));
  }

  const graph = buildEndpointGraph(endpointCurves);
  const unvisited = new Set(sorted(graph.byKey.keys()));
  while (unvisited.size) {
    const seedKey = sorted(unvisited)[0];
    const curves = collectComponent(seedKey, graph, unvisited);
    const result = deriveEndpointComponent(curves, graph);
    components.push(result.component);
    if (result.diagnostic) diagnostics.push(result.diagnostic);
  }

  components.sort((a, b) => a.componentKey.localeCompare(b.componentKey));
  diagnostics.sort((a, b) => `${a.componentKey ?? ''}:${a.code}`.localeCompare(`${b.componentKey ?? ''}:${b.code}`));
  return deepFreeze({ components, diagnostics });
}
