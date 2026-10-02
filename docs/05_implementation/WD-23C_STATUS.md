# WD-23C – Revolve Foundation

Status: PASS / FROZEN / 0 BLOCKER

## Authoritative freeze basis

- Authorized base: `6ef533288926398680de40ccd8cb4fa68b0b4c68`
- Verified functional head: `8d5bbe736c1162a75150a1de0cf2001239d36bca`
- Feature branch: `feature/WD-23C-revolve-foundation`
- Exact-head CI: `36972770132` – completed / success
- Completion type: documentation-only freeze on top of the verified functional head

## Scope

WD-23C establishes the RB-04 Revolve Foundation as the first rotational 3D feature consuming two independent stable source references.

The verified functional diff is limited to:

- `.github/workflows/wd-21e-identity-reference-foundation.yml`
- `src/application/dependency-graph.js`
- `src/application/revolve.js`
- `src/main.js`
- `src/runtime-three/revolve.js`
- `tests/wd-23c-revolve-foundation.mjs`

Explicitly outside WD-23C remain Sweep, Loft, Add/Subtract/Boolean, persistent feature/body chains, Fillet, Pattern, RB-05, new ReferenceTargetKinds and new axis authorities.

## PROFILE + AXIS SourceRef contract

`feature.revolve` consumes two independent stable references:

- `data.sourceProfileRef: StableReference<PROFILE>`
- `data.axisRef: StableReference<CONSTRUCTION_AXIS>`

The PROFILE source remains owned by the existing PROFILE/PathIdentity infrastructure. The axis remains owned by the existing construction-reference infrastructure.

WD-23C introduces no second PROFILE identity, no second construction-axis identity and no heuristic rebinding. Both references are resolved again during recompute.

The Foundation intentionally accepts one PROFILE. Multi-profile Revolve is deferred and non-blocking for WD-23C.

## Revolve frame contract

PROFILE geometry originates in the source sketch frame while the referenced construction axis resolves as a geometric LINE with origin and normalized direction.

WD-23C converts both sources into one common Revolve frame before runtime geometry generation. The axis defines the rotational frame; profile points are projected into deterministic axial/radial coordinates relative to that axis.

No assumption that Revolve is limited to a hard-coded sketch X/Y axis is introduced.

The existing reference/work-plane/axis authorities remain unchanged.

## Angle / direction contract

Persistent Revolve parameters are:

- `angleDeg > 0 && angleDeg <= 360`
- `direction: positive | negative`

`360°` represents a full revolution. Smaller valid values represent partial revolutions.

Reverse is represented by the existing direction value rather than by a second boolean authority. WD-23C does not introduce symmetric Revolve semantics.

## Geometry validity boundary

A valid closed PROFILE and a valid non-degenerate construction axis are required.

Profile contact with the axis may remain valid when the resulting rotational geometry is non-degenerate. Geometry that crosses the axis in a way that produces a degenerate/self-intersecting Revolve result is rejected as INVALID.

WD-23C performs no automatic profile splitting, repair or topology creation.

## Two-source dependency contract

The dependency graph projects the two independent Revolve sources as:

- `PROFILE_TO_REVOLVE`
- `AXIS_TO_REVOLVE`

A persistent construction axis therefore participates as a normal upstream object dependency.

A global system construction axis remains a valid StableReference source but deliberately produces no object dependency edge, consistent with the existing system-construction dependency contract.

Missing required source references produce MISSING. A source that cannot be resolved produces BLOCKED with the upstream state/diagnostics retained.

No new dependency authority was introduced.

## Recompute / blocked-state contract

The recompute chain is conceptually:

`PROFILE SourceRef + AXIS SourceRef -> current PROFILE geometry + current LINE geometry -> common Revolve frame -> validated revolve profile -> runtime output`

Changes to either persistent source require recomputation of the same Revolve feature.

When the feature becomes dependency-blocked, derived Revolve state is cleared rather than leaving stale output apparently valid. The stable SourceRefs and persistent Revolve parameters remain the source authority.

## Save -> Reload / history

The focused WD-23C regression covers project serialization and reload with both stable references.

After reload:

- PROFILE SourceRef remains stable;
- AXIS SourceRef remains stable;
- persistent Revolve parameters remain available;
- sources are resolved again;
- derived Revolve state is recomputed.

WD-23C introduces no separate persistence schema authority and no separate Undo/Redo or history subsystem.

## Separate Revolve runtime

WD-23C deliberately does not turn the existing Extrude runtime into a generic feature engine.

`src/runtime-three/revolve.js` is a separate rotational runtime generator using `THREE.LatheGeometry` for the prepared Revolve profile.

Reference resolution, feature-state handling and domain validation remain in the application layer; the runtime consumes already prepared geometry data.

This preserves the semantic separation:

- WD-23A: `PROFILE -> Extrude`
- WD-23B: `PATH -> Thin Extrude`
- WD-23C: `PROFILE + AXIS -> Revolve`

## Productive runtime integration

The first WD-23C verification identified that the isolated Revolve runtime existed but was not installed at the productive bootstrap.

The focused Verification Blocker Correction added the minimal `installRevolveRuntime(runtime)` integration at the existing product bootstrap in `src/main.js`.

No broader runtime restructuring was performed.

## Verification blocker corrections

### 1. Missing dependency/runtime integration

The first functional verification identified two missing parts of the authorized contract:

- no productive `PROFILE_TO_REVOLVE` / `AXIS_TO_REVOLVE` dependency projection;
- no productive Revolve runtime installation.

The focused correction added only those missing integrations and extended the focused regression to cover a persistent construction-axis dependency and productive runtime availability.

### 2. Dependency-graph diff-quality correction

That correction initially introduced an unintended formatting/compaction diff in `src/application/dependency-graph.js` (`+43 / -246`).

The second focused correction restored the dependency graph to the authorized base style and reapplied only the required WD-23C Revolve additions.

Final base-to-functional-head dependency-graph diff:

- `+39 / -2`

The final functional diff remained limited to the authorized WD-23C implementation surface.

## Verification evidence

Exact-head verification was performed against:

`8d5bbe736c1162a75150a1de0cf2001239d36bca`

with original authorized base:

`6ef533288926398680de40ccd8cb4fa68b0b4c68`

Evidence/result:

- branch history: linear, `9 ahead / 0 behind` at the verified functional head;
- merge base: exactly the authorized base;
- final functional scope: six files;
- PROFILE + persistent AXIS dependency projection: verified;
- global system-axis dependency boundary: preserved;
- productive Revolve runtime integration: verified;
- dependency-graph diff-quality blocker: CLOSED;
- WD-23C focused regression: PASS;
- Exact-head GitHub Actions run `36972770132`: completed / success;
- all regression steps WD-20A through WD-23B: success;
- `Run WD-23C revolve foundation regression`: success;
- final Implementation Verification / Scope / Regression Gate: PASS / 0 BLOCKER.

## Freeze decision

WD-23C – Revolve Foundation is PASS / FROZEN / 0 BLOCKER at functional head `8d5bbe736c1162a75150a1de0cf2001239d36bca`.

This completion commit is documentation-only and does not alter the verified product behavior. The resulting documentation commit is the complete WD-23C freeze head for subsequent main-integration reconciliation.
