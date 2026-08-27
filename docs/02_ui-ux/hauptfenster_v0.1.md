# CyberMotion Web Designer – Hauptfenster / Programmstruktur V0.1

**Stand:** 07.06.2026  
**Quelle:** `cybermotion_web_designer_hauptfenster_v01.docx`

## Projektziel

Eigenständiger webbasierter 3D-Designer als moderner Ersatz für die frühere CyberMotion-3D-Designer-Arbeitsweise.

Der Baustellenplaner ist nicht das Hauptprogramm, sondern später eine Anwendung, die Modelle aus diesem Designer verwenden kann.

## 1. Hauptfenster V0.1

- **Oben:** Menüleiste – Projekt | Datei | Bearbeiten | Ansicht | Objekt | Material | Export | Hilfe / Inspector
- **Links:** Objektbaum | Szene | Ebenen | Bibliothek
- **Mitte:** 3D-Viewport | Raster / Achsen / Kamera | Auswahl / Bearbeitung
- **Rechts:** Eigenschaften | Transform | Material | Objektinfos
- **Unten:** Statusleiste – Einheit | Snap | Koordinaten | Auswahl | Meldungen | Debug

Grundregel: vertraute Bedienlogik, aber eigene Oberfläche, eigene Icons, eigener Code und eigenes Datenmodell.

## 2. Grundidee

- eigene Icons
- eigene Oberfläche
- eigener Code
- eigenes Datenmodell
- eigenes Projektformat
- CyberMotion dient als Arbeitslogik-Vorbild, nicht als kopierte Vorlage

## 3. Obere Menüleiste

### Projekt
- Neues Projekt
- Projekt öffnen
- Letzte Projekte
- Projekt speichern
- Speichern unter
- Projekteinstellungen
- Projekt schließen

### Datei
- Import
- Export
- Auswahl exportieren
- GLB / GLTF / OBJ / STL / JSON exportieren
- CMO/CMU-Import später vorbereiten

### Bearbeiten
- Rückgängig
- Wiederholen
- Duplizieren
- Löschen
- Umbenennen
- Gruppieren
- Gruppe lösen

### Ansicht
- Perspektive
- Front/Back/Links/Rechts/Oben/Unten
- Isometrisch
- Raster und Achsen
- Drahtmodell / Solid / Material / Render-Vorschau

### Objekt
- Würfel
- Quader
- Zylinder
- Kugel
- Kegel
- Ebene
- Torus
- Rohr
- Profil
- Text
- Leeres Objekt
- Gruppe
- Baugruppe

### Material
- Material zuweisen
- Material entfernen
- Farbe
- Textur
- Metall
- Kunststoff
- Glas
- Holz
- Beton
- Gummi
- Materialbibliothek

### Export
- Ganze Szene exportieren
- Auswahl exportieren
- Baugruppe exportieren
- Projektdatei exportieren
- Vorschaubild / Thumbnail später

### Inspector / Debug
- Eigenschaften
- Konsole
- Diagnose
- Warnungen
- Fehler
- Scene JSON
- Auswahlstatus

## 4. Linker Bereich

Tabs: **Szene | Ebenen | Bibliothek**

### Szene
- Objektbaum mit Kameras, Lichtern, Objekten, Materialien und Hilfsobjekten
- Objekt auswählen, umbenennen, ein-/ausblenden, sperren/entsperren
- Gruppen und Baugruppen erstellen
- Unterobjekte aufklappen und Hierarchie verschieben

### Ebenen
- Ebene 0
- Konstruktion
- Hilfslinien
- Importierte Modelle
- Kameras und Lichter
- Baugruppen

### Bibliothek
- Grundkörper
- eigene Baugruppen
- importierte Assets
- Materialien
- Vorlagen
- Favoriten

## 5. Mittlerer Bereich: 3D-Viewport

- Raster
- Achsen X/Y/Z
- Kamera-Navigation
- Auswahlrahmen
- Transform-Gizmo
- Objekt-Hervorhebung
- Ansichtsumschaltung
- Zoom / Pan / Orbit
- Fokus auf Auswahl

Viewport-Werkzeugleiste: **Auswahl | Verschieben | Drehen | Skalieren | Messen | Ansicht | Snap**

## 6. Rechter Bereich

Tabs: **Eigenschaften | Transform | Material | Info**

### Eigenschaften
Name, Typ, Sichtbar, Gesperrt, Gruppe/Baugruppe, Ebene, interne ID / UUID.

### Transform
Position X/Y/Z, Rotation X/Y/Z, Skalierung X/Y/Z, Ursprung / Pivot, Reset Transform, Mittelpunkt setzen, Ursprung setzen.

### Material
Aktuelles Material, Farbe, Textur, Metallisch, Rauigkeit, Transparenz, Material zuweisen, Material entfernen.

### Info
Punkte, Kanten, Flächen, Maße, Bounding Box, Importquelle, Exportstatus.

## 7. Untere Statusleiste

Beispiel: `Einheit: mm | Snap: Raster 10 mm | X: 0 Y: 0 Z: 0 | Auswahl: Würfel | Status: gespeichert`

Anzeigen: aktuelle Einheit, Snap-Status, Koordinaten, aktuelle Auswahl, aktuelle Aktion, Speicherstatus, Warnungen, Fehler, Debug-Status.

## 8. Inspector / Debug

Von Anfang an vorbereitet: Console, Events, Scene JSON, Selection, Performance, Warnings, Errors.

Der Inspector dient insbesondere der Prüfung von Objektbaum, Auswahlstatus, Transform, Speicherstatus, Import/Export, Materialzuweisung und Events.

## 9. Icon-Paket V3

Verwendet wird `cybermotion_web_designer_icons_complete_v3`.

- 148 SVG-Icons
- `viewBox: 0 0 24 24`
- Stil: `v3 playful technical`
- nicht aus alten CyberMotion-Dateien kopiert
- vertraut, aber eigenständig

Kategorien: app, project, file, viewport, select, transform, create, modeling, scene, materials, camera-light, measure, library, inspector, all.

## 10. Festlegung V0.1

Oben klassische Menüleiste; links Objektbaum / Szene / Ebenen / Bibliothek; Mitte 3D-Viewport; rechts Eigenschaften / Transform / Material / Objektinfos; unten Statusleiste; Inspector/Debug vorbereitet; Icon-Paket V3 als UI-Grundlage; keine direkte Kopie alter CyberMotion-Grafiken.

## 11. Nächster Schritt der Quelle

1. Funktionsmatrix „CyberMotion alt → Web-Designer neu“
2. Datenmodell / Projektformat
3. Repository-Struktur
4. V0.1-Minimalversion: leeres Projekt, 3D-Viewport, Objektbaum, Würfel erstellen, auswählen, transformieren, speichern/laden, Icons einbinden
