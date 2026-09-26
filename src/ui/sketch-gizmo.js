import * as THREE from 'three';

const AXIS_LENGTH = 0.5;
const AXIS_HEAD_LENGTH = 0.12;
const AXIS_HEAD_RADIUS = 0.045;
const PLANE_HANDLE_OFFSET = 0.105;
const PLANE_HANDLE_SIZE = 0.16;
const SNAP_EPS = 1e-12;
const X_COLOR = 0xff3b30;
const Y_COLOR = 0x34c759;
const XY_COLOR = 0xffd60a;

export function installSketchGizmo(store, runtime) {
  const state = {
    group: null,
    pickables: [],
    drag: null,
    previousEnableRotate: runtime.orbit.enableRotate,
    suppressNextSelectionAlign: false
  };

  const selected = () => store.getSelectedSketchElements?.() ?? (store.selection.sketchElement ? [store.selection.sketchElement] : []);
  const primary = () => selected().at(-1) ?? null;
  const sketch = () => {
    const item = primary();
    return item ? store.getObject(item.sketchId) : null;
  };

  const uniquePointIds = (items, currentSketch) => {
    const ids = new Set();
    for (const item of items) {
      if (item.kind === 'point') {
        ids.add(item.elementId);
        continue;
      }
      if (item.kind !== 'line') continue;
      const line = currentSketch.data?.lines?.[item.elementId];
      if (line) {
        ids.add(line.startPointId);
        ids.add(line.endPointId);
      }
    }
    return [...ids].filter(id => currentSketch.data?.points?.[id]);
  };

  const manipulationAdapter = (items, currentSketch) => {
    if (!items.length || currentSketch?.type !== 'sketch') return null;

    if (items.length === 1 && items[0].kind === 'circle') {
      const item = items[0];
      const circle = currentSketch.data?.circles?.[item.elementId];
      if (!circle) return null;
      return {
        kind: 'circle',
        label: 'Skizzenkreis per Gizmo verschieben',
        anchor: new THREE.Vector3(circle.center.x, circle.center.y, 0),
        initial: {
          circleId: circle.circleId,
          center: { x: circle.center.x, y: circle.center.y },
          radius: circle.radius
        }
      };
    }

    if (!items.every(item => item.kind === 'point' || item.kind === 'line')) return null;
    const pointIds = uniquePointIds(items, currentSketch);
    if (!pointIds.length) return null;
    const points = Object.fromEntries(pointIds.map(pointId => {
      const point = currentSketch.data.points[pointId];
      return [pointId, { x: point.x, y: point.y }];
    }));
    const sum = pointIds.reduce((value, pointId) => {
      value.x += points[pointId].x;
      value.y += points[pointId].y;
      return value;
    }, { x: 0, y: 0 });
    const label = items.length > 1
      ? 'Skizzenauswahl per Gizmo verschieben'
      : items[0].kind === 'point'
        ? 'Skizzenpunkt per Gizmo verschieben'
        : 'Skizzenlinie per Gizmo verschieben';
    return {
      kind: 'topology-points',
      label,
      anchor: new THREE.Vector3(sum.x / pointIds.length, sum.y / pointIds.length, 0),
      initial: { pointIds, points }
    };
  };

  const adapterForSelection = () => manipulationAdapter(selected(), sketch());
  const anchorLocal = () => adapterForSelection()?.anchor ?? null;

  const dispose = () => {
    if (!state.group) return;
    state.group.traverse(node => {
      node.geometry?.dispose?.();
      if (Array.isArray(node.material)) node.material.forEach(material => material?.dispose?.());
      else node.material?.dispose?.();
    });
    state.group.parent?.remove(state.group);
    state.group = null;
    state.pickables = [];
  };

  const alignCameraToSketch = () => {
    const item = primary();
    const node = item ? runtime.objectMap.get(item.sketchId) : null;
    const anchor = anchorLocal();
    if (!item || !node || !anchor) return false;
    node.updateWorldMatrix(true, false);
    const target = node.localToWorld(anchor.clone());
    const normal = new THREE.Vector3(0, 0, 1).transformDirection(node.matrixWorld).normalize();
    const up = new THREE.Vector3(0, 1, 0).transformDirection(node.matrixWorld).normalize();
    const distance = Math.max(runtime.camera.position.distanceTo(runtime.orbit.target), 0.25);
    runtime.orbit.target.copy(target);
    runtime.camera.up.copy(up);
    runtime.camera.position.copy(target).addScaledVector(normal, distance);
    runtime.camera.lookAt(target);
    runtime.orbit.update();
    runtime.updateCameraRange?.();
    runtime.updateGrid?.();
    return true;
  };

  const syncSelectionCamera = () => {
    const item = primary();
    if (!item) return false;
    const adapter = adapterForSelection();
    if (adapter) return alignCameraToSketch();
    runtime.orbit.enableRotate = state.previousEnableRotate;
    runtime.focusSelection();
    return true;
  };

  const makeAxis = axis => {
    const group = new THREE.Group();
    const direction = axis === 'x' ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const color = axis === 'x' ? X_COLOR : Y_COLOR;
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), direction.clone().multiplyScalar(AXIS_LENGTH - AXIS_HEAD_LENGTH * 0.45)]),
      new THREE.LineBasicMaterial({ color, depthTest: false })
    );
    line.renderOrder = 1000;
    group.add(line);
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(AXIS_HEAD_RADIUS, AXIS_HEAD_LENGTH, 16),
      new THREE.MeshBasicMaterial({ color, depthTest: false })
    );
    cone.position.copy(direction).multiplyScalar(AXIS_LENGTH);
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    cone.renderOrder = 1001;
    group.add(cone);
    const hit = new THREE.Mesh(
      new THREE.BoxGeometry(axis === 'x' ? AXIS_LENGTH + 0.12 : 0.18, axis === 'y' ? AXIS_LENGTH + 0.12 : 0.18, 0.1),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    hit.position.copy(direction).multiplyScalar(AXIS_LENGTH / 2);
    hit.userData.cm3dSketchGizmoAxis = axis;
    group.add(hit);
    state.pickables.push(hit);
    return group;
  };

  const makePlane = () => {
    const group = new THREE.Group();
    const position = PLANE_HANDLE_OFFSET + PLANE_HANDLE_SIZE / 2;
    const fill = new THREE.Mesh(
      new THREE.PlaneGeometry(PLANE_HANDLE_SIZE, PLANE_HANDLE_SIZE),
      new THREE.MeshBasicMaterial({ color: XY_COLOR, transparent: true, opacity: 0.42, depthTest: false, side: THREE.DoubleSide })
    );
    fill.position.set(position, position, 0);
    fill.renderOrder = 1002;
    group.add(fill);
    const hit = new THREE.Mesh(
      new THREE.PlaneGeometry(PLANE_HANDLE_SIZE + 0.08, PLANE_HANDLE_SIZE + 0.08),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })
    );
    hit.position.copy(fill.position);
    hit.userData.cm3dSketchGizmoAxis = 'xy';
    group.add(hit);
    state.pickables.push(hit);
    return group;
  };

  const rebuildGizmo = (align = true) => {
    dispose();
    const item = primary();
    const node = item ? runtime.objectMap.get(item.sketchId) : null;
    const adapter = adapterForSelection();
    if (!item || !node || !adapter) {
      runtime.orbit.enableRotate = state.previousEnableRotate;
      return;
    }
    if (align) alignCameraToSketch();
    runtime.orbit.enableRotate = false;
    const group = new THREE.Group();
    group.name = 'CM3D_SKETCH_GIZMO';
    group.add(makeAxis('x'), makeAxis('y'), makePlane());
    node.add(group);
    group.position.copy(adapter.anchor);
    state.group = group;
  };

  const localPoint = (event, sketchId) => {
    const node = runtime.objectMap.get(sketchId);
    if (!node) return null;
    node.updateWorldMatrix(true, false);
    runtime.pointerFromEvent(event);
    const origin = node.getWorldPosition(new THREE.Vector3());
    const normal = new THREE.Vector3(0, 0, 1).transformDirection(node.matrixWorld);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, origin);
    const world = new THREE.Vector3();
    if (!runtime.raycaster.ray.intersectPlane(plane, world)) return null;
    return node.worldToLocal(world.clone());
  };

  const snap = value => {
    if (!store.snap.enabled) return value;
    const step = Number(store.snap.translate);
    return Number.isFinite(step) && step > SNAP_EPS ? Math.round(value / step) * step : value;
  };

  const applyPreview = (drag, dx, dy) => {
    const currentSketch = store.getObject(drag.sketchId);
    if (currentSketch?.type !== 'sketch') return false;
    if (drag.adapter.kind === 'circle') {
      const circle = currentSketch.data?.circles?.[drag.adapter.initial.circleId];
      if (!circle) return false;
      circle.center.x = drag.adapter.initial.center.x + dx;
      circle.center.y = drag.adapter.initial.center.y + dy;
      return true;
    }
    for (const pointId of drag.adapter.initial.pointIds) {
      const point = currentSketch.data?.points?.[pointId];
      const initial = drag.adapter.initial.points[pointId];
      if (!point || !initial) return false;
      point.x = initial.x + dx;
      point.y = initial.y + dy;
    }
    return true;
  };

  const restoreInitial = drag => applyPreview(drag, 0, 0);

  const commitDrag = drag => {
    const { dx, dy } = drag.delta;
    if (Math.abs(dx) <= SNAP_EPS && Math.abs(dy) <= SNAP_EPS) return false;
    return store.runSketchMutation(drag.sketchId, drag.adapter.label, currentSketch => {
      if (drag.adapter.kind === 'circle') {
        const circle = currentSketch.data?.circles?.[drag.adapter.initial.circleId];
        if (!circle) return false;
        circle.center = {
          x: drag.adapter.initial.center.x + dx,
          y: drag.adapter.initial.center.y + dy
        };
        circle.radius = drag.adapter.initial.radius;
        return true;
      }
      for (const pointId of drag.adapter.initial.pointIds) {
        const point = currentSketch.data?.points?.[pointId];
        const initial = drag.adapter.initial.points[pointId];
        if (!point || !initial) return false;
        point.x = initial.x + dx;
        point.y = initial.y + dy;
      }
      return true;
    }, { selectionChanged: true });
  };

  const startDrag = event => {
    if (!state.pickables.length) return false;
    runtime.pointerFromEvent(event);
    const hit = runtime.raycaster.intersectObjects(state.pickables, false)[0];
    const items = selected();
    const item = primary();
    const currentSketch = sketch();
    const adapter = manipulationAdapter(items, currentSketch);
    if (!hit || !items.length || !item || !adapter || currentSketch?.type !== 'sketch') return false;
    const start = localPoint(event, item.sketchId);
    if (!start) return false;
    state.drag = {
      pointerId: event.pointerId,
      sketchId: item.sketchId,
      items: structuredClone(items),
      axis: hit.object.userData.cm3dSketchGizmoAxis,
      start: { x: start.x, y: start.y },
      adapter,
      delta: { dx: 0, dy: 0 }
    };
    runtime.orbit.enabled = false;
    runtime.renderer.domElement.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    event.stopImmediatePropagation();
    return true;
  };

  const updateDrag = event => {
    const drag = state.drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const point = localPoint(event, drag.sketchId);
    if (!point) return;
    let dx = point.x - drag.start.x;
    let dy = point.y - drag.start.y;
    if (drag.axis === 'x') dy = 0;
    if (drag.axis === 'y') dx = 0;
    dx = snap(drag.adapter.anchor.x + dx) - drag.adapter.anchor.x;
    dy = snap(drag.adapter.anchor.y + dy) - drag.adapter.anchor.y;
    drag.delta = { dx, dy };
    if (!applyPreview(drag, dx, dy)) return;
    runtime.rebuild();
    store.emit('sketchGizmoPreview', { sketchId: drag.sketchId, count: drag.items.length, kind: drag.adapter.kind });
    rebuildGizmo(false);
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  const finishDrag = event => {
    const drag = state.drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    state.drag = null;
    runtime.renderer.domElement.releasePointerCapture?.(event.pointerId);
    runtime.orbit.enabled = true;
    runtime.orbit.enableRotate = false;
    restoreInitial(drag);
    const committed = commitDrag(drag);
    if (!committed) runtime.rebuild();
    state.suppressNextSelectionAlign = true;
    rebuildGizmo(false);
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  const cancelDrag = event => {
    const drag = state.drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    state.drag = null;
    runtime.renderer.domElement.releasePointerCapture?.(event.pointerId);
    runtime.orbit.enabled = true;
    runtime.orbit.enableRotate = false;
    restoreInitial(drag);
    runtime.rebuild();
    rebuildGizmo(false);
    store.emit('sketchGizmoCancelled', { sketchId: drag.sketchId });
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  const canvas = runtime.renderer.domElement;
  canvas.addEventListener('pointerdown', startDrag, true);
  window.addEventListener('pointermove', updateDrag, true);
  window.addEventListener('pointerup', finishDrag, true);
  window.addEventListener('pointercancel', cancelDrag, true);

  store.subscribe(event => {
    if (!['selectionChanged', 'projectChanged', 'projectLoaded', 'geometryChanged', 'objectChanged'].includes(event.type) || state.drag) return;
    let align = event.type === 'selectionChanged';
    if (align && state.suppressNextSelectionAlign) {
      align = false;
      state.suppressNextSelectionAlign = false;
    }
    setTimeout(() => {
      if (align && primary() && !adapterForSelection()) {
        dispose();
        syncSelectionCamera();
        return;
      }
      rebuildGizmo(align);
    }, 0);
  });

  rebuildGizmo();
  return Object.freeze({
    version: 'WD-21C.5',
    alignCameraToSketch,
    rebuildGizmo,
    manipulationKinds: Object.freeze(['point', 'line', 'circle']),
    circleMoveChangesRadius: false,
    mixedCircleSelectionIncluded: false,
    centralCommit: 'runSketchMutation'
  });
}
