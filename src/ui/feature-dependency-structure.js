const stateLabel = node => node?.state ?? 'READY';
const label = node => node ? `${node.name} · ${node.objectType} · ${stateLabel(node)}` : '—';

function dependencyRow(text, depth, state) {
  const row = document.createElement('div');
  row.className = `tree-sketch-section tree-feature-dependency-row state-${String(state ?? 'READY').toLowerCase()}`;
  row.style.paddingLeft = `${8 + depth * 16}px`;
  row.textContent = text;
  return row;
}

export function installFeatureDependencyStructureUI(store, ui) {
  const baseTreeNode = ui.treeNode.bind(ui);
  ui.treeNode = (object, depth) => {
    const wrap = baseTreeNode(object, depth);
    if (!(object?.type === 'sketch' || object?.type?.startsWith?.('feature.'))) return wrap;
    const view = store.featureDependencyStructure?.(object.objectId);
    if (!view || (!view.sources.length && !view.dependents.length)) return wrap;

    wrap.appendChild(dependencyRow('Abhängigkeiten', depth + 1, view.center.state));
    for (const edge of view.sources) {
      wrap.appendChild(dependencyRow(`← ${edge.kind}: ${label(edge.source)}`, depth + 2, edge.source.state));
    }
    wrap.appendChild(dependencyRow(`◆ ${label(view.center)}`, depth + 2, view.center.state));
    for (const edge of view.dependents) {
      wrap.appendChild(dependencyRow(`→ ${edge.kind}: ${label(edge.dependent)}`, depth + 2, edge.dependent.state));
    }
    return wrap;
  };
  ui.render();
  return { readOnly: true };
}
