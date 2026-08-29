# WD-11C – Auswahl / Teilprojekt Export + CM3D-Objekte dazuladen/mergen

**Status:** IMPLEMENTED / DEVICE TEST PENDING  
**Branch:** `feature/wd-11c-selection-partial-project-merge`  
**Basis:** `feature/wd-11b-glb-gltf-import-export` (WD-11B Gerätetest PASS)  
**Funktionsbezug:** CM3D-F077 + Teilprojekt-/Objekt-Merge

## Ziel

WD-11C verbindet zwei fachlich zusammengehörende Arbeitsabläufe:

1. eine ausgewählte Objektmenge gezielt exportieren;
2. CM3D-Objekte in ein bereits geöffnetes Projekt dazuladen, ohne das Projekt zu ersetzen.

Damit bleibt die in WD-11A eingeführte Trennung ausdrücklich erhalten:

- `CM3D-Projektdatei importieren` = Projekt öffnen/ersetzen;
- `CM3D-Objekte dazuladen` = Inhalte in das bestehende Projekt mergen.

## 1 – Auswahl als GLB / GLTF exportieren

Unter `DATEI → 3D-Modell exportieren` steht neben dem Export der ganzen Szene nun zusätzlich zur Verfügung:

- `Auswahl als GLB / GLTF …`

Der bestehende temporäre Exportblock im Inspector wird weiterverwendet. Er zeigt als Scope `Auswahl + Unterobjekte` und erlaubt Format sowie Dateiname.

Exportiert werden die ausgewählten Root-Objekte samt ihren Unterobjekten. Wenn ein ausgewähltes Objekt innerhalb einer nicht ausgewählten Gruppe/Baugruppe liegt, wird seine Weltlage beim Export erhalten. Skizzen und Editorhilfen bleiben weiterhin aus GLB/GLTF ausgeschlossen.

## 2 – CM3D-Teilprojekt

Neue Dateiform:

- Formatkennung: `CM3D_PARTIAL`
- Schema: `0.1.0`
- Dateiendung: `.cm3d-part.json`

`Auswahl als Teilprojekt exportieren …` erzeugt ein selbstständiges Paket aus:

- ausgewählten Objekten;
- vollständigen Unterbäumen;
- benötigten nativen CM3D-Materialien;
- benötigten eingebetteten GLB/GLTF-Assets;
- Quellprojekt-Metadaten.

Ausgewählte Objekte, deren ursprünglicher Parent nicht mitexportiert wird, werden zu Root-Objekten des Pakets und erhalten ihre bisherige Welttransformation. Dadurch verändert sich ihre räumliche Lage beim späteren Dazuladen nicht.

Extrude-Objekte behalten ihr eingebettetes Profil. Liegt die ursprüngliche Quellskizze außerhalb der exportierten Auswahl, wird die externe `sourceSketchId`-Referenz im Teilpaket bewusst gelöst, damit kein verwaister Projektverweis entsteht.

## 3 – CM3D-Objekte dazuladen

Unter `DATEI → CM3D-Objekte / Teilprojekt` steht zur Verfügung:

- `CM3D-Objekte dazuladen …`

Der Befehl akzeptiert bewusst zwei Quellen:

1. `.cm3d-part.json` – zuvor exportiertes Teilprojekt;
2. normale `.cm3d.json` – vollständiges CM3D-Projekt, dessen Objekte in das aktuelle Projekt übernommen werden.

Der normale WD-11A-Projektimport bleibt davon getrennt und ersetzt weiterhin das geöffnete Projekt.

## 4 – Kollisionsfreie ID-Neuvergabe

Vor dem Merge wird das Quellpaket vollständig validiert. Anschließend werden neue IDs vergeben für:

- alle importierten Objekte;
- alle mitgeführten Materialien;
- alle mitgeführten Assets.

Interne Referenzen werden auf die neuen IDs umgebogen. Dadurch kann ein Teilprojekt sogar wieder in sein eigenes Ursprungsprojekt geladen werden, ohne dass bestehende IDs überschrieben werden.

Nach dem Aufbau wird das komplette resultierende CM3D-Projekt nochmals mit `validateProject()` geprüft. Schlägt diese Prüfung fehl, wird der vorherige Projektstand wiederhergestellt und der Merge nicht übernommen.

## 5 – Undo / Redo

Ein kompletter `CM3D-Objekte dazuladen`-Vorgang wird als **ein** Historieneintrag behandelt.

- Undo entfernt den gesamten Merge in einem Schritt.
- Redo stellt ihn wieder her.

Nach erfolgreichem Merge werden die neu eingefügten Root-Objekte ausgewählt.

## 6 – UI-Einordnung V0.2

Die bestehende UI-Struktur bleibt erhalten:

- Hauptmenü `Datei` wählt Import-/Exportaktion;
- Objektbaum bestimmt die aktuelle Auswahl;
- Exportparameter erscheinen temporär im rechten Inspector;
- keine neue permanente Werkzeugleiste.

Der iOS/Safari-Dateidialog für `Objekte dazuladen` verwendet wie der korrigierte GLB/GLTF-Import keinen restriktiven `accept`-Filter. Die Formatprüfung erfolgt nach Auswahl innerhalb von CM3D.

## Nicht Bestandteil von WD-11C

- intelligentes Zusammenführen identischer Materialien statt bewusster Neu-ID;
- Asset-Deduplizierung nach Inhalts-Hash;
- interaktive Konfliktauflösung;
- Auswahl einzelner Untermeshes innerhalb eines importierten GLB/GLTF-Objekts;
- OBJ/STL;
- Bibliotheksverwaltung.

## Abnahme

WD-11C bleibt bis zum Gerätetest **IMPLEMENTED / DEVICE TEST PENDING**.

Die Prüfliste liegt in `WD-11C_TEST_CHECKLIST.md`.
