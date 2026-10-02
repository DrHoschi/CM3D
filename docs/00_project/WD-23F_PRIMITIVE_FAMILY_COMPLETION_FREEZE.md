# WD-23F – Primitive Family Completion F047/F048 – Completion / Evidence / Freeze

Status: PASS / FROZEN / 0 BLOCKER

## Authoritative basis

- Integration base: `main = da8d0a5dbd5e523589889d2ab670af8bc4958b47`
- Final verified functional head: `2d42181ea5b3617748889e5add8466f5544b5fc5`
- Verification: GitHub Actions run `36980805042` / run #9, conclusion `success`.

## Scope completed

WD-23F completes the controlled RB-04 primitive families F047/F048.

F047:
- existing `primitive.sphere` retained as the established sphere authority;
- `primitive.cone` added;
- `primitive.plane` added.

F048:
- `primitive.tube` added as a source-independent parametric hollow cylinder;
- `primitive.torus` added.

The existing sphere implementation was not replaced or duplicated.

## Source-independent primitive contract

The WD-23F primitives are direct parametric scene objects. They do not consume PROFILE, PATH, AXIS or other feature SourceRefs and do not introduce dependency-graph edges. Their authoritative inputs are their own primitive parameters plus the existing generic scene-object transform/material/visibility state.

This deliberately keeps F047/F048 separate from Extrude, Thin Extrude, Revolve, Sweep and Loft feature semantics.

## Parameter / validation boundary

Foundation parameters are intentionally narrow:

- sphere: existing radius/segment contract retained;
- cone: radius, height, segments;
- plane: width, height;
- tube: innerRadius, outerRadius, height, segments, with `0 < innerRadius < outerRadius`;
- torus: majorRadius, tubeRadius, radialSegments, tubularSegments.

Positive dimensions and valid segment counts are required by the primitive-family contract. Invalid parameter combinations are rejected rather than repaired heuristically.

## Persistence / history

Primitive creation and parameter changes remain inside the existing scene-object/store authority. Save→Reload and Undo/Redo use the existing project persistence/history mechanisms; WD-23F introduces no second persistence or history subsystem.

## Productive integration

Application integration is minimal:

- `src/application/extrude.js`: import and install `installPrimitiveFamily(store)` through the established productive store initialization path.

Runtime integration is minimal:

- `src/runtime-three/loft.js`: import and install `installPrimitiveFamilyRuntime(runtime)` after the existing Loft runtime wrapper.

The previously introduced redundant primitive-runtime installation in Revolve was removed completely. The productive runtime chain therefore installs the primitive family exactly once through the established Revolve → Sweep → Loft chain.

## Final scope evidence

Final branch diff against the authoritative base contains exactly six files:

1. `.github/workflows/wd-23f-primitive-family-completion.yml` – focused verification workflow.
2. `src/application/extrude.js` – minimal productive store integration (`+2 / -0`).
3. `src/application/primitive-family.js` – primitive-family application contract.
4. `src/runtime-three/loft.js` – minimal productive runtime integration (`+2 / -1`, existing closing statement extended by the runtime install call).
5. `src/runtime-three/primitive-family.js` – Three.js primitive geometry contract.
6. `tests/wd-23f-primitive-family-completion.mjs` – focused F047/F048 regression.

`src/runtime-three/revolve.js` is byte-equivalent to the integration base and is not part of the final diff.

## Verification evidence

Exact verified head: `2d42181ea5b3617748889e5add8466f5544b5fc5`.

GitHub Actions run `36980805042` / #9 completed successfully on that exact SHA. The following checks passed:

- Syntax application contract – PASS
- Syntax runtime contract – PASS
- WD-23A Extrude V2 regression – PASS
- WD-23B Thin Extrude regression – PASS
- WD-23C Revolve regression – PASS
- WD-23D Sweep regression – PASS
- WD-23E Loft regression – PASS
- WD-23F Primitive Family Completion – PASS

The earlier verification-infrastructure and minimal-diff findings were corrected before freeze. No blocker remains.

## Out of scope

Explicitly outside WD-23F:

- complex/additional primitive families beyond F047/F048;
- partial-angle primitive variants;
- path-driven/bent tubes;
- Sweep-based tube semantics;
- Plane-to-Work-Plane conversion;
- Boolean operations;
- downstream feature-chain work;
- RB-05.

## Freeze

WD-23F is complete for F047/F048 and frozen at PASS / 0 BLOCKER. Any expansion of primitive topology or feature semantics requires a separate authorized product block.
