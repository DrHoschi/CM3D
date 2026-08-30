# CM3D – V1 Release Status

**Stand:** 2026-08-30  
**Release:** CM3D V1  
**Status:** COMPLETE / PASS / FROZEN

## Zweck

Dieses Dokument schließt den Entwicklungsstand V1 formal ab. Es ersetzt keine historischen WD-Statusdokumente, sondern fasst deren bestätigten Endstand für den Versionsübergang zu V2 zusammen.

## Freigabebasis

- Master-Funktionsliste: `docs/03_functional-spec/CM3D_MASTER_FUNCTIONS_V0_1.md`
- V1-Abschlussrestcheck: `docs/05_implementation/V1_ABSCHLUSSRESTCHECK_2026-08-30.md`
- WD-19 Status: `docs/05_implementation/WD-19_STATUS.md`
- abschließende Dropdown-Menükorrektur nach realem iPad/Safari-Test in `main`

## Ergebnis

Der V1-Abschlussrestcheck bestätigt:

- offene V1-Pflichtfunktionen: **0**
- teilweise offene V1-Pflichtfunktionen: **0**
- V1-Pflichtkern: **FUNCTIONALLY COMPLETE**

WD-19 wurde anschließend als unmittelbarer Bedien-/Skalierbarkeitsfolgeblock real auf iPad/Safari getestet und PASS/FROZEN gesetzt. Die danach festgestellte Dropdown-Menübedienung wurde korrigiert, erneut auf iPad/Safari geprüft und in `main` übernommen.

Damit gilt verbindlich:

> **CM3D V1 – COMPLETE / PASS / FROZEN**

## Freeze-Regel

Der V1-Stand wird nicht mehr durch regulären Funktionsausbau verändert. Änderungen an V1-Funktionen sind nur zulässig bei:

1. konkreter Regression oder Fehlerbehebung;
2. zwingender technischer Migration für einen späteren Versionsstand;
3. kontrolliert dokumentierter Änderung mit Prüfung auf V1-Kompatibilität.

Neue Modellierungs-, Material-, Bibliotheks-, Viewport-, Import-/Export- oder Organisationsfunktionen werden als V2 oder später behandelt.

## Übergang

Nach V1 erfolgt kein direktes Springen in einen beliebigen Implementierungsblock.

Verbindlicher Übergang:

`V1 Freeze → V2 Scope Definition → V2 Funktionskatalog → Abhängigkeiten/Architektur → V2 Entwicklungsroadmap → WD-20`

Bis diese V2-Planung freigegeben ist, wird keine neue WD-Nummer für V2 vergeben.
