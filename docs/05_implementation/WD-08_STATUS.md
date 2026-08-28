# WD-08 – 2D-Skizzenbasis

**Stand:** 2026-08-28  
**Status:** WD-08A1 CORE CHECK PASS – WD-08A2 READY  
**Voraussetzung:** WD-07 – PASS / FROZEN

## V1-Scope

WD-08 umfasst im V1-Pflichtkern:

- 2D-Skizzenmodus
- Linien
- Rechteck / Polygon

Nicht Bestandteil des aktuellen V1-Blocks sind Kreis/Bogen und Profile. Extrude folgt separat in WD-09.

## WD-08A – Sketch Plane & Linienbasis

### WD-08A1 – Sketch-Datenmodell & Store-Core

Implementiert auf `feature/wd-08a-sketch-line`:

- neues persistentes Scene-Objekt `sketch`
- definierte lokale Skizzenebene `localXY`
- normale Objekt-Transforms bestimmen die Lage der Skizze im 3D-Weltraum
- persistente Punkt-Map mit stabilen `pointId`
- persistente Linien-Map mit stabilen `lineId` und Punktreferenzen
- Store-Operationen zum Erzeugen einer Skizze, einzelner Punkte, Linien und vollständiger Liniensegmente
- Undo/Redo über die bestehende Snapshot-Historie
- Speichern/Laden über das bestehende Projektmodell
- Validierung für Ebene, Punktkoordinaten, IDs und Linienreferenzen
- keine Schema-Migration; `schemaVersion` bleibt `0.1.0`

### WD-08A1 – Core-Check

Der Datenpfad wurde am 2026-08-28 gegen die aktuelle Branch-Implementierung geprüft:

1. **Sketch erzeugen – PASS:** `addSketch()` verwendet den normalen `addObject()`-Pfad. Die Skizze landet in `scene.objects`, wird Root-Objekt und erhält eine stabile `objectId`.
2. **Punkte erzeugen – PASS:** `addSketchPoint()` akzeptiert nur endliche X/Y-Werte, erzeugt stabile `pointId` und schreibt in die persistente Punkt-Map.
3. **Linie erzeugen – PASS:** `addSketchLine()` verlangt zwei vorhandene, unterschiedliche Punkt-IDs. `addSketchSegment()` erzeugt zwei Punkte und eine Linie atomar in einem Historieneintrag.
4. **Validierung – PASS:** `validateProject()` prüft `localXY`, Maps, Punktwerte, Schlüssel/IDs, Punktreferenzen und identische Start-/Endpunkt-IDs.
5. **Undo – PASS (Codepfad):** jede Sketch-Mutation erzeugt vorher einen vollständigen Projekt-Snapshot; `undo()` stellt diesen Snapshot wieder her.
6. **Redo – PASS (Codepfad):** der nach der Mutation gespeicherte Snapshot wird durch `redo()` vollständig wiederhergestellt.
7. **Speichern – PASS (Codepfad):** `saveProject()` validiert das vollständige Projekt und serialisiert danach das komplette Projektobjekt einschließlich `scene.objects` als JSON.
8. **Laden – PASS (Codepfad):** `loadProject()` parst das gespeicherte JSON und validiert es erneut; Sketch-Ebene, IDs, Punkte und Linien sind Bestandteil desselben Projektobjekts und werden nicht separat rekonstruiert.
9. **Bestandsschutz – PASS:** bestehende Primitive, Materialstruktur, Transform-/Hierarchiepfade sowie WD-06/WD-07-Datenstrukturen wurden für WD-08A1 nicht umgebaut.

Hinweis: Dieser Check bestätigt den strukturellen Core-Codepfad. Eine echte interaktive Geräteprüfung der Sketch-Eingabe ist erst sinnvoll, sobald WD-08A2 die Viewport-Eingabe sichtbar verfügbar macht.

### WD-08A2 – bereit, noch nicht implementiert

Als nächster Teilblock folgt ausschließlich die Viewport-Eingabe und sichtbare Darstellung von Linien auf der definierten Skizzenebene. Die in WD-08A1 geprüfte Datenstruktur bleibt dafür die persistente Quelle.

## Abgrenzung

Noch nicht enthalten:

- Rechteck / Polygon (WD-08B)
- Kreis / Bogen
- Profile / Profil-Erkennung
- Constraints
- Extrude (WD-09)
- automatische Flächenerkennung

## Viewport-Anmerkung aus Gerätetest

Für `Top` ist das bestehende Weltgrid bereits passend sichtbar. Für `Front` und `Side` wurde als gewünschte spätere Verbesserung festgehalten, ebenfalls eine zur aktiven technischen Ansicht passende Rasterebene anzeigen bzw. zuschalten zu können.

Diese Beobachtung wird **nicht** stillschweigend in WD-08A1 eingebaut und öffnet WD-07 nicht rückwirkend. Vor einer Umsetzung wird separat entschieden, ob das Raster ansichtsabhängig umgeschaltet wird oder ob ein Sketch-spezifisches Ebenenraster genügt.

## Exit WD-08A1

Erfüllt auf Ebene des strukturellen Core-Codepfads. WD-08A2 darf auf demselben Feature-Branch begonnen werden. `main` bleibt bis zum späteren Geräte-PASS unverändert.
