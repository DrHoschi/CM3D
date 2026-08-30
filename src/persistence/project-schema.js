import { FORMAT, SCHEMA_VERSION, validateProject } from '../model/project.js';

export const V1_SCHEMA_VERSION = '0.1.0';
export const CURRENT_PROJECT_SCHEMA_VERSION = SCHEMA_VERSION;

const migrations = new Map([
  [V1_SCHEMA_VERSION, project => {
    const migrated = structuredClone(project);
    migrated.schemaVersion = CURRENT_PROJECT_SCHEMA_VERSION;
    return migrated;
  }]
]);

export function detectProjectSchemaVersion(candidate) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    throw new Error('CM3D-Projektdaten fehlen oder sind ungültig.');
  }
  if (candidate.format !== FORMAT) {
    throw new Error('Ungültiges CM3D-Format.');
  }
  if (typeof candidate.schemaVersion !== 'string' || !candidate.schemaVersion.trim()) {
    throw new Error('CM3D schemaVersion fehlt.');
  }
  return candidate.schemaVersion;
}

export function migrateProjectToCurrent(candidate) {
  const fromVersion = detectProjectSchemaVersion(candidate);
  let current = structuredClone(candidate);
  let version = fromVersion;
  const appliedMigrations = [];
  const visited = new Set();

  while (version !== CURRENT_PROJECT_SCHEMA_VERSION) {
    if (visited.has(version)) {
      throw new Error(`Zyklischer CM3D-Migrationspfad bei schemaVersion ${version}.`);
    }
    visited.add(version);
    const migrate = migrations.get(version);
    if (!migrate) {
      throw new Error(`Nicht unterstützte CM3D schemaVersion: ${version}.`);
    }
    current = migrate(current);
    const nextVersion = detectProjectSchemaVersion(current);
    if (nextVersion === version) {
      throw new Error(`CM3D-Migration für schemaVersion ${version} hat die Version nicht fortgeschrieben.`);
    }
    appliedMigrations.push(`${version}->${nextVersion}`);
    version = nextVersion;
  }

  return {
    project: current,
    migrated: appliedMigrations.length > 0,
    fromVersion,
    toVersion: version,
    appliedMigrations
  };
}

export function migrateAndValidateProject(candidate) {
  const migration = migrateProjectToCurrent(candidate);
  const validation = validateProject(migration.project);
  if (!validation.valid) {
    throw new Error(`CM3D-Projekt ist nach der Schema-Migration ungültig:\n${validation.errors.join('\n')}`);
  }
  return migration;
}
