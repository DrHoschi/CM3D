# WD-21D – Profile & Open Path Derivation

**Status:** ACTIVE / WD-21D.1 PASS / FROZEN / WD-21D.2 PASS / FROZEN / WD-21D.3 PASS / FROZEN / WD-21D.4-R2 PASS / FROZEN / WD-21D.5 PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER  
**Definition basis:** frozen WD-21C.8-R2 @ `b29efc297ab8183a9e5879798bb6fd9da201cdf2`  
**Branch:** `feature/wd-21d-profile-open-path-derivation`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-16

## WD-21D authority boundary

WD-21D creates only deterministic derived read models from existing sketch data. It MUST NOT mutate persistent sketch geometry, create geometric auto-connections, introduce tolerance-based rebinding, change existing sketch element identities, change extrusion behavior, add profile/path StableReference target kinds, or add profile/path selection UI. Analytic sketch identity remains authoritative; tessellation is derived only.

## WD-21D.1 – Generic Sketch Curve/Edge Derivation Contract

**Status:** PASS / FROZEN / 0 BLOCKER  
**Frozen implementation head:** `5acd2c65931168c4535fce8e2e1eb0504f088f6d`

D.1 is the single generic read-only curve authority for Line/Circle/Arc/Spline through `src/model/sketch-curve-derivation.js`. Line/Arc/Spline preserve exact topology endpoint IDs. Circle is closed and endpointless. `reverseDerivedCurve(...)` provides read-only traversal reversal. Arc/Spline sampling remains derived only. Real iPad/Safari D.1 gate: 1–7 PASS. The camera-focus difference remains NON-BLOCKING / LATER UX UNIFICATION.

## WD-21D.2 – Deterministic Contour & Open Path Graph Derivation

**Status:** PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER

**Frozen implementation/product head:** `4bcf862e7e7a019557a9a03952294a2e54393f6c`  
**Visible build identity:** `WD-21D.2`

D.2 is the pure graph/component authority in `src/model/sketch-path-graph-derivation.js`. It consumes exclusively D.1, connects Line/Arc/Spline only through identical authoritative `pointId`, treats Circle as a standalone endpointless `CLOSED_CONTOUR`, and deterministically classifies components as `OPEN_PATH`, `CLOSED_CONTOUR`, or `INVALID_COMPONENT`. Its `componentKey` is derived only and is not a WD-21E StableReference identity.

D.2 is PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER.

## WD-21D.3 – Closed Profile Region & Nesting Derivation

**Status:** PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER

**Frozen implementation/product head:** `9257b63f7e8a24f55d4d0a0181f96ff2daf3e04f`  
**Visible build identity:** `WD-21D.3`

D.3 consumes exclusively the frozen D.2 graph/component derivation as contour authority. `deriveSketchProfileRegions(sketch)` returns frozen `profileRegions[]`, `unclassifiedContours[]`, and `diagnostics[]`. Profile regions preserve deterministic derived `profileKey`, outer contour, holes, nesting metadata and source traceability. Containment follows deterministic depth parity. D.3 does not own final mixed-analytic validity and does not alter legacy extrusion, selection, StableReference or recompute behavior.

D.3 is PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER.

## WD-21D.4 – Mixed Analytic Geometry Validation

**Status:** PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER

**Frozen implementation/product head:** `f0370e81c13779fedddef7962f3dc894ba44609f`  
**Visible build identity:** `WD-21D.4-R2`

D.4 is the pure validation layer over D.1 → D.2 → D.3. It classifies profile geometry as `VALID`, `INVALID`, `AMBIGUOUS`, or `UNRESOLVED`, preserves source traceability, and does not mutate persistent or derived geometry. Legal shared authoritative endpoints are not treated as self-intersections. Tessellation remains derived evidence only.

The device reconciliation confirmed no Circle geometry inconsistency; future configurable sketch-grid spacing remains NON-BLOCKING / LATER SKETCH-GRID UX.

D.4-R2 is PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER.

## WD-21D.5 – Generic Profile / Open Path Derivation API

**Status:** PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER

**Definition basis:** frozen WD-21D.4-R2 product head `f0370e81c13779fedddef7962f3dc894ba44609f`  
**Frozen implementation/product head:** `8868781d34f668c268fd8c92b84c887a96cabded`  
**Visible build identity:** `WD-21D.5`

D.5 is exclusively the common public read API over frozen D.2/D.3/D.4 through `src/model/sketch-profile-path-derivation.js` and `deriveSketchProfilesAndPaths(sketch)`. It exposes deterministic read-only `profiles[]`, `openPaths[]`, `invalidComponents[]`, `unclassifiedContours[]`, `diagnostics[]` and the inherited D.4 profile-geometry validation `status`.

D.5 preserves D.3 profile/nesting data, D.2 open/invalid component data and D.4 validity without creating a competing derivation, validation, identity or mutation authority. Output is deterministic and deep-frozen. Existing line-only `src/model/sketch-profile.js`, `getSingleExtrudableProfile(...)` and the existing extrusion product path remain unchanged.

The final D.5 implementation scope remained exactly the authorized 8 files. On exact product head `8868781d34f668c268fd8c92b84c887a96cabded`, D.1–D.5 regressions and GitHub Pages deployment completed SUCCESS. Real iPad/Safari verification on 2026-09-16 against visible build `WD-21D.5`: test points 1–7 PASS.

D.5 is PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER.

## WD-21D.6 – Derivation Regression / Compatibility Gate

**Status:** RECONCILED / DEFINED / CONTRACT BOUNDED / REGRESSION-ONLY / NOT IMPLEMENTED

**Definition basis:** frozen WD-21D.5 product head `8868781d34f668c268fd8c92b84c887a96cabded`

### D.6 purpose and authority boundary

