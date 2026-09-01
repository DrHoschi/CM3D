# WD-20C – Stable Reference + Invalid State Foundation

**Stand:** 2026-09-01  
**Status:** PASS / FROZEN  
**Basis:** `main` @ `83fbbb9341a73b5d45e61a9360b2ab705ce1f8d3` (WD-20B PASS / FROZEN)  
**Branch:** `feature/wd-20c-stable-reference-invalid-state`

## Ziel

WD-20C führt ein gemeinsames stabiles Referenz- und Auflösungsmodell ein. Referenzen bleiben an ihre gespeicherten IDs gebunden. Fehlende oder ungültige Ziele dürfen nicht stillschweigend durch andere Objekte ersetzt werden.

## Verbindliche Referenz- und Zustandsbasis

Erste TargetKinds:

- `OBJECT`
- `SKETCH`
- `SKETCH_ELEMENT`
- `SKETCH_POINT`
- `FEATURE`

Verbindliche Auflösungszustände:

- `RESOLVED` – Ziel ist vorhanden und typgerecht auflösbar.
- `UNRESOLVED` – noch nicht aufgelöst / noch nicht bewertet.
- `MISSING` – gespeicherte Ziel-ID existiert nicht mehr.
- `INVALID` – Ziel existiert, erfüllt aber die erwartete Referenzsemantik nicht.
- `BLOCKED` – Referenz kann wegen einer vorgelagerten ungültigen/blockierten Abhängigkeit nicht verwendet werden.

## No-Silent-Rebinding-Regel

Eine StableReference behält ihre `ownerId`/`targetId` auch dann, wenn das Ziel fehlt. Es wird kein Objekt mit ähnlichem Namen, Typ, Index oder räumlicher Nähe als Ersatz gewählt. Ein fehlendes Ziel wird kontrolliert `MISSING`.

## C.1 – Stable Reference + Resolution State Foundation

Umgesetzt:

- `src/application/stable-reference.js`;
- Factory und Equality für StableReference;
- Resolution-Datensatz mit Status + Diagnostics;
- Resolver für Objekt, Sketch, Feature, Sketch-Linie und Sketch-Punkt;
- explizite `MISSING`-/`INVALID`-Diagnosen;
- `BLOCKED`-Hilfsfunktion;
- keine automatische Reparatur oder Rebinding-Logik.

Ergebnis: **PASS**.

## C.2 – Extrude Source Stable Reference Bridge

Umgesetzt:

- Extrusionen erhalten zusätzlich zu `data.sourceSketchId` eine persistente `data.sourceSketchRef`;
- `sourceSketchId` bleibt als Kompatibilitätsfeld erhalten;
- aktueller Resolution-State wird unter `extensions.sourceSketchReference` geführt;
- neue Extrusionen werden beim Erzeugen direkt synchronisiert;
- fehlende Ziel-IDs bleiben unverändert erhalten und werden `MISSING`.

Technischer Regressionstest: **PASS**.  
iPad/Safari/GitHub-Pages-Test: **PASS**.

## C.3 – Legacy/Loaded Extrude Reference Synchronization

Umgesetzt:

- bestehende bzw. geladene Extrusionen mit `sourceSketchId` werden auf die StableReference-Brücke synchronisiert;
- Synchronisierung läuft beim aktuellen Projekt sowie bei `projectLoaded` und `projectChanged`;
- vorhandene IDs werden unverändert übernommen;
- fehlende Ziele werden `MISSING`;
- kein stilles Rebinding.

Gerätetest umfasste unter anderem:

- altes größeres Projekt mit Skizzen laden;
- neues Projekt mit Skizze erstellen;
- speichern/exportieren und erneut laden.

Technischer Regressionstest: **PASS**.  
iPad/Safari/GitHub-Pages-Test: **PASS**.

## C.4 – Missing/Invalid Reference Runtime Behavior

Umgesetzt:

- fehlende Quellskizze → Referenz bleibt auf ursprünglicher ID, Zustand `MISSING`;
- vorhandenes Ziel falschen Typs → Zustand `INVALID`;
- kein Ersatzobjekt und kein Rebinding;
- bei `MISSING` oder `INVALID` wird die abhängige zwischengespeicherte Extrusionsgeometrie nicht als gültige Geometrie weitergeführt;
- normaler Extrusions-/Projektpfad bleibt unverändert nutzbar.

Der gezielte MISSING-/INVALID-Fehlerfall ist automatisiert abgedeckt; der iPad-Test bestätigt zusätzlich die normale Projekt-/Sketch-/Extrude-Regression.

Technischer Regressionstest: **PASS**.  
iPad/Safari/GitHub-Pages-Test: **PASS**.

## Regression / Abschlussgate

Test: `tests/wd-20c-stable-reference.mjs`  
Workflow: `.github/workflows/wd-20c-stable-reference.yml`

Abgedeckt werden insbesondere:

- StableReference-Erzeugung und Equality;
- `RESOLVED`, `UNRESOLVED`, `MISSING`, `INVALID`, `BLOCKED`;
- Erhalt der ursprünglichen IDs bei fehlenden Zielen;
- Extrude-Bridge mit bestehendem `sourceSketchId`;
- automatische Synchronisierung geladener Legacy-Extrusionen;
- kein Silent Rebinding;
- ungültige abhängige Extrusionsgeometrie bei `MISSING`/`INVALID`.

## Scope-Grenze

Bewusst **nicht** Bestandteil WD-20C:

- allgemeiner Dependency Graph;
- Recompute-Orchestrierung;
- neue Invalid-State-UI;
- Face-/Edge-/Profile-/Path-Referenzen;
- Umbau der in WD-20B eingefrorenen SelectionRef-Runtime-Struktur.

Diese Themen gehören in spätere V2-Blöcke, insbesondere WD-20D.

## Abschluss

- C.1: **PASS**
- C.2: **TECH PASS / DEVICE PASS**
- C.3: **TECH PASS / DEVICE PASS**
- C.4: **TECH PASS / DEVICE PASS**
- offene WD-20C-Unterpunkte: **0**
- offene Blocker: **0**
- No-Silent-Rebinding: **BESTÄTIGT**
- Gesamtstatus: **PASS / FROZEN**

Nächster zulässiger Entwicklungsblock nach Merge nach `main`:

**WD-20D – Dependency Graph & Recompute Foundation**
