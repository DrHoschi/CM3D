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

**Status:** PASS / FROZEN / 0 BLOCKER

Finaler sichtbarer Korrekturstand: `WD-21C.6-R1`. C.6 generalisiert Connect/Disconnect auf registrierte endpoint-basierte Elemente. Reale iPad-/Safari-Evidenz und Completion-Regression Run `34363013788`: PASS / 0 BLOCKER.

## WD-21C.7 – Arc Creation, Rendering & Editing Integration

**Status:** PASS / FROZEN / 0 BLOCKER

Finaler sichtbarer Stand: `WD-21C.7`. Completion-Regression Run `34369150959`: SUCCESS. Reale iPad-/Safari-Evidenz bestätigt Drei-Punkt-Bogen, Tree-/Viewer-Auswahl, Inspector, C.6-Connectivity mit geeigneten Punkten, Undo/Redo und Save/Load. 0 BLOCKER.

## WD-21C.8 – Spline Creation, Rendering & Editing Integration

**Status:** IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE CHECK PENDING / NOT FROZEN

**Reconciliation-Basis:** eingefrorener WD-21C.7-Stand `feaee19c72977a98dc86090a99e57162aa27a0cc`.

### Autoritativer Vertrag

Spline-Identität:

`{ splineId, startPointId, endPointId, controls:[{controlId,x,y}, ...] }`

- `splineId` bleibt stabil;
- `startPointId` und `endPointId` sind echte topologische Sketch-Punkte;
- mindestens ein geometrischer Control mit stabiler `controlId`;
- Controls sind keine Topologiepunkte und keine Connect-/Disconnect-Ziele;
- Control-Anzahl, Reihenfolge und IDs bleiben beim C.8-Editing unverändert.

Die mathematische Semantik ist eine geordnete Bézier-Kurve `Start → controls[0] → … → Ende`, deterministisch per de Casteljau ausgewertet. Tessellation bleibt ausschließlich abgeleitet und wird nicht als Sketch-Geometrie persistiert.

### Implementierter Minimalumfang

- neue atomare Application-Grenze `src/application/sketch-spline-creation.js`;
- `addSketchSplineFromPoints(...)` erzeugt in genau einer `runSketchMutation(...)`-Transaktion zwei stabile Endpoint-Punkte, stabile Control-IDs und genau einen Spline;
- eine sichtbare Creation erzeugt genau einen History-/Undo-Eintrag;
- ungültige Creation hinterlässt keine persistenten Teilreste;
- `setSketchSplineGeometry(...)` editiert Start/Ende und vorhandene Controls koordiniert und erhält Endpoint-IDs, Control-IDs, Reihenfolge und Anzahl;
- reine Kurvenauswertung in `src/application/sketch-spline-geometry.js` mit `deCasteljau(...)` und internem Rendersegment-Default;
- sichtbares Werkzeug `Spline`;
- Eingabefolge `Start → Control 1 → optional weitere Controls → Ende`, danach explizites `Spline abschließen` durch erneutes Betätigen des aktiven Werkzeugs;
- vor Abschluss ausschließlich Runtime-Preview-State;
- Viewer und Preview verwenden nur abgeleitete Bézier-Tessellation;
- Spline bleibt im Viewer genau ein `SKETCH_ELEMENT` mit `kind:'spline'`;
- Object Tree erhält `Splines (n)` und genau eine Zeile pro Spline;
- Inspector zeigt Start X/Y, Ende X/Y und alle Controls mit stabiler `controlId` in autoritativer Reihenfolge;
- Inspector-Editing verändert ausschließlich Koordinaten und nicht Control-Anzahl/-Reihenfolge/-IDs;
- eingefrorene C.6-Connectivity wird nur für Spline-Start und -Ende wiederverwendet;
- sichtbare Build-ID ist `WD-21C.8`; die zentrale `applyBuildIdentity()`-Grenze bleibt die Build-Autorität.

### Explizit ausgeschlossen

