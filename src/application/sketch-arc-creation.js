import { createSketchPoint } from '../model/project.js';

const MUTATION_OWNER = 'central-sketch-mutation';
const finitePoint = value => {
  const x = Number(value?.x), y = Number(value?.y);
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
};
const newArcId = () => `arc_${crypto.randomUUID()}`;

function markMutationOwner(fn) {
  Object.defineProperty(fn, '__cm3dMutationOwner', { value: MUTATION_OWNER, configurable: false });
  return fn;
}

export function installSketchArcCreationContract(store) {
  if (!store || typeof store.runSketchMutation !== 'function') {
    throw new Error('WD-21C.7 requires the central runSketchMutation contract.');
  }
  if (store.__cm3dSketchArcCreationInstalled) return store.sketchArcCreationContract;

  store.addSketchArcFromPoints = markMutationOwner((sketchId, start, end, control) => {
    const a = finitePoint(start), b = finitePoint(end), c = finitePoint(control);
    if (!a || !b || !c || (a.x === b.x && a.y === b.y)) return null;
    const result = store.runSketchMutation(sketchId, 'Skizzenbogen erzeugen', sketch => {
      const startPoint = createSketchPoint(a.x, a.y);
      const endPoint = createSketchPoint(b.x, b.y);
      const arcId = newArcId();
      sketch.data.points[startPoint.pointId] = startPoint;
      sketch.data.points[endPoint.pointId] = endPoint;
      sketch.data.arcs ??= {};
      sketch.data.arcs[arcId] = {
        arcId,
        startPointId: startPoint.pointId,
        endPointId: endPoint.pointId,
        control: { ...c }
      };
      return { arcId, startPointId: startPoint.pointId, endPointId: endPoint.pointId };
    });
    return result === false ? null : result;
  });

  store.setSketchArcGeometry = markMutationOwner((sketchId, arcId, next) => {
    const start = finitePoint(next?.start), end = finitePoint(next?.end), control = finitePoint(next?.control);
    if (!arcId || !start || !end || !control) return false;
    return store.runSketchMutation(sketchId, 'Skizzenbogen ändern', sketch => {
      const arc = sketch.data?.arcs?.[arcId];
      if (!arc) return false;
      const a = sketch.data?.points?.[arc.startPointId];
      const b = sketch.data?.points?.[arc.endPointId];
      if (!a || !b) return false;
      const unchanged = a.x === start.x && a.y === start.y
        && b.x === end.x && b.y === end.y
        && arc.control.x === control.x && arc.control.y === control.y;
      if (unchanged) return false;
      a.x = start.x; a.y = start.y;
      b.x = end.x; b.y = end.y;
      arc.control = { ...control };
      return true;
    }, { selectionChanged: true });
  });

  store.sketchArcCreationContract = Object.freeze({
    version: 'WD-21C.7',
    mutationOwner: MUTATION_OWNER,
    creationSequence: 'start-end-control',
    atomicCreation: true,
    historyEntriesPerCreation: 1,
    endpointIdsStableOnEdit: true,
    geometricRebinding: false,
    transactionPath: 'runSketchMutation',
    splineIncluded: false
  });
  Object.defineProperty(store, '__cm3dSketchArcCreationInstalled', { value: true });
  return store.sketchArcCreationContract;
}
