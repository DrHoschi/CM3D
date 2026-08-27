# CM3D – Cross-Check V0.1

**Datum:** 27.08.2026  
**Verglichene Quellen:**
1. `cybermotion_web_designer_hauptfenster_v01.docx`
2. `CyberMotion_Web_Designer_Funktionsmatrix_V0_1.xlsx`
3. `cybermotion_web_designer_icons_complete_v3.zip`

## Ergebnis

Die drei Quellen bilden eine konsistente gemeinsame Projektidee. Es gibt **keinen grundlegenden Architekturwiderspruch**: eigenständiger Web-3D-Designer, vertraute Arbeitslogik, eigenes UI/Icons/Datenmodell, zentraler 3D-Viewport, SceneGraph/Objektbaum, Transform, Einheiten, Material, Import/Export und Inspector.

Kennzahlen:
- Funktionsmatrix: **75 Funktionsdefinitionen**
- Icon-Paket: **148 SVG-Icons**
- Icon-Kategorien der Matrix: **vollständig durch das Icon-Paket abgedeckt**
- Hauptlayout: Hauptfenster und Matrix stimmen in der Grundstruktur überein.

## Bestätigte Übereinstimmungen

### Projekt und Szene
Neues Projekt, Öffnen, Speichern, Speichern unter, Projekteinstellungen, Objektbaum, Auswahl, Rename, Sichtbarkeit, Lock, Gruppen und Baugruppen sind in Hauptfenster/Matrix konzeptionell deckungsgleich. Das Icon-Paket enthält passende Projekt- und Szenenicons.

### Viewport
Perspektive, feste Ansichten, Isometrie, Grid/Achsen, Darstellungsmodi, Fokus, Orbit/Pan/Zoom sind dokumentiert und mit passenden Icons vorhanden.

### Transform
Position, Rotation, Skalierung, Ursprung/Pivot, Reset, Snap sowie später Mirror/Align sind fachlich und im Icon-Paket abgedeckt.

### Materialien
Material zuweisen/entfernen, Farbe, Textur und Materialbibliothek sind in den Quellen vorgesehen; passende Icons und Materialspezialisierungen liegen vor.

### Inspector / Debug
Eigenschaften, Console/Debug, Warnungen, Fehler und Statusmeldungen sind von Anfang an vorgesehen und im Icon-Paket vorhanden.

## Offene Alignment-Punkte vor einem verbindlichen Freeze

### AL-01 – Exportumfang vereinheitlichen
**Hauptfenster:** nennt GLB, GLTF, OBJ, STL und JSON als Exportformate.  
**Funktionsmatrix:** führt als konkrete Exportfunktionen GLB/GLTF, Auswahl und JSON; OBJ/STL erscheinen nur beim Import.  
**Icon-Paket:** enthält `export-obj.svg` und `export-stl.svg` bereits.

**Bewertung:** Dokumentationslücke, kein technischer Widerspruch. Vor Freeze muss festgelegt werden, ob OBJ/STL Export zu V1, V1–V2 oder später gehört.

### AL-02 – Projektaktionen vollständig in die Matrix übernehmen
**Hauptfenster:** enthält `Letzte Projekte` und `Projekt schließen`.  
**Funktionsmatrix:** keine separaten Funktionszeilen dafür.  
**Icon-Paket:** `recent-projects.svg` und `close-project.svg` vorhanden.

**Bewertung:** Matrix ist hier unvollständiger als Hauptfenster/Icon-Paket.

### AL-03 – Ebenen/Layers als Funktion klären
**Hauptfenster:** linker Hauptbereich enthält einen eigenen Tab `Ebenen` mit Ebene 0, Konstruktion, Hilfslinien, importierten Modellen, Kameras/Lichtern und Baugruppen.  
**Funktionsmatrix:** keine eigene Layer/Ebenen-Funktionsdefinition.  
**Icon-Paket:** `layer.svg` vorhanden.

**Bewertung:** fachlich relevant; Rolle und V1-Priorität festlegen.

### AL-04 – Materialparameter granularisieren
**Hauptfenster:** nennt im rechten Materialbereich u. a. Metallisch, Rauigkeit und Transparenz; im Menü außerdem Metall, Kunststoff, Glas, Holz, Beton und Gummi.  
**Funktionsmatrix:** behandelt Materialzuweisung, Texturen, Bibliothek und Entfernen gröber, ohne diese Parameter einzeln zu definieren.  
**Icon-Paket:** passende Materialicons vorhanden.

**Bewertung:** keine Blockade für V0.1, aber die Matrix sollte klären, welche Materialparameter in V1 tatsächlich editierbar sind.

### AL-05 – Inspector-Unterfunktionen präzisieren
**Hauptfenster:** nennt Console, Events, Scene JSON, Selection, Performance, Warnings und Errors.  
**Funktionsmatrix:** fasst dies überwiegend unter `Debug/Diagnose` und `Status/Meldungen` zusammen.

**Bewertung:** zulässige Verdichtung, solange die Unterfunktionen als Acceptance Scope dokumentiert werden.

### AL-06 – V0.1-Minimalversion und V1-Pflichtkern trennen
**Hauptfenster V0.1 nächster Schritt:** leeres Projekt, 3D-Viewport, Objektbaum, Würfel erstellen, auswählen, transformieren, speichern/laden, Icons einbinden.  
**Funktionsmatrix V1:** deutlich größer; zusätzlich u. a. Welt-/Objektachsen, Einheiten, feste Ansichten, 2D-Skizzenbasis, Extrude, Material, moderne Import/Export-Funktionen und Inspector.

**Bewertung:** kein Widerspruch. Es sind zwei unterschiedliche Ebenen: **V0.1 Minimal-Prototyp** versus **V1 Pflichtkern**. Diese Trennung sollte im Projektstatus ausdrücklich festgehalten werden.

## Icon-Abgleich

Das Icon-Paket ist für die vorhandene Funktionsmatrix ausreichend breit angelegt. Alle verwendeten Matrix-Kategorien existieren. Zusätzlich enthält das Paket bereits Icons für Funktionen, die in der Matrix noch nicht separat erfasst sind, z. B. Projekt schließen, letzte Projekte, Layer, OBJ/STL-Export, konkrete Materialtypen und detaillierte Inspector-/Viewport-Aktionen.

Daraus folgt: **Das Icon-Paket ist derzeit nicht der Engpass.** Die nächste fachliche Arbeit liegt in der Harmonisierung von Hauptfenster und Funktionsmatrix.

## Freeze-Entscheidung

**Stand 27.08.2026: noch nicht FROZEN.**

Empfohlener Status: `BASELINE REVIEW`.

Vor einem verbindlichen CM3D V0.1 Freeze sollten AL-01 bis AL-06 entschieden bzw. in der Funktionsmatrix eindeutig eingeordnet werden. Danach kann aus den drei Ausgangsquellen eine zentrale, widerspruchsfreie CM3D-Spezifikation erzeugt werden.
