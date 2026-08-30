# CM3D – V2 Abhängigkeiten und Architektur

**Stand:** 2026-08-30  
**Status:** ARCHITECTURE REVIEW – PASS  
**Basis:** `V2_MASTER_PLAN.md` + `V2_FUNCTION_CATALOG.md`  
**Scope:** ausschließlich gemeinsame technische Systeme und Abhängigkeitsgrenzen; **keine Entwicklungsroadmap, keine WD-20-Vergabe**.

## 1. Zweck

Dieses Dokument legt die gemeinsame technische Architektur fest, auf der die freigegebenen V2-Funktionen aufbauen. Es definiert **keine Implementierungsreihenfolge**. Ziel ist, parallele Sonderlösungen für Selection, Referenzen, Sketches, Features, Materialien, Bibliotheken, Save/Load und Import/Export zu verhindern.

Der Architekturblock gilt nur dann als geschlossen, wenn alle V2-MUSS-Funktionen einem tragfähigen gemeinsamen System zugeordnet werden können und keine widersprüchlichen Ownership- oder Datenflussregeln verbleiben.

## 2. Verbindliche Architekturprinzipien

1. **Ein Datenmodell, mehrere Oberflächen.** Viewer, Objektbaum und Inspector greifen auf dieselben zentralen Domänenobjekte und Selection-Referenzen zu.
2. **Stabile logische Identität vor UI-Zustand.** Geometriequellen, Features, Profile und Subobjects werden nicht über sichtbare Reihenfolge oder temporäre Mesh-Indizes identifiziert.
3. **Referenzen sind explizit.** Abhängigkeiten werden gespeichert und nicht aus räumlicher Nähe oder zufälliger Reihenfolge rekonstruiert.
4. **Keine stillen Ersatzbindungen.** Nicht eindeutig wiedererkennbare Quellen werden `UNRESOLVED/INVALID` statt auf eine ähnlich erscheinende Geometrie umgebunden.
5. **Recompute ist deterministisch.** Abhängige Features werden entlang eines gerichteten Dependency Graphs berechnet.
6. **Fehler propagieren kontrolliert.** Ungültige Quellen blockieren abhängige Features; veraltete Geometrie gilt nicht als gültiger Ersatz.
7. **V1 bleibt ladbar.** Neue V2-Daten erweitern das Projektmodell über einen kontrollierten Migrationspfad.
8. **Native und fremde Geometrie bleiben unterscheidbar.** Importierte Meshdaten erhalten keine erfundene native Feature-Historie.
9. **Bibliothek ist nicht Projektformat.** Wiederverwendbare Inhalte besitzen kontrollierte Kopier-/Referenzsemantik, sind aber kein Ersatz für das vollständige Projektmodell.
10. **Undo/Redo wirkt auf Domänenänderungen.** Werkzeuge dürfen keine parallelen, nicht rücksetzbaren Seiteneffekte erzeugen.

## 3. Systemübersicht

V2 wird fachlich in folgende gemeinsame technische Systeme gegliedert:

- A1 – Selection System
- A2 – Stable Reference & Topology System
- A3 – Sketch / Profile / Path Model
- A4 – Construction Reference Model
- A5 – Feature / Body Model
- A6 – Dependency Graph & Recompute Engine
- A7 – Invalid / Diagnostic State Model
- A8 – Scene / Hierarchy / Layer Model
- A9 – Material Definition & Binding Model
- A10 – Library Model
- A11 – Project Persistence & Migration
- A12 – Import / Export Boundary
- A13 – Undo / Redo Transaction Boundary
- A14 – Viewer / Object Tree / Inspector Projection

Diese Systeme sind Architekturkomponenten, keine zusätzlichen Benutzerfunktionen und erhalten keine künstlichen F-IDs.

## 4. A1 – Selection System

### 4.1 Ziel

Alle V2-Werkzeuge verwenden ein gemeinsames Selection-Modell. F009, F084, F090, F106 und F107 dürfen nicht jeweils eigene Auswahlzustände führen.

### 4.2 Selektierbare Klassen

Mindestens:

