# WD-27A – RB-08 Central Export Workflow / Export Descriptor Foundation – Completion / Evidence / Freeze

Status: PASS · FROZEN
Date: 2026-10-03
Authorized base: `2f80ca925efcb5fd28be9a5d05e5bb63b2fda69c`
Functional freeze head: `0f5e94f655b55b75816db09f5b57528a488fb49a`
Feature branch: `feature/WD-27A-central-export-workflow-descriptor`

## Scope

WD-27A establishes the central RB-08 export workflow foundation without adding OBJ/STL support.

Implemented contract:

- exactly one `Datei → Exportieren…` entry for 3D interchange export;
- one shared Export Descriptor used by the export UI and interchange adapter;
- `scope = scene | selection` within the same workflow;
- `format = glb | gltf` as the first supported adapter formats;
- export file name is part of the descriptor;
- units are explicitly `m` and scale is explicitly `1` for the current GLB/GLTF adapter;
- root world transforms are preserved for selection export;
- descendants/hierarchy are preserved according to the existing GLB/GLTF export behavior;
- materials use the capabilities of the existing GLB/GLTF adapter;
- the existing GLB/GLTF exporter remains the implementation adapter behind the descriptor instead of creating a second export authority;
- the legacy `exportScene(...)` API delegates into the shared descriptor path for compatibility;
- the UI explicitly states that GLB/GLTF is an interchange format and not a native CM3D project backup.

## Export Descriptor contract

The WD-27A descriptor contains the common export decision state required by the current adapter:

- `scope`
- `format`
- `fileName`
- `units`
- `scale`
- `transformPolicy`
- `hierarchyPolicy`
- `materialPolicy`

The descriptor is format-independent workflow state. GLB/GLTF is the first adapter consuming it. Future RB-08 formats must extend or map this common contract rather than creating parallel menu/workflow authorities.

## Scope contract

`scene` exports the complete renderable model scene through the existing GLB/GLTF path.

`selection` exports the selected root objects plus their descendants. When both a parent and one of its descendants are selected, the descendant is not duplicated as a second export root. Export roots preserve their world transform.

Sketch/editor helper geometry and native editor-only state remain excluded from GLB/GLTF interchange export.

## Units / scale

The current GLB/GLTF adapter contract is explicit: meters with scale `1`. WD-27A does not silently convert to display units. Unsupported descriptor unit/scale combinations are rejected rather than being interpreted differently by separate export paths.

## Transform / hierarchy / material policy

WD-27A records the current supported policy in the descriptor:

- transform: `preserve-world-root-transform`;
- hierarchy: `preserve-descendants`;
- materials: `adapter-supported`.

This makes the current behavior explicit and provides the common boundary needed for later format adapters.

## Native project boundary

GLB and GLTF are interchange formats. They are not CM3D project backups and do not replace the native project persistence format.

Native project concepts such as editor helpers, Sketch state and native feature/history semantics are not promised to round-trip through GLB/GLTF.

## Verification evidence

Final Exact-Head verification was executed against exactly:

`0f5e94f655b55b75816db09f5b57528a488fb49a`

GitHub Actions evidence:

- Workflow: `WD-27A Central Export Workflow`
- Run: #2
- Run ID: `37112889400`
- Conclusion: `success`
- Exact head: PASS
- Syntax: PASS
- WD-27A focused GLB/GLTF regression: PASS

Run #1 was blocked by a workflow reference to a historical/non-existent GLB/GLTF test file. The workflow-only blocker was corrected without changing product behavior; Run #2 verifies the corrected exact head successfully.

## Explicit exclusions

WD-27A does not implement:

- OBJ import;
- STL import;
- OBJ export;
- STL export;
- a second export workflow;
- replacement of the native CM3D project format.

Those remain subsequent RB-08 work built on this shared descriptor/workflow foundation.

## Freeze

The functional WD-27A freeze head is permanently recorded as:

`0f5e94f655b55b75816db09f5b57528a488fb49a`

The Gate-3 documentation commit is evidence-only and does not redefine the functional freeze head.

WD-27A Central Export Workflow / Export Descriptor Foundation: PASS · FROZEN · 0 BLOCKER.
