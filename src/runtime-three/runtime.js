import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

export class ThreeRuntime {
  constructor(container,store){
    this.container=container;this.store=store;this.objectMap=new Map();this.pickables=[];this.dragBefore=null;
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0x101215);
    this.camera=new THREE.PerspectiveCamera(50,1,0.01,100000);this.camera.position.set(4,3,6);
    this.renderer=new THREE.WebGLRenderer({antialias:true});this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.container.appendChild(this.renderer.domElement);
    this.orbit=new OrbitControls(this.camera,this.renderer.domElement);this.orbit.enableDamping=true;this.orbit.target.set(0,0.5,0);
    this.transform=new TransformControls(this.camera,this.renderer.domElement);this.transform.setMode(this.store.toolMode);this.scene.add(this.transform.getHelper());
    this.transform.addEventListener('mouseDown',()=>{this.dragBefore=this.store.snapshot();});this.transform.addEventListener('dragging-changed',e=>{this.orbit.enabled=!e.value;if(!e.value)this.commitTransform(true);});this.transform.addEventListener('objectChange',()=>this.commitTransform(false));
    this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();
    this.scene.add(new THREE.HemisphereLight(0xffffff,0x3b4450,2.2));const key=new THREE.DirectionalLight(0xffffff,2.5);key.position.set(5,8,4);this.scene.add(key);this.scene.add(new THREE.GridHelper(20,20,0x4d5560,0x2d3239));
    this.renderer.domElement.addEventListener('pointerdown',e=>this.pick(e));window.addEventListener('resize',()=>this.resize());
    this.store.subscribe(event=>{if(['projectChanged','projectLoaded','objectCreated','geometryChanged'].includes(event.type))this.rebuild();if(event.type==='objectChanged')this.syncObject(event.objectId);if(event.type==='selectionChanged')this.syncSelection();if(event.type==='toolChanged')this.transform.setMode(event.mode);});
    this.resize();this.rebuild();this.animate();
  }
  materialFor(object){const id=object.materialIds?.[0],d=id?this.store.project.materials[id]:null,p=d?.properties??{};return new THREE.MeshStandardMaterial({color:p.baseColor??'#b8bcc2',metalness:Number(p.metallic??0),roughness:Number(p.roughness??0.6),opacity:Number(p.opacity??1),transparent:Number(p.opacity??1)<1});}
  geometryFor(object){if(object.type==='primitive.box'){const s=object.data.size;return new THREE.BoxGeometry(s.x,s.y,s.z);}if(object.type==='primitive.sphere')return new THREE.SphereGeometry(object.data.radius,object.data.segments??32,20);if(object.type==='primitive.cylinder')return new THREE.CylinderGeometry(object.data.radius,object.data.radius,object.data.height,object.data.segments??32);return null;}
  createNode(object){const node=new THREE.Group();node.userData.cm3dObjectId=object.objectId;const geometry=this.geometryFor(object);if(geometry){const mesh=new THREE.Mesh(geometry,this.materialFor(object));mesh.userData.cm3dObjectId=object.objectId;const p=object.transform.pivot??{x:0,y:0,z:0};mesh.position.set(-p.x,-p.y,-p.z);node.add(mesh);this.pickables.push(mesh);}return node;}
  rebuild(){
    this.transform.detach();for(const node of this.objectMap.values()){if(node.parent)this.scene.remove(node);node.traverse(x=>{x.geometry?.dispose?.();x.material?.dispose?.();});}this.objectMap.clear();this.pickables=[];
    const objects=this.store.project.scene.objects;
    for(const object of Object.values(objects)){const node=this.createNode(object);this.objectMap.set(object.objectId,node);this.applyTransform(node,object.transform);}
    for(const object of Object.values(objects)){const node=this.objectMap.get(object.objectId),parent=object.parentId?this.objectMap.get(object.parentId):null;(parent??this.scene).add(node);}
    this.syncSelection();
  }
  syncObject(id){const node=this.objectMap.get(id),o=this.store.getObject(id);if(node&&o)this.applyTransform(node,o.transform);}
  applyTransform(node,t){node.position.set(t.position.x,t.position.y,t.position.z);node.quaternion.set(t.rotation.x,t.rotation.y,t.rotation.z,t.rotation.w).normalize();node.scale.set(t.scale.x,t.scale.y,t.scale.z);}
  syncSelection(){const id=this.store.selection.activeObjectId,node=id?this.objectMap.get(id):null;if(node)this.transform.attach(node);else this.transform.detach();}
  commitTransform(finalCommit){const node=this.transform.object;if(!node)return;const id=node.userData.cm3dObjectId,o=this.store.getObject(id);if(!o)return;o.transform.position={x:node.position.x,y:node.position.y,z:node.position.z};o.transform.rotation={x:node.quaternion.x,y:node.quaternion.y,z:node.quaternion.z,w:node.quaternion.w};o.transform.scale={x:node.scale.x,y:node.scale.y,z:node.scale.z};this.store.touch();if(finalCommit&&this.dragBefore){this.store.pushHistory(this.dragBefore,`Transform ${this.store.toolMode}`);this.dragBefore=null;}this.store.emit('objectChanged',{objectId:id});}
  pick(event){if(this.transform.dragging)return;const rect=this.renderer.domElement.getBoundingClientRect();this.pointer.x=((event.clientX-rect.left)/rect.width)*2-1;this.pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;this.raycaster.setFromCamera(this.pointer,this.camera);const hits=this.raycaster.intersectObjects(this.pickables,false);this.store.select(hits[0]?.object?.userData?.cm3dObjectId??null);}
  resize(){const w=Math.max(1,this.container.clientWidth),h=Math.max(1,this.container.clientHeight);this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
  animate(){requestAnimationFrame(()=>this.animate());this.orbit.update();this.renderer.render(this.scene,this.camera);}
}
