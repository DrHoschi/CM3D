# WD-21D – Profile & Open Path Derivation

**Status:** ACTIVE / WD-21D.1 PASS / FROZEN / 0 BLOCKER  
**Definition basis:** frozen WD-21C.8-R2 @ `b29efc297ab8183a9e5879798bb6fd9da201cdf2`  
**Branch:** `feature/wd-21d-profile-open-path-derivation`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-11

## Reconciliation result

The frozen repository already contains an older line-only profile derivation in `src/model/sketch-profile.js`. It derives simple closed line loops from `points` + `lines`, rejects open/branching components, and exposes `getSingleExtrudableProfile(...)`, which accepts exactly one closed profile for the current extrusion path.

The frozen WD-21C basis is now broader: `line`, `circle`, `arc`, and `spline` are registered sketch element kinds. Line/Arc/Spline have real topology endpoints; Circle is a closed analytic element without topology endpoints. Geometric coincidence alone is not connectivity; topology is authoritative exclusively through shared `pointId`.

The current extrusion implementation remains sketch-wide and single-profile oriented. It references the whole sketch and consumes a point-list profile snapshot. Stable PROFILE/PATH references and concrete profile/path selection are not part of WD-21D; they belong to the subsequent WD-21E/WD-21F roadmap blocks.

## WD-21D authority boundary

WD-21D creates only deterministic derived read models from existing sketch data. It MUST NOT mutate persistent sketch geometry, create geometric auto-connections, introduce tolerance-based rebinding, change existing sketch element identities, change extrusion behavior, add profile/path StableReference target kinds, or add profile/path selection UI.

Analytic sketch identity remains authoritative. Any tessellation used for geometric tests is derived only and MUST NOT become persisted sketch topology or identity.

## WD-21D.1 – Generic Sketch Curve/Edge Derivation Contract

**Status:** PASS / FROZEN / 0 BLOCKER

**Frozen implementation head:** `5acd2c65931168c4535fce8e2e1eb0504f088f6d`

### D.1 authority

WD-21D.1 introduces exactly one generic, read-only derived curve/edge view over the existing registered sketch element kinds. The source sketch element remains authoritative at all times; D.1 MUST NOT create a second persistent geometry model.

The generic derived representation MUST preserve at minimum:

- `kind`
- `elementId`
- `closed`
- `startPointId` or `null`
- `endPointId` or `null`
- traceable `source` identity/data needed to resolve back to the original sketch element
- deterministic traversal/orientation information sufficient for later contour ordering

### Element mapping

- **Line** — straight derived edge from the authoritative `startPointId` to `endPointId`; both endpoint IDs are preserved exactly.
- **Arc** — analytic three-point arc between the authoritative topology endpoints using the existing Start/End/Control semantics; both endpoint IDs are preserved exactly.
- **Spline** — analytic open Bézier curve between the authoritative topology endpoints using the existing ordered controls and de Casteljau semantics; both endpoint IDs are preserved exactly.
- **Circle** — standalone analytic closed curve from `center + radius`; `closed = true`; `startPointId = null`; `endPointId = null`. D.1 MUST NOT invent topology endpoints for Circle.

### Connectivity boundary

D.1 does not derive connected components. It only preserves the endpoint topology needed by D.2.

Geometric coincidence, coordinate equality, tolerance, proximity or rendered overlap MUST NOT create connectivity. Later connectivity is valid only when endpoint-based elements reference the same authoritative `pointId`.

### Geometry evaluation / tessellation boundary

D.1 may expose deterministic geometric evaluation/tessellation helpers for downstream read-only derivation. Such samples are auxiliary only.

They MUST NOT:

- replace `kind + elementId` source identity;
- create persistent sketch points/lines;
- become saved topology;
- alter endpoint IDs;
- change analytic Arc/Circle/Spline semantics.

Existing pure Spline geometry in `src/application/sketch-spline-geometry.js` is reusable. The frozen three-point Arc mathematics is shared through pure UI-independent `src/application/sketch-arc-geometry.js` without changing Arc semantics.

### Determinism

For an unchanged sketch, repeated D.1 derivation MUST return the same source membership and deterministic ordering. Ordering MUST be based on stable source identity/registry traversal rules, never object insertion accidents or geometric best-guess.

### Implemented scope

