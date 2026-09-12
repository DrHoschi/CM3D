# WD-21D – Profile & Open Path Derivation

**Status:** ACTIVE / WD-21D.1 PASS / FROZEN / WD-21D.2 PASS / FROZEN / WD-21D.3 PASS / FROZEN / WD-21D.4 IMPLEMENTED / NOT FROZEN  
**Definition basis:** frozen WD-21C.8-R2 @ `b29efc297ab8183a9e5879798bb6fd9da201cdf2`  
**Branch:** `feature/wd-21d-profile-open-path-derivation`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-12

## WD-21D authority boundary

WD-21D creates only deterministic derived read models from existing sketch data. It MUST NOT mutate persistent sketch geometry, create geometric auto-connections, introduce tolerance-based rebinding, change existing sketch element identities, change extrusion behavior, add profile/path StableReference target kinds, or add profile/path selection UI. Analytic sketch identity remains authoritative; tessellation is derived only.

## WD-21D.1 – Generic Sketch Curve/Edge Derivation Contract

**Status:** PASS / FROZEN / 0 BLOCKER  
**Frozen implementation head:** `5acd2c65931168c4535fce8e2e1eb0504f088f6d`

D.1 is the single generic read-only curve authority for Line/Circle/Arc/Spline through `src/model/sketch-curve-derivation.js`. Line/Arc/Spline preserve exact topology endpoint IDs. Circle is closed and endpointless. `reverseDerivedCurve(...)` provides read-only traversal reversal. Arc/Spline sampling remains derived only. Real iPad/Safari D.1 gate: 1–7 PASS. The camera-focus difference remains NON-BLOCKING / LATER UX UNIFICATION.

## WD-21D.2 – Deterministic Contour & Open Path Graph Derivation

**Status:** PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER

**Documented contract head:** `1f7715f80160aa205c306a1129b4a19d2f4852a7`  
**Frozen implementation/product head:** `4bcf862e7e7a019557a9a03952294a2e54393f6c`  
**Core implementation evidence head:** `7647ede8d45e77799bb5ce7326dbf1a9a3df29fb`  
**Visible build identity:** `WD-21D.2`

D.2 is the pure graph/component authority in `src/model/sketch-path-graph-derivation.js`. It consumes exclusively D.1, connects Line/Arc/Spline only through identical authoritative `pointId`, treats Circle as a standalone endpointless `CLOSED_CONTOUR`, and deterministically classifies components as `OPEN_PATH`, `CLOSED_CONTOUR`, or `INVALID_COMPONENT`. Its `componentKey` is derived only and is not a WD-21E StableReference identity. D.2 does not perform area, winding, nesting, self-intersection, profile-region, selection, extrusion, or recompute work.

Final D.2 scope audit and automated regression are PASS, and the real iPad/Safari device gate on visible build `WD-21D.2` is 1–7 PASS. D.2 is frozen with 0 blocker.

## WD-21D.3 – Closed Profile Region & Nesting Derivation

**Status:** PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER

**Documented contract head:** `3168608b21dc97cef6e11512ad66eaf5a11b7a8b`  
**Frozen implementation/product head:** `9257b63f7e8a24f55d4d0a0181f96ff2daf3e04f`  
**Core implementation evidence head:** `f222c09a31937e0753a1c866bd997e38450f1cb3`  
**Visible build identity:** `WD-21D.3`

### D.3 authority and implemented scope

WD-21D.3 consumes exclusively the frozen D.2 graph/component derivation as its contour authority. Only `CLOSED_CONTOUR` components are profile-region candidates; `OPEN_PATH` and `INVALID_COMPONENT` never produce profile regions. D.3 does not reread persistent element collections as a parallel contour authority and does not mutate sketch data, D.1 curves, D.2 components, topology IDs, or analytic geometry.

The central implementation is `src/model/sketch-profile-region-derivation.js`. `deriveSketchProfileRegions(sketch)` returns frozen `profileRegions[]`, `unclassifiedContours[]`, and `diagnostics[]`. A profile region contains deterministic derived `profileKey`, one `outerContour`, deterministic `holes[]`, nesting metadata, and source traceability through D.2/D.1 to `kind + elementId`. `profileKey` remains derived only and is not a persistent profile identity or WD-21E StableReference identity.

Containment is deterministic and classified by depth parity: depth 0 outer, depth 1 hole, depth 2 island/new region, depth 3 hole, and so on. Therefore `outer → hole → island → hole` remains structurally preserved. Multiple separate closed contours derive independent profile regions. D.1/D.2 tessellation is used only as derived computational geometry; persistent sketch curves are never rewritten.

