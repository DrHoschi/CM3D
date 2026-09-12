# WD-21D – Profile & Open Path Derivation

**Status:** ACTIVE / WD-21D.1 PASS / FROZEN / WD-21D.2 PASS / FROZEN / WD-21D.3 PASS / FROZEN / WD-21D.4-R2 PASS / FROZEN / 0 BLOCKER  
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

**Status:** PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER

**Documented contract head:** `9d2503998610fba0bd6bdf79d98a97dba702e393`  
**Frozen implementation/product head:** `f0370e81c13779fedddef7962f3dc894ba44609f`  
**Visible build identity:** `WD-21D.4-R2`

### D.4 authority and input boundary

WD-21D.4 is a pure read/validation layer over the frozen D.1 → D.2 → D.3 derivation chain. It validates derived analytic geometry only and MUST NOT mutate persistent sketch geometry, D.1 curves, D.2 components, D.3 profile regions, topology IDs, source element IDs, or project state.

D.4 validates Line, Circle, Arc and Spline geometry, including mixed curve-type combinations within closed contours and geometric relationships between closed contours/profile-region boundaries.

D.4 MUST NOT reread persistent element collections as a competing topology/profile authority. D.1 remains curve authority, D.2 remains connectivity/component authority, and D.3 remains profile-region/nesting authority.

### Validation status contract

D.4 classifies validation results using at least the semantic states:

- `VALID` — the checked derived geometry satisfies the D.4 validity rules;
- `INVALID` — a deterministic geometric invalidity is proven;
- `AMBIGUOUS` / `UNRESOLVED` — available derived geometry is insufficient for a trustworthy deterministic validity decision.

An ambiguous case MUST NOT be silently accepted as valid and MUST NOT be automatically repaired.

### Mandatory invalidity classes

D.4 owns deterministic detection/reporting of at least:

- degenerate or zero-area closed contours;
- self-intersection within one closed contour;
- forbidden intersection or boundary contact between an outer contour and a hole contour;
- intersection or boundary contact between otherwise independent closed contours when that makes profile-region validity ambiguous/invalid;
- derived analytic curve segments that are geometrically degenerate despite valid stored topology;
- ambiguous containment where a contour lies on, touches, or crosses another contour boundary.

D.4 MUST distinguish legal shared authoritative topology junctions inside one D.2 contour from true self-intersections. Adjacent Line/Arc/Spline curves meeting at their shared authoritative endpoint are not self-intersections merely because their endpoint coordinates are equal.

### Mixed analytic intersection boundary

The validation contract applies across curve-type combinations, including at minimum Line↔Line, Line↔Arc, Line↔Spline, Arc↔Arc, Arc↔Spline, Spline↔Spline, and Circle↔other closed/derived curve geometry where those combinations participate in contour/profile validity.

Non-adjacent geometric crossings inside the same contour are self-intersection candidates. Crossings/touching between different closed contours are inter-contour validity candidates.

D.4 MUST NOT create topology connectivity from geometric intersections. Geometry intersection and topology identity remain separate concepts.

### Numerical / tessellation boundary

D.4 may use the deterministic D.1 tessellation carried through D.2/D.3 as a read-only numerical representation for intersection, degeneracy and contact checks.

Tessellation samples MUST NOT:

- create new persistent points or elements;
- replace analytic Line/Circle/Arc/Spline source identity;
- alter point IDs or connectivity;
- become a tolerance-based rebinding mechanism.

Where the fixed derived tessellation cannot support a trustworthy decision, D.4 MUST return `AMBIGUOUS` / `UNRESOLVED` rather than inventing certainty. A later more precise analytic intersection implementation may strengthen internal evidence without changing this public D.4 validity contract.

### Diagnostics and source traceability

D.4 validation diagnostics MUST be deterministic and traceable to the existing derived/source identities. Diagnostics should identify the relevant available keys, including as applicable:

- D.2 `componentKey`;
- D.3 `profileKey`;
- outer/hole contour component keys;
- source curve `kind + elementId` pairs involved in the validity finding.

Diagnostic ordering MUST be deterministic and independent of JavaScript collection insertion order.

D.2 `componentKey` and D.3 `profileKey` remain derived keys only and MUST NOT be promoted into persistent StableReference identity in D.4.

### D.3 diagnostic reconciliation boundary

Existing D.3 signals such as `D3_UNCLASSIFIED_GEOMETRY` and `AMBIGUOUS_BOUNDARY_CONTACT` are input evidence for D.4, not final D.4 validity authority. D.4 may preserve/propagate those diagnostics while adding its own deterministic validation result.

