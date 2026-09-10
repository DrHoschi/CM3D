# WD-21C – Sketch Element Type Expansion

**Branch:** `feature/wd-21c-sketch-element-type-expansion`  
**Basis:** WD-21B FROZEN @ `2e8d5b0434e62bf7c7e34b11e54da077853328cc`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-10

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

**Status:** PASS / FROZEN / 0 BLOCKER

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

### Implementierter C.8-Minimalumfang

- atomare Application-Grenze `src/application/sketch-spline-creation.js`;
- `addSketchSplineFromPoints(...)` erzeugt in genau einer `runSketchMutation(...)`-Transaktion zwei stabile Endpoint-Punkte, stabile Control-IDs und genau einen Spline;
- eine sichtbare Creation erzeugt genau einen History-/Undo-Eintrag;
- ungültige Creation hinterlässt keine persistenten Teilreste;
- `setSketchSplineGeometry(...)` erhält Endpoint-IDs, Control-IDs, Reihenfolge und Anzahl;
- reine Kurvenauswertung in `src/application/sketch-spline-geometry.js` per `deCasteljau(...)`;
- sichtbares Werkzeug `Spline` mit Eingabefolge `Start → Control 1 → optional weitere Controls → Ende` und explizitem Abschluss;
- Viewer/Preview verwenden ausschließlich abgeleitete Bézier-Tessellation;
- Spline bleibt genau ein `SKETCH_ELEMENT` mit `kind:'spline'`;
- Object Tree enthält `Splines (n)` und eine Zeile je Spline;
- Inspector zeigt Start/Ende und Controls in autoritativer Reihenfolge;
- C.6-Connectivity wird ausschließlich für Spline-Start/-Ende wiederverwendet.

### WD-21C.8-R1 – Sketch Element Selection Synchronization Correction

R1 stellte die generische konkrete Sketch-Element-Synchronisation her. `src/ui/object-tree-scalability.js` kann konkrete Sketch-Elemente über `sketchId + kind + elementId` offenlegen, und `src/runtime-three/runtime.js` fokussiert über `focusSelection()` das konkrete Runtime-Visual statt pauschal die gesamte Skizze. Der R1-Code-Head `31c79f5e200cba8ef9fb41cef57655266ff68b82` bestand Run `34451696793` sowie den C.8-Run `34451696928`.

Der reale R1-Gerätecheck zeigte anschließend einen verbliebenen Blocker: Viewer → Tree funktionierte für Arc/Spline, Tree → Viewer zentrierte Arc/Spline jedoch nicht. Die Diagnose bestätigte, dass die Sketch-Element-Identität vollständig erhalten blieb; die automatische Kameraausrichtung war lediglich an die Gizmo-Manipulationsfähigkeit gekoppelt.

### WD-21C.8-R2 – Generic Sketch Selection Camera Alignment Decoupling Correction

Finaler sichtbarer Korrekturstand: `WD-21C.8-R2`.

R2 trennt Selection/Focus strikt von Gizmo-Manipulation:

- `src/ui/sketch-gizmo.js` führt für eine konkrete Sketch-Auswahl die Kamera-Synchronisation unabhängig von der Manipulationsfähigkeit aus;
- manipulierbare Auswahlen `point`, `line`, `circle` behalten den bestehenden Gizmo-/Align-Pfad;
- nicht manipulierbare konkrete Sketch-Elemente wie `arc` und `spline` verwenden die bestehende `runtime.focusSelection()`-Autorität;
- Arc/Spline erhalten ausdrücklich keinen Manipulationsadapter, kein Gizmo und keinen Drag;
- `manipulationKinds` bleibt exakt `point`, `line`, `circle`;
- `suppressNextSelectionAlign` bleibt wirksam und wird durch R2 nicht umgangen;
- `src/main.js` trägt zentral `BUILD_ID = 'WD-21C.8-R2'`; `document.title` und sichtbares Brand-Label werden weiterhin ausschließlich aus dieser Build-ID gesetzt.