- Scene Object / Group / Assembly
- Body
- Feature
- Sketch
- Sketch Element
- Sketch Point / Endpoint
- Profile
- Path
- Face
- Edge
- Vertex / Point
- Work Plane
- Construction Line / Axis

### 4.3 Selection Reference

Eine Auswahl wird konzeptionell als strukturierte Referenz beschrieben:

`SelectionRef = { targetKind, ownerId, targetId, subTargetId? }`

Beispiele:

- Objekt: `OBJECT / ObjectId`
- Feature: `FEATURE / BodyId / FeatureId`
- Face: `FACE / BodyId / FaceRefId`
- Sketch-Endpunkt: `SKETCH_POINT / SketchId / PointId`
- Profil: `PROFILE / SketchId / ProfileId`

Die konkrete Codeform wird erst in der Implementierung festgelegt. Verbindlich ist die semantische Trennung.

### 4.4 Single- und Multi-Selection

Single-Selection und Multi-Selection verwenden denselben Selection Store. Multi-Selection ist eine geordnete oder mengenartige Sammlung von `SelectionRef`-Einträgen; eine zusätzliche `primarySelection` darf für Inspector/Gizmo definiert werden.

### 4.5 Selection-Invarianten

- gesperrte Inhalte können sichtbar, aber nicht manipulierbar sein;
- versteckte Inhalte werden nicht versehentlich per Viewer-Picking ausgewählt;
- ungültige Referenzen werden nicht aus der Auswahl heraus „repariert“;
- Viewer-, Tree- und Inspector-Auswahl bleiben synchronisiert;
- Selection ist UI-Zustand und keine geometrische Abhängigkeit.

## 5. A2 – Stable Reference & Topology System

### 5.1 Referenzklassen

Stabile Referenzen werden mindestens benötigt für:

- SketchElementId
- SketchPointId
- ProfileId
- PathId
- WorkPlaneId
- ConstructionAxis/LineId
- BodyId
- FeatureId
- FaceRefId
- EdgeRefId
- VertexRefId, soweit benötigt
- MaterialDefinitionId
- LibraryEntryId

### 5.2 Logische versus abgeleitete Identität

**Logische Identität** wird vom Domänenmodell vergeben und gespeichert, z. B. SketchElementId oder FeatureId.

**Abgeleitete Geometrieidentität** entsteht aus einem Feature-Ergebnis, z. B. FaceRefId oder EdgeRefId. Sie darf nicht bloß `face[3]` oder `edge[17]` sein.

### 5.3 Wiedererkennung nach Recompute

Nach einer Änderung versucht das erzeugende Feature, seine abgeleiteten Flächen/Kanten logisch auf das neue Ergebnis abzubilden.

Ergebniszustände:

- `RESOLVED` – Quelle eindeutig wiedererkannt;
- `UNRESOLVED` – Quelle existiert möglicherweise, ist aber nicht eindeutig zuordenbar;
- `MISSING` – Quelle existiert nicht mehr;
- `INVALID` – Referenz oder Quelle ist fachlich ungültig.

Ein automatisches Rebinding auf die „nächstgelegene“ oder „ähnlichste“ Geometrie ist verboten, wenn keine eindeutige Identität ableitbar ist.

### 5.4 V2-Grenze

V2 verlangt robuste logische Referenzen für die freigegebenen Modellierungsketten, aber **kein vollständiges professionelles Topological-Naming-System für beliebige komplexe Topologieänderungen**.

## 6. A3 – Sketch / Profile / Path Model

### 6.1 Sketch

Ein Sketch ist ein persistentes Domänenobjekt mit mindestens:

- SketchId
- ReferencePlane / Face Reference
- Local Coordinate System
- SketchElements
- optional Constraints
- abgeleiteten Profiles
- abgeleiteten Paths
- Status

### 6.2 Sketch Elements

Sketch-Elemente besitzen stabile IDs und typabhängige Geometrieparameter. V2-MUSS-Typen:

- Line
- Rectangle/Polygon als erzeugte/strukturierte Elementgeometrie
- Circle
- Arc
- Spline
- Construction Line

### 6.3 Punkte und Endpunkte

Adressierbare Endpunkte erhalten stabile Punktidentitäten oder eine eindeutig stabile Punktreferenz innerhalb des Sketch-Elements.

