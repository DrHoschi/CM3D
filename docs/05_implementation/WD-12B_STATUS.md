# WD-12B – Skizzen-Gizmo & Ebenenbearbeitung

**Status:** PASS / FROZEN  
**Branch:** `feature/wd-12b-sketch-gizmo-plane-editing`  
**Basis:** `feature/wd-12a-sketch-editing-v1` (WD-12A PASS / FROZEN)

## Ziel

WD-12B ergänzt die in WD-12A eingeführte elementweise Skizzenbearbeitung um eine direkte, touch-taugliche Verschiebung von Punkten und Linien in der aktiven Skizzenebene sowie um Mehrfachselektion.

## 1 – Kamera auf Skizzenebene ausrichten

Bei der ersten Auswahl eines Skizzenelements wird die Kamera senkrecht auf die reale lokale XY-Ebene der Skizze ausgerichtet. Der Auswahlmittelpunkt dient dabei als Bearbeitungsziel und die lokale Y-Richtung der Skizze als Kamera-Up.

Dieses einmalige Ausrichten ist beabsichtigt und wurde im Gerätetest akzeptiert. Während und nach dem anschließenden Verschieben eines Punkts, einer Linie oder einer Mehrfachauswahl bleibt der Viewer stehen und zentriert nicht auf das verschobene Element nach.

Während der Elementbearbeitung bleibt freie Orbit-Drehung deaktiviert. Außerhalb der Skizzenelement-Auswahl wird die normale Kamerabedienung wieder freigegeben.

## 2 – Move-artiges 2D-Gizmo

Das Skizzen-Gizmo orientiert sich visuell am normalen Move-Werkzeug:

- rote X-Achse;
- grüne Y-Achse;
- gelbe XY-Fläche für freie diagonale Bewegung.

Die sichtbaren Griffe besitzen vergrößerte unsichtbare Trefferbereiche für Touch-Bedienung.

## 3 – Einzelpunkt verschieben

Bei einem ausgewählten Punkt sitzt das Gizmo auf dem Punkt.

- X-Griff: nur lokale X-Richtung;
- Y-Griff: nur lokale Y-Richtung;
- gelbe XY-Fläche: freie Bewegung in lokal X/Y.

Die Punkt-ID bleibt unverändert. Verbundene Linien folgen demselben Punkt.

## 4 – Einzellinie verschieben

Bei einer ausgewählten Linie sitzt das Gizmo in der Linienmitte.

Beim Verschieben werden beide referenzierten Endpunkte um denselben lokalen Delta-Wert verschoben. Damit bewegt sich die komplette Linie parallel. Topologisch gemeinsam genutzte Endpunkte bleiben echte gemeinsame Punkte.

## 5 – Mehrfachselektion

WD-12B unterstützt:

- mehrere Punkte;
- mehrere Linien;
- gemischte Auswahl aus Punkten und Linien;
- gemeinsames Move-Gizmo im Mittelpunkt der gesamten Auswahl.

Für die Bewegung werden die tatsächlich betroffenen Punkt-IDs zuerst eindeutig gesammelt. Ein gemeinsamer Eckpunkt mehrerer ausgewählter Linien wird deshalb nur einmal verschoben.

Die aktuell im Skizzen-Inspector platzierte Mehrfachauswahl-Umschaltung ist funktional, ihre endgültige Platzierung ist jedoch bewusst ein nachfolgender UI-Strukturpunkt und kein WD-12B-Abnahmefehler.

## 6 – Kamerasteuerung während Drag

Sobald ein Gizmo-Griff tatsächlich gezogen wird:

- OrbitControls werden vollständig deaktiviert;
- Pointer Capture bindet den aktiven Finger/Pointer an den Drag;
- die Kamera bleibt während des Drags fest;
- nach dem Loslassen erfolgt keine erneute Zentrierung auf das verschobene Element.

## 7 – Snap

Ist CM3D-Snap aktiviert, wird `store.snap.translate` für die Verschiebung in der Skizzenebene verwendet.

- X/Y-Achsengriff: Bewegung nur auf der aktiven Achse;
- XY-Fläche: Snap auf X und Y;
- Mehrfachauswahl: gemeinsamer gesnappter Verschiebevektor für die gesamte Auswahl.

Ohne aktiviertes Snap ist die Bewegung frei.

## 8 – Live-Aktualisierung abhängiger Extrusionen

Während eines Gizmo-Drags wird die in WD-12A eingeführte Skizzenabhängigkeit live erneut ausgewertet.

- gültige geschlossene Kontur: abhängige Extrusion folgt der aktuellen Skizze;
- offene/ungültige Kontur: keine veraltete Extrusionsgeometrie bleibt sichtbar;
- wird die Kontur wieder gültig, wird die aktuelle Extrusion erneut dargestellt.

## 9 – Undo / Redo

Ein kompletter Pointer-Drag erzeugt genau einen Historieneintrag. Das gilt für:

- einzelnen Punkt;
- einzelne Linie;
- Mehrfachauswahl.

Zwischenpositionen während des Drags erzeugen keine eigenen Undo-Schritte. Der zugehörige Extrusionszustand gehört zum selben Historieneintrag.

## Gerätetest / Abnahme

Praktischer Gerätetest am **2026-08-29 auf iPad**:

- Punkte auswählbar und per Gizmo verschiebbar: PASS;
- Linien auswählbar und per Gizmo verschiebbar: PASS;
- Mehrfachselektion von Skizzenelementen und gemeinsames Verschieben: PASS;
- Move-artiges Gizmo mit achsweiser und diagonaler XY-Bewegung: PASS;
- Viewer richtet sich bei der ersten Auswahl auf die Skizzenebene aus: akzeptiertes Sollverhalten;
- Viewer springt während bzw. nach dem Verschieben nicht hinterher: PASS;
- im praktisch getesteten WD-12B-Umfang keine weiteren Fehler festgestellt.

Damit ist WD-12B **PASS / FROZEN**.

## Bewusst nachgelagert

- endgültige Platzierung der Mehrfachauswahl in der kontextuellen Werkzeug-/Auswahlbedienung;
- Rotation oder Skalierung einzelner Skizzenelemente;
- Constraints und parametrische Maße;
- Trim / Extend / Fillet;
- weitergehende Profil-/Topologie-Werkzeuge.

Die Prüfliste liegt in `WD-12B_TEST_CHECKLIST.md`.