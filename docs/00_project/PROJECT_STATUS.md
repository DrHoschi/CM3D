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

Finaler sichtbarer Korrekturstand `WD-21C.6-R1`. Completion-Regression Run `34363013788`: SUCCESS. Reale iPad-/Safari-Evidenz bestätigt Zeichnen/Polygon, Mehrfachauswahl, Verbinden/Trennen, erneutes Zusammenführen, Undo/Redo und Speichern/Laden. 0 BLOCKER.

### WD-21C.7 – Arc Creation, Rendering & Editing Integration

**PASS / FROZEN / 0 BLOCKER**

Reconciliation-Basis: eingefrorener C.6-R1-Stand `a16a1f6b70a10fb10b469ff45e3795a95ddbbc45`.

Implementierter Umfang:

- atomare zentrale Arc-Erzeugung über `addSketchArcFromPoints(...)`: zwei stabile Endpoint-Punkte + genau ein Arc in einer `runSketchMutation(...)`-Transaktion und einem Undo-Schritt;
- `setSketchArcGeometry(...)` erhält `arcId` und beide Endpoint-IDs beim numerischen Editing;
- sichtbares Werkzeug `Bogen` mit Drei-Tap-Input `Start → Ende → Control`;
- vor der dritten gültigen Eingabe ausschließlich Preview-State;
- abgeleitete Arc-Tessellation, nicht persistent und keine Sketch-Line-Repräsentation;
- Arc als ein `SKETCH_ELEMENT` im Viewer und in `Bögen (n)` im Objektbaum;
- Viewer-/Tree-Picking über die bestehende generische SelectionRef-Grenze;
- Inspector für Start X/Y, Ende X/Y und Kontrollpunkt X/Y;
- eingefrorene C.6-Connectivity wird für Arc-Endpunkte wiederverwendet, nicht erweitert;
- sichtbare Build-ID `WD-21C.7`.

Completion-/Freeze-Audit gegen `a16a1f6b70a10fb10b469ff45e3795a95ddbbc45`:

- **12 Commits voraus / 0 dahinter**;
- Produktänderungen ausschließlich Arc-Creation, Arc-UI-Integration und notwendige `main.js`-Integration/Build-ID;
- C.7-Test und Workflow hinzugefügt;
- C.3-/C.6-Regressionsgrenzen ausschließlich forward-kompatibel gemacht;
- keine Spline-Funktion, kein Arc-Gizmo, keine Profile/Pfade, kein N-Gon, keine Extrusionsintegration und keine C.6-Fachänderung.

Automatisierte Regression:

- Workflow: `WD-21C.7 Arc Integration Regression`;
- Run: `34369150959`;
- getesteter Code-Head: `9b49ec2fd16dda35de38cf185230692272997b46`;
- A.2, A.3, B.2, B.3, C.2, C.3, C.4, C.5, C.6 und C.7: PASS;
- Result: **SUCCESS / PASS**.

Reale iPad-/Safari-Evidenz auf `WD-21C.7`:

- Browser-Tab/Header-Build-ID konsistent: PASS;
- Bogen über drei Punkte: PASS;
- Tree-/Viewer-Auswahl: PASS;
- Inspector-Änderungen: PASS;
- Arc-Endpunkte mit anderen geeigneten Punkten über Mehrfachauswahl Verbinden/Trennen: PASS;
- Undo/Redo: PASS;
- Speichern/Laden: PASS;
- **0 BLOCKER**.

Das Verbinden von Start- und Endpunkt desselben einzelnen Arc wird erwartungsgemäß durch die eingefrorene C.6-Direct-Pair-/Self-Loop-Regel verhindert. Dies ist kein Fehler und kein Blocker, da ein einzelner Arc keine identische Start-/End-`pointId` erhalten darf. Ein analytisch geschlossener Kreis bleibt ein separates Circle-Element.

Explizit ausgeschlossen bleiben Spline, Arc-Gizmo/Arc-Drag, sichtbares Control-Handle, alternative Arc-Parametrisierung, Constraints/Tangentialität, Snap/Auto-Merge/Tolerance/geometrisches Rebinding, N-Gon/facettierter Arc, Profile/Pfade und Extrusionsintegration.

WD-21C.7 ist damit **PASS / FROZEN / 0 BLOCKER**. WD-21C als Gesamtblock bleibt **nicht FROZEN**.

## Verbindliche Build-Kennungsregel

Bei jedem WD-Teilschritt müssen autoritative Build-ID, `document.title`, sichtbare Build-/Brand-Kennung und WD-/Projektstatusdokumentation konsistent sein. Eine widersprüchliche sichtbare Kennung ist ein **BLOCKER** und verhindert PASS/FROZEN.

Korrekturläufe innerhalb desselben WD-Teilschritts dürfen eine sichtbare Revisionskennung `-R1`, `-R2`, … tragen. Diese Kennung muss ebenfalls in Browser-Tab und Header konsistent sichtbar sein und wird von den Build-Gates akzeptiert.

## Nächster zulässiger Schritt

Ausschließlich den nächsten kleinen WD-21C-Teilblock fachlich definieren. Noch keine Spline-Implementierung und keine weitere C.7-Erweiterung im selben Schritt.
