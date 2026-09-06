import { createSketchLine, createSketchPoint } from '../model/project.js';
import { validateSketchTopology } from '../model/sketch-topology.js';
import { installDomainTransactionBoundary } from './domain-transaction.js';

const finite = value => {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
};

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

  store.runSketchMutation = runSketchMutation;

  store.addSketchPoint = (sketchId, next) => {
    const x = finite(next?.x), y = finite(next?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    const result = runSketchMutation(sketchId, 'Skizzenpunkt erzeugen', sketch => {
      const point = createSketchPoint(x, y);
      sketch.data.points[point.pointId] = point;
      return point.pointId;
    });
    return result === false ? null : result;
  };

  store.addSketchLine = (sketchId, startPointId, endPointId) => {
    if (!startPointId || !endPointId || startPointId === endPointId) return null;
    const result = runSketchMutation(sketchId, 'Skizzenlinie erzeugen', sketch => {
      if (!sketch.data?.points?.[startPointId] || !sketch.data?.points?.[endPointId]) return false;
      const line = createSketchLine(startPointId, endPointId);
      sketch.data.lines[line.lineId] = line;
      return line.lineId;
    });
    return result === false ? null : result;
  };

  store.addSketchSegment = (sketchId, start, end) => {
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
  };

  store.addSketchClosedShape = (sketchId, vertices, label = 'Geschlossene Skizzenform erzeugen') => {
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
  };

  store.addSketchRectangle = (sketchId, a, b) => {
    const ax = finite(a?.x), ay = finite(a?.y), bx = finite(b?.x), by = finite(b?.y);
    if (![ax, ay, bx, by].every(Number.isFinite) || ax === bx || ay === by) return null;
    return store.addSketchClosedShape(sketchId, [
      { x: ax, y: ay }, { x: bx, y: ay }, { x: bx, y: by }, { x: ax, y: by }
    ], 'Rechteck erzeugen');
  };

  store.addSketchPolygon = (sketchId, vertices) => store.addSketchClosedShape(sketchId, vertices, 'Polygon erzeugen');

  store.setSketchPoint = (sketchId, pointId, next) => runSketchMutation(sketchId, 'Skizzenpunkt ändern', sketch => {
    const point = sketch.data?.points?.[pointId];
    if (!point) return false;
    const x = finite(next?.x), y = finite(next?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y) || (point.x === x && point.y === y)) return false;
    point.x = x;
    point.y = y;
    return true;
  }, { selectionChanged: true });

  store.setSketchLineEndpoints = (sketchId, lineId, next) => runSketchMutation(sketchId, 'Skizzenlinie ändern', sketch => {
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
  }, { selectionChanged: true });

  store.deleteSketchElement = () => {
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
    }, { selectionChanged: true });
    if (result !== false) store.selection.sketchElement = null;
    return result !== false;
  };

  store.sketchMutationContract = Object.freeze({
    version: 'WD-21A.3',
    topologyAuthority: 'pointId',
    validatesAfterMutation: true,
    transactionBoundary: true
  });
  Object.defineProperty(store, '__cm3dSketchMutationContractInstalled', { value: true });
  return store.sketchMutationContract;
}
