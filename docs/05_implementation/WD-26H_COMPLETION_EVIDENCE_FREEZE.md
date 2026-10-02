# WD-26H – RB-07 Object Library / Independent Object Copy – Completion / Evidence / Freeze

Status: PASS · FROZEN
Date: 2026-10-02
Authorized base: `45109f0ef76c8f850db095a851d42fa86a3bb66a`
Functional freeze head: `022a50be84773f1b724127b9a2cd3b2a13c236c7`
Feature branch: `feature/WD-26H-object-library-independent-copy`

## Scope

WD-26H closes the RB-07 F069–F071 minimal Object Library block for independent reusable single-object copies on the shared A10 Library Registry foundation.

Implemented contract:

- A10 `object` LibraryEntry creation for portable primitive objects (`primitive.box`, `primitive.sphere`, `primitive.cylinder`) and `external.gltf`;
- portable object payloads carry object-local geometry/data, transform, flags/extensions and explicit portable dependencies rather than project-local IDs;
- referenced MaterialDefinitions are copied into the portable payload and recreated with new project-local material IDs on insertion;
- supported Base-Color texture dependencies are carried as portable texture payloads and recreated as new project-local texture assets;
- `external.gltf` carries its embedded `model.gltf.bundle` dependency and insertion creates a new project-local model asset ID;
- material, texture and GLTF references are rebound to the newly created project-local identities;
- every inserted object receives a new project-local `objectId`;
- inserted objects use `parentId = null` and `layerId = null` and are inserted as normal project-root objects;
- insertion is independent-copy semantics: no persistent or hidden link to the LibraryEntry remains;
- one insert is one atomic History operation, including created dependency state;
- the resulting ordinary project state survives Save → Reload through the existing project persistence authority;
- minimal Object Library UI supports saving the selected portable object and inserting a stored object template.

## Portability boundary / deterministic rejection

WD-26H intentionally does not claim arbitrary project objects are portable as isolated objects.

The single-object export path deterministically rejects unsupported object types and objects whose meaning depends on external project references. Group/assembly hierarchy, sketches and external feature/dependency networks are not silently flattened or copied with stale cross-project IDs.

This preserves the authority boundary established in Gate 1: dependent object graphs belong to a later Assembly/Dependency Copy contract rather than the isolated Object Library path.

## Dependency and identity contract

Project-local identities are never reused as Library identities. The reusable payload uses portable dependency keys. On insertion, new project-local object/material/asset identities are generated and references are rebound before the object becomes normal project state.

For `external.gltf`, the model bundle is copied into the target project rather than retaining the source project's `assetId`. For supported materials, Base-Color texture assets are likewise recreated and rebound. No second project or asset persistence authority is introduced.

## History / persistence

Insertion snapshots the project once and commits one History entry after object and required dependency creation. Undo/Redo therefore treats the insertion as one user operation.

Library registry state is not mixed into the project file. Save → Reload concerns only the inserted object and its newly created project-local dependencies.

## Verification

Final Exact-Head verification was executed against exactly:

`022a50be84773f1b724127b9a2cd3b2a13c236c7`

GitHub Actions evidence:

- Workflow: `WD-26H Object Library Independent Copy`
- Run: #2
- Run ID: `37064498830`
- Conclusion: `success`
- Exact head: PASS
- Syntax: PASS
- A10 Registry Regression: PASS
- Material Library Regression: PASS
- Sketch Library Regression: PASS
- WD-26H Focused Regression: PASS

The initial workflow run was blocked only by an incorrect historical WD-26F regression filename in the new workflow. That verification-only path was corrected without product changes; the complete Run #2 is green.

## Explicit exclusions

WD-26H does not implement:

- Assembly or Group hierarchy copy;
- Sketch template behavior through the Object Library path;
- Feature dependency graph copy;
- Plane rebinding;
- linked instances or linked LibraryEntries;
- general-purpose Library browser/product expansion.

## Freeze

The functional WD-26H freeze head is permanently recorded as:

`022a50be84773f1b724127b9a2cd3b2a13c236c7`

The documentation commit created by Gate 3 is evidence-only and does not redefine the functional freeze head.

WD-26H / F069–F071 Object Library: PASS · FROZEN · 0 BLOCKER.
