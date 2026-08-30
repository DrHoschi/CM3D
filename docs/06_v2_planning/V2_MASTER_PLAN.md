# CM3D – V2 Masterplanung

**Stand:** 2026-08-30  
**Status:** V2 SCOPE REVIEW – PASS  
**Basis:** CM3D V1 COMPLETE / PASS / FROZEN + Master-Funktionsliste V0.1

## 1. Ziel und Planungsregel

V2 baut CyberMotion 3D vom belastbaren V1-Designer zu einem vollständigeren Modellierungs- und Konstruktionswerkzeug aus. Die Planung erfolgt vor der Implementierung und in zusammenhängenden Systemblöcken.

Verbindliche Reihenfolge:

`V2 Scope Definition → V2 Funktionskatalog → Abhängigkeiten/Architektur → V2 Entwicklungsroadmap → WD-20`

Neue, nicht blockierende Ideen während V2 gehen grundsätzlich in den V3-Backlog. Noch keine Implementierung, keine Entwicklungsroadmap und keine WD-20-Vergabe.

## 2. Scope-Status

Der fachliche Durchlauf der Systemblöcke A–K und der anschließende Gesamt-Quercheck sind abgeschlossen.

**V2 SCOPE REVIEW = PASS**

- offene Scope-Blocker: **0**
- R1 Stabile Referenzen und Topologie: **BESCHLOSSEN**
- R2 Recompute und Fehlerfortpflanzung: **BESCHLOSSEN**
- R3 Native Daten, Bibliothek und Austauschformate: **BESCHLOSSEN**
- R3a Zentraler Export-Workflow: **BESCHLOSSEN**

Die Einstufungen `MUSS`, `SOLL` und `V3` sind die freigegebene Grundlage für den als Nächstes zu erstellenden V2-Funktionskatalog. Bestehende F-IDs der FROZEN Masterliste werden dabei nicht stillschweigend verändert.

## 3. Herkunft bestehender Funktionen

Bereits in der FROZEN Masterliste als V1–V2 geführt werden insbesondere F003, F015, F024, F025, F031, F032, F036, F038, F042, F043, F047, F048, F056–F062, F065, F066, F069–F071, F073, F076, F078, F085 und F086.

Bewusst aus `Später` für den V2-MUSS-Scope vorgezogen werden nach Scope-Review insbesondere F033 (Body/Feature Mirror), F034 (Ausrichten), F037 (Winkel messen), F052 (Boolean Union/Subtract/Intersect) sowie der Bevel-Anteil von F053. Cut/Knife aus F053 bleibt V2-SOLL. F067/F068 bleiben V3.

Neue V2-Funktionen erhalten erst im V2-Funktionskatalog kontrollierte IDs bzw. eine kontrollierte Revision der Funktionsliste.

## 4. Freigegebene V2-Scope-Matrix

### A – Sketch-Kern und Topologie

**MUSS**
- Sketch-Elemente einzeln auswählen, löschen und bearbeiten.
- Punkte/Endpunkte auswählen; Mehrfachauswahl von Elementen und Punkten.
- Endpunkte real geometrisch/topologisch verbinden.
- Linie, Rechteck/Polygon, Kreis, Bogen und Spline.
- stabile IDs für Sketch-Elemente und Punkte.
- Inspector-Bearbeitung.
- Undo/Redo-Integration.
- V1-Skizzen kompatibel laden/migrieren.

**SOLL**
- grundlegende Constraints: horizontal, vertikal, parallel, rechtwinklig, tangential.

**V3**
- vollständiger professioneller parametrischer Constraint-Solver.

### B – Konturen, Profile und Pfade

**MUSS**
- geschlossene Konturen automatisch und topologisch korrekt erkennen.
- mehrere Profile pro Skizze.
- einzelne und mehrere Profile auswählen.
- Innenkonturen/Löcher.
- offene Pfade als eigenständige gültige Modellierungsquelle.
- offene Pfade klar von geschlossenen Profilflächen unterscheiden.
- Profilflächen im Viewer hervorheben/auswählen.
- eine Skizze als Quelle mehrerer Features.
- stabile Profil-/Pfadreferenzen.
- abhängige Features nach Quellenänderung kontrolliert aktualisieren.
- ungültige Profil-/Pfadreferenzen sichtbar behandeln.

