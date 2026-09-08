# WD-21C – Sketch Element Type Expansion

**Branch:** `feature/wd-21c-sketch-element-type-expansion`  
**Basis:** WD-21B FROZEN @ `2e8d5b0434e62bf7c7e34b11e54da077853328cc`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-08

## WD-21C.1 – Existing Sketch Element Type & Creation/Editing Inventory

**Status:** PASS / INVENTORY & CONTRACT COMPLETE / 0 ELEMENT IMPLEMENTATION

## WD-21C.2 – Generic Sketch Element Registry & Persistence Foundation

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

Registry, Persistenz und Validation für `line`, `circle`, `arc`, `spline` sind vorhanden. Reale iPad-/Safari-Evidenz bestätigte `WD-21C.2`, Bestands-Sketching, Connect/Disconnect, Save/Load und Undo/Redo.

## WD-21C.3 – Generic Sketch Element Mutation Contract + Analytic Geometry ↔ Derived Tessellation Boundary

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

Zentrale, atomare und history-sichere Create/Edit/Delete-Grundlage für Circle, Arc und Spline über `runSketchMutation(...)`. Analytische Sketch-Identität bleibt von späterer Tessellierung getrennt. Reale iPad-/Safari-Evidenz bestätigte Build-ID und Bestandsregression.

## WD-21C.4 – Circle Creation, Rendering & Editing Integration

**Status:** IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE CHECK PENDING

Umgesetzt:

- sichtbarer Sketch-Kreis-Toolbutton `Kreis` im Sketch-Kontext;
- zweistufiger Circle-Input: Mittelpunkt setzen, Radius durch zweiten Punkt bestimmen;
- Create läuft ausschließlich über `addSketchCircle(...)` aus dem C.3-Mutationsvertrag;
- Circle bleibt persistent ausschließlich `{ circleId, center, radius }`;
- Mittelpunkt bleibt geometrischer Parameter und wird nicht als `pointId` materialisiert;
- Viewer rendert den analytischen Circle über ausschließlich abgeleitete temporäre Renderpunkte;
- interne Render-Tessellierung ist nicht persistent und nicht Teil von StableReference/SelectionRef;
- Circle ist im Viewer als ein `SKETCH_ELEMENT` mit `subTargetId=circle` pick-/selektierbar;
- Objektbaum zeigt eine eigene Sektion `Kreise (N)` und einzelne `Kreis N`-Elemente;
- Inspector zeigt und editiert Mittelpunkt X/Y und Radius über `setSketchCircle(...)`;
- Delete nutzt den bestehenden generischen C.3-Delete-Pfad;
- Undo/Redo und Save/Load bewahren dieselbe `circleId` und analytische Geometrie;
- Build-ID ist zentral `WD-21C.4`.

Analytic Geometry ↔ Derived Tessellation Boundary bleibt eingehalten:

- die 64 Rendersegmente sind reine Laufzeitdarstellung;
- keine Segmentpunkte und keine Rendersegmentzahl werden in `circles` persistiert;
- keine Linien werden aus dem Circle in die Sketch-Topologie geschrieben;
- keine Circle-ID wird durch Rendering, Picking oder Inspector-Edit ersetzt.

Automatische Regression:

- Workflow: `WD-21C.4 Circle Integration Regression`
- Run: `34266145061`
- Head: `efef9ecbdc8f53d28ea42a3386527623bea8ce51`
- WD-21A.2: PASS
- WD-21A.3: PASS
- WD-21B.2 Connect: PASS
- WD-21B.3 Disconnect: PASS
- WD-21C.2 Registry/Persistence: PASS
- WD-21C.3 Generic Mutation: PASS
- WD-21C.4 Circle Integration: PASS
- Result: **SUCCESS / PASS**

Die ersten C.4-Läufe deckten ausschließlich zu enge ältere Testgrenzen auf: C.2/C.3 hatten sichtbare spätere Circle-Integration noch pauschal verboten. Diese Assertions wurden vorwärtskompatibel gemacht, ohne die eingefrorenen C.2-/C.3-Fachverträge zu verändern.

Explizit nicht Bestandteil von WD-21C.4:

- keine sichtbare Arc-/Spline-Erstellung;
- keine Arc-/Spline-Viewer-/Inspector-Integration;
- kein N-Gon / Regular Polygon;
- kein facettierter Circle/Arc als Benutzerfunktion;
- keine frei einstellbare Segmentzahl;
- keine Profile/Pfade;
- keine Circle-Extrusion;
- keine Constraints/Snapping-Erweiterung.

## Freigabestatus

WD-21C.1, C.2 und C.3 sind abgeschlossen. WD-21C.4 ist **AUTOMATED PASS**, benötigt noch die reale iPad-/Safari-Evidenz. WD-21C als Gesamtblock bleibt **nicht FROZEN**.

## Nächster zulässiger Schritt

Ausschließlich Gerätecheck für `WD-21C.4`: Browser-Tab und Header müssen konsistent `WD-21C.4` zeigen. Circle im Sketch-Kontext erzeugen, im Viewer und Objektbaum auswählen, Mittelpunkt/Radius im Inspector ändern, Delete/Undo/Redo sowie Speichern/Laden prüfen. Zusätzlich Bestands-Sketching und Connect/Disconnect kurz regressieren. Kein weiterer C-Schritt vor PASS / 0 BLOCKER.
