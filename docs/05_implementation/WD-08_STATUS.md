# WD-08 – 2D-Skizzenbasis

**Stand:** 2026-08-28  
**Status:** WD-08A2 DEVICE TEST FUNCTIONALLY PASS – EXPLICIT WD-08A PASS REQUIRED  
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

Implementiert und auf iPad Safari funktional bestätigt:

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

## Speicherblocker und Nachtest

Während des Gerätetests trat auf Safari zunächst `The quota has been exceeded.` auf. Ursache war der begrenzte Browser-`localStorage`, nicht die Sketch-Validierung. Der Speicherpfad wurde gehärtet und Projektstände werden kompakter geschrieben.

Nach Löschen zweier alter lokaler Testprojekte wurde auf iPad Safari erfolgreich geprüft:

- vorhandenes Projekt + zweite Skizze + Speichern: PASS
- neues Projekt + Skizze + Speichern: PASS
- gespeichertes neues Projekt erneut laden: PASS
- Skizze und Linien bleiben nach Laden sichtbar: PASS

Damit ist der zuvor beobachtete WD-08A-Speicherblocker funktional geschlossen. Eine echte Datei-basierte Projekt-Sicherung bleibt als separate spätere Aufgabe vorgemerkt; `localStorage` ist nicht als endgültiges Langzeit-Projektarchiv vorgesehen.

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

## UI-Follow-ups aus Gerätetest

Folgende Punkte sind allgemeine Produkt-/Bedienanforderungen und ausdrücklich nicht nur Smartphone-Themen:

- Objektbaum: Gruppen und Baugruppen müssen auf- und zuklappbar werden, damit große Hierarchien übersichtlich bleiben. Das Einklappen betrifft nur die Baumdarstellung, nicht die Projektdaten.
- Toolbar/Arbeitsmodi: Die aktuell stark belegte obere Werkzeugleiste soll später kompakter und modusabhängig werden. Je nach aktivem Arbeitsmodus sollen nur die dafür relevanten Befehle sichtbar sein, statt dauerhaft alle Funktionen gleichzeitig zu zeigen.
- Smartphone-Layout: Inspector und Toolbar dürfen zentrale Befehle nicht überdecken. Smartphone-Nutzung ist sekundär, soll aber mindestens bedienbar bleiben.
- Tablet/Desktop bleibt der primäre Zielbereich für die umfangreichere Modellierungsoberfläche.

Diese Punkte werden nicht in WD-08A hineingezogen, sondern als spätere UI-/Shell-Arbeiten geführt.

## Gerätetest WD-08A2

Funktional auf iPad Safari bestätigt:

1. `Skizze / Linie` erzeugt eine neue Skizze und aktiviert den Zeichenmodus.
2. Die lokale Sketch-Ebene ist sichtbar.
3. Erster Tap setzt den Startpunkt; zweiter Tap erzeugt eine sichtbare Linie.
4. Mehrere Linien können erzeugt werden.
5. Undo/Redo funktioniert.
6. Speichern und Laden erhält Skizze und Linien.
7. Mehrere Skizzen in einem Projekt sind speicherbar.
8. Neues Projekt mit neuer Skizze ist speicherbar und wieder ladbar.
9. Bestehende Primitive, Hierarchie und Ansichten bleiben nutzbar.

## Exit WD-08A

Der funktionale Gerätetest ist erfolgreich. WD-08A wird entsprechend der Projektarbeitsweise erst mit explizitem `WD-08A PASS` formal geschlossen / FROZEN und danach in `main` übernommen. Erst anschließend beginnt WD-08B – Rechteck / Polygon.
