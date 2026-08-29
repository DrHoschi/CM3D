# WD-14 – Verbindliche Fortsetzung nach WD-13B

**Stand:** 2026-08-29  
**Status:** BINDING ROADMAP  
**Basis:** WD-13B PASS / FROZEN (`fb066fd9376f402befea3c247d6ec02e3b4f3f18`)  
**Funktionsbasis:** `docs/03_functional-spec/CM3D_MASTER_FUNCTIONS_V0_1.md`

## Ausgangslage

Nach WD-13B existierte im Repository keine verbindlich durchnummerierte Folgeplanung ab WD-14. Der ältere Projektstatus beschreibt nach WD-02 nur allgemein den weiteren V1-Ausbau.

Die weitere Reihenfolge wird deshalb nicht aus alten Chatständen abgeleitet, sondern kontrolliert aus den noch offenen Funktionen des eingefrorenen V1-Pflichtkerns.

## WD-14 – Objektzustände im Objektbaum

WD-14 schließt als nächster Entwicklungsblock die beiden V1-Pflichtfunktionen:

- `CM3D-F011` – Sichtbarkeit
- `CM3D-F012` – Sperren/Entsperren

Der Block baut auf dem inzwischen vorhandenen Objekt-/Operationsbaum, Selection-State, Inspector, Runtime-Abgleich, History und Save/Load auf.

### WD-14A – Sichtbarkeit Core

Ziel:

- persistierter Sichtbarkeitszustand pro geeignetem SceneGraph-Objekt;
- direkt im Objektbaum erkennbar und umschaltbar;
- Runtime-/3D-Darstellung reagiert unmittelbar;
- ausgeblendete Objekte bleiben im Objektbaum erreichbar;
- Undo/Redo für Sichtbarkeitsänderungen;
- Save/Load erhält den Zustand;
- keine Vermischung mit Sperrlogik.

Abnahme erfolgt wieder über automatisierbare Prüfungen sowie praktischen iPad-/Safari-Gerätetest. Erst danach darf WD-14A auf PASS / FROZEN gesetzt werden.

### WD-14B – Sperren/Entsperren Core

Erst nach WD-14A PASS / FROZEN.

Ziel:

- persistierter Sperrzustand pro geeignetem SceneGraph-Objekt;
- im Objektbaum erkennbar und umschaltbar;
- gesperrte Objekte bleiben sichtbar;
- gesperrte Objekte können nicht versehentlich transformiert oder fachlich verändert werden;
- Auswahl-/Inspector-Verhalten wird ausdrücklich festgelegt und getestet;
- Undo/Redo und Save/Load;
- praktischer iPad-/Safari-Gerätetest vor Freeze.

## Nicht Bestandteil von WD-14

- Layers/Ebenen (`CM3D-F015`, V1–V2);
- Feature Suppress/Unsuppress;
- Feature-Reorder;
- Boolean-Operationen;
- neue Modellierfeatures;
- globale UI-Neugestaltung.

## Verbindliche Reihenfolge

`WD-13B PASS / FROZEN → WD-14A Sichtbarkeit Core → WD-14B Sperren/Entsperren Core`

Weitere WD-15+-Blöcke werden erst nach erneutem Abgleich des dann verbleibenden V1-Pflichtkerns verbindlich nummeriert. Dadurch wird vermieden, dass nur in Chats vorhandene Planungen stillschweigend zur Projekt-Roadmap werden.
