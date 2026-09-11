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

D.2 is the pure graph/component authority in `src/model/sketch-path-graph-derivation.js`. It consumes exclusively D.1, connects Line/Arc/Spline only through identical authoritative `pointId`, treats Circle as a standalone endpointless `CLOSED_CONTOUR`, and deterministically classifies components as `OPEN_PATH`, `CLOSED_CONTOUR`, or `INVALID_COMPONENT`. Its `componentKey` is derived only and is not a WD-21E StableReference identity. D.2 does not perform area, winding, nesting, self-intersection, profile-region, selection, extrusion, or recompute work.

Final D.2 scope audit and automated regression are PASS, and the real iPad/Safari device gate on visible build `WD-21D.2` is 1–7 PASS. D.2 is frozen with 0 blocker.

## WD-21D.3 – Closed Profile Region & Nesting Derivation

**Status:** DEFINED / RECONCILED / CONTRACT BOUNDED / NOT IMPLEMENTED

### D.3 authority and input boundary

WD-21D.3 consumes exclusively the frozen D.2 graph/component derivation as its contour authority. Only components with `classification === CLOSED_CONTOUR` are candidates for profile-region derivation.

`OPEN_PATH` and `INVALID_COMPONENT` MUST NOT produce profile regions. D.3 MUST NOT reread persistent Line/Circle/Arc/Spline collections as a parallel contour authority and MUST NOT mutate sketch data, D.1 curves, D.2 components, topology IDs, or analytic geometry.

### Profile-region contract

A D.3 profile region represents one filled planar region and contains at minimum:

- deterministic derived `profileKey`;
- one `outerContour` traceable to its D.2 `componentKey` and ordered source curves;
- deterministic `holes[]`, each traceable to its D.2 contour/component identity;
- sufficient derived containment/nesting metadata to reproduce classification;
- complete source traceability back through D.2/D.1 to `kind + elementId`.

`profileKey` is a deterministic derived key only. It MUST NOT be treated as a persistent profile identity or as the later WD-21E StableReference contract.

### Independent contours

One standalone, non-nested closed contour derives exactly one profile region with that contour as `outerContour` and `holes: []`.

Multiple spatially separate closed contours derive multiple independent profile regions. Their output ordering MUST be deterministic and independent of collection insertion order.

### Containment and nesting

D.3 derives a deterministic containment hierarchy between closed contours.

A closed contour directly contained by an outer contour at the next nesting level is classified by containment depth/parity:

- depth 0: outer boundary of a profile region;
- depth 1: hole of its containing depth-0 region;
- depth 2: island / new outer boundary and therefore a new profile region;
- depth 3: hole of that depth-2 profile region;
- subsequent levels continue by the same even/odd parity rule.

Therefore an `outer → hole → island → hole` arrangement is represented without flattening or loss of topology. Each odd-depth contour belongs as a hole to its nearest even-depth ancestor profile region. Each even-depth contour creates one profile region.

### Determinism and ordering

Containment parent selection, nesting depth, profile ordering, and `holes[]` ordering MUST be deterministic for unchanged geometry and identities.

Stable D.2 `componentKey` / source identity is the ordering and tie-break authority where equivalent derived ordering requires one. JavaScript object insertion order MUST NOT affect the result.

### Geometry-evaluation boundary

D.3 may use deterministic D.1/D.2-derived curve tessellation as a read-only computational representation for containment and planar region classification. Such samples MUST NOT become persisted topology, replace analytic Line/Circle/Arc/Spline identity, or create new sketch points/elements.

Winding/signed area may be calculated only as derived metadata or as a deterministic computational aid. D.3 MAY expose a normalized derived orientation view when required by the profile-region representation, but MUST NOT reverse or rewrite persistent sketch curves.

### Boundary against D.4

D.3 owns deterministic region/nesting classification for closed contours that are sufficiently classifiable under the frozen D.2 topology and D.3 containment rules.

D.3 does NOT own the final mixed-analytic geometry validity contract. In particular, D.3 MUST NOT silently repair or declare extrudable:

- self-intersecting contours;
- degenerate/zero-area contours;
- ambiguous touching/intersecting contours;
- analytically invalid Arc/Spline/Circle geometry;
- ambiguous containment caused by contour intersections or boundary contact.

Where such a case prevents deterministic nesting, D.3 may emit/propagate a diagnostic or leave the contour unclassified for downstream D.4, but MUST NOT geometrically guess, snap, merge, trim, rebind, or repair it. D.4 remains authoritative for mixed analytic geometric validity.

### Compatibility boundary

Existing line-only `src/model/sketch-profile.js` remains compatibility behavior during D.3. Its current coupling of graph traversal, signed area, self-intersection and single-profile extrusion suitability MUST NOT become the new D.3 authority and MUST NOT be switched to D.3 in the same implementation step.

D.3 creates only the new generic derived profile-region layer over frozen D.2. Existing extrusion behavior remains unchanged.

### D.3 regression contract

D.3 regression MUST prove at minimum:

- one standalone closed line contour derives one profile region with no holes;
- one standalone Circle derives one profile region with no holes;
- two spatially separate closed contours derive two independent profile regions;
- one outer contour containing one inner contour derives one region with one hole;
- `outer → hole → island` derives two profile regions with correct parity/ownership;
- `outer → hole → island → hole` preserves the full nesting parity and hole ownership;
- multiple independent outer regions may each own deterministic holes;
- mixed Line+Arc and mixed Line+Spline closed contours can participate through the D.1/D.2 derived geometry without losing source identity;
- profile and hole ordering is deterministic when persistent collection insertion order differs but source identities/geometry are equal;
- source sketch data, D.1 curves and D.2 components remain unmodified;
- open paths and invalid D.2 components never become profile regions;
- no StableReference, profile/path UI selection, extrusion conversion, dependency/recompute integration, snap/tolerance/rebinding, or persistent profile identity is introduced.

### Explicit D.3 exclusions

D.3 MUST NOT implement the D.4 final self-intersection/degeneracy/mixed-analytic validity authority, the D.5 combined profile/open-path API, Stable Profile/Path References, profile/path viewer selection or highlighting, extrusion conversion to selected profiles/paths, extrusion hole/multi-profile runtime behavior, dependency/recompute integration, geometric auto-connect, tolerance/snap/rebinding, or any new sketch drawing/editing capability.

### D.3 implementation boundary

The expected implementation is one pure model-level profile-region/nesting derivation authority consuming frozen D.2, plus dedicated D.3 regression and workflow. No existing extrusion or legacy profile consumer is migrated in D.3.

No visible product capability is introduced merely by this documentation-only definition step. The visible application build identity therefore remains frozen `WD-21D.2` until a separate D.3 implementation is explicitly authorized.

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

The active branch is `feature/wd-21d-profile-open-path-derivation`. The frozen D.2 visible implementation build identity remains `WD-21D.2`. Documentation-only D.3 definition MUST NOT change `src/main.js`, `document.title`, or the visible brand/build label. A future D.3 implementation requires separate authorization and a consistent visible `WD-21D.3` build identity.

## Next permissible step

WD-21D.3 is now reconciled and contract-bounded but remains NOT IMPLEMENTED. The next permissible step is exclusively the separate authorization of WD-21D.3 implementation against this documented contract. No D.3 implementation, D.4 work, device gate or freeze is included in this definition step.
