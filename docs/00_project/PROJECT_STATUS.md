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

## Scope-Trennung

### P0.1 – Minimal-Prototyp
Kleinste durchgehende Funktionskette für die erste Implementierungsvalidierung:

- leeres/neues Projekt
- 3D-Viewport
- Objektbaum
- Würfel/Quader erstellen
- auswählen
- Position/Rotation/Skalierung
- speichern
- wieder laden
- Icon-Paket im UI eingebunden

### V1 – Pflichtkern
Der vollständige erste belastbare Designer-Kern gemäß Master-Funktionsliste. P0.1 ist ausdrücklich nur eine Teilmenge davon.

## Statuskennzeichnung

- `DRAFT` – in Bearbeitung
- `REVIEW` – fachlich zur Prüfung bereit
- `FROZEN` – verbindliche Baseline; Änderungen nur kontrolliert über neue Revision/Entscheidung
- `APPROVED` – formell freigegebener Folge-/Release-Stand
- `ARCHIVED` – abgelöster historischer Stand

Aktueller Gesamtstatus: **FROZEN / CM3D V0.1 BASELINE**

## Nächster Entwicklungsblock

Nach dem Merge der Dokumentationsbaseline beginnt die technische Vorbereitung für **P0.1**. Dabei wird nicht sofort der gesamte V1-Umfang implementiert; zuerst wird die kleinste End-to-End-Kette Projekt → Viewport → Objekt → Transform → Save/Load stabil aufgebaut.
