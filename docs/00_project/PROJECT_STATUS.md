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

- zentrale Create/Edit/Delete-Grundlage für Circle, Arc und Spline über `runSketchMutation(...)`;
- atomare Validation/History-Grenze;
- stabile Element-IDs und stabile Spline-Control-IDs;
- analytische Sketch-Identität bleibt von späterer Tessellierung getrennt;
- keine feste Segmentzahl in der persistierten Elementidentität;
- keine sichtbare Circle-/Arc-/Spline-Bedienung in C.3;
- reale iPad-/Safari-Evidenz bestätigte `WD-21C.3` und die Bestandsregression.

### WD-21C.4 – Circle Creation, Rendering & Editing Integration

**PASS / FROZEN / 0 BLOCKER**

Finaler sichtbarer Korrekturstand: `WD-21C.4-R1`.

- sichtbarer Sketch-Toolbutton `Kreis`;
- zweistufiger Input: Mittelpunkt setzen, Radius mit zweitem Punkt bestimmen;
- Circle-Erzeugung und -Änderung ausschließlich über den zentralen C.3-Mutationsvertrag;
- persistente analytische Identität bleibt `{ circleId, center, radius }`;
- Mittelpunkt bleibt geometrischer Parameter und ist kein topologischer `pointId`;
- Viewer stellt den Circle über abgeleitete temporäre Rendersegmente dar; diese werden nicht persistiert und nicht zu Sketch-Linien;
- Circle ist im Viewer und Objektbaum als ein `SKETCH_ELEMENT` auswählbar;
- Inspector erlaubt Mittelpunkt X/Y und Radius zu ändern;
- Delete, Undo/Redo und Save/Load bleiben über die bestehende zentrale C.3-Grundlage abgesichert;
- keine sichtbare Arc-/Spline-Integration, kein N-Gon, keine Profile/Pfade und keine Circle-Extrusion in C.4;
- sichtbare Build-ID, Browser-Tab und Header sind konsistent `WD-21C.4-R1`.

Completion-/Regression-Evidenz:

- Workflow: `WD-21C.4 Circle Integration Regression`
- Run: `34273576840`
- Head: `a2ad3035a877170983a51f5d70294ff566a0c511`
- A.2: PASS
- A.3: PASS
- B.2 Connect: PASS
- B.3 Disconnect: PASS
- C.2 Registry/Persistence: PASS
- C.3 Generic Mutation: PASS
- C.4 Circle Integration: PASS
- Result: **SUCCESS / PASS**

Reale iPad-/Safari-Evidenz `WD-21C.4-R1`:

- Browser-Tab und Header: PASS;
- Circle-Erzeugung/Darstellung: PASS;
- Auswahl im Objektbaum: PASS;
- Auswahl im Viewer: PASS;
- Circle-Inspector: PASS;
- Mittelpunkt X/Y und Radius editierbar: PASS;
- 0 BLOCKER.

Dokumentierter nachfolgender Integrationsbedarf, kein C.4-Blocker: Im Gegensatz zu bestehenden Line-/Point-Skizzenelementen ist der analytische Circle noch nicht an eine direkte Circle-Drag-/Transform-Gizmo-Manipulation auf der Skizze angeschlossen. Seine fachliche Position ist in C.4 bereits über Mittelpunkt X/Y editierbar. Die direkte Gizmo-/Transform-Integration wird separat behandelt.

WD-21C als Gesamtblock bleibt **nicht FROZEN**.

## Verbindliche Build-Kennungsregel

Bei jedem WD-Teilschritt müssen autoritative Build-ID, `document.title`, sichtbare Build-/Brand-Kennung und WD-/Projektstatusdokumentation konsistent sein. Eine widersprüchliche sichtbare Kennung ist ein **BLOCKER** und verhindert PASS/FROZEN.

Korrekturläufe innerhalb desselben WD-Teilschritts dürfen eine sichtbare Revisionskennung `-R1`, `-R2`, … tragen. Diese Kennung muss ebenfalls in Browser-Tab und Header konsistent sichtbar sein und wird von den Build-Gates akzeptiert.

## Nächster zulässiger Schritt

WD-21C.4 ist abgeschlossen und eingefroren. Ausschließlich den nächsten kleinen WD-21C-Teilblock fachlich definieren und separat freigeben. Noch keine Arc-/Spline-Implementierung und keine Circle-Transform-Erweiterung im selben Schritt.
