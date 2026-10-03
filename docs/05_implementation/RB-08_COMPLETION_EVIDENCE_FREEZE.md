# RB-08 – Import / Export Workflow – Completion / Evidence / Freeze

Status: PASS · FROZEN · 0 BLOCKER
Date: 2026-10-03
Functional freeze head: `f15081530ad617beaf67f1d7935173bc5cdea1b8`

## Scope

RB-08 reconciles the complete V2 import/export workflow against the authoritative main state at the functional freeze head above. This completion commit is evidence-only and does not change product behavior.

Covered functions:

- F072 GLB/GLTF Import
- F073 OBJ/STL Import
- F075 GLB/GLTF Export
- F076 OBJ/STL Export
- F077 Export Selection
- F078 Export Assembly
- F079 Project/JSON native data boundary
- F119 Central Export Workflow
- F120 Export Options

## Result

All RB-08 MUST requirements are satisfied at the functional freeze head. No remaining product blocker or mandatory implementation gap was identified.

### Import

GLB/GLTF import remains the existing external-model path. OBJ/STL import is normalized through the RB-08 interchange boundary without inventing native CAD feature history. Imported interchange content remains distinct from native CM3D project semantics.

### Central export workflow

`Datei → Exportieren…` is the single central 3D interchange export entry. GLB, GLTF, OBJ and STL use the shared Export Descriptor / `exportWithDescriptor(...)` authority rather than parallel format-specific workflow authorities.

The shared descriptor carries the supported common decision state:

- `scope`
- `format`
- `fileName`
- `units`
- `scale`
- `transformPolicy`
- `hierarchyPolicy`
- `materialPolicy`

Format adapters may narrow behavior according to actual format capabilities. In particular STL remains geometry-only and does not promise hierarchy or material preservation.

### Selection and assembly export

F077 remains fulfilled by the centralized `selection` scope: selected export roots are exported with their descendants, nested duplicate roots are avoided, and root world transforms are preserved.

F078 does not require a separate `assembly` descriptor scope. An Assembly is already a semantic scene container with normal parent/child hierarchy. Selecting an Assembly as an export root therefore exports its complete supported descendant hierarchy through the same centralized selection workflow. No separate Assembly export authority is required.

### Native project boundary

F079 remains separate from interchange export. `.cm3d.json` is the native project representation and carries native CM3D project semantics. GLB/GLTF/OBJ/STL are interchange formats and are not native project backups. RB-08 does not promise round-trip preservation of format-foreign native feature/history state.

## Evidence carried forward

### WD-27A – Central Export Workflow / Export Descriptor Foundation

Status: PASS · FROZEN
Functional freeze head: `0f5e94f655b55b75816db09f5b57528a488fb49a`
GitHub Actions workflow: `WD-27A Central Export Workflow`
Successful exact-head run: `37112889400`

WD-27A established the single central export entry, shared descriptor, scene/selection scope, GLB/GLTF adapters, explicit units/scale and transform/hierarchy/material policies, plus the native-project boundary communication.

### WD-27B – OBJ/STL Interchange

Status: PASS · FROZEN
Functional freeze head: `8182cf4876036d30fde6e0947f1986a4214aa129`
GitHub Actions workflow: `WD-27B OBJ STL Interchange`
Successful exact-head run: `37116221564`

WD-27B added OBJ/STL import/export through the existing RB-08 interchange authority and retained the WD-27A central-export regression contract.

## F078 / F120 reconciliation

The Gate-1 reconciliation found no separate RB-08 MUST gap for F078 or F120.

F078 is satisfied by the existing semantic Assembly object plus centralized selection-with-descendants export behavior. Creating another assembly-only export path would duplicate authority without adding a required capability.

F120 is satisfied by the current shared descriptor and format-specific adapter policies. Additional unit choices, arbitrary scale controls or further format-specific switches are not required by the current RB-08 MUST contract and are not invented by this freeze.

## RB-08 Gate

PASS criteria are met:

- all supported 3D interchange export formats use the same central export workflow;
- selection and Assembly export are covered without parallel export authorities;
- import/export does not invent native feature history for foreign formats;
- format adapters only promise semantics supported by the target format;
- native CM3D project persistence remains clearly separate from interchange formats;
- WD-27A and WD-27B exact-head verification evidence is successful;
- no remaining RB-08 MUST blocker was found.

## Freeze

RB-08 Import / Export Workflow is complete and frozen.

Functional RB-08 freeze head:

`f15081530ad617beaf67f1d7935173bc5cdea1b8`

This documentation commit is evidence-only. It does not redefine the functional freeze head and introduces no new product function.

RB-08: PASS · FROZEN · 0 BLOCKER.
