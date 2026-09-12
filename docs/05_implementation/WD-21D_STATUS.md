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

D.2 is the pure graph/component authority in `src/model/sketch-path-graph-derivation.js`. It consumes exclusively D.1, connects Line/Arc/Spline only through identical authoritative `pointId`, treats Circle as a standalone endpointless `CLOSED_CONTOUR`, and deterministically classifies components as `OPEN_PATH`, `CLOSED_CONTOUR`, or `INVALID_COMPONENT`. Its `componentKey` is derived only and is not a WD-21E StableReference identity.

## WD-21D.3 – Closed Profile Region & Nesting Derivation

**Status:** PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER

**Documented contract head:** `3168608b21dc97cef6e11512ad66eaf5a11b7a8b`  
**Frozen implementation/product head:** `9257b63f7e8a24f55d4d0a0181f96ff2daf3e04f`  
**Core implementation evidence head:** `f222c09a31937e0753a1c866bd997e38450f1cb3`  
**Visible build identity:** `WD-21D.3`

WD-21D.3 consumes exclusively frozen D.2 graph/component derivation as contour authority. Only `CLOSED_CONTOUR` components are profile-region candidates. `deriveSketchProfileRegions(sketch)` returns frozen `profileRegions[]`, `unclassifiedContours[]`, and `diagnostics[]`. Containment follows deterministic nesting-depth parity. D.3 does not own final mixed-analytic validity.

Final D.3 product head `9257b63f7e8a24f55d4d0a0181f96ff2daf3e04f` passed automated build/regression/deploy and real iPad/Safari 1–7 device regression. D.3 is PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER.

## WD-21D.4 – Mixed Analytic Geometry Validation

**Status:** IMPLEMENTED / AUTOMATED REGRESSION PENDING / DEVICE NOT VERIFIED / NOT FROZEN

**Documented contract head:** `9d2503998610fba0bd6bdf79d98a97dba702e393`  
**Visible build identity:** `WD-21D.4`

### D.4 authority and input boundary

WD-21D.4 is a pure read/validation layer over the frozen D.1 → D.2 → D.3 derivation chain. It validates derived analytic geometry only and MUST NOT mutate persistent sketch geometry, D.1 curves, D.2 components, D.3 profile regions, topology IDs, source element IDs, or project state.

D.4 validates Line, Circle, Arc and Spline geometry, including mixed curve-type combinations within closed contours and geometric relationships between closed contours/profile-region boundaries. D.1 remains curve authority, D.2 connectivity/component authority and D.3 profile-region/nesting authority.

### Validation status contract

The implemented validation states are `VALID`, `INVALID`, `AMBIGUOUS`, and `UNRESOLVED`. Proven invalidity takes precedence over ambiguity/unresolved evidence. Ambiguous or unresolved geometry is never silently accepted as valid and is never automatically repaired.

### Implemented validation authority

`src/model/sketch-geometry-validation.js` introduces the pure D.4 authority `validateSketchProfileGeometry(sketch)` and `SketchGeometryValidity`.

The implementation:

- consumes D.3 through `deriveSketchProfileRegions(sketch)` and does not introduce a parallel persistent topology/profile authority;
- gathers D.3 derived outer/hole/unclassified contours deterministically by D.2 `componentKey`;
- validates zero-area/degenerate contours and derived curve degeneracy;
- detects non-adjacent intra-contour segment crossings/contact as self-intersection while exempting legal adjacent shared contour endpoints;
- validates inter-contour crossing, overlap and boundary contact;
- supports mixed Line/Circle/Arc/Spline source combinations through D.1-derived tessellation;
- preserves traceability with `componentKey`, optional `profileKey` projections, and sorted source `kind + elementId` references;
- propagates D.3 ambiguity/unclassified evidence into D.4 status without erasing upstream uncertainty;
- returns frozen deterministic `contourValidations[]`, `profileRegionValidations[]`, `diagnostics[]` and `upstreamDiagnostics[]`;
- does not create topology connectivity, persistent points, StableReferences, UI selection, extrusion behavior or recompute/dependency integration.

