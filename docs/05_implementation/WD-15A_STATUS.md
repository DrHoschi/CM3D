# WD-15A – Speichern unter & Projekt schließen

**Stand:** 2026-08-29  
**Status:** IMPLEMENTED / DEVICE TEST REQUIRED  
**Branch:** `feature/wd-15a-project-lifecycle`  
**Basis:** WD-14B PASS / FROZEN (`e8fe400cdc1f5e1e69daa8628b18613e1d6a7ea6`)  
**Funktionen:** `CM3D-F005` – Speichern unter; `CM3D-F007` – Projekt schließen

## Ziel

Der bestehende lokale Mehrprojekt-Speicher wird um einen vollständigen V1-Projekt-Lifecycle ergänzt, ohne ein zweites Persistenzmodell einzuführen.

## Speichern unter

`Speichern unter…` liegt im bestehenden Datei-Menü direkt beim normalen Speichern.

Ablauf:

1. aktuelles Projekt wird vollständig kopiert;
2. Benutzer vergibt einen Namen;
3. die Kopie erhält eine neue stabile `projectId`;
4. `createdAt` und `modifiedAt` werden für den neuen Stand neu gesetzt;
5. die Kopie wird über denselben bestehenden `saveProject()`-Pfad gespeichert;
6. erst nach erfolgreichem Speichern wird die Kopie als aktives Projekt geladen;
7. der bisherige gespeicherte Projektstand bleibt unverändert erhalten.

Objekt-, Material-, Asset- und Feature-IDs innerhalb der Projektkopie bleiben erhalten. Die Trennung der beiden Projektstände erfolgt über die neue Projekt-ID.

Wird der Dialog abgebrochen oder ist der Name leer, entsteht kein neuer Speicherstand.

## Projekt schließen

`Projekt schließen` liegt ebenfalls im Datei-Menü.

Vor dem Schließen erscheint immer eine Bestätigung mit Hinweis auf mögliche ungespeicherte Änderungen. Bei Abbruch bleibt das aktuelle Projekt unverändert aktiv.

Nach Bestätigung:

- wird der aktuelle Arbeitskontext beendet;
- Auswahl sowie Undo/Redo werden über den bestehenden `newProject()`-Pfad zurückgesetzt;
- ein frischer leerer Arbeitsbereich wird bereitgestellt;
- kein gespeicherter Projektstand wird gelöscht;
- vorhandene gespeicherte Projekte bleiben im Projekt-Dropdown verfügbar und können anschließend wieder geladen werden.

Ein eigener `null`-Projektzustand wird bewusst nicht in das bestehende Datenmodell eingeführt. Der definierte geschlossene Zustand ist ein frischer leerer Arbeitsbereich mit neuer Projekt-ID.

## Kompatibilität

Unverändert bleiben:

- normales `Speichern` unter der aktuellen `projectId`;
- Laden gespeicherter Projekte;
- Löschen gespeicherter Browser-Stände;
- CM3D-Projektdatei Import/Export;
- Schema `0.1.0`;
- WD-14A Sichtbarkeit und WD-14B Sperren.

## Nicht Bestandteil

- Projekt-Einstellungen – folgt in WD-15B;
- Dirty-State-/Änderungsstern;
- Autosave/Recovery;
- Cloud-Speicherung;
- Liste zuletzt verwendeter Projekte außerhalb des bestehenden lokalen Index.

## Abnahme

Vor PASS / FROZEN ist der praktische iPad-/Safari-Test nach `WD-15A_TEST_CHECKLIST.md` erforderlich.

**Aktueller Status: IMPLEMENTED / DEVICE TEST REQUIRED.**
