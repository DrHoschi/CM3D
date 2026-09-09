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

**DEFINED / NOT IMPLEMENTED**

Reconciliation-Basis: eingefrorener C.7-Stand `feaee19c72977a98dc86090a99e57162aa27a0cc`.

Verbindliche C.8-Grenze:

- autoritative Identität `{ splineId, startPointId, endPointId, controls:[{controlId,x,y}, ...] }`;
- Start/Ende sind echte topologische Punkte; Controls besitzen stabile `controlId`s, sind aber keine Topologiepunkte;
- Control-Anzahl, Reihenfolge und IDs bleiben beim C.8-Editing stabil;
- mathematische Semantik ist eine geordnete Bézier-Kurve `Start → controls[0] → ... → Ende`, deterministisch per de Casteljau ausgewertet;
- sichtbare Erstellung `Start → Control 1 → optional weitere Controls → Ende/Abschluss`;
- erneutes Betätigen des aktiven `Spline`-Werkzeugs ist das explizite Abschlusskommando;
- vor Abschluss ausschließlich Preview-State;
- finale Erstellung atomar in genau einer zentralen Sketch-Transaktion: zwei stabile Endpoint-Punkte + stabile Control-IDs + genau ein Spline;
- eine Creation entspricht einem History-/Undo-Schritt und hinterlässt bei ungültiger Eingabe keine persistenten Teilreste;
- keine geometrische Übernahme vorhandener Punkte beim Zeichnen; Connectivity ausschließlich explizit über C.6;
- Viewer-/Preview-Tessellation ausschließlich abgeleitet, nicht persistent und keine Sketch-Line-Repräsentation;
- Spline im Viewer und Objektbaum als genau ein `SKETCH_ELEMENT`;
- eigene Tree-Gruppe `Splines (n)`;
- Inspector für Start/Ende und alle Controls in autoritativer Reihenfolge;
- Endpoint-Editing erhält `pointId`s, Control-Editing erhält `controlId`s, Reihenfolge und Anzahl;
- C.6-Connectivity wird ausschließlich für Start/Ende konsumiert, nicht erweitert;
- Delete, Undo/Redo und Save/Load verwenden vorhandene zentrale Grenzen.

Explizit nicht Bestandteil von C.8: geschlossene Splines; Controls nach Creation hinzufügen/löschen/umsortieren; Control-Handles; Spline-Gizmo/Drag; Tangentialität/Smooth-/Continuity-Constraints; Catmull-Rom/B-Spline/alternative Kurventypen; Snap/Auto-Merge/Tolerance/geometrisches Rebinding; Profile/Pfade; N-Gon; Extrusion; Änderungen an C.6/C.7.

Bei späterer Implementierung ist die sichtbare Build-ID `WD-21C.8`; Tab, Header/Brand und Status müssen konsistent sein.

WD-21C.8 bleibt bis zu einer separaten Implementierungsfreigabe **NOT IMPLEMENTED**. WD-21C als Gesamtblock bleibt **nicht FROZEN**.

## Verbindliche Build-Kennungsregel

Bei jedem WD-Teilschritt müssen autoritative Build-ID, `document.title`, sichtbare Build-/Brand-Kennung und WD-/Projektstatusdokumentation konsistent sein. Eine widersprüchliche sichtbare Kennung ist ein **BLOCKER** und verhindert PASS/FROZEN.

Korrekturläufe innerhalb desselben WD-Teilschritts dürfen eine sichtbare Revisionskennung `-R1`, `-R2`, … tragen. Diese Kennung muss ebenfalls in Browser-Tab und Header konsistent sichtbar sein und wird von den Build-Gates akzeptiert.

## Nächster zulässiger Schritt

Ausschließlich das WD-21C.8 Definition/Implementation Gate gegen den eingefrorenen C.7-Stand durchführen und daraus den exakt minimalen Implementierungsumfang und die tatsächlich notwendigen Integrationsstellen ableiten. Noch keine C.8-Codeimplementierung und keine weitere C.7-Änderung.
