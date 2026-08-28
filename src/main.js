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

const sketchLineButton = document.querySelector('#sketch-line');
sketchLineButton?.addEventListener('click', () => runtime.toggleSketchLineInput());
store.subscribe(event => {
  if (event.type === 'sketchInputChanged' && sketchLineButton) {
    sketchLineButton.classList.toggle('active', event.enabled);
    sketchLineButton.textContent = event.enabled ? 'Linie beenden' : 'Skizze / Linie';
  }
});

window.cm3d = { store, runtime };
