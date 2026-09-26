import { deriveSketchProfileRegions } from './sketch-profile-region-derivation.js';

const EPSILON = 1e-9;

export const SketchGeometryValidity = Object.freeze({
  VALID: 'VALID',
  INVALID: 'INVALID',
  AMBIGUOUS: 'AMBIGUOUS',
  UNRESOLVED: 'UNRESOLVED'
});

const severity = Object.freeze({
  [SketchGeometryValidity.VALID]: 0,
  [SketchGeometryValidity.UNRESOLVED]: 1,
  [SketchGeometryValidity.AMBIGUOUS]: 2,
  [SketchGeometryValidity.INVALID]: 3
});

const deepFreeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
};

const clone = value => structuredClone(value);
const finitePoint = point => point && Number.isFinite(Number(point.x)) && Number.isFinite(Number(point.y));
const distanceSquared = (a, b) => (Number(a.x) - Number(b.x)) ** 2 + (Number(a.y) - Number(b.y)) ** 2;
const samePoint = (a, b) => distanceSquared(a, b) <= EPSILON ** 2;
const orientation = (a, b, c) => (Number(b.x) - Number(a.x)) * (Number(c.y) - Number(a.y)) - (Number(b.y) - Number(a.y)) * (Number(c.x) - Number(a.x));

function pointOnSegment(point, a, b) {
  if (Math.abs(orientation(a, b, point)) > EPSILON) return false;
  return Number(point.x) >= Math.min(Number(a.x), Number(b.x)) - EPSILON
    && Number(point.x) <= Math.max(Number(a.x), Number(b.x)) + EPSILON
    && Number(point.y) >= Math.min(Number(a.y), Number(b.y)) - EPSILON
    && Number(point.y) <= Math.max(Number(a.y), Number(b.y)) + EPSILON;
}

function collinearOverlapLength(a, b, c, d) {
  const useX = Math.abs(Number(b.x) - Number(a.x)) >= Math.abs(Number(b.y) - Number(a.y));
  const values = useX
    ? [Number(a.x), Number(b.x), Number(c.x), Number(d.x)]
    : [Number(a.y), Number(b.y), Number(c.y), Number(d.y)];
  const left = Math.max(Math.min(values[0], values[1]), Math.min(values[2], values[3]));
  const right = Math.min(Math.max(values[0], values[1]), Math.max(values[2], values[3]));
  return right - left;
}

function segmentRelation(first, second) {
  const { a, b } = first;
  const { a: c, b: d } = second;
  const o1 = orientation(a, b, c);
  const o2 = orientation(a, b, d);
  const o3 = orientation(c, d, a);
  const o4 = orientation(c, d, b);

  const properCross = ((o1 > EPSILON && o2 < -EPSILON) || (o1 < -EPSILON && o2 > EPSILON))
    && ((o3 > EPSILON && o4 < -EPSILON) || (o3 < -EPSILON && o4 > EPSILON));
  if (properCross) return 'CROSS';

  const collinear = Math.abs(o1) <= EPSILON && Math.abs(o2) <= EPSILON && Math.abs(o3) <= EPSILON && Math.abs(o4) <= EPSILON;
  if (collinear) {
    const overlap = collinearOverlapLength(a, b, c, d);
    if (overlap > EPSILON) return 'OVERLAP';
    if (overlap >= -EPSILON && (pointOnSegment(a, c, d) || pointOnSegment(b, c, d) || pointOnSegment(c, a, b) || pointOnSegment(d, a, b))) return 'TOUCH';
    return 'NONE';
  }

  if ((Math.abs(o1) <= EPSILON && pointOnSegment(c, a, b))
    || (Math.abs(o2) <= EPSILON && pointOnSegment(d, a, b))
    || (Math.abs(o3) <= EPSILON && pointOnSegment(a, c, d))
    || (Math.abs(o4) <= EPSILON && pointOnSegment(b, c, d))) return 'TOUCH';

  return 'NONE';
}

function sourceRef(curve) {
  return { kind: curve.kind, elementId: curve.elementId };
}

function sourceKey(source) {
  return `${source.kind}:${source.elementId}`;
}

function orderedSources(...sources) {
  const unique = new Map();
  for (const source of sources.flat().filter(Boolean)) unique.set(sourceKey(source), { kind: source.kind, elementId: source.elementId });
  return [...unique.values()].sort((a, b) => sourceKey(a).localeCompare(sourceKey(b)));
}

