import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { installImportedStructureUI } from '../src/ui/imported-structure.js';
import { installLayerAuthority } from '../src/application/layers.js';

// Minimal DOM fixture. The actual imported inspector and layer implementations
// run together; only unrelated material persistence/library dependencies are stubbed.
class Element {
  constructor(tag) { this.tagName=tag; this.children=[]; this.hidden=false; this.disabled=false; this.dataset={}; this.classList={add(){},toggle(){}}; }
  appendChild(child) { this.children.push(child); return child; }
  append(...children) { children.forEach(child=>this.appendChild(child)); }
  insertBefore(child) { return this.appendChild(child); }
  replaceChildren(...children) { this.children=children; this._value=undefined; }
  addEventListener() {}
  set innerHTML(html) {
    this.children=[];
    for(const match of html.matchAll(/<(select|input|button|small|option)\b([^>]*)>/g)) {
      const child=new Element(match[1]);
      child.id=/id="([^"]*)"/.exec(match[2])?.[1];
      child.value=/value="([^"]*)"/.exec(match[2])?.[1]??'';
      this.appendChild(child);
    }
  }
  get options() { return this.children.filter(child=>child.tagName==='option'); }
  get value() { return this._value??this.options[0]?.value??''; }
  set value(value) { this._value=value; }
  querySelectorAll(selector) {
    const selectors=selector.split(',').map(x=>x.trim());
    const matches=node=>selectors.some(s=>s.startsWith('#')?node.id===s.slice(1):node.tagName===s);
    return this.children.flatMap(child=>[...(matches(child)?[child]:[]),...child.querySelectorAll(selector)]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0]??null; }
}
const form=new Element('form'); form.id='inspector';
const document={createElement:tag=>new Element(tag),querySelector:s=>s==='#inspector'?form:form.querySelector(s)};
globalThis.document=document;
const root={objectId:'root',type:'external.gltf',data:{}};
const cube={objectId:'cube',type:'primitive.box',layerId:'layer_a'};
const listeners=[];
const store={
  project:{assets:[],scene:{objects:{root,cube},layers:{layer_a:{layerId:'layer_a',name:'A',order:0},layer_b:{layerId:'layer_b',name:'B',order:1}}},materials:{native:{materialId:'native',name:'Native',properties:{baseColor:'#ffffff'}}}},
  selection:{activeObjectId:null,selectedObjectIds:[]},
  getObject(id){return this.project.scene.objects[id];},
  subscribe(fn){listeners.push(fn);},
  emit(type,payload={}){for(const fn of listeners)fn({type,...payload});},
  select(id,notify=true){this.selection={activeObjectId:id,selectedObjectIds:id?[id]:[],importedElement:null};if(notify)this.emit('selectionChanged');},
  snapshot(){return structuredClone(this.project);},touch(){},pushHistory(){}
};
const sourceKey='imported:root:node:0';
const node={isMesh:true,userData:{cm3dImportedElement:{sourceKey}},position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0},scale:{x:1,y:1,z:1},material:{color:{getHexString:()=> '123456'},metalness:.2,roughness:.7,opacity:1}};
const runtime={objectMap:new Map([['root',{traverse(fn){fn(node);}}]]),transform:{attach(){}},commitTransform(){},rebuild(){},pick(){},syncSelection(){},pickables:[],renderer:{domElement:{addEventListener(){}}}};
const ui={form,fields:new Proxy({},{get:(obj,key)=>obj[key]??=(new Element('input'))}),treeNode(){},renderInspector(){form.hidden=!store.getObject(store.selection.activeObjectId);},render(){this.renderInspector();}};
// Preserve the production listener order: AppUI -> imported UI -> material panel.
store.subscribe(e=>{if(['selectionChanged','projectChanged','historyChanged','objectCreated'].includes(e.type))ui.render();});
const imported=installImportedStructureUI(store,runtime,ui);
const materialSource=readFileSync(new URL('../src/ui/material-panel.js',import.meta.url),'utf8');
const installMaterialPanel=runInNewContext(materialSource.replace(/^import .*;\n/gm,'').replace('export function installMaterialPanel','function installMaterialPanel')+'\ninstallMaterialPanel;',{
  document,
  Option:function(text,value){const option=new Element('option');option.textContent=text;option.value=value;return option;},
  sharedLibraryRegistry:{entries:[]},MATERIAL_PRESETS:[],listLibraryEntries:()=>[],
  materialBindingForObject:()=>({mode:'shared',materialId:'native'}),
  materialForObject:()=>store.project.materials.native,textureAssetForMaterial:()=>null
});
const material=installMaterialPanel(store);
installLayerAuthority(store,runtime,ui);
imported.register('root',[{sourceKey,parentSourceKey:null,kind:'mesh',name:'Crate'}]);
const panel=form.querySelector('#material-fields');
for(let i=0;i<5;i++) {
  imported.select('root',sourceKey);
  assert.equal(panel.hidden,false,'later material listener must retain the imported mesh panel');
  assert.equal(form.querySelector('#material-color').value,'#123456','imported values must survive native material listener');
  assert.equal(form.querySelector('#imported-normal-map-controls').hidden,false);
  assert.equal(form.querySelector('#material-normal-map-file').disabled,false);
  assert.equal(form.querySelector('#material-assign').disabled,true);
  store.emit('historyChanged');
  assert.equal(panel.hidden,false,'history render must also preserve imported controls');
  store.select('cube');
  assert.equal(panel.hidden,false,'native cube material remains visible');
  assert.equal(form.querySelector('#material-color').value,'#ffffff');
  assert.equal(form.querySelector('#imported-normal-map-controls').hidden,true);
  store.select('root');
  assert.equal(panel.hidden,true,'whole GLB root does not expose native material assignment');
  store.select(null);
  assert.equal(panel.hidden,true);
}
store.select('cube');
const fieldsBefore=form.children.length;
for(let i=0;i<30;i++)ui.renderInspector();
assert.equal(form.children.length,fieldsBefore,'repeated rendering must not append Layer rows');
assert.equal(form.querySelectorAll('#inspector-layer-field').length,1);
const select=form.querySelector('#inspector-layer-field').querySelector('select');
assert.equal(select.value,'layer_a');
store.select('root');
assert.equal(select.value,'');
select.value='layer_b'; select.onchange();
assert.equal(root.layerId,'layer_b','reused Layer control must update current selection');
assert.equal(cube.layerId,'layer_a','previous selection must remain untouched');
store.project.scene.layers.layer_b.locked=true; ui.renderInspector();
assert.equal(form.querySelector('#material-color').disabled,true,'layer lock must still disable controls');
store.project.scene.layers.layer_b.name='Renamed'; ui.renderInspector();
assert.equal(select.value,'layer_b');
assert.equal(form.children.length,fieldsBefore);
await new Promise(resolve=>setImmediate(resolve));
delete globalThis.document;
console.log('PASS imported inspector visibility, selection transitions and Layer field reuse');
