# CM3D – Projektstatus

Stand: 2026-09-20

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

**PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER**

Dokumentierter D.3-Vertrag: `3168608b21dc97cef6e11512ad66eaf5a11b7a8b`.

Frozen implementation/product head: `9257b63f7e8a24f55d4d0a0181f96ff2daf3e04f`.

Core implementation evidence head: `f222c09a31937e0753a1c866bd997e38450f1cb3`.

Sichtbare Build-Kennung: `WD-21D.3`.

D.3 implementiert ausschließlich die pure Profile-Region-/Nesting-Derivation `src/model/sketch-profile-region-derivation.js` über der frozen D.2-Ausgabe. Nur `CLOSED_CONTOUR` kann Profile erzeugen. Open Paths und invalid components bleiben ausgeschlossen. Profile besitzen deterministic derived `profileKey`, `outerContour`, `holes[]`, Nesting-Metadaten und Source-Traceability.

Containment folgt deterministisch der Tiefenparität `Outer → Hole → Island → Hole`. Mehrere räumlich getrennte geschlossene Konturen ergeben unabhängige Profile. D.1/D.2-Tessellation bleibt reine derived Rechenhilfe; persistente Geometrie wird nicht verändert.

Finaler Scope-Audit gegen den D.3-Vertragsstand: **8 Commits voraus / 0 zurück**. Der Scope ist auf D.3-Modellautorität, D.3-Regression/Workflow, zentrale Build-ID, notwendige Forward-Compatibility bestehender Build-Gates und Statusdokumentation begrenzt. Keine D.4-/D.5-Funktion, keine Stable Profile/Path References, keine Profil-/Pfadauswahl, kein Extrusionsumbau und keine Dependency/Recompute-Integration wurden vorgezogen.

Finale automatisierte Evidenz auf `9257b63f7e8a24f55d4d0a0181f96ff2daf3e04f`: normaler Build SUCCESS, Pages Deploy SUCCESS, Build-Status SUCCESS, D.3 Regression SUCCESS, D.2 Regression SUCCESS und D.1 Regression SUCCESS.

Realer iPad/Safari-Gerätetest auf sichtbarem Build `WD-21D.3`: **1–7 PASS**. Bestätigt sind konsistente Tab-/Header-Build-ID, Line/Circle/Arc/Spline Creation und Sichtbarkeit, Tree-Auswahl und Viewer-Fokus, Point/Line/Circle-Gizmo bei weiterhin keinem Arc-/Spline-Gizmo, Connect/Disconnect-Regressionsverhalten über autoritative Endpunkt-Topologie, Undo/Redo, Save/Reload sowie das Ausbleiben vorgezogener Profil-Auswahl-, Hole/Nesting-UI- oder Extrusionsfunktionen.

D.3 übernimmt ausdrücklich nicht die finale geometrische Gültigkeitsprüfung. Self-Intersection, degenerierte Geometrie, Boundary Contact und andere Mixed-Analytic-Grenzfälle bleiben D.4. Existing `src/model/sketch-profile.js`, Extrusion, Auswahl, StableReferences und Recompute/Dependency bleiben unverändert.

WD-21D.3 ist damit abgeschlossen und eingefroren.

### WD-21D.4 – Mixed Analytic Geometry Validation

**PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER**

Dokumentierter D.4-Vertrag: `9d2503998610fba0bd6bdf79d98a97dba702e393`.
Frozen implementation/product head: `f0370e81c13779fedddef7962f3dc894ba44609f`.
Sichtbare Build-Kennung: `WD-21D.4-R2`.

D.4 implementiert ausschließlich die pure Read-/Validation-Schicht `src/model/sketch-geometry-validation.js` über der frozen D.1→D.2→D.3-Kette. `validateSketchProfileGeometry(sketch)` klassifiziert derived geometry deterministisch als `VALID`, `INVALID`, `AMBIGUOUS` oder `UNRESOLVED` und liefert Contour-/Profile-Region-Validierungen, Diagnostics und Upstream-Diagnostics mit Source-Traceability.

Implementiert sind Zero-Area/Degeneracy, Self-Intersection mit Ausschluss legaler benachbarter gemeinsamer Konturendpunkte, Inter-Contour Crossing/Overlap und Boundary Contact sowie gemischte Line/Circle/Arc/Spline-Prüfung auf Basis der read-only D.1-Tessellation. Proven crossings/overlaps und Self-Intersection sind invalid; reine Boundary Contacts bleiben ambiguous statt stillschweigend validiert zu werden.

