export function installSketchMultiSelection(store,runtime,ui){
  store.selection.sketchElements=[];
  store.sketchMultiSelectEnabled=false;
  const baseSelectSketchElement=store.selectSketchElement.bind(store);
  const baseSelect=store.select.bind(store);
  const baseClear=store.clearSelection.bind(store);

  const same=(a,b)=>a&&b&&a.sketchId===b.sketchId&&a.kind===b.kind&&a.elementId===b.elementId;
  const syncPrimary=()=>{store.selection.sketchElement=store.selection.sketchElements.at(-1)??null;};

  store.setSketchMultiSelectEnabled=(enabled,notify=true)=>{
    store.sketchMultiSelectEnabled=!!enabled;
    if(!enabled&&store.selection.sketchElements.length>1){store.selection.sketchElements=[store.selection.sketchElements.at(-1)];syncPrimary();}
    if(notify)store.emit('selectionChanged',{sketchMultiSelectEnabled:store.sketchMultiSelectEnabled});
  };

  store.selectSketchElement=(sketchId,kind,elementId,notify=true)=>{
    const sketch=store.getObject(sketchId);const map=kind==='line'?sketch?.data?.lines:kind==='point'?sketch?.data?.points:null;if(sketch?.type!=='sketch'||!map?.[elementId])return false;
    const next={sketchId,kind,elementId};
    if(!store.sketchMultiSelectEnabled){store.selection.sketchElements=[next];return baseSelectSketchElement(sketchId,kind,elementId,notify);}
    baseSelect(sketchId,false,false);
    store.selection.sketchElements=store.selection.sketchElements.filter(item=>item.sketchId===sketchId);
    const index=store.selection.sketchElements.findIndex(item=>same(item,next));
    if(index>=0)store.selection.sketchElements.splice(index,1);else store.selection.sketchElements.push(next);
    syncPrimary();
    if(notify)store.emit('selectionChanged',{sketchElements:structuredClone(store.selection.sketchElements),sketchMultiSelectEnabled:true});
    return true;
  };

  store.select=(id,notify=true,additive=false)=>{store.selection.sketchElements=[];return baseSelect(id,notify,additive);};
  store.clearSelection=(notify=true)=>{store.selection.sketchElements=[];return baseClear(notify);};
  store.getSelectedSketchElements=()=>store.selection.sketchElements.length?store.selection.sketchElements:store.selection.sketchElement?[store.selection.sketchElement]:[];

  const fieldset=document.querySelector('#sketch-element-fields');
  if(fieldset&&!fieldset.querySelector('#sketch-multiselect-toggle')){
    const row=document.createElement('label');row.className='sketch-multiselect-row';row.innerHTML='<input id="sketch-multiselect-toggle" type="checkbox"> Mehrfachauswahl';
    fieldset.insertBefore(row,fieldset.firstChild?.nextSibling??fieldset.firstChild);
    const input=row.querySelector('input');input.addEventListener('change',()=>store.setSketchMultiSelectEnabled(input.checked));
    store.subscribe(event=>{if(event.type==='selectionChanged')input.checked=store.sketchMultiSelectEnabled;});
  }

  const repaint=()=>{
    const selected=store.getSelectedSketchElements();
    for(const node of runtime.objectMap.values())node.traverse(child=>{const meta=child.userData?.cm3dSketchElement;if(!meta||!child.material?.color)return;const active=selected.some(item=>same(item,meta));child.material.color.set(active?0x63d6ff:meta.kind==='line'?0xf4d35e:0xffffff);});
    document.querySelectorAll('.sketch-element-item').forEach(row=>{const sketchId=row.closest('[data-object-id]')?.dataset?.objectId;const meta={sketchId,kind:row.dataset.sketchElementKind,elementId:row.dataset.sketchElement};row.classList.toggle('selected',selected.some(item=>item.kind===meta.kind&&item.elementId===meta.elementId&&(sketchId?item.sketchId===sketchId:true)));});
  };
  store.subscribe(event=>{if(['selectionChanged','geometryChanged','projectChanged','projectLoaded'].includes(event.type))setTimeout(repaint,0);});
  repaint();
  return {repaint};
}

const style=document.createElement('style');style.textContent='.sketch-multiselect-row{display:flex;align-items:center;gap:8px;margin:6px 0 10px;font-size:12px}.sketch-multiselect-row input{width:18px;height:18px}';document.head.appendChild(style);
