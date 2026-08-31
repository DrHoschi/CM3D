export const ReferenceTargetKind = Object.freeze({
  OBJECT: 'OBJECT',
  SKETCH: 'SKETCH',
  SKETCH_ELEMENT: 'SKETCH_ELEMENT',
  SKETCH_POINT: 'SKETCH_POINT',
  FEATURE: 'FEATURE'
});

export const ReferenceState = Object.freeze({
  RESOLVED: 'RESOLVED',
  UNRESOLVED: 'UNRESOLVED',
  MISSING: 'MISSING',
  INVALID: 'INVALID',
  BLOCKED: 'BLOCKED'
});

const targetKinds = new Set(Object.values(ReferenceTargetKind));
const states = new Set(Object.values(ReferenceState));

export function createStableReference(targetKind, ownerId, targetId, subTargetId = null) {
  if (!targetKinds.has(targetKind)) throw new Error(`Unsupported StableReference targetKind: ${targetKind}`);
  if (!ownerId || !targetId) throw new Error('StableReference requires ownerId and targetId.');
  const ref = { targetKind, ownerId, targetId };
  if (subTargetId != null) ref.subTargetId = subTargetId;
  return ref;
}

export function sameStableReference(a, b) {
  return !!a && !!b
    && a.targetKind === b.targetKind
    && a.ownerId === b.ownerId
    && a.targetId === b.targetId
    && (a.subTargetId ?? null) === (b.subTargetId ?? null);
}

export function createReferenceResolution(reference, state = ReferenceState.UNRESOLVED, diagnostics = []) {
  if (!reference) throw new Error('ReferenceResolution requires a reference.');
  if (!states.has(state)) throw new Error(`Unsupported ReferenceState: ${state}`);
  return {
    reference: { ...reference },
    state,
    diagnostics: Array.isArray(diagnostics)
      ? diagnostics.map(item => ({ code: item?.code ?? 'REFERENCE', message: item?.message ?? String(item) }))
      : []
  };
}

export function resolveStableReference(store, reference) {
  const unresolved = () => createReferenceResolution(reference, ReferenceState.UNRESOLVED);
  if (!store || !reference || !targetKinds.has(reference.targetKind)) return unresolved();

  const owner = store.getObject?.(reference.ownerId) ?? null;
  if (!owner) {
    return createReferenceResolution(reference, ReferenceState.MISSING, [
      { code: 'OWNER_MISSING', message: `Referenz-Eigentümer fehlt: ${reference.ownerId}` }
    ]);
  }

  if (reference.targetKind === ReferenceTargetKind.OBJECT || reference.targetKind === ReferenceTargetKind.SKETCH || reference.targetKind === ReferenceTargetKind.FEATURE) {
    const target = store.getObject?.(reference.targetId) ?? null;
    if (!target) {
      return createReferenceResolution(reference, ReferenceState.MISSING, [
        { code: 'TARGET_MISSING', message: `Referenzziel fehlt: ${reference.targetId}` }
      ]);
    }
    if (reference.targetKind === ReferenceTargetKind.SKETCH && target.type !== 'sketch') {
      return createReferenceResolution(reference, ReferenceState.INVALID, [
        { code: 'TARGET_KIND_MISMATCH', message: `Referenzziel ${reference.targetId} ist keine Skizze.` }
      ]);
    }
    return createReferenceResolution(reference, ReferenceState.RESOLVED);
  }

  if (owner.type !== 'sketch') {
    return createReferenceResolution(reference, ReferenceState.INVALID, [
      { code: 'OWNER_KIND_MISMATCH', message: `Referenz-Eigentümer ${reference.ownerId} ist keine Skizze.` }
    ]);
  }

  const map = reference.targetKind === ReferenceTargetKind.SKETCH_POINT
    ? owner.data?.points
    : owner.data?.lines;
  if (!map?.[reference.targetId]) {
    return createReferenceResolution(reference, ReferenceState.MISSING, [
      { code: 'SUBTARGET_MISSING', message: `Referenzziel fehlt: ${reference.targetId}` }
    ]);
  }
  return createReferenceResolution(reference, ReferenceState.RESOLVED);
}

export function blockReferenceResolution(resolution, code = 'DEPENDENCY_BLOCKED', message = 'Referenz ist durch eine vorgelagerte Abhängigkeit blockiert.') {
  if (!resolution?.reference) throw new Error('blockReferenceResolution requires a resolution.');
  return createReferenceResolution(resolution.reference, ReferenceState.BLOCKED, [
    ...(resolution.diagnostics ?? []),
    { code, message }
  ]);
}
