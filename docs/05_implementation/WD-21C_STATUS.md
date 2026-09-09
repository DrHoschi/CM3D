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

Finaler sichtbarer Korrekturstand: `WD-21C.6-R1`.

### C.6 Hauptumfang

C.6 generalisiert die bestehende B.2/B.3-Connectivity ausschließlich auf registrierte endpoint-basierte Sketch-Elemente (`topologyEndpoints: true` → aktuell Line/Arc/Spline). Circle bleibt ausgeschlossen; `pointId` bleibt einzige Connectivity-Autorität. Keine sichtbare Arc-/Spline-Funktion ist Bestandteil von C.6.

### WD-21C.6-R1 – Multiselect / Connectivity Regression Correction

Der erste reale iPad-/Safari-Test auf `WD-21C.6` zeigte eine Bestandsregression der Mehrfachauswahl. Ursache war die Owner-Sketch-Selektion im generischen Sketch-Target-Pfad: der bereits von der Mehrfachauswahl umwickelte `store.select(...)`-Pfad leerte `store.selection.sketchElements`, sodass beim zweiten Tap die erste Auswahl verloren ging.

Der R1-Minimalfix in `src/ui/sketch-multiselect.js` erhält die bestehende Sketch-Element-Auswahl ausschließlich dann über die Owner-Sketch-Selektion hinweg, wenn Mehrfachauswahl aktiv ist und alle ausgewählten Sketch-Elemente zum selben Owner-Sketch gehören. Alle anderen Selektionsfälle behalten das bisherige Clear-Verhalten. Keine Connect-/Disconnect-Fachregel wurde verändert.

R1-Code-Evidenz:

- Multiselect-Fix: `bbfd768744e4b0aded323c741dbfb9194e575698`
- Build-ID-Commit: `ddab664c753ea6cf6b8b81ddfff98405609861e9`
- Regressionstest-/getesteter Code-Head: `e4c0d91df1f0ae9a2baf0df9d2d30782772ebe4a`
- sichtbare Build-ID: `WD-21C.6-R1`

### Completion / Regression / Freeze Gate

Vergleichsbasis ist der zuvor automatisiert grüne C.6-Code-Stand `e91526716bcd6431a4e793fcce2ba4e1dc4fbefd`. Der vollständige R1-Branchstand vor Freeze-Dokumentation `beaeb9c9d45c988e3b2a2cad6aab2ddc6013ad2e` liegt **9 Commits voraus / 0 dahinter**.

Der Diff ist auf die R1-Grenze beschränkt:

- `src/main.js`: sichtbare Build-ID `WD-21C.6-R1`;
- `src/ui/sketch-multiselect.js`: minimale Preservation-Regel;
- `tests/wd-21c6-generic-endpoint-connectivity.mjs`: R1-Regressionsabsicherung;
- ausschließlich zugehörige WD-/Projektstatusdokumentation.

Keine Arc-/Spline-Erstellung, kein Arc-/Spline-Rendering, Inspector oder Gizmo, keine Profile/Pfade, kein N-Gon und keine Extrusionsfunktion wurden durch R1 eingeführt.

Automatisierte Completion-Regression:

- Workflow: `WD-21C.6 Generic Endpoint Connectivity Regression`
- Run: `34363013788`
- getesteter Code-Head: `e4c0d91df1f0ae9a2baf0df9d2d30782772ebe4a`
- WD-21A.2: PASS
- WD-21A.3: PASS
- WD-21B.2: PASS
- WD-21B.3: PASS
- WD-21C.2: PASS
- WD-21C.3: PASS
- WD-21C.4: PASS
- WD-21C.5: PASS
- WD-21C.6: PASS
- Result: **SUCCESS / PASS**

Die nach dem getesteten Code-Head hinzugekommenen Commits bis zum auditierten R1-Branchstand betreffen ausschließlich Statusdokumentation; während des Freeze-Gates wurde kein Produktcode geändert.

### Reale Geräte-Evidenz 2026-09-09 – iPad/Safari

Der reale Recheck auf `WD-21C.6-R1` bestätigt:

- Browser-Tab und sichtbares Header-/Brand-Label konsistent `WD-21C.6-R1`: PASS;
- Zeichnen: PASS;
- Polygon: PASS;
- Mehrfachauswahl: PASS;
- `Verbinden`: PASS;
- `Trennen`: PASS;
- Verbindung erneut zusammenführen: PASS;
- Undo: PASS;
- Redo: PASS;
- Speichern: PASS;
- Laden: PASS;
- 0 gemeldete Blocker.

Der ursprüngliche C.6-Mehrfachauswahlblocker ist damit real auf iPad/Safari geschlossen.

### Unveränderte Ausschlüsse

- keine sichtbare Arc-/Spline-Funktion;
- keine Circle-Connectivity;
- keine Snap-/Merge-/Tolerance-/geometrische Rebinding-Semantik;
- keine Profile/Pfade;
- kein N-Gon;
- keine Extrusionsintegration.

## Freigabestatus

WD-21C.4, WD-21C.5 und WD-21C.6 sind **PASS / FROZEN / 0 BLOCKER**. WD-21C als Gesamtblock bleibt ausdrücklich **nicht FROZEN**, da weitere WD-21C-Teilblöcke noch nicht definiert/abgeschlossen sind.

## Nächster zulässiger Schritt

Ausschließlich den nächsten kleinen WD-21C-Teilblock fachlich definieren. Noch keine Arc-/Spline-Implementierung und keine weitere C.6-Erweiterung im selben Schritt.
