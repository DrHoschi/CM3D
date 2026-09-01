import { getSingleExtrudableProfile } from '../model/sketch-profile.js';
import {
  ReferenceTargetKind,
  ReferenceState,
  createStableReference,
  createReferenceResolution,
  resolveStableReference
} from './stable-reference.js';

const uuid = (prefix) => `${prefix}_${crypto.randomUUID()}`;

export function syncExtrudeSourceReference(store, object) {
  if (object?.type !== 'feature.extrude') return null;
  object.data ??= {};
  object.extensions ??= {};

  let reference = object.data.sourceSketchRef ?? null;
  if (!reference && object.data.sourceSketchId) {
    reference = createStableReference(
      ReferenceTargetKind.SKETCH,
      object.data.sourceSketchId,
      object.data.sourceSketchId
    );
    object.data.sourceSketchRef = reference;
  }

  if (!reference) {
    const resolution = createReferenceResolution(
      createStableReference(ReferenceTargetKind.SKETCH, object.objectId, object.objectId),
      ReferenceState.UNRESOLVED,
      [{ code:'SOURCE_REFERENCE_MISSING', message:'Extrusion besitzt keine Quellskizzen-Referenz.' }]
    );
    object.extensions.sourceSketchReference = {
      state: resolution.state,
      diagnostics: resolution.diagnostics
    };
    return resolution;
  }

  const resolution = resolveStableReference(store, reference);
  object.extensions.sourceSketchReference = {
    state: resolution.state,
    diagnostics: resolution.diagnostics
  };
  return resolution;
}

export function syncAllExtrudeSourceReferences(store) {
  const results = [];
  for (const object of Object.values(store.project?.scene?.objects ?? {})) {
    if (object?.type !== 'feature.extrude') continue;
    results.push({ objectId: object.objectId, resolution: syncExtrudeSourceReference(store, object) });
  }
  return results;
}

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
  const parentId = sketch.parentId ?? null;
  const order = parentId === null
    ? store.project.scene.rootObjectIds.length
    : Object.values(store.project.scene.objects).filter(object => object.parentId === parentId).length;
  const sourceSketchRef = createStableReference(
    ReferenceTargetKind.SKETCH,
    sketch.objectId,
    sketch.objectId
  );
  const object = {
    objectId,
    type:'feature.extrude',
    name:`Extrude ${sketch.name || 'Skizze'}`,
    parentId,
    order,
    transform:structuredClone(sketch.transform),
    data:{
      sourceSketchId:sketch.objectId,
      sourceSketchRef,
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

  syncExtrudeSourceReference(store, object);
  store.project.scene.objects[objectId]=object;
  if (parentId === null) store.project.scene.rootObjectIds.push(objectId);
  store.touch();
  store.select(objectId,false);
  store.pushHistory(before,'Skizze extrudieren');
  store.emit('objectCreated',{objectId});
  store.emit('selectionChanged');
  return {ok:true,objectId};
}