**SOLL**
- komplex zerstörte Profilreferenzen soweit eindeutig möglich automatisch reparieren.

**V3**
- vollständiges professionelles Topological Naming für beliebige komplexe Topologieänderungen.

Grundregel: Sketches enthalten Elemente; Elemente bilden Konturen/Pfade; geschlossene Konturen bilden auswählbare Profile; 3D-Features referenzieren konkrete Profile oder Pfade und nicht pauschal die gesamte Skizze.

### C – Sketch-Bezugsebenen und Konstruktionsebenen

**MUSS**
- Sketch auf XY/XZ/YZ.
- Sketch auf ausgewählter planarer Körperfläche.
- lokales Sketch-Koordinatensystem aus der Bezugsfläche.
- logische Bindung an die Referenzfläche.
- freie planare Arbeitsebene.
- parallele Offset-Ebene.
- einfache Ebene über Punkte/Geometriebezüge.
- Verwendung der Ebenen als Sketch- und Mirror-Bezug.

**V3**
- direktes Skizzieren auf gekrümmten Flächen.
- Wrap/Projektionsmodellierung auf gekrümmten Flächen.

### D – Sketch Templates / Sketch Library

**MUSS**
- Sketch als Template speichern und wieder einfügen.
- Geometrie, offene Pfade und geschlossene Profile erhalten.
- definierter Einfüge-/Basispunkt.
- Position und Rotation beim Einfügen.
- eingefügtes Template wird standardmäßig eine unabhängige bearbeitbare Kopie.

**SOLL**
- Skalierung beim Einfügen.
- Maße/Constraints übernehmen, soweit in V2 vorhanden.
- Vorschau/Thumbnail.
- Kategorien/Namen/Tags.

**V3**
- dauerhaft verknüpfte Sketch-Template-Instanzen.

### E – 2D-zu-3D-Featurekette

**MUSS**
- Extrude aus ausgewählten geschlossenen Profilen, auch Multi-Profil.
- additive und subtraktive Extrusion/Tasche.
- Extrusionsrichtung umkehren.
- Thin Extrude als Extrusionsvariante für offene Pfade mit Dicke, Seite und optional zentrierter Dicke.
- Revolve um eine definierte Achse, z. B. Sketch-/Konstruktionslinie und geeignete Referenzachse.
- Sweep eines Profils entlang Linie/Bogen/Spline.
- reproduzierbarer grundlegender Sweep-Orientierungsmodus.
- Loft zwischen mehreren Profilen auf unterschiedlichen Ebenen.
- stabile Feature-Quellenreferenzen.
- kontrollierter Recompute und sichtbarer Invalid-Zustand.

**SOLL**
- symmetrische Extrusion.
- Extrude bis Fläche/Objekt.
- Draft/Taper.
- definierter Sweep-Twist und erweiterte Orientierungsmodi.
- Loft-Leitkurven.

**V3**
- komplexe parametrische Übergangs-/Kontinuitätssteuerung.

### F – Körper- und Modifier-Modellierung

**MUSS**
- Boolean Union, Subtract, Intersect.
- Bevel/Fase.
- Fillet/Abrundung.
- Mehrfachauswahl geeigneter Kanten.
- Body/Feature Mirror.
- lineares Pattern.
- radiales Pattern.
- minimale Feature-Abhängigkeitskette und sichtbare Feature-/Dependency-Struktur.

**SOLL**
- Shell/Hohlkörper.
- Cut/Knife.
- Sketch Mirror.

**V3**
- vollständig frei editierbarer/reorderbarer/suppressierbarer professioneller History-/Modifier-Stack.

### G – Transformieren, Konstruieren und Messen

**MUSS**
- Ursprung/Pivot bearbeiten.
- zentrales Snap-System: Raster, Punkt/Vertex, Kante, Fläche und Mittelpunkt.
- Objekt an Objekt sowie an Fläche/Kante/Punkt ausrichten.
- Abstand messen.
- Winkel messen.
- exakte Koordinaten/Positionen anzeigen.
- sichtbare gespeicherte Bemaßungen.
- Hilfs-/Konstruktionslinien.

