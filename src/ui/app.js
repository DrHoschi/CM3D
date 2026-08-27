import * as THREE from 'three';
import { hasSavedProject, loadProject, saveProject } from '../persistence/storage.js';

export class AppUI {
  constructor(store) {
    this.store = store;
    this.tree = document.querySelector('#object-tree');
    this.status = document.querySelector('#status');
    this.form = document.querySelector('#inspector');
    this.empty = document.querySelector('#inspector-empty');

    this.fields = {
      name: document.querySelector('#object-name'),
      px: document.querySelector('#pos-x'), py: document.querySelector('#pos-y'), pz: document.querySelector('#pos-z'),
      rx: document.querySelector('#rot-x'), ry: document.querySelector('#rot-y'), rz: document.querySelector('#rot-z'),
      sx: document.querySelector('#scale-x'), sy: document.querySelector('#scale-y'), sz: document.querySelector('#scale-z'),
      id: document.querySelector('#object-id')
    };

    document.querySelector('#new-project').addEventListener('click', () => {
      if (confirm('Neues Projekt erstellen? Nicht gespeicherte Änderungen gehen verloren.')) {
        this.store.newProject();
        this.setStatus('Neues Projekt erstellt.');
      }
    });
    document.querySelector('#add-box').addEventListener('click', () => {
      const id = this.store.addBox();
      this.setStatus(`Würfel erzeugt: ${id}`);
    });
    document.querySelector('#save-project').addEventListener('click', () => this.save());
    document.querySelector('#load-project').addEventListener('click', () => this.load());

    this.fields.name.addEventListener('change', () => {
      const id = this.store.selection.activeObjectId;
      if (id) this.store.setName(id, this.fields.name.value);
    });

    for (const input of [this.fields.px,this.fields.py,this.fields.pz,this.fields.rx,this.fields.ry,this.fields.rz,this.fields.sx,this.fields.sy,this.fields.sz]) {
      input.addEventListener('change', () => this.commitTransform());
    }

    this.store.subscribe((event) => {
      if (['projectChanged','projectLoaded','objectCreated','objectChanged','selectionChanged'].includes(event.type)) this.render();
    });

    this.render();
    if (hasSavedProject()) this.setStatus('Gespeichertes Projekt vorhanden – „Laden“ zum Wiederherstellen.');
  }

  save() {
    try {
      const bytes = saveProject(this.store.project);
      this.setStatus(`Projekt gespeichert (${bytes} Zeichen). Browser kann jetzt neu geladen werden.`);
    } catch (error) {
      this.fail(error);
    }
  }

  load() {
    try {
      const candidate = loadProject();
      this.store.replaceProject(candidate);
      this.setStatus(`Projekt geladen: ${candidate.project.name}`);
    } catch (error) {
      this.fail(error);
    }
  }

  commitTransform() {
    const id = this.store.selection.activeObjectId;
    if (!id) return;
    this.store.setTransformFromEuler(id, {
      position: { x: this.fields.px.value, y: this.fields.py.value, z: this.fields.pz.value },
      rotationDeg: { x: this.fields.rx.value, y: this.fields.ry.value, z: this.fields.rz.value },
      scale: { x: this.fields.sx.value, y: this.fields.sy.value, z: this.fields.sz.value }
    });
  }

  render() {
    this.renderTree();
    this.renderInspector();
  }

  renderTree() {
    this.tree.replaceChildren();
    const objects = Object.values(this.store.project.scene.objects).sort((a,b) => a.order - b.order);
    if (!objects.length) {
      const p = document.createElement('div');
      p.className = 'muted';
      p.textContent = 'Noch keine Objekte';
      this.tree.appendChild(p);
      return;
    }
    for (const object of objects) {
      const item = document.createElement('div');
      item.className = `tree-item${object.objectId === this.store.selection.activeObjectId ? ' selected' : ''}`;
      item.textContent = object.name;
      item.title = object.objectId;
      item.addEventListener('click', () => this.store.select(object.objectId));
      this.tree.appendChild(item);
    }
  }

  renderInspector() {
    const object = this.store.getObject(this.store.selection.activeObjectId);
    this.form.hidden = !object;
    this.empty.hidden = Boolean(object);
    if (!object) return;

    this.fields.name.value = object.name;
    this.fields.id.textContent = object.objectId;
    this.fields.px.value = clean(object.transform.position.x);
    this.fields.py.value = clean(object.transform.position.y);
    this.fields.pz.value = clean(object.transform.position.z);
    this.fields.sx.value = clean(object.transform.scale.x);
    this.fields.sy.value = clean(object.transform.scale.y);
    this.fields.sz.value = clean(object.transform.scale.z);

    const q = object.transform.rotation;
    const e = new THREE.Euler().setFromQuaternion(new THREE.Quaternion(q.x,q.y,q.z,q.w), 'XYZ');
    this.fields.rx.value = clean(THREE.MathUtils.radToDeg(e.x));
    this.fields.ry.value = clean(THREE.MathUtils.radToDeg(e.y));
    this.fields.rz.value = clean(THREE.MathUtils.radToDeg(e.z));
  }

  setStatus(message) {
    this.status.textContent = message;
  }

  fail(error) {
    console.error(error);
    this.setStatus(error.message || String(error));
    alert(error.message || String(error));
  }
}

function clean(value) {
  return Number(Number(value).toFixed(9));
}
