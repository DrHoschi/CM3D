# WD-21D – Profile & Open Path Derivation

**Status:** ACTIVE / WD-21D.1 IMPLEMENTED / NOT FROZEN  
**Definition basis:** frozen WD-21C.8-R2 @ `b29efc297ab8183a9e5879798bb6fd9da201cdf2`  
**Branch:** `feature/wd-21d-profile-open-path-derivation`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-10

## Reconciliation result

The frozen repository already contains an older line-only profile derivation in `src/model/sketch-profile.js`. It derives simple closed line loops from `points` + `lines`, rejects open/branching components, and exposes `getSingleExtrudableProfile(...)`, which accepts exactly one closed profile for the current extrusion path.

The frozen WD-21C basis is broader: `line`, `circle`, `arc`, and `spline` are registered sketch element kinds. Line/Arc/Spline have real topology endpoints; Circle is a closed analytic element without topology endpoints. Geometric coincidence alone is not connectivity; topology is authoritative exclusively through shared `pointId`.

The current extrusion implementation remains sketch-wide and single-profile oriented. Stable PROFILE/PATH references and concrete profile/path selection are not part of WD-21D; they belong to WD-21E/WD-21F.

## WD-21D authority boundary

WD-21D creates only deterministic derived read models from existing sketch data. It MUST NOT mutate persistent sketch geometry, create geometric auto-connections, introduce tolerance-based rebinding, change existing sketch element identities, change extrusion behavior, add profile/path StableReference target kinds, or add profile/path selection UI.

Analytic sketch identity remains authoritative. Any tessellation used for geometric tests is derived only and MUST NOT become persisted sketch topology or identity.

## WD-21D.1 – Generic Sketch Curve/Edge Derivation Contract

**Status:** IMPLEMENTED / REGRESSION ADDED / CI VERIFICATION PENDING / NOT FROZEN

### D.1 authority

WD-21D.1 introduces exactly one generic, read-only derived curve/edge view over the existing registered sketch element kinds. The source sketch element remains authoritative at all times; D.1 MUST NOT create a second persistent geometry model.

The generic derived representation preserves at minimum `kind`, `elementId`, `closed`, `startPointId` or `null`, `endPointId` or `null`, traceable read-only `source` data and deterministic traversal/orientation information.

### Element mapping

- **Line** — straight derived edge from the authoritative `startPointId` to `endPointId`; endpoint IDs are preserved exactly.
- **Arc** — analytic three-point arc between authoritative topology endpoints using the existing Start/End/Control semantics; endpoint IDs are preserved exactly.
- **Spline** — analytic open Bézier curve between authoritative topology endpoints using existing ordered controls and de Casteljau semantics; endpoint IDs are preserved exactly.
- **Circle** — standalone analytic closed curve from `center + radius`; `closed = true`; `startPointId = null`; `endPointId = null`; no topology endpoints are invented.

### Connectivity boundary

D.1 does not derive connected components. It only preserves endpoint topology needed by D.2. Geometric coincidence, coordinate equality, tolerance, proximity or rendered overlap MUST NOT create connectivity.

### Geometry evaluation / tessellation boundary

D.1 exposes deterministic auxiliary geometry samples without replacing `kind + elementId`, creating persistent points/lines, altering endpoint IDs or changing analytic Arc/Circle/Spline semantics.

Existing pure Spline geometry in `src/application/sketch-spline-geometry.js` is reused. The frozen three-point Arc mathematics is also available through the new pure UI-independent helper `src/application/sketch-arc-geometry.js`; this is a read-only authority extraction and does not change Arc semantics.

### Determinism

For an unchanged sketch, repeated D.1 derivation returns the same source membership and ordering. Ordering is based on stable registry traversal and sorted stable element IDs, never object insertion accidents or geometric best-guess.

### Implemented files / authority

- `src/model/sketch-curve-derivation.js` — central D.1 read authority via `deriveSketchCurves(...)` and orientation helper `reverseDerivedCurve(...)`.
- `src/application/sketch-arc-geometry.js` — pure three-point Arc sampling helper matching frozen Arc semantics.
- `src/application/sketch-spline-geometry.js` — existing pure Spline sampling reused unchanged.
- `src/main.js` — visible build identity changed only to `WD-21D.1`; central `applyBuildIdentity()` remains authoritative for browser title and header label.
- `tests/wd-21d1-generic-sketch-curve-derivation.mjs` — D.1 regression.
- `.github/workflows/wd-21d1-generic-sketch-curve-derivation.yml` — D.1 automated regression workflow.

