# WD-12B – Gerätetest

**Status:** PASS / FROZEN  
**Zielgerät:** iPad/iPhone Safari  
**Praktisch getestet:** iPad, 2026-08-29  
**Branch:** `feature/wd-12b-sketch-gizmo-plane-editing`

## Praktische Abnahme

Der praktisch durchgeführte iPad-Test bestätigt den WD-12B-Kernumfang:

- Punkt auswählen und per Gizmo verschieben: PASS;
- Linie auswählen und per Gizmo verschieben: PASS;
- mehrere Skizzenelemente auswählen und gemeinsam verschieben: PASS;
- achsweise Bewegung sowie freie diagonale XY-Bewegung: PASS;
- erste Elementauswahl richtet den Viewer auf die Skizzenebene aus: akzeptiertes Sollverhalten;
- während und nach dem Verschieben springt bzw. zentriert der Viewer nicht hinterher: PASS;
- im praktisch getesteten Umfang wurden keine weiteren Fehler festgestellt.

Die nachfolgende detaillierte Prüfliste bleibt als Regressionstest erhalten. Nicht einzeln protokollierte Unterpunkte werden bewusst nicht nachträglich als separat getestet markiert.

## A – Ebenenausrichtung

1. Skizze anlegen und Rechteck zeichnen.
2. Einen Punkt auswählen.

Erwartung:

- [ ] Kamera richtet sich bei der ersten Elementauswahl senkrecht auf die Skizzenebene aus.
- [ ] Ausgewähltes Element bleibt gut sichtbar.
- [ ] Freie Kameradrehung ist während der Elementbearbeitung deaktiviert.
- [ ] Nach einem Gizmo-Drag erfolgt keine Nachzentrierung.
- [ ] Auswahl eines normalen 3D-Objekts gibt die normale Kamerabedienung wieder frei.

## B – Punkt-Gizmo

- [ ] Gizmo sitzt auf dem ausgewählten Punkt.
- [ ] X-Griff verschiebt nur in lokaler X-Richtung.
- [ ] Y-Griff verschiebt nur in lokaler Y-Richtung.
- [ ] Gelbe XY-Fläche verschiebt frei diagonal in X/Y.
- [ ] Kamera dreht oder springt während des Drags nicht.
- [ ] Verbundene Linien folgen dem Punkt.

## C – Linien-Gizmo

- [ ] Gizmo sitzt ungefähr in der Linienmitte.
- [ ] X/Y-Griffe verschieben die komplette Linie achsweise.
- [ ] Gelbe XY-Fläche verschiebt die komplette Linie frei in der Ebene.
- [ ] Beide Endpunkte bewegen sich um dasselbe Delta.
- [ ] Linienlänge und Richtung ändern sich durch das reine Verschieben nicht.
- [ ] Angrenzende Linien bleiben an gemeinsam genutzten Punkten verbunden.

## D – Mehrfachselektion

- [ ] Mehrere Punkte können gemeinsam ausgewählt werden.
- [ ] Mehrere Linien können gemeinsam ausgewählt werden.
- [ ] Gemischte Auswahl aus Punkt und Linie ist möglich.
- [ ] Gemeinsames Gizmo sitzt im Mittelpunkt der Auswahl.
- [ ] Gemeinsame Punkt-IDs ausgewählter Linien werden nur einmal bewegt.
- [ ] Gesamte Auswahl lässt sich achsweise und diagonal verschieben.

## E – Snap

- [ ] Ohne Snap ist freie Bewegung möglich.
- [ ] Mit Snap rastet die Bewegung auf dem eingestellten Translate-Schritt ein.
- [ ] X/Y-Achsengriffe beschränken die Bewegung auf die jeweilige Achse.
- [ ] XY-Fläche snappt X und Y.
- [ ] Mehrfachauswahl verwendet einen gemeinsamen gesnappten Verschiebevektor.

## F – Extrusion live

1. Geschlossene Skizze extrudieren.
2. Danach einen Punkt, eine Linie oder eine Mehrfachauswahl der Quellskizze per Gizmo ziehen.

Erwartung:

- [ ] Extrusionsform folgt sichtbar der Skizzenänderung.
- [ ] Keine alte Extrusionsgeometrie bleibt stehen.
- [ ] Bedienung bleibt während des Drags stabil.

## G – Undo / Redo

- [ ] Ein kompletter Einzel-Drag wird mit genau einem Undo zurückgenommen.
- [ ] Ein kompletter Mehrfach-Drag wird mit genau einem Undo zurückgenommen.
- [ ] Es entstehen keine Undo-Schritte für Zwischenpositionen.
- [ ] Redo stellt die Endposition wieder her.
- [ ] Eine abhängige Extrusion folgt demselben Undo/Redo-Schritt.

## H – Regression WD-12A

- [ ] Punkt/Linie weiterhin im Objektbaum auswählbar.
- [ ] Punkt/Linie weiterhin direkt im Viewport auswählbar.
- [ ] Inspector-Koordinatenbearbeitung funktioniert weiterhin.
- [ ] Element löschen funktioniert weiterhin.
- [ ] Normale Objekttransformation funktioniert weiterhin.
- [ ] Extrudieren funktioniert weiterhin.

## UI-Nacharbeit

Die derzeitige Platzierung des Mehrfachauswahl-Schalters im Skizzen-Inspector ist kein Funktionsfehler und kein WD-12B-Blocker. Seine endgültige Einordnung erfolgt im nachfolgenden UI-Strukturblock zusammen mit Objektbaum, Inspector und kontextueller Werkzeug-/Auswahlleiste.

## Abnahmeregel

Der praktische iPad-Test ist bestanden. WD-12B ist **PASS / FROZEN**.