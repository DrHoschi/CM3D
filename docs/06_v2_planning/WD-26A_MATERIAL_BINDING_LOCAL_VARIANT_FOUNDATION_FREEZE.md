# WD-26A – Material Binding & Local Variant Foundation – Completion / Evidence / Freeze

Status: FROZEN
Date: 2026-10-02
RB block: RB-07 / WD-26A
Implementation base: `7b94ab3fd4c7e4e7958c4219522e896bf0312b82`
Functional verified head: `468be144e68e25f38b909f798d62eac61c6bdf82`
Branch: `feature/wd-26a-material-binding-local-variant-foundation`

## Scope

WD-26A establishes the RB-07 foundation for explicit MaterialDefinition / MaterialBinding semantics while preserving the existing `materialIds` compatibility path.

Functional files in the WD-26A line:

- `src/application/material.js`
- `src/model/project.js`
- `tests/wd-26a-material-binding-local-variant-foundation.mjs`
- `.github/workflows/wd-26a-material-binding-local-variant-foundation.yml`

## Material contract

### MaterialDefinition

Project materials remain the shared reusable material definitions in the existing project-wide `materials` map. Existing PBR properties and texture references remain owned by those definitions.

### Shared binding

Existing objects that only contain `materialIds` remain valid and are interpreted as shared material bindings. No eager migration is required. Shared definition edits therefore continue to affect every object resolving to the same shared material definition.

### Local variant binding

An object may explicitly carry `materialBinding.mode = "local"`. Creating a local variant copies the current source MaterialDefinition into a new project material, records `sourceMaterialId`, mirrors the effective material in `materialIds[0]` for compatibility, and binds only that object to the local definition.

Subsequent edits to the local definition do not mutate the original shared MaterialDefinition or other objects still bound to it.

## Persistence / history compatibility

- existing `materialIds`-only projects remain valid;
- MaterialBinding validation is additive to the existing project schema contract;
- local bindings and source material identity survive JSON Save -> Reload through the existing migration/validation path;
- local-variant creation and material edits participate in the existing history path for Undo/Redo.

## Verification evidence

Exact functional head verified:

`468be144e68e25f38b909f798d62eac61c6bdf82`

GitHub Actions:

- workflow: `WD-26A Material Binding Local Variant Foundation`
- run: `#1`
- run id: `37056949990`
- result: `success`

Successful steps:

- Syntax
- WD-25A regression
- WD-25B regression
- WD-25C regression
- WD-25D regression
- WD-25E regression
- WD-25F regression
- WD-26A focused regression

Verification blockers: 0.

## Explicit non-scope

WD-26A introduces no:

- material library or shared Library Registry
- sketch/object/assembly library
- texture UI
- broad material preset workflow
- new project persistence authority
- new selection authority
- rendering/performance optimization

## Freeze decision

The functional WD-26A implementation is frozen at:

`468be144e68e25f38b909f798d62eac61c6bdf82`

This completion document is evidence-only and does not redefine the functional freeze head.

Gate-3 integration is permitted only as a linear fast-forward from unchanged `main = 7b94ab3fd4c7e4e7958c4219522e896bf0312b82` through this completion/evidence commit. No additional RB-07 product changes are authorized during integration.
