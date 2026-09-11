# CM3D – Projektstatus

Stand: 2026-09-11

## Aktueller Gesamtstand

Repository `DrHoschi/CM3D` ist die zentrale Projektbasis.

**CM3D V1 – COMPLETE / PASS / FROZEN**

## V2 – Foundation & Compatibility

**RB-01 – PASS / FROZEN**

Freigegebener `main`-Stand nach Abschlussdokumentation: `1edae185c6207db9d754c94d00d23cf10218c56c`.

## RB-02 – Sketch Topology & Profiles

RB-02 ist der aktuell aktive V2-Roadmapblock.

Verbindliche WD-Zerlegung:

- WD-21A – Sketch Topology Contract & Element Foundation
- WD-21B – Sketch Connectivity & Editing Integration
- WD-21C – Sketch Element Type Expansion
- WD-21D – Profile & Open Path Derivation
- WD-21E – Stable Profile/Path Reference & Selection
- WD-21F – Profile/Path Dependency & Recompute Integration
- WD-21G – RB-02 Integration / Regression / Freeze Gate

## WD-21A – Sketch Topology Contract & Element Foundation

**PASS / FROZEN / 0 BLOCKER**

## WD-21B – Sketch Connectivity & Editing Integration

**PASS / FROZEN / 0 BLOCKER**

## WD-21C – Sketch Element Type Expansion

**PASS / FROZEN / 0 BLOCKER**

WD-21C ist fachlich bis einschließlich C.8-R2 abgeschlossen. Finaler sichtbarer C-Stand war `WD-21C.8-R2`. Point/Line/Circle behalten bestehende Gizmo-Manipulation; Arc/Spline bleiben konkrete auswählbare Sketch-Elemente ohne Manipulationsgizmo. Die C.6-Connectivity gilt generisch für Line/Arc/Spline-Endpunkte ausschließlich über identische `pointId`. Circle besitzt keine Topologie-Endpunkte.

Frozen WD-21C documentation basis: `b29efc297ab8183a9e5879798bb6fd9da201cdf2`.

## WD-21D – Profile & Open Path Derivation

Aktiver Entwicklungsbranch: `feature/wd-21d-profile-open-path-derivation`.

### WD-21D.1 – Generic Sketch Curve/Edge Derivation

**PASS / FROZEN / 0 BLOCKER**

Frozen implementation head: `5acd2c65931168c4535fce8e2e1eb0504f088f6d`.

D.1 stellt die zentrale read-only Curve/Edge-Derivation für Line/Circle/Arc/Spline bereit. Source- und Endpoint-Identitäten bleiben autoritativ; Circle bleibt geschlossen und endpointlos. Arc/Spline-Tessellation ist nur abgeleitet. Automatisierte Regression und realer iPad/Safari-Test 1–7 sind PASS.

NON-BLOCKING / LATER UX UNIFICATION bleibt die unterschiedliche Kamera-Fokuswirkung zwischen Point/Line/Circle und Arc/Spline. Eine spätere gemeinsame Selection-Camera-Focus-Regel soll Zentrierung/Auto-Fit mit Min-/Max-Zoom-Clamping vereinheitlichen.

### WD-21D.2 – Deterministic Contour & Open Path Graph Derivation

**PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER**

Dokumentierter D.2-Vertrag: `1f7715f80160aa205c306a1129b4a19d2f4852a7`.

Frozen implementation/product head: `4bcf862e7e7a019557a9a03952294a2e54393f6c`.

Core implementation evidence head: `7647ede8d45e77799bb5ce7326dbf1a9a3df29fb`.

Sichtbare Build-Kennung: `WD-21D.2`.

