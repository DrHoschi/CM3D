# WD-21D – Profile & Open Path Derivation

**Status:** ACTIVE / WD-21D.1 PASS / FROZEN / WD-21D.2 PASS / FROZEN / WD-21D.3 IMPLEMENTED / REGRESSION PASS / NOT FROZEN  
**Definition basis:** frozen WD-21C.8-R2 @ `b29efc297ab8183a9e5879798bb6fd9da201cdf2`  
**Branch:** `feature/wd-21d-profile-open-path-derivation`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-11

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

**Status:** IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE NOT VERIFIED / NOT FROZEN

**Documented contract head:** `3168608b21dc97cef6e11512ad66eaf5a11b7a8b`  
**Current implementation evidence head:** `f222c09a31937e0753a1c866bd997e38450f1cb3`  
**Visible build identity:** `WD-21D.3`

### D.3 authority and input boundary

WD-21D.3 consumes exclusively the frozen D.2 graph/component derivation as its contour authority. Only components with `classification === CLOSED_CONTOUR` are candidates for profile-region derivation. `OPEN_PATH` and `INVALID_COMPONENT` never produce profile regions. D.3 does not reread persistent element collections as a parallel contour authority and does not mutate sketch data, D.1 curves, D.2 components, topology IDs, or analytic geometry.

### Profile-region contract

A D.3 profile region represents one filled planar region and contains a deterministic derived `profileKey`, one `outerContour`, deterministic `holes[]`, nesting metadata, and full source traceability back through D.2/D.1 to `kind + elementId`. `profileKey` is derived only and is not a persistent profile identity or WD-21E StableReference identity.

One standalone non-nested closed contour creates one region with `holes: []`. Multiple separate closed contours create independent profile regions. Containment depth is classified by parity: depth 0 outer, depth 1 hole, depth 2 island/new region, depth 3 hole, and so on. Thus `outer → hole → island → hole` remains structurally preserved.

### Determinism and geometry-evaluation boundary

Containment parent selection, nesting depth, profile ordering, and hole ordering are deterministic and independent of collection insertion order. D.1/D.2 tessellation is used only as a derived computational representation for containment. Signed area/winding are derived metadata/computational aids only and never rewrite persistent sketch curves.

D.3 does not own final mixed-analytic validity. Self-intersection, degeneracy, touching/intersecting ambiguity and other geometric validity remain D.4. D.3 emits/propagates diagnostics for unclassifiable derived geometry and never repairs, snaps, merges, trims, rebinds or geometrically guesses.

### Implemented scope

- `src/model/sketch-profile-region-derivation.js` — pure D.3 profile-region/nesting authority consuming frozen D.2.
- `deriveSketchProfileRegions(sketch)` returns frozen `profileRegions[]`, `unclassifiedContours[]`, and `diagnostics[]`.
- Profile regions preserve D.2 component/source traceability, deterministic `profileKey`, outer contour, holes and nesting depth.
- `tests/wd-21d3-profile-region-nesting-derivation.mjs` covers standalone closed line contour, Circle, separate regions, outer+hole, outer+hole+island+hole, mixed Line+Arc, mixed Line+Spline, deterministic insertion-order independence, open/invalid exclusion and non-mutation.
- `.github/workflows/wd-21d3-profile-region-nesting-derivation.yml` runs A.2, C.2, D.1, D.2 and D.3 regressions.
- `src/main.js` changes only the central visible build identity to `WD-21D.3`; existing `applyBuildIdentity()` remains authoritative for browser title and visible brand/build label.
- Existing C.2/D.2 build-ID assertions receive only the forward compatibility required for D.3.
- Existing `src/model/sketch-profile.js`, extrusion, selection, StableReference and recompute/dependency code remain unchanged.

### Automated evidence

On implementation evidence head `f222c09a31937e0753a1c866bd997e38450f1cb3`:

- D.3 `profile-region-regression`: SUCCESS.
- D.2 `path-graph-derivation-regression`: SUCCESS.
- D.1 `curve-derivation-regression`: SUCCESS.
- Normal build was still running when this implementation-status documentation was written; final build/deploy evidence belongs to the subsequent Completion / Regression / Device Verification Gate.

### Boundary against D.4 and later blocks

D.3 does not implement the D.4 final self-intersection/degeneracy/mixed-analytic validity authority, the D.5 combined profile/open-path API, Stable Profile/Path References, profile/path viewer selection/highlighting, extrusion conversion, extrusion holes/multi-profile runtime behavior, dependency/recompute integration, geometric auto-connect, tolerance/snap/rebinding, or any new sketch drawing/editing capability.

Existing line-only `src/model/sketch-profile.js` remains compatibility behavior. No existing extrusion or legacy profile consumer is migrated in D.3.

## WD-21D.4 – Mixed Analytic Geometry Validation

**Status:** DEFINED / NOT IMPLEMENTED

Later D.4 owns mixed analytic geometric validity including self-intersection, degeneracy and ambiguous intersection/nesting cases. No D.4 implementation has begun.

## WD-21D.5 – Generic Profile / Open Path Derivation API

**Status:** DEFINED / NOT IMPLEMENTED

Later D.5 owns the central profiles/openPaths/invalidComponents/diagnostics API. Existing `getSingleExtrudableProfile(...)` remains compatibility behavior during D.3.

## WD-21D.6 – Derivation Regression / Compatibility Gate

**Status:** DEFINED / NOT IMPLEMENTED

Full WD-21D integration/freeze remains later and requires D.1–D.5 PASS / 0 BLOCKER.

## Explicitly excluded from WD-21D

Profile/path selection UI, StableReference PROFILE/PATH target kinds, concrete feature profile/path references, extrusion conversion, extrusion holes/multi-profile runtime, dependency/recompute integration, new sketch drawing tools, Spline control editing/gizmo, constraints, snap/auto-merge/tolerance/geometric rebinding and N-Gon/faceted-circle identity changes remain excluded.

## Build / branch rule

The active branch is `feature/wd-21d-profile-open-path-derivation`. The visible implementation build identity is now `WD-21D.3`; central `applyBuildIdentity()` applies the same value to `document.title` and the visible brand/build label. A correction inside D.3 must use `WD-21D.3-R1`, `-R2`, etc.

## Next permissible step

WD-21D.3 is implemented and its dedicated automated regression is PASS, but it is not device verified or frozen. The next permissible step is exclusively WD-21D.3 Completion / Regression / Device Verification Gate against the final implementation branch head. No D.4 work and no automatic freeze is authorized in this implementation step.
