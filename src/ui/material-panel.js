import { assignMaterialToObjects, createMaterial, materialBindingForObject, materialForObject, removeMaterialFromObjects, setMaterialBaseColor, setMaterialMetallic, setMaterialOpacity, setMaterialRoughness } from '../application/material.js';

export function installMaterialPanel(store){
  const form=document.querySelector('#inspector');if(!form)return;
  const panel=document.createElement('fieldset');panel.id='material-fields';panel.innerHTML='<legend>Material / Farbe</legend><label>Material <select id="material-select"></select></label><small id="material-selection-state"></small><label>Basisfarbe <input id="material-color" type="color" value="#b8bcc2"/></label><label>Metallisch <input id="material-metallic" type="number" min="0" max="1" step="0.01" value="0"/></label><label>Rauigkeit <input id="material-roughness" type="number" min="0" max="1" step="0.01" value="0.6"/></label><label>Transparenz / Opazität <input id="material-opacity" type="number" min="0" max="1" step="0.01" value="1"/></label><div class="button-row"><button id="material-assign" type="button">Material zuweisen</button><button id="material-remove" type="button">Material entfernen</button><button id="material-new" type="button">Neues Material</button></div>';
  const idBox=form.querySelector('.id-box:last-child');form.insertBefore(panel,idBox??null);
  const select=panel.querySelector('#material-select'),state=panel.querySelector('#material-selection-state'),color=panel.querySelector('#material-color'),metallic=panel.querySelector('#material-metallic'),roughness=panel.querySelector('#material-roughness'),opacity=panel.querySelector('#material-opacity'),assign=panel.querySelector('#material-assign'),remove=panel.querySelector('#material-remove'),create=panel.querySelector('#material-new');

  const selectedObjects=()=>store.selection.selectedObjectIds.map(id=>store.getObject(id)).filter(object=>object&&!['sketch','group','assembly','external.gltf'].includes(object.type));
  const applyMaterialValues=material=>{if(!material)return;if(material.properties?.baseColor)color.value=material.properties.baseColor;metallic.value=String(Number(material.properties?.metallic??0));roughness.value=String(Number(material.properties?.roughness??0.6));opacity.value=String(Number(material.properties?.opacity??1));};
  function render(){
    const objects=selectedObjects();panel.hidden=!objects.length;if(!objects.length)return;
    const bindings=objects.map(object=>materialBindingForObject(store,object.objectId));
    const keys=bindings.map(binding=>binding?`${binding.mode}:${binding.materialId}`:'none');
    const mixed=new Set(keys).size>1;
    const currentId=!mixed?bindings[0]?.materialId??'':'';
    select.replaceChildren();for(const material of Object.values(store.project.materials??{}))select.appendChild(new Option(material.name||material.materialId,material.materialId));
    if(currentId&&[...select.options].some(o=>o.value===currentId))select.value=currentId;
    state.textContent=objects.length>1?(mixed?`${objects.length} Objekte · Gemischte Materialien`:`${objects.length} Objekte · Gemeinsames Material`):bindings[0]?.mode==='local'?'Lokale Materialvariante':'';
    applyMaterialValues(!mixed&&currentId?materialForObject(store,objects[0].objectId):store.project.materials?.[select.value]);
  }
  select.onchange=()=>applyMaterialValues(store.project.materials?.[select.value]);
  assign.onclick=()=>{const ids=selectedObjects().map(o=>o.objectId);const r=assignMaterialToObjects(store,ids,select.value);if(!r.ok)alert(r.message);};
  remove.onclick=()=>{const ids=selectedObjects().map(o=>o.objectId);const r=removeMaterialFromObjects(store,ids);if(!r.ok)alert(r.message);};
  color.onchange=()=>{const id=select.value;if(!id)return;const r=setMaterialBaseColor(store,id,color.value);if(!r.ok)alert(r.message);};
  const changeNumeric=(input,setter)=>{const id=select.value;if(!id)return;const r=setter(store,id,input.value);if(!r.ok){alert(r.message);render();}};
  metallic.onchange=()=>changeNumeric(metallic,setMaterialMetallic);
  roughness.onchange=()=>changeNumeric(roughness,setMaterialRoughness);
  opacity.onchange=()=>changeNumeric(opacity,setMaterialOpacity);
  create.onclick=()=>{const r=createMaterial(store,{name:`Material ${Object.keys(store.project.materials??{}).length+1}`,baseColor:color.value});if(!r.ok){alert(r.message);return;}const ids=selectedObjects().map(o=>o.objectId);if(ids.length)assignMaterialToObjects(store,ids,r.materialId);render();select.value=r.materialId;};
  store.subscribe(e=>{if(['selectionChanged','projectChanged','projectLoaded','objectCreated','historyChanged','materialChanged'].includes(e.type))render();});render();
}
