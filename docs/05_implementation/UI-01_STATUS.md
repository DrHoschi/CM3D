# UI-01 – Contextual Command Surface

**Stand:** 2026-08-28  
**Status:** PASS / FROZEN  
**Branch:** `feature/ui-01-contextual-command-surface`  
**Basis:** `main` nach WD-11A (`823e7cef88dc2a74b3fca9b4ccab0767cd047aa6`)

## Ziel

Die bisherige dauerhaft gefüllte Toolbar wurde durch die in `docs/02_ui-ux/hauptfenster_v0.2.md` festgelegte kompakte, kontextabhängige Bedienstruktur ersetzt, ohne die bereits eingefrorenen WD-01 bis WD-11A-Funktionen fachlich zu verändern.

## Umsetzung

- kompakte obere Hauptnavigation mit `Neu`, `Datei`, `Bearbeiten`, `Ansicht`, `Transform`, `Modellieren`, `Szene`, `Material`, `Werkzeuge`;
- `Neu`, `Datei` und `Bearbeiten` als aufklappbare Menüs;
- zweite Zeile als echte Kontextleiste statt dauerhafter Vollbelegung;
- im Leerlauf werden keine Werkzeug-Icons in der Kontextleiste angezeigt;
- erst nach einer passenden Hauptmenü-/Modusauswahl erscheint ausschließlich der zugehörige Werkzeugsatz;
- `Neu → Neues Objekt` zeigt nur die Objekt-Erstellwerkzeuge;
- `Neu → Neue Skizze` zeigt nur die Sketch-Werkzeuge;
- `Ansicht`, `Transform`, `Modellieren`, `Szene`, `Material` und `Werkzeuge` schalten jeweils nur ihren eigenen Kontext sichtbar;
- Auswahl eines Sketches schaltet automatisch in den Sketch-Kontext;
- Auswahl von Gruppe/Baugruppe schaltet automatisch in den Szene-Kontext;
- Auswahl eines normalen Objekts schaltet in den Transform-Kontext;
- Extrudieren startet als Werkzeug und zeigt die Tiefe im Inspector; `Anwenden` führt weiterhin den bestehenden WD-09-Extrude-Pfad aus;
- WD-11A-Projektdatei Export/Import bleibt funktional unverändert und liegt unter `Datei`;
- Material/Farbe bleibt der bestehende WD-10A-Inspector-Pfad und wird über den Material-Kontext erreichbar gemacht;
- Rückgängig/Wiederholen sind im neuen `Bearbeiten`-Menü korrekt verdrahtet und synchronisieren ihren Aktivzustand mit der History;
- bestehende IDs der implementierten Bedienelemente wurden soweit möglich beibehalten, damit die vorhandene Funktionslogik nicht dupliziert wird.

## Icon-Integration

Als sichtbare UI-Grundlage wird das vom Projekt bereitgestellte Paket `cybermotion_web_designer_icons_complete_v3.zip` verwendet.

- die verwendeten Symbole stammen aus den dort enthaltenen V3-SVGs;
- die aktuell benötigten Symbole liegen in `design/icons/cm3d-ui-icons-v3.svg` als SVG-Sprite;
- verwendet werden unter anderem App-Logo, Neu, Datei, Ansicht, Move/Rotate/Scale, Extrude, Szene, Material, Messen, Würfel, Kugel, Zylinder, Gruppe, Baugruppe, Auflösen, Undo/Redo, Löschen, Duplizieren, Speichern, Laden sowie Projektdatei Import/Export;
- die V3-Farbsemantik bleibt erhalten: Blau, Grün, Orange, Rot, Gelb, Violett und Cyan entsprechend dem bereitgestellten Style Guide;
- Safari bindet den Sprite zur Laufzeit intern ein, damit die Farbklassen zuverlässig dargestellt werden;
- die künstlichen hellen Icon-Kachelhintergründe wurden entfernt, damit der transparente Hintergrund des originalen V3-Sets erhalten bleibt.

## Gerätetest – PASS

Der UI-01-Gerätetest auf iPad/Safari wurde erfolgreich abgeschlossen. Geprüft wurden insbesondere:

1. Startzustand ohne dauerhaft sichtbare Werkzeuggruppen;
2. `Neu → Neues Objekt` und die Objekt-Erstellwerkzeuge;
3. `Neu → Neue Skizze` sowie Linie/Rechteck/Polygon;
4. Ansicht und Transform einschließlich Move/Rotate/Scale/WORLD/LOCAL/Snap;
5. Wechsel zwischen den Kontextbereichen ohne stehenbleibende Werkzeuggruppen;
6. farbige V3-Icons ohne künstliche helle Kachelhintergründe;
7. Extrudieren mit Inspector-Werkzeugblock und `Anwenden`;
8. Gruppe/Baugruppe/Auflösen, Duplizieren und Löschen;
9. Material/Farbe;
10. localStorage Speichern/Laden;
11. WD-11A-Projektdatei Export/Import;
12. Laden und Weiterbearbeiten eines größeren bestehenden Projekts mit Hierarchie, Farben und Geometrie;
13. Rückgängig/Wiederholen nach Korrektur der UI-01-Menüverdrahtung.

**Testergebnis:** PASS  
**Offene UI-01-Blocker:** 0

## Nicht Teil von UI-01

- keine neue GLB/GLTF-Funktion; das bleibt WD-11B;
- keine neuen Primitive über die bereits implementierten Würfel/Kugel/Zylinder hinaus;
- keine Boolean-/Revolve-/Spline-Funktion;
- noch keine echte Auswahl/Löschung einzelner Sketch-Linien im Objektbaum; dafür ist eine separate Sketch-Daten-/Interaktions-Erweiterung nötig;
- keine Änderung der CM3D-Projektdatei oder Schema-Version.

## Freeze-Entscheidung

UI-01 ist **PASS / FROZEN**. Der Stand darf nach `main` übernommen werden. Der nächste Entwicklungsblock kann anschließend WD-11B auf Basis der neuen Contextual Command Surface beginnen.
