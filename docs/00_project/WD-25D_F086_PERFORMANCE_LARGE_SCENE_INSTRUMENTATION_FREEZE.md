# WD-25D – F086 Performance / Large-Scene Instrumentation – Freeze

Status: PASS / FROZEN
Release block: RB-06 – Scene Structure & Large Projects
Functional exact head: `1f5fa69ded4836df9a96e3077c930ce1c5ca29db`
Authorized base main: `de44653b542e9c0b55e87e8413463a94d1fce7c3`

## Completion contract

WD-25D closes the F086 measurement/instrumentation foundation without introducing a second runtime authority or performance optimization policy.

- Performance data is derived diagnostic state only.
- Frame-time and FPS are sampled from the runtime frame cadence.
- Renderer/scene snapshots expose object/runtime-node/pickable counts plus renderer draw calls, triangles, lines, points, geometries and textures where provided by the existing Three renderer.
- The existing Inspector diagnostics surface receives the minimal Performance section and refresh path.
- No performance value is persisted into the project model or history.
- No F089 pass/fail threshold or large-world/small-object quality verdict is introduced here.
- No culling, LOD, instancing, object-tree optimization or other performance optimization is part of WD-25D.

## Deterministic large-scene basis

The focused regression includes a deterministic large-scene fixture containing 1,020 scene objects. It exists as a reproducible test basis for subsequent RB-06 QA rather than as a binary project artifact.

Boundary:

- F086 = measurement, diagnostic visibility and reproducible large-scene test basis.
- F089 = subsequent QA/evaluation using that basis, especially large-world/small-object regression.
- Performance optimization = separate work only when measurement/evidence justifies it.

## Functional scope

The verified functional diff against the authorized base contains exactly five files:

1. `.github/workflows/wd-25d-performance-large-scene-instrumentation.yml`
2. `src/runtime-three/performance-instrumentation.js`
3. `src/ui/inspector-diagnostics.js`
4. `tests/fixtures/wd-25d-large-scene-fixture.mjs`
5. `tests/wd-25d-performance-large-scene-instrumentation.mjs`

After the Minimal-Diff Correction, `src/ui/inspector-diagnostics.js` is based on the exact authorized-main content and contains only the necessary additive F086 integration. Final functional compare: +43 / -1 for that file. The other four scope files are additive.

## Exact-head evidence

GitHub Actions workflow: `WD-25D Performance Large Scene Instrumentation`

Final functional evidence:
- Run #2
- Run ID: `37039902855`
- Exact head: `1f5fa69ded4836df9a96e3077c930ce1c5ca29db`
- Result: SUCCESS

Verified steps:
- Syntax
- WD-24A regression
- WD-24B regression
- WD-24C regression
- WD-24D regression
- WD-24E regression
- WD-24F regression
- WD-24G regression
- WD-25A regression
- WD-25B regression
- WD-25C regression
- WD-25D focused regression

## Architecture boundary

WD-25D does not create project persistence, history semantics, a second render/runtime authority, F089 QA policy, or optimization behavior. The instrumentation observes existing runtime/renderer state and publishes diagnostic snapshots only.

## Freeze decision

WD-25D F086 Performance / Large-Scene Instrumentation is complete at functional exact head `1f5fa69ded4836df9a96e3077c930ce1c5ca29db` with PASS / 0 BLOCKER evidence from Run #2.

This file is documentation-only Gate-3 evidence and does not alter the verified functional implementation.