# WD-20C – Stable Reference + Invalid State Foundation

**Stand:** 2026-08-31  
**Status:** IN PROGRESS – C.1 FOUNDATION  
**Basis:** `main` @ `83fbbb9341a73b5d45e61a9360b2ab705ce1f8d3` (WD-20B PASS / FROZEN)  
**Branch:** `feature/wd-20c-stable-reference-invalid-state`

## Ziel

WD-20C führt ein gemeinsames stabiles Referenz- und Auflösungsmodell ein. Referenzen bleiben an ihre gespeicherten IDs gebunden. Fehlende oder ungültige Ziele dürfen nicht stillschweigend durch andere Objekte ersetzt werden.

## C.1 – Stable Reference + Resolution State Foundation

Verbindliche Referenzform:

`StableReference = { targetKind, ownerId, targetId, subTargetId? }`

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

## Implementierung C.1

- `src/application/stable-reference.js`
- Factory und Equality für StableReference
- Resolution-Datensatz mit Status + Diagnostics
- Resolver für Objekt, Sketch, Feature, Sketch-Linie und Sketch-Punkt
- explizite `MISSING`-/`INVALID`-Diagnosen
- `BLOCKED`-Hilfsfunktion
- noch keine Browser-Runtime-Integration
- noch keine Änderung an bestehender Extrusionsgeometrie
- noch keine automatische Migration von `sourceSketchId`

## Regression

Test: `tests/wd-20c-stable-reference.mjs`

Geprüft werden:

- gültige Referenzerzeugung;
- Equality;
- RESOLVED für vorhandene Ziele;
- MISSING für gelöschte/nicht vorhandene IDs bei Erhalt der ursprünglichen targetId;
- INVALID bei Typkonflikt;
- MISSING für Sketch-Subtargets;
- UNRESOLVED als neutraler Startzustand;
- BLOCKED mit Diagnose.

Workflow: `.github/workflows/wd-20c-stable-reference.yml`

## Bewusst noch nicht Bestandteil C.1

- Umbau von Extrude `sourceSketchId` auf StableReference;
- allgemeiner Dependency Graph;
- Recompute-Orchestrierung;
- neue Invalid-State-UI;
- automatische Reparatur oder Rebinding;
- Face-/Edge-/Profile-/Path-Referenzen.

## Nächster Schritt nach C.1 PASS

**WD-20C.2 – Extrude Source Stable Reference Bridge**

Dabei wird die vorhandene Extrusionsabhängigkeit kontrolliert auf StableReference abgebildet, während `sourceSketchId` zunächst als V1/V2-Kompatibilitätsfeld erhalten bleibt. Die vorhandene funktionierende Extrusionsaktualisierung darf dadurch nicht verändert werden.

**WD-20C ist noch nicht PASS/FROZEN und darf noch nicht nach `main` gemergt werden.**
