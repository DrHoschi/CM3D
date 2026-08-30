import { createProject, validateProject } from '../model/project.js';

export const PARTIAL_FORMAT = 'CM3D_PARTIAL';
export const PARTIAL_SCHEMA_VERSION = '0.1.0';
export const PARTIAL_FILE_EXTENSION = '.cm3d-part.json';

const uuid = prefix => `${prefix}_${crypto.randomUUID()}`;

function safeFileStem(name) {
  const stem = String(name || 'CM3D-Auswahl')
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '');
  return stem || 'CM3D-Auswahl';
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function selectedRootIds(store) {
  const selected = [...new Set(store.selection.selectedObjectIds)].filter(id => store.getObject(id));
  const selectedSet = new Set(selected);
  return selected.filter(id => {
    let parent = store.getObject(id)?.parentId ?? null;
    while (parent) {
      if (selectedSet.has(parent)) return false;
      parent = store.getObject(parent)?.parentId ?? null;
    }
    return true;
  });
}

function collectSubtree(store, rootIds) {
  const objects = store.project.scene.objects;
  const included = new Set();
  const visit = id => {
    if (!objects[id] || included.has(id)) return;
    included.add(id);
    for (const child of Object.values(objects)) if (child.parentId === id) visit(child.objectId);
  };
  for (const id of rootIds) visit(id);
  return included;
}

function worldRootTransform(store, object) {
  const world = store.getWorldTransform(object.objectId);
  return {
    position: structuredClone(world.position),
    rotation: structuredClone(world.rotation),
    scale: structuredClone(world.scale),
    pivot: structuredClone(object.transform?.pivot || { x:0, y:0, z:0 })
  };
}

function packageAsProject(partial) {
  const project = createProject('Teilprojektprüfung');
  project.scene = {
    rootObjectIds: [...partial.roots],
    objects: structuredClone(partial.objects)
  };
  project.materials = structuredClone(partial.materials || {});
  project.assets = structuredClone(partial.assets || []);
  return project;
}

export function validatePartialProject(partial) {
  const errors = [];
  if (!partial || partial.format !== PARTIAL_FORMAT) errors.push('Ungültiges CM3D-Teilprojektformat.');
  if (partial?.schemaVersion !== PARTIAL_SCHEMA_VERSION) errors.push(`Nicht unterstützte Teilprojekt-schemaVersion: ${partial?.schemaVersion ?? 'fehlt'}`);
  if (!Array.isArray(partial?.roots) || !partial.roots.length) errors.push('Teilprojekt enthält keine Root-Objekte.');
  if (!partial?.objects || Array.isArray(partial.objects) || typeof partial.objects !== 'object') errors.push('Teilprojekt objects fehlt oder ist ungültig.');
  if (!partial?.materials || Array.isArray(partial.materials) || typeof partial.materials !== 'object') errors.push('Teilprojekt materials muss eine Material-Map sein.');
  if (!Array.isArray(partial?.assets)) errors.push('Teilprojekt assets muss ein Array sein.');

  if (!errors.length) {
    for (const rootId of partial.roots) {
      const root = partial.objects[rootId];
      if (!root) errors.push(`Teilprojekt-Root fehlt: ${rootId}.`);
      else if (root.parentId !== null) errors.push(`Teilprojekt-Root ${rootId} muss parentId = null besitzen.`);
    }
    const result = validateProject(packageAsProject(partial));
    errors.push(...result.errors);
  }
  return { valid:errors.length === 0, errors };
}

export function createPartialProject(store) {
  const roots = selectedRootIds(store);
  if (!roots.length) throw new Error('Bitte mindestens ein Objekt für den Teilprojekt-Export auswählen.');
  const included = collectSubtree(store, roots);
  const rootSet = new Set(roots);
  const objects = {};
  const materialIds = new Set();
  const assetIds = new Set();

  for (const id of included) {
    const source = store.getObject(id);
    const copy = structuredClone(source);
    if (rootSet.has(id)) {
      copy.parentId = null;
      copy.transform = worldRootTransform(store, source);
    }
    if (copy.type === 'feature.extrude' && copy.data?.sourceSketchId && !included.has(copy.data.sourceSketchId)) {
      copy.data.sourceSketchId = null;
    }
    objects[id] = copy;
    for (const materialId of copy.materialIds || []) materialIds.add(materialId);
    if (copy.type === 'external.gltf' && copy.data?.assetId) assetIds.add(copy.data.assetId);
  }

  const materials = {};
  for (const materialId of materialIds) {
    const material = store.project.materials?.[materialId];
    if (material) materials[materialId] = structuredClone(material);
  }
  const assets = (store.project.assets || [])
    .filter(asset => assetIds.has(asset?.assetId))
    .map(asset => structuredClone(asset));

  const partial = {
    format: PARTIAL_FORMAT,
    schemaVersion: PARTIAL_SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    sourceProject: {
      projectId: store.project.project?.projectId || null,
      name: store.project.project?.name || 'CM3D-Projekt'
    },
    roots,
    objects,
    materials,
    assets,
    extensions: {}
  };

  const result = validatePartialProject(partial);
  if (!result.valid) throw new Error(`Teilprojekt kann nicht exportiert werden:\n${result.errors.join('\n')}`);
  return partial;
}

