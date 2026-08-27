import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

export class ThreeRuntime {
  constructor(container, store) {
    this.container = container; this.store = store; this.objectMap = new Map(); this.dragBefore = null;
    this.scene = new THREE.Scene(); this.scene.background = new THREE.Color(0x101215);
    this.camera = new THREE.PerspectiveCamera(50,1,0.01,100000); this.camera.position.set(4,3,6);
    this.renderer = new THREE.WebGLRenderer({ antialias:true }); this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)); this.renderer.outputColorSpace = THREE.SRGBColorSpace; this.container.appendChild(this.renderer.domElement);
    this.orbit = new OrbitControls(this.camera,this.renderer.domElement); this.orbit.enableDamping = true; this.orbit.target.set(0,0.5,0);
    this.transform = new TransformControls(this.camera,this.renderer.domElement); this.transform.setMode(this.store.toolMode); this.scene.add(this.transform.getHelper());
    this.transform.addEventListener('mouseDown', () => { this.dragBefore = this.store.snapshot(); });
    this.transform.addEventListener('dragging-changed', e => { this.orbit.enabled = !e.value; if (!e.value) this.commitTransform(true); });
    this.transform.addEventListener('objectChange', () => this.commitTransform(false));
    this.raycaster = new THREE.Raycaster(); this.pointer = new THREE.Vector2();
    this.scene.add(new THREE.HemisphereLight(0xffffff,0x3b4450,2.2)); const key = new THREE.DirectionalLight(0xffffff,2.5); key.position.set(5,8,4); this.scene.add(key); this.scene.add(new THREE.GridHelper(20,20,0x4d5560,0x2d3239));
    this.renderer.domElement.addEventListener('pointerdown', e => this.pick(e)); window.addEventListener('resize', () => this.resize());
    this.store.subscribe(event => {
      if (['projectChanged','projectLoaded','objectCreated'].includes(event.type)) this.rebuild();
      if (event.type === 'objectChanged') this.syncObject(event.objectId);
      if (event.type === 'selectionChanged') this.syncSelection();
      if (event.type === 'toolChanged') this.transform.setMode(event.mode);
    });
    this.resize(); this.rebuild(); this.animate();
  }

  materialFor(object) {
    const materialId = object.materialIds?.[0], definition = materialId ? this.store.project.materials[materialId] : null, p = definition?.properties ?? {};
    return new THREE.MeshStandardMaterial({ color:p.baseColor ?? '#b8bcc2', metalness:Number(p.metallic ?? 0), roughness:Number(p.roughness ?? 0.6), opacity:Number(p.opacity ?? 1), transparent:Number(p.opacity ?? 1)<1 });
  }

  rebuild() {
    this.transform.detach();
    for (const mesh of this.objectMap.values()) { this.scene.remove(mesh); mesh.geometry?.dispose(); mesh.material?.dispose?.(); }
    this.objectMap.clear();
    for (const object of Object.values(this.store.project.scene.objects)) {
      if (object.type !== 'primitive.box') continue;
      const s = object.data?.size ?? {x:1,y:1,z:1}; const mesh = new THREE.Mesh(new THREE.BoxGeometry(s.x,s.y,s.z),this.materialFor(object));
      mesh.userData.cm3dObjectId = object.objectId; this.scene.add(mesh); this.objectMap.set(object.objectId,mesh); this.applyTransform(mesh,object.transform);
    }
    this.syncSelection();
  }

  syncObject(objectId) { const mesh=this.objectMap.get(objectId), object=this.store.getObject(objectId); if (mesh&&object) this.applyTransform(mesh,object.transform); }
  applyTransform(mesh,t) { mesh.position.set(t.position.x,t.position.y,t.position.z); mesh.quaternion.set(t.rotation.x,t.rotation.y,t.rotation.z,t.rotation.w).normalize(); mesh.scale.set(t.scale.x,t.scale.y,t.scale.z); }
  syncSelection() { const id=this.store.selection.activeObjectId, mesh=id?this.objectMap.get(id):null; if(mesh)this.transform.attach(mesh); else this.transform.detach(); }

  commitTransform(finalCommit) {
    const mesh=this.transform.object; if(!mesh)return; const objectId=mesh.userData.cm3dObjectId, object=this.store.getObject(objectId); if(!object)return;
    object.transform.position={x:mesh.position.x,y:mesh.position.y,z:mesh.position.z}; object.transform.rotation={x:mesh.quaternion.x,y:mesh.quaternion.y,z:mesh.quaternion.z,w:mesh.quaternion.w}; object.transform.scale={x:mesh.scale.x,y:mesh.scale.y,z:mesh.scale.z}; this.store.touch();
    if (finalCommit && this.dragBefore) { this.store.pushHistory(this.dragBefore, `Transform ${this.store.toolMode}`); this.dragBefore = null; }
    this.store.emit('objectChanged',{objectId});
  }

  pick(event) { if(this.transform.dragging)return; const rect=this.renderer.domElement.getBoundingClientRect(); this.pointer.x=((event.clientX-rect.left)/rect.width)*2-1; this.pointer.y=-((event.clientY-rect.top)/rect.height)*2+1; this.raycaster.setFromCamera(this.pointer,this.camera); const hits=this.raycaster.intersectObjects([...this.objectMap.values()],false); this.store.select(hits[0]?.object?.userData?.cm3dObjectId ?? null); }
  resize() { const width=Math.max(1,this.container.clientWidth), height=Math.max(1,this.container.clientHeight); this.renderer.setSize(width,height,false); this.camera.aspect=width/height; this.camera.updateProjectionMatrix(); }
  animate() { requestAnimationFrame(()=>this.animate()); this.orbit.update(); this.renderer.render(this.scene,this.camera); }
}
