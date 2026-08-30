const CONTAINER_TYPES = new Set(['group', 'assembly']);
const STORAGE_PREFIX = 'cm3d.workspace.tree-collapsed.v1.';

export function installObjectTreeScalability(store, ui) {
  const collapsed = new Set();
  const baseTreeNode = ui.treeNode.bind(ui);

  const projectKey = () => `${STORAGE_PREFIX}${store.project?.project?.projectId || 'unsaved'}`;
  const directChildren = objectId => Object.values(store.project.scene.objects)
    .filter(object => object.parentId === objectId)
    .sort((a, b) => a.order - b.order);

  const saveCollapsed = () => {
    try { localStorage.setItem(projectKey(), JSON.stringify([...collapsed])); }
    catch (error) { console.warn('Collapse-Zustand konnte nicht gespeichert werden.', error); }
  };

  const loadCollapsed = () => {
    collapsed.clear();
    try {
      const raw = localStorage.getItem(projectKey());
      const ids = raw ? JSON.parse(raw) : [];
      if (Array.isArray(ids)) for (const id of ids) collapsed.add(id);
    } catch (error) {
      console.warn('Collapse-Zustand konnte nicht geladen werden.', error);
    }
  };

  const pruneCollapsed = () => {
    let changed = false;
    for (const objectId of [...collapsed]) {
      const object = store.getObject(objectId);
      if (!object || !CONTAINER_TYPES.has(object.type)) {
        collapsed.delete(objectId);
        changed = true;
      }
    }
    if (changed) saveCollapsed();
  };

  const revealObject = objectId => {
    const object = store.getObject(objectId);
    if (!object) return false;
    let changed = false;

    const revealParentChain = startId => {
      let parentId = startId;
      while (parentId) {
        if (collapsed.delete(parentId)) changed = true;
        parentId = store.getObject(parentId)?.parentId ?? null;
      }
    };

    // Feature operations are rendered below their source sketch in the tree,
    // although they are not data-model children of that sketch.
    if (object.type === 'feature.extrude' && object.data?.sourceSketchId) {
      const sourceSketch = store.getObject(object.data.sourceSketchId);
      if (sourceSketch) {
        revealParentChain(sourceSketch.objectId);
        revealParentChain(sourceSketch.parentId);
      }
    }

    revealParentChain(object.parentId);

    if (changed) {
      saveCollapsed();
      ui.renderTree();
    }
    queueMicrotask(() => {
      const row = [...ui.tree.querySelectorAll('.tree-item')]
        .find(item => item.dataset.objectId === objectId || item.dataset.featureOperationId === objectId);
      row?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    });
    return changed;
  };

  ui.treeNode = (object, depth) => {
    const wrap = baseTreeNode(object, depth);
    const row = wrap.querySelector(':scope > .tree-item');
    if (!row) return wrap;
    row.dataset.objectId = object.objectId;

    const children = directChildren(object.objectId);
    const isContainer = CONTAINER_TYPES.has(object.type);
    const canCollapse = isContainer && children.length > 0;
    const isCollapsed = canCollapse && collapsed.has(object.objectId);

    const expander = document.createElement('button');
    expander.type = 'button';
    expander.className = `tree-expander${canCollapse ? '' : ' tree-expander-placeholder'}`;
    expander.textContent = canCollapse ? (isCollapsed ? '▸' : '▾') : '';
    expander.title = canCollapse ? (isCollapsed ? 'Inhalt aufklappen' : 'Inhalt zuklappen') : '';
    expander.setAttribute('aria-label', expander.title || '');
    expander.disabled = !canCollapse;
    expander.onclick = event => {
      event.preventDefault();
      event.stopPropagation();
      if (!canCollapse) return;
      if (collapsed.has(object.objectId)) collapsed.delete(object.objectId);
      else collapsed.add(object.objectId);
      saveCollapsed();
      ui.renderTree();
    };

    const checkbox = row.querySelector(':scope > .tree-check');
    row.insertBefore(expander, checkbox ?? row.firstChild);
    row.classList.toggle('tree-container', isContainer);
    row.classList.toggle('tree-collapsed', isCollapsed);

    if (isCollapsed) {
      for (const childWrap of [...wrap.children].slice(1)) childWrap.remove();
    }
    return wrap;
  };

  loadCollapsed();
  pruneCollapsed();

  store.subscribe(event => {
    if (event.type === 'projectLoaded') {
      loadCollapsed();
      pruneCollapsed();
      ui.renderTree();
      return;
    }
    if (event.type === 'projectChanged') pruneCollapsed();
    if (event.type === 'selectionChanged' && store.selection.activeObjectId) revealObject(store.selection.activeObjectId);
  });

  return {
    collapsed,
    isCollapsed: objectId => collapsed.has(objectId),
    revealObject,
    expandAll() { collapsed.clear(); saveCollapsed(); ui.renderTree(); }
  };
}
