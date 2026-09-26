import { deriveSketchPathGraph, SketchPathComponentClassification } from './sketch-path-graph-derivation.js';
import { deriveSketchProfileRegions } from './sketch-profile-region-derivation.js';
import { validateSketchProfileGeometry, SketchGeometryValidity } from './sketch-geometry-validation.js';

const deepFreeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
};

const clone = value => structuredClone(value);
const sourceKey = source => `${source?.kind ?? ''}:${source?.elementId ?? ''}`;

function diagnosticKey(diagnostic) {
  const sources = (diagnostic?.sources ?? [])
    .map(sourceKey)
    .sort()
    .join('|');
  return [
    diagnostic?.componentKey ?? '',
    diagnostic?.otherComponentKey ?? '',
    diagnostic?.candidateParentComponentKey ?? '',
    diagnostic?.profileKey ?? '',
    diagnostic?.code ?? '',
    diagnostic?.reason ?? '',
    diagnostic?.relation ?? '',
    sources
  ].join(':');
}

function aggregateDiagnostics(d3, d4) {
  const diagnostics = [
    ...(d3.diagnostics ?? []).map(clone),
    ...(d4.diagnostics ?? []).map(clone)
  ];
  diagnostics.sort((a, b) => diagnosticKey(a).localeCompare(diagnosticKey(b)));
  return diagnostics;
}

function deriveProfiles(d3, d4) {
  const validationByProfileKey = new Map(
    (d4.profileRegionValidations ?? []).map(validation => [validation.profileKey, validation.status])
  );
  return (d3.profileRegions ?? [])
    .map(region => ({
      ...clone(region),
      validationStatus: validationByProfileKey.get(region.profileKey) ?? SketchGeometryValidity.UNRESOLVED
    }))
    .sort((a, b) => a.profileKey.localeCompare(b.profileKey));
}

export function deriveSketchProfilesAndPaths(sketch) {
  const d2 = deriveSketchPathGraph(sketch);
  const d3 = deriveSketchProfileRegions(sketch);
  const d4 = validateSketchProfileGeometry(sketch);

  const openPaths = (d2.components ?? [])
    .filter(component => component.classification === SketchPathComponentClassification.OPEN_PATH)
    .map(clone)
    .sort((a, b) => a.componentKey.localeCompare(b.componentKey));

  const invalidComponents = (d2.components ?? [])
    .filter(component => component.classification === SketchPathComponentClassification.INVALID_COMPONENT)
    .map(clone)
    .sort((a, b) => a.componentKey.localeCompare(b.componentKey));

  return deepFreeze({
    status: d4.status,
    profiles: deriveProfiles(d3, d4),
    openPaths,
    invalidComponents,
    unclassifiedContours: (d3.unclassifiedContours ?? []).map(clone),
    diagnostics: aggregateDiagnostics(d3, d4)
  });
}