„Endpunkte verbinden“ ist eine echte topologische Beziehung. Zwei nur räumlich nahe Punkte gelten nicht automatisch als verbunden.

### 6.4 Profiles

Ein Profile ist eine **abgeleitete, adressierbare geschlossene 2D-Region** aus Sketch-Elementen.

Ein Profile enthält mindestens:

- ProfileId
- SourceSketchId
- referenzierte Loop-/Elementstruktur
- äußeren Loop
- optionale innere Loops/Löcher
- Validity Status

Ein Sketch kann mehrere Profiles besitzen. Features referenzieren `ProfileId`, nicht pauschal den Sketch.

### 6.5 Paths

Ein Path ist eine adressierbare geordnete Kurvenkette. Offene und geschlossene Paths sind erlaubt. Ein offener Path ist **nicht ungültig**, sondern eine gültige Quelle für dafür vorgesehene Features wie Thin Extrude und Sweep.

### 6.6 Profil-/Pfad-Neuberechnung

Nach Sketch-Änderung werden Profiles/Paths aus der Sketch-Topologie neu abgeleitet. Bestehende IDs werden nur erhalten, wenn die logische Quelle eindeutig wiedererkannt werden kann; sonst gilt R1.

## 7. A4 – Construction Reference Model

Konstruktionsbezüge sind persistente referenzierbare Domänenobjekte und keine reinen Viewer-Hilfen.

Mindestens:

- globale XY/XZ/YZ-Ebenen;
- planare Face-basierte Sketch-Ebene;
- freie Work Plane;
- Offset Work Plane;
- einfache Ebene aus Geometriebezügen;
- Construction Line / Axis.

Work Planes und Achsen besitzen stabile IDs und können Quellen für Sketch, Mirror, Revolve, Pattern und Mess-/Ausrichtungsfunktionen sein.

Wenn ihre Quellen ungültig werden, greifen R1/R2.

## 8. A5 – Feature / Body Model

### 8.1 Body

Ein Body ist ein persistentes Modellobjekt, dessen aktuelle Geometrie aus seiner Feature-Kette oder aus einer klar gekennzeichneten Fremdgeometriequelle stammt.

### 8.2 Native Feature

Ein natives Feature besitzt mindestens:

- FeatureId
- FeatureKind
- SourceRefs
- Parameters
- Output Body/Geometry Reference
- Status
- Diagnostic Cause

V2-MUSS-Featurefamilien:

- Extrude / Add / Subtract / Reverse
- Thin Extrude
- Revolve
- Sweep
- Loft
- Boolean Union/Subtract/Intersect
- Bevel
- Fillet
- Mirror
- Linear Pattern
- Radial Pattern

### 8.3 Minimal Feature Chain

V2 unterstützt eine **gerichtete, nachvollziehbare Feature-Kette**, z. B.:

`Sketch → Profile → Extrude → Fillet → Pattern`

Die Kette ist sichtbar und diagnostizierbar, aber kein vollwertiger frei reorderbarer/suppressierbarer professioneller History Tree.

### 8.4 Native versus Imported Body

Ein importiertes OBJ/STL/GLB kann als `ImportedBody` / `ImportedMeshObject` geführt werden. Es darf Faces/Edges für unterstützte Auswahloperationen exponieren, erhält aber keine erfundene Sketch-/Feature-Historie.

Falls ein späteres Werkzeug aus Fremdgeometrie neue native Features erzeugt, werden nur diese neuen Operationen als native Features gespeichert; die Importquelle bleibt als Ursprung erkennbar.

## 9. A6 – Dependency Graph & Recompute Engine

### 9.1 Graph

Alle persistierenden geometrischen Abhängigkeiten werden in einem gerichteten azyklischen Abhängigkeitsmodell geführt, soweit der jeweilige Featuretyp keine ausdrücklich definierte Sondersemantik benötigt.

Knoten können sein:

- Sketch
- Profile / Path
- Work Plane / Axis
- Feature
- Body
- Material Definition, soweit bindingspezifisch

Kanten beschreiben `dependsOn` / `sourceOf`.

### 9.2 Recompute