D.4 MUST NOT silently erase an upstream ambiguity merely because downstream sampling appears approximately valid.

### Compatibility boundary

Existing line-only `src/model/sketch-profile.js` remains compatibility behavior. Its current line-specific `ZERO_AREA` and `SELF_INTERSECTION` checks MUST NOT become the generic D.4 authority and MUST NOT be migrated into extrusion behavior in this step.

D.4 creates only the new generic mixed-analytic validation read model. Existing extrusion and legacy profile consumers remain unchanged.

### D.4 regression contract

D.4 regression MUST prove at minimum:

- a simple valid closed Line contour validates as valid;
- a valid standalone Circle validates as valid;
- valid mixed Line+Arc and Line+Spline closed contours validate without losing source identity;
- a bow-tie/self-crossing closed contour is detected as invalid self-intersection;
- zero-area/degenerate closed contour is invalid or unresolved according to deterministic evidence, never silently valid;
- valid outer+hole geometry with no contact remains valid;
- a hole touching the outer boundary is invalid/ambiguous with deterministic diagnostics;
- a hole crossing the outer boundary is invalid;
- two otherwise independent closed contours that cross are reported invalid/ambiguous as appropriate;
- two otherwise independent closed contours that only touch are not silently accepted;
- adjacent contour curves sharing one authoritative topology endpoint are not falsely reported as self-intersection;
- mixed curve-type intersection checks preserve `kind + elementId` traceability;
- output and diagnostic ordering are insertion-order independent;
- sketch data and D.1/D.2/D.3 derived data remain unmodified;
- no StableReference, profile/path selection UI, extrusion conversion, dependency/recompute integration, snap/tolerance/rebinding, trimming, splitting or healing is introduced.

### Explicit D.4 exclusions

D.4 MUST NOT implement geometric auto-healing, Trim/Split, Snap/Merge, tolerance-based topology rebinding, automatic intersection-point creation, new sketch editor functionality, D.5 combined profile/open-path API, Stable Profile/Path References, profile/path viewer selection/highlighting, extrusion conversion, extrusion hole/multi-profile runtime behavior, or dependency/recompute integration.

### D.4 implementation boundary

The expected implementation is one pure model-level mixed analytic validation authority consuming the frozen D.1/D.2/D.3 chain, plus dedicated D.4 regression and workflow. The exact combined public `profiles/openPaths/invalidComponents/diagnostics` API remains owned by D.5 and MUST NOT be preempted by D.4.

The preceding contract was documented before implementation. The separately authorized implementation retains these boundaries and changes the visible product identity to the active D.4 correction build.

### D.4 implementation state

`src/model/sketch-geometry-validation.js` implements the pure D.4 read model through `validateSketchProfileGeometry(sketch)` and `SketchGeometryValidity`. It consumes `deriveSketchProfileRegions(sketch)`, gathers D.3 outer/hole/unclassified contours deterministically, validates zero-area/degenerate geometry, intra-contour self-intersection, inter-contour crossing/overlap/contact, and preserves sorted `kind + elementId` traceability.

The implementation exposes `VALID`, `INVALID`, `AMBIGUOUS`, and `UNRESOLVED`. Proven crossing/overlap, self-intersection and proven zero-area/degeneracy are invalid; pure inter-contour boundary touch remains ambiguous. Existing D.3 ambiguity/unclassified diagnostics are retained as upstream evidence.

`tests/wd-21d4-mixed-analytic-geometry-validation.mjs` covers the mandatory contract cases, mixed curve source traceability, insertion-order determinism and non-mutation. `.github/workflows/wd-21d4-mixed-analytic-geometry-validation.yml` runs A.2, C.2 and D.1–D.4 regressions. Existing C.2/D.2/D.3 build-ID assertions are widened only to accept the authorized D.4 identity.

The initial D.4 regression failed only because the intended pure-touch Hole fixture used a rectangle edge collinear with the outer boundary, which correctly produced `OVERLAP → INVALID`. R1 replaced that fixture with a triangle touching at exactly one boundary point. The R1 regression then exposed the same fixture defect in the independent-contour touch case: the two rectangles shared a complete collinear boundary segment, again correctly producing `INVALID`. R2 replaces the independent-contour fixture with an outside triangle touching the rectangle at exactly one point. `src/model/sketch-geometry-validation.js` remains unchanged by both R1 and R2.

No extrusion integration, StableReference, profile/path selection, dependency/recompute, healing, trim/split, snap/merge or D.5 combined API was introduced.

### Final scope audit

