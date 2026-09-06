# WD-21A – Sketch Topology Contract & Element Foundation

**Branch:** `feature/wd-21a-sketch-topology-contract-element-foundation`  
**Basis:** `main` @ `1edae185c6207db9d754c94d00d23cf10218c56c`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-06

## WD-21A.1 – Existing Sketch Data/Topology Contract Inventory

**Status:** PASS / INVENTORY COMPLETE

Bestand vor Änderung:

- Sketchdaten bestehen aus `points` und `lines`.
- Punkte besitzen stabile `pointId`, Linien stabile `lineId`.
- Linien referenzieren Endpunkte über `startPointId` / `endPointId`.
- gleiche Koordinaten allein erzeugen keine topologische Verbindung.
- SelectionRef und StableReference kennen `SKETCH_ELEMENT` und `SKETCH_POINT`, behandelten `SKETCH_ELEMENT` vor A.2 intern jedoch faktisch als Linie.
- Sketch-Mutationen waren bereits in Snapshot-History und die WD-20E Domain-Transaction-Grenze eingebunden, aber auf mehrere Owner verteilt.

## WD-21A.2 – Unified Sketch Element & Topology Contract Foundation

**Status:** PASS / DEVICE VERIFIED / NOT FROZEN AS WD-21A BLOCK

Umgesetzt:

1. Zentraler Contract-Layer `src/model/sketch-topology.js`.
2. `SketchElementKind` registriert den bestehenden Elementtyp `line`, ohne die persistente `points`/`lines`-Struktur zu brechen.
3. Generische Auflösung über `getSketchElement(...)`; Punktauflösung über `getSketchPoint(...)`.
4. Autoritative Topologie-Invariante: Zwei Endpunkte sind nur dann topologisch verbunden, wenn sie dieselbe `pointId` referenzieren. Geometrisch identische Koordinaten erzeugen keine Verbindung.
5. `validateProject(...)` delegiert Sketch-Invarianten an `validateSketchTopology(...)`.
6. SelectionRef und StableReference lösen `SKETCH_ELEMENT` über den gemeinsamen Elementvertrag auf. Alte Elementreferenzen ohne `subTargetId` bleiben für bestehende Linien kompatibel; neue typisierte Referenzen können `subTargetId: 'line'` tragen.
7. `src/main.js` verwendet denselben Resolver für die aktuelle UI-Selection-Bridge.
8. Die sichtbare Build-Kennung wurde zentralisiert; alte installer-lokale WD-12A- und Diagnose-WD-20E.4-Kennungen wurden aus den laufzeitrelevanten Stellen entfernt.
9. Automatischer Regressionstest `tests/wd-21a2-sketch-topology-contract.mjs` und Workflow `.github/workflows/wd-21a2-sketch-topology.yml`.
10. Reale iPad-/Safari-Evidenz am 2026-09-06: Browser-Tab und Header konsistent `WD-21A.2`; Diagnose neutral `Referenzdiagnose bereit.`; keine sichtbaren alten WD-Kennungen.

## WD-21A.3 – Central Sketch Topology Mutation Contract

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER / NOT FROZEN AS WD-21A BLOCK

Ziel:

Alle bestehenden Sketch-Mutationen werden auf einen einzigen validierten, history-/recompute-sicheren Pfad konsolidiert, ohne neue sichtbare Sketch-Funktionalität einzuführen.

Umgesetzt:

