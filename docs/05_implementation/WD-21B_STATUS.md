# WD-21B – Sketch Connectivity & Editing Integration

**Branch:** `feature/wd-21b-sketch-connectivity-editing-integration`  
**Basis:** WD-21A FROZEN @ `4014cf865049c66c20d756db608201fa599d0948`  
**RB:** RB-02 – Sketch Topology & Profiles  
**Stand:** 2026-09-07

## WD-21B.1 – Existing Endpoint Selection & Connectivity Editing Inventory

**Status:** PASS / INVENTORY & CONTRACT COMPLETE / 0 IMPLEMENTATION

Festgelegt:

- Punkte sind über Tree, Viewer und Inspector einzeln auswählbar.
- Mehrfachauswahl kann mehrere Punkte derselben Skizze halten; die letzte Auswahl ist Primary Selection.
- SelectionRef bildet Punkte als `SKETCH_POINT` mit `ownerId=sketchId` und `targetId=pointId` ab.
- Connect/Disconnect müssen über den eingefrorenen zentralen `runSketchMutation(...)`-Pfad laufen.
- Connect: Primary/Survivor bleibt, Merge-Source wird umgehängt und entfernt; kein geometrisches Rebinding.
- Disconnect: gemeinsamer Punkt bleibt bestehen; für eine explizit ausgewählte angeschlossene Linie wird ein neuer Punkt mit neuer `pointId` erzeugt.

## WD-21B.2 – Deterministic Endpoint Connect Mutation Contract

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

Interner Connect-Mutation-Contract ist implementiert, automatisiert regressiert und auf iPad/Safari bestätigt. Keine sichtbare Connect-Aktion.

Automatische Evidenz: Workflow `WD-21B.2 Endpoint Connect Contract Regression`, Run `34138362614`, Head `fbbab7b48fb8efc65dd0e20e150dececfd922627`, **SUCCESS / PASS**.

## WD-21B.3 – Deterministic Endpoint Disconnect Mutation Contract

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

Interner Disconnect-Mutation-Contract ist implementiert, automatisiert regressiert und auf iPad/Safari bestätigt. Keine sichtbare Disconnect-Aktion.

Automatische Evidenz: Workflow `WD-21B.3 Endpoint Disconnect Contract Regression`, Run `34149057090`, Head `3b09bc8f47f3a7849a14672e0f8e4664f9e3c613`, **SUCCESS / PASS**.

## WD-21B.4 – Connectivity Command & Selection Semantics Integration

**Status:** IMPLEMENTED / AUTOMATED REGRESSION PASS / DEVICE BUILD-ID CHECK PENDING

Umgesetzt:

1. Neuer nicht sichtbarer Command-Layer `src/application/sketch-connectivity-commands.js`.
2. `deriveSketchConnectivityCommandState(store)` wertet ausschließlich den aktuellen expliziten Auswahlzustand aus; keine geometrische Suche, keine Nähe-/Toleranzlogik.
3. Connect ist nur verfügbar, wenn exakt zwei Punkte derselben Skizze ausgewählt sind und die B.2-Mutation diese Kombination grundsätzlich zulässt.
4. Die Reihenfolge der Mehrfachauswahl ist autoritativ: erster Punkt = Source, zuletzt ausgewählter/Primary Point = Survivor.
5. `connectSelectedSketchPoints()` ruft ausschließlich den vorhandenen B.2-Contract auf; nach Erfolg bleibt nur der Survivor als gültige Sketch-Auswahl bestehen.
6. Disconnect ist nur verfügbar, wenn exakt ein Punkt und eine Linie derselben Skizze ausgewählt sind, die Linie diesen Punkt tatsächlich referenziert und der Punkt mindestens zwei inzidente Linien besitzt.
7. `disconnectSelectedSketchEndpoint()` ruft ausschließlich den vorhandenen B.3-Contract auf.
8. Nach erfolgreichem Disconnect wird die Auswahl deterministisch auf die weiterhin gültige Linie plus den neu erzeugten abgetrennten Punkt normalisiert; der neue Punkt ist Primary Selection.
9. Ungültige Auswahlkombinationen bleiben Command-disabled/Reject und erzeugen keine Mutation bzw. keinen History-Eintrag.
10. Selection-Änderungen nach erfolgreichem Connect/Disconnect werden über `selectionChanged` publiziert, sodass SelectionRef/Viewer/Tree auf den gültigen Zustand synchronisieren können.
11. Der Layer wird nach Mutation-Contract, Mehrfachauswahl und SelectionRef-Brücke installiert.
12. Der Command-Layer besitzt `version: 'WD-21B.4'` und `visibleUi: false`.
13. Sichtbare Build-ID ist zentral `WD-21B.4`.
14. Es wurde kein Connect-/Disconnect-Button, Menüeintrag oder anderer sichtbarer Trigger hinzugefügt.

Automatische Regression:

- Workflow: `WD-21B.4 Connectivity Command & Selection Semantics Regression`
- Run: `34149960132`
- Head: `bc854825912b084d325a1ef535a54868a8428b7d`
- A.2 Topology Regression: PASS
- A.3 Mutation Regression: PASS
- B.2 Connect Regression: PASS
- B.3 Disconnect Regression: PASS
- B.4 Command/Selection Regression: PASS
- Result: **SUCCESS / PASS**

Explizit nicht Bestandteil von WD-21B.4:

- kein sichtbarer Connect-Button;
- kein sichtbarer Disconnect-Button;
- kein automatisches Snap/Merge;
- keine Toleranzsuche;
- kein geometrisches Best-Guess;
- keine Kreis-/Bogen-/Spline-Elementtypen;
- keine Profile/Pfade;
- keine neue 3D-Funktion.

## Freigabestatus

WD-21B.2 und WD-21B.3 sind **PASS / DEVICE VERIFIED / 0 BLOCKER**. WD-21B.4 ist technisch **AUTOMATED PASS**, benötigt aber noch den realen iPad-/Safari-Build-ID-/Regressionscheck. WD-21B als Gesamtblock bleibt ausdrücklich **nicht FROZEN**.

Der nächste zulässige Schritt ist ausschließlich der Gerätecheck für `WD-21B.4`: Browser-Tab und sichtbares Build-Label müssen konsistent `WD-21B.4` zeigen und die bestehenden Sketch-Grundfunktionen einschließlich Speichern, Laden, Undo/Redo und Punktbearbeitung dürfen nicht regressiert sein. Da B.4 bewusst noch keinen sichtbaren Connectivity-Trigger besitzt, ist auf dem Gerät noch keine Connect-/Disconnect-Bedienung zu testen. Kein weiterer B-Schritt wird automatisch begonnen.
