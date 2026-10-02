# WD-23G – F044 Extrude V2 Completion – Completion / Evidence / Freeze

Status: PASS / FROZEN / 0 BLOCKER

## Authoritative basis

- Integration base: `main = 21650871171e0e3d346ee90b21c49488d941d3c8`
- Final verified functional head: `58d70588f30d1b4d6989c79c8ea2fbf9f0c88bc5`
- Verification: GitHub Actions run `36981885670` / run #3, conclusion `success`.

## Purpose

WD-23G closes the remaining F044 Extrude V2 evidence/boundary gap identified during the RB-04 completion reconciliation. No new productive Extrude implementation was required: the repository already contained the required multi-profile and direction/reverse behavior. WD-23G makes that existing authority explicit and regression-protected without pulling RB-05 Boolean semantics forward.

## Multi-profile authority

Multi-profile Extrude remains owned by the existing WD-23A PROFILE-reference contract:

- `sourceProfileRefs` accepts multiple stable PROFILE references;
- the application recompute resolves the referenced profiles into `data.profiles`;
- the runtime consumes `data.profiles` and builds the corresponding Extrude shapes;
- the existing WD-23A regression continues to prove two-profile behavior.

WD-23G does not create a second multi-profile implementation or persistence authority.

## Direction / Reverse contract

The existing productive Extrude parameter path is authoritative:

- valid direction values are `positive`, `negative`, and `symmetric`;
- newly created F044 Extrudes start deterministically as `positive`;
- direction changes are performed through the existing Extrude parameter mutation path;
- the mutation updates `object.data.direction`, participates in the existing history mechanism, and emits `geometryChanged`;
- the Three.js Extrude runtime interprets `negative` and `symmetric` deterministically.

Therefore Reverse is a parameter-state change within F044 rather than a separate geometry feature or a second object type.

## Add/Subtract boundary

The RB-04 roadmap wording mentions Add/Subtract in the F044 area, while RB-05/F052 owns Boolean operations and feature-chain semantics. WD-23G resolves that overlap explicitly:

- F044 does not introduce a Boolean/CSG execution engine;
- no target-body reference, union, difference, or subtract execution is added to Extrude;
- Add/Subtract as body-combination semantics remain reserved for RB-05/F052;
- WD-23G regression guards this boundary against accidental Boolean execution being introduced into the Extrude application/runtime contract.

This boundary avoids duplicating or prematurely implementing the RB-05 Boolean authority merely to satisfy ambiguous roadmap wording.

## Persistence / recompute / history

WD-23G introduces no new persistence, recompute, dependency, or history subsystem. Existing WD-23A PROFILE StableReferences, Extrude recompute behavior, project persistence, and history remain authoritative. Direction is persisted as part of the existing Extrude object data.

## Final functional scope

The verified functional branch diff against the authoritative base contains exactly two files:

1. `.github/workflows/wd-23g-extrude-v2-completion.yml` – focused Exact-Head verification workflow.
2. `tests/wd-23g-extrude-v2-completion.mjs` – focused F044 completion/boundary regression.

No productive source file differs from the integration base for WD-23G.

## Verification evidence

Exact verified functional head: `58d70588f30d1b4d6989c79c8ea2fbf9f0c88bc5`.

GitHub Actions run `36981885670` / #3 completed successfully on that exact SHA. The following checks passed:

- Syntax Extrude application – PASS
- Syntax Extrude runtime – PASS
- Syntax Extrude inspector – PASS
- WD-23A Extrude V2 multi-profile regression – PASS
- WD-23G Extrude V2 Completion – PASS

Two earlier focused-test failures were false positives in the Add/Subtract boundary assertion. They were corrected without changing productive code. The final boundary test distinguishes native JavaScript `Boolean`/ordinary identifiers from actual CSG/Boolean geometry execution.

## Out of scope

Explicitly outside WD-23G:

- Boolean/CSG execution;
- target-body selection/reference;
- union/difference/subtract body modification;
- general feature-chain ordering/evaluation;
- RB-05/F052 implementation;
- changes to Thin Extrude, Revolve, Sweep, Loft or primitive families.

## Freeze

WD-23G is complete and frozen at PASS / 0 BLOCKER. F044 multi-profile and direction/reverse are now explicitly regression-protected, while Add/Subtract body-combination semantics remain an explicit RB-05/F052 responsibility.
