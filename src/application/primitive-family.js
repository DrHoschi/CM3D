import { createSphereObject } from '../model/project.js';
import { installBooleanFoundation } from './boolean.js';
import { installBevelFilletFoundation } from './bevel-fillet.js';
import { installMirrorFoundation } from './mirror.js';

const positive=(value,fallback)=>{const n=Number(value);return Number.isFinite(n)&&n>0?n:fallback;};
const segments=(value,fallback=32)=>Math.max(3,Math.round(positive(value,fallback)));

function primitiveFromSphere(project,type,name,data){
  const object=createSphereObject(project,name);
  object.type=type;
  object.data=structuredClone(data);
  return object;
}

export function installPrimitiveFamily(store){
  store.addCone=()=>store.addObject(project=>primitiveFromSphere(project,'primitive.cone','Kegel',{radius:0.5,height:1,segments:32}),'Kegel erzeugen');
  store.addPlane=()=>store.addObject(project=>primitiveFromSphere(project,'primitive.plane','Ebene',{width:1,height:1}),'Ebene erzeugen');
  store.addTube=()=>store.addObject(project=>primitiveFromSphere(project,'primitive.tube','Rohr',{innerRadius:0.35,outerRadius:0.5,height:1,segments:32}),'Rohr erzeugen');
  store.addTorus=()=>store.addObject(project=>primitiveFromSphere(project,'primitive.torus','Torus',{majorRadius:0.5,tubeRadius:0.15,radialSegments:16,tubularSegments:48}),'Torus erzeugen');

  const legacySetGeometry=store.setGeometry.bind(store);
  store.setGeometry=(id,next={})=>{
    const object=store.getObject(id);
    if(!['primitive.cone','primitive.plane','primitive.tube','primitive.torus'].includes(object?.type))return legacySetGeometry(id,next);
    const before=store.snapshot();
    if(object.type==='primitive.cone')object.data={...object.data,radius:positive(next.radius,object.data.radius),height:positive(next.height,object.data.height),segments:segments(next.segments,object.data.segments)};
    if(object.type==='primitive.plane')object.data={...object.data,width:positive(next.width,object.data.width),height:positive(next.height,object.data.height)};
    if(object.type==='primitive.tube'){
      const outerRadius=positive(next.outerRadius,object.data.outerRadius);
      const requestedInner=positive(next.innerRadius,object.data.innerRadius);
      const innerRadius=requestedInner<outerRadius?requestedInner:object.data.innerRadius<outerRadius?object.data.innerRadius:outerRadius*0.5;
      object.data={...object.data,innerRadius,outerRadius,height:positive(next.height,object.data.height),segments:segments(next.segments,object.data.segments)};
    }
    if(object.type==='primitive.torus')object.data={...object.data,majorRadius:positive(next.majorRadius,object.data.majorRadius),tubeRadius:positive(next.tubeRadius,object.data.tubeRadius),radialSegments:segments(next.radialSegments,object.data.radialSegments),tubularSegments:segments(next.tubularSegments,object.data.tubularSegments)};
    store.touch();store.pushHistory(before,'Abmessungen ändern');store.emit('geometryChanged',{objectId:id});
  };

  installBooleanFoundation(store);
  installBevelFilletFoundation(store);
  installMirrorFoundation(store);
  return {types:['primitive.sphere','primitive.cone','primitive.plane','primitive.tube','primitive.torus']};
}
