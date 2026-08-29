# WD-13A – Feature-/Operationsbaum Core

**Status:** PASS / FROZEN  
**Branch:** `feature/wd-13a-feature-operations-tree-core`  
**Basis:** `feature/wd-12b-sketch-gizmo-plane-editing` (WD-12B PASS / FROZEN)

## Ziel

WD-13A führt die erste belastbare Feature-/Operationsdarstellung im Objektbaum ein, ohne das bestehende SceneGraph-, Transform- oder Extrusionsmodell umzubauen.

Eine vorhandene `feature.extrude` bleibt weiterhin ein reguläres SceneGraph-Objekt. Im Objektbaum wird sie jedoch nicht mehr als unabhängiges Root-Objekt dargestellt, wenn eine gültige `sourceSketchId` auf eine vorhandene Skizze verweist. Stattdessen erscheint sie logisch unter ihrer Quellskizze.

Beispiel:

```text
Skizze 1
├── Linien (4)
├── Punkte (4)
└── Operationen (1)
    └── Extrusion 1 · Extrude Skizze 1
```

## 1 – Keine neue Parallel-Datenstruktur

WD-13A erzeugt bewusst keine zusätzliche persistierte Feature-Liste.

Die Zuordnung wird aus den bereits vorhandenen Daten abgeleitet:

- Featuretyp: `feature.extrude`
- Quellverweis: `data.sourceSketchId`
- Quellobjekt: `sketch`

Damit bleiben Save/Load, Undo/Redo und die bestehende Extrusionsabhängigkeit auf dem vorhandenen Datenmodell.

## 2 – Logische Darstellung statt Parent-Umbau

Die Extrusion wird für WD-13A **nicht** physisch per `parentId` unter die Skizze gehängt.

Grund:

- `parentId` steuert bereits die räumliche SceneGraph-Hierarchie;
- die Extrusion übernimmt aktuell den Transform der Quellskizze;
- ein stiller Parent-Umbau könnte daher Transform- und Runtime-Verhalten verändern.

WD-13A trennt deshalb erstmals klar zwischen:

- räumlicher SceneGraph-Hierarchie;
- logischer Feature-/Operationshierarchie im Objektbaum.

## 3 – Auswahl einer Operation

Ein Klick auf eine angezeigte Extrusionsoperation wählt weiterhin das reale `feature.extrude`-Objekt aus.

Dadurch gelten bestehende Mechanismen weiter:

- normale `activeObjectId`-Auswahl;
- Hervorhebung der aktiven Operation im Baum;
- bestehender Inspector erkennt das ausgewählte `feature.extrude`-Objekt;
- Fokus und vorhandene allgemeine Objektbefehle können weiter auf die reale Objekt-ID arbeiten.

WD-13A führt noch keinen eigenen Extrusionsparameter-Editor ein.

## 4 – Keine doppelte Baumdarstellung

Eine `feature.extrude` mit gültiger Quellskizze wird nicht zusätzlich als unabhängiges Root-Objekt angezeigt.

Falls der Quellverweis ungültig oder die Quellskizze nicht mehr vorhanden ist, bleibt die Extrusion als Root sichtbar. Dadurch wird ein beschädigter oder historischer Zustand nicht unsichtbar gemacht.

## 5 – Mehrere Operationen derselben Skizze

Mehrere vorhandene Extrusionen mit derselben `sourceSketchId` werden gemeinsam im Abschnitt `Operationen (n)` dargestellt und deterministisch nach bestehender `order` sowie ersatzweise `objectId` sortiert.

## Nicht Bestandteil von WD-13A

- nachträgliche Änderung der Extrusionstiefe;
- Richtung `positive` / `negative` / `symmetric`;
- Live-Preview einer Parameteränderung;
- Reorder von Features;
- Suppress/Unsuppress;
- Boolean-Features;
- Fillet/Chamfer oder weitere Modellierfeatures;
- Umstellung des SceneGraph-Parentings;
- generisches persistiertes Feature-History-Modell.

Diese Punkte gehören in Folgeblöcke. Insbesondere ist **WD-13B – Feature-Parameter im Inspector** als direkter fachlicher Folgeblock vorgesehen.

## Geräteabnahme

**Datum:** 2026-08-29  
**Gerät:** iPad / Safari / GitHub Pages  
**Ergebnis:** PASS

Praktisch bestätigt wurden:

- Skizze mit Linien und Punkten bleibt korrekt im Objektbaum sichtbar;
- zwei Extrusionen derselben Skizze erscheinen gemeinsam unter `Operationen (2)`;
- verknüpfte Extrusionen werden nicht zusätzlich als Root-Objekte dargestellt;
- Extrusion 1 und Extrusion 2 sind einzeln im Operationsbaum auswählbar;
- der Inspector erkennt die Auswahl jeweils als `feature.extrude`;
- Löschen einer Extrusion funktioniert;
- Undo stellt den gelöschten Zustand korrekt zurück;
- Redo funktioniert ebenfalls korrekt;
- Projekt speichern und anschließend neu laden erhält Skizze, Operationen und Zuordnung korrekt.

## Abnahmestatus

WD-13A wurde praktisch auf dem iPad geprüft und abgenommen.

**Finaler Status: PASS / FROZEN.**

Direkter Folgeblock: **WD-13B – Feature-Parameter im Inspector**.
