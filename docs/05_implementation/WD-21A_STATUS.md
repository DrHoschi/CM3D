# WD-21A – Sketch Topology Contract & Element Foundation

**Branch:** `feature/wd-21a-sketch-topology-contract-element-foundation`  
**Basis:** `main` @ `1edae185c6207db9d754c94d00d23cf10218c56c`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-07

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

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

Umgesetzt:

1. Zentraler Contract-Layer `src/model/sketch-topology.js`.
2. `SketchElementKind` registriert den bestehenden Elementtyp `line`, ohne die persistente `points`/`lines`-Struktur zu brechen.
3. Generische Auflösung über `getSketchElement(...)`; Punktauflösung über `getSketchPoint(...)`.
4. Autoritative Topologie-Invariante: Zwei Endpunkte sind nur dann topologisch verbunden, wenn sie dieselbe `pointId` referenzieren. Geometrisch identische Koordinaten erzeugen keine Verbindung.
5. `validateProject(...)` delegiert Sketch-Invarianten an `validateSketchTopology(...)`.
6. SelectionRef und StableReference lösen `SKETCH_ELEMENT` über den gemeinsamen Elementvertrag auf.
7. Alte Elementreferenzen ohne `subTargetId` bleiben für bestehende Linien kompatibel.
8. Sichtbare Build-Kennung wurde zentralisiert und auf iPad/Safari bestätigt.

## WD-21A.3 – Central Sketch Topology Mutation Contract

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

Umgesetzt:

1. Zentraler Mutation-Owner `src/application/sketch-mutation.js`.
2. `runSketchMutation(...)` ist die gemeinsame atomare Grenze für Sketch-Mutationen.
3. Jede erfolgreiche Mutation läuft über die Domain-Transaction-Grenze und erzeugt höchstens einen History-Eintrag.
4. Nach jeder Mutation wird `validateSketchTopology(...)` ausgeführt; ungültige/dangling Topologie rollt vollständig zurück.
5. Connectivity bleibt ausschließlich über gemeinsame `pointId` definiert.
6. Punkt-/Linienerzeugung, Segment, Rechteck/Polygon, Editierung und Löschen laufen über den zentralen Vertrag.
7. Löschen einer Linie entfernt nur nicht mehr verwendete Punkte; gemeinsam verwendete Punkte bleiben erhalten.
8. Löschen eines Punktes entfernt deterministisch abhängige Linien.
9. Abhängiger Extrude-Recompute läuft innerhalb derselben kontrollierten Mutation.
10. Undo/Redo stellt `pointId`/`lineId` exakt wieder her; kein geometrisches Rebinding.
11. Delete-Ereignisfolge: Commit → Auswahl leeren → `selectionChanged`.

Automatische Evidenz:

- Workflow: `WD-21A.3 Sketch Mutation Contract Regression`
- Run: `34061038460`
- Head: `6432e653fcede3f3f1f3ab0c796994c144909efd`
- Result: **SUCCESS / PASS**

Reale iPad-/Safari-Evidenz vom 2026-09-06:

- Browser-Tab und Header konsistent `WD-21A.3`;
- Aktualisierung/Mutation, Speichern, Laden, Rückgängig und Wiederherstellen erfolgreich;
- Ergebnis: **PASS / 0 BLOCKER**.

## WD-21A.4 – Foundation Integration & Contract Coverage Gate

**Status:** AUTOMATED PASS / DEVICE CHECK PENDING / WD-21A NOT YET FROZEN

Ziel:

A.1–A.3 als gemeinsamen Foundation-Vertrag regressieren, ohne neue Benutzerfunktion einzuführen.

Geprüft und abgesichert:

1. Runtime-aktive Sketch-Schreibmethoden besitzen einen explizit prüfbaren zentralen Mutation-Owner.
2. `auditSketchMutationOwnership(...)` prüft `runSketchMutation`, Punkt-/Linienerzeugung, Segment, geschlossene Formen, Rechteck/Polygon, Punkt-/Linieneditierung und Löschen.
3. Der Bootstrap installiert `installSketchEditing(...)` zuerst und danach `installSketchMutationContract(...)`; damit überschreibt der zentrale A.3-Owner die historischen UI-/Store-Mutationsimplementierungen vor Benutzerinteraktion und bleibt runtime-autoritativ.
4. Historische direkte Implementierungen in `AppStore` / `sketch-editing.js` sind keine runtime-autoritativen Schreibpfade; das A.4-Gate prüft die tatsächlich aktiven Methoden explizit auf Owner-Konsistenz.
5. A.2-Topologie-Regression und A.3-Mutations-Regression laufen gemeinsam im A.4-Gate.
6. 0.2.0 Save/Load-Roundtrip erhält Sketch-Topologie und exakte `pointId`/`lineId`.
7. 0.1.0 → 0.2.0 Migration erhält Sketch-Topologie und exakte IDs.
8. StableReference und SelectionRef bleiben nach zulässiger Editierung aufgelöst.
9. Nach echter Löschung wird die Referenz deterministisch `MISSING`; kein geometrisches Rebinding.
10. Undo-Snapshot stellt dieselbe logische ID wieder her; Redo entfernt sie wieder deterministisch.
11. Build-ID ist zentral auf `WD-21A.4` gesetzt.
12. Keine Connect-/Disconnect-Bedienung, kein Snap/Merge, keine neuen Sketch-Elementtypen, keine Profile/Pfade und keine neue 3D-Funktion wurden eingeführt.

Automatische Evidenz:

- Workflow: `WD-21A.4 Foundation Integration & Contract Coverage Gate`
- Run: `34100766621`
- Head: `9fa28338918b60ddd8561aba87bd0c6ebc2d99c3`
- Result: **SUCCESS / PASS**
- A.2 Regression: PASS
- A.3 Regression: PASS
- A.4 Integration/Ownership/Persistenz/Reference Gate: PASS

## Explizit nicht Bestandteil von WD-21A.4

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

## Freigaberegel / verbleibender Abschluss

Technisch ist WD-21A.4 automatisiert **PASS**. WD-21A als Gesamtblock wird erst nach realem iPad-/Safari-Abgleich des A.4-Builds eingefroren.

Für den Geräte-Abschluss müssen Browser-Titel und sichtbares Build-Label konsistent `WD-21A.4` zeigen und die bereits bestätigten Grundfunktionen weiterhin funktionieren: Sketch-Anzeige/-Bearbeitung, Speichern, Laden, Undo und Redo. Jede widersprüchliche sichtbare Kennung oder Geräte-Regression ist ein BLOCKER.

Erst bei **PASS / 0 BLOCKER** dieses letzten Gerätechecks darf WD-21A auf **FROZEN** gesetzt werden. Danach – und nicht vorher – ist WD-21B – Sketch Connectivity & Editing Integration zulässig.
