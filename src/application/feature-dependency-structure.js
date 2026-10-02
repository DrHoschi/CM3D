import { buildDependencyGraph } from './dependency-graph.js';

const cloneDiagnostics = items => (items ?? []).map(item => ({ ...item }));
const featureLike = object => object?.type === 'sketch' || object?.type?.startsWith?.('feature.');

function projectedNode(store, graph, objectId) {
  const object = store.getObject(objectId);
  if (!object) return null;
  const graphState = graph.nodeState(objectId);
  const recompute = object.extensions?.recomputeState;
  return {
    objectId,
    objectType: object.type,
    name: object.name,
    state: recompute?.state ?? graphState?.state ?? 'READY',
    upstreamState: recompute?.upstreamState ?? graphState?.upstreamState ?? null,
    diagnostics: cloneDiagnostics(recompute?.diagnostics ?? graphState?.diagnostics),
  };
}

const edgeProjection = (store, graph, edge) => ({
  kind: edge.kind,
  state: edge.state,
  source: projectedNode(store, graph, edge.sourceObjectId),
  dependent: projectedNode(store, graph, edge.dependentObjectId),
});

export function projectFeatureDependencyStructure(store, objectId, declaredDependencies = []) {
  const selected = store.getObject(objectId);
  if (!selected || !featureLike(selected)) return null;
  const graph = buildDependencyGraph(store, declaredDependencies);
  const center = projectedNode(store, graph, objectId);
  const sources = graph.dependenciesOf(objectId)
    .map(edge => edgeProjection(store, graph, edge))
    .filter(edge => edge.source)
    .sort((a, b) => a.source.objectId.localeCompare(b.source.objectId) || a.kind.localeCompare(b.kind));
  const dependents = graph.dependentsOf(objectId)
    .map(edge => edgeProjection(store, graph, edge))
    .filter(edge => edge.dependent && featureLike(store.getObject(edge.dependent.objectId)))
    .sort((a, b) => a.dependent.objectId.localeCompare(b.dependent.objectId) || a.kind.localeCompare(b.kind));
  return { center, sources, dependents, hasCycles: graph.hasCycles };
}

export function installFeatureDependencyProjection(store) {
  store.featureDependencyStructure = (objectId = store.selection?.activeObjectId, declaredDependencies = []) =>
    projectFeatureDependencyStructure(store, objectId, declaredDependencies);
  return { readOnly: true };
}
