# WD-06 – Einheiten, Maßstab & große Welt

**Stand:** 2026-08-28  
**Status:** DEFINED – IMPLEMENTATION NOT STARTED  
**Voraussetzung:** WD-05 – PASS / FROZEN

## Ziel

WD-06 macht den bestehenden CM3D-Modellierungskern belastbar für sehr kleine und sehr große reale Abmessungen, ohne die in WD-01 festgelegte interne Datenbasis zu verändern.

Die interne kanonische Längeneinheit bleibt **Meter**. Die auswählbaren Einheiten `mm`, `cm`, `m` und `km` sind Anzeige- und Eingabeeinheiten. Ein Einheitenwechsel darf niemals die tatsächliche Geometriegröße oder gespeicherten Transformdaten eines Objekts verändern.

## Verbindlicher Scope

1. Projekt-/Arbeits-Einheit `mm`, `cm`, `m`, `km` auswählbar.
2. Einheitliche Umrechnung aller relevanten numerischen Längenwerte zwischen Anzeigeeinheit und internem Meterwert.
3. Inspector zeigt Positionen, geometrische Abmessungen und Pivot-Längen in der aktiven Anzeigeeinheit an und übernimmt Eingaben korrekt zurück in Meter.
4. Bestehende Rotationswerte bleiben Grad; Scale bleibt dimensionslos.
5. Snap-/Raster-Längenwerte werden in der aktiven Anzeigeeinheit verständlich dargestellt und intern korrekt als Meterwert verwendet.
6. Einheit wechseln, ohne Objektgröße, Weltlage oder lokale Transformdaten numerisch zu verfälschen.
7. Robuste Darstellung sehr kleiner Objekte und großer Szenen durch geeignete Kamera-Near-/Far-Clipping-Strategie.
8. `Fit View / Fokus` auf die aktuelle Auswahl als WD-06-Navigationshilfe für unterschiedliche Größenordnungen.
9. Rasterdarstellung und sinnvolle Schrittweiten müssen bei unterschiedlichen Größenordnungen brauchbar bleiben; starre, überall gleiche Rasterwerte sind zu vermeiden.
10. Notwendige Einheiten-/Projektparameter werden so persistiert, dass Speichern → Reload → Laden dieselbe Anzeige-/Arbeitskonfiguration wiederherstellt, ohne die kanonischen Modelldaten umzuschreiben.

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
- `rotation` bleibt Grad in der UI und Quaternion/bestehende interne Repräsentation gemäß aktuellem Modell
- `scale` bleibt dimensionslos
- Einheitenumrechnung erfolgt an klaren UI-/Boundary-Stellen, nicht verteilt durch den gesamten Modellkern
- bestehende Objekt-IDs, Hierarchie, Reparenting, Undo/Redo und Save/Load dürfen durch WD-06 nicht regressieren
- Schemaänderung nur, wenn für persistierte Projekt-/Einheitseinstellungen tatsächlich erforderlich; keine unnötige Migration

## Abnahmekriterien

WD-06 gilt erst als PASS, wenn mindestens folgende Tests auf dem Gerät erfolgreich sind:

1. Ein Objekt mit realer Größe `0,12 m × 2,10 m × 0,12 m` anlegen bzw. einstellen.
2. Einheit `m` → `cm` wechseln: Anzeige muss `12 cm × 210 cm × 12 cm` ergeben, ohne sichtbare Größenänderung.
3. `cm` → `mm` wechseln: Anzeige muss entsprechend `120 mm × 2100 mm × 120 mm` ergeben.
4. `mm` → `km` wechseln und zurück: keine Rundungsdrift oder Größenänderung der gespeicherten Geometrie.
5. Positionswerte in jeder Einheit eingeben und prüfen, dass dieselbe Weltposition nach Einheitenwechsel korrekt umgerechnet angezeigt wird.
6. Pivot-Längenwerte in mehreren Einheiten prüfen.
7. Translation-Snap in z. B. `10 mm`, `1 cm`, `0,1 m` prüfen und kontrollieren, dass äquivalente Werte denselben realen Schritt ergeben.
8. Speichern → Browser neu laden → Projekt laden: aktive Einheit und Modelldaten müssen korrekt wiederhergestellt werden.
9. Sehr kleines Objekt erzeugen bzw. einstellen und per Fokus/Fit zuverlässig sichtbar machen.
10. Große Szene bzw. weit auseinanderliegende Objekte erzeugen und prüfen, dass Clipping nicht zu früh Geometrie abschneidet.
11. Zwischen kleinem Objekt und großer Szene mehrfach fokussieren; Orbit/Pan/Zoom müssen danach weiter funktionieren.
12. Raster-/Schrittweitenanzeige bei unterschiedlichen Größenordnungen auf sinnvolle Lesbarkeit prüfen.
13. Regressionstest: Gruppe/Baugruppe, WORLD/LOCAL, Reparenting, Duplizieren, Undo/Redo und Save/Load aus WD-05 bleiben funktionsfähig.

## Exit-Regel

WD-06 wird auf einem eigenen Arbeitsbranch implementiert. Nach Implementierung folgt ein manueller iPad-/iPhone-Safari-Gerätetest. Erst nach dokumentiertem **PASS** darf WD-06 als **PASS / FROZEN** markiert und nach `main` übernommen werden.
