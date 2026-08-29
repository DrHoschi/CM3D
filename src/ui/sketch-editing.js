import * as THREE from 'three';
import { getSingleExtrudableProfile } from '../model/sketch-profile.js';

const cloneProfile = profile => ({
  signature: profile.signature,
  pointIds: [...profile.pointIds],
  lineIds: [...profile.lineIds],
  points: profile.points.map(point => ({ x: point.x, y: point.y })),
  winding: profile.winding,
  signedArea: profile.signedArea
});

export function installSketchEditing(store, runtime, ui) {
  store.selection.sketchElement = null;

  const baseSelect = store.select.bind(store);
  const baseClearSelection = store.clearSelection.bind(store);
  const baseDeleteSelected = store.deleteSelected.bind(store);

  store.select = (id, notify = true, additive = false) => {
    store.selection.sketchElement = null;
    return baseSelect(id, notify, additive);
  };

  store.clearSelection = (notify = true) => {
    store.selection.sketchElement = null;
    return baseClearSelection(notify);
  };

  store.selectSketchElement = (sketchId, kind, elementId, notify = true) => {
    const sketch = store.getObject(sketchId);
    if (sketch?.type !== 'sketch') return false;
    const map = kind === 'line' ? sketch.data?.lines : kind === 'point' ? sketch.data?.points : null;
    if (!map?.[elementId]) return false;
    baseSelect(sketchId, false, false);
    store.selection.sketchElement = { sketchId, kind, elementId };
    if (notify) store.emit('selectionChanged', { sketchElement: structuredClone(store.selection.sketchElement) });
    return true;
  };

  store.clearSketchElementSelection = (notify = true) => {
    if (!store.selection.sketchElement) return false;
    store.selection.sketchElement = null;
    if (notify) store.emit('selectionChanged');
    return true;
  };

  const refreshDependentExtrudes = sketchId => {
    const sketch = store.getObject(sketchId);
    if (sketch?.type !== 'sketch') return [];
    const derived = getSingleExtrudableProfile(sketch);
    const changed = [];
    for (const object of Object.values(store.project.scene.objects)) {
      if (object.type !== 'feature.extrude' || object.data?.sourceSketchId !== sketchId) continue;
      object.extensions ??= {};
      if (derived.valid) {
        object.data.profile = cloneProfile(derived.profile);
        object.extensions.sketchDependency = { status: 'valid' };
      } else {
        object.data.profile = null;
        object.extensions.sketchDependency = {
          status: 'invalid',
          diagnostics: derived.diagnostics.map(item => ({ code: item.code, message: item.message }))
        };
      }
      changed.push(object.objectId);
    }
    return changed;
  };

  store.refreshDependentExtrudesFromSketch = refreshDependentExtrudes;

  const commitSketchMutation = (sketchId, label, mutate) => {
    const sketch = store.getObject(sketchId);
    if (sketch?.type !== 'sketch') return false;
    const before = store.snapshot();
    if (mutate(sketch) === false) return false;
    refreshDependentExtrudes(sketchId);
    store.touch();
    store.pushHistory(before, label);
    store.emit('geometryChanged', { objectId: sketchId, sketchDependencySynced: true });
    store.emit('selectionChanged');
    return true;
  };

  store.setSketchPoint = (sketchId, pointId, next) => commitSketchMutation(sketchId, 'Skizzenpunkt ändern', sketch => {
    const point = sketch.data?.points?.[pointId];
    if (!point) return false;
    const x = Number(next?.x), y = Number(next?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    if (point.x === x && point.y === y) return false;
    point.x = x;
    point.y = y;
    return true;
  });

  store.setSketchLineEndpoints = (sketchId, lineId, next) => commitSketchMutation(sketchId, 'Skizzenlinie ändern', sketch => {
    const line = sketch.data?.lines?.[lineId];
    if (!line) return false;
    const a = sketch.data.points?.[line.startPointId];
    const b = sketch.data.points?.[line.endPointId];
    if (!a || !b) return false;
    const ax = Number(next?.ax), ay = Number(next?.ay), bx = Number(next?.bx), by = Number(next?.by);
    if (![ax, ay, bx, by].every(Number.isFinite)) return false;
    if (a.x === ax && a.y === ay && b.x === bx && b.y === by) return false;
    a.x = ax;
    a.y = ay;
    b.x = bx;
    b.y = by;
    return true;
  });

  store.deleteSketchElement = () => {
    const selected = store.selection.sketchElement;
    if (!selected) return false;
    const { sketchId, kind, elementId } = selected;
    store.selection.sketchElement = null;
    return commitSketchMutation(sketchId, kind === 'line' ? 'Skizzenlinie löschen' : 'Skizzenpunkt löschen', sketch => {
      if (kind === 'line') {
        const line = sketch.data?.lines?.[elementId];
        if (!line) return false;
        const candidates = [line.startPointId, line.endPointId];
        delete sketch.data.lines[elementId];
        for (const pointId of candidates) {
          const stillUsed = Object.values(sketch.data.lines).some(item => item.startPointId === pointId || item.endPointId === pointId);
          if (!stillUsed) delete sketch.data.points[pointId];
        }
        return true;
      }
      const point = sketch.data?.points?.[elementId];
      if (!point) return false;
      for (const [lineId, line] of Object.entries(sketch.data.lines ?? {})) {
        if (line.startPointId === elementId || line.endPointId === elementId) delete sketch.data.lines[lineId];
      }
      delete sketch.data.points[elementId];
      return true;
    });
  };

  store.deleteSelected = () => store.selection.sketchElement ? store.deleteSketchElement() : baseDeleteSelected();

  let syncingGeometry = false;
  store.subscribe(event => {
    if (event.type !== 'geometryChanged' || event.sketchDependencySynced || syncingGeometry) return;
    const sketch = store.getObject(event.objectId);
    if (sketch?.type !== 'sketch') return;
    syncingGeometry = true;
    const changed = refreshDependentExtrudes(sketch.objectId);
    if (changed.length) {
      store.touch();
      const latest = store.undoStack.at(-1);
      if (latest) latest.after = store.snapshot();
      store.emit('sketchDependenciesChanged', { sketchId: sketch.objectId, objectIds: changed });
    }
    syncingGeometry = false;
  });

  installTreeEditing(ui, store);
  installInspectorEditing(ui, store);
  installViewportEditing(runtime, store);

  document.title = 'CyberMotion 3D – WD-12A';
  const buildLabel = document.querySelector('.brand small');
  if (buildLabel) buildLabel.textContent = 'WD-12A';

  ui.render();
  runtime.rebuild();
}

function installTreeEditing(ui, store) {
  const baseTreeNode = ui.treeNode.bind(ui);
  ui.treeNode = (object, depth) => {
    const wrap = baseTreeNode(object, depth);
    if (object.type !== 'sketch') return wrap;

    const lines = Object.values(object.data?.lines ?? {});
    const points = Object.values(object.data?.points ?? {});
    if (!lines.length && !points.length) return wrap;

    if (lines.length) {
      wrap.appendChild(treeSection(`Linien (${lines.length})`, depth + 1));
      lines.forEach((line, index) => wrap.appendChild(elementTreeRow(store, object.objectId, 'line', line.lineId, `╱ Linie ${index + 1}`, depth + 2)));
    }
    if (points.length) {
      wrap.appendChild(treeSection(`Punkte (${points.length})`, depth + 1));
      points.forEach((point, index) => wrap.appendChild(elementTreeRow(store, object.objectId, 'point', point.pointId, `• Punkt ${index + 1}`, depth + 2)));
    }
    return wrap;
  };

  const baseRenderToolbar = ui.renderToolbar.bind(ui);
  ui.renderToolbar = () => {
    baseRenderToolbar();
    if (!store.selection.sketchElement) return;
    const duplicate = document.querySelector('#duplicate-object');
    const remove = document.querySelector('#delete-object');
    if (duplicate) duplicate.disabled = true;
    if (remove) remove.disabled = false;
  };
}

function treeSection(label, depth) {
  const row = document.createElement('div');
  row.className = 'tree-sketch-section';
  row.style.paddingLeft = `${8 + depth * 16}px`;
  row.textContent = label;
  return row;
}

function elementTreeRow(store, sketchId, kind, elementId, labelText, depth) {
  const row = document.createElement('div');
  const selected = store.selection.sketchElement;
  row.className = `tree-item sketch-element-item${selected?.sketchId === sketchId && selected?.kind === kind && selected?.elementId === elementId ? ' selected' : ''}`;
  row.style.paddingLeft = `${8 + depth * 16}px`;
  row.dataset.sketchElement = elementId;
  row.dataset.sketchElementKind = kind;
  const spacer = document.createElement('span');
  spacer.className = 'tree-element-spacer';
  const label = document.createElement('span');
  label.textContent = labelText;
  row.append(spacer, label);
  row.addEventListener('click', event => {
    event.stopPropagation();
    store.selectSketchElement(sketchId, kind, elementId);
  });
  return row;
}

function installInspectorEditing(ui, store) {
  const form = document.querySelector('#inspector');
  const geometry = document.querySelector('#geometry-fields');
  if (!form || document.querySelector('#sketch-element-fields')) return;

  const fieldset = document.createElement('fieldset');
  fieldset.id = 'sketch-element-fields';
  fieldset.hidden = true;
  fieldset.innerHTML = `
    <legend id="sketch-element-legend">Skizzenelement</legend>
    <div class="id-box"><strong>Element</strong><code id="sketch-element-id">–</code></div>
    <div id="sketch-point-editor">
      <label>X <input id="sketch-point-x" type="number" step="0.001"/></label>
      <label>Y <input id="sketch-point-y" type="number" step="0.001"/></label>
    </div>
    <div id="sketch-line-editor">
      <strong class="sketch-subtitle">Startpunkt A</strong>
      <label>X <input id="sketch-line-ax" type="number" step="0.001"/></label>
      <label>Y <input id="sketch-line-ay" type="number" step="0.001"/></label>
      <strong class="sketch-subtitle">Endpunkt B</strong>
      <label>X <input id="sketch-line-bx" type="number" step="0.001"/></label>
      <label>Y <input id="sketch-line-by" type="number" step="0.001"/></label>
    </div>
    <p id="sketch-dependency-note" class="muted sketch-dependency-note"></p>
    <div class="button-row"><button id="delete-sketch-element" type="button" class="danger">Element löschen</button><button id="select-whole-sketch" type="button">Skizze auswählen</button></div>
  `;
  form.insertBefore(fieldset, geometry ?? form.firstChild);

  const q = selector => fieldset.querySelector(selector);
  const pointX = q('#sketch-point-x'), pointY = q('#sketch-point-y');
  const ax = q('#sketch-line-ax'), ay = q('#sketch-line-ay'), bx = q('#sketch-line-bx'), by = q('#sketch-line-by');

  const commitPoint = () => {
    const selected = store.selection.sketchElement;
    if (selected?.kind !== 'point') return;
    store.setSketchPoint(selected.sketchId, selected.elementId, { x: ui.toMeters(pointX.value), y: ui.toMeters(pointY.value) });
  };
  pointX.addEventListener('change', commitPoint);
  pointY.addEventListener('change', commitPoint);

  const commitLine = () => {
    const selected = store.selection.sketchElement;
    if (selected?.kind !== 'line') return;
    store.setSketchLineEndpoints(selected.sketchId, selected.elementId, {
      ax: ui.toMeters(ax.value), ay: ui.toMeters(ay.value), bx: ui.toMeters(bx.value), by: ui.toMeters(by.value)
    });
  };
  for (const input of [ax, ay, bx, by]) input.addEventListener('change', commitLine);

  q('#delete-sketch-element').addEventListener('click', () => store.deleteSketchElement());
  q('#select-whole-sketch').addEventListener('click', () => {
    const sketchId = store.selection.sketchElement?.sketchId;
    if (sketchId) store.select(sketchId);
  });

  const baseRenderInspector = ui.renderInspector.bind(ui);
  ui.renderInspector = () => {
    baseRenderInspector();
    renderSketchElementInspector(ui, store, fieldset);
  };
}

function renderSketchElementInspector(ui, store, fieldset) {
  const selected = store.selection.sketchElement;
  if (!selected) {
    fieldset.hidden = true;
    return;
  }
  const sketch = store.getObject(selected.sketchId);
  if (sketch?.type !== 'sketch') {
    fieldset.hidden = true;
    return;
  }

  const q = selector => fieldset.querySelector(selector);
  const pointEditor = q('#sketch-point-editor');
  const lineEditor = q('#sketch-line-editor');
  const dependencyCount = Object.values(store.project.scene.objects).filter(object => object.type === 'feature.extrude' && object.data?.sourceSketchId === sketch.objectId).length;
  q('#sketch-dependency-note').textContent = dependencyCount
    ? `${dependencyCount} abhängige Extrusion${dependencyCount === 1 ? '' : 'en'} wird/werden nach Änderungen automatisch aktualisiert. Wird das Profil offen oder ungültig, verschwindet die abhängige Geometrie bis die Kontur wieder gültig ist.`
    : 'Keine abhängige Extrusion.';
  q('#sketch-element-id').textContent = selected.elementId;
  fieldset.hidden = false;

  if (selected.kind === 'point') {
    const point = sketch.data?.points?.[selected.elementId];
    if (!point) { fieldset.hidden = true; return; }
    q('#sketch-element-legend').textContent = `Skizzenpunkt (${ui.unit()})`;
    pointEditor.hidden = false;
    lineEditor.hidden = true;
    q('#sketch-point-x').value = ui.fromMeters(point.x);
    q('#sketch-point-y').value = ui.fromMeters(point.y);
    return;
  }

  const line = sketch.data?.lines?.[selected.elementId];
  const a = line ? sketch.data.points?.[line.startPointId] : null;
  const b = line ? sketch.data.points?.[line.endPointId] : null;
  if (!line || !a || !b) { fieldset.hidden = true; return; }
  q('#sketch-element-legend').textContent = `Skizzenlinie (${ui.unit()})`;
  pointEditor.hidden = true;
  lineEditor.hidden = false;
  q('#sketch-line-ax').value = ui.fromMeters(a.x);
  q('#sketch-line-ay').value = ui.fromMeters(a.y);
  q('#sketch-line-bx').value = ui.fromMeters(b.x);
  q('#sketch-line-by').value = ui.fromMeters(b.y);
}

function installViewportEditing(runtime, store) {
  runtime.raycaster.params.Line.threshold = 0.025;

  runtime.createSketchVisual = (object, node) => {
    const planeGrid = new THREE.GridHelper(10, 20, 0x547088, 0x354654);
    planeGrid.rotation.x = Math.PI / 2;
    planeGrid.position.z = -0.00001;
    planeGrid.userData.cm3dSketchPlane = true;
    node.add(planeGrid);

    const points = Object.values(object.data?.points ?? {});
    const span = sketchSpan(points);
    const markerRadius = Math.max(span * 0.012, 0.004);

    for (const line of Object.values(object.data?.lines ?? {})) {
      const a = object.data.points?.[line.startPointId], b = object.data.points?.[line.endPointId];
      if (!a || !b) continue;
      const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(a.x, a.y, 0), new THREE.Vector3(b.x, b.y, 0)]);
      const visual = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xf4d35e }));
      visual.userData.cm3dObjectId = object.objectId;
      visual.userData.cm3dSketchElement = { sketchId: object.objectId, kind: 'line', elementId: line.lineId };
      node.add(visual);
      runtime.pickables.push(visual);
    }

    for (const point of points) {
      const marker = new THREE.Mesh(new THREE.SphereGeometry(markerRadius, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      marker.position.set(point.x, point.y, 0.002);
      marker.userData.cm3dObjectId = object.objectId;
      marker.userData.cm3dSketchElement = { sketchId: object.objectId, kind: 'point', elementId: point.pointId };
      node.add(marker);
      runtime.pickables.push(marker);
    }
  };

  const basePick = runtime.pick.bind(runtime);
  runtime.pick = event => {
    if (runtime.transform.dragging) return;
    runtime.pointerFromEvent(event);
    const first = runtime.raycaster.intersectObjects(runtime.pickables, false)[0];
    const element = first?.object?.userData?.cm3dSketchElement;
    if (element) {
      store.selectSketchElement(element.sketchId, element.kind, element.elementId);
      return;
    }
    basePick(event);
  };

  const baseSyncSelection = runtime.syncSelection.bind(runtime);
  runtime.syncSelection = () => {
    if (store.selection.sketchElement) runtime.transform.detach();
    else baseSyncSelection();
    updateSketchHighlight(runtime, store);
  };
}