The frozen D.4-R2 implementation/product head `f0370e81c13779fedddef7962f3dc894ba44609f` was audited against documented D.4 contract head `9d2503998610fba0bd6bdf79d98a97dba702e393`: **20 commits ahead / 0 behind**.

Changed scope remains limited to the expected nine files: new pure D.4 validation authority, dedicated D.4 regression/workflow, central visible build identity, minimum forward compatibility in existing C.2/D.2/D.3 build assertions, and D.4 status documentation. No D.5 API, Stable Profile/Path Reference, profile/path selection, extrusion conversion, dependency/recompute integration, healing, trim/split, snap/merge or topology rebinding was introduced.

### Final automated evidence

On exact frozen implementation/product head `f0370e81c13779fedddef7962f3dc894ba44609f`, all seven final checks completed successfully:

- normal `build`: SUCCESS;
- GitHub Pages `deploy`: SUCCESS;
- `report-build-status`: SUCCESS;
- D.1 `curve-derivation-regression`: SUCCESS;
- D.2 `path-graph-derivation-regression`: SUCCESS;
- D.3 `profile-region-regression`: SUCCESS;
- D.4 `mixed-analytic-validation-regression`: SUCCESS.

### Real iPad/Safari device evidence

Real-device regression on visible build `WD-21D.4-R2`: **1–7 PASS**.

Verified were consistent browser-tab/application-header build identity, continued creation/display of Line/Circle/Arc/Spline, Object-Tree selection and viewer focus, existing Point/Line/Circle gizmo behavior with Arc/Spline no-gizmo, authoritative endpoint-only Connect/Disconnect behavior, Undo/Redo, Save/Reload persistence, and absence of premature profile/hole/nesting UI, D.5 UI or new extrusion capability.

### Circle geometry / viewer consistency reconciliation

The device review raised a non-D.4 observation that a Circle with Inspector radius `1 m` appeared visually wider than expected against the sketch grid. Reconciliation confirmed **no Circle geometry inconsistency**:

- Inspector values are read directly from authoritative `circle.center.x`, `circle.center.y` and `circle.radius`;
- Circle viewport tessellation uses the same center/radius values;
- the Circle manipulation gizmo anchor is exactly the same authoritative `circle.center`;
- Circle gizmo movement preserves `circle.radius`;
- the visual discrepancy comes from the sketch-local grid using `GridHelper(10,20)`, i.e. `0.5 m` minor spacing, so a radius of `1 m` correctly produces a diameter spanning four minor grid cells.

The normal world grid is dynamically updated with camera/zoom behavior and was not identified as incorrect. A future UX improvement should allow the sketch grid spacing/scale or major/minor presentation to be configured or made explicit so the visual scale cannot be mistaken again. This is recorded as **NON-BLOCKING / LATER SKETCH-GRID UX**, not as D.4 scope and not as a geometry defect.

### Freeze result

WD-21D.4-R2 satisfies the documented contract, final scope audit, all automated build/deploy/regression gates, real iPad/Safari 1–7 regression and Circle geometry/viewer reconciliation with **0 blocker**.

**WD-21D.4-R2 is PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER.**

## WD-21D.5 – Generic Profile / Open Path Derivation API

**Status:** DEFINED / NOT IMPLEMENTED

Later D.5 owns the central profiles/openPaths/invalidComponents/diagnostics API. Existing `getSingleExtrudableProfile(...)` remains compatibility behavior until an explicitly authorized later integration step.

## WD-21D.6 – Derivation Regression / Compatibility Gate

**Status:** DEFINED / NOT IMPLEMENTED

Full WD-21D integration/freeze remains later and requires D.1–D.5 PASS / 0 BLOCKER.

## Explicitly excluded from WD-21D

Profile/path selection UI, StableReference PROFILE/PATH target kinds, concrete feature profile/path references, extrusion conversion, extrusion holes/multi-profile runtime, dependency/recompute integration, new sketch drawing tools, Spline control editing/gizmo, constraints, snap/auto-merge/tolerance/geometric rebinding and N-Gon/faceted-circle identity changes remain excluded.

## Build / branch rule

The active branch is `feature/wd-21d-profile-open-path-derivation`. The frozen visible D.4 implementation build identity is `WD-21D.4-R2`; central `applyBuildIdentity()` applies the same value to `document.title` and the visible brand/build label. Any later work must not silently reuse D.4-R2 as a mutable implementation identity.

## Next permissible step

WD-21D.4-R2 is PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER. WD-21D.5 does not begin automatically. The next permissible step is exclusively the separate **WD-21D.5 Reconciliation/Definition – Generic Profile / Open Path Derivation API** against the frozen D.4-R2 product head. No D.5 implementation in the same step.