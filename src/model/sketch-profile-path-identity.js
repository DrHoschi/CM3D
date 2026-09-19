import { deriveSketchProfilesAndPaths } from './sketch-profile-path-derivation.js';
import { getSketchElement } from './sketch-topology.js';

const uuid = prefix => `${prefix}_${crypto.randomUUID()}`;
const sortedUnique = values => [...new Set(values)].sort((a, b) => a.localeCompare(b));
const sourceIds = sources => sortedUnique((sources ?? []).map(source => source?.elementId).filter(Boolean));
const sameIds = (a, b) => a.length === b.length && a.every((id, index) => id === b[index]);
const signature = ids => ids.join('|');

function canonicalHoleSets(holes) {
  return (holes ?? [])
    .map(hole => sourceIds(hole?.sourceElements))
    .sort((a, b) => signature(a).localeCompare(signature(b)));
}

function sameHoleSets(a, b) {
  return a.length === b.length && a.every((ids, index) => sameIds(ids, b[index]));
}

function allRequiredIds(identity, kind) {
  if (kind === 'PROFILE') {
    return sortedUnique([
      ...(identity?.source?.outerElementIds ?? []),
      ...(identity?.source?.holeElementIdSets ?? []).flat()
    ]);
  }
  return sortedUnique(identity?.source?.elementIds ?? []);
}

function currentSourceSets(derived, kind) {
  if (kind === 'PROFILE') {
    return (derived.profiles ?? []).map(profile => sortedUnique([
      ...sourceIds(profile.outerContour?.sourceElements),
      ...canonicalHoleSets(profile.holes).flat()
    ]));
  }
  return (derived.openPaths ?? []).map(path => sourceIds(path.curves));
}

function overlappingCandidates(derived, kind, requiredIds) {
  const required = new Set(requiredIds);
  return currentSourceSets(derived, kind)
    .filter(ids => ids.some(id => required.has(id)));
}

function result(state, target = null, code = null) {
  return Object.freeze({
    state,
    target,
    diagnostics: code ? Object.freeze([{ code }]) : Object.freeze([])
  });
}

export function createProfileIdentity(profile, profileId = uuid('profile')) {
  if (!profileId) throw new Error('ProfileIdentity requires profileId.');
  const outerElementIds = sourceIds(profile?.outerContour?.sourceElements);
  if (!outerElementIds.length) throw new Error('ProfileIdentity requires outer source elements.');
  return Object.freeze({
    profileId,
    source: Object.freeze({
      outerElementIds: Object.freeze(outerElementIds),
      holeElementIdSets: Object.freeze(canonicalHoleSets(profile?.holes).map(ids => Object.freeze(ids)))
    })
  });
}

export function createPathIdentity(path, pathId = uuid('path')) {
  if (!pathId) throw new Error('PathIdentity requires pathId.');
  const elementIds = sourceIds(path?.curves);
  if (!elementIds.length) throw new Error('PathIdentity requires source elements.');
  return Object.freeze({
    pathId,
    source: Object.freeze({ elementIds: Object.freeze(elementIds) })
  });
}

export function recognizeProfileIdentity(sketch, identity) {
  if (!sketch || !identity) return result('MISSING', null, 'PROFILE_IDENTITY_MISSING');
  const requiredIds = allRequiredIds(identity, 'PROFILE');
  if (requiredIds.some(id => !getSketchElement(sketch, id))) return result('MISSING', null, 'PROFILE_SOURCE_MISSING');

  const derived = deriveSketchProfilesAndPaths(sketch);
  const matches = (derived.profiles ?? []).filter(profile => {
    const outer = sourceIds(profile.outerContour?.sourceElements);
    const holes = canonicalHoleSets(profile.holes);
    return sameIds(outer, identity.source.outerElementIds)
      && sameHoleSets(holes, identity.source.holeElementIdSets);
  });
  if (matches.length === 1) {
    const profile = matches[0];
    if (profile.validationStatus !== 'VALID') return result('INVALID', profile, 'PROFILE_GEOMETRY_INVALID');
    return result('RESOLVED', profile);
  }
  if (matches.length > 1 || overlappingCandidates(derived, 'PROFILE', requiredIds).length > 1) {
    return result('UNRESOLVED', null, 'PROFILE_RECOGNITION_AMBIGUOUS');
  }
  return result('INVALID', null, 'PROFILE_TOPOLOGY_INVALID');
}

export function recognizePathIdentity(sketch, identity) {
  if (!sketch || !identity) return result('MISSING', null, 'PATH_IDENTITY_MISSING');
  const requiredIds = allRequiredIds(identity, 'PATH');
  if (requiredIds.some(id => !getSketchElement(sketch, id))) return result('MISSING', null, 'PATH_SOURCE_MISSING');

  const derived = deriveSketchProfilesAndPaths(sketch);
  const matches = (derived.openPaths ?? []).filter(path => sameIds(sourceIds(path.curves), identity.source.elementIds));
  if (matches.length === 1) return result('RESOLVED', matches[0]);
  if (matches.length > 1 || overlappingCandidates(derived, 'PATH', requiredIds).length > 1) {
    return result('UNRESOLVED', null, 'PATH_RECOGNITION_AMBIGUOUS');
  }
  return result('INVALID', null, 'PATH_TOPOLOGY_INVALID');
}
