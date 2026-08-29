import * as THREE from 'three';

const CAMERA_TYPE = 'camera.perspective';
const finitePositive = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
};

function createCameraObject(store, runtime) {
  const before = store.snapshot();
  const objectId = `obj_${crypto.randomUUID()}`;
  const position = runtime.camera.position.clone();
  const quaternion = runtime.camera.quaternion.clone();
  const object = {
    objectId,
    type: CAMERA_TYPE,
    name: 'Kamera',
    parentId: null,
    order: store.project.scene.rootObjectIds.length,
    transform: {
      position: { x: position.x, y: position.y, z: position.z },
      rotation: { x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w },
      scale: { x: 1, y: 1, z: 1 },
      pivot: { x: 0, y: 0, z: 0 }
    },
    data: {
      projection: 'perspective',
      fov: Number(runtime.camera.fov || 50),
      near: 0.01,
      far: 1000000
    },
    materialIds: [],
    flags: { visible: true, locked: false },
    extensions: {}
  };
  store.project.scene.objects[objectId] = object;
  store.project.scene.rootObjectIds.push(objectId);
  store.touch();
  store.select(objectId, false);
  store.pushHistory(before, 'Kamera erzeugen');
  store.emit('objectCreated', { objectId });
  store.emit('selectionChanged');
  return objectId;
}

function createCameraVisual(runtime, object) {
  const node = new THREE.Group();
  node.userData.cm3dObjectId = object.objectId;

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.22, 0.22),
    new THREE.MeshBasicMaterial({ color: 0x4fc3f7, wireframe: true })
  );
  body.userData.cm3dObjectId = object.objectId;
  node.add(body);
  runtime.pickables.push(body);

  const lens = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.22, 12, 1, true),
    new THREE.MeshBasicMaterial({ color: 0x4fc3f7, wireframe: true })
  );
  lens.rotation.x = Math.PI / 2;
  lens.position.z = -0.22;
  lens.userData.cm3dObjectId = object.objectId;
  node.add(lens);
  runtime.pickables.push(lens);

  const camera = new THREE.PerspectiveCamera(
    finitePositive(object.data?.fov, 50),
    16 / 9,
    finitePositive(object.data?.near, 0.01),
    finitePositive(object.data?.far, 1000000)
  );
  camera.rotation.y = Math.PI;
  camera.updateProjectionMatrix();
  const helper = new THREE.CameraHelper(camera);
  helper.raycast = () => {};
  node.add(camera, helper);
  node.userData.cm3dCameraHelper = true;
  return node;
}

function installCameraRuntime(runtime) {
  const originalCreateNode = runtime.createNode.bind(runtime);
  runtime.createNode = object => object?.type === CAMERA_TYPE ? createCameraVisual(runtime, object) : originalCreateNode(object);
  runtime.rebuild();
}

