# CM3D – Projektstatus

Stand: 2026-09-09

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

Registry, Persistenz und Validation für `line`, `circle`, `arc`, `spline` sind vorhanden.

### WD-21C.3 – Generic Sketch Element Mutation Contract + Analytic Geometry ↔ Derived Tessellation Boundary

**PASS / DEVICE VERIFIED / 0 BLOCKER**

Zentrale Create/Edit/Delete-Grundlage für Circle, Arc und Spline über `runSketchMutation(...)`; analytische Sketch-Identität bleibt von abgeleiteter Tessellierung getrennt.

### WD-21C.4 – Circle Creation, Rendering & Editing Integration

**PASS / FROZEN / 0 BLOCKER**

Finaler sichtbarer Korrekturstand `WD-21C.4-R1`; Completion-Regression Run `34273576840`: SUCCESS; reale iPad-/Safari-Evidenz: PASS.

### WD-21C.5 – Generic Sketch Element Manipulation Contract

**PASS / FROZEN / 0 BLOCKER**

Direkter Circle-Gizmo-Move, bestehende Point-/Line-Manipulation, Save und Undo/Redo sind auf iPad/Safari bestätigt. Regression Run `34277682889`: SUCCESS.

### WD-21C.6 – Generic Endpoint Element Connectivity Contract

**IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE CHECK PENDING**

Implementierter Minimalumfang:

- neue generische Endpoint-Connectivity-Erweiterung über die bestehende `SketchElementRegistry`;
- Connectivity-Eligibility ausschließlich `topologyEndpoints: true` → aktuell Line/Arc/Spline;
- Circle bleibt vollständig ausgeschlossen;
- `connectSketchPoints(...)` rewired Source-Endpoint-Referenzen über Line/Arc/Spline auf den expliziten Survivor;
- generischer Direct-Pair-/Self-Loop-Guard;
- neue zentrale Operation `disconnectSketchElementFromPoint(...)` für exakt einen ausgewählten Endpoint eines endpoint-basierten Elements;
- Inzidenz wird über alle endpoint-basierten Elemente bestimmt;
- neuer detached `pointId` mit exakt gleicher Koordinate, Element-ID bleibt stabil;
- `disconnectSketchLineFromPoint(...)` bleibt als rückwärtskompatibler Line-Adapter bestehen;
- Connectivity-Command-State verwendet `elementKind + elementId` statt line-spezifischem `lineId`;
- sichtbare Aktionen bleiben `Verbinden` / `Trennen`; nur der Disconnect-Hinweis ist neutral auf Element-Endpunkt formuliert;
- `circle.center`, `arc.control` und `spline.controls[*]` bleiben nicht-topologisch und unverändert;
- keine geometrische Rebinding-/Snap-/Merge-/Tolerance-Semantik;
- keine sichtbare Arc-/Spline-Erstellung, Darstellung, Auswahl, Inspector- oder Gizmo-Funktion;
- keine Profile/Pfade, kein N-Gon und keine Extrusionsintegration;
- zentrale sichtbare Build-ID: `WD-21C.6`.

Automatisierte Regression:

- Workflow: `WD-21C.6 Generic Endpoint Connectivity Regression`;
- Run: `34334339592`;
- getesteter Code-Head: `e91526716bcd6431a4e793fcce2ba4e1dc4fbefd`;
- A.2, A.3, B.2, B.3, C.2, C.3, C.4, C.5, C.6: PASS;
- Result: **SUCCESS / PASS**.

Die C.6-Regressionsfälle decken zusätzlich synthetische Line-/Arc-/Spline-Connectivity, Circle-Ausschluss, generischen Direct-Pair-Guard, Control-Daten-Unverändertheit und Line-Rückwärtskompatibilität ab. Der vorherige Run `34334248395` war ausschließlich wegen einer veralteten C.5-Build-ID-Testgrenze rot; nach deren forward-kompatibler Korrektur ist der vollständige C.6-Lauf grün.

WD-21C.6 ist noch **nicht FROZEN**, bis die reale iPad-/Safari-Bestandsregression vorliegt. WD-21C als Gesamtblock bleibt **nicht FROZEN**.

## Verbindliche Build-Kennungsregel

Bei jedem WD-Teilschritt müssen autoritative Build-ID, `document.title`, sichtbare Build-/Brand-Kennung und WD-/Projektstatusdokumentation konsistent sein. Eine widersprüchliche sichtbare Kennung ist ein **BLOCKER** und verhindert PASS/FROZEN.

Korrekturläufe innerhalb desselben WD-Teilschritts dürfen eine sichtbare Revisionskennung `-R1`, `-R2`, … tragen. Diese Kennung muss ebenfalls in Browser-Tab und Header konsistent sichtbar sein und wird von den Build-Gates akzeptiert.

## Nächster zulässiger Schritt

Ausschließlich der reale iPad-/Safari-Gerätecheck für `WD-21C.6`: Tab und Header müssen konsistent `WD-21C.6` zeigen; bestehendes Point-/Line-Verbinden und -Trennen regressieren; Circle-Auswahl und direkter Circle-Move müssen weiterhin funktionieren; danach kurzer Save/Load- und Undo/Redo-Check. Außerdem prüfen, dass keine sichtbare Arc-/Spline-Funktion hinzugekommen ist. Noch kein C.6-Freeze-Gate und keine Arc-/Spline-Implementierung im selben Schritt.
