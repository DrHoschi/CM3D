# WD-21D – Profile & Open Path Derivation

**Status:** ACTIVE / WD-21D.1 PASS / FROZEN / WD-21D.2 PASS / FROZEN / WD-21D.3 PASS / FROZEN / WD-21D.4-R2 PASS / FROZEN / 0 BLOCKER  
**Definition basis:** frozen WD-21C.8-R2 @ `b29efc297ab8183a9e5879798bb6fd9da201cdf2`  
**Branch:** `feature/wd-21d-profile-open-path-derivation`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-13

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

Changed scope is limited to new pure D.3 profile-region/nesting model authority, dedicated D.3 regression/workflow, central visible build identity `WD-21D.3`, minimum forward compatibility in existing build-ID assertions, and D.3 status documentation. No D.4 geometric validity implementation, D.5 combined profile/open-path API, Stable Profile/Path References, profile/path viewer selection/highlighting, extrusion conversion, hole/multi-profile extrusion runtime, dependency/recompute integration, geometric auto-connect, tolerance/snap/rebinding, or new sketch editing capability was introduced.

### Final automated and device evidence

On exact final product head `9257b63f7e8a24f55d4d0a0181f96ff2daf3e04f`, normal build, GitHub Pages deploy, build-status reporting, D.3 profile-region regression, D.2 path-graph regression and D.1 curve-derivation regression were SUCCESS. Real-device verification on visible build `WD-21D.3`: **1–7 PASS**. WD-21D.3 is PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER.

## WD-21D.4 – Mixed Analytic Geometry Validation

**Status:** PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER

**Documented contract head:** `9d2503998610fba0bd6bdf79d98a97dba702e393`  
**Frozen implementation/product head:** `f0370e81c13779fedddef7962f3dc894ba44609f`  
**Visible build identity:** `WD-21D.4-R2`

### D.4 authority and input boundary

WD-21D.4 is a pure read/validation layer over the frozen D.1 → D.2 → D.3 derivation chain. It validates derived analytic geometry only and MUST NOT mutate persistent sketch geometry, D.1 curves, D.2 components, D.3 profile regions, topology IDs, source element IDs, or project state. D.1 remains curve authority, D.2 connectivity/component authority, and D.3 profile-region/nesting authority.

D.4 classifies validation results as `VALID`, `INVALID`, `AMBIGUOUS`, or `UNRESOLVED`. Ambiguous/unresolved geometry MUST NOT be silently accepted or automatically repaired. D.4 covers deterministic degeneracy, zero-area, self-intersection, inter-contour crossing/overlap/contact and mixed Line/Circle/Arc/Spline validity while preserving source traceability. Legal shared authoritative topology endpoints are not self-intersections merely because endpoint coordinates are equal.

D.4 may use deterministic D.1 tessellation as read-only numerical evidence. Tessellation MUST NOT create persistent geometry, replace analytic identity, alter connectivity, or become tolerance-based rebinding. Where evidence is insufficient, D.4 returns `AMBIGUOUS` / `UNRESOLVED` rather than inventing certainty.

Existing line-only `src/model/sketch-profile.js` remains compatibility behavior and existing extrusion/legacy consumers remain unchanged. `src/model/sketch-geometry-validation.js` implements the D.4 read model through `validateSketchProfileGeometry(sketch)` and `SketchGeometryValidity`. No extrusion integration, StableReference, profile/path selection, dependency/recompute, healing, trim/split, snap/merge or D.5 combined API was introduced.

### Final scope / automated / device evidence

The frozen D.4-R2 implementation/product head `f0370e81c13779fedddef7962f3dc894ba44609f` was audited against documented D.4 contract head `9d2503998610fba0bd6bdf79d98a97dba702e393`: **20 commits ahead / 0 behind**. Changed scope remained limited to the D.4 validation authority, dedicated regression/workflow, build identity compatibility and status documentation.

On the exact frozen head, normal build, GitHub Pages deploy, report-build-status and D.1–D.4 regressions all completed SUCCESS. Real-device regression on visible build `WD-21D.4-R2`: **1–7 PASS**.

