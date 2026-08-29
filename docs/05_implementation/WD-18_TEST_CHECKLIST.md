# WD-18 – Geräte-Testcheckliste

**Zielplattform:** iPad / Safari / GitHub Pages  
**Status vor Test:** IMPLEMENTED / DEVICE TEST REQUIRED

## A – Diagnose öffnen

1. Branch `feature/wd-18-inspector-diagnostics` öffnen.
2. Prüfen: sichtbare Build-Bezeichnung `WD-18`.
3. `Werkzeuge → Diagnose` öffnen.
4. Rechts im Inspector erscheinen vier auf-/zuklappbare Abschnitte.
5. `Schließen` blendet den Diagnosebereich wieder aus.

## B – Status / Meldungen

1. Diagnose öffnen.
2. Ein Objekt erzeugen oder eine andere Aktion ausführen, die eine Statusmeldung erzeugt.
3. Prüfen: aktuelle Meldung und Meldungshistorie erscheinen unter `Status / Meldungen`.
4. Mehrere Aktionen durchführen und prüfen, dass die Historie ergänzt wird.

## C – Selection / Auswahlstatus

1. Ein Objekt auswählen.
2. `Selection / Auswahlstatus` öffnen.
3. Prüfen: `activeObjectId` und `selectedObjectIds` passen zur realen Auswahl.
4. Zweites Objekt per Mehrfachauswahl ergänzen und prüfen, dass beide IDs erscheinen.
5. Sichtbarkeit oder Sperre ändern und prüfen, dass die Kerndaten des aktiven Objekts aktualisiert werden.

## D – Scene JSON

1. `Scene JSON` öffnen.
2. Prüfen: `rootObjectIds` und `objects` sind sichtbar.
3. Neues Objekt erzeugen und prüfen, dass es im JSON erscheint.
4. Objekt löschen und prüfen, dass es aus dem JSON verschwindet.
5. Gruppe/Baugruppe prüfen: Parent-Beziehungen müssen im JSON nachvollziehbar sein.

## E – Diagnose / Konsole

1. Abschnitt `Diagnose / Konsole` öffnen.
2. Prüfen: projectId/schemaVersion, Objekt-/Root-Anzahl, Undo/Redo, Runtime-Nodes, Pickables, Toolmodus, WORLD/LOCAL und Snap werden angezeigt.
3. Objekte erzeugen, auswählen, verschieben und Undo/Redo benutzen.
4. Prüfen: Zusammenfassung und Liste der letzten Store-Ereignisse reagieren auf die Aktionen.

## F – Persistenz und Regression

1. Projekt speichern und neu laden.
2. Prüfen: Projektinhalt bleibt unverändert; Diagnoseansicht speichert keine eigenen Projektdaten.
3. Kameraobjekt/-Vorschau WD-17 kurz testen.
4. Raster/Achsen WD-16, Sichtbarkeit WD-14A und Sperren WD-14B kurz prüfen.

## PASS-Kriterium

Alle vier Diagnoseansichten lesen den realen CM3D-Zustand korrekt, ohne Projektänderungen oder Regressionen zu verursachen. Erst danach wird WD-18 als **PASS / FROZEN** dokumentiert.
