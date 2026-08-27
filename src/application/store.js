import * as THREE from 'three';
import { createBoxObject, createProject, validateProject } from '../model/project.js';

export class AppStore {
  constructor() {
    this.project = createProject();
    this.selection = { selectedObjectIds: [], activeObjectId: null, hoveredObjectId: null };
    this.toolMode = 'translate';
    this.listeners = new Set();
    this.undoStack = [];
    this.redoStack = [];
    this.historyLimit = 100;
  }

  subscribe(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  emit(type, payload = {}) { const event = { type, ...payload }; for (const listener of this.listeners) listener(event, this); }
  snapshot() { return structuredClone(this.project); }
  restore(snapshot, eventType = 'projectChanged') { this.project = structuredClone(snapshot); this.clearSelection(false); this.emit(eventType); this.emit('historyChanged'); }

  pushHistory(before, label) {
    this.undoStack.push({ before, after: this.snapshot(), label });
    if (this.undoStack.length > this.historyLimit) this.undoStack.shift();
    this.redoStack = [];
    this.emit('historyChanged');
  }

  newProject() {
    this.project = createProject();
    this.clearSelection(false);
    this.undoStack = [];
    this.redoStack = [];
    this.emit('projectChanged');
    this.emit('historyChanged');
  }

  replaceProject(project) {
    const result = validateProject(project);
    if (!result.valid) throw new Error(result.errors.join('\n'));
    this.project = structuredClone(project);
    this.clearSelection(false);
    this.undoStack = [];
    this.redoStack = [];
    this.emit('projectLoaded');
    this.emit('historyChanged');
  }

  addBox() {
    const before = this.snapshot();
    const object = createBoxObject(this.project);
    this.project.scene.objects[object.objectId] = object;
    this.project.scene.rootObjectIds.push(object.objectId);
    this.touch();
    this.select(object.objectId, false);
    this.pushHistory(before, 'Würfel erzeugen');
    this.emit('objectCreated', { objectId: object.objectId });
    return object.objectId;
  }

  getObject(objectId) { return this.project.scene.objects[objectId] ?? null; }
  select(objectId, notify = true) { if (objectId && !this.getObject(objectId)) return; this.selection.selectedObjectIds = objectId ? [objectId] : []; this.selection.activeObjectId = objectId ?? null; if (notify) this.emit('selectionChanged'); }
  clearSelection(notify = true) { this.selection.selectedObjectIds = []; this.selection.activeObjectId = null; this.selection.hoveredObjectId = null; if (notify) this.emit('selectionChanged'); }

  setToolMode(mode) {
    if (!['translate','rotate','scale'].includes(mode)) return;
    this.toolMode = mode;
    this.emit('toolChanged', { mode });
  }

  setName(objectId, name) {
    const object = this.getObject(objectId); if (!object) return;
    const next = String(name || 'Objekt'); if (next === object.name) return;
    const before = this.snapshot(); object.name = next; this.touch(); this.pushHistory(before, 'Objekt umbenennen'); this.emit('objectChanged', { objectId });
  }

  setTransformFromEuler(objectId, next, options = {}) {
    const object = this.getObject(objectId); if (!object) return;
    const before = options.beforeSnapshot ?? this.snapshot();
    const px = finite(next.position?.x, object.transform.position.x), py = finite(next.position?.y, object.transform.position.y), pz = finite(next.position?.z, object.transform.position.z);
    const sx = nonZero(next.scale?.x, object.transform.scale.x), sy = nonZero(next.scale?.y, object.transform.scale.y), sz = nonZero(next.scale?.z, object.transform.scale.z);
    let q;
    if (next.quaternion) q = new THREE.Quaternion(next.quaternion.x,next.quaternion.y,next.quaternion.z,next.quaternion.w).normalize();
    else {
      const euler = new THREE.Euler(THREE.MathUtils.degToRad(finite(next.rotationDeg?.x, 0)), THREE.MathUtils.degToRad(finite(next.rotationDeg?.y, 0)), THREE.MathUtils.degToRad(finite(next.rotationDeg?.z, 0)), 'XYZ');
      q = new THREE.Quaternion().setFromEuler(euler).normalize();
    }
    object.transform.position = { x:px,y:py,z:pz }; object.transform.rotation = { x:q.x,y:q.y,z:q.z,w:q.w }; object.transform.scale = { x:sx,y:sy,z:sz };
    this.touch();
    if (options.recordHistory !== false) this.pushHistory(before, options.label ?? 'Transform ändern');
    this.emit('objectChanged', { objectId });
  }

  deleteSelected() {
    const id = this.selection.activeObjectId; if (!id) return false;
    const before = this.snapshot(); delete this.project.scene.objects[id];
    this.project.scene.rootObjectIds = this.project.scene.rootObjectIds.filter(x => x !== id);
    this.clearSelection(false); this.touch(); this.pushHistory(before, 'Objekt löschen'); this.emit('projectChanged'); return true;
  }

  duplicateSelected() {
    const id = this.selection.activeObjectId, source = this.getObject(id); if (!source) return null;
    const before = this.snapshot(); const copy = structuredClone(source);
    copy.objectId = `obj_${crypto.randomUUID()}`; copy.name = `${source.name} Kopie`;
    copy.order = Object.keys(this.project.scene.objects).length;
    copy.transform.position.x += 0.25; copy.transform.position.z += 0.25;
    this.project.scene.objects[copy.objectId] = copy; this.project.scene.rootObjectIds.push(copy.objectId);
    this.touch(); this.select(copy.objectId, false); this.pushHistory(before, 'Objekt duplizieren'); this.emit('projectChanged'); this.emit('selectionChanged'); return copy.objectId;
  }

  undo() { const entry = this.undoStack.pop(); if (!entry) return false; this.redoStack.push(entry); this.project = structuredClone(entry.before); this.clearSelection(false); this.emit('projectChanged'); this.emit('historyChanged'); return true; }
  redo() { const entry = this.redoStack.pop(); if (!entry) return false; this.undoStack.push(entry); this.project = structuredClone(entry.after); this.clearSelection(false); this.emit('projectChanged'); this.emit('historyChanged'); return true; }
  touch() { this.project.project.modifiedAt = new Date().toISOString(); }
}

function finite(value, fallback) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }
function nonZero(value, fallback) { const n = finite(value, fallback); return n === 0 ? fallback : n; }
