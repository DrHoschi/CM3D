import * as THREE from 'three';

const AXIS_COLORS = {
  x: 0xff4d4d,
  y: 0x4dff88,
  z: 0x4d88ff
};

function createLabel(text, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = 'bold 72px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, depthTest: false, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.setScalar(0.22);
  sprite.renderOrder = 1000;
  return sprite;
}

function axisLine(direction, color) {
  const geometry = new THREE.BufferGeometry().setFromPoints([
    direction.clone().multiplyScalar(-1),
    direction.clone()
  ]);
  const material = new THREE.LineBasicMaterial({ color, depthTest: false, depthWrite: false, transparent: true, opacity: 0.95 });
  const line = new THREE.Line(geometry, material);
  line.renderOrder = 999;
  return line;
}

export function installViewportReferenceSystem(runtime) {
  if (!runtime?.scene || runtime.scene.getObjectByName('CM3D_WORLD_AXES')) return null;

  const root = new THREE.Group();
  root.name = 'CM3D_WORLD_AXES';
  root.userData.cm3dViewportReference = true;

  const x = new THREE.Vector3(1, 0, 0);
  const y = new THREE.Vector3(0, 1, 0);
  const z = new THREE.Vector3(0, 0, 1);

  root.add(axisLine(x, AXIS_COLORS.x));
  root.add(axisLine(y, AXIS_COLORS.y));
  root.add(axisLine(z, AXIS_COLORS.z));

  const xLabel = createLabel('X', '#ff6666');
  const yLabel = createLabel('Y', '#66ff99');
  const zLabel = createLabel('Z', '#6699ff');
  xLabel.position.set(1.16, 0, 0);
  yLabel.position.set(0, 1.16, 0);
  zLabel.position.set(0, 0, 1.16);
  root.add(xLabel, yLabel, zLabel);

  runtime.scene.add(root);

  let disposed = false;
  const updateScale = () => {
    if (disposed) return;
    const camera = runtime.camera;
    const orbit = runtime.orbit;
    if (camera && orbit) {
      const distance = Math.max(camera.position.distanceTo(orbit.target), 1e-9);
      const scale = Math.max(distance * 0.12, 1e-8);
      root.scale.setScalar(scale);
    }
    requestAnimationFrame(updateScale);
  };
  updateScale();

  document.title = 'CyberMotion 3D – WD-16';
  const buildLabel = document.querySelector('.brand small');
  if (buildLabel) buildLabel.textContent = 'WD-16';

  return {
    root,
    dispose() {
      disposed = true;
      runtime.scene.remove(root);
      root.traverse(node => {
        node.geometry?.dispose?.();
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        for (const material of materials) {
          material?.map?.dispose?.();
          material?.dispose?.();
        }
      });
    }
  };
}
