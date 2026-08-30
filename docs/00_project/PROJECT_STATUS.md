# CM3D – Projektstatus

Stand: 2026-08-30

## Aktueller Gesamtstand

Repository `DrHoschi/CM3D` ist die zentrale Projektbasis.

Der vollständige V1-Pflichtkern wurde anhand der harmonisierten Master-Funktionsliste geprüft und abgeschlossen. Der Abschlussrestcheck weist **0 offene** und **0 teilweise offene V1-Pflichtfunktionen** aus. WD-19 sowie die anschließenden V1-Regressionskorrekturen wurden auf iPad/Safari praktisch getestet und in `main` übernommen.

Der aktuell getestete und freigegebene V1-Code-Stand auf `main` ist:

`86ea06eb48f1ce8d04d728c50cacf1beea2f840e`

## Verbindlicher Release-Status

**CM3D V1 – COMPLETE / PASS / FROZEN**

Verbindliche V1-Basis:

- `docs/03_functional-spec/CM3D_MASTER_FUNCTIONS_V0_1.md`
- `docs/05_implementation/V1_ABSCHLUSSRESTCHECK_2026-08-30.md`
- `docs/05_implementation/WD-19_STATUS.md`
- getesteter V1-Stand auf `main`

Die ursprünglichen Quellabschriften und frühere Baseline-Dokumente bleiben als historische Ausgangsstände erhalten und werden nicht rückwirkend umgeschrieben.

## Aktuelle fachliche V0.2-Quellen

Für den Übergang zu V2 wurden am 30.08.2026 zwei aktualisierte fachliche Quellen bereitgestellt:

1. **CyberMotion Web Designer – Funktionsmatrix V0.2**
   - Quelldatei: `CyberMotion_Web_Designer_Funktionsmatrix_V0_2_AKTUALISIERT_2026-08-30(1).xlsx`
   - Übersicht: V1 = COMPLETE / PASS / FROZEN; V2 Scope Review = PASS; RB-01 = Foundation & Compatibility; WD-20A als erster vorgesehener Foundation-Teilblock.
   - Das Workbook enthält zusätzlich ältere interne Statusblätter aus früheren Zwischenständen. Diese historischen Zeilen ersetzen nicht den späteren V1-Abschlussstatus.

2. **CyberMotion 3D – Hauptfenster / Programmstruktur V0.2**
   - Quelldatei: `CyberMotion_3D_Hauptfenster_Programmstruktur_V0_2_AKTUALISIERT_2026-08-30(1).docx`
   - Stand: 30.08.2026.
   - Dokumentiert V1 COMPLETE / PASS / FROZEN, den abgeschlossenen V2-Übergang, R1/R2/R3/R3a, RB-01 sowie die vorgesehene Zerlegung WD-20A bis WD-20E.

Diese V0.2-Quellen ergänzen die historische V0.1-Basis. Sie dürfen den getesteten V1-Codezustand nicht rückwirkend verändern.

## Bedeutung des V1-Freeze

V1 ist der erste vollständige belastbare Designer-Kern von CyberMotion 3D. PASS/FROZEN bedeutet:

- der definierte V1-Pflichtumfang ist funktional geschlossen;
- bestätigte V1-Funktionen werden nicht ohne konkreten Fehlergrund verändert;
- neue Produktfunktionen werden nicht nachträglich in V1 hineingezogen;
- Erweiterungen erfolgen kontrolliert als V2-Entwicklungsblöcke;
- reale Gerätetests bleiben Bestandteil der Freigabe vor Freeze eines neuen Blocks.

## V2-Planungsstand

Die V2-Masterplanung ist fachlich abgeschlossen:

`V1 Freeze → V2 Scope Definition → V2 Funktionskatalog → Abhängigkeiten/Architektur → V2 Entwicklungsroadmap`

V2 Scope Review: **PASS**  
Offene Scope-Blocker: **0**

Verbindliche Planungsdokumente auf diesem Dokumentationsbranch:

