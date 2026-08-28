# UI-01 – Contextual Command Surface

**Stand:** 2026-08-28  
**Status:** IMPLEMENTED / DEVICE TEST PENDING  
**Branch:** `feature/ui-01-contextual-command-surface`  
**Basis:** `main` nach WD-11A (`823e7cef88dc2a74b3fca9b4ccab0767cd047aa6`)

## Ziel

Die bisherige dauerhaft gefüllte Toolbar wird durch die in `docs/02_ui-ux/hauptfenster_v0.2.md` festgelegte kompakte, kontextabhängige Bedienstruktur ersetzt, ohne die bereits eingefrorenen WD-01 bis WD-11A-Funktionen fachlich zu verändern.

## Umsetzung

- kompakte obere Hauptnavigation mit `Neu`, `Datei`, `Bearbeiten`, `Ansicht`, `Transform`, `Modellieren`, `Szene`, `Material`, `Werkzeuge`;
- `Neu`, `Datei` und `Bearbeiten` als aufklappbare Menüs;
- zweite Zeile als echte Kontextleiste statt dauerhafter Vollbelegung;
- vorhandene Objekt-, Sketch-, View-, Transform-, Gruppen-/Baugruppen-, Material- und Projektdatei-Funktionen in die neue Struktur eingeordnet;
- Auswahl eines Sketches schaltet automatisch in den Sketch-Kontext;
- Auswahl von Gruppe/Baugruppe schaltet automatisch in den Szene-Kontext;
- Extrudieren startet jetzt als Werkzeug und zeigt die Tiefe im Inspector; `Anwenden` führt weiterhin den bestehenden WD-09-Extrude-Pfad aus;
- WD-11A-Projektdatei Export/Import bleibt funktional unverändert und liegt jetzt unter `Datei`;
- Material/Farbe bleibt der bestehende WD-10A-Inspector-Pfad und wird über den Material-Kontext erreichbar gemacht;
- bestehende IDs der implementierten Bedienelemente wurden soweit möglich beibehalten, damit die vorhandene Funktionslogik nicht dupliziert wird.

## Icon-Integration

Als sichtbare UI-Grundlage wird das vom Projekt bereitgestellte Paket `cybermotion_web_designer_icons_complete_v3.zip` verwendet.

- die verwendeten Symbole stammen direkt aus den dort enthaltenen V3-SVGs;
- für die Weboberfläche wurden die aktuell benötigten Symbole in `design/icons/cm3d-ui-icons-v3.svg` als SVG-Sprite zusammengeführt;
- verwendet werden unter anderem App-Logo, Neu, Datei, Ansicht, Move/Rotate/Scale, Extrude, Szene, Material, Messen, Würfel, Kugel, Zylinder, Gruppe, Baugruppe, Auflösen, Undo/Redo, Löschen, Duplizieren, Speichern, Laden sowie Projektdatei Import/Export;
- die ursprüngliche V3-Farbsemantik und Formensprache bleiben erhalten;
- die Icons werden in der dunklen CM3D-Oberfläche auf hellen Icon-Kacheln dargestellt, damit die dunklen technischen Konturen des V3-Sets lesbar bleiben.

## Nicht Teil von UI-01

- keine neue GLB/GLTF-Funktion; das bleibt WD-11B;
- keine neuen Primitive über die bereits implementierten Würfel/Kugel/Zylinder hinaus;
- keine Boolean-/Revolve-/Spline-Funktion;
- noch keine echte Auswahl/Löschung einzelner Sketch-Linien im Objektbaum; dafür ist eine separate Sketch-Daten-/Interaktions-Erweiterung nötig;
- keine Änderung der CM3D-Projektdatei oder Schema-Version.

## Vorprüfung

- HTML-IDs der bestehenden Funktionsverdrahtung auf Eindeutigkeit geprüft;
- alle für WD-11A/WD-10A/WD-09/Transform/Scene verwendeten zentralen DOM-IDs sind in der neuen Oberfläche weiterhin vorhanden;
- neue JavaScript-Module syntaktisch geprüft;
- `main` wurde nicht verändert.

## Gerätetest – noch offen

Vor Freeze sind auf iPad/iPhone Safari mindestens zu prüfen:

1. obere Menüs öffnen/schließen und bleiben bedienbar;
2. `Neu → Neues Objekt` zeigt Würfel/Kugel/Zylinder und erzeugt sie korrekt;
3. `Neu → Neue Skizze` erzeugt Sketch und schaltet in Sketch-Werkzeuge;
4. Linie/Rechteck/Polygon funktionieren weiterhin;
5. Extrudieren öffnet den Inspector-Werkzeugblock, Tiefe ändern und `Anwenden` erzeugt weiterhin den Extrude-Body;
6. Ansicht und Transform funktionieren vollständig;
7. Gruppe/Baugruppe/Auflösen, Duplizieren und Löschen funktionieren weiterhin;
8. Material/Farbe bleibt funktional;
9. localStorage Speichern/Laden bleibt funktional;
10. CM3D-Projektdatei Export/Import aus WD-11A bleibt funktional;
11. V3-Icons laden auf dem Gerät ohne fehlende Symbole;
12. Bedienung im Quer- und Hochformat ist ausreichend kompakt.

Erst nach diesem Gerätetest darf UI-01 auf **PASS / FROZEN** gesetzt und nach `main` übernommen werden. Danach kann WD-11B auf dem neuen UI-Stand starten.
