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

**Status:** DEFINED / NOT IMPLEMENTED

Build deterministic connected components from Line/Arc/Spline using only shared authoritative `pointId` endpoints. Circle is treated as a standalone closed contour component.

Each derivable component must classify as one of:

- `CLOSED_CONTOUR`
- `OPEN_PATH`
- `INVALID_COMPONENT`

Branching components, missing topology targets, and ambiguous/non-orderable components must be diagnostic, not silently repaired. No coordinate tolerance, proximity merge, snap, or geometric best-guess is allowed.

No area/hole nesting classification in D.2.

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

The frozen D.1 visible application build identity is `WD-21D.1`. Central `applyBuildIdentity()` applies the same value to `document.title` and the visible brand/build label.

## Next permissible step

WD-21D.1 is frozen. No WD-21D.2 implementation is started by this freeze. Any D.2 reconciliation/definition or implementation requires a separate explicit authorization.
