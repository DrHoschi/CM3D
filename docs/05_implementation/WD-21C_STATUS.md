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

Circle-Erzeugung, Rendering, Viewer-/Baumauswahl sowie Inspector-Edit von Mittelpunkt und Radius sind freigegeben. Die analytische Identität bleibt `{ circleId, center, radius }`; Render-Tessellierung bleibt ausschließlich abgeleitet. Completion-Regression: Workflow `WD-21C.4 Circle Integration Regression`, Run `34273576840`, Head `a2ad3035a877170983a51f5d70294ff566a0c511`, SUCCESS. Reale iPad-/Safari-Evidenz: PASS / 0 BLOCKER.

## WD-21C.5 – Generic Sketch Element Manipulation Contract

**Status:** PASS / FROZEN / 0 BLOCKER

Verbindlicher Contract: `Selection → Elementparameter → zentrale Mutation → History/Recompute → Viewer-Refresh`.

Implementierter Minimalumfang:

- `src/ui/sketch-gizmo.js` besitzt einen typbezogenen Manipulationsadapter für `point`, `line` und `circle`;
- bestehende Point-/Line-Gizmo-Semantik bleibt erhalten;
- Circle erhält einen direkten Gizmo-Anker ausschließlich aus `circle.center`;
- reiner Circle-Move verändert ausschließlich `center.x/y`; `circleId` und `radius` bleiben unverändert;
- gemischte Circle+andere-Element-Multiselection bleibt ausdrücklich nicht enthalten;
- Pointer-Move erzeugt nur temporäre Preview auf den autoritativen Parametern;
- vor dem finalen Commit wird die Preview auf den Ausgangszustand zurückgesetzt;
- Pointer-up führt genau einen Commit über `runSketchMutation(...)` aus und erzeugt damit genau einen History-Schritt;
- Pointer-Cancel stellt den Ausgangszustand wieder her und erzeugt keinen Commit;
- Translate-Snap bleibt im lokalen Koordinatenraum der Owner-Skizze aktiv;
- keine neue Connect-/Merge-/Tolerance-/Rebinding-Semantik;
- die historische lokale Build-Zuweisung `WD-12B` aus `sketch-gizmo.js` wurde entfernt;
- `src/main.js` ist die einzige sichtbare Build-Autorität und verwendet `WD-21C.5`.

Explizit nicht implementiert:

- kein Circle-Radius-Gizmo;
- kein Rotate/Scale für Sketch-Elemente;
- keine gemischte Circle+Line-/Point-Multiselection;
- keine sichtbare Arc-/Spline-Funktion;
- kein N-Gon;
- keine Profile/Pfade;
- keine Extrusionsintegration.

Completion-/Regression-Gate gegen eingefrorenen C.4-Stand `cca28626ae1bff0f888416935963fb933ee367f9`:

- geprüfter Branch-Stand vor Freeze-Dokumentation: `e18970efe0a0b6c0d6e94af719c2aba07c15cbcf`;
- Branch ist exakt 10 Commits vor C.4 und 0 Commits dahinter;
- C.5-Diff umfasst ausschließlich C.5-Workflow/Test, Statusdokumentation, zentrale Build-ID, `sketch-gizmo.js` sowie die notwendige C.4-Build-ID-Testkompatibilität;
- keine Arc-/Spline-, Profil-/Pfad-, Extrusions- oder N-Gon-Datei wurde durch den C.5-Diff eingeführt;
- Build-Identity ist auf realem iPad/Safari konsistent `WD-21C.5` in Browser-Tab und sichtbarem Header bestätigt.

Automatische Regression:

- Workflow: `WD-21C.5 Generic Sketch Manipulation Regression`
- Run: `34277682889`
- getesteter Code-Head: `929143091ff6698fb0248a8f9eb02da367ee2326`
- WD-21A.2: PASS
- WD-21A.3: PASS
- WD-21B.2 Connect: PASS
- WD-21B.3 Disconnect: PASS
- WD-21C.2 Registry/Persistence: PASS
- WD-21C.3 Generic Mutation: PASS
- WD-21C.4 Circle Integration: PASS
- WD-21C.5 Manipulation Contract: PASS
- Result: **SUCCESS / PASS**

Reale Geräte-Evidenz 2026-09-08, iPad/Safari, `WD-21C.5`:

- Browser-Tab und sichtbares Header-/Brand-Label zeigen konsistent `WD-21C.5`: PASS;
- Circle-Auswahl und direkter Gizmo-Move: PASS;
- bestehende ältere Sketch-Elemente / Point-/Line-Manipulation: PASS;
- Save: PASS;
- Undo/Redo: PASS;
- vom Nutzer gemeldetes Ergebnis: „Perfekt.“;
- gemeldete C.5-Blocker: 0.

## WD-21C.6 – Generic Endpoint Element Connectivity Contract

**Status:** DEFINED / NOT IMPLEMENTED

Ziel: die vorhandene B.2/B.3-Connectivity fachlich von line-spezifischer Logik auf alle registrierten endpoint-basierten Sketch-Elemente zu generalisieren, ohne sichtbare Arc-/Spline-Funktion einzuführen.

