export function installLayersUI(store,ui){
  const host=document.querySelector('#object-tree')?.parentElement;
  if(!host)return null;
  const panel=document.createElement('div');panel.className='layer-foundation';panel.style.cssText='display:flex;gap:4px;align-items:center;padding:4px 0;';
  const select=document.createElement('select');select.title='Layer';
  const add=document.createElement('button');add.type='button';add.textContent='+ Layer';
  const eye=document.createElement('button');eye.type='button';eye.title='Layer sichtbar/unsichtbar';eye.textContent='◉';
  const lock=document.createElement('button');lock.type='button';lock.title='Layer sperren/entsperren';lock.textContent='🔓';
  panel.append(select,add,eye,lock);host.insertBefore(panel,host.firstChild);
  const render=()=>{const current=select.value;const layers=store.getLayers();select.innerHTML='<option value="">Ohne Layer</option>'+layers.map(layer=>`<option value="${layer.layerId}">${layer.name}</option>`).join('');if(layers.some(layer=>layer.layerId===current))select.value=current;const layer=store.getLayer(select.value);eye.disabled=lock.disabled=!layer;eye.textContent=layer?.visible===false?'○':'◉';lock.textContent=layer?.locked?'🔒':'🔓';};
  add.onclick=()=>{const layerId=store.createLayer(`Layer ${store.getLayers().length+1}`);render();select.value=layerId;render();};
  select.onchange=render;
  eye.onclick=()=>{const layer=store.getLayer(select.value);if(layer)store.setLayerVisible(layer.layerId,!layer.visible);};
  lock.onclick=()=>{const layer=store.getLayer(select.value);if(layer)store.setLayerLocked(layer.layerId,!layer.locked);};
  store.subscribe(event=>{if(['layersChanged','projectChanged','projectLoaded'].includes(event.type))render();});render();
  return {render};
}