### D.1 regression contract

The regression proves at minimum:

- Line maps deterministically to one generic open edge with exact source and endpoint IDs;
- Circle maps deterministically to one closed endpointless curve and receives no synthetic point IDs;
- Arc maps deterministically to one generic open analytic curve with exact source and endpoint IDs;
- Spline maps deterministically to one generic open analytic curve with exact source, endpoint IDs and existing ordered-control semantics;
- Arc/Spline geometric sampling is derived only and does not persist replacement topology;
- repeated derivation preserves deterministic source ordering;
- geometrically coincident endpoints with different `pointId` values remain distinct;
- derived snapshots are read-only;
- no profile, contour, open-path, selection, StableReference or extrusion behavior is introduced by D.1;
- visible build identity is exactly `WD-21D.1` through the existing central identity path.

### Explicit D.1 exclusions

D.1 MUST NOT implement connected-component discovery, closed-contour discovery, open-path classification, branching analysis, profile regions/area derivation, hole/nesting classification, profile/path IDs or StableReference kinds, profile/path UI selection/highlight, extrusion/profile-source changes, recompute/dependency integration, new sketch drawing tools, Spline control handles/gizmos, constraints, snap, auto-merge, tolerance or geometric rebinding.

## WD-21D.2 – Deterministic Contour & Open Path Graph Derivation

**Status:** DEFINED / NOT IMPLEMENTED

Build deterministic connected components from Line/Arc/Spline using only shared authoritative `pointId` endpoints. Circle is treated as a standalone closed contour component. Each derivable component later classifies as `CLOSED_CONTOUR`, `OPEN_PATH`, or `INVALID_COMPONENT`. No area/hole nesting classification belongs to D.2.

## WD-21D.3 – Closed Profile Region & Nesting Derivation

**Status:** DEFINED / NOT IMPLEMENTED

Classify valid closed contours into deterministic profile regions: multiple independent outer contours produce multiple profile regions; nested contours are classified as outer boundary vs hole; source contour/element identity remains traceable. No profile selection UI or StableReference PROFILE/PATH kinds belong to D.3.

## WD-21D.4 – Mixed Analytic Geometry Validation

**Status:** DEFINED / NOT IMPLEMENTED

Generalize profile/path validation beyond line-only geometry. Deterministic derived tessellation may be used for intersection/containment calculations but is never persisted and never replaces original element identity.

## WD-21D.5 – Generic Profile / Open Path Derivation API

**Status:** DEFINED / NOT IMPLEMENTED

Provide one central read authority returning deterministic `profiles[]`, `openPaths[]`, `invalidComponents[]`, and `diagnostics[]`, retaining ordered source sketch elements for later WD-21E identity and selection work. Existing `getSingleExtrudableProfile(...)` may remain a compatibility adapter during WD-21D.

## WD-21D.6 – Derivation Regression / Compatibility Gate

**Status:** DEFINED / NOT IMPLEMENTED

Full D regression later covers pure-line profiles, Circle, mixed Line+Arc, mixed Line+Spline, multiple profiles, holes, open paths, invalid/branching/self-intersecting cases, topology identity rules and persistence/load compatibility. Only after D.1–D.5 are implemented and full regression is PASS / 0 BLOCKER may WD-21D be considered for freeze.

## Explicitly excluded from WD-21D

Profile/path selection UI, new StableReference PROFILE/PATH target kinds, feature references to concrete profiles/paths, extrusion conversion to selected profile/path sources, extrusion holes/multi-profile runtime implementation, dependency/recompute integration for profile/path references, new sketch drawing tools, Spline control editing/gizmo, constraints, snap/auto-merge/tolerance/geometric rebinding and N-Gon/faceted-circle identity changes remain excluded.

## Build / branch rule

The WD-21D development branch exists from frozen WD-21C.8-R2 basis `b29efc297ab8183a9e5879798bb6fd9da201cdf2`. The visible application identity for the implementation is now `WD-21D.1`. `document.title` and the visible brand/build label continue to receive that same value from central `applyBuildIdentity()`.

No PASS/FROZEN status is claimed by this implementation step. Automated verification, device evidence and freeze require separate gates.

## Next permissible step

Exclusively WD-21D.1 Implementation Verification / Automated Regression against the implemented branch state. No D.2 work, no device PASS and no freeze gate in the same step without separate authorization.
