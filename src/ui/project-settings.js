const VALID_UNITS = new Set(['mm', 'cm', 'm', 'km']);

function ensureSettings(project) {
  project.settings ??= {};
  project.settings.units ??= {};
  if (!VALID_UNITS.has(project.settings.units.lengthDisplayUnit)) project.settings.units.lengthDisplayUnit = 'm';
  return project.settings;
}

function menuButton() {
  const button = document.createElement('button');
  button.id = 'project-settings';
  button.type = 'button';
  button.className = 'menu-item';
  button.innerHTML = '<svg class="cm-icon"><use href="./design/icons/cm3d-ui-icons-v3.svg#properties"></use></svg><span>Projekt-Einstellungen…</span>';
  return button;
}

function dialogMarkup() {
  const dialog = document.createElement('dialog');
  dialog.id = 'project-settings-dialog';
  dialog.innerHTML = `
    <form method="dialog" class="project-settings-form">
      <h2>Projekt-Einstellungen</h2>
      <label>Projektname
        <input id="project-settings-name" type="text" autocomplete="off" />
      </label>
      <label>Längeneinheit
        <select id="project-settings-unit">
          <option value="mm">Millimeter (mm)</option>
          <option value="cm">Zentimeter (cm)</option>
          <option value="m">Meter (m)</option>
          <option value="km">Kilometer (km)</option>
        </select>
      </label>
      <p class="muted">Diese Werte gehören zum Projekt und werden mit Browser-Speicher sowie CM3D-Projektdatei gespeichert.</p>
      <div class="project-settings-actions">
        <button value="cancel" type="button" id="project-settings-cancel">Abbrechen</button>
        <button value="default" type="submit" id="project-settings-apply">Übernehmen</button>
      </div>
    </form>`;
  document.body.appendChild(dialog);
  return dialog;
}

export function installProjectSettings(store, ui) {
  const fileMenu = document.querySelector('#file-menu');
  if (!fileMenu || document.querySelector('#project-settings')) return null;

  const button = menuButton();
  const closeButton = document.querySelector('#close-project');
  if (closeButton) closeButton.insertAdjacentElement('afterend', button);
  else fileMenu.appendChild(button);

  const dialog = dialogMarkup();
  const nameInput = dialog.querySelector('#project-settings-name');
  const unitSelect = dialog.querySelector('#project-settings-unit');
  const cancelButton = dialog.querySelector('#project-settings-cancel');

  const open = () => {
    const settings = ensureSettings(store.project);
    nameInput.value = String(store.project.project?.name || 'Neues CM3D Projekt');
    unitSelect.value = settings.units.lengthDisplayUnit;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  };

  const close = () => {
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else dialog.removeAttribute('open');
  };

  const apply = event => {
    event?.preventDefault();
    const name = nameInput.value.trim();
    const unit = VALID_UNITS.has(unitSelect.value) ? unitSelect.value : 'm';
    if (!name) {
      ui.setStatus('Projekt-Einstellungen nicht übernommen: Projektname darf nicht leer sein.');
      return false;
    }

    const settings = ensureSettings(store.project);
    const oldName = String(store.project.project?.name || '');
    const oldUnit = settings.units.lengthDisplayUnit;
    if (oldName === name && oldUnit === unit) {
      close();
      return true;
    }

    const before = store.snapshot();
    store.project.project.name = name;
    settings.units.lengthDisplayUnit = unit;
    store.touch();
    store.pushHistory(before, 'Projekt-Einstellungen ändern');
    store.emit('projectSettingsChanged', { name, unit });
    if (oldUnit !== unit) store.emit('unitChanged', { unit });
    else store.emit('projectChanged');
    ui.setStatus(`Projekt-Einstellungen übernommen: ${name}, ${unit}.`);
    close();
    return true;
  };

  button.addEventListener('click', open);
  cancelButton.addEventListener('click', close);
  dialog.querySelector('form').addEventListener('submit', apply);

  store.subscribe(event => {
    if (['projectLoaded', 'projectChanged'].includes(event.type)) ensureSettings(store.project);
  });

  document.title = 'CyberMotion 3D – WD-15B';
  const buildLabel = document.querySelector('.brand small');
  if (buildLabel) buildLabel.textContent = 'WD-15B';

  return { open, close, apply, dialog };
}
