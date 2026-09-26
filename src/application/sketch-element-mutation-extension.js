import { SketchElementKind, getSketchElementDefinition } from '../model/sketch-topology.js';

const MUTATION_OWNER = 'central-sketch-mutation';
const finite = value => {
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
};
const newId = prefix => `${prefix}_${crypto.randomUUID()}`;

function markMutationOwner(fn) {
  Object.defineProperty(fn, '__cm3dMutationOwner', { value: MUTATION_OWNER, configurable: false });
  return fn;
}

function normalizeControl(control) {
  const x = finite(control?.x), y = finite(control?.y);
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
}

function pointIsUsedByEndpointElement(sketch, pointId) {
  for (const kind of [SketchElementKind.LINE, SketchElementKind.ARC, SketchElementKind.SPLINE]) {
    const definition = getSketchElementDefinition(kind);
    for (const element of Object.values(sketch.data?.[definition.collection] ?? {})) {
      if (element.startPointId === pointId || element.endPointId === pointId) return true;
    }
  }
  return false;
}

function removeOrphanPoints(sketch, pointIds) {
  for (const pointId of pointIds) {
    if (pointId && !pointIsUsedByEndpointElement(sketch, pointId)) delete sketch.data.points[pointId];
  }
}

function deleteEndpointReferencesForPoint(sketch, pointId) {
  for (const kind of [SketchElementKind.LINE, SketchElementKind.ARC, SketchElementKind.SPLINE]) {
    const definition = getSketchElementDefinition(kind);
    const collection = sketch.data?.[definition.collection] ?? {};
    for (const [elementId, element] of Object.entries(collection)) {
      if (element.startPointId === pointId || element.endPointId === pointId) delete collection[elementId];
    }
  }
}

