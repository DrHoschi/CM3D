const renderableKind = node => node?.isMesh ? 'mesh' : node?.isLine ? 'line' : node?.isPoints ? 'points' : 'node';

const sourceKeyFor = (rootObjectId, path) => `imported:${rootObjectId}:node:${path || 'root'}`;

export function describeImportedStructure(root, rootObjectId) {
  if (!root || !rootObjectId) return [];
  const descriptors = [];
  const visit = (node, path, parentSourceKey = null) => {
    const sourceKey = sourceKeyFor(rootObjectId, path);
    const descriptor = {
      rootObjectId,
      sourceKey,
      parentSourceKey,
      path,
      kind: renderableKind(node),
      name: String(node?.name || '').trim() || `${renderableKind(node)} ${path || 'root'}`,
      childCount: Array.isArray(node?.children) ? node.children.length : 0,
      position: node?.position ? { x: node.position.x, y: node.position.y, z: node.position.z } : null,
      scale: node?.scale ? { x: node.scale.x, y: node.scale.y, z: node.scale.z } : null,
      materialCount: Array.isArray(node?.material) ? node.material.length : node?.material ? 1 : 0
    };
    descriptors.push(descriptor);
    node.userData ??= {};
    node.userData.cm3dImportedElement = { rootObjectId, sourceKey, kind: descriptor.kind, path };
    (node.children || []).forEach((child, index) => visit(child, path ? `${path}/${index}` : String(index), sourceKey));
  };
  visit(root, '', null);
  return descriptors;
}

export function importedStructureMap(descriptors = []) {
  return new Map(descriptors.map(item => [item.sourceKey, item]));
}

export function importedElementFromRuntimeNode(node) {
  let current = node;
  while (current) {
    if (current.userData?.cm3dImportedElement) return { ...current.userData.cm3dImportedElement };
    current = current.parent;
  }
  return null;
}
