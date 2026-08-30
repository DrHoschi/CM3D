const CONTAINER_TYPES = new Set(['group', 'assembly']);

export function installObjectTreeScalability(store, ui) {
  const collapsed = new Set();
  const baseTreeNode = ui.treeNode.bind(ui);

  const directChildren = objectId => Object.values(store.project.scene.objects)
    .filter(object => object.parentId === objectId)
    .sort((a, b) => a.order - b.order);

  ui.treeNode = (object, depth) => {
    const wrap = baseTreeNode(object, depth);
    const row = wrap.querySelector(':scope > .tree-item');
    if (!row) return wrap;

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

  const pruneCollapsed = () => {
    for (const objectId of [...collapsed]) {
      const object = store.getObject(objectId);
      if (!object || !CONTAINER_TYPES.has(object.type)) collapsed.delete(objectId);
    }
  };

  store.subscribe(event => {
    if (['projectChanged', 'projectLoaded', 'objectCreated', 'objectChanged'].includes(event.type)) pruneCollapsed();
  });

  return {
    collapsed,
    isCollapsed: objectId => collapsed.has(objectId),
    expandAll() { collapsed.clear(); ui.renderTree(); }
  };
}
