# WD-20E – Foundation Integration / RB-01 Gate

**Stand:** 2026-09-04  
**Status:** IN PROGRESS – E.2 DEPENDENCY CYCLE GUARD  
**Basis:** `main` @ `81e6d484169180a67b25e9d2befb0aa5ebe032b7` (WD-20D PASS / FROZEN / MERGED)  
**Branch:** `feature/wd-20e-foundation-integration-rb01-gate`

## Ziel

WD-20E integriert und prüft WD-20A bis WD-20D gemeinsam gegen das verbindliche Gate von `RB-01 – Foundation & Compatibility`. In WD-20E werden keine neuen CAD-Featurefamilien eingeführt. Der Block schließt ausschließlich noch offene Foundation-/Integrationskriterien, die für den RB-01-PASS erforderlich sind.

## Verbindliche RB-01-Gate-Kriterien

Gemäß `docs/06_v2_planning/V2_DEVELOPMENT_ROADMAP.md` ist RB-01 PASS, wenn mindestens:

1. V1-Projekte kontrolliert laden;
2. V1-Basisfunktionen weiter funktionieren;
3. neue SelectionRefs gespeichert/aufgelöst werden können;
4. Undo/Redo keine parallelen Zustände erzeugt;
5. ungültige Referenzen sichtbar statt still repariert werden;
6. Dependency-Zyklen abgewiesen werden.

Der RB-01-Inhalt verlangt außerdem unter anderem:

- gemeinsames SelectionRef-Konzept;
- stabile logische ID-/Reference-Grundtypen;
- gemeinsames `RESOLVED/UNRESOLVED/MISSING/INVALID/BLOCKED`-Statusmodell;
- Dependency-Graph-Grundgerüst und Zyklenschutz;
- Domänen-Transaction-Grenze für Undo/Redo;
- gemeinsame Selection-/Statusbasis für Viewer/Object Tree/Inspector;
- V2-Projektschema/Versionserkennung und V1→V2-Migration;
- Save/Load für neue Grundstrukturen;
- Diagnoseprojektion für Referenz-/Migrationsfehler.

## E.1 – Foundation Integration Audit – COMPLETE

### Bereits durch WD-20A–D belastbar abgedeckt

- V2-Projektschema `0.2.0` und kontrollierter V1 `0.1.0` → V2-Migrationspfad;
- Erhalt bestehender IDs/Nutzdaten bei Migration;
- gemeinsame SelectionRef-Semantik für OBJECT, SKETCH, SKETCH_ELEMENT und SKETCH_POINT;
- StableReference-Grundtyp und Resolution-State-Modell;
- No-Silent-Rebinding;
- persistente `sourceSketchRef` für bestehende Sketch→Extrude-Abhängigkeit;
- zentraler Dependency Graph für Sketch→Extrude;
- graph-basierter deterministischer Recompute;
- `MISSING`/`INVALID`-Ursache mit abhängiger `BLOCKED`-Fortpflanzung;
- stale Extrusionsgeometrie wird bei blockierter Quelle verworfen;
- Recompute erzeugt im geprüften Sketch→Extrude-Pfad keinen zusätzlichen Undo-Schritt;
- technische Regressionen und iPad/Safari-Gerätetests A–D PASS.

### Im E.1-Audit festgestellte offene RB-01-Gate-Lücken

#### G1 – Dependency Cycle Protection

Status nach E.2: **IMPLEMENTED / TECHNICAL GATE PENDING**.

#### G2 – Domain Transaction Boundary

`AppStore` verwendet weiterhin funktionierende Snapshot-History (`snapshot()` / `pushHistory()`), und WD-20D bestätigt für Sketch→Extrude, dass Recompute keinen eigenen Undo-Schritt erzeugt. Es existiert jedoch noch keine explizite gemeinsame Domänen-Transaction-Grenze, über die Mutation + Recompute als allgemeines Foundation-Muster atomar abgeschlossen werden.

**Status:** OPEN / BLOCKER FOR RB-01 PASS.

#### G3 – Reference / Invalid Diagnostic Projection

