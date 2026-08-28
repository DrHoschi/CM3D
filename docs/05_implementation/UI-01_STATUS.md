# UI-01 – Contextual Command Surface

**Stand:** 2026-08-28  
**Status:** IMPLEMENTED / DEVICE RETEST PENDING  
**Branch:** `feature/ui-01-contextual-command-surface`  
**Basis:** `main` nach WD-11A (`823e7cef88dc2a74b3fca9b4ccab0767cd047aa6`)

## Ziel

Die bisherige dauerhaft gefüllte Toolbar wird durch die in `docs/02_ui-ux/hauptfenster_v0.2.md` festgelegte kompakte, kontextabhängige Bedienstruktur ersetzt, ohne die bereits eingefrorenen WD-01 bis WD-11A-Funktionen fachlich zu verändern.

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
- bestehende IDs der implementierten Bedienelemente wurden soweit möglich beibehalten, damit die vorhandene Funktionslogik nicht dupliziert wird.

## Icon-Integration

Als sichtbare UI-Grundlage wird das vom Projekt bereitgestellte Paket `cybermotion_web_designer_icons_complete_v3.zip` verwendet.

- die verwendeten Symbole stammen aus den dort enthaltenen V3-SVGs;
- die aktuell benötigten Symbole liegen in `design/icons/cm3d-ui-icons-v3.svg` als SVG-Sprite;
- verwendet werden unter anderem App-Logo, Neu, Datei, Ansicht, Move/Rotate/Scale, Extrude, Szene, Material, Messen, Würfel, Kugel, Zylinder, Gruppe, Baugruppe, Auflösen, Undo/Redo, Löschen, Duplizieren, Speichern, Laden sowie Projektdatei Import/Export;
- die V3-Farbsemantik bleibt erhalten: Blau, Grün, Orange, Rot, Gelb, Violett und Cyan entsprechend dem bereitgestellten Style Guide;
- nach dem ersten iPad-Test wurde die externe `<use>`-Darstellung angepasst: der Sprite wird auf Safari zur Laufzeit in das Dokument eingebettet und die `<use>`-Referenzen werden auf interne IDs umgestellt;
- die künstlichen hellen Icon-Kachelhintergründe werden entfernt, damit der transparente Hintergrund des originalen V3-Sets erhalten bleibt.

## Korrektur nach erstem Gerätetest

Der erste UI-01-Gerätetest zeigte zwei Darstellungsfehler:

1. Safari stellte die farbigen Klassen des extern referenzierten SVG-Sprites nicht zuverlässig dar; die Icons erschienen weitgehend schwarz.
2. Mehrere eigentlich versteckte Kontext-Sets waren gleichzeitig sichtbar, weil die CSS-`display:flex`-Regel die `hidden`-Darstellung auf dem Gerät nicht zuverlässig verdrängte.

Korrektur:

- Safari-sichere Inline-Einbettung des V3-Sprites;
- explizite Sichtbarkeitssteuerung der Kontext-Sets per JavaScript (`display:flex` nur für den aktiven Kontext, sonst `display:none`);
- initial kein aktiver Werkzeugkontext; die zweite Zeile zeigt erst nach Auswahl die passenden Werkzeuge.

## Nicht Teil von UI-01

- keine neue GLB/GLTF-Funktion; das bleibt WD-11B;
- keine neuen Primitive über die bereits implementierten Würfel/Kugel/Zylinder hinaus;
- keine Boolean-/Revolve-/Spline-Funktion;
- noch keine echte Auswahl/Löschung einzelner Sketch-Linien im Objektbaum; dafür ist eine separate Sketch-Daten-/Interaktions-Erweiterung nötig;
- keine Änderung der CM3D-Projektdatei oder Schema-Version.

## Gerätetest – Retest offen

Vor Freeze sind auf iPad/iPhone Safari mindestens zu prüfen:

1. nach Seitenstart sind keine Werkzeuggruppen dauerhaft untereinander sichtbar;
2. `Neu → Neues Objekt` zeigt ausschließlich Würfel/Kugel/Zylinder;
3. `Neu → Neue Skizze` zeigt ausschließlich Linie/Rechteck/Polygon/Extrudieren;
4. Klick auf `Ansicht` zeigt nur die Ansichts-Werkzeuge;
5. Klick auf `Transform` zeigt nur Move/Rotate/Scale/WORLD/LOCAL/Snap;
6. Wechsel zwischen den Bereichen blendet den vorherigen Werkzeugsatz vollständig aus;
7. V3-Icons erscheinen farbig und ohne künstliche helle Kachelhintergründe;
8. Linie/Rechteck/Polygon funktionieren weiterhin;
9. Extrudieren öffnet den Inspector-Werkzeugblock und `Anwenden` erzeugt den Extrude-Body;
10. Gruppe/Baugruppe/Auflösen, Duplizieren und Löschen funktionieren weiterhin;
11. Material/Farbe bleibt funktional;
12. localStorage Speichern/Laden und WD-11A-Projektdatei Export/Import bleiben funktional;
13. Bedienung im Quer- und Hochformat bleibt ausreichend kompakt.

Erst nach diesem Retest darf UI-01 auf **PASS / FROZEN** gesetzt und nach `main` übernommen werden. Danach kann WD-11B auf dem neuen UI-Stand starten.
