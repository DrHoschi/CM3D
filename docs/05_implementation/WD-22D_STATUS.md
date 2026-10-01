# WD-22D – Planar Face Reference Foundation – Status

## Status

**PASS / FROZEN / 0 BLOCKER**

- Authorized base: `main = 14937a8d87ed13b854b3d5b08880d55f74d7954c`
- Branch: `feature/WD-22D-planar-face-reference-foundation`
- Functional freeze: `668406f2a99e58d2078ab3dada2845d3acbc21c8`
- Exact-head CI: GitHub Actions run `36852079822`, attempt 1 – **completed / success**
- Verification result: **PASS / 0 BLOCKER**

This status document records the completed gate. It does not change the tested functional freeze.

## Definition / contract

WD-22D establishes the minimal stable planar-face reference foundation required by RB-03 without introducing a general BRep/topological-naming system or visible face modeling tools.

The new StableReference target kind is:

`PLANAR_FACE`

Within the WD-22D scope, only semantic planar cap faces of an existing `feature.extrude` are addressable. Their reference contract is:

- `targetKind = PLANAR_FACE`
- `ownerId = <feature.extrude objectId>`
- `targetId = CAP_START | CAP_END`

`ownerId` remains the persistent feature identity. `CAP_START` and `CAP_END` are deterministic semantic output roles. They are not Three.js triangle, face, or buffer indices and are not randomly generated identities.

## CAP_START / CAP_END frame contract

The planar-cap definition is derived independently of Three.js and exposes the minimal planar frame required by later RB-03 consumers:

- `origin`
- `normal`
- `xAxis`

The local cap placement follows the existing Extrude direction semantics:

| Direction | CAP_START local Z | CAP_END local Z |
| --- | ---: | ---: |
| `positive` | `0` | `+depth` |
| `negative` | `0` | `-depth` |
| `symmetric` | `-depth/2` | `+depth/2` |

Outward cap normals follow the same semantic role:

- `positive`: CAP_START `-Z`, CAP_END `+Z`
- `negative`: CAP_START `+Z`, CAP_END `-Z`
- `symmetric`: CAP_START `-Z`, CAP_END `+Z`

The owner transform is applied to the resulting frame without making render geometry the identity authority. Changing Extrude depth changes the derived frame but does not change the `CAP_START` / `CAP_END` reference identity.

## Resolution / dependency contract

`PLANAR_FACE` participates in the existing StableReference resolution model.

- missing owner → `MISSING`
- owner exists but is not `feature.extrude` → `INVALID`
- unsupported semantic face target such as a side face → `MISSING`
- invalid Extrude data required by the cap contract → `INVALID`
- blocked Extrude owner → `BLOCKED`
- valid Extrude plus `CAP_START` / `CAP_END` → `RESOLVED`

No geometry-, proximity-, normal-, area-, triangle-index-, or similarly-shaped fallback target is selected.

Dependency projection is owner-based: a `PLANAR_FACE` consumer depends on the referenced Extrude `ownerId`. WD-22D does not introduce an artificial face node or a second dependency authority.

Partial-project behavior therefore remains deterministic: a missing owner stays `MISSING`; an existing but blocked owner propagates `BLOCKED`; an unsupported face identity is not repaired or rebound automatically.

## Persistence boundary

WD-22D does not add a persisted `faces[]` collection to Extrude and does not require a schema bump or project migration.

The stable face identity is deterministically represented by the existing persistent Extrude `objectId` together with `CAP_START` or `CAP_END`. A later consumer persists the StableReference itself.

The focused regression verifies Save → Reload preservation of such a reference using the existing valid project schema.

## Focused Correction

The first implementation head `f6c90c604a7e110b50a89fafa47f364c197dbb85` was not frozen.

Verification identified two non-product-contract blockers:

1. `src/application/dependency-graph.js` contained an unintended broad formatting/compaction diff in addition to the required `PLANAR_FACE` change.
2. The new WD-22D Save → Reload test used an invalid synthetic project fixture and therefore failed project-schema validation.

The authorized Focused Correction preserved the PLANAR_FACE contract and introduced no new functionality:

- `dependency-graph.js` was restored to the original structure and only the minimal owner-based `PLANAR_FACE` projection was retained.
- the WD-22D test fixture was changed to use the existing valid project-schema construction.

The resulting corrected functional head is `668406f2a99e58d2078ab3dada2845d3acbc21c8`.

## Implementation evidence

Functional implementation/freeze head: `668406f2a99e58d2078ab3dada2845d3acbc21c8`.

Diff against the authorized base: 7 commits ahead, 0 behind; merge base exactly `14937a8d87ed13b854b3d5b08880d55f74d7954c`.

Changed functional-scope files:

- `src/model/planar-face-reference.js` – new planar-cap identity, validation, and frame derivation
- `src/application/stable-reference.js` – `PLANAR_FACE` target kind and resolution
- `src/application/dependency-graph.js` – minimal owner-based PLANAR_FACE dependency projection
- `tests/wd-22d-planar-face-reference-foundation.mjs` – focused foundation regression
- `.github/workflows/wd-21e-identity-reference-foundation.yml` – WD-22D regression wiring

Final diff statistics against the authorized base:

- workflow: 4 additions / 2 deletions
- `dependency-graph.js`: 1 addition / 1 deletion
- `stable-reference.js`: 30 additions / 1 deletion
- `planar-face-reference.js`: 109 additions
- WD-22D regression: 72 additions

The corrected implementation remains within the authorized Minimal Scope.

## Exact-head verification evidence

GitHub Actions run `36852079822` checked out exact functional head `668406f2a99e58d2078ab3dada2845d3acbc21c8`.

Workflow: `WD-22D Planar Face Reference Foundation`.

Job `identity-reference-foundation`: **completed / success**.

All regression steps WD-20A through WD-22C passed. The new WD-22D regression also passed:

`Run WD-22D planar face reference foundation regression` – **success**

The focused WD-22D regression covers the authorized foundation contract including CAP_START/CAP_END resolution, positive/negative/symmetric frame derivation, depth-recompute identity stability, MISSING/INVALID/BLOCKED behavior, owner-based dependency projection, and Save → Reload reference persistence.

## Explicit scope exclusions

WD-22D does **not** implement:

- side/mantle face identity
- Edge or Vertex references
- general BRep/topological naming
- triangle/BufferGeometry identity
- Boolean-result face identity
- Fillet/Chamfer face identity
- imported mesh face identity
- Face picking, highlighting, or selection UI
- Sketch-on-Face
- Work-Plane-from-Face / offset or geometry-derived Work Planes
- Snap / Align
- RB-04/RB-05 modeling functionality

These remain later controlled blocks.

## Freeze decision

WD-22D satisfies its authorized Planar Face Reference Foundation scope after the focused correction, with a minimal final diff, successful exact-head CI evidence, and no identified blocker.

**WD-22D is PASS / FROZEN / 0 BLOCKER at functional freeze `668406f2a99e58d2078ab3dada2845d3acbc21c8`.**

The documentation commit created by this Completion / Evidence / Freeze Gate is documentation-only and does not replace or alter the functional freeze.
