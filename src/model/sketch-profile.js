const EPSILON = 1e-10;

export function deriveClosedSketchProfiles(sketch) {
  if (sketch?.type !== 'sketch') {
    return { profiles: [], diagnostics: [{ code: 'NOT_SKETCH', message: 'Auswahl ist keine Skizze.' }] };
  }

  const points = sketch.data?.points ?? {};
  const lines = sketch.data?.lines ?? {};
  const adjacency = new Map();
  const diagnostics = [];

  for (const pointId of Object.keys(points)) adjacency.set(pointId, []);

  for (const line of Object.values(lines)) {
    const a = points[line.startPointId];
    const b = points[line.endPointId];
    if (!a || !b) {
      diagnostics.push({ code: 'MISSING_POINT', lineId: line.lineId, message: `Linie ${line.lineId} referenziert einen fehlenden Punkt.` });
      continue;
    }
    if (line.startPointId === line.endPointId || samePoint(a, b)) {
      diagnostics.push({ code: 'ZERO_LENGTH_LINE', lineId: line.lineId, message: `Linie ${line.lineId} hat keine verwertbare Länge.` });
      continue;
    }
    adjacency.get(line.startPointId)?.push({ lineId: line.lineId, otherId: line.endPointId });
    adjacency.get(line.endPointId)?.push({ lineId: line.lineId, otherId: line.startPointId });
  }

  const validLineIds = new Set(Object.values(lines)
    .filter(line => adjacency.get(line.startPointId)?.some(edge => edge.lineId === line.lineId))
    .map(line => line.lineId));
  const unvisited = new Set(validLineIds);
  const profiles = [];

  while (unvisited.size) {
    const seedLineId = [...unvisited].sort()[0];
    const componentLineIds = collectLineComponent(seedLineId, lines, adjacency);
    componentLineIds.forEach(id => unvisited.delete(id));

    const componentPointIds = new Set();
    for (const lineId of componentLineIds) {
      const line = lines[lineId];
      componentPointIds.add(line.startPointId);
      componentPointIds.add(line.endPointId);
    }

    const badDegree = [...componentPointIds].filter(pointId => (adjacency.get(pointId)?.filter(edge => componentLineIds.has(edge.lineId)).length ?? 0) !== 2);
    if (badDegree.length) {
      diagnostics.push({
        code: 'OPEN_OR_BRANCHING_COMPONENT',
        lineIds: [...componentLineIds].sort(),
        pointIds: badDegree.sort(),
        message: 'Kontur ist offen oder verzweigt; jeder Profilpunkt muss genau zwei Konturlinien besitzen.'
      });
      continue;
    }

    if (componentPointIds.size < 3 || componentLineIds.size < 3) {
      diagnostics.push({ code: 'TOO_FEW_EDGES', lineIds: [...componentLineIds].sort(), message: 'Eine geschlossene Kontur benötigt mindestens drei Kanten.' });
      continue;
    }

    const ordered = orderLoop(componentLineIds, lines, adjacency);
    if (!ordered || ordered.lineIds.length !== componentLineIds.size) {
      diagnostics.push({ code: 'NON_SIMPLE_LOOP', lineIds: [...componentLineIds].sort(), message: 'Kontur konnte nicht als eindeutiger geschlossener Linienzug geordnet werden.' });
      continue;
    }

    const orderedPoints = ordered.pointIds.map(pointId => ({ pointId, x: points[pointId].x, y: points[pointId].y }));
    const area = signedArea(orderedPoints);
    if (Math.abs(area) <= EPSILON) {
      diagnostics.push({ code: 'ZERO_AREA', lineIds: ordered.lineIds, message: 'Geschlossene Kontur besitzt keine Fläche.' });
      continue;
    }

    if (hasSelfIntersection(orderedPoints)) {
      diagnostics.push({ code: 'SELF_INTERSECTION', lineIds: ordered.lineIds, message: 'Selbstschneidende Konturen sind für WD-09A nicht extrudierbar.' });
      continue;
    }

    profiles.push({
      signature: [...componentLineIds].sort().join('|'),
      pointIds: ordered.pointIds,
      lineIds: ordered.lineIds,
      points: orderedPoints.map(({ x, y }) => ({ x, y })),
      signedArea: area,
      winding: area > 0 ? 'CCW' : 'CW'
    });
  }

  profiles.sort((a, b) => a.signature.localeCompare(b.signature));
  return { profiles, diagnostics };
}