**SOLL/V3**
- parametrisch steuernde Bemaßungen abhängig vom späteren Constraint-Umfang.

**V3**
- komplexe persistente 3D-Constraints zwischen Körpern.

Messung und Bemaßung bleiben getrennte Konzepte: Messung ist eine Abfrage; Bemaßung ist gespeicherte sichtbare Projektinformation. Vollständig treibende parametrische Maße sind kein V2-MUSS.

### H – Szene und große Projekte

**MUSS**
- Layers/Ebenen.
- Sichtbarkeit und Sperre je Layer.
- Objekte Layern zuweisen/zwischen Layern verschieben.
- Suche im Objektbaum.
- Reparenting/Umstrukturieren.
- Mehrfachauswahl großer Objektmengen.
- skalierbares Object-Tree-/Viewer-Verhalten für größere Baugruppen.

**SOLL**
- Objektbaumfilter.
- Drag & Drop Reparenting.
- interne GLB/GLTF-Hierarchie adressierbar machen.
- bei unterstützter GLB-Hierarchie Unterobjekte separat sichtbar/sperrbar/transformierbar machen.

**V3**
- komplexe Referenz-/Instanzsysteme für sehr große Baugruppen.

Die GLB/GLTF-Unterhierarchie ist ein starker V2-SOLL-Kandidat, aber kein Blocker des V2-Modellierungskerns.

### I – Materialien, Darstellung und Licht

**MUSS**
- Texturen.
- Metallic.
- Roughness.
- Transparenz.
- Material-Presets.
- Materialbibliothek.
- Material entfernen/zurücksetzen.
- ein Material auf mehrere Objekte anwenden.
- wiederverwendbare/verknüpfte Materialdefinitionen sowie lokale Materialkopien/Varianten.
- konstruktionsgeeignete Darstellungsmodi wie Shaded, Wireframe und/oder Shaded+Edges.

**SOLL**
- Objekt-/Flächenfarben unabhängig vom Material.
- Vierfachansicht.
- Lichtobjekte mit grundlegenden Parametern.
- Screenshot/Preview.
- einfache Umgebung/Hintergrunddarstellung.

**V3**
- fotorealistisches Rendering.
- Render-Nachbearbeitung.
- komplexe Node-/Shader-Netzwerke.

Grundregel: V2 besitzt ein konsistentes Materialsystem mit wiederverwendbaren Materialdefinitionen sowie für Konstruktion geeignete Darstellungsmodi. Fotorealistisches Rendering, komplexe Shader-Netzwerke und Render-Nachbearbeitung sind kein V2-Kern.

### J – Bibliotheken und Import/Export

**MUSS**
- Objektbibliothek.
- eigenes 3D-Objekt und eigene Baugruppe zur Bibliothek hinzufügen.
- Objekt/Baugruppe aus Bibliothek einfügen.
- Bibliothekseinträge benennen/kategorisieren.
- eingefügte Geometrie standardmäßig als unabhängige Kopie.
- Sketch Templates als getrennten 2D-Bibliothekstyp.
- OBJ- und STL-Import.
- OBJ- und STL-Export.
- ausgewähltes Objekt exportieren.
- Baugruppe exportieren.
- bestehenden GLB/GLTF-Import als Bestand erhalten.

**SOLL**
- Bibliotheks-Thumbnail/Vorschau.
- Material-/Texturinformationen beim Export soweit vom Zielformat unterstützt erhalten.
- GLB/GLTF-Export.
- eigenes vollständiges CM3D/CMO/CMU-Austauschformat: Entscheidung bleibt offen und blockiert V2 nicht.

**V3**
- STEP/IGES.
- dauerhaft verknüpfte Geometrieinstanzen.

### K – Produktivität, Events, Diagnose und Performance

**MUSS**
- letzte Projekte und schnelles Wiederöffnen.
- Event-/Interaktionsdiagnose.
- Fehler und Warnungen nachvollziehbar anzeigen.
- ungültige Features/Referenzen zentral auffindbar machen.
- Performanceanzeige.
- größere reale Projekte als V2-Testfälle.
- Regressionstests für V1-Funktionen während des V2-Ausbaus.