Eine Quellenänderung markiert direkt und transitiv abhängige Knoten als `DIRTY`. Recompute erfolgt topologisch/deterministisch von Quellen zu Senken.

Grundzustände:

- `CLEAN`
- `DIRTY`
- `RECOMPUTING`
- `VALID`
- `UNRESOLVED`
- `INVALID`
- `BLOCKED`

`VALID`/Fehlerzustand und `DIRTY` können intern getrennte Zustandsdimensionen sein; die konkrete Implementierung bleibt offen.

### 9.3 Fehlerfortpflanzung

Beispiel:

`Sketch → Profile → Extrude → Fillet → Pattern`

Wird Profile ungültig:

`Profile INVALID → Extrude BLOCKED → Fillet BLOCKED → Pattern BLOCKED`

Es wird keine alte Extrude-Geometrie als gültige Berechnungsgrundlage weitergereicht.

Nach Reparatur:

`Profile VALID → Extrude recompute → Fillet recompute → Pattern recompute`

### 9.4 Zyklenschutz

Neue Abhängigkeiten, die einen unzulässigen Zyklus erzeugen würden, werden bereits beim Erstellen/Ändern der Referenz abgelehnt und diagnostiziert.

## 10. A7 – Invalid / Diagnostic State Model

Diagnose ist kein separates Schattenmodell. Jeder relevante Domänenknoten kann einen standardisierten Status und eine Ursache tragen.

Mindestens:

- Status Code
- Severity
- Source/Owner
- Human-readable Message
- optional Reference to Cause

Typische Ursachen:

- missing source
- unresolved topology reference
- open profile where closed required
- invalid work plane
- failed boolean
- failed fillet/bevel
- blocked by upstream feature
- unsupported imported data

F081/F082/F085/F121 projizieren diese zentrale Diagnosebasis in UI/Events, statt eigene Fehlerlisten zu erzeugen.

## 11. A8 – Scene / Hierarchy / Layer Model

Objekthierarchie und Featureabhängigkeit bleiben getrennte Beziehungen.

- `parentId` beschreibt Szene-/Objektbaumhierarchie.
- `dependsOn` beschreibt technische Feature-/Referenzabhängigkeit.
- `layerId` beschreibt Layer-Zuordnung.

Reparenting darf **keine geometrische Dependency automatisch ändern**, außer ein Werkzeug definiert dies ausdrücklich.

Layers steuern mindestens Sichtbarkeit, Sperre und Zuordnung, sind aber keine Ersatzhierarchie für Gruppen/Baugruppen.

Objektbaum-Suche/Filter arbeiten auf derselben Scene Registry; sie verändern die Hierarchie nicht.

GLB/GLTF-Unterhierarchie bleibt V2-SOLL und muss, falls umgesetzt, in dieses Scene/Hierarchy-Modell integrierbar sein ohne native Feature-Historie vorzutäuschen.

## 12. A9 – Material Definition & Binding Model

### 12.1 Trennung

Materialdaten werden getrennt in:

- `MaterialDefinition` – wiederverwendbare Materialeigenschaften;
- `MaterialBinding` – Zuweisung einer Definition oder lokalen Variante an Objekt/Body/Face, soweit unterstützt.

### 12.2 MaterialDefinition

Mindestens:

- MaterialDefinitionId
- Name
- Base Color
- Texture References
- Metallic
- Roughness
- Transparency
- Preset/Type Metadata

### 12.3 Shared versus Local

- **Shared:** mehrere Objekte referenzieren dieselbe MaterialDefinition; Änderung wirkt auf alle Referenzen.
- **Local Variant/Copy:** unabhängige Variante mit eigener Identität.

Eine lokale Variante darf nicht versehentlich die Shared Definition verändern.

### 12.4 Viewer-Farbe

Eine konstruktive Objekt-/Flächen-Anzeigefarbe (F115, SOLL) bleibt semantisch getrennt vom physisch/materialbezogenen Base Color.

## 13. A10 – Library Model

### 13.1 Gemeinsame Library Registry

Sketch-, Objekt-/Baugruppen- und Materialbibliotheken dürfen gemeinsame Registry-/Metadatenmechanismen nutzen, behalten aber eigene Payload-Typen.

