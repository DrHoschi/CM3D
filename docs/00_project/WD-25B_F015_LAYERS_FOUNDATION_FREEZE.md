# WD-25B – F015 Layers Foundation – Completion / Evidence / Freeze

## Status
PASS / FROZEN / READY FOR LINEAR INTEGRATION

## Authoritative base and verified head
- authorized base: `main = 366505c0d7abddb889798a1ed3f14435a515aa6a`
- verified functional Exact Head: `0236e8efec54d4a66d095665681ef3bb0b4c3074`
- branch: `feature/WD-25B-layers-foundation`
- final Exact-Head evidence: GitHub Actions Run #3 / `36998276430` = SUCCESS

## F015 layer authority
WD-25B introduces the minimal project-level Layer foundation without replacing any existing scene, selection, locking, visibility or dependency authority.

The Layer contract consists of:
- project-owned stable Layer records;
- stable per-object `layerId` assignment;
- deterministic Layer ordering;
- backward-compatible unassigned/default behavior for projects and objects without an explicit Layer assignment.

Layer membership is orthogonal metadata. It is not structural parenting and does not define feature execution order.

## Visibility composition
Existing object visibility remains authoritative at object level. Layer visibility is an additional effective constraint rather than a rewrite of object visibility.

The effective visibility contract therefore composes:
- the existing object visibility flag;
- existing structural parent visibility semantics;
- the assigned Layer's visibility state, when a Layer exists.

Changing Layer visibility does not overwrite an object's own visibility flag.

## Locking composition
Existing object locking remains authoritative at object level. Layer locking adds an effective lock constraint.

An object is effectively locked when either its existing object lock or its assigned Layer lock requires it. Layer locking does not rewrite the object's own `flags.locked` state.

The productive locking path is extended minimally to consult Layer lock state while retaining the pre-existing object-locking behavior.

## Persistence / Save → Reload / Undo / Redo
Layer records and `layerId` membership are part of the normal project state and therefore use the existing project persistence authority. Layer mutations use the existing Store/history path rather than a Layer-specific history stack.

No second persistence authority is introduced.

## Hard architecture boundary
WD-25B freezes the following separation:

**Layer ≠ Scene Parent ≠ Selection ≠ Feature Dependency**

Specifically:
- Layer assignment does not change `parentId`, `rootObjectIds` or structural `order`;
- structural reparenting does not implicitly rewrite `layerId`;
- Layer assignment does not create a new selection identity or selection store;
- Layer assignment does not create, delete or modify feature-dependency edges;
- feature recompute/dependency state does not determine Layer membership.

## Minimal productive operation
WD-25B includes only the minimal Layer-facing application/UI foundation required to create/use Layer records and apply Layer membership/visibility/locking through the existing product authorities.

Out of scope are Layer-based reparenting, Layer-defined feature order, a second selection model, dependency semantics, advanced Layer filters and large-project search/performance work reserved for later RB-06 blocks.

## Verification evidence
GitHub Actions Run #3 / `36998276430` executed against exact functional head `0236e8efec54d4a66d095665681ef3bb0b4c3074` and completed successfully.

Verified steps:
- Syntax: PASS
- WD-24A regression: PASS
- WD-24B regression: PASS
- WD-24C regression: PASS
- WD-24D regression: PASS
- WD-24E regression: PASS
- WD-24F regression: PASS
- WD-24G regression: PASS
- WD-25A regression: PASS
- WD-25B focused regression: PASS

Result: **PASS / 0 BLOCKER**.

## Corrected functional diff
The first Gate-2 verification exposed an excessive diff in `src/model/project.js` and `src/ui/object-locking.js`. Gate 2 therefore remained blocked until both files were restored to their exact authorized-main structure and only the necessary F015 additions were reapplied.

The final verified functional diff against `366505c0d7abddb889798a1ed3f14435a515aa6a` is exactly six files:
1. `.github/workflows/wd-25b-layers-foundation.yml` — added
2. `src/application/layers.js` — added
3. `src/model/project.js` — minimal modification (`+14 / -2`)
4. `src/ui/layers.js` — added
5. `src/ui/object-locking.js` — minimal modification (`+6 / -1`)
6. `tests/wd-25b-layers-foundation.mjs` — added

The verified branch is linear from the authorized base: 8 commits ahead / 0 behind at the functional Exact Head.

## Completion decision
F015 Layers Foundation is complete for the authorized RB-06 scope.

**WD-25B = PASS / FROZEN / 0 BLOCKER.**

This documentation-only commit forms the complete Gate-3 freeze head. Integration is permitted only while `main` remains exactly `366505c0d7abddb889798a1ed3f14435a515aa6a` and the full branch remains linear from that base.