function contourSegments(contour) {
  const segments = [];
  for (let curveIndex = 0; curveIndex < (contour.curves ?? []).length; curveIndex += 1) {
    const curve = contour.curves[curveIndex];
    const samples = Array.isArray(curve.tessellation) ? curve.tessellation : [];
    for (let sampleIndex = 0; sampleIndex + 1 < samples.length; sampleIndex += 1) {
      const a = samples[sampleIndex];
      const b = samples[sampleIndex + 1];
      if (!finitePoint(a) || !finitePoint(b) || samePoint(a, b)) continue;
      segments.push({
        segmentIndex: segments.length,
        curveIndex,
        sampleIndex,
        source: sourceRef(curve),
        a: { x: Number(a.x), y: Number(a.y) },
        b: { x: Number(b.x), y: Number(b.y) }
      });
    }
  }
  return segments;
}

function curvePathLengthSquared(curve) {
  const samples = Array.isArray(curve.tessellation) ? curve.tessellation : [];
  let total = 0;
  for (let index = 0; index + 1 < samples.length; index += 1) {
    if (!finitePoint(samples[index]) || !finitePoint(samples[index + 1])) return NaN;
    total += distanceSquared(samples[index], samples[index + 1]);
  }
  return total;
}

function areAdjacentSegments(firstIndex, secondIndex, count) {
  if (Math.abs(firstIndex - secondIndex) === 1) return true;
  return count > 1 && ((firstIndex === 0 && secondIndex === count - 1) || (secondIndex === 0 && firstIndex === count - 1));
}

function expectedSharedEndpoint(first, second) {
  return samePoint(first.b, second.a) || samePoint(first.a, second.b) || samePoint(first.a, second.a) || samePoint(first.b, second.b);
}

function mergeStatus(current, next) {
  return severity[next] > severity[current] ? next : current;
}

function diagnosticKey(diagnostic) {
  const sources = (diagnostic.sources ?? []).map(sourceKey).join('|');
  return [
    diagnostic.componentKey ?? '',
    diagnostic.otherComponentKey ?? '',
    diagnostic.profileKey ?? '',
    diagnostic.code ?? '',
    diagnostic.relation ?? '',
    sources
  ].join(':');
}

function collectContours(d3) {
  const byKey = new Map();
  const add = contour => {
    if (contour?.componentKey && !byKey.has(contour.componentKey)) byKey.set(contour.componentKey, contour);
  };
  for (const region of d3.profileRegions ?? []) {
    add(region.outerContour);
    for (const hole of region.holes ?? []) add(hole);
  }
  for (const contour of d3.unclassifiedContours ?? []) add(contour);
  return [...byKey.values()].sort((a, b) => a.componentKey.localeCompare(b.componentKey));
}

function validateContour(contour, diagnostics) {
  let status = SketchGeometryValidity.VALID;
  const segments = contourSegments(contour);

  if (!Array.isArray(contour.points) || contour.points.length < 3 || !Number.isFinite(Number(contour.signedArea)) || Math.abs(Number(contour.signedArea)) <= EPSILON) {
    diagnostics.push({ code: 'D4_ZERO_AREA_OR_DEGENERATE_CONTOUR', componentKey: contour.componentKey, sources: orderedSources(contour.sourceElements ?? []) });
    status = SketchGeometryValidity.INVALID;
  }

  for (const curve of contour.curves ?? []) {
    const lengthSquared = curvePathLengthSquared(curve);
    if (!Number.isFinite(lengthSquared) || lengthSquared <= EPSILON ** 2) {
      diagnostics.push({ code: 'D4_DEGENERATE_CURVE', componentKey: contour.componentKey, sources: orderedSources(sourceRef(curve)) });
      status = SketchGeometryValidity.INVALID;
    }
  }

  for (let firstIndex = 0; firstIndex < segments.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < segments.length; secondIndex += 1) {
      const first = segments[firstIndex];
      const second = segments[secondIndex];
      const relation = segmentRelation(first, second);
      if (relation === 'NONE') continue;
      if (areAdjacentSegments(firstIndex, secondIndex, segments.length) && relation === 'TOUCH' && expectedSharedEndpoint(first, second)) continue;
      diagnostics.push({
        code: 'D4_SELF_INTERSECTION',
        componentKey: contour.componentKey,
        relation,
        sources: orderedSources(first.source, second.source)
      });
      status = SketchGeometryValidity.INVALID;
    }
  }

  return { status, segments };
}