WD-21D.6 is exclusively the final integration/regression/compatibility gate for the already implemented D.1 → D.2 → D.3 → D.4 → D.5 derivation chain. D.6 MUST NOT create a new model authority, geometry derivation, validation rule, persistent identity, mutation path or visible modeling capability.

D.6 verifies that the complete WD-21D derivation chain works together and remains compatible with the frozen sketch foundation and legacy line-only behavior. A D.6 failure may expose a regression requiring a separately authorized correction, but D.6 itself MUST NOT silently repair product code.

### Required regression matrix

The dedicated D.6 integration regression MUST prove, at minimum:

- frozen sketch foundation/topology behavior remains compatible with WD-21D;
- existing generic element registry/persistence and relevant WD-21C sketch contracts remain green;
- D.1 generic Line/Circle/Arc/Spline curve derivation remains green;
- D.2 deterministic component/path graph derivation remains green;
- D.3 profile-region/nesting derivation remains green;
- D.4 mixed analytic geometry validation remains green;
- D.5 combined profile/open-path read API remains green;
- legacy line-only open and closed sketch cases remain regressionsafe;
- standalone Circle remains correctly represented through the derivation chain;
- mixed Line+Arc and Line+Spline / Line+Arc+Spline geometry remains deterministic;
- multiple independent profiles remain separate;
- outer+hole and deeper nesting preserve the frozen D.3 parity contract;
- open paths remain open-path results and do not become profiles;
- branching components remain invalid components;
- self-intersecting geometry remains explicitly invalid;
- degenerate/unclassified geometry remains unclassified/invalid as defined by frozen authorities;
- boundary-contact ambiguity remains ambiguous/unresolved as supplied by D.4;
- collection insertion order does not change the derived result;
- persistent sketch data and frozen D.1–D.5 derived models are not mutated by the integration read path.

### Legacy / compatibility contract

D.6 MUST verify compatibility with existing V1/WD-21C sketch structures and the existing line-only modeling path. It MUST NOT migrate existing saved sketches into persistent profile/path objects and MUST NOT redirect `src/model/sketch-profile.js` or `getSingleExtrudableProfile(...)` to D.5.

The existing extrusion behavior remains compatibility authority for this block. D.6 MUST prove that WD-21D has not implicitly enabled mixed-analytic, hole, multi-profile or open-path extrusion.

### Negative scope gate

D.6 MUST verify the absence of WD-21D-excluded capabilities. In particular D.6 MUST NOT introduce or authorize:

- StableReference `PROFILE` / `PATH` target kinds or persistent profile/path IDs;
- SelectionRef extensions for profiles/paths;
- profile/path viewer hit-testing, highlighting or focus;
- Object-Tree/Inspector profile/path UI;
- extrusion conversion or hole/multi-profile/open-path extrusion runtime;
- dependency/recompute integration changes;
- geometric auto-connect, snap/merge/tolerance rebinding;
- Trim/Split/healing;
- new sketch drawing tools or Spline control editing/gizmos;
- constraints or N-Gon/faceted-circle identity changes.

### Exact later implementation file scope

A later D.6 implementation is limited to exactly these two new regression-infrastructure files:

1. `tests/wd-21d6-derivation-regression-compatibility-gate.mjs`
2. `.github/workflows/wd-21d6-derivation-regression-compatibility-gate.yml`

No `src/**` product file is authorized for modification by the D.6 implementation. Existing D.1–D.5 tests SHOULD be invoked/reused rather than duplicated or rewritten. Existing test files and workflows remain frozen unless a separately identified compatibility defect requires its own explicit correction authorization.

The D.6 workflow MUST execute the required foundation/WD-21C compatibility regressions followed by D.1 → D.2 → D.3 → D.4 → D.5 and finally the dedicated D.6 integration/negative-scope regression. Exact invoked existing test filenames are to be verified at the separate D.6 Implementation Scope/Authorization Gate before implementation; this does not expand the two-new-file D.6 implementation boundary.

### Build identity boundary

D.6 is a regression/compatibility gate and introduces no visible product capability. Therefore no `src/main.js` change and no visible `WD-21D.6` build identity change are authorized. The frozen visible product identity remains `WD-21D.5` unless a later separately authorized product change requires otherwise.

### Documentation / freeze boundary

This Definition Documentation Gate modifies only `docs/05_implementation/WD-21D_STATUS.md`. D.6 implementation, automated execution/evidence and final WD-21D integration/freeze remain separate later steps. Final documentation after successful D.6 execution may update status/evidence documents only under a separate freeze authorization.

## Explicitly excluded from WD-21D

Profile/path selection UI, StableReference PROFILE/PATH target kinds, concrete feature profile/path references, extrusion conversion, extrusion holes/multi-profile runtime, dependency/recompute integration, new sketch drawing tools, Spline control editing/gizmo, constraints, snap/auto-merge/tolerance/geometric rebinding and N-Gon/faceted-circle identity changes remain excluded.

## Build / branch rule

The active branch is `feature/wd-21d-profile-open-path-derivation`. The frozen visible D.5 implementation build identity remains `WD-21D.5`; central `applyBuildIdentity()` applies the same value to `document.title` and the visible brand/build label. D.6 definition and later regression-only implementation do not change that product identity.

## Next permissible step

WD-21D.6 is **RECONCILED / DEFINED / CONTRACT BOUNDED / REGRESSION-ONLY / NOT IMPLEMENTED**. The next permissible step is exclusively a separate **WD-21D.6 Implementation Scope / Authorization Gate** against this documented contract: verify the exact existing foundation/WD-21C/D.1–D.5 tests to invoke and confirm the two-new-file regression/workflow scope. No D.6 implementation, product-code change, build-ID change or WD-21D final freeze is authorized in that gate.
