# CM3D – Projektstatus

Stand: 2026-09-09

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

**IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE CHECK PENDING / NOT FROZEN**

Reconciliation-Basis: eingefrorener C.7-Stand `feaee19c72977a98dc86090a99e57162aa27a0cc`.

Implementierter Minimalumfang:

- atomare `addSketchSplineFromPoints(...)`-Creation in einer zentralen `runSketchMutation(...)`-Transaktion mit zwei stabilen Endpoint-Punkten, stabilen Control-IDs und genau einem Spline;
- `setSketchSplineGeometry(...)` erhält Endpoint-IDs, Control-IDs, Reihenfolge und Control-Anzahl beim numerischen Editing;
- geordnete Bézier-Semantik `Start → controls[] → Ende` mit deterministischer de-Casteljau-Auswertung;
- reine abgeleitete Tessellation über `src/application/sketch-spline-geometry.js`, ohne persistente Rendersegmente oder Sketch-Line-Repräsentation;
- sichtbares Werkzeug `Spline` mit Preview-State und explizitem Abschluss über erneutes Betätigen des aktiven Werkzeugs;
- mindestens Start + ein Control + Ende erforderlich;
- Spline als genau ein `SKETCH_ELEMENT` im Viewer und in `Splines (n)` im Objektbaum;
- Inspector für Start/Ende sowie alle Controls in autoritativer Reihenfolge mit sichtbarer stabiler `controlId`;
- C.6-Connectivity wird ausschließlich für Start/Ende wiederverwendet;
- sichtbare Build-ID `WD-21C.8`.

Automatisierte Regression:

- Workflow: `WD-21C.8 Spline Integration Regression`;
- Run: `34394672958`;
- getesteter Code-Head: `ebebf456c40bd0fbe242b90319508da2320cb074`;
- A.2, A.3, B.2, B.3, C.2, C.3, C.4, C.5, C.6, C.7 und C.8: PASS;
- Result: **SUCCESS / PASS**.

Bestätigt sind atomare Creation mit einem History-Eintrag, stabile Spline-/Endpoint-/Control-IDs, Rollback ungültiger Creation ohne Control, ID-stabiles Editing, Zurückweisung eines Control-ID-Austauschs, C.6-Endpoint-Connectivity bei unveränderten Controls, deterministische de-Casteljau-Auswertung sowie Save/Load-Stabilität.

Die vorherigen roten C.8-Läufe waren Test-/Harness-Probleme: eine zu breite historische C.3-Negativassertion sowie ein Node-Testimport des browserseitigen UI-Moduls mit `three`. Die reine Spline-Geometrie wurde deshalb browserunabhängig getrennt; C.7-Produktcode und C.6/C.7-Fachsemantik blieben unverändert.

Explizit ausgeschlossen bleiben geschlossene Splines, nachträgliches Hinzufügen/Löschen/Umsortieren von Controls, Control-Handles, Spline-Gizmo/Drag, Tangentialität/Continuity-Constraints, alternative Kurventypen, Snap/Auto-Merge/Tolerance/geometrisches Rebinding, Profile/Pfade, N-Gon und Extrusionsintegration.

WD-21C.8 bleibt bis zum realen Gerätecheck ausdrücklich **NOT FROZEN**. WD-21C als Gesamtblock bleibt **nicht FROZEN**.

## Verbindliche Build-Kennungsregel

Bei jedem WD-Teilschritt müssen autoritative Build-ID, `document.title`, sichtbare Build-/Brand-Kennung und WD-/Projektstatusdokumentation konsistent sein. Eine widersprüchliche sichtbare Kennung ist ein **BLOCKER** und verhindert PASS/FROZEN.

Korrekturläufe innerhalb desselben WD-Teilschritts dürfen eine sichtbare Revisionskennung `-R1`, `-R2`, … tragen. Diese Kennung muss ebenfalls in Browser-Tab und Header konsistent sichtbar sein und wird von den Build-Gates akzeptiert.

## Nächster zulässiger Schritt

Ausschließlich der reale iPad-/Safari-Gerätecheck auf **`WD-21C.8`**: Tab/Header-Build-ID prüfen, Spline mit Start + mindestens einem Control + Ende erzeugen und explizit abschließen, optional mehrere Controls prüfen, Tree-/Viewer-Auswahl und Inspector editieren, Endpoint-Connect/Disconnect über C.6 regressieren sowie Undo/Redo und Speichern/Laden testen. Kontrollieren, dass keine Control-Handles, kein Spline-Gizmo und keine Profile/Pfade hinzugekommen sind. Noch kein Freeze-Gate und kein nächster C-Teilblock.
