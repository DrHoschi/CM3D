# WD-20E – Foundation Integration / RB-01 Gate

**Stand:** 2026-09-06  
**Status:** PASS / FROZEN / MERGED  
**Basis:** `main` @ `81e6d484169180a67b25e9d2befb0aa5ebe032b7` (WD-20D PASS / FROZEN / MERGED)  
**Merge:** PR #42 → `main` @ `985b0d86c06a5161abae2e4ce914f66562c8b33d`  
**Branch:** `feature/wd-20e-foundation-integration-rb01-gate` (historischer Entwicklungsbranch)

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

G1 ist geschlossen.

## E.3 – Domain Transaction Boundary – TECH PASS / DEVICE PASS

E.3 führt eine kleine gemeinsame atomare Domänen-Transaction-Grenze ein, ohne das bestehende Snapshot-History-System neu zu entwerfen.

Umgesetzt in `src/application/domain-transaction.js`:

- `installDomainTransactionBoundary(store)` ergänzt `store.runDomainTransaction(...)`;
- eine Domänenaktion erhält genau einen gemeinsamen `before`-Snapshot;
- innerhalb derselben Transaktion wird höchstens ein History-Eintrag zugelassen;
- Mutation und abhängiger Recompute landen gemeinsam im `after`-Snapshot;
- `false`/No-op ohne History-Aufruf erzeugt keinen künstlichen Undo-Eintrag;
- bei Exception wird der Projektzustand auf den Transaction-Startzustand zurückgesetzt;
- verschachtelte Nutzung erzeugt keine zweite unabhängige Transaction-Grenze;
- `wrapDomainMutation(...)` erlaubt bestehende Store-Mutationen ohne internes History-Neudesign einzubinden.

Integration:

- die Transaction Boundary wird nur auf history-fähigen Stores installiert;
- bestehende Sketch-Domänenmutationen werden atomar umschlossen;
- bestehendes `mutate → dependent recompute → pushHistory` bleibt fachlich unverändert;
- Mutation + abhängiger Recompute bilden genau eine Undo/Redo-Aktion.

Technischer Foundation-Gate-Workflow: **PASS**.  
iPad/Safari-Gerätetest 2026-09-06: **PASS**.

G2 ist geschlossen.

## E.4 – Reference Diagnostic Projection – TECH PASS / DEVICE PASS

E.4 erweitert ausschließlich die bestehende Diagnoseansicht. Die Domain bleibt autoritativ; die UI liest und projiziert vorhandene Referenz-/Recompute-Zustände, ohne sie zu verändern.

Umgesetzt in `src/ui/inspector-diagnostics.js`:

- neuer Diagnoseabschnitt `Referenzen / Recompute`;
- Projektion von `data.sourceSketchRef`;
- Projektion von `extensions.sourceSketchReference.state` und deren Diagnostics;
- Projektion von `extensions.recomputeState.state`, `upstreamState` und deren Diagnostics;
- `RESOLVED`, `UNRESOLVED`, `MISSING`, `INVALID` und `BLOCKED` werden aus vorhandenen Domain-Daten nachvollziehbar dargestellt;
- deterministisch nach `objectId` sortierte Projektion;
- keine Resolver-Ausführung, keine Referenzreparatur, kein Rebinding;
- keine neue Referenzlogik, kein Dependency-/Recompute-Ausbau und kein History-Umbau;
- Diagnose aktualisiert sich bei relevanten Store-Ereignissen;
- sichtbarer Browser-Teststand: **WD-20E.4**.

Regression:

`tests/wd-20e-reference-diagnostics.mjs` prüft:

- RESOLVED/READY-Projektion;
- UNRESOLVED-Projektion;
- MISSING → BLOCKED mit erhaltener Ziel-ID und Upstream-Ursache;
- INVALID → BLOCKED mit erhaltener Upstream-Ursache;
- Reference- und Recompute-Diagnostics;
- Projektion ist eine Kopie und kann die autoritativen Domain-Daten nicht mutieren.

Zusätzlich wurde eine veraltete E.3-Build-Überschreibung in `src/application/extrude.js` entfernt und der Foundation-Gate-Workflow um einen Schutz gegen zurückbleibende sichtbare `WD-20E.3`-Runtime-Kennungen unter `src/` ergänzt.

Technischer Foundation-Gate-Workflow: **PASS**.  
iPad/Safari-Gerätetest 2026-09-06: **PASS** – sichtbarer Header und Browser-Tab `WD-20E.4`, Diagnose `WD-20E.4 Referenzdiagnose bereit`, `referenceState: RESOLVED`, `recomputeState: READY`.

G3 ist geschlossen.

## E.5 – RB-01 Integration / Freeze Gate

Gemeinsamer Abschlussabgleich WD-20A–E gegen RB-01:

1. **V1-Projekte kontrolliert laden:** PASS – durch WD-20A Migration/Schema und reale Save/Load-Regressionen abgedeckt.
2. **V1-Basisfunktionen weiter funktionieren:** PASS – Projekt laden, Sketch bearbeiten, Undo/Redo, speichern, neu laden und GLB-Import auf iPad/Safari bestätigt.
3. **Neue SelectionRefs gespeichert/aufgelöst:** PASS – WD-20B/WD-20C Regressionen bleiben im gemeinsamen Foundation-Gate grün.
4. **Undo/Redo keine parallelen Zustände:** PASS – WD-20E.3 Domain Transaction Boundary + Device-Regression.
5. **Ungültige Referenzen sichtbar statt still repariert:** PASS – StableReference No-Silent-Rebinding + MISSING/INVALID→BLOCKED + E.4 Diagnoseprojektion.
6. **Dependency-Zyklen abgewiesen:** PASS – WD-20E.2 Cycle Guard + Regression.
7. **Sichtbare Build-Kennung konsistent:** PASS – `WD-20E.4` in Header und Browser-Tab real bestätigt; stale E.3 Runtime-Override entfernt und Workflow-Guard ergänzt.
8. **Scope-Grenze eingehalten:** PASS – keine neue CAD-Featurefamilie, kein Snap-/Collider-Ausbau, keine allgemeine Feature-Engine.

Der finale Foundation-Gate-Workflow auf dem freigegebenen Head `0e79ab4f296808847780dab332dcbfe4b19cdfd8` war **PASS**. PR #42 wurde anschließend mit exakt diesem Head nach `main` gemergt. Merge-Commit: `985b0d86c06a5161abae2e4ce914f66562c8b33d`.

## Finaler Abschlussstatus

**WD-20A:** PASS / FROZEN / MERGED  
**WD-20B:** PASS / FROZEN / MERGED  
**WD-20C:** PASS / FROZEN / MERGED  
**WD-20D:** PASS / FROZEN / MERGED  
**WD-20E.1:** COMPLETE  
**WD-20E.2:** TECH PASS / DEVICE PASS  
**WD-20E.3:** TECH PASS / DEVICE PASS  
**WD-20E.4:** TECH PASS / DEVICE PASS  
**WD-20E.5:** PASS / FROZEN / MERGED  
**WD-20E:** PASS / FROZEN / MERGED  
**RB-01 Gate:** PASS / FROZEN  
**Offene fachliche Gate-Blocker:** 0

WD-20E / RB-01 ist abgeschlossen. Der eingefrorene Stand wird nicht fachlich erweitert; Änderungen erfolgen nur über einen neuen Folgeblock oder bei einer konkret dokumentierten Regression.

## Nächster zulässiger Block

**RB-02 – Sketch Topology & Profiles**  
Die konkrete WD-Zerlegung dafür wird erst nach diesem Freeze gegen den aktuellen Repository-Stand festgelegt.
