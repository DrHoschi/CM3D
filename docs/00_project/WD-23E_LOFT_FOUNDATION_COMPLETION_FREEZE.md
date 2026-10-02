# WD-23E – Loft Foundation – Completion / Evidence / Freeze

Status: PASS / FROZEN / 0 BLOCKER

## Authoritative basis

- Integration base: `main = 4a75287a4e0e1c3a79b0331470a16914044bda82`
- Functional implementation head: `efbcf74fb97aeecb4827048daabbe7e086e8dd6e`
- Verified Gate-2 head: `4e5ebad693ee57c987e7f914e6587a1b5fe07dea`
- Verification: GitHub Actions run `36978205973` / run #112, conclusion `success`.

## Scope completed

WD-23E establishes the RB-04 F101 Loft Foundation as a consumer of an ordered set of existing PROFILE sources. It reuses the existing ProfileIdentity / StableReference authority and does not introduce a second profile authority.

A Loft requires at least two `sourceProfileRefs[]`. Each reference is resolved independently, recognized through the existing PROFILE identity contract and transformed from its own sketch/work-plane frame into world-space section geometry.

## Multi-PROFILE / section-order contract

- `sourceProfileRefs[]` contains at least two PROFILE references.
- Array order is the authoritative section order.
- Recompute must preserve this explicit order; sections are not re-sorted from world coordinates.
- Reversing the reference array therefore reverses the derived Loft section order.
- A missing, invalid or unresolved required section blocks the Loft; required sections are not silently skipped or replaced.

## Spatial section derivation

Each PROFILE remains authored in its existing sketch/profile authority. WD-23E resolves the owning sketch plane/work-plane frame and derives the section into world coordinates. Moving a source sketch/work plane changes the corresponding world-space Loft section on recompute without creating a second persistent plane authority.

World-space section points and runtime mesh data are derived state.

## Deterministic ring correspondence

The first Foundation intentionally uses a narrow deterministic correspondence contract: every section must provide a closed outer ring with the same deterministic ring-point count. Corresponding ring indices are connected between adjacent sections.

The Foundation does not perform heuristic shape matching, automatic remeshing, manual match-point inference or topology repair. Incompatible ring topology is INVALID rather than guessed.

## Dependency / recompute contract

Each source PROFILE contributes one dependency edge:

- `PROFILE_TO_LOFT`

Therefore a Loft with N sections has N PROFILE source dependencies. Changes to any required source cause the Loft to be re-derived from the ordered source references.

## Persistence / history boundary

The authoritative Loft input is `feature.loft` plus its ordered `data.sourceProfileRefs[]`. World-space `sections[]` and runtime mesh geometry are derived/recomputable output. Existing project persistence and Undo/Redo/history remain authoritative; WD-23E introduces no second persistence or history subsystem.

## Productive runtime integration

The Loft runtime is installed through the existing productive Three.js geometry chain after Sweep. The focused WD-23E regression verifies this productive runtime connection as well as the PROFILE_TO_LOFT dependency declarations.

## Out of scope

Explicitly outside WD-23E Foundation:

- profile holes / inner contours;
- open profiles;
- rail / guide curves;
- centerline Loft;
- manual match points;
- heuristic/automatic complex shape correspondence;
- automatic remeshing for unequal ring topology;
- Sweep scale/twist controls;
- Boolean / later feature-chain work;
- primitive-family completion F047/F048;
- RB-05.

## Verification evidence

Exact verified head: `4e5ebad693ee57c987e7f914e6587a1b5fe07dea`.

GitHub Actions run `36978205973` / #112 completed successfully on that exact SHA. The complete Foundation regression stack passed, including:

- WD-23A Extrude V2 foundation – PASS
- WD-23B Thin Extrude foundation – PASS
- WD-23C Revolve foundation – PASS
- WD-23D Sweep foundation – PASS
- WD-23E Loft foundation – PASS

No Gate-2 blocker remained.

## Freeze

WD-23E is complete for the defined Loft Foundation scope and is frozen at PASS / 0 BLOCKER. Any later broadening of topology correspondence, holes, guides, match points or related controls requires a separate authorized product block.
