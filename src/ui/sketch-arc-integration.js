import * as THREE from 'three';

const ARC_RENDER_SEGMENTS = 64;
const TAU = Math.PI * 2;
const positiveAngle = value => ((value % TAU) + TAU) % TAU;

export function buildArcRenderPoints(start, end, control, segments = ARC_RENDER_SEGMENTS) {
  const ax = Number(start?.x), ay = Number(start?.y);
  const bx = Number(end?.x), by = Number(end?.y);
  const cx = Number(control?.x), cy = Number(control?.y);
  if (![ax, ay, bx, by, cx, cy].every(Number.isFinite)) return [];

  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  if (d === 0) return [];
  const a2 = ax * ax + ay * ay, b2 = bx * bx + by * by, c2 = cx * cx + cy * cy;
  const ux = (a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / d;
  const uy = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / d;
  const radius = Math.hypot(ax - ux, ay - uy);
  if (!(radius > 0)) return [];

  const startAngle = Math.atan2(ay - uy, ax - ux);
  const endAngle = Math.atan2(by - uy, bx - ux);
  const controlAngle = Math.atan2(cy - uy, cx - ux);
  const ccwSweep = positiveAngle(endAngle - startAngle);
  const controlFromStart = positiveAngle(controlAngle - startAngle);
  const sweep = controlFromStart <= ccwSweep ? ccwSweep : ccwSweep - TAU;
  if (sweep === 0) return [];

  const count = Math.max(8, Math.floor(Number(segments) || ARC_RENDER_SEGMENTS));
  const points = [];
  for (let index = 0; index <= count; index += 1) {
    const angle = startAngle + sweep * (index / count);
    points.push({ x: ux + Math.cos(angle) * radius, y: uy + Math.sin(angle) * radius });
  }
  return points;
}

export function installSketchArcIntegration(store, runtime, ui) {
  if (!store?.addSketchArcFromPoints || !store?.setSketchArcGeometry) {
    throw new Error('WD-21C.7 requires the atomic arc creation contract.');
  }
  if (store.__cm3dSketchArcIntegrationInstalled) return store.sketchArcIntegration;

  installArcToolButton(store, runtime);
  installArcInput(store, runtime);
  installArcTree(store, ui);
  installArcInspector(store, ui);
  installArcViewport(store, runtime);

  store.sketchArcIntegration = Object.freeze({
    version: 'WD-21C.7',
    analyticIdentity: 'arcId+startPointId+endPointId+control',
    creationSequence: 'start-end-control',
    persistedTessellation: false,
    renderSegmentsInternalOnly: true,
    connectivityContractReused: true,
    gizmoIncluded: false,
    splineIncluded: false,
    profilePathIntegrationIncluded: false,
    extrusionIntegrationIncluded: false
  });
  Object.defineProperty(store, '__cm3dSketchArcIntegrationInstalled', { value: true });
  ui.render();
  runtime.rebuild();
  return store.sketchArcIntegration;
}

function installArcToolButton(store, runtime) {
  const context = document.querySelector('.context-set[data-context="sketch"]');
  if (!context || document.querySelector('#sketch-arc')) return;
  const button = document.createElement('button');
  button.id = 'sketch-arc';
  button.className = 'tool-button';
  button.innerHTML = '<span class="icon-tile">⌒</span><span>Bogen</span>';
  const divider = context.querySelector('.context-divider');
  context.insertBefore(button, divider ?? null);
  button.addEventListener('click', () => {
    const ok = runtime.toggleSketchInput('arc');
    if (!ok) alert('Bitte zuerst „Neue Skizze“ anlegen oder eine vorhandene Skizze im Objektbaum auswählen.');
  });
  store.subscribe(event => {
    if (event.type !== 'sketchInputChanged') return;
    const active = event.enabled && event.mode === 'arc';
    button.classList.toggle('active', active);
    const label = button.querySelector('span:last-child');
    if (label) label.textContent = active ? 'Bogen beenden' : 'Bogen';
  });
}

function installArcInput(store, runtime) {
  const basePointerMove = runtime.handlePointerMove.bind(runtime);
  runtime.handlePointerMove = event => {
    if (runtime.sketchInput.enabled && runtime.sketchInput.mode === 'arc') {
      const point = runtime.sketchLocalPoint(event);
      if (!point) return;
      const vertices = runtime.sketchInput.vertices ?? [];
      if (vertices.length === 1) runtime.updateSketchPreview([vertices[0], point]);
      else if (vertices.length === 2) {
        const points = buildArcRenderPoints(vertices[0], vertices[1], point);
        if (points.length) runtime.updateSketchPreview(points);
      }
      return;
    }
    basePointerMove(event);
  };

  const baseSketchInput = runtime.handleSketchInput.bind(runtime);
  runtime.handleSketchInput = event => {
    if (runtime.sketchInput.mode !== 'arc') return baseSketchInput(event);
    const point = runtime.sketchLocalPoint(event);
    if (!point) return;
    runtime.sketchInput.vertices ??= [];
    if (runtime.sketchInput.vertices.length < 2) {
      const previous = runtime.sketchInput.vertices.at(-1);
      if (previous && previous.x === point.x && previous.y === point.y) return;
      runtime.sketchInput.vertices.push(point);
      runtime.sketchInput.start = runtime.sketchInput.vertices[0] ?? null;
      runtime.updateSketchPreview(runtime.sketchInput.vertices);
      store.emit('sketchArcPointAdded', { sketchId: runtime.sketchInput.sketchId, count: runtime.sketchInput.vertices.length });
      return;
    }

    const [start, end] = runtime.sketchInput.vertices;
    const preview = buildArcRenderPoints(start, end, point);
    if (!preview.length) return;
    const result = store.addSketchArcFromPoints(runtime.sketchInput.sketchId, start, end, point);
    if (!result) return;
    runtime.sketchInput.start = null;
    runtime.sketchInput.vertices = [];
    runtime.clearSketchPreview();
    store.emit('sketchArcCreated', { sketchId: runtime.sketchInput.sketchId, ...result });
  };
}

function installArcTree(store, ui) {
  const baseTreeNode = ui.treeNode.bind(ui);
  ui.treeNode = (object, depth) => {
    const wrap = baseTreeNode(object, depth);
    if (object.type !== 'sketch') return wrap;
    const arcs = Object.values(object.data?.arcs ?? {});
    if (!arcs.length) return wrap;

    const section = document.createElement('div');
    section.className = 'tree-sketch-section';
    section.style.paddingLeft = `${8 + (depth + 1) * 16}px`;
    section.textContent = `Bögen (${arcs.length})`;
    wrap.appendChild(section);

    arcs.forEach((arc, index) => {
      const row = document.createElement('div');
      const selected = store.selection.sketchElement;
      row.className = `tree-item sketch-element-item${selected?.sketchId === object.objectId && selected?.kind === 'arc' && selected?.elementId === arc.arcId ? ' selected' : ''}`;
      row.style.paddingLeft = `${8 + (depth + 2) * 16}px`;
      row.dataset.sketchElement = arc.arcId;
      row.dataset.sketchElementKind = 'arc';
      const spacer = document.createElement('span');
      spacer.className = 'tree-element-spacer';
      const label = document.createElement('span');
      label.textContent = `⌒ Bogen ${index + 1}`;
      row.append(spacer, label);
      row.addEventListener('click', event => {
        event.stopPropagation();
        store.selectSketchElement(object.objectId, 'arc', arc.arcId);
      });
      wrap.appendChild(row);
    });
    return wrap;
  };
}

function installArcInspector(store, ui) {
  const host = document.querySelector('#sketch-element-fields');
  if (!host || host.querySelector('#sketch-arc-editor')) return;
  const circleEditor = host.querySelector('#sketch-circle-editor');
  const lineEditor = host.querySelector('#sketch-line-editor');
  const editor = document.createElement('div');
  editor.id = 'sketch-arc-editor';
  editor.hidden = true;
  editor.innerHTML = `
    <strong class="sketch-subtitle">Startpunkt</strong>
    <label>X <input id="sketch-arc-start-x" type="number" step="0.001"/></label>
    <label>Y <input id="sketch-arc-start-y" type="number" step="0.001"/></label>
    <strong class="sketch-subtitle">Endpunkt</strong>
    <label>X <input id="sketch-arc-end-x" type="number" step="0.001"/></label>
    <label>Y <input id="sketch-arc-end-y" type="number" step="0.001"/></label>
    <strong class="sketch-subtitle">Kontrollpunkt</strong>
    <label>X <input id="sketch-arc-control-x" type="number" step="0.001"/></label>
    <label>Y <input id="sketch-arc-control-y" type="number" step="0.001"/></label>
  `;
  (circleEditor ?? lineEditor)?.after(editor);

  const fields = {
    sx: editor.querySelector('#sketch-arc-start-x'), sy: editor.querySelector('#sketch-arc-start-y'),
    ex: editor.querySelector('#sketch-arc-end-x'), ey: editor.querySelector('#sketch-arc-end-y'),
    cx: editor.querySelector('#sketch-arc-control-x'), cy: editor.querySelector('#sketch-arc-control-y')
  };
  const commit = () => {
    const selected = store.selection.sketchElement;
    if (selected?.kind !== 'arc') return;
    store.setSketchArcGeometry(selected.sketchId, selected.elementId, {
      start: { x: ui.toMeters(fields.sx.value), y: ui.toMeters(fields.sy.value) },
      end: { x: ui.toMeters(fields.ex.value), y: ui.toMeters(fields.ey.value) },
      control: { x: ui.toMeters(fields.cx.value), y: ui.toMeters(fields.cy.value) }
    });
  };
  for (const input of Object.values(fields)) input.addEventListener('change', commit);

  const baseRenderInspector = ui.renderInspector.bind(ui);
  ui.renderInspector = () => {
    baseRenderInspector();
    const selected = store.selection.sketchElement;
    if (selected?.kind !== 'arc') {
      editor.hidden = true;
      return;
    }
    const sketch = store.getObject(selected.sketchId);
    const arc = sketch?.data?.arcs?.[selected.elementId];
    const start = arc ? sketch.data?.points?.[arc.startPointId] : null;
    const end = arc ? sketch.data?.points?.[arc.endPointId] : null;
    if (!arc || !start || !end) {
      host.hidden = true;
      editor.hidden = true;
      return;
    }
    host.hidden = false;
    host.querySelector('#sketch-point-editor').hidden = true;
    host.querySelector('#sketch-line-editor').hidden = true;
    const existingCircle = host.querySelector('#sketch-circle-editor');
    if (existingCircle) existingCircle.hidden = true;
    editor.hidden = false;
    host.querySelector('#sketch-element-legend').textContent = `Skizzenbogen (${ui.unit()})`;
    host.querySelector('#sketch-element-id').textContent = arc.arcId;
    fields.sx.value = ui.fromMeters(start.x); fields.sy.value = ui.fromMeters(start.y);
    fields.ex.value = ui.fromMeters(end.x); fields.ey.value = ui.fromMeters(end.y);
    fields.cx.value = ui.fromMeters(arc.control.x); fields.cy.value = ui.fromMeters(arc.control.y);
    const note = host.querySelector('#sketch-dependency-note');
    if (note) note.textContent = 'Analytischer Drei-Punkt-Bogen. Start/Ende sind topologische Sketch-Punkte; der Kontrollpunkt ist nur Geometrieparameter.';
  };
}

function installArcViewport(store, runtime) {
  const baseCreateSketchVisual = runtime.createSketchVisual.bind(runtime);
  runtime.createSketchVisual = (object, node) => {
    baseCreateSketchVisual(object, node);
    for (const arc of Object.values(object.data?.arcs ?? {})) {
      const start = object.data?.points?.[arc.startPointId];
      const end = object.data?.points?.[arc.endPointId];
      if (!start || !end) continue;
      const renderPoints = buildArcRenderPoints(start, end, arc.control);
      if (!renderPoints.length) continue;
      const geometry = new THREE.BufferGeometry().setFromPoints(renderPoints.map(point => new THREE.Vector3(point.x, point.y, 0)));
      const visual = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xf4d35e }));
      visual.userData.cm3dObjectId = object.objectId;
      visual.userData.cm3dSketchElement = { sketchId: object.objectId, kind: 'arc', elementId: arc.arcId };
      visual.userData.cm3dDerivedArcTessellation = true;
      node.add(visual);
      runtime.pickables.push(visual);
    }
  };
}
