import { validateProject } from '../model/project.js';

const INDEX_KEY = 'cm3d.projects.index.v1';
const PROJECT_PREFIX = 'cm3d.project.';

function readIndex() {
  try { return JSON.parse(localStorage.getItem(INDEX_KEY) || '[]'); }
  catch { return []; }
}
function writeIndex(index) { localStorage.setItem(INDEX_KEY, JSON.stringify(index)); }

function isQuotaError(error) {
  return error?.name === 'QuotaExceededError' || error?.name === 'NS_ERROR_DOM_QUOTA_REACHED' || error?.code === 22 || error?.code === 1014;
}

function compactStoredProjects() {
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key?.startsWith(PROJECT_PREFIX)) continue;
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const compact = JSON.stringify(JSON.parse(raw));
      if (compact.length >= raw.length) continue;
      localStorage.removeItem(key);
      try { localStorage.setItem(key, compact); }
      catch (error) {
        localStorage.setItem(key, raw);
        throw error;
      }
    } catch (error) {
      if (isQuotaError(error)) throw error;
      // Ungültige Altstände werden hier nicht verändert; loadProject meldet sie beim Laden gezielt.
    }
  }
}

export function listProjects() {
  return readIndex().sort((a,b) => String(b.modifiedAt).localeCompare(String(a.modifiedAt)));
}

export function saveProject(project) {
  const result = validateProject(project);
  if (!result.valid) throw new Error(`Projekt ist nicht speicherbar:\n${result.errors.join('\n')}`);
  const json = JSON.stringify(project);
  const id = project.project.projectId;
  const key = `${PROJECT_PREFIX}${id}`;
  try {
    compactStoredProjects();
    localStorage.setItem(key, json);
    const index = readIndex().filter(x => x.projectId !== id);
    index.push({ projectId:id, name:project.project.name || 'Unbenannt', modifiedAt:project.project.modifiedAt, bytes:json.length });
    writeIndex(index);
  } catch (error) {
    if (isQuotaError(error)) {
      throw new Error('Der lokale Browser-Speicher für CM3D ist voll. Bitte einen nicht mehr benötigten gespeicherten Projektstand über „Speicher löschen“ entfernen und danach erneut speichern. Die aktuelle Skizze ist nicht beschädigt.');
    }
    throw error;
  }
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