`src/ui/inspector-diagnostics.js` zeigt allgemeine Status-, Selection-, Scene-, Event- und History-Daten, projiziert aber die in WD-20C/D eingeführten Reference-/Recompute-Zustände noch nicht gezielt als gemeinsame Diagnose (`RESOLVED/MISSING/INVALID/BLOCKED`, Diagnostics, Upstream-State).

**Status:** OPEN / BLOCKER FOR RB-01 PASS.

## E.2 – Dependency Cycle Guard

E.2 ergänzt ausschließlich den bestehenden Dependency-Graph-Core um einen allgemeinen deterministischen Zyklenschutz.

Umgesetzt:

- `detectDependencyCycles(edges)` erkennt Zyklen ausschließlich über fachlich `RESOLVED` Kanten;
- deterministische Strongly-Connected-Component-Auswertung mit stabil sortiertem Ergebnis;
- Selbstzyklus wird ebenfalls erkannt;
- `wouldCreateDependencyCycle(graph, sourceObjectId, dependentObjectId)` prüft eine geplante neue Kante vor dem Einfügen;
- `validateDependencyEdge(...)` weist eine zyklische Kante kontrolliert mit `DEPENDENCY_CYCLE` ab;
- vorhandene zyklische Graphkomponenten werden als `BLOCKED` mit Diagnose `DEPENDENCY_CYCLE` markiert;
- normaler Recompute traversiert keine bereits blockierten Dependents;
- ungültige/nicht aufgelöste Kanten werden nicht fälschlich als gültiger Zyklusbestandteil behandelt;
- keine neue Featureart, keine neue Kantenart und keine allgemeine Feature-Engine eingeführt.

Regression erweitert in `tests/wd-20d-dependency-graph.mjs`:

- 3-Knoten-Zyklus;
- Selbstzyklus;
- INVALID-Kante erzeugt keinen fachlichen Zyklus;
- geplante Rückkante wird deterministisch abgewiesen;
- azyklische geplante Kante bleibt erlaubt;
- bestehende WD-20D-Graph-/Blocked-Regression bleibt enthalten.

Neuer Integrationsworkflow:

`.github/workflows/wd-20e-foundation-gate.yml`

Er führt gemeinsam die vorhandenen WD-20A-, WD-20B-, WD-20C- und WD-20D/E-Regressionen aus.

Sichtbarer Browser-Teststand: **WD-20E.2**.

## Noch offene Gate-Punkte

- E.2 technischer Gesamtworkflow muss PASS sein;
- E.2 Geräte-Regression muss PASS sein;
- G2 / E.3 Domain Transaction Boundary;
- G3 / E.4 Reference Diagnostic Projection;
- E.5 RB-01 Integration / Freeze Gate.

## Vorgesehene Folgeblöcke

### WD-20E.3 – Domain Transaction Boundary

Eine kleine gemeinsame atomare Transaction-Hülle über der bestehenden Snapshot-History, die Mutation + abhängigen Recompute als eine History-Aktion abschließt. Bestehende Undo/Redo-Semantik bleibt erhalten; kein History-Neudesign.

### WD-20E.4 – Reference Diagnostic Projection

Bestehende Diagnoseansicht um gemeinsame Reference-/Recompute-Zustände und Diagnostics erweitern. Keine UI-Neugestaltung.

### WD-20E.5 – RB-01 Integration / Freeze Gate

A–E gemeinsam regressieren, Save/Load und Undo/Redo prüfen, iPad/Safari-Gerätetest, offene Blocker = 0, anschließend RB-01 PASS/FROZEN und Merge nach `main`.

## Aktueller Stand

**WD-20A:** PASS / FROZEN / MERGED  
**WD-20B:** PASS / FROZEN / MERGED  
**WD-20C:** PASS / FROZEN / MERGED  
**WD-20D:** PASS / FROZEN / MERGED  
**WD-20E.1:** COMPLETE  
**WD-20E.2:** IMPLEMENTED / TECHNICAL GATE PENDING  
**RB-01 Gate aktuell:** NOT PASS  
**Offene fachliche Gate-Blocker nach E.2:** 2 (`G2`, `G3`) plus E.2-Abnahme

Nächster Schritt nach E.2 TECH + DEVICE PASS:

**WD-20E.3 – Domain Transaction Boundary**
