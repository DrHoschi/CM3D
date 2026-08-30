# WD-20B – Unified SelectionRef Foundation

**Stand:** 2026-08-30  
**Status:** IN PROGRESS – B.1 FOUNDATION  
**Basis:** `main` @ `d240bd151d285f7220c3dece3c4761c16a493d00` (WD-20A PASS / FROZEN)  
**Branch:** `feature/wd-20b-unified-selection-ref`

## Ziel

WD-20B vereinheitlicht die bisher getrennten Auswahlzustände schrittweise auf das V2-A1-SelectionRef-Modell, ohne die funktionierenden V1-Auswahlpfade zu beschädigen.

Verbindliche konzeptionelle Form:

`SelectionRef = { targetKind, ownerId, targetId, subTargetId? }`

## B.1 – Compatibility Foundation

Erster bewusst kleiner Schritt:

- zentrale `SelectionTargetKind`-Definition eingeführt;
- `SelectionRef`-Factory und Equality-Helfer eingeführt;
- bestehende Objekt-/Sketch-/Sketch-Element-Auswahl wird in `store.selection.refs` gespiegelt;
- `store.selection.primaryRef` bildet die primäre Auswahl ab;
- `store.getSelectionRefs()` und `store.getPrimarySelectionRef()` stellen die neue gemeinsame Leseschnittstelle bereit;
- Objekt, Sketch, Sketch-Linie und Sketch-Punkt werden semantisch unterschieden;
- bestehende V1-Selektionsfunktionen bleiben in B.1 unverändert die operative Quelle;
- keine Face-/Edge-/Vertex-/Feature-/Profile-/Path-Selektion wird in B.1 erfunden.

## Warum B.1 als Brücke

Der reale V1-Code besitzt eine zentrale Objektselektion im `AppStore`, während `sketch-editing.js` und `sketch-multiselect.js` die Selection-Funktionen später zur Laufzeit erweitern. Ein direkter Big-Bang-Umbau würde gleichzeitig Objektbaum, Viewer, Inspector, Gizmo und Sketch-Multiselection berühren.

B.1 schafft deshalb zuerst eine zentrale, typisierte SelectionRef-Projektion über den bestehenden stabilen Zustand. Nach technischem und Gerätecheck können nachfolgende B.x-Schritte die Verbraucher kontrolliert auf diese Schnittstelle umstellen.

## Regression

Test: `tests/wd-20b-selection-ref.mjs`

Geprüft:

- gültige SelectionRef-Erzeugung;
- unbekannte TargetKinds werden abgewiesen;
- Equality-Semantik;
- Objekt → `OBJECT`;
- Sketch → `SKETCH`;
- Sketch-Linie → `SKETCH_ELEMENT`;
- Sketch-Punkt → `SKETCH_POINT`;
- Multi-Selection-Reihenfolge bleibt erhalten.

Workflow: `.github/workflows/wd-20b-selection-ref.yml`

## Sichtbarer Teststand

Build-Kennung: **WD-20B.1**

Die Kennung ist nur ein visueller Teststand innerhalb desselben WD-20B-Branches. Sie erzeugt keinen neuen Branch und keinen eigenen WD.

## Noch offen in WD-20B

- zentrale Schreiboperationen für SelectionRefs;
- kontrollierte Ablösung der Runtime-Overrides aus den Sketch-UI-Modulen;
- Migration der relevanten Viewer-/Tree-/Inspector-Verbraucher;
- vollständige Single-/Multi-Selection-Invarianten;
- Regression der bestehenden Objekt-/Sketch-Gerätefälle;
- finaler WD-20B Device PASS / Freeze.

**WD-20B ist noch nicht PASS/FROZEN und darf noch nicht nach `main` gemergt werden.**
