# WD-19 – Objektbaum Skalierbarkeit & kompakte Zustandsicons

**Status:** IMPLEMENTED / DEVICE TEST REQUIRED  
**Basis:** V1 FUNCTIONALLY COMPLETE nach WD-18 PASS/FROZEN  
**Branch:** `feature/wd-19-object-tree-scalability`

## Ziel

WD-19 verbessert ausschließlich die Bedienbarkeit und Skalierbarkeit des bestehenden Objektbaums. Die bereits freigegebene Fachlogik von Sichtbarkeit (`F011`) und Sperren/Entsperren (`F012`) bleibt unverändert.

## Implementiert

- Gruppen und Baugruppen mit Kindern erhalten einen Auf-/Zuklapp-Pfeil.
- Zugeklappte Container verbergen nur ihre Baumdarstellung; Szene, Objektmodell und Auswahlzustand werden nicht verändert.
- Auf-/Zuklappen erzeugt keinen Undo/Redo-Eintrag und verändert die Projektdatei nicht.
- Sichtbarkeit und Sperren bleiben dieselben WD-14A/WD-14B-Operationen.
- Sichtbarkeits- und Sperrbedienung wird als kompakte, transparente Zustandssteuerung dargestellt; die großen weißen Schaltflächen entfallen.
- Baumzeilen wurden etwas kompakter, damit große Baugruppen besser handhabbar sind.
- Build-Marker ist `WD-19`.

## Nicht Bestandteil

- keine Änderung an `flags.visible` oder `flags.locked`
- keine Änderung an Runtime-Sichtbarkeit oder Transform-Sperrlogik
- keine Änderung an Gruppen-/Baugruppen-Datenmodell
- keine Persistenz des reinen UI-Auf-/Zuklappzustands
- keine neuen Modellierungsfunktionen

## Freeze-Gate

WD-19 darf erst nach realem iPad/Safari-Test auf PASS/FROZEN gesetzt werden.
