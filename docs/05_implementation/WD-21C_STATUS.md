# WD-21C – Sketch Element Type Expansion

**Branch:** `feature/wd-21c-sketch-element-type-expansion`  
**Basis:** WD-21B FROZEN @ `2e8d5b0434e62bf7c7e34b11e54da077853328cc`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-09

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

Circle-Erzeugung, Rendering, Viewer-/Baumauswahl sowie Inspector-Edit von Mittelpunkt und Radius sind freigegeben. Completion-Regression: Workflow `WD-21C.4 Circle Integration Regression`, Run `34273576840`, Head `a2ad3035a877170983a51f5d70294ff566a0c511`, SUCCESS. Reale iPad-/Safari-Evidenz: PASS / 0 BLOCKER.

## WD-21C.5 – Generic Sketch Element Manipulation Contract

**Status:** PASS / FROZEN / 0 BLOCKER

Direkter Circle-Move über den generischen Sketch-Gizmo ist freigegeben; `circleId` und `radius` bleiben unverändert. Point-/Line-Verhalten, Save und Undo/Redo wurden auf iPad/Safari regressiert. Workflow `WD-21C.5 Generic Sketch Manipulation Regression`, Run `34277682889`, getesteter Code-Head `929143091ff6698fb0248a8f9eb02da367ee2326`: SUCCESS.

## WD-21C.6 – Generic Endpoint Element Connectivity Contract

**Status:** IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE CHECK PENDING

### Verbindliche Grenze

C.6 generalisiert ausschließlich die vorhandene B.2/B.3-Connectivity von line-spezifischer Verarbeitung auf alle registrierten Sketch-Elemente mit `topologyEndpoints: true`. Aktuell sind dies `line`, `arc` und `spline`; `circle` bleibt ausgeschlossen. `pointId` bleibt die einzige Topologie-Autorität. Gleiche Koordinaten erzeugen keine Verbindung.

### Implementierter Minimalumfang

- neue zentrale Erweiterung `src/application/sketch-endpoint-connectivity-extension.js`;
- Endpoint-Erkennung ausschließlich über `SketchElementRegistry` + `topologyEndpoints: true`;
- `connectSketchPoints(...)` rewired `startPointId`/`endPointId` generisch für Line/Arc/Spline;
- Direct-Pair-/Self-Loop-Guard wird über alle endpoint-basierten Elemente geprüft;
- Rückgabe enthält generische `rewiredElements`; `rewiredLineIds` bleibt für bestehende Line-Verbraucher kompatibel;
- neue zentrale Operation `disconnectSketchElementFromPoint(sketchId, pointId, kind, elementId)` trennt exakt einen Endpoint eines endpoint-basierten Elements;
- Minimum-Incidence wird über alle endpoint-basierten Elemente bestimmt;
- der abgetrennte Endpoint erhält einen neuen stabilen Punkt mit exakt den Koordinaten des gemeinsamen Ausgangspunkts;
- `disconnectSketchLineFromPoint(...)` bleibt als rückwärtskompatibler Line-Adapter bestehen;
- `src/application/sketch-connectivity-commands.js` verwendet für Disconnect nun `elementKind + elementId` und generische Inzidenz/Direct-Pair-Erkennung;
- nach Disconnect bleibt das konkrete Element mit seinem ursprünglichen `kind` zusammen mit dem neuen Punkt selektiert;
- sichtbare Aktionen `Verbinden` / `Trennen` bleiben bestehen; ausschließlich der Trennen-Hinweis wurde von „Linie“ auf „Element-Endpunkt“ neutralisiert;
- `src/main.js` installiert den C.6-Vertrag nach den bestehenden zentralen Sketch-Mutationsverträgen und bleibt einzige sichtbare Build-Autorität;
- sichtbare Build-ID ist `WD-21C.6`.

### Unveränderte Ausschlüsse

- `circle.center`, `arc.control` und `spline.controls[*]` sind keine Topologiepunkte und werden von C.6 nicht verändert;
- keine geometrische Rebinding-, Auto-Snap-, Merge- oder Tolerance-Semantik;
- keine sichtbare Arc-/Spline-Erstellung;
- kein Arc-/Spline-Rendering, Inspector, Gizmo oder neue Selection-UI;
- keine Circle-Connectivity;
- keine Constraints;
- kein N-Gon;
- keine Profile/Pfade;
- keine Extrusionsintegration.

### Automatisierte Regression

Workflow: `WD-21C.6 Generic Endpoint Connectivity Regression`  
Run: `34334339592`  
Getesteter Code-Head: `e91526716bcd6431a4e793fcce2ba4e1dc4fbefd`  
Result: **SUCCESS / PASS**

Bestätigt:

- WD-21A.2 Topology: PASS;
- WD-21A.3 Mutation: PASS;
- WD-21B.2 Connect: PASS;
- WD-21B.3 Disconnect: PASS;
- WD-21C.2 Registry/Persistence: PASS;
- WD-21C.3 Generic Mutation: PASS;
- WD-21C.4 Circle Integration: PASS;
- WD-21C.5 Manipulation: PASS;
- WD-21C.6 Generic Endpoint Connectivity: PASS.

Die C.6-Regressionsfälle prüfen zusätzlich synthetisch Line/Arc/Spline-Rewire, Arc-/Spline-Disconnect, Circle-Ausschluss, generischen Direct-Pair-Guard, unveränderte Arc-/Spline-Control-Daten und die bestehende Line-Kompatibilität.

Der erste C.6-Lauf `34334248395` scheiterte ausschließlich an einer veralteten C.5-Build-ID-Testgrenze, die nur `WD-21C.5` akzeptierte. Diese Testgrenze wurde ohne Änderung der C.5-Funktionsinvarianten forward-kompatibel gemacht. Der anschließende C.6-Lauf `34334339592` ist vollständig SUCCESS.

## Freigabestatus

WD-21C.1, C.2, C.3, C.4 und C.5 sind abgeschlossen. WD-21C.4 und WD-21C.5 bleiben **PASS / FROZEN / 0 BLOCKER**. WD-21C.6 ist **IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE CHECK PENDING** und ausdrücklich noch **nicht FROZEN**. WD-21C als Gesamtblock bleibt **nicht FROZEN**.

## Nächster zulässiger Schritt

Ausschließlich der reale iPad-/Safari-Gerätecheck für `WD-21C.6`: Browser-Tab und sichtbares Header-/Brand-Label müssen konsistent `WD-21C.6` zeigen; bestehendes Point-/Line-Verbinden und -Trennen regressieren; Circle-Auswahl und direkter Circle-Move müssen weiterhin funktionieren; anschließend kurzer Save/Load- und Undo/Redo-Check. Zusätzlich prüfen, dass keine sichtbare Arc-/Spline-Funktion versehentlich hinzugekommen ist. Noch kein C.6-Freeze-Gate und keine Arc-/Spline-Implementierung im selben Schritt.
