# WD-01 – Technisches Fundament & Datenmodell

**Stand:** 2026-08-27  
**Status:** PLANNED  
**Voraussetzung:** CM3D V0.1 BASELINE – FROZEN

## Zweck

WD-01 ist der verbindliche technische Einstiegspunkt vor dem ersten eigentlichen Web-Prototyp. In diesem Block wird noch nicht versucht, die gesamte CM3D-Master-Funktionsliste zu implementieren. Stattdessen werden ausschließlich die technischen Grundlagen festgelegt, die nötig sind, damit der erste Code auf einem stabilen Datenmodell aufbauen kann.

## Zu entscheidende Punkte

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
12. klare Trennung Datenmodell ↔ Three.js ↔ Benutzeroberfläche

## Architekturregel

Die fachlichen Projektdaten dürfen nicht mit Three.js-Laufzeitobjekten oder UI-Zuständen gleichgesetzt werden.

Verbindliche Trennung:

- **Datenmodell:** persistierbare CM3D-Projekt- und Szenendaten
- **Three.js-Schicht:** Laufzeitdarstellung und Interaktion des 3D-Inhalts
- **UI-Schicht:** Hauptfenster, Objektbaum, Inspector, Auswahl- und Bedienzustände

Three.js ist damit Rendering-/Runtime-Schicht, nicht die alleinige Quelle der Projektdaten.

## Nicht-Scope von WD-01

- keine vollständige Implementierung der 89 Master-Funktionen
- kein Ausbau der Modellierungswerkzeuge
- keine vollständige Materialbibliothek
- kein Rendering-Ausbau
- keine komplexen Im-/Exporter
- keine Spezialfunktionen aus Priorität B/C

## Exit-Kriterien

WD-01 ist abgeschlossen, wenn für alle zwölf Punkte eine eindeutige technische Entscheidung dokumentiert ist und daraus ein konsistentes, versionierbares Datenmodell für den ersten Prototyp abgeleitet werden kann.

Erst danach beginnt WD-02.

# WD-02 – erster echter Web-Prototyp

WD-02 bildet die erste kleine, durchgängige und speicherfeste End-to-End-Kette:

1. Hauptfenster öffnen
2. 3D-Viewport anzeigen
3. Würfel erzeugen
4. Würfel im Objektbaum anzeigen
5. Würfel auswählen
6. X/Y/Z bzw. Transformwerte verändern
7. Projekt speichern
8. Browser neu laden
9. Projekt laden
10. derselbe Würfel ist mit korrekter Identität, Hierarchie und Transform wieder vorhanden
11. Icon-Paket im UI verwenden

## Meilensteinregel

WD-02 ist der erste echte technische Meilenstein. Er entspricht dem bisher als **P0.1 Minimal-Prototyp** bezeichneten Funktionskern. Zur Vermeidung konkurrierender Bezeichnungen wird ab diesem Punkt folgende Zuordnung verwendet:

**P0.1 = WD-02 End-to-End-Prototyp.**

WD-01 ist die notwendige Architekturvorstufe und wird vor P0.1/WD-02 abgeschlossen.

## Reihenfolge

`CM3D V0.1 BASELINE – FROZEN → WD-01 → WD-02 / P0.1 → weiterer V1-Ausbau`