D.3 does not own final mixed-analytic validity. Self-intersection, degeneracy, touching/intersecting ambiguity and other geometric validity remain D.4. Existing line-only `src/model/sketch-profile.js`, extrusion, selection, StableReference and recompute/dependency code remain unchanged.

### Final scope audit

The final D.3 product head `9257b63f7e8a24f55d4d0a0181f96ff2daf3e04f` was audited against documented contract head `3168608b21dc97cef6e11512ad66eaf5a11b7a8b`: **8 commits ahead / 0 behind**.

Changed scope is limited to:

- new pure D.3 profile-region/nesting model authority;
- dedicated D.3 regression and workflow;
- central visible build identity `WD-21D.3`;
- minimum forward compatibility in existing build-ID assertions;
- D.3 status documentation.

No D.4 geometric validity implementation, D.5 combined profile/open-path API, Stable Profile/Path References, profile/path viewer selection/highlighting, extrusion conversion, hole/multi-profile extrusion runtime, dependency/recompute integration, geometric auto-connect, tolerance/snap/rebinding, or new sketch editing capability was introduced.

### Final automated evidence

On exact final product head `9257b63f7e8a24f55d4d0a0181f96ff2daf3e04f`:

- normal build: SUCCESS;
- GitHub Pages deploy: SUCCESS;
- build-status reporting: SUCCESS;
- D.3 `profile-region-regression`: SUCCESS;
- D.2 `path-graph-derivation-regression`: SUCCESS;
- D.1 `curve-derivation-regression`: SUCCESS.

Earlier core implementation evidence on `f222c09a31937e0753a1c866bd997e38450f1cb3` also showed D.3, D.2 and D.1 regressions green before final status synchronization.

### Real iPad/Safari device evidence

Real-device verification on visible build `WD-21D.3`: **1–7 PASS**.

Verified were:

- consistent `WD-21D.3` browser-tab and visible application-header identity;
- creation and visibility of Line, Circle, Arc and Spline;
- Object-Tree selection and viewer focus for Point/Line/Circle/Arc/Spline;
- existing Point/Line/Circle gizmo behavior with Arc/Spline remaining no-gizmo;
- Connect/Disconnect regression for Line/Arc/Spline through authoritative endpoint topology;
- Undo/Redo after sketch mutations;
- Save/Reload persistence of all four sketch element kinds;
- absence of premature profile-selection UI, Hole/Nesting UI or new extrusion functionality.

### Freeze result

WD-21D.3 satisfies documented scope, final automated regression, build/deploy, visible build-identity consistency and real iPad/Safari regression with **0 blocker**.

**WD-21D.3 is PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER.**

## WD-21D.4 – Mixed Analytic Geometry Validation

**Status:** IMPLEMENTED / AUTOMATED REGRESSION PENDING / DEVICE NOT VERIFIED / NOT FROZEN

**Documented contract head:** `9d2503998610fba0bd6bdf79d98a97dba702e393`  
**Visible build identity:** `WD-21D.4`

### D.4 authority and input boundary

WD-21D.4 is a pure read/validation layer over the frozen D.1 → D.2 → D.3 derivation chain. It validates derived analytic geometry only and MUST NOT mutate persistent sketch geometry, D.1 curves, D.2 components, D.3 profile regions, topology IDs, source element IDs, or project state.

D.4 validates Line, Circle, Arc and Spline geometry, including mixed curve-type combinations within closed contours and geometric relationships between closed contours/profile-region boundaries. D.1 remains curve authority, D.2 remains connectivity/component authority, and D.3 remains profile-region/nesting authority.

### Validation status contract

The implemented validation states are `VALID`, `INVALID`, `AMBIGUOUS`, and `UNRESOLVED`. Proven invalidity takes precedence over ambiguity/unresolved evidence. An ambiguous or unresolved case is never silently accepted as valid and is never automatically repaired.

### Implemented validation authority

`src/model/sketch-geometry-validation.js` introduces `validateSketchProfileGeometry(sketch)` and `SketchGeometryValidity` as the pure D.4 read model.

The implementation consumes D.3 through `deriveSketchProfileRegions(sketch)`, gathers outer/hole/unclassified D.3 contours deterministically by `componentKey`, validates zero-area/degenerate contour geometry, detects non-adjacent intra-contour intersection/contact, validates inter-contour crossing/overlap/boundary contact, preserves legal adjacent contour junctions, and retains sorted `kind + elementId` source traceability.

