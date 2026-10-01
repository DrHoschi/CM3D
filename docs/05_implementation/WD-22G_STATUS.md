# WD-22G – Reference-Aware Snap Foundation

Status: PASS / FROZEN / 0 BLOCKER

## Authoritative basis

- Base main: `5667b9f930b27ee83313fd73f37bd5e19ab10105`
- Functional freeze head: `525860252a58c18b6c2892590f9501c93cb170da`
- Exact-head CI: `36906227601` – completed / success
- Branch: `feature/WD-22G-reference-aware-snap-foundation`

## Scope

WD-22G introduces the first reference-aware snap consumer foundation on top of the stable RB-03 reference system without creating new persistent identities, dependencies, constraints, alignment operations, measurement/dimension behavior, EDGE/VERTEX topological naming, or general TransformControls integration.

Functional implementation scope:

- `src/application/reference-snap.js` – new ephemeral reference-snap authority.
- `src/ui/sketch-gizmo.js` – minimal first consumer integration.
- `tests/wd-22g-reference-aware-snap-foundation.mjs` – focused contract/regression evidence.
- `.github/workflows/wd-21e-identity-reference-foundation.yml` – minimal WD-22G CI integration.

Focused regression-contract correction:

- `tests/wd-21c5-generic-sketch-manipulation-contract.mjs` – removed obsolete coupling to the historical WD-21C.5 gizmo version while preserving the actual WD-21C.5 behavioral assertions.

## Reference-snap contract

Reference-aware snap is an ephemeral geometric consumer layer over stable references. It does not persist a snap relation and does not create a CAD dependency or constraint.

The foundation accepts the existing stable reference targets needed by the reconciled scope:

- `SKETCH_POINT` -> point geometry
- `CONSTRUCTION_AXIS` -> line geometry
- `WORK_PLANE` -> plane geometry
- `PLANAR_FACE` -> plane geometry

No new EDGE or VERTEX reference kind is introduced. PROFILE/PATH are not treated as direct snap targets in this foundation because they do not identify one unique snap position by themselves.

## Candidate / result / ranking contract

Snap candidates and results are runtime interaction state only. Candidate resolution is deterministic and uses stable-reference-backed geometry rather than geometry-nearness as a source of persistent identity.

Geometry priority is:

1. POINT
2. LINE
3. PLANE
4. existing grid/step snap as fallback

A reference candidate wins only within the supplied tolerance. Equal geometry kinds are resolved by geometric distance and deterministic reference ordering. Moving/self references can be excluded so an edited sketch point cannot snap to itself.

Missing, invalid, blocked, or otherwise unresolved stable references do not become valid snap candidates.

## Sketch-gizmo consumer and grid fallback

The sketch gizmo is the first and only manipulation consumer in WD-22G. Reference-aware snap is evaluated from the raw manipulation target before the existing grid/step rounding. If no eligible reference candidate is available within tolerance, the pre-existing grid/step snap behavior remains authoritative.

The snap layer does not mutate the project. The existing sketch manipulation path remains responsible for preview and commit, and `runSketchMutation()` remains the central commit authority.

General object TransformControls, WORLD/LOCAL object-transform integration, UI expansion, Align, measurement/dimensioning, and constraints remain outside WD-22G.

## Focused Regression Contract Correction

Initial exact-head verification exposed a red CI before the WD-22G test because `tests/wd-21c5-generic-sketch-manipulation-contract.mjs` statically required the historical gizmo version `WD-21C.5`.

The focused correction changed only that regression contract: the obsolete version assertion was removed while the actual WD-21C.5 behavioral guarantees remained intact, including supported manipulation kinds, circle behavior, central `runSketchMutation()` commit path, cancel/restore behavior, and scope exclusions. No WD-22G production behavior was changed by this correction.

## Verification / evidence

Exact-head verification was performed against functional head `525860252a58c18b6c2892590f9501c93cb170da` and original authorized base `5667b9f930b27ee83313fd73f37bd5e19ab10105`.

Repository comparison confirmed a linear history from the authorized base with no behind commits. The productive WD-22G scope remained bounded to the reconciled implementation files plus the focused WD-21C.5 regression-contract correction.

GitHub Actions run `36906227601` is tied exactly to functional head `525860252a58c18b6c2892590f9501c93cb170da` and completed successfully. The full regression chain from WD-20A through WD-22F passed, the corrected WD-21C.5 regression passed, and `Run WD-22G reference-aware snap foundation regression` passed.

Verification result: PASS / 0 BLOCKER.

## Freeze decision

WD-22G is FROZEN at functional head `525860252a58c18b6c2892590f9501c93cb170da`.

This documentation commit is evidence-only and must not change the functional freeze. Integration to `main` requires a separate read-only Integration Reconciliation followed by separately authorized fast-forward integration.
