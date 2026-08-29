# WD-16 – Viewport-Referenzsystem abschließen

**Stand:** 2026-08-29  
**Status:** IMPLEMENTED / DEVICE TEST REQUIRED  
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

## Nicht Bestandteil

- Kameraobjekte oder Kamera-Vorschau;
- Viewport-Gizmo in einer festen Bildschirmecke;
- ein-/ausblendbare Rasteroptionen;
- neue Rasterparameter;
- Diagnose/Scene JSON/Selection-Panels;
- Änderungen am Projektformat.

## Abnahme

Vor PASS / FROZEN ist ein praktischer iPad-/Safari-Test erforderlich.

**Aktueller Status: IMPLEMENTED / DEVICE TEST REQUIRED.**
