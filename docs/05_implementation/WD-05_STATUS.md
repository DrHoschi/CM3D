# WD-05 – Präzisionsmodellierung & Objektstruktur

**Stand:** 2026-08-28  
**Status:** PASS / FROZEN  
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

## Gerätetest / Abschluss

Der manuelle Gerätetest auf iPad/Safari wurde erfolgreich abgeschlossen.

Dabei wurden zwei Regressionen gefunden und vor Abschluss von WD-05 behoben:

1. Three.js-Rebuild erzeugte sichtbare Geometrie-Reste. Lösung: dedizierter CM3D-Modell-Root und kontrolliertes Runtime-Cleanup vor dem Neuaufbau.
2. Duplizieren von Gruppen/Baugruppen kopierte zunächst nur den Container. Lösung: rekursive Deep-Copy der vollständigen Kind-/Enkelstruktur mit neuen `objectId`-Werten und neu verdrahteten `parentId`-Beziehungen.

Die Regressionen wurden im Gerätetest nachgeprüft. WD-05 wurde anschließend als bestandener Stand in `main` übernommen.

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

**Erfüllt.** WD-05 ist nach erfolgreichem Gerätetest **PASS / FROZEN** und fachlich geschlossen. Änderungen an WD-05 erfolgen nicht stillschweigend im Rahmen späterer Entwicklungsblöcke.
