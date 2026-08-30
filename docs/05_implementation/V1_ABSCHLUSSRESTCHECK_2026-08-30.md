# CM3D – V1-Abschlussrestcheck nach WD-18

**Stand:** 2026-08-30  
**Basis:** WD-18 PASS / FROZEN (`c4263037408ac54a2f1ca19cd59cf54bdb44bcfe`)  
**Quelle:** `CM3D_MASTER_FUNCTIONS_V0_1.md`, `V1_RESTABGLEICH_2026-08-29.md` und tatsächlicher Repository-Stand auf `feature/wd-18-inspector-diagnostics`

## Bewertungsregel

- **ERFÜLLT** – V1-Funktion besitzt einen produktiven Bedienpfad; bei abgeschlossenen WD-Blöcken gilt deren PASS/FROZEN-Stand.
- **TEILWEISE** – wesentliche Funktion vorhanden, aber Masterfunktion nicht vollständig geschlossen.
- **OFFEN** – kein ausreichender produktiver Bedienpfad vorhanden.

## Ausgangspunkt

Der Restabgleich vom 2026-08-29 hatte nach WD-15B genau drei noch nicht vollständig geschlossene V1-Gruppen identifiziert:

1. `CM3D-F023` – Raster und Achsen: TEILWEISE.
2. `CM3D-F063/F064` – Kameraobjekt und Kamera-Vorschau: OFFEN.
3. `CM3D-F081–F084` – Diagnose-/Inspector-Kern: OFFEN bzw. TEILWEISE.

Alle übrigen V1-Funktionen waren bereits als ERFÜLLT bzw. bei F089 als ERFÜLLT ALS V1-BASIS bewertet.

## Abschluss der damaligen Restpunkte

### CM3D-F023 – Raster und Achsen

**Status: ERFÜLLT**

WD-16 ergänzte die fehlende sichtbare XYZ-Achsenreferenz auf Basis des bestehenden dynamischen Rasters. Realer iPad-/Safari-Test: PASS / FROZEN.

### CM3D-F063 – Kameraobjekt

**Status: ERFÜLLT**

WD-17 ergänzte ein echtes CM3D-Szenenobjekt `camera.perspective` mit persistenter Transformstruktur und Kameraparametern. Mehrere Kameraobjekte können gleichzeitig vorhanden sein. Realer iPad-/Safari-Test: PASS / FROZEN.

### CM3D-F064 – Kamera-Vorschau

**Status: ERFÜLLT**

WD-17 ergänzte die Vorschau durch eine ausgewählte Kamera einschließlich Rückkehr zur vorherigen Editoransicht. Realer iPad-/Safari-Test: PASS / FROZEN.

### CM3D-F081 – Konsole / Debug / Diagnose

**Status: ERFÜLLT**

WD-18 stellt unter `Werkzeuge → Diagnose` eine eigene Diagnoseansicht bereit.

### CM3D-F082 – Status / Meldungen / Warnungen / Fehler

**Status: ERFÜLLT**

WD-18 bindet die bestehende Statusquelle in eine sichtbare Meldungs-/Fehlerhistorie ein, ohne ein zweites Statusmodell einzuführen.

### CM3D-F083 – Scene JSON

**Status: ERFÜLLT**

WD-18 zeigt `project.scene` read-only als formatiertes Scene JSON.

### CM3D-F084 – Selection / Auswahlstatus

**Status: ERFÜLLT**

WD-18 zeigt den realen Selection-State des Stores einschließlich aktiver Auswahl und Kerndaten des aktiven Objekts.

## Vollständige V1-Schlussbewertung

Nach Schließung dieser drei Restgruppen gibt es in `CM3D_MASTER_FUNCTIONS_V0_1.md` **keine weitere Funktion mit Release V1, die im aktuellen Repository-Stand als TEILWEISE oder OFFEN bewertet werden muss**.

Damit ist der **funktionale V1-Pflichtkern vollständig abgedeckt**.

Dies bedeutet ausdrücklich nicht, dass CM3D damit als Gesamtprodukt fertig ist. Die Masterliste enthält zahlreiche Funktionen der Stufen V1–V2 und Später, die bewusst noch nicht Bestandteil des V1-Pflichtkerns sind.

## Objektbaum – ausdrücklich geprüfte Folgepunkte

### Kompaktere Sichtbarkeits-/Sperr-Icons

`CM3D-F011` Sichtbarkeit und `CM3D-F012` Sperren/Entsperren sind funktional bereits PASS/FROZEN. Die derzeitigen hellen/weißen Schaltflächen im Objektbaum sind daher **kein offener V1-Funktionsblock**, sondern eine UI-Verdichtungs-/Darstellungsverbesserung.

Ziel für den Folgeblock:

- sichtbare/gesperrte Zustände weiterhin eindeutig erkennbar;
- weiße Button-Flächen entfernen bzw. deutlich reduzieren;
- kompaktere Icon-Bedienung;
- Touch-Bedienbarkeit auf iPad/iPhone erhalten.

### Gruppen/Baugruppen auf- und zuklappen

`CM3D-F008` Objektbaum, `CM3D-F013` Gruppen und `CM3D-F014` Baugruppen sind funktional vorhanden. Der aktuelle Baum rendert seine Unterknoten jedoch vollständig und besitzt keinen eigenen Collapse-/Expand-State.

Das Auf-/Zuklappen ist **nicht als separater Funktionsname in der V1-Masterliste aufgeführt** und blockiert daher den funktionalen V1-Abschluss nicht. Es ist inzwischen aber eine klare Skalierbarkeits- und Bedienanforderung für größere Projekte und wird als unmittelbarer Folgeblock behandelt.

## Ergebnis

**V1-PFLICHTKERN: FUNCTIONALLY COMPLETE**

Offene V1-Pflichtfunktionen: **0**  
Teilweise offene V1-Pflichtfunktionen: **0**

## Nächster Entwicklungsblock

### WD-19 – Objektbaum Skalierbarkeit & kompakte Zustandsicons

Geplanter Scope:

- Gruppen und Baugruppen im Objektbaum auf-/zuklappbar;
- Collapse-State ist reiner UI-/Workspace-State und verändert nicht die Projektgeometrie;
- Unterobjekte bleiben beim Zuklappen vollständig im Projekt erhalten;
- Auswahl und Operationen dürfen durch Collapse nicht beschädigt werden;
- kompakte Sichtbarkeits-/Lock-Icons ohne die heutigen dominanten weißen Flächen;
- Zustände sichtbar/unsichtbar und gesperrt/entsperrt bleiben eindeutig;
- iPad-/Touch-Bedienung bleibt ausreichend groß;
- keine Änderungen an der bereits eingefrorenen Sichtbarkeits-/Lock-Fachlogik.

Nicht Bestandteil von WD-19:

- Layers;
- Suche/Filter im Objektbaum;
- Drag-and-drop-Reparenting;
- neue Gruppen-/Baugruppenlogik;
- GLB/GLTF-Hierarchie-Auflösung;
- V1–V2-Funktionsausbau.
