# WD-18 – Inspector Diagnoseabschluss

**Stand:** 2026-08-29  
**Status:** SCOPE DEFINED  
**Branch:** `feature/wd-18-inspector-diagnostics`  
**Basis:** WD-17 PASS / FROZEN (`7eb21e277c43a4d72d9da9129a473e620f0896de`)  
**Funktionen:** `CM3D-F081` bis `CM3D-F084`

## Bestandsabgleich

### CM3D-F081 – Konsole / Debug / Diagnose

**Status vor WD-18: OFFEN.**

Es existieren einzelne `console.error`-Ausgaben in technischen Modulen, aber keine eigene CM3D-Diagnoseansicht für den Benutzer. WD-18 soll vorhandene Laufzeitinformationen kontrolliert sichtbar machen, ohne eine zweite unabhängige Fehlerlogik aufzubauen.

### CM3D-F082 – Status / Meldungen / Warnungen / Fehler

**Status vor WD-18: TEILWEISE VORHANDEN.**

`AppUI.setStatus()` zeigt bereits Statusmeldungen in der vorhandenen Statuszeile an; `AppUI.fail()` schreibt Fehler zusätzlich in die Browser-Konsole und zeigt einen Alert. Es fehlt ein dauerhaft einsehbarer Verlauf bzw. eine strukturierte Status-/Warnungs-/Fehleransicht.

WD-18 erweitert daher den bestehenden Meldungspfad, statt ihn zu ersetzen.

### CM3D-F083 – Scene JSON

**Status vor WD-18: OFFEN.**

Die Projektstruktur existiert vollständig im Store und ist serialisierbar, aber es gibt noch keine UI-Ansicht für den aktuellen Scene-/Projekt-JSON-Zustand.

WD-18 soll eine reine Diagnose-/Lesedarstellung bereitstellen. Kein Editieren des JSON im V1-Pflichtkern.

### CM3D-F084 – Selection / Auswahlstatus

**Status vor WD-18: TEILWEISE VORHANDEN.**

Der Store führt bereits:

- `selectedObjectIds`;
- `activeObjectId`;
- `hoveredObjectId`.

Der Objektbaum und Inspector reagieren darauf, aber es gibt noch keine eigene Diagnoseansicht des aktuellen Auswahlzustands. WD-18 macht diesen vorhandenen Zustand sichtbar; es wird kein neuer Selection-State eingeführt.

## Zielbild WD-18

WD-18 ergänzt einen kompakten Diagnosebereich innerhalb der bestehenden Inspector-/UI-Struktur mit vier klaren Ansichten:

1. Diagnose / Konsole – kontrollierter CM3D-Meldungsverlauf;
2. Status – Info, Warnung und Fehler aus dem bestehenden Meldungspfad;
3. Scene JSON – aktueller Projekt-/Szenenstand als formatiertes, nur lesbares JSON;
4. Selection – aktive Auswahl und Mehrfachauswahl aus dem bestehenden Store.

Die Ansichten sollen bei Bedarf geöffnet werden können und die normale Objektbearbeitung nicht dauerhaft verdrängen.

## Nicht Bestandteil WD-18

- Performance-Profiler (`CM3D-F086`, V1–V2);
- Event-Inspector (`CM3D-F085`, V1–V2);
- editierbares Scene JSON;
- Browser-DevTools-Ersatz;
- Netzwerk-/Cloud-Diagnose;
- neue Projektpersistenz;
- Objektbaum-Collapse oder Styling der Sichtbarkeits-/Sperrsymbole.

## Vorgemerkte Objektbaum-/UI-Folgepunkte

Die folgenden Punkte wurden beim realen Arbeiten mit größeren Szenen erneut bestätigt und werden nach dem V1-Diagnoseabschluss als separate UI-/Objektbaum-Aufgabe behandelt:

### UI-TREE-01 – kompakte Sichtbarkeit-/Sperrsteuerung

Die derzeitigen Sichtbarkeits- und Sperrbuttons besitzen helle/weiße Button-Hintergründe. Für eine kompaktere, ruhigere Baumdarstellung sollen diese Hintergründe entfallen bzw. auf eine reine Icon-/Hover-/Active-Darstellung umgestellt werden. Die Funktionalität aus WD-14A/WD-14B bleibt unverändert.

### UI-TREE-02 – Baugruppen/Unterbäume ein- und ausklappen

Gruppen, Baugruppen und andere Knoten mit Kindern müssen im Objektbaum auf- und zuklappbar werden. Der aktuelle Renderer baut alle Kinder immer vollständig auf. Für größere Projekte ist ein nicht persistenter UI-Collapse-State vorgesehen, der die Szenenstruktur selbst nicht verändert.

Diese beiden Punkte sind ausdrücklich vorgemerkt und werden nicht stillschweigend in WD-18 eingebaut.

## Reihenfolge

1. WD-18 F081–F084 implementieren und auf iPad/Safari abnehmen.
2. WD-18 PASS / FROZEN.
3. V1-Abschlussrestcheck.
4. Danach UI-TREE-01 / UI-TREE-02 als eigener Folgeblock einplanen, sofern der V1-Restcheck keinen höher priorisierten Block zeigt.
