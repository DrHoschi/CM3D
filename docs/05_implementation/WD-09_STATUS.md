# WD-09 – Extrude-Basis

**Stand:** 2026-08-28  
**Status:** WD-09B IMPLEMENTED – DEVICE TEST REQUIRED  
**Voraussetzung:** WD-08 – PASS / FROZEN

## Ziel

WD-09 führt die erste 3D-Erzeugung aus persistenten 2D-Skizzen ein. Der V1-Einstieg bleibt bewusst klein: genau eine einfache geschlossene Kontur aus Rechteck oder Polygon wird zuverlässig erkannt und mit definierter positiver Extrusionshöhe als persistenter 3D-Körper erzeugt.

## WD-09A – Closed Sketch Profile Derivation

Core-Check: **PASS**.

Implementiert:

- deterministische Ableitung geschlossener Rechteck-/Polygonprofile aus persistenten Sketch-Punkten und -Linien
- stabile Umlaufreihenfolge
- offene, verzweigte, flächenlose und selbstschneidende Konturen werden blockiert
- mehrere getrennte Profile werden erkannt, aber im V1-Gate bewusst nicht freigegeben
- keine Mutation der Sketch-Daten

## WD-09B – First Persistent Extrude Body

Implementiert auf `feature/wd-09-extrude-base`:

- neue Anwendungsschicht `src/application/extrude.js`
- Extrusion startet ausschließlich aus einer ausgewählten Skizze
- `getSingleExtrudableProfile` aus WD-09A ist das verbindliche Profil-Gate
- Extrusionshöhe ist als positiver numerischer Wert definiert
- erzeugtes Scene-Objekt besitzt Typ `feature.extrude`
- Extrude-Objekt enthält persistent:
  - `sourceSketchId`
  - `depth`
  - `direction: positive`
  - stabile Profil-Signatur
  - referenzierte `pointIds` und `lineIds`
  - abgeleitete 2D-Profilpunkte
  - Winding und Signed Area
- Transform des Extrude-Körpers wird aus der Quellskizze übernommen; damit extrudiert Front/Top/Side jeweils entlang der lokalen positiven Sketch-Normalen
- Materialbindung verwendet das bestehende Standardmaterial
- Extrude-Erzeugung läuft als ein Undo/Redo-Schritt
- Speichern/Laden trägt den neuen Feature-Typ über das bestehende Projektmodell
- keine Schema-Migration; `schemaVersion` bleibt `0.1.0`

## Viewport

`src/runtime-three/extrude.js` erweitert die bestehende Runtime um die Darstellung von `feature.extrude`:

- Three.js `Shape` wird aus dem persistent gespeicherten Profil aufgebaut
- `ExtrudeGeometry` erzeugt den geschlossenen Volumenkörper
- `bevelEnabled: false`, `steps: 1`
- Extrusion erfolgt entlang lokal `+Z` des Sketch-/Feature-Transforms
- der erzeugte Körper wird wie andere Geometrie pickbar und über den bestehenden Objektpfad dargestellt

## Bedienung WD-09B

1. eine Skizzenebene Front, Top oder Side wählen und `Neue Skizze` anlegen.
2. genau eine geschlossene Rechteck- oder Polygonkontur erzeugen.
3. Zeichenwerkzeug beenden und die Skizze im Objektbaum auswählen.
4. im Feld `Extrude` eine Höhe > 0 eingeben.
5. `Extrudieren` drücken.
6. ein neues persistentes `feature.extrude`-Objekt erscheint im Objektbaum und als 3D-Körper im Viewport.

Offene Linien, Selbstschnitte und mehrere getrennte geschlossene Konturen werden mit einer verständlichen Meldung abgelehnt.

## Vorgemerkte spätere Extrude-Optionen

Bewusst noch nicht enthalten, aber verbindlich vorgemerkt:

- Extrusion offener Linienzüge als dünnes/flaches Profil bzw. blechartige Geometrie
- Dicke relativ zur Linie: mittig / einseitig A / einseitig B
- Flächenextrusion positiv / negativ / symmetrisch zur Skizzenebene
- offene oder geschlossene Stirnseiten / Deckel, soweit fachlich passend
- Innen-/Außen-/Offsetbezug bei aus Konturlinien abgeleiteter Materialdicke
- kontextbezogene Werkzeugparameter bevorzugt im Inspector, nur bei aktivem Werkzeug bzw. ausgewähltem Feature
- Löcher / Innenkonturen / Inseln
- mehrere Profile pro Extrude-Feature
- parametrisches nachträgliches Bearbeiten des Extrude-Features
- Boolean-Operationen

## Gerätetest WD-09B

Vor PASS mindestens prüfen:

1. Front-Rechteck mit z. B. `1 m` extrudieren: 3D-Körper sichtbar.
2. Perspektive/Isometrie verwenden: Tiefe des Körpers klar sichtbar.
3. anderes Extrude-Maß, z. B. `0.5 m`, erzeugen.
4. Top- oder Side-Skizze extrudieren: Körper folgt der jeweiligen Sketch-Normalen.
5. Undo entfernt den kompletten Extrude-Körper in einem Schritt; Redo stellt ihn wieder her.
6. Projekt speichern und laden: Extrude-Körper bleibt erhalten.
7. offene Linien-Skizze extrudieren: wird blockiert.
8. Skizze mit zwei getrennten Rechtecken extrudieren: wird für WD-09B bewusst blockiert.
9. bestehende Skizzen und Primitive bleiben unverändert nutzbar.

## Exit WD-09B

WD-09B wird erst nach erfolgreichem Gerätetest und explizitem `WD-09B PASS` geschlossen / FROZEN. Bis dahin bleibt `main` unverändert.