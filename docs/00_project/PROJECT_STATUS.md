# CM3D – Projektstatus

Stand: 2026-09-08

## Aktueller Gesamtstand

Repository `DrHoschi/CM3D` ist die zentrale Projektbasis.

**CM3D V1 – COMPLETE / PASS / FROZEN**

## V2 – Foundation & Compatibility

**RB-01 – PASS / FROZEN**

Freigegebener `main`-Stand nach Abschlussdokumentation:

`1edae185c6207db9d754c94d00d23cf10218c56c`

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

Freeze-Dokumentation: `4014cf865049c66c20d756db608201fa599d0948`

## WD-21B – Sketch Connectivity & Editing Integration

**PASS / FROZEN / 0 BLOCKER**

Freeze-Dokumentation: `2e8d5b0434e62bf7c7e34b11e54da077853328cc`

## WD-21C – Sketch Element Type Expansion

Aktiver Branch: `feature/wd-21c-sketch-element-type-expansion`  
Basis: WD-21B FROZEN @ `2e8d5b0434e62bf7c7e34b11e54da077853328cc`

### WD-21C.1 – Existing Sketch Element Type & Creation/Editing Inventory

**PASS / INVENTORY & CONTRACT COMPLETE / 0 ELEMENT IMPLEMENTATION**

### WD-21C.2 – Generic Sketch Element Registry & Persistence Foundation

**PASS / DEVICE VERIFIED / 0 BLOCKER**

Registry, Persistenz und Validation für `line`, `circle`, `arc`, `spline` sind vorhanden. Reale iPad-/Safari-Evidenz bestätigte Build-ID und Bestandsregression.

### WD-21C.3 – Generic Sketch Element Mutation Contract + Analytic Geometry ↔ Derived Tessellation Boundary

**PASS / DEVICE VERIFIED / 0 BLOCKER**

Zentrale Create/Edit/Delete-Grundlage für Circle, Arc und Spline über `runSketchMutation(...)`; analytische Sketch-Identität bleibt von abgeleiteter Tessellierung getrennt.

### WD-21C.4 – Circle Creation, Rendering & Editing Integration

**PASS / FROZEN / 0 BLOCKER**

Finaler sichtbarer Korrekturstand: `WD-21C.4-R1`. Circle-Erzeugung, Rendering, Viewer-/Baumauswahl und Inspector-Edit sind auf realem iPad/Safari bestätigt. Completion-Regression Run `34273576840`: SUCCESS.

### WD-21C.5 – Generic Sketch Element Manipulation Contract

**PASS / FROZEN / 0 BLOCKER**

Freigegebener Minimalumfang:

- typbezogener Sketch-Gizmo-Manipulationsadapter für `point`, `line`, `circle`;
- Circle-Gizmo-Anker = autoritativer `circle.center`;
- Circle-Move ändert ausschließlich `center.x/y`, nicht `circleId` oder `radius`;
- Point-/Line-Verhalten bleibt funktional erhalten;
- Preview wird vor dem finalen Commit auf den Ausgangszustand zurückgesetzt;
- Pointer-up → genau ein zentraler `runSketchMutation(...)`-Commit / ein History-Schritt;
- Pointer-Cancel → vollständige Wiederherstellung ohne Commit;
- Translate-Snap bleibt erhalten, ohne neue Connect-/Merge-/Tolerance-/Rebinding-Semantik;
- lokale historische `WD-12B`-Build-Zuweisung aus `sketch-gizmo.js` entfernt;
- zentrale sichtbare Build-ID ist `WD-21C.5`;
- keine gemischte Circle+Line-/Point-Multiselection-Erweiterung;
- keine Circle-Radius-/Rotate-/Scale-Manipulation;
- keine Arc-/Spline-Funktion.

Completion-/Regression-/Freeze-Evidenz:

- C.4-Freeze-Basis: `cca28626ae1bff0f888416935963fb933ee367f9`;
- geprüfter C.5-Stand vor Freeze-Dokumentation: `e18970efe0a0b6c0d6e94af719c2aba07c15cbcf`;
- Diff: 10 Commits voraus / 0 dahinter;
- Workflow: `WD-21C.5 Generic Sketch Manipulation Regression`;
- Run: `34277682889`;
- getesteter Code-Head: `929143091ff6698fb0248a8f9eb02da367ee2326`;
- A.2, A.3, B.2, B.3, C.2, C.3, C.4, C.5: PASS;
- Result: **SUCCESS / PASS**.

