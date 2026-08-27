# WD-03 – Bedienkern & Projektverwaltung

**Stand:** 2026-08-27  
**Status:** PASS / FROZEN  
**Voraussetzung:** WD-02 / P0.1 – PASS / FROZEN

## Scope

WD-03 erweitert ausschließlich den Bedienkern des bestehenden speicherfesten WD-02-Prototyps:

1. Undo/Redo
2. Objekt löschen
3. Objekt duplizieren
4. Move / Rotate / Scale als Transform-Werkzeuge
5. mehrere lokale gespeicherte Projekte

## Implementiert

### Undo / Redo

- Runtime-History mit `undoStack` und `redoStack`
- maximal 100 Einträge
- fachliche Projektzustände, keine Three.js-/DOM-Snapshots
- Würfel erzeugen, Umbenennen, Inspector-Transform, Gizmo-Transform, Duplizieren und Löschen sind rückgängig/wiederholbar
- ein durchgehender Gizmo-Drag wird als ein History-Schritt abgeschlossen
- History wird weiterhin nicht in der Projektdatei persistiert

### Löschen / Duplizieren

- aktives Objekt kann gelöscht werden
- Duplizieren erzeugt eine neue stabile `objectId`
- Materialreferenzen und übrige fachliche Objektdaten werden übernommen
- Kopie wird leicht versetzt und sofort ausgewählt
- beide Vorgänge sind Undo/Redo-fähig

### Transform-Werkzeuge

- Move → Three.js `translate`
- Rotate → Three.js `rotate`
- Scale → Three.js `scale`
- aktiver Modus ist zentraler Runtime-State im AppStore
- Wechsel des Werkzeugmodus verändert das persistierte Datenformat nicht

### Mehrprojekt-Verwaltung

Der einzelne WD-02-Speicherplatz wurde durch einen lokalen Projektindex ersetzt.

- jeder Speicherstand wird unter seiner stabilen `projectId` abgelegt
- Projekt-Dropdown listet vorhandene Speicherstände
- Speichern aktualisiert genau den Speicherstand derselben `projectId`
- neues Projekt erhält eine neue `projectId` und kann zusätzlich gespeichert werden
- ausgewählter Speicherstand kann geladen oder gelöscht werden
- Projektinhalt verwendet unverändert das CM3D-Schema `0.1.0`

## Manueller Abnahmetest

1. Projekt A anlegen, zwei Würfel erzeugen und speichern.
2. Neues Projekt B anlegen, einen Würfel erzeugen und separat speichern.
3. Im Projekt-Dropdown zwischen A und B wechseln und jeweils laden.
4. Prüfen, dass beide Projektinhalte unabhängig erhalten bleiben.
5. Objekt auswählen → Duplizieren → Undo → Redo.
6. Objekt löschen → Undo → Redo.
7. Move auswählen und Objekt verschieben → Undo/Redo.
8. Rotate auswählen und Objekt drehen → Undo/Redo.
9. Scale auswählen und Objekt skalieren → Undo/Redo.
10. Bei jedem Gizmo-Drag prüfen: genau ein Undo-Schritt pro abgeschlossener Bewegung.
11. Projekt speichern → Browser neu laden → Projekt erneut aus Liste laden.
12. Prüfen: Projektinhalt bleibt korrekt; Undo-History startet nach Reload bewusst leer.
13. Einen gespeicherten Teststand über `Speicher löschen` entfernen und prüfen, dass der andere gespeichert bleibt.

## Gerätetest 2026-08-27

**Plattform:** iPhone / Safari / GitHub Pages  
**Ergebnis:** PASS

Im realen Browserbetrieb wurden die WD-03-Funktionen vollständig durchgetestet und mit Screenshots dokumentiert. Geprüft wurden insbesondere:

- mehrere unabhängige gespeicherte Projekte im Projekt-Dropdown
- Laden unterschiedlicher Projektstände
- Löschen einzelner gespeicherter Projektstände
- Duplizieren und Löschen von SceneObjects
- Undo und Redo nach Objektoperationen
- Move-, Rotate- und Scale-Werkzeug im Viewport
- Bearbeitung unterschiedlicher Objektgrößen und Transformzustände
- Wiederherstellung gespeicherter Projekte nach Browser-Neuladen
- praktischer Einsatz des Prototyps zum Vorbereiten einfacher 3D-Assetformen

Es wurden im Abnahmetest keine WD-03-Blocker festgestellt.

## Nicht-Scope

- persistente Undo-History
- komplexe Parent-/Child-Hierarchiebearbeitung
- Mehrfachauswahl
- Dateien außerhalb des Browsers / Cloud-Speicher
- Autosave / Recovery
- vollständige responsive UI-Überarbeitung
- vollständiges Iconset
- weitere Primitive oder Modellierungswerkzeuge

## Exit-Regel

Die Exit-Regel ist erfüllt. WD-03 ist nach erfolgreichem manuellem Gerätetest als **PASS / FROZEN** freigegeben und darf nach `main` übernommen werden.
