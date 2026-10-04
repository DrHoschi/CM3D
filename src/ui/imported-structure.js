const iconFor = kind => kind === 'mesh' ? '◇' : kind === 'line' ? '╱' : kind === 'points' ? '⋯' : '›';
const IMAGE_MIME = /^image\/(png|jpeg|webp)$/;

export function installImportedStructureUI(store, runtime, ui) {
  store.selection.importedElement ??= null;
  const structures = new Map();
  const baseMaterials = new Map();
  const textureLoads = new Map();

  const rootObject = rootObjectId => {
    const object = store.getObject(rootObjectId);
    return object?.type === 'external.gltf' ? object : null;
  };
  const visibilityMap = rootObjectId => rootObject(rootObjectId)?.data?.importedOverrides?.visibility || {};
  const transformMap = rootObjectId => rootObject(rootObjectId)?.data?.importedOverrides?.transform || {};
  const materialMap = rootObjectId => rootObject(rootObjectId)?.data?.importedOverrides?.material || {};
  const textureMap = rootObjectId => rootObject(rootObjectId)?.data?.importedOverrides?.texture || {};
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
  const materialKey = (rootObjectId, sourceKey) => `${rootObjectId}:${sourceKey}`;
  const singleMaterialNode = (rootObjectId, sourceKey) => {
    const node = runtimeNode(rootObjectId, sourceKey);
    return node?.isMesh && node.material && !Array.isArray(node.material) ? node : null;
  };
  const rememberBaseMaterial = (rootObjectId, sourceKey, node) => {
    const key = materialKey(rootObjectId, sourceKey);
    if (!baseMaterials.has(key) && node?.material && !Array.isArray(node.material)) baseMaterials.set(key, node.material);
    return baseMaterials.get(key) || null;
  };
  const ensureLocalMaterial = (rootObjectId, sourceKey, node) => {
    const base = rememberBaseMaterial(rootObjectId, sourceKey, node);
    if (!base) return null;
    if (node.material === base) node.material = base.clone();
    return node.material;
  };
  const applyMaterialValue = (material, value = {}) => {
    if (value.baseColor != null && material.color?.set) material.color.set(value.baseColor);
    if (value.metallic != null && 'metalness' in material) material.metalness = Number(value.metallic);
    if (value.roughness != null && 'roughness' in material) material.roughness = Number(value.roughness);
    if (value.opacity != null) { material.opacity = Number(value.opacity); material.transparent = material.opacity < 1; }
    material.needsUpdate = true;
  };
  const applyMaterials = rootObjectId => {
    const descriptors = structures.get(rootObjectId) || [];
    const resolved = new Set(descriptors.map(item => item.sourceKey));
    for (const descriptor of descriptors) {
      const node = singleMaterialNode(rootObjectId, descriptor.sourceKey);
      if (node) rememberBaseMaterial(rootObjectId, descriptor.sourceKey, node);
    }
    for (const [sourceKey, value] of Object.entries(materialMap(rootObjectId))) {
      if (!resolved.has(sourceKey)) continue;
      const node = singleMaterialNode(rootObjectId, sourceKey);
      if (!node) continue;
      const material = ensureLocalMaterial(rootObjectId, sourceKey, node);
      if (material) applyMaterialValue(material, value);
    }
    const unresolved = Object.keys(materialMap(rootObjectId)).filter(sourceKey => !resolved.has(sourceKey));
    store.emit('importedMaterialDiagnostics', { rootObjectId, unresolvedSourceKeys: unresolved });
    return unresolved;
  };
  const textureAsset = assetId => store.project.assets?.find(asset => asset.assetId === assetId && asset.kind === 'image.texture') || null;
  const loadTexture = asset => {
    if (!asset?.dataUrl) return Promise.resolve(null);
    const cached = textureLoads.get(asset.assetId);
    if (cached?.dataUrl === asset.dataUrl) return cached.promise;
    const promise = import('three').then(THREE => new Promise(resolve => {
      new THREE.TextureLoader().load(asset.dataUrl, texture => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
        resolve(texture);
      }, undefined, () => resolve(null));
    }));
    textureLoads.set(asset.assetId, { dataUrl: asset.dataUrl, promise });
    return promise;
  };
  const applyTextures = rootObjectId => {
    const descriptors = structures.get(rootObjectId) || [];
    const resolved = new Set(descriptors.map(item => item.sourceKey));
    const missingAssetIds = [];
    for (const descriptor of descriptors) {
      const sourceKey = descriptor.sourceKey;
      const node = singleMaterialNode(rootObjectId, sourceKey);
      if (!node) continue;
      const base = rememberBaseMaterial(rootObjectId, sourceKey, node);
      const assetId = textureMap(rootObjectId)[sourceKey]?.baseColor;
      if (!assetId) {
        if (base && node.material !== base) { node.material.map = base.map || null; node.material.needsUpdate = true; }
        continue;
      }
      const asset = textureAsset(assetId);
      if (!asset) { missingAssetIds.push(assetId); if (base && node.material !== base) { node.material.map = base.map || null; node.material.needsUpdate = true; } continue; }
      const material = ensureLocalMaterial(rootObjectId, sourceKey, node);
      if (!material) continue;
      loadTexture(asset).then(texture => {
        if (textureMap(rootObjectId)[sourceKey]?.baseColor !== assetId) return;
        material.map = texture || base?.map || null;
        material.needsUpdate = true;
        store.emit('importedTextureHydrated', { rootObjectId, sourceKey, assetId, ok: !!texture });
        ui.render();
      });
    }
    const unresolvedSourceKeys = Object.keys(textureMap(rootObjectId)).filter(sourceKey => !resolved.has(sourceKey));
    store.emit('importedTextureDiagnostics', { rootObjectId, unresolvedSourceKeys, missingAssetIds: [...new Set(missingAssetIds)] });
    return { unresolvedSourceKeys, missingAssetIds: [...new Set(missingAssetIds)] };
  };
  const validColor = value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
  const validUnit = value => Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 1;
  store.setImportedMaterialProperty = (rootObjectId, sourceKey, property, value) => {
    const object = rootObject(rootObjectId);
    const node = singleMaterialNode(rootObjectId, sourceKey);
    if (!object || !node) return { ok: false, message: 'Nur importierte Single-Material-Meshes werden unterstützt.' };
    if (!['baseColor','metallic','roughness','opacity'].includes(property)) return { ok: false, message: 'Nicht unterstützte Materialeigenschaft.' };
    const next = property === 'baseColor' ? value : Number(value);
    if ((property === 'baseColor' && !validColor(next)) || (property !== 'baseColor' && !validUnit(next))) return { ok: false, message: property === 'baseColor' ? 'Ungültige Basisfarbe.' : 'Wert muss zwischen 0 und 1 liegen.' };
    const before = store.snapshot();
    object.data ??= {}; object.data.importedOverrides ??= {}; object.data.importedOverrides.material ??= {};
    object.data.importedOverrides.material[sourceKey] ??= {};
    object.data.importedOverrides.material[sourceKey][property] = next;
    store.touch();
    store.pushHistory(before, `Importiertes Material ${property}`);
    applyMaterials(rootObjectId);
    store.emit('importedMaterialChanged', { rootObjectId, sourceKey, property, value: next });
    ui.render();
    return { ok: true };
  };
  store.setImportedBaseColorTexture = (rootObjectId, sourceKey, { name = 'Textur', mimeType, dataUrl } = {}) => {
    const object = rootObject(rootObjectId);
    const node = singleMaterialNode(rootObjectId, sourceKey);
    if (!object || !node) return { ok: false, message: 'Nur importierte Single-Material-Meshes werden unterstützt.' };
    if (!IMAGE_MIME.test(String(mimeType || '')) || typeof dataUrl !== 'string' || !dataUrl.startsWith(`data:${mimeType};base64,`)) return { ok: false, message: 'Nur eingebettete PNG-, JPEG- oder WebP-Bilder sind zulässig.' };
    const before = store.snapshot();
    const assetId = `asset_${crypto.randomUUID()}`;
    store.project.assets ??= [];
    store.project.assets.push({ assetId, kind: 'image.texture', format: mimeType.split('/')[1], mimeType, name: String(name || 'Textur'), dataUrl });
    object.data ??= {}; object.data.importedOverrides ??= {}; object.data.importedOverrides.texture ??= {};
    object.data.importedOverrides.texture[sourceKey] ??= {};
    object.data.importedOverrides.texture[sourceKey].baseColor = assetId;
    store.touch();
    store.pushHistory(before, 'Importierte Basisfarbtextur ersetzen');
    applyTextures(rootObjectId);
    store.emit('importedTextureChanged', { rootObjectId, sourceKey, assetId });
    ui.render();
    return { ok: true, assetId };
  };
  store.removeImportedBaseColorTexture = (rootObjectId, sourceKey) => {
    const object = rootObject(rootObjectId);
    const entry = object?.data?.importedOverrides?.texture?.[sourceKey];
    if (!object || !entry?.baseColor) return { ok: true, unchanged: true };
    const before = store.snapshot();
    delete entry.baseColor;
    if (!Object.keys(entry).length) delete object.data.importedOverrides.texture[sourceKey];
    if (!Object.keys(object.data.importedOverrides.texture).length) delete object.data.importedOverrides.texture;
    if (!Object.keys(object.data.importedOverrides).length) delete object.data.importedOverrides;
    store.touch();
    store.pushHistory(before, 'Importierte Basisfarbtextur entfernen');
    applyTextures(rootObjectId);
    store.emit('importedTextureChanged', { rootObjectId, sourceKey, assetId: null });
    ui.render();
    return { ok: true };
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
    for (const key of [...baseMaterials.keys()]) if (key.startsWith(`${rootObjectId}:`)) baseMaterials.delete(key);
    if (store.selection.importedElement?.rootObjectId === rootObjectId) store.selection.importedElement = null;
  };

  const register = (rootObjectId, descriptors = []) => {
    structures.set(rootObjectId, descriptors.map(item => ({ ...item })));
    for (const descriptor of descriptors) {
      const node = singleMaterialNode(rootObjectId, descriptor.sourceKey);
      if (node) rememberBaseMaterial(rootObjectId, descriptor.sourceKey, node);
    }
    applyTransforms(rootObjectId);
    applyVisibility(rootObjectId);
    applyMaterials(rootObjectId);
    applyTextures(rootObjectId);
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

  const materialPanel = () => document.querySelector('#material-fields');
  const materialControls = () => ({
    color: document.querySelector('#material-color'), metallic: document.querySelector('#material-metallic'), roughness: document.querySelector('#material-roughness'), opacity: document.querySelector('#material-opacity'),
    select: document.querySelector('#material-select'), preset: document.querySelector('#material-preset'), presetApply: document.querySelector('#material-preset-apply'), library: document.querySelector('#material-library'), librarySave: document.querySelector('#material-library-save'), libraryApply: document.querySelector('#material-library-apply'), textureFile: document.querySelector('#material-texture-file'), textureRemove: document.querySelector('#material-texture-remove'), assign: document.querySelector('#material-assign'), remove: document.querySelector('#material-remove'), create: document.querySelector('#material-new'), state: document.querySelector('#material-selection-state'), textureState: document.querySelector('#material-texture-state')
  });
  const renderImportedMaterial = selected => {
    const panel = materialPanel(); if (!panel) return;
    const controls = materialControls();
    const node = singleMaterialNode(selected.rootObjectId, selected.sourceKey);
    panel.hidden = false;
    const editable = !!node;
    for (const control of [controls.color,controls.metallic,controls.roughness,controls.opacity,controls.textureFile]) if (control) control.disabled = !editable;
    for (const control of [controls.select,controls.preset,controls.presetApply,controls.library,controls.librarySave,controls.libraryApply,controls.assign,controls.remove,controls.create]) if (control) control.disabled = true;
    const textureAssetId = textureMap(selected.rootObjectId)[selected.sourceKey]?.baseColor || null;
    if (controls.textureRemove) controls.textureRemove.disabled = !editable || !textureAssetId;
    if (controls.state) controls.state.textContent = editable ? 'Importiertes Single-Material-Mesh · lokale Parameter-/Textur-Overrides' : 'Importiertes Multi-/Nicht-Mesh · Material read-only';
    if (controls.textureState) controls.textureState.textContent = textureAssetId ? `Importierte Basisfarbtextur · ${textureAsset(textureAssetId)?.name || 'Asset fehlt'}` : 'GLTF-Basistextur · kein Override';
    if (!editable) return;
    const material = node.material;
    if (controls.color && material.color?.getHexString) controls.color.value = `#${material.color.getHexString()}`;
    if (controls.metallic) controls.metallic.value = String(Number(material.metalness ?? 0));
    if (controls.roughness) controls.roughness.value = String(Number(material.roughness ?? 0.6));
    if (controls.opacity) controls.opacity.value = String(Number(material.opacity ?? 1));
  };
  const bindImportedMaterialControls = () => {
    const controls = materialControls();
    const commit = (property, input) => {
      const selected = store.selection.importedElement; if (!selected || !input) return;
      const result = store.setImportedMaterialProperty(selected.rootObjectId, selected.sourceKey, property, input.value);
      if (!result.ok) { alert(result.message); ui.render(); }
    };
    for (const [property,input] of [['baseColor',controls.color],['metallic',controls.metallic],['roughness',controls.roughness],['opacity',controls.opacity]]) {
      if (!input || input.dataset.importedMaterialBound) continue;
      input.dataset.importedMaterialBound = '1';
      input.addEventListener('change', event => { if (!store.selection.importedElement) return; event.stopImmediatePropagation(); commit(property, input); }, true);
    }
    if (controls.textureFile && !controls.textureFile.dataset.importedTextureBound) {
      controls.textureFile.dataset.importedTextureBound = '1';
      controls.textureFile.addEventListener('change', event => {
        const selected = store.selection.importedElement;
        if (!selected) return;
        event.stopImmediatePropagation();
        const file = controls.textureFile.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const result = store.setImportedBaseColorTexture(selected.rootObjectId, selected.sourceKey, { name: file.name, mimeType: file.type, dataUrl: String(reader.result || '') });
          if (!result.ok) alert(result.message);
          controls.textureFile.value = '';
          ui.render();
        };
        reader.readAsDataURL(file);
      }, true);
    }
    if (controls.textureRemove && !controls.textureRemove.dataset.importedTextureBound) {
      controls.textureRemove.dataset.importedTextureBound = '1';
      controls.textureRemove.addEventListener('click', event => {
        const selected = store.selection.importedElement;
        if (!selected) return;
        event.stopImmediatePropagation();
        store.removeImportedBaseColorTexture(selected.rootObjectId, selected.sourceKey);
      }, true);
    }
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
    bindImportedMaterialControls();
    renderImportedMaterial(selected);
  };

  const restoreInspectorEditability = () => {
    if (store.selection.importedElement) return;
    ui.fields.name.disabled = false;
    for (const field of [ui.fields.px,ui.fields.py,ui.fields.pz,ui.fields.rx,ui.fields.ry,ui.fields.rz,ui.fields.sx,ui.fields.sy,ui.fields.sz,ui.fields.pvx,ui.fields.pvy,ui.fields.pvz,ui.fields.dx,ui.fields.dy,ui.fields.dz,ui.fields.radius,ui.fields.height]) field.disabled = false;
  };
  store.subscribe(event => {
    if (event.type === 'selectionChanged') { restoreInspectorEditability(); queueMicrotask(syncImportedTransformSelection); }
    if (event.type === 'externalImportedStructure') register(event.objectId, event.descriptors || []);
    if (event.type === 'projectLoaded') { structures.clear(); baseMaterials.clear(); textureLoads.clear(); }
    if (['projectChanged','projectLoaded'].includes(event.type)) queueMicrotask(() => { for (const rootObjectId of structures.keys()) { applyTransforms(rootObjectId); applyVisibility(rootObjectId); applyMaterials(rootObjectId); applyTextures(rootObjectId); } syncImportedTransformSelection(); ui.render(); });
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

  return { register, clearForRoot, select, isVisible, applyVisibility, applyTransforms, applyMaterials, applyTextures, runtimeNode, get: rootObjectId => (structures.get(rootObjectId) || []).map(item => ({ ...item })) };
}
