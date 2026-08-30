# WD-19 – Objektbaum Skalierbarkeit & kompakte Zustandsicons

**Status:** PASS / FROZEN  
**Basis:** V1 FUNCTIONALLY COMPLETE nach WD-18 PASS/FROZEN  
**Branch:** `feature/wd-19-object-tree-scalability`  
**Device Test:** iPad / Safari / GitHub Pages – PASS – 2026-08-30

## Ziel

WD-19 verbessert ausschließlich die Bedienbarkeit und Skalierbarkeit des bestehenden Objektbaums. Die bereits freigegebene Fachlogik von Sichtbarkeit (`F011`) und Sperren/Entsperren (`F012`) bleibt unverändert.

## Implementiert und bestätigt

- Gruppen und Baugruppen mit Kindern erhalten einen Auf-/Zuklapp-Pfeil.
- Zugeklappte Container verbergen nur ihre Baumdarstellung; Szene, Objektmodell und Auswahlzustand werden nicht verändert.
- Der Collapse-Zustand wird lokal pro Projekt im Browser als Workspace-/UI-Zustand gemerkt und nach erneutem Laden wiederhergestellt.
- Der Collapse-Zustand bleibt bewusst außerhalb der `.cm3d.json`-Projektdatei und erzeugt keinen Undo/Redo-Eintrag.
- Wird ein Objekt im 3D-Viewer bzw. über die normale Auswahl selektiert, werden alle zugeklappten übergeordneten Gruppen/Baugruppen entlang seines Parent-Pfads automatisch aufgeklappt.
- Die zugehörige Baumzeile wird anschließend möglichst in den sichtbaren Bereich gescrollt, damit die Position des ausgewählten Objekts in großen Strukturen unmittelbar erkennbar ist.
- Sichtbarkeit und Sperren bleiben dieselben WD-14A/WD-14B-Operationen.
- Sichtbarkeits- und Sperrbedienung wird als kompakte, transparente Zustandssteuerung dargestellt; die großen weißen Schaltflächen entfallen.
- Baumzeilen wurden kompakter, damit große Baugruppen besser handhabbar sind.
- Speichern/Neuladen sowie Sichtbarkeit und Sperren wurden auf dem realen Gerät ohne Regression bestätigt.
- Build-Marker ist `WD-19`.

## Nicht Bestandteil

- keine Änderung an `flags.visible` oder `flags.locked`
- keine Änderung an Runtime-Sichtbarkeit oder Transform-Sperrlogik
- keine Änderung am Gruppen-/Baugruppen-Datenmodell
- Collapse-Zustand wird nicht fachlich im Projekt gespeichert und nicht exportiert
- keine neuen Modellierungsfunktionen

## Freeze

WD-19 wurde nach erfolgreichem realem iPad/Safari-Test am 2026-08-30 auf **PASS / FROZEN** gesetzt. Weitere Änderungen an diesem Block nur bei konkreter Regression oder über einen neuen Folgeblock.
