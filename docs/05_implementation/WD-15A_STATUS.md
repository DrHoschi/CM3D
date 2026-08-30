# WD-15A – Speichern unter & Projekt schließen

**Stand:** 2026-08-29  
**Status:** PASS / FROZEN  
**Branch:** `feature/wd-15a-project-lifecycle`  
**Basis:** WD-14B PASS / FROZEN (`e8fe400cdc1f5e1e69daa8628b18613e1d6a7ea6`)  
**Funktionen:** `CM3D-F005` – Speichern unter; `CM3D-F007` – Projekt schließen

## Ziel

WD-15A ergänzt den bestehenden Projekt-Lifecycle um ein echtes dateibasiertes `Speichern unter…` sowie ein kontrolliertes `Projekt schließen`.

Das normale `Speichern` bleibt bewusst der schnelle lokale Browser-Speicher über `localStorage`. `Speichern unter…` ist davon getrennt und schreibt die vollständige CM3D-Projektdatei auf das Gerät bzw. stellt sie dem Browser als Datei-Download bereit. Damit ist der Pfad auch für Projekte geeignet, die langfristig nicht im Browser-Speicher gehalten werden sollen.

## Speichern unter

`Speichern unter…` liegt im bestehenden Datei-Menü direkt beim normalen Speichern.

Ablauf:

1. Benutzer wählt `Datei → Speichern unter…`;
2. ein Dateiname kann frei angegeben werden;
3. die vollständige aktuelle Projektstruktur wird validiert und als `.cm3d.json` serialisiert;
4. die Datei wird über den bestehenden Projektdatei-Download auf das Gerät ausgegeben;
5. die bestehende `projectId` bleibt unverändert;
6. es wird kein zusätzlicher `localStorage`-Projektstand erzeugt.

Die Dateiendung `.cm3d.json` wird automatisch ergänzt. Ein bereits eingegebener Suffix `.cm3d.json` wird nicht doppelt angehängt.

Der vorhandene Projektdatei-Export und `Speichern unter…` verwenden denselben technischen Serialisierungs-/Downloadpfad. Damit existieren keine zwei konkurrierenden Dateiformate.

## Normales Speichern

Unverändert:

- `Speichern` schreibt den aktuellen Projektstand unter seiner bestehenden `projectId` in den lokalen Browser-Speicher;
- dieser Pfad ist für schnellen Arbeits-/Testbetrieb gedacht;
- `Speichern unter…` ersetzt diesen lokalen Pfad nicht.

## Projekt schließen

`Projekt schließen` liegt ebenfalls im Datei-Menü.

Vor dem Schließen erscheint eine Bestätigung mit Hinweis auf mögliche ungespeicherte Änderungen. Bei Abbruch bleibt das aktuelle Projekt unverändert aktiv.

Nach Bestätigung:

- wird der aktuelle Arbeitskontext beendet;
- Auswahl sowie Undo/Redo werden über den bestehenden `newProject()`-Pfad zurückgesetzt;
- ein frischer leerer Arbeitsbereich wird bereitgestellt;
- kein gespeicherter lokaler Projektstand und keine heruntergeladene Datei wird gelöscht;
- vorhandene gespeicherte Projekte bleiben im Projekt-Dropdown verfügbar.

## Geräteabnahme

**Datum:** 2026-08-29  
**Gerät/Umgebung:** iPad / Safari / GitHub Pages  
**Ergebnis:** PASS

Praktisch bestätigt wurde insbesondere das korrigierte dateibasierte `Speichern unter…`: die CM3D-Projektdatei wird auf dem Gerät ausgegeben und der lokale Browser-Speicher bleibt davon getrennt. Der Benutzer bestätigte nach dem Gerätetest, dass der korrigierte Ablauf sauber funktioniert.

Die während der Abnahme erkannte Fehlinterpretation der ersten WD-15A-Fassung – `Speichern unter…` als zusätzliche `localStorage`-Projektkopie – wurde vor der Freigabe entfernt. Verbindlich ist ausschließlich die dateibasierte Bedeutung.

## Kompatibilität

Unverändert bleiben:

- normales lokales `Speichern` und Laden;
- Löschen gespeicherter Browser-Stände;
- Projektdatei-Import;
- bestehender Projektdatei-Export;
- Schema `0.1.0`;
- WD-14A Sichtbarkeit und WD-14B Sperren.

## Nicht Bestandteil

- Projekt-Einstellungen – folgt in WD-15B;
- Dirty-State-/Änderungsstern;
- Autosave/Recovery;
- Cloud-Speicherung;
- direkter nativer Dateisystemzugriff auf allen Browsern; die konkrete Zielauswahl wird vom jeweiligen Browser/Betriebssystem bestimmt;
- GLB/GLTF-Hierarchie in eigenständige CM3D-Objekte auflösen. Dieser Ausbaupunkt ist vorgemerkt und wird nicht in WD-15A nachgezogen.

## Freeze

WD-15A ist nach bestandenem realem iPad-/Safari-Gerätetest **PASS / FROZEN**.

Neue Funktionalität oder Änderungen an diesem Block erfolgen nur über einen nachfolgenden dokumentierten Entwicklungsblock. WD-15A selbst wird nicht weiter erweitert.
