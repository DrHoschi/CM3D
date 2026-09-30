# WD-22B – Sketch → Work Plane Reference Binding – Status

## Status

**PASS / FROZEN / 0 BLOCKER**

- Authorized base: `main = 8ca9d0240466ceaaf0b5f565ae0983f310122990`
- Branch: `feature/WD-22B-sketch-work-plane-binding`
- Functional freeze: `79a73c753b3cd3b1d734d074f3a57e02c973c8b7`
- Exact-head CI: GitHub Actions run `36708955932`, attempt 1 – **completed / success**
- Verification result: **PASS / 0 BLOCKER**

This status document records the completed gate. It does not change the tested functional freeze.

## Definition / contract

WD-22B establishes the minimal persistent Sketch → Work Plane reference binding required by RB-03 without introducing Face/Edge/Vertex topology, new visible construction tooling, or RB-04 modeling features.

A bound sketch references exactly one existing `WORK_PLANE` through the existing StableReference authority. The binding resolves the sketch spatial frame from the referenced Work Plane definition while preserving the sketch's existing 2D topology coordinates as sketch-local authority.

Legacy sketches without a `planeRef` retain the existing `localXY` behavior. WD-22B does not silently migrate or reinterpret them.

## Sketch frame derivation

For a resolved Work Plane binding, the sketch frame is derived deterministically from the Work Plane definition:

- `origin` is the Work Plane origin
- `zAxis` is the normalized Work Plane normal
- `xAxis` is the Work Plane x-axis projected orthogonally onto the plane and normalized
- `yAxis` is derived from the orthogonal frame

The Work Plane definition remains the spatial authority. The derived frame is not a second persistent geometry authority.

## Stable-reference and failure behavior

The binding uses the existing `WORK_PLANE` StableReference contract introduced by WD-22A.

- resolved reference → bound frame available
- missing reference → `MISSING`, no frame and no fallback/rebinding
- invalid target/definition → `INVALID`, no frame and no fallback/rebinding
- deterministic global XY/XZ/YZ Work Planes remain valid system targets

No geometry-, index-, proximity-, or similarly-shaped replacement target is selected.

## Dependency projection

A sketch bound to a persistent Work Plane projects the existing Work Plane owner as its dependency source through the existing dependency graph authority.

Global system Work Planes intentionally do not create artificial Scene Object dependency nodes.

No second dependency graph, resolver, or identity authority was introduced.

## Persistence / partial project behavior

The binding is persisted as `sketch.data.planeRef` using the existing StableReference data shape. The project schema remains `0.2.0`; no schema bump is required.

Save → Reload preserves the binding and the existing sketch 2D topology data.

Partial-project import follows the existing stable-reference remapping semantics:

- when sketch and referenced persistent Work Plane are imported together, the Scene `ownerId` is remapped while the stable Work Plane target identity is preserved and the reference resolves
- when the sketch is imported without its referenced persistent Work Plane, the reference remains intact and resolves as `MISSING`; it is not silently rebound

## Runtime boundary

The existing Three runtime consumes the resolved sketch frame for spatial placement of a bound sketch. Legacy `localXY` behavior remains available for unbound legacy sketches.

WD-22B does not introduce a new SceneObject transform authority and does not move sketch 2D topology coordinates into world-space persistence.

## Implementation evidence

Functional implementation commits from the authorized base:

1. `728609966ff32aa3ff132e0d3bd354a9c8f3d892` – sketch Work Plane binding contract
2. `cb10763dbf5959237f61fd8e74dd3dce48fa99aa` – legacy/bound sketch-plane validation
3. `8e4be815...` – Work Plane → Sketch dependency projection
4. `b88eebf7...` – runtime consumption of resolved Work Plane frame
5. `451657a5...` – focused WD-22B regression
6. `d110ddc8b0ec360c780f50b4dbb3db4b1fc1431e` – CI wiring / initial functional head
7. `79a73c753b3cd3b1d734d074f3a57e02c973c8b7` – focused test/CI harness correction; removes the test's AppStore/Three runtime dependency without changing production behavior

Functional diff against the authorized base: 7 commits ahead, 0 behind.

Changed functional-scope files:

- `src/application/sketch-plane-binding.js`
- `src/model/sketch-topology.js`
- `src/application/dependency-graph.js`
- `src/runtime-three/runtime.js`
- `tests/wd-22b-sketch-work-plane-binding.mjs`
- `.github/workflows/wd-21e-identity-reference-foundation.yml`

## Harness correction evidence

The first Exact-Head CI at `d110ddc8b0ec360c780f50b4dbb3db4b1fc1431e` was blocked before WD-22B assertions because the focused test imported `AppStore`, which transitively required the `three` package in the intentionally dependency-free Node regression workflow.

The correction at `79a73c753b3cd3b1d734d074f3a57e02c973c8b7` changed only `tests/wd-22b-sketch-work-plane-binding.mjs`: the direct `AppStore` dependency was replaced by a test-local minimal store contract. No production file or production behavior was changed by this correction.

The corrected Exact-Head CI then executed the focused WD-22B assertions successfully.

## Exact-head verification evidence

GitHub Actions run `36708955932` checked out exact functional head `79a73c753b3cd3b1d734d074f3a57e02c973c8b7`.

Job `identity-reference-foundation`: **completed / success**.

All regression steps WD-20A through WD-22A passed. The new WD-22B step also passed:

`WD-22B Sketch Work Plane Reference Binding regression: PASS`

The WD-22B regression covers the authorized binding contract including:

- legacy `localXY` sketch compatibility
- persistent Work Plane binding resolution
- deterministic frame derivation and orthogonalization
- global XY/XZ/YZ Work Plane binding
- persistent Work Plane dependency projection
- `MISSING` behavior without fallback
- `INVALID` Work Plane behavior without fallback
- Save → Reload preservation of `planeRef` and sketch 2D topology
- joint partial-project import with owner remapping and stable target identity
- isolated sketch partial-project import remaining `MISSING` without rebinding

## Explicit scope exclusions

WD-22B does **not** implement:

- Face / Edge / Vertex stable identity
- Sketch-on-Face
- geometry-derived or offset Work Planes
- Work Plane creation/editing UI
- Work Plane viewer tooling
- construction-axis sketch binding
- Snap / Align
- measurement / stored dimensions
- migration of legacy sketches to Work Plane bindings
- new SceneObject transform authority
- Extrude consumer migration
- Revolve / Sweep / Loft
- any other RB-04 modeling feature

These remain later controlled blocks.

## Freeze decision

WD-22B satisfies its authorized Sketch → Work Plane Reference Binding scope with corrected exact-head CI evidence and no identified blocker.

**WD-22B is PASS / FROZEN / 0 BLOCKER at functional freeze `79a73c753b3cd3b1d734d074f3a57e02c973c8b7`.**

The documentation commit created by this Completion / Evidence / Freeze Gate is documentation-only and does not replace or alter the functional freeze.
