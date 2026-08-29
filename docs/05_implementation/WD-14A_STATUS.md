# WD-14A – Sichtbarkeit Core

**Status:** IMPLEMENTED / DEVICE TEST REQUIRED  
**Branch:** `feature/wd-14a-visibility-core`  
**Basis:** WD-13B PASS / FROZEN (`fb066fd9376f402befea3c247d6ec02e3b4f3f18`)  
**Funktion:** `CM3D-F011` – Sichtbarkeit

## Ziel

SceneGraph-Objekte können direkt im Objektbaum ein- und ausgeblendet werden. Der Zustand ist Teil des bestehenden Objektmodells, wirkt unmittelbar auf die Three.js-Runtime und bleibt über Undo/Redo sowie Save/Load erhalten.

## Datenmodell

Das bestehende Objektfeld `flags.visible` wird verwendet. Neue Objekte besitzen bereits `flags.visible: true`; WD-14A führt kein paralleles Sichtbarkeitsmodell ein.

Für ältere/abweichende Objekte gilt fehlendes `flags.visible` kompatibel als sichtbar.

## Objektbaum

Jede normale Objektzeile erhält rechts einen Sichtbarkeitsschalter:

- `◉` = sichtbar
- `○` = ausgeblendet

Der Schalter verändert nicht die Auswahl. Ausgeblendete Objekte bleiben im Objektbaum vorhanden und können dort wieder eingeblendet werden.

## Runtime

`flags.visible` wird auf den zugehörigen Three.js-Objektknoten übertragen. Dadurch werden auch Untervisualisierungen des Objekts gemeinsam ausgeblendet.

Der Zustand wird nach Runtime-Rebuild erneut angewendet.

## History / Persistenz

Jede Sichtbarkeitsumschaltung erzeugt genau einen History-Eintrag:

- `Objekt ausblenden`
- `Objekt einblenden`

Da `flags.visible` im bestehenden SceneGraph-Objekt gespeichert wird, läuft Save/Load über das vorhandene Projektmodell.

## Nicht Bestandteil

- Sperren/Entsperren – folgt in WD-14B;
- Layers/Ebenen;
- Feature Suppress/Unsuppress;
- globale Sichtbarkeitsfilter;
- Solo/Isolate-Modus.

## Abnahme

Vor PASS / FROZEN ist der praktische iPad-/Safari-Test nach `WD-14A_TEST_CHECKLIST.md` erforderlich.

**Aktueller Status: IMPLEMENTED / DEVICE TEST REQUIRED.**
