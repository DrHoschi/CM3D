import { createSketchLine, createSketchPoint } from '../model/project.js';
import { validateSketchTopology } from '../model/sketch-topology.js';
import { installDomainTransactionBoundary } from './domain-transaction.js';

const finite = value => {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
};

const SKETCH_MUTATION_METHODS = Object.freeze([
  'runSketchMutation',
  'addSketchPoint',
  'addSketchLine',
  'addSketchSegment',
  'addSketchClosedShape',
  'addSketchRectangle',
  'addSketchPolygon',
  'setSketchPoint',
  'setSketchLineEndpoints',
  'connectSketchPoints',
  'deleteSketchElement'
]);

const MUTATION_OWNER = 'central-sketch-mutation';

function markMutationOwner(fn) {
  if (typeof fn !== 'function') return fn;
  Object.defineProperty(fn, '__cm3dMutationOwner', { value: MUTATION_OWNER, configurable: false });
  return fn;
}

export function auditSketchMutationOwnership(store) {
  const methods = SKETCH_MUTATION_METHODS.map(name => ({
    name,
    active: typeof store?.[name] === 'function',
    owner: store?.[name]?.__cm3dMutationOwner ?? null
  }));
  const invalid = methods.filter(item => !item.active || item.owner !== MUTATION_OWNER);
  return Object.freeze({
    valid: invalid.length === 0,
    owner: MUTATION_OWNER,
    methods: Object.freeze(methods.map(item => Object.freeze(item))),
    invalid: Object.freeze(invalid.map(item => Object.freeze(item)))
  });
}

class SketchTopologyMutationError extends Error {
  constructor(errors) {
    super((errors ?? []).join('\n') || 'Ungültige Sketch-Topologie nach Mutation.');
    this.name = 'SketchTopologyMutationError';
    this.errors = [...(errors ?? [])];
  }
}

