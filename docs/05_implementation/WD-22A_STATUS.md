# WD-22A – Construction Reference Foundation – Status

## Status

**PASS / FROZEN / 0 BLOCKER**

- Authorized base: `main = 0f333de02ba8baf08e3de0cb5d84a88b58cf9340`
- Branch: `feature/WD-22A-construction-reference-foundation`
- Functional freeze: `9a737d88865099d91f35fce683d71c6a6cb8b489`
- Exact-head CI: GitHub Actions run `36345751951`, attempt 1 – **completed / success**
- Verification result: **PASS / 0 BLOCKER**

This status document records the completed gate. It does not change the tested functional freeze.

## Definition / contract

WD-22A establishes the minimal persistent Construction Reference Foundation required by RB-03 without introducing body Face/Edge topology or visible construction tooling.

The foundation contains two persistent construction-reference domain object types:

- `construction.workPlane` with stable `workPlaneId`
- `construction.axis` with stable `constructionAxisId`

The stable-reference system is extended with:

- `WORK_PLANE`
- `CONSTRUCTION_AXIS`

The existing reference states and no-silent-rebinding semantics remain authoritative.

## Global work planes

The three global planes are deterministic system construction references:

- `GLOBAL_XY`
- `GLOBAL_XZ`
- `GLOBAL_YZ`

They use the reserved system owner `system:construction` and do not create artificial persistent Scene Objects or dependency graph nodes.

## Persistent definitions

A Work Plane definition contains:

- finite `origin`
- non-zero finite `normal`
- non-zero finite `xAxis`
- `normal` and `xAxis` must not be parallel

A Construction Axis definition contains:

- finite `origin`
- non-zero finite `direction`

Viewer geometry is not persistent authority.

## Ownership and dependency projection

Persistent Work Plane / Construction Axis objects are ordinary Scene Objects.

For `WORK_PLANE` and `CONSTRUCTION_AXIS` stable references, the persistent construction object identified by `ownerId` is the dependency source. Global system planes are immutable system references and intentionally do not create a Scene dependency source.

No second resolver, dependency graph, or identity authority was introduced.

## Persistence / validation

The construction-reference objects are persisted through the existing project Scene model. The project schema remains `0.2.0`; no schema bump is required for this foundation.

Project validation rejects invalid Work Plane and Construction Axis definitions.

Save → Reload preserves construction-reference identities and definitions.

Partial-project import remaps Scene `objectId` while preserving the construction target identity (`workPlaneId` / `constructionAxisId`). No geometry-based or similarly shaped replacement target is selected.

## Implementation evidence

Functional implementation commits from the authorized base:

1. `10d9598565ec7f49a16eac52a75ba64151d2fe5f` – construction reference domain contract
2. `c9489b2abe5bd39c8df6a97e6e97aa79b7910c3e` – persistence and project validation
3. `ed4f738b97d346a1b5218c69769a28b2076b08c8` – StableReference resolution
4. `371e7544319675c5f37e09d3e28453db351dc32a` – dependency graph projection
5. `6518ac938b8e510912843309c62c6a5a07072093` – WD-22A regression
6. `9a737d88865099d91f35fce683d71c6a6cb8b489` – CI wiring / functional head

Functional diff against the authorized base: 6 commits ahead, 0 behind.

Changed functional files:

- `src/model/construction-reference.js`
- `src/model/project.js`
- `src/application/stable-reference.js`
- `src/application/dependency-graph.js`
- `tests/wd-22a-construction-reference-foundation.mjs`
- `.github/workflows/wd-21e-identity-reference-foundation.yml`

## Exact-head verification evidence

GitHub Actions run `36345751951` checked out exact functional head `9a737d88865099d91f35fce683d71c6a6cb8b489`.

Job `identity-reference-foundation`: **completed / success**.

All existing regression steps WD-20A through WD-21G.2 passed. The new WD-22A step also passed:

`WD-22A Construction Reference Foundation regression: PASS`

The WD-22A regression covers:

- persistent Work Plane reference → RESOLVED
- persistent Construction Axis reference → RESOLVED
- deterministic global XY/XZ/YZ references → RESOLVED
- unknown global plane → MISSING
- missing persistent identity → MISSING without replacement
- invalid Work Plane definition → INVALID without target replacement
- owner-kind mismatch → INVALID
- persistent construction dependency source projection
- no artificial graph dependency for global planes
- project validation
- productive Save → Reload preservation
- invalid Construction Axis validation
- partial-project objectId remapping with stable construction target identity

## Explicit scope exclusions

WD-22A does **not** implement:

- Face / Edge / Vertex stable identity
- body-topology addressing
- Sketch-on-Face or Sketch-to-WorkPlane binding
- Offset Work Plane or geometry-derived Work Plane
- Construction Line drawing
- Work Plane / Axis creation UI
- Viewer rendering for Work Planes / Axes
- SelectionRef expansion for construction references
- Snap / Align
- measurement / stored dimensions
- Revolve / Mirror / Pattern
- any RB-04 modeling feature
- migration of existing `sketch.data.plane`

These remain later controlled blocks.

## Freeze decision

WD-22A satisfies its authorized Construction Reference Foundation scope with exact-head CI evidence and no identified blocker.

**WD-22A is PASS / FROZEN / 0 BLOCKER at functional freeze `9a737d88865099d91f35fce683d71c6a6cb8b489`.**

The documentation commit created by this Completion / Evidence / Freeze Gate is documentation-only and does not replace or alter the functional freeze.