### Circle geometry / viewer consistency reconciliation

The device review raised a non-D.4 observation that a Circle with Inspector radius `1 m` appeared visually wider than expected against the sketch grid. Reconciliation confirmed **no Circle geometry inconsistency**: Inspector, viewport tessellation and Circle gizmo use the same authoritative center/radius values. The sketch-local `GridHelper(10,20)` uses `0.5 m` minor spacing, so radius `1 m` correctly produces a diameter spanning four minor grid cells. Future configurable/explicit sketch-grid spacing is recorded as **NON-BLOCKING / LATER SKETCH-GRID UX**, not as D.4 scope or geometry defect.

**WD-21D.4-R2 is PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER.**

## WD-21D.5 – Generic Profile / Open Path Derivation API

**Status:** RECONCILED / DEFINED / CONTRACT BOUNDED / NOT IMPLEMENTED

**Definition basis:** frozen WD-21D.4-R2 product head `f0370e81c13779fedddef7962f3dc894ba44609f`

### D.5 authority and input boundary

WD-21D.5 is exclusively the common public read API over the already frozen D.2/D.3/D.4 authorities. It MUST NOT create a second curve derivation, graph, contour/nesting derivation, intersection engine, validation authority, persistent identity system, or geometry mutation path.

D.5 consumes the existing D.2 path/component derivation, D.3 profile-region/nesting derivation and D.4 mixed-analytic validation. D.1 remains the underlying generic curve authority through those frozen layers.

The central D.5 API MUST expose, at minimum, deterministic read-only collections for:

- `profiles[]`;
- `openPaths[]`;
- `invalidComponents[]`;
- `unclassifiedContours[]`;
- `diagnostics[]`;
- a combined profile-geometry/validation status derived from the existing D.4 authority.

The expected implementation boundary is one pure model-level orchestration/read-model module, provisionally `src/model/sketch-profile-path-derivation.js`, with one central function provisionally named `deriveSketchProfilesAndPaths(sketch)`. Exact naming may be confirmed at the D.5 Definition/Implementation Gate without changing the contract.

### Profile contract

`profiles[]` MUST be sourced from D.3 `profileRegions[]`. Each profile preserves the existing derived `profileKey`, `outerContour`, `holes[]`, nesting metadata and source traceability through D.2/D.1 to source `kind + elementId`. D.5 associates the corresponding D.4 validation state with the profile.

Profiles classified by D.4 as `INVALID`, `AMBIGUOUS` or `UNRESOLVED` MUST remain present and explicitly classified. D.5 MUST NOT silently discard them or promote them to valid. Acceptance/rejection for a later modeling feature belongs to that later consumer, not to D.5.

D.3 `profileKey` remains derived only. D.5 MUST NOT promote it to a persistent profile identity or StableReference target.

### Open path contract

`openPaths[]` MUST be sourced exclusively from D.2 components classified as `OPEN_PATH`. Each open path preserves its D.2 `componentKey`, deterministic ordered `curves[]`, `startPointId`, `endPointId`, and D.1 source identity/traceability.

D.5 MUST NOT generate a new persistent `pathId`, StableReference key, geometric endpoint merge, snap/tolerance match or alternate path ordering. D.2 `componentKey` remains derived only.

### Invalid and unclassified contract

`invalidComponents[]` MUST expose D.2 `INVALID_COMPONENT` results and their available deterministic diagnostic/source traceability rather than hiding them.

D.3 `unclassifiedContours[]` MUST remain separately observable. They MUST NOT be silently relabeled as valid profiles, normal open paths, or ordinary D.2 invalid components.

### Diagnostics and validation aggregation

D.5 MUST preserve relevant diagnostics from the frozen D.1→D.4 derivation chain and expose them in deterministic ordering. It may associate/group existing diagnostics with the combined read model but MUST NOT reinterpret them into a competing geometry-validity authority.

D.4 remains the authority for `VALID`, `INVALID`, `AMBIGUOUS`, and `UNRESOLVED` profile-geometry validity. D.5 MUST NOT erase upstream ambiguity because another derived view appears approximately valid.

