# WD-22H – Reference-Aware Measurement Foundation

Status: PASS / FROZEN / 0 BLOCKER

## Authoritative basis

- Base main: `3fa7c6113df75d482deb2b7c71fb9dc640329302`
- Functional freeze head: `57730980c29024c974571822ae69e0f2df9542a7`
- Exact-head CI: `36907793168` – completed / success
- Branch: `feature/WD-22H-reference-aware-measurement-foundation`

## Scope

WD-22H introduces a read-only reference-aware measurement foundation over the stable RB-03 reference system and extracts the neutral reference-to-geometry resolution previously embedded in the WD-22G snap consumer into a shared application authority.

Functional implementation scope:

- `src/application/reference-geometry.js` – shared neutral POINT / LINE / PLANE geometry authority.
- `src/application/reference-snap.js` – mechanically changed to consume the shared geometry authority while preserving the frozen WD-22G snap contract.
- `src/application/reference-measurement.js` – new read-only measurement authority.
- `tests/wd-22h-reference-aware-measurement-foundation.mjs` – focused contract/regression evidence.
- `.github/workflows/wd-21e-identity-reference-foundation.yml` – minimal WD-22H exact-head CI integration.

No Viewer/UI, Inspector, persistence/project-schema, dependency-graph, StableReference contract, constraint, Align, persistent Dimension, EDGE/VERTEX topology, or RB-04 behavior is introduced.

## Shared Reference Geometry authority

`reference-geometry.js` is the common neutral geometry layer used by independent consumers. It resolves the existing stable reference kinds required by RB-03 into runtime geometry:

- `SKETCH_POINT` -> POINT
- `CONSTRUCTION_AXIS` -> LINE
- `WORK_PLANE` -> PLANE
- `PLANAR_FACE` -> PLANE

The geometry layer does not contain snap ranking, snap tolerance, grid behavior, measurement formatting, project mutation, persistence, dependency creation, or constraint semantics.

Architectural direction:

StableReference -> Reference Geometry -> independent Snap / Measurement consumers.

This prevents Measurement from depending on Snap and avoids duplicate reference-to-geometry authorities.

## MeasurementResult and units contract

Measurement is an ephemeral read-only query. Results carry a deterministic measurement kind/relation, numeric raw value, unit, source references, validity state, and defined failure reason where applicable.

Internal units are:

- distance: meter
- angle: radian

Display conversion such as mm/cm/m/km or degrees remains outside the mathematical foundation and belongs to a later UI consumer.

Measurement creates no SceneObject, dependency, constraint, history/undo mutation, or persistent Dimension object.

## Distance contract

WD-22H supports the minimal reference-aware distance relations:

- POINT <-> POINT: direct 3D Euclidean distance; identical points validly produce 0 m.
- POINT <-> LINE: shortest orthogonal distance to the infinite construction axis.
- POINT <-> PLANE: absolute shortest normal distance to the work plane or planar face.

The supported relations are symmetric with respect to input ordering.

## Angle contract

WD-22H supports:

- LINE <-> LINE: smallest included orientation-independent angle.
- PLANE <-> PLANE: smallest included angle between plane normals, independent of normal sign.

The normalized result range is 0 through pi/2. Parallel lines or planes are valid and produce 0 rad.

## Invalid and degenerate cases

Measurement never silently substitutes another target and never emits NaN/Infinity as a valid result.

Missing, invalid, blocked, unresolved, unsupported, or geometrically degenerate inputs produce a deterministic invalid result with no numeric measurement value. Zero-length line directions and zero-length plane normals are invalid geometry. Unsupported geometry pairings remain outside this foundation.

No nearest-reference fallback is permitted when stable reference resolution fails.

## WD-22G compatibility

The WD-22G reference-aware snap contract remains functionally unchanged after extraction of the shared geometry authority. Snap remains responsible for its own ephemeral SnapCandidate/SnapResult semantics, POINT > LINE > PLANE ranking, tolerance, self-snap exclusion, target inventory, and existing grid/step fallback.

WD-22H does not import snap ranking, tolerance, candidate, or grid semantics into Measurement. Snap and Measurement are equal independent consumers of shared reference geometry.

## Verification / evidence

Exact-head verification was performed against functional head `57730980c29024c974571822ae69e0f2df9542a7` and original authorized base `3fa7c6113df75d482deb2b7c71fb9dc640329302`.

Repository comparison confirmed a linear history: 5 commits ahead, 0 behind, with merge base exactly at the authorized base. The diff remained within the reconciled WD-22H scope.

GitHub Actions run `36907793168` is tied exactly to functional head `57730980c29024c974571822ae69e0f2df9542a7` and completed successfully. The regression chain from WD-20A through WD-22G passed, including the frozen WD-22G reference-aware snap regression, and `Run WD-22H reference-aware measurement foundation regression` passed.

Verification result: PASS / 0 BLOCKER.

## Freeze decision

WD-22H is FROZEN at functional head `57730980c29024c974571822ae69e0f2df9542a7`.

This documentation commit is evidence-only and must not change the functional freeze. Integration to `main` requires a separate read-only Integration Reconciliation followed by separately authorized fast-forward integration.
