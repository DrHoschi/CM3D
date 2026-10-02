import {
  ReferenceTargetKind,
  ReferenceState,
  createStableReference,
  resolveStableReference
} from './stable-reference.js';
import {
  DependencyNodeState,
  buildDependencyGraph
} from './dependency-graph.js';

export const FEATURE_BODY_OUTPUT_ID = 'body-output';

export function createFeatureBodyOutputReference(featureObjectId) {
  if (!featureObjectId) throw new Error('Feature body output requires a feature object id.');
  return createStableReference(
    ReferenceTargetKind.FEATURE_OUTPUT,
    featureObjectId,
    FEATURE_BODY_OUTPUT_ID
  );
}

export function resolveFeatureBodyOutputReference(store, reference) {
  if (reference?.targetKind !== ReferenceTargetKind.FEATURE_OUTPUT) {
    return resolveStableReference(store, reference);
  }
  return resolveStableReference(store, reference);
}

export function declareFeatureOutputDependency(dependentObjectId, reference, kind = 'FEATURE_OUTPUT_TO_FEATURE') {
  if (!dependentObjectId || reference?.targetKind !== ReferenceTargetKind.FEATURE_OUTPUT) return null;
  return {
    dependentObjectId,
    reference: structuredClone(reference),
    kind
  };
}

export function evaluateSequentialFeatureChain(store, declaredDependencies = []) {
  const graph = buildDependencyGraph(store, declaredDependencies);
  const states = new Map();
  const visiting = new Set();

  const evaluate = objectId => {
    if (states.has(objectId)) return states.get(objectId);
    if (visiting.has(objectId)) {
      const cycle = {
        state: DependencyNodeState.BLOCKED,
        upstreamState: 'CYCLE',
        diagnostics: [{ code:'DEPENDENCY_CYCLE', message:`Feature chain cycle at ${objectId}.` }]
      };
      states.set(objectId, cycle);
      return cycle;
    }

    visiting.add(objectId);
    const node = graph.nodeState(objectId);
    let state = node ?? { objectId, state:DependencyNodeState.READY, upstreamState:null, diagnostics:[] };

    if (state.state === DependencyNodeState.READY) {
      for (const edge of graph.dependenciesOf(objectId)) {
        if (edge.state !== ReferenceState.RESOLVED) {
          state = {
            ...state,
            state: DependencyNodeState.BLOCKED,
            upstreamState: edge.state,
            diagnostics: [
              ...(state.diagnostics ?? []),
              ...(edge.diagnostics ?? []),
              { code:`UPSTREAM_${edge.state}`, message:`Feature output dependency ${edge.kind} is ${edge.state}.` }
            ]
          };
          break;
        }
        const upstream = evaluate(edge.sourceObjectId);
        if (upstream.state !== DependencyNodeState.READY) {
          state = {
            ...state,
            state: DependencyNodeState.BLOCKED,
            upstreamState: upstream.state,
            diagnostics: [
              ...(state.diagnostics ?? []),
              { code:`UPSTREAM_${upstream.state}`, message:`Upstream feature ${edge.sourceObjectId} is ${upstream.state}.` }
            ]
          };
          break;
        }
      }
    }

    visiting.delete(objectId);
    states.set(objectId, state);
    return state;
  };

  for (const objectId of graph.nodes.keys()) evaluate(objectId);

  const ordered = [];
  const permanent = new Set();
  const temporary = new Set();
  const visit = objectId => {
    if (permanent.has(objectId) || temporary.has(objectId)) return;
    temporary.add(objectId);
    for (const edge of graph.dependenciesOf(objectId)) {
      if (edge.state === ReferenceState.RESOLVED) visit(edge.sourceObjectId);
    }
    temporary.delete(objectId);
    permanent.add(objectId);
    ordered.push(objectId);
  };
  for (const objectId of [...graph.nodes.keys()].sort((a,b)=>a.localeCompare(b))) visit(objectId);

  return {
    graph,
    orderedObjectIds: ordered,
    stateOf(objectId) {
      const state = states.get(objectId);
      return state ? { ...state, diagnostics:(state.diagnostics ?? []).map(item=>({ ...item })) } : null;
    }
  };
}