- `src/model/sketch-curve-derivation.js` is the central D.1 read authority via `deriveSketchCurves(...)` and `reverseDerivedCurve(...)`.
- `src/application/sketch-arc-geometry.js` contains the pure UI-independent three-point Arc sampling helper with frozen Arc semantics.
- Existing `src/application/sketch-spline-geometry.js` is reused unchanged.
- `src/main.js` changes only the central visible build identity to `WD-21D.1`; existing `applyBuildIdentity()` remains authoritative for `document.title` and visible brand/build label.
- `tests/wd-21d1-generic-sketch-curve-derivation.mjs` implements the D.1 regression contract.
- `.github/workflows/wd-21d1-generic-sketch-curve-derivation.yml` provides the automated D.1 regression workflow.
- `tests/wd-21c2-generic-element-registry-persistence.mjs` received only forward-compatible build-ID acceptance for the new D-series build.

### Completion / regression / device evidence

Automated verification on frozen implementation head `5acd2c65931168c4535fce8e2e1eb0504f088f6d` is PASS:

- `curve-derivation-regression`: SUCCESS;
- normal `build`: SUCCESS;
- deployment/report build status: SUCCESS;
- scope diff against documented D.1 definition head `24782accfcc8280715ede4d9ad9952e495070f9e` is limited to the expected D.1 implementation, build identity, regression/workflow, status documentation, and the old C.2 build-ID forward-compatibility update;
- no D.2 component/path logic, profile derivation, selection/reference work, extrusion conversion or recompute/dependency integration is present.

Real iPad/Safari device gate on visible build `WD-21D.1`: **1–7 PASS**. Verified were visible build identity, Line/Circle/Arc/Spline creation and selection, existing Point/Line/Circle gizmo behavior, Arc/Spline no-gizmo behavior, Connect/Disconnect regression for endpoint elements, Undo/Redo, Save/Reload persistence, and absence of any premature profile/path or extrusion capability.

### Non-blocking observation – later camera focus UX unification

Device testing exposed an existing UX inconsistency that is explicitly **NON-BLOCKING / LATER UX UNIFICATION**: Point/Line/Circle selection centers the selected target while largely preserving current zoom, whereas Arc/Spline selection uses `runtime.focusSelection()` and additionally fits/zooms to the selected element bounds.

Both behaviors are functional and correct for D.1. This is not a topology/derivation defect and does not reopen C.8-R2 or D.1. A later dedicated Selection Camera Focus contract should unify centering/fit behavior with sensible min/max zoom clamping; in particular, point selections must not be allowed to zoom to an unusably extreme scale.

### D.1 regression contract

The D.1 regression proves at minimum:

- Line maps deterministically to one generic open edge with exact source and endpoint IDs;
- Circle maps deterministically to one closed endpointless curve and receives no synthetic point IDs;
- Arc maps deterministically to one generic open analytic curve with exact source and endpoint IDs;
- Spline maps deterministically to one generic open analytic curve with exact source, endpoint IDs and existing ordered-control semantics;
- Arc/Spline geometric sampling is derived only and does not persist replacement topology;
- repeated derivation of the same sketch preserves deterministic source ordering;
- geometrically coincident endpoints with different `pointId` values remain topologically distinct;
- no profile, contour, open-path, selection, StableReference or extrusion behavior is introduced by D.1.

### Explicit D.1 exclusions

D.1 MUST NOT implement connected-component discovery, closed-contour discovery, open-path classification, branching analysis, profile regions/area derivation, hole/nesting classification, profile/path IDs or StableReference kinds, profile/path UI selection/highlight, extrusion/profile-source changes, recompute/dependency integration, new sketch drawing tools, Spline control handles/gizmos, constraints, snap, auto-merge, tolerance or geometric rebinding.

## WD-21D.2 – Deterministic Contour & Open Path Graph Derivation

**Status:** DEFINED / RECONCILED / CONTRACT BOUNDED / NOT IMPLEMENTED

### D.2 authority and input boundary

WD-21D.2 consumes exclusively the generic read-only output of D.1 `deriveSketchCurves(...)` as its curve/edge input authority. D.2 MUST NOT create a parallel traversal path by rereading the persistent `lines`, `circles`, `arcs` or `splines` collections directly.

D.2 remains a derived read model. It MUST NOT mutate the source sketch, D.1 curves, element IDs, endpoint IDs, analytic geometry or persistence data.

### Connectivity authority

Endpoint graph membership applies only to Line, Arc and Spline curves. Two such curves belong to the same graph component exactly when their authoritative endpoint references share at least one identical `pointId`.

