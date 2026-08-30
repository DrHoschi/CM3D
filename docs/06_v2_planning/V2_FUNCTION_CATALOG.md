# CM3D – V2 Funktionskatalog

**Stand:** 2026-08-30  
**Status:** BINDING CATALOG – V2 SCOPE REVIEW PASS  
**Basis:** `V2_MASTER_PLAN.md` + `CM3D_MASTER_FUNCTIONS_V0_1.md`  
**Regel:** Keine Implementierung, keine Entwicklungsroadmap und keine WD-20-Vergabe aus diesem Dokument ableiten, bevor der nachfolgende Architektur-/Abhängigkeitsabgleich abgeschlossen ist.

## 1. Zweck

Dieser Katalog ist der kontrollierte F-ID-Abgleich zwischen der FROZEN Master-Funktionsliste V0.1 und dem freigegebenen V2-Scope.

Er erfüllt vier Aufgaben:

1. bestehende F-IDs unverändert erhalten;
2. bewusst aus `Später` nach V2 vorgezogene Funktionen explizit kennzeichnen;
3. neue V2-Funktionen kontrolliert ab `CM3D-F090` vergeben;
4. V1-Bestand von V2-Erweiterungen trennen, damit bestehende V1-Funktionen nicht versehentlich demotiert oder doppelt angelegt werden.

## 2. Statusbegriffe

- **V1 BASELINE** – bereits V1; bleibt vollständig erhalten und wird nicht als neue V2-Funktion gezählt.
- **V2 MUSS** – Bestandteil des freigegebenen V2-Kerns und blockiert den V2-Abschluss.
- **V2 SOLL** – gewünschter V2-Ausbau, blockiert den V2-Kern jedoch nicht.
- **V3** – bewusst nicht Teil des V2-Kerns.
- **V2 MUSS-ERWEITERUNG** – bestehende V1-Funktion bleibt erhalten und bekommt in V2 einen verbindlichen erweiterten Umfang.
- **V2 SOLL-ERWEITERUNG** – optionale Erweiterung einer bestehenden Funktion.

## 3. Abgleichkorrekturen aus der FROZEN Masterliste

Beim F-ID-Abgleich wurden drei Punkte normalisiert:

1. `CM3D-F075 Export GLB/GLTF` ist bereits **V1**. Der bestehende Export wird deshalb nicht als V2-SOLL demotiert. Nur zusätzliche V2-Exportfähigkeiten wie verbesserte Material-/Hierarchieerhaltung sind SOLL-Erweiterungen.
2. `CM3D-F077 Export Auswahl` ist bereits **V1**. Der V2-Scope „ausgewähltes Objekt exportieren“ verwendet diese vorhandene ID und erzeugt keine neue Funktion.
3. `CM3D-F047 Kugel/Kegel/Ebene` und `CM3D-F048 Rohr/Torus` stehen bereits in der Masterliste als **V1–V2**, waren aber im A–K-Scope nicht separat aufgeführt. Sie bleiben als bereits vorgesehene V2-Funktionen erhalten und werden nicht versehentlich gestrichen.

Die FROZEN V0.1-Masterliste selbst wird durch diesen Katalog nicht verändert.

## 4. Bestehende F-IDs – verbindliche V2-Zuordnung