`LibraryEntry` enthält mindestens:

- LibraryEntryId
- EntryKind
- Name
- Category/Metadata
- Payload Reference / Serialized Payload
- Version/Schema
- optional Preview

### 13.2 Insert-Semantik

- Sketch Template → standardmäßig unabhängige Sketch-Kopie.
- Object/Assembly → standardmäßig unabhängige Geometrie-/Strukturkopie.
- Material Definition → darf bewusst als Shared Definition referenziert oder als lokale Kopie erzeugt werden.

Damit wird die unterschiedliche Semantik von Geometrie und Material explizit erhalten.

### 13.3 Kein Linked-Instance-System in V2-MUSS

Dauerhaft verknüpfte Geometrieinstanzen bleiben außerhalb des V2-Kerns.

## 14. A11 – Project Persistence & Migration

### 14.1 Native Projektdatei

Die native Projektpersistenz ist die einzige Quelle, die die vollständige bearbeitbare CM3D-Struktur erhalten muss.

Zu speichern sind mindestens:

- Scene Objects / Hierarchy / Layers
- Sketches / Elements / Points
- Profiles / Paths bzw. ausreichend stabile Rekonstruktionsdaten
- Work Planes / Construction References
- Bodies / Features / Parameters
- Reference Bindings
- Dependency Graph bzw. deterministisch rekonstruierbare Dependency Records
- Material Definitions / Bindings
- Diagnostic-relevante persistente Zustände, soweit erforderlich
- Library references/copies, soweit projektintern nötig

### 14.2 Schema-Version

V2-Projekte erhalten eine explizite Schema-/Project-Version. Ladepfad:

`Read → Detect Version → Migrate if required → Validate → Build Registries/Graph → Recompute/Resolve → Present Project`

### 14.3 V1→V2 Migration

V1-Projekte werden nicht in-place destruktiv „uminterpretiert“. Der Ladevorgang erzeugt eine V2-kompatible Laufzeitrepräsentation.

Bestehende V1-Objekte behalten ihre IDs soweit möglich. Neue V2-Unterstrukturen werden nur erzeugt, wenn sie aus vorhandenen Daten eindeutig ableitbar sind.

Alte Extrusions-/Sketch-Beziehungen oder andere historische Daten dürfen nicht durch heuristisches Rebinding verfälscht werden. Nicht ableitbare neue Referenzinformationen werden kontrolliert als Legacy/Unresolved behandelt oder bleiben in ihrem vorhandenen V1-Verhalten, bis eine explizite Bearbeitung sie in V2-Strukturen überführt.

### 14.4 Save

Nach erfolgreicher V2-Migration und Bearbeitung wird im aktuellen V2-Schema gespeichert. Eine automatische Rückspeicherung in ein altes V1-Schema ist nicht Teil des V2-MUSS-Scope.

## 15. A12 – Import / Export Boundary

### 15.1 Datenklassen

Strikt getrennt:

1. **Native Project Data** – vollständige CM3D-Struktur.
2. **Library Payload** – wiederverwendbarer kontrollierter Ausschnitt.
3. **Exchange Data** – formatabhängige Fremd-/Exportdaten.

### 15.2 Import

Importer liefern ein normalisiertes Importergebnis mit:

- Geometry Payload
- optional Hierarchy
- optional Material/Texture Data
- Units/Scale/Transform Metadata soweit verfügbar
- Import Diagnostics

OBJ/STL/GLB werden nicht als native Feature-Historie interpretiert.

### 15.3 Export

Alle Exportformate laufen über den zentralen Export-Workflow F119/F120.

Konzeptioneller Ablauf:

`Export Selection/Scene → Export Descriptor → Format Adapter → Validation → File Output`

Der zentrale Export Descriptor enthält mindestens:

- export target / selection
- format
- units
- scale
- transform handling
- hierarchy policy soweit formatfähig
- material/texture policy soweit formatfähig

Das Datei-Menü bleibt bei einem zentralen Einstieg `Datei → Exportieren…`.

### 15.4 Native Projektdatei ist kein Exportformat-Ersatz

OBJ/STL/GLB/GLTF speichern nur formatfähige Informationen. Sie dürfen nicht als vollständige Sicherung eines editierbaren CM3D-Projekts dargestellt werden.