**SOLL**
- Objekt-/Szenenstatistik.
- detailliertere Profiler-Ansicht.
- Diagnoseinformationen exportieren.

**V3**
- umfangreiches internes Developer-Debug-Panel.
- vollautomatisches Performance-/LOD-Optimierungssystem.

## 5. Querschnittliche Architektur-MUSS

Diese Punkte sind keine parallelen Einzelwerkzeuge, sondern gemeinsame V2-Systemgrundlagen:

1. zentrales Selection-System für Objekt, Feature, Fläche, Kante, Punkt, Sketch-Element, Profil und Pfad;
2. stabiles Referenzsystem für adressierbare Geometrieelemente;
3. Dependency Graph für Quellen- und Feature-Abhängigkeiten;
4. deterministische Recompute-Reihenfolge;
5. gemeinsames INVALID/UNRESOLVED/BLOCKED-System;
6. gemeinsame Diagnoseanzeige für Referenz- und Featurefehler;
7. Save/Load-Unterstützung sämtlicher neuer V2-Daten;
8. kontrollierter V1→V2-Kompatibilitäts-/Migrationspfad;
9. zentrale Undo/Redo-Integration;
10. Viewer, Objektbaum und Inspector auf derselben Daten-/Selection-Basis;
11. zentrales Snap-/Geometriereferenz-Prinzip statt werkzeugspezifischer Sonderlösungen.

## 6. Verbindliche Scope-Regeln R1–R3a

### R1 – Stabile Referenzen und Topologie

V2 verwendet stabile logische Referenzen für Sketch-Elemente, Punkte, Profile, Pfade, Flächen, Kanten, Achsen und Arbeitsebenen.

Nach einer Geometrieänderung darf eine bestehende Referenz nur weiterverwendet werden, wenn ihre logische Quelle eindeutig wiedererkannt werden kann. Ist keine eindeutige Zuordnung möglich, wird die Referenz `INVALID/UNRESOLVED`.

Eine Referenz darf niemals stillschweigend auf eine andere, lediglich geometrisch ähnlich erscheinende Quelle umgebunden werden.

### R2 – Recompute und Fehlerfortpflanzung

V2 berechnet abhängige Features deterministisch in ihrer Abhängigkeitsreihenfolge neu.

Wird eine Quelle oder ein Feature `INVALID/UNRESOLVED`, werden abhängige Features nicht mit veralteter oder ersatzweise ausgewählter Geometrie weiterberechnet. Sie erhalten einen nachvollziehbaren `BLOCKED/INVALID`-Zustand einschließlich Ursache.

Wird die ursprüngliche Ursache wieder gültig, wird die Feature-Kette in Abhängigkeitsreihenfolge erneut berechnet.

Beispiel:

`Sketch → Profile → Extrude → Fillet → Pattern`

Bei offenem/ungültigem Profil:

`Sketch OK → Profile INVALID → Extrude BLOCKED → Fillet BLOCKED → Pattern BLOCKED`

Nach Reparatur wird die Kette kontrolliert von der Quelle nach vorne neu berechnet.

### R3 – Native Daten, Bibliothek und Austauschformate

V2 trennt verbindlich zwischen nativen CM3D-Projektdaten, wiederverwendbaren Bibliotheksinhalten und externen Austauschformaten.

- Native CM3D-Projektdaten enthalten die vollständige von CM3D unterstützte Modellstruktur einschließlich Sketches, Profile, Features, Referenzen, Abhängigkeiten, Hierarchie, Layer und Materialzuordnungen.
- Bibliotheksinhalte sind kontrolliert wiederverwendbare CM3D-Inhalte wie Sketch Templates, Objekte, Baugruppen und Materialdefinitionen. Für jeden Bibliothekstyp gelten definierte Kopier-/Referenzregeln.
- Fremd-/Austauschformate enthalten nur die Informationen, die das jeweilige Format tatsächlich bereitstellt. CM3D erfindet beim Import keine nicht vorhandene Feature-Historie oder Parametrik.
- Beim Export werden nur Informationen übertragen, die das Zielformat unterstützt. OBJ/STL/GLB usw. ersetzen nicht das native CM3D-Projektformat.
- V1-Projekte besitzen Bestandsschutz und müssen über einen kontrollierten V2-Lade-/Migrationspfad weiterverwendet werden können.

