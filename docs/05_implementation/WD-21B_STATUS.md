# WD-21B – Sketch Connectivity & Editing Integration

**Branch:** `feature/wd-21b-sketch-connectivity-editing-integration`  
**Basis:** WD-21A FROZEN @ `4014cf865049c66c20d756db608201fa599d0948`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-07

## WD-21B.1 – Existing Endpoint Selection & Connectivity Editing Inventory

**Status:** PASS / INVENTORY & CONTRACT COMPLETE / 0 IMPLEMENTATION

Festgelegt wurden vorhandene Punkt-/Mehrfachauswahl, Primary-Selection-Semantik sowie der deterministische Connect-/Disconnect-Fachvertrag. Keine Produktionsfunktion in B.1.

## WD-21B.2 – Deterministic Endpoint Connect Mutation Contract

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

Interner zentraler Connect-Mutation-Contract ist implementiert. Survivor bleibt autoritativ, Source wird deterministisch umgehängt und entfernt, kein geometrisches Rebinding, Undo/Redo erhält exakte Identitäten.

Automatische Evidenz: Workflow `WD-21B.2 Endpoint Connect Contract Regression`, Run `34138362614`, Head `fbbab7b48fb8efc65dd0e20e150dececfd922627`, **SUCCESS / PASS**.

## WD-21B.3 – Deterministic Endpoint Disconnect Mutation Contract

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

Interner Disconnect-Mutation-Contract ist implementiert. Gemeinsamer Punkt bleibt bestehen, nur die ausgewählte inzidente Linie erhält einen neuen Punkt mit neuer `pointId` und identischer Koordinate; Undo/Redo bleibt deterministisch.

Automatische Evidenz: Workflow `WD-21B.3 Endpoint Disconnect Contract Regression`, Run `34149057090`, Head `3b09bc8f47f3a7849a14672e0f8e4664f9e3c613`, **SUCCESS / PASS**.

## WD-21B.4 – Connectivity Command & Selection Semantics Integration

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

Der nicht sichtbare Command-Layer wertet ausschließlich explizite Auswahlzustände aus. Zwei Punkte derselben Skizze erlauben Connect, wobei der zuletzt ausgewählte Primary Point Survivor ist. Punkt + inzidente Linie erlauben Disconnect. Ungültige Kombinationen bleiben deaktiviert; keine geometrische Suche, kein Snap/Merge, keine Toleranz.

Automatische Evidenz: Workflow `WD-21B.4 Connectivity Command & Selection Semantics Regression`, Run `34149960132`, Head `bc854825912b084d325a1ef535a54868a8428b7d`, **SUCCESS / PASS**.

## WD-21B.5 – Visible Connectivity Actions & Availability Integration

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

Sichtbare Aktionen `Verbinden` und `Trennen` sind im Sketch-Kontextbalken integriert. Die UI konsumiert ausschließlich die B.4-Commands und besitzt keine eigene Topologie-/History-/Reference-/Recompute-Logik.

Automatische Regression:

- Workflow: `WD-21B.5 Visible Connectivity Actions Regression`
- Run: `34155743925`
- Head: `b1a234aa46aa6f81e9014528672a45172c514304`
- A.2 Topology Regression: PASS
- A.3 Mutation Regression: PASS
- B.2 Connect Regression: PASS
- B.3 Disconnect Regression: PASS
- B.4 Command/Selection Regression: PASS
- B.5 Visible Action Regression: PASS
- Result: **SUCCESS / PASS**

Reale iPad-/Safari-Evidenz vom 2026-09-07:

- Browser-Tab `CyberMotion 3D – WD-21B.5`;
- Header-/Build-Label `WD-21B.5`;
- Connect/Disconnect real funktional bestätigt;
- bestehende geprüfte Funktionen erhalten;
- Ergebnis: **PASS / DEVICE VERIFIED / 0 BLOCKER**.

## WD-21B – Completion / Regression / Freeze Gate

**Status:** PASS / FROZEN / 0 BLOCKER

Vollständiger Branch-Abgleich gegen die eingefrorene WD-21A-Basis `4014cf865049c66c20d756db608201fa599d0948`:

- Branch ist ausschließlich vorwärts von WD-21A aufgebaut (`behind_by = 0`);
- geänderte Produktionspfade bleiben auf Sketch Connectivity & Editing Integration begrenzt;
- keine WD-21C-Funktion, kein Kreis/Bogen/Spline, keine Profile/Pfade und keine neue 3D-Funktion wurden vorgezogen;
- A.2 Topology Foundation: PASS;
- A.3 Central Mutation Foundation: PASS;
- B.2 Connect: PASS;
- B.3 Disconnect: PASS;
- B.4 Command/Selection: PASS;
- B.5 Visible Actions: PASS;
- sichtbare Completion-Build-Identität bleibt konsistent `WD-21B.5`.

Finale Gate-Evidenz:

- Workflow: `WD-21B Completion Regression Freeze Gate`
- Run: `34158722819`
- getesteter Head: `50e907bb4993fb0885ef73e8d3ebcd93f21fb732`
- Branch-Boundary-Prüfung gegen WD-21A: PASS
- A.2/A.3/B.2/B.3/B.4/B.5: PASS
- Build-Identity-Prüfung: PASS
- Result: **SUCCESS / PASS / 0 BLOCKER**

## Freeze

**WD-21B – PASS / FROZEN / 0 BLOCKER**

WD-21B.1–B.5 sind gemeinsam regressiert und durch reale iPad-/Safari-Evidenz bestätigt. Die Connectivity-Grenze ist damit eingefroren. Änderungen an WD-21B erfolgen nur noch über einen ausdrücklich autorisierten Folgeblock oder zur Behebung einer konkreten Regression.

Der nächste fachlich zulässige Roadmapblock ist **WD-21C – Sketch Element Type Expansion**, wird aber nicht automatisch begonnen.
