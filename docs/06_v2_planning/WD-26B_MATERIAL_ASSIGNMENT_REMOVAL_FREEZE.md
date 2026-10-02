# WD-26B – Material Assignment / Removal – Completion / Evidence / Freeze

Status: FROZEN
Date: 2026-10-02
RB block: RB-07 / WD-26B
Implementation base: `fa86a993894501a69de62e01d8969d5b93082bc2`
Functional verified head: `c968afcbcff87e3b4f49718195c10e54d7cc656f`
Branch: `feature/wd-26b-material-assignment-removal`

## Scope

WD-26B closes the RB-07 assignment/removal foundation for F054 Multi-Object Material Assignment and F062 Material Removal while preserving the WD-26A MaterialDefinition / MaterialBinding contract.

Functional files in the WD-26B line:

- `src/application/material.js`
- `src/ui/material-panel.js`
- `tests/wd-26b-material-assignment-removal.mjs`
- `.github/workflows/wd-26b-material-assignment-removal.yml`

## F054 – Multi-Object Assignment

`assignMaterialToObjects(...)` applies one shared MaterialDefinition atomically to the material-capable objects in the supplied selection. Duplicate object IDs are normalized and unsupported object types are excluded.

A multi-object assignment creates exactly one project snapshot/history entry for the user operation. Existing local bindings on affected objects are deliberately resolved back to the selected shared MaterialDefinition; `materialIds[0]` remains the compatibility representation of the effective material.

The Material panel consumes the existing `store.selection.selectedObjectIds` authority. It does not introduce a second selection state. For multiple selected material-capable objects it distinguishes a common binding from mixed material/binding state.

## F062 – Material Removal

`removeMaterialFromObjects(...)` atomically removes the material binding from the affected objects by clearing `materialIds` and removing an explicit local `materialBinding` when present.

Removal is binding removal only. It does not delete the referenced shared or local MaterialDefinition from the project-wide `materials` map. Automatic unused-material garbage collection is outside WD-26B scope.

A multi-object removal creates exactly one project snapshot/history entry.

## Undo / Redo contract

Assignment and removal use the existing project snapshot/history authority. Each multi-object user operation contributes one history transition rather than one transition per object. No new Undo/Redo authority is introduced.

## Mixed-selection contract

The Material panel derives its state from the selected material-capable objects:

- identical effective binding -> common material state;
- differing material IDs or binding modes -> mixed state;
- assignment from mixed state atomically resolves affected objects to the chosen shared definition;
- removal from mixed state atomically clears bindings from affected objects.

## Save -> Reload contract

WD-26B does not add a persistence format or persistence authority. Assignment/removal modify the existing project state. Focused regression verifies that removed bindings survive JSON Save -> Reload through the existing migration/validation path and that unbound MaterialDefinitions remain present.

## Verification evidence

Exact functional head verified:

`c968afcbcff87e3b4f49718195c10e54d7cc656f`

GitHub Actions:

- workflow: `WD-26B Material Assignment Removal`
- run: `#1`
- run id: `37057724474`
- result: `success`

Successful steps:

- Syntax
- WD-25F regression
- WD-26A regression
- WD-26B focused regression

Verification blockers: 0.

## Explicit non-scope

WD-26B introduces no:

- deletion or garbage collection of unused MaterialDefinitions
- texture UI or texture workflow
- material presets
- material/shared Library Registry
- sketch/object/assembly libraries
- new selection authority
- new persistence authority
- rendering or performance optimization

## Freeze decision

The functional WD-26B implementation is frozen at:

`c968afcbcff87e3b4f49718195c10e54d7cc656f`

This completion document is evidence-only and does not redefine the functional freeze head.

Gate-3 integration is permitted only as a linear fast-forward from unchanged `main = fa86a993894501a69de62e01d8969d5b93082bc2` through this completion/evidence commit. No additional RB-07 product changes are authorized during integration.