Mixed Line/Circle/Arc/Spline combinations are checked from D.1-derived tessellation carried through D.2/D.3. Crossing/overlap between distinct contours is `INVALID`; pure boundary contact is `AMBIGUOUS`; self-intersection and proven zero-area/degenerate geometry are `INVALID`. Existing D.3 ambiguity/unclassified diagnostics remain upstream evidence and are not silently erased.

The frozen output contains deterministic `contourValidations[]`, `profileRegionValidations[]`, `diagnostics[]`, and `upstreamDiagnostics[]`. D.2 `componentKey` and D.3 `profileKey` remain derived-only keys and are not promoted into StableReference identity.

### Numerical / tessellation boundary

D.4 uses deterministic D.1 tessellation only as read-only numerical evidence. Samples do not create persistent points/elements, replace analytic source identity, alter topology IDs/connectivity, or introduce tolerance-based rebinding. `AMBIGUOUS`/`UNRESOLVED` remain explicit outcomes where derived evidence cannot justify certainty.

### D.4 regression implementation

`tests/wd-21d4-mixed-analytic-geometry-validation.mjs` covers valid closed Line and Circle cases, valid mixed Line+Arc and Line+Spline, bow-tie/self-intersection, zero-area/degeneracy, valid outer+hole, touching/crossing contour cases, crossing/touching independent contours, mixed Circle↔Line source traceability, legal adjacent endpoint negative control, insertion-order independence, non-mutation and D.4 exclusion/build-identity checks.

`.github/workflows/wd-21d4-mixed-analytic-geometry-validation.yml` runs A.2, C.2 and D.1–D.4 regressions on this branch. Existing C.2, D.2 and D.3 build-ID assertions are widened only as required for the authorized `WD-21D.4` build.

### Compatibility boundary

Existing line-only `src/model/sketch-profile.js` remains compatibility behavior. Its line-specific validity logic is not promoted into D.4 and existing extrusion/legacy profile consumers remain unchanged.

D.4 does not implement geometric auto-healing, Trim/Split, Snap/Merge, tolerance-based topology rebinding, automatic intersection-point creation, new sketch editor functionality, D.5 combined profile/open-path API, Stable Profile/Path References, profile/path viewer selection/highlighting, extrusion conversion, extrusion hole/multi-profile runtime behavior, or dependency/recompute integration.

### Build identity and current gate state

The central `BUILD_ID` in `src/main.js` is `WD-21D.4`; existing `applyBuildIdentity()` applies the same value to `document.title` and visible brand/build label. Corrections inside D.4 require `WD-21D.4-R1`, `-R2`, etc.

D.4 implementation and dedicated regression/workflow are present, but no PASS/FROZEN claim is made in this implementation step. Automated CI evidence on the final implementation head and later real-device verification remain separate gates.

## WD-21D.5 – Generic Profile / Open Path Derivation API

**Status:** DEFINED / NOT IMPLEMENTED

Later D.5 owns the central profiles/openPaths/invalidComponents/diagnostics API. Existing `getSingleExtrudableProfile(...)` remains compatibility behavior until an explicitly authorized later integration step.

## WD-21D.6 – Derivation Regression / Compatibility Gate

**Status:** DEFINED / NOT IMPLEMENTED

Full WD-21D integration/freeze remains later and requires D.1–D.5 PASS / 0 BLOCKER.

## Explicitly excluded from WD-21D

Profile/path selection UI, StableReference PROFILE/PATH target kinds, concrete feature profile/path references, extrusion conversion, extrusion holes/multi-profile runtime, dependency/recompute integration, new sketch drawing tools, Spline control editing/gizmo, constraints, snap/auto-merge/tolerance/geometric rebinding and N-Gon/faceted-circle identity changes remain excluded.

## Build / branch rule

The active branch is `feature/wd-21d-profile-open-path-derivation`. The active visible implementation build identity is `WD-21D.4`; central `applyBuildIdentity()` applies the same value to `document.title` and the visible brand/build label. Corrections inside D.4 use `WD-21D.4-R1`, `-R2`, etc.

## Next permissible step

WD-21D.4 implementation is present but is NOT PASS and NOT FROZEN in this step. The next permissible step is exclusively **WD-21D.4 Completion / Automated Regression Gate** against the final implementation branch head. No D.5 work, device PASS or freeze is authorized in this implementation step.
