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

D.2 implementiert ausschließlich die pure Graph-/Component-Derivation auf Basis von D.1. Line/Arc/Spline verbinden sich nur über identische autoritative `pointId`; Circle bleibt eigenständiger endpointloser `CLOSED_CONTOUR`. Komponenten werden deterministisch als `OPEN_PATH`, `CLOSED_CONTOUR` oder `INVALID_COMPONENT` klassifiziert. Reale iPad/Safari-Evidenz: 1–7 PASS.

### WD-21D.3 – Closed Profile Region & Nesting Derivation

**IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE NOT VERIFIED / NOT FROZEN**

Dokumentierter D.3-Vertrag: `3168608b21dc97cef6e11512ad66eaf5a11b7a8b`.

Core implementation evidence head: `f222c09a31937e0753a1c866bd997e38450f1cb3`.

Sichtbare Build-Kennung: `WD-21D.3`.

Implementiert ist ausschließlich die pure Profile-Region-/Nesting-Derivation `src/model/sketch-profile-region-derivation.js` auf Basis der frozen D.2-Ausgabe. Nur `CLOSED_CONTOUR`-Komponenten können Profile erzeugen; Open Paths und invalid components bleiben ausgeschlossen. Ein Profil enthält einen deterministischen derived `profileKey`, `outerContour`, `holes[]`, Nesting-Tiefe und vollständige Source-Traceability.

Containment wird deterministisch über gerade/ungerade Tiefe klassifiziert: Outer → Hole → Island → Hole usw. Mehrere räumlich getrennte geschlossene Konturen erzeugen mehrere unabhängige Profile. D.1/D.2-Tessellation wird nur als derived Rechenhilfe verwendet; persistente Geometrie wird nicht verändert.

D.3 übernimmt ausdrücklich nicht die finale geometrische Gültigkeitsprüfung. Self-Intersection, degenerierte Geometrie, Boundary Contact und andere Mixed-Analytic-Grenzfälle bleiben D.4. Existing `src/model/sketch-profile.js`, Extrusion, Auswahl, StableReferences und Recompute/Dependency bleiben unverändert.

Automatisierte Evidenz auf `f222c09a31937e0753a1c866bd997e38450f1cb3`:

- D.3 `profile-region-regression`: **SUCCESS**.
- D.2 `path-graph-derivation-regression`: **SUCCESS**.
- D.1 `curve-derivation-regression`: **SUCCESS**.
- Normaler Build war beim Schreiben dieses Implementierungsstatus noch in Ausführung; finale Build-/Deploy-Evidenz gehört in das separate Completion / Regression / Device Verification Gate.

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

WD-21D.3 ist implementiert und seine dedizierte Regression ist grün, aber noch nicht geräteverifiziert oder eingefroren. Der nächste zulässige Schritt ist ausschließlich **WD-21D.3 – Completion / Regression / Device Verification Gate** gegen den finalen Branch-Stand. Erst danach darf separat über PASS/FROZEN entschieden werden. WD-21D.4 beginnt noch nicht.
