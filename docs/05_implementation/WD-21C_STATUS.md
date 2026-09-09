# WD-21C – Sketch Element Type Expansion

**Branch:** `feature/wd-21c-sketch-element-type-expansion`  
**Basis:** WD-21B FROZEN @ `2e8d5b0434e62bf7c7e34b11e54da077853328cc`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-09

## WD-21C.1 – Existing Sketch Element Type & Creation/Editing Inventory

**Status:** PASS / INVENTORY & CONTRACT COMPLETE / 0 ELEMENT IMPLEMENTATION

## WD-21C.2 – Generic Sketch Element Registry & Persistence Foundation

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

## WD-21C.3 – Generic Sketch Element Mutation Contract + Analytic Geometry ↔ Derived Tessellation Boundary

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

## WD-21C.4 – Circle Creation, Rendering & Editing Integration

**Status:** PASS / FROZEN / 0 BLOCKER

Finaler sichtbarer Korrekturstand: `WD-21C.4-R1`. Completion-Regression Run `34273576840`: SUCCESS; reale iPad-/Safari-Evidenz: PASS.

## WD-21C.5 – Generic Sketch Element Manipulation Contract

**Status:** PASS / FROZEN / 0 BLOCKER

Direkter Circle-Gizmo-Move, bestehende Point-/Line-Manipulation, Save und Undo/Redo sind auf iPad/Safari bestätigt. Regression Run `34277682889`: SUCCESS.

## WD-21C.6 – Generic Endpoint Element Connectivity Contract

**Status:** PASS / FROZEN / 0 BLOCKER

Finaler sichtbarer Korrekturstand: `WD-21C.6-R1`.

C.6 generalisiert die bestehende B.2/B.3-Connectivity ausschließlich auf registrierte endpoint-basierte Sketch-Elemente (`topologyEndpoints: true` → aktuell Line/Arc/Spline). Circle bleibt ausgeschlossen; `pointId` bleibt einzige Connectivity-Autorität. Keine sichtbare Arc-/Spline-Funktion ist Bestandteil von C.6.

WD-21C.6-R1 korrigiert ausschließlich die beim realen Gerätecheck gefundene Mehrfachauswahlregression. Der reale iPad-/Safari-Recheck bestätigt Zeichnen/Polygon, Mehrfachauswahl, Verbinden/Trennen, erneutes Zusammenführen, Undo/Redo und Speichern/Laden. Completion-Regression Run `34363013788`: SUCCESS. C.6 ist PASS / FROZEN / 0 BLOCKER.

## WD-21C.7 – Arc Creation, Rendering & Editing Integration

**Status:** DEFINED / NOT IMPLEMENTED

**Reconciliation-Basis:** eingefrorener WD-21C.6-R1-Stand `a16a1f6b70a10fb10b469ff45e3795a95ddbbc45`.

### Ziel

Den bereits vorhandenen analytischen Arc-Vertrag erstmals als sichtbares, auswählbares und numerisch bearbeitbares Sketch-Element integrieren, ohne neue Connectivity-Semantik und ohne Spline-Funktion.

Autoritative Arc-Identität:

`arcId + startPointId + endPointId + control{x,y}`

- `arcId` bleibt stabil.
- `startPointId` und `endPointId` sind echte topologische Sketch-Punkte.
- `control{x,y}` ist ausschließlich geometrischer Krümmungsparameter und kein topologischer Punkt, kein `pointId` und kein Connect-/Disconnect-Ziel.
- gleiche Koordinate bedeutet weiterhin nicht gleiche Topologie.

### Reconciled vorhandene Grenzen

- C.3 stellt `addSketchArc(...)` und `setSketchArc(...)` über die zentrale `runSketchMutation(...)`-Grenze bereit.
- C.6 behandelt Arc-Endpunkte bereits generisch über `topologyEndpoints: true`; C.7 konsumiert diese Connect-/Disconnect-Grenze nur und erweitert sie nicht.
- C.4 liefert das Integrationsmuster für Werkzeugbutton, Input, Tree, Inspector, Viewer/Picking und ausschließlich abgeleitete Tessellation.

### Creation Contract

Die sichtbare Arc-Erzeugung folgt deterministisch:

`Startpunkt → Endpunkt → Kontrollpunkt`

Vor dem dritten gültigen Punkt existiert ausschließlich Preview-State; es wird noch nichts persistiert.

Beim dritten gültigen Punkt muss **eine einzige zentrale Sketch-Transaktion**:

