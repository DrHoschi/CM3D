# WD-23A – Extrude V2 Foundation

Status: PASS / FROZEN / 0 BLOCKER

## Authoritative freeze basis

- Authorized base / current RB-04 entry main: `7a7cfb64e9c0df3624caaa033a245947ba85f22b`
- Verified functional head: `67eb1384be83ffb10a6bab211e6a46d6e92d0573`
- Feature branch: `feature/WD-23A-extrude-v2-foundation`
- Exact-head CI: `36915340540` — completed / success
- Completion type: documentation-only freeze on top of the verified functional head

## Scope

WD-23A establishes the Extrude V2 foundation required at the entry to RB-04 without pulling later feature families or RB-05 body-chain semantics forward.

The authorized implementation scope was limited to:

- `src/application/extrude.js`
- `src/application/dependency-graph.js`
- `src/runtime-three/extrude.js`
- focused WD-23A regression coverage
- minimal CI integration

A focused compatibility correction additionally touched `src/model/planar-face-reference.js` only to preserve the already-frozen WD-22D PLANAR_FACE / CAP_START / CAP_END contract for the new V2 extrude representation.

Explicitly outside WD-23A remain Add/Subtract body combination, Thin Extrude, Revolve, Sweep, Loft, primitive expansion, and RB-05 sequential body/feature-chain semantics.

## PROFILE SourceRef contract

New V2 extrudes use stable PROFILE references as their fachliche source authority:

- `data.sourceProfileRefs[]` contains stable PROFILE references.
- PROFILE identity remains owned by the existing sketch/profile identity infrastructure; WD-23A introduces no second profile identity authority.
- `data.profiles[]` is derived geometry/cache and is not source identity.
- holes remain part of the resolved profile identity rather than becoming independent extrude source references.

The legacy `sourceSketchRef + profile` representation remains supported for existing extrudes and is not silently migrated during load.

## Multi-profile contract

A V2 extrude may consume an ordered set of PROFILE references.

- every configured source profile must resolve successfully;
- successful resolution rebuilds the complete `profiles[]` cache deterministically;
- any missing/invalid/unresolved source blocks the complete V2 extrude rather than retaining a partial output;
- source-reference ordering remains persistent and authoritative for the V2 source set.

This removes the former single-profile-only foundation while preserving legacy single-profile projects.

## Recompute contract

The V2 recompute path is:

`sourceProfileRefs[] -> stable PROFILE resolution / profile identity recognition -> current sketch profile geometry -> profiles[] -> runtime extrude output`

Changes to source sketch geometry therefore rebuild the derived V2 profile cache from the stable PROFILE identities rather than treating a stored geometry snapshot as the source of truth.

`depth` and the existing `positive | negative | symmetric` direction semantics remain unchanged by WD-23A.

## Dependency projection and blocked-state behavior

The dependency graph now projects V2 extrudes through `PROFILE_TO_EXTRUDE` dependencies. PROFILE ownership continues to project to the owning sketch object through the existing dependency/reference model.

Legacy extrudes retain their existing `SKETCH_TO_EXTRUDE` dependency behavior.

For V2 extrudes, an unresolved upstream profile dependency clears the V2 derived `profiles[]` output and records the established blocked recompute state. No partial body is kept.

## Persistence / Save -> Reload evidence

The focused WD-23A regression verifies productive Save -> Reload of the V2 representation:

- stable `sourceProfileRefs[]` survive serialization;
- the reloaded extrude resolves its PROFILE bindings again;
- the derived `profiles[]` cache can be recomputed after reload;
- legacy extrudes remain accepted.

The first verification run exposed an invalid manually-created test transform. The focused correction changed the test fixture to the existing valid project transform contract; no product behavior was broadened for that failure.

## WD-22D PLANAR_FACE / cap compatibility

WD-22D previously validated PLANAR_FACE extrude owners only in the legacy `sourceSketchRef + profile` representation. That made an otherwise valid V2 extrude resolve `CAP_END` as INVALID.

The focused compatibility correction extends only the existing owner validation so that a valid WD-23A `sourceProfileRefs[] + profiles[]` extrude is also accepted.

The frozen WD-22D semantics remain unchanged:

- stable `CAP_START` and `CAP_END` identities remain authoritative;
- cap geometry is not redefined;
- depth semantics are unchanged;
- `positive | negative | symmetric` direction behavior is unchanged;
- existing planar-face rotation/frame mathematics remain unchanged.

## Focused corrections

### 1. Diff / Save -> Reload correction

The first implementation verification identified two blockers:

- unintended large formatting/compaction churn in `dependency-graph.js`;
- an invalid transform in the new Save -> Reload test fixture.

Correction:

- `dependency-graph.js` was restored to the baseline style and only the minimal WD-23A dependency changes were reapplied;
- the fixture was corrected to the existing valid transform schema.

The final base-to-functional-head diff for `dependency-graph.js` is reduced to the intended minimal change (`20 additions / 15 deletions`) rather than the earlier large formatting rewrite.

### 2. WD-22D cap compatibility correction

The subsequent exact-head verification isolated `CAP_END -> INVALID` for the new V2 extrude representation.

Correction:

- `src/model/planar-face-reference.js` was minimally extended to recognize the V2 extrude representation as a valid extrude owner;
- no cap identity, geometry, direction, depth, or frame contract was changed.

## Final verification evidence

Final exact-head verification was performed against functional head:

`67eb1384be83ffb10a6bab211e6a46d6e92d0573`

with original authorized base:

`7a7cfb64e9c0df3624caaa033a245947ba85f22b`

Verification result:

- linear history: PASS (`ahead`, 9 commits, 0 behind at the verified functional head);
- scope / diff-quality review: PASS;
- prior dependency-graph formatting blocker: CLOSED;
- Save -> Reload blocker: CLOSED;
- WD-22D CAP compatibility blocker: CLOSED;
- existing WD-20A through WD-22I regression chain: PASS;
- WD-23A focused Extrude V2 foundation regression: PASS;
- Exact-head CI `36915340540`: completed / success;
- final result: PASS / 0 BLOCKER.

## Freeze decision

WD-23A – Extrude V2 Foundation is PASS / FROZEN / 0 BLOCKER at functional head `67eb1384be83ffb10a6bab211e6a46d6e92d0573`.

This completion commit is documentation-only and does not alter the verified product behavior. The resulting documentation commit is the complete WD-23A freeze head for subsequent integration reconciliation.

WD-23A does not claim completion of the remaining RB-04 feature families or Add/Subtract body-chain behavior. Those remain separate later decisions/blocks.