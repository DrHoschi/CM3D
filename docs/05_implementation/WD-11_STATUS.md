# WD-11 – Export / Import modern

## WD-11A – echte CM3D-Projektdatei Export / Import

**Status:** IMPLEMENTED / DEVICE TEST PENDING  
**Branch:** `feature/wd-11a-project-file-import-export`  
**Basis:** `main` @ `d4760c5a786ac0ebd626c1c88597f237b97e70ae`

### Scope

WD-11A implementiert ausschließlich die native CM3D-Projektdatei. GLB/GLTF und weitere Modellierungsfunktionen sind ausdrücklich nicht Bestandteil dieses Unterblocks.

### Umsetzung

- Export des vollständigen aktuellen Projektmodells als lesbare JSON-Datei mit Dateiendung `.cm3d.json`.
- Dateiname wird aus dem Projektnamen abgeleitet.
- Browser-Download erlaubt auf iPad/iPhone Safari die Übergabe an die Dateien-/iCloud-Oberfläche.
- Import erfolgt über den nativen Dateiauswahldialog.
- Datei wird zuerst vollständig als Text gelesen und geparst.
- Danach wird der Kandidat mit der bestehenden zentralen `validateProject()`-Validierung geprüft.
- `store.replaceProject()` wird ausschließlich nach erfolgreichem Parse + erfolgreicher Validierung aufgerufen.
- Ungültiges JSON, falsches CM3D-Format, falsche Schema-Version oder ungültige Referenzen ersetzen das laufende Projekt nicht.
- Bestehendes localStorage-Speichern/Laden bleibt unverändert als Komfortspeicher bestehen.
- Undo/Redo-Historie ist kein Bestandteil der Projektdatei; nach erfolgreichem Projektwechsel greift das bestehende `replaceProject()`-Verhalten.

### Persistierte Projektinhalte

Da die Datei das zentrale CM3D-Projektmodell unverändert serialisiert, umfasst sie insbesondere Projektmetadaten/Projektname, Settings/Einheiten, SceneGraph und Parent-Beziehungen, Transform/Pivot, Sketch-Daten und Profile, persistente Extrude-Objektdaten, Materialdefinitionen und Materialzuweisungen sowie Assets/Extensions des aktuellen Schemas.

### Funktionsbezug

- CM3D-F079 Export JSON/Projektdatei – V1: Bestandteil WD-11A.
- CM3D-F072 Import GLB/GLTF – V1: nicht Bestandteil WD-11A; folgt separat in WD-11B.
- CM3D-F075 Export GLB/GLTF – V1: nicht Bestandteil WD-11A; folgt separat in WD-11B.
- CM3D-F077 Export Auswahl – V1: nicht Bestandteil WD-11A; wird nicht vorgezogen.

### PASS-Kriterien für Gerätetest

1. Auf iPad/Safari ein Projekt mit Skizze, Extrude-Körper, verändertem Transform, Einheit und Material/Base Color vorbereiten.
2. `Datei exportieren` wählen und die Datei in Dateien/iCloud sichern. Erwartung: Dateiname endet auf `.cm3d.json`.
3. Das laufende Projekt sichtbar verändern oder ein neues Projekt erzeugen.
4. `Datei importieren` wählen und die zuvor gesicherte Datei auswählen.
5. Prüfen: Projektinhalt, SceneGraph, Transform, Skizze, Extrude-Geometrie, Material/Base Color und Einheit entsprechen dem exportierten Stand.
6. Safari neu laden und die Datei erneut importieren. Erwartung: Import funktioniert unabhängig davon, ob dieser Stand zuvor in localStorage gespeichert wurde.
7. Negativtest: Eine fremde/ungültige `.json`-Datei auswählen. Erwartung: verständliche Fehlermeldung; das aktuell geöffnete Projekt bleibt vollständig unverändert.
8. Bestehendes `Speichern`/`Laden` über localStorage kurz gegenprüfen. Erwartung: unverändert funktionsfähig.

WD-11A darf erst nach ausdrücklichem Geräte-`PASS` auf `PASS / FROZEN` gesetzt und nach `main` gemergt werden.
