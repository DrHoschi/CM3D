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

Interner zentraler Connect-Contract ist implementiert, automatisiert regressiert und auf iPad/Safari bestätigt. Keine sichtbare Connect-Bedienung.

### WD-21B.3 – Deterministic Endpoint Disconnect Mutation Contract

**PASS / DEVICE VERIFIED / 0 BLOCKER**

Interner zentraler Disconnect-Contract ist implementiert, automatisiert regressiert und auf iPad/Safari bestätigt. Keine sichtbare Disconnect-Bedienung.

### WD-21B.4 – Connectivity Command & Selection Semantics Integration

**IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE BUILD-ID CHECK PENDING**

- neuer nicht sichtbarer Command-Layer `src/application/sketch-connectivity-commands.js`;
- exakt zwei Punkte derselben Skizze aktivieren Connect, sofern die B.2-Voraussetzungen erfüllt sind;
- Auswahlreihenfolge ist autoritativ: erster Punkt = Source, letzter/Primary Point = Survivor;
- erfolgreicher Connect normalisiert die Auswahl auf den Survivor;
- exakt ein gemeinsam verwendeter Punkt plus eine inzidente Linie derselben Skizze aktiviert Disconnect;
- erfolgreicher Disconnect normalisiert die Auswahl auf die weiterhin gültige Linie plus den neu erzeugten abgetrennten Punkt; der neue Punkt ist Primary;
- ungültige Auswahlkombinationen bleiben deaktiviert und erzeugen keine Mutation/History;
- keine geometrische Suche, kein Snap/Merge, keine Toleranz;
- keine sichtbare Connect-/Disconnect-Bedienung;
- sichtbare Build-ID ist `WD-21B.4`.

Automatisierte Regression:

- Workflow: `WD-21B.4 Connectivity Command & Selection Semantics Regression`
- Run: `34149960132`
- Head: `bc854825912b084d325a1ef535a54868a8428b7d`
- A.2 Topology Regression: PASS
- A.3 Mutation Regression: PASS
- B.2 Connect Regression: PASS
- B.3 Disconnect Regression: PASS
- B.4 Command/Selection Regression: PASS
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

Nur der reale iPad-/Safari-Abgleich für WD-21B.4: Browser-Titel und sichtbares Build-Label müssen konsistent `WD-21B.4` zeigen; vorhandene Sketch-Grundfunktionen, Speichern, Laden, Undo/Redo und Punktbearbeitung dürfen nicht regressiert sein. Da B.4 noch keinen sichtbaren Connectivity-Trigger besitzt, ist auf dem Gerät noch keine Connect-/Disconnect-Aktion zu testen. Erst danach kann WD-21B.4 auf PASS gesetzt werden. Kein weiterer WD-21B-Schritt wird automatisch begonnen.
