import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { createExternalGltfObject } from '../model/project.js';

const EXTERNAL_GLTF_TYPE = 'external.gltf';
const GLTF_ASSET_KIND = 'model.gltf.bundle';

const extensionOf = name => String(name || '').split('.').pop()?.toLowerCase() || '';
const stripExtension = name => String(name || 'Importiertes Modell').replace(/\.(glb|gltf)$/i, '') || 'Importiertes Modell';
const normalizePath = value => decodeURIComponent(String(value || ''))
  .replace(/\\/g, '/')
  .replace(/[?#].*$/, '')
  .replace(/^\.\//, '')
  .replace(/^\/+/, '');
const basename = value => normalizePath(value).split('/').pop() || '';
const isEmbeddedUrl = value => /^(data:|blob:)/i.test(String(value || ''));

function mimeForName(name, fallback = '') {
  if (fallback) return fallback;
  const ext = extensionOf(name);
  return ({
    glb: 'model/gltf-binary',
    gltf: 'model/gltf+json',
    bin: 'application/octet-stream',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    ktx2: 'image/ktx2'
  })[ext] || 'application/octet-stream';
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error(`Datei konnte nicht gelesen werden: ${file?.name || 'unbekannt'}`));
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(file);
  });
}

function dataUrlToArrayBuffer(dataUrl) {
  const comma = String(dataUrl || '').indexOf(',');
  if (comma < 0) throw new Error('Ungültige eingebettete Asset-Daten.');
  const header = dataUrl.slice(0, comma);
  const payload = dataUrl.slice(comma + 1);
  if (/;base64/i.test(header)) {
    const raw = atob(payload);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
    return bytes.buffer;
  }
  return new TextEncoder().encode(decodeURIComponent(payload)).buffer;
}

function dataUrlToText(dataUrl) {
  return new TextDecoder().decode(dataUrlToArrayBuffer(dataUrl));
}

function bundleLookup(files) {
  const byPath = new Map();
  const byBase = new Map();
  const duplicateBase = new Set();
  for (const file of files) {
    const paths = [file.path, file.name].filter(Boolean).map(normalizePath);
    for (const path of paths) if (path) byPath.set(path, file);
    const base = basename(file.name || file.path);
    if (!base) continue;
    if (byBase.has(base) && byBase.get(base) !== file) duplicateBase.add(base);
    else byBase.set(base, file);
  }
  for (const base of duplicateBase) byBase.delete(base);
  return uri => {
    const normalized = normalizePath(uri);
    return byPath.get(normalized) || byBase.get(basename(normalized)) || null;
  };
}

function externalUrisFromGltfText(text) {
  let json;
  try { json = JSON.parse(text); }
  catch { throw new Error('Die ausgewählte GLTF-Datei enthält kein gültiges JSON.'); }
  const uris = [];
  for (const buffer of json.buffers || []) if (buffer?.uri && !isEmbeddedUrl(buffer.uri)) uris.push(buffer.uri);
  for (const image of json.images || []) if (image?.uri && !isEmbeddedUrl(image.uri)) uris.push(image.uri);
  return [...new Set(uris)];
}