1. einen stabilen Startpunkt erzeugen,
2. einen stabilen Endpunkt erzeugen,
3. genau einen Arc erzeugen, der diese beiden Punkt-IDs referenziert.

Damit gilt für eine Arc-Erzeugung: **eine Mutation / ein History-Eintrag / ein Undo-Schritt**. Es dürfen keine getrennten persistenten `addSketchPoint + addSketchPoint + addSketchArc`-Teilschritte entstehen.

Kollineare oder anderweitig ungültige Drei-Punkt-Geometrie wird vollständig abgelehnt; es dürfen keine persistenten Teilreste entstehen.

Beim Zeichnen wird keine geometrische Suche nach bereits vorhandenen Punkten durchgeführt. Neu gezeichnete Arc-Endpunkte erhalten zunächst eigene stabile IDs. Eine topologische Verbindung zu vorhandenen Punkten entsteht ausschließlich explizit über die bereits eingefrorene C.6-Connectivity.

### Viewer / Picking

- Der analytische Drei-Punkt-Arc wird ausschließlich für die Darstellung intern tesselliert.
- Tessellierungssegmente werden nicht persistiert, nicht als Sketch-Lines angelegt und besitzen keine Sketch-Identität.
- Die interne Renderauflösung ist keine Benutzer-/Modelleigenschaft.
- Der komplette Arc ist im Viewer genau ein auswählbares `SKETCH_ELEMENT`.
- SelectionRef/StableReference bleibt `SKETCH_ELEMENT + ownerId=sketchId + targetId=arcId + subTargetId=arc`.

### Object Tree

- Eigene Gruppe `Bögen (n)` innerhalb der Skizze.
- Jeder Arc erscheint genau einmal als einzelnes Sketch-Element.
- Tree-Auswahl selektiert den konkreten Arc, nicht nur die Owner-Skizze.

### Inspector / Editing

Der Arc-Inspector zeigt mindestens:

- Start X/Y,
- Ende X/Y,
- Control X/Y.

Endpoint-Koordinatenänderungen bewegen die bereits vorhandenen topologischen Punkte und dürfen deren `pointId`s nicht ersetzen. Control-Änderungen verändern ausschließlich `arc.control` über die zentrale Arc-Mutationsgrenze. Numerisches Editing darf keine Ersatzpunkte, kein geometrisches Rebinding und keine zweite persistente Modellautorität erzeugen.

### Connectivity

C.7 implementiert keine neue Connect-/Disconnect-Logik. Sichtbar vorhandene Arc-Endpunkte müssen die bereits eingefrorene C.6-Grenze verwenden. Der Control-Punkt bleibt von Connectivity ausgeschlossen.

### Persistenz / History

Delete, Undo/Redo und Save/Load verwenden ausschließlich die bereits vorhandenen zentralen Sketch-/Persistenzgrenzen. Stable IDs müssen über Edit, Undo/Redo und Save/Load erhalten bleiben.

### Explizit ausgeschlossen

- Spline-Erstellung, -Rendering oder -Editing;
- Arc-Gizmo oder gesamter Arc-Drag;
- sichtbares Control-Handle im Viewer;
- Radius-/Mittelpunkt-/Winkel-Parametrisierung als alternative Arc-Definition;
- Tangentialität oder Constraints;
- Snap, Auto-Merge, Tolerance oder geometrisches Rebinding;
- N-Gon oder facettierter Arc als eigenes Sketch-Modell;
- Profile/Pfade;
- Extrusionsintegration;
- Änderungen oder Erweiterungen an C.6.

### Build-Grenze

Bei einer später separat freigegebenen Implementierung lautet die sichtbare Build-ID `WD-21C.7`. `document.title`, sichtbares Header-/Brand-Label und Statusdokumentation müssen konsistent sein; Abweichungen sind BLOCKER.

## Freigabestatus

WD-21C.4, WD-21C.5 und WD-21C.6 sind **PASS / FROZEN / 0 BLOCKER**. WD-21C.7 ist **DEFINED / NOT IMPLEMENTED**. WD-21C als Gesamtblock bleibt ausdrücklich **nicht FROZEN**.

## Nächster zulässiger Schritt

Ausschließlich das WD-21C.7 Definition/Implementation Gate gegen den eingefrorenen C.6-R1-Stand durchführen und daraus den exakt minimalen Implementierungsumfang ableiten. Noch keine C.7-Codeimplementierung und weiterhin keine Spline-Funktion.
