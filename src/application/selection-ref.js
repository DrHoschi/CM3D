export const SelectionTargetKind = Object.freeze({
  OBJECT: 'OBJECT',
  SKETCH: 'SKETCH',
  SKETCH_ELEMENT: 'SKETCH_ELEMENT',
  SKETCH_POINT: 'SKETCH_POINT'
});

export function createSelectionRef(targetKind, ownerId, targetId, subTargetId = null) {
  if (!Object.values(SelectionTargetKind).includes(targetKind)) throw new Error(`Unsupported SelectionRef targetKind: ${targetKind}`);
  if (!ownerId || !targetId) throw new Error('SelectionRef requires ownerId and targetId.');
  const ref = { targetKind, ownerId, targetId };
  if (subTargetId != null) ref.subTargetId = subTargetId;
  return ref;
}

export function sameSelectionRef(a, b) {
  return !!a && !!b
    && a.targetKind === b.targetKind
    && a.ownerId === b.ownerId
    && a.targetId === b.targetId
    && (a.subTargetId ?? null) === (b.subTargetId ?? null);
}

export function selectionRefsFromLegacy(store) {
  const sketchElements = Array.isArray(store.selection?.sketchElements) && store.selection.sketchElements.length
    ? store.selection.sketchElements
    : store.selection?.sketchElement
      ? [store.selection.sketchElement]
      : [];

  if (sketchElements.length) {
    return sketchElements.map(item => createSelectionRef(
      item.kind === 'point' ? SelectionTargetKind.SKETCH_POINT : SelectionTargetKind.SKETCH_ELEMENT,
      item.sketchId,
      item.elementId
    ));
  }

  return (store.selection?.selectedObjectIds ?? []).map(objectId => {
    const targetKind = store.getObject?.(objectId)?.type === 'sketch'
      ? SelectionTargetKind.SKETCH
      : SelectionTargetKind.OBJECT;
    return createSelectionRef(targetKind, objectId, objectId);
  });
}

export function installSelectionRefFoundation(store) {
  const sync = () => {
    const refs = selectionRefsFromLegacy(store);
    store.selection.refs = refs;
    store.selection.primaryRef = refs.at(-1) ?? null;
    return refs;
  };

  store.getSelectionRefs = () => store.selection.refs.map(ref => ({ ...ref }));
  store.getPrimarySelectionRef = () => store.selection.primaryRef ? { ...store.selection.primaryRef } : null;

  store.selectRef = (ref, notify = true, additive = false) => {
    if (!ref || !Object.values(SelectionTargetKind).includes(ref.targetKind)) return false;

    let result = false;
    if (ref.targetKind === SelectionTargetKind.OBJECT || ref.targetKind === SelectionTargetKind.SKETCH) {
      if (!store.getObject?.(ref.targetId)) return false;
      store.select(ref.targetId, notify, additive);
      result = true;
    } else {
      const kind = ref.targetKind === SelectionTargetKind.SKETCH_POINT ? 'point' : 'line';
      if (additive && store.setSketchMultiSelectEnabled) store.setSketchMultiSelectEnabled(true, false);
      result = store.selectSketchElement?.(ref.ownerId, kind, ref.targetId, notify) === true;
    }

    sync();
    return result;
  };

  store.clearSelectionRefs = (notify = true) => {
    store.clearSelection(notify);
    sync();
  };

  const unsubscribe = store.subscribe(event => {
    if (['selectionChanged', 'projectChanged', 'projectLoaded'].includes(event.type)) sync();
  });

  sync();
  return { sync, unsubscribe };
}
