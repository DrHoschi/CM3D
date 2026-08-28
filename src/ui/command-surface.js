const CONTEXT_META={
  object:['Objekt','Grundkörper erstellen'],
  sketch:['Skizze','Zeichnen und extrudieren'],
  view:['Ansicht','Viewport ausrichten'],
  transform:['Transform','Verschieben, drehen, skalieren'],
  modeling:['Modellieren','Formoperationen'],
  scene:['Szene','Gruppen und Baugruppen'],
  material:['Material','Eigenschaften im Inspector'],
  tools:['Werkzeuge','Einheiten und Hilfswerkzeuge']
};

export function installCommandSurface(store){
  const q=s=>document.querySelector(s);
  const sets=[...document.querySelectorAll('[data-context]')];
  const categoryButtons=[...document.querySelectorAll('[data-context-target]')];
  const menuButtons=[...document.querySelectorAll('[data-menu-toggle]')];
  const toolInspector=q('#tool-inspector');
  const extrudePanel=q('#tool-inspector-extrude');
  const extrudeSource=q('#extrude-source');
  let activeContext='object';

  const closeMenus=except=>{
    for(const button of menuButtons){
      const panel=q(`#${button.dataset.menuToggle}`);
      if(panel===except)continue;
      panel.hidden=true;button.classList.remove('active');button.setAttribute('aria-expanded','false');
    }
  };

  const setContext=name=>{
    if(!CONTEXT_META[name])return;
    activeContext=name;
    for(const set of sets)set.hidden=set.dataset.context!==name;
    for(const button of categoryButtons)button.classList.toggle('active',button.dataset.contextTarget===name);
    const [title,subtitle]=CONTEXT_META[name];
    q('#context-title').textContent=title;q('#context-subtitle').textContent=subtitle;
  };

  for(const button of menuButtons){
    button.setAttribute('aria-expanded','false');
    button.addEventListener('click',event=>{
      event.stopPropagation();
      const panel=q(`#${button.dataset.menuToggle}`),opening=panel.hidden;
      closeMenus(panel);panel.hidden=!opening;button.classList.toggle('active',opening);button.setAttribute('aria-expanded',String(opening));
    });
  }

  for(const button of categoryButtons)button.addEventListener('click',()=>{closeMenus();setContext(button.dataset.contextTarget);});
  for(const item of document.querySelectorAll('[data-set-context]'))item.addEventListener('click',()=>{setContext(item.dataset.setContext);closeMenus();});
  const proxies=[...document.querySelectorAll('[data-proxy-click]')];
  for(const proxy of proxies)proxy.addEventListener('click',()=>q(`#${proxy.dataset.proxyClick}`)?.click());
  const syncProxies=()=>{for(const proxy of proxies){const target=q(`#${proxy.dataset.proxyClick}`);proxy.disabled=!!target?.disabled;}};

  document.addEventListener('click',event=>{if(!event.target.closest('.menu-group'))closeMenus();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeMenus();hideTool();}});

  const showExtrude=()=>{
    const object=store.getObject(store.selection.activeObjectId);
    if(object?.type!=='sketch'){alert('Bitte zuerst eine geschlossene Skizze im Objektbaum auswählen.');return;}
    setContext('sketch');
    if(extrudeSource)extrudeSource.textContent=object.name||object.objectId;
    toolInspector.hidden=false;extrudePanel.hidden=false;
    q('#extrude-depth')?.focus();
  };
  const hideTool=()=>{if(toolInspector)toolInspector.hidden=true;if(extrudePanel)extrudePanel.hidden=true;};
  q('#start-extrude')?.addEventListener('click',showExtrude);
  q('#modeling-extrude')?.addEventListener('click',showExtrude);
  q('#cancel-extrude')?.addEventListener('click',hideTool);
  q('#extrude-sketch')?.addEventListener('click',()=>setTimeout(hideTool,0));
  q('#show-material-inspector')?.addEventListener('click',()=>q('#material-fields')?.scrollIntoView({behavior:'smooth',block:'center'}));

  q('#new-sketch')?.addEventListener('click',()=>setTimeout(()=>setContext('sketch'),0));

  store.subscribe(event=>{
    if(event.type!=='selectionChanged'&&event.type!=='projectChanged'&&event.type!=='projectLoaded')return;
    const object=store.getObject(store.selection.activeObjectId);
    if(!object){if(activeContext==='sketch'||activeContext==='scene')setContext('object');hideTool();return;}
    if(object.type==='sketch')setContext('sketch');
    else if(object.type==='group'||object.type==='assembly')setContext('scene');
    else if(activeContext==='sketch'||activeContext==='scene')setContext('transform');
    if(object.type!=='sketch')hideTool();
    setTimeout(syncProxies,0);
  });

  setContext(activeContext);syncProxies();
}
