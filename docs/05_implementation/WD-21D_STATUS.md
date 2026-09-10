# WD-21D – Profile & Open Path Derivation

**Status:** DEFINED / DOCUMENTATION CONTRACT ONLY / NOT IMPLEMENTED  
**Definition basis:** frozen WD-21C.8-R2 @ `b29efc297ab8183a9e5879798bb6fd9da201cdf2`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-10

## Reconciliation result

The frozen repository already contains an older line-only profile derivation in `src/model/sketch-profile.js`. It derives simple closed line loops from `points` + `lines`, rejects open/branching components, and exposes `getSingleExtrudableProfile(...)`, which accepts exactly one closed profile for the current extrusion path.

The frozen WD-21C basis is now broader: `line`, `circle`, `arc`, and `spline` are registered sketch element kinds. Line/Arc/Spline have real topology endpoints; Circle is a closed analytic element without topology endpoints. Geometric coincidence alone is not connectivity; topology is authoritative exclusively through shared `pointId`.

The current extrusion implementation remains sketch-wide and single-profile oriented. It references the whole sketch and consumes a point-list profile snapshot. Stable PROFILE/PATH references and concrete profile/path selection are not part of WD-21D; they belong to the subsequent WD-21E/WD-21F roadmap blocks.

## WD-21D authority boundary

WD-21D creates only deterministic derived read models from existing sketch data. It MUST NOT mutate persistent sketch geometry, create geometric auto-connections, introduce tolerance-based rebinding, change existing sketch element identities, change extrusion behavior, add profile/path StableReference target kinds, or add profile/path selection UI.

Analytic sketch identity remains authoritative. Any tessellation used for geometric tests is derived only and MUST NOT become persisted sketch topology or identity.

## WD-21D.1 – Generic Sketch Curve/Edge Derivation Contract

**Status:** DEFINED / NOT IMPLEMENTED

Define one generic derived curve/edge view over all registered sketch element kinds:

- Line: straight derived edge between its authoritative topology endpoints.
- Arc: analytic derived curve between its authoritative topology endpoints using the existing three-point arc semantics.
- Spline: analytic derived open Bézier curve between its authoritative topology endpoints using the existing ordered controls/de Casteljau semantics.
- Circle: standalone analytic closed curve without topology endpoints.

The derived representation must preserve source identity (`kind + elementId`) and orientation/traversal information needed by later contour ordering. No profiles, region nesting, UI, references, or extrusion changes in D.1.

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

The derivation must diagnose at least:

- invalid/missing source element geometry;
- zero/degenerate derived geometry;
- invalid branching/open components where a closed region is required;
- self-intersection of closed candidate contours;
- invalid/non-usable closed regions;
- ambiguous nesting/intersection cases that cannot safely form deterministic profile regions.

Deterministic derived tessellation may be used for geometric intersection/containment calculations, but it is never persisted and never replaces the original Line/Circle/Arc/Spline identity.

## WD-21D.5 – Generic Profile / Open Path Derivation API

**Status:** DEFINED / NOT IMPLEMENTED

Provide one central read authority for a sketch that returns deterministic derived data equivalent to:

- `profiles[]`
- `openPaths[]`
- `invalidComponents[]`
- `diagnostics[]`

Every returned profile/path must retain an ordered deterministic description of its source sketch elements sufficient for later WD-21E stable profile/path identity and selection work.

The existing `getSingleExtrudableProfile(...)` path may remain as a compatibility adapter during WD-21D. WD-21D must not yet switch extrusion to arbitrary selected profiles or paths.

## WD-21D.6 – Derivation Regression / Compatibility Gate

**Status:** DEFINED / NOT IMPLEMENTED

Regression coverage must prove at minimum:

- existing pure-line closed profile behavior remains valid;
- one Circle derives as one closed profile region;
- a closed mixed Line+Arc contour derives correctly;
- a closed mixed Line+Spline contour derives correctly;
- multiple independent closed contours produce multiple profiles;
- nested outer contour + inner contour produces one profile region with a hole;
- open Line/Arc/Spline chains derive as open paths;
- branching, missing, degenerate and self-intersecting cases remain diagnostic;
- no geometric coincidence creates topology without shared `pointId`;
- existing WD-21C sketch persistence/load compatibility remains intact.

Only after D.1–D.5 are implemented and the full regression is PASS / 0 BLOCKER may WD-21D be considered for freeze.

## Explicitly excluded from WD-21D

- profile/path selection UI;
- new StableReference PROFILE/PATH target kinds;
- feature references to concrete profiles/paths;
- extrusion conversion to selected profile/path sources;
- extrusion holes/multi-profile runtime implementation;
- dependency/recompute integration for profile/path references;
- new sketch drawing tools;
- Spline control handles, Control add/delete/reorder, Spline gizmo/drag;
- constraints, snap/auto-merge/tolerance/geometric rebinding;
- N-Gon/faceted-circle identity changes.

## Build / branch rule

This documentation contract does not start WD-21D implementation. No WD-21D development branch is created in this step and the visible application build identity remains the frozen WD-21C.8-R2 identity.

## Next permissible step

Exclusively the separate authorization and creation of the WD-21D development branch from frozen basis `b29efc297ab8183a9e5879798bb6fd9da201cdf2`. No D.1 implementation in the same step.