Reale iPad-/Safari-Evidenz 2026-09-08:

- Browser-Tab und Header konsistent `WD-21C.5`: PASS;
- Circle direkt per Gizmo verschiebbar: PASS;
- ältere Point-/Line-Elemente funktionieren weiterhin: PASS;
- Save: PASS;
- Undo/Redo: PASS;
- gemeldete Blocker: 0.

WD-21C.5 ist damit **PASS / FROZEN / 0 BLOCKER**.

### WD-21C.6 – Generic Endpoint Element Connectivity Contract

**DEFINED / NOT IMPLEMENTED**

Verbindliches Ziel: die B.2/B.3-Connectivity von line-spezifischer Verarbeitung auf alle registrierten endpoint-basierten Sketch-Elemente zu generalisieren, ohne sichtbare Arc-/Spline-Funktion einzuführen.

Reconciled gegen frozen C.5 `37db2ee9815435e9ff92023d9fbd6132f0664239`:

- Registry: `line`, `arc`, `spline` sind `topologyEndpoints: true`; `circle` ist ausgeschlossen;
- `getSketchElementPointIds(...)` besitzt bereits die gemeinsame Endpoint-Lesegrenze;
- bestehende Command-/Mutation-Pfade zählen, prüfen, rewiren und trennen jedoch noch ausschließlich Lines;
- `pointId` bleibt einzige Connectivity-Autorität; geometrische Gleichheit erzeugt niemals Verbindung.

C.6 Contract-Grenzen:

- Endpoint-Eligibility ausschließlich über die registrierte `topologyEndpoints: true`-Eigenschaft;
- generische Inzidenz über Line/Arc/Spline;
- Connect: exakt zwei Punkte derselben Skizze, erster = Source, letzter/Primary = Survivor; alle Source-Endpoint-Referenzen werden auf Survivor umgehängt;
- Direct-Pair Guard gilt generisch für jedes endpoint-basierte Element;
- Disconnect: exakt `point + ein incident endpoint element`; nur dessen ausgewählter Endpoint wird auf einen neuen Punkt mit identischen Koordinaten umgehängt;
- Minimum-Incidence wird über alle endpoint-basierten Elemente bestimmt;
- Element-ID und ursprüngliche Survivor-/Shared-Point-ID bleiben stabil;
- Circle-Center, Arc-Control und Spline-Controls bleiben ausdrücklich nicht-topologisch und von Connect/Disconnect ausgeschlossen;
- finaler Write bleibt innerhalb `runSketchMutation(...)` mit Validation, History, Recompute und Selection-Events;
- bestehende sichtbare Aktionen `Verbinden` / `Trennen` und alle Line-only-Fälle bleiben rückwärtskompatibel;
- keine geometrische Rebinding-, Snap-, Merge- oder Tolerance-Semantik.

Nicht Bestandteil von C.6:

- keine sichtbare Arc-/Spline-Erstellung, Darstellung, Auswahl, Inspector- oder Gizmo-Funktion;
- keine Circle-Connectivity;
- keine Constraints;
- kein N-Gon;
- keine Profile/Pfade;
- keine Extrusionsintegration.

WD-21C.6 ist **DEFINED / NOT IMPLEMENTED**. WD-21C als Gesamtblock bleibt **nicht FROZEN**.

## Verbindliche Build-Kennungsregel

Bei jedem WD-Teilschritt müssen autoritative Build-ID, `document.title`, sichtbare Build-/Brand-Kennung und WD-/Projektstatusdokumentation konsistent sein. Eine widersprüchliche sichtbare Kennung ist ein **BLOCKER** und verhindert PASS/FROZEN.

Korrekturläufe innerhalb desselben WD-Teilschritts dürfen eine sichtbare Revisionskennung `-R1`, `-R2`, … tragen. Diese Kennung muss ebenfalls in Browser-Tab und Header konsistent sichtbar sein und wird von den Build-Gates akzeptiert.

## Nächster zulässiger Schritt

Ausschließlich das **WD-21C.6 Definition/Implementation Gate** gegen den eingefrorenen C.5-Stand durchführen und daraus den exakten minimalen Implementierungsumfang sowie die betroffenen autoritativen Connectivity-Grenzen ableiten. Noch keine Code-Implementierung im selben Schritt und weiterhin keine sichtbare Arc-/Spline-Funktion.
