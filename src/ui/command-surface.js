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

async function makeIconsSafariSafe(){
  const style=document.createElement('style');
  style.textContent=`
    .context-set[hidden]{display:none!important}
    .icon-tile,.menu-item .cm-icon,.menu-inline .cm-icon,.context-check .cm-icon,.panel-icon,.tree-item .tree-type-icon,.tool-inspector-title .cm-icon{background:transparent!important;box-shadow:none!important}
    .icon-tile{width:28px!important;height:28px!important}
    .brand-icon{width:32px!important;height:32px!important}
  `;
  document.head.appendChild(style);

  try{
    const response=await fetch('./design/icons/cm3d-ui-icons-v3.svg',{cache:'no-store'});
    if(!response.ok)throw new Error(`Icon-Sprite HTTP ${response.status}`);
    const source=await response.text();
    const template=document.createElement('template');
    template.innerHTML=source.trim();
    const sprite=template.content.firstElementChild;
    if(!sprite)throw new Error('Icon-Sprite leer');
    sprite.id='cm3d-inline-icon-sprite';
    sprite.setAttribute('aria-hidden','true');
    sprite.style.position='absolute';
    sprite.style.width='0';
    sprite.style.height='0';
    sprite.style.overflow='hidden';
    sprite.style.pointerEvents='none';
    document.body.prepend(sprite);

    for(const use of document.querySelectorAll('svg.cm-icon use')){
      const href=use.getAttribute('href')||use.getAttribute('xlink:href')||'';
      const hash=href.lastIndexOf('#');
      if(hash<0)continue;
      use.setAttribute('href',href.slice(hash));
      use.removeAttribute('xlink:href');
    }
  }catch(error){
    console.warn('CM3D V3 Icons konnten nicht Safari-sicher eingebettet werden.',error);
  }
}

export function installCommandSurface(store){
  makeIconsSafariSafe();

  const q=s=>document.querySelector(s);
  const sets=[...document.querySelectorAll('[data-context]')];
  const categoryButtons=[...document.querySelectorAll('[data-context-target]')];
  const menuButtons=[...document.querySelectorAll('[data-menu-toggle]')];
  const toolInspector=q('#tool-inspector');
  const extrudePanel=q('#tool-inspector-extrude');
  const extrudeSource=q('#extrude-source');
  let activeContext=null;

  const hideTool=()=>{
    if(toolInspector)toolInspector.hidden=true;
    if(extrudePanel)extrudePanel.hidden=true;
  };

  const closeMenus=except=>{
    for(const button of menuButtons){
      const panel=q(`#${button.dataset.menuToggle}`);
      if(panel===except)continue;
      panel.hidden=true;
      button.classList.remove('active');
      button.setAttribute('aria-expanded','false');
    }
  };

  const setContext=name=>{
    if(name!==null&&!CONTEXT_META[name])return;
    activeContext=name;

    for(const set of sets){
      const visible=name!==null&&set.dataset.context===name;
      set.hidden=!visible;
      set.style.display=visible?'flex':'none';
    }

    for(const button of categoryButtons){
      button.classList.toggle('active',name!==null&&button.dataset.contextTarget===name);
    }

    if(name===null){
      q('#context-title').textContent='Bereit';
      q('#context-subtitle').textContent='Oben Funktion auswählen';
      return;
    }

    const [title,subtitle]=CONTEXT_META[name];
    q('#context-title').textContent=title;
    q('#context-subtitle').textContent=subtitle;
  };

  for(const button of menuButtons){
    button.setAttribute('aria-expanded','false');
    button.addEventListener('click',event=>{
      event.stopPropagation();
      const panel=q(`#${button.dataset.menuToggle}`);
      const opening=panel.hidden;
      closeMenus(panel);
      panel.hidden=!opening;
      button.classList.toggle('active',opening);
      button.setAttribute('aria-expanded',String(opening));
    });
  }

  for(const button of categoryButtons){
    button.addEventListener('click',()=>{
      closeMenus();
      setContext(button.dataset.contextTarget);
    });
  }

  for(const item of document.querySelectorAll('[data-set-context]')){
    item.addEventListener('click',()=>{
      setContext(item.dataset.setContext);
      closeMenus();
    });
  }

  const proxies=[...document.querySelectorAll('[data-proxy-click]')];
  for(const proxy of proxies){
    proxy.addEventListener('click',()=>q(`#${proxy.dataset.proxyClick}`)?.click());
  }
  const syncProxies=()=>{
    for(const proxy of proxies){
      const target=q(`#${proxy.dataset.proxyClick}`);
      proxy.disabled=!!target?.disabled;
    }
  };

  // UI-01 owns the Bearbeiten menu. Replace the former toolbar handlers with
  // menu-owned history commands so one tap always performs exactly one step.
  const undoButton=q('#undo');
  const redoButton=q('#redo');
  if(undoButton)undoButton.onclick=null;
  if(redoButton)redoButton.onclick=null;
  const syncHistory=()=>{
    if(undoButton)undoButton.disabled=store.undoStack.length===0;
    if(redoButton)redoButton.disabled=store.redoStack.length===0;
  };
  const runHistory=direction=>{
    const changed=direction==='undo'?store.undo():store.redo();
    if(changed)closeMenus();
    syncHistory();
  };
  undoButton?.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();runHistory('undo');});
  redoButton?.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();runHistory('redo');});

  document.addEventListener('click',event=>{
    if(!event.target.closest('.menu-group'))closeMenus();
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){
      closeMenus();
      hideTool();
    }
  });

  const showExtrude=()=>{
    const object=store.getObject(store.selection.activeObjectId);
    if(object?.type!=='sketch'){
      alert('Bitte zuerst eine geschlossene Skizze im Objektbaum auswählen.');
      return;
    }
    setContext('sketch');
    if(extrudeSource)extrudeSource.textContent=object.name||object.objectId;
    toolInspector.hidden=false;
    extrudePanel.hidden=false;
    q('#extrude-depth')?.focus();
  };

  q('#start-extrude')?.addEventListener('click',showExtrude);
  q('#modeling-extrude')?.addEventListener('click',showExtrude);
  q('#cancel-extrude')?.addEventListener('click',hideTool);
  q('#extrude-sketch')?.addEventListener('click',()=>setTimeout(hideTool,0));
  q('#show-material-inspector')?.addEventListener('click',()=>q('#material-fields')?.scrollIntoView({behavior:'smooth',block:'center'}));

  q('#new-project')?.addEventListener('click',()=>setTimeout(()=>setContext(null),0));
  q('#new-sketch')?.addEventListener('click',()=>setTimeout(()=>setContext('sketch'),0));

  store.subscribe(event=>{
    if(event.type==='historyChanged')syncHistory();
    if(event.type!=='selectionChanged'&&event.type!=='projectChanged'&&event.type!=='projectLoaded')return;

    const object=store.getObject(store.selection.activeObjectId);
    if(!object){
      if(event.type==='projectChanged'||event.type==='projectLoaded'||activeContext==='sketch'||activeContext==='scene'||activeContext==='transform')setContext(null);
      hideTool();
      setTimeout(syncProxies,0);
      return;
    }

    if(object.type==='sketch')setContext('sketch');
    else if(object.type==='group'||object.type==='assembly')setContext('scene');
    else if(event.type==='selectionChanged')setContext('transform');

    if(object.type!=='sketch')hideTool();
    setTimeout(syncProxies,0);
  });

  setContext(null);
  syncProxies();
  syncHistory();
}
