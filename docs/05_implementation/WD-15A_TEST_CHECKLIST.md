# WD-15A – Geräte-Testcheckliste

**Zielplattform:** iPad / Safari / GitHub Pages  
**Status vor Test:** IMPLEMENTED / DEVICE TEST REQUIRED

## A – Speichern unter

1. Vorhandenes Projekt laden oder neues Projekt mit mindestens zwei Objekten erstellen und normal speichern.
2. `Datei → Speichern unter…` wählen.
3. Einen deutlich anderen Projektnamen vergeben.
4. Prüfen: neuer Projektstand erscheint zusätzlich im Projekt-Dropdown.
5. Prüfen: alter Projektstand bleibt ebenfalls vorhanden.
6. Im neuen aktiven Projekt ein Objekt verändern und normal speichern.
7. Alten Projektstand laden und prüfen: die nachträgliche Änderung aus der Kopie ist dort nicht vorhanden.
8. Neuen Projektstand wieder laden und prüfen: die Änderung ist dort vorhanden.
9. `Speichern unter…` erneut öffnen und abbrechen → kein zusätzlicher Projektstand darf entstehen.
10. `Speichern unter…` mit leerem Namen versuchen → kein zusätzlicher Projektstand darf entstehen.

## B – Projekt schließen

1. Ein Projekt mit sichtbaren Objekten aktiv haben.
2. `Datei → Projekt schließen` wählen und die Rückfrage abbrechen.
3. Prüfen: aktuelles Projekt bleibt vollständig erhalten und aktiv.
4. `Projekt schließen` erneut wählen und bestätigen.
5. Prüfen: Objektbaum ist leer, Auswahl ist leer, Undo/Redo sind zurückgesetzt.
6. Prüfen: zuvor gespeicherte Projekte stehen weiterhin im Projekt-Dropdown.
7. Den vorherigen gespeicherten Projektstand erneut laden.
8. Prüfen: Inhalt ist vollständig wieder vorhanden.

## C – Regression

1. Normales `Speichern` und `Laden` funktioniert weiterhin.
2. Undo/Redo innerhalb eines aktiven Projekts funktioniert weiterhin.
3. Sichtbarkeit aus WD-14A funktioniert weiterhin.
4. Sperren/Entsperren aus WD-14B funktioniert weiterhin.
5. CM3D-Projektdatei Import/Export bleibt bedienbar.

## PASS-Kriterium

Alle Punkte ohne Datenverlust oder Regression bestanden. Erst danach wird WD-15A als **PASS / FROZEN** dokumentiert.
