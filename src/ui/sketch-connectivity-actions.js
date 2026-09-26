export function installSketchConnectivityActions(store) {
  if (!store || typeof store.getSketchConnectivityCommandState !== 'function') {
    throw new Error('SketchConnectivityActions require connectivity commands.');
  }

  const sketchContext = document.querySelector('.context-set[data-context="sketch"]');
  if (!sketchContext) throw new Error('Sketch context surface not found.');

  let divider = document.querySelector('#sketch-connectivity-divider');
  if (!divider) {
    divider = document.createElement('span');
    divider.id = 'sketch-connectivity-divider';
    divider.className = 'context-divider';
    sketchContext.appendChild(divider);
  }

  let connectButton = document.querySelector('#sketch-connect-selected');
  if (!connectButton) {
    connectButton = document.createElement('button');
    connectButton.id = 'sketch-connect-selected';
    connectButton.className = 'tool-button';
    connectButton.type = 'button';
    connectButton.innerHTML = '<span>Verbinden</span>';
    connectButton.title = 'Zwei ausgewählte Sketch-Punkte topologisch verbinden';
    sketchContext.appendChild(connectButton);
  }

  let disconnectButton = document.querySelector('#sketch-disconnect-selected');
  if (!disconnectButton) {
    disconnectButton = document.createElement('button');
    disconnectButton.id = 'sketch-disconnect-selected';
    disconnectButton.className = 'tool-button';
    disconnectButton.type = 'button';
    disconnectButton.innerHTML = '<span>Trennen</span>';
    disconnectButton.title = 'Ausgewählten Element-Endpunkt von einem gemeinsam verwendeten Sketch-Punkt trennen';
    sketchContext.appendChild(disconnectButton);
  }

  const sync = () => {
    const state = store.getSketchConnectivityCommandState();
    connectButton.disabled = !state.connect.enabled;
    disconnectButton.disabled = !state.disconnect.enabled;
    connectButton.setAttribute('aria-disabled', String(!state.connect.enabled));
    disconnectButton.setAttribute('aria-disabled', String(!state.disconnect.enabled));
  };

  connectButton.addEventListener('click', event => {
    event.preventDefault();
    if (connectButton.disabled) return;
    store.connectSelectedSketchPoints();
    sync();
  });

  disconnectButton.addEventListener('click', event => {
    event.preventDefault();
    if (disconnectButton.disabled) return;
    store.disconnectSelectedSketchEndpoint();
    sync();
  });

  store.subscribe(event => {
    if (['selectionChanged', 'geometryChanged', 'projectChanged', 'projectLoaded'].includes(event.type)) sync();
  });

  sync();

  return Object.freeze({
    version: 'WD-21C.6',
    surface: 'sketch-contextbar',
    connectButtonId: connectButton.id,
    disconnectButtonId: disconnectButton.id,
    visibleUi: true,
    sync
  });
}
