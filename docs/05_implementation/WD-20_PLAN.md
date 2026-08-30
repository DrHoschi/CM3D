# WD-20 – RB-01 Foundation & Compatibility

**Stand:** 2026-08-30  
**Status:** PLANNED / NOT STARTED  
**Basis:** `V2_DEVELOPMENT_ROADMAP.md` – RB-01 Foundation & Compatibility  
**Ausgangscode:** stabiler V1-Stand auf `main`  
**Regel:** Noch keine Implementierung. Dieser Plan leitet den kleinsten belastbaren WD-20-Startumfang aus dem realen Codebestand ab.

## 1. Ergebnis des Codeabgleichs

RB-01 muss nicht bei Null beginnen. Der aktuelle V1-Code besitzt bereits mehrere tragfähige Grundlagen:

### Bereits vorhanden und weiterzuverwenden

- persistente `objectId` für Szenenobjekte;
- persistente `pointId` und `lineId` für Skizzenpunkte/-linien;
- `projectId`, `materialId`, `assetId` und weitere UUID-basierte Identitäten;
- zentrale Projektstruktur in `src/model/project.js`;
- `AppStore` als zentrale Projekt-/Selection-/History-Instanz;
- Snapshot-basierte Undo-/Redo-Historie auf Projektebene;
- Projektvalidierung vor Laden/Speichern;
- lokale Browserpersistenz und `.cm3d.json`-Dateipersistenz;
- getrenntes Teilprojektformat mit kollisionsfreier ID-Neuvergabe beim Merge;
- bestehende Diagnoseansicht, die Store-/Selection-/Schema-/History-Daten nur projiziert;
- V1-Skizzenelementauswahl und -Mehrfachauswahl mit realen Punkt-/Linien-IDs;
- V1-Extrusionsabhängigkeit mit expliziter `sourceSketchId` und bereits vorhandenem Invalid-Fallback.

Diese Grundlagen werden in V2 nicht ersetzt, wenn eine kontrollierte Erweiterung genügt.

## 2. Gefundene RB-01-Lücken

### Lücke A – Projektversion/Migration

Aktuell gilt:

- `SCHEMA_VERSION = '0.1.0'`;
- `validateProject()` akzeptiert nur genau diese Version;
- Browser-Load und Datei-Load validieren direkt gegen die aktuelle Version;
- ein `Detect Version → Migrate → Validate`-Pfad existiert noch nicht.

Damit kann keine neue V2-Persistenzstruktur sauber eingeführt werden, ohne entweder alte V1-Dateien abzulehnen oder V1 und V2 unkontrolliert im selben Schema zu vermischen.

### Lücke B – Selection ist noch nicht zentral typisiert

Der Grundstore besitzt:

- `selectedObjectIds`;
- `activeObjectId`;
- `hoveredObjectId`.

Die Skizzenelementauswahl wurde in V1 später über UI-Installationen ergänzt und erweitert `store.selection` bzw. überschreibt `store.select()`/`clearSelection()` zur Laufzeit.

Das funktioniert für V1, ist aber noch kein allgemeines A1-SelectionRef-System für Face, Edge, Feature, Profile, Path, WorkPlane usw.

### Lücke C – Dependency/Invalid ist featurelokal

V1-Extrude verwendet `sourceSketchId` und `extensions.sketchDependency.status`, und die Skizzenbearbeitung aktualisiert abhängige Extrusionen direkt.

Damit existiert bereits wertvolle vertikale Semantik, aber noch kein allgemeiner Dependency Graph bzw. ein gemeinsames `RESOLVED/UNRESOLVED/MISSING/INVALID/BLOCKED`-Modell.

### Lücke D – Undo ist zentral, aber noch nicht als explizite Domänentransaktion abstrahiert

Der bestehende Snapshot-Ansatz ist funktional und soll nicht voreilig ersetzt werden. Für V2 muss jedoch später sichergestellt werden, dass neue Reference-/Dependency-Zustände Teil desselben atomaren Projektzustands sind und Recompute keine eigenständigen Undo-Schritte erzeugt.

## 3. Entscheidung zur WD-20-Zerlegung

RB-01 wird nicht als ein großer WD umgesetzt.

Verbindliche Zerlegung:

`WD-20A – V2 Project Schema & Migration Foundation`
→ `WD-20B – Unified SelectionRef Foundation`
→ `WD-20C – Stable Reference + Invalid State Foundation`
→ `WD-20D – Dependency Graph & Recompute Foundation`
→ `WD-20E – Foundation Integration / RB-01 Gate`

Die Teilblöcke bleiben fachlich unter **WD-20 / RB-01** zusammengefasst.

## 4. Erster Implementierungsblock: WD-20A

### Titel

**WD-20A – V2 Project Schema & Migration Foundation**

### Ziel

Vor allen neuen V2-Datenstrukturen einen kontrollierten Projektversions- und Migrationspfad schaffen, der den vollständigen V1-Bestand erhält.

WD-20A fügt **noch keine neue Modellierungsfunktion** und noch kein SelectionRef-/Dependency-System hinzu.

### Minimaler Implementierungsumfang

1. Projektladepfad fachlich trennen in:
   - JSON lesen;
   - Format erkennen;
   - Schema-Version erkennen;
   - bekannte Altversion kontrolliert migrieren;
   - aktuellen Projektstand validieren;
   - erst danach in den Store übernehmen.

2. V1-Schema `0.1.0` als ausdrücklich unterstützte Legacy-Quelle behandeln.

3. Einen aktuellen V2-fähigen Schema-Zielstand einführen, ohne bestehende V1-Nutzdaten semantisch umzudeuten.

