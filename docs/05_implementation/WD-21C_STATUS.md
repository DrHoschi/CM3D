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

Finaler sichtbarer Korrekturstand: `WD-21C.6-R1`. C.6 generalisiert Connect/Disconnect auf registrierte endpoint-basierte Elemente. Reale iPad-/Safari-Evidenz und Completion-Regression Run `34363013788`: PASS / 0 BLOCKER.

## WD-21C.7 – Arc Creation, Rendering & Editing Integration

**Status:** PASS / FROZEN / 0 BLOCKER

Finaler sichtbarer Stand: `WD-21C.7`. Completion-Regression Run `34369150959`: SUCCESS. Reale iPad-/Safari-Evidenz bestätigt Drei-Punkt-Bogen, Tree-/Viewer-Auswahl, Inspector, C.6-Connectivity mit geeigneten Punkten, Undo/Redo und Save/Load. 0 BLOCKER.

## WD-21C.8 – Spline Creation, Rendering & Editing Integration

**Status:** DEFINED / NOT IMPLEMENTED

**Reconciliation-Basis:** eingefrorener WD-21C.7-Stand `feaee19c72977a98dc86090a99e57162aa27a0cc`.

### Ziel

Den bereits vorhandenen offenen Spline-Vertrag erstmals als sichtbares, auswählbares und numerisch bearbeitbares Sketch-Element integrieren, ohne C.6/C.7 zu erweitern und ohne Profile/Pfade vorwegzunehmen.

Autoritative Spline-Identität:

`{ splineId, startPointId, endPointId, controls:[{controlId,x,y}, ...] }`

- `splineId` bleibt stabil.
- `startPointId` und `endPointId` sind echte topologische Sketch-Punkte.
- `controls[]` enthält mindestens einen geometrischen Kontrollpunkt.
- jeder Control besitzt eine stabile `controlId`.
- Controls sind ausdrücklich keine Topologiepunkte und keine Connect-/Disconnect-Ziele.
- Reihenfolge und Anzahl der Controls bleiben beim C.8-Editing autoritativ und unverändert.

### Reconciled vorhandene Grenzen

- C.2 registriert `spline` mit `topologyEndpoints: true` und persistiert/validiert stabile `splineId`, Endpoint-Referenzen sowie eindeutige `controlId`s.
- C.3 stellt `addSketchSpline(...)` und `setSketchSpline(...)` über die zentrale `runSketchMutation(...)`-Grenze bereit. `setSketchSpline(...)` verlangt dieselbe Control-Anzahl, dieselbe Reihenfolge und dieselben `controlId`s.
- C.6 behandelt ausschließlich Start/Ende des Splines über die generische Endpoint-Connectivity; Controls bleiben ausgeschlossen.
- C.4/C.7 liefern das Integrationsmuster für Werkzeugbutton, Preview/Input, Tree, Inspector, Viewer/Picking und ausschließlich abgeleitete Tessellation.

### Mathematische Spline-Semantik

C.8 schließt die bislang offene mathematische Kurvensemantik verbindlich als **geordnete Bézier-Kurve**.

Control-Polygon-Reihenfolge:

`Start → controls[0] → controls[1] → … → Ende`

Die Kurve wird deterministisch mit dem de-Casteljau-Verfahren ausgewertet. Ein Control ergibt eine quadratische Bézier-Kurve; mehrere Controls ergeben entsprechend eine Bézier-Kurve höheren Grades. Es entstehen keine zusätzlichen persistenten Kurvenparameter und keine zweite Spline-Identität.

### Creation Contract

Die sichtbare Spline-Erzeugung folgt:

`Start → Control 1 → optional weitere Controls → Ende/Abschluss`

- mindestens ein Control ist erforderlich;
- vor dem Abschluss existiert ausschließlich Preview-State;
- erneutes Betätigen des aktiven `Spline`-Werkzeugs ist das explizite Abschlusskommando;
- beim Abschluss muss eine einzige zentrale Sketch-Transaktion zwei stabile Endpoint-Punkte, stabile `controlId`s für alle Controls und genau einen Spline erzeugen;
- eine sichtbare Spline-Erzeugung entspricht genau einer Mutation, einem History-Eintrag und einem Undo-Schritt;
- ungültige Eingaben dürfen keine persistenten Teilreste hinterlassen;
- beim Zeichnen erfolgt keine geometrische Suche oder automatische Übernahme vorhandener Punkte; topologische Verbindung entsteht ausschließlich explizit über C.6.

