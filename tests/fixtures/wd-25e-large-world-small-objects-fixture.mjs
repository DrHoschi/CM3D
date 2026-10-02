const WORLD_COORDINATES = [0, 10_000, 100_000];
const OBJECT_SIZES = [0.05, 0.01, 1.0];

export function createLargeWorldSmallObjectsQaMatrix() {
  const cases = [];
  for (const worldCoordinate of WORLD_COORDINATES) {
    for (const objectSize of OBJECT_SIZES) {
      cases.push({
        id: `f089-w${worldCoordinate}-s${objectSize}`,
        worldCoordinate,
        objectSize,
        position: { x: worldCoordinate, y: worldCoordinate * 0.25, z: -worldCoordinate * 0.5 },
        size: { x: objectSize, y: objectSize, z: objectSize }
      });
    }
  }
  return cases;
}

export const F089_REPRESENTATIVE_OPERATIONS = Object.freeze([
  'render-visibility',
  'select-pick',
  'focus-camera-navigation',
  'transform',
  'multi-selection',
  'save-reload',
  'undo-redo',
  'f086-snapshot'
]);