4. Migration muss:
   - bestehende `projectId`, `objectId`, `pointId`, `lineId`, `materialId`, `assetId` erhalten;
   - Scene-Hierarchie, Materialien, Assets, Sketches und Extrudes unverändert übernehmen, soweit die V1-Daten gültig sind;
   - keine fehlenden V2-Referenzen heuristisch erfinden;
   - einen deterministischen, erneut validierbaren Projektzustand erzeugen.

5. Dieselbe Migrationslogik muss für mindestens folgende native Ladepfade gelten:
   - `.cm3d.json` Datei öffnen;
   - gespeichertes Browserprojekt laden;
   - vollständiges CM3D-Projekt als Quelle für Teilprojekt-/Merge-Verarbeitung, soweit der Pfad native Projektdaten einliest.

6. Neues Projekt wird direkt im aktuellen Schema erzeugt.

7. Nach erfolgreichem Laden/Migrieren gilt für weiteres Speichern der aktuelle Schema-Stand. Kein Rückspeichern nach V1 `0.1.0` erforderlich.

### Bewusst nicht Bestandteil WD-20A

- kein allgemeines `SelectionRef`;
- keine Face-/Edge-/Vertex-Referenzen;
- kein Dependency Graph;
- kein Recompute-Engine-Umbau;
- keine neuen INVALID/BLOCKED-UI-Funktionen;
- keine neue Sketch-/Profilfunktion;
- keine Änderung der funktionierenden V1-Auswahlbedienung;
- keine Änderung an Extrude-Geometrie oder Sketch-Recompute;
- keine UI-Neugestaltung;
- keine Änderungen an Exportmenüs.

## 5. WD-20A – Abnahmekriterien

WD-20A darf erst PASS werden, wenn mindestens folgende Fälle bestätigt sind:

### A – Neues Projekt

- neues Projekt erzeugen;
- speichern;
- neu laden;
- Projekt bleibt gültig und unverändert nutzbar.

### B – Bestehendes V1-Projekt

- reale/gesicherte V1-`0.1.0`-Projektdatei laden;
- Migration wird erkannt und durchgeführt;
- Objektbaum/Hirarchie bleibt gleich;
- Transform, Sichtbarkeit, Lock, Gruppen/Baugruppen bleiben erhalten;
- Sketches und Extrusionsbeziehungen bleiben erhalten;
- Materialien und eingebettete GLB/GLTF-Assets bleiben erhalten;
- keine IDs werden unnötig neu vergeben.

### C – V1 → V2 Save Roundtrip

- V1-Projekt laden/migrieren;
- im aktuellen Schema speichern;
- gespeicherte Datei erneut laden;
- keine zweite Migration des bereits aktuellen Schemas;
- Projektinhalt funktional identisch.

### D – Browserpersistenz

- älteren lokal gespeicherten V1-Stand laden;
- Migration funktioniert auch dort;
- erneutes Speichern funktioniert im aktuellen Schema.

### E – Ungültige/Unbekannte Version

- unbekannte zukünftige oder nicht unterstützte Schema-Version wird kontrolliert abgewiesen;
- das aktuell geöffnete Projekt wird dabei nicht verändert;
- Fehlermeldung benennt die nicht unterstützte Version nachvollziehbar.

### F – V1 Regression

Mindestens erneut prüfen:
- Projekt öffnen/speichern/speichern unter;
- Undo/Redo nach normalen Änderungen;
- Sketch bearbeiten;
- Extrude bleibt nach Sketch-Änderung korrekt gekoppelt;
- GLB/GLTF-Projektinhalt bleibt nach Save/Load verfügbar;
- Teilprojekt/Objekte dazuladen bleibt funktionsfähig.

### G – Gerätetest

Da Datei-/Browserpersistenz und iOS-Dateipfade betroffen sind, ist vor PASS ein realer **iPad/Safari/GitHub-Pages-Test** erforderlich.

## 6. Warum WD-20A zuerst kommt

Die kommende V2-Auswahl, Referenzstruktur und der Dependency Graph benötigen persistente neue Datentypen. Ohne Migrationsrahmen würden wir diese entweder in das V1-Schema hineinpatchen oder später erneut umbauen müssen.

WD-20A schafft deshalb zuerst ausschließlich den sicheren Container für alle späteren RB-01-Daten.

## 7. Vorausblick – noch nicht freigegebene Folgeimplementierung

Nach WD-20A PASS/FROZEN soll **WD-20B – Unified SelectionRef Foundation** den bestehenden V1-Selection-State kontrolliert vereinheitlichen.

Der aktuelle Codeabgleich zeigt dafür bereits einen konkreten Refactoring-Bedarf: Objektselektion sitzt im `AppStore`, während Sketch-Element- und Sketch-Multiselection heute über nachinstallierte Store-Erweiterungen in UI-Modulen ergänzt werden. Diese funktionierenden V1-Pfade dürfen nicht einfach entfernt werden; WD-20B muss sie auf das zentrale SelectionRef-Modell migrieren und danach die bisherigen V1-Gerätefälle erneut bestätigen.

WD-20C–E werden erst nach dem jeweiligen Vorgänger konkret zugeschnitten.

## 8. Status

**RB-01 Code Audit: COMPLETE**  
**WD-20 Scope: DEFINED**  
**WD-20A Scope: READY FOR IMPLEMENTATION**  
**Implementation: NOT STARTED**  
**Feature Branch: NOT CREATED**  
**Device Test: NOT STARTED**  
**PASS/FROZEN: NO**

Nächster zulässiger Schritt:

**WD-20A Implementierung auf neuem Feature-Branch vom aktuellen stabilen `main`.**
