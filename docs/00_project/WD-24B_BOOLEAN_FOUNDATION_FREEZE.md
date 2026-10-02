# WD-24B – F052 Boolean Foundation – Completion / Evidence / Freeze

Status at functional head: PASS / 0 BLOCKER

## Authoritative basis

- Authorized base: `main = b6818fde0cd94599a67296e99daa6ee743196b96`
- Functional Exact Head: `f8ad2b333ee48ffcbac714f6c6f38c0ba025c467`
- Branch: `feature/WD-24B-boolean-foundation`
- RB-05 feature: F052 Boolean Foundation

## F052 contract

WD-24B introduces `feature.boolean` with exactly three operations:

- `UNION`
- `SUBTRACT`
- `INTERSECT`

The foundation accepts exactly two stable body-output operands. It does not introduce N-operand Boolean groups or a second Body authority.

## Operand identity and authoritative order

The two operands are stored as stable `FEATURE_OUTPUT` references:

- `targetRef`
- `toolRef`

Their order is authoritative and persisted. In particular:

`SUBTRACT = targetRef - toolRef`

The operands are not sorted or implicitly exchanged. UNION and INTERSECT retain the same stored order for deterministic persistence and recompute behavior.

## Dependencies and result ownership

The Boolean feature declares exactly two Feature-Output dependencies:

- `TARGET_BODY_TO_BOOLEAN`
- `TOOL_BODY_TO_BOOLEAN`

Both consume the WD-24A `FEATURE_OUTPUT` authority. The Boolean feature itself owns its deterministic `body-output`, allowing later RB-05 modifiers to consume the Boolean result through the same feature-output contract.

No direct persistent Three.js Mesh reference is introduced.

## Mesh-CSG runtime

The productive runtime uses a real mesh-CSG evaluator rather than a bounding-box approximation. The runtime adapter maps:

- UNION → ADDITION
- SUBTRACT → SUBTRACTION
- INTERSECT → INTERSECTION

and evaluates the ordered target/tool brushes through the CSG evaluator.

Bounding-volume computation on the completed CSG result is permitted for normal geometry metadata. It is not used to implement the Boolean operation itself.

## BLOCKED / recovery

Both operands are resolved through the existing StableReference / Feature-Output contract.

If an upstream feature output is missing, invalid or blocked, the Boolean feature must not expose a stale replacement result as valid. The focused regression proves BLOCKED propagation from an upstream feature output and recovery to READY after that source becomes valid again.

## Save → Reload

The persisted Boolean feature state contains:

- operation;
- `targetRef`;
- `toolRef`.

The focused regression serializes and reloads the project representation and verifies preservation of operation and both StableReferences.

## Undo / Redo

Boolean creation and operation changes use the existing store snapshot/history authority. WD-24B introduces no second Boolean-specific history system.

The focused regression verifies the history labels and before/after state required for Undo/Redo of the Boolean operation.

## Productive integration

The Boolean Application foundation is installed exactly once through the existing application primitive-family chain.

The Boolean runtime is installed exactly once through the existing Three runtime primitive-family chain.

The prior geometry chain remains authoritative; F052 extends it rather than replacing Extrude, Revolve, Sweep, Loft or Primitive Family contracts.

## Focused-test correction

Gate-2 Run #1 failed only because the first negative test rejected every occurrence of `boundingBox` / `Box3`, including legitimate bounding-volume calculation on the finished CSG result.

The correction narrowed the negative contract to reject actual Box3/bounds-based Boolean substitutes while retaining positive assertions for the real CSG kernel and evaluator.

No product code or F052 contract was weakened by this correction.

## Final functional scope

Exactly six files differ from the authorized base at the functional head:

1. `.github/workflows/wd-24b-boolean-foundation.yml`
2. `src/application/boolean.js`
3. `src/application/primitive-family.js`
4. `src/runtime-three/boolean.js`
5. `src/runtime-three/primitive-family.js`
6. `tests/wd-24b-boolean-foundation.mjs`

The two primitive-family files contain only the minimal productive installation hooks.

## Exact-head verification evidence

GitHub Actions:

- Workflow: `WD-24B Boolean Foundation`
- Run: `#2`
- Run ID: `36984655024`
- Exact Head: `f8ad2b333ee48ffcbac714f6c6f38c0ba025c467`
- Conclusion: `success`

Verified steps:

- Boolean Application syntax: PASS
- Boolean Runtime syntax: PASS
- Application integration syntax: PASS
- Runtime integration syntax: PASS
- WD-23F regression: PASS
- WD-24A regression: PASS
- focused WD-24B Boolean Foundation regression: PASS

Final Gate-2 result: `PASS / 0 BLOCKER`.

## Linearity

Before Gate-3 documentation, `main` was rechecked and remained exactly:

`b6818fde0cd94599a67296e99daa6ee743196b96`

The functional head is linear from this base:

- 10 commits ahead;
- 0 commits behind;
- merge-base equals the authorized main.

## Out of scope / RB-05 continuation

WD-24B deliberately does not implement:

- N-operand or grouped Boolean features;
- feature-chain UI or drag/reorder UX;
- F053/F102 Bevel/Fillet;
- stable EdgeRef foundation;
- F033 Mirror;
- F103/F104 Linear/Radial Pattern;
- general CAD-kernel replacement.

These remain later RB-05 work.

## Freeze decision

`WD-24B = PASS / FROZEN / 0 BLOCKER` at functional Exact Head `f8ad2b333ee48ffcbac714f6c6f38c0ba025c467`.

The documentation commit may be integrated together with the functional commits by linear fast-forward, provided `main` remains the authorized base.
