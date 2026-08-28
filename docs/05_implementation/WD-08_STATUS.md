# WD-08 – 2D-Skizzenbasis

**Stand:** 2026-08-28  
**Status:** WD-08A2 IMPLEMENTED – DEVICE TEST REQUIRED  
**Voraussetzung:** WD-07 – PASS / FROZEN

## V1-Scope

WD-08 umfasst im V1-Pflichtkern:

- 2D-Skizzenmodus
- Linien
- Rechteck / Polygon

Nicht Bestandteil des aktuellen V1-Blocks sind Kreis/Bogen und Profile. Extrude folgt separat in WD-09.

## WD-08A – Sketch Plane & Linienbasis

### WD-08A1 – Sketch-Datenmodell & Store-Core

Core-Check: PASS.

Implementiert auf `feature/wd-08a-sketch-line`:

- persistentes Scene-Objekt `sketch`
- definierte lokale Skizzenebene `localXY`
- normale Objekt-Transforms bestimmen die Lage der Skizze im 3D-Weltraum
- persistente Punkt-Map mit stabilen `pointId`
- persistente Linien-Map mit stabilen `lineId` und Punktreferenzen
- Store-Operationen zum Erzeugen einer Skizze, einzelner Punkte, Linien und vollständiger Liniensegmente
- Undo/Redo über die bestehende Snapshot-Historie
- Speichern/Laden über das bestehende Projektmodell
- Validierung für Ebene, Punktkoordinaten, IDs und Linienreferenzen
- keine Schema-Migration; `schemaVersion` bleibt `0.1.0`

### WD-08A2 – Viewport-Eingabe & sichtbare Linien

Implementiert, Gerätetest ausstehend:

- neuer Toolbar-Befehl `Skizze / Linie`
- ohne vorhandene aktive Skizze wird automatisch ein persistentes `sketch`-Objekt erzeugt
- eine ausgewählte Skizze kann direkt weiterverwendet werden
- die lokale `XY`-Skizzenebene wird als eigenes objektgebundenes Raster sichtbar dargestellt
- die Skizzenebene folgt dem normalen Objekt-Transform und liegt damit eindeutig im 3D-Raum
- erster Pointer-Klick/-Tap setzt den Startpunkt
- zweiter Pointer-Klick/-Tap erzeugt über den bestehenden Store-Core ein persistentes Liniensegment
- zwischen Start- und aktuellem Pointerpunkt wird eine temporäre Vorschau gezeigt
- persistierte Linien werden bei jedem Rebuild aus den gespeicherten Sketch-Daten neu aufgebaut
- während der Linieneingabe bleiben TransformControls abgekoppelt, damit Zeichnen und Objekttransform nicht kollidieren
- Beenden des Modus erfolgt über denselben Toolbar-Befehl `Linie beenden`

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

Diese Beobachtung wird nicht stillschweigend in WD-08A eingebaut und öffnet WD-07 nicht rückwirkend. Das in WD-08A2 eingeführte Sketch-Raster ist objektgebunden und dient ausschließlich der aktiven lokalen Skizzenebene; es ersetzt keine spätere Entscheidung über ansichtsabhängige Welt-Raster.

## Gerätetest WD-08A2

Vor PASS sind mindestens folgende Punkte auf iPhone/iPad Safari zu prüfen:

1. `Skizze / Linie` erzeugt eine neue Skizze und aktiviert den Zeichenmodus.
2. Die lokale Sketch-Ebene ist sichtbar.
3. Erster Tap setzt den Startpunkt; zweiter Tap erzeugt eine sichtbare Linie.
4. Mehrere Linien können nacheinander erzeugt werden.
5. `Linie beenden` beendet den Zeichenmodus sauber.
6. Undo entfernt das zuletzt erzeugte Liniensegment; Redo stellt es wieder her.
7. Speichern und Laden erhält Skizze und Linien sichtbar und datenidentisch.
8. Bestehende Primitive, Auswahl, Transform, feste Ansichten und Fit/Fokus bleiben funktionsfähig.

## Exit WD-08A

WD-08A wird erst mit explizitem Gerätetest-PASS geschlossen. Erst danach beginnt WD-08B – Rechteck / Polygon.
