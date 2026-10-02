import { listProjects, loadProject } from '../persistence/storage.js';

const MAX_RECENT = 8;

export function installRecentProjects(store, ui) {
  const select = ui.projectSelect;
  if (!select) return null;

  const host = document.createElement('div');
  host.className = 'recent-projects';
  host.setAttribute('aria-label', 'Letzte Projekte');
  select.insertAdjacentElement('afterend', host);

  const render = () => {
    host.replaceChildren();
    const projects = listProjects().slice(0, MAX_RECENT);
    if (!projects.length) return;
    for (const project of projects) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'recent-project';
      button.dataset.projectId = project.projectId;
      button.textContent = project.name || 'Unbenannt';
      button.title = `Zuletzt geändert: ${new Date(project.modifiedAt).toLocaleString()}`;
      button.addEventListener('click', () => quickReopen(project.projectId));
      host.appendChild(button);
    }
  };

  const quickReopen = projectId => {
    try {
      // loadProject remains the single persisted-project load authority and performs
      // the existing migrate + V2 schema validation before replacement.
      const project = loadProject(projectId);
      store.replaceProject(project);
      ui.refreshProjects(projectId);
      ui.setStatus(`Projekt wieder geöffnet: ${project.project.name}`);
      render();
      return true;
    } catch (error) {
      ui.fail(error);
      return false;
    }
  };

  const baseRefreshProjects = ui.refreshProjects.bind(ui);
  ui.refreshProjects = selectedId => {
    baseRefreshProjects(selectedId);
    render();
  };

  store.subscribe(event => {
    if (event.type === 'projectLoaded' || event.type === 'projectChanged' || event.type === 'projectClosed') render();
  });

  render();
  return { render, quickReopen, maxRecent: MAX_RECENT };
}
