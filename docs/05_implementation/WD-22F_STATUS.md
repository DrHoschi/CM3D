# WD-22F – Derived Work Plane Foundation

Status: **PASS / FROZEN / 0 BLOCKER**

## Authoritative heads

- Authorized base: `94636fb21f1bfc4bf513d38cb1d4fdff881b27b1`
- Functional freeze: `9a836a44348eed8e79cc79a0c658800ed3a62dcd`
- Exact-head CI: `36901139204` — **COMPLETED / SUCCESS**
- Branch: `feature/WD-22F-derived-work-plane-foundation`

## Scope

WD-22F extends the existing `WORK_PLANE` foundation without introducing a new reference target kind, schema authority, frame authority, dependency engine, or modeling feature.

The authorized functional scope is limited to:

- `src/model/construction-reference.js`
- `src/model/project.js`
- `src/application/stable-reference.js`
- `src/application/dependency-graph.js`
- `tests/wd-22f-derived-work-plane-foundation.mjs`
- minimal WD-22F CI integration in the existing WD-20/21/22 workflow

## FREE / OFFSET contract

`WORK_PLANE` remains the single plane identity consumed by downstream features.

An explicit/free work plane remains persistently represented by its authoritative frame definition:

- `origin`
- `normal`
- `xAxis`

An OFFSET work plane is persistently represented by derivation data rather than by a copied derived frame:

- derivation kind `OFFSET`
- stable `sourceRef`
- signed `offsetMm`

The permitted OFFSET source kinds are exactly `WORK_PLANE | PLANAR_FACE`.

No separate `OFFSET_PLANE` stable-reference kind is introduced.

## Common work-plane resolution

WD-22F establishes a common work-plane definition resolution path covering system/global, explicit/free, and derived OFFSET planes.

For OFFSET, the source definition is resolved first and the derived origin is calculated from the source origin plus the normalized source normal multiplied by signed `offsetMm`. Orientation is inherited from the source definition.

Derived frames are not persisted as a second authority. Save → Reload therefore reconstructs an OFFSET frame from its stable source reference and derivation parameters.

Recursive work-plane derivation is supported through the same resolution authority rather than through a separate derived-plane subsystem.

## Stable-reference behavior

`ReferenceTargetKind.WORK_PLANE` remains unchanged.

A WORK_PLANE reference is considered usable only when the referenced work plane can currently resolve to a valid definition. Source-resolution failures propagate through the existing stable-reference/dependency semantics rather than falling back to stale derived geometry.

## Dependency and cycle contract

A derived work plane contributes a dependency from its source owner to the derived work-plane object. This allows chains such as:

`Extrude → PLANAR_FACE → OFFSET Work Plane → Sketch`

and:

`Work Plane A → OFFSET Work Plane B → consumer`

The existing dependency graph and cycle authority remain authoritative. WD-22F does not introduce a second cycle engine.

Direct and indirect derived-plane cycles are detected structurally and remain blocked rather than being resolved through stale cached frames.

## Focused Correction

The first WD-22F implementation head was not frozen because:

1. `project.js`, `stable-reference.js`, and especially `dependency-graph.js` contained unintended formatting/compaction diff beyond the intended minimal functional changes; and
2. the focused cycle regression did not initially prove the derived-plane cycle contract.

The Focused Correction restored the affected files to the existing repository style and re-applied only the minimal WD-22F functional changes. It also corrected the cycle-detection interaction so structurally present derived-plane dependency cycles are detected even when recursive resolution already reports the participating source as blocked.

The FREE/OFFSET data contract, work-plane resolution contract, and authorized file scope were not expanded by the correction.

## Verification / regression evidence

Final functional head:

`9a836a44348eed8e79cc79a0c658800ed3a62dcd`

Exact-head GitHub Actions run:

`36901139204`

Result:

**COMPLETED / SUCCESS**

The final verification confirmed:

- authorized scope preserved;
- formatting/compaction noise removed;
- existing WD-20A through WD-22E regression chain green;
- focused WD-22F derived work plane regression green;
- previous derived-plane cycle failure corrected;
- no remaining functional, scope, diff, or CI blocker.

Final Verification result: **PASS / 0 BLOCKER**.

## Explicit exclusions

WD-22F does not implement:

- work-plane creation/editing UI;
- viewer gizmos or face picking;
- snap or align;
- measurement or dimensioning;
- edge/vertex topological naming;
- three-point, edge-angle, curve-normal, tangent, or other advanced geometric plane constructions;
- RB-04 modeling functionality;
- a schema bump;
- a new stable-reference target kind.

## Freeze decision

The functional head `9a836a44348eed8e79cc79a0c658800ed3a62dcd` is accepted as the immutable WD-22F functional freeze because the authorized FREE/OFFSET scope is preserved, common work-plane resolution and dependency/cycle behavior are covered, the Focused Correction removed the identified non-functional diff noise, and Exact-Head CI `36901139204` completed successfully.

This document is completion/evidence metadata only and does not alter the verified functional freeze.

**WD-22F: PASS / FROZEN / 0 BLOCKER.**