export function installSketchMutationContract(store) {
  if (!store || typeof store.getObject !== 'function') throw new Error('SketchMutationContract requires a compatible store.');
  if (store.__cm3dSketchMutationContractInstalled) return store.sketchMutationContract;

  installDomainTransactionBoundary(store);

  const runSketchMutation = (sketchId, label, mutate, options = {}) => {
    const sketch = store.getObject(sketchId);
    if (sketch?.type !== 'sketch' || typeof mutate !== 'function') return false;

    let dependentIds = [];
    try {
      const result = store.runDomainTransaction(label, () => {
        const current = store.getObject(sketchId);
        if (current?.type !== 'sketch') return false;
        const outcome = mutate(current);
        if (outcome === false) return false;

        const validation = validateSketchTopology(current);
        if (!validation.valid) throw new SketchTopologyMutationError(validation.errors);

        dependentIds = store.refreshDependentExtrudesFromSketch?.(sketchId) ?? [];
        store.touch?.();
        return outcome;
      });

      if (result === false) return false;
      store.emit?.('geometryChanged', { objectId: sketchId, sketchDependencySynced: true, topologyMutation: true });
      if (dependentIds.length) store.emit?.('sketchDependenciesChanged', { sketchId, objectIds: dependentIds });
      if (options.selectionChanged) store.emit?.('selectionChanged');
      return result;
    } catch (error) {
      if (error instanceof SketchTopologyMutationError) return false;
      throw error;
    }
  };

  store.runSketchMutation = markMutationOwner(runSketchMutation);

  store.addSketchPoint = markMutationOwner((sketchId, next) => {
    const x = finite(next?.x), y = finite(next?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    const result = runSketchMutation(sketchId, 'Skizzenpunkt erzeugen', sketch => {
      const point = createSketchPoint(x, y);
      sketch.data.points[point.pointId] = point;
      return point.pointId;
    });
    return result === false ? null : result;
  });

  store.addSketchLine = markMutationOwner((sketchId, startPointId, endPointId) => {
    if (!startPointId || !endPointId || startPointId === endPointId) return null;
    const result = runSketchMutation(sketchId, 'Skizzenlinie erzeugen', sketch => {
      if (!sketch.data?.points?.[startPointId] || !sketch.data?.points?.[endPointId]) return false;
      const line = createSketchLine(startPointId, endPointId);
      sketch.data.lines[line.lineId] = line;
      return line.lineId;
    });
    return result === false ? null : result;
  });

  store.addSketchSegment = markMutationOwner((sketchId, start, end) => {
    const sx = finite(start?.x), sy = finite(start?.y), ex = finite(end?.x), ey = finite(end?.y);
    if (![sx, sy, ex, ey].every(Number.isFinite) || (sx === ex && sy === ey)) return null;
    const result = runSketchMutation(sketchId, 'Skizzenlinie mit Punkten erzeugen', sketch => {
      const a = createSketchPoint(sx, sy);
      const b = createSketchPoint(ex, ey);
      const line = createSketchLine(a.pointId, b.pointId);
      sketch.data.points[a.pointId] = a;
      sketch.data.points[b.pointId] = b;
      sketch.data.lines[line.lineId] = line;
      return { lineId: line.lineId, startPointId: a.pointId, endPointId: b.pointId };
    });
    return result === false ? null : result;
  });

  store.addSketchClosedShape = markMutationOwner((sketchId, vertices, label = 'Geschlossene Skizzenform erzeugen') => {
    if (!Array.isArray(vertices) || vertices.length < 3) return null;
    const points = vertices.map(v => ({ x: finite(v?.x), y: finite(v?.y) }));
    if (points.some(point => !Number.isFinite(point.x) || !Number.isFinite(point.y))) return null;
    for (let i = 0; i < points.length; i += 1) {
      const a = points[i], b = points[(i + 1) % points.length];
      if (a.x === b.x && a.y === b.y) return null;
    }

    const result = runSketchMutation(sketchId, label, sketch => {
      const created = points.map(point => createSketchPoint(point.x, point.y));
      const lineIds = [];
      for (const point of created) sketch.data.points[point.pointId] = point;
      for (let i = 0; i < created.length; i += 1) {
        const line = createSketchLine(created[i].pointId, created[(i + 1) % created.length].pointId);
        sketch.data.lines[line.lineId] = line;
        lineIds.push(line.lineId);
      }
      return { pointIds: created.map(point => point.pointId), lineIds };
    });
    return result === false ? null : result;
  });

  store.addSketchRectangle = markMutationOwner((sketchId, a, b) => {
    const ax = finite(a?.x), ay = finite(a?.y), bx = finite(b?.x), by = finite(b?.y);
    if (![ax, ay, bx, by].every(Number.isFinite) || ax === bx || ay === by) return null;
    return store.addSketchClosedShape(sketchId, [
      { x: ax, y: ay }, { x: bx, y: ay }, { x: bx, y: by }, { x: ax, y: by }
    ], 'Rechteck erzeugen');
  });

  store.addSketchPolygon = markMutationOwner((sketchId, vertices) => store.addSketchClosedShape(sketchId, vertices, 'Polygon erzeugen'));

  store.setSketchPoint = markMutationOwner((sketchId, pointId, next) => runSketchMutation(sketchId, 'Skizzenpunkt ändern', sketch => {
    const point = sketch.data?.points?.[pointId];
    if (!point) return false;
    const x = finite(next?.x), y = finite(next?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y) || (point.x === x && point.y === y)) return false;
    point.x = x;
    point.y = y;
    return true;
  }, { selectionChanged: true }));

  store.setSketchLineEndpoints = markMutationOwner((sketchId, lineId, next) => runSketchMutation(sketchId, 'Skizzenlinie ändern', sketch => {
    const line = sketch.data?.lines?.[lineId];
    if (!line) return false;
    const a = sketch.data.points?.[line.startPointId];
    const b = sketch.data.points?.[line.endPointId];
    if (!a || !b) return false;
    const ax = finite(next?.ax), ay = finite(next?.ay), bx = finite(next?.bx), by = finite(next?.by);
    if (![ax, ay, bx, by].every(Number.isFinite)) return false;
    if (a.x === ax && a.y === ay && b.x === bx && b.y === by) return false;
    a.x = ax;
    a.y = ay;
    b.x = bx;
    b.y = by;
    return true;
  }, { selectionChanged: true }));

  store.connectSketchPoints = markMutationOwner((sketchId, survivorPointId, sourcePointId) => {
    if (!survivorPointId || !sourcePointId || survivorPointId === sourcePointId) return false;
    return runSketchMutation(sketchId, 'Skizzenendpunkte verbinden', sketch => {
      const points = sketch.data?.points ?? {};
      const lines = sketch.data?.lines ?? {};
      if (!points[survivorPointId] || !points[sourcePointId]) return false;

      for (const line of Object.values(lines)) {
        const joinsSelectedPair = (line.startPointId === survivorPointId && line.endPointId === sourcePointId)
          || (line.startPointId === sourcePointId && line.endPointId === survivorPointId);
        if (joinsSelectedPair) return false;
      }

      const rewiredLineIds = [];
      for (const line of Object.values(lines)) {
        let changed = false;
        if (line.startPointId === sourcePointId) {
          line.startPointId = survivorPointId;
          changed = true;
        }
        if (line.endPointId === sourcePointId) {
          line.endPointId = survivorPointId;
          changed = true;
        }
        if (changed) rewiredLineIds.push(line.lineId);
      }

      delete points[sourcePointId];
      return {
        survivorPointId,
        sourcePointId,
        rewiredLineIds
      };
    }, { selectionChanged: true });
  });

  store.deleteSketchElement = markMutationOwner(() => {
    const selected = store.selection?.sketchElement;
    if (!selected) return false;
    const { sketchId, kind, elementId } = selected;
    const result = runSketchMutation(sketchId, kind === 'line' ? 'Skizzenlinie löschen' : 'Skizzenpunkt löschen', sketch => {
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
      if (kind === 'point') {
        if (!sketch.data?.points?.[elementId]) return false;
        for (const [lineId, line] of Object.entries(sketch.data.lines ?? {})) {
          if (line.startPointId === elementId || line.endPointId === elementId) delete sketch.data.lines[lineId];
        }
        delete sketch.data.points[elementId];
        return true;
      }
      return false;
    });
    if (result === false) return false;
    store.selection.sketchElement = null;
    store.emit?.('selectionChanged');
    return true;
  });

  const ownership = auditSketchMutationOwnership(store);
  if (!ownership.valid) throw new Error(`Sketch mutation ownership incomplete: ${ownership.invalid.map(item => item.name).join(', ')}`);

  store.sketchMutationContract = Object.freeze({
    version: 'WD-21A.3',
    topologyAuthority: 'pointId',
    validatesAfterMutation: true,
    transactionBoundary: true,
    mutationOwner: MUTATION_OWNER,
    mutationMethods: SKETCH_MUTATION_METHODS,
    ownershipVerified: true,
    connectivityExtension: 'WD-21B.2',
    connectPolicy: Object.freeze({
      survivor: 'explicit-primary-point-id',
      source: 'explicit-merge-source-point-id',
      geometryPolicy: 'source-lines-move-to-survivor-coordinate',
      geometricRebinding: false
    })
  });
  Object.defineProperty(store, '__cm3dSketchMutationContractInstalled', { value: true });
  return store.sketchMutationContract;
}
