import { createSketchPoint } from '../model/project.js';

const MUTATION_OWNER = 'central-sketch-mutation';
const finitePoint = value => {
  const x = Number(value?.x), y = Number(value?.y);
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
};
const newSplineId = () => `spline_${crypto.randomUUID()}`;
const newControlId = () => `ctl_${crypto.randomUUID()}`;

function markMutationOwner(fn) {
  Object.defineProperty(fn, '__cm3dMutationOwner', { value: MUTATION_OWNER, configurable: false });
  return fn;
}

export function installSketchSplineCreationContract(store) {
  if (!store || typeof store.runSketchMutation !== 'function') {
    throw new Error('WD-21C.8 requires the central runSketchMutation contract.');
  }
  if (store.__cm3dSketchSplineCreationInstalled) return store.sketchSplineCreationContract;

  store.addSketchSplineFromPoints = markMutationOwner((sketchId, start, controls, end) => {
    const a = finitePoint(start), b = finitePoint(end);
    if (!a || !b || (a.x === b.x && a.y === b.y) || !Array.isArray(controls) || controls.length < 1) return null;
    const normalizedControls = controls.map(finitePoint);
    if (normalizedControls.some(control => !control)) return null;

    const result = store.runSketchMutation(sketchId, 'Skizzenspline erzeugen', sketch => {
      const startPoint = createSketchPoint(a.x, a.y);
      const endPoint = createSketchPoint(b.x, b.y);
      const splineId = newSplineId();
      sketch.data.points[startPoint.pointId] = startPoint;
      sketch.data.points[endPoint.pointId] = endPoint;
      sketch.data.splines ??= {};
      sketch.data.splines[splineId] = {
        splineId,
        startPointId: startPoint.pointId,
        endPointId: endPoint.pointId,
        controls: normalizedControls.map(control => ({ controlId: newControlId(), ...control }))
      };
      return {
        splineId,
        startPointId: startPoint.pointId,
        endPointId: endPoint.pointId,
        controlIds: sketch.data.splines[splineId].controls.map(control => control.controlId)
      };
    });
    return result === false ? null : result;
  });

  store.setSketchSplineGeometry = markMutationOwner((sketchId, splineId, next) => {
    const start = finitePoint(next?.start), end = finitePoint(next?.end);
    if (!splineId || !start || !end || !Array.isArray(next?.controls) || next.controls.length < 1) return false;
    return store.runSketchMutation(sketchId, 'Skizzenspline ändern', sketch => {
      const spline = sketch.data?.splines?.[splineId];
      if (!spline || next.controls.length !== spline.controls.length) return false;
      const a = sketch.data?.points?.[spline.startPointId];
      const b = sketch.data?.points?.[spline.endPointId];
      if (!a || !b) return false;

      const controls = [];
      for (let index = 0; index < spline.controls.length; index += 1) {
        const current = spline.controls[index];
        const requested = next.controls[index];
        const normalized = finitePoint(requested);
        if (!normalized || requested?.controlId !== current.controlId) return false;
        controls.push({ controlId: current.controlId, ...normalized });
      }

      const unchanged = a.x === start.x && a.y === start.y
        && b.x === end.x && b.y === end.y
        && controls.every((control, index) => control.x === spline.controls[index].x && control.y === spline.controls[index].y);
      if (unchanged) return false;

      a.x = start.x; a.y = start.y;
      b.x = end.x; b.y = end.y;
      spline.controls = controls;
      return true;
    }, { selectionChanged: true });
  });

  store.sketchSplineCreationContract = Object.freeze({
    version: 'WD-21C.8',
    mutationOwner: MUTATION_OWNER,
    curveType: 'ordered-bezier',
    evaluator: 'de-casteljau',
    creationSequence: 'start-controls-end-explicit-finish',
    minimumControls: 1,
    atomicCreation: true,
    historyEntriesPerCreation: 1,
    endpointIdsStableOnEdit: true,
    controlIdsStableOnEdit: true,
    controlCountStableOnEdit: true,
    controlOrderStableOnEdit: true,
    geometricRebinding: false,
    transactionPath: 'runSketchMutation',
    closedSplineIncluded: false,
    profilePathIntegrationIncluded: false
  });
  Object.defineProperty(store, '__cm3dSketchSplineCreationInstalled', { value: true });
  return store.sketchSplineCreationContract;
}
