import { ReferenceTargetKind, createStableReference } from './stable-reference.js';

export const FeatureConsumerBindingTargetKind = Object.freeze({
  PROFILE: ReferenceTargetKind.PROFILE,
  PATH: ReferenceTargetKind.PATH
});

const supportedKinds = new Set(Object.values(FeatureConsumerBindingTargetKind));

export function createFeatureConsumerBinding(targetKind, ownerId, targetId) {
  if (!supportedKinds.has(targetKind)) {
    throw new Error(`FeatureConsumerBinding requires PROFILE or PATH targetKind: ${targetKind}`);
  }
  return createStableReference(targetKind, ownerId, targetId);
}

export function isFeatureConsumerBinding(reference) {
  return !!reference
    && supportedKinds.has(reference.targetKind)
    && typeof reference.ownerId === 'string'
    && reference.ownerId.length > 0
    && typeof reference.targetId === 'string'
    && reference.targetId.length > 0;
}

export function validateFeatureConsumerBinding(reference, label = 'FeatureConsumerBinding') {
  const errors = [];
  if (!reference || typeof reference !== 'object' || Array.isArray(reference)) {
    return { valid:false, errors:[`${label} fehlt oder ist ungültig.`] };
  }
  if (!supportedKinds.has(reference.targetKind)) {
    errors.push(`${label}.targetKind muss PROFILE oder PATH sein.`);
  }
  if (typeof reference.ownerId !== 'string' || !reference.ownerId) {
    errors.push(`${label}.ownerId fehlt.`);
  }
  if (typeof reference.targetId !== 'string' || !reference.targetId) {
    errors.push(`${label}.targetId fehlt.`);
  }
  if (reference.subTargetId != null) {
    errors.push(`${label}.subTargetId ist für PROFILE/PATH Consumer nicht zulässig.`);
  }
  return { valid:errors.length === 0, errors };
}

export function declaredFeatureConsumerDependencies(store) {
  const dependencies = [];
  for (const object of Object.values(store?.project?.scene?.objects ?? {})) {
    const sourceRef = object?.data?.sourceRef;
    if (!sourceRef) continue;
    if (!isFeatureConsumerBinding(sourceRef)) continue;
    dependencies.push({
      dependentObjectId: object.objectId,
      reference: { ...sourceRef },
      kind: sourceRef.targetKind === ReferenceTargetKind.PROFILE
        ? 'PROFILE_CONSUMER'
        : 'PATH_CONSUMER'
    });
  }
  return dependencies.sort((a, b) => a.dependentObjectId.localeCompare(b.dependentObjectId));
}
