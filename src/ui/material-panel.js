import { assignMaterial, createMaterial, materialForObject, setMaterialBaseColor } from '../application/material.js';

export function installMaterialPanel(store){
  const form=document.querySelector('#inspector');if(!form)return;
  const panel=document.createElement('fieldset');panel.id='material-fields';panel.innerHTML='<legend>Material / Farbe</legend><label>Material <select id="material-select"></select></label><label>Basisfarbe <input id="material-color" type="color" value="#b8bcc2"/></label><div class="button-row"><button id="material-assign" type="button">Material zuweisen</button><button id="material-new" type="button">Neues Material</button></div>';
  const idBox=form.querySelector('.id-box:last-child');form.insertBefore(panel,idBox??null);
  const select=panel.querySelector('#material-select'),color=panel.querySelector('#material-color'),assign=panel.querySelector('#material-assign'),create=panel.querySelector('#material-new');

  const active=()=>store.getObject(store.selection.activeObjectId);
  function render(){
    const object=active(),supported=!!object&&!['sketch','group','assembly'].includes(object.type);panel.hidden=!supported;if(!supported)return;
    const currentId=object.materialIds?.[0]??'';select.replaceChildren();for(const material of Object.values(store.project.materials??{}))select.appendChild(new Option(material.name||material.materialId,material.materialId));if(currentId&&[...select.options].some(o=>o.value===currentId))select.value=currentId;
    const material=materialForObject(store,object.objectId)??store.project.materials?.[select.value];if(material?.properties?.baseColor)color.value=material.properties.baseColor;
  }
  select.onchange=()=>{const material=store.project.materials?.[select.value];if(material?.properties?.baseColor)color.value=material.properties.baseColor;};
  assign.onclick=()=>{const object=active();if(!object)return;const r=assignMaterial(store,object.objectId,select.value);if(!r.ok)alert(r.message);};
  color.onchange=()=>{const id=select.value;if(!id)return;const r=setMaterialBaseColor(store,id,color.value);if(!r.ok)alert(r.message);};
  create.onclick=()=>{const r=createMaterial(store,{name:`Material ${Object.keys(store.project.materials??{}).length+1}`,baseColor:color.value});if(!r.ok){alert(r.message);return;}const object=active();if(object)assignMaterial(store,object.objectId,r.materialId);render();select.value=r.materialId;};
  store.subscribe(e=>{if(['selectionChanged','projectChanged','projectLoaded','objectCreated','historyChanged','materialChanged'].includes(e.type))render();});render();
}
