import { assignMaterialToObjects, createMaterial, materialBindingForObject, materialForObject, removeMaterialFromObjects, setMaterialBaseColor } from '../application/material.js';

export function installMaterialPanel(store){
  const form=document.querySelector('#inspector');if(!form)return;
  const panel=document.createElement('fieldset');panel.id='material-fields';panel.innerHTML='<legend>Material / Farbe</legend><label>Material <select id="material-select"></select></label><small id="material-selection-state"></small><label>Basisfarbe <input id="material-color" type="color" value="#b8bcc2"/></label><div class="button-row"><button id="material-assign" type="button">Material zuweisen</button><button id="material-remove" type="button">Material entfernen</button><button id="material-new" type="button">Neues Material</button></div>';
  const idBox=form.querySelector('.id-box:last-child');form.insertBefore(panel,idBox??null);
  const select=panel.querySelector('#material-select'),state=panel.querySelector('#material-selection-state'),color=panel.querySelector('#material-color'),assign=panel.querySelector('#material-assign'),remove=panel.querySelector('#material-remove'),create=panel.querySelector('#material-new');

  const selectedObjects=()=>store.selection.selectedObjectIds.map(id=>store.getObject(id)).filter(object=>object&&!['sketch','group','assembly','external.gltf'].includes(object.type));
  function render(){
    const objects=selectedObjects();panel.hidden=!objects.length;if(!objects.length)return;
    const bindings=objects.map(object=>materialBindingForObject(store,object.objectId));
    const keys=bindings.map(binding=>binding?`${binding.mode}:${binding.materialId}`:'none');
    const mixed=new Set(keys).size>1;
    const currentId=!mixed?bindings[0]?.materialId??'':'';
    select.replaceChildren();for(const material of Object.values(store.project.materials??{}))select.appendChild(new Option(material.name||material.materialId,material.materialId));
    if(currentId&&[...select.options].some(o=>o.value===currentId))select.value=currentId;
    state.textContent=objects.length>1?(mixed?`${objects.length} Objekte · Gemischte Materialien`:`${objects.length} Objekte · Gemeinsames Material`):bindings[0]?.mode==='local'?'Lokale Materialvariante':'';
    const material=!mixed&&currentId?materialForObject(store,objects[0].objectId):store.project.materials?.[select.value];if(material?.properties?.baseColor)color.value=material.properties.baseColor;
  }
  select.onchange=()=>{const material=store.project.materials?.[select.value];if(material?.properties?.baseColor)color.value=material.properties.baseColor;};
  assign.onclick=()=>{const ids=selectedObjects().map(o=>o.objectId);const r=assignMaterialToObjects(store,ids,select.value);if(!r.ok)alert(r.message);};
  remove.onclick=()=>{const ids=selectedObjects().map(o=>o.objectId);const r=removeMaterialFromObjects(store,ids);if(!r.ok)alert(r.message);};
  color.onchange=()=>{const id=select.value;if(!id)return;const r=setMaterialBaseColor(store,id,color.value);if(!r.ok)alert(r.message);};
  create.onclick=()=>{const r=createMaterial(store,{name:`Material ${Object.keys(store.project.materials??{}).length+1}`,baseColor:color.value});if(!r.ok){alert(r.message);return;}const ids=selectedObjects().map(o=>o.objectId);if(ids.length)assignMaterialToObjects(store,ids,r.materialId);render();select.value=r.materialId;};
  store.subscribe(e=>{if(['selectionChanged','projectChanged','projectLoaded','objectCreated','historyChanged','materialChanged'].includes(e.type))render();});render();
}