## 16. A13 – Undo / Redo Transaction Boundary

Jede Benutzeroperation, die persistente Domänendaten verändert, läuft als atomare Undo/Redo-Transaktion oder als klar definierte Transaktionsgruppe.

Beispiele:

- Sketch-Element verschieben/löschen
- Endpunkte verbinden
- Feature erzeugen/Parameter ändern
- Reparenting
- Layer-Zuweisung
- Materialbinding ändern
- Bibliotheksinhalt einfügen

Recompute ist eine **abgeleitete Folge** der Domänenänderung und soll nicht als unabhängiger Benutzer-Undo-Schritt erscheinen.

Undo stellt die Domänenquelle zurück; anschließend wird der Graph deterministisch neu berechnet.

## 17. A14 – Viewer / Object Tree / Inspector Projection

### 17.1 Viewer

Viewer rendert den aktuellen validen/diagnostisch darstellbaren Projektzustand und erzeugt Picking-Ergebnisse als `SelectionRef`.

### 17.2 Object Tree

Der Object Tree projiziert:

- Scene Hierarchy
- je nach Knoten Feature-/Dependency-Unterstruktur oder verlinkte Detaildarstellung
- Status/Invalid-Indikatoren
- Visibility/Lock

Er besitzt keine eigene Objektwahrheit neben dem Scene Model.

### 17.3 Inspector

Der Inspector zeigt und ändert Parameter der aktuellen `primarySelection`. Änderungen erfolgen über Domänencommands/Transactions und lösen danach Dependency-Recompute aus.

Ein Feature wie Extrude, Export-Konfiguration oder Materialdefinition kann im Inspector bzw. einem darauf basierenden Workflow parametrisiert werden, ohne die Domänenlogik an die konkrete UI-Darstellungsform zu koppeln.

## 18. Ownership-Matrix

| Thema | Primäres System | Darf nicht separat besitzen |
|---|---|---|
| aktuelle Auswahl | A1 Selection | Viewer, Tree, Inspector |
| stabile Geometriereferenz | A2 Reference/Topology | einzelnes Featurewerkzeug |
| Sketch-Geometrie | A3 Sketch Model | Viewer |
| Profile/Pfade | A3 Sketch Model | Extrude/Sweep |
| Work Planes/Achsen | A4 Construction Reference | Mirror/Revolve einzeln |
| Featureparameter | A5 Feature Model | Inspector-Formular |
| Abhängigkeiten | A6 Dependency Graph | Object Tree |
| Invalid-Ursache | A7 Diagnostic State | einzelne UI-Meldung |
| Parent/Layer | A8 Scene Model | Viewer |
| Materialwerte | A9 MaterialDefinition | Mesh/Renderer-only state |
| Library Entry | A10 Library Model | Menü/UI |
| Persistenzschema | A11 Persistence | Importer/Exporter |
| Fremdformatlogik | A12 Format Adapter | native Project Serializer |
| Undo-Historie | A13 Transaction System | einzelnes Werkzeug |
| Darstellung | A14 Projection | Domänenmodell |

## 19. Abhängigkeitsregeln zwischen den Systemen

Die folgenden **technischen Abhängigkeiten** sind verbindlich, aber noch keine Entwicklungsreihenfolge:

- A3 Sketch/Profile/Path nutzt A2 stabile Referenzen.
- A4 Construction Reference nutzt A2.
- A5 Feature/Body nutzt A2, A3 und/oder A4 je Featuretyp.
- A6 Dependency Graph verbindet A3/A4/A5 und verwendet A2-Referenzen.
- A7 Diagnostics erhält Zustände aus A2/A3/A4/A5/A6/A11/A12.
- A1 Selection kann Entitäten aus A3/A4/A5/A8 referenzieren, besitzt sie aber nicht.
- A8 Scene Model besitzt Hierarchie/Layer und referenziert Bodies/Sketches/etc. als Scene Objects.
- A9 Material Model bindet an adressierbare Scene-/Body-/optional Face-Ziele über stabile IDs.
- A10 Library serialisiert kontrollierte Payloads aus A3/A5/A8/A9, ohne Ownership zu übernehmen.
- A11 Persistence speichert die autoritativen Daten aller persistierenden Systeme.
- A12 Import erzeugt normalisierte Fremdgeometrie/Metadaten; Export liest autoritative Projektdaten über definierte Adapter.
- A13 Undo/Redo kapselt Domänenänderungen in A3/A4/A5/A8/A9/A10.
- A14 Viewer/Tree/Inspector projiziert A1–A12, besitzt aber keine parallele Domänenlogik.

