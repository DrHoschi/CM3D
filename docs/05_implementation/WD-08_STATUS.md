# WD-08 – 2D-Skizzenbasis

**Stand:** 2026-08-28  
**Status:** WD-08A1 IMPLEMENTED – CORE VERIFICATION REQUIRED  
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

### WD-08A2 – noch nicht begonnen

Viewport-Eingabe und visuelle Bearbeitung der Linien wird erst nach dem Core-Check von WD-08A1 umgesetzt.

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

Vor WD-08A2 müssen mindestens folgende Core-Pfade bestätigt sein:

1. Sketch-Objekt erzeugen.
2. Punkte und Linie erzeugen.
3. Projektvalidierung = PASS.
4. Undo entfernt die letzte Sketch-Operation korrekt.
5. Redo stellt sie korrekt wieder her.
6. Projekt speichern und laden; IDs, Ebene, Punkte und Linien bleiben unverändert erhalten.
7. Bestehende Primitive und WD-07/WD-06-Funktionen bleiben unbeeinträchtigt.
