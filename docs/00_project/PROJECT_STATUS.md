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

Aktiver Branch: `feature/wd-21b-sketch-connectivity-editing-integration`  
Basis: WD-21A FROZEN @ `4014cf865049c66c20d756db608201fa599d0948`

### WD-21B.1 – Existing Endpoint Selection & Connectivity Editing Inventory

**PASS / INVENTORY & CONTRACT COMPLETE / 0 IMPLEMENTATION**

### WD-21B.2 – Deterministic Endpoint Connect Mutation Contract

**PASS / DEVICE VERIFIED / 0 BLOCKER**

### WD-21B.3 – Deterministic Endpoint Disconnect Mutation Contract

**PASS / DEVICE VERIFIED / 0 BLOCKER**

### WD-21B.4 – Connectivity Command & Selection Semantics Integration

**PASS / DEVICE VERIFIED / 0 BLOCKER**

Reale iPad-/Safari-Evidenz bestätigte `WD-21B.4` sowie Speichern, Laden, Undo/Redo und Punktbearbeitung ohne Regression.

### WD-21B.5 – Visible Connectivity Actions & Availability Integration

**IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE FUNCTION CHECK PENDING**

- sichtbare Aktionen `Verbinden` und `Trennen` im Sketch-Kontextbalken;
- UI konsumiert ausschließlich die B.4-Commands;
- `Verbinden` nur bei exakt gültiger Zwei-Punkt-Auswahl;
- `Trennen` nur bei gültigem gemeinsamem Punkt + inzidenter Linie;
- sonst bleiben die Aktionen deaktiviert;
- keine direkte Mutation aus der UI;
- kein Snap/Merge, keine Toleranz und keine geometrische Suche;
- sichtbare Build-ID ist `WD-21B.5`.

Automatisierte Regression:

- Workflow: `WD-21B.5 Visible Connectivity Actions Regression`
- Run: `34155743925`
- Head: `b1a234aa46aa6f81e9014528672a45172c514304`
- A.2 Topology Regression: PASS
- A.3 Mutation Regression: PASS
- B.2 Connect Regression: PASS
- B.3 Disconnect Regression: PASS
- B.4 Command/Selection Regression: PASS
- B.5 Visible Action Regression: PASS
- Result: **SUCCESS / PASS**

WD-21B als Gesamtblock bleibt **nicht FROZEN**.

## Verbindliche Build-Kennungsregel

Bei jedem WD-Teilschritt müssen autoritative Build-ID, `document.title`, sichtbare Build-/Brand-Kennung und WD-/Projektstatusdokumentation konsistent sein. Eine widersprüchliche sichtbare Kennung ist ein **BLOCKER** und verhindert PASS/FROZEN.

## V2-Planungsgrundlagen

- `docs/06_v2_planning/V2_MASTER_PLAN.md`
- `docs/06_v2_planning/V2_FUNCTION_CATALOG.md`
- `docs/06_v2_planning/V2_ARCHITECTURE_DEPENDENCIES.md`
- `docs/06_v2_planning/V2_DEVELOPMENT_ROADMAP.md`
- `docs/06_v2_planning/V3_BACKLOG.md`

## Nächster zulässiger Schritt

Nur der reale iPad-/Safari-Abgleich für WD-21B.5: Browser-Titel und sichtbares Build-Label müssen konsistent `WD-21B.5` zeigen. Danach müssen die sichtbaren Aktionen erstmals funktional geprüft werden: zwei gültig ausgewählte Punkte → `Verbinden`; gemeinsamer Punkt + inzidente Linie → `Trennen`. Anschließend Undo/Redo sowie Speichern/Laden regressieren. Erst bei **PASS / 0 BLOCKER** darf B.5 abgeschlossen werden. Kein weiterer WD-21B-Schritt wird automatisch begonnen.
