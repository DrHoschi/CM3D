# WD-07 – Feste technische Ansichten & Viewport-Navigation

**Stand:** 2026-08-28  
**Status:** WD-07A IMPLEMENTED – DEVICE TEST REQUIRED  
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

WD-07A definiert zunächst feste **Orientierungen mit der bestehenden Perspektivkamera**. Eine separate orthografische Projektionsart ist nicht Bestandteil dieses kleinen Teilblocks und wird nicht stillschweigend eingeführt.

Nicht-Scope:

- Vierfachansicht
- frei definierbare Benutzeransichten
- Kamera-Lesezeichen
- zusätzliche Konstruktionsachsen
- Sketch / Extrude
- Material / Rendering-Ausbau

## Manueller Gerätetest

1. Projekt öffnen und ein nicht symmetrisches Testobjekt bzw. mehrere unterschiedlich positionierte Objekte verwenden.
2. `Top` drücken: Blick muss reproduzierbar senkrecht von oben erfolgen.
3. `Front` drücken: Blick muss reproduzierbar entlang der Front-Richtung erfolgen.
4. `Side` drücken: Blick muss reproduzierbar von der Seite erfolgen.
5. `Perspektive` drücken: definierte räumliche Standardrichtung muss wiederhergestellt werden.
6. `Isometrie` drücken: definierte gleichmäßige Raumdiagonale muss hergestellt werden.
7. Zwischen allen fünf Ansichten mehrfach wechseln; Mittelpunkt und Entfernung dürfen nicht springen.
8. Kamera pannen, danach feste Ansichten wechseln: der verschobene Navigationsmittelpunkt muss erhalten bleiben.
9. Objekt auswählen, `Fit / Fokus` drücken und danach Top/Front/Side/Isometrie wechseln: die Kamera muss weiter um den fokussierten Objektmittelpunkt ausgerichtet bleiben.
10. Nach einer festen Ansicht wieder frei orbitieren/pannen/zoomen; Navigation muss normal weiter funktionieren.
11. WD-06 Regression: kleines/großes Objekt, Einheitenwechsel, Rasterursprung Welt `0/0/0`, Speichern/Laden kurz gegenprüfen.
12. iPhone und iPad Safari separat prüfen.

## Exit-Regel

WD-07 bleibt auf `feature/wd-07-fixed-views`. `main` bleibt bis zum dokumentierten Geräte-PASS unverändert.
