# WD-21C – Sketch Element Type Expansion

**Branch:** `feature/wd-21c-sketch-element-type-expansion`  
**Basis:** WD-21B FROZEN @ `2e8d5b0434e62bf7c7e34b11e54da077853328cc`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-08

## WD-21C.1 – Existing Sketch Element Type & Creation/Editing Inventory

**Status:** PASS / INVENTORY & CONTRACT COMPLETE / 0 ELEMENT IMPLEMENTATION

## WD-21C.2 – Generic Sketch Element Registry & Persistence Foundation

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

Registry, Persistenz und Validation für `line`, `circle`, `arc`, `spline` sind vorhanden. Reale iPad-/Safari-Evidenz bestätigte `WD-21C.2`, Bestands-Sketching, Connect/Disconnect, Save/Load und Undo/Redo.

## WD-21C.3 – Generic Sketch Element Mutation Contract + Analytic Geometry ↔ Derived Tessellation Boundary

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

Zentrale, atomare und history-sichere Create/Edit/Delete-Grundlage für Circle, Arc und Spline über `runSketchMutation(...)`. Analytische Sketch-Identität bleibt von späterer Tessellierung getrennt. Reale iPad-/Safari-Evidenz bestätigte Build-ID und Bestandsregression.

## WD-21C.4 – Circle Creation, Rendering & Editing Integration

**Status:** PASS / FROZEN / 0 BLOCKER

Finaler sichtbarer Korrekturstand: `WD-21C.4-R1`.

Umgesetzt:

- sichtbarer Sketch-Kreis-Toolbutton `Kreis` im Sketch-Kontext;
- zweistufiger Circle-Input: Mittelpunkt setzen, Radius durch zweiten Punkt bestimmen;
- Create läuft ausschließlich über `addSketchCircle(...)` aus dem C.3-Mutationsvertrag;
- Circle bleibt persistent ausschließlich `{ circleId, center, radius }`;
- Mittelpunkt bleibt geometrischer Parameter und wird nicht als `pointId` materialisiert;
- Viewer rendert den analytischen Circle über ausschließlich abgeleitete temporäre Renderpunkte;
- interne Render-Tessellierung ist nicht persistent und nicht Teil von StableReference/SelectionRef;
- Circle ist im Viewer als ein `SKETCH_ELEMENT` mit `subTargetId=circle` pick-/selektierbar;
- Objektbaum zeigt eine eigene Sektion `Kreise (N)` und einzelne `Kreis N`-Elemente;
- Inspector zeigt und editiert Mittelpunkt X/Y und Radius über `setSketchCircle(...)`;
- Delete nutzt den bestehenden generischen C.3-Delete-Pfad;
- Undo/Redo und Save/Load bewahren dieselbe `circleId` und analytische Geometrie;
- Build-ID, Browser-Tab und sichtbares Header-/Brand-Label verwenden denselben Korrekturstand `WD-21C.4-R1`.

Analytic Geometry ↔ Derived Tessellation Boundary bleibt eingehalten:

- die 64 Rendersegmente sind reine Laufzeitdarstellung;
- keine Segmentpunkte und keine Rendersegmentzahl werden in `circles` persistiert;
- keine Linien werden aus dem Circle in die Sketch-Topologie geschrieben;
- keine Circle-ID wird durch Rendering, Picking oder Inspector-Edit ersetzt.

Automatische Completion-/Regression-Evidenz:

- Workflow: `WD-21C.4 Circle Integration Regression`
- Run: `34273576840`
- Head: `a2ad3035a877170983a51f5d70294ff566a0c511`
- WD-21A.2: PASS
- WD-21A.3: PASS
- WD-21B.2 Connect: PASS
- WD-21B.3 Disconnect: PASS
- WD-21C.2 Registry/Persistence: PASS
- WD-21C.3 Generic Mutation: PASS
- WD-21C.4 Circle Integration: PASS
- Result: **SUCCESS / PASS**

Die sichtbare Revisionskennung `-R1` ist ab jetzt ein zulässiger Korrektur-Suffix innerhalb desselben WD-Schritts. Die Build-Gates akzeptieren deshalb `WD-21x.y-Rn`, ohne den fachlichen WD-Schritt hochzuzählen.

Reale Geräte-Evidenz 2026-09-08, iPad/Safari, `WD-21C.4-R1`:

- Browser-Tab zeigt `CyberMotion 3D – WD-21C.4-R1`: PASS;
- sichtbares Header-/Brand-Label zeigt `WD-21C.4-R1`: PASS;
- Circle-Erzeugung und sichtbare Darstellung: PASS;
- Auswahl `Kreis 1` im Objektbaum: PASS;
- Auswahl des Circle direkt im Viewer: PASS;
- Circle-Inspector erscheint: PASS;
- Mittelpunkt X/Y editierbar: PASS;
- Radius editierbar: PASS;
- gemeldete C.4-Blocker nach R1: 0.

## WD-21C.5 – Generic Sketch Element Manipulation Contract

**Status:** DEFINED / NOT IMPLEMENTED

