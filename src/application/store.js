import * as THREE from 'three';
import { createBoxObject, createProject, validateProject } from '../model/project.js';

export class AppStore {
  constructor() {
    this.project = createProject();
    this.selection = { selectedObjectIds: [], activeObjectId: null, hoveredObjectId: null };
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(type, payload = {}) {
    const event = { type, ...payload };
    for (const listener of this.listeners) listener(event, this);
  }

  newProject() {
    this.project = createProject();
    this.clearSelection();
    this.emit('projectChanged');
  }

  replaceProject(project) {
    const result = validateProject(project);
    if (!result.valid) throw new Error(result.errors.join('\n'));
    this.project = project;
    this.clearSelection(false);
    this.emit('projectLoaded');
  }

  addBox() {
    const object = createBoxObject(this.project);
    this.project.scene.objects[object.objectId] = object;
    this.project.scene.rootObjectIds.push(object.objectId);
    this.touch();
    this.select(object.objectId, false);
    this.emit('objectCreated', { objectId: object.objectId });
    return object.objectId;
  }

  getObject(objectId) {
    return this.project.scene.objects[objectId] ?? null;
  }

  select(objectId, notify = true) {
    if (objectId && !this.getObject(objectId)) return;
    this.selection.selectedObjectIds = objectId ? [objectId] : [];
    this.selection.activeObjectId = objectId ?? null;
    if (notify) this.emit('selectionChanged');
  }

  clearSelection(notify = true) {
    this.selection.selectedObjectIds = [];
    this.selection.activeObjectId = null;
    this.selection.hoveredObjectId = null;
    if (notify) this.emit('selectionChanged');
  }

  setName(objectId, name) {
    const object = this.getObject(objectId);
    if (!object) return;
    object.name = String(name || 'Objekt');
    this.touch();
    this.emit('objectChanged', { objectId });
  }

  setTransformFromEuler(objectId, next) {
    const object = this.getObject(objectId);
    if (!object) return;
    const px = finite(next.position?.x, object.transform.position.x);
    const py = finite(next.position?.y, object.transform.position.y);
    const pz = finite(next.position?.z, object.transform.position.z);
    const sx = nonZero(next.scale?.x, object.transform.scale.x);
    const sy = nonZero(next.scale?.y, object.transform.scale.y);
    const sz = nonZero(next.scale?.z, object.transform.scale.z);
    const euler = new THREE.Euler(
      THREE.MathUtils.degToRad(finite(next.rotationDeg?.x, 0)),
      THREE.MathUtils.degToRad(finite(next.rotationDeg?.y, 0)),
      THREE.MathUtils.degToRad(finite(next.rotationDeg?.z, 0)),
      'XYZ'
    );
    const q = new THREE.Quaternion().setFromEuler(euler).normalize();
    object.transform.position = { x: px, y: py, z: pz };
    object.transform.rotation = { x: q.x, y: q.y, z: q.z, w: q.w };
    object.transform.scale = { x: sx, y: sy, z: sz };
    this.touch();
    this.emit('objectChanged', { objectId });
  }

  touch() {
    this.project.project.modifiedAt = new Date().toISOString();
  }
}

function finite(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function nonZero(value, fallback) {
  const n = finite(value, fallback);
  return n === 0 ? fallback : n;
}
