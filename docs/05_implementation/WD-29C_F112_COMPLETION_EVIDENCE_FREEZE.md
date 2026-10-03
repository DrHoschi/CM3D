# WD-29C / F112 – Object Tree Drag-and-Drop Reparenting – Completion / Evidence / Freeze

Status: **PASS · FROZEN · 0 BLOCKER**

## Functional implementation head

`480007d17b5b8b4d3f2b634162d2f8ca7fc567a1`

This is the authoritative functional F112 implementation head.

## Evidence head

`57a0a74711f1c10b46ca6a2c1018715a565f4a5c`

The evidence head adds only the dedicated exact-head verification workflow on top of the functional implementation.

## Scope

F112 adds a thin Object Tree drag-and-drop adapter on top of the already frozen F110 / WD-25A hierarchy authority.

The UI adapter does not create a second hierarchy authority. It delegates drop validation and hierarchy mutation exclusively to the existing `canReparent()` / `reparent()` contract.

Implemented product scope:

- normal CM3D object rows are drag sources;
- Group and Assembly are the only structural object-row parent targets;
- dropping into the defined tree root / empty area reparents to root;
- invalid and cyclic drops are rejected through `canReparent()`;
- hierarchy, root membership, order, world-transform preservation, history / Undo / Redo and persistence remain owned by the existing F110 implementation;
- no sibling reordering, automatic container creation or new hierarchy semantics were added.

## Authorized implementation files

- `src/ui/object-tree-reparent-dnd.js`
- `src/main.js`
- `tests/wd-29c-f112-object-tree-reparent-dnd.mjs`

Verification infrastructure added afterwards:

- `.github/workflows/wd-29c-f112-exact-head-verification.yml`

No Store, project schema, persistence or hierarchy-authority file was changed.

## Exact-head verification evidence

Workflow: `WD-29C F112 Exact-Head Verification`

Run: `37130159895`

Exact tested evidence head: `57a0a74711f1c10b46ca6a2c1018715a565f4a5c`

Conclusion: **SUCCESS**

Successful checks:

1. `tests/wd-29c-f112-object-tree-reparent-dnd.mjs` – F112 focused contract
2. `tests/wd-25a-scene-hierarchy-parent-foundation.mjs` – F110 / hierarchy regression
3. `tests/wd-25c-object-tree-search-filter.mjs` – Object Tree projection / scalability regression

All required checks passed on the same exact head.

## Authority boundary

F112 remains a UI interaction layer only.

The adapter must not directly mutate `parentId`, `rootObjectIds`, sibling order, transforms, history or persistence state. Structural validity and mutation remain exclusively delegated to the frozen hierarchy contract.

## Freeze decision

The authorized implementation scope is complete, the exact-head verification is green, and no F112 blocker remains.

**WD-29C / F112 = PASS · FROZEN · 0 BLOCKER**

The complete branch freeze head is the documentation commit containing this file. Integration to `main` must remain linear from the original base `d91e64e2df3f641d0490e05f6cfa6af63a05363a`; no further product change is part of this freeze.