1. Neuer zentraler Mutation-Owner `src/application/sketch-mutation.js`.
2. `runSketchMutation(...)` ist die gemeinsame atomare Grenze für Sketch-Mutationen.
3. Jede erfolgreiche Mutation läuft über die vorhandene Domain-Transaction-Grenze und erzeugt höchstens einen History-Eintrag.
4. Nach jeder Mutation wird `validateSketchTopology(...)` ausgeführt. Ungültige/dangling Topologie führt zum vollständigen Transaction-Rollback und erzeugt keinen History-Eintrag.
5. Autoritative Connectivity bleibt ausschließlich gemeinsame `pointId`; Koordinatengleichheit erzeugt keine Verbindung.
6. Vorhandene Store-Methoden für Punkt, Linie, Segment, Rechteck/Polygon, Punkt-/Linieneditierung und Sketch-Element-Löschen werden auf den zentralen Contract umgebogen, ohne ihre Benutzeroberflächen aufzubrechen.
7. Löschen einer Linie entfernt nur unbenutzte Endpunkte; gemeinsam weiterverwendete Punkte bleiben erhalten.
8. Löschen eines Punktes entfernt deterministisch die daran referenzierenden Linien und verhindert Dangling References.
9. `refreshDependentExtrudesFromSketch(...)` wird innerhalb derselben Mutation-Transaction ausgeführt; Geometry-/Dependency-Events folgen nach erfolgreichem Commit.
10. Undo/Redo bleibt Snapshot-basiert und stellt die ursprünglichen `pointId`-/`lineId`-Identitäten exakt wieder her; kein geometrisches Rebinding.
11. Sichtbare Build-Kennung ist zentral `WD-21A.3`.
12. Regressionstest `tests/wd-21a3-sketch-mutation-contract.mjs` plus Workflow `.github/workflows/wd-21a3-sketch-mutation.yml`.
13. Delete-Ereignisfolge korrigiert: erfolgreicher Delete-Commit → Sketch-Auswahl leeren → `selectionChanged`; kein UI-Zwischenzustand mit bereits gelöschter Auswahl.

Automatisierte A.3-Prüfungen:

- gemeinsamer Punkt bleibt gemeinsame topologische Autorität beim Verschieben;
- geometrisch gleicher neu erzeugter Punkt bleibt topologisch getrennt;
- Löschen einer Linie erhält gemeinsam genutzte Punkte;
- Undo/Redo-Snapshots stellen exakt dieselben logischen IDs wieder her;
- ungültige/dangling Mutation wird atomar zurückgerollt;
- No-op erzeugt keinen künstlichen History-Eintrag;
- A.2-Topologieregression läuft im A.3-Workflow mit;
- Build-ID im Runtime-Einstieg ist `WD-21A.3`.

Automatische Evidenz:

- Workflow: `WD-21A.3 Sketch Mutation Contract Regression`
- Run: `34061038460`
- Head: `6432e653fcede3f3f1f3ab0c796994c144909efd`
- Result: **SUCCESS / PASS**

Reale Geräte-Evidenz vom 2026-09-06, iPad/Safari:

- Browser-Tab zeigt `CyberMotion 3D – WD-21A.3`;
- sichtbares Header-/Build-Label zeigt `WD-21A.3`;
- vorhandene Sketch-/Extrude-Darstellung bleibt funktionsfähig;
- Aktualisierung/Mutation funktioniert;
- Speichern funktioniert;
- Laden funktioniert;
- Rückgängig funktioniert;
- Wiederherstellen/Redo funktioniert;
- Ergebnis: **PASS / 0 BLOCKER**.

## Explizit nicht Bestandteil von WD-21A.3

- keine Connect-/Disconnect-Bedienung;
- kein automatisches Verschmelzen geometrisch naher Punkte;
- kein neuer Snap-Mechanismus;
- kein Kreis;
- kein Bogen;
- keine Spline;
- keine Profile oder offenen Pfade;
- kein Profil-/Pfad-SelectionRef;
- keine neue Extrude-/3D-Funktion;
- keine Constraints;
- keine Schema-Erhöhung.

## WD-21A – verbleibende Foundation-Grenze

A.1 bis A.3 haben Inventar, gemeinsamen Element-/Topologievertrag und zentralen Mutationspfad abgedeckt. Bevor WD-21A abgeschlossen werden kann, muss noch geprüft werden, ob die Foundation an den Persistenz-/History-/Reference-Grenzen als Gesamtvertrag vollständig regressiert ist und ob alle Sketch-Schreibpfade tatsächlich den zentralen Mutation-Owner benutzen.

Ein eventuelles WD-21A.4 darf ausschließlich diese Foundation-Integration bzw. Contract-Coverage schließen. Es darf keine Connect-/Disconnect-Bedienung, keine neuen Sketch-Elementtypen und keine Profile/Pfade vorziehen; diese gehören zu WD-21B ff.

## Freigaberegel

WD-21A.3 ist nach erfolgreichem automatisierten Workflow und realem iPad-/Safari-Check **PASS / 0 BLOCKER**. WD-21A als Gesamtblock bleibt bis zu seinem eigenen Abschluss-/Regression-Gate ausdrücklich **nicht FROZEN**.

Ein Folgeblock wird nicht automatisch freigegeben. Vor WD-21A.4 ist zuerst der verbleibende Foundation-Umfang gegen A.1–A.3 und den RB-02-Vertrag zu bestimmen.