| ID | Funktion | V2-Zuordnung | Herkunft / Änderung |
|---|---|---|---|
| CM3D-F003 | Letzte Projekte | **V2 MUSS** | V1–V2 → bestätigt |
| CM3D-F008 | Objektbaum | **V1 BASELINE + V2 MUSS-ERWEITERUNG** | Suche/Reparenting/Dependency-Anzeige über neue IDs |
| CM3D-F009 | Objekt auswählen | **V1 BASELINE + V2 MUSS-ERWEITERUNG** | zentrale Mehrfach-/Subobject-Auswahl über neue IDs |
| CM3D-F015 | Ebenen/Layers | **V2 MUSS** | V1–V2 → bestätigt; inkl. Sichtbarkeit/Sperre/Zuweisung |
| CM3D-F024 | Darstellungsmodi | **V2 MUSS** | V1–V2 → bestätigt; konstruktionsgeeignete Modi |
| CM3D-F025 | Vierfachansicht | **V2 SOLL** | V1–V2 → bewusst nicht V2-Kern |
| CM3D-F031 | Ursprung/Mittelpunkt | **V2 MUSS** | V1–V2 → bestätigt; Pivot-Bearbeitung |
| CM3D-F032 | Snap | **V2 MUSS-ERWEITERUNG** | Raster + Punkt/Vertex + Kante + Fläche + Mittelpunkt |
| CM3D-F033 | Spiegeln | **V2 MUSS** | `Später` → bewusst nach V2 vorgezogen; Body/Feature Mirror. Sketch Mirror = SOLL-Erweiterung |
| CM3D-F034 | Ausrichten | **V2 MUSS** | `Später` → bewusst nach V2 vorgezogen |
| CM3D-F036 | Lineal/Abstand | **V2 MUSS** | V1–V2 → bestätigt |
| CM3D-F037 | Winkel messen | **V2 MUSS** | `Später` → bewusst nach V2 vorgezogen |
| CM3D-F038 | Bemaßung anzeigen | **V2 MUSS** | gespeicherte sichtbare Bemaßung; treibende Parametrik nicht enthalten |
| CM3D-F039 | 2D-Skizzenmodus | **V1 BASELINE + V2 MUSS-ERWEITERUNG** | neuer Sketch-Kern baut darauf auf |
| CM3D-F040 | Linien | **V1 BASELINE** | bleibt Sketch-Grundelement |
| CM3D-F041 | Rechteck/Polygon | **V1 BASELINE** | bleibt Sketch-Grundelement |
| CM3D-F042 | Kreis/Bogen | **V2 MUSS** | V1–V2 → bestätigt |
| CM3D-F043 | Profile | **V2 MUSS-ERWEITERUNG** | Mehrprofil, Löcher, stabile Profile, Viewer-Selektion |
| CM3D-F044 | Extrudieren | **V1 BASELINE + V2 MUSS-ERWEITERUNG** | Profilquelle, Multi-Profil, Add/Subtract, Reverse |
| CM3D-F047 | Kugel/Kegel/Ebene | **V2 MUSS** | vorhandener V1–V2-Punkt; Bestandsübernahme aus Masterliste |
| CM3D-F048 | Rohr/Torus | **V2 MUSS** | vorhandener V1–V2-Punkt; Bestandsübernahme aus Masterliste |
| CM3D-F051 | Undo/Redo | **V1 BASELINE + V2 MUSS-ERWEITERUNG** | alle neuen V2-Modellieroperationen müssen integriert werden |
| CM3D-F052 | Boolean Union/Subtract/Intersect | **V2 MUSS** | `Später` → bewusst nach V2 vorgezogen |
| CM3D-F053 | Bevel/Cut/Knife | **GEMISCHT** | Bevel = **V2 MUSS**; Cut/Knife = **V2 SOLL**; bestehende ID bleibt unverändert |
| CM3D-F054 | Material zuweisen | **V1 BASELINE + V2 MUSS-ERWEITERUNG** | Multi-Objekt + Materialdefinitionen |
| CM3D-F055 | Farbe/Base Color | **V1 BASELINE** | bleibt erhalten |
| CM3D-F056 | Texturen | **V2 MUSS** | V1–V2 → bestätigt |
| CM3D-F057 | Metallisch | **V2 MUSS** | V1–V2 → bestätigt |
| CM3D-F058 | Rauigkeit | **V2 MUSS** | V1–V2 → bestätigt |
| CM3D-F059 | Transparenz | **V2 MUSS** | V1–V2 → bestätigt |
| CM3D-F060 | Materialtypen/Presets | **V2 MUSS** | V1–V2 → bestätigt |
| CM3D-F061 | Materialbibliothek | **V2 MUSS-ERWEITERUNG** | wiederverwendbare Definitionen, gemeinsame Referenzen/lokale Varianten |
| CM3D-F062 | Material entfernen | **V2 MUSS** | V1–V2 → bestätigt |
| CM3D-F065 | Lichtobjekte | **V2 SOLL** | V1–V2 → bewusst nicht Kern |
| CM3D-F066 | Screenshot/Preview | **V2 SOLL** | V1–V2 → bewusst nicht Kern |
| CM3D-F069 | Objektbibliothek | **V2 MUSS-ERWEITERUNG** | Metadaten/Struktur über neue Bibliotheksfunktionen |
| CM3D-F070 | Zur Bibliothek hinzufügen | **V2 MUSS** | Objekt und Baugruppe |
| CM3D-F071 | Aus Bibliothek einfügen | **V2 MUSS** | standardmäßig unabhängige Geometriekopie |
| CM3D-F072 | Import GLB/GLTF | **V1 BASELINE** | Bestandsschutz; Hierarchieausbau separat SOLL |
| CM3D-F073 | Import OBJ/STL | **V2 MUSS** | V1–V2 → bestätigt |
| CM3D-F074 | Import CMO/CMU | **V2 SOLL / ENTSCHEIDUNG OFFEN** | `Später`; eigenes natives Austauschformat blockiert V2 nicht |
| CM3D-F075 | Export GLB/GLTF | **V1 BASELINE + V2 SOLL-ERWEITERUNG** | bestehender V1-Export bleibt; zusätzliche Material-/Hierarchieerhaltung SOLL |
| CM3D-F076 | Export OBJ/STL | **V2 MUSS** | V1–V2 → bestätigt |
| CM3D-F077 | Export Auswahl | **V1 BASELINE** | bereits vorhanden; keine neue V2-ID |
| CM3D-F078 | Export Baugruppe | **V2 MUSS** | V1–V2 → bestätigt |
| CM3D-F079 | Export JSON/Projektdatei | **V1 BASELINE** | natives Projekt-/Datenthema bleibt getrennt von Fremdformaten |
| CM3D-F080 | Eigenschaftenpanel | **V1 BASELINE + V2 MUSS-ERWEITERUNG** | Sketch-/Feature-/Referenzparameter anzeigen/bearbeiten |
| CM3D-F081 | Konsole/Debug/Diagnose | **V1 BASELINE + V2 MUSS-ERWEITERUNG** | Invalid-/Blocked-Ursachen sichtbar machen |
| CM3D-F082 | Status/Meldungen/Warnungen/Fehler | **V1 BASELINE + V2 MUSS-ERWEITERUNG** | Feature-/Referenzfehler integrieren |
| CM3D-F084 | Selection/Auswahlstatus | **V1 BASELINE + V2 MUSS-ERWEITERUNG** | Subobject-/Multi-Selection |
| CM3D-F085 | Events | **V2 MUSS** | V1–V2 → bestätigt |
| CM3D-F086 | Performance | **V2 MUSS** | V1–V2 → bestätigt |
| CM3D-F089 | Große Welt / kleine Objekte | **V1 BASELINE + V2 QA-BEZUG** | V2-Skalierbarkeit darf V1-Leistungsziel nicht regressieren |

