# WD-25A – Scene Hierarchy / Structural Parent Foundation – Completion / Evidence / Freeze

## Status
PASS / FROZEN / READY FOR LINEAR INTEGRATION

## Authoritative base and verified head
- authorized base: `main = 8da02e437f34bc26511b4912d5ebbb7a054e0fe1`
- verified functional Exact Head: `e2f93f01056cd9989c897823e598f2e69b30ea9d`
- branch: `feature/WD-25A-scene-hierarchy-parent-foundation`
- final Exact-Head evidence: GitHub Actions Run #4 / `36997123099` = SUCCESS

## Scope decision
WD-25A does not introduce a second scene hierarchy. Gate 1 established that the repository already owns the required structural hierarchy authority through:
- `scene.rootObjectIds`
- per-object `parentId`
- per-object `order`

The existing Group and Assembly object types, Store reparent transaction and project persistence remain authoritative.

The implementation scope therefore consists only of focused regression/evidence plus its Exact-Head workflow. No product source file is changed by the verified functional head.

## Structural hierarchy contract

### Root ↔ Parent
A scene object is either represented in the authoritative `scene.rootObjectIds` sequence or structurally attached through its `parentId`. Reparenting updates that existing authority instead of creating a parallel hierarchy representation.

### Nested Group / Assembly
Group and Assembly remain ordinary scene objects participating in the same parent hierarchy. Nested structural trees therefore use the existing scene-object model rather than a special Group/Assembly tree.

### World-transform preservation
The existing reparent transaction preserves the object's world placement. The current world transform is evaluated before structural parent mutation and the resulting local transform is derived relative to the new parent world transform.

### Cycle protection
The existing `canReparent()`/project validation boundary prevents self-parenting and ancestor cycles. WD-25A does not add a competing cycle authority.

### Deterministic order
Root and child placement continue to use the existing `order` plus `rootObjectIds` authority. New root objects derive their deterministic order from the current authoritative root sequence.

## Persistence / History
WD-25A reuses the existing project persistence and Store history authorities:
- hierarchy state persists as normal project scene state;
- Save → Reload therefore uses the normal project serialization/replacement path;
- reparent mutations participate in existing Undo / Redo history;
- no hierarchy-specific persistence store or second history stack is introduced.

## Hard architecture boundary – Scene Parent ≠ Feature Dependency
Structural scene parenting and feature dependencies remain separate authorities.

Scene hierarchy:
- `rootObjectIds`
- `parentId`
- `order`
- Group / Assembly structure

Feature dependency:
- existing dependency graph/application authority
- feature/source dependency kinds established by the WD-24 chain

A structural reparent must not create, remove or rewrite feature dependency edges. Conversely, feature dependency recompute must not mutate structural `parentId` membership. The WD-25A focused regression explicitly protects this negative boundary.

## Verification evidence
GitHub Actions Run #4 / `36997123099` executed against exact functional head `e2f93f01056cd9989c897823e598f2e69b30ea9d` and completed successfully.

Verified steps:
- syntax / hierarchy-authority checks: PASS
- WD-24A regression: PASS
- WD-24B regression: PASS
- WD-24C regression: PASS
- WD-24D regression: PASS
- WD-24E regression: PASS
- WD-24F regression: PASS
- WD-24G regression: PASS
- WD-25A focused regression: PASS

## Verified functional diff
Against authorized base `8da02e437f34bc26511b4912d5ebbb7a054e0fe1`, the verified functional head is linear (`ahead`, 0 behind) and changes only:
1. `.github/workflows/wd-25a-scene-hierarchy-parent-foundation.yml`
2. `tests/wd-25a-scene-hierarchy-parent-foundation.mjs`

No product code is changed.

The intermediate Gate-2 correction commits only repaired verification infrastructure/test assumptions; the final resulting scope remains exactly the two authorized evidence files above.

## Completion decision
WD-25A closes the RB-06 structural-parent foundation by freezing the already-existing scene hierarchy authority and proving its required V2 boundaries without duplicating it.

**WD-25A = PASS / FROZEN / 0 BLOCKER.**

After this documentation-only freeze commit, integration is permitted only if `main` is still exactly `8da02e437f34bc26511b4912d5ebbb7a054e0fe1` and the full branch remains linearly based on that commit. After integration, the next RB-06 block is WD-25B – F015 Layers Foundation.