### Determinism / immutability contract

D.5 output MUST be deterministic and independent of JavaScript collection insertion order. Returned data MUST be read-only/deep-frozen consistently with the D.1–D.4 derived model chain.

Calling the D.5 API MUST NOT mutate the input sketch, persistent project data, D.1 curves, D.2 components, D.3 profile regions, D.4 validation results, topology IDs, source element IDs, or collection ordering.

### Compatibility boundary

Existing line-only `src/model/sketch-profile.js` and `getSingleExtrudableProfile(...)` remain unchanged compatibility behavior. D.5 MUST NOT replace, redirect, migrate, or alter the existing extrusion product path in this block.

D.5 therefore establishes the generic combined profile/path read authority needed by later consumers, but does not itself make current extrusion consume mixed Line/Circle/Arc/Spline profiles, holes, multiple profiles or open paths.

### D.5 regression contract

Dedicated D.5 regression MUST prove at minimum:

- an open Line path derives one `openPaths[]` entry and no profile;
- a mixed Line+Arc+Spline open component remains one deterministically ordered open path with source identity;
- a standalone Circle derives a profile and no open path;
- multiple separate closed contours remain multiple profiles where D.3 classifies them as such;
- outer+hole remains one profile with its hole;
- outer+hole+island preserves D.3 parity/nesting and the resulting separate profile region(s);
- a D.2 branching/invalid component remains visible in `invalidComponents[]`;
- D.4 self-intersection/invalid geometry remains discoverable and explicitly `INVALID`, not discarded;
- D.4 boundary-touch ambiguity remains discoverable and explicitly `AMBIGUOUS`/`UNRESOLVED` as supplied by D.4;
- D.3 unclassified geometry remains in `unclassifiedContours[]`;
- output/diagnostic ordering is insertion-order independent;
- complete sketch and D.1–D.4 non-mutation is preserved.

### Explicit D.5 exclusions

D.5 MUST NOT implement Stable Profile/Path References, persistent profile/path IDs, SelectionRef extensions, viewer hit-testing/highlighting/focus for profiles or paths, Object-Tree/Inspector profile/path UI, extrusion conversion, hole/multi-profile extrusion runtime, open-path modeling features, dependency/recompute integration, geometric auto-connect, snap/merge/tolerance rebinding, Trim/Split/healing, new sketch drawing tools, Spline control editing, or any new visible modeling capability.

No visible build identity change is authorized by this documentation step. The frozen product identity remains `WD-21D.4-R2` until a separate D.5 implementation is explicitly authorized.

## WD-21D.6 – Derivation Regression / Compatibility Gate

**Status:** DEFINED / NOT IMPLEMENTED

Full WD-21D integration/freeze remains later and requires D.1–D.5 PASS / 0 BLOCKER.

## Explicitly excluded from WD-21D

Profile/path selection UI, StableReference PROFILE/PATH target kinds, concrete feature profile/path references, extrusion conversion, extrusion holes/multi-profile runtime, dependency/recompute integration, new sketch drawing tools, Spline control editing/gizmo, constraints, snap/auto-merge/tolerance/geometric rebinding and N-Gon/faceted-circle identity changes remain excluded.

## Build / branch rule

The active branch is `feature/wd-21d-profile-open-path-derivation`. The frozen visible D.4 implementation build identity remains `WD-21D.4-R2`; central `applyBuildIdentity()` applies the same value to `document.title` and the visible brand/build label. This D.5 documentation step MUST NOT change that identity.

## Next permissible step

WD-21D.5 is **RECONCILED / DEFINED / CONTRACT BOUNDED / NOT IMPLEMENTED**. The next permissible step is exclusively the separate **WD-21D.5 Definition/Implementation Gate** against this documented contract: determine the exact minimal model file/API shape, reuse of D.2/D.3/D.4 calls, diagnostic aggregation boundary and dedicated D.5 regression/workflow scope. No D.5 implementation, build-ID change, D.6 work, extrusion integration, StableReference work or visible profile/path UI in that gate.