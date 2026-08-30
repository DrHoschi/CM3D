# CM3D – Verbindliche Entwicklungs-, Merge- und Freeze-Regel

**Stand:** 2026-08-30  
**Status:** VERBINDLICH

## Regel

Ab diesem Stand gilt für neue WD-/UI-Entwicklungsblöcke verbindlich:

1. Feature-Branch vom aktuellen stabilen `main`-Stand anlegen.
2. Implementierung ausschließlich auf dem Feature-Branch durchführen.
3. Technische Prüfung und realen Gerätetest durchführen.
4. Bei bestandenem Test den Block auf `PASS` setzen.
5. Den bestandenen Feature-Stand kontrolliert nach `main` mergen.
6. Erst nachdem der freigegebene Stand auf `main` vorhanden ist, gilt der Block als `FROZEN`.
7. Nach dem Freeze wird der betreffende Feature-Branch nicht mehr fachlich erweitert; Änderungen erfolgen über einen neuen Folgeblock oder bei einer konkret dokumentierten Regression.

## Bedeutung der Statuswerte

- `IMPLEMENTED / DEVICE TEST REQUIRED`: Implementierung vorhanden, noch nicht freigegeben.
- `PASS`: Abnahmetest bestanden, Merge nach `main` steht noch aus.
- `PASS / FROZEN`: Abnahmetest bestanden **und** der freigegebene Stand befindet sich auf `main`.

## Konsolidierung 2026-08-30

Die zuvor aufeinander aufbauenden WD-Featurestände bis einschließlich WD-19 wurden nachträglich konsolidiert. Der vollständig auf iPad/Safari getestete WD-19-Endstand wurde mit der bereits auf `main` vorhandenen finalen UI-01-PASS/FROZEN-Historie zusammengeführt.

Der dabei erzeugte Merge-Commit ist der neue stabile Ausgangspunkt für die weitere Entwicklung.
