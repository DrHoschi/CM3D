import { ReferenceState, resolveStableReference } from './stable-reference.js';

export const DependencyNodeState = Object.freeze({
  READY: 'READY',
  MISSING: ReferenceState.MISSING,
  INVALID: ReferenceState.INVALID,
  BLOCKED: ReferenceState.BLOCKED
});

const cloneRef = ref => ref ? { ...ref } : null;
const cloneDiagnostic = item => ({ ...item });

const addEdge = (outgoing, incoming, edge) => {
  if (!outgoing.has(edge.sourceObjectId)) outgoing.set(edge.sourceObjectId, []);
  if (!incoming.has(edge.dependentObjectId)) incoming.set(edge.dependentObjectId, []);
  outgoing.get(edge.sourceObjectId).push(edge);
  incoming.get(edge.dependentObjectId).push(edge);
};

export function buildDependencyGraph(store) {
  const nodes = new Map();
  const outgoing = new Map();
  const incoming = new Map();

  for (const object of Object.values(store?.project?.scene?.objects ?? {})) {
    nodes.set(object.objectId, {
      objectId: object.objectId,
      objectType: object.type,
      state: DependencyNodeState.READY,
      upstreamState: null,
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
    const edge = {
      sourceObjectId: ref.targetId,
      dependentObjectId: object.objectId,
      kind: 'SKETCH_TO_EXTRUDE',
      reference: cloneRef(ref),
      state: resolution.state,
      diagnostics: resolution.diagnostics.map(cloneDiagnostic)
    };
    addEdge(outgoing, incoming, edge);

    if (resolution.state !== ReferenceState.RESOLVED) {
      node.state = DependencyNodeState.BLOCKED;
      node.upstreamState = resolution.state;
      node.diagnostics.push({
        code: `UPSTREAM_${resolution.state}`,
        message: `Abhängige Berechnung ist blockiert, weil die Quellreferenz ${resolution.state} ist.`
      });
      node.diagnostics.push(...resolution.diagnostics.map(cloneDiagnostic));
    }
  }

  for (const edges of outgoing.values()) edges.sort((a, b) => a.dependentObjectId.localeCompare(b.dependentObjectId));
  for (const edges of incoming.values()) edges.sort((a, b) => a.sourceObjectId.localeCompare(b.sourceObjectId));

  const projectEdge = edge => ({
    ...edge,
    reference: cloneRef(edge.reference),
    diagnostics: (edge.diagnostics ?? []).map(cloneDiagnostic)
  });

  return {
    nodes,
    outgoing,
    incoming,
    dependentsOf(objectId) {
      return (outgoing.get(objectId) ?? []).map(projectEdge);
    },
    dependenciesOf(objectId) {
      return (incoming.get(objectId) ?? []).map(projectEdge);
    },
    nodeState(objectId) {
      const node = nodes.get(objectId);
      return node ? { ...node, diagnostics: node.diagnostics.map(cloneDiagnostic) } : null;
    }
  };
}

export function visitDependents(store, sourceObjectId, visitor) {
  const graph = buildDependencyGraph(store);
  const changed = [];
  for (const edge of graph.dependentsOf(sourceObjectId)) {
    if (edge.state !== ReferenceState.RESOLVED) continue;
    const dependent = store?.getObject?.(edge.dependentObjectId) ?? null;
    if (!dependent) continue;
    visitor(dependent, edge, graph);
    changed.push(dependent.objectId);
  }
  return changed;
}

export function enforceBlockedDependencyState(store) {
  const graph = buildDependencyGraph(store);
  const blocked = [];
  for (const [objectId, node] of graph.nodes) {
    if (node.state !== DependencyNodeState.BLOCKED) continue;
    const object = store?.getObject?.(objectId) ?? null;
    if (object?.type !== 'feature.extrude') continue;
    object.data ??= {};
    object.extensions ??= {};
    object.data.profile = null;
    object.extensions.recomputeState = {
      state: DependencyNodeState.BLOCKED,
      upstreamState: node.upstreamState,
      diagnostics: node.diagnostics.map(cloneDiagnostic)
    };
    blocked.push(objectId);
  }
  return blocked.sort();
}
