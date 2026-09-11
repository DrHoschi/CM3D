# WD-21D – Profile & Open Path Derivation

**Status:** ACTIVE / WD-21D.1 PASS / FROZEN / WD-21D.2 PASS / FROZEN / 0 BLOCKER  
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

### D.2 authority and input boundary

WD-21D.2 consumes exclusively D.1 `deriveSketchCurves(...)`. It does not reread persistent Line/Circle/Arc/Spline collections as a parallel graph authority. The implementation is a pure derived model and does not mutate sketch data or D.1 curves.

### Connectivity authority

Line/Arc/Spline graph connectivity exists only through identical authoritative `pointId` endpoint references. Coordinate equality, geometric coincidence, tolerance, proximity, snap assumptions or best-guess matching never create connectivity. Circle bypasses the endpoint graph and is emitted as its own one-element `CLOSED_CONTOUR` without synthetic endpoints.

### Component classification

Every D.2 component is exactly one of `CLOSED_CONTOUR`, `OPEN_PATH`, or `INVALID_COMPONENT`.

A non-branching endpoint component with exactly two degree-1 points and all remaining points degree 2 is `OPEN_PATH`. A completely traversable component with every involved point degree 2 is `CLOSED_CONTOUR`. Branching, invalid degree structures, or non-orderable components become `INVALID_COMPONENT` plus diagnostics; they are never silently repaired.

### Deterministic traversal

Component discovery, component keys and traversal are based on stable source identity and authoritative point IDs, independent of collection insertion order. Open paths start canonically at the lexicographically smaller degree-1 `pointId`. Closed contours choose a reproducible source/topology-based traversal without area/winding logic. Reverse traversal uses D.1 `reverseDerivedCurve(...)` and never rewrites persistent geometry.

### Derived output

The central D.2 authority is `src/model/sketch-path-graph-derivation.js` via `deriveSketchPathGraph(sketch)`. It returns frozen `components[]` and `diagnostics[]`. Components contain deterministic `componentKey`, ordered `curves[]`, classification, and open-path start/end point IDs. `componentKey` is derived only and is explicitly not a WD-21E StableReference identity.

### Implemented scope

- `src/model/sketch-path-graph-derivation.js` — pure D.2 graph/component authority consuming D.1.
- `tests/wd-21d2-deterministic-path-graph-derivation.mjs` — D.2 regression.
- `.github/workflows/wd-21d2-deterministic-path-graph-derivation.yml` — D.2 automated gate including A.2, C.2 and D.1 regressions.
- `src/main.js` — central visible build identity only, `WD-21D.2`; `applyBuildIdentity()` remains the single authority for browser title and visible brand/build label.
- Existing D.1 and C.2 build-ID assertions received only the forward-compatibility required to accept D.2.
- Existing `src/model/sketch-profile.js`, extrusion, selection, StableReference and recompute/dependency code remain unchanged.

### Completion / regression / device evidence

Final scope audit from documented D.2 contract head `1f7715f80160aa205c306a1129b4a19d2f4852a7` to final tested branch head `4bcf862e7e7a019557a9a03952294a2e54393f6c`: **10 commits ahead / 0 behind**. The changed scope is limited to the D.2 graph authority, dedicated D.2 regression/workflow, central `WD-21D.2` build identity, forward-compatible build assertions, and D.2 status documentation. No D.3 profile-region/hole logic, D.4 geometry validation, D.5 public profile/path API, StableReference, selection, extrusion conversion or recompute/dependency integration was introduced.

Automated regression on the final branch line is PASS:

- `WD-21D.1 Generic Sketch Curve Derivation Regression`, final-head run `34629934724`: SUCCESS.
- `WD-21D.2 Deterministic Path Graph Derivation Regression`, final-head run `34629934765`: SUCCESS.
- Earlier core implementation evidence on `7647ede8d45e77799bb5ce7326dbf1a9a3df29fb`: D.1 run `34629766355` SUCCESS and D.2 run `34629766381` SUCCESS.

Real iPad/Safari device gate on visible build `WD-21D.2`: **1–7 PASS**. Verified were consistent browser-tab/header build identity, creation and visibility of Line/Circle/Arc/Spline, Object-Tree selection and viewer focus, existing Point/Line/Circle gizmo behavior with Arc/Spline remaining no-gizmo, Connect/Disconnect regression using authoritative endpoint topology, Undo/Redo, Save/Reload persistence, and the absence of premature profile/open-path selection, hole/nesting or extrusion capabilities.

### Validation boundary

D.2 classifies graph structure only. It does not decide signed area/winding, outer vs hole, nesting/containment, profile regions, self-intersection, geometric zero-area validity, analytic contour intersection validity or extrusion suitability. The old line-only `src/model/sketch-profile.js` remains compatibility behavior and is not switched to D.2 in this step.

### Explicit D.2 exclusions

No D.3 profile-region or hole/nesting work, no area/winding normalization, no D.4 mixed-geometry validation, no StableReference profile/path identity, no profile/path selection/highlight UI, no extrusion conversion, no dependency/recompute integration, no tolerance/snap/rebinding, and no new sketch drawing/editing capability.

## WD-21D.3 – Closed Profile Region & Nesting Derivation

**Status:** DEFINED / NOT IMPLEMENTED

Later D.3 classifies valid closed contours into deterministic profile regions, including multiple independent outers and nested holes. No D.3 implementation has begun.

## WD-21D.4 – Mixed Analytic Geometry Validation

**Status:** DEFINED / NOT IMPLEMENTED

Later D.4 owns mixed analytic geometric validity including self-intersection, degeneracy and ambiguous intersection/nesting cases. No D.4 implementation has begun.

## WD-21D.5 – Generic Profile / Open Path Derivation API

**Status:** DEFINED / NOT IMPLEMENTED

Later D.5 owns the central profiles/openPaths/invalidComponents/diagnostics API. Existing `getSingleExtrudableProfile(...)` remains compatibility behavior during D.2.

## WD-21D.6 – Derivation Regression / Compatibility Gate

**Status:** DEFINED / NOT IMPLEMENTED

Full WD-21D integration/freeze remains later and requires D.1–D.5 PASS / 0 BLOCKER.

## Explicitly excluded from WD-21D

Profile/path selection UI, StableReference PROFILE/PATH target kinds, concrete feature profile/path references, extrusion conversion, extrusion holes/multi-profile runtime, dependency/recompute integration, new sketch drawing tools, Spline control editing/gizmo, constraints, snap/auto-merge/tolerance/geometric rebinding and N-Gon/faceted-circle identity changes remain excluded.

## Build / branch rule

The active branch is `feature/wd-21d-profile-open-path-derivation`. The frozen D.2 visible implementation build identity is `WD-21D.2`; central `applyBuildIdentity()` applies the same value to `document.title` and the visible brand/build label. A later correction that explicitly reopens D.2 would require a separate authorization and visible `WD-21D.2-R1`, `-R2`, etc.

## Next permissible step

WD-21D.2 is PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER. WD-21D.3 does not begin automatically. The next permissible step is exclusively a separate WD-21D.3 reconciliation/definition against this frozen D.2 stand; no D.3 implementation is authorized by the D.2 freeze.
