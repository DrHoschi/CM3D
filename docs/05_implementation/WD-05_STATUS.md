# WD-05 – Präzisionsmodellierung & Objektstruktur

**Stand:** 2026-08-27  
**Status:** IMPLEMENTED – DEVICE TEST REQUIRED  
**Voraussetzung:** WD-04 – PASS / gesichert

## Scope

WD-05 erweitert ausschließlich die Präzisions- und Hierarchiebearbeitung des bestehenden Modellierungskerns:

1. Snap / Raster
2. numerische Schrittweiten für Verschieben, Drehen und Scale
3. Pivot / Origin sinnvoll setzen und zurücksetzen
4. Gruppe / Baugruppe auflösen
5. Reparenting mit erhaltener Weltlage
6. WORLD / LOCAL als sauber getrennte Koordinatenmodi

## Implementiert

- optionaler Snap für TransformControls
- getrennte Schrittweiten für Translation (m), Rotation (°) und Scale
- Inspector verwendet dieselben Schrittweiten für numerische Eingaben
- WORLD / LOCAL Umschaltung für Gizmo und Inspector
- persistiert werden weiterhin ausschließlich lokale Transformwerte
- Welttransform wird aus der Parent-Kette berechnet
- Reparenting sichert vor dem Parent-Wechsel die Weltmatrix und berechnet danach den neuen lokalen Transform
- Zyklus-/Selbst-Parenting wird verhindert
- Parent kann im Inspector gezielt gewählt oder auf ROOT gesetzt werden
- Gruppe und Baugruppe können wieder aufgelöst werden
- beim Auflösen behalten Kinder ihre sichtbare Weltlage
- Pivot-Preset `Zentrum`
- Pivot-Preset `Unterkante` für Box, Kugel und Zylinder
- freies Pivot-X/Y/Z bleibt erhalten
- Undo/Redo bleibt für Pivot, Reparenting, Auflösen und numerische Transformänderungen aktiv
- Projektformat bleibt CM3D Schema `0.1.0`; Snap und WORLD/LOCAL sind Runtime-/Workspace-State

## Manueller Abnahmetest

1. Quader erzeugen und auf z. B. 0,12 × 2,10 × 0,12 m setzen.
2. Snap einschalten, Translation = 0,10 m wählen und Objekt mehrfach mit Move verschieben; Position muss auf 0,10-m-Schritten landen.
3. Rotation-Snap = 15° wählen und mit Rotate drehen; Winkel muss auf 15°-Schritten landen.
4. Scale-Snap testen.
5. WORLD wählen, ein gedrehtes Objekt entlang der globalen Achsen bewegen.
6. LOCAL wählen und dasselbe Objekt entlang seiner lokalen Achsen bewegen.
7. Inspector zwischen WORLD und LOCAL umschalten und prüfen, dass die angezeigten Werte entsprechend wechseln.
8. Zwei Objekte gruppieren, Gruppe verschieben/drehen.
9. Ein Kind auswählen und im Parent-Dropdown auf ROOT setzen; seine sichtbare Weltlage darf sich nicht ändern.
10. Kind wieder in die Gruppe reparenten; Weltlage muss erneut erhalten bleiben.
11. Gruppe bzw. Baugruppe auswählen und `Auflösen` drücken; Kinder müssen sichtbar an derselben Stelle bleiben.
12. Pivot `Unterkante` und danach `Zentrum` testen; Gizmo-Ursprung muss entsprechend wechseln.
13. Undo/Redo für Reparenting, Auflösen und Pivot prüfen.
14. Speichern → Browser neu laden → Laden; Hierarchie und lokale Transformdaten müssen korrekt wiederhergestellt werden.

## Nicht-Scope

- Mesh-/Vertex-Snapping
- Oberflächen-/Kanten-Snapping
- frei definierbare Konstruktionsachsen
- komplexe Constraints
- Booleans
- Sketches
- Materialien / Texturen
- Drag&Drop-Reparenting im Objektbaum

## Exit-Regel

WD-05 wird erst nach erfolgreichem manuellen Gerätetest als PASS/FROZEN nach `main` übernommen.
