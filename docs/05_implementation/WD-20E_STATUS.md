# WD-20E – Foundation Integration / RB-01 Gate

**Stand:** 2026-09-06  
**Status:** IN PROGRESS – E.3 DOMAIN TRANSACTION BOUNDARY  
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

Durch WD-20A–D belastbar abgedeckt sind insbesondere V2-Schema/Migration, SelectionRef-Grundlage, StableReference + Resolution States, No-Silent-Rebinding, Sketch→Extrude Dependency Graph, graph-basierter Recompute und MISSING/INVALID→BLOCKED-Fortpflanzung.

Im E.1-Audit wurden drei noch offene Gate-Lücken identifiziert:

- G1 – Dependency Cycle Protection;
- G2 – Domain Transaction Boundary;
- G3 – Reference / Invalid Diagnostic Projection.

## E.2 – Dependency Cycle Guard – TECH PASS / DEVICE PASS

E.2 ergänzt ausschließlich den bestehenden Dependency-Graph-Core um einen allgemeinen deterministischen Zyklenschutz.

Umgesetzt:

- `detectDependencyCycles(edges)` erkennt Zyklen ausschließlich über fachlich `RESOLVED` Kanten;
- deterministische Strongly-Connected-Component-Auswertung mit stabil sortiertem Ergebnis;
- Selbstzyklus wird ebenfalls erkannt;
- `wouldCreateDependencyCycle(...)` prüft eine geplante Kante vor dem Einfügen;
- `validateDependencyEdge(...)` weist eine zyklische Kante mit `DEPENDENCY_CYCLE` ab;
- vorhandene zyklische Graphkomponenten werden `BLOCKED`;
- normaler Recompute traversiert keine blockierten Dependents;
- keine neue Featureart, Kantenart oder Feature-Engine eingeführt.

Technischer Foundation-Gate-Workflow: **PASS**.  
iPad/Safari-Gerätetest 2026-09-06: **PASS** – Projekt laden, Sketch bearbeiten, Undo/Redo, speichern, neu laden sowie GLB-Import bestätigt.

G1 ist damit geschlossen.

## E.3 – Domain Transaction Boundary – IMPLEMENTED / TECHNICAL GATE PENDING

E.3 führt eine kleine gemeinsame atomare Domänen-Transaction-Grenze ein, ohne das bestehende Snapshot-History-System neu zu entwerfen.

Umgesetzt in `src/application/domain-transaction.js`:

- `installDomainTransactionBoundary(store)` ergänzt `store.runDomainTransaction(...)`;
- eine Domänenaktion erhält genau einen gemeinsamen `before`-Snapshot;
- innerhalb derselben Transaktion wird höchstens ein History-Eintrag zugelassen;
- Mutation und abhängiger Recompute landen gemeinsam im `after`-Snapshot;
- `false`/No-op ohne History-Aufruf erzeugt keinen künstlichen Undo-Eintrag;
- bei Exception wird der Projektzustand auf den Transaction-Startzustand zurückgesetzt;
- verschachtelte Nutzung erzeugt keine zweite unabhängige Transaction-Grenze;
- `wrapDomainMutation(...)` erlaubt bestehende Store-Mutationen ohne internes History-Redesign einzubinden.

Integration:

- die Transaction Boundary wird zusammen mit der bestehenden Extrude-Reference-Foundation installiert;
- nach vollständiger synchroner Runtime-Initialisierung werden die bestehenden Sketch-Domänenmutationen `setSketchPoint`, `setSketchLineEndpoints` und `deleteSketchElement` atomar umschlossen;
- die bestehende `commitSketchMutation()`-Logik bleibt unverändert;
- ihr bestehendes `mutate → dependent recompute → pushHistory` wird nun durch die gemeinsame Transaction-Grenze abgesichert;
- sichtbarer Browser-Teststand: **WD-20E.3**.

Regression:

`tests/wd-20e-domain-transaction.mjs` prüft:

- Mutation + Recompute → genau ein History-Eintrag;
- gesamter Vorzustand im `before`-Snapshot;
- gesamter Mutation+Recompute-Zustand im `after`-Snapshot;
- zweiter interner `pushHistory()` erzeugt keinen zweiten Undo-Schritt;
- No-op erzeugt keinen History-Eintrag;
- Exception rollt den Projektzustand zurück.

Der gemeinsame Workflow `.github/workflows/wd-20e-foundation-gate.yml` führt zusätzlich zu A–D jetzt auch die E.3-Transaction-Regression aus.

G2 Status: **IMPLEMENTED / TECHNICAL GATE PENDING**.

## Noch offene Gate-Punkte

- E.3 technischer Gesamtworkflow muss PASS sein;
- E.3 iPad/Safari Geräte-Regression muss PASS sein;
- G3 / E.4 Reference Diagnostic Projection;
- E.5 RB-01 Integration / Freeze Gate.

## Vorgesehene Folgeblöcke

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
**WD-20E.2:** TECH PASS / DEVICE PASS  
**WD-20E.3:** IMPLEMENTED / TECHNICAL GATE PENDING  
**RB-01 Gate aktuell:** NOT PASS  
**Offene fachliche Gate-Blocker:** G2-Abnahme + G3

Nächster Schritt nach E.3 TECH + DEVICE PASS:

**WD-20E.4 – Reference Diagnostic Projection**
