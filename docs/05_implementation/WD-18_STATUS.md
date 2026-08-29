# WD-18 – Inspector Diagnoseabschluss

**Stand:** 2026-08-29  
**Status:** IMPLEMENTED / DEVICE TEST REQUIRED  
**Branch:** `feature/wd-18-inspector-diagnostics`  
**Basis:** WD-17 PASS / FROZEN (`7eb21e277c43a4d72d9da9129a473e620f0896de`)  
**Funktionen:** `CM3D-F081` bis `CM3D-F084`

## Ziel

WD-18 schließt den V1-Diagnosekern ab, ohne neue Parallelzustände einzuführen. Die Diagnoseansichten lesen die bereits vorhandenen Projekt-, Status-, Selection- und Runtime-Daten.

## F081 – Diagnose / Konsole

Unter `Werkzeuge → Diagnose` steht im Inspector ein kompakter Diagnosebereich zur Verfügung.

Die Diagnoseansicht zeigt unter anderem:

- projectId und schemaVersion;
- Anzahl Objekte, Root-Objekte, Assets und Materialien;
- Undo-/Redo-Tiefe;
- Runtime-Nodes und Pickables;
- aktuellen Transformmodus, WORLD/LOCAL und Snap-Zustand;
- die letzten Store-Ereignisse mit Zeit und optionaler objectId;
- Laufzeitfehler und unbehandelte Promise-Fehler werden zusätzlich in der Meldungshistorie sichtbar.

## F082 – Status / Meldungen

Die bestehende Statuszeile bleibt die einzige fachliche Statusquelle. WD-18 hängt sich an den vorhandenen `AppUI.setStatus()`-/`fail()`-Pfad und zeigt:

- die aktuelle Statusmeldung;
- eine begrenzte Historie der letzten Meldungen;
- INFO- und ERROR-Kennzeichnung.

Es wird kein zweites Statusmodell im Projekt gespeichert.

## F083 – Scene JSON

Die Ansicht `Scene JSON` zeigt den aktuellen Inhalt von `project.scene` formatiert als JSON. Sie ist read-only und aktualisiert sich bei relevanten Projekt-/Objektänderungen.

Damit kann der tatsächliche Objektbaum mit `rootObjectIds` und `objects` direkt geprüft werden, ohne eine zweite Szenenstruktur zu erzeugen.

## F084 – Selection / Auswahlstatus

Die Ansicht zeigt den realen Store-Zustand:

- `selectedObjectIds`;
- `activeObjectId`;
- `hoveredObjectId`;
- Kerndaten des aktiven Objekts: objectId, Typ, Name, Parent, sichtbar, gesperrt.

## UI

Der Einstieg erfolgt über `Werkzeuge → Diagnose`. Der Diagnosebereich wird rechts im Inspector eingeblendet und besteht aus vier auf-/zuklappbaren Abschnitten:

1. Status / Meldungen
2. Selection / Auswahlstatus
3. Scene JSON
4. Diagnose / Konsole

Die Ansicht kann wieder geschlossen werden und verändert das Projekt nicht.

## Bewusst nicht Bestandteil

- Bearbeiten des Scene JSON;
- persistente Logdateien;
- Server-/Cloud-Telemetrie;
- Performance-Profiler;
- Netzwerkdiagnose;
- Objektbaum-Collapse und kompaktere Sichtbarkeits-/Lock-Icons. Diese UI-Punkte sind separat vorgemerkt und folgen nach dem V1-Abschlussrestcheck.

## Abnahme

Vor PASS / FROZEN ist ein realer iPad-/Safari-Test nach `WD-18_TEST_CHECKLIST.md` erforderlich.

**Aktueller Status: IMPLEMENTED / DEVICE TEST REQUIRED.**
