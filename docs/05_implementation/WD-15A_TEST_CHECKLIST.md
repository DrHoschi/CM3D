# WD-15A – Geräte-Testcheckliste

**Zielplattform:** iPad / Safari / GitHub Pages  
**Status vor Test:** IMPLEMENTED / DEVICE TEST REQUIRED

## A – Speichern unter als Datei

1. Vorhandenes Projekt laden oder neues Projekt mit mindestens zwei Objekten erstellen.
2. Optional einmal normal `Speichern` verwenden und merken: dieser Stand liegt im lokalen Projekt-Dropdown.
3. `Datei → Speichern unter…` wählen.
4. Einen eindeutigen Dateinamen vergeben, z. B. `WD15A-Test`.
5. Prüfen: Safari/iPad bietet die erzeugte Projektdatei als Download/Datei an; Dateiname endet auf `.cm3d.json`.
6. Prüfen: durch `Speichern unter…` erscheint **kein zusätzlicher** Projektstand im lokalen Projekt-Dropdown.
7. Projekt nach dem Download verändern und erneut `Speichern unter…` unter einem anderen Dateinamen ausgeben.
8. Eine heruntergeladene `.cm3d.json` über den vorhandenen Projektdatei-Import wieder öffnen.
9. Prüfen: Inhalt, Objektstruktur und Projektzustand entsprechen dem Zeitpunkt dieser gespeicherten Datei.
10. `Speichern unter…` öffnen und abbrechen → keine Datei und kein lokaler Speicherstand darf erzeugt werden.
11. Einen Namen mit bereits angehängtem `.cm3d.json` verwenden → Endung darf nicht doppelt erscheinen.

## B – Projekt schließen

1. Ein Projekt mit sichtbaren Objekten aktiv haben.
2. `Datei → Projekt schließen` wählen und die Rückfrage abbrechen.
3. Prüfen: aktuelles Projekt bleibt vollständig erhalten und aktiv.
4. `Projekt schließen` erneut wählen und bestätigen.
5. Prüfen: Objektbaum ist leer, Auswahl ist leer, Undo/Redo sind zurückgesetzt.
6. Prüfen: zuvor lokal gespeicherte Projekte stehen weiterhin im Projekt-Dropdown.
7. Einen vorherigen gespeicherten Projektstand oder eine gespeicherte Projektdatei erneut laden/importieren.
8. Prüfen: Inhalt ist vollständig wieder vorhanden.

## C – Regression

1. Normales `Speichern` und `Laden` über Browser-Storage funktioniert weiterhin.
2. `CM3D-Projektdatei exportieren` funktioniert weiterhin und verwendet dasselbe `.cm3d.json`-Format.
3. Projektdatei-Import funktioniert weiterhin.
4. Undo/Redo innerhalb eines aktiven Projekts funktioniert weiterhin.
5. Sichtbarkeit aus WD-14A funktioniert weiterhin.
6. Sperren/Entsperren aus WD-14B funktioniert weiterhin.

## PASS-Kriterium

Alle Punkte ohne Datenverlust oder Regression bestanden. Erst danach wird WD-15A als **PASS / FROZEN** dokumentiert.
