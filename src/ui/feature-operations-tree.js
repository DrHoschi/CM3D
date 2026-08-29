const isFeatureOperation = object => object?.type === 'feature.extrude';

export function installFeatureOperationsTree(store, ui) {
  const baseTreeNode = ui.treeNode.bind(ui);

  const linkedSourceSketch = object => {
    if (!isFeatureOperation(object)) return null;
    const sketch = store.getObject(object.data?.sourceSketchId);
    return sketch?.type === 'sketch' ? sketch : null;
  };

  const operationsForSketch = sketchId => Object.values(store.project.scene.objects)
    .filter(object => isFeatureOperation(object) && object.data?.sourceSketchId === sketchId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.objectId.localeCompare(b.objectId));

  ui.treeNode = (object, depth) => {
    const wrap = baseTreeNode(object, depth);
    if (object.type !== 'sketch') return wrap;

    const operations = operationsForSketch(object.objectId);
    if (!operations.length) return wrap;

    wrap.appendChild(sectionRow(`Operationen (${operations.length})`, depth + 1));
    operations.forEach((operation, index) => {
      wrap.appendChild(operationRow(store, operation, index, depth + 2));
    });
    return wrap;
  };

  ui.renderTree = () => {
    ui.tree.replaceChildren();
    const objects = store.project.scene.objects;
    const roots = store.project.scene.rootObjectIds
      .map(id => objects[id])
      .filter(Boolean)
      .filter(object => !linkedSourceSketch(object))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (!roots.length) {
      const empty = document.createElement('div');
      empty.className = 'muted';
      empty.textContent = 'Noch keine Objekte';
      ui.tree.appendChild(empty);
      return;
    }

    for (const object of roots) ui.tree.appendChild(ui.treeNode(object, 0));
  };

  document.title = 'CyberMotion 3D – WD-13A';
  const buildLabel = document.querySelector('.brand small');
  if (buildLabel) buildLabel.textContent = 'WD-13A';
  ui.render();

  return { operationsForSketch };
}

function sectionRow(label, depth) {
  const row = document.createElement('div');
  row.className = 'tree-sketch-section tree-feature-section';
  row.style.paddingLeft = `${8 + depth * 16}px`;
  row.textContent = label;
  return row;
}

function operationRow(store, operation, index, depth) {
  const row = document.createElement('div');
  row.className = `tree-item feature-operation-item${operation.objectId === store.selection.activeObjectId ? ' selected' : ''}`;
  row.style.paddingLeft = `${8 + depth * 16}px`;
  row.dataset.featureOperationId = operation.objectId;

  const spacer = document.createElement('span');
  spacer.className = 'tree-element-spacer';
  const label = document.createElement('span');
  label.textContent = `◇ Extrusion ${index + 1} · ${operation.name}`;
  row.append(spacer, label);

  row.addEventListener('click', event => {
    event.stopPropagation();
    store.select(operation.objectId);
  });
  return row;
}
