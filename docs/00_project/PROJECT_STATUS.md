# CM3D – Projektstatus

Stand: 2026-08-27

## Aktueller Stand

Repository `DrHoschi/CM3D` ist als zentrale Projektbasis eingerichtet.

Die drei Ausgangsquellen wurden fachlich erfasst und gegeneinander geprüft:

- Hauptfenster-Dokumentation V0.1
- Funktionsmatrix V0.1
- vollständiges Icon-Paket V3

AL-01 bis AL-06 wurden entschieden. Der Cross-Check ist PASS und es bestehen **0 offene Baseline-Blocker**.

## Verbindlicher Dokumentationsstand

**CM3D V0.1 BASELINE – FROZEN**

Verbindliche harmonisierte Funktionsquelle:

`docs/03_functional-spec/CM3D_MASTER_FUNCTIONS_V0_1.md`

Die ursprünglichen Quellabschriften bleiben als historische Ausgangsstände erhalten und werden nicht rückwirkend umgeschrieben.

## Entwicklungsreihenfolge ab Baseline

### WD-01 – Technisches Fundament & Datenmodell

WD-01 ist der nächste verbindliche Entwicklungsblock und wird **vor dem ersten eigentlichen Web-Prototyp** abgeschlossen.

Zu entscheiden sind:

1. Projektstruktur und Projektdatei
2. SceneGraph und eindeutige Objekt-IDs
3. Objektarten: Primitive, Sketch, Group, Assembly, Camera, Light usw.
4. Parent-/Child-Hierarchie
5. Position, Rotation und Scale
6. Welt- gegenüber Objektkoordinaten
7. internes Einheitensystem und mm/cm/m/km-Anzeige
8. Materialzuordnung
9. Selection-State
10. Undo/Redo-Grundprinzip
11. Save/Load und Versionsschema
12. Trennung Datenmodell ↔ Three.js ↔ Benutzeroberfläche

Verbindliches WD-01-Dokument:

`docs/04_architecture/WD-01_TECHNISCHES_FUNDAMENT_DATENMODELL.md`

### WD-02 / P0.1 – erster End-to-End-Web-Prototyp

Der bisher als **P0.1 Minimal-Prototyp** bezeichnete Funktionskern wird eindeutig dem Entwicklungsblock **WD-02** zugeordnet.

Zielkette:

- Hauptfenster öffnen
- 3D-Viewport
- Würfel/Quader erzeugen
- im Objektbaum anzeigen
- auswählen
- Position/Rotation/Skalierung verändern
- speichern
- Browser neu laden
- Projekt laden
- derselbe Würfel mit korrekter Identität, Hierarchie und Transform ist wieder vorhanden
- Icon-Paket im UI eingebunden

Damit gilt:

**P0.1 = WD-02 End-to-End-Prototyp.**

WD-01 ist die notwendige Architekturvorstufe.

### V1 – Pflichtkern

Der vollständige erste belastbare Designer-Kern gemäß Master-Funktionsliste. WD-02/P0.1 ist ausdrücklich nur eine kleine, durchgängige Teilmenge davon.

## Statuskennzeichnung

- `DRAFT` – in Bearbeitung
- `REVIEW` – fachlich zur Prüfung bereit
- `FROZEN` – verbindliche Baseline; Änderungen nur kontrolliert über neue Revision/Entscheidung
- `APPROVED` – formell freigegebener Folge-/Release-Stand
- `ARCHIVED` – abgelöster historischer Stand

Aktueller Gesamtstatus: **FROZEN / CM3D V0.1 BASELINE**

## Nächster Entwicklungsblock

**WD-01 – Technisches Fundament & Datenmodell.**

Erst nach Abschluss von WD-01 beginnt **WD-02 / P0.1** als erster echter Web-Prototyp.

Verbindliche Reihenfolge:

`CM3D V0.1 BASELINE – FROZEN → WD-01 → WD-02 / P0.1 → weiterer V1-Ausbau`
