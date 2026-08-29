const locked = object => object?.flags?.locked === true;

function ensureFlags(object) {
  object.flags ??= {};
  if (typeof object.flags.visible !== 'boolean') object.flags.visible = true;
  if (typeof object.flags.locked !== 'boolean') object.flags.locked = false;
  return object.flags;
}

export function installObjectLocking(store, runtime, ui) {
  store.isObjectLocked = objectId => locked(store.getObject(objectId));

  store.setObjectLocked = (objectId, nextLocked) => {
    const object = store.getObject(objectId);
    if (!object) return false;
    const flags = ensureFlags(object);
    const next = !!nextLocked;
    if (flags.locked === next) return false;
    const before = store.snapshot();
    flags.locked = next;
    store.touch();
    store.pushHistory(before, next ? 'Objekt sperren' : 'Objekt entsperren');
    store.emit('lockChanged', { objectId, locked: next });
    return true;
  };

  store.toggleObjectLocked = objectId => {
    const object = store.getObject(objectId);
    return object ? store.setObjectLocked(objectId, !locked(object)) : false;
  };

  const blocked = objectId => !!objectId && store.isObjectLocked(objectId);
  const blockedSelection = () => store.selection.selectedObjectIds.some(blocked);
  const blockedSketchSelection = () => blocked(store.selection.sketchElement?.sketchId);

  const wrapObjectMutation = (name, resolveIds) => {
    const base = store[name];
    if (typeof base !== 'function') return;
    store[name] = (...args) => {
      const ids = resolveIds(...args).filter(Boolean);
      if (ids.some(blocked)) {
        store.emit('lockedMutationRejected', { objectIds: ids, action: name });
        return false;
      }
      return base.apply(store, args);
    };
  };

  for (const name of ['setName','setTransformFromEuler','setWorldTransformFromEuler','setPivot','setPivotPreset','setGeometry','setExtrudeParameters']) {
    wrapObjectMutation(name, objectId => [objectId]);
  }
  for (const name of ['addSketchPoint','addSketchLine','addSketchSegment','addSketchRectangle','addSketchPolygon','addSketchClosedShape','setSketchPoint','setSketchLineEndpoints']) {
    wrapObjectMutation(name, sketchId => [sketchId]);
  }
  wrapObjectMutation('reparent', (objectId, parentId) => [objectId, parentId]);

  const baseDeleteSelected = store.deleteSelected.bind(store);
  store.deleteSelected = (...args) => {
    if (blockedSelection() || blockedSketchSelection()) {
      store.emit('lockedMutationRejected', { objectIds: store.selection.selectedObjectIds, action: 'deleteSelected' });
      return false;
    }
    return baseDeleteSelected(...args);
  };

  for (const name of ['groupSelected','assemblySelected']) {
    const base = store[name]?.bind(store);
    if (!base) continue;
    store[name] = (...args) => {
      if (blockedSelection()) {
        store.emit('lockedMutationRejected', { objectIds: store.selection.selectedObjectIds, action: name });
        return false;
      }
      return base(...args);
    };
  }

  const baseUngroup = store.ungroupSelected?.bind(store);
  if (baseUngroup) {
    store.ungroupSelected = (...args) => {
      if (blocked(store.selection.activeObjectId)) {
        store.emit('lockedMutationRejected', { objectIds: [store.selection.activeObjectId], action: 'ungroupSelected' });
        return false;
      }
      return baseUngroup(...args);
    };
  }

  const baseDeleteSketchElement = store.deleteSketchElement?.bind(store);
  if (baseDeleteSketchElement) {
    store.deleteSketchElement = (...args) => {
      if (blockedSketchSelection()) {
        store.emit('lockedMutationRejected', { objectIds: [store.selection.sketchElement?.sketchId], action: 'deleteSketchElement' });
        return false;
      }
      return baseDeleteSketchElement(...args);
    };
  }

  const baseSyncSelection = runtime.syncSelection.bind(runtime);
  runtime.syncSelection = () => {
    if (blocked(store.selection.activeObjectId)) {
      runtime.transform.detach();
      return;
    }
    baseSyncSelection();
  };

  const baseCommitTransform = runtime.commitTransform.bind(runtime);
  runtime.commitTransform = finalCommit => {
    const node = runtime.transform.object;
    const objectId = node?.userData?.cm3dObjectId;
    if (blocked(objectId)) {
      runtime.transform.detach();
      return false;
    }
    return baseCommitTransform(finalCommit);
  };

  const baseEnableSketchInput = runtime.enableSketchInput.bind(runtime);
  runtime.enableSketchInput = (mode, sketchId = null) => {
    const id = sketchId ?? runtime.resolveSelectedSketch();
    if (blocked(id)) {
      store.emit('lockedMutationRejected', { objectIds: [id], action: 'enableSketchInput' });
      return false;
    }
    return baseEnableSketchInput(mode, sketchId);
  };

  const baseTreeNode = ui.treeNode.bind(ui);
  ui.treeNode = (object, depth) => {
    const wrap = baseTreeNode(object, depth);
    const row = wrap.querySelector(':scope > .tree-item');
    if (!row) return wrap;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tree-lock';
    button.title = locked(object) ? 'Objekt entsperren' : 'Objekt sperren';
    button.setAttribute('aria-label', button.title);
    button.textContent = locked(object) ? '🔒' : '🔓';
    button.onclick = event => {
      event.preventDefault();
      event.stopPropagation();
      store.toggleObjectLocked(object.objectId);
    };
    row.appendChild(button);
    row.classList.toggle('tree-item-locked', locked(object));
    return wrap;
  };

  const baseRenderInspector = ui.renderInspector.bind(ui);
  ui.renderInspector = () => {
    baseRenderInspector();
    const object = store.getObject(store.selection.activeObjectId);
    const isLocked = locked(object);
    if (!ui.form || !object) return;
    ui.form.classList.toggle('inspector-locked', isLocked);
    for (const control of ui.form.querySelectorAll('input, select, button')) {
      if (control.id === 'select-whole-sketch') continue;
      control.disabled = isLocked;
    }
  };

  const baseRenderToolbar = ui.renderToolbar.bind(ui);
  ui.renderToolbar = () => {
    baseRenderToolbar();
    const activeLocked = blocked(store.selection.activeObjectId);
    const anyLocked = blockedSelection() || blockedSketchSelection();
    for (const selector of ['#tool-move','#tool-rotate','#tool-scale','#apply-parent','#pivot-center','#pivot-bottom']) {
      const control = document.querySelector(selector);
      if (control) control.disabled = activeLocked;
    }
    for (const selector of ['#delete-object','#group-selected','#assembly-selected','#ungroup-selected']) {
      const control = document.querySelector(selector);
      if (control && anyLocked) control.disabled = true;
    }
  };

  store.subscribe(event => {
    if (event.type === 'lockChanged') {
      runtime.syncSelection();
      ui.render();
    }
    if (event.type === 'lockedMutationRejected') {
      ui.setStatus('Objekt ist gesperrt. Erst entsperren, dann bearbeiten.');
    }
  });

  document.title = 'CyberMotion 3D – WD-14B';
  const buildLabel = document.querySelector('.brand small');
  if (buildLabel) buildLabel.textContent = 'WD-14B';
  runtime.syncSelection();
  ui.render();

  return { locked };
}
