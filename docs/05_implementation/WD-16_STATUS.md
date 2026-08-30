# WD-16 – Viewport-Referenzsystem abschließen

**Stand:** 2026-08-29  
**Status:** PASS / FROZEN  
**Branch:** `feature/wd-16-viewport-reference-system`  
**Basis:** V1-Restabgleich `acf449595f7d4096405340ecccb386c24af15b7b` auf WD-15B PASS / FROZEN  
**Funktion:** `CM3D-F023` – Raster und Achsen

## Ziel

WD-16 schließt den noch offenen Teil von CM3D-F023. Das vorhandene dynamische Raster bleibt unverändert; ergänzt wird eine sichtbare Weltachsenreferenz.

## Umsetzung

Im Viewport wird am Weltursprung ein XYZ-Achsensystem dargestellt:

- X = rot;
- Y = grün;
- Z = blau;
- jede positive Achsrichtung besitzt zusätzlich die Beschriftung X, Y bzw. Z;
- die Achsen bleiben Teil der 3D-Welt und zeigen damit den tatsächlichen Weltursprung;
- ihre Darstellungsgröße passt sich an den Kameraabstand an, damit sie bei kleinen und großen Arbeitsmaßstäben erkennbar bleibt;
- die Achsendarstellung gehört nicht zum Modellbaum und wird nicht mit dem Projekt gespeichert oder exportiert.

## Bestehendes Raster

Das bereits vorhandene GridHelper-Raster und dessen dynamische Skalierung werden in WD-16 nicht neu implementiert oder verändert. WD-16 ergänzt ausschließlich die bisher fehlende Achsenreferenz.

## Geräteabnahme

**Datum:** 2026-08-29  
**Gerät/Umgebung:** iPad / Safari / GitHub Pages  
**Ergebnis:** PASS

Praktisch bestätigt wurden:

- sichtbares XYZ-Achsensystem am Weltursprung;
- korrekte Farblogik X rot, Y grün, Z blau;
- sichtbare X/Y/Z-Beschriftung;
- Darstellung im leeren Projekt sowie zusammen mit vorhandenen Modellobjekten;
- korrekte sichtbare Build-Kennung `WD-16` nach Behebung der geerbten WD-15B-Überschreibung.

Der Build-Label-Fehler war kein Fehler der Achsenfunktion selbst. Er wurde vor dem Freeze separat korrigiert.

## Nicht Bestandteil

- Kameraobjekte oder Kamera-Vorschau;
- Viewport-Gizmo in einer festen Bildschirmecke;
- ein-/ausblendbare Rasteroptionen;
- neue Rasterparameter;
- Diagnose/Scene JSON/Selection-Panels;
- Änderungen am Projektformat.

## Freeze

WD-16 ist nach bestandenem realem iPad-/Safari-Gerätetest **PASS / FROZEN**.

`CM3D-F023 – Raster und Achsen` ist damit für V1 abgeschlossen. Neue Änderungen an diesem Block erfolgen nur über einen nachfolgenden dokumentierten Entwicklungsblock.