function safeFileBase(value) {
  const clean = String(value || 'cm3d-export')
    .replace(/\.(glb|gltf)$/i, '')
    .replace(/[\\/:*?"<>|]+/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
  return clean || 'cm3d-export';
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

export function installGltfInterchange(runtime, store) {
  const pendingHydrations = new Set();
  const baseCreateNode = runtime.createNode.bind(runtime);

  const findAsset = assetId => (store.project.assets || []).find(asset => asset?.assetId === assetId) || null;

  async function parseAsset(asset) {
    if (!asset || asset.kind !== GLTF_ASSET_KIND) throw new Error('GLB/GLTF-Asset fehlt oder besitzt einen unbekannten Typ.');
    const files = Array.isArray(asset.files) ? asset.files : [];
    const entry = files.find(file => normalizePath(file.path || file.name) === normalizePath(asset.entryFile))
      || files.find(file => basename(file.name) === basename(asset.entryFile));
    if (!entry) throw new Error(`GLB/GLTF-Einstiegsdatei fehlt: ${asset.entryFile || 'unbekannt'}`);

    const resolveBundleFile = bundleLookup(files);
    const manager = new THREE.LoadingManager();
    manager.setURLModifier(url => {
      if (isEmbeddedUrl(url)) return url;
      const file = resolveBundleFile(url);
      if (!file) throw new Error(`Zusatzdatei fehlt: ${normalizePath(url)}. Bitte GLTF und alle referenzierten BIN-/Texturdateien gemeinsam auswählen.`);
      return file.dataUrl;
    });
    const loader = new GLTFLoader(manager);

    if (asset.format === 'glb') return loader.parseAsync(dataUrlToArrayBuffer(entry.dataUrl), '');
    if (asset.format !== 'gltf') throw new Error(`Nicht unterstütztes GLB/GLTF-Format: ${asset.format || 'unbekannt'}`);

    const text = dataUrlToText(entry.dataUrl);
    const missing = externalUrisFromGltfText(text).filter(uri => !resolveBundleFile(uri));
    if (missing.length) throw new Error(`GLTF benötigt zusätzliche Datei(en): ${missing.join(', ')}. Bitte gemeinsam mit der GLTF-Datei auswählen.`);
    return loader.parseAsync(text, '');
  }

  function registerPickables(root, objectId) {
    root.traverse(child => {
      if (!(child.isMesh || child.isLine || child.isPoints)) return;
      child.userData.cm3dObjectId = objectId;
      runtime.pickables.push(child);
    });
  }

  function scheduleHydration(node, object) {
    const asset = findAsset(object.data?.assetId);
    if (!asset) {
      node.userData.cm3dExternalError = 'Asset fehlt';
      return;
    }
    let task;
    task = parseAsset(asset)
      .then(gltf => {
        if (runtime.objectMap.get(object.objectId) !== node) return;
        const imported = SkeletonUtils.clone(gltf.scene);
        imported.name = imported.name || object.name;
        imported.userData.cm3dImportedRoot = true;
        node.add(imported);
        registerPickables(imported, object.objectId);
        runtime.syncSelection();
        runtime.updateCameraRange();
        store.emit('externalAssetReady', { objectId: object.objectId, assetId: asset.assetId });
      })
      .catch(error => {
        node.userData.cm3dExternalError = error?.message || String(error);
        console.error('CM3D GLB/GLTF Asset konnte nicht geladen werden.', error);
        store.emit('externalAssetError', { objectId: object.objectId, assetId: asset.assetId, error });
      })
      .finally(() => pendingHydrations.delete(task));
    pendingHydrations.add(task);
  }

  runtime.createNode = object => {
    const node = baseCreateNode(object);
    if (object.type === EXTERNAL_GLTF_TYPE) scheduleHydration(node, object);
    return node;
  };

  async function importFiles(fileList) {
    const files = [...(fileList || [])].filter(Boolean);
    const entries = files.filter(file => ['glb', 'gltf'].includes(extensionOf(file.name)));
    if (!entries.length) throw new Error('Bitte eine .glb- oder .gltf-Datei auswählen.');
    if (entries.length !== 1) throw new Error('Bitte pro Import genau ein GLB- oder GLTF-Hauptmodell auswählen. Abhängige BIN-/Texturdateien dürfen zusätzlich markiert werden.');

    const entryFile = entries[0];
    const records = await Promise.all(files.map(async file => ({
      name: file.name,
      path: file.webkitRelativePath || file.name,
      mimeType: mimeForName(file.name, file.type),
      size: Number(file.size || 0),
      dataUrl: await fileToDataUrl(file)
    })));

    const assetId = `asset_${crypto.randomUUID()}`;
    const format = extensionOf(entryFile.name);
    const asset = {
      assetId,
      kind: GLTF_ASSET_KIND,
      format,
      entryFile: entryFile.webkitRelativePath || entryFile.name,
      originalName: entryFile.name,
      importedAt: new Date().toISOString(),
      files: records,
      extensions: {}
    };

    const parsed = await parseAsset(asset);
    if (!parsed?.scene) throw new Error('Das GLB/GLTF-Modell enthält keine ladbare Szene.');

    const before = store.snapshot();
    const object = createExternalGltfObject(store.project, assetId, stripExtension(entryFile.name));
    object.data.sourceFormat = format;
    store.project.assets ??= [];
    store.project.assets.push(asset);
    store.project.scene.objects[object.objectId] = object;
    store.project.scene.rootObjectIds.push(object.objectId);
    store.touch();
    store.select(object.objectId, false);
    store.pushHistory(before, 'GLB/GLTF importieren');
    store.emit('projectChanged');
    store.emit('selectionChanged');
    return { objectId: object.objectId, assetId, format, fileName: entryFile.name, fileCount: records.length };
  }

  async function waitForHydration() {
    if (!pendingHydrations.size) return;
    await Promise.all([...pendingHydrations]);
  }

  function exportClone() {
    const root = new THREE.Group();
    root.name = 'CM3D_Export';
    for (const child of runtime.modelRoot.children) root.add(SkeletonUtils.clone(child));

    const remove = new Set();
    root.traverse(node => {
      const objectId = node.userData?.cm3dObjectId;
      if (node.userData?.cm3dSketchPlane || node.userData?.cm3dSketchPreview) remove.add(node);
      if (objectId && store.getObject(objectId)?.type === 'sketch') remove.add(node);
    });
    for (const node of remove) if (node.parent && !remove.has(node.parent)) node.parent.remove(node);

    root.traverse(node => {
      for (const key of Object.keys(node.userData || {})) if (key.startsWith('cm3d')) delete node.userData[key];
    });
    return root;
  }

  async function exportScene(options = {}) {
    await waitForHydration();
    const format = String(options.format || 'glb').toLowerCase();
    if (!['glb', 'gltf'].includes(format)) throw new Error(`Unbekanntes Exportformat: ${format}`);

    const root = exportClone();
    let renderableCount = 0;
    root.traverse(node => { if (node.isMesh || node.isLine || node.isPoints) renderableCount += 1; });
    if (!renderableCount) throw new Error('Die Szene enthält keine exportierbare 3D-Geometrie. Skizzen allein werden nicht als GLB/GLTF exportiert.');

    const exporter = new GLTFExporter();
    const result = await exporter.parseAsync(root, {
      binary: format === 'glb',
      onlyVisible: true,
      trs: false,
      includeCustomExtensions: false
    });

    const base = safeFileBase(options.fileName || store.project.project?.name || 'cm3d-export');
    const fileName = `${base}.${format}`;
    const blob = format === 'glb'
      ? new Blob([result], { type: 'model/gltf-binary' })
      : new Blob([typeof result === 'string' ? result : JSON.stringify(result, null, 2)], { type: 'model/gltf+json' });
    downloadBlob(blob, fileName);
    return { format, fileName, bytes: blob.size, renderableCount };
  }

  return {
    importFiles,
    exportScene,
    waitForHydration,
    objectType: EXTERNAL_GLTF_TYPE,
    assetKind: GLTF_ASSET_KIND
  };
}
