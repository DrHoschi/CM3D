# WD-15 – Verbindliche Fortsetzung nach WD-14B

**Stand:** 2026-08-29  
**Status:** BINDING ROADMAP  
**Basis:** WD-14B PASS / FROZEN (`e8fe400cdc1f5e1e69daa8628b18613e1d6a7ea6`)  
**Funktionsbasis:** `docs/03_functional-spec/CM3D_MASTER_FUNCTIONS_V0_1.md`

## Abgleich des verbleibenden V1-Pflichtkerns

Nach WD-14B wurden Master-Funktionsliste, vorhandene WD-Statusdokumente und der aktuelle Bedienstand erneut abgeglichen.

Bereits belastbar vorhanden sind insbesondere Objektbaum/Auswahl/Umbenennen, Sichtbarkeit, Sperren, Gruppen/Baugruppen, Viewport und feste Ansichten, Transform, Einheiten, Sketch/Extrude, Primitive, Duplizieren/Löschen/Undo/Redo, Material/Base Color sowie GLB/GLTF- und Projektdatei-Import/Export.

Für den Projektbereich ist dagegen noch eine klare V1-Lücke sichtbar: `Speichern` und `Projekt öffnen/laden` existieren, aber die Masterliste fordert zusätzlich `Speichern unter`, `Projekt-Einstellungen` und `Projekt schließen`.

Deshalb wird WD-15 verbindlich als Abschluss des V1-Projekt-Lifecycles festgelegt.

## WD-15 – Projekt-Lifecycle

### WD-15A – Speichern unter & Projekt schließen

Zuordnung:

- `CM3D-F005` – Speichern unter
- `CM3D-F007` – Projekt schließen

Ziel:

- `Speichern unter` erzeugt bewusst einen neuen Projektstand mit neuer stabiler `projectId`, ohne den bisherigen gespeicherten Stand zu überschreiben;
- Projektname kann für den neuen Stand festgelegt werden;
- der neue Stand wird danach zum aktiven Projekt;
- `Projekt schließen` beendet den aktuellen Projektkontext kontrolliert und führt in einen definierten leeren/Startzustand;
- ungespeicherte Änderungen dürfen nicht stillschweigend verloren gehen;
- bestehendes Speichern/Laden und Projektdatei-Import/Export bleiben kompatibel;
- iPad-/Safari-Gerätetest vor PASS / FROZEN.

### WD-15B – Projekt-Einstellungen

Erst nach WD-15A PASS / FROZEN.

Zuordnung:

- `CM3D-F006` – Projekt-Einstellungen

Ziel:

- eigener klarer Projekt-Einstellungsbereich;
- nur tatsächlich projektbezogene, persistente Werte;
- keine Vermischung mit reinem Workspace-/Runtime-State;
- vorhandene Einheiten-/Raster-/Viewport-Entscheidungen werden vor Übernahme einzelner Werte ausdrücklich auf Ownership geprüft;
- Save/Load und Projektdatei müssen die freigegebenen Projektwerte erhalten;
- iPad-/Safari-Gerätetest vor PASS / FROZEN.

## Danach verbleibender V1-Abgleich

Nach WD-15B wird erneut gegen die Master-Funktionsliste geprüft. Besonders separat zu bewerten bleiben dann unter anderem:

- `CM3D-F063/F064` – Kameraobjekt / Kamera-Vorschau;
- `CM3D-F081–F084` – Diagnose, Status/Meldungen, Scene JSON, Selection-Status;
- bereits vorhandene Funktionen, deren formaler V1-Abnahmestatus noch gegen die Masterliste nachgezogen werden muss.

Diese Punkte werden noch nicht vorzeitig als WD-16+ durchnummeriert.

## Nicht Bestandteil von WD-15

- Letzte Projekte (`CM3D-F003`, V1–V2);
- Layers (`CM3D-F015`, V1–V2);
- Kameraobjekte;
- Diagnose-/Debug-Panels;
- neue Modellierfunktionen;
- Cloud-Speicherung oder Benutzerkonten.

## Verbindliche Reihenfolge

`WD-14B PASS / FROZEN → WD-15A Speichern unter & Projekt schließen → WD-15B Projekt-Einstellungen → erneuter V1-Restabgleich`
