# CM3D – Source Register

Stand: 2026-08-30

## Aktuelle fachliche Quellen

| Source-ID | Quelle | Version / Stand | Rolle | Verbindlichkeit |
|---|---|---|---|---|
| SRC-CM3D-UI-002 | `CyberMotion_3D_Hauptfenster_Programmstruktur_V0_2_AKTUALISIERT_2026-08-30(1).docx` | V0.2 / 30.08.2026 | Hauptfenster, Programmstruktur, V1-Abschluss, V2-Übergang, R1/R2/R3/R3a, RB-01, WD-20A–E | aktuelle fachliche UI-/Programmstrukturquelle |
| SRC-CM3D-FM-002 | `CyberMotion_Web_Designer_Funktionsmatrix_V0_2_AKTUALISIERT_2026-08-30(1).xlsx` | V0.2 / 30.08.2026 | Funktionsmatrix, V1-Gesamtstatus, V2 Scope/Architektur/Roadmap-Überblick | aktuelle fachliche Funktionsquelle; interne historische Statusblätter beachten |
| SRC-CM3D-ICO-003 | `cybermotion_web_designer_icons_complete_v3.zip` | V3 | eigener UI-Iconbestand | aktueller Designbestand |

## Historische Ausgangsquellen

| Source-ID | Quelle | Version / Stand | Rolle | Status |
|---|---|---|---|---|
| SRC-CM3D-UI-001 | `cybermotion_web_designer_hauptfenster_v01.docx` | V0.1 | ursprüngliche Hauptfenster-/UI-Beschreibung | HISTORISCH |
| SRC-CM3D-FM-001 | `CyberMotion_Web_Designer_Funktionsmatrix_V0_1.xlsx` | V0.1 | ursprüngliche Funktionsmatrix | HISTORISCH |

## Abgeleitete Repository-Quellen

| Quelle | Rolle | Status |
|---|---|---|
| `docs/03_functional-spec/CM3D_MASTER_FUNCTIONS_V0_1.md` | harmonisierte Funktionsbasis mit stabilen CM3D-F-IDs | V1 FROZEN BASIS |
| `docs/05_implementation/V1_ABSCHLUSSRESTCHECK_2026-08-30.md` | V1-Abschlussnachweis | PASS |
| `docs/05_implementation/WD-19_STATUS.md` | letzter regulärer V1-Bedien-/Skalierbarkeitsblock | PASS / FROZEN |
| `docs/06_v2_planning/V2_MASTER_PLAN.md` | V2 Scope/Masterplan | APPROVED / Scope PASS |
| `docs/06_v2_planning/V2_FUNCTION_CATALOG.md` | V2 Funktionskatalog | BINDING |
| `docs/06_v2_planning/V2_ARCHITECTURE_DEPENDENCIES.md` | V2 Architektur und Abhängigkeiten | BINDING |
| `docs/06_v2_planning/V2_DEVELOPMENT_ROADMAP.md` | V2 Entwicklungsreihenfolge | BINDING |
| `docs/05_implementation/WD-20_PLAN.md` | RB-01/WD-20A–E Zerlegung | DEFINED / IMPLEMENTATION HOLD |

## Quellenregel

- Originalquellen werden nicht rückwirkend überschrieben.
- Neuere V0.2-Quellen ersetzen die V0.1-Dateien nicht als Historie, sind aber für den aktuellen fachlichen Übergang zu V2 maßgeblich.
- Der getestete V1-Codezustand wird durch Quelldokumente nicht rückwirkend verändert.
- Bei widersprüchlichen Statusangaben innerhalb einer Quelle gilt nicht automatisch der ältere Einzelstatus. Der Widerspruch wird dokumentiert und gegen spätere PASS/FROZEN-Nachweise, Abschlussrestcheck und getesteten `main`-Stand geprüft.

## Bekannter Quellenhinweis – Funktionsmatrix V0.2

Das Workbook V0.2 führt in `Übersicht` und `V2_Aktueller_Stand` den späteren Stand:

- V1 = COMPLETE / PASS / FROZEN
- V2 Scope Review = PASS
- RB-01 = Foundation & Compatibility
- WD-20A = vorgesehener erster Foundation-Teilblock

Gleichzeitig enthält `FM-01_Status` historische Einzelzeilen aus einem früheren Bearbeitungsstand, in denen einige später geschlossene V1-Funktionen noch PARTIAL oder NOT STARTED sind. Diese Zeilen werden nicht als Rückstufung des abgeschlossenen V1 interpretiert.
