# WD-04 – Modellierungsgrundlagen

**Stand:** 2026-08-30  
**Status:** PASS / FROZEN  
**Voraussetzung:** WD-03 – PASS / FROZEN

## Ziel

WD-04 erweitert den stabilen Bedienkern um die ersten echten Modellierungsgrundlagen, ohne den Scope bereits auf CAD-/Sketch-/Boolean-Funktionen auszuweiten.

## Implementiert

### Primitive

- `primitive.box` – Würfel/Quader
- `primitive.sphere` – Kugel
- `primitive.cylinder` – Zylinder
- alle Primitive verwenden stabile `objectId`s und die vorhandene Materialreferenz

### Exakte Abmessungen

Die geometrischen Abmessungen werden getrennt vom Transform-Scale geführt:

- Box: X / Y / Z in Meter
- Kugel: Radius in Meter
- Zylinder: Radius + Höhe in Meter
- Werte müssen > 0 sein
- Save/Load persistiert die geometrischen Daten

Damit kann beispielsweise ein Balken als Box mit X = 0.12 m, Y = 2.10 m und Z = 0.12 m modelliert werden, ohne dafür den Objekt-Scale als Ersatz für echte Bauteilmaße zu missbrauchen.

### Pivot / Origin

- jedes SceneObject behält seinen persistenten lokalen Pivot
- Pivot X/Y/Z kann im Inspector in Meter gesetzt werden
- Primitive-Geometrie wird relativ zum Pivot versetzt dargestellt
- Move/Rotate/Scale arbeitet um den gespeicherten Objektursprung

### Mehrfachauswahl für Hierarchie

- Objektbaum besitzt pro Eintrag ein Auswahl-Häkchen
- mehrere Root-Objekte können gleichzeitig für eine Hierarchieoperation markiert werden
- der aktive Inspector-/Gizmo-Eintrag bleibt zusätzlich als `activeObjectId` eindeutig

### Group

- `group` ist ein echtes SceneObject mit eigener `objectId`
- markierte Root-Objekte werden über `parentId` unter die Gruppe gesetzt
- Child-Reihenfolge wird über `order` geführt
- Gruppen besitzen einen eigenen Transform
- Three.js-Hierarchie wird vollständig aus den CM3D-Parent-Referenzen aufgebaut

### Assembly

- `assembly` ist technisch ebenfalls ein Container im SceneGraph, aber fachlich ein eigener Typ
- besitzt eigene `objectId`, Transform- und Hierarchieregeln
- enthält einen vorbereiteten `data.assembly`-Block für spätere fachliche Baugruppeninformationen
- wird bewusst nicht mit `group` gleichgesetzt

### Runtime

- Three.js erzeugt für jedes SceneObject einen Runtime-Knoten
- Primitive besitzen darunter das jeweilige Mesh
- Group/Assembly bleiben containerartige Object3D-Knoten
- Parent-/Child-Beziehungen werden aus `parentId` rekonstruiert
- Raycast eines Primitive-Meshes verweist weiterhin auf die fachliche CM3D-`objectId`

## Gerätetest / Abschluss

WD-04 wurde praktisch geprüft und anschließend über PR #6 nach `main` übernommen.

Der nachfolgende WD-05-Stand baut ausdrücklich auf **WD-04 PASS / gesichert** auf und wurde selbst auf iPad/Safari getestet und als PASS / FROZEN nach `main` übernommen.

Der frühere Dateistatus `IMPLEMENTED – DEVICE TEST REQUIRED` war deshalb ein nicht nachgezogener Dokumentationszwischenstand. Diese Statuskorrektur ändert keine WD-04-Fachlogik und keinen V1-Code.

## Bewusste Grenzen

- Gruppieren ist in WD-04 auf markierte Root-Objekte beschränkt.
- kein Ungroup/Explode im ursprünglichen WD-04-Scope
- kein Reparenting per Drag & Drop
- keine Mehrfach-Transformation verschiedener unabhängiger Objekte
- keine Boolean-Operationen
- keine Sketches / Extrusion / Revolve
- keine parametrischen Constraints
- keine komplexen Assembly-Constraints oder Sockets
- keine Materialbearbeitung

Spätere WD-Blöcke dürfen diese Grenzen kontrolliert erweitern; sie ändern nicht rückwirkend den abgeschlossenen WD-04-Scope.

## Exit-Regel

**Erfüllt.** WD-04 ist **PASS / FROZEN** und Bestandteil des getesteten V1-Gesamtstands.