Ziel: direkte Sketch-Manipulation verbindlich auf `Selection → Elementparameter → zentrale Mutation → History/Recompute → Viewer-Refresh` normieren und die Grenze zwischen Owner-Skizze und ausgewähltem Element eindeutig festlegen.

Reconciliation gegen den eingefrorenen C.4-Stand:

- die bestehende Sketch-Gizmo-Implementierung ist aktuell auf Point/Line ausgerichtet und leitet ihre Manipulationsanker aus realen `pointId`s ab;
- der Circle besitzt deshalb trotz funktionierender Auswahl und Inspector-Bearbeitung noch keinen direkten Gizmo-/Drag-Anker;
- C.3 stellt mit `setSketchCircle(...) → runSketchMutation(...)` bereits die autoritative atomare Mutationsgrenze für Circle-Parameter bereit;
- C.4 bestätigt, dass Circle-Rendersegmente ausschließlich abgeleitete Viewer-Geometrie sind und niemals Manipulations- oder Modellautorität erhalten dürfen;
- die Owner-Skizze ist Koordinatenraum/Container eines ausgewählten Sketch-Elements, nicht automatisch eine zweite fachliche Primärauswahl.

Verbindlicher C.5-Contract:

- **Selection Authority:** Primäre fachliche Auswahl ist der konkrete Sketch-Point bzw. das konkrete `SKETCH_ELEMENT`. Die Owner-Skizze bleibt Owner und lokaler Koordinatenraum.
- **Manipulation Adapter:** Jeder manipulierbare Sketch-Typ bildet direkte Manipulation deterministisch auf seine autoritativen Modellparameter ab. Point → `x/y`; Line → autoritative Endpunkte; Circle → `center.x/center.y`. Spätere Arc-/Spline-Adapter müssen dieselbe Grenze verwenden.
- **Mutation Authority:** Der endgültige Commit einer Manipulation muss über die jeweilige zentrale Sketch-Mutation laufen. Temporäre Preview darf keine zweite dauerhafte Modellautorität bilden.
- **Identity Preservation:** Move verändert keine stabilen Element-/Point-IDs. Beim reinen Circle-Move bleibt `radius` unverändert.
- **Derived Geometry Boundary:** Rendersegmente, Viewer-Punkte und Raycast-Geometrie bleiben ausschließlich Anzeige/Picking und dürfen nicht als persistierte Sketch-Geometrie oder neue Parameterquelle verwendet werden.
- **Transaction Semantics:** Pointer-down erfasst den autoritativen Ausgangszustand; Pointer-move darf deterministische Preview erzeugen; Pointer-up führt genau einen zentralen Commit und damit genau einen Undo-Schritt aus. Cancel stellt den Ausgangszustand vollständig wieder her.
- **Snap / Coordinate Space:** Manipulation erfolgt im lokalen Koordinatenraum der Owner-Skizze. Bestehendes Translate-Snap darf angewendet werden, erzeugt aber keine topologische Verbindung, Verschmelzung oder geometrische Rebinding-Semantik.
- **History / Recompute / Refresh:** Erfolgreicher Commit führt zu Validation, History, abhängigem Recompute, Viewer-Refresh und Erhalt derselben Elementauswahl. No-op/Cancel erzeugt keinen History-Eintrag.
- **Multi-Selection:** C.5 definiert die generische Grenze, erweitert aber nicht automatisch gemischte Multi-Selection. Bestehende Point-/Line-Multiselection bleibt kompatibel; Circle + andere Elementtypen benötigt separate Freigabe.
- **Build Authority:** `document.title` und sichtbares Brand-/Build-Label dürfen nur aus der zentralen Build-Identity-Autorität gesetzt werden. Historische lokale Build-Zuweisungen in Sketch-/Gizmo-Modulen sind bei einer späteren C.5-Implementierung zu entfernen und dürfen keine konkurrierende sichtbare Autorität bleiben.

Explizit nicht Bestandteil der C.5-Definition:

- keine Circle-Gizmo-/Drag-Implementierung in diesem Definitionsschritt;
- kein Circle-Radius-Gizmo;
- kein Rotate/Scale für Sketch-Elemente;
- keine sichtbare Arc-/Spline-Erstellung oder -Manipulation;
- keine neuen Constraints oder automatische Connect-/Merge-/Tolerance-Semantik;
- kein N-Gon / Regular Polygon;
- keine Profile/Pfade;
- keine Extrusionsintegration.

## Freigabestatus

WD-21C.1, C.2, C.3 und C.4 sind abgeschlossen. WD-21C.4 ist **PASS / FROZEN / 0 BLOCKER**. WD-21C.5 ist **DEFINED / NOT IMPLEMENTED**. WD-21C als Gesamtblock bleibt **nicht FROZEN**.

## Nächster zulässiger Schritt

Ausschließlich das **WD-21C.5 Definition/Implementation Gate** gegen den eingefrorenen C.4-Stand durchführen: aus dem dokumentierten Contract den exakten minimalen Implementierungsumfang und die betroffenen autoritativen Grenzen ableiten. Noch keine Code-Implementierung im selben Schritt und weiterhin keine Arc-/Spline-Funktion.
