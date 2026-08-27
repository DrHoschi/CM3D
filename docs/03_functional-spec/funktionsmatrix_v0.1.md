# CyberMotion Web Designer – Funktionsmatrix V0.1

**Quelle:** `CyberMotion_Web_Designer_Funktionsmatrix_V0_1.xlsx`  
**Erstellt:** 07.06.2026 19:06  
**Status der Quelle:** Planungsstand V0.1

## Grundentscheidungen

- Eigenständiges Hauptprogramm; Baustellenplaner später nur Anwendung/Verbraucher der Modelle.
- Vertraute Arbeitsweise: Szene, Objektbaum, Viewport, 2D-Zeichnen, Achsenbearbeitung, Einheiten, feste Ansichten, Materialien, Gruppen/Baugruppen.
- Eigene Icons, eigene Oberfläche, eigener Code, eigenes Datenmodell; keine alten Programmdateien oder Grafiken übernehmen.
- V1 priorisiert stabiles Grundsystem statt Rendering: Zeichnen, Transformieren, Kameraansichten, Objektbaum, Speichern/Laden und Export.
- Icon-Basis: eigenes V3-Paket.

## Prioritäten

- **A / V1 Pflichtkern:** muss sofort ins Fundament.
- **B / V1–V2 vorbereitet:** strukturell direkt einplanen.
- **C / später:** Ausbau und Spezialfunktionen.

## 75 Funktionsdefinitionen

| Nr. | Bereich | Funktion | Priorität | Icon-Kategorie |
|---:|---|---|---|---|
| 1 | Projekt | Neues Projekt | A | project |
| 2 | Projekt | Projekt öffnen | A | project/file |
| 3 | Projekt | Speichern | A | project |
| 4 | Projekt | Speichern unter | A | project |
| 5 | Projekt | Projekt-Einstellungen | A | project/measure |
| 6 | Szene | Objektbaum | A | scene |
| 7 | Szene | Objekt auswählen | A | select/scene |
| 8 | Szene | Umbenennen | A | scene |
| 9 | Szene | Sichtbarkeit | A | scene |
| 10 | Szene | Sperren/Entsperren | A | scene |
| 11 | Szene | Gruppen | A | scene |
| 12 | Szene | Baugruppen | A | scene/library |
| 13 | Viewport | 3D-Hauptansicht | A | viewport |
| 14 | Viewport | Top View | A | viewport |
| 15 | Viewport | Front View | A | viewport |
| 16 | Viewport | Side View | A | viewport |
| 17 | Viewport | Perspektive/Isometrie | A | viewport |
| 18 | Viewport | Fit View / Fokus | A | select/viewport |
| 19 | Viewport | Orbit/Pan/Zoom | A | select |
| 20 | Viewport | Raster und Achsen | A | viewport/measure |
| 21 | Viewport | Darstellungsmodi | B | viewport |
| 22 | Viewport | Vierfachansicht | B | viewport |
| 23 | Transform | Position X/Y/Z | A | transform |
| 24 | Transform | Rotation X/Y/Z | A | transform |
| 25 | Transform | Skalierung X/Y/Z | A | transform |
| 26 | Transform | Weltachsen | A | transform/measure |
| 27 | Transform | Objektachsen | A | transform/measure |
| 28 | Transform | Ursprung/Mittelpunkt | B | transform |
| 29 | Transform | Snap | B | transform |
| 30 | Transform | Spiegeln | C | transform |
| 31 | Transform | Ausrichten | C | transform |
| 32 | Einheiten/Messen | Einheitenwechsel | A | measure |
| 33 | Einheiten/Messen | Lineal/Abstand | B | measure |
| 34 | Einheiten/Messen | Winkel messen | C | measure |
| 35 | Einheiten/Messen | Bemaßung anzeigen | B | measure |
| 36 | 2D-Zeichnen | 2D-Skizzenmodus | A | modeling/create |
| 37 | 2D-Zeichnen | Linien | A | modeling |
| 38 | 2D-Zeichnen | Rechteck/Polygon | A | create/modeling |
| 39 | 2D-Zeichnen | Kreis/Bogen | B | create/modeling |
| 40 | 2D-Zeichnen | Profile | B | create/modeling |
| 41 | 2D zu 3D | Extrudieren | A | modeling |
| 42 | Erstellen | Quader/Würfel | A | create |
| 43 | Erstellen | Zylinder | A | create |
| 44 | Erstellen | Kugel/Kegel/Ebene | B | create |
| 45 | Erstellen | Rohr/Torus | B | create |
| 46 | Modellierung | Duplizieren | A | modeling |
| 47 | Modellierung | Löschen | A | modeling |
| 48 | Modellierung | Undo/Redo | A | modeling |
| 49 | Modellierung | Boolean Union/Subtract/Intersect | C | modeling |
| 50 | Modellierung | Bevel/Cut/Knife | C | modeling |
| 51 | Materialien | Material zuweisen | A | materials |
| 52 | Materialien | Texturen | B | materials/file |
| 53 | Materialien | Materialbibliothek | B | materials/library |
| 54 | Materialien | Material entfernen | B | materials |
| 55 | Kamera/Licht | Kameraobjekt | A | camera-light |
| 56 | Kamera/Licht | Kamera-Vorschau | A | camera-light/viewport |
| 57 | Kamera/Licht | Lichtobjekte | B | camera-light |
| 58 | Kamera/Licht | Screenshot/Preview | B | camera-light |
| 59 | Rendering | Rendering | C | camera-light |
| 60 | Rendering | Render-Nachbearbeitung | C | camera-light |
| 61 | Bibliothek | Objektbibliothek | B | library |
| 62 | Bibliothek | Zur Bibliothek hinzufügen | B | library |
| 63 | Bibliothek | Aus Bibliothek einfügen | B | library |
| 64 | Import/Export | Import GLB/GLTF | A | file |
| 65 | Import/Export | Import OBJ/STL | B | file |
| 66 | Import/Export | Import CMO/CMU | C | file |
| 67 | Import/Export | Export GLB/GLTF | A | file |
| 68 | Import/Export | Export Auswahl | A | file |
| 69 | Import/Export | Export JSON | A | file |
| 70 | Inspector | Eigenschaftenpanel | A | inspector |
| 71 | Inspector | Debug/Diagnose | A | inspector |
| 72 | Inspector | Status/Meldungen | A | inspector |
| 73 | UI | Vertrautes Hauptlayout | A | app |
| 74 | UI | Eigene Icons | A | app/all |
| 75 | Performance | Große Welt/kleine Objekte | A | viewport/select |

## V1-MVP-Reihenfolge der Quelle

1. Projekt-Shell
2. 3D-Viewport
3. SceneGraph + Objektbaum
4. Transform-Grundsystem
5. Welt-/Objekt-Achsen
6. Einheiten + große Welt
7. feste Ansichten
8. 2D-Skizzenbasis
9. Extrude-Basis
10. Material/Farbe
11. Export/Import modern
12. Inspector/Debug

## Quellhinweis

Diese Markdown-Fassung bildet Struktur und Funktionsbestand der XLSX-Quelle für GitHub-Navigation und Cross-Checks ab. Die XLSX bleibt die Originalquelle, bis ein formaler CM3D-Freeze festgelegt wurde.
