# WD-15B – Geräte-Testcheckliste

**Zielplattform:** iPad / Safari / GitHub Pages  
**Status vor Test:** IMPLEMENTED / DEVICE TEST REQUIRED

## A – Dialog und Projektname

1. WD-15B öffnen und ein Projekt mit mindestens einem Objekt verwenden.
2. `Datei → Projekt-Einstellungen…` öffnen.
3. Prüfen: aktueller Projektname und aktuelle Längeneinheit werden angezeigt.
4. Projektname ändern und `Übernehmen` wählen.
5. Dialog erneut öffnen und prüfen: neuer Name ist vorhanden.
6. `Undo` ausführen und prüfen: alter Projektname wird wiederhergestellt.
7. `Redo` ausführen und prüfen: neuer Projektname ist wieder vorhanden.
8. Dialog öffnen, Wert ändern und `Abbrechen` wählen → keine Änderung darf übernommen werden.
9. Leeren Projektnamen versuchen → Änderung darf nicht übernommen werden.

## B – Längeneinheit

1. Projekt-Einstellungen öffnen und Einheit z. B. von `m` auf `mm` ändern.
2. Prüfen: Inspector zeigt Abmessungen/Positionen sofort in `mm` an, ohne die reale Geometriegröße zu verändern.
3. Prüfen: Transform-Snap-Anzeige verwendet ebenfalls `mm`.
4. Projekt-Einstellungen erneut öffnen → `mm` ist ausgewählt.
5. `Undo` → vorherige Einheit wird wiederhergestellt.
6. `Redo` → `mm` wird wiederhergestellt.

## C – Persistenz

1. Projektname und Einheit ändern.
2. Normal lokal speichern.
3. Anderes/neues Projekt laden und anschließend den gespeicherten Stand wieder laden.
4. Prüfen: Projektname und Einheit sind erhalten.
5. `Datei → Speichern unter…` aus WD-15A verwenden und `.cm3d.json` erzeugen.
6. Diese Projektdatei wieder importieren.
7. Prüfen: Projektname und Einheit sind ebenfalls in der Datei erhalten.

## D – Regression

1. Objekte auswählen, verschieben, drehen und skalieren.
2. Sichtbarkeit WD-14A testen.
3. Sperren/Entsperren WD-14B testen.
4. Normales Speichern/Laden und WD-15A `Speichern unter…` kurz prüfen.
5. Prüfen: Transformmodus, WORLD/LOCAL, Snap an/aus und Auswahl werden durch den Projekt-Einstellungsdialog nicht als neue Projektparameter verändert.

## PASS-Kriterium

Alle Kernpunkte ohne Datenverlust oder Regression bestanden. Erst danach wird WD-15B als **PASS / FROZEN** dokumentiert.
