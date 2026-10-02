import * as THREE from 'three';
import { ADDITION, SUBTRACTION, INTERSECTION, Brush, Evaluator } from 'https://esm.sh/three-bvh-csg@0.0.18?external=three&deps=three-mesh-bvh@0.9.15';
import { installBevelFilletRuntime } from './bevel-fillet.js';

const operationMap=Object.freeze({UNION:ADDITION,SUBTRACT:SUBTRACTION,INTERSECT:INTERSECTION});

function matrixForObject(object){
  const t=object?.transform??{};
  const p=t.position??{x:0,y:0,z:0},r=t.rotation??{x:0,y:0,z:0,w:1},s=t.scale??{x:1,y:1,z:1},pivot=t.pivot??{x:0,y:0,z:0};
  const matrix=new THREE.Matrix4().compose(new THREE.Vector3(p.x,p.y,p.z),new THREE.Quaternion(r.x,r.y,r.z,r.w).normalize(),new THREE.Vector3(s.x,s.y,s.z));
  if(pivot.x||pivot.y||pivot.z)matrix.multiply(new THREE.Matrix4().makeTranslation(-pivot.x,-pivot.y,-pivot.z));
  return matrix;
}

function brushFromGeometry(object,geometry){
  if(!geometry)return null;
  const brush=new Brush(geometry);
  brush.matrix.copy(matrixForObject(object));
  brush.matrix.decompose(brush.position,brush.quaternion,brush.scale);
  brush.updateMatrixWorld(true);
  return brush;
}

export function installBooleanRuntime(runtime){
  const baseGeometryFor=runtime.geometryFor.bind(runtime);
  const evaluator=new Evaluator();
  const evaluating=new Set();

  const geometryForBoolean=object=>{
    if(evaluating.has(object.objectId))return null;
    evaluating.add(object.objectId);
    try{
      const operation=operationMap[object.data?.operation];
      const target=runtime.store.getObject(object.data?.targetRef?.ownerId);
      const tool=runtime.store.getObject(object.data?.toolRef?.ownerId);
      if(!operation||!target||!tool)return null;
      const targetGeometry=target.type==='feature.boolean'?geometryForBoolean(target):baseGeometryFor(target);
      const toolGeometry=tool.type==='feature.boolean'?geometryForBoolean(tool):baseGeometryFor(tool);
      const targetBrush=brushFromGeometry(target,targetGeometry),toolBrush=brushFromGeometry(tool,toolGeometry);
      if(!targetBrush||!toolBrush){targetGeometry?.dispose?.();toolGeometry?.dispose?.();return null;}
      try{
        const result=evaluator.evaluate(targetBrush,toolBrush,operation);
        const geometry=result?.geometry?.clone?.()??null;
        if(geometry){geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();}
        return geometry;
      } finally {
        targetBrush.geometry?.dispose?.();
        toolBrush.geometry?.dispose?.();
      }
    } finally { evaluating.delete(object.objectId); }
  };

  runtime.geometryFor=object=>object?.type==='feature.boolean'?geometryForBoolean(object):baseGeometryFor(object);
  installBevelFilletRuntime(runtime);
  return runtime;
}
