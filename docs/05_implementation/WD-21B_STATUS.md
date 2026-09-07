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
- Connect/Disconnect laufen über den eingefrorenen zentralen `runSketchMutation(...)`-Pfad.

## WD-21B.2 – Deterministic Endpoint Connect Mutation Contract

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

Interner Connect-Mutation-Contract ist implementiert, automatisiert regressiert und auf iPad/Safari bestätigt.

Automatische Evidenz: Workflow `WD-21B.2 Endpoint Connect Contract Regression`, Run `34138362614`, Head `fbbab7b48fb8efc65dd0e20e150dececfd922627`, **SUCCESS / PASS**.

## WD-21B.3 – Deterministic Endpoint Disconnect Mutation Contract

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

Interner Disconnect-Mutation-Contract ist implementiert, automatisiert regressiert und auf iPad/Safari bestätigt.

Automatische Evidenz: Workflow `WD-21B.3 Endpoint Disconnect Contract Regression`, Run `34149057090`, Head `3b09bc8f47f3a7849a14672e0f8e4664f9e3c613`, **SUCCESS / PASS**.

## WD-21B.4 – Connectivity Command & Selection Semantics Integration

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

- nicht sichtbarer Command-Layer `src/application/sketch-connectivity-commands.js`;
- zwei Punkte derselben Skizze: erster = Source, letzter/Primary = Survivor;
- Connect normalisiert auf Survivor;
- Punkt + inzidente Linie: Disconnect;
- Disconnect normalisiert auf Linie + neuen Punkt, neuer Punkt Primary;
- ungültige Kombinationen bleiben deaktiviert;
- keine geometrische Suche, kein Snap/Merge, keine Toleranz.

Automatische Evidenz: Workflow `WD-21B.4 Connectivity Command & Selection Semantics Regression`, Run `34149960132`, Head `bc854825912b084d325a1ef535a54868a8428b7d`, **SUCCESS / PASS**.

Reale iPad-/Safari-Evidenz vom 2026-09-07:

- Browser-Tab und Header konsistent `WD-21B.4`;
- Speichern, Laden, Undo/Redo und Punktbearbeitung funktionieren;
- Ergebnis: **PASS / 0 BLOCKER**.

## WD-21B.5 – Visible Connectivity Actions & Availability Integration

**Status:** PASS / DEVICE VERIFIED / 0 BLOCKER

Umgesetzt:

1. Neuer sichtbarer UI-Layer `src/ui/sketch-connectivity-actions.js`.
2. Die Aktionen werden ausschließlich im bestehenden Sketch-Kontextbalken eingeblendet.
3. Sichtbare Aktion `Verbinden` ruft ausschließlich `connectSelectedSketchPoints()` aus B.4 auf.
4. Sichtbare Aktion `Trennen` ruft ausschließlich `disconnectSelectedSketchEndpoint()` aus B.4 auf.
5. Die UI ruft niemals direkt `connectSketchPoints(...)` oder `disconnectSketchLineFromPoint(...)` auf.
6. `Verbinden` ist nur aktiv, wenn B.4 `connect.enabled === true` liefert.
7. `Trennen` ist nur aktiv, wenn B.4 `disconnect.enabled === true` liefert.
8. Bei allen anderen Auswahlzuständen bleiben die Aktionen sichtbar, aber deaktiviert.
9. Der Aktivierungszustand wird bei `selectionChanged`, `geometryChanged`, `projectChanged` und `projectLoaded` neu synchronisiert.
10. Nach Ausführung übernimmt die UI die bereits in B.4 definierte Auswahl-Normalisierung unverändert.
11. Keine neue Topologie-, History-, Reference- oder Recompute-Logik wurde im UI-Layer eingeführt.
12. Sichtbare Build-ID ist zentral `WD-21B.5`.

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

- Browser-Tab zeigt `CyberMotion 3D – WD-21B.5`;
- sichtbares Header-/Build-Label zeigt konsistent `WD-21B.5`;
- sichtbare Connectivity-Bedienung wurde real getestet und funktioniert;
- Connect/Disconnect funktionieren im vorgesehenen Auswahl-Workflow;
- bestehende Funktionen blieben nach Nutzerprüfung erhalten;
- Ergebnis: **PASS / DEVICE VERIFIED / 0 BLOCKER**.

Explizit nicht Bestandteil von WD-21B.5:

- kein automatisches Snap/Merge;
- keine Toleranzsuche;
- kein geometrisches Best-Guess;
- keine Kreis-/Bogen-/Spline-Elementtypen;
- keine Profile/Pfade;
- keine neue 3D-Funktion.

## Freigabestatus

WD-21B.1 bis WD-21B.5 sind jeweils abgeschlossen; B.2 bis B.5 sind **PASS / DEVICE VERIFIED / 0 BLOCKER**. WD-21B als Gesamtblock bleibt ausdrücklich **nicht FROZEN**, bis ein separat freigegebener Completion-/Regression-/Freeze-Schritt durchgeführt wurde.

Der nächste zulässige Schritt muss separat definiert und autorisiert werden. Sinnvoll ist jetzt ausschließlich ein `WD-21B – Completion / Regression / Freeze Gate`, das B.1–B.5 gemeinsam gegen die eingefrorene WD-21A-Basis regressiert. Noch kein WD-21C.