Reconciliation gegen den eingefrorenen C.5-Stand `37db2ee9815435e9ff92023d9fbd6132f0664239`:

- die Sketch-Element-Registry markiert `line`, `arc` und `spline` bereits als `topologyEndpoints: true`; `circle` ist korrekt `false`;
- `getSketchElementPointIds(...)` liefert für Line/Arc/Spline einheitlich `startPointId` und `endPointId`;
- die Topologie-Autorität bleibt ausschließlich `pointId`; geometrische Gleichheit erzeugt keine Verbindung;
- die bestehende B.4-Command-Schicht zählt Inzidenz derzeit nur in `sketch.data.lines`, prüft Direct-Pairs nur gegen Lines und akzeptiert Disconnect nur als `point + line`;
- die zentralen B.2/B.3-Mutationen rewired/trennen aktuell ebenfalls ausschließlich Lines.

Verbindlicher C.6-Contract:

- **Endpoint Eligibility:** Connectivity-fähig sind ausschließlich registrierte Sketch-Elemente mit `topologyEndpoints: true`. Damit sind aktuell `line`, `arc` und `spline` zulässig; `circle` bleibt ausgeschlossen.
- **Topology Authority:** Zwei Endpunkte sind nur verbunden, wenn sie dieselbe `pointId` referenzieren. Gleiche Koordinaten erzeugen keine Verbindung.
- **Generic Incidence:** Punktinzidenz wird über alle registrierten endpoint-basierten Elemente bestimmt, nicht nur über Lines.
- **Connect Semantics:** Auswahl bleibt exakt zwei Punkte derselben Skizze. Der erste ausgewählte Punkt ist Source, der letzte/Primary bleibt Survivor. Alle endpoint-basierten Elemente, die den Source referenzieren, werden deterministisch auf den Survivor umgehängt.
- **Direct-Pair Guard:** Connect wird abgelehnt, wenn ein einzelnes endpoint-basiertes Element bereits exakt Source und Survivor als seine beiden Endpunkte verwendet. Damit bleibt die bestehende Self-Loop-/Degenerationsgrenze erhalten.
- **Disconnect Semantics:** Disconnect benötigt exakt `point + ein incident endpoint element`. Nur genau dessen betroffener `startPointId` oder `endPointId` wird auf einen neu erzeugten stabilen Punkt umgehängt.
- **Minimum Incidence:** Trennen ist nur zulässig, wenn der ausgewählte Punkt insgesamt mindestens zwei endpoint-basierte Inzidenzen besitzt.
- **Identity Preservation:** Der ursprüngliche gemeinsame Punkt behält seine `pointId`; der abgetrennte Endpoint erhält eine neue stabile `pointId` mit exakt gleichen Koordinaten. Die Element-ID bleibt unverändert.
- **Control-Point Exclusion:** `circle.center`, `arc.control` und `spline.controls[*]` sind geometrische Parameter und niemals Connect-/Disconnect-Ziele.
- **Central Mutation Boundary:** Connect/Disconnect bleiben vollständig innerhalb `runSketchMutation(...)` mit Validation, History, Recompute und Selection-Events. Keine zweite Mutationsautorität.
- **Command/UI Compatibility:** Die vorhandenen sichtbaren Aktionen `Verbinden` / `Trennen` behalten ihre Semantik. C.6 generalisiert nur Endpoint-Erkennung und Inzidenz; es führt keine neue sichtbare Arc-/Spline-Funktion ein.
- **Backward Compatibility:** Bestehende Line-only-Fälle behalten Source/Survivor-Reihenfolge, Selection-Verhalten, Undo/Redo und die Regel `no geometric rebinding`.

Explizit nicht Bestandteil von C.6:

- keine sichtbare Arc-/Spline-Erstellung;
- kein Arc-/Spline-Rendering;
- kein Arc-/Spline-Inspector oder Gizmo;
- keine neue Arc-/Spline-Selection-UI;
- keine Circle-Connectivity;
- keine Constraints oder automatische Snap-/Merge-/Tolerance-Semantik;
- kein N-Gon;
- keine Profile/Pfade;
- keine Extrusionsintegration.

## Freigabestatus

WD-21C.1, C.2, C.3, C.4 und C.5 sind abgeschlossen. WD-21C.4 und WD-21C.5 sind **PASS / FROZEN / 0 BLOCKER**. WD-21C.6 ist **DEFINED / NOT IMPLEMENTED**. WD-21C als Gesamtblock bleibt **nicht FROZEN**.

## Nächster zulässiger Schritt

Ausschließlich das **WD-21C.6 Definition/Implementation Gate** gegen den eingefrorenen C.5-Stand durchführen und daraus den exakten minimalen Implementierungsumfang sowie die betroffenen autoritativen Connectivity-Grenzen ableiten. Noch keine Code-Implementierung im selben Schritt und weiterhin keine sichtbare Arc-/Spline-Funktion.
