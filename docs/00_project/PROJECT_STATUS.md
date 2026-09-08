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

- generische Registry für `line`, `circle`, `arc`, `spline`;
- persistente Maps `circles`, `arcs`, `splines` in neuen Sketches;
- alte 0.2.0-/0.1.0-Sketches ohne neue Maps werden beim Laden deterministisch normalisiert;
- schemaVersion bleibt `0.2.0`;
- elementtypbezogene Validation für Circle, Arc und Spline;
- Circle ohne topologische Endpunkte;
- Arc/Spline mit echten `startPointId`/`endPointId`;
- keine Create/Edit/Delete-Mutationen der neuen Typen, keine sichtbaren Werkzeuge, kein Rendering, kein Inspector und keine Profile/Pfade;
- sichtbare Build-ID `WD-21C.2`.

Automatisierte Regression:

- Workflow: `WD-21C.2 Generic Sketch Element Registry Regression`
- Run: `34163981238`
- Head: `76a38bfe2929e5651d531e881233cccb904ba293`
- A.2: PASS
- A.3: PASS
- B.2 Connect: PASS
- B.3 Disconnect: PASS
- C.2 Registry/Persistence: PASS
- Result: **SUCCESS / PASS**

Reale iPad-/Safari-Evidenz vom 2026-09-08:

- Browser-Tab `CyberMotion 3D – WD-21C.2`: PASS.
- Header-/Build-Label `WD-21C.2`: PASS.
- normale Sketch-Bearbeitung: PASS.
- Verbinden/Trennen: PASS.
- Speichern/Laden: PASS.
- Undo/Redo: PASS.
- 0 BLOCKER.

WD-21C als Gesamtblock bleibt **nicht FROZEN**.

## Verbindliche Build-Kennungsregel

Bei jedem WD-Teilschritt müssen autoritative Build-ID, `document.title`, sichtbare Build-/Brand-Kennung und WD-/Projektstatusdokumentation konsistent sein. Eine widersprüchliche sichtbare Kennung ist ein **BLOCKER** und verhindert PASS/FROZEN.

## Nächster zulässiger Schritt

WD-21C.2 ist abgeschlossen. Der nächste WD-21C-Teilblock muss separat definiert und freigegeben werden. Noch kein weiterer C-Schritt automatisch beginnen.
