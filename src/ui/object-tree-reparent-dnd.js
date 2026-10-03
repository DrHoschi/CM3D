const CONTAINER_TYPES = new Set(['group', 'assembly']);

export function installObjectTreeReparentDnD(store, ui) {
  let draggedObjectId = null;
  const baseTreeNode = ui.treeNode.bind(ui);
  const baseRenderTree = ui.renderTree.bind(ui);

  const canDrop = (sourceId, parentId) => {
    if (!sourceId || !store.getObject(sourceId)) return false;
    if (parentId !== null) {
      const parent = store.getObject(parentId);
      if (!parent || !CONTAINER_TYPES.has(parent.type)) return false;
    }
    return store.canReparent(sourceId, parentId);
  };

  const clearDrag = () => { draggedObjectId = null; };

  ui.treeNode = function objectTreeReparentDnDTreeNode(object, depth = 0) {
    const row = baseTreeNode(object, depth);
    if (!row?.classList?.contains('tree-item') || !object?.objectId) return row;

    row.draggable = true;
    row.addEventListener('dragstart', event => {
      draggedObjectId = object.objectId;
      event.dataTransfer?.setData('text/plain', object.objectId);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
    });
    row.addEventListener('dragend', clearDrag);

    if (CONTAINER_TYPES.has(object.type)) {
      row.addEventListener('dragover', event => {
        if (!canDrop(draggedObjectId, object.objectId)) return;
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
      });
      row.addEventListener('drop', event => {
        if (!canDrop(draggedObjectId, object.objectId)) return;
        event.preventDefault();
        event.stopPropagation();
        store.reparent(draggedObjectId, object.objectId);
        clearDrag();
      });
    }
    return row;
  };

  ui.renderTree = function objectTreeReparentDnDRenderTree(...args) {
    const result = baseRenderTree(...args);
    const root = ui.tree;
    if (root && !root.dataset.reparentDnDRootInstalled) {
      root.dataset.reparentDnDRootInstalled = 'true';
      root.addEventListener('dragover', event => {
        if (event.target?.closest?.('.tree-item')) return;
        if (!canDrop(draggedObjectId, null)) return;
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
      });
      root.addEventListener('drop', event => {
        if (event.target?.closest?.('.tree-item')) return;
        if (!canDrop(draggedObjectId, null)) return;
        event.preventDefault();
        store.reparent(draggedObjectId, null);
        clearDrag();
      });
    }
    return result;
  };

  return { canDrop };
}
