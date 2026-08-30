# CM3D – Dokumentenindex

Stand: 2026-08-30

## Aktuelle fachliche Quellen

| Bereich | Datei | Rolle | Status |
|---|---|---|---|
| UI / Hauptfenster / Programmstruktur | `CyberMotion_3D_Hauptfenster_Programmstruktur_V0_2_AKTUALISIERT_2026-08-30(1).docx` | aktueller fachlicher UI-/Programmstrukturstand für V1-Abschluss und V2-Übergang | AKTUELL / V0.2 |
| Funktionsspezifikation | `CyberMotion_Web_Designer_Funktionsmatrix_V0_2_AKTUALISIERT_2026-08-30(1).xlsx` | aktueller fachlicher Funktions-, V1-Abschluss- und V2-Planungsstand | AKTUELL / V0.2 |
| Design / Icons | `cybermotion_web_designer_icons_complete_v3.zip` | vollständiger eigener Icon-Satz | AKTUELLER DESIGN-BESTAND |

## Historische Ausgangsquellen

| Bereich | Datei | Rolle | Status |
|---|---|---|---|
| UI / Hauptfenster | `cybermotion_web_designer_hauptfenster_v01.docx` | ursprüngliche Hauptfenster- und UI-Beschreibung | HISTORISCH / V0.1 |
| Funktionsspezifikation | `CyberMotion_Web_Designer_Funktionsmatrix_V0_1.xlsx` | ursprüngliche Funktionsmatrix | HISTORISCH / V0.1 |
| UI-Normalisierung | `docs/02_ui-ux/hauptfenster_v0.1.md` | normalisierte Übernahme des ursprünglichen Hauptfenster-Konzepts | HISTORISCH |

Historische Quellen werden nicht still überschrieben oder rückwirkend umgedeutet.

## Abgeleitete verbindliche Projektdokumentation

| Bereich | Datei | Rolle | Status |
|---|---|---|---|
| Projektstatus | `docs/00_project/PROJECT_STATUS.md` | aktueller Gesamtstatus, Freeze-/V2-Übergang und nächster kontrollierter Schritt | AKTUELL |
| V1 Master-Funktionen | `docs/03_functional-spec/CM3D_MASTER_FUNCTIONS_V0_1.md` | harmonisierte V1-Funktionsbasis mit stabilen CM3D-F-IDs | V1 FROZEN BASIS |
| UI / Hauptfenster | `docs/02_ui-ux/hauptfenster_v0.2.md` | normalisierte UI-V0.2-Arbeitsstruktur im Repository | WORKING DESIGN / V0.2 |
| V1 Abschluss | `docs/05_implementation/V1_ABSCHLUSSRESTCHECK_2026-08-30.md` | formaler V1-Pflichtkern-Restcheck | PASS |
| WD-19 | `docs/05_implementation/WD-19_STATUS.md` | letzter regulärer V1-Bedien-/Skalierbarkeitsblock | PASS / FROZEN |
| V2 Masterplan | `docs/06_v2_planning/V2_MASTER_PLAN.md` | freigegebener V2-Gesamtumfang | APPROVED / Scope PASS |
| V2 Funktionskatalog | `docs/06_v2_planning/V2_FUNCTION_CATALOG.md` | V2-Funktionsstruktur | BINDING |
| V2 Architektur | `docs/06_v2_planning/V2_ARCHITECTURE_DEPENDENCIES.md` | R1/R2/R3/R3a, Abhängigkeiten und Architektur | BINDING |
| V2 Roadmap | `docs/06_v2_planning/V2_DEVELOPMENT_ROADMAP.md` | Reihenfolge der V2-Roadmapblöcke | BINDING |
| V3 Backlog | `docs/06_v2_planning/V3_BACKLOG.md` | nicht blockierende neue Ideen außerhalb des V2-Scopes | BINDING RULE |
| WD-20 Plan | `docs/05_implementation/WD-20_PLAN.md` | Zerlegung von RB-01 in WD-20A bis WD-20E | DEFINED / IMPLEMENTATION HOLD |

## Quelleninterpretation V0.2

Die beiden aktualisierten V0.2-Quelldokumente enthalten den späteren Stand **V1 COMPLETE / PASS / FROZEN** und den freigegebenen V2-Übergang.

Die Funktionsmatrix V0.2 enthält zusätzlich interne Statusblätter aus früheren Zwischenständen. Einzelne dort noch als PARTIAL/NOT STARTED markierte V1-Zeilen werden deshalb als historische Statusdaten innerhalb des Workbooks behandelt. Für den verbindlichen V1-Abschluss gilt der später dokumentierte Gesamtstand zusammen mit den PASS/FROZEN-WD-Nachweisen und dem Abschlussrestcheck.

## Zielablage

- Hauptfenster-/Programmstruktur-Dokumentation → `docs/02_ui-ux/`
- Funktionsspezifikation / normalisierte Matrixdaten → `docs/03_functional-spec/` bzw. künftig kontrolliert unter `data/functional-matrix/`
- Icon-Paket / Icon-Dokumentation → `design/icons/`
- V1-/WD-Implementierungsnachweise → `docs/05_implementation/`
- V2-Planung → `docs/06_v2_planning/`

## Dokumentenregel

1. Originalstände werden nicht still überschrieben.
2. Neue fachliche Stände erhalten eine nachvollziehbare Versionskennung und werden im Projektstatus und Dokumentenindex nachgeführt.
3. PASS/FROZEN gesetzte Implementierungsblöcke werden durch neue Planungs- oder UI-Dokumente nicht rückwirkend verändert.
4. Quellwidersprüche werden dokumentiert und über spätere nachgewiesene Freigabestände eingeordnet; sie werden nicht still korrigiert.
5. Ein neuer WD-Implementierungsblock darf erst starten, wenn sein Planungs- und Dokumentationsstand gegen den getesteten `main`-Stand geprüft ist.

## Aktueller Konsolidierungsstatus

Vor weiterer WD-20-Implementierung wird ein Cross-Check durchgeführt:

`aktuelle V0.2-Quellen ↔ Repository-Dokumentation ↔ getesteter main-Stand ↔ V2-Planung`

Bis zum PASS dieses Cross-Checks bleibt WD-20-Implementierung auf **HOLD**.
