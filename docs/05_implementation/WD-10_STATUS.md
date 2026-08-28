# WD-10 – Material / Farbe

**Stand:** 2026-08-28  
**Status:** WD-10A PASS / FROZEN  
**Voraussetzung:** WD-09 – PASS / FROZEN

## WD-10A – Materialzuweisung & Basisfarbe

**Ergebnis:** PASS / FROZEN.

Implementiert auf `feature/wd-10-material-color`:

- persistente Materialoperationen in `src/application/material.js`
- bestehende Projekt-Material-Map bleibt die verbindliche Quelle
- Primitive und `feature.extrude` verwenden dieselbe Materialbindung über `materialIds`
- Material kann einem ausgewählten Oberflächenobjekt zugewiesen werden
- Basisfarbe `baseColor` kann persistent geändert werden
- neues Material kann aus dem Inspector angelegt und direkt dem aktiven Objekt zugewiesen werden
- Materialänderungen laufen über Undo/Redo und den bestehenden Speichern/Laden-Pfad
- Sketch, Group und Assembly erhalten in WD-10A bewusst kein Oberflächenmaterial
- Material/Farbe erscheint kontextbezogen im Inspector nur bei unterstützten Objekttypen
- keine Schema-Migration; `schemaVersion` bleibt `0.1.0`

## Gerätetest WD-10A – PASS

Auf iPad / Safari erfolgreich geprüft:

1. Basisfarbe eines Objekts ändern → PASS.
2. unterschiedlichen Komponenten einzelne Farben zuweisen → PASS.
3. neue Materialien anlegen und Objekten zuweisen → PASS.
4. Materialzuweisungen und Farben speichern → PASS.
5. Projekt neu laden → Materialbindungen und Farben vollständig erhalten → PASS.

Die Projektleitung hat WD-10A anschließend zur Übernahme nach `main` freigegeben.

## Verbindliche spätere Modellierungs-Follow-ups

Nicht Teil von WD-10A, aber für spätere Modellierungsblöcke vorgemerkt:

- **Revolve / Rotationskörper:** Profil um eine definierte Achse rotieren, inkl. Winkel und Achsbezug.
- **Spline:** freie/parametrische Kurven als Sketch-Geometrie.
- **Kreis:** parametrischer Mittelpunkt/Radius.
- **Ellipse:** parametrische Haupt-/Nebenachse und Orientierung.
- **N-Gon / regelmäßiges Polygon:** Mittelpunkt, Radius bzw. Durchmesser, Anzahl Ecken und Orientierung frei parametrierbar.
- spätere Extrude-/Revolve-Werkzeugparameter bevorzugt kontextbezogen im Inspector statt dauerhaft in der Toolbar.

Diese Punkte werden nicht rückwirkend in den bereits gefrorenen WD-08/WD-09-Scope gezogen, sondern in einem späteren Sketch-/Feature-Ausbaublock sauber ergänzt.

## Exit WD-10A

Erfüllt. WD-10A ist **PASS / FROZEN** und darf nach `main` übernommen werden. Der nächste WD-10-Unterblock wird separat auf eigener Branch-Basis festgelegt.