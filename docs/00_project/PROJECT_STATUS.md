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
Basis: WD-21A FROZEN @ `4014cf865049c66c20d756db608201fa599d0948`

Abgeschlossene Teilblöcke:

- WD-21B.1 – Existing Endpoint Selection & Connectivity Editing Inventory — PASS / INVENTORY COMPLETE
- WD-21B.2 – Deterministic Endpoint Connect Mutation Contract — PASS / DEVICE VERIFIED / 0 BLOCKER
- WD-21B.3 – Deterministic Endpoint Disconnect Mutation Contract — PASS / DEVICE VERIFIED / 0 BLOCKER
- WD-21B.4 – Connectivity Command & Selection Semantics Integration — PASS / DEVICE VERIFIED / 0 BLOCKER
- WD-21B.5 – Visible Connectivity Actions & Availability Integration — PASS / DEVICE VERIFIED / 0 BLOCKER

Reale iPad-/Safari-Evidenz bestätigte die sichtbare Build-Identität `WD-21B.5`, Connect/Disconnect sowie die geprüften Bestandsfunktionen ohne Blocker.

### WD-21B Completion / Regression / Freeze Gate

- Workflow: `WD-21B Completion Regression Freeze Gate`
- Run: `34158722819`
- getesteter Head: `50e907bb4993fb0885ef73e8d3ebcd93f21fb732`
- Branch-Boundary gegen WD-21A: PASS
- WD-21A.2 Topology Foundation: PASS
- WD-21A.3 Central Mutation Foundation: PASS
- WD-21B.2 Connect: PASS
- WD-21B.3 Disconnect: PASS
- WD-21B.4 Command/Selection: PASS
- WD-21B.5 Visible Actions: PASS
- Build-Identity `WD-21B.5`: PASS
- Ergebnis: **SUCCESS / PASS / 0 BLOCKER**

Der vollständige Branch-Diff gegen WD-21A blieb auf die autorisierte Sketch-Connectivity-/Editing-Grenze, zugehörige Tests/Workflows und Statusdokumentation beschränkt. Keine WD-21C-Funktion, keine neuen Sketch-Elementtypen und keine Profile/Pfade wurden vorgezogen.

WD-21B ist damit eingefroren. Änderungen erfolgen nur noch über ausdrücklich autorisierte Folgeblöcke oder konkrete Regressionen.

## Verbindliche Build-Kennungsregel

Bei jedem WD-Teilschritt müssen autoritative Build-ID, `document.title`, sichtbare Build-/Brand-Kennung und WD-/Projektstatusdokumentation konsistent sein. Eine widersprüchliche sichtbare Kennung ist ein **BLOCKER** und verhindert PASS/FROZEN.

## V2-Planungsgrundlagen

- `docs/06_v2_planning/V2_MASTER_PLAN.md`
- `docs/06_v2_planning/V2_FUNCTION_CATALOG.md`
- `docs/06_v2_planning/V2_ARCHITECTURE_DEPENDENCIES.md`
- `docs/06_v2_planning/V2_DEVELOPMENT_ROADMAP.md`
- `docs/06_v2_planning/V3_BACKLOG.md`

## Nächster zulässiger Schritt

Der nächste fachlich zulässige Roadmapblock ist **WD-21C – Sketch Element Type Expansion**. WD-21C wird nicht automatisch begonnen und muss separat definiert und autorisiert werden.