## 5. Neue V2-Funktionen – reservierte F-IDs

### Sketch / Profile / Bezug

| ID | Funktion | Priorität | Scope |
|---|---|---|---|
| CM3D-F090 | Sketch-Elementbearbeitung und Sketch-Multiselection | **V2 MUSS** | einzelne Elemente auswählen/löschen/bearbeiten; Mehrfachauswahl |
| CM3D-F091 | Sketch-Punkte/Endpunkte und topologisches Verbinden | **V2 MUSS** | Punkte adressieren; Endpunkte real verbinden/koinzident halten |
| CM3D-F092 | Spline | **V2 MUSS** | Sketch-Element und Sweep-Pfad |
| CM3D-F093 | Grundlegende Sketch-Constraints | **V2 SOLL** | horizontal, vertikal, parallel, rechtwinklig, tangential |
| CM3D-F094 | Offene Sketch-Pfade | **V2 MUSS** | eigenständige Modellierungsquelle neben geschlossenen Profilen |
| CM3D-F095 | Sketch auf planarer Körperfläche | **V2 MUSS** | lokale Bezugsebene und stabile Face-Referenz |
| CM3D-F096 | Arbeitsebenen | **V2 MUSS** | freie planare Ebene, Offset-Ebene, einfache Ebene aus Geometriebezügen |
| CM3D-F097 | Sketch Templates / Sketch Library | **V2 MUSS** | speichern/einfügen; unabhängige bearbeitbare Kopie; Basispunkt/Position/Rotation |

