# WD-06 – Einheiten, Maßstab & große Welt

**Stand:** 2026-08-28  
**Status:** PASS / FROZEN  
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
- Raster skaliert automatisch in Zehnerpotenzen mit dem aktuellen Kameraabstand; sein Ursprung bleibt fest auf Welt `0/0/0`.
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

## Gerätetest – PASS

Gerätetest am 2026-08-28 auf iPhone und iPad / Safari erfolgreich abgeschlossen.

Bestätigt wurden:

- neues Projekt und bestehende gespeicherte Projekte zeigen Objekte mit Position `0/0/0` wieder korrekt relativ zum festen Weltursprung des Rasters.
- während des Tests gefundene WD-06-Regression behoben: das adaptive Raster darf seinen Maßstab ändern, aber nicht dem Orbit-/Fokusziel folgen; Rasterursprung bleibt Welt `0/0/0`.
- Orbit-Verhalten bestätigt: die Kamera dreht um ihren aktuellen Navigationsmittelpunkt; Pan verschiebt diesen Mittelpunkt. Eine bloße Objektauswahl koppelt den Orbit-Mittelpunkt nicht automatisch an die Auswahl.
- `Fit / Fokus` setzt den Fokus bewusst auf die ausgewählte Geometrie und funktioniert nach anschließendem Orbit/Pan sowie erneutem Fokus zuverlässig.
- Einheitenumrechnung bestätigt: ein Würfel mit `1 m` Kantenlänge wird bei Wechsel auf `mm` als `1000 mm` angezeigt; äquivalente Größen werden bei `cm` korrekt als `100 cm` dargestellt, ohne die reale Geometriegröße zu verändern.
- Persistenz der Anzeigeeinheit bestätigt: Projekte in `km` bzw. `m` gespeichert und nach Wechsel/Laden wieder mit der jeweils gespeicherten Einheit hergestellt.
- großer Maßstab bestätigt: Objekt mit etwa `100 m` Ausdehnung lässt sich per `Fit / Fokus` korrekt rahmen und weiter orbitieren.
- kleiner Maßstab bestätigt: Kugel mit etwa `100 mm` Radius/Größe und geänderter Position lässt sich per `Fit / Fokus` korrekt rahmen, zoomen und orbitieren.
- Wechsel zwischen Größenbereichen sowie Speichern/Laden anschließend ohne festgestellte Abweichung getestet.

**Ergebnis:** PASS.

## Erwartetes Ergebnis

Erreicht. WD-06 ist **PASS / FROZEN**.

## Exit-Regel

Erfüllt. WD-06 wurde auf `feature/wd-06-units-large-world` getestet und freigegeben. Der freigegebene Branch darf jetzt kontrolliert nach `main` übernommen werden.
