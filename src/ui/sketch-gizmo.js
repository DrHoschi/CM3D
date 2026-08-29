import * as THREE from 'three';

const AXIS_LENGTH=0.45;
const HANDLE_SIZE=0.09;
const SNAP_EPS=1e-12;

export function installSketchGizmo(store,runtime){
  const state={group:null,pickables:[],drag:null,alignedSketchId:null,previousEnableRotate:runtime.orbit.enableRotate};

  const disposeGizmo=()=>{
    if(!state.group)return;
    state.group.traverse(node=>{node.geometry?.dispose?.();if(Array.isArray(node.material))node.material.forEach(m=>m?.dispose?.());else node.material?.dispose?.();});
    state.group.parent?.remove(state.group);state.group=null;state.pickables=[];
  };

  const selectedElement=()=>store.selection.sketchElement??null;
  const selectedSketch=()=>{const s=selectedElement();return s?store.getObject(s.sketchId):null;};

  const selectedAnchorLocal=()=>{
    const selected=selectedElement(),sketch=selectedSketch();if(!selected||sketch?.type!=='sketch')return null;
    if(selected.kind==='point'){
      const p=sketch.data?.points?.[selected.elementId];return p?new THREE.Vector3(p.x,p.y,0):null;
    }
    const line=sketch.data?.lines?.[selected.elementId],a=line?sketch.data.points?.[line.startPointId]:null,b=line?sketch.data.points?.[line.endPointId]:null;
    return a&&b?new THREE.Vector3((a.x+b.x)/2,(a.y+b.y)/2,0):null;
  };

  const alignCameraToSketch=()=>{
    const selected=selectedElement(),node=selected?runtime.objectMap.get(selected.sketchId):null;if(!selected||!node)return false;
    node.updateWorldMatrix(true,false);
    const anchorLocal=selectedAnchorLocal();if(!anchorLocal)return false;
    const target=node.localToWorld(anchorLocal.clone());
    const normal=new THREE.Vector3(0,0,1).transformDirection(node.matrixWorld).normalize();
    const up=new THREE.Vector3(0,1,0).transformDirection(node.matrixWorld).normalize();
    const distance=Math.max(runtime.camera.position.distanceTo(runtime.orbit.target),0.25);
    runtime.orbit.target.copy(target);runtime.camera.up.copy(up);runtime.camera.position.copy(target).addScaledVector(normal,distance);runtime.camera.lookAt(target);runtime.orbit.update();runtime.updateCameraRange?.();runtime.updateGrid?.();
    state.alignedSketchId=selected.sketchId;return true;
  };

  const makeAxis=(axis)=>{
    const group=new THREE.Group();
    const dir=axis==='x'?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0);
    const lineGeom=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),dir.clone().multiplyScalar(AXIS_LENGTH)]);
    const line=new THREE.Line(lineGeom,new THREE.LineBasicMaterial({color:axis==='x'?0xff6b6b:0x74c0fc,depthTest:false,transparent:true,opacity:0.95}));line.renderOrder=1000;group.add(line);
    const cone=new THREE.Mesh(new THREE.ConeGeometry(0.045,0.12,16),new THREE.MeshBasicMaterial({color:axis==='x'?0xff6b6b:0x74c0fc,depthTest:false}));
    cone.position.copy(dir).multiplyScalar(AXIS_LENGTH);cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);cone.renderOrder=1001;group.add(cone);
    const hit=new THREE.Mesh(new THREE.BoxGeometry(axis==='x'?AXIS_LENGTH:0.16,axis==='y'?AXIS_LENGTH:0.16,0.08),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
    hit.position.copy(dir).multiplyScalar(AXIS_LENGTH/2);hit.userData.cm3dSketchGizmoAxis=axis;group.add(hit);state.pickables.push(hit);return group;
  };

  const rebuildGizmo=()=>{
    disposeGizmo();const selected=selectedElement(),node=selected?runtime.objectMap.get(selected.sketchId):null;if(!selected||!node){runtime.orbit.enableRotate=state.previousEnableRotate;return;}
    alignCameraToSketch();runtime.orbit.enableRotate=false;
    const anchor=selectedAnchorLocal();if(!anchor)return;
    const group=new THREE.Group();group.name='CM3D_SKETCH_GIZMO';group.renderOrder=1000;group.add(makeAxis('x'),makeAxis('y'));
    const center=new THREE.Mesh(new THREE.PlaneGeometry(HANDLE_SIZE,HANDLE_SIZE),new THREE.MeshBasicMaterial({color:0xffffff,depthTest:false,side:THREE.DoubleSide}));center.userData.cm3dSketchGizmoAxis='xy';center.renderOrder=1002;group.add(center);state.pickables.push(center);
    node.add(group);group.position.copy(anchor);state.group=group;
  };

  const rayFromEvent=event=>{runtime.pointerFromEvent(event);return runtime.raycaster;};
  const localPointOnSketch=(event,sketchId)=>{
    const node=runtime.objectMap.get(sketchId);if(!node)return null;node.updateWorldMatrix(true,false);rayFromEvent(event);
    const origin=node.getWorldPosition(new THREE.Vector3()),normal=new THREE.Vector3(0,0,1).transformDirection(node.matrixWorld);const plane=new THREE.Plane().setFromNormalAndCoplanarPoint(normal,origin);const world=new THREE.Vector3();if(!runtime.raycaster.ray.intersectPlane(plane,world))return null;return node.worldToLocal(world.clone());
  };

  const snapDelta=(value)=>{if(!store.snap.enabled)return value;const step=Number(store.snap.translate);if(!Number.isFinite(step)||step<=SNAP_EPS)return value;return Math.round(value/step)*step;};

  const startDrag=event=>{
    if(!state.pickables.length)return false;rayFromEvent(event);const hit=runtime.raycaster.intersectObjects(state.pickables,false)[0];if(!hit)return false;
    const selected=selectedElement(),sketch=selectedSketch();if(!selected||sketch?.type!=='sketch')return false;const start=localPointOnSketch(event,selected.sketchId);if(!start)return false;
    const axis=hit.object.userData.cm3dSketchGizmoAxis;const before=store.snapshot();
    let initial;
    if(selected.kind==='point'){
      const p=sketch.data.points[selected.elementId];initial={point:{x:p.x,y:p.y}};
    }else{
      const line=sketch.data.lines[selected.elementId],a=sketch.data.points[line.startPointId],b=sketch.data.points[line.endPointId];initial={lineId:line.lineId,startPointId:line.startPointId,endPointId:line.endPointId,a:{x:a.x,y:a.y},b:{x:b.x,y:b.y}};
    }
    state.drag={pointerId:event.pointerId,selected:structuredClone(selected),axis,start:{x:start.x,y:start.y},initial,before};
    runtime.orbit.enabled=false;runtime.renderer.domElement.setPointerCapture?.(event.pointerId);event.preventDefault();event.stopImmediatePropagation();return true;
  };

  const updateDrag=event=>{
    const drag=state.drag;if(!drag||event.pointerId!==drag.pointerId)return;const sketch=store.getObject(drag.selected.sketchId),p=localPointOnSketch(event,drag.selected.sketchId);if(sketch?.type!=='sketch'||!p)return;
    let dx=p.x-drag.start.x,dy=p.y-drag.start.y;if(drag.axis==='x')dy=0;if(drag.axis==='y')dx=0;dx=snapDelta(dx);dy=snapDelta(dy);
    if(drag.selected.kind==='point'){
      const point=sketch.data.points?.[drag.selected.elementId];if(point){point.x=drag.initial.point.x+dx;point.y=drag.initial.point.y+dy;}
    }else{
      const a=sketch.data.points?.[drag.initial.startPointId],b=sketch.data.points?.[drag.initial.endPointId];if(a&&b){a.x=drag.initial.a.x+dx;a.y=drag.initial.a.y+dy;b.x=drag.initial.b.x+dx;b.y=drag.initial.b.y+dy;}
    }
    store.refreshDependentExtrudesFromSketch?.(drag.selected.sketchId);store.touch();runtime.rebuild();store.emit('sketchGizmoPreview',{sketchId:drag.selected.sketchId,kind:drag.selected.kind,elementId:drag.selected.elementId});rebuildGizmo();event.preventDefault();event.stopImmediatePropagation();
  };

  const finishDrag=event=>{
    const drag=state.drag;if(!drag||event.pointerId!==drag.pointerId)return;state.drag=null;runtime.renderer.domElement.releasePointerCapture?.(event.pointerId);runtime.orbit.enabled=true;runtime.orbit.enableRotate=false;
    const after=store.snapshot();if(JSON.stringify(drag.before)!==JSON.stringify(after))store.pushHistory(drag.before,drag.selected.kind==='point'?'Skizzenpunkt per Gizmo verschieben':'Skizzenlinie per Gizmo verschieben');
    store.emit('geometryChanged',{objectId:drag.selected.sketchId,sketchDependencySynced:true});store.emit('selectionChanged');rebuildGizmo();event.preventDefault();event.stopImmediatePropagation();
  };

  const canvas=runtime.renderer.domElement;canvas.addEventListener('pointerdown',startDrag,true);window.addEventListener('pointermove',updateDrag,true);window.addEventListener('pointerup',finishDrag,true);window.addEventListener('pointercancel',finishDrag,true);

  store.subscribe(event=>{
    if(['selectionChanged','projectChanged','projectLoaded','geometryChanged','objectChanged'].includes(event.type)&&!state.drag)setTimeout(rebuildGizmo,0);
    if(event.type==='sketchGizmoPreview')return;
  });

  document.title='CyberMotion 3D – WD-12B';const label=document.querySelector('.brand small');if(label)label.textContent='WD-12B';
  rebuildGizmo();

  return {alignCameraToSketch,rebuildGizmo};
}
