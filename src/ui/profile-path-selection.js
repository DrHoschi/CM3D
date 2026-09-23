import * as THREE from 'three';
import { resolveStableReference } from '../application/stable-reference.js';

const idsForIdentity = (kind, identity) => kind === 'PROFILE'
  ? [...(identity?.source?.outerElementIds ?? []), ...(identity?.source?.holeElementIdSets ?? []).flat()]
  : [...(identity?.source?.elementIds ?? [])];

function identities(sketch, kind) {
  const map = kind === 'PROFILE' ? sketch?.data?.profileIdentities : sketch?.data?.pathIdentities;
  return Object.values(map ?? {}).map(identity => ({
    kind,
    id: kind === 'PROFILE' ? identity.profileId : identity.pathId,
    identity
  })).sort((a, b) => a.id.localeCompare(b.id));
}

function currentDerivedRefs(store) {
  return (store.getSelectionRefs?.() ?? []).filter(ref => ref.targetKind === 'PROFILE' || ref.targetKind === 'PATH');
}

export function installProfilePathSelectionProjection(store, runtime, ui) {
  const baseTreeNode = ui.treeNode.bind(ui);
  ui.treeNode = (object, depth) => {
    const wrap = baseTreeNode(object, depth);
    if (object.type !== 'sketch') return wrap;
    const profiles = identities(object, 'PROFILE');
    const paths = identities(object, 'PATH');
    if (profiles.length) {
      wrap.appendChild(section(`Profile (${profiles.length})`, depth + 1));
      profiles.forEach((entry, index) => wrap.appendChild(refRow(store, object.objectId, entry, `▱ Profil ${index + 1}`, depth + 2)));
    }
    if (paths.length) {
      wrap.appendChild(section(`Pfade (${paths.length})`, depth + 1));
      paths.forEach((entry, index) => wrap.appendChild(refRow(store, object.objectId, entry, `⌁ Pfad ${index + 1}`, depth + 2)));
    }
    return wrap;
  };

  installInspector(store, ui);
  installViewerProjection(store, runtime);

  ui.render();
  runtime.syncSelection();
  return { getSelectedRefs: () => currentDerivedRefs(store) };
}

function section(label, depth) {
  const row = document.createElement('div');
  row.className = 'tree-sketch-section';
  row.style.paddingLeft = `${8 + depth * 16}px`;
  row.textContent = label;
  return row;
}

function refRow(store, sketchId, entry, labelText, depth) {
  const ref = { targetKind: entry.kind, ownerId: sketchId, targetId: entry.id };
  const selected = (store.getSelectionRefs?.() ?? []).some(item =>
    item.targetKind === ref.targetKind && item.ownerId === ref.ownerId && item.targetId === ref.targetId);
  const row = document.createElement('div');
  row.className = `tree-item sketch-element-item${selected ? ' selected' : ''}`;
  row.style.paddingLeft = `${8 + depth * 16}px`;
  row.dataset.selectionKind = entry.kind;
  row.dataset.selectionTarget = entry.id;
  const spacer = document.createElement('span');
  spacer.className = 'tree-element-spacer';
  const label = document.createElement('span');
  label.textContent = labelText;
  row.append(spacer, label);
  row.addEventListener('click', event => {
    event.stopPropagation();
    store.selectRef(ref, true, store.sketchMultiSelectEnabled || event.metaKey || event.ctrlKey || event.shiftKey);
  });
  return row;
}

