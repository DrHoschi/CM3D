# WD-09 – Extrude-Basis

**Stand:** 2026-08-28  
**Status:** WD-09B PASS / FROZEN  
**Voraussetzung:** WD-08 – PASS / FROZEN

## Ergebnis

WD-09A – Closed Sketch Profile Derivation: **PASS**.

WD-09B – First Persistent Extrude Body: **PASS / FROZEN**.

Der V1-Kern erkennt genau eine einfache geschlossene Rechteck-/Polygonkontur und erzeugt daraus mit positiver Extrusionshöhe ein persistentes Scene-Objekt vom Typ `feature.extrude`.

Persistiert werden Quellskizzenreferenz, Extrusionshöhe, Richtung, Profil-Signatur, referenzierte Punkt-/Linien-IDs, Profilpunkte, Winding und Signed Area. Front-, Top- und Side-Skizzen extrudieren entlang ihrer lokalen positiven Normalen. Undo/Redo sowie Speichern/Laden laufen über den bestehenden Projektpfad.

## Gerätetest WD-09B – PASS

Auf iPad / Safari bestätigt:

- geschlossene Kontur wird als 3D-Körper extrudiert
- Extrusion ist in Perspektive/Isometrie sichtbar
- offene oder verzweigte Konturen werden blockiert
- mehrere getrennte geschlossene Konturen werden im V1-Gate blockiert
- Undo/Redo funktioniert
- Speichern/Laden funktioniert

Explizite Freigabe: `WD-09B PASS` am 2026-08-28.

## Bewusst nicht enthalten

- mehrere Profile / Löcher / Innenkonturen
- offene Linienextrusion und Blechdicke
- mittig / einseitig A / einseitig B
- positiv / negativ / symmetrisch
- Deckeloptionen
- Innen-/Außen-/Offsetbezug
- parametrisches Nachbearbeiten
- Boolean-Operationen

Diese Punkte bleiben für spätere Ausbauphasen vorgemerkt; Werkzeugparameter sollen bevorzugt kontextbezogen im Inspector erscheinen.

## Exit WD-09

Erfüllt. WD-09 – Extrude-Basis ist **PASS / FROZEN** und kann nach `main` übernommen werden. Nächster V1-Systemblock: **WD-10 – Material / Farbe**.