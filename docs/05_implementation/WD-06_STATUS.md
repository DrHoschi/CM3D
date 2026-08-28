# WD-06 – Einheiten, Maßstab & große Welt

**Stand:** 2026-08-28  
**Status:** IMPLEMENTED – DEVICE TEST REQUIRED  
**Voraussetzung:** WD-05 – PASS / FROZEN

## Ziel

WD-06 macht den bestehenden CM3D-Modellierungskern belastbar für sehr kleine und sehr große reale Abmessungen, ohne die in WD-01 festgelegte interne Datenbasis zu verändern.

Die interne kanonische Längeneinheit bleibt **Meter**. Die auswählbaren Einheiten `mm`, `cm`, `m` und `km` sind Anzeige- und Eingabeeinheiten. Ein Einheitenwechsel darf niemals die tatsächliche Geometriegröße oder gespeicherten Transformdaten eines Objekts verändern.

## Implementiert

- Anzeige-/Arbeits-Einheit `mm`, `cm`, `m`, `km` im Hauptfenster auswählbar.
- bestehendes `settings.units.lengthDisplayUnit` wird verwendet; Schema bleibt `0.1.0`.
- Positionen im Inspector werden beim Anzeigen von Meter in die aktive Einheit und bei Eingabe zurück nach Meter konvertiert.
- geometrische Abmessungen von Quader, Kugel und Zylinder werden an derselben UI-Grenze konvertiert.
- Pivot-/Origin-Längen werden ebenfalls konvertiert.
- Rotation bleibt Grad; Scale bleibt dimensionslos.
- Translation-Snap wird in der aktiven Einheit angezeigt/eingegeben und intern weiterhin in Metern an Three.js übergeben.
- Einheitenwechsel schreibt keine Objektgeometrie und keine Transformdaten um.
- aktive Anzeigeeinheit wird mit dem Projekt gespeichert und nach Laden wiederhergestellt.
- `Fit / Fokus` fokussiert die aktuelle Auswahl inklusive Gruppen-/Baugruppen-Unterbaum.
- Fokus bestimmt den erforderlichen Kameraabstand aus der Bounding Box der Auswahl.
- Kamera-Near/Far werden dynamisch aus Fokusabstand und Szenenausdehnung bestimmt.
- Three.js-Renderer nutzt logarithmischen Depth Buffer für große Größenordnungsunterschiede.
- OrbitControls erlauben stark erweiterte minimale und maximale Distanzen.
- Raster skaliert automatisch in Zehnerpotenzen mit dem aktuellen Kameraabstand und folgt dem Fokusbereich.
- Statuszeile zeigt die aktive Einheit.

## Ownership-Abgrenzung zu WD-07

WD-06 besitzt ausschließlich die Größen-/Maßstabsseite von Navigation und Kamera:

- Einheiten
- Skalenumrechnung
- große Welt / kleine Objekte
- Near/Far-Clipping
- Fokus/Fit auf Auswahl
- maßstabsgeeignete Raster-/Snap-Anzeige

WD-07 besitzt anschließend die **festen technischen Ansichten** und deren Orientierung:

- Top
- Front
- Side
- Perspektive / Isometrie
- Umschalten dieser Ansichten

`Fit View / Fokus` wird in WD-06 technisch eingeführt und kann in WD-07 wiederverwendet werden; WD-07 definiert dafür keine zweite, konkurrierende Implementierung.

## Nicht-Scope

- Instanzen / Shared Definitions
- Boolean Union / Subtract / Intersect
- Mesh-, Vertex-, Edge- oder Surface-Snapping
- komplexe Constraints
- 2D-Skizzenmodus
- Extrude
- Materialien / Texturen
- frei definierbare Konstruktionsachsen
- Vierfachansicht
- Rendering-Ausbau

Diese Themen verändern die bestehende V1-Reihenfolge nicht.

## Technische Leitplanken

- interne kanonische Längeneinheit: `m`
- keine destructive unit conversion bestehender Szenendaten
- `position`, Geometrieabmessungen und Pivot-Längen bleiben intern Meterwerte
- `rotation` bleibt Grad in der UI und Quaternion in der bestehenden internen Repräsentation
- `scale` bleibt dimensionslos
- Einheitenumrechnung erfolgt ausschließlich an der UI-/Boundary-Stelle
- bestehende Objekt-IDs, Hierarchie, Reparenting, Undo/Redo und Save/Load bleiben unverändert
- keine Schema-Migration: `settings.units.lengthDisplayUnit` war bereits vorhanden

## Manueller Gerätetest

1. Neues Projekt → Würfel erzeugen.
2. In `m` die Abmessungen `0,12 × 2,10 × 0,12` eingeben.
3. Einheit auf `cm` umstellen: Anzeige muss `12 × 210 × 12 cm` ergeben; sichtbare Größe darf sich nicht ändern.
4. Einheit auf `mm` umstellen: Anzeige muss `120 × 2100 × 120 mm` ergeben.
5. Danach `km` und wieder `m` wählen: in `m` müssen wieder exakt `0,12 × 2,10 × 0,12` erscheinen.
6. Position z. B. `1,25 m` setzen → `cm`: `125 cm`; → `mm`: `1250 mm`.
7. Pivot-Wert in mehreren Einheiten eingeben und zurückwechseln; derselbe reale Wert muss erhalten bleiben.
8. Snap aktivieren. In `mm` Translation-Snap `10` setzen und bewegen; danach in `cm` muss derselbe Snap als `1` erscheinen, in `m` als `0,01`.
9. Projekt in einer anderen Einheit als `m` speichern → Browser neu laden → Projekt laden; die gespeicherte Einheit muss wieder aktiv sein.
10. Sehr kleines Objekt einstellen, z. B. Würfel `0,0001 m` bzw. `0,1 mm`, auswählen und `Fit / Fokus` drücken; Objekt muss sichtbar und weiter orbitier-/zoombar sein.
11. Großes Objekt bzw. große Position testen, z. B. mehrere Kilometer; `Fit / Fokus` darf Geometrie nicht durch Near/Far-Clipping abschneiden.
12. Zwischen kleinem und großem Objekt mehrfach fokussieren; Orbit/Pan/Zoom müssen weiter funktionieren und das Raster sichtbar sinnvoll mitskalieren.
13. Regression WD-05: WORLD/LOCAL, Gruppe/Baugruppe, Reparenting, Auflösen, Duplizieren, Undo/Redo sowie Speichern/Laden kurz erneut prüfen.

## Erwartetes Ergebnis

Bei erfolgreichem Gerätetest wird WD-06 auf **PASS / FROZEN** gesetzt. Erst danach wird der Branch nach `main` übernommen.

## Exit-Regel

WD-06 wird auf `feature/wd-06-units-large-world` getestet. Bis zum dokumentierten **PASS** bleibt `main` unverändert.
