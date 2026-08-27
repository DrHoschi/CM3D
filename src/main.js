import { AppStore } from './application/store.js';
import { ThreeRuntime } from './runtime-three/runtime.js';
import { AppUI } from './ui/app.js';

const store = new AppStore();
const viewport = document.querySelector('#viewport');

new ThreeRuntime(viewport, store);
new AppUI(store);

window.cm3d = { store };
