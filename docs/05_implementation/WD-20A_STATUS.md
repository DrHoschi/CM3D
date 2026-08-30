# WD-20A – V2 Project Schema & Migration Foundation

Status: IMPLEMENTED / DEVICE TEST PENDING  
Branch: `feature/wd-20a-project-schema-migration`  
Base: stable `main` (`86ea06e`)  
Date: 2026-08-30

## Scope

WD-20A implements only the controlled V1→V2 project schema and migration foundation.

- V1 project schema: `0.1.0`
- Current V2 project schema: `0.2.0`
- Common load sequence: detect version → migrate → validate
- Existing IDs and payload are preserved by the V1→V2 migration; only `schemaVersion` changes.
- Unsupported/missing schema versions are rejected explicitly.
- Project file loading, browser storage loading and full-project merge loading use the same migration mechanism.
- Existing project validation remains the post-migration gate.
- Partial-project/library package schema remains separate at `CM3D_PARTIAL / 0.1.0` and is not silently coupled to the native project schema.

## Changed code

- `src/model/project.js`: current project schema set to `0.2.0`.
- `src/persistence/project-schema.js`: central schema detection, migration and post-migration validation.
- `src/persistence/project-file.js`: project file load routed through common migration path.
- `src/persistence/storage.js`: browser-stored project load routed through common migration path.
- `src/persistence/partial-project.js`: full CM3D project supplied to merge/import is migrated before conversion to a partial package.

## Regression fixture

`test-assets/wd-20a/v1-project-0.1.0.cm3d.json`

The fixture contains stable project/material/object IDs plus marker extension data so preservation can be checked after migration.

## Technical regression checklist

1. New project is created with `schemaVersion = 0.2.0`.
2. V1 fixture (`0.1.0`) loads successfully.
3. After V1 load, project schema is `0.2.0`.
4. `projectId`, `objectId`, `materialId`, transform, dimensions and extension marker data remain unchanged.
5. Migrated project can be saved and reloaded from browser storage.
6. Migrated project can be downloaded as a `.cm3d.json` project and re-opened.
7. V1 full project can be used by the existing merge/load path and is migrated before conversion/import.
8. Unsupported schema (for example `9.9.9`) is rejected without changing the current project.
9. Missing schema version is rejected without changing the current project.
10. Invalid payload that still fails normal project validation is rejected after migration.
11. Existing Sketch creation/editing remains unchanged.
12. Existing Extrude creation/editing and V1 tree-parent behavior remain unchanged.
13. Existing Undo/Redo remains unchanged.
14. Existing project save/load UI remains operational on iPad/Safari.

## Freeze gate

WD-20A must not be marked PASS/FROZEN and must not be merged into `main` until the iPad/Safari device regression has passed.
