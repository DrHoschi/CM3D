const iconFor = kind => kind === 'mesh' ? '◇' : kind === 'line' ? '╱' : kind === 'points' ? '⋯' : '›';

export function installImportedStructureUI(store, runtime, ui) {
  store.selection.importedElement ??= null;
  const structures = new Map();

  const rootObject = rootObjectId => {
    const object = store.getObject(rootObjectId);
    return object?.type === 'external.gltf' ? object : null;
  };
  const visibilityMap = rootObjectId => rootObject(rootObjectId)?.data?.importedOverrides?.visibility || {};
  const transformMap = rootObjectId => rootObject(rootObjectId)?.data?.importedOverrides?.transform || {};
  const isVisible = (rootObjectId, sourceKey) => visibilityMap(rootObjectId)[sourceKey] !== false;
  const runtimeNode = (rootObjectId, sourceKey) => {
    const root = runtime.objectMap.get(rootObjectId);
    let found = null;
    root?.traverse?.(node => { if (!found && node.userData?.cm3dImportedElement?.sourceKey === sourceKey) found = node; });
    return found;
  };
  const localTransform = node => ({
    position: { x: node.position.x, y: node.position.y, z: node.position.z },
    rotation: { x: node.quaternion.x, y: node.quaternion.y, z: node.quaternion.z, w: node.quaternion.w },
    scale: { x: node.scale.x, y: node.scale.y, z: node.scale.z }
  });
  const applyLocalTransform = (node, value) => {
    if (!node || !value) return false;
    const p = value.position, q = value.rotation, s = value.scale;
    if (p) node.position.set(Number(p.x ?? 0), Number(p.y ?? 0), Number(p.z ?? 0));
    if (q) node.quaternion.set(Number(q.x ?? 0), Number(q.y ?? 0), Number(q.z ?? 0), Number(q.w ?? 1)).normalize();
    if (s) node.scale.set(Number(s.x ?? 1), Number(s.y ?? 1), Number(s.z ?? 1));
    node.updateMatrix(); node.updateWorldMatrix(false, true);
    return true;
  };
  const applyVisibility = rootObjectId => {
    const descriptors = structures.get(rootObjectId) || [];
    const resolved = new Set(descriptors.map(item => item.sourceKey));
    for (const descriptor of descriptors) {
      const node = runtimeNode(rootObjectId, descriptor.sourceKey);
      if (node) node.visible = isVisible(rootObjectId, descriptor.sourceKey);
    }
    const unresolved = Object.keys(visibilityMap(rootObjectId)).filter(sourceKey => !resolved.has(sourceKey));
    store.emit('importedVisibilityDiagnostics', { rootObjectId, unresolvedSourceKeys: unresolved });
    return unresolved;
  };
  const applyTransforms = rootObjectId => {
    const descriptors = structures.get(rootObjectId) || [];
    const resolved = new Set(descriptors.map(item => item.sourceKey));
    for (const [sourceKey, value] of Object.entries(transformMap(rootObjectId))) {
      if (!resolved.has(sourceKey)) continue;
      applyLocalTransform(runtimeNode(rootObjectId, sourceKey), value);
    }
    const unresolved = Object.keys(transformMap(rootObjectId)).filter(sourceKey => !resolved.has(sourceKey));
    store.emit('importedTransformDiagnostics', { rootObjectId, unresolvedSourceKeys: unresolved });
    return unresolved;
  };

  store.setImportedElementVisible = (rootObjectId, sourceKey, nextVisible) => {
    const object = rootObject(rootObjectId);
    if (!object || !(structures.get(rootObjectId) || []).some(item => item.sourceKey === sourceKey)) return false;
    const next = !!nextVisible;
    if (isVisible(rootObjectId, sourceKey) === next) return false;
    const before = store.snapshot();
    object.data ??= {};
    object.data.importedOverrides ??= {};
    object.data.importedOverrides.visibility ??= {};
    if (next) delete object.data.importedOverrides.visibility[sourceKey];
    else object.data.importedOverrides.visibility[sourceKey] = false;
    if (!Object.keys(object.data.importedOverrides.visibility).length) delete object.data.importedOverrides.visibility;
    if (!Object.keys(object.data.importedOverrides).length) delete object.data.importedOverrides;
    store.touch();
    store.pushHistory(before, next ? 'Importiertes Element einblenden' : 'Importiertes Element ausblenden');
    applyVisibility(rootObjectId);
    store.emit('importedVisibilityChanged', { rootObjectId, sourceKey, visible: next });
    ui.render();
    return true;
  };
  store.toggleImportedElementVisible = (rootObjectId, sourceKey) => store.setImportedElementVisible(rootObjectId, sourceKey, !isVisible(rootObjectId, sourceKey));

  const commitImportedTransform = finalCommit => {
    const selected = store.selection.importedElement;
    if (!selected) return false;
    const node = runtimeNode(selected.rootObjectId, selected.sourceKey);
    if (!node || runtime.transform.object !== node) return false;
    const object = rootObject(selected.rootObjectId);
    if (!object) return false;
    object.data ??= {};
    object.data.importedOverrides ??= {};
    object.data.importedOverrides.transform ??= {};
    object.data.importedOverrides.transform[selected.sourceKey] = localTransform(node);
    store.touch();
    if (finalCommit && runtime.dragBefore) {
      store.pushHistory(runtime.dragBefore, `Importiertes Element Transform ${store.toolMode}`);
      runtime.dragBefore = null;
    }
    store.emit('importedTransformChanged', { rootObjectId: selected.rootObjectId, sourceKey: selected.sourceKey, transform: localTransform(node) });
    ui.render();
    return true;
  };
  const baseCommitTransform = runtime.commitTransform.bind(runtime);
  runtime.commitTransform = finalCommit => commitImportedTransform(finalCommit) || baseCommitTransform(finalCommit);

  const syncImportedTransformSelection = () => {
    if (runtime.sketchInput?.enabled) return false;
    const selected = store.selection.importedElement;
    if (!selected) return false;
    const node = runtimeNode(selected.rootObjectId, selected.sourceKey);
    if (!node) return false;
    runtime.transform.attach(node);
    return true;
  };

  const clearForRoot = rootObjectId => {
    structures.delete(rootObjectId);
    if (store.selection.importedElement?.rootObjectId === rootObjectId) store.selection.importedElement = null;
  };

  const register = (rootObjectId, descriptors = []) => {
    structures.set(rootObjectId, descriptors.map(item => ({ ...item })));
    applyTransforms(rootObjectId);
    applyVisibility(rootObjectId);
    store.emit('importedStructureChanged', { rootObjectId });
    ui.render();
  };

  const select = (rootObjectId, sourceKey, notify = true) => {
    const descriptor = (structures.get(rootObjectId) || []).find(item => item.sourceKey === sourceKey);
    if (!descriptor || !store.getObject(rootObjectId)) return false;
    store.select(rootObjectId, false, false);
    store.selection.importedElement = { rootObjectId, sourceKey };
    syncImportedTransformSelection();
    if (notify) store.emit('selectionChanged', { importedElement: { ...store.selection.importedElement } });
    return true;
  };

  const baseSelect = store.select.bind(store);
  store.select = (id, notify = true, additive = false) => {
    const result = baseSelect(id, notify, additive);
    if (store.selection.importedElement?.rootObjectId !== store.selection.activeObjectId) store.selection.importedElement = null;
    return result;
  };

  const baseTreeNode = ui.treeNode.bind(ui);
  ui.treeNode = (object, depth) => {
    const wrap = baseTreeNode(object, depth);
    if (object.type !== 'external.gltf') return wrap;
    const descriptors = structures.get(object.objectId) || [];
    const byParent = new Map();
    for (const descriptor of descriptors) {
      if (descriptor.parentSourceKey === null) continue;
      const list = byParent.get(descriptor.parentSourceKey) || [];
      list.push(descriptor);
      byParent.set(descriptor.parentSourceKey, list);
    }
    const append = (descriptor, level) => {
      const row = document.createElement('div');
      const selected = store.selection.importedElement?.sourceKey === descriptor.sourceKey;
      const shown = isVisible(object.objectId, descriptor.sourceKey);
      row.className = `tree-item imported-tree-item${selected ? ' selected' : ''}${shown ? '' : ' tree-item-hidden'}`;
      row.style.paddingLeft = `${8 + level * 16}px`;
      const visibility = document.createElement('button');
      visibility.type = 'button'; visibility.className = 'tree-visibility';
      visibility.title = shown ? 'Importiertes Element ausblenden' : 'Importiertes Element einblenden';
      visibility.setAttribute('aria-label', visibility.title); visibility.textContent = shown ? '◉' : '○';
      visibility.onclick = event => { event.preventDefault(); event.stopPropagation(); store.toggleImportedElementVisible(object.objectId, descriptor.sourceKey); };
      const label = document.createElement('span'); label.textContent = `${iconFor(descriptor.kind)} ${descriptor.name}`;
      row.append(visibility, label);
      row.onclick = event => { event.stopPropagation(); select(object.objectId, descriptor.sourceKey); };
      wrap.appendChild(row);
      for (const child of byParent.get(descriptor.sourceKey) || []) append(child, level + 1);
    };
    const rootDescriptor = descriptors.find(item => item.parentSourceKey === null);
    if (rootDescriptor) for (const child of byParent.get(rootDescriptor.sourceKey) || []) append(child, depth + 1);
    return wrap;
  };

  const baseRenderInspector = ui.renderInspector.bind(ui);
  ui.renderInspector = () => {
    baseRenderInspector();
    const selected = store.selection.importedElement;
    if (!selected) return;
    const descriptor = (structures.get(selected.rootObjectId) || []).find(item => item.sourceKey === selected.sourceKey);
    const node = runtimeNode(selected.rootObjectId, selected.sourceKey);
    if (!descriptor || !node || ui.form.hidden) return;
    ui.fields.name.value = descriptor.name;
    ui.fields.name.disabled = true;
    ui.fields.type.textContent = `imported.${descriptor.kind}`;
    ui.fields.id.textContent = descriptor.sourceKey;
    ui.fields.px.value = node.position.x; ui.fields.py.value = node.position.y; ui.fields.pz.value = node.position.z;
    const euler = node.rotation; ui.fields.rx.value = euler.x * 180 / Math.PI; ui.fields.ry.value = euler.y * 180 / Math.PI; ui.fields.rz.value = euler.z * 180 / Math.PI;
    ui.fields.sx.value = node.scale.x; ui.fields.sy.value = node.scale.y; ui.fields.sz.value = node.scale.z;
    for (const field of [ui.fields.pvx,ui.fields.pvy,ui.fields.pvz,ui.fields.dx,ui.fields.dy,ui.fields.dz,ui.fields.radius,ui.fields.height]) field.disabled = true;
  };

  const restoreInspectorEditability = () => {
    if (store.selection.importedElement) return;
    ui.fields.name.disabled = false;
    for (const field of [ui.fields.px,ui.fields.py,ui.fields.pz,ui.fields.rx,ui.fields.ry,ui.fields.rz,ui.fields.sx,ui.fields.sy,ui.fields.sz,ui.fields.pvx,ui.fields.pvy,ui.fields.pvz,ui.fields.dx,ui.fields.dy,ui.fields.dz,ui.fields.radius,ui.fields.height]) field.disabled = false;
  };
  store.subscribe(event => {
    if (event.type === 'selectionChanged') { restoreInspectorEditability(); queueMicrotask(syncImportedTransformSelection); }
    if (event.type === 'externalImportedStructure') register(event.objectId, event.descriptors || []);
    if (event.type === 'projectLoaded') structures.clear();
    if (['projectChanged','projectLoaded'].includes(event.type)) queueMicrotask(() => { for (const rootObjectId of structures.keys()) { applyTransforms(rootObjectId); applyVisibility(rootObjectId); } syncImportedTransformSelection(); ui.render(); });
  });

  const onPointer = event => {
    const rect = runtime.renderer.domElement.getBoundingClientRect();
    runtime.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    runtime.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    runtime.raycaster.setFromCamera(runtime.pointer, runtime.camera);
    const hit = runtime.raycaster.intersectObjects(runtime.pickables.filter(node => node.visible !== false), false)[0]?.object;
    const imported = hit?.userData?.cm3dImportedElement;
    if (imported) select(imported.rootObjectId, imported.sourceKey);
  };
  runtime.renderer.domElement.addEventListener('pointerdown', onPointer, true);

  return { register, clearForRoot, select, isVisible, applyVisibility, applyTransforms, runtimeNode, get: rootObjectId => (structures.get(rootObjectId) || []).map(item => ({ ...item })) };
}
