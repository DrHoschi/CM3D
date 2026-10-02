# WD-23D – Sweep Foundation – Completion / Evidence / Freeze

Status: PASS / FROZEN / 0 BLOCKER

## Authoritative basis

- Integration base: `main = 4f47a5d0b697a2fbb491dafbad7090cd706d4315`
- Functional implementation head: `2140fc1cafb2fa740af11dbfceb32f5700d4378b`
- Verified Gate-2 head: `691f024c3dfa33be718888e3f88ea4410b88846f`
- Verification: GitHub Actions run `36976914007` / run #110, conclusion `success`.

## Scope completed

WD-23D establishes the RB-04 F100 Sweep Foundation as a consumer of exactly one existing `PROFILE` source and one existing open `PATH` source. It reuses the WD-23A profile identity/reference authority and WD-23B deterministic open-path authority; it does not create a second profile or path authority.

The foundation resolves stable PROFILE/PATH source references, derives the path in world space, builds deterministic transported 3D frames, derives sweep output state, participates in recompute/blocking, exposes two dependency edges, and provides productive Three.js sweep geometry generation.

## Frame / twist contract

- PATH start and traversal direction remain authoritative from the existing deterministic PATH derivation.
- The initial sweep frame is derived reproducibly from the path tangent plus the source profile/sketch orientation.
- Subsequent frames transport the normal from the previous tangent to the next tangent rather than independently choosing a new normal at each sample.
- The transported normal is reprojected orthogonally to the current tangent and the binormal is rebuilt deterministically.
- This foundation therefore avoids uncontrolled per-sample orientation flips/twisting; it does not introduce user-authored twist or scale controls.
- Frame samples and generated geometry are derived state, not a new persistent path authority.

## Dependency / recompute contract

A sweep has exactly two source dependencies:

- `PROFILE_TO_SWEEP`
- `PATH_TO_SWEEP`

A change to either source causes the sweep to be recomputed from the existing source identities/references. Missing, invalid, unresolved, or otherwise unusable upstream sources block the derived sweep and clear stale derived output rather than silently rebinding to geometrically similar sources.

## Persistence / history boundary

The authoritative inputs are the sweep feature plus its stable PROFILE and PATH source references. Transported frames, sampled world-path data and runtime mesh geometry remain derived/recomputable output. The existing project persistence and history mechanisms remain authoritative; WD-23D introduces no second save/history subsystem.

## Out of scope

Explicitly outside WD-23D:

- scale along path;
- authored twist along path;
- multiple profiles / variable cross sections;
- rail or guide curves;
- closed sweep loops;
- Loft / F101;
- primitive-family completion F047/F048;
- Boolean / later feature-chain work;
- RB-05;
- profile holes in the first productive sweep-mesh foundation where not explicitly supported by the runtime generator.

## Verification evidence

Exact verified head: `691f024c3dfa33be718888e3f88ea4410b88846f`.

GitHub Actions run `36976914007` completed successfully. The regression stack from WD-20A through WD-22I passed, followed by:

- WD-23A Extrude V2 foundation – PASS
- WD-23B Thin Extrude foundation – PASS
- WD-23C Revolve foundation – PASS
- WD-23D Sweep foundation – PASS

No verification blocker remained.

## Freeze

WD-23D is complete for the defined Foundation scope and is frozen at PASS / 0 BLOCKER. Future extensions must not silently broaden this contract; scale/twist, multi-profile behavior, guide rails, closed loops and Loft require separate product blocks.
