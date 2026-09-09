# WD-21C – Sketch Element Type Expansion

**Branch:** `feature/wd-21c-sketch-element-type-expansion`  
**Basis:** WD-21B FROZEN @ `2e8d5b0434e62bf7c7e34b11e54da077853328cc`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-09

## WD-21C.1 – Existing Sketch Element Type & Creation/Editing Inventory

**Status:** PASS / INVENTORY & CONTRACT COMPLETE / 0 ELEMENT IMPLEMENTATION

## WD-21C.2 – Generic Sketch Element Registry & Persistence Foundation

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

## WD-21C.3 – Generic Sketch Element Mutation Contract + Analytic Geometry ↔ Derived Tessellation Boundary

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

## WD-21C.4 – Circle Creation, Rendering & Editing Integration

**Status:** PASS / FROZEN / 0 BLOCKER

Finaler sichtbarer Korrekturstand: `WD-21C.4-R1`. Completion-Regression Run `34273576840`: SUCCESS; reale iPad-/Safari-Evidenz: PASS.

## WD-21C.5 – Generic Sketch Element Manipulation Contract

**Status:** PASS / FROZEN / 0 BLOCKER

Direkter Circle-Gizmo-Move, bestehende Point-/Line-Manipulation, Save und Undo/Redo sind auf iPad/Safari bestätigt. Regression Run `34277682889`: SUCCESS.

## WD-21C.6 – Generic Endpoint Element Connectivity Contract

**Status:** IMPLEMENTED / R1 CORRECTION / AUTOMATED REGRESSION PASS / DEVICE RECHECK PENDING / NOT FROZEN

### C.6 Hauptumfang

C.6 generalisiert die bestehende B.2/B.3-Connectivity ausschließlich auf registrierte endpoint-basierte Sketch-Elemente (`topologyEndpoints: true` → aktuell Line/Arc/Spline). Circle bleibt ausgeschlossen; `pointId` bleibt einzige Connectivity-Autorität. Keine sichtbare Arc-/Spline-Funktion ist Bestandteil von C.6.

Automatisierte C.6-Basisregression:

- Workflow: `WD-21C.6 Generic Endpoint Connectivity Regression`
- Run: `34334339592`
- getesteter Code-Head: `e91526716bcd6431a4e793fcce2ba4e1dc4fbefd`
- A.2, A.3, B.2, B.3, C.2, C.3, C.4, C.5, C.6: PASS
- Result: **SUCCESS / PASS**

### Gerätebefund vor R1

Realer iPad-/Safari-Test 2026-09-09 auf `WD-21C.6`:

- Browser-Tab + Header: PASS
- Save/Load: PASS
- Undo/Redo: PASS
- bestehende Mehrfachauswahl: FAIL
- dadurch Point-/Line-`Verbinden` und `Trennen` praktisch nicht ausführbar
- Ergebnis: **FAIL / 1 BLOCKER**

### WD-21C.6-R1 – Multiselect / Connectivity Regression Diagnosis & Minimal Fix

**Ursache:** Der generische Sketch-Target-Auswahlpfad setzt vor jeder Elementauswahl den Owner-Sketch über `legacyObjectSelect(...)`. Diese Referenz zeigt nach Installation der Mehrfachauswahl auf deren `store.select(...)`-Wrapper. Dieser Wrapper leerte `store.selection.sketchElements` bei jeder Owner-Sketch-Selektion. Dadurch wurde beim zweiten ausgewählten Punkt zuerst der erste Punkt entfernt.

**Minimalfix:** `src/ui/sketch-multiselect.js` erhält ausschließlich eine Preservation-Regel: Wenn Mehrfachauswahl aktiv ist, der selektierte Owner ein Sketch ist und alle aktuell ausgewählten Sketch-Elemente zu genau diesem Sketch gehören, bleibt `store.selection.sketchElements` über die Owner-Sketch-Selektion erhalten. Für normale Objekt-/Sketch-Selektion außerhalb dieses Falls bleibt das bisherige Clear-Verhalten bestehen.

Unverändert:

- keine Änderung an C.6 Connect-/Disconnect-Fachregeln;
- keine neue Arc-/Spline-UI;
- keine Circle-Connectivity;
- keine Snap-/Merge-/Tolerance-/Rebinding-Semantik;
- keine Profile/Pfade, N-Gon oder Extrusionsintegration.

R1-Build:

- sichtbare Build-ID: `WD-21C.6-R1`
- Fix-Commit Multiselect: `bbfd768744e4b0aded323c741dbfb9194e575698`
- Build-ID-Commit: `ddab664c753ea6cf6b8b81ddfff98405609861e9`
- Regressionstest-Erweiterung: `e4c0d91df1f0ae9a2baf0df9d2d30782772ebe4a`

R1-Automatik:

- Workflow: `WD-21C.6 Generic Endpoint Connectivity Regression`
- Run: `34363013788`
- getesteter Head: `e4c0d91df1f0ae9a2baf0df9d2d30782772ebe4a`
- A.2, A.3, B.2, B.3, C.2, C.3, C.4, C.5 und C.6: PASS
- C.6-Test prüft zusätzlich die neue Multiselect-Preservation-Grenze
- Result: **SUCCESS / PASS**

## Freigabestatus

WD-21C.4 und WD-21C.5 bleiben **PASS / FROZEN / 0 BLOCKER**. WD-21C.6-R1 ist **IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE RECHECK PENDING** und ausdrücklich noch **nicht FROZEN**. WD-21C als Gesamtblock bleibt **nicht FROZEN**.

## Nächster zulässiger Schritt

Ausschließlich der reale iPad-/Safari-Geräte-Recheck auf **`WD-21C.6-R1`**: Tab/Header auf R1 prüfen, Mehrfachauswahl aktivieren, zwei Punkte derselben Skizze nacheinander auswählen und kontrollieren, dass beide ausgewählt bleiben; anschließend `Verbinden` und `Trennen` regressieren. Save/Load sowie Undo/Redo kurz gegenprüfen. Noch kein Freeze-Gate, keine Arc-/Spline-Funktion und kein nächster C-Teilblock.