### 2D → 3D / Modellierung

| ID | Funktion | Priorität | Scope |
|---|---|---|---|
| CM3D-F098 | Thin Extrude | **V2 MUSS** | offene Pfade; Dicke, Seite, zentrierte Dicke |
| CM3D-F099 | Revolve | **V2 MUSS** | Profil um definierte Achse |
| CM3D-F100 | Sweep | **V2 MUSS** | Profil entlang Linie/Bogen/Spline; reproduzierbare Grundorientierung |
| CM3D-F101 | Loft | **V2 MUSS** | mehrere Profile auf unterschiedlichen Ebenen |
| CM3D-F102 | Fillet/Abrundung | **V2 MUSS** | Kantenbasierte Abrundung; Multi-Edge-fähig |
| CM3D-F103 | Lineares Pattern | **V2 MUSS** | Feature/Body, Richtung, Anzahl, Abstand |
| CM3D-F104 | Radiales Pattern | **V2 MUSS** | Feature/Body, Achse, Anzahl, Winkel |
| CM3D-F105 | Feature-Abhängigkeiten anzeigen | **V2 MUSS** | minimale sichtbare Quelle→Feature→Feature-Struktur; kein voller History Tree |

### Konstruktion / Auswahl / Szene

| ID | Funktion | Priorität | Scope |
|---|---|---|---|
| CM3D-F106 | Geometrie-Unterelemente auswählen | **V2 MUSS** | Fläche, Kante, Punkt/Vertex, Profil, Pfad, Feature |
| CM3D-F107 | Erweiterte Mehrfachauswahl | **V2 MUSS** | große Objektmengen und unterstützte Unterelemente |
| CM3D-F108 | Konstruktions-/Hilfslinien | **V2 MUSS** | persistente Konstruktionselemente für Achsen/Bezüge/Messung |
| CM3D-F109 | Objektbaum-Suche | **V2 MUSS** | große Szenen gezielt durchsuchen |
| CM3D-F110 | Reparenting / Objektbaum umstrukturieren | **V2 MUSS** | Hierarchie kontrolliert ändern |
| CM3D-F111 | Objektbaum-Filter | **V2 SOLL** | Filter zusätzlich zur Suche |
| CM3D-F112 | Drag-&-Drop-Reparenting | **V2 SOLL** | UI-Komfort auf Basis von F110 |
| CM3D-F113 | GLB/GLTF-Unterhierarchie | **V2 SOLL** | interne Nodes/Meshes adressierbar; separat sichtbar/sperrbar/transformierbar |

### Material / Darstellung / Bibliothek

