# CM3D – Verbindliche Entwicklungs-, Merge- und Freeze-Regel

**Stand:** 2026-09-06  
**Status:** VERBINDLICH

## Regel

Ab diesem Stand gilt für neue WD-/UI-Entwicklungsblöcke verbindlich:

1. Feature-Branch vom aktuellen stabilen `main`-Stand anlegen.
2. Implementierung ausschließlich auf dem Feature-Branch durchführen.
3. GitHub Pages wird zu Beginn des WD-/UI-Blocks einmal auf den aktiven Feature-Branch gestellt und bleibt dort für sämtliche Unterstände und Gerätetests dieses Blocks. Ein zwischenzeitliches Zurückstellen auf `main` ist nicht zulässig.
4. Jeder testbare Unterstand erhält eine eindeutige sichtbare Build-Kennung, z. B. `WD-20E.4`. Bei einer Änderung dieser Kennung müssen sämtliche sichtbaren Stellen konsistent mitgezogen werden, insbesondere Seitentitel, Brand-/Header-Label, Diagnose-Startmeldung und vergleichbare Status-/Buildtexte. Vor einem Gerätetest ist ausdrücklich zu prüfen, dass keine ältere Kennung mehr sichtbar ist.
5. Technische Prüfung und realen Gerätetest auf genau diesem aktiven Feature-Branch durchführen.
6. Bei bestandenem Test den Block auf `PASS` setzen.
7. Den bestandenen Feature-Stand kontrolliert nach `main` mergen.
8. Erst nachdem der freigegebene Stand auf `main` vorhanden ist, gilt der Block als `FROZEN`.
9. Nach dem Freeze wird der betreffende Feature-Branch nicht mehr fachlich erweitert; Änderungen erfolgen über einen neuen Folgeblock oder bei einer konkret dokumentierten Regression.
10. Für einen neuen WD-/UI-Block wird wieder ein neuer Feature-Branch vom dann stabilen `main` angelegt; erst dann darf GitHub Pages einmal auf diesen neuen aktiven Entwicklungsbranch umgestellt werden.

## Verbindlicher Device-Test-Nachweis

Vor der Freigabe eines sichtbaren Unterstands muss der Gerätetest mindestens bestätigen:

- die erwartete Build-Kennung ist tatsächlich sichtbar;
- GitHub Pages liefert den aktiven Feature-Branch und nicht `main` oder einen alten Deployment-Stand aus;
- die im Unterstand geänderte Funktion ist sichtbar bzw. testbar;
- die vereinbarten Regressionen des jeweiligen Blocks funktionieren weiterhin.

Eine fachlich neue Funktion, die zusammen mit einer alten Build-Kennung sichtbar ist, darf **nicht** als sauberer Device-PASS gewertet werden. Zuerst muss die Deployment-/Buildtext-Diskrepanz geklärt werden.

## Bedeutung der Statuswerte

- `IMPLEMENTED / DEVICE TEST REQUIRED`: Implementierung vorhanden, noch nicht freigegeben.
- `TECH PASS`: automatisierte/technische Regression bestanden, realer Gerätetest noch offen.
- `TECH PASS / DEVICE PASS`: technischer Test und realer Gerätetest auf dem aktiven Feature-Branch bestanden; Merge/Frozen steht noch aus.
- `PASS`: Abnahmetest bestanden, Merge nach `main` steht noch aus.
- `PASS / FROZEN`: Abnahmetest bestanden **und** der freigegebene Stand befindet sich auf `main`.

## Konsolidierung 2026-08-30

Die zuvor aufeinander aufbauenden WD-Featurestände bis einschließlich WD-19 wurden nachträglich konsolidiert. Der vollständig auf iPad/Safari getestete WD-19-Endstand wurde mit der bereits auf `main` vorhandenen finalen UI-01-PASS/FROZEN-Historie zusammengeführt.

Der dabei erzeugte Merge-Commit ist der neue stabile Ausgangspunkt für die weitere Entwicklung.
