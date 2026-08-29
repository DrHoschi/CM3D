# WD-13B – Feature-Parameter im Inspector

**Status:** IMPLEMENTED / DEVICE TEST REQUIRED  
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

Die Runtime wertet `data.direction` jetzt tatsächlich aus:

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

## Abnahme

Vor PASS / FROZEN ist der praktische iPad-/Safari-Test nach `WD-13B_TEST_CHECKLIST.md` erforderlich.

**Aktueller Status: IMPLEMENTED / DEVICE TEST REQUIRED.**
