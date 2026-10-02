# WD-26F – Material Presets / Material Library – Completion / Evidence / Freeze

Status: FROZEN
Date: 2026-10-02
RB block: RB-07 / WD-26F
Functions: F060 / F061
Implementation base: `42bec8c2ee4436babe266173fbbc9fdf218da21c`
Functional verified head: `7a5c29f0a8bc6a78ee111f0b97c20306030c25cb`
Branch: `feature/WD-26F-material-presets-library-application`

## Scope

WD-26F closes the first usable F060/F061 material preset and material-library application path on top of the WD-26E A10 Library Registry foundation.

The verified functional line adds:

- a small deterministic built-in material preset set;
- creation of an A10 `material` LibraryEntry from an existing project MaterialDefinition;
- portable texture payloads that do not retain project-local asset identity;
- application of a preset or material LibraryEntry as a new project-local MaterialDefinition;
- project-local texture asset recreation when a library material contains a base-color texture;
- atomic shared assignment to the existing selected objects;
- minimal preset/library controls in the existing material panel;
- focused Undo/Redo and Save -> Reload regression.

## Preset vs. Library contract

A material preset is a built-in deterministic starting definition. It is not a persisted LibraryEntry and owns no reusable LibraryEntry identity.

A user-reusable material is represented by the WD-26E A10 `material` LibraryEntry contract with stable LibraryEntry identity, name, category, schema/version and serialized payload.

Neither preset nor LibraryEntry becomes a second live MaterialDefinition authority inside a project. Applying either creates a normal project-local MaterialDefinition.

## Material identity and Shared assignment

Applying a preset or LibraryEntry creates a new project-local `materialId`. Library material identity is never reused as project material identity.

The resulting MaterialDefinition is assigned as one shared project material to the targeted existing selection. Selected objects therefore intentionally share the newly created project definition. Objects outside the target selection remain unchanged.

The existing WD-26A Local Variant operation remains the path for later independent per-object editing. WD-26F introduces no linked material relationship back to the preset or Library Registry.

## Portable texture payload contract

A project MaterialDefinition may reference a WD-26D base-color texture through a project-local `assetId`. Such an ID is not portable across projects and is therefore not stored as the reusable library reference.

When a material is captured into the library, the required supported texture data is copied into the LibraryEntry payload using a library-local payload key. The original project `assetId` is not retained as reusable identity.

When that LibraryEntry is applied, each required texture is recreated as a new project-local `image.texture` asset with a new `assetId`. The newly created MaterialDefinition then references that new project asset through its normal `textureRefs.baseColor` field.

Invalid portable texture payload data is rejected rather than creating a dangling project reference.

## Undo / Redo contract

Applying one preset or one material LibraryEntry is one user operation. Material creation, required texture-asset recreation and assignment to the target selection are captured by one existing project snapshot/history transition.

WD-26F creates no separate material-library history stack.

## Save -> Reload contract

After application, the resulting MaterialDefinition, texture asset if present, material reference and object assignment are ordinary native project state. The focused regression verifies this state through the existing project validation and JSON Save -> Reload path.

The Library Registry itself is not inserted into the project document by WD-26F.

## Minimal UI contract

The existing material panel exposes only the controls required for this first functional F060/F061 path:

- choose and apply a built-in preset;
- capture the current material into the in-memory material Library Registry with name/category;
- choose and apply a material LibraryEntry.

This block does not introduce a general-purpose Library browser or Sketch/Object/Assembly Library UI.

## Verification evidence

Exact functional head verified:

`7a5c29f0a8bc6a78ee111f0b97c20306030c25cb`

GitHub Actions:

- workflow: `WD-26F Material Presets Library Application`
- run: `#1`
- run id: `37060969142`
- result: `success`

Successful verification steps:

- Exact head
- Syntax
- WD-26A regression
- WD-26B regression
- WD-26C regression
- WD-26D regression
- WD-26E regression
- WD-26F focused regression

Verification blockers: 0.

## Explicit non-scope

WD-26F introduces no:

- Sketch Library / Sketch Template insertion
- Object Library insertion
- Assembly Library insertion
- persistent linked materials to the Library Registry
- persistent linked geometry instances
- general Library browser
- second project persistence authority
- second project asset authority

## Freeze decision

The functional WD-26F implementation is frozen at:

`7a5c29f0a8bc6a78ee111f0b97c20306030c25cb`

Exact-Head-CI Run #1 (`37060969142`) is the verification evidence for this functional freeze.

This completion document is evidence-only and does not redefine the functional freeze head.

Gate-3 integration is permitted only as a linear fast-forward from unchanged `main = 42bec8c2ee4436babe266173fbbc9fdf218da21c` through this completion/evidence commit. No Sketch/Object/Assembly Library or linked-material extension is authorized during integration.
