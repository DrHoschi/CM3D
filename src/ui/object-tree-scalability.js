const CONTAINER_TYPES = new Set(['group', 'assembly']);
const STORAGE_PREFIX = 'cm3d.workspace.tree-collapsed.v1.';

export function installObjectTreeScalability(store, ui) {
  const collapsed = new Set();
  const baseTreeNode = ui.treeNode.bind(ui);
  const baseRenderTree = ui.renderTree.bind(ui);
  let searchQuery = '';
  let searchVisibleIds = null;

  const projectKey = () => `${STORAGE_PREFIX}${store.project?.project?.projectId || 'unsaved'}`;
  const directChildren = objectId => Object.values(store.project.scene.objects)
    .filter(object => object.parentId === objectId)
    .sort((a, b) => a.order - b.order);

  const normalizeSearch = value => String(value ?? '').trim().toLocaleLowerCase();
  const objectMatchesSearch = (object, query) => {
    if (!query) return true;
    return normalizeSearch(object?.name).includes(query) || normalizeSearch(object?.objectId).includes(query);
  };
  const deriveSearchVisibleIds = query => {
    if (!query) return null;
    const visible = new Set();
    for (const object of Object.values(store.project.scene.objects)) {
      if (!objectMatchesSearch(object, query)) continue;
      let current = object;
      while (current) {
        if (visible.has(current.objectId)) break;
        visible.add(current.objectId);
        current = current.parentId ? store.getObject(current.parentId) : null;
      }
    }
    return visible;
  };
  const refreshSearchProjection = () => {
    searchVisibleIds = deriveSearchVisibleIds(searchQuery);
  };

  const searchHost = document.createElement('div');
  searchHost.className = 'object-tree-search';
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.id = 'object-tree-search';
  searchInput.placeholder = 'Objekte suchen…';
  searchInput.setAttribute('aria-label', 'Objektbaum durchsuchen');
  searchInput.autocomplete = 'off';
  const searchSummary = document.createElement('div');
  searchSummary.className = 'muted object-tree-search-summary';
  searchHost.append(searchInput, searchSummary);
  ui.tree.parentElement?.insertBefore(searchHost, ui.tree);

  const updateSearchSummary = () => {
    if (!searchQuery) {
      searchSummary.textContent = '';
      return;
    }
    const matches = Object.values(store.project.scene.objects).filter(object => objectMatchesSearch(object, searchQuery)).length;
    searchSummary.textContent = `${matches} Treffer`;
  };

  searchInput.addEventListener('input', () => {
    searchQuery = normalizeSearch(searchInput.value);
    refreshSearchProjection();
    updateSearchSummary();
    ui.renderTree();
  });

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

  const revealParentChain = startId => {
    let changed = false;
    let parentId = startId;
    while (parentId) {
      if (collapsed.delete(parentId)) changed = true;
      parentId = store.getObject(parentId)?.parentId ?? null;
    }
    return changed;
  };

  const scrollObjectRowIntoView = objectId => {
    queueMicrotask(() => {
      const row = [...ui.tree.querySelectorAll('.tree-item')]
        .find(item => item.dataset.objectId === objectId || item.dataset.featureOperationId === objectId);
      row?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    });
  };

  const revealObject = objectId => {
    const object = store.getObject(objectId);
    if (!object) return false;
    let changed = false;

    // Feature operations are rendered below their source sketch in the tree,
    // although they are not data-model children of that sketch.
    if (object.type === 'feature.extrude' && object.data?.sourceSketchId) {
      const sourceSketch = store.getObject(object.data.sourceSketchId);
      if (sourceSketch) {
        if (revealParentChain(sourceSketch.objectId)) changed = true;
        if (revealParentChain(sourceSketch.parentId)) changed = true;
      }
    }

    if (revealParentChain(object.parentId)) changed = true;

    if (changed) {
      saveCollapsed();
      ui.renderTree();
    }
    scrollObjectRowIntoView(objectId);
    return changed;
  };

  const revealSketchTarget = target => {
    const sketch = target?.sketchId ? store.getObject(target.sketchId) : null;
    if (sketch?.type !== 'sketch' || !target.kind || !target.elementId) return false;
    const changed = revealParentChain(sketch.parentId);
    if (changed) {
      saveCollapsed();
      ui.renderTree();
    }
    queueMicrotask(() => {
      const row = [...ui.tree.querySelectorAll('.tree-item')]
        .find(item => item.dataset.sketchElement === target.elementId && item.dataset.sketchElementKind === target.kind);
      row?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    });
    return changed;
  };

  ui.renderTree = () => {
    refreshSearchProjection();
    updateSearchSummary();
    baseRenderTree();
  };

  ui.treeNode = (object, depth) => {
    if (searchVisibleIds && !searchVisibleIds.has(object.objectId)) return document.createDocumentFragment();
    const wrap = baseTreeNode(object, depth);
    const row = wrap.querySelector(':scope > .tree-item');
    if (!row) return wrap;
    row.dataset.objectId = object.objectId;

    const children = directChildren(object.objectId);
    const isContainer = CONTAINER_TYPES.has(object.type);
    const canCollapse = isContainer && children.length > 0;
    const isCollapsed = canCollapse && collapsed.has(object.objectId) && !searchQuery;

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
  refreshSearchProjection();

  store.subscribe(event => {
    if (event.type === 'projectLoaded') {
      loadCollapsed();
      pruneCollapsed();
      refreshSearchProjection();
      ui.renderTree();
      return;
    }
    if (event.type === 'projectChanged') {
      pruneCollapsed();
      refreshSearchProjection();
    }
    if (event.type === 'selectionChanged') {
      const sketchTarget = store.selection.sketchElement;
      if (sketchTarget) revealSketchTarget(sketchTarget);
      else if (store.selection.activeObjectId) revealObject(store.selection.activeObjectId);
    }
  });

  return {
    collapsed,
    isCollapsed: objectId => collapsed.has(objectId),
    revealObject,
    revealSketchTarget,
    getSearchQuery: () => searchQuery,
    setSearchQuery(value) {
      searchInput.value = String(value ?? '');
      searchQuery = normalizeSearch(searchInput.value);
      refreshSearchProjection();
      updateSearchSummary();
      ui.renderTree();
    },
    getSearchVisibleIds: () => searchVisibleIds ? new Set(searchVisibleIds) : null,
    expandAll() { collapsed.clear(); saveCollapsed(); ui.renderTree(); }
  };
}
