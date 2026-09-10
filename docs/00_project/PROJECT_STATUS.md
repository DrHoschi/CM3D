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

**PASS / FROZEN / 0 BLOCKER**

Reconciliation-Basis: eingefrorener C.7-Stand `feaee19c72977a98dc86090a99e57162aa27a0cc`.

Der fachliche C.8-Minimalumfang bleibt: atomare Spline-Creation, stabile Endpoint-/Control-IDs, geordnete Bézier-/de-Casteljau-Semantik, abgeleitete Tessellation, sichtbares Spline-Werkzeug, Tree-/Viewer-Auswahl, Inspector und Wiederverwendung der eingefrorenen C.6-Connectivity ausschließlich für Start/Ende.

#### WD-21C.8-R1 – Sketch Element Selection Synchronization Correction

R1 stellte die generische konkrete Sketch-Element-Synchronisation für Object Tree und Viewer her. Der reale Gerätecheck zeigte danach noch einen verbleibenden Kamera-Ausrichtungsblocker für Tree → Arc/Spline. Die Diagnose bestätigte, dass Arc/Spline nicht an der SelectionRef-/Runtime-Identitätsgrenze verloren gingen, sondern dass die automatische Kameraausrichtung an die Gizmo-Manipulationsfähigkeit gekoppelt war.

#### WD-21C.8-R2 – Generic Sketch Selection Camera Alignment Decoupling Correction

Finaler sichtbarer Korrekturstand: `WD-21C.8-R2`.

R2 trennt Selection/Focus von Gizmo-Manipulation. `point`, `line`, `circle` behalten ihr bestehendes Gizmo-Verhalten; `arc` und `spline` werden über die vorhandene `runtime.focusSelection()`-Autorität konkret fokussiert, erhalten aber weiterhin keinen Manipulationsadapter, kein Gizmo und keinen Drag. `manipulationKinds` bleibt `point`, `line`, `circle`.

Geprüfter Produkt-/Test-Head: `fe20a2b6b149595b2ffe57a3838da655dfe8b24d`.

Completion-/Regression-Audit:

- Diff gegen C.7-Freeze `feaee19c72977a98dc86090a99e57162aa27a0cc`: **28 Commits voraus / 0 zurück**; Gesamtumfang entspricht C.8 plus kontrolliertem R1/R2;
- Diff gegen dokumentierten C.8-R1-Ausgang `47d98f67afc9d4edb1cbec37d70cda3642de5a1a`: **5 Commits voraus / 0 zurück**;
- R2-Produktänderung ist auf `src/ui/sketch-gizmo.js` plus zentrale Build-ID in `src/main.js` begrenzt; zusätzlich nur R2-Test/Workflow und R1-Test-Forward-Compatibility;
- `WD-21C.8-R2 Selection Camera Alignment Regression`, Run `34510128236`: **SUCCESS** und bestätigt A.2, A.3, B.2, B.3, C.2–C.8, R1 und R2;
- bestehender R1-Workflow auf demselben Head, Run `34510128178`: **SUCCESS**.

Realer iPad-/Safari-Test auf `WD-21C.8-R2`: **PASS**. Bestätigt sind konsistente Tab/Header-Build-ID, Point-/Line-Fokus und Gizmo, Circle-Fokus und Gizmo sowie Arc-/Spline-Fokus aus dem Object Tree ohne Arc-/Spline-Gizmo.

Damit gilt für WD-21C.8-R2: **PASS / FROZEN / 0 BLOCKER**.

Explizit ausgeschlossen und weiterhin später bleiben geschlossene Splines, nachträgliches Hinzufügen/Löschen/Umsortieren von Controls, sichtbare Spline-Control-Handles/Control-Drag, Spline-Gizmo, Tangentialität/Continuity-Constraints, alternative Kurventypen, Snap/Auto-Merge/Tolerance/geometrisches Rebinding, Profile/Pfade, N-Gon und Extrusionsintegration.

WD-21C ist fachlich bis einschließlich C.8 abgeschlossen. Ein nachfolgender WD-Teilblock wird mit diesem Freeze nicht begonnen.

## Verbindliche Build-Kennungsregel

Bei jedem WD-Teilschritt müssen autoritative Build-ID, `document.title`, sichtbare Build-/Brand-Kennung und WD-/Projektstatusdokumentation konsistent sein. Eine widersprüchliche sichtbare Kennung ist ein **BLOCKER** und verhindert PASS/FROZEN.

Korrekturläufe innerhalb desselben WD-Teilschritts dürfen eine sichtbare Revisionskennung `-R1`, `-R2`, … tragen. Diese Kennung muss ebenfalls in Browser-Tab und Header konsistent sichtbar sein und wird von den Build-Gates akzeptiert.

## Nächster zulässiger Schritt

Kein nächster WD-Teilblock innerhalb dieses Completion-/Freeze-Gates. Ein Folgeschritt muss separat ausdrücklich freigegeben werden.
