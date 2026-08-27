# WD-01 – Technisches Fundament & Datenmodell

**Stand:** 2026-08-27  
**Status:** IN PROGRESS  
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

## WD-01.01 – Projektstruktur und Projektdatei

**Status:** DECIDED

### Entscheidung

CM3D verwendet ein eigenes, versioniertes Projektformat mit der Dateiendung **`.cm3d`**. Inhaltlich ist die Projektdatei ein UTF-8-JSON-Dokument mit klar getrennten Bereichen für Metadaten, Projekteinstellungen, Szene und projektbezogene Ressourcenreferenzen.

Für WD-02/P0.1 wird bewusst **keine Binärdatei und kein ZIP-Container** verwendet. Die erste Version bleibt direkt lesbar, diffbar und debugbar. Ein späterer Container darf eingeführt werden, ohne die logische Datenstruktur zu ändern.

### Verbindliche Top-Level-Struktur

```json
{
  "format": "CM3D_PROJECT",
  "schemaVersion": "0.1.0",
  "project": {},
  "settings": {},
  "scene": {},
  "materials": [],
  "assets": [],
  "extensions": {}
}
```

### Bedeutung der Bereiche

- `format`: feste Kennung zur eindeutigen Erkennung einer CM3D-Projektdatei.
- `schemaVersion`: Version des gespeicherten Datenmodells, nicht die Programmversion.
- `project`: Projekt-ID, Name, Erstellungs-/Änderungsinformationen und projektbezogene Metadaten.
- `settings`: persistierbare Projekteinstellungen wie Einheitensystem, Raster- und spätere Projekteinstellungen.
- `scene`: fachlicher SceneGraph mit allen speicherbaren Szenenobjekten.
- `materials`: projektbezogene Materialdefinitionen unabhängig von Three.js-Materialinstanzen.
- `assets`: Referenzen auf importierte oder externe Ressourcen; in WD-02 zunächst leer bzw. minimal.
- `extensions`: reservierter Erweiterungsbereich für spätere Daten, die den Kern nicht aufbrechen dürfen.

### Projekt-ID

Jedes Projekt erhält beim Erstellen eine dauerhafte eindeutige `projectId`. Diese Identität bleibt beim normalen Speichern und Laden unverändert. `Speichern unter` erzeugt nicht automatisch eine neue fachliche Identität; eine spätere Funktion „Projekt duplizieren“ kann dies ausdrücklich tun.

### Persistenzregel

Gespeichert werden ausschließlich fachliche und projektbezogene Daten, die zum reproduzierbaren Wiederaufbau des Projekts notwendig sind.

**Nicht Bestandteil der Projektdatei sind insbesondere:**

- Three.js-Objektinstanzen
- WebGL-/GPU-Ressourcen
- DOM-Elemente
- offene Menüs oder Dialoge
- Hover-Zustände
- temporäre Gizmo-Zustände
- Laufzeit-Caches
- Browser-spezifische Handles

UI-Zustände dürfen nur dann persistiert werden, wenn sie ausdrücklich als Projektzustand definiert werden. Auswahlzustand und reine Arbeitsoberflächenzustände werden in WD-01.09 separat entschieden.

### Ressourcenregel

WD-02/P0.1 muss vollständig ohne eingebettete Binärressourcen funktionieren. Der erste speicherfeste Kern benötigt nur primitive Geometrie und interne Daten.

Für spätere Importe gilt: Die Projektdatei speichert stabile Asset-Referenzen und Metadaten; die konkrete Strategie für Einbettung, externe Dateien oder Paketierung wird erst beim Import-/Asset-Block entschieden.

### Speicherort im Web-Prototyp

Die logische `.cm3d`-Datei ist das kanonische Projektformat. Der Browser darf für WD-02 zusätzlich IndexedDB oder vergleichbaren lokalen Speicher als technische Ablage verwenden, aber diese Ablage ist **nicht** das Datenmodell selbst. Save/Load muss immer über dieselbe serialisierbare CM3D-Projektstruktur laufen.

### Architekturfolgen

1. Ein Projekt kann ohne Three.js geladen und validiert werden.
2. Three.js wird aus dem Datenmodell rekonstruiert, nicht umgekehrt als alleinige Wahrheit gespeichert.
3. Die Projektdatei bleibt für Tests und Fehlersuche menschenlesbar.
4. Schema-Migrationen sind durch `schemaVersion` vorbereitet.
5. Spätere Asset-Paketierung kann ergänzt werden, ohne SceneGraph und Objektmodell neu zu erfinden.

### Abnahmekriterium WD-01.01

WD-01.01 ist erfüllt, wenn ein leeres CM3D-Projekt als valides `.cm3d`-JSON erzeugt, gespeichert, erneut gelesen und anhand von `format` und `schemaVersion` eindeutig erkannt werden kann.

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
