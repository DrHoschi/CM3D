# CM3D – V2 Entwicklungsroadmap

**Stand:** 2026-08-30  
**Status:** ROADMAP REVIEW – PASS  
**Basis:** `V2_MASTER_PLAN.md` + `V2_FUNCTION_CATALOG.md` + `V2_ARCHITECTURE_DEPENDENCIES.md`  
**Scope:** Entwicklungsblöcke und verbindliche Abhängigkeitsreihenfolge; **noch keine WD-20-Ausarbeitung und keine Implementierung**.

## 1. Zweck

Diese Roadmap übersetzt den freigegebenen V2-Scope und die geschlossene Architektur erstmals in eine konkrete Entwicklungsreihenfolge.

Sie legt fest:

- welche technischen Fundamente vor welchen Benutzerfunktionen stehen müssen;
- welche Funktionen sinnvoll in zusammenhängenden Entwicklungsblöcken umgesetzt werden;
- welche Quality Gates einen Block abschließen;
- welche V2-SOLL-Punkte nach dem Pflichtkern folgen können;
- wo V1-Regression und Save/Load-Kompatibilität laufend geprüft werden müssen.

Die Roadmap ist **keine Sammlung einzelner F-IDs in Nummernreihenfolge**. Funktionen werden nach gemeinsamer Architektur und Abhängigkeit gebündelt.

## 2. Roadmap-Regeln

1. **Fundament vor Featurebreite.** Selection, Referenzen, Persistenz, Undo und Diagnose werden nicht erst nach den Modellierwerkzeugen ergänzt.
2. **Vertikale Nutzbarkeit erhalten.** Jeder freigegebene Entwicklungsblock soll einen testbaren Systemzustand hinterlassen.
3. **Sketch/Profil vor Featurefamilien.** Extrude-Erweiterungen, Revolve, Sweep und Loft bauen auf belastbarer Sketch-/Profil-/Pfadtopologie auf.
4. **Recompute vor Modifier-Ketten.** Fillet, Pattern, Mirror und abhängige Features werden erst auf dem kontrollierten Dependency-/Invalid-System aufgebaut.
5. **Keine parallelen Sondermodelle.** Neue Werkzeuge verwenden A1–A14 und erzeugen keine lokalen Selection-/Reference-/Undo-/Diagnosepfade.
6. **Persistenz läuft mit.** Jeder Block erweitert Save/Load und Migration für seine neuen persistierenden Daten im selben Block.
7. **V1 bleibt grün.** Nach jedem Block werden betroffene V1-Pfade regressionsgeprüft.
8. **MUSS vor SOLL.** V2-SOLL-Funktionen dürfen den Abschluss des V2-MUSS-Kerns nicht blockieren.
9. **Neue Ideen → V3-Backlog**, sofern sie keine nachgewiesene Abhängigkeit eines freigegebenen V2-MUSS-Punkts sind.
10. **WD-Zuordnung erst nach Roadmap-Freigabe.** Diese Roadmap definiert zunächst Roadmap-Blöcke `RB-*`; die konkrete WD-Nummerierung beginnt danach mit WD-20.

## 3. Gesamtfolge

Verbindliche Reihenfolge des V2-MUSS-Kerns:

`RB-01 Foundation & Compatibility`
→ `RB-02 Sketch Topology & Profiles`
→ `RB-03 Construction References & Precision`
→ `RB-04 Core 2D→3D Features`
→ `RB-05 Body Modifiers & Feature Chains`
→ `RB-06 Scene Structure & Large Projects`
→ `RB-07 Materials & Libraries`
→ `RB-08 Import / Export Workflow`
→ `RB-09 Diagnostics, Performance & V2 Integration Gate`

Danach:

`RB-10 V2-SOLL Completion` → `V2 Final Regression / Release Gate`

Die Reihenfolge ist fachlich verbindlich. Innerhalb eines Roadmap-Blocks darf die spätere WD-Planung mehrere kleine Implementierungsschritte bilden.

## 4. RB-01 – Foundation & Compatibility

### Ziel