Implementiert ist ausschließlich die pure Graph-/Component-Derivation `src/model/sketch-path-graph-derivation.js` auf Basis der D.1-Ausgabe. Line/Arc/Spline verbinden sich nur über identische autoritative `pointId`. Circle wird als eigenständiger endpointloser `CLOSED_CONTOUR` behandelt. Komponenten werden deterministisch als `OPEN_PATH`, `CLOSED_CONTOUR` oder `INVALID_COMPONENT` klassifiziert und in reproduzierbarer Traversal-Reihenfolge ausgegeben. Reverse Traversal verwendet die D.1-Read-Grenze und mutiert keine persistente Geometrie.

Finaler Scope-Audit gegen den dokumentierten D.2-Vertrag: **10 Commits voraus / 0 zurück**. Der Scope bleibt auf D.2-Graph-Autorität, D.2-Regression/Workflow, zentrale Build-ID, notwendige Forward-Compatibility bestehender Build-Gates und Statusdokumentation begrenzt. Keine D.3-/D.4-/D.5-Funktion, keine StableReferences, keine Profil-/Pfadauswahl, kein Extrusionsumbau und keine Dependency/Recompute-Integration wurden vorgezogen.

Automatisierte Evidenz auf dem finalen Branch-Stand:

- WD-21D.1 Regression Run `34629934724`: **SUCCESS**.
- WD-21D.2 Regression Run `34629934765`: **SUCCESS**.
- Frühere Core-Evidenz auf `7647ede8d45e77799bb5ce7326dbf1a9a3df29fb`: D.1 Run `34629766355` SUCCESS und D.2 Run `34629766381` SUCCESS.

Realer iPad-/Safari-Gerätetest auf sichtbarem Build `WD-21D.2`: **1–7 PASS**. Bestätigt sind konsistente Tab-/Header-Build-ID, Line/Circle/Arc/Spline Creation und Sichtbarkeit, Tree-Auswahl und Viewer-Fokus, Point/Line/Circle-Gizmo bei weiterhin keinem Arc-/Spline-Gizmo, Connect/Disconnect-Regressionsverhalten über autoritative Endpunkt-Topologie, Undo/Redo, Save/Reload sowie das Ausbleiben vorgezogener Profil-/Open-Path-Auswahl, Hole/Nesting- oder Extrusionsfunktionen.

Nicht Bestandteil von D.2 sind Area/Winding, Profile, Hole/Nesting, Self-Intersection-/Mixed-Geometry-Validierung, Stable Profile/Path References, Profile/Path Selection, Extrusionsumbau oder Dependency/Recompute-Integration.

WD-21D.2 ist damit abgeschlossen und eingefroren.

### WD-21D.3 – Closed Profile Region & Nesting Derivation

**DEFINED / NOT IMPLEMENTED**

### WD-21D.4 – Mixed Analytic Geometry Validation

**DEFINED / NOT IMPLEMENTED**

### WD-21D.5 – Generic Profile / Open Path Derivation API

**DEFINED / NOT IMPLEMENTED**

### WD-21D.6 – Derivation Regression / Compatibility Gate

**DEFINED / NOT IMPLEMENTED**

## Verbindliche Build-Kennungsregel

Bei jedem Implementierungs-WD-Teilschritt müssen autoritative Build-ID, `document.title`, sichtbare Build-/Brand-Kennung und WD-/Projektstatusdokumentation konsistent sein. Eine widersprüchliche sichtbare Kennung ist ein BLOCKER und verhindert PASS/FROZEN.

Korrekturläufe innerhalb desselben WD-Teilschritts tragen `-R1`, `-R2`, … und müssen in Browser-Tab, sichtbarer Kennung und Build-Gates konsistent sein.

## Nächster zulässiger Schritt

WD-21D.2 ist **PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER**. WD-21D.3 beginnt nicht automatisch. Der nächste zulässige Schritt ist ausschließlich die separate **WD-21D.3 Reconciliation/Definition – Closed Profile Region & Nesting Derivation** gegen den eingefrorenen D.2-Stand. Noch keine D.3-Implementierung im selben Schritt.
