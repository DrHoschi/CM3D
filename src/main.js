import { AppStore } from './application/store.js';
import { createExtrudeFromSketch } from './application/extrude.js';
import { ThreeRuntime } from './runtime-three/runtime.js';
import { installExtrudeRuntime } from './runtime-three/extrude.js';
import { AppUI } from './ui/app.js';
import { installMaterialPanel } from './ui/material-panel.js';

const store = new AppStore();
const viewport = document.querySelector('#viewport');

const runtime = new ThreeRuntime(viewport, store);
installExtrudeRuntime(runtime);
new AppUI(store);
installMaterialPanel(store);

for (const button of document.querySelectorAll('[data-fixed-view]')) {
  button.addEventListener('click', () => runtime.setFixedView(button.dataset.fixedView));
}

const sketchPlane=document.querySelector('#sketch-plane');
const newSketchButton=document.querySelector('#new-sketch');
newSketchButton?.addEventListener('click',()=>runtime.createSketchOnPlane(sketchPlane?.value||'front'));

const sketchButtons={
  line:document.querySelector('#sketch-line'),
  rectangle:document.querySelector('#sketch-rectangle'),
  polygon:document.querySelector('#sketch-polygon')
};
for(const [mode,button] of Object.entries(sketchButtons))button?.addEventListener('click',()=>{
  const ok=runtime.toggleSketchInput(mode);
  if(!ok)alert('Bitte zuerst „Neue Skizze“ anlegen oder eine vorhandene Skizze im Objektbaum auswählen.');
});

const extrudeDepth=document.querySelector('#extrude-depth');
const extrudeButton=document.querySelector('#extrude-sketch');
extrudeButton?.addEventListener('click',()=>{
  if(runtime.sketchInput?.enabled)runtime.disableSketchInput(false);
  const selected=store.getObject(store.selection.activeObjectId);
  const sketchId=selected?.type==='sketch'?selected.objectId:null;
  if(!sketchId){alert('Bitte zuerst eine geschlossene Skizze im Objektbaum auswählen.');return;}
  const result=createExtrudeFromSketch(store,sketchId,extrudeDepth?.value??1);
  if(!result.ok)alert(result.message||'Extrusion konnte nicht erzeugt werden.');
});

store.subscribe(event=>{
  if(event.type==='sketchSessionCreated'&&sketchPlane)sketchPlane.value=event.plane;
  if(event.type!=='sketchInputChanged')return;
  for(const [mode,button] of Object.entries(sketchButtons)){
    if(!button)continue;
    const active=event.enabled&&event.mode===mode;
    button.classList.toggle('active',active);
    if(mode==='line')button.textContent=active?'Linie beenden':'Linie';
    if(mode==='rectangle')button.textContent=active?'Rechteck beenden':'Rechteck';
    if(mode==='polygon')button.textContent=active?'Polygon schließen':'Polygon';
  }
});

window.cm3d = { store, runtime };
