# RB-04 – Core 2D→3D Features – Completion / Evidence / Freeze

Status: PASS / FROZEN / 0 BLOCKER

## Authoritative basis

- Reconciled and frozen against: `main = 8884b7998d454048c6e04594775285d2caf03d76`
- Roadmap authority: `docs/06_v2_planning/V2_DEVELOPMENT_ROADMAP.md`
- Scope: RB-04 / F044, F098, F099, F100, F101, F047/F048.

## RB-04 roadmap objective

RB-04 establishes the V2-MUSS chain from stable PROFILE/PATH sources to the central 3D creation features while retaining the common reference, dependency, persistence, history, diagnostic and recompute authorities established by the preceding roadmap blocks.

The RB-04 completion reconciliation found no remaining product gap inside that boundary.

## F044 – Extrude V2

Completed through the WD-23A foundation and WD-23G completion/boundary reconciliation.

Authoritative behavior:

- Extrude consumes concrete stable PROFILE references;
- multiple profiles are supported through the existing WD-23A multi-PROFILE authority;
- newly created Extrudes start deterministically with `direction = positive`;
- `positive`, `negative` and `symmetric` form the productive direction/reverse parameter contract;
- parameter mutation participates in the existing history and geometry-change mechanisms;
- PROFILE source changes recompute through the established source-reference/dependency path;
- missing/invalid source conditions use the shared diagnostic/status authorities rather than silent repair.

### Add/Subtract boundary

The RB-04 roadmap text mentions Add/Subtract in the F044 area, while RB-05 explicitly assigns Boolean Union/Subtract/Intersect to F052 and introduces the sequential body/feature-chain authority.

RB-04 therefore freezes the following boundary:

- no separate Boolean/CSG engine is embedded into F044 Extrude;
- no target-body combination semantics are duplicated in Extrude;
- Add/Subtract as body-combination operations are implemented under RB-05/F052;
- WD-23G regression explicitly protects this boundary.

This resolves the roadmap overlap without pre-implementing or duplicating RB-05.

## F098 – Thin Extrude

Completed through WD-23B.

- consumes stable open PATH references;
- supported open-path topology remains under the common PATH identity/source-reference authority;
- parameters and derived geometry remain separated from the source path;
- source edits recompute deterministically;
- invalid/missing/unresolved source states propagate through the shared status/dependency model;
- persistence and Undo/Redo use the existing project/history authorities.

## F099 – Revolve

Completed through WD-23C.

- consumes PROFILE plus stable AXIS/construction-reference authority;
- axis origin/direction and profile-derived spatial data are deterministic;
- direction/angle parameters remain feature parameters rather than source mutation;
- PROFILE and AXIS dependencies participate in recompute and controlled invalidation;
- Save→Reload and Undo/Redo remain within the common authorities.

## F100 – Sweep

Completed and frozen through WD-23D.

- exactly one PROFILE plus one open PATH in the foundation contract;
- supported PATH sources include the reconciled line/arc/spline and connected-open-path cases;
- deterministic path start/direction;
- reproducible base orientation and frame transport without uncontrolled twisting;
- PROFILE→SWEEP and PATH→SWEEP dependencies;
- deterministic recompute and controlled MISSING/INVALID/UNRESOLVED/BLOCKED behavior;
- Save→Reload and Undo/Redo covered by the established authorities.

Scale/twist, variable sections, guide rails and closed sweep loops remain outside the RB-04 Sweep foundation.

## F101 – Loft

Completed and frozen through WD-23E.

- consumes multiple stable PROFILE references;
- explicit authoritative section order;
- deterministic spatial section derivation;
- deterministic ring correspondence for the foundation topology;
- PROFILE_TO_LOFT dependencies and recompute;
- controlled source failure propagation;
- Save→Reload and Undo/Redo through the common authorities.

Guide curves/rails and broader variable-topology loft behavior remain outside this foundation.

## F047/F048 – Primitive family completion

Completed and frozen through WD-23F.

F047:
- existing sphere retained;
- cone completed;
- plane completed.

F048:
- tube completed;
- torus completed.

These primitives are source-independent parametric scene objects. They do not create parallel PROFILE/PATH/AXIS source models or dependency semantics. The productive store/runtime integration is installed exactly once in the established geometry chain.

## Common RB-04 gate evidence

Across the completed WD-23 chain, the RB-04 features use the preceding common V2 authorities rather than local substitutes:

- stable source references/identities;
- dependency/recompute infrastructure;
- shared MISSING / INVALID / UNRESOLVED / BLOCKED status handling where source-driven;
- project persistence;
- Undo/Redo/history;
- productive Three.js runtime integration;
- focused regression coverage.

The final RB-04 reconciliation against `main = 8884b7998d454048c6e04594775285d2caf03d76` found no remaining RB-04 product implementation gap.

## Roadmap gate decision

The RB-04 roadmap gate requires feature sources to remain editable and source changes to recompute deterministically or propagate controlled BLOCKED/INVALID state when a source is no longer valid.

The completed source-driven feature foundations satisfy that contract within their explicitly frozen boundaries. Source-independent primitives do not require source invalidation semantics.

**RB-04 = PASS / FROZEN / 0 BLOCKER.**

## Out of scope / handoff to RB-05

RB-04 does not implement the RB-05 body-modifier and sequential feature-chain authority. The following remain for RB-05:

- F052 Boolean Union/Subtract/Intersect with stable Body sources;
- F053 Bevel portion;
- F102 Fillet with stable EdgeRefs and multi-edge selection;
- F033 Body/Feature Mirror with Plane reference;
- F103 Linear Pattern;
- F104 Radial Pattern;
- F105 visible feature/dependency structure;
- deterministic multi-stage chains such as `Sketch → Extrude → Fillet → Pattern`;
- controlled downstream BLOCKED propagation and repair/recompute after sources become valid again.

## Freeze

RB-04 Core 2D→3D Features is complete and frozen. Further work on Boolean body combination, modifiers, patterns, mirror and sequential feature chains belongs to RB-05 and requires its own Gate-1 repository/roadmap reconciliation from the then-current authoritative `main`.