Die V2-Grundsysteme so erweitern, dass alle nachfolgenden Modellierfunktionen auf einer gemeinsamen Selection-, Reference-, Transaction-, Diagnostic- und Persistence-Basis aufbauen können.

### Architektur

Primär: A1, A2, A6-Grundlage, A7, A11, A13, A14.

### Funktionsbezug

- F008/F009/F080/F081/F082/F084 – V2-Erweiterungsbasis
- F051 – Undo/Redo-Erweiterungsbasis
- F106/F107 – Selection-Unterelemente/Multi-Selection als gemeinsames Systemfundament
- F121 – Invalid-/Reference-Diagnosebasis

### Inhalt

- gemeinsames `SelectionRef`-Konzept für Objekt/Body/Feature/Sketch/Subobjects;
- stabile logische ID-/Reference-Grundtypen;
- gemeinsames `RESOLVED/UNRESOLVED/MISSING/INVALID/BLOCKED`-Statusmodell;
- Dependency-Graph-Grundgerüst und Zyklenschutz;
- Domänen-Transaction-Grenze für Undo/Redo;
- Viewer/Object Tree/Inspector auf gemeinsame Selection-/Statusbasis vorbereiten;
- V2-Projektschema/Versionserkennung;
- kontrollierter V1→V2-Migrationsrahmen;
- Save/Load für neue Grundstrukturen;
- Diagnoseprojektion für Referenz-/Migrationsfehler.

### Nicht enthalten

Noch keine breite neue CAD-Featurefamilie. Keine Roadmap-Abkürzung durch direkte Sweep-/Loft-/Fillet-Implementierung.

### Gate RB-01

PASS wenn:
- V1-Projekte kontrolliert laden;
- V1-Basisfunktionen weiter funktionieren;
- neue SelectionRefs gespeichert/aufgelöst werden können;
- Undo/Redo keine parallelen Zustände erzeugt;
- ungültige Referenzen sichtbar statt still repariert werden;
- Dependency-Zyklen abgewiesen werden.

## 5. RB-02 – Sketch Topology & Profiles

### Ziel

Den Sketch von einer einfachen V1-Zeichenquelle zu einer stabil adressierbaren Modellierungsquelle ausbauen.

### Architektur

Primär: A2, A3, A6, A7, A11, A13, A14.

### Funktionsbezug

- F039–F043
- F090 Sketch-Elementbearbeitung/Multiselection
- F091 Punkte/Endpunkte/topologisches Verbinden
- F092 Spline
- F094 offene Sketch-Pfade
- Profil-/Pfadanteile von F106

### Inhalt

- stabile SketchElementId/PointId;
- einzelne Elemente/Punkte auswählen, bearbeiten, löschen;
- Multi-Selection;
- echtes topologisches Verbinden von Endpunkten;
- Kreis/Bogen und Spline;
- Profilableitung mit mehreren geschlossenen Regionen und Löchern;
- offene Pfade als gültige adressierbare Quelle;
- ProfileId/PathId und R1-konforme Wiedererkennung;
- Viewer-Hervorhebung/Selektion von Profilen und Pfaden;
- Inspector-Bearbeitung;
- Save/Load/Migration und Undo/Redo für Sketchdaten.

### Gate RB-02

PASS wenn ein Sketch mehrere unabhängige Profile, Löcher und offene Pfade enthalten kann und diese nach Bearbeitung entweder eindeutig referenzierbar bleiben oder kontrolliert INVALID/UNRESOLVED werden.

## 6. RB-03 – Construction References & Precision

### Ziel

Ein gemeinsames präzises Bezugssystem für Sketches und nachfolgende Features schaffen.

### Architektur

Primär: A1, A2, A4, A13, A14; Anbindung an A3/A6/A11.

### Funktionsbezug

- F031 Pivot/Ursprung
- F032 Snap
- F034 Ausrichten
- F036 Abstand
- F037 Winkel
- F038 gespeicherte Bemaßung
- F095 Sketch auf planarer Körperfläche
- F096 Arbeitsebenen
- F108 Konstruktions-/Hilfslinien

### Inhalt