Der finale Scope-Audit gegen den D.4-Vertrag ergibt **20 Commits voraus / 0 zurück** und bleibt auf die erwarteten neun Dateien begrenzt: D.4-Validation, D.4-Regression/Workflow, zentrale Build-ID, notwendige Build-Gate-Forward-Compatibility und Statusdokumentation. Keine D.5-Funktion, Stable Profile/Path Reference, Profil-/Pfadauswahl, Extrusionsumstellung oder Dependency/Recompute-Integration wurde vorgezogen.

Auf exakt `f0370e81c13779fedddef7962f3dc894ba44609f` sind normaler Build, Pages Deploy, Build-Status sowie D.1-, D.2-, D.3- und D.4-Regressionschecks vollständig SUCCESS.

Realer iPad/Safari-Test auf sichtbarem Build `WD-21D.4-R2`: **1–7 PASS**. Bestätigt sind Build-ID-Konsistenz, Line/Circle/Arc/Spline Creation und Darstellung, Auswahl/Fokus/Gizmo-Regressionsverhalten, Endpoint-only Connectivity, Undo/Redo, Save/Reload sowie das Ausbleiben vorgezogener D.5-/Profil-/Hole-/Nesting-/Extrusionsfunktionen.

Eine zusätzliche Circle Geometry / Viewer Consistency Reconciliation bestätigte, dass Inspector, Viewer-Tessellation und Circle-Gizmo denselben autoritativen `circle.center` und `circle.radius` verwenden. Der visuelle Eindruck eines zu großen Kreises entstand durch das Sketch-Grid `GridHelper(10,20)` mit 0,5-m-Minor-Abstand; Radius 1 m ergibt deshalb korrekt vier Minor-Zellen Durchmesser. **Kein Geometrie-Blocker.**

Als NON-BLOCKING / LATER SKETCH-GRID UX ist vermerkt, dass Rasterabstand bzw. Major-/Minor-Darstellung der Skizze später einstellbar oder sichtbar ausgewiesen werden soll, um Maßstabsverwechslungen zu vermeiden. Das normale Weltraster mit zoomabhängiger Darstellung wurde dabei nicht als fehlerhaft festgestellt.

WD-21D.4-R2 ist damit **PASS / FROZEN / DEVICE VERIFIED / 0 BLOCKER**.

### WD-21D.5 – Generic Profile / Open Path Derivation API

**PASS / FROZEN / 0 BLOCKER**

### WD-21D.6 – Derivation Regression / Compatibility Gate

**PASS / FROZEN / 0 BLOCKER**

Automatische Regression auf der WD-21E-Freeze-Baseline `2c0940d6f58eac99aa89664d252b433488745207`: SUCCESS.

## WD-21E – Stable Profile/Path Reference & Selection

**PASS / FROZEN / 0 BLOCKER**

Freeze-Baseline: `2c0940d6f58eac99aa89664d252b433488745207`.

WD-21E schließt die Identity-/StableReference-Grundlage für Profile und offene Pfade. Persistente `profileIdentities` und `pathIdentities` werden im Sketch-Schema geführt; Profile/Pfade werden über ihre persistenten Source-Element-IDs wiedererkannt. Die StableReference-Brücke unterstützt PROFILE/PATH mit `ownerId`/`targetId` und den kontrollierten Zuständen RESOLVED, MISSING, INVALID und UNRESOLVED.

Completion-/Regression-Evidence: automatischer Push-Lauf `WD-21E Identity Reference Foundation #12` auf der Freeze-Baseline vollständig SUCCESS. Der sequenzielle Gate-Lauf umfasst WD-20A/20C, WD-21A.2/A.3, WD-21B.2/B.3, WD-21C.2–C.8-R2, WD-21D.1–D.6 und abschließend den WD-21E Profile/Path Reference Contract. Zusätzlich war der separate WD-21D.6 Derivation Regression Compatibility Gate #28 SUCCESS. Offene Blocker: 0.

Während der Completion-Regressions wurden ausschließlich historische Test-Fixtures an das inzwischen verpflichtende Sketch-Schema angepasst. Korrigierte Kette: WD-21A.2 → WD-21A.3 → WD-21B.2 → WD-21B.3 → WD-21C.3 → WD-21C.6. Ergänzt wurden ausschließlich fehlende leere `profileIdentities: {}` / `pathIdentities: {}`; Assertions und Produktsemantik wurden dadurch nicht abgeschwächt.

## WD-21F – Profile/Path Dependency & Recompute Integration

**PASS / FROZEN / 0 BLOCKER**

Freeze-Baseline: `490a6430de8b6c88e4897a52f7bff27d6d436ac7`.

