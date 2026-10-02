# WD-24E – F103/F104 Linear/Radial Pattern Foundation – Completion / Evidence / Freeze

## Status
PASS / FROZEN – Gate 3 completion evidence prepared for linear integration.

## Authorized base
- main: `00c1b06aefa0f61511d544c7015b35961cad1506`
- functional Exact Head: `9d60ba2b3752f9fd4a3e05b1762141775244a6c9`
- GitHub Actions evidence: WD-24E Pattern Foundation Run #1, run id `36988248751`, completed / success.

## F103 / F104 contract
WD-24E introduces one shared `feature.pattern` application authority with two explicit kinds:
- F103 `LINEAR`: one stable `FEATURE_OUTPUT` source plus direction, count and spacing.
- F104 `RADIAL`: one stable `FEATURE_OUTPUT` source plus stable `CONSTRUCTION_AXIS`, count and angle.

Both variants publish their own stable `body-output`, preserving the WD-24A sequential feature-output chain.

## Deterministic instance contract
Instance order is deterministic. Instance 0 is the unchanged source result. Subsequent linear instances are derived from `direction * spacing * index`. Subsequent radial instances are derived around the resolved construction axis from the authoritative count/angle parameters. Pattern geometry is generated as real runtime geometry rather than represented by a second scene-object authority.

## Dependency / recompute contract
`SOURCE_BODY_TO_PATTERN` is the source dependency for both variants. F104 additionally declares `AXIS_TO_PATTERN`. Missing, unresolved, invalid or upstream-blocked references participate in the existing recompute/BLOCKED and recovery semantics.

## Persistence / history
Source StableReference, F104 axis StableReference and all pattern parameters are persisted as ordinary feature data. Save → Reload preserves them. Creation and parameter changes use the existing store snapshot/history authority and are covered by focused Undo/Redo regression.

## Productive integration
Application installation occurs exactly once through `installPatternFoundation(store)`. Runtime installation occurs exactly once through `installPatternRuntime(runtime)` in the existing geometry chain. No second feature-output, dependency or scene authority is introduced.

## Functional scope
The verified functional Exact Head changes exactly six files relative to the authorized base:
1. `.github/workflows/wd-24e-pattern-foundation.yml`
2. `src/application/pattern.js`
3. `src/application/primitive-family.js` – minimal application integration only
4. `src/runtime-three/pattern.js`
5. `src/runtime-three/primitive-family.js` – minimal runtime integration only
6. `tests/wd-24e-pattern-foundation.mjs`

This freeze document is Gate-3 evidence and intentionally outside the six-file functional scope.

## Verification evidence
Run #1 / `36988248751` verifies exact functional head `9d60ba2b3752f9fd4a3e05b1762141775244a6c9`. Successful steps:
- Syntax and imports
- WD-24A regression
- WD-24B regression
- WD-24C regression
- WD-24D regression
- WD-24E focused regression

Result: PASS / 0 BLOCKER.

## Out of scope
WD-24E does not introduce pattern UI, sketch pattern, variable spacing/angles, multiple source bodies, per-instance overrides, feature reorder UI or a new reference/dependency authority. F105 remains a separate RB-05 block.

## Freeze decision
F103/F104 Pattern Foundation is complete for the authorized RB-05 foundation scope. Functional Exact Head `9d60ba2b3752f9fd4a3e05b1762141775244a6c9` is frozen. This documentation commit forms the full Gate-3 freeze head and may be integrated only while main remains the authorized base and the branch remains linear / zero-behind.