## 20. Abdeckung der V2-Funktionsgruppen

### Sketch / Profile / Modellierung

F039–F044, F090–F105 werden durch A2–A7 getragen.

### Konstruktion / Selection

F031–F038, F106–F108 werden durch A1, A2, A4, A13 und A14 getragen.

### Szene

F008, F009, F015, F109–F113 werden durch A1, A8 und A14 getragen; GLB-Hierarchie zusätzlich A12.

### Materialien

F054–F062, F114–F116 werden durch A9 sowie A11/A14 getragen.

### Bibliotheken

F069–F071, F097, F117–F118 werden durch A10 und A11 getragen.

### Import / Export

F072–F079, F119–F120 werden durch A11/A12 getragen.

### Diagnose / Events / Performance

F081–F086, F121–F124 werden durch A7/A14 sowie instrumentierte Zustände der übrigen Systeme getragen.

Damit ist jede freigegebene V2-Funktionsfamilie einer gemeinsamen Architektur zugeordnet; es bleibt kein Benutzerwerkzeug ohne technische Ownership.

## 21. Architektur-Risikoprüfung

### AR-01 Selection-Doppelzustand

**PASS** – A1 ist alleinige Selection-Quelle; Viewer/Tree/Inspector projizieren nur.

### AR-02 Fragile Face-/Edge-Indizes

**PASS** – A2 verbietet reine temporäre Mesh-Indizes als persistente Referenz und erzwingt R1-Statussemantik.

### AR-03 Sketch/Profile-Doppelownership

**PASS** – Profile/Paths gehören A3 und werden von Features nur referenziert.

### AR-04 Feature-History zu groß

**PASS** – A5/A6 unterstützen minimale gerichtete Featureketten, aber keinen voll frei editierbaren V3-History Tree.

### AR-05 Veraltete Geometrie nach Fehler

**PASS** – A6/A7 erzwingen BLOCKED/INVALID-Fortpflanzung gemäß R2.

### AR-06 Hierarchie versus Dependency

**PASS** – A8 `parentId` und A6 `dependsOn` sind getrennte Beziehungen.

### AR-07 V1-Projektverlust

**PASS** – A11 definiert Versionserkennung, Migration, Validierung und verbietet heuristisches stilles Rebinding.

### AR-08 Materialkopien versus Shared Material

**PASS** – A9 trennt MaterialDefinition und Binding/Local Variant.

### AR-09 Bibliothek versus Projektdatei

**PASS** – A10 und A11 haben getrennte Ownership/Semantik.

### AR-10 Importierte Meshes als falsche native CAD-Historie

**PASS** – A5/A12 kennzeichnen Imported Geometry getrennt.

### AR-11 Export-Menüüberladung / Formatsonderwege

**PASS** – A12 erzwingt zentralen Export Descriptor und Format Adapter hinter F119/F120.

### AR-12 Undo versus Recompute

**PASS** – A13 behandelt Recompute als abgeleitete Folge der rückgängig gemachten Domänenänderung.

## 22. Architekturabschluss

**Architecture Definition: COMPLETE**  
**Architecture Review: PASS**  
**Open Architecture Blockers: 0**  
**Unresolved Ownership Conflicts: 0**  
**Unmapped V2 Function Families: 0**

Die Architektur beschreibt bewusst noch **keine Implementierungsreihenfolge**.

Der nächste zulässige Planungsschritt ist die **V2 Entwicklungsroadmap**. Erst dort werden aus den freigegebenen Funktionen und den hier definierten technischen Abhängigkeiten konkrete Entwicklungsblöcke und deren Reihenfolge abgeleitet.

**WD-20 bleibt bis zur Freigabe dieser Roadmap unvergeben.**
