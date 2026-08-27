import { validateProject } from '../model/project.js';

const INDEX_KEY = 'cm3d.projects.index.v1';
const PROJECT_PREFIX = 'cm3d.project.';

function readIndex() {
  try { return JSON.parse(localStorage.getItem(INDEX_KEY) || '[]'); }
  catch { return []; }
}
function writeIndex(index) { localStorage.setItem(INDEX_KEY, JSON.stringify(index)); }

export function listProjects() {
  return readIndex().sort((a,b) => String(b.modifiedAt).localeCompare(String(a.modifiedAt)));
}

export function saveProject(project) {
  const result = validateProject(project);
  if (!result.valid) throw new Error(`Projekt ist nicht speicherbar:\n${result.errors.join('\n')}`);
  const json = JSON.stringify(project, null, 2);
  const id = project.project.projectId;
  localStorage.setItem(`${PROJECT_PREFIX}${id}`, json);
  const index = readIndex().filter(x => x.projectId !== id);
  index.push({ projectId:id, name:project.project.name || 'Unbenannt', modifiedAt:project.project.modifiedAt, bytes:json.length });
  writeIndex(index);
  return { bytes: json.length, projectId: id };
}

export function loadProject(projectId) {
  const raw = localStorage.getItem(`${PROJECT_PREFIX}${projectId}`);
  if (!raw) throw new Error('Gespeichertes CM3D-Projekt wurde nicht gefunden.');
  let candidate;
  try { candidate = JSON.parse(raw); } catch { throw new Error('Gespeicherte Projektdaten sind kein gültiges JSON.'); }
  const result = validateProject(candidate);
  if (!result.valid) throw new Error(`Projekt konnte nicht geladen werden:\n${result.errors.join('\n')}`);
  return candidate;
}

export function deleteSavedProject(projectId) {
  localStorage.removeItem(`${PROJECT_PREFIX}${projectId}`);
  writeIndex(readIndex().filter(x => x.projectId !== projectId));
}

export function hasSavedProjects() { return readIndex().length > 0; }
