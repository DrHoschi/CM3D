# CM3D – V2 Masterplanung

**Stand:** 2026-08-30  
**Status:** DRAFT – Scope Definition  
**Basis:** CM3D V1 COMPLETE / PASS / FROZEN + Master-Funktionsliste V0.1

## 1. Ziel

V2 baut CyberMotion 3D vom belastbaren V1-Designer zu einem deutlich vollständigeren Modellierungs- und Konstruktionswerkzeug aus.

Die Planung erfolgt bewusst vor der Implementierung. V2 wird nicht als Folge zufälliger Einzelwerkzeuge entwickelt, sondern als zusammenhängende Systemblöcke mit klaren Abhängigkeiten.

Erst nach Abschluss und Freigabe dieser Masterplanung werden konkrete WD-Blöcke ab WD-20 nummeriert.

## 2. Verbindliche Planungsregel

Reihenfolge:

`V2 Scope Definition → V2 Funktionskatalog → Abhängigkeiten/Architektur → V2 Entwicklungsroadmap → WD-20`

Neue Ideen während der V2-Entwicklung werden grundsätzlich in den V3-Backlog aufgenommen. Aufnahme in V2 nur, wenn sie nachweislich notwendig ist, um einen bereits freigegebenen V2-Block korrekt oder technisch tragfähig abzuschließen.

## 3. Bereits in der bestehenden Masterliste für V1–V2 vorgesehene Funktionen

Die bestehende FROZEN Masterliste enthält bereits folgende V1–V2-Kandidaten:

- F003 Letzte Projekte
- F015 Ebenen/Layers
- F024 Darstellungsmodi
- F025 Vierfachansicht
- F031 Ursprung/Mittelpunkt
- F032 Snap
- F036 Lineal/Abstand
- F038 Bemaßung anzeigen
- F042 Kreis/Bogen
- F043 Profile
- F047 Kugel/Kegel/Ebene
- F048 Rohr/Torus
- F056 Texturen
- F057 Metallisch
- F058 Rauigkeit
- F059 Transparenz
- F060 Materialtypen/Presets
- F061 Materialbibliothek
- F062 Material entfernen
- F065 Lichtobjekte
- F066 Screenshot/Preview
- F069 Objektbibliothek
- F070 Zur Bibliothek hinzufügen
- F071 Aus Bibliothek einfügen
- F073 Import OBJ/STL
- F076 Export OBJ/STL
- F078 Export Baugruppe
- F085 Events
- F086 Performance

Diese IDs werden nicht stillschweigend verändert. Neue V2-Funktionen erhalten erst nach Abschluss des Funktionskatalogs kontrolliert neue IDs bzw. eine neue Revision der Masterliste.

## 4. V2-Systemblock A – Sketch-Kern und Topologie

V2 erweitert die bisherige Skizze von einer einfachen Geometriesammlung zu einer adressierbaren Sketch-Struktur.

Geplanter Funktionsumfang:

- einzelne Sketch-Elemente auswählbar;
- einzelne Linien separat löschen und bearbeiten;
- Punkte und Endpunkte separat auswählbar;
- Mehrfachauswahl von Sketch-Elementen und Punkten;
- Linien, Rechteck/Polygon als vorhandene Grundelemente weiterverwenden;
- Kreis und Bogen ergänzen;
- Spline als neuer V2-Kandidat;
- Sketch-Elemente besitzen stabile interne Identitäten;
- Undo/Redo für Elementänderungen;
- Inspector kann Eigenschaften des ausgewählten Sketch-Elements bzw. Punktes anzeigen und bearbeiten;
- bestehende V1-Skizzen müssen kompatibel übernommen werden.

### Punkte verbinden

Für zwei ausgewählte Endpunkte werden mindestens folgende Konzepte vorgesehen:

- Punkte geometrisch zusammenführen;
- koinzidente Beziehung/Constraint als spätere bzw. erweiterte Variante;
- visuell erkennbarer geschlossener Übergang.

Weitere Constraints wie horizontal, vertikal, parallel, rechtwinklig oder tangential werden im V2-Funktionskatalog geprüft und nicht automatisch vorausgesetzt.

## 5. V2-Systemblock B – Konturen und Profile

Aus Sketch-Geometrie werden explizit erkennbare und auswählbare Profile.

Geplanter Funktionsumfang:

