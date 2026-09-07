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

Enthaltene Foundation-Blöcke:

- WD-20A – V2 Project Schema & Migration Foundation
- WD-20B – Unified SelectionRef Foundation
- WD-20C – Stable Reference + Invalid State
- WD-20D – Dependency Graph & Recompute
- WD-20E – Foundation Integration / RB-01 Gate

Die verbindlichen Architekturregeln bleiben aktiv:

- stabile logische Referenzen ohne stilles geometrisches Rebinding;
- deterministischer Recompute;
- sichtbare Zustände INVALID / UNRESOLVED / BLOCKED;
- zentrale Undo/Redo- und Domain-Transaction-Grenze.

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

Branch:

`feature/wd-21a-sketch-topology-contract-element-foundation`

Freeze-Dokumentation:

`4014cf865049c66c20d756db608201fa599d0948`

A.1–A.4 sind vollständig abgeschlossen. Reale iPad-/Safari-Evidenz bestätigte `WD-21A.4`, Sketch-Bearbeitung, Speichern, Laden, Rückgängig und Wiederherstellen.

## WD-21B – Sketch Connectivity & Editing Integration

Aktiver Branch:

`feature/wd-21b-sketch-connectivity-editing-integration`

Basis:

WD-21A FROZEN @ `4014cf865049c66c20d756db608201fa599d0948`

### WD-21B.1 – Existing Endpoint Selection & Connectivity Editing Inventory

**PASS / INVENTORY & CONTRACT COMPLETE / 0 IMPLEMENTATION**

Festgelegt wurden die vorhandenen Punkt-/Mehrfachauswahlpfade sowie der deterministische Connect-/Disconnect-Fachvertrag. B.1 hat keine Produktionsfunktion eingeführt.

### WD-21B.2 – Deterministic Endpoint Connect Mutation Contract

**PASS / DEVICE VERIFIED / 0 BLOCKER**

Umgesetzt:

- interner zentraler `connectSketchPoints(sketchId, survivorPointId, sourcePointId)`-Contract;
- Survivor behält ID und Koordinate;
- alle Source-Linien werden auf Survivor umgehängt;
- Source-Punkt wird danach entfernt;
- direkte Survivor↔Source-Linie wird wegen entstehender ungültiger Null-Topologie abgewiesen;
- StableReference auf Survivor bleibt `RESOLVED`, Source wird `MISSING`;
- kein geometrisches Rebinding;
- Undo/Redo stellt exakte IDs und Inzidenzen wieder her bzw. reproduziert den Connect;
- zentrale sichtbare Build-ID ist `WD-21B.2`;
- noch keine sichtbare Connect-Bedienung und noch kein Disconnect.

Automatisierte Regression:

- Workflow: `WD-21B.2 Endpoint Connect Contract Regression`
- Run: `34138362614`
- Head: `fbbab7b48fb8efc65dd0e20e150dececfd922627`
- A.2 Topology Regression: PASS
- A.3 Mutation Regression: PASS
- B.2 Endpoint Connect Regression: PASS
- Result: **SUCCESS / PASS**

Reale iPad-/Safari-Evidenz vom 2026-09-07:

- Browser-Tab und Header konsistent `WD-21B.2`;
- bestehende Sketch-Funktionen erhalten;
- Speichern, Laden, Rückgängig und Wiederherstellen erfolgreich;
- Ergebnis: **PASS / 0 BLOCKER**.

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

WD-21B.2 ist abgeschlossen. Der nächste fachlich zulässige Teilblock muss separat autorisiert werden. WD-21B.3 wird nicht automatisch begonnen.
