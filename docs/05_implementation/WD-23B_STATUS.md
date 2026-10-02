# WD-23B – Thin Extrude Foundation

Status: PASS / FROZEN / 0 BLOCKER

## Authoritative freeze basis

- Authorized base: `5ed3682be1a2816cebc649eac7eb57126ce8805d`
- Verified functional head: `8371dcacbd6e26c54f737421e50689e489ff618d`
- Feature branch: `feature/WD-23B-thin-extrude-foundation`
- Exact-head CI: successful on verified functional head
- Completion type: documentation-only freeze on top of the verified functional head

## Scope

WD-23B establishes the RB-04 Thin Extrude foundation for stable open PATH sources without changing the frozen StableReference, PathIdentity, curve-derivation or path-graph contracts.

The verified functional diff is limited to five files:

- `.github/workflows/wd-21e-identity-reference-foundation.yml`
- `src/application/dependency-graph.js`
- `src/application/thin-extrude.js`
- `src/runtime-three/extrude.js`
- `tests/wd-23b-thin-extrude-foundation.mjs`

Explicitly outside WD-23B remain Revolve, Sweep, Loft, Add/Subtract/Boolean, persistent feature/body chains and RB-05.

## PATH SourceRef / PathIdentity contract

`feature.thin-extrude` consumes exactly one stable `PATH` SourceRef.

- the persistent source authority is `data.sourceRef`;
- PATH identity remains owned by the existing PathIdentity infrastructure;
- WD-23B introduces no second path identity authority;
- the current open-path geometry is resolved again from the stable PATH identity during recompute;
- missing, invalid or unresolved source identity is never heuristically rebound to another path.

The existing deterministic open-path traversal remains authoritative for path orientation. WD-23B therefore does not modify path derivation or introduce a second orientation contract.

## Thin geometry contract

The persistent feature parameters are:

- `sourceRef: StableReference<PATH>`
- `thickness > 0`
- `side: LEFT | RIGHT | CENTER`
- `depth > 0`
- `direction: positive | negative | symmetric`

The source PATH is converted from its existing ordered curve tessellations into one ordered polyline. WD-23B derives a closed thin contour from that polyline.

Side semantics:

- `LEFT`: full thickness on the left side of the canonical path traversal;
- `RIGHT`: full thickness on the right side;
- `CENTER`: half the thickness on each side.

The generated contour is derived state only. It does not replace the stable PATH SourceRef as source authority.

Degenerate or non-finite contour construction is rejected as INVALID rather than producing a nominal body.

## Depth / direction contract

WD-23B reuses the established extrusion depth and direction semantics:

- `positive`: extrusion in positive local Z;
- `negative`: extrusion in negative local Z;
- `symmetric`: extrusion centered around the source plane.

WD-23B does not redefine the WD-23A direction contract.

## Recompute / dependency / blocked-state contract

The recompute chain is:

`PATH SourceRef -> StableReference resolution -> PathIdentity recognition -> current OPEN_PATH geometry -> ordered tessellation -> thin contour -> extrusion output`

A resolved source with valid parameters produces a READY recompute state.

`MISSING`, `INVALID` or `UNRESOLVED` upstream PATH resolution blocks the feature and clears its derived `contour[]` output. Invalid Thin Extrude parameters or degenerate thin geometry produce INVALID.

The dependency graph projects the relationship as `PATH_TO_THIN_EXTRUDE`, with the owning sketch object as the upstream dependency object. No new generic dependency/reference authority is introduced.

`enforceBlockedDependencyState()` clears derived Thin Extrude contour output when the dependency node is blocked, preventing stale geometry from remaining apparently valid.

## Save -> Reload

The focused WD-23B regression covers productive project serialization and reload:

- the stable PATH SourceRef survives Save -> Reload;
- Thin Extrude parameters remain persistent project data;
- after reload the PATH source is resolved again;
- the derived contour is recomputed from the current source rather than treated as source identity.

No Thin-Extrude-specific persistence authority or history subsystem was added.

## Shared Extrude runtime

WD-23B deliberately does not introduce a second 3D extrusion engine.

The Thin Extrude application layer derives a closed contour from the PATH. `src/runtime-three/extrude.js` then consumes that contour through the same `THREE.ExtrudeGeometry` runtime path used by regular Extrude, including the established depth/direction behavior.

The semantic source contracts remain separate:

- WD-23A: `PROFILE -> Extrude`
- WD-23B: `PATH -> derived thin contour -> ExtrudeGeometry`

PATH is not converted into a persistent PROFILE and PROFILE/PATH identity authorities are not mixed.

## Focused diff-quality correction

The first WD-23B verification head contained an unintended large formatting/compaction diff in `src/application/dependency-graph.js` (`+63 / -237`). This violated the authorized minimal-diff requirement even though the intended functional change was small.

The focused correction restored `dependency-graph.js` to the authorized base style and reapplied only the necessary WD-23B additions.

Final base-to-functional-head diff for `dependency-graph.js`:

- `+31 / -2`

The other four WD-23B files were left untouched by that correction.

Final verified WD-23B functional scope remains exactly five files.

## Verification evidence

Exact-head verification was performed against:

`8371dcacbd6e26c54f737421e50689e489ff618d`

with original authorized base:

`5ed3682be1a2816cebc649eac7eb57126ce8805d`

Evidence/result:

- linear branch history: PASS (`6 ahead / 0 behind` at the verified functional head);
- merge base remained exactly the authorized base;
- final scope: exactly five files;
- dependency-graph diff-quality blocker: CLOSED;
- focused WD-23B regression: PASS;
- Exact-head GitHub Actions run for commit `8371dca…`: successful (green);
- final Implementation Verification / Scope / Regression Gate: PASS / 0 BLOCKER.

The GitHub classic combined-status endpoint returned no separate status entries for the SHA; this does not replace or contradict the successful GitHub Actions run evidence used by the verification gate.

## Freeze decision

WD-23B – Thin Extrude Foundation is PASS / FROZEN / 0 BLOCKER at functional head `8371dcacbd6e26c54f737421e50689e489ff618d`.

This completion commit is documentation-only and does not alter the verified product behavior. The resulting documentation commit is the complete WD-23B freeze head for subsequent integration reconciliation.
