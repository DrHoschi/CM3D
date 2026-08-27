export const FORMAT = 'CM3D_PROJECT';
export const SCHEMA_VERSION = '0.1.0';

const uuid = (prefix) => `${prefix}_${crypto.randomUUID()}`;

export function createProject(name = 'Neues CM3D Projekt') {
  const materialId = uuid('mat');
  return {
    format: FORMAT,
    schemaVersion: SCHEMA_VERSION,
    project: {
      projectId: uuid('prj'),
      name,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    },
    settings: {
      units: { lengthDisplayUnit: 'm' }
    },
    scene: {
      rootObjectIds: [],
      objects: {}
    },
    materials: {
      [materialId]: {
        materialId,
        name: 'Standard',
        type: 'pbr.standard',
        properties: {
          baseColor: '#b8bcc2',
          metallic: 0,
          roughness: 0.6,
          opacity: 1
        },
        textureRefs: {},
        extensions: {}
      }
    },
    assets: [],
    extensions: {}
  };
}

export function createBoxObject(project, name = 'Würfel') {
  const objectId = uuid('obj');
  const materialId = Object.keys(project.materials)[0] ?? null;
  return {
    objectId,
    type: 'primitive.box',
    name,
    parentId: null,
    order: project.scene.rootObjectIds.length,
    transform: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      scale: { x: 1, y: 1, z: 1 },
      pivot: { x: 0, y: 0, z: 0 }
    },
    data: {
      size: { x: 1, y: 1, z: 1 }
    },
    materialIds: materialId ? [materialId] : [],
    flags: { visible: true, locked: false },
    extensions: {}
  };
}

export function validateProject(project) {
  const errors = [];
  if (!project || project.format !== FORMAT) errors.push('Ungültiges CM3D-Format.');
  if (project?.schemaVersion !== SCHEMA_VERSION) errors.push(`Nicht unterstützte schemaVersion: ${project?.schemaVersion ?? 'fehlt'}`);
  if (!project?.project?.projectId) errors.push('projectId fehlt.');
  if (!project?.scene?.objects || typeof project.scene.objects !== 'object') errors.push('scene.objects fehlt oder ist ungültig.');
  if (!project?.materials || Array.isArray(project.materials) || typeof project.materials !== 'object') errors.push('materials muss eine Material-Map sein.');

  if (project?.scene?.objects) {
    for (const [key, object] of Object.entries(project.scene.objects)) {
      if (key !== object.objectId) errors.push(`Objektschlüssel stimmt nicht mit objectId überein: ${key}`);
      if (object.parentId !== null && !project.scene.objects[object.parentId]) errors.push(`Parent fehlt für ${object.objectId}.`);
      for (const materialId of object.materialIds ?? []) {
        if (!project.materials?.[materialId]) errors.push(`Material ${materialId} fehlt für ${object.objectId}.`);
      }
      const t = object.transform;
      if (!t) errors.push(`Transform fehlt für ${object.objectId}.`);
      else {
        const values = [
          t.position?.x, t.position?.y, t.position?.z,
          t.rotation?.x, t.rotation?.y, t.rotation?.z, t.rotation?.w,
          t.scale?.x, t.scale?.y, t.scale?.z,
          t.pivot?.x, t.pivot?.y, t.pivot?.z
        ];
        if (values.some((v) => !Number.isFinite(v))) errors.push(`Ungültige Transformwerte für ${object.objectId}.`);
        if ([t.scale?.x, t.scale?.y, t.scale?.z].some((v) => v === 0)) errors.push(`Nullskalierung für ${object.objectId}.`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
