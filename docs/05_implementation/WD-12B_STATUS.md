# WD-12B – Skizzen-Gizmo & Ebenenbearbeitung

**Status:** IMPLEMENTED / DEVICE TEST PENDING  
**Branch:** `feature/wd-12b-sketch-gizmo-plane-editing`  
**Basis:** `feature/wd-12a-sketch-editing-v1` (WD-12A PASS / FROZEN)

## Ziel

WD-12B ergänzt die in WD-12A eingeführte elementweise Skizzenbearbeitung um eine direkte, touch-taugliche Verschiebung von Punkten und Linien in der aktiven Skizzenebene.

## 1 – Kamera auf Skizzenebene ausrichten

Wird ein Skizzenpunkt oder eine Skizzenlinie ausgewählt:

- wird die Kamera senkrecht auf die reale lokale XY-Ebene der Skizze ausgerichtet;
- der aktuelle Elementmittelpunkt wird als Bearbeitungsziel verwendet;
- die lokale Y-Richtung der Skizze wird als Kamera-Up übernommen;
- freie Kameradrehung wird deaktiviert.

Damit bleibt die Skizzenebene während der Elementbearbeitung stabil. Außerhalb der Skizzenelement-Auswahl wird die bisherige Orbit-Drehung wieder freigegeben.

## 2 – 2D-Gizmo

Das Gizmo besitzt:

- X-Achse;
- Y-Achse;
- zentralen XY-Griff.

Die sichtbaren Griffe besitzen vergrößerte unsichtbare Trefferbereiche für Touch-Bedienung.

## 3 – Punkt verschieben

Bei ausgewähltem Punkt sitzt das Gizmo direkt auf dem Punkt.

- X-Griff: nur lokale X-Richtung;
- Y-Griff: nur lokale Y-Richtung;
- Mittelpunkt: freie Bewegung in lokal X/Y.

Die Punkt-ID bleibt unverändert. Verbundene Linien folgen demselben Punkt.

## 4 – Linie verschieben

Bei ausgewählter Linie sitzt das Gizmo in der Linienmitte.

Beim Verschieben werden beide referenzierten Endpunkte um denselben lokalen Delta-Wert verschoben. Damit bewegt sich die komplette Linie parallel, ohne ihre Länge oder Richtung durch die Verschiebung selbst zu ändern.

Sind die Endpunkte zugleich Bestandteil angrenzender Linien, bewegen sich diese topologisch verbundenen Linien mit.

## 5 – Kamerasteuerung während Drag

Sobald ein Gizmo-Griff tatsächlich gezogen wird:

- OrbitControls werden vollständig deaktiviert;
- Pointer Capture bindet den aktiven Finger/Pointer an den Drag;
- die Kamera wird während des Drags nicht dem wandernden Element nachgeführt;
- beim Loslassen wird die Bedienung wieder freigegeben, freie Rotation bleibt solange deaktiviert, wie ein Skizzenelement aktiv ist.

Damit konkurrieren Touch-Drag und Kamerasteuerung nicht miteinander.

## 6 – Snap

Ist das vorhandene CM3D-Snap aktiviert, verwendet WD-12B `store.snap.translate` für das Verschiebe-Delta in der Skizzenebene.

- X/Y-Achsengriff: Snap nur auf der aktiven Achse;
- XY-Griff: Snap auf X und Y.

Ohne aktiviertes Snap ist die Bewegung frei.

## 7 – Live-Aktualisierung abhängiger Extrusionen

Während eines Gizmo-Drags wird die in WD-12A eingeführte Abhängigkeit erneut ausgewertet.

- gültige geschlossene Kontur: `feature.extrude` erhält das aktuelle Profil und wird neu dargestellt;
- offene/ungültige Kontur: veraltete Extrusionsgeometrie bleibt nicht sichtbar;
- wird die Kontur wieder gültig, erscheint die Extrusion wieder aus dem aktuellen Profil.

## 8 – Undo / Redo

Ein kompletter Pointer-Drag erzeugt genau einen Historieneintrag:

- `Skizzenpunkt per Gizmo verschieben` oder
- `Skizzenlinie per Gizmo verschieben`.

Die Zwischenpositionen während des Drags erzeugen keine einzelnen Undo-Schritte. Der zugehörige Extrusionszustand gehört zum selben Historieneintrag.

## Nicht Bestandteil von WD-12B

- Rotation oder Skalierung einzelner Skizzenelemente;
- Mehrfachauswahl mehrerer Punkte/Linien;
- Constraints und parametrische Maße;
- Trim / Extend / Fillet;
- Drag kompletter Profilgruppen;
- eigene Touch-Gesten für numerische Maßeingabe.

## Abnahme

WD-12B bleibt bis zum praktischen Gerätetest auf iPad/iPhone Safari **IMPLEMENTED / DEVICE TEST PENDING**.

Die Prüfliste liegt in `WD-12B_TEST_CHECKLIST.md`.
