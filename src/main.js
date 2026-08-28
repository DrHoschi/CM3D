import { AppStore } from './application/store.js';
import { ThreeRuntime } from './runtime-three/runtime.js';
import { AppUI } from './ui/app.js';

const store = new AppStore();
const viewport = document.querySelector('#viewport');

const runtime = new ThreeRuntime(viewport, store);
new AppUI(store);

for (const button of document.querySelectorAll('[data-fixed-view]')) {
  button.addEventListener('click', () => runtime.setFixedView(button.dataset.fixedView));
}

const sketchButtons={
  line:document.querySelector('#sketch-line'),
  rectangle:document.querySelector('#sketch-rectangle'),
  polygon:document.querySelector('#sketch-polygon')
};
for(const [mode,button] of Object.entries(sketchButtons))button?.addEventListener('click',()=>runtime.toggleSketchInput(mode));
store.subscribe(event=>{
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
