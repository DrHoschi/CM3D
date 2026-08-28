# WD-08 – 2D-Skizzenbasis

**Stand:** 2026-08-28  
**Status:** WD-08A PASS / FROZEN  
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

Implementiert und auf iPad Safari bestätigt:

- Toolbar-Befehl `Skizze / Linie`
- automatische Erzeugung eines persistenten `sketch`-Objekts, wenn keine aktive Skizze vorhanden ist
- ausgewählte Skizze kann weiterverwendet werden
- lokale `XY`-Skizzenebene als objektgebundenes Raster
- erster Tap setzt Startpunkt, zweiter Tap erzeugt ein persistentes Liniensegment
- temporäre Linienvorschau zwischen erstem und zweitem Punkt
- persistierte Linien werden beim Rebuild aus den Sketch-Daten aufgebaut
- TransformControls sind während der Linieneingabe abgekoppelt
- Modus wird über `Linie beenden` beendet

## Speicherblocker und Nachtest

Während des Gerätetests trat auf Safari zunächst `The quota has been exceeded.` auf. Ursache war der begrenzte Browser-`localStorage`, nicht die Sketch-Validierung. Der Speicherpfad wurde gehärtet und Projektstände werden kompakter geschrieben.

Nach Bereinigung alter lokaler Teststände auf iPad Safari erfolgreich geprüft:

- vorhandenes Projekt + zweite Skizze + Speichern: PASS
- neues Projekt + Skizze + Speichern: PASS
- gespeichertes neues Projekt erneut laden: PASS
- Skizze und Linien bleiben nach Laden sichtbar: PASS

Eine echte dateibasierte Projekt-Sicherung bleibt als separate spätere Aufgabe vorgemerkt; `localStorage` ist nicht als endgültiges Langzeit-Projektarchiv vorgesehen.

## Gerätetest WD-08A2

Bestätigt:

1. `Skizze / Linie` erzeugt eine neue Skizze und aktiviert den Zeichenmodus.
2. Die lokale Sketch-Ebene ist sichtbar.
3. Linien können per Tap erzeugt werden.
4. Mehrere Linien funktionieren.
5. Undo/Redo funktioniert.
6. Speichern und Laden erhält Skizze und Linien.
7. Mehrere Skizzen in einem Projekt sind speicherbar.
8. Neues Projekt mit neuer Skizze ist speicherbar und wieder ladbar.
9. Bestehende Primitive, Hierarchie und Ansichten bleiben nutzbar.

**Freigabe Projektleitung:** `WD-08A PASS` am 2026-08-28.

## Verbindliche Follow-ups aus dem Gerätetest

Diese Punkte erweitern WD-08A nicht rückwirkend, müssen aber in den folgenden Blöcken berücksichtigt werden:

- **Sketch Plane Selection:** Skizzen dürfen langfristig nicht auf Front/localXY beschränkt bleiben. Für die Modellierung müssen definierte Ebenen für Front, Top und Side auswählbar sein; später zusätzlich frei transformierbare/objektbezogene Ebenen.
- **Blueprint-/Referenz-Unterlage:** Für Skizzen soll später ein Bild als Hintergrund-/Referenzebene importiert, positioniert, skaliert und zum Nachzeichnen verwendet werden können. PDF-Unterlagen sollen ebenfalls als mögliche Referenzquelle geprüft werden. Die genaue Import-/Rasterstrategie wird separat festgelegt und nicht stillschweigend in WD-08B gezogen.
- **Objektbaum:** Gruppen und Baugruppen müssen auf- und zuklappbar werden; das betrifft nur die Darstellung, nicht die Projektdaten.
- **Toolbar/Arbeitsmodi:** Die obere Werkzeugleiste soll kompakter und modusabhängig werden. Je nach Arbeitsmodus sollen nur relevante Befehle sichtbar sein.
- **Smartphone-Layout:** Inspector und Toolbar dürfen zentrale Funktionen nicht verdecken. Smartphone bleibt sekundär; Tablet/Desktop ist der primäre Zielbereich.
- **Feste Ansichten / Raster:** Für Front und Side ist eine passende Rasterdarstellung weiterhin als Viewport-Follow-up vorgemerkt.

## Abgrenzung

Noch nicht enthalten:

- Rechteck / Polygon (WD-08B)
- Kreis / Bogen
- Profile / Profil-Erkennung
- Constraints
- Extrude (WD-09)
- automatische Flächenerkennung
- Blueprint-Bild/PDF-Import
- vollständige Sketch-Plane-Auswahl

## Exit WD-08A

Erfüllt. WD-08A ist **PASS / FROZEN** und darf kontrolliert nach `main` übernommen werden. Danach beginnt WD-08B – Rechteck / Polygon auf einem neuen Arbeitsbranch.
