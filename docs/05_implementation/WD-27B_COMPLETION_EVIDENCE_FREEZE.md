# WD-27B – RB-08 OBJ/STL Interchange – Completion / Evidence / Freeze

Status: PASS · FROZEN
Date: 2026-10-03
Authorized base: `2df78ac3710af21a690ba39c355ab41ff53eb67e`
Functional freeze head: `8182cf4876036d30fde6e0947f1986a4214aa129`
Feature branch: `feature/WD-27B-obj-stl-interchange`

## Scope

WD-27B closes RB-08 F073/F076 for OBJ/STL interchange on top of the central WD-27A Export Descriptor workflow.

Implemented contract:

- OBJ import through the Three.js OBJ loader path;
- STL import through the Three.js STL loader path;
- imported source data is embedded as project-local interchange source assets instead of retaining external file references;
- imported interchange geometry is represented as normal project-local `external.interchange` objects with deterministic project identity and without invented native CAD/feature history;
- imported OBJ/STL state survives native CM3D Save → Reload through the existing project persistence authority;
- OBJ and STL export are adapters behind the existing WD-27A `exportWithDescriptor(...)` authority;
- `scope = scene | selection` remains the single central export-scope contract;
- the existing descriptor continues to carry file name, units/scale and transform/hierarchy/material policy information;
- the existing single `Datei → Exportieren…` UI is extended with OBJ/STL rather than creating a second export workflow.

## F073 – OBJ/STL import contract

OBJ and STL are treated as interchange geometry, not as native CM3D construction history.

The imported source is copied into project-local embedded asset state. The resulting project object references that project-local authority and therefore does not depend on the original external file after import.

`external.interchange` identifies the imported interchange object class. Import does not fabricate sketches, features, constraints, parametric construction steps or other native CAD semantics that are not present in the source format.

## Save → Reload / project authority

WD-27B does not introduce a second persistence system. Embedded interchange source assets and the resulting project objects use the existing native project persistence path.

After Save → Reload, the imported object remains reconstructable from project-local state. OBJ/STL themselves remain interchange formats and are not native CM3D project backups.

## F076 – OBJ/STL export adapter contract

OBJ and STL extend the WD-27A common Export Descriptor instead of creating parallel export architecture.

The central export workflow remains authoritative for:

- `scope = scene | selection`;
- format selection;
- file name;
- units / scale;
- transform policy;
- hierarchy policy;
- material policy.

OBJ/STL are format adapters behind `exportWithDescriptor(...)`. The legacy WD-27A GLB/GLTF path remains supported by the same authority.

## Units / scale / transform boundary

WD-27B preserves the WD-27A central descriptor boundary. The current interchange workflow remains based on explicit meter/scale information rather than a separate per-format UI authority.

Selection export continues to use the common root/world-transform contract. Format-specific limitations do not create an alternative transform or hierarchy authority.

## Format boundaries

### STL

STL is geometry-only for the WD-27B contract. It does not promise preservation of CM3D materials, object hierarchy, editor state, sketches, features, constraints or native history.

Its descriptor material policy is therefore `geometry-only`.

### OBJ

OBJ export/import preserves only semantics actually supported by the selected OBJ adapter path. WD-27B does not promise native CM3D feature/history round-trip or semantics that OBJ itself does not carry through the adapter.

OBJ therefore remains an interchange representation, not a native project representation.

## WD-27A compatibility reconciliation

During verification, the historical WD-27A regression contained assertions tied to the exact source-code spelling and to WD-27A's then-current exclusion of later formats. These assertions were reconciled on the WD-27B feature branch without changing product behavior.

The corrected regression continues to protect the actual frozen WD-27A contracts:

- one central export workflow;
- common Export Descriptor;
- GLB and GLTF remain accepted formats;
- `scene | selection` remain accepted scopes;
- meter / scale-1 descriptor defaults remain present;
- `exportScene(...)` continues to delegate to `exportWithDescriptor(...)`;
- later authorized format adapters are allowed without redefining WD-27A.

## Verification evidence

Final Exact-Head verification was executed against exactly:

`8182cf4876036d30fde6e0947f1986a4214aa129`

GitHub Actions evidence:

- Workflow: `WD-27B OBJ STL Interchange`
- Run: #10
- Run ID: `37116221564`
- Conclusion: `success`
- Exact head: PASS
- Syntax: PASS
- WD-27A central export regression: PASS
- WD-27B focused OBJ/STL regression: PASS

Runs #2–#9 exposed historical WD-27A assertions that were too tightly coupled to implementation spelling or to the old no-OBJ/STL scope. Their corrections were test-only compatibility reconciliations; the final Run #10 verifies the exact functional freeze head successfully.

## Explicit exclusions

WD-27B does not implement:

- CMO/CMU interchange;
- a second export UI or second export authority;
- a new native project persistence format;
- fabricated CAD/feature history for OBJ/STL;
- a promise that STL carries materials or hierarchy;
- a promise that OBJ carries semantics beyond those actually supported by its adapter.

## Freeze

The functional WD-27B freeze head is permanently recorded as:

`8182cf4876036d30fde6e0947f1986a4214aa129`

The Gate-3 documentation commit is evidence-only and does not redefine the functional freeze head.

WD-27B OBJ/STL Interchange: PASS · FROZEN · 0 BLOCKER.
