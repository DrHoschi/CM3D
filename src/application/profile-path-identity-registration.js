import { deriveSketchProfilesAndPaths } from '../model/sketch-profile-path-derivation.js';
import { createProfileIdentity, createPathIdentity } from '../model/sketch-profile-path-identity.js';
import { installDomainTransactionBoundary } from './domain-transaction.js';

const sortedUnique = values => [...new Set(values)].sort((a, b) => a.localeCompare(b));
const profileSourceIds = profile => sortedUnique([
  ...(profile?.outerContour?.sourceElements ?? []).map(source => source?.elementId).filter(Boolean),
  ...(profile?.holes ?? []).flatMap(hole => (hole?.sourceElements ?? []).map(source => source?.elementId).filter(Boolean))
]);
const pathSourceIds = path => sortedUnique((path?.curves ?? []).map(source => source?.elementId).filter(Boolean));
const identitySourceIds = (identity, kind) => kind === 'PROFILE'
  ? sortedUnique([...(identity?.source?.outerElementIds ?? []), ...(identity?.source?.holeElementIdSets ?? []).flat()])
  : sortedUnique(identity?.source?.elementIds ?? []);
const overlaps = (a, b) => {
  const ids = new Set(a);
  return b.some(id => ids.has(id));
};

function registrationCandidates(sketch) {
  const derived = deriveSketchProfilesAndPaths(sketch);
  const existingProfileSources = Object.values(sketch.data?.profileIdentities ?? {}).map(identity => identitySourceIds(identity, 'PROFILE'));
  const existingPathSources = Object.values(sketch.data?.pathIdentities ?? {}).map(identity => identitySourceIds(identity, 'PATH'));

  const profiles = (derived.profiles ?? []).filter(profile => {
    if (profile.validationStatus !== 'VALID') return false;
    const source = profileSourceIds(profile);
    return source.length && !existingProfileSources.some(existing => overlaps(existing, source));
  });
  const paths = (derived.openPaths ?? []).filter(path => {
    const source = pathSourceIds(path);
    return source.length && !existingPathSources.some(existing => overlaps(existing, source));
  });
  return { profiles, paths };
}

export function reconcileProfilePathIdentities(store, sketchId, options = {}) {
  const sketch = store?.getObject?.(sketchId);
  if (sketch?.type !== 'sketch') return Object.freeze({ changed: false, profileIds: [], pathIds: [] });
  sketch.data.profileIdentities ??= {};
  sketch.data.pathIdentities ??= {};

  const candidates = registrationCandidates(sketch);
  if (!candidates.profiles.length && !candidates.paths.length) {
    return Object.freeze({ changed: false, profileIds: [], pathIds: [] });
  }

  installDomainTransactionBoundary(store);
  const created = { profileIds: [], pathIds: [] };
  store.runDomainTransaction('Profil-/Pfad-Identitäten registrieren', () => {
    const current = store.getObject(sketchId);
    const fresh = registrationCandidates(current);
    for (const profile of fresh.profiles) {
      const identity = createProfileIdentity(profile);
      current.data.profileIdentities[identity.profileId] = structuredClone(identity);
      created.profileIds.push(identity.profileId);
    }
    for (const path of fresh.paths) {
      const identity = createPathIdentity(path);
      current.data.pathIdentities[identity.pathId] = structuredClone(identity);
      created.pathIds.push(identity.pathId);
    }
    if (!created.profileIds.length && !created.pathIds.length) return false;
    store.touch?.();
    return true;
  });

  const changed = created.profileIds.length > 0 || created.pathIds.length > 0;
  if (changed && options.notify !== false) {
    store.emit?.('projectChanged', { profilePathIdentityRegistration: true, sketchId });
  }
  return Object.freeze({
    changed,
    profileIds: Object.freeze([...created.profileIds]),
    pathIds: Object.freeze([...created.pathIds])
  });
}

export function installProfilePathIdentityRegistrationLifecycle(store) {
  if (!store || typeof store.getObject !== 'function') throw new Error('ProfilePathIdentityRegistrationLifecycle requires a compatible store.');
  if (store.__cm3dProfilePathIdentityRegistrationLifecycleInstalled) return store.profilePathIdentityRegistrationLifecycle;

  const reconcileSketch = (sketchId, options) => reconcileProfilePathIdentities(store, sketchId, options);
  const reconcileAll = options => {
    const results = [];
    for (const object of Object.values(store.project?.scene?.objects ?? {})) {
      if (object?.type !== 'sketch') continue;
      const result = reconcileSketch(object.objectId, options);
      if (result.changed) results.push({ sketchId: object.objectId, ...result });
    }
    return results;
  };

  store.subscribe?.(event => {
    if (event.type === 'projectLoaded') reconcileAll();
    if (event.type === 'geometryChanged' && event.objectId) reconcileSketch(event.objectId);
  });

  const lifecycle = Object.freeze({
    version: 'WD-21G.1',
    identityPolicy: 'persistent-source-identity-no-silent-rebinding',
    reconcileSketch,
    reconcileAll
  });
  store.profilePathIdentityRegistrationLifecycle = lifecycle;
  Object.defineProperty(store, '__cm3dProfilePathIdentityRegistrationLifecycleInstalled', { value: true });
  return lifecycle;
}
