# WD-12A – Skizzenbearbeitung V1

**Status:** IMPLEMENTED / DEVICE TEST PENDING  
**Branch:** `feature/wd-12a-sketch-editing-v1`  
**Basis:** `feature/wd-11c-selection-partial-project-merge` (WD-11C PASS / FROZEN)

## Ziel

WD-12A macht vorhandene Skizzen erstmals nachträglich elementweise bearbeitbar. Linien und Punkte bleiben Bestandteile der Skizze und werden nicht als eigenständige Szenenobjekte modelliert.

## 1 – Skizzenelemente im Objektbaum

Unter einem Objekt vom Typ `sketch` werden zusätzlich dargestellt:

- `Linien (n)` mit den einzelnen Linien;
- `Punkte (n)` mit den einzelnen Skizzenpunkten.

Ein Klick auf eine Linie oder einen Punkt wählt das Skizzenelement aus. Die Skizze bleibt dabei das aktive Szenenobjekt; Transform-Werkzeuge werden für die Elementauswahl nicht an die komplette Skizze angehängt.

## 2 – Direktauswahl im Viewport

Skizzenlinien und Skizzenpunkte sind zusätzlich im Viewport auswählbar.

- Linien bleiben gelb dargestellt;
- Punkte erhalten sichtbare Auswahlmarker;
- das aktuell gewählte Element wird hervorgehoben;
- verdeckte Skizzenelemente übersteuern nicht absichtlich ein davor liegendes 3D-Objekt.

## 3 – Inspector für Punkte

Bei ausgewähltem Punkt zeigt der Inspector:

- Element-ID;
- X-Koordinate;
- Y-Koordinate.

X/Y werden in der aktuell eingestellten Anzeigeeinheit gezeigt und beim Ändern wieder in interne Meterwerte umgerechnet.

## 4 – Inspector für Linien

Bei ausgewählter Linie zeigt der Inspector die Koordinaten beider Endpunkte:

- Startpunkt A: X / Y;
- Endpunkt B: X / Y.

Die Änderung wirkt auf die tatsächlich referenzierten Skizzenpunkte. Werden Punkte von mehreren Linien gemeinsam genutzt, bleiben diese topologisch gemeinsam.

## 5 – Löschen

Ein ausgewähltes Skizzenelement kann über den Inspector oder den bestehenden Befehl `Bearbeiten → Löschen` entfernt werden.

### Linie löschen

- die Linie wird entfernt;
- ihre Endpunkte werden nur dann automatisch entfernt, wenn sie danach von keiner anderen Linie mehr verwendet werden.

### Punkt löschen

- der Punkt wird entfernt;
- alle Linien, die diesen Punkt referenzieren, werden ebenfalls entfernt.

Das Löschen eines Skizzenelements löscht nicht die komplette Skizze.

## 6 – Extrusionsabhängigkeit

Existiert eine `feature.extrude`, deren `sourceSketchId` auf die bearbeitete Skizze zeigt, wird sie nach einer Skizzenänderung neu aus der aktuellen Kontur abgeleitet.

### Kontur weiterhin gültig

- Profil wird neu berechnet;
- eingebettete Profilpunkte/Lineage werden aktualisiert;
- Extrusionsgeometrie wird beim Runtime-Rebuild neu erzeugt.

### Kontur offen oder ungültig

- die abhängige Extrusion behält keine veraltete sichtbare Geometrie;
- `data.profile` wird auf `null` gesetzt;
- `extensions.sketchDependency.status = invalid`;
- Diagnosen der Profilprüfung werden gespeichert;
- sobald die Kontur wieder gültig ist, wird die Extrusion wieder aus dem neuen Profil aufgebaut.

Damit gibt es keinen Zustand „Skizze geändert, aber Extrusion zeigt stillschweigend die alte Form“.

## 7 – Undo / Redo

Folgende Aktionen bilden jeweils einen eigenen Historieneintrag:

- Skizzenpunkt ändern;
- Skizzenlinie ändern;
- Skizzenlinie löschen;
- Skizzenpunkt löschen.

Der jeweilige Zustand abhängiger Extrusionen ist Bestandteil desselben Undo-/Redo-Schrittes.

## Nicht Bestandteil von WD-12A

- Draggen einzelner Skizzenpunkte mit einem eigenen 2D-Gizmo;
- Constraints wie horizontal/vertikal, parallel, senkrecht, tangential;
- Maßbedingungen und parametrische Bemaßung;
- Trim/Extend/Fillet;
- automatisches Verschmelzen naher Punkte;
- Mehrfachauswahl mehrerer Skizzenlinien/-punkte;
- Kurven, Kreise oder Bögen.

## Abnahme

WD-12A bleibt bis zum Gerätetest auf iPad/iPhone Safari **IMPLEMENTED / DEVICE TEST PENDING**.

Die Prüfliste liegt in `WD-12A_TEST_CHECKLIST.md`.
