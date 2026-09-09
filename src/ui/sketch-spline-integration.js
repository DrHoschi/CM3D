import * as THREE from 'three';

const SPLINE_RENDER_SEGMENTS = 64;

function deCasteljau(points, t) {
  let level = points.map(point => ({ x: point.x, y: point.y }));
  while (level.length > 1) {
    const next = [];
    for (let index = 0; index < level.length - 1; index += 1) {
      next.push({
        x: level[index].x + (level[index + 1].x - level[index].x) * t,
        y: level[index].y + (level[index + 1].y - level[index].y) * t
      });
    }
    level = next;
  }
  return level[0] ?? null;
}

export function buildSplineRenderPoints(start, controls, end, segments = SPLINE_RENDER_SEGMENTS) {
  if (!start || !end || !Array.isArray(controls) || controls.length < 1) return [];
  const polygon = [start, ...controls, end].map(point => ({ x: Number(point?.x), y: Number(point?.y) }));
  if (polygon.some(point => !Number.isFinite(point.x) || !Number.isFinite(point.y))) return [];
  const count = Math.max(8, Math.floor(Number(segments) || SPLINE_RENDER_SEGMENTS));
  const result = [];
  for (let index = 0; index <= count; index += 1) result.push(deCasteljau(polygon, index / count));
  return result;
}

export function installSketchSplineIntegration(store, runtime, ui) {
  if (!store?.addSketchSplineFromPoints || !store?.setSketchSplineGeometry) {
    throw new Error('WD-21C.8 requires the atomic spline creation contract.');
  }
  if (store.__cm3dSketchSplineIntegrationInstalled) return store.sketchSplineIntegration;

  installSplineToolButton(store, runtime);
  installSplineInput(store, runtime);
  installSplineTree(store, ui);
  installSplineInspector(store, ui);
  installSplineViewport(store, runtime);

  store.sketchSplineIntegration = Object.freeze({
    version: 'WD-21C.8',
    curveType: 'ordered-bezier',
    evaluator: 'de-casteljau',
    creationSequence: 'start-controls-end-explicit-finish',
    persistedTessellation: false,
    renderSegmentsInternalOnly: true,
    connectivityContractReused: true,
    controlPointsAreTopology: false,
    gizmoIncluded: false,
    controlHandlesIncluded: false,
    closedSplineIncluded: false,
    profilePathIntegrationIncluded: false,
    extrusionIntegrationIncluded: false
  });
  Object.defineProperty(store, '__cm3dSketchSplineIntegrationInstalled', { value: true });
  ui.render();
  runtime.rebuild();
  return store.sketchSplineIntegration;
}

function finishSpline(store, runtime) {
  const vertices = runtime.sketchInput.vertices ?? [];
  if (vertices.length < 3) return false;
  const start = vertices[0];
  const end = vertices.at(-1);
  const controls = vertices.slice(1, -1);
  const result = store.addSketchSplineFromPoints(runtime.sketchInput.sketchId, start, controls, end);
  if (!result) return false;
  const sketchId = runtime.sketchInput.sketchId;
  runtime.disableSketchInput(false);
  store.emit('sketchSplineCreated', { sketchId, ...result });
  return true;
}

function installSplineToolButton(store, runtime) {
  const context = document.querySelector('.context-set[data-context="sketch"]');
  if (!context || document.querySelector('#sketch-spline')) return;
  const button = document.createElement('button');
  button.id = 'sketch-spline';
  button.className = 'tool-button';
  button.innerHTML = '<span class="icon-tile">∿</span><span>Spline</span>';
  const divider = context.querySelector('.context-divider');
  context.insertBefore(button, divider ?? null);
  button.addEventListener('click', () => {
    if (runtime.sketchInput.enabled && runtime.sketchInput.mode === 'spline') {
      if (!finishSpline(store, runtime)) runtime.disableSketchInput(false);
      return;
    }
    if (runtime.sketchInput.enabled) runtime.disableSketchInput(false);
    const ok = runtime.enableSketchInput('spline');
    if (!ok) alert('Bitte zuerst „Neue Skizze“ anlegen oder eine vorhandene Skizze im Objektbaum auswählen.');
  });
  store.subscribe(event => {
    if (event.type !== 'sketchInputChanged') return;
    const active = event.enabled && event.mode === 'spline';
    button.classList.toggle('active', active);
    const label = button.querySelector('span:last-child');
    if (label) label.textContent = active ? 'Spline abschließen' : 'Spline';
  });
}