Crossing/overlap between distinct contours is classified `INVALID`; pure boundary touch is classified `AMBIGUOUS`. Self-intersection and proven zero-area/degenerate geometry are `INVALID`. Upstream evidence that cannot be promoted to proven invalidity remains `AMBIGUOUS` or `UNRESOLVED`.

### Numerical / tessellation boundary

D.4 uses only deterministic D.1 tessellation carried through D.2/D.3 as read-only numerical evidence. Samples do not create persistent geometry, replace analytic identity, alter point IDs/connectivity, or introduce tolerance-based rebinding. The D.4 public status contract explicitly retains `AMBIGUOUS`/`UNRESOLVED` for cases where available derived evidence cannot justify certainty.

### Regression implementation

`tests/wd-21d4-mixed-analytic-geometry-validation.mjs` covers the documented minimum including:

- valid closed Line contour and standalone Circle;
- valid mixed Line+Arc and Line+Spline contours with source traceability;
- bow-tie/self-crossing contour;
- zero-area/degenerate contour;
- valid outer+hole;
- touching and crossing outer/hole cases;
- crossing and touching independent contours;
- mixed Circle↔Line inter-contour contact with source-kind traceability;
- legal adjacent shared endpoint negative control;
- insertion-order independence;
- sketch/D.3 non-mutation;
- build identity and exclusion checks.

`.github/workflows/wd-21d4-mixed-analytic-geometry-validation.yml` runs A.2, C.2 and D.1–D.4 regressions on the D branch. Existing C.2, D.2 and D.3 build-ID assertions were widened only as required to accept the authorized D.4 visible build.

### Compatibility / exclusion boundary

Existing line-only `src/model/sketch-profile.js` remains compatibility behavior and is not migrated. Existing extrusion and legacy profile consumers remain unchanged.

D.4 does not implement geometric healing, Trim/Split, Snap/Merge, tolerance-based rebinding, automatic intersection-point creation, new sketch editor functionality, D.5 combined profile/open-path API, Stable Profile/Path References, profile/path viewer selection/highlighting, extrusion conversion, hole/multi-profile extrusion runtime behavior, or dependency/recompute integration.

### Build identity

The central `BUILD_ID` in `src/main.js` is now `WD-21D.4`. Existing `applyBuildIdentity()` remains the single authority applying the same value to `document.title` and the visible brand/build label. Any correction inside this implementation step must use `WD-21D.4-R1`, `-R2`, etc.

### Current implementation gate state

D.4 implementation and dedicated regression/workflow are present, but no PASS/FROZEN claim is made in this implementation step. Automated CI evidence on the final implementation head and later real-device regression remain separate gates.

## WD-21D.5 – Generic Profile / Open Path Derivation API

**Status:** DEFINED / NOT IMPLEMENTED

D.5 owns the central combined `profiles/openPaths/invalidComponents/diagnostics` API and is not implemented by D.4.

## WD-21D.6 – Derivation Regression / Compatibility Gate

**Status:** DEFINED / NOT IMPLEMENTED

Full WD-21D integration/freeze remains later and requires D.1–D.5 PASS / 0 BLOCKER.

## Explicitly excluded from WD-21D

Profile/path selection UI, StableReference PROFILE/PATH target kinds, concrete feature profile/path references, extrusion conversion, extrusion holes/multi-profile runtime, dependency/recompute integration, new sketch drawing tools, Spline control editing/gizmo, constraints, snap/auto-merge/tolerance/geometric rebinding and N-Gon/faceted-circle identity changes remain excluded.

## Build / branch rule

The active branch is `feature/wd-21d-profile-open-path-derivation`. The active visible implementation build identity is `WD-21D.4`; central `applyBuildIdentity()` applies it consistently to browser title and visible brand/build label. Corrections inside D.4 use `WD-21D.4-R1`, `-R2`, etc.

## Next permissible step

WD-21D.4 implementation is present but is NOT PASS and NOT FROZEN in this step. The next permissible step is exclusively **WD-21D.4 Completion / Automated Regression Gate** against the final implementation branch head. No D.5 work, device PASS or freeze is authorized in this implementation step.
