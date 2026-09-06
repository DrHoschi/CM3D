# WD-21A – Sketch Topology Contract & Element Foundation

**Branch:** `feature/wd-21a-sketch-topology-contract-element-foundation`  
**Basis:** `main` @ `1edae185c6207db9d754c94d00d23cf10218c56c`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-06

## WD-21A.1 – Existing Sketch Data/Topology Contract Inventory

**Status:** PASS / INVENTORY COMPLETE

Bestand vor Änderung:

- Sketchdaten bestehen aus `points` und `lines`.
- Punkte besitzen stabile `pointId`, Linien stabile `lineId`.
- Linien referenzieren Endpunkte über `startPointId` / `endPointId`.
- gleiche Koordinaten allein erzeugen keine topologische Verbindung.
- SelectionRef und StableReference kennen `SKETCH_ELEMENT` und `SKETCH_POINT`, behandeln `SKETCH_ELEMENT` intern jedoch faktisch als Linie.
- Sketch-Mutationen sind bereits in Snapshot-History und die WD-20E Domain-Transaction-Grenze eingebunden.

## WD-21A.2 – Unified Sketch Element & Topology Contract Foundation

**Status:** IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE RELEASE NOT YET GRANTED

Umgesetzt:

1. Neuer zentraler Contract-Layer `src/model/sketch-topology.js`.
2. `SketchElementKind` registriert den bestehenden Elementtyp `line`, ohne die persistente `points`/`lines`-Struktur zu brechen.
3. Generische Auflösung über `getSketchElement(...)`; Punktauflösung über `getSketchPoint(...)`.
4. Autoritative Topologie-Invariante: Zwei Endpunkte sind nur dann topologisch verbunden, wenn sie dieselbe `pointId` referenzieren. Geometrisch identische Koordinaten erzeugen keine Verbindung.
5. `validateProject(...)` delegiert Sketch-Invarianten an `validateSketchTopology(...)`.
6. SelectionRef und StableReference lösen `SKETCH_ELEMENT` über den gemeinsamen Elementvertrag auf. Alte Elementreferenzen ohne `subTargetId` bleiben für bestehende Linien kompatibel; neue typisierte Referenzen können `subTargetId: 'line'` tragen.
7. `src/main.js` verwendet denselben Resolver für die aktuelle UI-Selection-Bridge.
8. Sichtbare Kennung ist zentral in `src/main.js` als `BUILD_ID = 'WD-21A.2'` autoritativ gesetzt. `document.title` und `.brand small` werden aus diesem Wert gemeinsam gesetzt. Eine ältere Installer-lokale WD-12A-Zuweisung in `sketch-editing.js` wird nach Installation durch diese zentrale Kennung neutralisiert und ist nicht release-autoritativ.
9. Automatischer Regressionstest `tests/wd-21a2-sketch-topology-contract.mjs` einschließlich Kompatibilitäts- und Topologieprüfungen.
10. GitHub Actions Workflow `.github/workflows/wd-21a2-sketch-topology.yml`.

Automatische Evidenz:

- Workflow: `WD-21A.2 Sketch Topology Contract Regression`
- Run: `34058462552`
- Head: `1361acbe34f8a752447d39a9c38518eacc67df39`
- Ergebnis: **SUCCESS / PASS**

## Explizit nicht Bestandteil von WD-21A.2

- keine Connect-/Disconnect-Bedienung;
- kein Kreis;
- kein Bogen;
- keine Spline;
- keine Profile oder offenen Pfade;
- kein Profil-/Pfad-SelectionRef;
- keine neue Extrude-/3D-Funktion;
- kein Constraint-Solver;
- keine Schema-Erhöhung nur für diesen Contract-Layer.

## Freigaberegel

WD-21A.2 ist noch nicht FROZEN. Vor der Freigabe muss der Branch-Diff gegen den eingefrorenen `main` auf Scope-Verletzungen geprüft werden und die sichtbare Kennung im realen Browser konsistent `WD-21A.2` zeigen. Widersprüchliche sichtbare Build-Kennungen blockieren die Freigabe.

Ein Folgeblock wird nicht automatisch freigegeben.
