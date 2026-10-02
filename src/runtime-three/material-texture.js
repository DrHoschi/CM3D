import * as THREE from 'three';
import { ThreeRuntime } from './runtime.js';

const originalMaterialFor=ThreeRuntime.prototype.materialFor;
const originalClearModelRoot=ThreeRuntime.prototype.clearModelRoot;

ThreeRuntime.prototype.materialFor=function(object){
  const material=originalMaterialFor.call(this,object);
  const materialId=object.materialIds?.[0];
  const assetId=materialId?this.store.project.materials?.[materialId]?.textureRefs?.baseColor:null;
  const asset=assetId?this.store.project.assets?.find(item=>item.assetId===assetId&&item.kind==='image.texture'):null;
  if(!asset?.dataUrl)return material;
  const texture=new THREE.TextureLoader().load(asset.dataUrl,loaded=>{loaded.colorSpace=THREE.SRGBColorSpace;loaded.needsUpdate=true;});
  texture.colorSpace=THREE.SRGBColorSpace;
  material.map=texture;
  material.needsUpdate=true;
  return material;
};

ThreeRuntime.prototype.clearModelRoot=function(){
  this.modelRoot?.traverse?.(node=>{const materials=Array.isArray(node.material)?node.material:[node.material];for(const material of materials)material?.map?.dispose?.();});
  return originalClearModelRoot.call(this);
};
