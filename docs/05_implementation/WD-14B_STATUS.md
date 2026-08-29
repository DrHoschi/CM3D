# WD-14B – Sperren/Entsperren Core

**Status:** PASS / FROZEN  
**Branch:** `feature/wd-14b-locking-core`  
**Basis:** WD-14A PASS / FROZEN (`468db7d1b2ddfc555b7b9602549162f606ed2411`)  
**Funktion:** `CM3D-F012` – Sperren/Entsperren

## Ziel

SceneGraph-Objekte können direkt im Objektbaum gesperrt und entsperrt werden. Gesperrte Objekte bleiben sichtbar und auswählbar, können aber nicht versehentlich transformiert oder fachlich verändert werden.

## Datenmodell

Das bereits vorhandene Objektfeld `flags.locked` wird verwendet. Neue Objekte besitzen bereits `flags.locked: false`; WD-14B führt kein paralleles Sperrmodell ein.

Fehlendes `flags.locked` gilt kompatibel als entsperrt.

## Objektbaum

Jede normale Objektzeile erhält einen Sperrschalter:

- `🔓` = entsperrt
- `🔒` = gesperrt

Der Schalter verändert nicht die Auswahl. Ein gesperrtes Objekt bleibt im Baum auswählbar und kann dort wieder entsperrt werden.

## Bearbeitungsregel

Bei gesperrtem Objekt werden insbesondere blockiert:

- Move / Rotate / Scale im Viewport;
- Transformwerte im Inspector;
- Name, Pivot und primitive Geometrie;
- Reparenting;
- Löschen;
- Gruppieren/Baugruppe bilden mit gesperrten ausgewählten Objekten;
- Auflösen eines gesperrten Containers;
- Bearbeitung und Löschen von Elementen einer gesperrten Skizze;
- nachträgliche Extrusionsparameter einer gesperrten `feature.extrude`-Operation.

Auswahl und Fokus bleiben möglich. Sichtbarkeit bleibt unabhängig von der Sperre bedienbar.

## Runtime / Inspector

Bei Auswahl eines gesperrten Objekts wird der 3D-Transform-Gizmo nicht angehängt. Die Inspector-Felder bleiben sichtbar, sind aber für die gesperrte Auswahl deaktiviert.

Beim Entsperren werden Transform-Gizmo und Transform-Toolbar wieder vollständig freigegeben. Der während der Geräteabnahme gefundene WD-14B-Regressionsfehler, bei dem Move/Rotate/Scale nach dem Entsperren deaktiviert blieben, wurde mit Commit `504347ae1f36dbaf3c69648b0866f758c93d3de5` behoben.

## History / Persistenz

Jede Sperrumschaltung erzeugt genau einen History-Eintrag:

- `Objekt sperren`
- `Objekt entsperren`

Da `flags.locked` im bestehenden SceneGraph gespeichert wird, bleiben Sperrzustände über Save/Load erhalten.

## Geräteabnahme

**Datum:** 2026-08-29  
**Gerät:** iPad / Safari / GitHub Pages  
**Ergebnis:** PASS

Praktisch bestätigt:

- Objekt sperren und entsperren;
- gesperrtes Objekt kann nicht verschoben, gedreht oder skaliert werden;
- Transform-Gizmo verschwindet bei gesperrtem Objekt;
- nach Entsperren sind Verschieben, Drehen und Skalieren wieder vollständig verfügbar;
- Save/Load erhält den Sperrzustand;
- Undo/Redo für Sperren/Entsperren funktioniert.

Keine offene Regression aus WD-14B in diesem Abnahmepfad.

## Nicht Bestandteil

- rekursive Parent-Sperrvererbung;
- Layer-Sperren;
- Rollen/Rechteverwaltung;
- Feature Suppress/Unsuppress;
- globale Lock-All/Unlock-All-Kommandos.

## Abschluss

**WD-14B = PASS / FROZEN.**

`CM3D-F012` – Sperren/Entsperren ist damit für den aktuellen V1-Kern abgeschlossen. Weitere Änderungen an WD-14B erfolgen nur über einen ausdrücklich neuen Folgeblock oder einen klar dokumentierten Regression-Fix.
