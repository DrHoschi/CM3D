# CM3D – Projektstatus

Stand: 2026-09-07

## Aktueller Gesamtstand

Repository `DrHoschi/CM3D` ist die zentrale Projektbasis.

**CM3D V1 – COMPLETE / PASS / FROZEN**

Der vollständige V1-Pflichtkern wurde abgeschlossen und auf iPad/Safari praktisch geprüft. V1 bleibt eingefrorene Kompatibilitätsbasis für den V2-Ausbau.

## V2 – Foundation & Compatibility

RB-01 – Foundation & Compatibility ist vollständig abgeschlossen.

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

## WD-21A – aktueller Arbeitsstatus

Branch:

`feature/wd-21a-sketch-topology-contract-element-foundation`

Basis:

`main` @ `1edae185c6207db9d754c94d00d23cf10218c56c`

### WD-21A.1 – Existing Sketch Data/Topology Contract Inventory

**PASS / INVENTORY COMPLETE**

### WD-21A.2 – Unified Sketch Element & Topology Contract Foundation

**PASS / DEVICE VERIFIED / 0 BLOCKER**

- zentraler Sketch-Element-/Topologievertrag;
- `points`/`lines`, `pointId` und `lineId` bleiben kompatibel;
- gemeinsame `pointId` ist die einzige autoritative topologische Verbindung;
- Projektvalidierung, SelectionRef und StableReference nutzen den gemeinsamen Vertrag;
- sichtbare Build-Kennung auf realem iPad/Safari bestätigt.

### WD-21A.3 – Central Sketch Topology Mutation Contract

**PASS / DEVICE VERIFIED / 0 BLOCKER**

- zentraler Mutation-Owner `src/application/sketch-mutation.js`;
- validierte atomare Domain-Transaction-Grenze;
- deterministischer Recompute und Event-Pfad;
- Undo/Redo erhält logische IDs;
- reale iPad-/Safari-Prüfung für Mutation, Speichern, Laden, Undo und Redo PASS.

### WD-21A.4 – Foundation Integration & Contract Coverage Gate

**AUTOMATED PASS / DEVICE CHECK PENDING / WD-21A NOT YET FROZEN**

A.4 führt keine neue Benutzerfunktion ein, sondern regressiert A.1–A.3 als gemeinsamen Foundation-Vertrag.

Abgesichert:

- alle runtime-aktiven Sketch-Schreibmethoden sind dem zentralen Mutation-Owner zugeordnet;
- A.2- und A.3-Regression laufen gemeinsam;
- 0.2.0 Save/Load erhält Sketch-Topologie und exakte IDs;
- 0.1.0 → 0.2.0 Migration erhält Sketch-Topologie und IDs;
- StableReference/SelectionRef bleiben nach Editierung deterministisch;
- echte Löschung ergibt `MISSING`, ohne geometrisches Rebinding;
- Undo/Redo stellt exakt dieselben logischen IDs wieder her bzw. entfernt sie erneut;
- zentrale sichtbare Build-ID ist `WD-21A.4`.

Automatische Evidenz:

- Workflow: `WD-21A.4 Foundation Integration & Contract Coverage Gate`
- Run: `34100766621`
- Head: `9fa28338918b60ddd8561aba87bd0c6ebc2d99c3`
- Result: **SUCCESS / PASS**

Explizit nicht enthalten:

- Connect/Disconnect;
- Snap/Merge;
- Kreis/Bogen/Spline;
- Profile/Pfade;
- Profil-/Pfadreferenzen;
- Constraints;
- neue 3D-Features.

WD-21A bleibt bis zum realen iPad-/Safari-Abschluss von A.4 **nicht FROZEN**.

## Verbindliche Build-Kennungsregel

Bei jedem WD-Teilschritt müssen autoritative Build-ID, `document.title`, sichtbare Build-/Brand-Kennung und WD-/Projektstatusdokumentation konsistent sein. Eine widersprüchliche sichtbare Kennung ist ein **BLOCKER** und verhindert PASS/FROZEN.

## V2-Planungsgrundlagen

- `docs/06_v2_planning/V2_MASTER_PLAN.md`
- `docs/06_v2_planning/V2_FUNCTION_CATALOG.md`
- `docs/06_v2_planning/V2_ARCHITECTURE_DEPENDENCIES.md`
- `docs/06_v2_planning/V2_DEVELOPMENT_ROADMAP.md`
- `docs/06_v2_planning/V3_BACKLOG.md`

## Statuskennzeichnung

- `DRAFT` – in Bearbeitung
- `REVIEW` – fachlich zur Prüfung bereit
- `PASS` – festgelegte Prüfungen erfolgreich bestanden
- `FROZEN` – verbindlicher, getesteter Stand
- `APPROVED` – formell freigegebener Planungs-/Release-Stand
- `HOLD` – bewusst angehalten
- `ARCHIVED` – abgelöster historischer Stand

## Nächster zulässiger Schritt

Nur der reale iPad-/Safari-Abschlusscheck von WD-21A.4: Browser-Titel und sichtbares Build-Label müssen `WD-21A.4` zeigen; vorhandene Sketch-Grundfunktion, Speichern, Laden, Undo und Redo müssen unverändert funktionieren. Erst bei **PASS / 0 BLOCKER** darf WD-21A als Gesamtblock eingefroren werden. WD-21B wird nicht automatisch gestartet.