- globale und freie/Offset-/geometriebezogene Work Planes;
- Sketch auf planarer Body-Face;
- stabile Face-/Plane-Referenzen;
- Construction Lines/Axes;
- zentrales Snap auf Raster/Punkt/Kante/Fläche/Mittelpunkt;
- Ausrichten an Objekt/Fläche/Kante/Punkt;
- Distanz-/Winkelmessung;
- exakte Koordinaten/Positionen;
- gespeicherte sichtbare Bemaßungen;
- Pivot-Bearbeitung;
- Invalid-Fortpflanzung bei verlorenen Bezugsflächen.

### Gate RB-03

PASS wenn ein Sketch/Feature reproduzierbar auf globalen, freien und planaren Face-Bezügen aufgebaut werden kann und Mess-/Snap-/Align-Werkzeuge dieselben Referenzen verwenden.

## 7. RB-04 – Core 2D→3D Features

### Ziel

Die vollständige V2-MUSS-Kette von stabilen Profilen/Pfaden zu den zentralen 3D-Erzeugungsfeatures herstellen.

### Architektur

Primär: A2–A7, A11, A13, A14.

### Funktionsbezug

- F044 Extrudieren – V2-Erweiterung
- F098 Thin Extrude
- F099 Revolve
- F100 Sweep
- F101 Loft
- F047 Kugel/Kegel/Ebene
- F048 Rohr/Torus

### Inhalt

- Extrude auf konkrete Profile;
- Multi-Profil;
- Add/Subtract/Reverse;
- Thin Extrude aus offenen Pfaden;
- Revolve mit stabiler Achsenreferenz;
- Sweep entlang Linie/Bogen/Spline mit reproduzierbarer Grundorientierung;
- Loft über mehrere Profile/Arbeitsebenen;
- bestehende V1–V2-Primitivfamilien F047/F048 kontrolliert abschließen;
- Feature SourceRefs/Parameters/Output;
- Save/Load, Undo/Redo, Diagnose und Recompute je Featuretyp.

### Gate RB-04

PASS wenn die Featurequellen editierbar bleiben und eine Quellenänderung deterministisch recomputet bzw. bei nicht mehr gültiger Quelle kontrolliert BLOCKED/INVALID propagiert.

## 8. RB-05 – Body Modifiers & Feature Chains

### Ziel

Aus einzelnen Erzeugungsfeatures eine belastbare sequentielle Modellierungskette machen.

### Architektur

Primär: A2, A5, A6, A7, A11, A13, A14.

### Funktionsbezug

- F033 Body/Feature Mirror
- F052 Boolean Union/Subtract/Intersect
- F053 Bevel-Anteil
- F102 Fillet
- F103 Linear Pattern
- F104 Radial Pattern
- F105 Feature-Abhängigkeiten anzeigen

### Inhalt

- Boolean-Operationen mit stabilen Body-Quellen;
- Bevel und Fillet mit stabilen EdgeRefs und Multi-Edge-Auswahl;
- Mirror auf Body/Feature mit Plane-Referenz;
- lineare/radiale Patterns auf Body/Feature;
- sichtbare minimale Feature-/Dependency-Struktur;
- deterministische Ketten wie `Sketch → Extrude → Fillet → Pattern`;
- kontrollierte BLOCKED-Fortpflanzung;
- Reparatur und erneuter Recompute nach wieder gültiger Quelle.

### Gate RB-05

PASS wenn mindestens mehrere repräsentative mehrstufige Featureketten nach Quellenänderung korrekt recomputen und bei nicht eindeutig wiedererkennbarer Kante/Fläche gemäß R1 abbrechen statt falsch zu rebinden.

## 9. RB-06 – Scene Structure & Large Projects

### Ziel

Komplexe Szenen und Baugruppen organisatorisch und performant beherrschbar machen.

### Architektur

Primär: A1, A8, A11, A13, A14; Performance-Instrumentierung über A7.

### Funktionsbezug

- F003 Letzte Projekte
- F008/F009 Objektbaum/Auswahl
- F015 Layers
- F109 Objektbaum-Suche
- F110 Reparenting
- F086 Performance
- F089 QA-Bezug große Welt/kleine Objekte

### Inhalt

