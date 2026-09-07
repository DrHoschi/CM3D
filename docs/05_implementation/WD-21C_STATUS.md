# WD-21C – Sketch Element Type Expansion

**Branch:** `feature/wd-21c-sketch-element-type-expansion`  
**Basis:** WD-21B FROZEN @ `2e8d5b0434e62bf7c7e34b11e54da077853328cc`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-07

## WD-21C.1 – Existing Sketch Element Type & Creation/Editing Inventory

**Status:** PASS / INVENTORY & CONTRACT COMPLETE / 0 ELEMENT IMPLEMENTATION

### Bestehender LINE-Vertrag

- `SketchElementKind` registriert derzeit ausschließlich `LINE`.
- Persistenz: `sketch.data.points` + `sketch.data.lines`.
- Linie besitzt stabile `lineId` sowie `startPointId` / `endPointId`.
- Topologische Verbindung entsteht ausschließlich durch gemeinsame `pointId`.
- SelectionRef und StableReference besitzen bereits den generischen Zieltyp `SKETCH_ELEMENT`; `subTargetId` transportiert den Elementtyp.
- Der zentrale Mutation-Owner ist weiterhin `runSketchMutation(...)`; aktuelle Create/Edit/Delete-Methoden sind jedoch stark linienzentriert.
- Viewer, Tree, Inspector und Sketch-Input behandeln Linien explizit und müssen für weitere Elementtypen generalisiert werden.
- Save/Load ist schema-0.2.0-basiert; `createSketchObject(...)` initialisiert bislang nur `points` und `lines`.
- Undo/Redo ist snapshot-basiert und damit grundsätzlich für zusätzliche persistierte Element-Maps geeignet, sofern alle Mutationen weiterhin zentral laufen.
- Die bestehende Profilableitung verarbeitet ausschließlich `lines`; Circle/Arc/Spline werden erst in späteren WD-21D-Schritten in Profile/Pfade einbezogen.

### Verbindlicher Elementvertrag für WD-21C

WD-21C erweitert den bestehenden Sketch-Elementvertrag um genau drei neue Typen:

- `CIRCLE` → persistente Map `sketch.data.circles`
- `ARC` → persistente Map `sketch.data.arcs`
- `SPLINE` → persistente Map `sketch.data.splines`

Jeder Elementtyp besitzt eine stabile eigene Element-ID (`circleId`, `arcId`, `splineId`). SelectionRef/StableReference verwenden weiterhin `SKETCH_ELEMENT` + `ownerId=sketchId` + `targetId=<Element-ID>` + `subTargetId=<kind>`. Es entsteht kein neuer ReferenceTargetKind nur wegen Circle/Arc/Spline.

### Circle Contract

Persistente Minimalform:

`{ circleId, center:{x,y}, radius }`

Regeln:

- `radius` muss endlich und > 0 sein.
- Ein Circle besitzt **keine topologischen Endpunkte**.
- Der Mittelpunkt ist geometrischer Parameter, aber kein `pointId` und kein Connect-/Disconnect-Ziel.
- Circle ist als vollständige geschlossene Kurve ein einzelnes Sketch-Element.
- Circle-Auswahl erfolgt als `SKETCH_ELEMENT` auf `circleId`.
- Circle-Editierung verändert Mittelpunkt und Radius atomar über den zentralen Mutation-Owner.

### Arc Contract

Persistente Minimalform:

`{ arcId, startPointId, endPointId, control:{x,y} }`

Regeln:

- `startPointId` und `endPointId` sind echte topologische Anschlusspunkte und müssen verschiedene existierende `pointId`s referenzieren.
- `control` ist ein geometrischer Formpunkt, aber **kein topologischer Sketch-Punkt** und kein Connect-/Disconnect-Ziel.
- Start, Ende und Control dürfen nicht kollinear sein; andernfalls ist der Arc geometrisch ungültig.
- Die Kurve wird deterministisch aus Startpunkt, Endpunkt und Controlpunkt abgeleitet.
- Connect/Disconnect darf künftig Arc-Endpunkte analog zu Linien behandeln, aber nur über die generische Endpoint-Incidence-Abstraktion; keine linien-spezifischen Sonderpfade.

### Spline Contract

Persistente Minimalform:

`{ splineId, startPointId, endPointId, controls:[{controlId,x,y}, ...] }`

Regeln:

- `startPointId` und `endPointId` sind echte topologische Anschlusspunkte und müssen verschiedene existierende `pointId`s referenzieren.
- Interior-Controlpunkte besitzen stabile `controlId`, sind geometrisch editierbar, aber **keine topologischen Connect-/Disconnect-Punkte**.
- Mindestens ein Interior-Controlpunkt ist für den ersten Spline-Contract erforderlich.
- Reihenfolge der Controls ist autoritativ und persistiert.
- Die Spline-Repräsentation bleibt in WD-21C auf eine deterministische offene Kurve mit zwei topologischen Endpunkten begrenzt; geschlossene Splines werden nicht vorgezogen.

### Erforderliche Generalisierungen in späteren C-Schritten

1. `SketchElementKind` und Element-Collection-Registry müssen Circle/Arc/Spline kennen.
2. `getSketchElementPointIds(...)` muss zwischen **topologischen Endpunkten** und rein geometrischen Kontrollparametern unterscheiden.
3. Topologievalidierung muss elementtypbezogene Invarianten prüfen.
4. Create/Edit/Delete-Mutationen müssen für jeden neuen Elementtyp zentral registriert werden.
5. Connect/Disconnect-Inzidenz darf nicht dauerhaft nur `lines` durchsuchen; Arc-/Spline-Endpunkte müssen später über einen generischen Endpoint-Contract integriert werden. Circle bleibt davon ausgeschlossen.
6. Viewer muss jeden Elementtyp rendern und pickbar machen.
7. Tree muss eigene Bereiche/Zeilen für Circle, Arc und Spline darstellen.
8. Inspector benötigt typbezogene Editoren.
9. Sketch-Input benötigt eigene Erstellmodi, jedoch erst in den jeweiligen Implementierungsschritten.
10. Save/Load/Migration muss alte 0.2.0-Skizzen ohne neue Maps weiterhin laden können; fehlende neue Collections dürfen deterministisch als leer normalisiert werden.
11. Undo/Redo muss IDs, Control-Reihenfolge und Topologie exakt wiederherstellen.
12. Profil-/Pfadableitung bleibt in WD-21C unangetastet und wird erst in WD-21D generalisiert.

### Explizit nicht Bestandteil von WD-21C.1

- keine Circle-Implementierung;
- keine Arc-Implementierung;
- keine Spline-Implementierung;
- keine neuen Sketch-Buttons;
- keine neue Viewer-Geometrie;
- keine Profil-/Pfadableitung;
- keine neue Extrude-/3D-Funktion;
- kein automatisches Snap/Merge;
- keine Toleranzsuche;
- keine Änderung des eingefrorenen WD-21B-Connectivity-Verhaltens.

### Build Identity

Die sichtbare Build-Kennung wurde ausschließlich zur eindeutigen C.1-Identität auf `WD-21C.1` fortgeschrieben. `document.title` und sichtbares Brand-/Build-Label werden weiterhin zentral aus derselben Build-ID gesetzt.

## Nächster zulässiger Schritt

Der nächste Teilblock muss separat autorisiert werden. Sinnvoll ist **WD-21C.2 – Generic Sketch Element Registry & Persistence Foundation**: ausschließlich die Daten-/Registry-/Validation-Grundlage für `circle`, `arc` und `spline`, noch ohne sichtbare Erstellung, Viewer-Rendering oder Inspector-Bedienung.
