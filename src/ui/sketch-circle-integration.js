import * as THREE from 'three';

const CIRCLE_RENDER_SEGMENTS = 64;

export function buildCircleRenderPoints(circle, segments = CIRCLE_RENDER_SEGMENTS) {
  const count = Math.max(8, Math.floor(Number(segments) || CIRCLE_RENDER_SEGMENTS));
  const points = [];
  for (let index = 0; index <= count; index += 1) {
    const angle = (index / count) * Math.PI * 2;
    points.push({
      x: circle.center.x + Math.cos(angle) * circle.radius,
      y: circle.center.y + Math.sin(angle) * circle.radius
    });
  }
  return points;
}

export function installSketchCircleIntegration(store, runtime, ui) {
  if (!store?.addSketchCircle || !store?.setSketchCircle) throw new Error('WD-21C.4 requires the WD-21C.3 circle mutation contract.');
  if (store.__cm3dSketchCircleIntegrationInstalled) return store.sketchCircleIntegration;

  installCircleInput(store, runtime);
  installCircleTree(store, ui);
  installCircleInspector(store, ui);
  installCircleViewport(store, runtime);

  store.sketchCircleIntegration = Object.freeze({
    version: 'WD-21C.4',
    analyticIdentity: 'circleId+center+radius',
    centerTopologyPoint: false,
    persistedTessellation: false,
    renderSegmentsInternalOnly: true,
    profilePathIntegrationIncluded: false,
    extrusionIntegrationIncluded: false
  });
  Object.defineProperty(store, '__cm3dSketchCircleIntegrationInstalled', { value: true });
  ui.render();
  runtime.rebuild();
  return store.sketchCircleIntegration;
}

function installCircleInput(store, runtime) {
  const basePointerMove = runtime.handlePointerMove.bind(runtime);
  runtime.handlePointerMove = event => {
    if (runtime.sketchInput.enabled && runtime.sketchInput.mode === 'circle' && runtime.sketchInput.start) {
      const point = runtime.sketchLocalPoint(event);
      if (!point) return;
      const dx = point.x - runtime.sketchInput.start.x;
      const dy = point.y - runtime.sketchInput.start.y;
      const radius = Math.hypot(dx, dy);
      if (radius > 0) runtime.updateSketchPreview(buildCircleRenderPoints({ center: runtime.sketchInput.start, radius }));
      return;
    }
    basePointerMove(event);
  };

  const baseSketchInput = runtime.handleSketchInput.bind(runtime);
  runtime.handleSketchInput = event => {
    if (runtime.sketchInput.mode !== 'circle') return baseSketchInput(event);
    const point = runtime.sketchLocalPoint(event);
    if (!point) return;
    if (!runtime.sketchInput.start) {
      runtime.sketchInput.start = point;
      runtime.clearSketchPreview();
      store.emit('sketchCircleCenterSet', { sketchId: runtime.sketchInput.sketchId, center: { ...point } });
      return;
    }
    const center = runtime.sketchInput.start;
    const radius = Math.hypot(point.x - center.x, point.y - center.y);
    if (!(radius > 0)) return;
    const circleId = store.addSketchCircle(runtime.sketchInput.sketchId, center, radius);
    runtime.sketchInput.start = null;
    runtime.clearSketchPreview();
    if (circleId) store.emit('sketchCircleCreated', { sketchId: runtime.sketchInput.sketchId, circleId });
  };
}

function installCircleTree(store, ui) {
  const baseTreeNode = ui.treeNode.bind(ui);
  ui.treeNode = (object, depth) => {
    const wrap = baseTreeNode(object, depth);
    if (object.type !== 'sketch') return wrap;
    const circles = Object.values(object.data?.circles ?? {});
    if (!circles.length) return wrap;

    const section = document.createElement('div');
    section.className = 'tree-sketch-section';
    section.style.paddingLeft = `${8 + (depth + 1) * 16}px`;
    section.textContent = `Kreise (${circles.length})`;
    wrap.appendChild(section);

    circles.forEach((circle, index) => {
      const row = document.createElement('div');
      const selected = store.selection.sketchElement;
      row.className = `tree-item sketch-element-item${selected?.sketchId === object.objectId && selected?.kind === 'circle' && selected?.elementId === circle.circleId ? ' selected' : ''}`;
      row.style.paddingLeft = `${8 + (depth + 2) * 16}px`;
      row.dataset.sketchElement = circle.circleId;
      row.dataset.sketchElementKind = 'circle';
      const spacer = document.createElement('span');
      spacer.className = 'tree-element-spacer';
      const label = document.createElement('span');
      label.textContent = `○ Kreis ${index + 1}`;
      row.append(spacer, label);
      row.addEventListener('click', event => {
        event.stopPropagation();
        store.selectSketchElement(object.objectId, 'circle', circle.circleId);
      });
      wrap.appendChild(row);
    });
    return wrap;
  };
}

