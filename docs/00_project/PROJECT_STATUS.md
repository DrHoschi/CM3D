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

**IMPLEMENTED / R1 CORRECTION / AUTOMATED REGRESSION PASS / DEVICE RECHECK PENDING / NOT FROZEN**

Die C.6-Basis generalisiert Connect/Disconnect auf registrierte endpoint-basierte Elemente Line/Arc/Spline; Circle bleibt ausgeschlossen. Keine sichtbare Arc-/Spline-Funktion wurde eingeführt.

Der erste reale iPad-/Safari-Check auf `WD-21C.6` ergab:

- Build-ID Tab/Header: PASS
- Save/Load: PASS
- Undo/Redo: PASS
- Mehrfachauswahl: FAIL
- dadurch bestehendes Point-/Line-`Verbinden`/`Trennen` nicht praktikabel
- **1 BLOCKER**

R1-Ursache: Bei jeder generischen Sketch-Element-Auswahl wurde zuerst der Owner-Sketch über einen bereits von der Mehrfachauswahl umwickelten `store.select(...)`-Pfad gesetzt. Dieser Pfad leerte `store.selection.sketchElements`, sodass die vorherige Auswahl vor dem zweiten Tap verloren ging.

R1-Minimalfix: Bei aktiver Mehrfachauswahl bleibt die vorhandene Sketch-Element-Liste erhalten, wenn der Owner-Sketch derselbe ist. Alle anderen Selektionsfälle behalten ihr bisheriges Clear-Verhalten. Keine Connectivity-Fachregel wurde geändert.

R1-Evidenz:

- sichtbare Build-ID: `WD-21C.6-R1`
- Multiselect-Fix: `bbfd768744e4b0aded323c741dbfb9194e575698`
- Build-ID: `ddab664c753ea6cf6b8b81ddfff98405609861e9`
- Regressionstest-Head: `e4c0d91df1f0ae9a2baf0df9d2d30782772ebe4a`
- Workflow: `WD-21C.6 Generic Endpoint Connectivity Regression`
- Run: `34363013788`
- A.2, A.3, B.2, B.3, C.2, C.3, C.4, C.5, C.6: PASS
- Result: **SUCCESS / PASS**

WD-21C.6-R1 bleibt bis zum realen Geräte-Recheck ausdrücklich **nicht FROZEN**. WD-21C als Gesamtblock bleibt **nicht FROZEN**.

## Verbindliche Build-Kennungsregel

Bei jedem WD-Teilschritt müssen autoritative Build-ID, `document.title`, sichtbare Build-/Brand-Kennung und WD-/Projektstatusdokumentation konsistent sein. Eine widersprüchliche sichtbare Kennung ist ein **BLOCKER** und verhindert PASS/FROZEN.

Korrekturläufe innerhalb desselben WD-Teilschritts dürfen eine sichtbare Revisionskennung `-R1`, `-R2`, … tragen. Diese Kennung muss ebenfalls in Browser-Tab und Header konsistent sichtbar sein und wird von den Build-Gates akzeptiert.

## Nächster zulässiger Schritt

Ausschließlich der reale iPad-/Safari-Geräte-Recheck auf **`WD-21C.6-R1`**: Tab/Header prüfen, Mehrfachauswahl aktivieren, zwei Punkte derselben Skizze nacheinander auswählen und sicherstellen, dass beide erhalten bleiben; anschließend `Verbinden` und `Trennen` testen. Save/Load und Undo/Redo kurz regressieren. Noch kein Freeze-Gate, keine Arc-/Spline-Funktion und kein nächster C-Teilblock.