function sketchSpan(points) {
  if (!points.length) return 1;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }
  return Math.max(maxX - minX, maxY - minY, 0.25);
}

function updateSketchHighlight(runtime, store) {
  const selected = store.selection.sketchElement;
  for (const node of runtime.objectMap.values()) {
    node.traverse(child => {
      const meta = child.userData?.cm3dSketchElement;
      if (!meta || !child.material?.color) return;
      const active = selected?.sketchId === meta.sketchId && selected?.kind === meta.kind && selected?.elementId === meta.elementId;
      child.material.color.set(active ? 0x63d6ff : meta.kind === 'line' ? 0xf4d35e : 0xffffff);
    });
  }
}

const style = document.createElement('style');
style.textContent = `
  .tree-sketch-section{font-size:11px;color:#8d98a6;margin-top:2px;user-select:none}
  .sketch-element-item{font-size:12px;min-height:26px}
  .tree-element-spacer{width:18px;display:inline-block}
  #sketch-element-fields{border-color:#3d6275;background:rgba(48,91,112,.12)}
  .sketch-subtitle{display:block;margin:8px 0 4px;font-size:11px;color:#9ca9b6}
  .sketch-dependency-note{font-size:11px;line-height:1.35;margin:8px 0}
`;
document.head.appendChild(style);
