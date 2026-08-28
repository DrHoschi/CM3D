import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

export class ThreeRuntime {
  constructor(container,store){
    this.container=container;this.store=store;this.objectMap=new Map();this.pickables=[];this.dragBefore=null;this.lastGridStep=null;
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0x101215);
    this.modelRoot=new THREE.Group();this.modelRoot.name='CM3D_MODEL_ROOT';this.scene.add(this.modelRoot);
    this.camera=new THREE.PerspectiveCamera(50,1,0.000001,1000000000);this.camera.position.set(4,3,6);
    this.renderer=new THREE.WebGLRenderer({antialias:true,logarithmicDepthBuffer:true});this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.container.appendChild(this.renderer.domElement);
    this.orbit=new OrbitControls(this.camera,this.renderer.domElement);this.orbit.enableDamping=true;this.orbit.target.set(0,0.5,0);this.orbit.minDistance=0.0000001;this.orbit.maxDistance=100000000;
    this.transform=new TransformControls(this.camera,this.renderer.domElement);this.scene.add(this.transform.getHelper());this.applyToolSettings();
    this.transform.addEventListener('mouseDown',()=>{this.dragBefore=this.store.snapshot();});
    this.transform.addEventListener('dragging-changed',e=>{this.orbit.enabled=!e.value;if(!e.value)this.commitTransform(true);});
    this.transform.addEventListener('objectChange',()=>this.commitTransform(false));
    this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();
    this.scene.add(new THREE.HemisphereLight(0xffffff,0x3b4450,2.2));const key=new THREE.DirectionalLight(0xffffff,2.5);key.position.set(5,8,4);this.scene.add(key);
    this.grid=new THREE.GridHelper(20,20,0x4d5560,0x2d3239);this.grid.position.set(0,0,0);this.scene.add(this.grid);
    this.renderer.domElement.addEventListener('pointerdown',e=>this.pick(e));window.addEventListener('resize',()=>this.resize());
    this.store.subscribe(event=>{
      if(['projectChanged','projectLoaded','objectCreated','geometryChanged'].includes(event.type))this.rebuild();
      if(event.type==='objectChanged')this.syncObject(event.objectId);
      if(event.type==='selectionChanged')this.syncSelection();
      if(['toolChanged','spaceChanged','snapChanged'].includes(event.type))this.applyToolSettings();
      if(event.type==='focusRequested')this.focusSelection();
    });
    this.resize();this.rebuild();this.animate();
  }
  applyToolSettings(){this.transform.setMode(this.store.toolMode);this.transform.setSpace(this.store.coordinateSpace);const s=this.store.snap;this.transform.setTranslationSnap(s.enabled?s.translate:null);this.transform.setRotationSnap(s.enabled?THREE.MathUtils.degToRad(s.rotateDeg):null);this.transform.setScaleSnap(s.enabled?s.scale:null);}
  materialFor(object){const id=object.materialIds?.[0],d=id?this.store.project.materials[id]:null,p=d?.properties??{};return new THREE.MeshStandardMaterial({color:p.baseColor??'#b8bcc2',metalness:Number(p.metallic??0),roughness:Number(p.roughness??0.6),opacity:Number(p.opacity??1),transparent:Number(p.opacity??1)<1});}
  geometryFor(object){if(object.type==='primitive.box'){const s=object.data.size;return new THREE.BoxGeometry(s.x,s.y,s.z);}if(object.type==='primitive.sphere')return new THREE.SphereGeometry(object.data.radius,object.data.segments??32,20);if(object.type==='primitive.cylinder')return new THREE.CylinderGeometry(object.data.radius,object.data.radius,object.data.height,object.data.segments??32);return null;}
  createNode(object){const node=new THREE.Group();node.userData.cm3dObjectId=object.objectId;const geometry=this.geometryFor(object);if(geometry){const mesh=new THREE.Mesh(geometry,this.materialFor(object));mesh.userData.cm3dObjectId=object.objectId;const p=object.transform.pivot??{x:0,y:0,z:0};mesh.position.set(-p.x,-p.y,-p.z);node.add(mesh);this.pickables.push(mesh);}return node;}
  clearModelRoot(){this.transform.detach();this.modelRoot.traverse(node=>{if(node===this.modelRoot)return;node.geometry?.dispose?.();if(Array.isArray(node.material))node.material.forEach(m=>m?.dispose?.());else node.material?.dispose?.();});while(this.modelRoot.children.length)this.modelRoot.remove(this.modelRoot.children[0]);this.objectMap.clear();this.pickables=[];}
  rebuild(){this.clearModelRoot();const objects=this.store.project.scene.objects;for(const object of Object.values(objects)){const node=this.createNode(object);this.objectMap.set(object.objectId,node);this.applyTransform(node,object.transform);}for(const object of Object.values(objects)){const node=this.objectMap.get(object.objectId),parent=object.parentId?this.objectMap.get(object.parentId):null;(parent??this.modelRoot).add(node);}this.syncSelection();this.updateCameraRange();}
  syncObject(id){const node=this.objectMap.get(id),o=this.store.getObject(id);if(node&&o)this.applyTransform(node,o.transform);}
  applyTransform(node,t){node.position.set(t.position.x,t.position.y,t.position.z);node.quaternion.set(t.rotation.x,t.rotation.y,t.rotation.z,t.rotation.w).normalize();node.scale.set(t.scale.x,t.scale.y,t.scale.z);}
  syncSelection(){const id=this.store.selection.activeObjectId,node=id?this.objectMap.get(id):null;if(node)this.transform.attach(node);else this.transform.detach();}
  commitTransform(finalCommit){const node=this.transform.object;if(!node)return;const id=node.userData.cm3dObjectId,o=this.store.getObject(id);if(!o)return;o.transform.position={x:node.position.x,y:node.position.y,z:node.position.z};o.transform.rotation={x:node.quaternion.x,y:node.quaternion.y,z:node.quaternion.z,w:node.quaternion.w};o.transform.scale={x:node.scale.x,y:node.scale.y,z:node.scale.z};this.store.touch();if(finalCommit&&this.dragBefore){this.store.pushHistory(this.dragBefore,`Transform ${this.store.toolMode}`);this.dragBefore=null;}this.store.emit('objectChanged',{objectId:id});}
  pick(event){if(this.transform.dragging)return;const rect=this.renderer.domElement.getBoundingClientRect();this.pointer.x=((event.clientX-rect.left)/rect.width)*2-1;this.pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;this.raycaster.setFromCamera(this.pointer,this.camera);const hits=this.raycaster.intersectObjects(this.pickables,false);this.store.select(hits[0]?.object?.userData?.cm3dObjectId??null);}
  focusSelection(){const id=this.store.selection.activeObjectId,node=id?this.objectMap.get(id):null;if(!node)return;node.updateWorldMatrix(true,true);const box=new THREE.Box3().setFromObject(node);if(box.isEmpty())box.setFromCenterAndSize(node.getWorldPosition(new THREE.Vector3()),new THREE.Vector3(1,1,1));const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),maxSize=Math.max(size.x,size.y,size.z,0.0000001);const fov=THREE.MathUtils.degToRad(this.camera.fov),distance=Math.max(maxSize/(2*Math.tan(fov/2))*1.6,0.000001);const direction=this.camera.position.clone().sub(this.orbit.target);if(direction.lengthSq()<1e-20)direction.set(1,0.75,1);direction.normalize();this.orbit.target.copy(center);this.camera.position.copy(center).addScaledVector(direction,distance);this.updateCameraRange();this.updateGrid();this.orbit.update();this.store.emit('focusCompleted',{objectId:id});}
  sceneRadius(){const box=new THREE.Box3().setFromObject(this.modelRoot);if(box.isEmpty())return 1;const sphere=box.getBoundingSphere(new THREE.Sphere());return Math.max(sphere.radius,0.0000001);}
  updateCameraRange(){const distance=Math.max(this.camera.position.distanceTo(this.orbit.target),0.0000001),radius=this.sceneRadius();const near=Math.max(0.000000001,Math.min(distance,radius)/10000),far=Math.max(1000,distance*10000,radius*1000);if(Math.abs(this.camera.near-near)/near>0.01||Math.abs(this.camera.far-far)/far>0.01){this.camera.near=near;this.camera.far=far;this.camera.updateProjectionMatrix();}}
  updateGrid(){const distance=Math.max(this.camera.position.distanceTo(this.orbit.target),0.0000001);const step=Math.pow(10,Math.floor(Math.log10(distance/8)));if(step!==this.lastGridStep){this.grid.scale.setScalar(step);this.lastGridStep=step;}this.grid.position.set(0,0,0);}
  resize(){const w=Math.max(1,this.container.clientWidth),h=Math.max(1,this.container.clientHeight);this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
  animate(){requestAnimationFrame(()=>this.animate());this.orbit.update();this.updateCameraRange();this.updateGrid();this.renderer.render(this.scene,this.camera);}
}