export function getSingleExtrudableProfile(sketch) {
  const result = deriveClosedSketchProfiles(sketch);
  if (result.profiles.length === 1 && result.diagnostics.length === 0) {
    return { valid: true, profile: result.profiles[0], diagnostics: [] };
  }
  const diagnostics = [...result.diagnostics];
  if (result.profiles.length === 0 && diagnostics.length === 0) diagnostics.push({ code: 'NO_CLOSED_PROFILE', message: 'Keine geschlossene Kontur gefunden.' });
  if (result.profiles.length > 1) diagnostics.push({ code: 'MULTIPLE_PROFILES', count: result.profiles.length, message: 'WD-09A akzeptiert zunächst genau eine geschlossene Kontur pro Extrusion.' });
  return { valid: false, profile: null, diagnostics };
}

function collectLineComponent(seedLineId, lines, adjacency) {
  const found = new Set();
  const queue = [seedLineId];
  while (queue.length) {
    const lineId = queue.shift();
    if (found.has(lineId)) continue;
    const line = lines[lineId];
    if (!line) continue;
    found.add(lineId);
    for (const pointId of [line.startPointId, line.endPointId]) {
      for (const edge of adjacency.get(pointId) ?? []) if (!found.has(edge.lineId)) queue.push(edge.lineId);
    }
  }
  return found;
}

function orderLoop(componentLineIds, lines, adjacency) {
  const firstLineId = [...componentLineIds].sort()[0];
  const firstLine = lines[firstLineId];
  if (!firstLine) return null;
  const startPointId = [firstLine.startPointId, firstLine.endPointId].sort()[0];
  const pointIds = [startPointId];
  const lineIds = [];
  const used = new Set();
  let currentPointId = startPointId;
  let previousLineId = null;

  for (let guard = 0; guard <= componentLineIds.size; guard++) {
    const choices = (adjacency.get(currentPointId) ?? [])
      .filter(edge => componentLineIds.has(edge.lineId) && edge.lineId !== previousLineId)
      .sort((a, b) => a.lineId.localeCompare(b.lineId));
    const next = choices.find(edge => !used.has(edge.lineId)) ?? choices[0];
    if (!next || used.has(next.lineId)) return currentPointId === startPointId && used.size === componentLineIds.size ? { pointIds, lineIds } : null;
    used.add(next.lineId);
    lineIds.push(next.lineId);
    currentPointId = next.otherId;
    previousLineId = next.lineId;
    if (currentPointId === startPointId) return used.size === componentLineIds.size ? { pointIds, lineIds } : null;
    pointIds.push(currentPointId);
  }
  return null;
}

function signedArea(points) {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return sum / 2;
}

function hasSelfIntersection(points) {
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const a1 = points[i], a2 = points[(i + 1) % n];
    for (let j = i + 1; j < n; j++) {
      if (j === i || j === (i + 1) % n || (i === 0 && j === n - 1)) continue;
      const b1 = points[j], b2 = points[(j + 1) % n];
      if (segmentsIntersect(a1, a2, b1, b2)) return true;
    }
  }
  return false;
}

function segmentsIntersect(a, b, c, d) {
  const o1 = orientation(a, b, c), o2 = orientation(a, b, d), o3 = orientation(c, d, a), o4 = orientation(c, d, b);
  return o1 * o2 < -EPSILON && o3 * o4 < -EPSILON;
}

function orientation(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function samePoint(a, b) {
  return Math.abs(a.x - b.x) <= EPSILON && Math.abs(a.y - b.y) <= EPSILON;
}
