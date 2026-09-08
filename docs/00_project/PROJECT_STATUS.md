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

**IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE CHECK PENDING**

- sichtbarer Sketch-Toolbutton `Kreis`;
- zweistufiger Input: Mittelpunkt setzen, Radius mit zweitem Punkt bestimmen;
- Circle-Erzeugung und -Änderung ausschließlich über den zentralen C.3-Mutationsvertrag;
- persistente analytische Identität bleibt `{ circleId, center, radius }`;
- Mittelpunkt bleibt geometrischer Parameter und ist kein topologischer `pointId`;
- Viewer stellt den Circle über abgeleitete temporäre Rendersegmente dar; diese werden nicht persistiert und nicht zu Sketch-Linien;
- Circle kann im Viewer als ein `SKETCH_ELEMENT` ausgewählt werden;
- Objektbaum zeigt `Kreise (N)` und einzelne Kreise;
- Inspector erlaubt Mittelpunkt X/Y und Radius zu ändern;
- Delete, Undo/Redo und Save/Load laufen über die bestehende zentrale Grundlage;
- keine sichtbare Arc-/Spline-Integration, kein N-Gon, keine Profile/Pfade und keine Circle-Extrusion in C.4;
- sichtbare Build-ID ist `WD-21C.4`.

Automatisierte Regression:

- Workflow: `WD-21C.4 Circle Integration Regression`
- Run: `34266145061`
- Head: `efef9ecbdc8f53d28ea42a3386527623bea8ce51`
- A.2: PASS
- A.3: PASS
- B.2 Connect: PASS
- B.3 Disconnect: PASS
- C.2 Registry/Persistence: PASS
- C.3 Generic Mutation: PASS
- C.4 Circle Integration: PASS
- Result: **SUCCESS / PASS**

WD-21C als Gesamtblock bleibt **nicht FROZEN**.

## Verbindliche Build-Kennungsregel

Bei jedem WD-Teilschritt müssen autoritative Build-ID, `document.title`, sichtbare Build-/Brand-Kennung und WD-/Projektstatusdokumentation konsistent sein. Eine widersprüchliche sichtbare Kennung ist ein **BLOCKER** und verhindert PASS/FROZEN.

## Nächster zulässiger Schritt

Ausschließlich der reale iPad-/Safari-Check für `WD-21C.4`: Browser-Tab und Header müssen `WD-21C.4` zeigen. Kreis im Sketch-Kontext erzeugen, Viewer-/Baum-Auswahl, Inspector-Edit von Mittelpunkt/Radius, Delete/Undo/Redo und Speichern/Laden prüfen; anschließend Bestands-Sketching sowie Connect/Disconnect kurz regressieren. Kein weiterer C-Schritt vor PASS / 0 BLOCKER.
