export function createLargeSceneFixture({ groups = 20, objectsPerGroup = 50 } = {}) {
  const objects = {};
  const rootObjectIds = [];
  for (let groupIndex = 0; groupIndex < groups; groupIndex += 1) {
    const groupId = `large-group-${String(groupIndex).padStart(3, '0')}`;
    rootObjectIds.push(groupId);
    objects[groupId] = { objectId: groupId, type: 'group', name: `Large Group ${groupIndex}`, parentId: null, order: groupIndex, flags: { visible: true, locked: false } };
    for (let objectIndex = 0; objectIndex < objectsPerGroup; objectIndex += 1) {
      const objectId = `${groupId}-object-${String(objectIndex).padStart(3, '0')}`;
      objects[objectId] = {
        objectId,
        type: 'primitive.box',
        name: `Small Object ${groupIndex}-${objectIndex}`,
        parentId: groupId,
        order: objectIndex,
        flags: { visible: true, locked: false },
        transform: { position: { x: groupIndex * 10 + objectIndex * 0.1, y: 0, z: objectIndex * 0.05 }, rotation: { x: 0, y: 0, z: 0, w: 1 }, scale: { x: 1, y: 1, z: 1 }, pivot: { x: 0, y: 0, z: 0 } },
        data: { size: { x: 0.05, y: 0.05, z: 0.05 } }
      };
    }
  }
  return { scene: { rootObjectIds, objects }, expectedObjectCount: groups * (objectsPerGroup + 1) };
}