function installInspector(store, ui) {
  const form = document.querySelector('#inspector');
  if (!form || document.querySelector('#profile-path-selection-fields')) return;
  const fieldset = document.createElement('fieldset');
  fieldset.id = 'profile-path-selection-fields';
  fieldset.hidden = true;
  fieldset.innerHTML = `
    <legend id="profile-path-selection-legend">Profil / Pfad</legend>
    <div class="id-box"><strong>Identity</strong><code id="profile-path-selection-id">–</code></div>
    <div class="id-box"><strong>Owner Sketch</strong><code id="profile-path-selection-owner">–</code></div>
    <div class="id-box"><strong>Status</strong><code id="profile-path-selection-status">–</code></div>
    <p class="muted sketch-dependency-note">Abgeleitete Auswahl. Geometrie wird über die zugehörigen Skizzenelemente bearbeitet.</p>
  `;
  form.insertBefore(fieldset, form.firstChild);

  const baseRenderInspector = ui.renderInspector.bind(ui);
  ui.renderInspector = () => {
    baseRenderInspector();
    const ref = store.getPrimarySelectionRef?.();
    if (!ref || !['PROFILE','PATH'].includes(ref.targetKind)) {
      fieldset.hidden = true;
      return;
    }
    const resolution = resolveStableReference(store, ref);
    fieldset.hidden = false;
    fieldset.querySelector('#profile-path-selection-legend').textContent = ref.targetKind === 'PROFILE' ? 'Profil' : 'Pfad';
    fieldset.querySelector('#profile-path-selection-id').textContent = ref.targetId;
    fieldset.querySelector('#profile-path-selection-owner').textContent = ref.ownerId;
    fieldset.querySelector('#profile-path-selection-status').textContent = resolution.state;
  };
}

function installViewerProjection(store, runtime) {
  const basePick = runtime.pick.bind(runtime);
  runtime.pick = event => {
    if (!event.altKey) return basePick(event);
    if (runtime.transform.dragging) return;
    runtime.pointerFromEvent(event);
    const first = runtime.raycaster.intersectObjects(runtime.pickables, false)[0];
    const meta = first?.object?.userData?.cm3dSketchElement;
    if (!meta) return basePick(event);
    const sketch = store.getObject(meta.sketchId);
    if (sketch?.type !== 'sketch') return basePick(event);
    const candidates = [...identities(sketch, 'PROFILE'), ...identities(sketch, 'PATH')]
      .filter(entry => idsForIdentity(entry.kind, entry.identity).includes(meta.elementId));
    if (candidates.length !== 1) return basePick(event);
    const entry = candidates[0];
    store.selectRef({ targetKind: entry.kind, ownerId: sketch.objectId, targetId: entry.id }, true, event.metaKey || event.ctrlKey || event.shiftKey);
  };

  const overlays = [];
  const clearOverlays = () => {
    while (overlays.length) {
      const overlay = overlays.pop();
      overlay.parent?.remove(overlay);
      overlay.geometry?.dispose?.();
      overlay.material?.dispose?.();
    }
  };
  const overlayFor = (child, kind) => {
    if (!child.geometry) return;
    const color = kind === 'PROFILE' ? 0x63d6ff : 0xff8bd8;
    const line = child.clone(false);
    line.geometry = child.geometry.clone();
    line.material = new THREE.LineBasicMaterial({ color, depthTest:false, depthWrite:false, transparent:true, opacity:1 });
    line.renderOrder = 1000;
    line.userData = { cm3dProfilePathSelectionOverlay:true, selectionKind:kind };
    child.parent?.add(line);
    overlays.push(line);

    const points = new THREE.Points(
      child.geometry.clone(),
      new THREE.PointsMaterial({ color, size:6, sizeAttenuation:false, depthTest:false, depthWrite:false })
    );
    points.renderOrder = 1001;
    points.userData.cm3dProfilePathSelectionOverlay = true;
    points.userData.selectionKind = kind;
    child.parent?.add(points);
    overlays.push(points);
  };

  const baseSyncSelection = runtime.syncSelection.bind(runtime);
  runtime.syncSelection = () => {
    baseSyncSelection();
    clearOverlays();
    const refs = currentDerivedRefs(store);
    const selected = new Map();
    for (const ref of refs) {
      const sketch = store.getObject(ref.ownerId);
      const map = ref.targetKind === 'PROFILE' ? sketch?.data?.profileIdentities : sketch?.data?.pathIdentities;
      const identity = map?.[ref.targetId];
      for (const id of idsForIdentity(ref.targetKind, identity)) selected.set(`${ref.ownerId}:${id}`, ref.targetKind);
    }
    for (const node of runtime.objectMap.values()) {
      const matches = [];
      node.traverse(child => {
        const meta = child.userData?.cm3dSketchElement;
        if (!meta || meta.kind === 'point' || child.userData?.cm3dProfilePathSelectionOverlay) return;
        const kind = selected.get(`${meta.sketchId}:${meta.elementId}`);
        if (kind) matches.push({ child, kind });
      });
      for (const { child, kind } of matches) overlayFor(child, kind);
    }
  };
}
