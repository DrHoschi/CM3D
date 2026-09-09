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

**Status:** IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE CHECK FAILED / 1 BLOCKER

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

Der erste C.6-Lauf `34334248395` scheiterte ausschließlich an einer veralteten C.5-Build-ID-Testgrenze. Nach deren forward-kompatibler Korrektur ist der anschließende C.6-Lauf `34334339592` vollständig SUCCESS.

### Reale Geräte-Evidenz 2026-09-09 – iPad/Safari

- Browser-Tab und sichtbares Header-/Brand-Label zeigen konsistent `WD-21C.6`: PASS;
- Save/Load: PASS;
- Undo/Redo: PASS;
- bestehende Mehrfachauswahl: FAIL;
- dadurch sind bestehendes Point-/Line-`Verbinden` und `Trennen` auf dem Gerät praktisch nicht ausführbar: BLOCKER;
- sichtbare Arc-/Spline-Funktion wurde nicht als neue Funktion gemeldet;
- Geräte-Gesamtergebnis: **FAIL / 1 BLOCKER**.

### Eingrenzung des Blockers

Der C.6-Diff gegen frozen C.5 verändert `src/ui/sketch-multiselect.js` nicht. Betroffen sind jedoch die neue generische Connectivity-Erweiterung, die Connectivity-Command-Schicht, die sichtbaren Connectivity-Actions und deren Integration in `src/main.js`. Deshalb ist vor jedem Fix gezielt die Übergabe `Mehrfachauswahl / SelectionRef → C.6 Command State → Verbinden/Trennen` zu prüfen. Kein Arc-/Spline-Ausbau im selben Schritt.

## Freigabestatus

WD-21C.1, C.2, C.3, C.4 und C.5 sind abgeschlossen. WD-21C.4 und WD-21C.5 bleiben **PASS / FROZEN / 0 BLOCKER**. WD-21C.6 ist **IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE CHECK FAILED / 1 BLOCKER** und ausdrücklich **nicht FROZEN**. WD-21C als Gesamtblock bleibt **nicht FROZEN**.

## Nächster zulässiger Schritt

Ausschließlich **WD-21C.6-R1 – Multiselect / Connectivity Regression Diagnosis & Minimal Fix**: zuerst die konkrete Ursache zwischen bestehender Mehrfachauswahl/SelectionRef und dem C.6-Command-State reproduzierbar bestimmen, anschließend nur den kleinsten notwendigen Fix innerhalb der bestehenden C.6-Grenze umsetzen. Danach vollständige C.6-Regression und erneuter iPad-/Safari-Gerätecheck. Noch keine sichtbare Arc-/Spline-Funktion und kein nächster C-Teilblock.
