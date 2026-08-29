# WD-17 – Geräte-Testcheckliste

**Zielplattform:** iPad / Safari / GitHub Pages  
**Status vor Test:** IMPLEMENTED / DEVICE TEST REQUIRED

## A – Kamera erzeugen

1. WD-17 laden und prüfen, dass oben `WD-17` steht.
2. Ein paar normale Objekte in der Szene platzieren.
3. Editoransicht so drehen, dass die Objekte gut sichtbar sind.
4. `Neu → Neue Kamera` wählen.
5. Prüfen: Im Objektbaum erscheint ein neues Kameraobjekt.
6. Kamera auswählen und prüfen: Transform-Gizmo sowie normale Positions-/Rotationsfelder funktionieren.
7. Kamera verschieben und drehen.
8. Undo und Redo für den Kameratransform prüfen.

## B – Kamera-Parameter

1. Kamera auswählen.
2. Im Inspector müssen `Sichtfeld (°)`, `Near` und `Far` erscheinen.
3. FOV z. B. von 50 auf 70 ändern.
4. Undo → alter Wert muss zurückkommen.
5. Redo → neuer Wert muss wieder erscheinen.

## C – Kamera-Vorschau

1. Kamera auswählen.
2. `Ansicht → Kamera-Vorschau` aktivieren.
3. Prüfen: Die Ansicht springt auf Position und Blickrichtung der Kamera.
4. Prüfen: Raster und Transform-Gizmo sind in der Vorschau nicht sichtbar.
5. Prüfen: Orbit-Navigation verändert die Vorschau nicht.
6. `Vorschau beenden` wählen.
7. Prüfen: Die vorherige Editoransicht wird wiederhergestellt.
8. FOV ändern und Vorschau erneut öffnen → anderer Bildwinkel muss sichtbar sein.

## D – Persistenz

1. Kamera positionieren und FOV ändern.
2. Projekt lokal speichern.
3. Neues/anderes Projekt laden und anschließend den gespeicherten Stand wieder laden.
4. Prüfen: Kamera ist im Objektbaum vorhanden und Position/Rotation/FOV sind erhalten.
5. Optional zusätzlich `Speichern unter…` und Projektdatei-Import prüfen.

## E – Regression

1. Normales Objekt auswählen und bewegen.
2. WD-16 Raster/Achsen prüfen.
3. Sichtbarkeit sowie Sperren/Entsperren kurz prüfen.
4. Kamera löschen und mit Undo wiederherstellen.
5. Prüfen: Keine normale Objektfunktion wird durch das Kameraobjekt blockiert.

## PASS-Kriterium

Kameraobjekt und Kamera-Vorschau funktionieren auf dem realen Gerät ohne Datenverlust oder Regression. Erst danach wird WD-17 als **PASS / FROZEN** dokumentiert.