| ID | Funktion | Priorität | Scope |
|---|---|---|---|
| CM3D-F114 | Gemeinsame Materialdefinitionen und lokale Materialvarianten | **V2 MUSS** | verknüpfte Definitionen vs. unabhängige Kopie |
| CM3D-F115 | Objekt-/Flächen-Anzeigefarbe unabhängig vom Material | **V2 SOLL** | konstruktive Farbkennzeichnung |
| CM3D-F116 | Umgebung/Hintergrund | **V2 SOLL** | einfache Viewer-Umgebung, kein Rendering-System |
| CM3D-F117 | Bibliotheksmetadaten | **V2 MUSS** | Name/Kategorie; gemeinsame Library-Grundlogik |
| CM3D-F118 | Bibliotheksvorschau / Thumbnail | **V2 SOLL** | für Objekt-/Sketch-Bibliothek soweit anwendbar |

### Import / Export

| ID | Funktion | Priorität | Scope |
|---|---|---|---|
| CM3D-F119 | Zentraler Export-Workflow | **V2 MUSS** | `Datei → Exportieren…`; Exportgegenstand, Format und Optionen im nachgelagerten Workflow |
| CM3D-F120 | Exportoptionen / Formatparameter | **V2 MUSS** | für unterstützte Formate mindestens sinnvolle Einheiten/Skalierung/Transformationen; formatabhängige Optionen |

### Diagnose / Produktivität / Performance

| ID | Funktion | Priorität | Scope |
|---|---|---|---|
| CM3D-F121 | Ungültige Features/Referenzen zentral auffinden | **V2 MUSS** | INVALID/UNRESOLVED/BLOCKED samt Ursache |
| CM3D-F122 | Objekt-/Szenenstatistik | **V2 SOLL** | grundlegende struktur-/leistungsbezogene Kennzahlen |
| CM3D-F123 | Detaillierte Profiler-Ansicht | **V2 SOLL** | erweiterte Performanceanalyse, kein vollständiges Dev-System |
| CM3D-F124 | Diagnoseexport | **V2 SOLL** | Diagnoseinformationen kontrolliert exportieren |

## 6. Funktionen ohne neue F-ID – bewusst als Erweiterungsumfang geführt

Folgende Scope-Punkte erhalten keine eigene neue F-ID, weil sie fachlich Teil einer vorhandenen Funktion sind:

- Multi-Profil, Löcher und stabile Profilwahl → `CM3D-F043 Profile`.
- additive/subtraktive/reverse Extrusion → `CM3D-F044 Extrudieren`.
- erweiterte Snap-Ziele → `CM3D-F032 Snap`.
- Layer-Sichtbarkeit/Sperre/Zuweisung → `CM3D-F015 Ebenen/Layers`.
- Material auf mehrere Objekte → `CM3D-F054 Material zuweisen` + `CM3D-F114`.
- Objekt/Baugruppe zur Bibliothek → `CM3D-F070`.
- unabhängige Bibliothekskopie beim Einfügen → Semantik von `CM3D-F071`/`CM3D-F097`.
- ausgewähltes Objekt exportieren → bereits `CM3D-F077 Export Auswahl`.
- Fehler/Warnungen sichtbar machen → Erweiterung `CM3D-F081/F082`; die zentrale Invalid-Liste ist `CM3D-F121`.
- genaue Koordinaten/Positionen → vorhandene Transform-/Inspector-Funktionen `CM3D-F026–F030/F080`.
- V1-Projektmigration/Save-Load → querschnittliche Architekturpflicht, keine Benutzerfunktion mit eigener F-ID.
- stabile IDs, Reference Graph, Dependency Graph, Recompute-Reihenfolge und INVALID/BLOCKED-Semantik → Architektur-MUSS, keine künstlichen Menüfunktionen.

## 7. V2-SOLL-Erweiterungen innerhalb bestehender MUSS-Funktionen

Diese Erweiterungen erhalten zunächst keine zusätzliche F-ID und blockieren den Kern nicht:

