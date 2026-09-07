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

Branch: `feature/wd-21a-sketch-topology-contract-element-foundation`  
Freeze-Dokumentation: `4014cf865049c66c20d756db608201fa599d0948`

A.1–A.4 sind vollständig abgeschlossen. Reale iPad-/Safari-Evidenz bestätigte `WD-21A.4`, Sketch-Bearbeitung, Speichern, Laden, Rückgängig und Wiederherstellen.

## WD-21B – Sketch Connectivity & Editing Integration

Aktiver Branch: `feature/wd-21b-sketch-connectivity-editing-integration`  
Basis: WD-21A FROZEN @ `4014cf865049c66c20d756db608201fa599d0948`

### WD-21B.1 – Existing Endpoint Selection & Connectivity Editing Inventory

**PASS / INVENTORY & CONTRACT COMPLETE / 0 IMPLEMENTATION**

Vorhandene Punkt-/Mehrfachauswahlpfade und der deterministische Connect-/Disconnect-Fachvertrag wurden festgelegt.

### WD-21B.2 – Deterministic Endpoint Connect Mutation Contract

**PASS / DEVICE VERIFIED / 0 BLOCKER**

Interner zentraler Connect-Contract ist implementiert und automatisiert sowie auf iPad/Safari regressiert. Keine sichtbare Connect-Bedienung.

### WD-21B.3 – Deterministic Endpoint Disconnect Mutation Contract

**PASS / DEVICE VERIFIED / 0 BLOCKER**

- interner zentraler `disconnectSketchLineFromPoint(sketchId, pointId, lineId)`-Contract;
- nur ein tatsächlich gemeinsam verwendeter Punkt mit mindestens zwei inzidenten Linien ist trennbar;
- ursprüngliche `pointId` bleibt bestehen;
- für die explizit ausgewählte Linie wird eine neue `pointId` mit identischer Koordinate erzeugt;
- nur die ausgewählte Linie wird umgehängt, ihre `lineId` bleibt unverändert;
- Validation, Transaction, History, Recompute und Events laufen über den zentralen Mutation-Owner;
- Undo/Redo stellt die ursprüngliche bzw. getrennte Identität exakt wieder her;
- keine sichtbare Disconnect-Bedienung;
- sichtbare Build-ID ist `WD-21B.3`.

Automatisierte Regression:

- Workflow: `WD-21B.3 Endpoint Disconnect Contract Regression`
- Run: `34149057090`
- Head: `3b09bc8f47f3a7849a14672e0f8e4664f9e3c613`
- A.2 Topology Regression: PASS
- A.3 Mutation Regression: PASS
- B.2 Connect Regression: PASS
- B.3 Disconnect Regression: PASS
- Result: **SUCCESS / PASS**

Reale iPad-/Safari-Evidenz vom 2026-09-07:

- Browser-Tab und Header konsistent `WD-21B.3`;
- Laden, Speichern und Neuladen funktionieren;
- Rückgängig und Wiederholen/Redo funktionieren;
- Sketch-Punkte lassen sich weiterhin verschieben;
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

WD-21B.3 ist abgeschlossen. Der nächste fachlich zulässige WD-21B-Teilblock muss separat definiert und autorisiert werden. Kein weiterer WD-21B-Schritt wird automatisch begonnen.
