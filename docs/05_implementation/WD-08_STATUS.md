# WD-08 – 2D-Skizzenbasis

**Stand:** 2026-08-28  
**Status:** WD-08B IMPLEMENTED – DEVICE TEST REQUIRED  
**Voraussetzung:** WD-08A – PASS / FROZEN

## V1-Scope

WD-08 umfasst im V1-Pflichtkern:

- 2D-Skizzenmodus
- Linien
- Rechteck / Polygon

Nicht Bestandteil des aktuellen V1-Blocks sind Kreis/Bogen und Profile. Extrude folgt separat in WD-09.

## WD-08A – Sketch Plane & Linienbasis

WD-08A ist **PASS / FROZEN** und wurde nach `main` übernommen.

Implementiert und getestet:

- persistentes Scene-Objekt `sketch`
- definierte lokale Skizzenebene `localXY`
- stabile `pointId` und `lineId`
- Linienerzeugung per Pointer/Tap
- Undo/Redo
- Speichern/Laden
- mehrere Skizzen pro Projekt
- Safari-Quota-Pfad gehärtet

## WD-08B – Rechteck / Polygon

Implementiert auf `feature/wd-08b-rectangle-polygon`:

- eigener Werkzeugbutton `Rechteck`
- Rechteck wird mit zwei Eckpunkten auf der aktiven Sketch-Ebene definiert
- während der Eingabe wird eine geschlossene Rechteck-Vorschau angezeigt
- beim zweiten Punkt werden vier persistente Sketch-Punkte und vier geschlossene Linien atomar erzeugt
- Rechteck nutzt gemeinsame Eckpunkte; es besteht nicht aus vier voneinander unabhängigen Segmentpaaren
- eigener Werkzeugbutton `Polygon`
- Polygonpunkte werden nacheinander auf der aktiven Sketch-Ebene gesetzt
- die aktuelle Punktfolge wird als temporäre Vorschau dargestellt
- erneuter Klick auf `Polygon schließen` schließt ein Polygon ab, sobald mindestens drei Punkte vorhanden sind
- beim Abschluss werden alle Polygonpunkte und die geschlossene Linienkette atomar in der aktiven Skizze gespeichert
- Werkzeugwechsel verwirft einen noch nicht abgeschlossenen Polygonentwurf, statt unvollständige Daten im Projekt zu hinterlassen
- Rechteck und Polygon verwenden dasselbe persistente Sketch-Datenmodell wie WD-08A
- Undo/Redo und Speichern/Laden laufen über den bestehenden Projektpfad
- keine Schema-Migration; `schemaVersion` bleibt `0.1.0`

## Bedienung für den Gerätetest

- `Linie`: wie in WD-08A.
- `Rechteck`: erster Tap = erste Ecke, zweiter Tap = gegenüberliegende Ecke; danach bleibt das Rechteckwerkzeug für weitere Rechtecke aktiv.
- `Polygon`: mindestens drei Punkte nacheinander setzen; anschließend oben erneut `Polygon schließen` drücken. Erst dann wird das Polygon persistent gespeichert.
- Wechsel zu `Linie` oder `Rechteck` vor `Polygon schließen` verwirft den aktuellen Polygonentwurf.

## Verbindliche Follow-ups

Diese Punkte bleiben bewusst außerhalb von WD-08B:

- **Sketch Plane Selection:** Front, Top und Side als auswählbare Skizzenebenen; später frei transformierbare/objektbezogene Ebenen.
- **Blueprint-/Referenz-Unterlage:** Bild als positionier-/skalierbare Referenzebene; PDF als mögliche Referenzquelle prüfen.
- **Objektbaum:** Gruppen und Baugruppen auf- und zuklappbar.
- **Toolbar/Arbeitsmodi:** kompaktere, modusabhängige Werkzeugleiste.
- **Smartphone-Layout:** Kernbedienung darf nicht durch Inspector/Toolbar verdeckt werden.
- **Feste Ansichten / Raster:** passende Rasterdarstellung für Front und Side.
- echte dateibasierte Projekt-Sicherung statt `localStorage` als Langzeitarchiv.

## Abgrenzung

Noch nicht enthalten:

- Kreis / Bogen
- Profile / Profil-Erkennung
- Constraints
- Extrude (WD-09)
- automatische Flächenerkennung
- Blueprint-Bild/PDF-Import
- vollständige Sketch-Plane-Auswahl

## Gerätetest WD-08B

Vor PASS mindestens prüfen:

1. bestehende Skizze auswählen und `Rechteck` aktivieren.
2. zwei Eckpunkte setzen; geschlossenes Rechteck erscheint.
3. mehrere Rechtecke in derselben Skizze erzeugen.
4. Undo entfernt jeweils das zuletzt erzeugte Rechteck vollständig; Redo stellt es vollständig wieder her.
5. `Polygon` aktivieren, mindestens drei Punkte setzen und mit `Polygon schließen` abschließen.
6. Polygon ist geschlossen und bleibt nach Speichern/Laden sichtbar.
7. unvollständiges Polygon durch Werkzeugwechsel abbrechen; es darf danach nicht persistent im Projekt liegen.
8. bestehende Linien aus WD-08A bleiben unverändert nutzbar.
9. Primitive, Transform, Ansichten, Hierarchie und Fit/Fokus bleiben funktionsfähig.

## Exit WD-08B

WD-08B wird erst nach erfolgreichem Gerätetest und explizitem `WD-08B PASS` geschlossen / FROZEN. Erst danach ist der V1-Pflichtkern von WD-08 vollständig abgeschlossen und der Übergang zu WD-09 – Extrude-Basis zulässig.