export function installGenericSketchElementMutationContract(store) {
  if (!store || typeof store.runSketchMutation !== 'function') {
    throw new Error('WD-21C.3 requires the central runSketchMutation contract.');
  }
  if (store.__cm3dGenericSketchElementMutationInstalled) return store.genericSketchElementMutationContract;

  store.addSketchCircle = markMutationOwner((sketchId, center, radius) => {
    const normalizedCenter = normalizeControl(center);
    const normalizedRadius = finite(radius);
    if (!normalizedCenter || !(normalizedRadius > 0)) return null;
    const result = store.runSketchMutation(sketchId, 'Skizzenkreis erzeugen', sketch => {
      const circleId = newId('circle');
      sketch.data.circles ??= {};
      sketch.data.circles[circleId] = { circleId, center: normalizedCenter, radius: normalizedRadius };
      return circleId;
    });
    return result === false ? null : result;
  });

  store.setSketchCircle = markMutationOwner((sketchId, circleId, next) => {
    const normalizedCenter = normalizeControl(next?.center);
    const normalizedRadius = finite(next?.radius);
    if (!circleId || !normalizedCenter || !(normalizedRadius > 0)) return false;
    return store.runSketchMutation(sketchId, 'Skizzenkreis ändern', sketch => {
      const circle = sketch.data?.circles?.[circleId];
      if (!circle) return false;
      if (circle.center.x === normalizedCenter.x && circle.center.y === normalizedCenter.y && circle.radius === normalizedRadius) return false;
      circle.center = normalizedCenter;
      circle.radius = normalizedRadius;
      return true;
    }, { selectionChanged: true });
  });

  store.addSketchArc = markMutationOwner((sketchId, startPointId, endPointId, control) => {
    const normalizedControl = normalizeControl(control);
    if (!startPointId || !endPointId || startPointId === endPointId || !normalizedControl) return null;
    const result = store.runSketchMutation(sketchId, 'Skizzenbogen erzeugen', sketch => {
      if (!sketch.data?.points?.[startPointId] || !sketch.data?.points?.[endPointId]) return false;
      const arcId = newId('arc');
      sketch.data.arcs ??= {};
      sketch.data.arcs[arcId] = { arcId, startPointId, endPointId, control: normalizedControl };
      return arcId;
    });
    return result === false ? null : result;
  });

  store.setSketchArc = markMutationOwner((sketchId, arcId, next) => {
    const startPointId = next?.startPointId;
    const endPointId = next?.endPointId;
    const normalizedControl = normalizeControl(next?.control);
    if (!arcId || !startPointId || !endPointId || startPointId === endPointId || !normalizedControl) return false;
    return store.runSketchMutation(sketchId, 'Skizzenbogen ändern', sketch => {
      const arc = sketch.data?.arcs?.[arcId];
      if (!arc || !sketch.data?.points?.[startPointId] || !sketch.data?.points?.[endPointId]) return false;
      if (arc.startPointId === startPointId && arc.endPointId === endPointId && arc.control.x === normalizedControl.x && arc.control.y === normalizedControl.y) return false;
      arc.startPointId = startPointId;
      arc.endPointId = endPointId;
      arc.control = normalizedControl;
      return true;
    }, { selectionChanged: true });
  });

  store.addSketchSpline = markMutationOwner((sketchId, startPointId, endPointId, controls) => {
    if (!startPointId || !endPointId || startPointId === endPointId || !Array.isArray(controls) || controls.length < 1) return null;
    const normalizedControls = controls.map(control => normalizeControl(control));
    if (normalizedControls.some(control => !control)) return null;
    const result = store.runSketchMutation(sketchId, 'Skizzenspline erzeugen', sketch => {
      if (!sketch.data?.points?.[startPointId] || !sketch.data?.points?.[endPointId]) return false;
      const splineId = newId('spline');
      sketch.data.splines ??= {};
      sketch.data.splines[splineId] = {
        splineId,
        startPointId,
        endPointId,
        controls: normalizedControls.map(control => ({ controlId: newId('ctl'), ...control }))
      };
      return splineId;
    });
    return result === false ? null : result;
  });

  store.setSketchSpline = markMutationOwner((sketchId, splineId, next) => {
    const startPointId = next?.startPointId;
    const endPointId = next?.endPointId;
    if (!splineId || !startPointId || !endPointId || startPointId === endPointId || !Array.isArray(next?.controls) || next.controls.length < 1) return false;
    return store.runSketchMutation(sketchId, 'Skizzenspline ändern', sketch => {
      const spline = sketch.data?.splines?.[splineId];
      if (!spline || !sketch.data?.points?.[startPointId] || !sketch.data?.points?.[endPointId]) return false;
      if (next.controls.length !== spline.controls.length) return false;
      const controls = [];
      for (let index = 0; index < spline.controls.length; index += 1) {
        const current = spline.controls[index];
        const requested = next.controls[index];
        const normalized = normalizeControl(requested);
        if (!normalized || requested?.controlId !== current.controlId) return false;
        controls.push({ controlId: current.controlId, ...normalized });
      }
      const unchanged = spline.startPointId === startPointId
        && spline.endPointId === endPointId
        && controls.every((control, index) => control.x === spline.controls[index].x && control.y === spline.controls[index].y);
      if (unchanged) return false;
      spline.startPointId = startPointId;
      spline.endPointId = endPointId;
      spline.controls = controls;
      return true;
    }, { selectionChanged: true });
  });

  store.deleteSketchElement = markMutationOwner(() => {
    const selected = store.selection?.sketchElement;
    if (!selected) return false;
    const { sketchId, kind, elementId } = selected;
    const result = store.runSketchMutation(sketchId, 'Skizzenelement löschen', sketch => {
      if (kind === 'point') {
        if (!sketch.data?.points?.[elementId]) return false;
        deleteEndpointReferencesForPoint(sketch, elementId);
        delete sketch.data.points[elementId];
        return true;
      }
      const definition = getSketchElementDefinition(kind);
      const collection = definition ? sketch.data?.[definition.collection] : null;
      const element = collection?.[elementId];
      if (!definition || !element) return false;
      const endpointCandidates = definition.topologyEndpoints ? [element.startPointId, element.endPointId] : [];
      delete collection[elementId];
      removeOrphanPoints(sketch, endpointCandidates);
      return true;
    });
    if (result === false) return false;
    store.selection.sketchElement = null;
    store.emit?.('selectionChanged');
    return true;
  });

  const mutationMethods = Object.freeze([
    'addSketchCircle', 'setSketchCircle',
    'addSketchArc', 'setSketchArc',
    'addSketchSpline', 'setSketchSpline',
    'deleteSketchElement'
  ]);
  const invalid = mutationMethods.filter(name => store[name]?.__cm3dMutationOwner !== MUTATION_OWNER);
  if (invalid.length) throw new Error(`WD-21C.3 mutation ownership incomplete: ${invalid.join(', ')}`);

  store.genericSketchElementMutationContract = Object.freeze({
    version: 'WD-21C.3',
    mutationOwner: MUTATION_OWNER,
    mutationMethods,
    transactionPath: 'runSketchMutation',
    validatesAfterMutation: true,
    analyticGeometryIdentity: true,
    derivedTessellationPersisted: false,
    fixedSegmentCountRequired: false,
    regularPolygonFeatureIncluded: false,
    connectivityExtensionIncluded: false,
    profilePathDerivationIncluded: false
  });
  Object.defineProperty(store, '__cm3dGenericSketchElementMutationInstalled', { value: true });
  return store.genericSketchElementMutationContract;
}
