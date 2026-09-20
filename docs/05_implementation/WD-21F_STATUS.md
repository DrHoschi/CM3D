# WD-21F – Profile/Path Dependency & Recompute Integration

Stand: 2026-09-20

**PASS / FROZEN / 0 BLOCKER**

## Freeze-Baseline

`490a6430de8b6c88e4897a52f7bff27d6d436ac7`

Branch: `feature/wd-21f-profile-path-dependency-recompute`

Die spätere Dokumentationsfortschreibung verändert diese getestete Produkt-/Regression-Freeze-Baseline nicht.

## Scope

WD-21F erweitert ausschließlich die vorhandene Dependency-/Recompute-Foundation um konkrete PROFILE-/PATH-StableReferences. Der besitzende Sketch bleibt der Objektknoten im bestehenden Dependency-Graph; die konkrete StableReference bestimmt die Quellgültigkeit. RESOLVED erlaubt Traversal/Recompute. MISSING, INVALID und UNRESOLVED bleiben Root Cause und blockieren das abhängige Feature deterministisch. Wird dieselbe persistente Identity wieder eindeutig RESOLVED, wird die Dependency wieder READY/recompute-fähig. Es gibt keinen zweiten Graphen, kein Silent Rebinding und keinen Fallback auf ein anderes Profil, einen anderen Pfad oder die gesamte Skizze.

## Scope-Grenze

Nicht Bestandteil von WD-21F sind neue UI oder Selection, neue Sketch-/Derivation-Funktionalität, Sweep/Loft/Revolve/Thin Extrude, Multi-Profil-Extrude oder die Umstellung des bestehenden V1-/Bestands-Extrude auf ProfileRef. `extrude.js`, `sketch-editing.js`, StableReference-/Identity-/Derivation-Code und Projektschema blieben unverändert.

## Implementation Evidence

Finaler Scope-Abgleich gegen `98fba11406d11cfc59a7c8dba480df1aacb2fd55`: 5 Commits voraus / 0 zurück. Änderungen ausschließlich:

- `src/application/dependency-graph.js`
- `tests/wd-21f-profile-path-dependency-recompute.mjs`
- `.github/workflows/wd-21e-identity-reference-foundation.yml` ausschließlich zur zweizeiligen Aufnahme des F-Regressionstests.

Der WD-21F-Test deckt PROFILE/PATH-Dependencies, RESOLVED bei stabiler Identity, MISSING/INVALID/UNRESOLVED → BLOCKED, Wiederherstellung → READY sowie Traversal und unveränderte Default-Graph-Semantik ab.

## CI / Regression Evidence

Der manuelle Aggregate-Lauf `WD-21E Identity Reference Foundation #18` auf dem WD-21F-Branch und dem verifizierten Head `490a6430de8b6c88e4897a52f7bff27d6d436ac7` war vollständig SUCCESS. Zu diesem Zeitpunkt enthielt der Aggregate-Workflow den neuen Schritt `node tests/wd-21f-profile-path-dependency-recompute.mjs`. Damit wurden der neue WD-21F-Vertrag und der bestehende WD-20/WD-21-Compatibility-Unterbau gemeinsam nachgewiesen. Der vorherige grüne Lauf #17 hatte den Compatibility-Unterbau bereits vor Einbindung des F-Tests bestätigt.

## Abschluss

WD-21F ist **PASS / FROZEN / 0 BLOCKER**. WD-21E bleibt historisch auf `2c0940d6f58eac99aa89664d252b433488745207` eingefroren. WD-21G beginnt nicht automatisch und benötigt eine separate Reconciliation/Freigabe.
