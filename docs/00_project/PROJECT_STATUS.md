# CM3D – Projektstatus

Stand: 2026-09-06

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

Die verbindlichen Architekturregeln R1/R2 bleiben aktiv:

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

Ein Folgeblock wird erst nach expliziter Freigabe begonnen.

## WD-21A – aktueller Arbeitsstatus

Branch:

`feature/wd-21a-sketch-topology-contract-element-foundation`

Basis:

`main` @ `1edae185c6207db9d754c94d00d23cf10218c56c`

### WD-21A.1 – Existing Sketch Data/Topology Contract Inventory

**PASS / INVENTORY COMPLETE**

### WD-21A.2 – Unified Sketch Element & Topology Contract Foundation

**IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE RELEASE NOT YET GRANTED**

Umgesetzt:

- zentraler Sketch-Element-/Topologievertrag;
- bestehende persistente `points`/`lines`-Struktur bleibt kompatibel;
- `pointId` und `lineId` bleiben erhalten;
- gemeinsame `pointId` ist die einzige autoritative topologische Endpunktverbindung;
- geometrisch identische Koordinaten allein erzeugen keine Topologie;
- Projektvalidierung nutzt den zentralen Sketch-Topology-Validator;
- SelectionRef und StableReference nutzen den generischen Sketch-Elementresolver;
- alte Linienreferenzen ohne Element-Subtyp bleiben kompatibel;
- sichtbare Build-Kennung wird zentral auf `WD-21A.2` gesetzt;
- automatischer WD-21A.2-Regressionsworkflow ist PASS.

Automatische Evidenz:

- Workflow: `WD-21A.2 Sketch Topology Contract Regression`
- Run: `34058462552`
- Result: **SUCCESS / PASS**

Noch nicht freigegeben bzw. nicht Bestandteil von WD-21A.2:

- Connect/Disconnect-Bedienung;
- Kreis/Bogen/Spline;
- Profile/Pfade;
- Profil-/Pfadreferenzen;
- neue 3D-Featurefunktionen;
- Constraints.

## Verbindliche Build-Kennungsregel

Bei jedem WD-Teilschritt müssen folgende sichtbaren bzw. dokumentierten Kennungen konsistent sein:

1. autoritative Build-ID;
2. `document.title`;
3. sichtbare Build-/Brand-Kennung;
4. WD-/Projektstatusdokumentation.

Eine widersprüchliche sichtbare Kennung ist ein **BLOCKER** und verhindert PASS/FROZEN. Historische installer-lokale Kennungszuweisungen dürfen keine release-autoritative Wirkung haben.

## V2-Planungsgrundlagen

Verbindliche Planungsdokumente:

- `docs/06_v2_planning/V2_MASTER_PLAN.md`
- `docs/06_v2_planning/V2_FUNCTION_CATALOG.md`
- `docs/06_v2_planning/V2_ARCHITECTURE_DEPENDENCIES.md`
- `docs/06_v2_planning/V2_DEVELOPMENT_ROADMAP.md`
- `docs/06_v2_planning/V3_BACKLOG.md`

Die aktualisierte Funktionsmatrix V0.2 und die Hauptfenster-/Programmstruktur V0.2 bleiben fachliche Quellen; ältere Statuszeilen darin sind historische Planungsstände und überschreiben nicht den aktuellen Repository-Status.

## Statuskennzeichnung

- `DRAFT` – in Bearbeitung
- `REVIEW` – fachlich zur Prüfung bereit
- `PASS` – festgelegte Prüfungen erfolgreich bestanden
- `FROZEN` – verbindlicher, getesteter Stand; Änderungen nur kontrolliert über Folgeblock oder konkrete Regression
- `APPROVED` – formell freigegebener Planungs-/Release-Stand
- `HOLD` – bewusst angehalten
- `ARCHIVED` – abgelöster historischer Stand

## Nächster zulässiger Schritt

WD-21A.2 gegen den eingefrorenen `main`-Stand regressieren und die sichtbare Kennung im realen Browser prüfen. Erst bei konsistentem Ergebnis kann WD-21A.2 freigegeben werden. WD-21A.3 bzw. WD-21B wird nicht automatisch gestartet.