- geschlossene Splines;
- Controls nach Creation hinzufügen, löschen oder umsortieren;
- sichtbare Control-Handles;
- Spline-Gizmo oder direkter Spline-/Control-Drag;
- Tangentialität, Smooth-/Continuity-Constraints;
- Catmull-Rom, B-Spline oder alternative Kurventypen;
- Snap, Auto-Merge, Tolerance oder geometrisches Rebinding;
- Profile/Pfade;
- N-Gon;
- Extrusionsintegration;
- Änderungen an der eingefrorenen C.6- oder C.7-Fachsemantik.

### Automatisierte Regression

Workflow: `WD-21C.8 Spline Integration Regression`  
Run: `34394672958`  
Getesteter Code-Head: `ebebf456c40bd0fbe242b90319508da2320cb074`  
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
- WD-21C.6 Generic Endpoint Connectivity: PASS;
- WD-21C.7 Arc Integration: PASS;
- WD-21C.8 Spline Integration: PASS.

Der C.8-Test bestätigt zusätzlich atomare Creation mit genau einem History-Eintrag, stabile Spline-/Endpoint-/Control-IDs, Ablehnung einer Creation ohne Control ohne Teilreste, ID-stabiles Geometry-Editing, Zurückweisung eines Control-ID-Austauschs, C.6-Connect/Disconnect nur über die Endpoint-Grenze bei unveränderten Controls, deterministische de-Casteljau-Auswertung sowie Save/Load-Erhalt der Spline-Identität.

### Test-Gate-Korrekturen während der Implementierung

Frühere rote C.8-Läufe waren Test-/Harness-Grenzen und keine freizugebenden Produktregressionen:

- Run `34394386018` stoppte an einer versehentlich zu weit gefassten C.3-Source-Negativprüfung, die auch bereits vorhandene Contract-Metadaten `profilePathDerivationIncluded:false` traf. Die fehlerhafte Testassertion wurde entfernt; Produktcode blieb unverändert.
- Run `34394493629` lief A.2 bis C.7 erfolgreich und stoppte erst im neuen C.8-Test, weil der Node-Test direkt das browserseitige UI-Modul mit Bare-Import `three` importierte. Die reine Bézier-/de-Casteljau-Geometrie wurde deshalb in `src/application/sketch-spline-geometry.js` als browserunabhängige pure Funktion getrennt und vom UI konsumiert. Die fachliche Spline-Semantik wurde dadurch nicht erweitert.
- Der C.7-Build-Gate-Test wurde ausschließlich forward-kompatibel für nachfolgende WD-21C-Builds gemacht; C.7-Produktcode und C.7-Fachsemantik blieben unverändert.

Erst Run `34394672958` auf `ebebf456c40bd0fbe242b90319508da2320cb074` ist das maßgebliche C.8-Automatik-Gate und vollständig SUCCESS.

### Geräte-Evidenz

Noch nicht durchgeführt. WD-21C.8 bleibt deshalb ausdrücklich **NOT FROZEN**.

## Freigabestatus

WD-21C.4, WD-21C.5, WD-21C.6 und WD-21C.7 sind **PASS / FROZEN / 0 BLOCKER**. WD-21C.8 ist **IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE CHECK PENDING / NOT FROZEN**. WD-21C als Gesamtblock bleibt ausdrücklich **nicht FROZEN**.

## Nächster zulässiger Schritt

Ausschließlich der reale iPad-/Safari-Gerätecheck auf **`WD-21C.8`**: Tab/Header-Build-ID prüfen, Spline mit mindestens Start + Control + Ende zeichnen und explizit abschließen, optional mehrere Controls testen, Tree-/Viewer-Auswahl und Inspector editieren, Endpoint-Connect/Disconnect über C.6 regressieren, Undo/Redo sowie Speichern/Laden prüfen und kontrollieren, dass keine Control-Handles, kein Spline-Gizmo und keine Profile/Pfade hinzugekommen sind. Noch kein Freeze-Gate und kein nächster C-Teilblock.
