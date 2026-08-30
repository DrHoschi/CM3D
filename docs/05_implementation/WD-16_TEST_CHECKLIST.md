# WD-16 – Geräte-Testcheckliste

**Zielplattform:** iPad / Safari / GitHub Pages  
**Status vor Test:** IMPLEMENTED / DEVICE TEST REQUIRED

## Kernprüfung

1. Branch `feature/wd-16-viewport-reference-system` öffnen.
2. Prüfen: oben in der Anwendung steht `WD-16`.
3. Im leeren Projekt am Weltursprung die drei Achsen prüfen:
   - X rot,
   - Y grün,
   - Z blau,
   - Beschriftungen X/Y/Z sichtbar.
4. Einen Würfel erzeugen und Kamera drehen/zoomen.
5. Prüfen: Achsen bleiben am Weltursprung und drehen sich nicht mit dem Objekt.
6. Stark hinein- und herauszoomen.
7. Prüfen: Achsen bleiben grundsätzlich erkennbar und das vorhandene Raster funktioniert weiterhin.
8. Top-, Front-, Side-, Perspektive- und Isometrieansicht kurz durchschalten.
9. Prüfen: Achsen geben in allen Ansichten eine nachvollziehbare Weltorientierung.
10. Objekt verschieben, drehen und skalieren; danach Undo/Redo prüfen.
11. Projekt speichern und neu laden.
12. Prüfen: Modell bleibt korrekt; Achsen sind weiterhin nur Viewport-Hilfe und erscheinen nicht als Objekt im Objektbaum.

## PASS-Kriterium

Raster unverändert funktionsfähig, XYZ-Weltachsen sichtbar und keine Regression der bisherigen Viewport-/Transformfunktionen. Erst danach WD-16 als **PASS / FROZEN** markieren.
