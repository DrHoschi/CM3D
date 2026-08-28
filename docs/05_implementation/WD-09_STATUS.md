# WD-09 – Extrude-Basis

**Stand:** 2026-08-28  
**Status:** WD-09A CORE CHECK PASS – WD-09B READY  
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

## Core-Check WD-09A – PASS

Die Profilableitung wurde gegen die vorgesehenen Kernfälle geprüft. Ergebnis:

1. **Rechteck → PASS**: eine geschlossene Vierkantkontur ergibt genau ein gültiges Profil mit vier Punkten und vier Linien.
2. **einfaches Polygon → PASS**: eine geschlossene Polygonkontur ergibt genau ein gültiges Profil in deterministischer Umlaufreihenfolge.
3. **einzelne offene Linie → PASS / korrekt blockiert**: kein Profil; Diagnose `OPEN_OR_BRANCHING_COMPONENT`.
4. **offener Linienzug → PASS / korrekt blockiert**: kein Profil; Endpunkte mit Grad 1 verhindern die Profilfreigabe.
5. **verzweigter Linienzug → PASS / korrekt blockiert**: kein Profil; Verzweigungspunkte mit Grad ungleich 2 werden abgelehnt.
6. **selbstschneidende Kontur → PASS / korrekt blockiert**: kein Profil; Diagnose `SELF_INTERSECTION`.
7. **zwei getrennte geschlossene Konturen → PASS / bewusst blockiert**: `deriveClosedSketchProfiles` erkennt zwei Profile; `getSingleExtrudableProfile` liefert `MULTIPLE_PROFILES` und gibt WD-09B-V1 nicht frei.
8. **keine Mutation der Sketch-Daten → PASS**: die Ableitung liest ausschließlich Punkte/Linien und erzeugt ein separates Ergebnisobjekt; sie schreibt keine Sketch-Daten zurück.

Zusätzliche Integritätsbeobachtung: Null-Längen, fehlende Punktreferenzen, Nullfläche und nicht eindeutig ordnungsfähige Konturen besitzen bereits eigene deterministische Diagnosepfade.

**Ergebnis:** WD-09A Core-Check = **PASS**.

## Exit WD-09A

Erfüllt. Die Profilableitung ist für den engen V1-Fall „genau eine einfache geschlossene Kontur“ freigegeben. WD-09B darf jetzt auf derselben Branch-Basis den ersten echten Extrude-Körper erzeugen. WD-09A wird dadurch nicht um Mehrfachprofile, Löcher, offene Linien oder Blech-/Offsetlogik erweitert.