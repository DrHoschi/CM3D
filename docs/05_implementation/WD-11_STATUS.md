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
- Objekt-/Teilprojekt-Import als Merge: nicht Bestandteil von WD-11A; separat zu spezifizieren.

### Gerätetest – Ergebnis

1. Projektdatei exportiert und über Dateien/iCloud gespeichert: PASS.
2. Exportierte Projektdatei wieder importiert: PASS.
3. Wiederhergestellter Projektstand optisch/funktional identisch: PASS.
4. Bestehendes localStorage-Speichern/Laden erneut geprüft: PASS.
5. Projektimport ersetzt den aktuellen Projektinhalt vollständig: erwartetes WD-11A-Verhalten.

WD-11A ist damit verbindlich **PASS / FROZEN** und darf nach `main` gemergt werden.

---

## WD-11B – GLB/GLTF Import & Export

**Status:** IMPLEMENTED / DEVICE TEST PENDING  
**Branch:** `feature/wd-11b-glb-gltf-import-export`  
**Basis:** `docs/ui-contextual-command-surface-v0.2`  
**Funktionsbezug:** CM3D-F072 + CM3D-F075

### Scope

WD-11B ergänzt den modernen 3D-Austausch für **GLB/GLTF**. Die Funktion wird bereits in das in UI V0.2 festgelegte Bedienkonzept eingeordnet, ohne den Scope still zu erweitern.

Bestandteil:

- externes GLB/GLTF als neues Objekt in das aktuell geöffnete CM3D-Projekt importieren;
- das importierte Modell im Objektbaum als ein CM3D-Objekt führen;
- Transformieren, Gruppieren/Baugruppe, Duplizieren, Löschen sowie Undo/Redo über die vorhandenen CM3D-Mechanismen;
- importierte Asset-Daten in der CM3D-Projektdatei mitführen;
- die **ganze exportierbare 3D-Szene** als GLB oder GLTF exportieren;
- Format und Dateiname über einen temporären Exportblock im Inspector einstellen.

Nicht Bestandteil:

- Export nur der aktuellen Auswahl;
- Export einer Baugruppe als eigener Scope;
- CM3D-Objekte oder Teilprojekte dazuladen/mergen;
- ID-Kollisionsauflösung zwischen zwei CM3D-Projekten;
- OBJ/STL;
- Animationseditor oder Animationswiedergabe;
- besondere Kompressionspipelines wie Draco/KTX2 als Abnahmekriterium.

### UI-Einordnung V0.2

WD-11B verwendet die neue UI-Struktur statt die alte dauerhafte Buttonleiste:

- `DATEI → GLB / GLTF importieren`
- `DATEI → Ganze Szene als GLB / GLTF …`
- Exportparameter erscheinen temporär im rechten Inspector.
- `Auswahl / Teilprojekt` ist im Menü sichtbar als späterer eigener Block, aber in WD-11B deaktiviert.

Damit bleibt die Trennung aus V0.2 erhalten: Hauptmenü = Aktion wählen, Objektbaum = Arbeitsobjekt, Inspector = Parameter.

### Importsemantik

Der GLB/GLTF-Import ist **kein Projekt-Öffnen**. Anders als der CM3D-Projektimport aus WD-11A ersetzt er das aktuelle Projekt nicht, sondern ergänzt ein externes 3D-Modell als neues Root-Objekt.

Vor der Änderung des CM3D-Projekts wird das ausgewählte Modell vollständig gelesen und durch den GLTF-Loader geparst. Erst bei erfolgreichem Parse wird das neue Asset samt CM3D-Objekt angelegt.

Für `.gltf` können die zugehörigen `.bin`- und Texturdateien gemeinsam im Dateidialog ausgewählt werden. Fehlen referenzierte Zusatzdateien, wird der Import mit einer verständlichen Fehlermeldung abgebrochen.

### Datenmodell

Importierte Modelle werden über zwei Ebenen gespeichert:

1. SceneGraph-Objekt `external.gltf` mit normalem CM3D-Transform und `assetId`.
2. AssetRecord `model.gltf.bundle` unter `project.assets` mit Einstiegsdatei und eingebetteten Quelldateien.

`validateProject()` prüft zusätzlich:

- eindeutige `assetId`;
- gültigen Asset-Typ und Format;
- vorhandene Einstiegsdatei;
- eingebettete Asset-Dateien;
- gültige `external.gltf → assetId`-Referenz.

Dadurch überlebt ein importiertes Modell den normalen `.cm3d.json` Export/Import aus WD-11A.

### Materialsemantik

GLB/GLTF-eigene Materialien und Texturen bleiben in WD-11B Bestandteil des importierten Modells. Der normale CM3D-Basisfarben-Inspector wird für `external.gltf` bewusst nicht angeboten, damit nicht fälschlich der Eindruck entsteht, die vollständige importierte Materialstruktur sei bereits in native CM3D-Materialdefinitionen konvertiert.

Eine spätere bewusste Konvertierung/Übernahme in native CM3D-Materialien benötigt einen eigenen Scope.

### Exportsemantik

WD-11B exportiert die komplette sichtbare 3D-Szene. Editor-Hilfen und Skizzenebenen werden nicht als 3D-Modellinhalt exportiert.

- Format: GLB oder GLTF.
- Einheit: intern Meter / glTF-Standard.
- Dateiname: im Inspector editierbar.
- Bestehende Objekttransformationen werden übernommen.
- Primitive, Extrude-Geometrie und geladene GLB/GLTF-Modelle werden als aktuell sichtbare 3D-Geometrie ausgegeben.

### Persistenzhinweis

Die Quellbytes importierter GLB/GLTF-Dateien werden im aktuellen V1-Datenmodell eingebettet. Das macht die native `.cm3d.json`-Projektdatei selbsttragend. Für sehr große Assets kann der browserseitige localStorage-Komfortspeicher an seine Größenbegrenzung stoßen; dies ist kein Verlust der nativen Projektdatei-Funktion, muss aber beim Gerätetest beobachtet werden. Eine spätere dedizierte Asset-Ablage kann diesen Punkt lösen.

### Lebenszyklus / Rebuild

GLB/GLTF-Runtimeobjekte werden bei einem Scene-Rebuild aus den persistierten Asset-Daten neu geparst. Es wird bewusst kein wiederverwendeter Three.js-Geometriecache über Rebuilds hinweg gehalten, da die bestehende Runtime beim Neuaufbau alte Geometrien und Materialien freigibt. Dadurch bleiben insbesondere Undo/Redo, Duplizieren und Projektladen robust.

### Folgeblock

Nach erfolgreichem Gerätetest von WD-11B soll ein eigener kleiner Block folgen:

**WD-11C – Auswahl / Teilprojekt Export + CM3D-Objekte dazuladen/mergen**

Dieser Block bündelt die fachlich zusammengehörenden Themen:

- CM3D-F077 Export Auswahl;
- optional CM3D-F078 Export Baugruppe;
- Teilprojekt-/Objektpaket;
- Import in ein bereits geöffnetes Projekt;
- ID-Neuvergabe/Kollisionsbehandlung;
- Parent-, Material-, Asset- und Referenzauflösung.

Damit wird `Projekt öffnen/ersetzen` weiterhin klar von `Objekte dazuladen/mergen` getrennt.

### Abnahme

WD-11B darf erst nach dem Gerätetest auf **PASS / FROZEN** gesetzt werden. Die verbindliche Prüfliste liegt in `WD-11B_TEST_CHECKLIST.md`.
