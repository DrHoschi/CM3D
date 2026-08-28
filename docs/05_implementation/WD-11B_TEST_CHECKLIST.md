# WD-11B – GLB/GLTF Import & Export – Gerätetest

**Status:** TEST PENDING  
**Zielgeräte:** iPad/iPhone Safari  
**Branch:** `feature/wd-11b-glb-gltf-import-export`

## Testdatei

Verbindliches Minimalmodell:

`test-assets/wd-11b/cm3d-test-triangle.gltf`

Die Datei ist vollständig eingebettet und benötigt keine zusätzliche BIN-/Texturdatei.

## A – Regression UI / WD-11A

- [ ] Oberfläche entspricht weiterhin UI V0.2: Hauptmenü + Kontextleiste + Objektbaum + Inspector.
- [ ] Neues Projekt funktioniert.
- [ ] Würfel anlegen funktioniert.
- [ ] CM3D-Projektdatei exportieren funktioniert weiterhin.
- [ ] CM3D-Projektdatei importieren ersetzt weiterhin das komplette Projekt.

## B – GLTF Import

1. Neues Projekt öffnen.
2. `DATEI → GLB / GLTF importieren` wählen.
3. `cm3d-test-triangle.gltf` auswählen.

Erwartung:

- [ ] Import wird ohne Fehler angenommen.
- [ ] Im Objektbaum erscheint ein neues Objekt `cm3d-test-triangle`.
- [ ] Das Testdreieck erscheint im Viewport.
- [ ] Auswahl im Viewport wählt das Importobjekt im Objektbaum.
- [ ] Move funktioniert.
- [ ] Rotate funktioniert.
- [ ] Scale funktioniert.
- [ ] Undo macht die letzte Änderung korrekt rückgängig.
- [ ] Redo stellt sie wieder her.
- [ ] Duplizieren erzeugt eine zweite sichtbare Instanz als eigenes CM3D-Objekt.
- [ ] Löschen entfernt die gewählte Instanz.

## C – Persistenz des importierten Modells

- [ ] Nach GLTF-Import CM3D-Projektdatei exportieren.
- [ ] Neues Projekt erstellen.
- [ ] Die eben gespeicherte `.cm3d.json` wieder importieren.
- [ ] Importiertes GLTF-Modell erscheint wieder im Objektbaum.
- [ ] Importiertes GLTF-Modell erscheint wieder korrekt im Viewport.
- [ ] Transform des Importobjekts wurde erhalten.

Hinweis: localStorage zusätzlich mit einem kleinen Testasset prüfen. Große eingebettete 3D-Assets können die Browserquote überschreiten und sind deshalb kein belastbarer Großasset-Speicher.

## D – GLB Export ganze Szene

1. Testdreieck plus einen normalen CM3D-Würfel in der Szene behalten.
2. `DATEI → Ganze Szene als GLB / GLTF …` wählen.
3. Im Inspector Format `GLB` wählen.
4. Dateiname prüfen/ändern.
5. Exportieren.

Erwartung:

- [ ] Exportblock erscheint im Inspector und nicht als neue permanente Buttonleiste.
- [ ] Scope zeigt `Ganze Szene`.
- [ ] GLB-Datei wird über Safari/Dateien gespeichert.
- [ ] Keine Skizzenebene oder Editorhilfe wird als Modellinhalt exportiert.

## E – GLB Roundtrip

- [ ] Neues Projekt erstellen.
- [ ] Die gerade aus CM3D exportierte `.glb` wieder über `GLB / GLTF importieren` laden.
- [ ] Exportierte Geometrie erscheint im Viewport.
- [ ] Das Roundtrip-Modell erscheint als ein Importobjekt im Objektbaum.
- [ ] Move/Rotate/Scale funktionieren darauf.

## F – GLTF Export ganze Szene

- [ ] Gleiche Szene als `GLTF` exportieren.
- [ ] `.gltf`-Datei wird gespeichert.
- [ ] Die exportierte `.gltf` lässt sich wieder in CM3D importieren.

## G – Negativtests

- [ ] Eine beliebige Nicht-GLB/GLTF-Datei wird nicht als Modell importiert.
- [ ] Ungültiges GLTF verändert das bestehende Projekt nicht.
- [ ] Bei einem extern referenzierenden `.gltf` ohne benötigte `.bin`/Texturen erscheint eine verständliche Fehlermeldung.
- [ ] Ein fehlgeschlagener Import löscht oder ersetzt kein vorhandenes CM3D-Objekt.

## H – Scope-Grenzen sichtbar

- [ ] `Auswahl / Teilprojekt` ist noch nicht ausführbar.
- [ ] Es gibt keine versteckte Merge-Funktion für `.cm3d.json`.
- [ ] Projektdatei-Import bleibt `Projekt ersetzen`.
- [ ] GLB/GLTF-Import bleibt `externes Modell zum aktuellen Projekt hinzufügen`.

## Abnahmeregel

Erst wenn A–H auf dem Zielgerät ohne Blocker erfüllt sind, darf WD-11B auf **PASS / FROZEN** gesetzt werden.
