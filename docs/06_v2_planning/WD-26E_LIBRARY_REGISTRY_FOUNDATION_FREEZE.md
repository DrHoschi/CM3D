# WD-26E – Library Registry Foundation – Completion / Evidence / Freeze

Status: FROZEN
Date: 2026-10-02
RB block: RB-07 / WD-26E
Architecture foundation: A10 – Library Registry / Reusable Content
Implementation base: `c7013b843a32abeecfaf61e32bea1a9d6ce7037f`
Functional verified head: `45a8fce74bb20c9f092916339d0aaf1e66c9d27c`
Branch: `feature/WD-26E-library-registry-foundation`

## Scope

WD-26E establishes the shared A10 Library Registry foundation used by later RB-07 reusable-content capabilities. It deliberately provides the common contract only; no product Add/Insert workflow is introduced in this block.

Functional files in the verified WD-26E line:

- `src/application/library-registry.js`
- `tests/wd-26e-library-registry-foundation.mjs`
- `.github/workflows/wd-26e-library-registry-foundation.yml`

## LibraryEntry contract

A LibraryEntry has one stable `libraryEntryId` and the following required contract fields:

- `libraryEntryId`
- `entryKind`
- `name`
- `category`
- `schema`
- `version`
- serialized `payload`

The current entry schema is `cm3d.library-entry`, version `1`. The registry schema is `cm3d.library-registry`, version `1`.

Library entry identity is independent of project object/material/sketch identity. Duplicate `libraryEntryId` values inside one registry are rejected.

## Entry kinds

WD-26E authorizes exactly four initial reusable-content kinds:

- `material`
- `sketch`
- `object`
- `assembly`

The common registry owns metadata and entry identity; the serialized payload remains kind-specific. WD-26E does not flatten the four payload domains into one project model.

## Metadata / schema / version contract

`name` and `category` are mandatory non-empty metadata. `schema` and `version` are mandatory compatibility fields. Unknown entry kinds, unsupported schema/version, missing identity/metadata, or non-object payloads fail validation.

## Payload / copy contract

Library payloads are serialized reusable content. The registry stores an independent structured copy when an entry is added. Caller-owned mutable payload state is therefore not a hidden linked-instance authority.

WD-26E does not yet define the later insertion semantics beyond this boundary. Later material/sketch/object/assembly blocks must explicitly convert/copy a LibraryEntry payload into the corresponding project-owned state.

## Registry operations and validation

The foundation provides:

- empty registry creation;
- LibraryEntry creation with generated stable identity;
- LibraryEntry validation;
- whole-registry validation;
- duplicate-ID rejection;
- entry add;
- entry lookup by `libraryEntryId`;
- filtering by `entryKind` and/or category.

The focused regression covers all four entry kinds, unique identities, required metadata, schema/version validation, independent copied payloads, duplicate rejection and JSON serialization roundtrip.

## Project / asset persistence boundary

The A10 Library Registry is not the native project document and is not a replacement for `project.assets[]`.

- native project state remains authoritative for content already inserted into a project;
- `project.assets[]` remains authoritative for project-owned asset/binary resources such as the WD-26D embedded texture assets;
- the Library Registry stores reusable serialized LibraryEntry payloads and metadata;
- WD-26E introduces no second project persistence authority and no second project asset registry.

Only later Add/Insert operations may create project-owned results from a LibraryEntry. Those results must then participate in the existing project Undo/Redo and Save -> Reload contracts rather than keeping a hidden live dependency on mutable registry payload state.

## Verification evidence

Exact functional head verified:

`45a8fce74bb20c9f092916339d0aaf1e66c9d27c`

GitHub Actions:

- workflow: `WD-26E Library Registry Foundation`
- run: `#1`
- run id: `37060398632`
- result: `success`

Successful verification steps:

- Exact head
- Syntax
- WD-26A regression
- WD-26B regression
- WD-26C regression
- WD-26D regression
- WD-26E focused regression

Verification blockers: 0.

## Explicit non-scope

WD-26E introduces no:

- Add/Insert Library UI
- material preset selection
- material-library application workflow
- sketch-template insertion
- object-library insertion
- assembly-library insertion
- persistent linked geometry instances
- second project persistence format
- second project asset authority

## Freeze decision

The functional WD-26E implementation is frozen at:

`45a8fce74bb20c9f092916339d0aaf1e66c9d27c`

Exact-Head-CI Run #1 (`37060398632`) is the verification evidence for this functional freeze.

This completion document is evidence-only and does not redefine the functional freeze head.

Gate-3 integration is permitted only as a linear fast-forward from unchanged `main = c7013b843a32abeecfaf61e32bea1a9d6ce7037f` through this completion/evidence commit. No Add/Insert UI, preset, sketch/object/assembly insertion, or other RB-07 product extension is authorized during integration.