Für die spätere Implementierung ist dafür analog C.7 eine eng begrenzte atomare Application-Grenze zulässig, z. B. `addSketchSplineFromPoints(...)`. Das bestehende `addSketchSpline(...)` wird nicht umdefiniert.

### Viewer / Picking

- Preview und Viewer werden ausschließlich aus der autoritativen Bézier-Geometrie abgeleitet tesselliert.
- Tessellierungssegmente werden nicht persistiert und nicht als Sketch-Lines erzeugt.
- die interne Renderauflösung ist keine Modelleigenschaft.
- der komplette Spline ist genau ein auswählbares `SKETCH_ELEMENT`.
- SelectionRef/StableReference bleibt `SKETCH_ELEMENT + ownerId=sketchId + targetId=splineId + subTargetId=spline`.

### Object Tree

- eigene Gruppe `Splines (n)` innerhalb der Skizze;
- jeder Spline erscheint genau einmal als einzelnes Sketch-Element;
- Tree-Auswahl selektiert den konkreten Spline.

### Inspector / Editing

Der Spline-Inspector zeigt mindestens:

- Start X/Y;
- Ende X/Y;
- alle vorhandenen Controls in autoritativer Reihenfolge mit stabiler `controlId` und X/Y.

Endpoint-Editing bewegt die vorhandenen topologischen Punkte und erhält `pointId`s. Control-Editing verändert ausschließlich die Koordinaten vorhandener Controls und erhält deren `controlId`s, Reihenfolge und Anzahl. Controls hinzufügen, löschen oder umsortieren ist ausdrücklich nicht Bestandteil von C.8.

Koordinierte numerische Änderungen müssen über eine zentrale Mutation erfolgen und dürfen keine Ersatzpunkte, Ersatz-Control-IDs, geometrisches Rebinding oder zweite persistente Modellautorität erzeugen.

### Connectivity

C.8 implementiert keine neue Connect-/Disconnect-Logik. Nur Start- und Endpunkt eines sichtbaren Splines verwenden die eingefrorene C.6-Grenze. Innere Controls bleiben vollständig von Connectivity ausgeschlossen.

### Persistenz / History

Delete, Undo/Redo und Save/Load verwenden ausschließlich die vorhandenen zentralen Sketch-/Persistenzgrenzen. `splineId`, Endpoint-`pointId`s sowie Control-`controlId`s müssen über Editing, Undo/Redo und Save/Load stabil bleiben.

### Explizit ausgeschlossen

- geschlossene Splines;
- Controls nach der Erstellung hinzufügen, löschen oder umsortieren;
- sichtbare Control-Handles im Viewer;
- Spline-Gizmo oder direkter Spline-/Control-Drag;
- Tangentialität, Smooth-/Continuity-Constraints;
- Catmull-Rom, B-Spline oder alternative Kurventypen;
- Snap, Auto-Merge, Tolerance oder geometrisches Rebinding;
- Profile/Pfade;
- N-Gon;
- Extrusionsintegration;
- Änderungen an C.6 oder C.7.

### Build-Grenze

Bei einer später separat freigegebenen Implementierung lautet die sichtbare Build-ID `WD-21C.8`. `document.title`, sichtbares Header-/Brand-Label und Statusdokumentation müssen konsistent sein; Abweichungen sind BLOCKER.

## Freigabestatus

WD-21C.4, WD-21C.5, WD-21C.6 und WD-21C.7 sind **PASS / FROZEN / 0 BLOCKER**. WD-21C.8 ist **DEFINED / NOT IMPLEMENTED**. WD-21C als Gesamtblock bleibt ausdrücklich **nicht FROZEN**.

## Nächster zulässiger Schritt

Ausschließlich das WD-21C.8 Definition/Implementation Gate gegen den eingefrorenen C.7-Stand durchführen und daraus den exakt minimalen Implementierungsumfang und die tatsächlich notwendigen Integrationsstellen ableiten. Noch keine C.8-Codeimplementierung und keine weitere C.7-Änderung.
