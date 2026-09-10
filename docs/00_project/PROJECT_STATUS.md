# CM3D – Projektstatus

Stand: 2026-09-10

## Aktueller Gesamtstand

Repository `DrHoschi/CM3D` ist die zentrale Projektbasis.

**CM3D V1 – COMPLETE / PASS / FROZEN**

## V2 – Foundation & Compatibility

**RB-01 – PASS / FROZEN**

Freigegebener `main`-Stand nach Abschlussdokumentation: `1edae185c6207db9d754c94d00d23cf10218c56c`

## RB-02 – Sketch Topology & Profiles

RB-02 ist der aktuell aktive V2-Roadmapblock.

Geplante WD-Zerlegung:

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

### WD-21C.1
**PASS / INVENTORY & CONTRACT COMPLETE / 0 ELEMENT IMPLEMENTATION**

### WD-21C.2
**PASS / DEVICE VERIFIED / 0 BLOCKER**

### WD-21C.3
**PASS / DEVICE VERIFIED / 0 BLOCKER**

### WD-21C.4 – Circle Creation, Rendering & Editing Integration
**PASS / FROZEN / 0 BLOCKER**

### WD-21C.5 – Generic Sketch Element Manipulation Contract
**PASS / FROZEN / 0 BLOCKER**

### WD-21C.6 – Generic Endpoint Element Connectivity Contract
**PASS / FROZEN / 0 BLOCKER**

Finaler sichtbarer Korrekturstand `WD-21C.6-R1`; Completion-Regression Run `34363013788`: SUCCESS; reale iPad-/Safari-Evidenz: PASS.

### WD-21C.7 – Arc Creation, Rendering & Editing Integration
**PASS / FROZEN / 0 BLOCKER**

Finaler sichtbarer Stand `WD-21C.7`; Completion-Regression Run `34369150959`: SUCCESS; reale iPad-/Safari-Evidenz: PASS / 0 BLOCKER.

### WD-21C.8 – Spline Creation, Rendering & Editing Integration

**PASS / FROZEN / 0 BLOCKER**

Finaler sichtbarer Korrekturstand: `WD-21C.8-R2`.

Geprüfter Produkt-/Test-Head: `fe20a2b6b149595b2ffe57a3838da655dfe8b24d`.

`WD-21C.8-R2 Selection Camera Alignment Regression`, Run `34510128236`: **SUCCESS**; bestehender R1-Workflow auf demselben Head, Run `34510128178`: **SUCCESS**. Realer iPad-/Safari-Test auf `WD-21C.8-R2`: **PASS**.

WD-21C ist fachlich bis einschließlich C.8 abgeschlossen und eingefroren.

## WD-21D – Profile & Open Path Derivation

Aktiver Entwicklungsbranch: `feature/wd-21d-profile-open-path-derivation`

Definition-/Branch-Basis: eingefrorener WD-21C.8-R2-Stand `b29efc297ab8183a9e5879798bb6fd9da201cdf2`.

### WD-21D.1 – Generic Sketch Curve/Edge Derivation Contract

**IMPLEMENTED / REGRESSION ADDED / CI VERIFICATION PENDING / NOT FROZEN**

Sichtbare Build-Kennung: `WD-21D.1`.

Implementiert ist ausschließlich die generische read-only Curve/Edge-Derivation für `line`, `circle`, `arc` und `spline`. Source-Element- und Endpoint-Identitäten bleiben autoritativ; Circle erhält keine künstlichen Topologie-Endpunkte. Deterministische Geometriesamples sind nur abgeleitete Hilfsdaten. Eine pure UI-unabhängige Arc-Geometriegrenze wurde ergänzt; die bestehende Spline-Geometrie wird wiederverwendet.

Noch nicht Teil von D.1 sind Connected Components, Closed Contours, Open Paths, Profile, Hole/Nesting, Stable Profile/Path References, Auswahl, Extrusionsumbau oder Dependency/Recompute-Integration.

Passende D.1-Regression und GitHub-Workflow sind vorhanden; ein Completion-/Device-/Freeze-Gate ist in diesem Implementierungsschritt ausdrücklich noch nicht freigegeben.

## Verbindliche Build-Kennungsregel

Bei jedem WD-Teilschritt müssen autoritative Build-ID, `document.title`, sichtbare Build-/Brand-Kennung und WD-/Projektstatusdokumentation konsistent sein. Eine widersprüchliche sichtbare Kennung ist ein **BLOCKER** und verhindert PASS/FROZEN.

Korrekturläufe innerhalb desselben WD-Teilschritts dürfen eine sichtbare Revisionskennung `-R1`, `-R2`, … tragen. Diese Kennung muss ebenfalls in Browser-Tab und Header konsistent sichtbar sein und wird von den Build-Gates akzeptiert.

## Nächster zulässiger Schritt

Ausschließlich WD-21D.1 Implementation Verification / Automated Regression gegen den implementierten Branch-Stand. Noch keine D.2-Arbeit, kein Geräte-PASS und kein Freeze-Gate ohne separate Freigabe.
