# WD-21C – Sketch Element Type Expansion

**Branch:** `feature/wd-21c-sketch-element-type-expansion`  
**Basis:** WD-21B FROZEN @ `2e8d5b0434e62bf7c7e34b11e54da077853328cc`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-07

## WD-21C.1 – Existing Sketch Element Type & Creation/Editing Inventory

**Status:** PASS / INVENTORY & CONTRACT COMPLETE / 0 ELEMENT IMPLEMENTATION

C.1 hat den bestehenden LINE-Vertrag und die erforderlichen Erweiterungsstellen für Circle, Arc und Spline festgelegt. SelectionRef/StableReference bleiben bei `SKETCH_ELEMENT + subTargetId=<kind>`. Profile/Pfade bleiben bis WD-21D unangetastet.

## WD-21C.2 – Generic Sketch Element Registry & Persistence Foundation

**Status:** IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE BUILD-ID CHECK PENDING

Umgesetzt:

1. `SketchElementKind` kennt jetzt `line`, `circle`, `arc`, `spline`.
2. `SketchElementRegistry` ordnet jedem Elementtyp persistente Collection, ID-Feld und Endpoint-Eigenschaft zu.
3. Neue Sketches initialisieren `circles`, `arcs` und `splines` als leere persistente Maps neben `points` und `lines`.
4. Bestehende 0.2.0- und migrierte 0.1.0-Projekte ohne diese Maps werden beim Laden deterministisch mit leeren Collections normalisiert; `schemaVersion` bleibt 0.2.0.
5. `getSketchElement(...)` löst alle vier Elementtypen generisch auf.
6. `getSketchElementPointIds(...)` liefert für Line/Arc/Spline die topologischen Start-/Endpunkte; Circle liefert bewusst keine Endpoint-IDs.
7. Validation prüft stabile Map-Key↔Element-ID-Konsistenz für `lineId`, `circleId`, `arcId`, `splineId`.
8. Circle-Validation: endlicher Mittelpunkt und Radius > 0.
9. Arc-Validation: existierende verschiedene Start-/Endpunkt-IDs, endlicher Controlpunkt, nicht kollinear.
10. Spline-Validation: existierende verschiedene Start-/Endpunkt-IDs, mindestens ein Interior-Control, stabile eindeutige `controlId`, endliche Koordinaten.
11. Direkte ältere In-Memory-Sketches nur mit `points`/`lines` bleiben für eingefrorene A/B-Verträge validierbar; neue Collections gelten dort als leer. Persistierte/neue Projekte werden dagegen vollständig normalisiert.
12. Sichtbare Build-ID ist zentral `WD-21C.2`.

Automatische Regression:

- Workflow: `WD-21C.2 Generic Sketch Element Registry Regression`
- Run: `34163981238`
- Head: `76a38bfe2929e5651d531e881233cccb904ba293`
- WD-21A.2 Topology Regression: PASS
- WD-21A.3 Mutation Regression: PASS
- WD-21B.2 Connect Regression: PASS
- WD-21B.3 Disconnect Regression: PASS
- WD-21C.2 Registry/Persistence Regression: PASS
- Result: **SUCCESS / PASS**

Die ersten beiden Läufe dienten ausschließlich der Aufdeckung zweier Kompatibilitätsannahmen: alte direkte A.2-Sketches ohne neue Maps und eingefrorene B.2/B.3-Build-ID-Assertions. Beides wurde ohne Änderung der eingefrorenen A/B-Fachlogik korrigiert.

Explizit nicht Bestandteil von WD-21C.2:

- keine Create/Edit/Delete-Mutationen für Circle/Arc/Spline;
- keine neuen Sketch-Buttons oder Input-Modi;
- kein Viewer-Rendering/Picking der neuen Typen;
- kein Tree-/Inspector-Support;
- keine Profil-/Pfadableitung;
- keine Änderung der WD-21B-Connectivity-Semantik.

## Freigabestatus

WD-21C.1 ist abgeschlossen. WD-21C.2 ist **AUTOMATED PASS**, benötigt aber noch den realen iPad-/Safari-Build-ID-/Bestandsregressionscheck. WD-21C als Gesamtblock bleibt **nicht FROZEN**.

Der nächste zulässige Schritt ist ausschließlich der Gerätecheck für `WD-21C.2`: Browser-Tab und Header müssen konsistent `WD-21C.2` zeigen; bestehende Sketch-Funktionen, Connect/Disconnect, Speichern/Laden und Undo/Redo dürfen nicht regressiert sein. Neue Circle/Arc/Spline-Funktion ist auf dem Gerät noch nicht zu erwarten.
