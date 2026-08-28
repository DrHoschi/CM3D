# WD-09 – Extrude-Basis

**Stand:** 2026-08-28  
**Status:** WD-09A IMPLEMENTED – CORE CHECK REQUIRED  
**Voraussetzung:** WD-08 – PASS / FROZEN

## Ziel

WD-09 führt die erste 3D-Erzeugung aus persistenten 2D-Skizzen ein. Der V1-Einstieg bleibt bewusst klein: zunächst genau eine einfache geschlossene Kontur aus Rechteck oder Polygon zuverlässig erkennen und als eindeutigen Profilpfad für eine spätere Extrusion bereitstellen.

## WD-09A – Closed Sketch Profile Derivation

Implementiert auf `feature/wd-09-extrude-base`:

- neue reine Modellfunktion `deriveClosedSketchProfiles(sketch)` in `src/model/sketch-profile.js`
- Linien werden über ihre stabilen `pointId`-Referenzen zu zusammenhängenden Komponenten aufgebaut
- eine geschlossene Kontur ist nur gültig, wenn jeder beteiligte Profilpunkt innerhalb seiner Komponente genau zwei Konturkanten besitzt
- offene Linienzüge und Verzweigungen werden deterministisch als nicht extrudierbar gemeldet
- Konturen benötigen mindestens drei Punkte/Kanten und eine von Null verschiedene Fläche
- selbstschneidende Konturen werden für WD-09A abgelehnt
- gültige Konturen werden in eine stabile Reihenfolge aus `pointIds`, `lineIds` und 2D-Punkten überführt
- Profil liefert zusätzlich `signedArea` und `winding` (`CW` / `CCW`)
- `getSingleExtrudableProfile(sketch)` bildet das bewusst enge V1-Gate: genau eine gültige geschlossene Kontur, keine offenen/fehlerhaften Komponenten
- mehrere getrennte geschlossene Konturen, Inseln und Löcher werden erkannt, aber im WD-09A-V1-Gate noch nicht akzeptiert
- keine Änderung des Projekt-Schemas; `schemaVersion` bleibt `0.1.0`

## Warum dieser Zwischenschritt

Die spätere Extrusion soll nicht direkt aus zufälliger Three.js-Viewport-Geometrie entstehen. WD-09A liefert deshalb zuerst einen deterministischen, aus den persistenten Sketch-Daten abgeleiteten Profilpfad. Damit kann WD-09B den 3D-Körper auf derselben fachlichen Datenbasis erzeugen, die bereits von Speichern/Laden und Undo/Redo getragen wird.

## Vorgemerkte spätere Extrude-Optionen

Aus der Modellierungsdiskussion sind für spätere Ausbauphasen ausdrücklich vorgemerkt, ohne WD-09A zu erweitern:

- Extrusion offener Linienzüge als dünnes/flaches Profil bzw. blechartige Geometrie
- Lage einer solchen Dicke relativ zur Ausgangslinie: mittig / einseitig A / einseitig B
- bei Flächenprofilen Extrusionsrichtung und Bezug: positiv / negativ / symmetrisch zur Skizzenebene
- offene oder geschlossene Stirnseiten bzw. Deckel, sofern der jeweilige Geometrietyp das fachlich zulässt
- Offset-/Innen-/Außenbezug für Profile, wenn aus einer Konturlinie eine Materialdicke abgeleitet wird
- spätere Werkzeugparameter sollen bevorzugt kontextbezogen im Inspector erscheinen, also nur wenn das entsprechende Modellierungswerkzeug bzw. der erzeugte Feature-Typ aktiv/ausgewählt ist

Diese Punkte sind bewusst **kein Scope von WD-09A**. Sie werden bei den jeweiligen Extrude-/Surface-/Sheet-Ausbauschritten wieder aufgenommen.

## Abgrenzung WD-09A

Noch nicht enthalten:

- Erzeugung eines Three.js-/CM3D-Volumenkörpers
- Extrusionshöhe
- positive/negative/symmetrische Extrusionsrichtung
- offene Linienextrusion
- Wand-/Blechdicke
- Deckeloptionen
- Löcher / Innenkonturen / Inseln
- mehrere Profile in einem Extrude-Feature
- Boolean-Operationen
- parametrisches Nachbearbeiten eines Extrude-Features

## Core-Check WD-09A

Vor Übergang zu WD-09B sind mindestens folgende Fälle zu prüfen:

1. ein von WD-08B erzeugtes Rechteck ergibt genau ein gültiges Profil mit vier Punkten und vier Linien.
2. ein einfaches geschlossenes Polygon ergibt genau ein gültiges Profil in stabiler Umlaufreihenfolge.
3. ein einzelnes offenes Liniensegment ergibt kein Profil und einen eindeutigen `OPEN_OR_BRANCHING_COMPONENT`-Hinweis.
4. ein offener Linienzug ergibt kein Profil.
5. eine verzweigte Kontur ergibt kein Profil.
6. eine selbstschneidende Kontur wird abgelehnt.
7. zwei getrennte geschlossene Konturen werden als mehrere Profile erkannt, aber durch `getSingleExtrudableProfile` für WD-09A blockiert.
8. die Profilableitung verändert keinerlei Sketch-Daten.

## Exit WD-09A

WD-09A ist abgeschlossen, wenn die oben genannten Core-Fälle reproduzierbar PASS sind. Erst danach beginnt WD-09B – erster echter Extrude-Körper aus genau einem geschlossenen Profil.
