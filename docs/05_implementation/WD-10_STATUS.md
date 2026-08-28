# WD-10 – Material / Farbe

**Stand:** 2026-08-28  
**Status:** WD-10A IMPLEMENTED – DEVICE TEST REQUIRED  
**Voraussetzung:** WD-09 – PASS / FROZEN

## WD-10A – Materialzuweisung & Basisfarbe

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

## Gerätetest WD-10A

1. Würfel auswählen; Material/Farbe erscheint im Inspector.
2. Basisfarbe ändern; Würfel aktualisiert sich sofort.
3. neues Material anlegen; es wird dem aktiven Objekt zugewiesen.
4. zweites Objekt auswählen und dasselbe Material zuweisen; beide verwenden dieselbe persistente Materialdefinition.
5. Extrude-Körper auswählen; Material/Farbe funktioniert identisch.
6. Undo/Redo für Farb- bzw. Materialänderung prüfen.
7. Projekt speichern/laden; Materialbindung und Farbe bleiben erhalten.
8. Skizze auswählen; Materialbereich soll nicht angeboten werden.

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

WD-10A wird erst nach erfolgreichem Gerätetest und explizitem `WD-10A PASS` geschlossen / FROZEN. `main` bleibt bis dahin unverändert.
