import { validateProject } from '../model/project.js';

export const PROJECT_FILE_EXTENSION = '.cm3d.json';

function safeFileStem(name) {
  const stem = String(name || 'CM3D-Projekt')
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '');
  return stem || 'CM3D-Projekt';
}

export function projectFileName(project, requestedName = null) {
  const source = requestedName ?? project?.project?.name;
  const stem = safeFileStem(source).replace(/\.cm3d\.json$/i, '');
  return `${stem}${PROJECT_FILE_EXTENSION}`;
}

export function serializeProjectFile(project) {
  const result = validateProject(project);
  if (!result.valid) throw new Error(`Projektdatei kann nicht exportiert werden:\n${result.errors.join('\n')}`);
  return JSON.stringify(project, null, 2);
}

export function downloadProjectFile(project, requestedName = null) {
  const json = serializeProjectFile(project);
  const fileName = projectFileName(project, requestedName);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  return { bytes: blob.size, fileName };
}

export function parseProjectFileText(text) {
  let candidate;
  try {
    candidate = JSON.parse(String(text));
  } catch {
    throw new Error('Die ausgewählte Datei enthält kein gültiges JSON. Das aktuelle Projekt wurde nicht verändert.');
  }
  const result = validateProject(candidate);
  if (!result.valid) {
    throw new Error(`Die Datei ist kein gültiges CM3D-Projekt. Das aktuelle Projekt wurde nicht verändert:\n${result.errors.join('\n')}`);
  }
  return candidate;
}

export async function readProjectFile(file) {
  if (!file) throw new Error('Bitte eine CM3D-Projektdatei auswählen.');
  return parseProjectFileText(await file.text());
}
