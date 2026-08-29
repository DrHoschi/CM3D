# WD-12B – Gerätetest

**Status:** TEST PENDING  
**Zielgerät:** iPad/iPhone Safari  
**Branch:** `feature/wd-12b-sketch-gizmo-plane-editing`

## A – Ebenenausrichtung

1. Skizze anlegen und Rechteck zeichnen.
2. Einen Punkt auswählen.

Erwartung:

- [ ] Kamera richtet sich senkrecht auf die Skizzenebene aus.
- [ ] Ausgewählter Punkt bleibt gut sichtbar.
- [ ] Freie Kameradrehung ist während der Elementbearbeitung deaktiviert.
- [ ] Auswahl eines normalen 3D-Objekts gibt die freie Kameradrehung wieder frei.

## B – Punkt-Gizmo

- [ ] Gizmo sitzt auf dem ausgewählten Punkt.
- [ ] X-Griff verschiebt nur in lokaler X-Richtung.
- [ ] Y-Griff verschiebt nur in lokaler Y-Richtung.
- [ ] Mittlerer Griff verschiebt frei in X/Y.
- [ ] Kamera dreht oder springt während des Drags nicht.
- [ ] Verbundene Linien folgen dem Punkt.

## C – Linien-Gizmo

1. Eine Skizzenlinie auswählen.

Erwartung:

- [ ] Gizmo sitzt ungefähr in der Linienmitte.
- [ ] X/Y-Griffe verschieben die komplette Linie achsweise.
- [ ] Mittlerer Griff verschiebt die komplette Linie frei in der Ebene.
- [ ] Beide Endpunkte bewegen sich um dasselbe Delta.
- [ ] Linienlänge und Richtung ändern sich durch das reine Verschieben nicht.
- [ ] Angrenzende Linien bleiben an gemeinsam genutzten Punkten verbunden.

## D – Snap

1. Snap deaktivieren und Punkt frei ziehen.
2. Snap aktivieren und einen eindeutigen Verschiebeschritt einstellen.
3. Punkt erneut ziehen.

Erwartung:

- [ ] Ohne Snap ist freie Bewegung möglich.
- [ ] Mit Snap rastet die Bewegung auf dem eingestellten Translate-Schritt ein.
- [ ] X/Y-Achsengriffe beschränken Snap auf die jeweilige Achse.
- [ ] Mittlerer Griff snappt X und Y.

## E – Extrusion live

1. Geschlossenes Rechteck extrudieren.
2. Danach einen Punkt der Quellskizze per Gizmo ziehen.

Erwartung:

- [ ] Extrusionsform folgt sichtbar der Skizzenänderung.
- [ ] Keine alte Extrusionsgeometrie bleibt stehen.
- [ ] Bedienung bleibt während des Drags stabil.

## F – Undo / Redo

1. Einen Punkt über eine längere Fingerbewegung verschieben.
2. Loslassen.
3. Einmal Undo.

Erwartung:

- [ ] Der gesamte Drag wird mit genau einem Undo zurückgenommen.
- [ ] Es sind keine vielen Zwischen-Undo-Schritte nötig.
- [ ] Redo stellt die Endposition wieder her.
- [ ] Eine abhängige Extrusion folgt demselben Undo/Redo-Schritt.

## G – Regression WD-12A

- [ ] Punkt/Linie weiterhin im Objektbaum auswählbar.
- [ ] Punkt/Linie weiterhin direkt im Viewport auswählbar.
- [ ] Inspector-Koordinatenbearbeitung funktioniert weiterhin.
- [ ] Element löschen funktioniert weiterhin.
- [ ] Normale Objekttransformation funktioniert weiterhin.
- [ ] Extrudieren funktioniert weiterhin.

## Abnahmeregel

WD-12B wird nach bestandenem praktischen Gerätetest auf **PASS / FROZEN** gesetzt.
