# WD-26G – RB-07 Sketch Templates / Sketch Library – Completion / Evidence / Freeze

Status: PASS · FROZEN
Date: 2026-10-02
Authorized base: `40a209865add4ea99720c7a5c17d9a43ac0f8ba7`
Functional freeze head: `925c426505e2fcc2fd105f0740bd42efe113da8b`
Feature branch: `feature/WD-26G-sketch-template-independent-copy`

## Scope

WD-26G closes the RB-07 F069/F070 minimal product block for reusable Sketch Templates / Sketch Library entries on the shared A10 Library Registry foundation.

Implemented contract:

- an existing project sketch can be exported as an A10 `sketch` LibraryEntry with stable LibraryEntry metadata (`libraryEntryId`, `entryKind`, name, category, schema/version) and a type-specific portable sketch payload;
- project-local external `planeRef` is not carried into the reusable payload; the portable payload is normalized to `localXY`;
- insertion always creates a new project-local sketch object with a new `objectId`;
- point, line, circle, arc, spline, spline-control, profile and path identities are regenerated for the inserted copy;
- all internal references are remapped to the new identities;
- profile/path element-ID collections are re-canonicalized after random ID regeneration, including canonical ordering of hole sets;
- the inserted sketch is an independent project copy. No hidden or persistent link to the LibraryEntry remains;
- insertion is one atomic History operation;
- the inserted result uses the existing project persistence and survives Save → Reload;
- minimal UI provides saving the selected sketch as a template and inserting a sketch template.

## Portability / authority boundary

The A10 Library Registry remains the reusable-content authority. It is not merged into the project persistence format.

The inserted sketch becomes ordinary project state. Project object identity, parent/layer placement and external plane binding are not reused from the source project. WD-26G intentionally inserts on `localXY` rather than attempting cross-project plane rebinding.

No second sketch, project or persistence authority was introduced.

## Independent-copy contract

Library insertion is copy semantics, not linked-instance semantics. Source sketch, LibraryEntry payload and inserted project sketch are independent after creation. Editing one must not mutate either of the other two.

All logical topology identities required by the current sketch model are regenerated. References inside lines/arcs/splines and profile/path identity sources are mapped to those regenerated identities. Canonical ordering required by the topology validator is restored after remapping.

## Verification and blocker reconciliation

The final Exact-Head verification was executed against exactly:

`925c426505e2fcc2fd105f0740bd42efe113da8b`

GitHub Actions evidence:

- Workflow: `WD-26G Sketch Template Independent Copy`
- Run: #5
- Run ID: `37062707997`
- Conclusion: `success`
- Exact head: PASS
- Syntax: PASS
- A10 registry regression: PASS
- Sketch topology regression: PASS
- Profile/path identity regression: PASS
- WD-26G focused regression: PASS

Earlier failed runs exposed only bounded verification/implementation defects and were reconciled before freeze: formatting-sensitive historical WD-21A.4 assertions were made semantic; a stale historical BUILD_ID assertion was removed from that historical contract regression; the WD-26G fixture was canonicalized and given an explicit topology precondition; and remapped profile/path identities were canonicalized in the product implementation. The final complete run is green.

## Explicit exclusions

WD-26G does not implement:

- Object Library;
- Assembly Library;
- external Work Plane / Planar Face rebinding on template insertion;
- linked sketch instances;
- linked LibraryEntry updates;
- broader Library browser/product expansion.

## Freeze

The functional WD-26G freeze head is permanently recorded as:

`925c426505e2fcc2fd105f0740bd42efe113da8b`

The documentation commit created by this Gate 3 is evidence-only and does not redefine the functional freeze head.

WD-26G / F069-F070: PASS · FROZEN · 0 BLOCKER.
