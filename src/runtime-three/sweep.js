import * as THREE from 'three';
import { installLoftRuntime } from './loft.js';

export function installSweepRuntime(runtime){
  const baseGeometryFor=runtime.geometryFor.bind(runtime);
  runtime.geometryFor=object=>{
    if(object?.type!=='feature.sweep')return baseGeometryFor(object);
    const profile=object.data?.profile?.points,frames=object.data?.frames;if(!Array.isArray(profile)||profile.length<3||!Array.isArray(frames)||frames.length<2)return null;
    const ring=profile.map(p=>({x:Number(p.x),y:Number(p.y)}));if(ring.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))return null;
    const positions=[];for(const f of frames)for(const p of ring)positions.push(f.origin.x+f.normal.x*p.x+f.binormal.x*p.y,f.origin.y+f.normal.y*p.x+f.binormal.y*p.y,f.origin.z+f.normal.z*p.x+f.binormal.z*p.y);
    const indices=[],n=ring.length,m=frames.length;for(let j=0;j<m-1;j+=1)for(let i=0;i<n;i+=1){const a=j*n+i,b=j*n+(i+1)%n,c=(j+1)*n+(i+1)%n,d=(j+1)*n+i;indices.push(a,b,d,b,c,d);}
    const start=positions.length/3;for(const p of ring)positions.push(frames[0].origin.x+frames[0].normal.x*p.x+frames[0].binormal.x*p.y,frames[0].origin.y+frames[0].normal.y*p.x+frames[0].binormal.y*p.y,frames[0].origin.z+frames[0].normal.z*p.x+frames[0].binormal.z*p.y);const end=positions.length/3;for(const p of ring)positions.push(frames.at(-1).origin.x+frames.at(-1).normal.x*p.x+frames.at(-1).binormal.x*p.y,frames.at(-1).origin.y+frames.at(-1).normal.y*p.x+frames.at(-1).binormal.y*p.y,frames.at(-1).origin.z+frames.at(-1).normal.z*p.x+frames.at(-1).binormal.z*p.y);
    for(let i=1;i<n-1;i+=1){indices.push(start,start+i+1,start+i);indices.push(end,end+i,end+i+1);}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
  };
  installLoftRuntime(runtime);
}
