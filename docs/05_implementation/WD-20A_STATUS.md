# WD-20A – V2 Project Schema & Migration Foundation

**Stand:** 2026-08-30  
**Status:** PASS / FROZEN  
**Basis:** bereinigter `main` @ `2f4c9ef2dfd9def7ac734c0077067ecc1edeeff3`  
**Branch:** `feature/wd-20a-project-schema-migration`

## Zweck

WD-20A führt ausschließlich einen kontrollierten nativen Projektversions- und Migrationspfad ein. Keine neue Modellierungs-, Selection-, Reference-, Dependency- oder Recompute-Funktion ist Bestandteil dieses Blocks.

## Umsetzung

- aktuelles natives CM3D-Projektschema: `0.2.0`
- unterstützte Legacy-Quelle: `0.1.0`
- neues Projekt wird direkt als `0.2.0` erzeugt
- zentrale Reihenfolge: Format/Version erkennen → bekannte Legacy-Version migrieren → aktuellen Zustand validieren
- V1→V2-Migration verändert ausschließlich `schemaVersion`
- `projectId`, Objekt-/Sketch-/Material-/Asset-IDs und Nutzdaten bleiben unverändert
- unbekannte, fehlende oder nicht unterstützte Schema-Versionen werden kontrolliert abgewiesen
- nach Migration gilt die bestehende `validateProject()`-Prüfung als normales Validierungsgate

## Vereinheitlichte native Ladepfade

1. `.cm3d.json` Projektdatei öffnen
2. Browserprojekt aus `localStorage` laden
3. vollständige `.cm3d.json` als Quelle für `CM3D-Objekte dazuladen`

Das getrennte Teilprojektformat `CM3D_PARTIAL / 0.1.0` bleibt bewusst eigenständig und wird nicht zum Projektformat umdefiniert.

## Bewusst nicht geändert

- `index.html`
- Viewer / Three.js Runtime
- Objektbaum / Inspector / Command Surface
- Selection-System
- Sketch-Bearbeitung
- Extrude-Geometrie / Sketch-Recompute
- Dependency Graph / Stable Reference
- Exportmenüstruktur

`src/main.js` wurde ausschließlich für die sichtbare Gerätetest-Kennung von `WD-19` auf `WD-20A` angepasst. Keine Runtime-/Fachlogik wurde dort geändert.

## Technischer Regressionstest

Testdatei:

`tests/wd-20a-project-schema.mjs`

Fixture:

`test-assets/wd-20a/v1-project-0.1.0.cm3d.json`

Geprüft werden mindestens:

- V1 `0.1.0` → aktuelles `0.2.0`
- `projectId`, `objectId`, `materialId`, Transform, Geometriedaten und Extensions bleiben erhalten
- aktuelles `0.2.0` wird nicht erneut migriert
- Projektdatei-Ladepfad migriert V1
- Full-Project-Merge-Pfad akzeptiert/migriert V1 vor Teilprojekt-Konvertierung
- Schema `9.9.9` wird abgelehnt
- fehlende `schemaVersion` wird abgelehnt
- nach Migration weiterhin ungültige Referenzen werden durch normale Projektvalidierung abgelehnt

GitHub Actions Workflow:

`.github/workflows/wd-20a-project-schema.yml`

Ergebnis 2026-08-30:

**PASS** – Workflow `WD-20A Project Schema Regression`, Run `33334163268`, Head `f044ba3c99947d34fa4bfa1091d24d96c9071639`.

## iPad/Safari-Gerätetest 2026-08-30

Realer Test über GitHub Pages auf iPad/Safari.

Bestätigt:

1. Anwendung startet vollständig; sichtbare Build-Kennung `WD-20A`; keine statische `UI-01`-Fehlansicht. **PASS**
2. Neues Projekt / Skizze erstellen. **PASS**
3. Extrusion aus Skizze. **PASS**
4. Speichern / Projektdatei exportieren. **PASS**
5. Projekt erneut laden. **PASS**
6. definierte V1-Fixture `0.1.0` öffnen; `V1 Testbox` wird korrekt dargestellt. **PASS**
7. migriertes Projekt erneut exportieren; Export besitzt `schemaVersion = 0.2.0`. **PASS**
8. `projectId = prj_wd20a_v1_regression` erhalten. **PASS**
9. `objectId = obj_wd20a_box` erhalten. **PASS**
10. Transform Position X=1 / Y=2 / Z=3 erhalten. **PASS**
11. Abmessungen 1.25 / 2.5 / 3.75 erhalten. **PASS**
12. `materialId = mat_wd20a_standard` erhalten. **PASS**
13. Extension-Marker `wd20aMarker = preserve-me` und `wd20aProjectMarker = preserve-project-data` erhalten. **PASS**

Der konkrete V1→V2-Gerätenachweis bestätigt damit den Kernzweck von WD-20A: eine reale V1-Projektdatei wird auf dem iPad/Safari-Pfad kontrolliert in das aktuelle Schema migriert, ohne die geprüften IDs oder Nutzdaten zu verlieren.

Nicht alle allgemeinen V1-Regressionsfälle wurden in diesem Abschlusslauf erneut einzeln manuell durchgeklickt. Die unveränderten V1-Pfade werden durch den bereits freigegebenen V1-main sowie den automatischen WD-20A-Regressionstest abgesichert; für WD-20A wurde zusätzlich der direkt betroffene Datei-/Migrationspfad real auf dem Gerät geprüft.

## Abschluss

**Technical Regression: PASS**  
**iPad/Safari Device Test: PASS**  
**V1→V2 Migration: PASS**  
**Open WD-20A Blockers: 0**  
**Decision: PASS / FROZEN**

WD-20A darf nach finalem Diff-Check über PR #38 nach `main` übernommen werden. WD-20B beginnt erst nach erfolgreichem Merge und Abschlusscheck auf `main`.
