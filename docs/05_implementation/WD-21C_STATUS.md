# WD-21C – Sketch Element Type Expansion

**Branch:** `feature/wd-21c-sketch-element-type-expansion`  
**Basis:** WD-21B FROZEN @ `2e8d5b0434e62bf7c7e34b11e54da077853328cc`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-08

## WD-21C.1 – Existing Sketch Element Type & Creation/Editing Inventory

**Status:** PASS / INVENTORY & CONTRACT COMPLETE / 0 ELEMENT IMPLEMENTATION

## WD-21C.2 – Generic Sketch Element Registry & Persistence Foundation

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

Registry, Persistenz und Validation für `line`, `circle`, `arc`, `spline` sind vorhanden. Reale iPad-/Safari-Evidenz bestätigte `WD-21C.2`, Bestands-Sketching, Connect/Disconnect, Save/Load und Undo/Redo.

## WD-21C.3 – Generic Sketch Element Mutation Contract + Analytic Geometry ↔ Derived Tessellation Boundary

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

Umgesetzt:

- neuer zentraler Extension-Contract `src/application/sketch-element-mutation-extension.js` auf dem bestehenden `runSketchMutation(...)`-Pfad;
- zentrale Create/Edit-Mutationen für Circle, Arc und Spline;
- generisches Delete für Line/Circle/Arc/Spline und Punkte;
- alle C.3-Mutationen sind mit `central-sketch-mutation` markiert;
- erfolgreiche Mutationen laufen atomar über Domain Transaction + Topology Validation + maximal einen History-Eintrag;
- ungültige Arc-/Spline-Geometrie rollt ohne History zurück;
- Circle behält stabile `circleId` bei Edit;
- Arc behält stabile `arcId` bei Edit;
- Spline behält stabile `splineId` und bestehende `controlId`-Reihenfolge bei Edit; Control-ID-Austausch oder Control-Anzahländerung ist in C.3 nicht erlaubt;
- Delete entfernt Endpoint-Punkte nur, wenn sie über Line/Arc/Spline wirklich verwaist sind;
- Point-Delete entfernt referenzierende Line-/Arc-/Spline-Elemente kontrolliert;
- StableReference auf ein gelöschtes Element wird `MISSING`; kein geometrisches Rebinding;
- Undo/Redo-Snapshots stellen exakte IDs wieder her.

Analytic Geometry ↔ Derived Tessellation Boundary:

- Circle/Arc/Spline bleiben analytische persistierte Sketch-Identitäten;
- keine feste Segmentzahl ist Teil ihrer Identität;
- `renderSegments` oder vergleichbare Tessellierungsdaten werden nicht persistiert;
- spätere Viewer-/Export-Tessellierung darf Element-ID, StableReference oder SelectionRef nicht verändern;
- kein Regular Polygon / N-Gon und kein facettierter Arc in C.3.

Automatische Regression:

- Workflow: `WD-21C.3 Generic Sketch Element Mutation Regression`
- Run: `34261949046`
- Head: `498f4179b52c035ff831d2a8cb13bb82b95ba1e2`
- WD-21A.2: PASS
- WD-21A.3: PASS
- WD-21B.2 Connect: PASS
- WD-21B.3 Disconnect: PASS
- WD-21C.2 Registry/Persistence: PASS
- WD-21C.3 Generic Mutation: PASS
- Result: **SUCCESS / PASS**

Reale Geräte-Evidenz 2026-09-08, iPad/Safari:

- Browser-Tab zeigt `CyberMotion 3D – WD-21C.3`: PASS.
- sichtbares Header-/Brand-Label zeigt `WD-21C.3`: PASS.
- normale Sketch-Bearbeitung: PASS.
- Verbinden/Trennen: PASS.
- Speichern/Laden: PASS.
- Undo/Redo: PASS.
- gemeldete Blocker: 0.

Explizit nicht Bestandteil von WD-21C.3:

- keine sichtbaren Circle-/Arc-/Spline-Buttons;
- kein neuer Sketch-Input-Modus;
- kein Viewer-Rendering/Picking der neuen Typen;
- kein Tree-/Inspector-Support;
- keine Arc-/Spline-Erweiterung von Connect/Disconnect;
- kein N-Gon / Regular Polygon;
- keine Tessellierungsfunktion;
- keine Profile/Pfade;
- keine neue Extrude-/3D-Funktion.

Sichtbare Build-ID ist zentral `WD-21C.3`.

## Freigabestatus

WD-21C.1, C.2 und C.3 sind abgeschlossen. WD-21C.3 ist **PASS / DEVICE VERIFIED / 0 BLOCKER**. WD-21C als Gesamtblock bleibt **nicht FROZEN**.

## Nächster zulässiger Schritt

Ausschließlich den nächsten kleinen WD-21C-Teilblock fachlich definieren und separat freigeben. Noch keine weitere Circle-/Arc-/Spline-Implementierung im selben Schritt.
