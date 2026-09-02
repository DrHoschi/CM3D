# WD-20D – Dependency Graph & Recompute Foundation

**Stand:** 2026-09-02  
**Status:** PASS / FROZEN  
**Basis:** `main` @ `e9d245a25d9237c59b2fd179d450fef5923dc8b3` (WD-20C PASS / FROZEN / MERGED)  
**Branch:** `feature/wd-20d-dependency-graph-recompute`

## Ziel

WD-20D führt auf Basis der in WD-20C eingefrorenen StableReference- und Resolution-State-Semantik einen zentralen Dependency Graph und einen kontrollierten, deterministischen Recompute-Pfad für die bestehende Sketch→Extrude-Abhängigkeit ein.

Die fachliche Abhängigkeitsentscheidung erfolgt über `sourceSketchRef` und den Dependency Graph. `sourceSketchId` bleibt ausschließlich als Kompatibilitätsfeld erhalten. Fehlende oder ungültige Referenzen werden nicht ersetzt oder neu gebunden.

## D.1 – Dependency Graph Core – PASS

Umgesetzt in `src/application/dependency-graph.js`:

- Graphknoten für vorhandene Szenenobjekte;
- gerichtete Kante `SKETCH_TO_EXTRUDE`;
- Quelle ausschließlich aus `data.sourceSketchRef`;
- keine Namens-, Reihenfolge-, Index- oder Näherungsheuristik;
- deterministisch sortierte `dependentsOf()`-/`dependenciesOf()`-Projektionen;
- StableReference-Projektionen werden kopiert und können den gespeicherten Graphzustand nicht verändern;
- gültige Abhängigkeit = READY;
- fehlende/ungültige Quellreferenz bleibt als eigentliche Referenzursache erhalten.

Technische Regression: PASS.  
Geräte-Regression: PASS im weiteren WD-20D-Gerätetest bestätigt.

## D.2 – Graph-backed Extrude Recompute Bridge – PASS

Die bestehende Sketch→Extrude-Aktualisierung wurde kontrolliert auf den Dependency Graph umgestellt:

- Recompute findet abhängige Extrusionen über `dependentsOf(sketchId)` bzw. `visitDependents()`;
- `sourceSketchId` entscheidet nicht mehr über die fachliche Recompute-Abhängigkeit;
- StableReference/Graph ist maßgeblich;
- gültige Sketch-Änderungen aktualisieren weiterhin die abhängige Extrusionsgeometrie;
- ungültige Sketch-Profile entfernen weiterhin die abhängige Geometrie;
- Recompute erzeugt keinen eigenen Undo-Schritt;
- Sketch-Mutation und abhängiger Recompute bleiben Bestandteil derselben History-Aktion.

Technische Regression: PASS.  
**iPad/Safari Geräte-PASS:** Laden, Sketch/Extrude bearbeiten, Undo, Redo, Speichern und Neu-Laden erfolgreich bestätigt.

## D.3 – Deterministic Invalid/Blocked Propagation – PASS

Die Fehlerfortpflanzung wurde gehärtet:

- StableReference behält bei fehlendem Ziel den Zustand `MISSING` und die ursprüngliche ID;
- StableReference behält bei fachlich falschem Ziel den Zustand `INVALID` und die ursprüngliche ID;
- die davon abhängige Extrusionsberechnung wird deterministisch `BLOCKED`;
- `recomputeState.upstreamState` bewahrt die eigentliche Ursache (`MISSING` bzw. `INVALID`);
- gecachte Extrusionsgeometrie wird bei blockiertem Upstream auf `null` gesetzt;
- eine fehlerhafte Abhängigkeit wird nicht als gültige Graphkante für normalen Recompute traversiert;
- kein stilles Rebinding, keine Ersatzsuche.

Technische Regression: PASS.  
**iPad/Safari Geräte-PASS:** Build `WD-20D.3` sichtbar; Laden, Bearbeiten, Speichern, Undo und Redo erfolgreich bestätigt.

## Regression / Freeze Gate

Workflow: `.github/workflows/wd-20d-dependency-graph.yml`

Finales Gate prüft gemeinsam:

- WD-20C StableReference-Regression;
- WD-20D Dependency-Graph-Regression;
- StableReference-ID-Erhalt;
- Graph-basierte Recompute-Traversierung;
- deterministische MISSING/INVALID → BLOCKED-Fortpflanzung;
- Entfernen stale gecachter Extrusionsgeometrie;
- keine Nutzung von `sourceSketchId` als fachliche Recompute-Entscheidung;
- keine zusätzlichen Undo-Schritte.

## Bewusst nicht Bestandteil WD-20D

- keine allgemeinen Face-/Edge-/Profile-/Path-Abhängigkeiten;
- keine neue Modellierungsfunktion;
- keine UI-Neugestaltung für Invalid States;
- keine heuristische Referenzreparatur;
- kein Silent Rebinding;
- keine über den aktuellen Sketch→Extrude-Foundation-Scope hinausgehende allgemeine Feature-Engine.

## Abschluss

**D.1 Dependency Graph Core:** PASS  
**D.2 Graph-backed Extrude Recompute Bridge:** TECH PASS / DEVICE PASS  
**D.3 Deterministic Invalid/Blocked Propagation:** TECH PASS / DEVICE PASS  
**Open Blockers:** 0  
**WD-20D:** PASS / FROZEN

Nächster zulässiger Block nach erfolgreichem finalen CI-Lauf und Merge nach `main`:

**WD-20E – Foundation Integration / RB-01 Gate**
