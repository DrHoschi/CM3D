# WD-01 – Gesamt-Cross-Check & Freeze

**Stand:** 2026-08-27  
**Status:** FROZEN  
**Basis:** WD-01.01 bis WD-01.12

## Ergebnis

Der Gesamt-Cross-Check aller zwölf WD-01-Architekturentscheidungen ist abgeschlossen.

**Ergebnis: 12/12 PASS**  
**Offene Architektur-Blocker: 0**

Damit ist **WD-01 – Technisches Fundament & Datenmodell abgeschlossen und FROZEN**. Der nächste Entwicklungsblock ist **WD-02 / P0.1 – erster End-to-End-Web-Prototyp**.

## Geprüfte Übergänge

| Bereich | Ergebnis | Cross-Check |
|---|---|---|
| WD-01.01 Projektformat | PASS | `.cm3d`, `format`, `schemaVersion`, fachliche Persistenz sind mit Save/Load und Schichtentrennung konsistent. |
| WD-01.02 IDs / SceneGraph | PASS | `objectId` bleibt einzige stabile Objektidentität; Three.js-UUIDs werden nicht fachlich verwendet. |
| WD-01.03 Objektarten | PASS | gemeinsames SceneObject-Basismodell ist kompatibel mit Hierarchie, Transform, Material und Save/Load. |
| WD-01.04 Hierarchie | PASS | `parentId` ist einzige Parent-Wahrheit; `order` ergänzt nur Geschwisterreihenfolge; keine Child-Doppelhaltung. |
| WD-01.05 Transform | PASS | lokales TRS+Pivot-Modell ist mit Reparenting, Welt/Lokal und Save/Load konsistent. |
| WD-01.06 Welt/Lokal | PASS | Weltwerte sind abgeleitet; persistiert wird nur lokal; WORLD/LOCAL-Gizmo ändert nicht das Dateiformat. |
| WD-01.07 Einheiten | PASS | Meter ist kanonische interne Länge; mm/cm/m/km bleiben Anzeige/Eingabe; Three.js nutzt 1 Unit = 1 m. |
| WD-01.08 Materialien | PASS | `materialId` ist stabile Identität; SceneObjects referenzieren Materialien; Three.js-Materialien sind Runtime. |
| WD-01.09 Selection | PASS | Selection referenziert `objectId`, bleibt Runtime/UI-State und wird nicht in `.cm3d` persistiert. |
| WD-01.10 Undo/Redo | PASS | Commands/Transactions arbeiten auf fachlichen Daten; IDs bleiben stabil; History wird nicht persistiert. |
| WD-01.11 Save/Load | PASS | validieren/migrieren vor Runtime-Aufbau; atomarer Ladepfad; beschädigte/neue Dateien verändern das aktive Projekt nicht. |
| WD-01.12 Schichten | PASS | Data Model → Application/Commands → Runtime/UI ist konsistent; keine zweite Projektwahrheit in Three.js oder DOM. |

## Bereinigter Cross-Check-Punkt CC-01

Im frühen WD-01.01-Beispiel wurde der Top-Level-Bereich `materials` illustrativ als Array (`[]`) dargestellt. WD-01.08 hat später verbindlich festgelegt, dass Materialien logisch als **Map `materialId -> MaterialDefinition`** geführt werden.

Für die FROZEN-Baseline gilt daher verbindlich:

```json
{
  "format": "CM3D_PROJECT",
  "schemaVersion": "0.1.0",
  "project": {},
  "settings": {},
  "scene": {
    "rootObjectIds": [],
    "objects": {}
  },
  "materials": {},
  "assets": [],
  "extensions": {}
}
```

Damit ist die frühere illustrative Array-Schreibweise **ersetzt**. Es existiert keine zweite zulässige Material-Persistenzform für Schema `0.1.0`.

## Verbindliche Kerninvarianten nach Cross-Check

1. `.cm3d` ist UTF-8-JSON mit `format = CM3D_PROJECT` und `schemaVersion`.
2. `projectId`, `objectId` und `materialId` sind dauerhafte fachliche Identitäten.
3. SceneObjects liegen in `scene.objects` als Map `objectId -> SceneObject`.
4. Hierarchie wird ausschließlich durch `parentId` plus `order` beschrieben.
5. Transform wird lokal als Position + Quaternion + Scale + Pivot gespeichert.
6. Welttransforms werden berechnet und nicht zusätzlich persistiert.
7. Interne Längeneinheit ist Meter; Anzeigeeinheit ist davon getrennt.
8. Materialien liegen projektweit als Map `materialId -> MaterialDefinition`; SceneObjects speichern nur `materialIds`.
9. Selection und Undo/Redo-History sind Runtime-/UI-Zustände und nicht Teil der Projektdatei.
10. Save/Load validiert und migriert vollständig, bevor der aktive Zustand ersetzt wird.
11. Three.js und UI sind jederzeit aus fachlichen Daten rekonstruierbar.
12. Fachliche Änderungen laufen über Application/Services/Commands und nicht als direkte dauerhafte Runtime-Mutation.

## WD-02 / P0.1 – freigegebener Startumfang

WD-02 darf jetzt auf dieser FROZEN-Architektur beginnen. Der erste End-to-End-Nachweis bleibt bewusst klein:

1. Hauptfenster öffnen.
2. 3D-Viewport anzeigen.
3. Würfel als `primitive.box` erzeugen.
4. Würfel im Objektbaum anzeigen.
5. Würfel über dieselbe `objectId` auswählen.
6. lokale Transformwerte X/Y/Z ändern.
7. Projekt nach `.cm3d`-Schema `0.1.0` speichern.
8. Browser neu laden.
9. Projekt sicher laden und validieren.
10. denselben Würfel mit derselben `objectId`, Hierarchie, Transform- und Materialreferenz wiederherstellen.
11. Three.js-Runtime vollständig aus dem geladenen Datenmodell neu erzeugen.

## Freeze-Regel

WD-01 wird ab diesem Stand nicht mehr beiläufig während WD-02 umgebaut. Falls die Implementierung einen echten Architekturfehler nachweist, erfolgt eine ausdrücklich dokumentierte Änderung mit eigener Entscheidung und Schema-/Migrationsbewertung.

**Freigabe:** WD-01 FROZEN / WD-02 READY
