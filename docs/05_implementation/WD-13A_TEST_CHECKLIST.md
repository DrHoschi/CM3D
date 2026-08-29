# WD-13A – Test-Checkliste

Branch: `feature/wd-13a-feature-operations-tree-core`

## A – Grunddarstellung

- [ ] Anwendung zeigt Build-Kennung `WD-13A`.
- [ ] Eine neue geschlossene Skizze kann wie in WD-12A/WD-12B erstellt werden.
- [ ] Die Skizze zeigt weiterhin ihre Linien und Punkte im Objektbaum.
- [ ] Nach `Extrudieren` erscheint unter derselben Skizze zusätzlich `Operationen (1)`.
- [ ] Darunter erscheint die erzeugte Extrusion als `Extrusion 1 · …`.
- [ ] Dieselbe Extrusion erscheint nicht zusätzlich als separates Root-Objekt.

## B – Auswahl

- [ ] Tippen/Klicken auf die Extrusionsoperation wählt die reale Extrusion aus.
- [ ] Die Operation wird im Objektbaum als ausgewählt hervorgehoben.
- [ ] Der Inspector zeigt das ausgewählte Objekt als `feature.extrude`.
- [ ] Auswahl der Quellskizze funktioniert danach weiterhin normal.
- [ ] Auswahl einzelner Linien/Punkte aus WD-12A/WD-12B funktioniert weiterhin.

## C – Runtime / Regression

- [ ] Die 3D-Geometrie der Extrusion ist unverändert sichtbar.
- [ ] Fit/Fokus auf die ausgewählte Extrusion funktioniert weiterhin.
- [ ] Verschieben/Bearbeiten eines Skizzenelements aktualisiert die abhängige Extrusion weiterhin live.
- [ ] Undo/Redo einer Skizzenänderung funktioniert weiterhin.
- [ ] Löschen der Extrusion entfernt die Operation aus dem Baum.
- [ ] Undo des Löschens stellt die Operation wieder unter der Skizze her.

## D – Mehrere Operationen

- [ ] Dieselbe geschlossene Skizze ein zweites Mal extrudieren.
- [ ] Der Baum zeigt `Operationen (2)`.
- [ ] Beide Extrusionen sind einzeln auswählbar.
- [ ] Keine der beiden Extrusionen erscheint doppelt als Root.

## E – Save / Load

- [ ] Projekt speichern bzw. als `.cm3d.json` exportieren.
- [ ] Projekt neu laden/importieren.
- [ ] Quellskizze und Extrusion(en) bleiben erhalten.
- [ ] Die Feature-/Operationsdarstellung wird nach dem Laden wieder korrekt aus `sourceSketchId` abgeleitet.

## F – Gerätetest iPad / iPhone Safari

- [ ] Operationszeile lässt sich zuverlässig per Touch auswählen.
- [ ] Objektbaum bleibt scrollbar und praktisch bedienbar.
- [ ] Keine Regression bei Sketch-Gizmo und Mehrfachauswahl.
- [ ] Keine sichtbaren Doppelobjekte oder Auswahlfehler.

## PASS-Kriterium

WD-13A wird erst auf **PASS / FROZEN** gesetzt, wenn die Kernpunkte A–E und der relevante Safari-Gerätetest bestanden sind.
