# WD-07 – Feste technische Ansichten & Viewport-Navigation

**Stand:** 2026-08-28  
**Status:** WD-07A PASS / FROZEN  
**Voraussetzung:** WD-06 – PASS / FROZEN

## Ziel

WD-07 ergänzt den bestehenden Viewport um feste technische Kameraorientierungen, ohne die in WD-06 freigegebene Einheiten-, Fokus-, Raster- oder Large-World-Logik zu verändern.

## WD-07A – Implementiert

- zentrale View-Definitionen im Three.js-Runtime-Code.
- feste Ansichten `Top`, `Front`, `Side`, `Perspektive`, `Isometrie`.
- Umschaltung erhält den aktuellen Orbit-/Navigationsmittelpunkt.
- Umschaltung erhält den aktuellen Kameraabstand zum Orbit-Mittelpunkt.
- `Top` verwendet eine stabile Up-Richtung, damit die Ansicht nicht unkontrolliert rollt.
- `Fit / Fokus` bleibt unverändert und kann vor oder nach einer festen Ansicht verwendet werden.
- WD-06 Near/Far-Clipping, logarithmischer Depth Buffer und adaptives Raster bleiben aktiv.
- feste Ansicht verändert keine Objekt-, Transform-, Pivot-, Hierarchie- oder Projektdaten.
- keine Schema-Migration.

## Abgrenzung

WD-07A definiert feste **Orientierungen mit der bestehenden Perspektivkamera**. Eine separate orthografische Projektionsart ist nicht Bestandteil dieses Teilblocks und wurde nicht stillschweigend eingeführt.

Nicht-Scope:

- Vierfachansicht
- frei definierbare Benutzeransichten
- Kamera-Lesezeichen
- zusätzliche Konstruktionsachsen
- Sketch / Extrude
- Material / Rendering-Ausbau

## Gerätetest – PASS

Gerätetest am 2026-08-28 erfolgreich abgeschlossen.

Bestätigt wurden die festen Ansichten `Top`, `Front`, `Side`, `Perspektive` und `Isometrie` sowie das Umschalten zwischen den Ansichten im bestehenden Viewport. Die Projektleitung hat WD-07A anschließend ausdrücklich mit **WD-07A PASS** freigegeben.

**Ergebnis:** PASS.

## Exit-Regel

Erfüllt. WD-07A ist **PASS / FROZEN** und darf kontrolliert von `feature/wd-07-fixed-views` nach `main` übernommen werden.
