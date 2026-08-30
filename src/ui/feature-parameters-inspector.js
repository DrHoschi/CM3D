const VALID_DIRECTIONS = new Set(['positive','negative','symmetric']);

export function installFeatureParametersInspector(store, ui) {
  store.setExtrudeParameters = (objectId, next = {}) => {
    const object = store.getObject(objectId);
    if (object?.type !== 'feature.extrude') return false;

    const depth = Number(next.depth ?? object.data?.depth);
    const direction = VALID_DIRECTIONS.has(next.direction) ? next.direction : (VALID_DIRECTIONS.has(object.data?.direction) ? object.data.direction : 'positive');
    if (!Number.isFinite(depth) || depth <= 0) return false;
    if (Number(object.data?.depth) === depth && object.data?.direction === direction) return false;

    const before = store.snapshot();
    object.data.depth = depth;
    object.data.direction = direction;
    store.touch();
    store.pushHistory(before, 'Extrusionsparameter ändern');
    store.emit('geometryChanged', { objectId });
    return true;
  };

  const form = document.querySelector('#inspector');
  if (!form || document.querySelector('#feature-extrude-fields')) return;

  const fieldset = document.createElement('fieldset');
  fieldset.id = 'feature-extrude-fields';
  fieldset.hidden = true;
  fieldset.innerHTML = `
    <legend>Extrusion</legend>
    <label>Tiefe <span id="feature-extrude-unit"></span>
      <input id="feature-extrude-depth" type="number" min="0" step="0.1" inputmode="decimal" />
    </label>
    <label>Richtung
      <select id="feature-extrude-direction">
        <option value="positive">Positiv</option>
        <option value="negative">Negativ</option>
        <option value="symmetric">Symmetrisch</option>
      </select>
    </label>
    <p class="muted">Quelle: <span id="feature-extrude-source">–</span></p>
  `;

  const geometry = document.querySelector('#geometry-fields');
  form.insertBefore(fieldset, geometry ?? form.firstChild);

  const depthInput = fieldset.querySelector('#feature-extrude-depth');
  const directionInput = fieldset.querySelector('#feature-extrude-direction');
  const unitLabel = fieldset.querySelector('#feature-extrude-unit');
  const sourceLabel = fieldset.querySelector('#feature-extrude-source');

  const commit = () => {
    const object = store.getObject(store.selection.activeObjectId);
    if (object?.type !== 'feature.extrude') return;
    const depth = ui.toMeters(depthInput.value);
    if (!Number.isFinite(depth) || depth <= 0) {
      ui.setStatus('Extrusionstiefe muss größer als 0 sein.');
      ui.render();
      return;
    }
    store.setExtrudeParameters(object.objectId, { depth, direction: directionInput.value });
  };

  depthInput.addEventListener('change', commit);
  directionInput.addEventListener('change', commit);

  const baseRenderInspector = ui.renderInspector.bind(ui);
  ui.renderInspector = () => {
    baseRenderInspector();
    const object = store.getObject(store.selection.activeObjectId);
    const active = object?.type === 'feature.extrude';
    fieldset.hidden = !active;
    if (!active) return;

    const unit = ui.unit();
    unitLabel.textContent = `(${unit})`;
    depthInput.value = ui.fromMeters(Number(object.data?.depth ?? 0));
    directionInput.value = VALID_DIRECTIONS.has(object.data?.direction) ? object.data.direction : 'positive';
    const sketch = store.getObject(object.data?.sourceSketchId);
    sourceLabel.textContent = sketch?.type === 'sketch' ? sketch.name : 'Quellskizze nicht verfügbar';
  };

  document.title = 'CyberMotion 3D – WD-13B';
  const buildLabel = document.querySelector('.brand small');
  if (buildLabel) buildLabel.textContent = 'WD-13B';
  ui.render();

  return { fieldset };
}