export function partialProjectFileName(store, fileName = '') {
  const raw = String(fileName || '').replace(/\.cm3d-part\.json$/i, '');
  const fallback = `${store.project.project?.name || 'CM3D-Projekt'} - Auswahl`;
  return `${safeFileStem(raw || fallback)}${PARTIAL_FILE_EXTENSION}`;
}

export function downloadPartialProject(store, fileName = '') {
  const partial = createPartialProject(store);
  const json = JSON.stringify(partial, null, 2);
  const finalName = partialProjectFileName(store, fileName);
  const blob = new Blob([json], { type:'application/json;charset=utf-8' });
  downloadBlob(blob, finalName);
  return { fileName:finalName, bytes:blob.size, objectCount:Object.keys(partial.objects).length, rootCount:partial.roots.length };
}

function fullProjectToPartial(project) {
  const result = validateProject(project);
  if (!result.valid) throw new Error(`Die Datei ist kein gültiges CM3D-Projekt:\n${result.errors.join('\n')}`);
  const objects = structuredClone(project.scene.objects || {});
  const roots = [...(project.scene.rootObjectIds || [])].filter(id => objects[id]);
  return {
    format: PARTIAL_FORMAT,
    schemaVersion: PARTIAL_SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    sourceProject: { projectId:project.project?.projectId || null, name:project.project?.name || 'CM3D-Projekt' },
    roots,
    objects,
    materials: structuredClone(project.materials || {}),
    assets: structuredClone(project.assets || []),
    extensions: { importedFromFullProject:true }
  };
}

export function parseMergeFileText(text) {
  let candidate;
  try { candidate = JSON.parse(String(text)); }
  catch { throw new Error('Die ausgewählte Datei enthält kein gültiges JSON. Das aktuelle Projekt wurde nicht verändert.'); }

  const partial = candidate?.format === 'CM3D_PROJECT' ? fullProjectToPartial(candidate) : candidate;
  const result = validatePartialProject(partial);
  if (!result.valid) throw new Error(`Die Datei kann nicht als CM3D-Objektpaket dazugeladen werden. Das aktuelle Projekt wurde nicht verändert:\n${result.errors.join('\n')}`);
  return partial;
}

export async function readMergeFile(file) {
  if (!file) throw new Error('Bitte eine CM3D-Teilprojekt- oder Projektdatei auswählen.');
  return parseMergeFileText(await file.text());
}

function makeIdMaps(partial) {
  return {
    objects: new Map(Object.keys(partial.objects).map(id => [id, uuid('obj')])),
    materials: new Map(Object.keys(partial.materials || {}).map(id => [id, uuid('mat')])),
    assets: new Map((partial.assets || []).map(asset => [asset.assetId, uuid('asset')]))
  };
}

function remapDeep(value, maps) {
  if (typeof value === 'string') {
    return maps.objects.get(value) ?? maps.materials.get(value) ?? maps.assets.get(value) ?? value;
  }
  if (Array.isArray(value)) return value.map(item => remapDeep(item, maps));
  if (!value || typeof value !== 'object') return value;
  const out = {};
  for (const [key, item] of Object.entries(value)) out[key] = remapDeep(item, maps);
  return out;
}

export function mergePartialProject(store, partial) {
  const result = validatePartialProject(partial);
  if (!result.valid) throw new Error(`CM3D-Objekte können nicht dazugeladen werden:\n${result.errors.join('\n')}`);

  const before = store.snapshot();
  const previousSelection = structuredClone(store.selection);
  const maps = makeIdMaps(partial);

  for (const [oldId, material] of Object.entries(partial.materials || {})) {
    const copy = remapDeep(structuredClone(material), maps);
    copy.materialId = maps.materials.get(oldId);
    store.project.materials[copy.materialId] = copy;
  }

  store.project.assets ??= [];
  for (const asset of partial.assets || []) {
    const copy = remapDeep(structuredClone(asset), maps);
    copy.assetId = maps.assets.get(asset.assetId);
    store.project.assets.push(copy);
  }

  const rootSet = new Set(partial.roots);
  const importedRoots = [];
  for (const [oldId, object] of Object.entries(partial.objects)) {
    const copy = remapDeep(structuredClone(object), maps);
    copy.objectId = maps.objects.get(oldId);
    if (rootSet.has(oldId)) {
      copy.parentId = null;
      copy.order = store.project.scene.rootObjectIds.length + importedRoots.length;
      importedRoots.push(copy.objectId);
    }
    store.project.scene.objects[copy.objectId] = copy;
  }
  store.project.scene.rootObjectIds.push(...importedRoots);

  const mergedValidation = validateProject(store.project);
  if (!mergedValidation.valid) {
    store.project = before;
    store.selection = previousSelection;
    throw new Error(`CM3D-Objekte konnten wegen ungültiger Referenzen nicht dazugeladen werden. Das aktuelle Projekt wurde nicht verändert:\n${mergedValidation.errors.join('\n')}`);
  }

  store.touch();
  store.selection.selectedObjectIds = [...importedRoots];
  store.selection.activeObjectId = importedRoots.at(-1) || null;
  store.selection.hoveredObjectId = null;
  store.pushHistory(before, 'CM3D-Objekte dazuladen');
  store.emit('projectChanged');
  store.emit('selectionChanged');
  return {
    rootIds: importedRoots,
    objectCount: Object.keys(partial.objects).length,
    materialCount: Object.keys(partial.materials || {}).length,
    assetCount: (partial.assets || []).length,
    sourceProjectName: partial.sourceProject?.name || null
  };
}
