# WD-24C – F053/F102 Bevel / Fillet Foundation – Completion / Evidence / Freeze

Status at functional head: PASS / 0 BLOCKER

## Authoritative basis

- Authorized base: `main = 56382990d577b9b6fbcc386c67b26f7fc85b119b`
- Functional Exact Head: `d5f5b5c4f589b376368d9a3c56535bab2a567792`
- Branch: `feature/WD-24C-bevel-fillet-foundation`
- RB-05 features: F053 Bevel / F102 Fillet Foundation

## Stable EDGE / EdgeIdentity authority

WD-24C extends the existing StableReference model with `EDGE`. An edge identity is a stable subtarget of a `FEATURE_OUTPUT`; it is not a persistent Three.js Edge, Mesh or runtime pointer.

The EdgeIdentity publisher derives deterministic edge subtarget identities from productive feature geometry and republishes them after recompute. Missing edge identities are treated as invalid references rather than silently rebound to arbitrary topology.

## Feature contract

WD-24C introduces `feature.edge-modifier` with exactly two foundation modes:

- `BEVEL` → F053
- `FILLET` → F102

The feature stores one stable source Feature-Output reference, explicit stable `edgeRefs[]`, mode and constant positive `amount`. The feature owns its resulting body output so later RB-05 features can consume it through the WD-24A sequential Feature-Output contract.

## F053 Bevel

F053 uses a real topological bevel operation on selected stable edges. The runtime kernel builds welded topology, validates the solid and invokes the pinned topology kernel's bevel geometry operation. It does not implement Bevel by translating or directly deforming existing source vertices.

## F102 segmented Fillet

F102 uses the same Stable-EDGE and manifold topology authority as F053. The foundation contract uses a deterministic six-stage segmented round. Each stage is produced through a topology edit; the source geometry is not modified in place as a visual vertex-deformation substitute.

The foundation deliberately supports the constrained constant-radius contract only. It does not introduce automatic radius clamping, tangency propagation, multi-radius or face fillets.

## Manifold / topology boundaries

The runtime rejects unsuitable source topology rather than silently repairing it. The kernel checks for:

- boundary edges;
- non-manifold edges;
- inconsistent winding;
- degenerate faces;
- missing selected stable EDGE identities;
- non-positive or non-finite Bevel/Fillet amounts.

F102 foundation additionally constrains a fillet feature to one stable selected EDGE while the segmented topology contract is being established.

## Dependency / recompute / BLOCKED

The edge modifier consumes the source through the existing `FEATURE_OUTPUT` authority and declares the corresponding body-to-edge-modifier dependency. Stable edge references are resolved against the recomputed source geometry.

If the source Feature-Output or selected EdgeIdentity cannot be resolved, the modifier must not substitute an unrelated edge or stale result. Recovery occurs through the existing recompute/dependency path when the authoritative source becomes valid again.

## Persistence and Undo / Redo

Persistent WD-24C state consists of ordinary project data: source StableReference, explicit edge StableReferences, mode and amount. No runtime Mesh/Edge object is persisted.

Creation and edits remain on the existing store snapshot/history authority. WD-24C introduces no second history system, so Save→Reload and Undo/Redo retain the same project/store authority as WD-24A/B.

## Productive integration

The Application foundation is installed once through the existing application primitive-family chain.

The productive Three runtime installs the edge-modifier adapter once after the existing Boolean runtime wrapper. The adapter routes:

- `BEVEL` → `bevelGeometryByStableEdges()`
- `FILLET` → `filletGeometryByStableEdges()`

Feature edge identities are published from productive feature geometry and again for the resulting edge-modifier geometry.

Existing Extrude, Revolve, Sweep, Loft, Primitive Family and Boolean authorities remain in place.

## Final functional scope

Exactly nine files differ from the authorized base at the functional Exact Head:

1. `.github/workflows/wd-24c-bevel-fillet-foundation.yml`
2. `src/application/bevel-fillet.js`
3. `src/application/edge-identity.js`
4. `src/application/primitive-family.js`
5. `src/application/stable-reference.js`
6. `src/runtime-three/bevel-fillet-kernel.js`
7. `src/runtime-three/bevel-fillet.js`
8. `src/runtime-three/boolean.js`
9. `tests/wd-24c-bevel-fillet-foundation.mjs`

The existing application/runtime integration files contain only the minimal WD-24C installation extensions.

## Exact-head verification evidence

GitHub Actions:

- Workflow: `WD-24C Bevel Fillet Foundation`
- Run: `#1`
- Run ID: `36986631208`
- Exact Head: `d5f5b5c4f589b376368d9a3c56535bab2a567792`
- Conclusion: `success`

Verified steps:

- StableReference syntax: PASS
- EdgeIdentity syntax: PASS
- Bevel/Fillet Application syntax: PASS
- Application integration syntax: PASS
- Bevel/Fillet kernel syntax: PASS
- Bevel/Fillet runtime syntax: PASS
- Runtime integration syntax: PASS
- WD-24A regression: PASS
- WD-24B regression: PASS
- focused WD-24C regression: PASS

Final Gate-2 result: `PASS / 0 BLOCKER`.

## Linearity

Immediately before Gate-3 documentation, `main` was rechecked and remained exactly:

`56382990d577b9b6fbcc386c67b26f7fc85b119b`

The functional Exact Head is linear from this base:

- 12 commits ahead;
- 0 commits behind;
- merge-base equals the authorized main.

## Out of scope / RB-05 continuation

WD-24C deliberately does not implement:

- automatic radius/width clamping;
- variable or multi-radius fillets;
- tangency propagation;
- face fillets;
- broad arbitrary-topology healing;
- feature-chain UI / drag-reorder UX;
- F033 Mirror;
- F103/F104 Linear/Radial Pattern.

These remain later RB-05 work.

## Freeze decision

`WD-24C = PASS / FROZEN / 0 BLOCKER` at functional Exact Head `d5f5b5c4f589b376368d9a3c56535bab2a567792`.

The documentation commit may be integrated together with the functional commits by linear fast-forward, provided `main` remains exactly the authorized base.
