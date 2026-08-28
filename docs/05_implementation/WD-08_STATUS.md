# WD-08 – 2D-Skizzenbasis

**Stand:** 2026-08-28  
**Status:** WD-08 COMPLETE / PASS / FROZEN  
**Voraussetzung:** WD-07 – PASS / FROZEN

## V1-Scope

WD-08 umfasst im V1-Pflichtkern:

- 2D-Skizzenmodus
- Linien
- Rechteck / Polygon

Nicht Bestandteil des V1-Pflichtkerns sind Kreis/Bogen und Profile. Extrude folgt separat in WD-09.

## WD-08A – Sketch Plane & Linienbasis

WD-08A ist **PASS / FROZEN** und wurde nach `main` übernommen.

Bestätigt sind persistente `sketch`-Scene-Objekte, stabile `pointId`/`lineId`, Linienerzeugung per Pointer/Tap, Undo/Redo, Speichern/Laden, mehrere Skizzen pro Projekt und der gehärtete Safari-Quota-Pfad.

## WD-08B – Rechteck / Polygon

Implementiert auf `feature/wd-08b-rectangle-polygon`:

- klarer Bedienpfad `Skizzenebene → Neue Skizze → Werkzeug`.
- auswählbare Skizzenebenen `Front`, `Top`, `Side`.
- `Linie`, `Rechteck` und `Polygon` arbeiten ausschließlich innerhalb einer aktiven Skizze.
- `Rechteck`: zwei gegenüberliegende Eckpunkte erzeugen atomar vier gemeinsame Eckpunkte und vier geschlossene Linien.
- `Polygon`: mehrere Punkte werden als Vorschau gesammelt und mit `Polygon schließen` atomar als geschlossene Linienkette gespeichert.
- Werkzeugwechsel verwirft unvollständige Polygonentwürfe.
- alle Werkzeuge verwenden dasselbe persistente Sketch-Datenmodell.
- Undo/Redo und Speichern/Laden verwenden den bestehenden Projektpfad.
- keine Schema-Migration; `schemaVersion` bleibt `0.1.0`.

## Gerätetest WD-08B

Gerätetest am 2026-08-28 auf iPad / Safari erfolgreich abgeschlossen.

Bestätigt wurden:

- neue Skizze auf gewählter Front-/Top-/Side-Ebene.
- Linienerzeugung funktioniert weiterhin.
- Rechtecke lassen sich erzeugen und bleiben geschlossen.
- Polygone lassen sich mit mehreren Punkten erzeugen und schließen.
- mehrere Skizzen und mehrere Formen im selben Projekt funktionieren.
- Undo/Redo für Rechteck und Polygon funktioniert.
- Speichern und Laden erhält die Sketch-Geometrie.
- bestehende Primitive und die bisherigen Viewport-/Transformfunktionen bleiben nutzbar.

**Freigabe Projektleitung:** `WD-08B PASS` am 2026-08-28.

## Verbindliche Follow-ups

Diese Punkte bleiben bewusst außerhalb von WD-08:

- frei transformierbare bzw. objektbezogene Sketch-Ebenen zusätzlich zu Front/Top/Side.
- Blueprint-/Referenz-Unterlage: Bild als positionier-/skalierbare Referenzebene; PDF als mögliche Referenzquelle prüfen.
- Objektbaum: Gruppen und Baugruppen auf- und zuklappbar.
- Toolbar/Arbeitsmodi: kompaktere, modusabhängige Werkzeugleiste.
- Smartphone-Layout: Kernbedienung darf nicht durch Inspector/Toolbar verdeckt werden.
- feste Ansichten / Raster: passende Rasterdarstellung für Front und Side weiter verfeinern.
- echte dateibasierte Projekt-Sicherung statt `localStorage` als Langzeitarchiv.

## Abgrenzung

Noch nicht enthalten:

- Kreis / Bogen
- Profile / Profil-Erkennung
- Constraints
- Extrude
- automatische Flächenerkennung
- Blueprint-Bild/PDF-Import

## Exit WD-08

Erfüllt. WD-08A und WD-08B sind **PASS / FROZEN**. Der V1-Pflichtkern von WD-08 ist abgeschlossen und darf nach `main` übernommen werden. Danach beginnt **WD-09 – Extrude-Basis** auf einem neuen Arbeitsbranch.