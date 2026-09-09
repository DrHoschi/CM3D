# WD-21C – Sketch Element Type Expansion

**Branch:** `feature/wd-21c-sketch-element-type-expansion`  
**Basis:** WD-21B FROZEN @ `2e8d5b0434e62bf7c7e34b11e54da077853328cc`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-09

## WD-21C.1 – Existing Sketch Element Type & Creation/Editing Inventory

**Status:** PASS / INVENTORY & CONTRACT COMPLETE / 0 ELEMENT IMPLEMENTATION

## WD-21C.2 – Generic Sketch Element Registry & Persistence Foundation

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

## WD-21C.3 – Generic Sketch Element Mutation Contract + Analytic Geometry ↔ Derived Tessellation Boundary

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

## WD-21C.4 – Circle Creation, Rendering & Editing Integration

**Status:** PASS / FROZEN / 0 BLOCKER

Finaler sichtbarer Korrekturstand: `WD-21C.4-R1`. Completion-Regression Run `34273576840`: SUCCESS; reale iPad-/Safari-Evidenz: PASS.

## WD-21C.5 – Generic Sketch Element Manipulation Contract

**Status:** PASS / FROZEN / 0 BLOCKER

Direkter Circle-Gizmo-Move, bestehende Point-/Line-Manipulation, Save und Undo/Redo sind auf iPad/Safari bestätigt. Regression Run `34277682889`: SUCCESS.

## WD-21C.6 – Generic Endpoint Element Connectivity Contract

**Status:** PASS / FROZEN / 0 BLOCKER

Finaler sichtbarer Korrekturstand: `WD-21C.6-R1`.

C.6 generalisiert die bestehende B.2/B.3-Connectivity ausschließlich auf registrierte endpoint-basierte Sketch-Elemente (`topologyEndpoints: true` → aktuell Line/Arc/Spline). Circle bleibt ausgeschlossen; `pointId` bleibt einzige Connectivity-Autorität.

WD-21C.6-R1 korrigiert ausschließlich die beim realen Gerätecheck gefundene Mehrfachauswahlregression. Der reale iPad-/Safari-Recheck bestätigt Zeichnen/Polygon, Mehrfachauswahl, Verbinden/Trennen, erneutes Zusammenführen, Undo/Redo und Speichern/Laden. Completion-Regression Run `34363013788`: SUCCESS. C.6 ist PASS / FROZEN / 0 BLOCKER.

## WD-21C.7 – Arc Creation, Rendering & Editing Integration

**Status:** PASS / FROZEN / 0 BLOCKER

**Reconciliation-Basis:** eingefrorener WD-21C.6-R1-Stand `a16a1f6b70a10fb10b469ff45e3795a95ddbbc45`.

### Implementierter Minimalumfang

- neue zentrale Application-Grenze `src/application/sketch-arc-creation.js`;
- `addSketchArcFromPoints(sketchId,start,end,control)` erzeugt innerhalb genau einer `runSketchMutation(...)`-Transaktion zwei stabile Endpoint-Punkte und genau einen Arc;
- eine sichtbare Arc-Erzeugung erzeugt damit genau einen History-/Undo-Schritt;
- kollineare/ungültige Drei-Punkt-Geometrie wird durch die zentrale Topologievalidation atomar verworfen, ohne persistente Teilpunkte;
- `setSketchArcGeometry(...)` editiert Start-/Endpunktkoordinaten und Control innerhalb einer zentralen Mutation und erhält `arcId`, `startPointId` und `endPointId`;
- neues UI-Modul `src/ui/sketch-arc-integration.js`;
- sichtbares Sketch-Werkzeug `Bogen`;
- deterministischer Drei-Tap-Input `Start → Ende → Control`;
- vor der dritten gültigen Eingabe ausschließlich Preview-State;
- abgeleitete analytische Arc-Tessellation für Preview und Viewer;
- keine Rendersegmente werden persistiert oder als Sketch-Lines erzeugt;
- Arc erscheint als genau ein `SKETCH_ELEMENT` und als Tree-Gruppe `Bögen (n)`;
- Tree- und Viewer-Picking verwenden die bestehende generische SelectionRef-/Sketch-Element-Grenze;
- Inspector zeigt Start X/Y, Ende X/Y und Kontrollpunkt X/Y;
- C.6-Connect/Disconnect wird für Arc-Endpunkte unverändert wiederverwendet;
- sichtbare Build-ID ist `WD-21C.7`; die zentrale `applyBuildIdentity()`-Grenze bleibt alleinige Build-Autorität.

### Unveränderte Ausschlüsse

- keine Spline-Erstellung, kein Spline-Rendering und kein Spline-Editing;
- kein Arc-Gizmo und kein gesamter Arc-Drag;
- kein sichtbares Control-Handle im Viewer;
- keine alternative Radius-/Mittelpunkt-/Winkel-Parametrisierung;
- keine Tangentialität oder Constraints;
- kein Snap, Auto-Merge, Tolerance oder geometrisches Rebinding;
- kein N-Gon/facettierter Arc als eigenes Sketch-Modell;
- keine Profile/Pfade;
- keine Extrusionsintegration;
- keine Änderung an der eingefrorenen C.6-Connectivity-Semantik.

### Completion / Regression / Freeze Gate

Der vollständige C.7-Branchstand vor Freeze-Dokumentation wurde gegen den eingefrorenen C.6-R1-Stand `a16a1f6b70a10fb10b469ff45e3795a95ddbbc45` geprüft.

