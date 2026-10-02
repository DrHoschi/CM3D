# WD-26D – Base Color Texture Foundation – Completion / Evidence / Freeze

Status: FROZEN
Date: 2026-10-02
RB block: RB-07 / WD-26D
Function: F056 – Base Color Texture Foundation
Implementation base: `022fbc92e6d146710078e1ebab519297dd090ee2`
Functional verified head: `657eb643aa97338608af6802fb6fa58935307b1c`
Branch: `feature/WD-26D-base-color-texture-foundation`

## Scope

WD-26D establishes the first functional F056 texture path without introducing a second asset or persistence authority.

The verified implementation extends the existing project asset authority and MaterialDefinition texture references only for the base-color texture slot.

## Asset / reference authority

Texture files live in the existing `project.assets[]` authority as embedded `image.texture` assets.

`MaterialDefinition.textureRefs.baseColor` contains the referenced texture `assetId`.

The material definition does not embed a second copy of the image bytes and WD-26D introduces no separate texture registry.

Supported first-block image input is restricted to the formats accepted by the WD-26D import contract (PNG/JPEG/WebP). Additional texture formats and slots are outside this freeze.

## Assignment / removal and history

Base-color texture import/assignment and removal use the existing project snapshot/history authority. Texture changes therefore participate in the normal Undo/Redo path rather than introducing a texture-specific history stack.

Removing a texture reference removes the material binding to the texture asset; it does not establish automatic asset garbage collection.

## Shared / Local Variant contract

`textureRefs` remains part of MaterialDefinition.

- a texture assigned to a shared MaterialDefinition is visible through all objects bound to that shared definition;
- a local material variant owns its copied MaterialDefinition and can therefore change its base-color texture independently of the source shared definition;
- the WD-26A MaterialBinding authority remains unchanged.

## Save -> Reload contract

WD-26D adds no second persistence mechanism. Embedded texture assets remain inside `project.assets[]`, and the material stores only the stable asset reference in `textureRefs.baseColor`.

Focused regression verifies that the texture asset and reference survive JSON Save -> Reload through the existing project migration/validation path.

## Validation contract

A base-color texture reference must resolve to an existing compatible texture asset. Missing asset references and references to an incompatible asset type are invalid project state.

Runtime consumption remains defensive: an unavailable/unusable texture must not require a second state authority and must fall back to the existing material base-color path rather than changing the project model at render time.

## Runtime map / lifecycle contract

The Three.js runtime resolves `textureRefs.baseColor` through `project.assets[]` and binds a successfully loaded texture to `MeshStandardMaterial.map`.

Color textures use the runtime color-space handling required for base-color display. Runtime-created texture resources are owned by the runtime material/texture path and are disposed during the corresponding runtime rebuild/disposal lifecycle.

If no valid usable base-color texture is available, the existing Base Color material rendering remains the fallback.

## Minimal Inspector contract

WD-26D provides only the minimum product interaction required for F056 foundation:

- select/import a supported image as a base-color texture;
- show the assigned base-color texture state;
- remove the base-color texture reference.

No texture browser, advanced mapping editor, UV editor, or additional texture slots are introduced.

## Verification evidence

Exact functional head verified:

`657eb643aa97338608af6802fb6fa58935307b1c`

GitHub Actions:

- workflow: `WD-26D Base Color Texture Foundation`
- run: `#1`
- run id: `37059493098`
- result: `success`

Successful verification steps:

- Exact head
- Syntax
- WD-26A regression
- WD-26B regression
- WD-26C regression
- WD-26D focused regression

Verification blockers: 0.

## Explicit non-scope

WD-26D introduces no:

- additional texture slots such as normal, roughness, metalness or AO maps
- F060 material presets
- F061 material library / Library Registry
- sketch/object/assembly libraries
- second asset registry
- second persistence authority
- texture-specific Undo/Redo authority
- broad rendering or performance optimization

## Freeze decision

The functional WD-26D implementation is frozen at:

`657eb643aa97338608af6802fb6fa58935307b1c`

Exact-Head-CI Run #1 (`37059493098`) is the verification evidence for this functional freeze.

This completion document is evidence-only and does not redefine the functional freeze head.

Gate-3 integration is permitted only as a linear fast-forward from unchanged `main = 022fbc92e6d146710078e1ebab519297dd090ee2` through this completion/evidence commit. No additional texture slot, F060/F061, or Library work is authorized during integration.
