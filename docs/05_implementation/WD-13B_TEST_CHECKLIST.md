# WD-13B – Device Test Checklist

**Branch:** `feature/wd-13b-feature-parameters-inspector`  
**Zielgerät:** iPad / Safari / GitHub Pages

## A – Inspector

1. Geschlossene Skizze erzeugen und extrudieren.
2. Extrusion im Operationsbaum auswählen.
3. Prüfen, dass im Inspector der Bereich **Extrusion** erscheint.
4. Prüfen, dass Tiefe, Richtung und Quellskizze angezeigt werden.

## B – Tiefe

1. Bestehende Extrusion auswählen.
2. Tiefe auf einen deutlich anderen Wert ändern.
3. Prüfen, dass sich dieselbe Extrusion unmittelbar geometrisch ändert.
4. Prüfen, dass keine zusätzliche Operation im Baum entsteht.
5. Undo: ursprüngliche Tiefe muss zurückkehren.
6. Redo: geänderte Tiefe muss wiederhergestellt werden.

## C – Richtung

Mit derselben Extrusion nacheinander prüfen:

1. **Positiv**: Körper liegt auf positiver Seite der Skizzenebene.
2. **Negativ**: Körper wechselt auf die negative Seite.
3. **Symmetrisch**: Körper liegt mit halber Tiefe auf beiden Seiten der Skizzenebene.
4. Jede Änderung darf keine neue Extrusion erzeugen.

## D – Einheiten

1. Längeneinheit wechseln, z. B. m → cm oder mm.
2. Extrusion erneut auswählen.
3. Prüfen, dass die angezeigte Tiefe korrekt in der neuen Einheit dargestellt wird.
4. Tiefe in der neuen Einheit ändern und geometrisches Ergebnis prüfen.

## E – Quellverknüpfung

1. Nach mehreren Parameteränderungen die Quellskizze auswählen und einen Punkt verschieben.
2. Prüfen, dass die bestehende Extrusion weiterhin aus derselben Skizze aktualisiert wird.
3. Operationsbaum darf keine zusätzliche Extrusion anlegen.

## F – Save / Load

1. Tiefe und Richtung ändern.
2. Projekt speichern.
3. Projekt neu laden.
4. Prüfen, dass Tiefe und Richtung erhalten bleiben.
5. Prüfen, dass die Extrusion weiterhin unter derselben Skizze im Operationsbaum erscheint.

## PASS-Kriterium

WD-13B kann auf **PASS / FROZEN** gesetzt werden, wenn A–F auf dem Zielgerät ohne Funktionsfehler bestanden sind.
