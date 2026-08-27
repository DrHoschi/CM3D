import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

export class ThreeRuntime {
  constructor(container, store) {
    this.container = container;
    this.store = store;
    this.objectMap = new Map();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x101215);

    this.camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100000);
    this.camera.position.set(4, 3, 6);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbit.enableDamping = true;
    this.orbit.target.set(0, 0.5, 0);

    this.transform = new TransformControls(this.camera, this.renderer.domElement);
    this.transform.setMode('translate');
    this.scene.add(this.transform.getHelper());
    this.transform.addEventListener('dragging-changed', (event) => {
      this.orbit.enabled = !event.value;
    });
    this.transform.addEventListener('objectChange', () => this.commitTransform());

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x3b4450, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 2.5);
    key.position.set(5, 8, 4);
    this.scene.add(key);
    this.scene.add(new THREE.GridHelper(20, 20, 0x4d5560, 0x2d3239));

    this.renderer.domElement.addEventListener('pointerdown', (event) => this.pick(event));
    window.addEventListener('resize', () => this.resize());

    this.store.subscribe((event) => {
      if (['projectChanged', 'projectLoaded', 'objectCreated'].includes(event.type)) this.rebuild();
      if (event.type === 'objectChanged') this.syncObject(event.objectId);
      if (event.type === 'selectionChanged') this.syncSelection();
    });

    this.resize();
    this.rebuild();
    this.animate();
  }

  materialFor(object) {
    const materialId = object.materialIds?.[0];
    const definition = materialId ? this.store.project.materials[materialId] : null;
    const p = definition?.properties ?? {};
    return new THREE.MeshStandardMaterial({
      color: p.baseColor ?? '#b8bcc2',
      metalness: Number(p.metallic ?? 0),
      roughness: Number(p.roughness ?? 0.6),
      opacity: Number(p.opacity ?? 1),
      transparent: Number(p.opacity ?? 1) < 1
    });
  }

  rebuild() {
    this.transform.detach();
    for (const mesh of this.objectMap.values()) {
      this.scene.remove(mesh);
      mesh.geometry?.dispose();
      mesh.material?.dispose?.();
    }
    this.objectMap.clear();

    for (const object of Object.values(this.store.project.scene.objects)) {
      if (object.type !== 'primitive.box') continue;
      const s = object.data?.size ?? { x: 1, y: 1, z: 1 };
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(s.x, s.y, s.z), this.materialFor(object));
      mesh.userData.cm3dObjectId = object.objectId;
      this.scene.add(mesh);
      this.objectMap.set(object.objectId, mesh);
      this.applyTransform(mesh, object.transform);
    }
    this.syncSelection();
  }

  syncObject(objectId) {
    const mesh = this.objectMap.get(objectId);
    const object = this.store.getObject(objectId);
    if (!mesh || !object) return;
    this.applyTransform(mesh, object.transform);
  }

  applyTransform(mesh, transform) {
    mesh.position.set(transform.position.x, transform.position.y, transform.position.z);
    mesh.quaternion.set(transform.rotation.x, transform.rotation.y, transform.rotation.z, transform.rotation.w).normalize();
    mesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
  }

  syncSelection() {
    const activeId = this.store.selection.activeObjectId;
    const mesh = activeId ? this.objectMap.get(activeId) : null;
    if (mesh) this.transform.attach(mesh);
    else this.transform.detach();
  }

  commitTransform() {
    const mesh = this.transform.object;
    if (!mesh) return;
    const objectId = mesh.userData.cm3dObjectId;
    const object = this.store.getObject(objectId);
    if (!object) return;
    object.transform.position = { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z };
    object.transform.rotation = { x: mesh.quaternion.x, y: mesh.quaternion.y, z: mesh.quaternion.z, w: mesh.quaternion.w };
    object.transform.scale = { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z };
    this.store.touch();
    this.store.emit('objectChanged', { objectId });
  }

  pick(event) {
    if (this.transform.dragging) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects([...this.objectMap.values()], false);
    const objectId = hits[0]?.object?.userData?.cm3dObjectId ?? null;
    this.store.select(objectId);
  }

  resize() {
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.orbit.update();
    this.renderer.render(this.scene, this.camera);
  }
}