- Extrude symmetrisch, bis Fläche/Objekt, Draft/Taper.
- Sweep Twist und erweiterte Orientierungsmodi.
- Loft-Leitkurven.
- Sketch Mirror als Erweiterung zu F033.
- parametrisch steuernde Bemaßungen abhängig vom Constraint-Umfang.
- zusätzliche Material-/Texturerhaltung bei GLB/GLTF-Export.
- Skalierung, Constraints, Kategorien/Tags und Preview bei Sketch Templates, soweit nicht bereits über F117/F118 abgedeckt.

Wenn eine dieser Erweiterungen vor Implementierung zu einem eigenständigen Werkzeug mit eigener Bedienlogik wird, muss vor Vergabe einer weiteren F-ID ein kontrollierter Katalog-Nachtrag erfolgen.

## 8. V3-Grenze – keine V2-F-ID reserviert

Für folgende bewusst außerhalb des V2-Kerns liegende Funktionen werden in diesem Katalog keine neuen V2-F-IDs reserviert:

- vollständiger parametrischer Constraint-Solver;
- vollständiges professionelles Topological Naming;
- Skizzieren/Wrap auf gekrümmten Flächen;
- frei reorderbarer/suppressierbarer History-/Modifier-Stack;
- komplexe 3D-Constraints;
- komplexe dauerhaft verknüpfte Geometrieinstanzen;
- STEP/IGES;
- fotorealistisches Rendering;
- Render-Postprocessing;
- komplexe Node-/Shader-Netzwerke;
- vollständiges Developer-Debug-/Profiling-System;
- umfassende automatische LOD-/Performanceoptimierung.

## 9. Querschnittliche Architekturregeln

Die folgenden Regeln aus dem Scope Review bleiben unabhängig von F-IDs verbindlich:

- **R1:** stabile logische Referenzen; bei nicht eindeutiger Wiedererkennung `INVALID/UNRESOLVED`, niemals stilles Rebinding.
- **R2:** deterministischer Recompute; abhängige Features werden bei ungültiger Quelle `BLOCKED/INVALID` und nicht aus veralteter Geometrie weitergeführt.
- **R3:** native CM3D-Projektdaten, Bibliotheksinhalte und Fremd-/Austauschformate bleiben getrennte Datenklassen.
- **R3a:** ein zentraler Export-Einstieg `Datei → Exportieren…`; keine überladene Sammlung einzelner Export-Menüpunkte.

Zusätzlich verbindlich: zentrales Selection-System, Reference-System, Dependency Graph, Save/Load aller V2-Strukturen, V1→V2-Kompatibilitäts-/Migrationspfad, Undo/Redo-Integration sowie gemeinsame Viewer-/Objektbaum-/Inspector-Datenbasis.

## 10. F-ID-Reservierungsstand

- bestehende FROZEN IDs: `CM3D-F001` bis `CM3D-F089` unverändert.
- neue V2-Reservierung in diesem Katalog: `CM3D-F090` bis `CM3D-F124`.
- keine neue ID ersetzt oder überschreibt eine bestehende ID.
- keine V3-Funktion erhält vorsorglich eine V2-ID.

## 11. Katalogstatus und nächster Schritt

**V2 FUNKTIONSKATALOG: COMPLETE / BINDING FOR ARCHITECTURE REVIEW**  
**F-ID-KONFLIKTE: 0**  
**UNGEKLÄRTE ID-DOPPELBELEGUNGEN: 0**  
**NEUE V2-IDs: CM3D-F090–CM3D-F124**  
**IMPLEMENTATION: NOT STARTED**  
**V2 ROADMAP: NOT CREATED**  
**WD-20: NOT ASSIGNED**

Nächster Schritt gemäß verbindlicher Planungsreihenfolge:

`V2 Funktionskatalog → Abhängigkeiten/Architektur`

Erst nach Abschluss dieses Architektur-/Abhängigkeitsblocks darf eine Entwicklungsroadmap entstehen. Erst danach werden WD-20 ff. vergeben.
