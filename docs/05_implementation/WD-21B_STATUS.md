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
- Disconnect: gemeinsamer Punkt bleibt bestehen; für eine explizit ausgewählte angeschlossene Linie wird ein neuer Punkt mit neuer `pointId` erzeugt.

## WD-21B.2 – Deterministic Endpoint Connect Mutation Contract

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

Umgesetzt:

1. Interner zentraler Mutationseinstieg `connectSketchPoints(sketchId, survivorPointId, sourcePointId)`.
2. Survivor und Source müssen unterschiedliche existierende `pointId`s derselben Skizze sein.
3. Survivor behält Identität und Koordinaten unverändert.
4. Alle Source-Linien werden auf Survivor umgehängt; Source wird anschließend entfernt.
5. Direkte Survivor↔Source-Linie wird abgewiesen, damit keine Start=End-Topologie entsteht.
6. StableReference auf Survivor bleibt `RESOLVED`, Source wird `MISSING`; kein Rebinding.
7. Undo/Redo stellt exakte IDs und Inzidenzen wieder her.
8. Keine sichtbare Connect-Aktion.

Automatische Regression:

- Workflow: `WD-21B.2 Endpoint Connect Contract Regression`
- Run: `34138362614`
- Head: `fbbab7b48fb8efc65dd0e20e150dececfd922627`
- Result: **SUCCESS / PASS**

Reale iPad-/Safari-Evidenz vom 2026-09-07:

- Browser-Tab und Header konsistent `WD-21B.2`;
- bestehende Sketch-Funktionen erhalten;
- Speichern, Laden, Rückgängig und Wiederherstellen erfolgreich;
- Ergebnis: **PASS / 0 BLOCKER**.

## WD-21B.3 – Deterministic Endpoint Disconnect Mutation Contract

**Status:** IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE BUILD-ID CHECK PENDING

Umgesetzt:

1. Neuer interner zentraler Mutationseinstieg `disconnectSketchLineFromPoint(sketchId, pointId, lineId)`.
2. Punkt und Linie müssen existieren und die Linie muss den angegebenen Punkt tatsächlich als Start- oder Endpunkt referenzieren.
3. Disconnect ist nur zulässig, wenn der Punkt von mindestens zwei Linien verwendet wird.
4. Der ursprüngliche gemeinsame Punkt behält `pointId`, Koordinate und alle übrigen Inzidenzen.
5. Für die explizit ausgewählte Linie wird ein neuer Punkt über `createSketchPoint(...)` erzeugt; dieser erhält eine neue `pointId`.
6. Der neue Punkt übernimmt exakt die Koordinate des ursprünglichen gemeinsamen Punkts. Die sichtbare Geometrie springt daher beim Disconnect nicht.
7. Nur die ausgewählte Linie wird auf die neue Punkt-ID umgehängt; ihre `lineId` bleibt unverändert.
8. Fehlende, nicht inzidente oder nur einfach verwendete Punkte werden als No-op/Reject abgewiesen und erzeugen keinen History-Eintrag.
9. Die Mutation läuft vollständig über `runSketchMutation(...)` und damit über Validation, Domain Transaction, History, Recompute und Events.
10. StableReference auf den ursprünglichen Punkt bleibt `RESOLVED`; StableReference auf die Linie bleibt `RESOLVED`.
11. Undo entfernt den neu erzeugten Punkt wieder und stellt die ursprüngliche gemeinsame `pointId`-Inzidenz exakt her; Redo reproduziert dieselbe erzeugte Punkt-ID aus dem Snapshot.
12. Der zentrale Mutation-Owner audit umfasst jetzt auch `disconnectSketchLineFromPoint`.
13. `connectivityExtension` ist auf `WD-21B.3` fortgeschrieben; der eingefrorene Foundation-Vertrag `version: 'WD-21A.3'` bleibt unverändert.
14. Sichtbare Build-ID ist zentral `WD-21B.3`.
15. Es wurde keine sichtbare Disconnect-Aktion verdrahtet.

Automatische Regression:

- Workflow: `WD-21B.3 Endpoint Disconnect Contract Regression`
- Run: `34149057090`
- Head: `3b09bc8f47f3a7849a14672e0f8e4664f9e3c613`
- A.2 Topology Regression: PASS
- A.3 Mutation Regression: PASS
- B.2 Connect Regression: PASS
- B.3 Disconnect Regression: PASS
- Result: **SUCCESS / PASS**

Explizit nicht Bestandteil von WD-21B.3:

- kein Disconnect-Button;
- kein Connect-Button;
- keine UI-Verknüpfung der Mehrfachauswahl mit Connect/Disconnect;
- kein automatisches Snap/Merge;
- keine Toleranzsuche;
- keine Kreis-/Bogen-/Spline-Elementtypen;
- keine Profile/Pfade;
- keine neue 3D-Funktion.

## Freigabestatus

WD-21B.2 ist **PASS / DEVICE VERIFIED / 0 BLOCKER**. WD-21B.3 ist technisch **AUTOMATED PASS**, benötigt aber noch den realen iPad-/Safari-Build-ID-/Regressionscheck. WD-21B als Gesamtblock bleibt ausdrücklich **nicht FROZEN**.

Der nächste zulässige Schritt ist ausschließlich der Gerätecheck für `WD-21B.3`: Browser-Tab und sichtbares Build-Label müssen konsistent `WD-21B.3` zeigen und die bestehenden Sketch-Grundfunktionen einschließlich Speichern, Laden, Undo und Redo dürfen nicht regressiert sein. Erst danach darf B.3 auf PASS gesetzt werden. Kein weiterer B-Schritt wird automatisch begonnen.
