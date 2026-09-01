import { ReferenceState, resolveStableReference } from './stable-reference.js';

export const DependencyNodeState = Object.freeze({
  READY: 'READY',
  MISSING: ReferenceState.MISSING,
  INVALID: ReferenceState.INVALID,
  BLOCKED: ReferenceState.BLOCKED
});

const cloneRef = ref => ref ? { ...ref } : null;

export function buildDependencyGraph(store) {
  const nodes = new Map();
  const outgoing = new Map();
  const incoming = new Map();

  for (const object of Object.values(store?.project?.scene?.objects ?? {})) {
    nodes.set(object.objectId, {
      objectId: object.objectId,
      objectType: object.type,
      state: DependencyNodeState.READY,
      diagnostics: []
    });
  }

  for (const object of Object.values(store?.project?.scene?.objects ?? {})) {
    if (object?.type !== 'feature.extrude') continue;
    const ref = object.data?.sourceSketchRef ?? null;
    const node = nodes.get(object.objectId);

    if (!ref) {
      node.state = DependencyNodeState.MISSING;
      node.diagnostics.push({
        code: 'SOURCE_REFERENCE_MISSING',
        message: 'Extrusion besitzt keine stabile Quellskizzen-Referenz.'
      });
      continue;
    }

    const resolution = resolveStableReference(store, ref);
    if (resolution.state !== ReferenceState.RESOLVED) {
      node.state = resolution.state;
      node.diagnostics.push(...resolution.diagnostics.map(item => ({ ...item })));
      continue;
    }

    const edge = {
      sourceObjectId: ref.targetId,
      dependentObjectId: object.objectId,
      kind: 'SKETCH_TO_EXTRUDE',
      reference: cloneRef(ref),
      state: ReferenceState.RESOLVED
    };

    if (!outgoing.has(edge.sourceObjectId)) outgoing.set(edge.sourceObjectId, []);
    if (!incoming.has(edge.dependentObjectId)) incoming.set(edge.dependentObjectId, []);
    outgoing.get(edge.sourceObjectId).push(edge);
    incoming.get(edge.dependentObjectId).push(edge);
  }

  for (const edges of outgoing.values()) edges.sort((a, b) => a.dependentObjectId.localeCompare(b.dependentObjectId));
  for (const edges of incoming.values()) edges.sort((a, b) => a.sourceObjectId.localeCompare(b.sourceObjectId));

  return {
    nodes,
    outgoing,
    incoming,
    dependentsOf(objectId) {
      return (outgoing.get(objectId) ?? []).map(edge => ({ ...edge, reference: cloneRef(edge.reference) }));
    },
    dependenciesOf(objectId) {
      return (incoming.get(objectId) ?? []).map(edge => ({ ...edge, reference: cloneRef(edge.reference) }));
    },
    nodeState(objectId) {
      const node = nodes.get(objectId);
      return node ? { ...node, diagnostics: node.diagnostics.map(item => ({ ...item })) } : null;
    }
  };
}

export function visitDependents(store, sourceObjectId, visitor) {
  const graph = buildDependencyGraph(store);
  const changed = [];
  for (const edge of graph.dependentsOf(sourceObjectId)) {
    const dependent = store?.getObject?.(edge.dependentObjectId) ?? null;
    if (!dependent) continue;
    visitor(dependent, edge, graph);
    changed.push(dependent.objectId);
  }
  return changed;
}
