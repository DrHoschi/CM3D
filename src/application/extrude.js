import { getSingleExtrudableProfile } from '../model/sketch-profile.js';

const uuid = (prefix) => `${prefix}_${crypto.randomUUID()}`;

export function createExtrudeFromSketch(store, sketchId, depth = 1) {
  const sketch = store.getObject(sketchId);
  if (sketch?.type !== 'sketch') return { ok:false, reason:'NO_SKETCH', message:'Bitte eine Skizze auswählen.' };

  const d = Number(depth);
  if (!Number.isFinite(d) || d <= 0) return { ok:false, reason:'INVALID_DEPTH', message:'Extrusionshöhe muss größer als 0 sein.' };

  const derived = getSingleExtrudableProfile(sketch);
  if (!derived.valid) {
    return {
      ok:false,
      reason:'INVALID_PROFILE',
      diagnostics:derived.diagnostics,
      message:derived.diagnostics.map(x=>x.message).join('\n') || 'Skizze enthält kein eindeutig extrudierbares Profil.'
    };
  }

  const before = store.snapshot();
  const materialId = Object.keys(store.project.materials ?? {})[0] ?? null;
  const objectId = uuid('obj');
  const profile = derived.profile;
  const object = {
    objectId,
    type:'feature.extrude',
    name:`Extrude ${sketch.name || 'Skizze'}`,
    parentId:null,
    order:store.project.scene.rootObjectIds.length,
    transform:structuredClone(sketch.transform),
    data:{
      sourceSketchId:sketch.objectId,
      depth:d,
      direction:'positive',
      profile:{
        signature:profile.signature,
        pointIds:[...profile.pointIds],
        lineIds:[...profile.lineIds],
        points:profile.points.map(p=>({x:p.x,y:p.y})),
        winding:profile.winding,
        signedArea:profile.signedArea
      }
    },
    materialIds:materialId?[materialId]:[],
    flags:{visible:true,locked:false},
    extensions:{}
  };

  store.project.scene.objects[objectId]=object;
  store.project.scene.rootObjectIds.push(objectId);
  store.touch();
  store.select(objectId,false);
  store.pushHistory(before,'Skizze extrudieren');
  store.emit('objectCreated',{objectId});
  store.emit('selectionChanged');
  return {ok:true,objectId};
}
