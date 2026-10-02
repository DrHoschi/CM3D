# WD-24F – F105 Feature / Dependency Structure – Completion / Evidence / Freeze

## Status
PASS / FROZEN – Gate 3 completion evidence prepared for linear integration.

## Authorized base
- main: `df42cfa637cda8066ccae1b55cf335b6ee83c540`
- functional Exact Head: `13b8785322ce7e1238db8b182d0af9f0cd6b1103`
- GitHub Actions evidence: WD-24F Feature Dependency Structure Run #2, run id `36989090439`, completed / success.

## F105 contract
WD-24F exposes the already authoritative dependency structure as a read-only user-facing projection. It does not create a second dependency graph, feature-chain store or persistence authority.

The visible structure is deliberately minimal:
- immediate source dependencies → selected feature → immediate dependent features;
- dependency kind;
- object name and type;
- current READY / BLOCKED / INVALID / MISSING-style state as supplied by the existing graph/recompute authorities.

This satisfies the F105 foundation boundary without introducing a full CAD history tree.

## Existing authorities retained
- `dependency-graph.js` remains the directed dependency authority.
- StableReference / FEATURE_OUTPUT remain the reference authorities.
- Existing feature recompute state remains the state authority.
- Existing project persistence remains unchanged.
- The F105 projection performs no project mutation.

## BLOCKED / recovery
The projection reads current graph/recompute state on demand. An upstream or dependent feature shown as BLOCKED therefore becomes READY in the projection when the authoritative runtime/recompute state recovers; F105 stores no duplicate status.

## Productive integration
`installFeatureDependencyProjection(store)` installs the read-only application projection once. `installFeatureDependencyStructureUI(store, appUI)` installs the minimal visible projection once in the existing object-tree rendering path.

No edit, reorder, history rollback or dependency mutation command is added.

## Functional scope
The final functional branch differs from the authorized base in exactly five files:
1. `.github/workflows/wd-24f-feature-dependency-structure.yml`
2. `src/application/feature-dependency-structure.js`
3. `src/main.js` – minimal productive installation only
4. `src/ui/feature-dependency-structure.js`
5. `tests/wd-24f-feature-dependency-structure.mjs`

The final verification-blocker correction changed only the focused test expectations to the already authoritative Boolean dependency kinds `TARGET_BODY_TO_BOOLEAN` and `TOOL_BODY_TO_BOOLEAN`. Product code and dependency authorities were not changed by that correction.

This freeze document is Gate-3 evidence and intentionally outside the five-file functional scope.

## Verification evidence
Run #2 / `36989090439` verifies exact functional head `13b8785322ce7e1238db8b182d0af9f0cd6b1103` with all steps successful:
- Syntax and imports
- WD-24A regression
- WD-24B regression
- WD-24C regression
- WD-24D regression
- WD-24E regression
- WD-24F focused regression

Result: PASS / 0 BLOCKER.

## Out of scope
WD-24F does not implement a full history tree, drag/drop feature reorder, rollback bar, dependency editing, duplicate graph storage, or additional persistence.

## Freeze decision
F105 Feature / Dependency Structure is complete for the authorized RB-05 foundation scope. Functional Exact Head `13b8785322ce7e1238db8b182d0af9f0cd6b1103` is frozen. This documentation commit forms the complete Gate-3 freeze head and may be integrated only while main remains the authorized base and the branch remains linear / zero-behind.
