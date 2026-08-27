# WD-04 – Modellierungsgrundlagen

**Stand:** 2026-08-27  
**Status:** IMPLEMENTED – DEVICE TEST REQUIRED  
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

## Manueller Abnahmetest

1. Neues Projekt anlegen.
2. Je einen Würfel, eine Kugel und einen Zylinder erzeugen.
3. Box-Abmessungen z. B. auf X = 0.12, Y = 2.10, Z = 0.12 setzen.
4. Kugelradius verändern.
5. Zylinderradius und -höhe verändern.
6. Speichern → Browser-Reload → Laden → alle Geometrien und Maße prüfen.
7. Bei einem Primitive Pivot X/Y/Z verändern und prüfen, dass sich der sichtbare Körper relativ zum Gizmo-/Objektursprung verschiebt.
8. Zwei Root-Objekte über die Häkchen markieren → `Gruppe` drücken.
9. Prüfen: Im Objektbaum steht ein Group-Knoten mit den beiden Child-Objekten darunter.
10. Gruppe auswählen und mit Move/Rotate/Scale verändern → beide Children müssen gemeinsam folgen.
11. Undo/Redo für die Gruppenbildung sowie einen Gruppen-Transform prüfen.
12. Neues Projekt bzw. neuen Teststand erstellen, zwei Root-Objekte markieren → `Baugruppe` drücken.
13. Prüfen: `assembly` erscheint als eigener Typ und Children bleiben darunter erhalten.
14. Projekt speichern → Browser-Reload → laden → Group-/Assembly-Hierarchie und Primitive müssen erhalten bleiben.

## Bewusste Grenzen

- Gruppieren ist in WD-04 auf markierte Root-Objekte beschränkt.
- kein Ungroup/Explode
- kein Reparenting per Drag & Drop
- keine Mehrfach-Transformation verschiedener unabhängiger Objekte
- keine Boolean-Operationen
- keine Sketches / Extrusion / Revolve
- keine parametrischen Constraints
- keine komplexen Assembly-Constraints oder Sockets
- keine Materialbearbeitung

## Exit-Regel

WD-04 wird erst nach erfolgreichem manuellen Gerätetest als `PASS / FROZEN` nach `main` übernommen.