function installCircleInspector(store, ui) {
  const host = document.querySelector('#sketch-element-fields');
  if (!host || host.querySelector('#sketch-circle-editor')) return;
  const lineEditor = host.querySelector('#sketch-line-editor');
  const editor = document.createElement('div');
  editor.id = 'sketch-circle-editor';
  editor.hidden = true;
  editor.innerHTML = `
    <strong class="sketch-subtitle">Mittelpunkt</strong>
    <label>X <input id="sketch-circle-x" type="number" step="0.001"/></label>
    <label>Y <input id="sketch-circle-y" type="number" step="0.001"/></label>
    <label>Radius <input id="sketch-circle-radius" type="number" min="0.000000001" step="0.001"/></label>
  `;
  lineEditor?.after(editor);

  const centerX = editor.querySelector('#sketch-circle-x');
  const centerY = editor.querySelector('#sketch-circle-y');
  const radius = editor.querySelector('#sketch-circle-radius');
  const commit = () => {
    const selected = store.selection.sketchElement;
    if (selected?.kind !== 'circle') return;
    store.setSketchCircle(selected.sketchId, selected.elementId, {
      center: { x: ui.toMeters(centerX.value), y: ui.toMeters(centerY.value) },
      radius: ui.toMeters(radius.value)
    });
  };
  for (const input of [centerX, centerY, radius]) input.addEventListener('change', commit);

  const baseRenderInspector = ui.renderInspector.bind(ui);
  ui.renderInspector = () => {
    baseRenderInspector();
    const selected = store.selection.sketchElement;
    const pointEditor = host.querySelector('#sketch-point-editor');
    const existingLineEditor = host.querySelector('#sketch-line-editor');
    if (selected?.kind !== 'circle') {
      editor.hidden = true;
      return;
    }
    const sketch = store.getObject(selected.sketchId);
    const circle = sketch?.data?.circles?.[selected.elementId];
    if (!circle) {
      host.hidden = true;
      editor.hidden = true;
      return;
    }
    host.hidden = false;
    pointEditor.hidden = true;
    existingLineEditor.hidden = true;
    editor.hidden = false;
    host.querySelector('#sketch-element-legend').textContent = `Skizzenkreis (${ui.unit()})`;
    host.querySelector('#sketch-element-id').textContent = circle.circleId;
    centerX.value = ui.fromMeters(circle.center.x);
    centerY.value = ui.fromMeters(circle.center.y);
    radius.value = ui.fromMeters(circle.radius);
    const note = host.querySelector('#sketch-dependency-note');
    if (note) note.textContent = 'Analytischer Kreis. Mittelpunkt und Radius sind geometrische Parameter; der Mittelpunkt ist kein topologischer Sketch-Punkt.';
  };
}

function installCircleViewport(store, runtime) {
  const baseCreateSketchVisual = runtime.createSketchVisual.bind(runtime);
  runtime.createSketchVisual = (object, node) => {
    baseCreateSketchVisual(object, node);
    for (const circle of Object.values(object.data?.circles ?? {})) {
      const renderPoints = buildCircleRenderPoints(circle);
      const geometry = new THREE.BufferGeometry().setFromPoints(renderPoints.map(point => new THREE.Vector3(point.x, point.y, 0)));
      const visual = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xf4d35e }));
      visual.userData.cm3dObjectId = object.objectId;
      visual.userData.cm3dSketchElement = { sketchId: object.objectId, kind: 'circle', elementId: circle.circleId };
      visual.userData.cm3dDerivedCircleTessellation = true;
      node.add(visual);
      runtime.pickables.push(visual);
    }
  };
}