- automatische Erkennung geschlossener Konturen;
- mehrere geschlossene Bereiche innerhalb einer einzigen Skizze;
- gezielte Auswahl eines oder mehrerer geschlossener Bereiche;
- Innenkonturen/Lochbereiche fachlich berücksichtigen;
- offene Pfade von geschlossenen Profilen unterscheiden;
- 3D-Features referenzieren konkrete Profile/Konturen und nicht nur pauschal die gesamte Skizze;
- eine Skizze kann Quelle mehrerer unabhängiger 3D-Features sein.

Beispiel:

Eine Skizze enthält drei Rechtecke und einen Kreis. Für eine Extrusion kann nur Rechteck 1 gewählt werden; eine zweite Extrusion kann Rechteck 2 und den Kreis verwenden.

## 6. V2-Systemblock C – Sketch-Bezugsebenen

Skizzen sollen nicht nur auf globalen XY/XZ/YZ-Ebenen erstellt werden können.

Geplanter V2-Umfang:

- neue Skizze auf einer ausgewählten planaren Körperfläche;
- lokale Sketch-Ebene wird aus der Fläche abgeleitet;
- Sketch bleibt logisch an den Bezugsgegenstand gebunden;
- Extrusion nach außen oder innen auf Basis dieser Skizze;
- Grundlage für Aufbauten, Taschen und Bohrungs-/Ausschnittgeometrie.

V2 wird zunächst auf planare Flächen begrenzt. Skizzen direkt auf gekrümmten Flächen sind nicht automatisch Bestandteil von V2.

## 7. V2-Systemblock D – Sketch Templates / Sketch Library

Skizzen sollen als wiederverwendbare Vorlage gespeichert und erneut eingefügt werden können.

Geplanter Inhalt eines Templates:

- Sketch-Geometrie;
- Elementstruktur;
- Profile/Konturen;
- sinnvolle lokale Bezugsdaten;
- perspektivisch Maße/Constraints, sofern diese in V2 tatsächlich eingeführt werden.

Nicht Ziel ist der Export eines kompletten 3D-Projekts. Das Template ist bewusst eine wiederverwendbare 2D-Skizzenvorlage.

Typische Anwendungen:

- Lochbilder;
- Flanschkonturen;
- Halterungen;
- Profilquerschnitte;
- standardisierte Ausschnitte.

## 8. V2-Systemblock E – 2D-zu-3D-Featurekette

Die vorhandene Extrusion wird auf die neue Profil-/Konturlogik umgestellt und anschließend erweitert.

Geplante Featurefamilie:

- Extrude auf ausgewählte Profile;
- Extrude additiv;
- Extrude subtraktiv / Tasche bzw. Ausschnitt;
- Revolve/Rotation um eine Achse;
- Sweep eines Profils entlang Linie/Bogen/Spline;
- Loft zwischen mehreren Profilen;
- Orientierung/Verdrehung entlang eines Sweep-Pfades als zu spezifizierende V2-Funktion.

Beispiel Sweep:

Ein rechteckiges Profil wird entlang eines Splines ausgetragen. Die Orientierung des Profils entlang des Pfades und eine mögliche definierte Verdrehung müssen explizit spezifiziert werden.

## 9. V2-Systemblock F – Körper- und Modifier-Modellierung

Die bisherige Masterliste führt Boolean und Bevel/Cut/Knife noch als `Später`. Für V2 wird geprüft, welche dieser Funktionen bewusst vorgezogen werden sollen, weil sie für eine zusammenhängende Modellierungsbasis notwendig sind.

V2-Kandidaten:

- Boolean Union;
- Boolean Subtract;
- Boolean Intersect;
- Bevel/Fase;
- Fillet/Abrundung;
- Shell/Hohlkörper;
- Spiegeln;
- lineares/radiales Pattern bzw. Array;
- weitere nicht-destruktive oder nachvollziehbare Modifier nur nach gesonderter Bewertung.

Noch keine dieser Erweiterungen ändert automatisch die FROZEN Masterliste. Das geschieht erst über die V2-Funktionskatalog-Freigabe.

## 10. V2-Systemblock G – Transformieren, Konstruieren und Messen

Aufbauend auf F031/F032/F036/F038:

- Ursprung/Mittelpunkt/Pivot bearbeiten;
- erweitertes Snap;
- präzisere Konstruktionshilfen;
- Abstand messen;
- sichtbare Bemaßungen;
- Ausrichten und Spiegeln als V2-Kandidaten bewerten;
- Winkelmessung als Kandidat bewerten.

## 11. V2-Systemblock H – Szene und große Projekte

Geplanter Ausbau:

