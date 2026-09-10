# CM3D – Projektstatus

Stand: 2026-09-10

## Aktueller Gesamtstand

Repository `DrHoschi/CM3D` ist die zentrale Projektbasis.

**CM3D V1 – COMPLETE / PASS / FROZEN**

## V2 – Foundation & Compatibility

**RB-01 – PASS / FROZEN**

Freigegebener `main`-Stand nach Abschlussdokumentation: `1edae185c6207db9d754c94d00d23cf10218c56c`

## RB-02 – Sketch Topology & Profiles

RB-02 ist der aktuell aktive V2-Roadmapblock.

Geplante WD-Zerlegung:

- WD-21A – Sketch Topology Contract & Element Foundation
- WD-21B – Sketch Connectivity & Editing Integration
- WD-21C – Sketch Element Type Expansion
- WD-21D – Profile & Open Path Derivation
- WD-21E – Stable Profile/Path Reference & Selection
- WD-21F – Profile/Path Dependency & Recompute Integration
- WD-21G – RB-02 Integration / Regression / Freeze Gate

## WD-21A – Sketch Topology Contract & Element Foundation

**PASS / FROZEN / 0 BLOCKER**

## WD-21B – Sketch Connectivity & Editing Integration

**PASS / FROZEN / 0 BLOCKER**

## WD-21C – Sketch Element Type Expansion

Aktiver Branch: `feature/wd-21c-sketch-element-type-expansion`

### WD-21C.1
**PASS / INVENTORY & CONTRACT COMPLETE / 0 ELEMENT IMPLEMENTATION**

### WD-21C.2
**PASS / DEVICE VERIFIED / 0 BLOCKER**

### WD-21C.3
**PASS / DEVICE VERIFIED / 0 BLOCKER**

### WD-21C.4 – Circle Creation, Rendering & Editing Integration
**PASS / FROZEN / 0 BLOCKER**

### WD-21C.5 – Generic Sketch Element Manipulation Contract
**PASS / FROZEN / 0 BLOCKER**

### WD-21C.6 – Generic Endpoint Element Connectivity Contract
**PASS / FROZEN / 0 BLOCKER**

Finaler sichtbarer Korrekturstand `WD-21C.6-R1`; Completion-Regression Run `34363013788`: SUCCESS; reale iPad-/Safari-Evidenz: PASS.

### WD-21C.7 – Arc Creation, Rendering & Editing Integration
**PASS / FROZEN / 0 BLOCKER**

Finaler sichtbarer Stand `WD-21C.7`; Completion-Regression Run `34369150959`: SUCCESS; reale iPad-/Safari-Evidenz: PASS / 0 BLOCKER.

### WD-21C.8 – Spline Creation, Rendering & Editing Integration

**IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE RECHECK PENDING / NOT FROZEN**

Reconciliation-Basis: eingefrorener C.7-Stand `feaee19c72977a98dc86090a99e57162aa27a0cc`.

Der fachliche C.8-Minimalumfang bleibt unverändert: atomare Spline-Creation, stabile Endpoint-/Control-IDs, geordnete Bézier-/de-Casteljau-Semantik, abgeleitete Tessellation, sichtbares Spline-Werkzeug, Tree-/Viewer-Auswahl, Inspector und Wiederverwendung der eingefrorenen C.6-Connectivity ausschließlich für Start/Ende.

#### WD-21C.8-R1 – Sketch Element Selection Synchronization Correction

Sichtbarer Korrekturstand: `WD-21C.8-R1`.

Der R1-Produktscope ist auf drei Dateien begrenzt:

- `src/ui/object-tree-scalability.js`: konkretes Reveal/Fokussieren per `sketchId + kind + elementId`;
- `src/runtime.js`: konkrete Sketch-Element-Auswahl fokussiert das konkrete Runtime-Visual statt pauschal die gesamte Skizze;
- `src/main.js`: zentrale sichtbare Build-ID `WD-21C.8-R1`.

Zusätzlich existieren ausschließlich der neue R1-Regressionstest/Workflow und die test-only Forward-Compatibility des bestehenden C.8-Build-Gates für zulässige `-R1`, `-R2`, …-Korrekturkennungen. Circle-/Arc-/Spline-Fachlogik, Connectivity, Gizmo, Visibility-Regeln, Profile/Pfade und Extrusionsintegration wurden nicht erweitert.

Finale CI-Verifikation des R1-Code-Heads `31c79f5e200cba8ef9fb41cef57655266ff68b82`:

- `WD-21C.8-R1 Sketch Element Selection Sync Regression`, Run `34451696793`, Job `sketch-element-selection-sync-regression`: **SUCCESS**;
- `WD-21C.8 Spline Integration Regression`, Run `34451696928`, Job `spline-integration-regression`: **SUCCESS**;
- beide Läufe wurden gegen exakt denselben Code-Head `31c79f5e200cba8ef9fb41cef57655266ff68b82` ausgeführt;
- der R1-Lauf bestätigt A.2, A.3, B.2, B.3, C.2, C.3, C.4, C.5, C.6, C.7, C.8 und C.8-R1 vollständig;
- der bestehende C.8-Lauf bestätigt A.2, A.3, B.2, B.3 und C.2 bis C.8 vollständig.

Damit gilt: **AUTOMATED REGRESSION PASS / 0 CURRENT CI BLOCKER**. Nachfolgende Commits zur Statussynchronisierung sind ausschließlich Dokumentation und verändern den getesteten Produktcode nicht.

Explizit ausgeschlossen bleiben geschlossene Splines, nachträgliches Hinzufügen/Löschen/Umsortieren von Controls, Control-Handles, Spline-Gizmo/Drag, Tangentialität/Continuity-Constraints, alternative Kurventypen, Snap/Auto-Merge/Tolerance/geometrisches Rebinding, Profile/Pfade, N-Gon und Extrusionsintegration.

WD-21C.8-R1 bleibt bis zum realen Geräte-Recheck ausdrücklich **NOT FROZEN**. WD-21C als Gesamtblock bleibt **nicht FROZEN**.

## Verbindliche Build-Kennungsregel

Bei jedem WD-Teilschritt müssen autoritative Build-ID, `document.title`, sichtbare Build-/Brand-Kennung und WD-/Projektstatusdokumentation konsistent sein. Eine widersprüchliche sichtbare Kennung ist ein **BLOCKER** und verhindert PASS/FROZEN.

Korrekturläufe innerhalb desselben WD-Teilschritts dürfen eine sichtbare Revisionskennung `-R1`, `-R2`, … tragen. Diese Kennung muss ebenfalls in Browser-Tab und Header konsistent sichtbar sein und wird von den Build-Gates akzeptiert.

## Nächster zulässiger Schritt

Ausschließlich der reale iPad-/Safari-Geräte-Recheck auf **`WD-21C.8-R1`**. Zuerst Tab/Header-Build-ID prüfen, danach gezielt die korrigierte Synchronisation zwischen konkreter Sketch-Element-Auswahl, Object Tree und Viewer für vorhandene Sketch-Elementtypen regressieren; anschließend die bestehende C.8-Spline-Funktion, Inspector, C.6-Endpoint-Connect/Disconnect, Undo/Redo sowie Speichern/Laden prüfen. Noch kein Freeze-Gate und kein nächster C-Teilblock.
