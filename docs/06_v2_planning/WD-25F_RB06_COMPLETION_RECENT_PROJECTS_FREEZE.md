# WD-25F – RB-06 Completion / Recent Projects – Completion / Evidence / Freeze

Status: FROZEN
Date: 2026-10-02
RB block: RB-06 / WD-25F
Implementation base: `da00fa23873f5b599d0ba15c80ebce14068b6f00`
Functional verified head: `3e4823bcc959605e70ec3a9b179fd06b3b5cf61e`
Branch: `feature/wd-25f-rb06-completion-recent-projects`

## Scope

WD-25F closes the remaining RB-06 capability identified in Gate 1: F003 Recent Projects / Quick Reopen against the existing V2 project schema and persistence authority.

Functional files in the WD-25F line:

- `src/ui/recent-projects.js`
- `src/main.js`
- `tests/wd-25f-rb06-completion-recent-projects.mjs`
- `.github/workflows/wd-25f-rb06-completion-recent-projects.yml`

## F003 contract

Recent Projects is a UI projection over the existing persisted project index. Quick Reopen delegates to the existing `loadProject(projectId)` authority and therefore retains the existing migration and V2 schema validation path before `store.replaceProject(project)`.

WD-25F does not create a second project persistence authority or a second selection authority.

## RB-06 combined contract evidence

The focused regression additionally verifies the existing RB-06 contracts remain available together:

- additive object multi-selection remains owned by the existing selection path;
- Object Tree search/filter/scalability remains projection-only;
- Scene Hierarchy parent/root contracts and Save -> Reload evidence remain covered by WD-25A;
- the deterministic WD-25D large-scene fixture remains semantically valid with 1,020 generated objects and 20 root groups;
- WD-25B through WD-25E regressions remain green.

## Verification history

Initial functional head `90b3f6677720073c7683ca477c977dabc4f40d23` produced CI Run #1 (`37056142108`) with one focused-test failure. The failure was confined to an incorrect literal-source assertion for `1020`; it did not identify a product/runtime defect.

The correction changed only `tests/wd-25f-rb06-completion-recent-projects.mjs`, replacing the literal-source assertion with semantic evaluation of the existing WD-25D fixture.

Final exact functional head verified:

`3e4823bcc959605e70ec3a9b179fd06b3b5cf61e`

GitHub Actions evidence:

- workflow: `WD-25F RB-06 Completion Recent Projects`
- run: `#2`
- run id: `37056334114`
- result: `success`

Successful steps:

- Syntax
- WD-25A regression
- WD-25B regression
- WD-25C regression
- WD-25D regression
- WD-25E regression
- WD-25F focused regression

Verification blockers: 0.

## Explicit non-scope

WD-25F introduces no:

- new selection authority
- new project persistence format or authority
- rendering change
- performance optimization
- Feature Dependency semantic change

## Freeze decision

The functional WD-25F head is frozen at:

`3e4823bcc959605e70ec3a9b179fd06b3b5cf61e`

This completion document is evidence-only and does not redefine the functional freeze head.

Gate-3 integration is permitted only as a linear fast-forward from unchanged `main = da00fa23873f5b599d0ba15c80ebce14068b6f00` through this completion/evidence commit. No additional product changes are authorized.
