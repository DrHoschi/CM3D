# WD-20A – V2 Project Schema & Migration Foundation

**Stand:** 2026-08-30  
**Status:** TECHNICAL PASS / DEVICE TEST PENDING  
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

- `src/main.js`
- `index.html`
- Viewer / Three.js Runtime
- Objektbaum / Inspector / Command Surface
- Selection-System
- Sketch-Bearbeitung
- Extrude-Geometrie / Sketch-Recompute
- Dependency Graph / Stable Reference
- Exportmenüstruktur

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

## Device-Test-Gate

Vor Merge/PASS/FROZEN ist ein realer iPad/Safari/GitHub-Pages-Test erforderlich.

Mindestens prüfen:

1. Seite startet vollständig wie der bekannte WD-19/V1-Stand; keine statische `UI-01`-Fehlansicht.
2. Neues Projekt erstellen → speichern → laden.
3. vorhandenes Browserprojekt aus dem bisherigen V1-Stand laden; Migration muss transparent funktionieren.
4. V1-`.cm3d.json` öffnen; Inhalt/Hierarchie/IDs funktional erhalten.
5. migriertes Projekt speichern und erneut öffnen.
6. V1-Vollprojekt über `CM3D-Objekte dazuladen` verwenden.
7. Sketch kurz bearbeiten und abhängige Extrusion prüfen.
8. Undo/Redo prüfen.
9. GLB/GLTF-Inhalt bei vorhandenem Testprojekt laden/speichern.
10. ungültige/unbekannte Projektversion darf das offene Projekt nicht ersetzen.

## Freeze-Regel

**Noch nicht mergen. Noch nicht PASS/FROZEN.**

Erst nach erfolgreichem Gerätetest und ausdrücklicher Freigabe darf WD-20A nach `main` übernommen werden. WD-20B beginnt erst danach.
