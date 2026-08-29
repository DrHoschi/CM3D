# WD-12A – Gerätetest

**Status:** PASS / FROZEN  
**Zielgerät:** iPad/iPhone Safari  
**Branch:** `feature/wd-12a-sketch-editing-v1`

## Praktische Abnahme 2026-08-29

Der Anwender hat WD-12A auf dem iPad praktisch getestet und keine Fehler im vorgesehenen Funktionsumfang festgestellt.

Explizit bestätigt:

- Punkt-/Linienelemente lassen sich auswählen und über den Inspector bearbeiten.
- Koordinatenänderungen werden in der Skizze sichtbar übernommen.
- Eine abhängige Extrusion aktualisiert sich mit der bearbeiteten Skizze.
- Die übrigen praktisch getesteten WD-12A-Funktionen zeigten keinen festgestellten Fehler.

Nicht als fehlgeschlagener Test zu werten:

- Direktes Ziehen eines Punktes oder einer Linie per Finger/Gizmo ist in WD-12A noch nicht implementiert und war deshalb nicht Bestandteil der Abnahme. Das wird als Folgefunktion WD-12B vorgesehen.

Die detaillierte Prüfliste bleibt als Regressionstest erhalten; einzelne Unterpunkte werden nicht nachträglich als separat bestätigt markiert, wenn sie nicht einzeln protokolliert wurden.

## A – Objektbaum

1. Neue Skizze anlegen.
2. Rechteck oder Polygon zeichnen.

Erwartung:

- [ ] Unter der Skizze erscheinen `Linien (n)` und die einzelnen Linien.
- [ ] Unter der Skizze erscheinen `Punkte (n)` und die einzelnen Punkte.
- [ ] Eine Linie lässt sich im Baum auswählen.
- [ ] Ein Punkt lässt sich im Baum auswählen.
- [ ] Die komplette Skizze bleibt separat auswählbar.

## B – Viewport-Auswahl

- [ ] Skizzenlinien sind direkt im Viewport anwählbar.
- [ ] Skizzenpunkte sind direkt im Viewport anwählbar.
- [ ] Das gewählte Element wird sichtbar hervorgehoben.
- [ ] Beim Auswählen eines Skizzenelements wird nicht der Transform-Gizmo der ganzen Skizze aktiviert.

## C – Punkt ändern

1. Einen Skizzenpunkt auswählen.
2. X oder Y im Inspector ändern.

Erwartung:

- [ ] Inspector zeigt Punkt-ID und X/Y.
- [ ] Punkt verschiebt sich auf die neue Koordinate.
- [ ] Verbundene Linien folgen dem Punkt.
- [ ] Anzeigeeinheit wird korrekt berücksichtigt.

## D – Linie ändern

1. Eine Linie auswählen.
2. Koordinate von Startpunkt A oder Endpunkt B ändern.

Erwartung:

- [ ] Inspector zeigt beide Endpunkte A/B mit X/Y.
- [ ] Linie ändert sich entsprechend.
- [ ] Gemeinsam verwendete Punkte bleiben mit angrenzenden Linien verbunden.

## E – Linie löschen

1. Eine Linie auswählen.
2. `Bearbeiten → Löschen` oder `Element löschen` verwenden.

Erwartung:

- [ ] Nur die gewählte Linie wird entfernt.
- [ ] Die komplette Skizze bleibt bestehen.
- [ ] Endpunkte bleiben erhalten, wenn andere Linien sie weiterhin verwenden.
- [ ] Nicht mehr verwendete Endpunkte werden entfernt.

## F – Punkt löschen

1. Einen Punkt auswählen.
2. Löschen.

Erwartung:

- [ ] Punkt wird entfernt.
- [ ] Alle Linien mit Referenz auf diesen Punkt werden entfernt.
- [ ] Die komplette Skizze bleibt bestehen.

## G – Abhängige Extrusion aktualisieren

1. Geschlossenes Rechteck zeichnen.
2. Rechteck extrudieren.
3. Skizzenpunkt auswählen und über den Inspector verschieben, Kontur aber geschlossen lassen.

Erwartung:

- [ ] Extrusion ändert ihre Form passend zur geänderten Skizze.
- [ ] Keine alte Extrusionsgeometrie bleibt sichtbar.

## H – Profil absichtlich öffnen

1. Eine geschlossene extrudierte Skizze verwenden.
2. Eine Konturlinie löschen.

Erwartung:

- [ ] Skizze ist offen.
- [ ] Abhängige Extrusionsgeometrie verschwindet statt die alte Form weiter anzuzeigen.
- [ ] Projekt bleibt bedienbar.

Danach die Kontur wieder gültig herstellen bzw. Undo verwenden:

- [ ] Extrusionsgeometrie erscheint wieder korrekt.

## I – Undo / Redo

- [ ] Punktänderung lässt sich mit einem Undo vollständig zurücknehmen.
- [ ] Redo stellt Punktänderung wieder her.
- [ ] Linienlöschung lässt sich mit einem Undo vollständig zurücknehmen.
- [ ] Der Zustand einer abhängigen Extrusion folgt demselben Undo/Redo-Schritt.

## J – Regression

- [ ] Neue Skizze anlegen funktioniert weiterhin.
- [ ] Linie zeichnen funktioniert weiterhin.
- [ ] Rechteck zeichnen funktioniert weiterhin.
- [ ] Polygon zeichnen funktioniert weiterhin.
- [ ] Extrudieren funktioniert weiterhin.
- [ ] Objekt-Transform funktioniert für normale 3D-Objekte weiterhin.
- [ ] WD-11C Objekte dazuladen/Teilprojekt wird nicht sichtbar beeinträchtigt.

## Abnahmeregel

Praktischer iPad-Gerätetest bestanden. **WD-12A = PASS / FROZEN.**
