import { recognizePathIdentity } from '../model/sketch-profile-path-identity.js';
import { ReferenceTargetKind, ReferenceState, createReferenceResolution, resolveStableReference } from './stable-reference.js';

export const ThinExtrudeSide = Object.freeze({ LEFT:'LEFT', RIGHT:'RIGHT', CENTER:'CENTER' });
const validSides = new Set(Object.values(ThinExtrudeSide));
const validDirections = new Set(['positive','negative','symmetric']);
const clonePoint = point => ({ x:Number(point.x), y:Number(point.y) });

const orderedPathPoints = path => {
  const points = [];
  for (const curve of path?.curves ?? []) {
    const samples = curve?.tessellation ?? [];
    for (let index=0; index<samples.length; index += 1) {
      const point = clonePoint(samples[index]);
      const previous = points[points.length - 1];
      if (previous && index === 0 && Math.abs(previous.x-point.x) < 1e-9 && Math.abs(previous.y-point.y) < 1e-9) continue;
      points.push(point);
    }
  }
  return points;
};

const unitNormal = (a,b) => {
  const dx=b.x-a.x, dy=b.y-a.y;
  const length=Math.hypot(dx,dy);
  return length > 1e-9 ? { x:-dy/length, y:dx/length } : null;
};

const offsetPolyline = (points, distance) => points.map((point,index) => {
  const previous = points[Math.max(0,index-1)];
  const next = points[Math.min(points.length-1,index+1)];
  const n1 = unitNormal(previous,point);
  const n2 = unitNormal(point,next);
  const normal = n1 && n2 ? { x:n1.x+n2.x, y:n1.y+n2.y } : (n1 ?? n2);
  if (!normal) return null;
  const length=Math.hypot(normal.x,normal.y);
  if (length <= 1e-9) return { x:point.x+n1.x*distance, y:point.y+n1.y*distance };
  const nx=normal.x/length, ny=normal.y/length;
  const segmentNormal = n2 ?? n1;
  const denominator = Math.max(0.25, nx*segmentNormal.x + ny*segmentNormal.y);
  return { x:point.x + nx*distance/denominator, y:point.y + ny*distance/denominator };
});

export function deriveThinExtrudeContour(path, thickness, side = ThinExtrudeSide.CENTER) {
  const width=Number(thickness);
  if (!Number.isFinite(width) || width <= 0 || !validSides.has(side)) return null;
  const points=orderedPathPoints(path);
  if (points.length < 2) return null;
  const leftDistance = side === ThinExtrudeSide.RIGHT ? 0 : side === ThinExtrudeSide.CENTER ? width/2 : width;
  const rightDistance = side === ThinExtrudeSide.LEFT ? 0 : side === ThinExtrudeSide.CENTER ? width/2 : width;
  const left=offsetPolyline(points,leftDistance);
  const right=offsetPolyline(points,-rightDistance);
  if (left.some(point=>!point) || right.some(point=>!point)) return null;
  const contour=[...left,...right.reverse()];
  if (contour.length < 4 || contour.some(point=>!Number.isFinite(point.x)||!Number.isFinite(point.y))) return null;
  return contour;
}

const setBlocked = (object, resolution, message) => {
  object.data.contour=[];
  object.extensions ??= {};
  object.extensions.recomputeState={
    state:ReferenceState.BLOCKED,
    upstreamState:resolution?.state ?? ReferenceState.INVALID,
    diagnostics:[{code:`UPSTREAM_${resolution?.state ?? ReferenceState.INVALID}`,message},...(resolution?.diagnostics ?? [])]
  };
};

export function syncThinExtrudeSourceReference(store, object) {
  if (object?.type !== 'feature.thin-extrude') return null;
  object.data ??= {};
  object.extensions ??= {};
  const reference=object.data.sourceRef;
  if (reference?.targetKind !== ReferenceTargetKind.PATH) {
    const resolution=createReferenceResolution(reference ?? {targetKind:ReferenceTargetKind.PATH,ownerId:object.objectId,targetId:object.objectId},ReferenceState.INVALID,[{code:'PATH_REFERENCE_REQUIRED',message:'Thin Extrude benötigt eine stabile PATH-Referenz.'}]);
    setBlocked(object,resolution,'Thin Extrude ist ohne gültige PATH-Referenz blockiert.');
    return resolution;
  }
  const resolution=resolveStableReference(store,reference);
  if (resolution.state !== ReferenceState.RESOLVED) {
    setBlocked(object,resolution,`Thin Extrude ist blockiert, weil die PATH-Referenz ${resolution.state} ist.`);
    return resolution;
  }
  const sketch=store.getObject?.(reference.ownerId) ?? null;
  const identity=sketch?.data?.pathIdentities?.[reference.targetId] ?? null;
  const recognized=recognizePathIdentity(sketch,identity);
  if (recognized.state !== ReferenceState.RESOLVED || !recognized.target) {
    const failed=createReferenceResolution(reference,recognized.state,recognized.diagnostics ?? []);
    setBlocked(object,failed,`Thin Extrude ist blockiert, weil der Pfad ${recognized.state} ist.`);
    return failed;
  }
  const depth=Number(object.data.depth), thickness=Number(object.data.thickness);
  const side=object.data.side ?? ThinExtrudeSide.CENTER;
  const direction=object.data.direction ?? 'positive';
  if (!Number.isFinite(depth)||depth<=0||!Number.isFinite(thickness)||thickness<=0||!validSides.has(side)||!validDirections.has(direction)) {
    const failed=createReferenceResolution(reference,ReferenceState.INVALID,[{code:'INVALID_THIN_EXTRUDE_PARAMETERS',message:'Thin-Extrude-Parameter sind ungültig.'}]);
    object.data.contour=[];
    object.extensions.recomputeState={state:ReferenceState.INVALID,upstreamState:null,diagnostics:failed.diagnostics};
    return failed;
  }
  const contour=deriveThinExtrudeContour(recognized.target,thickness,side);
  if (!contour) {
    const failed=createReferenceResolution(reference,ReferenceState.INVALID,[{code:'DEGENERATE_THIN_CONTOUR',message:'Aus dem offenen Pfad kann keine gültige dünne Kontur abgeleitet werden.'}]);
    object.data.contour=[];
    object.extensions.recomputeState={state:ReferenceState.INVALID,upstreamState:null,diagnostics:failed.diagnostics};
    return failed;
  }
  object.data.contour=contour;
  object.extensions.recomputeState={state:'READY',upstreamState:null,diagnostics:[]};
  return resolution;
}

export function syncAllThinExtrudeSourceReferences(store) {
  const results=[];
  for (const object of Object.values(store?.project?.scene?.objects ?? {})) {
    if (object?.type === 'feature.thin-extrude') results.push({objectId:object.objectId,resolution:syncThinExtrudeSourceReference(store,object)});
  }
  return results;
}