- `docs/06_v2_planning/V2_MASTER_PLAN.md`
- `docs/06_v2_planning/V2_FUNCTION_CATALOG.md`
- `docs/06_v2_planning/V2_ARCHITECTURE_DEPENDENCIES.md`
- `docs/06_v2_planning/V2_DEVELOPMENT_ROADMAP.md`
- `docs/06_v2_planning/V3_BACKLOG.md`
- `docs/05_implementation/WD-20_PLAN.md`

## Verbindliche V2-Architekturregeln

- **R1 – Stabile Referenzen / Topologie:** keine stille Umbindung auf nur geometrisch ähnliche Geometrie; nicht eindeutig wiedererkennbare Quellen werden INVALID/UNRESOLVED.
- **R2 – Deterministischer Recompute:** abhängige Features werden in Abhängigkeitsreihenfolge berechnet; ungültige Quellen führen nachvollziehbar zu INVALID/BLOCKED.
- **R3 – Datentrennung:** native CM3D-Projektdaten, Bibliotheksinhalte und externe Austauschformate bleiben klar getrennt.
- **R3a – Zentraler Export:** `Datei → Exportieren…` ist der gemeinsame Einstieg; Format und Parameter folgen im nachgelagerten Workflow.

## RB-01 – Foundation & Compatibility

RB-01 ist der erste verbindliche V2-Roadmapblock.

Der vorhandene V1-Code besitzt bereits nutzbare Grundlagen:

- UUID-basierte IDs,
- Projektvalidierung,
- Snapshot-Undo/Redo,
- Diagnosegrundlagen,
- bestehenden Sketch-/Extrude-Kern.

Die zentrale Foundation-Lücke ist der allgemeine Projektpfad:

`Version erkennen → migrieren → validieren`

Der bestehende V1-Projektstand verwendet Schema `0.1.0`.

## WD-20 – Status nach Repository-Audit

WD-20 ist fachlich in kleine Teilblöcke definiert:

- WD-20A – V2 Project Schema & Migration Foundation
- WD-20B – Unified SelectionRef Foundation
- WD-20C – Stable Reference + Invalid State
- WD-20D – Dependency Graph & Recompute
- WD-20E – Foundation Integration / RB-01 Gate

**Aktueller Arbeitsstatus:** WD-20 ist vorübergehend **HOLD / REPOSITORY & DOCUMENTATION CLEANUP**.

Grund: Vor weiterer V2-Implementierung werden Branch-Historie, Dokumentation, V0.2-Quellenregistrierung und Cross-Check gegen den getesteten `main`-Stand vollständig bereinigt. Ein bereits angelegter WD-20A-Testbranch ist nicht freigegeben und wird nicht nach `main` gemergt, solange diese Bereinigung und der anschließende Gerätetest nicht PASS sind.

## V3-Backlog-Regel

Neue Ideen, die während der V2-Entwicklung entstehen, werden grundsätzlich für V3 vorgemerkt. Eine neue Idee darf nur dann noch in V2 aufgenommen werden, wenn sie nachweislich notwendig ist, um einen bereits freigegebenen V2-Block korrekt, konsistent oder technisch tragfähig abzuschließen.

## Statuskennzeichnung

- `DRAFT` – in Bearbeitung
- `REVIEW` – fachlich zur Prüfung bereit
- `PASS` – festgelegte Prüfungen erfolgreich bestanden
- `FROZEN` – verbindlicher, getesteter Stand; Änderungen nur kontrolliert über Folgeblock oder konkrete Regression
- `APPROVED` – formell freigegebener Planungs-/Release-Stand
- `HOLD` – bewusst angehalten; keine Folgeimplementierung bis zur dokumentierten Aufhebung
- `ARCHIVED` – abgelöster historischer Stand

Aktueller Gesamtstatus: **CM3D V1 – COMPLETE / PASS / FROZEN; V2 FOUNDATION IMPLEMENTATION – HOLD pending repository/documentation cleanup**

## Nächster Schritt

1. Dokumentationskonsolidierung abschließen.
2. Cross-Check `Dokumentation ↔ main ↔ V2-Planung` durchführen.
3. Reinen Dokumentationsstand nach erfolgreicher Prüfung kontrolliert nach `main` übernehmen.
4. Historische PRs/Branches bereinigen.
5. Erst danach WD-20A erneut auf sauberer `main`-Basis prüfen bzw. neu aufsetzen.
