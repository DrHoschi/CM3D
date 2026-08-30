# WD-19 – Device Test Checklist

**Zielgerät:** iPad / Safari / GitHub Pages  
**Status vor Test:** IMPLEMENTED / DEVICE TEST REQUIRED

## A – Gruppen/Baugruppen auf- und zuklappen

1. Mindestens drei Objekte erzeugen.
2. Zwei Objekte zu einer Gruppe oder Baugruppe zusammenfassen.
3. Prüfen: Container zeigt links einen kleinen Pfeil nach unten.
4. Pfeil antippen: Kinder verschwinden aus dem Objektbaum, 3D-Objekte bleiben unverändert sichtbar.
5. Pfeil erneut antippen: Kinder erscheinen wieder.
6. Einen Container in einem Container erzeugen und beide Ebenen getrennt auf-/zuklappen.
7. Prüfen: Antippen des Pfeils wählt den Container nicht versehentlich um.

## B – kompakte Zustandsicons

1. Sichtbarkeitsicon eines Objekts antippen: Objekt wird aus-/eingeblendet wie in WD-14A.
2. Sperricon antippen: Objekt wird gesperrt/entsperrt wie in WD-14B.
3. Prüfen: Icons sind kompakt und haben keine dominanten weißen Schaltflächen mehr.
4. Prüfen: langer Objektname bleibt sinnvoll lesbar/abgeschnitten und die Zustandsicons bleiben erreichbar.
5. Dasselbe bei Kindobjekten in einer Gruppe/Baugruppe prüfen.

## C – Regression

1. Objekt auswählen und transformieren.
2. Gesperrtes Objekt kann nicht transformiert werden; nach Entsperren wieder möglich.
3. Unsichtbares Objekt bleibt im Baum erreichbar und wieder einblendbar.
4. Gruppe/Baugruppe bilden und auflösen.
5. Undo/Redo für fachliche Aktionen weiterhin funktionsfähig.
6. Projekt speichern und neu laden; Objektstruktur, Sichtbarkeit und Sperrzustand bleiben korrekt.
7. Auf-/Zuklappen selbst erzeugt keinen Undo-Schritt und muss nach Reload nicht erhalten bleiben.

## PASS-Kriterium

PASS, wenn A–C ohne funktionale Regression erfüllt sind. Danach WD-19 als PASS/FROZEN dokumentieren.