Definition basis: WD-21E Freeze-Baseline `2c0940d6f58eac99aa89664d252b433488745207`.

WD-21F erweitert ausschließlich die vorhandene Dependency-/Recompute-Foundation so, dass persistente PROFILE-/PATH-StableReferences aus WD-21E als konkrete Dependency-Quellen verwendet werden können. Die bestehende objektbasierte Graph-/Cycle-Architektur bleibt erhalten: die Dependency-Kante führt vom besitzenden Sketch zum abhängigen Feature, ihre Quellgültigkeit wird jedoch über die konkrete PROFILE-/PATH-Referenz aufgelöst.

Verbindliche Zustandssemantik: RESOLVED erlaubt Recompute. MISSING, INVALID oder UNRESOLVED bleiben als Root Cause an der Source-Reference erhalten und führen am abhängigen Feature deterministisch zu BLOCKED. Kein geometrisches Ersatzprofil, kein automatisches Rebinding und kein stiller Fallback auf ein anderes Profil, einen anderen Pfad oder die gesamte Skizze. Wird dieselbe persistente Identity später wieder eindeutig RESOLVED, muss die Abhängigkeit wieder recompute-fähig werden. Die bestehende Cycle-Erkennung bleibt autoritativ; kein zweiter Dependency-Graph.

Scope von WD-21F: generische Dependency-Edge-Erzeugung für PROFILE/PATH, Root-Cause→BLOCKED-Propagation, Traversal/Recompute-Autorität über diese Kanten, Wiederfreigabe nach erneutem RESOLVED sowie Regression des bestehenden SKETCH→Extrude-Verhaltens.

Ausdrücklich ausgeschlossen: neue UI, neue Profil-/Pfad-Selektion, neue Geometrieableitung oder Sketch-Mutationen, Sweep/Loft/Revolve/Thin Extrude, Multi-Profil-Extrude sowie eine Umstellung des bestehenden V1-/Bestands-Extrude auf ProfileRef. WD-21F schafft nur die generische Foundation; konkrete Feature-Umstellungen erfolgen erst in dem späteren Featureblock, der PROFILE/PATH tatsächlich als Quelle nutzt. Kein neues Persistenzschema ist Teil dieser Definition.

Completion-/Regression-Evidence: Auf dem verifizierten Head `490a6430de8b6c88e4897a52f7bff27d6d436ac7` lief der manuell gestartete Aggregate-Workflow `WD-21E Identity Reference Foundation #18` auf `feature/wd-21f-profile-path-dependency-recompute` vollständig SUCCESS. Der Aggregate-Workflow enthält dabei zusätzlich den WD-21F-Vertragstest `tests/wd-21f-profile-path-dependency-recompute.mjs`; damit sind neuer F-Vertrag und bestehender Compatibility-Unterbau gemeinsam nachgewiesen. Der vorherige Lauf #17 bestätigte den unveränderten Compatibility-Unterbau bereits vor Aufnahme des F-Tests.

Finaler Scope-Abgleich gegen den autorisierten Ausgangsstand `98fba11406d11cfc59a7c8dba480df1aacb2fd55`: 5 Commits voraus / 0 zurück; Änderungen ausschließlich an `src/application/dependency-graph.js`, `tests/wd-21f-profile-path-dependency-recompute.mjs` und der zweizeiligen CI-Einbindung in `.github/workflows/wd-21e-identity-reference-foundation.yml`. `extrude.js`, `sketch-editing.js`, StableReference-/Identity-/Derivation-Code, Projektschema und UI blieben unangetastet.

## Verbindliche Build-Kennungsregel

Bei jedem Implementierungs-WD-Teilschritt müssen autoritative Build-ID, `document.title`, sichtbare Build-/Brand-Kennung und WD-/Projektstatusdokumentation konsistent sein. Eine widersprüchliche sichtbare Kennung ist ein BLOCKER und verhindert PASS/FROZEN.

Korrekturläufe innerhalb desselben WD-Teilschritts tragen `-R1`, `-R2`, … und müssen in Browser-Tab, sichtbarer Kennung und Build-Gates konsistent sein.

## Nächster zulässiger Schritt

WD-21F ist auf Freeze-Baseline `490a6430de8b6c88e4897a52f7bff27d6d436ac7` **PASS / FROZEN / 0 BLOCKER**. WD-21G beginnt nicht automatisch. Ein WD-21G-/RB-02-Integrationsschritt erfordert eine separate Reconciliation/Freigabe gegen diesen eingefrorenen Stand.
