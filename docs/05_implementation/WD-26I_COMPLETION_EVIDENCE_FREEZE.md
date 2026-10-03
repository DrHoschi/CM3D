# WD-26I – RB-07 Assembly Library / Independent Hierarchy Copy – Completion / Evidence / Freeze

Status: PASS · FROZEN
Date: 2026-10-03
Authorized base: `bfda15cb4f5880cf9a6712fe1cec9a0591e5ae0b`
Functional freeze head: `e6b49b55136066e54fffb2931933de21feec9189`
Feature branch: `feature/WD-26I-assembly-library-independent-hierarchy-copy`

## Scope

WD-26I closes the RB-07 Assembly Library minimal block for independent reusable hierarchy copies on the shared A10 Library Registry foundation.

Implemented contract:

- A10 `assembly` LibraryEntry creation from a selected `group` or `assembly` root plus its complete recursive parent/child subtree;
- portable hierarchy payload without retained project-local object IDs;
- every inserted hierarchy object receives a new project-local `objectId`;
- internal `parentId` relationships are rebuilt through the new object-ID map;
- hierarchy order and stored transforms are preserved;
- the inserted assembly root becomes a normal project root with `parentId = null`;
- inserted hierarchy objects use `layerId = null` and therefore do not retain source-project layer identities;
- shared material dependencies are deduplicated in the portable payload and recreated once per inserted assembly;
- supported Base-Color texture dependencies are deduplicated, recreated with new project-local asset IDs and rebound to the new materials;
- shared `external.gltf` model bundles are deduplicated, recreated with new project-local asset IDs and rebound to all corresponding copied objects;
- primitive and `external.gltf` leaves use the established independent-copy portability boundary;
- insertion is one atomic History operation for the hierarchy and all dependencies;
- the resulting normal project state survives Save → Reload through the existing project persistence authority;
- minimal Assembly Library UI supports saving a selected group/assembly and inserting a stored assembly template.

## Identity / hierarchy contract

The LibraryEntry does not persist source-project `objectId` or `parentId` values. Portable object keys describe the hierarchy only inside the library payload. During insertion, the complete object-key set is mapped to newly generated project-local object IDs before the hierarchy is materialized.

The root has no copied external parent. All internal children point only to newly generated IDs inside the inserted hierarchy. `order` and transforms are preserved so the independent copy retains the stored hierarchy arrangement without introducing a second child-list authority.

## Dependency deduplication and rebinding

Materials, Base-Color textures and GLTF model bundles are keyed by their source identity only while the portable payload is built. Multiple hierarchy objects that share one dependency therefore carry one portable dependency record.

Insertion creates one new project-local dependency for each portable dependency key and reuses that new identity wherever the assembly references it. No source-project material or asset ID survives as the target project's authority.

## Portability boundary / deterministic rejection

WD-26I deliberately does not implement a general dependency-graph copier.

The minimal Assembly Library path supports nested `group` / `assembly` containers with primitive and `external.gltf` leaves. Unsupported object kinds and objects carrying external Sketch, Feature, Plane/Construction or other unsupported project references are rejected deterministically rather than silently retaining cross-project IDs.

Sketch-/Feature-/Construction dependency copy is therefore deferred to an explicitly separate future contract.

## Independent-copy boundary

F071 semantics remain independent-copy semantics. After insertion, neither the root, descendants, materials nor assets retain a live link to the A10 LibraryEntry. Editing the inserted hierarchy cannot mutate the template, and later template changes cannot mutate an already inserted project hierarchy.

Linked Instances are explicitly outside WD-26I.

## History / persistence

Assembly insertion snapshots the project once and commits one History entry after the hierarchy and all required dependencies are created. Undo/Redo therefore treats the complete insertion as one user operation.

The A10 registry itself remains outside project persistence. Save → Reload covers only the resulting ordinary project objects, materials and assets.

## Verification

Final Exact-Head verification was executed against exactly:

`e6b49b55136066e54fffb2931933de21feec9189`

GitHub Actions evidence:

- Workflow: `WD-26I Assembly Library Independent Hierarchy Copy`
- Run: #1
- Run ID: `37107644740`
- Conclusion: `success`
- Exact head: PASS
- Syntax: PASS
- A10 Registry Regression: PASS
- Object Library Regression: PASS
- Sketch Library Regression: PASS
- WD-26I Focused Regression: PASS

## Explicit exclusions

WD-26I does not implement:

- Sketch dependency copy inside assemblies;
- Feature dependency graph copy;
- Construction Plane / Work Plane rebinding;
- linked instances or live LibraryEntry references;
- F118 thumbnails;
- a general-purpose Library browser.

## Freeze

The functional WD-26I freeze head is permanently recorded as:

`e6b49b55136066e54fffb2931933de21feec9189`

The Gate-3 documentation commit is evidence-only and does not redefine the functional freeze head.

WD-26I Assembly Library / Independent Hierarchy Copy: PASS · FROZEN · 0 BLOCKER.