- Layers/Ebenen;
- Suche und Filter im Objektbaum als Kandidat;
- Reparenting/Umstrukturieren als Kandidat;
- weitere Skalierbarkeit großer Baugruppen;
- GLB/GLTF-interne Hierarchie als eigenständigen Kandidaten spezifizieren.

### GLB/GLTF-Hierarchie

Der bereits vorgemerkte Wunsch, interne Nodes/Meshes einer importierten GLB/GLTF-Datei als adressierbare CM3D-Unterobjekte nutzbar zu machen, bleibt bewusst ein separater Planungsgegenstand. Er wird nicht ungeprüft mit Sketch- oder Modifier-Arbeiten vermischt.

Zu prüfen:

- Hierarchie übernehmen ohne vollständige Konvertierung in native Geometrie;
- Unterobjekte separat auswählen;
- Sichtbarkeit/Sperre/Transform je Unterobjekt;
- optional löschen bzw. lösen;
- saubere Export-/Save-Load-Semantik.

## 12. V2-Systemblock I – Materialien, Darstellung und Licht

Aufbauend auf F056–F066:

- Texturen;
- Metallic;
- Roughness;
- Transparenz;
- Material-Presets;
- Materialbibliothek;
- Material entfernen;
- Lichtobjekte;
- Screenshot/Preview;
- zusätzliche Darstellungsmodi;
- Vierfachansicht.

## 13. V2-Systemblock J – Bibliotheken und Import/Export

Aufbauend auf F069–F078:

- Objektbibliothek;
- eigenes Objekt/Baugruppe zur Bibliothek hinzufügen;
- aus Bibliothek einfügen;
- Sketch Templates als separaten 2D-Bibliothekspfad;
- OBJ/STL Import;
- OBJ/STL Export;
- Baugruppenexport;
- weitere Austauschformate nur nach Scope-Entscheidung.

## 14. V2-Systemblock K – Produktivität, Events und Performance

Aufbauend auf F003/F085/F086:

- letzte Projekte;
- Events/Interaktionsdiagnose;
- Performanceanzeige;
- größere reale Projekte als Testfälle;
- Regressionstests der V1-Grundfunktionen während des V2-Ausbaus.

## 15. Architekturprinzipien für V2

V2 soll folgende Grundsätze einhalten:

1. Datenmodell vor UI-Patchwork.
2. Stabile Identitäten für adressierbare Sketch-Elemente, Profile und Feature-Referenzen.
3. Ein 3D-Feature referenziert seine konkrete Quelle nachvollziehbar.
4. Bestehende V1-Projekte bleiben möglichst kompatibel.
5. Undo/Redo wird nicht durch parallele Sonderlogik umgangen.
6. Save/Load muss neue V2-Strukturen vollständig erhalten.
7. Viewer, Objektbaum und Inspector verwenden dieselbe zentrale Auswahl-/Datenbasis.
8. iPad/Safari bleibt verbindlicher Gerätetestpfad.
9. PASS/FROZEN erst nach realem Test und Merge in `main`.
10. Keine zufällige Vermischung unabhängiger Systemblöcke.

## 16. Vorläufige Abhängigkeitskette

Die fachlich wahrscheinlichste Kernreihenfolge lautet derzeit:

`Sketch-Datenmodell → Element/Punkt-Auswahl → Konturen/Profile → Sketch auf Fläche → Extrude-Neubasis → Revolve → Spline/Pfade → Sweep → Loft → Körper/Modifier`

Parallel bzw. danach können Szene/Layers, Materialien, Viewport, Bibliotheken sowie Import/Export in eigene Entwicklungsstränge eingeordnet werden.

Diese Reihenfolge ist noch **keine WD-Roadmap**.

## 17. Noch zu entscheiden vor WD-20

- endgültiger V2-Scope;
- welche bisherigen `Später`-Funktionen bewusst in V2 vorgezogen werden;
- Umfang der Sketch-Constraints;
- genaue Featurehistorie/Abhängigkeitslogik zwischen Sketch, Profil und Körper;
- Add/Subtract-Semantik für Extrude;
- Sweep-Orientierung und Verdrehungsmodell;
- Loft-Mindestumfang;
- Modifier-Mindestumfang;
- GLB-Hierarchie: V2 oder V3;
- Suche/Filter/Reparenting: V2 oder V3;
- genaue Entwicklungsreihenfolge;
- erst danach Vergabe WD-20 ff.

## 18. Aktueller Planungsstatus

**V2 Scope Definition: IN ARBEIT**

Noch keine Implementierung.  
Noch keine WD-20-Vergabe.  
Noch kein V2-Freeze.