- Layers mit Sichtbarkeit/Sperre/Zuweisung;
- Suche im Object Tree;
- kontrolliertes Reparenting ohne Dependency-Manipulation;
- große Multi-Selections;
- skalierbares Tree-/Viewer-Verhalten;
- Performanceanzeige und definierte größere Testprojekte;
- Recent Projects/Quick Reopen gegen V2-Projektschema absichern.

### Gate RB-06

PASS wenn größere repräsentative Baugruppen strukturiert, gesucht, selektiert, umgruppiert und gespeichert werden können, ohne Scene-Hierarchy und Feature-Dependency zu vermischen.

## 10. RB-07 – Materials & Libraries

### Ziel

Wiederverwendbare Material-, Sketch- und Objektinhalte auf den gemeinsamen V2-Datenmodellen aufbauen.

### Architektur

Primär: A9, A10, A11, A13, A14; Referenzen über A2.

### Funktionsbezug

- F054–F062
- F069–F071
- F097 Sketch Templates
- F114 Materialdefinitionen/Varianten
- F117 Bibliotheksmetadaten

### Inhalt

- Texturen, Metallic, Roughness, Transparenz, Presets;
- MaterialDefinition versus MaterialBinding;
- Shared Material versus Local Variant;
- Multi-Objekt-Materialzuweisung;
- Material entfernen/reset;
- Objekt-/Baugruppenbibliothek;
- Sketch Templates speichern/einfügen;
- unabhängige Geometriekopie beim Einfügen;
- gemeinsame Library Registry mit typgetrennten Payloads;
- Name/Kategorie und notwendige Metadaten;
- Save/Load/Undo für Bindings und eingefügte Inhalte.

### Gate RB-07

PASS wenn gemeinsame Materialien tatsächlich gemeinsam aktualisieren, lokale Varianten unabhängig bleiben und Sketch-/Objekt-/Baugruppenbibliotheken keine versteckten Linked-Instance-Abhängigkeiten erzeugen.

## 11. RB-08 – Import / Export Workflow

### Ziel

Native Projektdaten, Library Payloads und Fremdformate praktisch sauber trennen und den zentralen Export-Workflow umsetzen.

### Architektur

Primär: A5, A11, A12, A14.

### Funktionsbezug

- F072 GLB/GLTF Import – Bestandsschutz
- F073 OBJ/STL Import
- F075 GLB/GLTF Export – V1-Bestand
- F076 OBJ/STL Export
- F077 Export Auswahl – V1-Bestand
- F078 Export Baugruppe
- F079 Projekt/JSON – native Datenabgrenzung
- F119 Zentraler Export-Workflow
- F120 Exportoptionen

### Inhalt

- normalisierte Importergebnisse;
- ImportedBody/ImportedMeshObject ohne erfundene Feature-Historie;
- OBJ/STL Import;
- GLB/GLTF Import regressionssicher;
- `Datei → Exportieren…` als einziger zentraler Export-Einstieg;
- Export Descriptor mit Ziel, Format, Units, Scale, Transform, Hierarchie-/Materialpolicy soweit unterstützt;
- OBJ/STL/GLB/GLTF-Adapter auf bestehende Fähigkeiten aufsetzen;
- Auswahl-/Baugruppenexport;
- klare Kommunikation, dass Austauschformat kein natives Projektbackup ist.

### Gate RB-08

PASS wenn alle unterstützten Formate denselben zentralen Exportpfad verwenden und Import/Export weder native Feature-Historie erfindet noch formatfremde Datenverlusterhaltung verspricht.

## 12. RB-09 – Diagnostics, Performance & V2 Integration Gate

### Ziel

Den vollständigen V2-MUSS-Kern als zusammenhängendes Produkt prüfen und die querschnittlichen Diagnose-/Performancepflichten schließen.

### Architektur

A7/A14 plus instrumentierte Zustände aller A1–A13-Systeme.

### Funktionsbezug

- F081/F082/F085/F086
- F121
- alle V2-MUSS-Funktionen als Integrationsumfang

### Inhalt

