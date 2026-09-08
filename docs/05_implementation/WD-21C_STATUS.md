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

**Status:** PASS / FROZEN / 0 BLOCKER

Finaler sichtbarer Korrekturstand: `WD-21C.4-R1`.

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
- Build-ID, Browser-Tab und sichtbares Header-/Brand-Label verwenden denselben Korrekturstand `WD-21C.4-R1`.

Analytic Geometry ↔ Derived Tessellation Boundary bleibt eingehalten:

- die 64 Rendersegmente sind reine Laufzeitdarstellung;
- keine Segmentpunkte und keine Rendersegmentzahl werden in `circles` persistiert;
- keine Linien werden aus dem Circle in die Sketch-Topologie geschrieben;
- keine Circle-ID wird durch Rendering, Picking oder Inspector-Edit ersetzt.

Automatische Completion-/Regression-Evidenz:

- Workflow: `WD-21C.4 Circle Integration Regression`
- Run: `34273576840`
- Head: `a2ad3035a877170983a51f5d70294ff566a0c511`
- WD-21A.2: PASS
- WD-21A.3: PASS
- WD-21B.2 Connect: PASS
- WD-21B.3 Disconnect: PASS
- WD-21C.2 Registry/Persistence: PASS
- WD-21C.3 Generic Mutation: PASS
- WD-21C.4 Circle Integration: PASS
- Result: **SUCCESS / PASS**

Die sichtbare Revisionskennung `-R1` ist ab jetzt ein zulässiger Korrektur-Suffix innerhalb desselben WD-Schritts. Die Build-Gates akzeptieren deshalb `WD-21x.y-Rn`, ohne den fachlichen WD-Schritt hochzuzählen.

Reale Geräte-Evidenz 2026-09-08, iPad/Safari, `WD-21C.4-R1`:

- Browser-Tab zeigt `CyberMotion 3D – WD-21C.4-R1`: PASS;
- sichtbares Header-/Brand-Label zeigt `WD-21C.4-R1`: PASS;
- Circle-Erzeugung und sichtbare Darstellung: PASS;
- Auswahl `Kreis 1` im Objektbaum: PASS;
- Auswahl des Circle direkt im Viewer: PASS;
- Circle-Inspector erscheint: PASS;
- Mittelpunkt X/Y editierbar: PASS;
- Radius editierbar: PASS;
- gemeldete C.4-Blocker nach R1: 0.

Nachfolgender Integrationsbedarf, ausdrücklich **kein C.4-Blocker**:

Bei bestehenden Line-/Point-Skizzenelementen ist eine direkte Manipulation über die vorhandene Sketch-/Gizmo-Interaktion möglich. Der analytische Circle besitzt in C.4 bereits dieselbe fachliche Editierbarkeit über Mittelpunkt X/Y und Radius, ist aber noch nicht an eine direkte Circle-Drag-/Transform-Gizmo-Manipulation auf der Skizze angeschlossen. Dieser Punkt ist separat zu behandeln und darf C.4 nicht nachträglich um zusätzliche Transform-Semantik erweitern.

Explizit nicht Bestandteil von WD-21C.4:

- keine sichtbare Arc-/Spline-Erstellung;
- keine Arc-/Spline-Viewer-/Inspector-Integration;
- kein N-Gon / Regular Polygon;
- kein facettierter Circle/Arc als Benutzerfunktion;
- keine frei einstellbare Segmentzahl;
- keine Profile/Pfade;
- keine Circle-Extrusion;
- keine Constraints/Snapping-Erweiterung;
- keine neue direkte Circle-Transform-/Gizmo-Interaktion.

## Freigabestatus

WD-21C.1, C.2, C.3 und C.4 sind abgeschlossen. WD-21C.4 ist **PASS / FROZEN / 0 BLOCKER**. WD-21C als Gesamtblock bleibt **nicht FROZEN**, da Arc-/Spline-Integration und weitere WD-21C-Teilschritte noch offen sind.

## Nächster zulässiger Schritt

Ausschließlich den nächsten kleinen WD-21C-Teilblock fachlich definieren und separat freigeben. Noch keine Arc-/Spline-Implementierung und keine Circle-Transform-Erweiterung im selben Schritt.
