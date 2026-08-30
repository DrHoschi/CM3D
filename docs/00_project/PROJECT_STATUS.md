# CM3D – Projektstatus

Stand: 2026-08-30

## Aktueller Gesamtstand

Repository `DrHoschi/CM3D` ist die zentrale Projektbasis.

Der vollständige V1-Pflichtkern wurde anhand der harmonisierten Master-Funktionsliste geprüft und abgeschlossen. Der Abschlussrestcheck weist **0 offene** und **0 teilweise offene V1-Pflichtfunktionen** aus. WD-19 wurde anschließend als Bedien-/Skalierbarkeitsfolgeblock auf iPad/Safari getestet und auf PASS/FROZEN gesetzt. Die abschließende Dropdown-Menükorrektur wurde ebenfalls auf iPad/Safari bestätigt und in `main` übernommen.

## Verbindlicher Release-Status

**CM3D V1 – COMPLETE / PASS / FROZEN**

Verbindliche V1-Basis:

- `docs/03_functional-spec/CM3D_MASTER_FUNCTIONS_V0_1.md`
- `docs/05_implementation/V1_ABSCHLUSSRESTCHECK_2026-08-30.md`
- `docs/05_implementation/WD-19_STATUS.md`
- aktueller eingefrorener V1-Stand auf `main`

Die ursprünglichen Quellabschriften und frühere Baseline-Dokumente bleiben als historische Ausgangsstände erhalten und werden nicht rückwirkend umgeschrieben.

## Bedeutung des V1-Freeze

V1 ist der erste vollständige belastbare Designer-Kern von CyberMotion 3D. PASS/FROZEN bedeutet:

- der definierte V1-Pflichtumfang ist funktional geschlossen;
- bestätigte V1-Funktionen werden nicht ohne konkreten Fehlergrund verändert;
- neue Produktfunktionen werden nicht mehr nachträglich in V1 hineingezogen;
- Erweiterungen erfolgen kontrolliert als V2-Entwicklungsblöcke;
- reale Gerätetests bleiben Bestandteil der Freigabe vor Freeze eines neuen Blocks.

## Übergang zu V2

Nach dem V1-Freeze beginnt **noch nicht unmittelbar WD-20**. Zuerst wird der vollständige V2-Zielumfang fachlich und strukturell festgelegt.

Verbindliche Reihenfolge:

`V1 Freeze → V2 Scope Definition → V2 Funktionskatalog → Abhängigkeiten/Architektur → V2 Entwicklungsroadmap → WD-20`

Die V2-Planung wird in `docs/06_v2_planning/V2_MASTER_PLAN.md` geführt.

## V2-Grundregel

V2 wird in zusammenhängenden Systemblöcken aufgebaut. Funktionen werden nicht zufällig einzeln implementiert, wenn dadurch dieselben Datenmodelle oder Bedienpfade später erneut umgebaut werden müssten.

Insbesondere werden Skizzen-, Profil-, Körper- und Modifier-Funktionen als zusammenhängende Modellierungskette geplant.

## V3-Backlog-Regel

Neue Ideen, die während der V2-Entwicklung entstehen, werden grundsätzlich für V3 vorgemerkt. Eine neue Idee darf nur dann noch in V2 aufgenommen werden, wenn sie nachweislich notwendig ist, um einen bereits freigegebenen V2-Block korrekt, konsistent oder technisch tragfähig abzuschließen.

V3-Kandidaten werden getrennt in `docs/06_v2_planning/V3_BACKLOG.md` gesammelt.

## Statuskennzeichnung

- `DRAFT` – in Bearbeitung
- `REVIEW` – fachlich zur Prüfung bereit
- `PASS` – festgelegte Prüfungen erfolgreich bestanden
- `FROZEN` – verbindlicher, getesteter Stand; Änderungen nur kontrolliert über Folgeblock oder konkrete Regression
- `APPROVED` – formell freigegebener Planungs-/Release-Stand
- `ARCHIVED` – abgelöster historischer Stand

Aktueller Gesamtstatus: **CM3D V1 – COMPLETE / PASS / FROZEN**

## Nächster Schritt

**V2-Masterplanung abschließen.**

Noch keine Vergabe von WD-20 und noch keine V2-Implementierung, bevor Scope, Funktionskatalog, Abhängigkeiten und Entwicklungsreihenfolge verbindlich festgelegt sind.
