# CM3D – Projektstatus

Stand: 2026-09-08

## Aktueller Gesamtstand

Repository `DrHoschi/CM3D` ist die zentrale Projektbasis.

**CM3D V1 – COMPLETE / PASS / FROZEN**

## V2 – Foundation & Compatibility

**RB-01 – PASS / FROZEN**

Freigegebener `main`-Stand nach Abschlussdokumentation:

`1edae185c6207db9d754c94d00d23cf10218c56c`

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

Freeze-Dokumentation: `4014cf865049c66c20d756db608201fa599d0948`

## WD-21B – Sketch Connectivity & Editing Integration

**PASS / FROZEN / 0 BLOCKER**

Freeze-Dokumentation: `2e8d5b0434e62bf7c7e34b11e54da077853328cc`

## WD-21C – Sketch Element Type Expansion

Aktiver Branch: `feature/wd-21c-sketch-element-type-expansion`  
Basis: WD-21B FROZEN @ `2e8d5b0434e62bf7c7e34b11e54da077853328cc`

### WD-21C.1 – Existing Sketch Element Type & Creation/Editing Inventory

**PASS / INVENTORY & CONTRACT COMPLETE / 0 ELEMENT IMPLEMENTATION**

### WD-21C.2 – Generic Sketch Element Registry & Persistence Foundation

**PASS / DEVICE VERIFIED / 0 BLOCKER**

Registry, Persistenz und Validation für `line`, `circle`, `arc`, `spline` sind vorhanden. Reale iPad-/Safari-Evidenz bestätigte Build-ID und Bestandsregression.

### WD-21C.3 – Generic Sketch Element Mutation Contract + Analytic Geometry ↔ Derived Tessellation Boundary

**PASS / DEVICE VERIFIED / 0 BLOCKER**

Zentrale Create/Edit/Delete-Grundlage für Circle, Arc und Spline über `runSketchMutation(...)`; analytische Sketch-Identität bleibt von abgeleiteter Tessellierung getrennt.

### WD-21C.4 – Circle Creation, Rendering & Editing Integration

**PASS / FROZEN / 0 BLOCKER**

Finaler sichtbarer Korrekturstand: `WD-21C.4-R1`. Circle-Erzeugung, Rendering, Viewer-/Baumauswahl und Inspector-Edit sind auf realem iPad/Safari bestätigt. Completion-Regression Run `34273576840`: SUCCESS.

### WD-21C.5 – Generic Sketch Element Manipulation Contract

**IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE CHECK PENDING**

Implementierter Minimalumfang:

- typbezogener Sketch-Gizmo-Manipulationsadapter für `point`, `line`, `circle`;
- Circle-Gizmo-Anker = autoritativer `circle.center`;
- Circle-Move ändert ausschließlich `center.x/y`, nicht `circleId` oder `radius`;
- Point-/Line-Verhalten bleibt funktional erhalten;
- Preview wird vor dem finalen Commit auf den Ausgangszustand zurückgesetzt;
- Pointer-up → genau ein zentraler `runSketchMutation(...)`-Commit / ein History-Schritt;
- Pointer-Cancel → vollständige Wiederherstellung ohne Commit;
- Translate-Snap bleibt erhalten, ohne neue Connect-/Merge-/Tolerance-/Rebinding-Semantik;
- lokale historische `WD-12B`-Build-Zuweisung aus `sketch-gizmo.js` entfernt;
- zentrale sichtbare Build-ID ist `WD-21C.5`;
- keine gemischte Circle+Line-/Point-Multiselection-Erweiterung;
- keine Circle-Radius-/Rotate-/Scale-Manipulation;
- keine Arc-/Spline-Funktion.

Automatisierte Regression:

- Workflow: `WD-21C.5 Generic Sketch Manipulation Regression`
- Run: `34277682889`
- Head: `929143091ff6698fb0248a8f9eb02da367ee2326`
- A.2, A.3, B.2, B.3, C.2, C.3, C.4, C.5: PASS
- Result: **SUCCESS / PASS**

WD-21C.5 ist noch **nicht FROZEN**, bis die reale iPad-/Safari-Evidenz vorliegt. WD-21C als Gesamtblock bleibt **nicht FROZEN**.

## Verbindliche Build-Kennungsregel

Bei jedem WD-Teilschritt müssen autoritative Build-ID, `document.title`, sichtbare Build-/Brand-Kennung und WD-/Projektstatusdokumentation konsistent sein. Eine widersprüchliche sichtbare Kennung ist ein **BLOCKER** und verhindert PASS/FROZEN.

Korrekturläufe innerhalb desselben WD-Teilschritts dürfen eine sichtbare Revisionskennung `-R1`, `-R2`, … tragen. Diese Kennung muss ebenfalls in Browser-Tab und Header konsistent sichtbar sein und wird von den Build-Gates akzeptiert.

## Nächster zulässiger Schritt

Ausschließlich der reale iPad-/Safari-Gerätecheck für `WD-21C.5`: Tab/Header `WD-21C.5`, bestehende Point-/Line-Gizmo-Manipulation regressieren, Circle auswählen und direkt per Gizmo verschieben, Radius unverändert prüfen, danach Undo/Redo sowie kurzer Save/Load- und Connect/Disconnect-Bestandscheck. Noch keine Arc-/Spline-Funktion.
