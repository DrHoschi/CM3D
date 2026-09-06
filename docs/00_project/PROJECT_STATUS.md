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

**PASS / DEVICE VERIFIED / 0 BLOCKER**

- zentraler Sketch-Element-/Topologievertrag;
- bestehende persistente `points`/`lines`-Struktur bleibt kompatibel;
- `pointId` und `lineId` bleiben erhalten;
- gemeinsame `pointId` ist die einzige autoritative topologische Endpunktverbindung;
- geometrisch identische Koordinaten allein erzeugen keine Topologie;
- Projektvalidierung nutzt den zentralen Sketch-Topology-Validator;
- SelectionRef und StableReference nutzen den generischen Sketch-Elementresolver;
- alte Linienreferenzen ohne Element-Subtyp bleiben kompatibel;
- sichtbare Build-Kennung zentralisiert und auf realem iPad/Safari bestätigt.

### WD-21A.3 – Central Sketch Topology Mutation Contract

**PASS / DEVICE VERIFIED / 0 BLOCKER**

- zentraler Mutation-Owner `src/application/sketch-mutation.js`;
- Sketch-Mutationen laufen über eine validierte atomare Domain-Transaction-Grenze;
- ungültige/dangling Topologie wird vollständig zurückgerollt;
- Connectivity bleibt ausschließlich über gemeinsame `pointId` definiert;
- Punkt-/Linienerzeugung, Editierung und Löschen nutzen den zentralen Vertrag;
- abhängiger Extrude-Recompute bleibt innerhalb der kontrollierten Mutation;
- Undo/Redo stellt logische Punkt-/Linien-IDs exakt wieder her;
- Delete-Ereignisfolge ist Commit → Auswahl leeren → `selectionChanged`.

Automatische Evidenz:

- Workflow: `WD-21A.3 Sketch Mutation Contract Regression`
- Run: `34061038460`
- Head: `6432e653fcede3f3f1f3ab0c796994c144909efd`
- Result: **SUCCESS / PASS**

Reale iPad-/Safari-Evidenz vom 2026-09-06:

- Browser-Titel und Header konsistent `WD-21A.3`;
- Aktualisierung/Mutation, Speichern, Laden, Rückgängig und Wiederherstellen erfolgreich;
- Ergebnis: **PASS / 0 BLOCKER**.

WD-21A als Gesamtblock ist damit noch **nicht FROZEN**. A.1–A.3 decken Inventar, Element-/Topologievertrag und zentralen Mutationspfad ab. Vor einem A.4 ist der verbleibende Foundation-Umfang gegen den RB-02-Vertrag zu bestimmen.

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

WD-21A.3 ist PASS / DEVICE VERIFIED / 0 BLOCKER. Als Nächstes ausschließlich den verbleibenden WD-21A-Foundation-Umfang gegen A.1–A.3 und RB-02 bestimmen. Ein eventuelles WD-21A.4 darf nur Foundation-Integration/Contract-Coverage schließen. WD-21B Connect/Disconnect, neue Sketch-Elementtypen und Profile/Pfade werden nicht vorgezogen.
