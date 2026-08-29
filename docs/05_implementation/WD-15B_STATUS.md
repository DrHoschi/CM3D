# WD-15B – Projekt-Einstellungen

**Stand:** 2026-08-29  
**Status:** IMPLEMENTED / DEVICE TEST REQUIRED  
**Branch:** `feature/wd-15b-project-settings`  
**Basis:** WD-15A PASS / FROZEN (`cecdca0a455f58c957f2e3c9c402cb63c24d015b`)  
**Funktion:** `CM3D-F006` – Projekt-Einstellungen

## Ziel

WD-15B führt einen klaren projektbezogenen Einstellungsbereich ein, ohne Workspace-/Runtime-Zustände in die Projektdatei zu verschieben.

## Projektbezogene Werte in WD-15B

### Projektname

Der bestehende persistente Wert `project.project.name` wird über `Datei → Projekt-Einstellungen…` bearbeitbar.

### Längeneinheit

Der bereits bestehende persistente Wert `settings.units.lengthDisplayUnit` wird im selben Dialog bearbeitbar. Zulässige Werte bleiben `mm`, `cm`, `m`, `km`.

Die Einheit war bereits vor WD-15B Bestandteil des Projektmodells. WD-15B ändert daher kein Schema, sondern gibt dem vorhandenen projektbezogenen Wert einen eindeutigen Einstellungsort.

## Bewusst nicht als Projekt-Einstellung übernommen

Die folgenden vorhandenen Zustände bleiben Workspace-/Runtime-State:

- aktiver Transformmodus `Move/Rotate/Scale`;
- Koordinatenraum `WORLD/LOCAL`;
- Snap an/aus;
- Snap-Schrittweiten für Translation, Rotation und Skalierung;
- aktuelle Auswahl;
- aktuelle Kamera-/Viewport-Lage;
- geöffneter UI-Kontext.

Damit werden keine kurzfristigen Bedienzustände versehentlich in das persistente Projektmodell gezogen.

## Änderungslogik

`Übernehmen` ändert Projektname und/oder Längeneinheit gemeinsam als einen History-Schritt `Projekt-Einstellungen ändern`.

- leerer Projektname wird nicht akzeptiert;
- Abbrechen verändert das Projekt nicht;
- unveränderte Werte erzeugen keinen History-Eintrag;
- Änderungen aktualisieren `modifiedAt` über den bestehenden `touch()`-Pfad;
- Einheitenänderung verwendet weiterhin das bestehende `unitChanged`-Ereignis, sodass Inspector und Snap-Anzeige unmittelbar neu dargestellt werden.

## Persistenz

Da beide Werte bereits innerhalb der Projektstruktur liegen, werden sie automatisch erhalten durch:

- normales lokales Speichern/Laden;
- WD-15A `Speichern unter…` als `.cm3d.json`;
- Projektdatei-Import/Export.

## Nicht Bestandteil

- Grid-/Rasterparameter;
- Viewport-/Kameraeinstellungen;
- Autosave/Recovery;
- globale Anwendungseinstellungen;
- Benutzerkonto-/Cloud-Einstellungen;
- neue Schema-Version.

## Abnahme

Vor PASS / FROZEN ist der praktische iPad-/Safari-Test nach `WD-15B_TEST_CHECKLIST.md` erforderlich.

**Aktueller Status: IMPLEMENTED / DEVICE TEST REQUIRED.**
