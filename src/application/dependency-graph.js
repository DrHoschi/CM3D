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

const resolvedEdgesOnly = edges => (edges ?? []).filter(edge => edge?.state === ReferenceState.RESOLVED);

export function detectDependencyCycles(edges = []) {
  const adjacency = new Map();
  const nodeIds = new Set();

  for (const edge of resolvedEdgesOnly(edges)) {
    nodeIds.add(edge.sourceObjectId);
    nodeIds.add(edge.dependentObjectId);
    if (!adjacency.has(edge.sourceObjectId)) adjacency.set(edge.sourceObjectId, []);
    adjacency.get(edge.sourceObjectId).push(edge.dependentObjectId);
  }

  for (const targets of adjacency.values()) targets.sort((a, b) => a.localeCompare(b));

  let index = 0;
  const indices = new Map();
  const lowLinks = new Map();
  const stack = [];
  const onStack = new Set();
  const cycles = [];

  const strongConnect = nodeId => {
    indices.set(nodeId, index);
    lowLinks.set(nodeId, index);
    index += 1;
    stack.push(nodeId);
    onStack.add(nodeId);

    for (const dependentId of adjacency.get(nodeId) ?? []) {
      if (!indices.has(dependentId)) {
        strongConnect(dependentId);
        lowLinks.set(nodeId, Math.min(lowLinks.get(nodeId), lowLinks.get(dependentId)));
      } else if (onStack.has(dependentId)) {
        lowLinks.set(nodeId, Math.min(lowLinks.get(nodeId), indices.get(dependentId)));
      }
    }

    if (lowLinks.get(nodeId) !== indices.get(nodeId)) return;

    const component = [];
    while (stack.length) {
      const member = stack.pop();
      onStack.delete(member);
      component.push(member);
      if (member === nodeId) break;
    }

    component.sort((a, b) => a.localeCompare(b));
    const selfCycle = component.length === 1 && (adjacency.get(component[0]) ?? []).includes(component[0]);
    if (component.length > 1 || selfCycle) cycles.push(component);
  };

  for (const nodeId of [...nodeIds].sort((a, b) => a.localeCompare(b))) {
    if (!indices.has(nodeId)) strongConnect(nodeId);
  }

  return cycles.sort((a, b) => a.join('\u0000').localeCompare(b.join('\u0000')));
}

export function wouldCreateDependencyCycle(graph, sourceObjectId, dependentObjectId) {
  if (!sourceObjectId || !dependentObjectId) return false;
  if (sourceObjectId === dependentObjectId) return true;

  const visited = new Set();
  const pending = [dependentObjectId];
  while (pending.length) {
    const current = pending.shift();
    if (current === sourceObjectId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    const next = (graph?.dependentsOf?.(current) ?? [])
      .filter(edge => edge.state === ReferenceState.RESOLVED)
      .map(edge => edge.dependentObjectId)
      .sort((a, b) => a.localeCompare(b));
    pending.push(...next);
  }
  return false;
}

export function validateDependencyEdge(graph, sourceObjectId, dependentObjectId) {
  if (!sourceObjectId || !dependentObjectId) {
    return {
      allowed: false,
      code: 'DEPENDENCY_ENDPOINT_MISSING',
      message: 'Dependency-Kante benötigt Quelle und abhängiges Ziel.'
    };
  }
  if (wouldCreateDependencyCycle(graph, sourceObjectId, dependentObjectId)) {
    return {
      allowed: false,
      code: 'DEPENDENCY_CYCLE',
      message: `Dependency-Kante ${sourceObjectId} → ${dependentObjectId} würde einen Zyklus erzeugen.`
    };
  }
  return { allowed: true, code: null, message: null };
}

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

  const allEdges = [...outgoing.values()].flat();
  const cycles = detectDependencyCycles(allEdges);
  for (const cycle of cycles) {
    for (const objectId of cycle) {
      const node = nodes.get(objectId);
      if (!node) continue;
      node.state = DependencyNodeState.BLOCKED;
      node.upstreamState = 'CYCLE';
      node.diagnostics.push({
        code: 'DEPENDENCY_CYCLE',
        message: `Dependency-Zyklus erkannt: ${cycle.join(' → ')}.`
      });
    }
  }

  const projectEdge = edge => ({
    ...edge,
    reference: cloneRef(edge.reference),
    diagnostics: (edge.diagnostics ?? []).map(cloneDiagnostic)
  });

  return {
    nodes,
    outgoing,
    incoming,
    cycles: cycles.map(cycle => [...cycle]),
    hasCycles: cycles.length > 0,
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
    if (graph.nodeState(edge.dependentObjectId)?.state === DependencyNodeState.BLOCKED) continue;
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