Coordinate equality, geometric coincidence, tolerance, proximity, rendered overlap, snap assumptions or best-guess matching MUST NOT create graph connectivity.

Circle bypasses the endpoint graph because D.1 correctly exposes it as a closed endpointless curve. Every valid Circle is deterministically emitted as its own one-source-element `CLOSED_CONTOUR` component. No synthetic Circle endpoints may be introduced.

### Deterministic connected components

For Line/Arc/Spline, D.2 builds deterministic connected components from the D.1 endpoint identities. Component discovery MUST be independent of JavaScript object insertion order and persistent collection insertion history.

Seed selection, adjacency ordering and traversal decisions MUST be based on stable source identities and authoritative `pointId` values. The same unchanged topology MUST produce the same component membership and ordering on repeated derivation.

### Component classification

Each component is classified as exactly one of:

- `CLOSED_CONTOUR`
- `OPEN_PATH`
- `INVALID_COMPONENT`

A non-branching endpoint component is `OPEN_PATH` when exactly two involved topology points have degree 1 and every other involved topology point has degree 2.

A non-branching endpoint component is `CLOSED_CONTOUR` when every involved topology point has degree 2 and the complete component can be traversed exactly once as one closed chain.

All other endpoint-degree/traversal structures are `INVALID_COMPONENT`. This includes branching points with degree greater than 2, inconsistent/missing topology targets that survive D.1 diagnostics, and components that cannot be uniquely and completely ordered under the D.2 rules.

### Deterministic traversal and orientation

Every valid `OPEN_PATH` and `CLOSED_CONTOUR` contains its source D.1 curves in deterministic traversal order.

When traversal requires an endpoint curve opposite to its D.1 source orientation, D.2 MUST use the existing D.1 `reverseDerivedCurve(...)` read helper or equivalent D.1-authorized derived reversal. Persistent sketch geometry and source identities remain unchanged.

For `OPEN_PATH`, canonical orientation begins at the lexicographically smaller of the two degree-1 endpoint `pointId` values. Stable source identity is the deterministic tie-break authority if an otherwise equivalent ordering requires one.

For `CLOSED_CONTOUR`, D.2 MUST choose a reproducible canonical start source and traversal direction from stable source identity / topology information. D.2 MUST NOT use signed area, CW/CCW, containment or other profile-region geometry to choose the orientation; those decisions belong to later D.3/D.4.

### Derived output contract

The D.2 read authority returns at minimum:

- `components[]`
- `diagnostics[]`

Every component retains at minimum:

- `classification`
- a deterministic `componentKey`
- ordered `curves[]` preserving source `kind + elementId`
- `startPointId` and `endPointId` for `OPEN_PATH`
- sufficient deterministic canonical traversal information for later D.3/D.5 consumers

For a `CLOSED_CONTOUR`, semantic start/end remains closed; its canonical start location is represented by the deterministic ordered curve sequence rather than by inventing new topology endpoints.

No persistent component/profile/path ID is introduced in D.2. `componentKey` is a deterministic derived key only and MUST NOT be treated as the later WD-21E StableReference identity contract.

### Validation boundary against D.3/D.4

D.2 classifies graph structure only. It MUST NOT decide:

- signed area or winding;
- outer contour vs hole;
- contour nesting or containment;
- profile regions;
- self-intersection;
- geometric zero-area validity;
- analytic contour intersection validity;
- extrusion suitability.

The old line-only `src/model/sketch-profile.js` already combines connected-component/degree logic with area, self-intersection and profile creation. D.2 MUST NOT copy that coupling. Only the generic topology graph/component/order responsibility is brought forward; area/profile/geometric validation remains downstream in D.3/D.4.

### D.2 regression contract

D.2 regression MUST prove at minimum:

- one standalone Line derives as one deterministic `OPEN_PATH`;
- a connected mixed Line+Arc+Spline chain derives as one deterministic `OPEN_PATH`;
- a mixed endpoint-element ring derives as one deterministic `CLOSED_CONTOUR`;
- one Circle derives as one standalone one-element `CLOSED_CONTOUR` without synthetic endpoints;
- multiple independent components remain separate and deterministically ordered;
- source curves that require reverse traversal are returned in correct traversal orientation without mutating their D.1/source identity;
- a branching/T-junction component is `INVALID_COMPONENT` and diagnostic;
- geometrically coincident endpoints carrying different `pointId` values remain separate components;
- repeated derivation remains identical when persistent collection insertion order differs but authoritative identities/topology are equal;
- source sketch data and D.1 derived curves remain unmodified;
- no area, hole/nesting, profile selection, StableReference, extrusion or dependency/recompute behavior is introduced.