function addControls(store, runtime, ui) {
  const newMenu = document.querySelector('#new-menu');
  const viewSet = document.querySelector('[data-context="view"]');

  const addButton = document.createElement('button');
  addButton.id = 'add-camera';
  addButton.className = 'menu-item';
  addButton.type = 'button';
  addButton.innerHTML = '<span class="icon-tile">📷</span><span>Neue Kamera</span>';
  newMenu?.appendChild(addButton);

  const previewButton = document.createElement('button');
  previewButton.id = 'camera-preview';
  previewButton.className = 'tool-button';
  previewButton.type = 'button';
  previewButton.innerHTML = '<span class="icon-tile">▣</span><span>Kamera-Vorschau</span>';
  viewSet?.appendChild(previewButton);

  let preview = null;
  const transformHelper = runtime.transform?.getHelper?.();

  const selectedCamera = () => {
    const object = store.getObject(store.selection.activeObjectId);
    return object?.type === CAMERA_TYPE ? object : null;
  };

  const exitPreview = () => {
    if (!preview) return false;
    runtime.camera.position.copy(preview.position);
    runtime.camera.quaternion.copy(preview.quaternion);
    runtime.camera.up.copy(preview.up);
    runtime.camera.fov = preview.fov;
    runtime.camera.near = preview.near;
    runtime.camera.far = preview.far;
    runtime.camera.updateProjectionMatrix();
    runtime.orbit.target.copy(preview.target);
    runtime.orbit.enabled = true;
    if (runtime.grid) runtime.grid.visible = preview.gridVisible;
    if (transformHelper) transformHelper.visible = preview.transformVisible;
    preview = null;
    previewButton.classList.remove('active');
    previewButton.querySelector('span:last-child').textContent = 'Kamera-Vorschau';
    runtime.orbit.update();
    ui.setStatus('Kamera-Vorschau beendet.');
    return true;
  };

  const enterPreview = () => {
    const object = selectedCamera();
    if (!object) {
      ui.setStatus('Für die Kamera-Vorschau zuerst ein Kameraobjekt auswählen.');
      return false;
    }
    const world = store.getWorldTransform(object.objectId);
    preview = {
      position: runtime.camera.position.clone(),
      quaternion: runtime.camera.quaternion.clone(),
      up: runtime.camera.up.clone(),
      fov: runtime.camera.fov,
      near: runtime.camera.near,
      far: runtime.camera.far,
      target: runtime.orbit.target.clone(),
      gridVisible: runtime.grid?.visible !== false,
      transformVisible: transformHelper?.visible !== false
    };
    runtime.camera.position.set(world.position.x, world.position.y, world.position.z);
    runtime.camera.quaternion.set(world.rotation.x, world.rotation.y, world.rotation.z, world.rotation.w).normalize();
    runtime.camera.fov = finitePositive(object.data?.fov, 50);
    runtime.camera.near = finitePositive(object.data?.near, 0.01);
    runtime.camera.far = Math.max(runtime.camera.near * 2, finitePositive(object.data?.far, 1000000));
    runtime.camera.updateProjectionMatrix();
    runtime.orbit.enabled = false;
    if (runtime.grid) runtime.grid.visible = false;
    if (transformHelper) transformHelper.visible = false;
    previewButton.classList.add('active');
    previewButton.querySelector('span:last-child').textContent = 'Vorschau beenden';
    ui.setStatus(`Kamera-Vorschau: ${object.name}`);
    return true;
  };

  addButton.addEventListener('click', () => {
    exitPreview();
    const id = createCameraObject(store, runtime);
    ui.setStatus(`Kamera erzeugt: ${id}`);
  });
  previewButton.addEventListener('click', () => preview ? exitPreview() : enterPreview());
  store.subscribe(event => {
    if (preview && ['projectChanged', 'projectLoaded', 'objectChanged', 'selectionChanged'].includes(event.type)) exitPreview();
    const camera = selectedCamera();
    previewButton.disabled = !camera && !preview;
  });
  previewButton.disabled = !selectedCamera();

  return { enterPreview, exitPreview, previewButton };
}

function installCameraInspector(store, ui) {
  const form = document.querySelector('#inspector');
  if (!form) return null;
  const panel = document.createElement('fieldset');
  panel.id = 'camera-fields';
  panel.hidden = true;
  panel.innerHTML = `
    <legend>Kamera</legend>
    <label>Sichtfeld (°)<input id="camera-fov" type="number" min="1" max="179" step="1" /></label>
    <label>Near<input id="camera-near" type="number" min="0.000001" step="0.01" /></label>
    <label>Far<input id="camera-far" type="number" min="0.000002" step="1" /></label>`;
  const idBox = form.querySelector('.id-box:last-child');
  form.insertBefore(panel, idBox ?? null);
  const fov = panel.querySelector('#camera-fov');
  const near = panel.querySelector('#camera-near');
  const far = panel.querySelector('#camera-far');

  const render = () => {
    const object = store.getObject(store.selection.activeObjectId);
    const active = object?.type === CAMERA_TYPE;
    panel.hidden = !active;
    if (!active) return;
    fov.value = finitePositive(object.data?.fov, 50);
    near.value = finitePositive(object.data?.near, 0.01);
    far.value = finitePositive(object.data?.far, 1000000);
  };

  const commit = () => {
    const object = store.getObject(store.selection.activeObjectId);
    if (object?.type !== CAMERA_TYPE) return;
    const nextFov = Math.min(179, Math.max(1, finitePositive(fov.value, object.data.fov)));
    const nextNear = finitePositive(near.value, object.data.near);
    const nextFar = Math.max(nextNear * 2, finitePositive(far.value, object.data.far));
    if (nextFov === object.data.fov && nextNear === object.data.near && nextFar === object.data.far) return;
    const before = store.snapshot();
    object.data.fov = nextFov;
    object.data.near = nextNear;
    object.data.far = nextFar;
    store.touch();
    store.pushHistory(before, 'Kamera-Parameter ändern');
    store.emit('geometryChanged', { objectId: object.objectId });
    ui.setStatus('Kamera-Parameter geändert.');
  };

  for (const field of [fov, near, far]) field.addEventListener('change', commit);
  store.subscribe(event => {
    if (['selectionChanged', 'projectChanged', 'projectLoaded', 'geometryChanged', 'historyChanged'].includes(event.type)) render();
  });
  render();
  return { panel, render };
}

export function installCameraObjectPreview(store, runtime, ui) {
  installCameraRuntime(runtime);
  const controls = addControls(store, runtime, ui);
  const inspector = installCameraInspector(store, ui);
  document.title = 'CyberMotion 3D – WD-17';
  const buildLabel = document.querySelector('.brand small');
  if (buildLabel) buildLabel.textContent = 'WD-17';
  return { ...controls, inspector, cameraType: CAMERA_TYPE };
}