R2 verändert keine Arc-/Spline-Geometriesemantik, keine Connectivity-Regel, keine SelectionRef-Art, keine Visibility-Regel, keine Profile/Pfade und keine Extrusionsintegration.

### Completion / Regression / Freeze Gate

Geprüfter Produkt-/Test-Head: `fe20a2b6b149595b2ffe57a3838da655dfe8b24d`.

Diff-Audit:

- gegen eingefrorene C.7-Basis `feaee19c72977a98dc86090a99e57162aa27a0cc`: **28 Commits voraus / 0 zurück**; der Gesamt-Diff entspricht C.8 plus den kontrollierten R1-/R2-Korrekturen und zugehöriger Regression/Dokumentation;
- gegen dokumentierten C.8-R1-Ausgang `47d98f67afc9d4edb1cbec37d70cda3642de5a1a`: **5 Commits voraus / 0 zurück**;
- R2-Diff enthält ausschließlich `src/ui/sketch-gizmo.js`, die Build-ID in `src/main.js`, den neuen R2-Test/Workflow sowie eine test-only Forward-Compatibility-Anpassung im R1-Buildtest.

Automatisierte Regression:

Workflow `WD-21C.8-R2 Selection Camera Alignment Regression`  
Run: `34510128236`  
Job: `selection-camera-alignment-regression`  
Result: **SUCCESS / PASS**

Der Lauf bestätigt WD-21A.2, WD-21A.3, WD-21B.2, WD-21B.3, WD-21C.2, WD-21C.3, WD-21C.4, WD-21C.5, WD-21C.6, WD-21C.7, WD-21C.8, WD-21C.8-R1 und WD-21C.8-R2 vollständig.

Der bestehende R1-Workflow lief auf demselben Head ebenfalls erfolgreich: Run `34510128178` = **SUCCESS / PASS**.

### Geräte-Evidenz

Realer iPad-/Safari-Test auf sichtbarem Build `WD-21C.8-R2`: **PASS**.

Bestätigt wurden:

- Tab/Header zeigen konsistent `WD-21C.8-R2`;
- Tree-Auswahl alter Punkte/Linien fokussiert weiterhin korrekt;
- Point-/Line-Gizmo bleibt vorhanden und Verschieben funktioniert;
- Kreis-Auswahl und Circle-Gizmo funktionieren weiterhin;
- Arc/Spline synchronisieren und fokussieren aus dem Object Tree korrekt im Viewer;
- Arc/Spline erhalten weiterhin kein Gizmo, wie vertraglich vorgesehen.

Damit: **PASS / 0 BLOCKER**.

### Explizit ausgeschlossen / weiterhin später

- geschlossene Splines;
- Controls nach Creation hinzufügen, löschen oder umsortieren;
- sichtbare Spline-Control-Handles oder Control-Drag;
- Spline-Gizmo / direkter Whole-Spline-Drag;
- Tangentialität, Smooth-/Continuity-Constraints;
- Catmull-Rom, B-Spline oder alternative Kurventypen;
- Snap, Auto-Merge, Tolerance oder geometrisches Rebinding;
- Profile/Pfade;
- N-Gon;
- Extrusionsintegration;
- Änderungen an der eingefrorenen C.6- oder C.7-Fachsemantik.

## Freigabestatus

WD-21C.4, WD-21C.5, WD-21C.6, WD-21C.7 und WD-21C.8-R2 sind **PASS / FROZEN / 0 BLOCKER**. Der finale sichtbare C.8-Korrekturstand ist `WD-21C.8-R2`.

WD-21C als Gesamtblock ist damit fachlich bis einschließlich C.8 abgeschlossen; ein nachfolgender WD-Teilblock wird in diesem Freeze-Gate ausdrücklich nicht begonnen.

## Nächster zulässiger Schritt

Kein weiterer Schritt innerhalb dieses Freeze-Gates. Ein nachfolgender WD-Teilblock darf erst separat ausdrücklich freigegeben werden.