### Explicit D.2 exclusions

D.2 MUST NOT implement profile-region derivation, hole/nesting classification, area/winding normalization, self-intersection validation, geometric contour validity, profile/path StableReference identities, profile/path UI selection/highlight, extrusion conversion, dependency/recompute integration, geometric auto-connect, tolerance/snap/rebinding, or any new sketch drawing/editing capability.

### D.2 implementation boundary

The expected implementation is one pure model-level graph/component derivation authority consuming D.1, plus a dedicated D.2 regression and workflow. Existing `src/model/sketch-profile.js` remains compatibility/legacy behavior during D.2 and MUST NOT be switched to the new graph derivation in the same implementation step unless separately reconciled in a later WD-21D substep.

No visible product capability is introduced merely by defining D.2. The visible application build identity therefore remains the frozen `WD-21D.1` until a separate D.2 implementation is explicitly authorized.

## WD-21D.3 – Closed Profile Region & Nesting Derivation

**Status:** DEFINED / NOT IMPLEMENTED

Classify valid closed contours into deterministic profile regions.

Required capability:

- multiple independent outer contours in one sketch produce multiple profile regions;
- nested closed contours are classified deterministically as outer boundary vs hole;
- a profile region has at minimum one `outerContour` and zero or more `holes[]`;
- source contour/element identity remains traceable;
- winding may be normalized in the derived read model but must not rewrite persistent sketch geometry.

No profile selection UI and no StableReference PROFILE/PATH kinds in D.3.

## WD-21D.4 – Mixed Analytic Geometry Validation

**Status:** DEFINED / NOT IMPLEMENTED

Generalize profile/path geometric validation beyond line-only geometry.

The derivation must diagnose at least invalid/missing source geometry, zero/degenerate geometry, invalid branching/open components where a closed region is required, self-intersection, invalid regions, and ambiguous nesting/intersection cases.

Deterministic derived tessellation may be used for geometric intersection/containment calculations, but it is never persisted and never replaces original Line/Circle/Arc/Spline identity.

## WD-21D.5 – Generic Profile / Open Path Derivation API

**Status:** DEFINED / NOT IMPLEMENTED

Provide one central read authority for a sketch returning deterministic data equivalent to `profiles[]`, `openPaths[]`, `invalidComponents[]`, and `diagnostics[]`, retaining ordered source sketch elements sufficient for later WD-21E identity and selection work.

The existing `getSingleExtrudableProfile(...)` path may remain as a compatibility adapter during WD-21D. WD-21D must not yet switch extrusion to arbitrary selected profiles or paths.

## WD-21D.6 – Derivation Regression / Compatibility Gate

**Status:** DEFINED / NOT IMPLEMENTED

Full D regression later covers pure-line profiles, Circle, mixed Line+Arc, mixed Line+Spline, multiple profiles, holes, open paths, invalid/branching/self-intersecting cases, topology identity rules and persistence/load compatibility. Only after D.1–D.5 are implemented and full regression is PASS / 0 BLOCKER may WD-21D be considered for freeze.

## Explicitly excluded from WD-21D

Profile/path selection UI, new StableReference PROFILE/PATH target kinds, feature references to concrete profiles/paths, extrusion conversion to selected profile/path sources, extrusion holes/multi-profile runtime implementation, dependency/recompute integration for profile/path references, new sketch drawing tools, Spline control editing/gizmo, constraints, snap/auto-merge/tolerance/geometric rebinding and N-Gon/faceted-circle identity changes remain excluded.

## Build / branch rule

The WD-21D development branch exists and was created exactly from frozen WD-21C.8-R2 basis `b29efc297ab8183a9e5879798bb6fd9da201cdf2`.

The frozen D.1 visible application build identity remains `WD-21D.1`. Central `applyBuildIdentity()` applies the same value to `document.title` and the visible brand/build label. Documentation-only D.2 definition does not change product build identity.

## Next permissible step

WD-21D.2 is now reconciled and contract-bounded but remains NOT IMPLEMENTED. The next permissible step is exclusively the separate authorization of WD-21D.2 implementation against this documented contract. No D.2 implementation, D.3 work, device gate or freeze is included in this definition step.
