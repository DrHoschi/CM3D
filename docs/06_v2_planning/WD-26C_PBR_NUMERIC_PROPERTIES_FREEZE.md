# WD-26C – PBR Numeric Properties – Completion / Evidence / Freeze

Status: FROZEN
Date: 2026-10-02
RB block: RB-07 / WD-26C
Implementation base: `b14da1d649cfd571760e2c0034e6000a6d56f87a`
Functional verified head: `218c8567e03cef58792f35eda29113c746f57cf6`
Branch: `feature/WD-26C-pbr-numeric-properties`

## Scope

WD-26C closes the numeric PBR material-property foundation for:

- F057 – Metallic
- F058 – Roughness
- F059 – Transparency / Opacity

Functional files in the verified WD-26C line:

- `src/application/material.js`
- `src/ui/material-panel.js`
- `tests/wd-26c-pbr-numeric-properties.mjs`
- `.github/workflows/wd-26c-pbr-numeric-properties.yml`

## Property contract

`metallic`, `roughness`, and `opacity` remain properties of the existing project-wide MaterialDefinition. WD-26C adds validated application operations and Inspector controls for these existing properties rather than introducing a second material state.

All three values use the normalized numeric range `0..1`. Non-finite values and values outside this range are rejected without mutating the MaterialDefinition.

## Shared / Local Variant contract

The WD-26A MaterialDefinition / MaterialBinding authority remains unchanged.

- editing a shared MaterialDefinition propagates through the existing binding resolution to every object using that definition;
- editing a local material variant changes only the copied local MaterialDefinition and does not mutate its source shared definition;
- no new binding or selection authority is introduced.

## Undo / Redo contract

Each accepted numeric property edit uses the existing project snapshot/history path and contributes one history transition. The focused regression verifies before/after history snapshots for the opacity edit. No separate material-specific Undo/Redo stack exists.

## Save -> Reload contract

WD-26C adds no persistence format. The numeric PBR values already belong to MaterialDefinition properties. Focused regression verifies shared and local-variant values survive JSON Save -> Reload through the existing migration/validation path together with the local MaterialBinding.

## Rendering contract

WD-26C does not change the Three.js rendering architecture. The existing runtime already consumes MaterialDefinition numeric properties when constructing the standard material: metallic maps to Three.js metalness, roughness maps to roughness, and opacity maps to opacity/transparent behavior. WD-26C makes these existing runtime inputs editable through validated product operations and UI controls.

## Verification evidence

Exact functional head verified:

`218c8567e03cef58792f35eda29113c746f57cf6`

GitHub Actions:

- workflow: `WD-26C PBR Numeric Properties`
- run: `#1`
- run id: `37058593362`
- result: `success`

Successful steps:

- Exact head
- Syntax
- WD-26A regression
- WD-26B regression
- WD-26C focused regression

Verification blockers: 0.

## Explicit non-scope

WD-26C introduces no:

- F056 texture workflow or texture binding
- F060 material presets
- F061 material library / Library Registry
- sketch/object/assembly libraries
- new material persistence format
- new selection or binding authority
- rendering or performance optimization

## Freeze decision

The functional WD-26C implementation is frozen at:

`218c8567e03cef58792f35eda29113c746f57cf6`

This completion document is evidence-only and does not redefine the functional freeze head.

Gate-3 integration is permitted only as a linear fast-forward from unchanged `main = b14da1d649cfd571760e2c0034e6000a6d56f87a` through this completion/evidence commit. No additional RB-07 product changes are authorized during integration.