function installSplineInput(store, runtime) {
  const basePointerMove = runtime.handlePointerMove.bind(runtime);
  runtime.handlePointerMove = event => {
    if (runtime.sketchInput.enabled && runtime.sketchInput.mode === 'spline') {
      const point = runtime.sketchLocalPoint(event);
      if (!point) return;
      const vertices = runtime.sketchInput.vertices ?? [];
      if (!vertices.length) return;
      if (vertices.length === 1) runtime.updateSketchPreview([vertices[0], point]);
      else {
        const preview = buildSplineRenderPoints(vertices[0], [...vertices.slice(1), point].slice(0, -1), point);
        if (preview.length) runtime.updateSketchPreview(preview);
      }
      return;
    }
    basePointerMove(event);
  };

  const baseSketchInput = runtime.handleSketchInput.bind(runtime);
  runtime.handleSketchInput = event => {
    if (runtime.sketchInput.mode !== 'spline') return baseSketchInput(event);
    const point = runtime.sketchLocalPoint(event);
    if (!point) return;
    runtime.sketchInput.vertices ??= [];
    const previous = runtime.sketchInput.vertices.at(-1);
    if (previous && previous.x === point.x && previous.y === point.y) return;
    runtime.sketchInput.vertices.push(point);
    runtime.sketchInput.start = runtime.sketchInput.vertices[0] ?? null;
    const vertices = runtime.sketchInput.vertices;
    if (vertices.length === 1) runtime.updateSketchPreview([vertices[0], vertices[0]]);
    else if (vertices.length === 2) runtime.updateSketchPreview(vertices);
    else {
      const renderPoints = buildSplineRenderPoints(vertices[0], vertices.slice(1, -1), vertices.at(-1));
      if (renderPoints.length) runtime.updateSketchPreview(renderPoints);
    }
    store.emit('sketchSplinePointAdded', { sketchId: runtime.sketchInput.sketchId, count: vertices.length });
  };
}

function installSplineTree(store, ui) {
  const baseTreeNode = ui.treeNode.bind(ui);
  ui.treeNode = (object, depth) => {
    const wrap = baseTreeNode(object, depth);
    if (object.type !== 'sketch') return wrap;
    const splines = Object.values(object.data?.splines ?? {});
    if (!splines.length) return wrap;

    const section = document.createElement('div');
    section.className = 'tree-sketch-section';
    section.style.paddingLeft = `${8 + (depth + 1) * 16}px`;
    section.textContent = `Splines (${splines.length})`;
    wrap.appendChild(section);

    splines.forEach((spline, index) => {
      const row = document.createElement('div');
      const selected = store.selection.sketchElement;
      row.className = `tree-item sketch-element-item${selected?.sketchId === object.objectId && selected?.kind === 'spline' && selected?.elementId === spline.splineId ? ' selected' : ''}`;
      row.style.paddingLeft = `${8 + (depth + 2) * 16}px`;
      row.dataset.sketchElement = spline.splineId;
      row.dataset.sketchElementKind = 'spline';
      const spacer = document.createElement('span');
      spacer.className = 'tree-element-spacer';
      const label = document.createElement('span');
      label.textContent = `∿ Spline ${index + 1}`;
      row.append(spacer, label);
      row.addEventListener('click', event => {
        event.stopPropagation();
        store.selectSketchElement(object.objectId, 'spline', spline.splineId);
      });
      wrap.appendChild(row);
    });
    return wrap;
  };
}

