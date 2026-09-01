# WD-20D – Dependency Graph & Recompute Foundation

**Stand:** 2026-09-01  
**Status:** IN PROGRESS – D.1 DEPENDENCY GRAPH CORE  
**Basis:** `main` @ `e9d245a25d9237c59b2fd179d450fef5923dc8b3` (WD-20C PASS / FROZEN / MERGED)  
**Branch:** `feature/wd-20d-dependency-graph-recompute`

## Ziel

WD-20D führt auf Basis der in WD-20C eingefrorenen StableReference- und Resolution-State-Semantik einen zentralen Dependency Graph und anschließend einen kontrollierten Recompute-Pfad ein.

Die bestehende V1-Sketch→Extrude-Aktualisierung wird nicht in einem Schritt entfernt. Zuerst entsteht ein deterministischer Graph, danach wird der Recompute kontrolliert auf diesen Graphen umgestellt.

## D.1 – Dependency Graph Core

D.1 führt `src/application/dependency-graph.js` ein.

Aktueller Umfang:

- Graphknoten für vorhandene Szenenobjekte;
- erste gerichtete Kante `SKETCH_TO_EXTRUDE`;
- Quelle wird ausschließlich aus `data.sourceSketchRef` abgeleitet;
- keine Namens-, Reihenfolge- oder Näherungsheuristik;
- `MISSING` und `INVALID` werden aus dem WD-20C-Resolver übernommen;
- Extrusion ohne StableReference wird kontrolliert als `MISSING` geführt;
- deterministisch sortierte Projektionen über `dependentsOf()` und `dependenciesOf()`;
- zurückgegebene Referenzen sind Kopien und verändern den gespeicherten Graphen nicht.

## Bewusst noch nicht Bestandteil D.1

- kein Ersatz von `refreshDependentExtrudes()` in `sketch-editing.js`;
- keine neue Recompute-Orchestrierung;
- keine rekursive Mehrstufen-Abhängigkeitskette;
- kein Cycle Detection;
- keine neuen Undo-Schritte;
- keine neue Invalid-State-UI;
- keine Änderung der bestehenden funktionierenden Sketch-/Extrude-Bedienung.

## Regression

Test: `tests/wd-20d-dependency-graph.mjs`

Geprüft werden:

- deterministische Sketch→Extrude-Kanten;
- mehrere Dependents einer Quelle;
- Rückwärtsprojektion der Dependencies;
- READY für gültig auflösbare Abhängigkeit;
- MISSING bei gelöschtem Ziel;
- INVALID bei falschem Zieltyp;
- MISSING bei fehlender StableReference;
- keine Mutation der gespeicherten StableReference durch Projektionen.

Workflow: `.github/workflows/wd-20d-dependency-graph.yml`

## Nächster Schritt nach D.1 PASS

**WD-20D.2 – Graph-backed Extrude Recompute Bridge**

D.2 soll die bestehende Sketch→Extrude-Aktualisierung kontrolliert über den Dependency Graph auflösen. `sourceSketchId` bleibt zunächst Kompatibilitätsfeld; die fachliche Abhängigkeitsentscheidung kommt aus `sourceSketchRef`/Graph. Recompute darf keinen eigenständigen Undo-Schritt erzeugen.

**WD-20D ist noch nicht PASS/FROZEN und darf noch nicht nach `main` gemergt werden.**
