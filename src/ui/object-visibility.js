const visible = object => object?.flags?.visible !== false;

function ensureFlags(object) {
  object.flags ??= {};
  if (typeof object.flags.visible !== 'boolean') object.flags.visible = true;
  if (typeof object.flags.locked !== 'boolean') object.flags.locked = false;
  return object.flags;
}

export function installObjectVisibility(store, runtime, ui) {
  store.setObjectVisible = (objectId, nextVisible) => {
    const object = store.getObject(objectId);
    if (!object) return false;
    const flags = ensureFlags(object);
    const next = !!nextVisible;
    if (flags.visible === next) return false;
    const before = store.snapshot();
    flags.visible = next;
    store.touch();
    store.pushHistory(before, next ? 'Objekt einblenden' : 'Objekt ausblenden');
    store.emit('visibilityChanged', { objectId, visible: next });
    return true;
  };

  store.toggleObjectVisible = objectId => {
    const object = store.getObject(objectId);
    return object ? store.setObjectVisible(objectId, !visible(object)) : false;
  };

  const isEffectivelyVisible = objectId => {
    let object = store.getObject(objectId);
    while (object) {
      if (!visible(object)) return false;
      object = object.parentId ? store.getObject(object.parentId) : null;
    }
    return true;
  };

  const baseTreeNode = ui.treeNode.bind(ui);
  ui.treeNode = (object, depth) => {
    const wrap = baseTreeNode(object, depth);
    const row = wrap.querySelector(':scope > .tree-item');
    if (!row) return wrap;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tree-visibility';
    button.title = visible(object) ? 'Objekt ausblenden' : 'Objekt einblenden';
    button.setAttribute('aria-label', button.title);
    button.textContent = visible(object) ? '◉' : '○';
    button.onclick = event => {
      event.preventDefault();
      event.stopPropagation();
      store.toggleObjectVisible(object.objectId);
    };
    row.appendChild(button);
    row.classList.toggle('tree-item-hidden', !visible(object));
    return wrap;
  };

  const applyRuntimeVisibility = objectId => {
    const object = store.getObject(objectId);
    const node = runtime.objectMap.get(objectId);
    if (object && node) node.visible = visible(object);
  };

  const applyAllRuntimeVisibility = () => {
    for (const object of Object.values(store.project.scene.objects)) applyRuntimeVisibility(object.objectId);
  };

  store.subscribe(event => {
    if (event.type === 'visibilityChanged') {
      applyRuntimeVisibility(event.objectId);
      ui.render();
      return;
    }
    if (['projectChanged', 'projectLoaded', 'objectCreated', 'geometryChanged'].includes(event.type)) {
      queueMicrotask(applyAllRuntimeVisibility);
    }
  });

  const baseRebuild = runtime.rebuild.bind(runtime);
  runtime.rebuild = (...args) => {
    const result = baseRebuild(...args);
    applyAllRuntimeVisibility();
    return result;
  };

  // WD-20B.8: hidden scene objects must not intercept viewport picking.
  // Tree selection remains unchanged so hidden objects can still be selected and shown again there.
  const basePick = runtime.pick.bind(runtime);
  runtime.pick = event => {
    const allPickables = runtime.pickables;
    runtime.pickables = allPickables.filter(node => {
      const objectId = node?.userData?.cm3dObjectId;
      return objectId ? isEffectivelyVisible(objectId) : true;
    });
    try {
      return basePick(event);
    } finally {
      runtime.pickables = allPickables;
    }
  };

  document.title = 'CyberMotion 3D – WD-14A';
  const buildLabel = document.querySelector('.brand small');
  if (buildLabel) buildLabel.textContent = 'WD-14A';
  applyAllRuntimeVisibility();
  ui.render();

  return { visible, isEffectivelyVisible, applyAllRuntimeVisibility };
}
