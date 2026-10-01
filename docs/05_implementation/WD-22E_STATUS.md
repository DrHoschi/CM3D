# WD-22E – Sketch → Planar Face Binding Foundation

Status: **PASS / FROZEN / 0 BLOCKER**

## Authoritative heads

- Authorized base: `4c7422943bf5c90b70afb692a1f1d1b68ff48a3a`
- Functional freeze: `287949d6334ec643b0d4a6ec87cd96a3d96f8d44`
- Exact-head CI: `36897729824` — **SUCCESS**
- Branch: `feature/WD-22E-sketch-planar-face-binding`

## Scope

WD-22E extends the existing WD-22B sketch plane binding contract from `WORK_PLANE` to exactly `WORK_PLANE | PLANAR_FACE` without introducing a second sketch type, a second persisted plane authority, or a new binding mutation authority.

The verified functional diff against the authorized base is limited to exactly five files:

- `.github/workflows/wd-21e-identity-reference-foundation.yml`
- `src/application/dependency-graph.js`
- `src/application/sketch-plane-binding.js`
- `src/model/sketch-topology.js`
- `tests/wd-22e-sketch-planar-face-binding.mjs`

At functional freeze the branch is six commits ahead, zero behind, with merge-base exactly equal to the authorized base.

## Binding contract

`sketch.data.planeRef` remains the single persistent sketch-plane binding authority.

Supported bound reference kinds are exactly:

- `WORK_PLANE`
- `PLANAR_FACE`

Sketches without `planeRef` retain the existing `LEGACY_LOCAL_XY` behavior.

No separate `faceRef`, copied face frame, or alternative sketch persistence path is introduced.

## Dynamic frame derivation

Both supported plane reference kinds converge on a common plane-definition/frame path based on `origin`, `normal`, and `xAxis`.

For `PLANAR_FACE`, the definition is resolved through the WD-22D planar-face authority. `CAP_START` and `CAP_END` therefore remain semantic stable references while their derived frame may move when the owning extrusion recomputes.

The sketch does not persist a copied face position or frame. A changed extrusion depth can therefore move the derived face-bound sketch frame without changing the persisted stable reference.

## Dependency and cycle contract

The existing sketch plane dependency edge is generalized to a neutral plane-reference-to-sketch dependency. WD-22D already projects `PLANAR_FACE` through its owning extrusion, so a face-bound sketch depends on that extrusion owner.

The existing dependency graph and cycle detection remain authoritative. WD-22E does not add a second cycle engine or a new mutation API.

Direct or indirect dependency loops are rejected/blocked by the existing cycle contract. A future productive command that writes a new face binding must validate the prospective dependency before persisting `sketch.data.planeRef`.

## Resolution and blocked-state behavior

A valid resolved planar face produces a sketch frame. Missing, invalid, or blocked upstream face ownership does not fall back to a stale persisted face frame.

The existing stable-reference and dependency-state semantics remain authoritative for `RESOLVED`, `MISSING`, `INVALID`, and `BLOCKED` behavior.

## Persistence / Save → Reload evidence

The focused WD-22E regression verifies that a `PLANAR_FACE` reference stored in `sketch.data.planeRef` survives project serialization and reload without introducing a schema change or alternate persistence authority.

After reload the frame is derived again from the referenced planar face rather than restored from duplicated derived geometry.

## Regression evidence

Exact-head GitHub Actions run `36897729824` executed against exactly `287949d6334ec643b0d4a6ec87cd96a3d96f8d44` and completed with **SUCCESS**.

The job passed the complete configured regression chain from WD-20A through WD-22D and the new `WD-22E sketch planar face binding regression`.

Verification result: **PASS / 0 BLOCKER**.

## Explicit exclusions

WD-22E does not implement:

- viewer/UI face picking or hover/highlight,
- a new sketch-on-face creation command,
- offset/free/geometric work planes,
- side-face identity,
- edge/vertex topological naming,
- snap or align,
- measurement or dimensioning,
- extrusion/profile-consumer redesign,
- RB-04 modeling functionality.

These remain later blocks and must not be inferred as part of the WD-22E freeze.

## Freeze decision

The functional head `287949d6334ec643b0d4a6ec87cd96a3d96f8d44` is accepted as the immutable WD-22E functional freeze because the authorized scope is preserved, the focused binding/persistence/dependency/cycle contract is covered, and the exact-head regression CI is green.

This document is completion/evidence metadata only. It does not alter the verified functional freeze.

**WD-22E: PASS / FROZEN / 0 BLOCKER.**
