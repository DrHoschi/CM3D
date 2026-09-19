# WD-21D – Profile & Open Path Derivation

**Status:** PASS / FROZEN / WD-21D.1–D.6 COMPLETE / D.1–D.5 DEVICE VERIFIED / FULL A.2→D.6 REGRESSION PASS / 0 BLOCKER  
**Definition basis:** frozen WD-21C.8-R2 @ `b29efc297ab8183a9e5879798bb6fd9da201cdf2`  
**Branch:** `feature/wd-21d-profile-open-path-derivation`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-19

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

**Status:** PASS / FROZEN / REGRESSION VERIFIED / 0 BLOCKER

**Definition basis:** frozen WD-21D.5 product head `8868781d34f668c268fd8c92b84c887a96cabded`  
**D.6 implementation head:** `cd114a516d5cbf4f92687d53da908814a7667b8c`  
**Final regression/evidence head:** `0024b3181a39797436547e569d9d97d1c84719ca`  
**Verified workflow run:** `35429732760` — SUCCESS  
**Visible product identity:** `WD-21D.5` (unchanged)

D.6 remained a regression/compatibility-only gate. Its dedicated test and workflow were introduced without product-code changes. During execution, historical WD-21C regression tests exposed build-identity assertions that accepted only their original C-era build labels. These were corrected narrowly for forward compatibility through the D.6 R-series; the corrections changed test assertions only and did not change sketch behavior, derivation behavior, product source code, or the visible product build identity.

The final exact-head workflow on `0024b3181a39797436547e569d9d97d1c84719ca` completed SUCCESS across the complete authorized chain:

`A.2 → A.3 → B.2 → B.3 → C.2 → C.3 → C.4 → C.5 → C.6 → C.7 → C.8 → C.8-R1 → C.8-R2 → D.1 → D.2 → D.3 → D.4 → D.5 → D.6`.

This proves the frozen sketch foundation/legacy contracts and the complete D.1–D.5 derivation stack remain jointly regression-compatible. The D.6 negative-scope gate also remains authoritative: no persistent PROFILE/PATH identities, SelectionRef extension, profile/path viewer UI, extrusion conversion, recompute integration, auto-connect/healing, new drawing tools, or other excluded modeling capability was introduced.

D.6 is PASS / FROZEN / REGRESSION VERIFIED / 0 BLOCKER. WD-21D as a whole is PASS / FROZEN.

## Explicitly excluded from WD-21D

Profile/path selection UI, StableReference PROFILE/PATH target kinds, concrete feature profile/path references, extrusion conversion, extrusion holes/multi-profile runtime, dependency/recompute integration, new sketch drawing tools, Spline control editing/gizmo, constraints, snap/auto-merge/tolerance/geometric rebinding and N-Gon/faceted-circle identity changes remain excluded.

## Build / branch rule

The active branch is `feature/wd-21d-profile-open-path-derivation`. The frozen visible D.5 implementation build identity remains `WD-21D.5`; central `applyBuildIdentity()` applies the same value to `document.title` and the visible brand/build label. D.6 definition and later regression-only implementation do not change that product identity.

## Next permissible step

WD-21D is **PASS / FROZEN / 0 BLOCKER**. No further WD-21D implementation is authorized. The next step must be determined separately from the current roadmap against this frozen WD-21D baseline; this freeze does not itself authorize WD-21E or any other product block.