- zentrale Invalid-/Unresolved-/Blocked-Übersicht;
- Fehlerursache bis zur Quelle nachvollziehbar;
- Event-/Interaktionsdiagnose;
- Performanceanzeige;
- V1→V2-Migrationstests;
- Save/Load-Roundtrips komplexer V2-Projekte;
- Undo/Redo über mehrstufige Modellierungsketten;
- große reale Projekt-/Baugruppentests;
- iPad/Safari-Gerätetest für relevante Bedienpfade;
- vollständiger V1-Regressionslauf.

### Gate RB-09

PASS nur wenn:
- alle V2-MUSS-Funktionen funktional PASS sind;
- keine offenen V2-MUSS-Blocker bestehen;
- V1-FROZEN-Funktionen nicht regressiert sind;
- komplexe Featureketten Save/Load/Undo/Recompute überstehen;
- Invalid-Zustände reproduzierbar und diagnostizierbar sind;
- definierte große Testprojekte innerhalb akzeptierter Bedienbarkeit bleiben.

Mit RB-09 ist der **V2-MUSS-Kern funktional vollständig**.

## 13. RB-10 – V2-SOLL Completion

### Ziel

Nach geschlossenem MUSS-Kern die freigegebenen V2-SOLL-Funktionen kontrolliert bewerten und – soweit für V2 vorgesehen – abschließen, ohne den Kern wieder strukturell zu öffnen.

### Kandidaten

- F025 Vierfachansicht
- F065 Lichtobjekte
- F066 Screenshot/Preview
- F074 eigenes CMO/CMU-Austauschformat – Entscheidung offen
- F093 grundlegende Sketch-Constraints
- F111 Objektbaum-Filter
- F112 Drag-&-Drop-Reparenting
- F113 GLB/GLTF-Unterhierarchie
- F115 konstruktive Objekt-/Flächenfarbe
- F116 Umgebung/Hintergrund
- F118 Bibliotheksvorschau/Thumbnail
- F122 Objekt-/Szenenstatistik
- F123 detaillierte Profiler-Ansicht
- F124 Diagnoseexport
- SOLL-Erweiterungen von Extrude/Sweep/Loft/Sketch Mirror/Material-Export
- Shell/Hohlkörper und Cut/Knife gemäß freigegebenem Scope, sofern vor Umsetzung kontrolliert katalogisiert/zugeordnet.

### Regel

Ein SOLL-Punkt darf nur umgesetzt werden, wenn er die bereits PASS gesetzten MUSS-Systeme nicht durch eine unkontrollierte Architekturänderung wieder öffnet. Wird eine Architekturänderung nötig, erfolgt zuerst ein dokumentierter Architecture Change Review.

### Gate RB-10

Alle für den konkreten V2-Release ausgewählten SOLL-Punkte sind entweder PASS oder ausdrücklich als nicht release-blockierend deferred dokumentiert.

## 14. Querschnittliche Gates in jedem Roadmap-Block

Jeder RB-Block muss vor PASS mindestens prüfen:

- Domain-/Reference-Invarianten;
- Save/Load-Roundtrip der neu eingeführten Daten;
- V1-Migrations-/Bestandsschutz soweit betroffen;
- Undo/Redo der neuen Benutzeränderungen;
- INVALID/UNRESOLVED/BLOCKED-Verhalten;
- Viewer/Object Tree/Inspector-Synchronität soweit betroffen;
- relevante Regression bestehender Funktionen;
- Gerätetest, wenn Bedienoberfläche oder iPad/Safari-Pfad betroffen ist.

Ein Block darf nicht PASS/FROZEN werden, wenn seine Daten nur im laufenden Browserzustand funktionieren, aber Save/Load oder Undo nicht geschlossen sind.

## 15. Abhängigkeitsbegründung der Reihenfolge

### RB-01 vor RB-02
Sketch-Unterelemente und Profile benötigen stabile SelectionRefs, IDs, Persistenz und Undo.

### RB-02 vor RB-03/RB-04
Work Planes und Featurequellen müssen auf adressierbare Sketch-/Profil-/Pfadstrukturen zeigen können.

### RB-03 vor RB-04/RB-05
Revolve, Mirror, Pattern und Face-Sketching benötigen stabile Ebenen/Achsen/Geometriereferenzen.

