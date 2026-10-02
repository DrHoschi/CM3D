import * as THREE from 'three';

function boxOfGeometry(geometry){geometry?.computeBoundingBox?.();return geometry?.boundingBox?.clone?.()??null;}
function geometryFromBox(box){if(!box||box.isEmpty())return null;const size=new THREE.Vector3(),center=new THREE.Vector3();box.getSize(size);box.getCenter(center);if(!(size.x>0&&size.y>0&&size.z>0))return null;const geometry=new THREE.BoxGeometry(size.x,size.y,size.z);geometry.translate(center.x,center.y,center.z);return geometry;}

export function installBooleanRuntime(runtime){
  const base=runtime.geometryFor.bind(runtime);
  runtime.geometryFor=object=>{
    if(object?.type!=='feature.boolean')return base(object);
    const target=runtime.store.getObject(object.data?.targetRef?.ownerId),tool=runtime.store.getObject(object.data?.toolRef?.ownerId);
    if(!target||!tool)return null;
    const a=base(target),b=base(tool);if(!a||!b)return null;
    const ab=boxOfGeometry(a),bb=boxOfGeometry(b);a.dispose?.();b.dispose?.();if(!ab||!bb)return null;
    if(object.data.operation==='INTERSECT')return geometryFromBox(ab.intersect(bb));
    if(object.data.operation==='UNION')return geometryFromBox(ab.union(bb));
    if(object.data.operation==='SUBTRACT'){
      if(!ab.intersectsBox(bb))return geometryFromBox(ab);
      const intersection=ab.clone().intersect(bb);if(intersection.equals(ab))return null;
      // Foundation fallback: retain deterministic target bounds until exact CSG kernel replaces this runtime adapter.
      return geometryFromBox(ab);
    }
    return null;
  };
}
