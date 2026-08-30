# WD-13B – Feature-Parameter im Inspector

**Status:** PASS / FROZEN  
**Branch:** `feature/wd-13b-feature-parameters-inspector`  
**Basis:** `feature/wd-13a-feature-operations-tree-core` (WD-13A PASS / FROZEN)

## Ziel

WD-13B macht die bereits existierende Extrusionsoperation nachträglich parametrisch bearbeitbar. Die Operation bleibt dasselbe `feature.extrude`-Objekt und behält ihre `sourceSketchId`.

## Umgesetzt

Bei Auswahl einer `feature.extrude` erscheint im Inspector ein eigener Bereich **Extrusion** mit:

- Tiefe in der aktuell eingestellten Längeneinheit;
- Richtung `Positiv`;
- Richtung `Negativ`;
- Richtung `Symmetrisch`;
- Anzeige der verknüpften Quellskizze.

Die Parameter werden direkt im vorhandenen Objekt gespeichert:

- `data.depth`
- `data.direction`

Es wird keine neue Extrusion erzeugt und keine zweite Feature-Struktur angelegt.

## Runtime-Verhalten

Die Runtime wertet `data.direction` tatsächlich aus:

- `positive`: Extrusion von der Skizzenebene in positive lokale Z-Richtung;
- `negative`: Extrusion gleicher Tiefe in negative lokale Z-Richtung;
- `symmetric`: Gesamttiefe wird mittig um die Skizzenebene verteilt.

Damit sind alle im Inspector angebotenen Richtungsoptionen geometrisch wirksam.

## History / Persistenz

Eine abgeschlossene Parameteränderung erzeugt einen History-Eintrag `Extrusionsparameter ändern`.

Da die Werte Bestandteil des bestehenden SceneGraph-Objekts sind, laufen Undo/Redo und Save/Load über das vorhandene Projektmodell.

## Unverändert

- Quellskizze und `sourceSketchId`;
- Feature-/Operationsbaum aus WD-13A;
- Transform-Hierarchie;
- Profilableitung aus der Skizze;
- bestehende allgemeine Objekttransformation.

## Nicht Bestandteil

- Draft/Taper;
- Start-/Endoffsets;
- Zwei-Seiten-Extrusion mit unterschiedlichen Tiefen;
- Feature-Reihenfolge;
- Suppress/Unsuppress;
- Boolean-Operationen;
- weitere CAD-Features.

## Geräteabnahme

**Datum:** 2026-08-29  
**Gerät:** iPad / Safari / GitHub Pages  
**Ergebnis:** PASS

Der praktische Gerätetest wurde vollständig durchgeführt und als erfolgreich bestätigt. Geprüft wurden die für WD-13B vorgesehenen Kernpfade, insbesondere nachträgliche Extrusionsparameter, wirksame Richtungsumschaltung, bestehende Feature-Identität, Undo/Redo sowie Persistenz über Speichern und Laden.

## Abnahme

WD-13B ist praktisch geprüft und abgenommen.

**Finaler Status: PASS / FROZEN.**
