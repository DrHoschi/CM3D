# CM3D – Projektstatus

Stand: 2026-09-07

## Aktueller Gesamtstand

Repository `DrHoschi/CM3D` ist die zentrale Projektbasis.

**CM3D V1 – COMPLETE / PASS / FROZEN**

Der vollständige V1-Pflichtkern wurde abgeschlossen und auf iPad/Safari praktisch geprüft. V1 bleibt eingefrorene Kompatibilitätsbasis für den V2-Ausbau.

## V2 – Foundation & Compatibility

**RB-01 – PASS / FROZEN**

Freigegebener `main`-Stand nach Abschlussdokumentation:

`1edae185c6207db9d754c94d00d23cf10218c56c`

Die verbindlichen Architekturregeln bleiben aktiv: stabile logische Referenzen ohne stilles geometrisches Rebinding, deterministischer Recompute, sichtbare INVALID/UNRESOLVED/BLOCKED-Zustände sowie zentrale Undo/Redo- und Domain-Transaction-Grenze.

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

Branch: `feature/wd-21a-sketch-topology-contract-element-foundation`  
Freeze-Dokumentation: `4014cf865049c66c20d756db608201fa599d0948`

## WD-21B – Sketch Connectivity & Editing Integration

**PASS / FROZEN / 0 BLOCKER**

Branch: `feature/wd-21b-sketch-connectivity-editing-integration`  
Freeze-Dokumentation: `2e8d5b0434e62bf7c7e34b11e54da077853328cc`

WD-21B.1–B.5 sind abgeschlossen. Das Completion-/Regression-/Freeze-Gate war **SUCCESS / PASS / 0 BLOCKER**; reale iPad-/Safari-Evidenz bestätigte `WD-21B.5`, Connect/Disconnect und die geprüften Bestandsfunktionen.

## WD-21C – Sketch Element Type Expansion

Aktiver Branch: `feature/wd-21c-sketch-element-type-expansion`  
Basis: WD-21B FROZEN @ `2e8d5b0434e62bf7c7e34b11e54da077853328cc`

### WD-21C.1 – Existing Sketch Element Type & Creation/Editing Inventory

**PASS / INVENTORY & CONTRACT COMPLETE / 0 ELEMENT IMPLEMENTATION**

Inventar-Ergebnis:

- bestehender `LINE`-Vertrag ist bei Topology/SelectionRef/StableReference bereits teilweise generalisiert;
- Datenmodell, zentrale Mutationen, Viewer, Tree, Inspector, Sketch-Input und Profilableitung sind weiterhin linienzentriert;
- WD-21C erweitert den Elementvertrag später um `CIRCLE`, `ARC` und `SPLINE`;
- Circle: stabile `circleId`, Mittelpunkt + Radius, keine topologischen Endpunkte;
- Arc: stabile `arcId`, `startPointId`/`endPointId` als echte topologische Endpunkte, zusätzlicher geometrischer Controlpunkt ohne Connectivity-Rolle;
- Spline: stabile `splineId`, `startPointId`/`endPointId` als echte topologische Endpunkte sowie stabile Interior-Control-IDs ohne Connectivity-Rolle;
- SelectionRef/StableReference bleiben auf `SKETCH_ELEMENT` + `subTargetId=<kind>`;
- Profil-/Pfadableitung bleibt bis WD-21D ausdrücklich unverändert;
- kein automatisches Snap/Merge und keine Toleranzsuche werden in C.1 eingeführt.

Sichtbare Build-ID wurde zur eindeutigen C.1-Kennung auf `WD-21C.1` fortgeschrieben. Circle/Arc/Spline selbst sind weiterhin **nicht implementiert**.

WD-21C als Gesamtblock ist **nicht FROZEN**.

## Verbindliche Build-Kennungsregel

Bei jedem WD-Teilschritt müssen autoritative Build-ID, `document.title`, sichtbare Build-/Brand-Kennung und WD-/Projektstatusdokumentation konsistent sein. Eine widersprüchliche sichtbare Kennung ist ein **BLOCKER** und verhindert PASS/FROZEN.

## V2-Planungsgrundlagen

- `docs/06_v2_planning/V2_MASTER_PLAN.md`
- `docs/06_v2_planning/V2_FUNCTION_CATALOG.md`
- `docs/06_v2_planning/V2_ARCHITECTURE_DEPENDENCIES.md`
- `docs/06_v2_planning/V2_DEVELOPMENT_ROADMAP.md`
- `docs/06_v2_planning/V3_BACKLOG.md`

## Nächster zulässiger Schritt

Der nächste Teilblock muss separat autorisiert werden. Sinnvoll ist **WD-21C.2 – Generic Sketch Element Registry & Persistence Foundation**: ausschließlich Daten-/Registry-/Validation-Grundlage für Circle, Arc und Spline; noch keine sichtbare Erstellung, kein Viewer-Rendering, keine Inspector-Bedienung und keine Profile/Pfade.
