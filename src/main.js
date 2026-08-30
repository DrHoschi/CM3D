import { AppStore } from './application/store.js';
import { createExtrudeFromSketch } from './application/extrude.js';
import { ThreeRuntime } from './runtime-three/runtime.js';
import { installExtrudeRuntime } from './runtime-three/extrude.js';
import { installGltfInterchange } from './runtime-three/gltf-interchange.js';
import { installViewportReferenceSystem } from './runtime-three/viewport-reference-system.js';
import { AppUI } from './ui/app.js';
import { installMaterialPanel } from './ui/material-panel.js';
import { installCommandSurface } from './ui/command-surface.js';
import { installGltfPanel } from './ui/gltf-panel.js';
import { installPartialProjectPanel } from './ui/partial-project-panel.js';
import { installSketchEditing } from './ui/sketch-editing.js';
import { installSketchMultiSelection } from './ui/sketch-multiselect.js';
import { installSketchGizmo } from './ui/sketch-gizmo.js';
import { installFeatureOperationsTree } from './ui/feature-operations-tree.js';
import { installFeatureParametersInspector } from './ui/feature-parameters-inspector.js';
import { installObjectVisibility } from './ui/object-visibility.js';
import { installObjectLocking } from './ui/object-locking.js';
import { installObjectTreeScalability } from './ui/object-tree-scalability.js';
import { installProjectLifecycle } from './ui/project-lifecycle.js';
import { installProjectSettings } from './ui/project-settings.js';
import { installCameraObjectPreview } from './ui/camera-object-preview.js';
import { installInspectorDiagnostics } from './ui/inspector-diagnostics.js';

const store = new AppStore();
const viewport = document.querySelector('#viewport');

const runtime = new ThreeRuntime(viewport, store);
installExtrudeRuntime(runtime);
const gltfInterchange = installGltfInterchange(runtime, store);
const viewportReferenceSystem = installViewportReferenceSystem(runtime);
const appUI = new AppUI(store);
installMaterialPanel(store);

for (const button of document.querySelectorAll('[data-fixed-view]')) {
  button.addEventListener('click', () => runtime.setFixedView(button.dataset.fixedView));
}

const sketchPlane=document.querySelector('#sketch-plane');
const newSketchButton=document.querySelector('#new-sketch');
newSketchButton?.addEventListener('click',()=>runtime.createSketchOnPlane(sketchPlane?.value||'front'));

const sketchButtons={line:document.querySelector('#sketch-line'),rectangle:document.querySelector('#sketch-rectangle'),polygon:document.querySelector('#sketch-polygon')};
for(const [mode,button] of Object.entries(sketchButtons))button?.addEventListener('click',()=>{const ok=runtime.toggleSketchInput(mode);if(!ok)alert('Bitte zuerst „Neue Skizze“ anlegen oder eine vorhandene Skizze im Objektbaum auswählen.');});

const extrudeDepth=document.querySelector('#extrude-depth');
const extrudeButton=document.querySelector('#extrude-sketch');
extrudeButton?.addEventListener('click',()=>{if(runtime.sketchInput?.enabled)runtime.disableSketchInput(false);const selected=store.getObject(store.selection.activeObjectId);const sketchId=selected?.type==='sketch'?selected.objectId:null;if(!sketchId){alert('Bitte zuerst eine geschlossene Skizze im Objektbaum auswählen.');return;}const result=createExtrudeFromSketch(store,sketchId,extrudeDepth?.value??1);if(!result.ok)alert(result.message||'Extrusion konnte nicht erzeugt werden.');});

store.subscribe(event=>{
  if(event.type==='sketchSessionCreated'&&sketchPlane)sketchPlane.value=event.plane;
  if(event.type!=='sketchInputChanged')return;
  for(const [mode,button] of Object.entries(sketchButtons)){
    if(!button)continue;const active=event.enabled&&event.mode===mode;button.classList.toggle('active',active);const label=button.querySelector('span:last-child');if(!label)continue;
    if(mode==='line')label.textContent=active?'Linie beenden':'Linie';if(mode==='rectangle')label.textContent=active?'Rechteck beenden':'Rechteck';if(mode==='polygon')label.textContent=active?'Polygon schließen':'Polygon';
  }
});

installCommandSurface(store);
installPartialProjectPanel(store);
installGltfPanel(store, gltfInterchange);
installSketchEditing(store, runtime, appUI);
const sketchMultiSelection = installSketchMultiSelection(store, runtime, appUI);
const sketchGizmo = installSketchGizmo(store, runtime);
const featureOperationsTree = installFeatureOperationsTree(store, appUI);
const featureParametersInspector = installFeatureParametersInspector(store, appUI);
const objectVisibility = installObjectVisibility(store, runtime, appUI);
const objectLocking = installObjectLocking(store, runtime, appUI);
const objectTreeScalability = installObjectTreeScalability(store, appUI);
const projectLifecycle = installProjectLifecycle(store, appUI);
const projectSettings = installProjectSettings(store, appUI);
const cameraObjectPreview = installCameraObjectPreview(store, runtime, appUI);
const inspectorDiagnostics = installInspectorDiagnostics(store, runtime, appUI);

document.title = 'CyberMotion 3D – WD-20A';
const buildLabel = document.querySelector('.brand small');
if (buildLabel) buildLabel.textContent = 'WD-20A';

const focusButton=document.querySelector('#focus-selection');
const syncFocusButton=()=>{if(focusButton)focusButton.disabled=!store.getObject(store.selection.activeObjectId);};
if(focusButton){focusButton.onclick=null;focusButton.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();if(!store.getObject(store.selection.activeObjectId))return;runtime.focusSelection();});
store.subscribe(event=>{if(['selectionChanged','projectChanged','projectLoaded','objectCreated'].includes(event.type))syncFocusButton();});
syncFocusButton();

window.cm3d = { store, runtime, gltfInterchange, viewportReferenceSystem, sketchMultiSelection, sketchGizmo, featureOperationsTree, featureParametersInspector, objectVisibility, objectLocking, objectTreeScalability, projectLifecycle, projectSettings, cameraObjectPreview, inspectorDiagnostics };
