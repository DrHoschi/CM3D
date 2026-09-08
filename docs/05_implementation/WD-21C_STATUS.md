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

Circle-Erzeugung, Rendering, Viewer-/Baumauswahl sowie Inspector-Edit von Mittelpunkt und Radius sind freigegeben. Die analytische Identität bleibt `{ circleId, center, radius }`; Render-Tessellierung bleibt ausschließlich abgeleitet. Completion-Regression: Workflow `WD-21C.4 Circle Integration Regression`, Run `34273576840`, Head `a2ad3035a877170983a51f5d70294ff566a0c511`, SUCCESS. Reale iPad-/Safari-Evidenz: PASS / 0 BLOCKER.

## WD-21C.5 – Generic Sketch Element Manipulation Contract

**Status:** IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE CHECK PENDING

Verbindlicher Contract: `Selection → Elementparameter → zentrale Mutation → History/Recompute → Viewer-Refresh`.

Implementierter Minimalumfang:

- `src/ui/sketch-gizmo.js` besitzt jetzt einen typbezogenen Manipulationsadapter für `point`, `line` und `circle`;
- bestehende Point-/Line-Gizmo-Semantik bleibt erhalten;
- Circle erhält einen direkten Gizmo-Anker ausschließlich aus `circle.center`;
- reiner Circle-Move verändert ausschließlich `center.x/y`; `circleId` und `radius` bleiben unverändert;
- gemischte Circle+andere-Element-Multiselection bleibt ausdrücklich nicht enthalten;
- Pointer-Move erzeugt nur temporäre Preview auf den autoritativen Parametern;
- vor dem finalen Commit wird die Preview auf den Ausgangszustand zurückgesetzt;
- Pointer-up führt genau einen Commit über `runSketchMutation(...)` aus und erzeugt damit genau einen History-Schritt;
- Pointer-Cancel stellt den Ausgangszustand wieder her und erzeugt keinen Commit;
- Translate-Snap bleibt im lokalen Koordinatenraum der Owner-Skizze aktiv;
- keine neue Connect-/Merge-/Tolerance-/Rebinding-Semantik;
- die historische lokale Build-Zuweisung `WD-12B` aus `sketch-gizmo.js` wurde entfernt;
- `src/main.js` ist die einzige sichtbare Build-Autorität und verwendet `WD-21C.5`.

Explizit nicht implementiert:

- kein Circle-Radius-Gizmo;
- kein Rotate/Scale für Sketch-Elemente;
- keine gemischte Circle+Line-/Point-Multiselection;
- keine sichtbare Arc-/Spline-Funktion;
- kein N-Gon;
- keine Profile/Pfade;
- keine Extrusionsintegration.

Automatische Regression:

- Workflow: `WD-21C.5 Generic Sketch Manipulation Regression`
- Run: `34277682889`
- Head: `929143091ff6698fb0248a8f9eb02da367ee2326`
- WD-21A.2: PASS
- WD-21A.3: PASS
- WD-21B.2 Connect: PASS
- WD-21B.3 Disconnect: PASS
- WD-21C.2 Registry/Persistence: PASS
- WD-21C.3 Generic Mutation: PASS
- WD-21C.4 Circle Integration: PASS
- WD-21C.5 Manipulation Contract: PASS
- Result: **SUCCESS / PASS**

## Freigabestatus

WD-21C.1, C.2, C.3 und C.4 sind abgeschlossen. WD-21C.4 bleibt **PASS / FROZEN / 0 BLOCKER**. WD-21C.5 ist **IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE CHECK PENDING** und noch nicht FROZEN. WD-21C als Gesamtblock bleibt **nicht FROZEN**.

## Nächster zulässiger Schritt

Ausschließlich der reale iPad-/Safari-Gerätecheck für `WD-21C.5`: Browser-Tab und Header müssen konsistent `WD-21C.5` zeigen; Point und Line müssen sich weiterhin wie zuvor per Gizmo verschieben lassen; ein ausgewählter Circle muss jetzt direkt per Gizmo auf der Skizze verschiebbar sein; dabei muss der Radius unverändert bleiben. Anschließend Undo/Redo sowie kurzer Save/Load- und Connect/Disconnect-Bestandscheck. Noch keine Arc-/Spline-Funktion.
