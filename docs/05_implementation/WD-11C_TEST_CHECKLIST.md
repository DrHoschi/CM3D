# WD-11C – Gerätetest

**Status:** TEST PENDING  
**Zielgerät:** iPad/iPhone Safari  
**Branch:** `feature/wd-11c-selection-partial-project-merge`

## A – Regression WD-11B

- [ ] GLB importieren funktioniert weiterhin.
- [ ] GLTF importieren funktioniert weiterhin.
- [ ] Ganze Szene als GLB exportieren funktioniert weiterhin.
- [ ] Fit / Fokus funktioniert weiterhin.

## B – Auswahl als GLB / GLTF exportieren

1. Zwei deutlich unterschiedliche 3D-Objekte anlegen.
2. Nur eines auswählen.
3. `DATEI → Auswahl als GLB / GLTF …` öffnen.
4. GLB exportieren.
5. Neues Projekt erstellen und exportierte GLB wieder importieren.

Erwartung:

- [ ] Exportblock zeigt `Auswahl + Unterobjekte`.
- [ ] Nur die gewählte Geometrie ist im Export enthalten.
- [ ] Nicht ausgewählte Objekte fehlen.
- [ ] Weltlage eines ausgewählten Unterobjekts bleibt erhalten, auch wenn sein Parent nicht mitexportiert wird.
- [ ] Gleicher Test mit GLTF funktioniert ebenfalls.

## C – Auswahl als CM3D-Teilprojekt exportieren

1. Eine Gruppe/Baugruppe mit mindestens zwei Unterobjekten erzeugen.
2. Optional Material/Farbe ändern.
3. Gruppe/Baugruppe auswählen.
4. `DATEI → Auswahl als Teilprojekt exportieren …` wählen.

Erwartung:

- [ ] Temporärer Inspector zeigt `Auswahl + Unterobjekte`.
- [ ] Dateiname ist editierbar.
- [ ] Datei wird als `.cm3d-part.json` gespeichert.
- [ ] Unterobjekte werden automatisch mitgeführt.
- [ ] Benötigte Materialien werden mitgeführt.

## D – Teilprojekt in dasselbe Projekt dazuladen

Ohne das Ursprungsprojekt zu schließen:

1. `DATEI → CM3D-Objekte dazuladen …` wählen.
2. Gerade exportierte `.cm3d-part.json` auswählen.

Erwartung:

- [ ] Bestehende Objekte bleiben unverändert erhalten.
- [ ] Eine zweite Kopie des exportierten Unterbaums erscheint.
- [ ] Neue Root-Objekte sind nach dem Merge ausgewählt.
- [ ] Es gibt keine ID-Kollision.
- [ ] Parent-/Child-Struktur der importierten Objekte bleibt erhalten.
- [ ] Lage/Rotation/Skalierung bleiben korrekt.
- [ ] Materialien bleiben korrekt zugeordnet.

## E – Undo / Redo des Merge

Direkt nach D:

- [ ] Einmal Undo entfernt den kompletten dazugeladenen Block.
- [ ] Einmal Redo stellt den kompletten Block wieder her.

## F – GLB/GLTF-Asset im Teilprojekt

1. Ein GLB oder GLTF importieren.
2. Dieses Importobjekt als CM3D-Teilprojekt exportieren.
3. Teilprojekt in ein neues oder bestehendes Projekt dazuladen.

Erwartung:

- [ ] Importobjekt erscheint im Objektbaum.
- [ ] 3D-Geometrie erscheint wieder im Viewport.
- [ ] Eingebettetes Asset ist im Teilprojekt vollständig mitgeführt.
- [ ] Transform bleibt erhalten.

## G – Vollständige `.cm3d.json` als Objekte dazuladen

1. Ein normales Projekt über `CM3D-Projektdatei exportieren` speichern.
2. Ein anderes Projekt öffnen bzw. neue Objekte anlegen.
3. `CM3D-Objekte dazuladen …` verwenden und die normale `.cm3d.json` auswählen.

Erwartung:

- [ ] Aktuelles Projekt wird nicht ersetzt.
- [ ] Vorhandene Objekte bleiben erhalten.
- [ ] Objekte aus der ausgewählten Projektdatei kommen zusätzlich dazu.
- [ ] IDs, Materialien und Assets kollidieren nicht.

## H – Trennung Projekt öffnen vs. Dazuladen

- [ ] `CM3D-Projektdatei importieren` verhält sich weiterhin wie WD-11A und ersetzt das Projekt.
- [ ] `CM3D-Objekte dazuladen` ersetzt das Projekt niemals.

## I – Negativtest

- [ ] Ungültige JSON-Datei wird abgelehnt.
- [ ] Datei mit ungültigem CM3D-Format wird abgelehnt.
- [ ] Bei einem Fehler bleibt der aktuelle Projektstand unverändert.

## Abnahmeregel

WD-11C wird erst nach bestandenem Gerätetest auf **PASS / FROZEN** gesetzt.
