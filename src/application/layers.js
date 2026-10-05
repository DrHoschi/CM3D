const uuid=()=>`layer_${crypto.randomUUID()}`;
const layers=store=>store.project.scene.layers??=( {} );
const ordered=store=>Object.values(layers(store)).sort((a,b)=>a.order-b.order||a.layerId.localeCompare(b.layerId));

export function installLayerAuthority(store,runtime,ui){
  store.getLayers=()=>ordered(store).map(layer=>structuredClone(layer));
  store.getLayer=layerId=>layerId?layers(store)[layerId]??null:null;
  store.createLayer=(name='Layer')=>{const before=store.snapshot(),layerId=uuid();layers(store)[layerId]={layerId,name:String(name).trim()||'Layer',order:ordered(store).length,visible:true,locked:false};store.touch();store.pushHistory(before,'Layer anlegen');store.emit('layersChanged',{layerId});return layerId;};
  store.setObjectLayer=(objectId,layerId=null)=>{const object=store.getObject(objectId);if(!object||layerId!=null&&!store.getLayer(layerId))return false;if((object.layerId??null)===layerId)return false;const before=store.snapshot();object.layerId=layerId;store.touch();store.pushHistory(before,'Layer zuweisen');store.emit('layersChanged',{objectId,layerId});return true;};
  store.setLayerVisible=(layerId,next)=>{const layer=store.getLayer(layerId);if(!layer||layer.visible===!!next)return false;const before=store.snapshot();layer.visible=!!next;store.touch();store.pushHistory(before,layer.visible?'Layer einblenden':'Layer ausblenden');store.emit('layersChanged',{layerId});return true;};
  store.setLayerLocked=(layerId,next)=>{const layer=store.getLayer(layerId);if(!layer||layer.locked===!!next)return false;const before=store.snapshot();layer.locked=!!next;store.touch();store.pushHistory(before,layer.locked?'Layer sperren':'Layer entsperren');store.emit('layersChanged',{layerId});return true;};
  store.renameLayer=(layerId,name)=>{const layer=store.getLayer(layerId),next=String(name??'').trim();if(!layer||!next||layer.name===next)return false;const before=store.snapshot();layer.name=next;store.touch();store.pushHistory(before,'Layer umbenennen');store.emit('layersChanged',{layerId});return true;};

  const baseLocked=store.isObjectLocked?.bind(store)??(()=>false);
  store.isObjectLocked=objectId=>{const object=store.getObject(objectId),layer=store.getLayer(object?.layerId);return baseLocked(objectId)||layer?.locked===true;};
  store.isObjectEffectivelyVisible=objectId=>{let object=store.getObject(objectId);while(object){if(object.flags?.visible===false)return false;const layer=store.getLayer(object.layerId);if(layer?.visible===false)return false;object=object.parentId?store.getObject(object.parentId):null;}return true;};

  const apply=()=>{for(const object of Object.values(store.project.scene.objects)){const node=runtime.objectMap.get(object.objectId);if(node)node.visible=store.isObjectEffectivelyVisible(object.objectId);}runtime.syncSelection();};
  const baseRebuild=runtime.rebuild.bind(runtime);runtime.rebuild=(...args)=>{const result=baseRebuild(...args);apply();return result;};
  const basePick=runtime.pick.bind(runtime);runtime.pick=event=>{const all=runtime.pickables;runtime.pickables=all.filter(node=>{const id=node?.userData?.cm3dObjectId;return !id||store.isObjectEffectivelyVisible(id);});try{return basePick(event);}finally{runtime.pickables=all;}};

  const baseInspector=ui.renderInspector.bind(ui);
  ui.renderInspector=()=>{
    baseInspector();
    const object=store.getObject(store.selection.activeObjectId);
    if(!object||!ui.form)return;
    const layer=store.getLayer(object.layerId);
    let field=ui.form.querySelector('#inspector-layer-field');
    if(!field){
      field=document.createElement('label');
      field.id='inspector-layer-field';
      field.className='field';
      const caption=document.createElement('span');caption.textContent='Layer';
      field.appendChild(caption);
      field.appendChild(document.createElement('select'));
      ui.form.appendChild(field);
    }
    const select=field.querySelector('select');
    select.innerHTML='<option value="">Ohne Layer</option>'+ordered(store).map(item=>`<option value="${item.layerId}">${item.name}</option>`).join('');
    select.value=object.layerId??'';
    select.onchange=()=>store.setObjectLayer(object.objectId,select.value||null);
    if(layer?.locked){
      ui.form.classList.add('inspector-locked');
      for(const control of ui.form.querySelectorAll('input, select, button'))if(control!==select)control.disabled=true;
    }
  };

  store.subscribe(event=>{if(['layersChanged','projectChanged','projectLoaded','visibilityChanged','lockChanged','objectCreated'].includes(event.type)){queueMicrotask(apply);ui.render();}});
  apply();ui.render();
  return {apply};
}