function validateContourPair(firstContour, secondContour, firstSegments, secondSegments, diagnostics) {
  let firstStatus = SketchGeometryValidity.VALID;
  let secondStatus = SketchGeometryValidity.VALID;
  const findings = new Set();

  for (const first of firstSegments) {
    for (const second of secondSegments) {
      const relation = segmentRelation(first, second);
      if (relation === 'NONE') continue;
      const key = `${relation}:${sourceKey(first.source)}:${sourceKey(second.source)}`;
      if (findings.has(key)) continue;
      findings.add(key);
      const status = relation === 'TOUCH' ? SketchGeometryValidity.AMBIGUOUS : SketchGeometryValidity.INVALID;
      const code = relation === 'TOUCH' ? 'D4_INTER_CONTOUR_BOUNDARY_CONTACT' : 'D4_INTER_CONTOUR_INTERSECTION';
      diagnostics.push({
        code,
        componentKey: firstContour.componentKey,
        otherComponentKey: secondContour.componentKey,
        relation,
        sources: orderedSources(first.source, second.source)
      });
      firstStatus = mergeStatus(firstStatus, status);
      secondStatus = mergeStatus(secondStatus, status);
    }
  }

  return { firstStatus, secondStatus };
}

function mapUpstreamStatus(diagnostic) {
  if (diagnostic?.code === 'D3_UNCLASSIFIED_GEOMETRY') return SketchGeometryValidity.UNRESOLVED;
  if (diagnostic?.code === 'AMBIGUOUS_BOUNDARY_CONTACT') return SketchGeometryValidity.AMBIGUOUS;
  if (diagnostic?.code === 'INVALID_CURVE_GEOMETRY' || diagnostic?.code === 'MISSING_TOPOLOGY_POINT') return SketchGeometryValidity.UNRESOLVED;
  return null;
}

export function validateSketchProfileGeometry(sketch) {
  const d3 = deriveSketchProfileRegions(sketch);
  const diagnostics = [];
  const contours = collectContours(d3);
  const validationByKey = new Map();

  for (const contour of contours) {
    const result = validateContour(contour, diagnostics);
    validationByKey.set(contour.componentKey, {
      componentKey: contour.componentKey,
      status: result.status,
      sourceElements: orderedSources(contour.sourceElements ?? []),
      segments: result.segments
    });
  }

  for (let firstIndex = 0; firstIndex < contours.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < contours.length; secondIndex += 1) {
      const firstContour = contours[firstIndex];
      const secondContour = contours[secondIndex];
      const firstValidation = validationByKey.get(firstContour.componentKey);
      const secondValidation = validationByKey.get(secondContour.componentKey);
      const pair = validateContourPair(firstContour, secondContour, firstValidation.segments, secondValidation.segments, diagnostics);
      firstValidation.status = mergeStatus(firstValidation.status, pair.firstStatus);
      secondValidation.status = mergeStatus(secondValidation.status, pair.secondStatus);
    }
  }

  let upstreamStatus = SketchGeometryValidity.VALID;
  for (const diagnostic of d3.diagnostics ?? []) {
    const mappedStatus = mapUpstreamStatus(diagnostic);
    if (!mappedStatus) continue;
    upstreamStatus = mergeStatus(upstreamStatus, mappedStatus);
    if (diagnostic.componentKey && validationByKey.has(diagnostic.componentKey)) {
      const validation = validationByKey.get(diagnostic.componentKey);
      validation.status = mergeStatus(validation.status, mappedStatus);
    }
    if (diagnostic.candidateParentComponentKey && validationByKey.has(diagnostic.candidateParentComponentKey)) {
      const validation = validationByKey.get(diagnostic.candidateParentComponentKey);
      validation.status = mergeStatus(validation.status, mappedStatus);
    }
  }

  const contourValidations = [...validationByKey.values()]
    .map(({ segments, ...validation }) => validation)
    .sort((a, b) => a.componentKey.localeCompare(b.componentKey));

  const profileRegionValidations = (d3.profileRegions ?? []).map(region => {
    let status = validationByKey.get(region.outerContour.componentKey)?.status ?? SketchGeometryValidity.UNRESOLVED;
    for (const hole of region.holes ?? []) status = mergeStatus(status, validationByKey.get(hole.componentKey)?.status ?? SketchGeometryValidity.UNRESOLVED);
    return {
      profileKey: region.profileKey,
      status,
      outerComponentKey: region.outerContour.componentKey,
      holeComponentKeys: (region.holes ?? []).map(hole => hole.componentKey).sort()
    };
  }).sort((a, b) => a.profileKey.localeCompare(b.profileKey));

  diagnostics.sort((a, b) => diagnosticKey(a).localeCompare(diagnosticKey(b)));

  let status = upstreamStatus;
  for (const contour of contourValidations) status = mergeStatus(status, contour.status);
  if (!contourValidations.length && (d3.diagnostics ?? []).length) status = mergeStatus(status, SketchGeometryValidity.UNRESOLVED);

  return deepFreeze({
    status,
    contourValidations: clone(contourValidations),
    profileRegionValidations: clone(profileRegionValidations),
    diagnostics: clone(diagnostics),
    upstreamDiagnostics: clone(d3.diagnostics ?? [])
  });
}