Ein zusätzliches eigenes CMO/CMU-Austauschformat bleibt V2-SOLL / noch zu entscheiden und blockiert V2 nicht.

### R3a – Einheitlicher Export-Einstieg

CyberMotion 3D besitzt einen zentralen Export-Einstieg und keine Sammlung einzelner Exportbefehle im Datei-Menü.

`Datei → Exportieren…` öffnet einen zentralen Export-Workflow. Erst dort werden Exportgegenstand, Zielformat und formatspezifische Optionen gewählt.

Mögliche Optionen umfassen abhängig vom Format beispielsweise Auswahl/Objekt/Baugruppe, Einheiten, Skalierung, Transformationen, Hierarchie und Materialien/Texturen.

Ob dieser Workflow später als Dialog, Inspector-Modus oder Kombination umgesetzt wird, ist noch keine Scope-Entscheidung. Verbindlich ist: **ein zentraler Export-Befehl; Detailoptionen erst im nachgelagerten Export-Workflow.**

## 7. Bewusste V2-Grenzen

Folgende Funktionen blockieren den V2-Abschluss ausdrücklich nicht:

- vollständiger Constraint-Solver;
- vollständiger frei editierbarer professioneller History Tree;
- Skizzieren/Wrap direkt auf gekrümmten Flächen;
- komplexe dauerhaft verknüpfte Geometrieinstanzen;
- STEP/IGES;
- fotorealistisches Rendering und Render-Postprocessing;
- komplexe Shader-Netzwerke;
- vollständiges Developer-Profiling;
- umfassende automatische LOD-/Performanceoptimierung;
- vollständiges professionelles Topological Naming für beliebige Topologieänderungen.

## 8. Scope-Review der vier Risikozonen

### RZ-01 Sketch/Parametrik – PASS

Die V2-MUSS-Funktionen sind ohne vollständigen Constraint-Solver realisierbar. Topologisches Verbinden von Endpunkten ist erforderlich; vollständige treibende Parametrik ist es nicht.

### RZ-02 Topologie/Referenzen – PASS

Durch R1 sind eindeutige logische Referenzen und der kontrollierte `INVALID/UNRESOLVED`-Fall verbindlich. Stilles Rebinding auf vermeintlich passende Geometrie ist ausgeschlossen.

### RZ-03 Feature-Recompute – PASS

Durch R2 sind deterministische Abhängigkeitsreihenfolge, Fehlerfortpflanzung und Wiederanlauf nach Reparatur verbindlich.

### RZ-04 Import/Export – PASS

Durch R3/R3a sind native CM3D-Daten, Bibliotheksinhalte und Fremdformate getrennt; Bestandsschutz und zentraler Export-Workflow sind festgelegt.

## 9. Nächster Schritt

Der V2-Scope ist fachlich freigegeben. Der nächste Schritt ist ausschließlich die Erstellung des **verbindlichen V2-Funktionskatalogs** und der kontrollierte Abgleich mit den bestehenden F-IDs der FROZEN V0.1-Masterliste.

Dabei gilt:

- bestehende F-IDs nicht stillschweigend umdeuten;
- neue V2-Funktionen eindeutig identifizieren;
- Funktionen aus `Später`, die bewusst nach V2 vorgezogen wurden, explizit kennzeichnen;
- Doppelungen aus den Systemblöcken auflösen;
- erst danach Abhängigkeiten/Architektur finalisieren;
- erst danach Entwicklungsroadmap;
- **noch kein WD-20**.

## 10. Aktueller Planungsstatus

**V2 Scope Definition: COMPLETE**  
**V2 Scope Review: PASS**  
**Open Scope Blockers: 0**  
**Next: V2 Funktionskatalog + F-ID-Abgleich**  
**Implementation: NOT STARTED**  
**V2 Roadmap: NOT CREATED**  
**WD-20: NOT ASSIGNED**