Ergebnis des vollständigen Vergleichs:

- **12 Commits voraus / 0 dahinter**;
- geänderte Produktdateien ausschließlich `src/application/sketch-arc-creation.js`, `src/ui/sketch-arc-integration.js` und die notwendige C.7-Integration/Build-ID in `src/main.js`;
- neue C.7-Regression und Workflow;
- zwei historische Regressionstests ausschließlich forward-kompatibel angepasst;
- Statusdokumentation synchronisiert;
- keine Spline-Funktion, kein Arc-Gizmo, keine Profile/Pfade, kein N-Gon, keine Extrusionsintegration und keine C.6-Fachänderung im Diff.

### Automatisierte Regression

Workflow: `WD-21C.7 Arc Integration Regression`  
Run: `34369150959`  
Getesteter Code-Head: `9b49ec2fd16dda35de38cf185230692272997b46`  
Result: **SUCCESS / PASS**

Bestätigt:

- WD-21A.2 Topology: PASS;
- WD-21A.3 Mutation: PASS;
- WD-21B.2 Connect: PASS;
- WD-21B.3 Disconnect: PASS;
- WD-21C.2 Registry/Persistence: PASS;
- WD-21C.3 Generic Mutation: PASS;
- WD-21C.4 Circle Integration: PASS;
- WD-21C.5 Manipulation: PASS;
- WD-21C.6 Generic Endpoint Connectivity: PASS;
- WD-21C.7 Arc Integration: PASS.

Der C.7-Test bestätigt zusätzlich atomare Arc-Erzeugung, einen History-Eintrag pro Creation, Rollback ungültiger/kollinearer Geometrie, stabile Endpoint-IDs beim Editing, C.6-Connect/Disconnect für Arc-Endpunkte mit unverändertem Control, Persistenz über Save/Load sowie die Ausschlussgrenzen zu Spline/Gizmo/Extrusion.

Die nach dem getesteten Code-Head hinzugekommenen Commits bis zum auditierten Branchstand betreffen ausschließlich Statusdokumentation; während des Freeze-Gates wurde kein Produktcode geändert.

### Test-Gate-Korrekturen während der Implementierung

Die ersten roten Läufe waren keine freizugebenden Produktregressionen, sondern veraltete bzw. fehlerhafte Testgrenzen:

- Run `34367616484` stoppte in C.3, weil der eingefrorene C.3-Test sichtbare Arc-Integration ausdrücklich noch verbot. Diese historische Negativgrenze wurde für spätere C-Teilschritte forward-kompatibel gemacht; Commit `ba5ed7c0013c47dc23b9a757500b966aa83f43d9`. Spline bleibt weiterhin ausgeschlossen.
- Der nächste Lauf erreichte C.6 und stoppte an dessen alter Build-ID-Grenze, die ausschließlich `WD-21C.6(-Rn)` akzeptierte. Die Build-Grenze wurde auf spätere WD-21C-Builds forward-kompatibel erweitert; Commit `30a86d992c2a500dacef7193dcc8befe78079e38`. Die C.6-Fachsemantik wurde nicht verändert.
- Run `34368990817` erreichte C.7 und zeigte einen Fehler im neuen Test-Harness: nach zentralen Transaktionen wurde eine veraltete Objekt-Referenz geprüft. Der Test liest nach Mutationen jetzt den autoritativen Sketch erneut aus dem Store; Commit `9b49ec2fd16dda35de38cf185230692272997b46`. Produktcode wurde dafür nicht verändert.

Erst der anschließende maßgebliche Run `34369150959` ist das C.7-Automatik-Gate und vollständig SUCCESS.

### Reale Geräte-Evidenz 2026-09-09 – iPad/Safari

Der reale Gerätecheck auf `WD-21C.7` bestätigt:

- Browser-Tab und sichtbares Header-/Brand-Label konsistent `WD-21C.7`: PASS;
- Bogen über drei Punkte zeichnen: PASS;
- Tree-Auswahl: PASS;
- Viewer-Auswahl: PASS;
- Inspector-Änderungen: PASS;
- Arc-Endpunkte über Mehrfachauswahl mit anderen geeigneten Punkten verbinden/trennen: PASS;
- Undo: PASS;
- Redo: PASS;
- Speichern: PASS;
- Laden: PASS;
- 0 gemeldete Blocker.

Der Versuch, Start- und Endpunkt **desselben einzelnen Arc** miteinander zu verbinden, wird erwartungsgemäß abgelehnt und ist **kein Blocker**. Die eingefrorene C.6-Direct-Pair-/Self-Loop-Regel verhindert dadurch `startPointId === endPointId` innerhalb desselben endpoint-basierten Elements. Für einen analytisch geschlossenen Kreis bleibt das separate Circle-Element zuständig.

## Freigabestatus

WD-21C.4, WD-21C.5, WD-21C.6 und WD-21C.7 sind **PASS / FROZEN / 0 BLOCKER**. WD-21C als Gesamtblock bleibt ausdrücklich **nicht FROZEN**, da weitere WD-21C-Teilblöcke noch ausstehen.

## Nächster zulässiger Schritt

Ausschließlich den nächsten kleinen WD-21C-Teilblock fachlich definieren. Noch keine Spline-Implementierung und keine weitere C.7-Erweiterung im selben Schritt.