### RB-04 vor RB-05
Modifier brauchen belastbare Bodies und Featureoutputs als Quellen.

### RB-05 vor RB-06–RB-08 Integration
Erst mit realen Featureketten können Scene-Skalierung, Bibliotheken und Export auf repräsentativer V2-Geometrie getestet werden.

### RB-06/RB-07 vor finalem Export-/Integrationstest
Export von Baugruppen und Materialien muss auf der finalen Scene-/Material-/Library-Semantik aufsetzen.

### RB-08 vor RB-09
Import-/Export-Grenzen müssen vor dem Gesamtintegrationsgate geschlossen sein.

### RB-09 vor RB-10
SOLL-Ausbau darf den Abschluss des Pflichtkerns nicht verzögern oder dessen Architektur destabilisieren.

## 16. Bewusst keine zu frühe WD-Zerlegung

Diese Roadmap legt **neun MUSS-Roadmap-Blöcke plus einen SOLL-Abschlussblock** fest. Sie legt noch nicht fest, ob ein RB später genau einem WD oder mehreren kleinen WD-Schritten entspricht.

Beispiel:

`RB-02 Sketch Topology & Profiles`

kann später kontrolliert in mehrere WD-Schritte zerlegt werden, ohne Sketch/Profil/Pfad als fachlichen Block auseinanderzureißen.

Damit vermeiden wir eine künstliche Zuordnung wie „WD-20 = alles Fundament, WD-21 = alles Sketch“ bevor Aufwand und vorhandener Code des jeweiligen Blocks geprüft wurden.

## 17. Roadmap-Risikoprüfung

### RR-01 Feature vor Fundament
**PASS** – RB-01 schließt gemeinsame Systeme vor neuer Featurebreite.

### RR-02 Sketch und Profil auseinandergerissen
**PASS** – RB-02 behandelt Sketch-Topologie, Profile und Pfade als zusammenhängenden Block.

### RR-03 Work Planes zu spät
**PASS** – RB-03 liegt vor Revolve/Sweep/Loft/Modifiern.

### RR-04 Recompute erst nach Modifiern
**PASS** – Graph-/Statusbasis startet in RB-01 und wird in RB-02–RB-05 vertikal genutzt.

### RR-05 Save/Load am Ende nachgerüstet
**PASS** – Persistenz/Migration ist Gate jedes Blocks.

### RR-06 V1-Regression erst beim Release geprüft
**PASS** – Regression ist querschnittliches Gate jedes Blocks und zusätzlich RB-09.

### RR-07 Import/Export vermischt native Daten
**PASS** – RB-08 folgt A11/A12 und R3/R3a.

### RR-08 SOLL blockiert MUSS-Kern
**PASS** – RB-10 liegt hinter RB-09.

### RR-09 GLB-Hierarchie blockiert Modellierung
**PASS** – F113 bleibt RB-10/SOLL.

### RR-10 WD-20 voreilig vergeben
**PASS** – Roadmap verwendet zunächst RB-Nummern; WD-20 wird erst nach Roadmap-Freigabe konkretisiert.

## 18. Roadmap-Abschluss

**V2 Development Roadmap: COMPLETE**  
**Roadmap Review: PASS**  
**Open Roadmap Blockers: 0**  
**MUSS Roadmap Blocks: 9**  
**SOLL Completion Block: 1**

Damit ist die vollständige V2-Planungskette fachlich geschlossen:

`V1 Freeze → V2 Scope Definition → V2 Funktionskatalog → Abhängigkeiten/Architektur → V2 Entwicklungsroadmap`

Der nächste zulässige Schritt ist jetzt **erstmals die konkrete Ableitung von WD-20 aus RB-01 – Foundation & Compatibility**.

Dabei muss WD-20 vor Implementierungsbeginn noch auf den aktuellen Repository-Codebestand zugeschnitten und in kleine, kontrolliert testbare Teilpakete zerlegt werden. Die Roadmap selbst schreibt nicht vor, dass der gesamte RB-01 in einem einzigen WD umgesetzt werden muss.
