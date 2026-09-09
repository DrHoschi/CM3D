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

**DEFINED / NOT IMPLEMENTED**

Reconciliation-Basis: eingefrorener C.6-R1-Stand `a16a1f6b70a10fb10b469ff45e3795a95ddbbc45`.

Verbindliche C.7-Grenze:

- analytische Identität `arcId + startPointId + endPointId + control{x,y}`;
- Start/Ende sind echte topologische Punkte; Control ist ausschließlich geometrischer Parameter;
- sichtbare Erstellung deterministisch `Start → Ende → Control`;
- vor dem dritten gültigen Punkt ausschließlich Preview-State;
- finale Erstellung atomar in genau einer zentralen Sketch-Transaktion: zwei stabile Endpoint-Punkte + genau ein Arc, damit genau ein History-/Undo-Schritt entsteht;
- keine geometrische Übernahme bereits vorhandener Punkte beim Zeichnen; Verbindung ausschließlich explizit über C.6;
- ungültige/kollineare Drei-Punkt-Geometrie ohne persistente Teilreste ablehnen;
- Viewer-Tessellation ausschließlich abgeleitet und nicht persistent;
- Arc im Viewer und Objektbaum als genau ein `SKETCH_ELEMENT`;
- eigene Tree-Gruppe `Bögen (n)`;
- Inspector für Start X/Y, Ende X/Y und Control X/Y;
- Endpoint-Editing erhält bestehende `pointId`s; Control-Editing verändert ausschließlich `arc.control`;
- vorhandene C.6-Connectivity wird konsumiert, nicht erweitert;
- Delete, Undo/Redo und Save/Load verwenden vorhandene zentrale Grenzen.

Explizit nicht Bestandteil von C.7: Spline, Arc-Gizmo/Arc-Drag, sichtbares Control-Handle, alternative Radius-/Mittelpunkt-/Winkel-Parametrisierung, Tangentialität/Constraints, Snap/Auto-Merge/Tolerance/geometrisches Rebinding, N-Gon/facettierter Arc, Profile/Pfade, Extrusionsintegration oder C.6-Erweiterungen.

Bei späterer Implementierung ist die sichtbare Build-ID `WD-21C.7`; Tab, Header/Brand und Status müssen konsistent sein.

WD-21C.7 bleibt bis zu einer separaten Implementierungsfreigabe **NOT IMPLEMENTED**. WD-21C als Gesamtblock bleibt **nicht FROZEN**.

## Verbindliche Build-Kennungsregel

Bei jedem WD-Teilschritt müssen autoritative Build-ID, `document.title`, sichtbare Build-/Brand-Kennung und WD-/Projektstatusdokumentation konsistent sein. Eine widersprüchliche sichtbare Kennung ist ein **BLOCKER** und verhindert PASS/FROZEN.

Korrekturläufe innerhalb desselben WD-Teilschritts dürfen eine sichtbare Revisionskennung `-R1`, `-R2`, … tragen. Diese Kennung muss ebenfalls in Browser-Tab und Header konsistent sichtbar sein und wird von den Build-Gates akzeptiert.

## Nächster zulässiger Schritt

Ausschließlich das WD-21C.7 Definition/Implementation Gate gegen den eingefrorenen C.6-R1-Stand durchführen und daraus den exakt minimalen Implementierungsumfang ableiten. Noch keine C.7-Codeimplementierung und weiterhin keine Spline-Funktion.
