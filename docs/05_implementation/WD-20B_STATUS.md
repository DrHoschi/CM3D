# WD-20B – Unified SelectionRef Foundation

**Stand:** 2026-08-31  
**Status:** PASS / FROZEN  
**Basis:** `main` @ `d240bd151d285f7220c3dece3c4761c16a493d00` (WD-20A PASS / FROZEN)  
**Branch:** `feature/wd-20b-unified-selection-ref`

## Ziel

WD-20B vereinheitlicht die bisher getrennten Auswahlzustände schrittweise auf das V2-A1-SelectionRef-Modell, ohne die funktionierenden V1-Auswahlpfade zu beschädigen.

Verbindliche konzeptionelle Form:

`SelectionRef = { targetKind, ownerId, targetId, subTargetId? }`

## Ergebnis

Die gemeinsame SelectionRef-Semantik ist für den bestehenden V1/V2-Auswahlumfang eingeführt und im laufenden Web-Client schrittweise integriert.

Unterstützte TargetKinds:

- `OBJECT` – normales Szenenobjekt;
- `SKETCH` – vollständige Skizze;
- `SKETCH_ELEMENT` – Skizzenlinie;
- `SKETCH_POINT` – Skizzenpunkt.

Gemeinsame Leseschnittstellen:

- `store.selection.refs`;
- `store.selection.primaryRef`;
- `store.getSelectionRefs()`;
- `store.getPrimarySelectionRef()`.

Gemeinsame Schreibschnittstelle:

- `store.selectRef(...)`.

Die bestehenden Auswahlpfade wurden bewusst stufenweise migriert:

- B.5 – normale Objektselektion;
- B.7 – Sketch-Objektselektion;
- B.9 – Sketch-Linienselektion;
- B.10 – Sketch-Punktselektion.

Single- und Multi-Selection-Verhalten bleibt erhalten.

## Konsolidierungsentscheidung

Die zentrale Semantik/Factory bleibt in `src/application/selection-ref.js` definiert und regressionstestbar.

Die Browser-Runtime-Bridge bleibt für WD-20B bewusst direkt im bereits bewährten `src/main.js` integriert. Ein früher direkter zusätzlicher Modulimport führte auf GitHub Pages/iPad zu einem Browser-Startup-Abbruch. Der stabile Pfad wurde anschließend ohne neue Importkette wiederhergestellt und ab B.4 schrittweise erfolgreich erweitert.

Für WD-20B gilt daher ausdrücklich:

- keine erneute riskante Modul-Einhängung vor Freeze;
- keine weitere Selection-Funktionalität hinzufügen;
- keine Face-/Edge-/Vertex-/Feature-/Profile-/Path-Selektion vorziehen;
- weitere strukturelle Zentralisierung erst in einem dafür freigegebenen Folgeblock, wenn sie ohne Browser-Regression möglich ist.

## Zusätzliche Regressionkorrekturen innerhalb WD-20B

### Objektbaum-Reveal

Bei Auswahl einer Extrusion wird auch der virtuelle Baum-Pfad über `sourceSketchId` berücksichtigt. Liegt die Quellskizze in einer eingeklappten Gruppe/Baugruppe, wird der notwendige Containerpfad automatisch geöffnet, damit die ausgewählte Extrusion sichtbar bleibt.

### Sichtbarkeit und Viewer-Picking

Ausgeblendete Objekte – einschließlich Objekten unter einem ausgeblendeten Parent – werden beim Viewer-Picking ignoriert. Im Objektbaum bleiben sie weiterhin auswählbar. Sichtbarkeit und Lock bleiben getrennte Eigenschaften.

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

Aktueller B.10-Head vor Statusabschluss:

`59d74de661e456fea7c15bf231e9501048ea2410`

GitHub Actions:

- `WD-20B SelectionRef Regression` – PASS;
- Run `33434882820` – conclusion `success`.

## Gerätetest – iPad / Safari / GitHub Pages

Bestätigt:

- Browser-Startup / Viewer – PASS;
- normale Objektselektion – PASS;
- Objektbaum ↔ Viewer ↔ Inspector – PASS;
- Sketch-Auswahl – PASS;
- Linienauswahl – PASS;
- Punktauswahl – PASS;
- Sketch-Multiselection – PASS;
- Wechsel Punkt ↔ Linie ↔ Sketch ↔ Objekt – PASS;
- Extrusionsauswahl öffnet notwendigen Gruppenpfad – PASS;
- ausgeblendete Objekte blockieren Viewer-Picking nicht – PASS;
- ausgeblendete Objekte bleiben im Objektbaum erreichbar – PASS.

Letzter sichtbarer Geräte-Teststand: **WD-20B.10**.

## Abgrenzung

Nicht Bestandteil von WD-20B:

- Face-/Edge-/Vertex-Selection;
- allgemeines Reference-/Invalid-State-System;
- Dependency Graph / Recompute;
- Sketch-Snap-/Constraint-System;
- Collider-/Collision-System.

Diese Themen werden nicht in den WD-20B-Freeze hineingezogen.

## Abschluss

**Technical Regression: PASS**  
**Device Test: PASS**  
**SelectionRef Migration: PASS**  
**Open WD-20B Blockers: 0**  
**WD-20B: PASS / FROZEN**

Nächster planmäßiger Entwicklungsblock nach formalem Merge:

**WD-20C – Stable Reference + Invalid State Foundation**
