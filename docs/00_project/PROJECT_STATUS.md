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

### WD-21C.1

**PASS / INVENTORY & CONTRACT COMPLETE / 0 ELEMENT IMPLEMENTATION**

### WD-21C.2

**PASS / DEVICE VERIFIED / 0 BLOCKER**

### WD-21C.3

**PASS / DEVICE VERIFIED / 0 BLOCKER**

### WD-21C.4 – Circle Creation, Rendering & Editing Integration

**PASS / FROZEN / 0 BLOCKER**

Finaler sichtbarer Korrekturstand `WD-21C.4-R1`; Completion-Regression Run `34273576840`: SUCCESS; reale iPad-/Safari-Evidenz: PASS.

### WD-21C.5 – Generic Sketch Element Manipulation Contract

**PASS / FROZEN / 0 BLOCKER**

Direkter Circle-Gizmo-Move, bestehende Point-/Line-Manipulation, Save und Undo/Redo sind auf iPad/Safari bestätigt. Regression Run `34277682889`: SUCCESS.

### WD-21C.6 – Generic Endpoint Element Connectivity Contract

**PASS / FROZEN / 0 BLOCKER**

Finaler sichtbarer Korrekturstand: `WD-21C.6-R1`.

C.6 generalisiert Connect/Disconnect auf registrierte endpoint-basierte Elemente Line/Arc/Spline; Circle bleibt ausgeschlossen. Keine sichtbare Arc-/Spline-Funktion wurde eingeführt.

Der erste Gerätecheck auf `WD-21C.6` zeigte eine Mehrfachauswahlregression. R1 korrigiert ausschließlich diesen Integrationsfehler: Bei aktiver Mehrfachauswahl bleibt die bestehende Sketch-Element-Auswahl über die Owner-Sketch-Selektion hinweg erhalten, solange derselbe Sketch Owner bleibt. Die Connect-/Disconnect-Fachregeln selbst wurden nicht verändert.

Completion-/Freeze-Evidenz:

- C.6-Vergleichsbasis: `e91526716bcd6431a4e793fcce2ba4e1dc4fbefd`
- auditierter R1-Branchstand vor Freeze-Dokumentation: `beaeb9c9d45c988e3b2a2cad6aab2ddc6013ad2e`
- Diff: **9 Commits voraus / 0 dahinter**
- R1-Multiselect-Fix: `bbfd768744e4b0aded323c741dbfb9194e575698`
- R1-Build-ID: `ddab664c753ea6cf6b8b81ddfff98405609861e9`
- getesteter Code-Head: `e4c0d91df1f0ae9a2baf0df9d2d30782772ebe4a`
- Workflow: `WD-21C.6 Generic Endpoint Connectivity Regression`
- Run: `34363013788`
- A.2, A.3, B.2, B.3, C.2, C.3, C.4, C.5 und C.6: PASS
- Result: **SUCCESS / PASS**

Reale iPad-/Safari-Evidenz auf `WD-21C.6-R1`:

- Tab/Header Build-ID: PASS
- Zeichnen/Polygon: PASS
- Mehrfachauswahl: PASS
- Verbinden/Trennen: PASS
- Verbindung erneut zusammenführen: PASS
- Undo/Redo: PASS
- Speichern/Laden: PASS
- **0 BLOCKER**

Keine Arc-/Spline-Erstellung, kein Arc-/Spline-Rendering/Inspector/Gizmo, keine Profile/Pfade, kein N-Gon und keine Extrusionsintegration wurden durch C.6-R1 eingeführt.

WD-21C.6 ist damit **PASS / FROZEN / 0 BLOCKER**. WD-21C als Gesamtblock bleibt **nicht FROZEN**.

## Verbindliche Build-Kennungsregel

Bei jedem WD-Teilschritt müssen autoritative Build-ID, `document.title`, sichtbare Build-/Brand-Kennung und WD-/Projektstatusdokumentation konsistent sein. Eine widersprüchliche sichtbare Kennung ist ein **BLOCKER** und verhindert PASS/FROZEN.

Korrekturläufe innerhalb desselben WD-Teilschritts dürfen eine sichtbare Revisionskennung `-R1`, `-R2`, … tragen. Diese Kennung muss ebenfalls in Browser-Tab und Header konsistent sichtbar sein und wird von den Build-Gates akzeptiert.

## Nächster zulässiger Schritt

Ausschließlich den nächsten kleinen WD-21C-Teilblock fachlich definieren. Noch keine Arc-/Spline-Implementierung und keine weitere C.6-Erweiterung im selben Schritt.
