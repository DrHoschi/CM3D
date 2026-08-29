# WD-14B – Sperren/Entsperren Core

**Status:** IMPLEMENTED / DEVICE TEST REQUIRED  
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

## History / Persistenz

Jede Sperrumschaltung erzeugt genau einen History-Eintrag:

- `Objekt sperren`
- `Objekt entsperren`

Da `flags.locked` im bestehenden SceneGraph gespeichert wird, bleiben Sperrzustände über Save/Load erhalten.

## Nicht Bestandteil

- rekursive Parent-Sperrvererbung;
- Layer-Sperren;
- Rollen/Rechteverwaltung;
- Feature Suppress/Unsuppress;
- globale Lock-All/Unlock-All-Kommandos.

## Abnahme

Vor PASS / FROZEN ist der praktische iPad-/Safari-Test nach `WD-14B_TEST_CHECKLIST.md` erforderlich.

**Aktueller Status: IMPLEMENTED / DEVICE TEST REQUIRED.**
