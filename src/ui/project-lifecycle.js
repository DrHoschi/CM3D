import { downloadProjectFile } from '../persistence/project-file.js';

function menuButton(id, iconId, label, className = '') {
  const button = document.createElement('button');
  button.id = id;
  button.type = 'button';
  button.className = `menu-item${className ? ` ${className}` : ''}`;
  button.innerHTML = `<svg class="cm-icon"><use href="./design/icons/cm3d-ui-icons-v3.svg#${iconId}"></use></svg><span>${label}</span>`;
  return button;
}

export function installProjectLifecycle(store, ui) {
  const fileMenu = document.querySelector('#file-menu');
  const saveButton = document.querySelector('#save-project');
  if (!fileMenu || !saveButton || document.querySelector('#save-project-as')) return null;

  const saveAsButton = menuButton('save-project-as', 'save-project', 'Speichern unter…');
  const closeButton = menuButton('close-project', 'new-project', 'Projekt schließen');
  saveButton.insertAdjacentElement('afterend', saveAsButton);
  saveAsButton.insertAdjacentElement('afterend', closeButton);

  const saveAs = () => {
    const currentName = String(store.project?.project?.name || 'CM3D-Projekt');
    const requested = prompt('Dateiname für die CM3D-Projektdatei:', currentName);
    if (requested === null) return false;
    const fileStem = requested.trim();
    if (!fileStem) {
      ui.setStatus('Speichern unter abgebrochen: Dateiname darf nicht leer sein.');
      return false;
    }

    try {
      const result = downloadProjectFile(store.project, fileStem);
      ui.setStatus(`Projektdatei gespeichert: ${result.fileName}`);
      return true;
    } catch (error) {
      ui.fail(error);
      return false;
    }
  };

  const closeProject = () => {
    const name = String(store.project?.project?.name || 'aktuelles Projekt');
    const confirmed = confirm(`Projekt „${name}“ schließen? Nicht gespeicherte Änderungen gehen verloren.`);
    if (!confirmed) return false;
    store.newProject();
    ui.refreshProjects();
    if (ui.projectSelect) ui.projectSelect.value = '';
    ui.setStatus('Projekt geschlossen. Leerer Arbeitsbereich bereit.');
    store.emit('projectClosed');
    return true;
  };

  saveAsButton.addEventListener('click', saveAs);
  closeButton.addEventListener('click', closeProject);

  document.title = 'CyberMotion 3D – WD-15A';
  const buildLabel = document.querySelector('.brand small');
  if (buildLabel) buildLabel.textContent = 'WD-15A';

  return { saveAs, closeProject };
}
