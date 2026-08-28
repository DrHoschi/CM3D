# WD-11 – Export / Import modern

## WD-11A – echte CM3D-Projektdatei Export / Import

**Status:** PASS / FROZEN  
**Branch:** `feature/wd-11a-project-file-import-export`  
**Basis:** `main` @ `d4760c5a786ac0ebd626c1c88597f237b97e70ae`  
**Gerätetest:** PASS am 2026-08-28 (iPad/iPhone Safari)

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

### Semantik des Projektimports

`Datei importieren` ist in WD-11A bewusst ein vollständiges **Projekt öffnen/ersetzen**. Ein bereits geöffnetes Projekt wird nach erfolgreicher Validierung durch den Inhalt der ausgewählten `.cm3d.json`-Datei ersetzt.

Das **Dazuladen/Mergen einzelner Objekte oder Teilprojekte** ist nicht Bestandteil von WD-11A. Diese Funktion muss später separat spezifiziert werden, damit ID-Kollisionen, Parent-Beziehungen, Materialien, Referenzen und Auswahl-Export kontrolliert behandelt werden können.

### Persistierte Projektinhalte

Da die Datei das zentrale CM3D-Projektmodell unverändert serialisiert, umfasst sie insbesondere Projektmetadaten/Projektname, Settings/Einheiten, SceneGraph und Parent-Beziehungen, Transform/Pivot, Sketch-Daten und Profile, persistente Extrude-Objektdaten, Materialdefinitionen und Materialzuweisungen sowie Assets/Extensions des aktuellen Schemas.

### Funktionsbezug

- CM3D-F079 Export JSON/Projektdatei – V1: Bestandteil WD-11A.
- CM3D-F072 Import GLB/GLTF – V1: nicht Bestandteil WD-11A; folgt separat in WD-11B.
- CM3D-F075 Export GLB/GLTF – V1: nicht Bestandteil WD-11A; folgt separat in WD-11B.
- CM3D-F077 Export Auswahl – V1: nicht Bestandteil WD-11A; wird nicht vorgezogen.
- Objekt-/Teilprojekt-Import als Merge: nicht Bestandteil WD-11A; separat zu spezifizieren.

### Gerätetest – Ergebnis

1. Projektdatei exportiert und über Dateien/iCloud gespeichert: PASS.
2. Exportierte Projektdatei wieder importiert: PASS.
3. Wiederhergestellter Projektstand optisch/funktional identisch: PASS.
4. Bestehendes localStorage-Speichern/Laden erneut geprüft: PASS.
5. Projektimport ersetzt den aktuellen Projektinhalt vollständig: erwartetes WD-11A-Verhalten.

WD-11A ist damit verbindlich **PASS / FROZEN** und darf nach `main` gemergt werden.