function installSplineInspector(store, ui) {
  const host = document.querySelector('#sketch-element-fields');
  if (!host || host.querySelector('#sketch-spline-editor')) return;
  const arcEditor = host.querySelector('#sketch-arc-editor');
  const editor = document.createElement('div');
  editor.id = 'sketch-spline-editor';
  editor.hidden = true;
  (arcEditor ?? host.querySelector('#sketch-line-editor'))?.after(editor);

  const renderFields = spline => {
    editor.innerHTML = `
      <strong class="sketch-subtitle">Startpunkt</strong>
      <label>X <input data-spline-start-x type="number" step="0.001"/></label>
      <label>Y <input data-spline-start-y type="number" step="0.001"/></label>
      <strong class="sketch-subtitle">Endpunkt</strong>
      <label>X <input data-spline-end-x type="number" step="0.001"/></label>
      <label>Y <input data-spline-end-y type="number" step="0.001"/></label>
      ${spline.controls.map((control, index) => `
        <strong class="sketch-subtitle">Control ${index + 1}</strong>
        <div class="sketch-dependency-note">${control.controlId}</div>
        <label>X <input data-spline-control-x="${index}" type="number" step="0.001"/></label>
        <label>Y <input data-spline-control-y="${index}" type="number" step="0.001"/></label>
      `).join('')}
    `;
  };

  const commit = () => {
    const selected = store.selection.sketchElement;
    if (selected?.kind !== 'spline') return;
    const sketch = store.getObject(selected.sketchId);
    const spline = sketch?.data?.splines?.[selected.elementId];
    if (!spline) return;
    const controls = spline.controls.map((control, index) => ({
      controlId: control.controlId,
      x: ui.toMeters(editor.querySelector(`[data-spline-control-x="${index}"]`).value),
      y: ui.toMeters(editor.querySelector(`[data-spline-control-y="${index}"]`).value)
    }));
    store.setSketchSplineGeometry(selected.sketchId, selected.elementId, {
      start: {
        x: ui.toMeters(editor.querySelector('[data-spline-start-x]').value),
        y: ui.toMeters(editor.querySelector('[data-spline-start-y]').value)
      },
      end: {
        x: ui.toMeters(editor.querySelector('[data-spline-end-x]').value),
        y: ui.toMeters(editor.querySelector('[data-spline-end-y]').value)
      },
      controls
    });
  };
  editor.addEventListener('change', event => {
    if (event.target instanceof HTMLInputElement) commit();
  });

  const baseRenderInspector = ui.renderInspector.bind(ui);
  ui.renderInspector = () => {
    baseRenderInspector();
    const selected = store.selection.sketchElement;
    if (selected?.kind !== 'spline') {
      editor.hidden = true;
      return;
    }
    const sketch = store.getObject(selected.sketchId);
    const spline = sketch?.data?.splines?.[selected.elementId];
    const start = spline ? sketch.data?.points?.[spline.startPointId] : null;
    const end = spline ? sketch.data?.points?.[spline.endPointId] : null;
    if (!spline || !start || !end) {
      host.hidden = true;
      editor.hidden = true;
      return;
    }
    host.hidden = false;
    host.querySelector('#sketch-point-editor').hidden = true;
    host.querySelector('#sketch-line-editor').hidden = true;
    for (const other of ['#sketch-circle-editor', '#sketch-arc-editor']) {
      const element = host.querySelector(other);
      if (element) element.hidden = true;
    }
    renderFields(spline);
    editor.hidden = false;
    host.querySelector('#sketch-element-legend').textContent = `Skizzenspline (${ui.unit()})`;
    host.querySelector('#sketch-element-id').textContent = spline.splineId;
    editor.querySelector('[data-spline-start-x]').value = ui.fromMeters(start.x);
    editor.querySelector('[data-spline-start-y]').value = ui.fromMeters(start.y);
    editor.querySelector('[data-spline-end-x]').value = ui.fromMeters(end.x);
    editor.querySelector('[data-spline-end-y]').value = ui.fromMeters(end.y);
    spline.controls.forEach((control, index) => {
      editor.querySelector(`[data-spline-control-x="${index}"]`).value = ui.fromMeters(control.x);
      editor.querySelector(`[data-spline-control-y="${index}"]`).value = ui.fromMeters(control.y);
    });
    const note = host.querySelector('#sketch-dependency-note');
    if (note) note.textContent = 'Geordnete Bézier-Kurve. Start/Ende sind topologische Sketch-Punkte; Controls sind stabile geometrische Parameter und keine Connectivity-Ziele.';
  };
}

function installSplineViewport(store, runtime) {
  const baseCreateSketchVisual = runtime.createSketchVisual.bind(runtime);
  runtime.createSketchVisual = (object, node) => {
    baseCreateSketchVisual(object, node);
    for (const spline of Object.values(object.data?.splines ?? {})) {
      const start = object.data?.points?.[spline.startPointId];
      const end = object.data?.points?.[spline.endPointId];
      if (!start || !end) continue;
      const renderPoints = buildSplineRenderPoints(start, spline.controls, end);
      if (!renderPoints.length) continue;
      const geometry = new THREE.BufferGeometry().setFromPoints(renderPoints.map(point => new THREE.Vector3(point.x, point.y, 0)));
      const visual = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xf4d35e }));
      visual.userData.cm3dObjectId = object.objectId;
      visual.userData.cm3dSketchElement = { sketchId: object.objectId, kind: 'spline', elementId: spline.splineId };
      visual.userData.cm3dDerivedSplineTessellation = true;
      node.add(visual);
      runtime.pickables.push(visual);
    }
  };
}
