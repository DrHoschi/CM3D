# WD-22I – Reference-Aware Align Foundation

Status: PASS / FROZEN / 0 BLOCKER

## Authoritative basis

- Base main: `0a272f66578ced56a946409ea1716aefba2b969e`
- Functional freeze head: `64875e90974dd94c7a1a1a3e5bd4829a3601d585`
- Exact-head CI: `36911632797` – completed / success
- Branch: `feature/WD-22I-reference-aware-align-foundation`

## Scope

WD-22I adds the first mutation-capable consumer of the shared RB-03 Reference Geometry foundation while keeping the operation deliberately narrow: translation-only alignment of a stable `SKETCH_POINT` source to an existing POINT, LINE, or PLANE target.

Functional implementation scope:

- `src/application/reference-geometry.js` – neutral inverse World -> Sketch-Local conversion required to commit a world-space align target back into sketch coordinates.
- `src/application/reference-align.js` – ephemeral reference-aware align calculation and controlled sketch-point commit.
- `tests/wd-22i-reference-aware-align-foundation.mjs` – focused contract/regression evidence.
- `.github/workflows/wd-21e-identity-reference-foundation.yml` – minimal WD-22I exact-head CI integration.

No SceneObject align, rotation, scale, pivot change, Camera Alignment behavior, persistent align relation, dependency, mate/assembly relation, constraint, persistent dimension, new EDGE/VERTEX topology, finished picking/UI, or RB-04 behavior is introduced.

## ReferenceAlignResult contract

The WD-22I result is ephemeral application state for a one-shot translation. It carries the source and target references, resolved source world position, resolved target world position, and the required world-space translation.

The translation contract is:

`translationWorld = targetPositionWorld - sourcePositionWorld`

The result does not contain or persist Euler rotation, quaternion rotation, scale, pivot, mate, dependency, or constraint semantics.

## Source contract

The only mutable source kind in WD-22I is `SKETCH_POINT`.

`CONSTRUCTION_AXIS`, `WORK_PLANE`, and `PLANAR_FACE` are not mutable align sources in this foundation. They may participate only through the target geometry resolved by the shared Reference Geometry layer.

This prevents WD-22I from inventing an implicit owner/object mutation contract for axes, planes, faces, or SceneObjects before a stable source-reference contract exists for those cases.

## Target contract

A `SKETCH_POINT` may align to any target that resolves through the existing neutral Reference Geometry authority to:

- POINT – target position is the resolved point.
- LINE – target position is the orthogonal projection of the source point onto the infinite line/construction axis.
- PLANE – target position is the orthogonal projection of the source point onto the work plane or planar face.

The foundation therefore supports Point -> Point, Point -> Line, and Point -> Plane translation only.

LINE -> LINE and PLANE -> PLANE rotational alignment remain outside WD-22I.

## World -> Sketch-Local conversion

Align calculation is performed in world space because the shared stable-reference geometry is resolved in world space.

A sketch point, however, is persisted in the local coordinate system of its sketch/work-plane frame. WD-22I therefore extends the neutral Reference Geometry authority with the inverse conversion needed to map the desired world-space target position back into the existing sketch-local `(x, y)` representation.

The conversion uses the same frame/transform authority as forward sketch-point geometry resolution, including WORK_PLANE / PLANAR_FACE frames and the existing transform fallback. This avoids a second geometry authority in Align or UI code.

## Mutation / history contract

WD-22I does not write sketch topology directly and does not create a new history authority.

A real alignment change is committed exclusively through the existing `runSketchMutation()` transaction boundary. The operation therefore participates in the established sketch validation/history/recompute contract and produces at most one history entry for one successful align mutation.

If the source already lies on the target within the foundation's no-op condition, no sketch mutation is committed and no history entry is created.

The target reference is never mutated.

## Locking contract

The owner sketch remains subject to the existing object/sketch locking boundary. A locked source owner may be resolved/read for calculation, but the align commit is rejected and must not mutate sketch data or history.

WD-22I does not bypass the established locking authority.

## Failure and degeneracy behavior

No fallback target is silently substituted.

Missing, invalid, blocked, unresolved, unsupported, or geometrically invalid source/target references produce no valid align commit. Unsupported source kinds remain non-mutable. Failure of World -> Sketch-Local conversion also prevents mutation.

No rotation, scale, pivot, dependency, constraint, or persistent align relation is synthesized as a recovery behavior.

## Focused regression corrections

Two focused corrections were required during exact-head verification. Both were test-fixture corrections only and did not change production behavior or expand the authorized scope.

### GLOBAL_X fixture correction

The initial WD-22I test used a non-authoritative system-construction owner identifier for the `GLOBAL_X` reference. The fixture was corrected to use the existing `SYSTEM_CONSTRUCTION_OWNER_ID` authority. No Reference Geometry or Align production code was changed for this correction.

### WORK_PLANE fixture correction

The initial `plane-a` fixture did not conform to the already frozen WORK_PLANE persistence/reference contract. It was corrected to use `ConstructionReferenceObjectType.WORK_PLANE`, the matching persistent `workPlaneId`, and a valid persisted frame definition containing origin, normal, and xAxis.

Again, production behavior and the WD-22I align contract remained unchanged.

## Compatibility boundaries

WD-22I is independent from the existing WD-21C.8-R2 Selection Camera Alignment. Camera Alignment is not reused or modified.

WD-22G Snap and WD-22H Measurement remain independent consumers of the same shared Reference Geometry authority. WD-22I adds mutation only through its own one-shot align contract; it does not import snap ranking/tolerance or measurement semantics.

## Verification / evidence

Exact-head verification was performed against functional head `64875e90974dd94c7a1a1a3e5bd4829a3601d585` and original authorized base `0a272f66578ced56a946409ea1716aefba2b969e`.

Repository comparison confirmed a linear history: 6 commits ahead, 0 behind, with merge base exactly at the authorized base. The complete diff remained restricted to the four authorized files:

- `.github/workflows/wd-21e-identity-reference-foundation.yml`
- `src/application/reference-align.js`
- `src/application/reference-geometry.js`
- `tests/wd-22i-reference-aware-align-foundation.mjs`

GitHub Actions run `36911632797` is tied exactly to functional head `64875e90974dd94c7a1a1a3e5bd4829a3601d585` and completed successfully.

The complete regression chain from WD-20A through WD-22H passed, including WD-22G Reference-Aware Snap and WD-22H Reference-Aware Measurement. `Run WD-22I reference-aware align foundation regression` also completed successfully.

Verification result: PASS / 0 BLOCKER.

## Freeze decision

WD-22I is FROZEN at functional head `64875e90974dd94c7a1a1a3e5bd4829a3601d585`.

This documentation commit is evidence-only and must not change the functional freeze. Integration to `main` requires a separate read-only Integration Reconciliation followed by separately authorized fast-forward integration.
