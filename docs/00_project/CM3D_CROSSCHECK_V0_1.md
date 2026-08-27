# CM3D – Cross-Check V0.1

**Datum:** 27.08.2026  
**Verglichene Quellen:**
1. `cybermotion_web_designer_hauptfenster_v01.docx`
2. `CyberMotion_Web_Designer_Funktionsmatrix_V0_1.xlsx`
3. `cybermotion_web_designer_icons_complete_v3.zip`
4. harmonisierte Projektentscheidung `CM3D_MASTER_FUNCTIONS_V0_1.md`

## Ergebnis

Die drei Ausgangsquellen bilden eine konsistente gemeinsame Projektidee. Es gibt **keinen grundlegenden Architekturwiderspruch**: eigenständiger Web-3D-Designer, vertraute Arbeitslogik, eigenes UI/Icons/Datenmodell, zentraler 3D-Viewport, SceneGraph/Objektbaum, Transform, Einheiten, Material, Import/Export und Inspector.

Kennzahlen der Ausgangsquellen:
- Funktionsmatrix: **75 Funktionsdefinitionen**
- Icon-Paket: **148 SVG-Icons**
- Icon-Kategorien der Matrix: **vollständig durch das Icon-Paket abgedeckt**
- Hauptlayout: Hauptfenster und Matrix stimmen in der Grundstruktur überein.

Die Harmonisierung führt zu einer verbindlichen **CM3D-Masterliste mit 89 Funktionen**. Die ursprüngliche Matrix bleibt unverändert als Quellstand erhalten.

## Entscheidungen AL-01 bis AL-06

### AL-01 – Exportumfang
**ENTSCHIEDEN.** GLB/GLTF und JSON gehören zu V1. OBJ/STL-Export wird ausdrücklich aufgenommen und als **V1–V2** eingeordnet. Damit sind Hauptfenster, Matrix und vorhandene Export-Icons widerspruchsfrei abgebildet.

### AL-02 – Projektaktionen
**ENTSCHIEDEN.** `Projekt schließen` wird als **V1** aufgenommen. `Letzte Projekte` wird als **V1–V2** aufgenommen.

### AL-03 – Ebenen/Layers
**ENTSCHIEDEN.** Ebenen/Layers sind eine echte CM3D-Funktion und werden als **V1–V2** geführt. Der Tab im Hauptfenster und `layer.svg` erhalten damit eine eindeutige funktionale Zuordnung.

### AL-04 – Materialparameter
**ENTSCHIEDEN.** Farbe/Base Color gehört zu **V1**. Metallisch, Rauigkeit, Transparenz sowie Materialtypen/Presets werden als **V1–V2** aufgenommen. Rendering bleibt davon getrennt und weiterhin späterer Ausbau.

### AL-05 – Inspector-Unterfunktionen
**ENTSCHIEDEN.** V1 umfasst Eigenschaftenpanel, Konsole/Debug/Diagnose, Status/Meldungen/Warnungen/Fehler, Scene JSON und Selection/Auswahlstatus. Events und Performance werden als **V1–V2** geführt.

### AL-06 – Scope-Trennung
**ENTSCHIEDEN.** `P0.1 Minimal-Prototyp` und `V1 Pflichtkern` sind ausdrücklich getrennte Ausbaustufen. P0.1 validiert nur die kleinste durchgehende Bedien- und Speicher-Kette; V1 bleibt der vollständige Pflichtkern der Masterliste.

## Bestätigte Übereinstimmungen

### Projekt und Szene
Neues Projekt, Öffnen, Speichern, Speichern unter, Projekteinstellungen, Objektbaum, Auswahl, Rename, Sichtbarkeit, Lock, Gruppen und Baugruppen sind konzeptionell deckungsgleich. Fehlende Projektaktionen wurden über AL-02 ergänzt.

### Viewport
Perspektive, feste Ansichten, Isometrie, Grid/Achsen, Darstellungsmodi, Fokus, Orbit/Pan/Zoom sind dokumentiert und mit passenden Icons vorhanden.

### Transform
Position, Rotation, Skalierung, Welt-/Objektachsen, Ursprung/Pivot und Snap sind fachlich abgedeckt; Mirror/Align bleiben spätere Funktionen.

### Materialien
Materialzuweisung, Farbe, Textur, Bibliothek und Entfernen sind vorhanden. Die Granularität von Metallisch/Rauigkeit/Transparenz und Materialtypen ist durch AL-04 geklärt.

### Inspector / Debug
Eigenschaften, Console/Debug, Warnungen, Fehler, Scene JSON, Selection sowie vorbereitete Events/Performance sind durch AL-05 eindeutig eingeordnet.

## Icon-Abgleich

Das Icon-Paket ist für die harmonisierte Basis ausreichend breit angelegt. Bereits vorhandene Zusatzicons für Projekt schließen, letzte Projekte, Layer, OBJ/STL-Export, konkrete Materialtypen und detaillierte Inspector-/Viewport-Aktionen passen zu den nun festgelegten Masterfunktionen.

**Das Icon-Paket ist nicht der Engpass.**

## Restcheck

- Keine offenen AL-Punkte mehr.
- Keine widersprüchliche Exportzuordnung mehr.
- Projektaktionen vollständig eingeordnet.
- Ebenen/Layers eindeutig eingeordnet.
- Materialparameter eindeutig eingeordnet.
- Inspector-Unterfunktionen eindeutig eingeordnet.
- P0.1 und V1 ausdrücklich getrennt.
- Originalquellen bleiben als historische Ausgangsstände erhalten; die Masterliste ist die harmonisierte Projektbasis.

## Freeze-Entscheidung

**AL-01 bis AL-06: COMPLETE.**  
**Cross-Check: PASS.**  
**Offene Baseline-Blocker: 0.**

Der Dokumentationsstand ist als **CM3D V0.1 BASELINE – FROZEN** freigabefähig. Verbindliche Funktionsquelle ist ab Freeze `docs/03_functional-spec/CM3D_MASTER_FUNCTIONS_V0_1.md`.
