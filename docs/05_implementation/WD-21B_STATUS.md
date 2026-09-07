# WD-21B – Sketch Connectivity & Editing Integration

**Branch:** `feature/wd-21b-sketch-connectivity-editing-integration`  
**Basis:** WD-21A FROZEN @ `4014cf865049c66c20d756db608201fa599d0948`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-07

## WD-21B.1 – Existing Endpoint Selection & Connectivity Editing Inventory

**Status:** PASS / INVENTORY & CONTRACT COMPLETE / 0 IMPLEMENTATION

Festgelegt:

- Punkte sind über Tree, Viewer und Inspector einzeln auswählbar.
- Mehrfachauswahl kann mehrere Punkte derselben Skizze halten; die letzte Auswahl ist Primary Selection.
- SelectionRef bildet Punkte als `SKETCH_POINT` mit `ownerId=sketchId` und `targetId=pointId` ab.
- Connect/Disconnect müssen über den eingefrorenen zentralen `runSketchMutation(...)`-Pfad laufen.
- Connect: Primary/Survivor bleibt, Merge-Source wird umgehängt und entfernt; kein geometrisches Rebinding.
- Disconnect wird erst in einem späteren Teilblock implementiert.

## WD-21B.2 – Deterministic Endpoint Connect Mutation Contract

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

Umgesetzt:

1. Neuer interner zentraler Mutationseinstieg `connectSketchPoints(sketchId, survivorPointId, sourcePointId)` in `src/application/sketch-mutation.js`.
2. Survivor und Source müssen unterschiedliche existierende `pointId`s derselben Skizze sein.
3. Der Survivor behält Identität und Koordinaten unverändert.
4. Alle Linienreferenzen auf die Source-ID werden deterministisch auf die Survivor-ID umgehängt.
5. Danach wird ausschließlich die Source-Punktinstanz entfernt.
6. Der Rückgabevertrag enthält `survivorPointId`, `sourcePointId` und `rewiredLineIds`.
7. Eine direkte Linie Survivor↔Source führt beim Merge zu einer ungültigen Start=End-Topologie und wird deshalb vor Mutation vollständig abgewiesen.
8. Fehlende Punkte oder identische IDs sind No-op/Reject und erzeugen keinen History-Eintrag.
9. Die Mutation läuft vollständig über `runSketchMutation(...)` und damit über Validation, Domain Transaction, History, Recompute und Events.
10. StableReference auf Survivor bleibt `RESOLVED`; StableReference auf entfernte Source wird `MISSING`; kein Rebinding auf Survivor.
11. SelectionRef auf die entfernte Source löst nach Connect nicht mehr auf.
12. Undo stellt Source-ID, Koordinate und ursprüngliche Linieninzidenz exakt wieder her; Redo reproduziert den Connect-Zustand.
13. Der eingefrorene A.3-Mutation-Contract bleibt als Foundation-Version erhalten; B.2 ist als `connectivityExtension: 'WD-21B.2'` ausgewiesen.
14. Es wurde keine sichtbare Connect-Aktion verdrahtet.
15. Sichtbare Build-ID ist zentral `WD-21B.2`.

Automatische Regression:

- Workflow: `WD-21B.2 Endpoint Connect Contract Regression`
- Run: `34138362614`
- Head: `fbbab7b48fb8efc65dd0e20e150dececfd922627`
- A.2 Topology Regression: PASS
- A.3 Mutation Regression: PASS
- B.2 Endpoint Connect Regression: PASS
- Result: **SUCCESS / PASS**

Reale iPad-/Safari-Evidenz vom 2026-09-07:

- Browser-Tab zeigt `CyberMotion 3D – WD-21B.2`;
- sichtbares Header-/Build-Label zeigt `WD-21B.2`;
- bestehende Sketch-Funktionen sind erhalten;
- Speichern funktioniert;
- Laden funktioniert;
- Rückgängig funktioniert;
- Wiederherstellen/Redo funktioniert;
- Ergebnis: **PASS / 0 BLOCKER**.

Explizit nicht Bestandteil von WD-21B.2:

- kein Connect-Button;
- kein Disconnect;
- kein automatisches Snap/Merge;
- keine Toleranzsuche;
- keine Kreis-/Bogen-/Spline-Elementtypen;
- keine Profile/Pfade;
- keine neue 3D-Funktion.

## Freigabestatus

WD-21B.2 ist **PASS / DEVICE VERIFIED / 0 BLOCKER**. WD-21B als Gesamtblock bleibt ausdrücklich **nicht FROZEN**.

Der nächste fachlich zulässige Teilblock darf erst separat autorisiert werden. WD-21B.3 wird nicht automatisch begonnen.
