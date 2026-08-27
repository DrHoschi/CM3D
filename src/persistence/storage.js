import { validateProject } from '../model/project.js';

const STORAGE_KEY = 'cm3d.wd02.project';

export function saveProject(project) {
  const result = validateProject(project);
  if (!result.valid) throw new Error(`Projekt ist nicht speicherbar:\n${result.errors.join('\n')}`);
  const json = JSON.stringify(project, null, 2);
  localStorage.setItem(STORAGE_KEY, json);
  return json.length;
}

export function loadProject() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) throw new Error('Kein gespeichertes CM3D-Projekt gefunden.');

  let candidate;
  try {
    candidate = JSON.parse(raw);
  } catch {
    throw new Error('Gespeicherte Projektdaten sind kein gültiges JSON.');
  }

  const result = validateProject(candidate);
  if (!result.valid) throw new Error(`Projekt konnte nicht geladen werden:\n${result.errors.join('\n')}`);
  return candidate;
}

export function hasSavedProject() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}
