# WD-01 – Technisches Fundament & Datenmodell

**Stand:** 2026-08-27  
**Status:** IN PROGRESS  
**Voraussetzung:** CM3D V0.1 BASELINE – FROZEN

## Zweck

WD-01 ist der verbindliche technische Einstiegspunkt vor dem ersten eigentlichen Web-Prototyp. In diesem Block wird noch nicht versucht, die gesamte CM3D-Master-Funktionsliste zu implementieren. Stattdessen werden ausschließlich die technischen Grundlagen festgelegt, die nötig sind, damit der erste Code auf einem stabilen Datenmodell aufbauen kann.

## Zu entscheidende Punkte

1. Projektstruktur und Projektdatei
2. SceneGraph und eindeutige Objekt-IDs
3. Objektarten: Primitive, Sketch, Group, Assembly, Camera, Light usw.
4. Parent-/Child-Hierarchie
5. Position, Rotation und Scale
6. Welt- gegenüber Objektkoordinaten
7. internes Einheitensystem und mm/cm/m/km-Anzeige
8. Materialzuordnung
9. Selection-State
10. Undo/Redo-Grundprinzip
11. Save/Load und Versionsschema
12. klare Trennung Datenmodell ↔ Three.js ↔ Benutzeroberfläche

## Architekturregel

Die fachlichen Projektdaten dürfen nicht mit Three.js-Laufzeitobjekten oder UI-Zuständen gleichgesetzt werden.

Verbindliche Trennung:

- **Datenmodell:** persistierbare CM3D-Projekt- und Szenendaten
- **Three.js-Schicht:** Laufzeitdarstellung und Interaktion des 3D-Inhalts
- **UI-Schicht:** Hauptfenster, Objektbaum, Inspector, Auswahl- und Bedienzustände

Three.js ist damit Rendering-/Runtime-Schicht, nicht die alleinige Quelle der Projektdaten.

## WD-01.01 – Projektstruktur und Projektdatei

**Status:** DECIDED

CM3D verwendet ein eigenes, versioniertes Projektformat mit der Dateiendung `.cm3d`. Inhaltlich ist die Projektdatei ein UTF-8-JSON-Dokument mit klar getrennten Bereichen für `format`, `schemaVersion`, `project`, `settings`, `scene`, `materials`, `assets` und `extensions`.

Three.js-Objektinstanzen, WebGL-/GPU-Ressourcen, DOM-Zustände und andere reine Laufzeit-/UI-Daten sind nicht Teil der fachlichen Projektdatei. Die `.cm3d`-Struktur ist die kanonische Projektdarstellung; Browser-Speicher wie IndexedDB darf nur technischer Ablageort derselben serialisierbaren Struktur sein.

## WD-01.02 – SceneGraph und eindeutige Objekt-IDs

**Status:** DECIDED

CM3D verwendet einen fachlichen, von Three.js unabhängigen SceneGraph. Persistiert wird ein flacher Objektbestand in `scene.objects`; die Hierarchie wird über stabile `parentId`-Referenzen rekonstruiert. Jedes speicherbare Szenenobjekt besitzt eine eigene dauerhafte `objectId` auf UUID-Basis. Three.js-UUIDs, Namen, Arraypositionen oder UI-Baumpositionen sind niemals fachliche Identität.

## WD-01.03 – Objektarten und gemeinsames Basismodell

**Status:** DECIDED

Alle speicherbaren Szenenobjekte verwenden ein gemeinsames `SceneObject`-Basismodell. Unterschiede zwischen Primitive, Sketch, Group, Assembly, Camera, Light usw. werden über das stabile Feld `type` und einen typabhängigen `data`-Block abgebildet. Gemeinsame Basisfelder bleiben unter anderem `objectId`, `name`, `parentId`, `order`, `transform`, `materialIds`, `flags` und `extensions`.

## WD-01.04 – Parent-/Child-Hierarchie

**Status:** DECIDED

`parentId` bleibt die einzige fachliche Parent-Wahrheit. Geschwisterreihenfolge wird über ein separates stabiles `order`-Feld geführt. Child-Arrays werden nicht als zweite persistierte Wahrheit parallel gehalten.

Standard-Reparenting arbeitet mit `keepWorldTransform = true`: Ein Objekt darf beim Verschieben im Objektbaum seine sichtbare Weltposition, Weltrotation und Weltskalierung nicht verändern. Stattdessen wird nach dem Parent-Wechsel der neue lokale Transform relativ zum neuen Parent berechnet. Reparenting muss atomar validiert werden und insbesondere Zyklen verhindern.

## WD-01.05 – Position, Rotation, Scale, Pivot und numerische Genauigkeit

**Status:** DECIDED

### Grundentscheidung

Der persistierte `transform` eines `SceneObject` beschreibt immer die **lokale Transformation relativ zum Parent**. Welttransformationen werden aus der Parent-Kette berechnet und nicht als zweite persistierte Wahrheit gespeichert.

Der Transformblock besteht verbindlich aus:

- `position` – lokale Translation
- `rotation` – lokale Orientierung als Quaternion
- `scale` – lokale Skalierung
- `pivot` – lokaler Bearbeitungs-/Ursprungspunkt

### Verbindliches Transformformat

```json
{
  "transform": {
    "position": { "x": 0, "y": 0, "z": 0 },
    "rotation": { "x": 0, "y": 0, "z": 0, "w": 1 },
    "scale": { "x": 1, "y": 1, "z": 1 },
    "pivot": { "x": 0, "y": 0, "z": 0 }
  }
}
```

### Position

`position` ist die lokale Verschiebung des Objektursprungs relativ zum Koordinatensystem des Parents.

- Root-Objekte: Position relativ zum Weltursprung.
- Child-Objekte: Position relativ zum Parent.
- Anzeigeeinheit und internes Einheitensystem werden erst in WD-01.07 verbindlich festgelegt.

### Rotation

Persistiert wird die lokale Orientierung als **normalisiertes Quaternion** `{x, y, z, w}`.

Gründe:

- robuste Verkettung in Hierarchien
- sauberes Reparenting mit `keepWorldTransform`
- keine Mehrdeutigkeit durch Euler-Reihenfolgen im Datenmodell
- direkte Abbildung auf Three.js-Quaternionen ohne die Three.js-Instanz selbst zu persistieren

Euler-Winkel bleiben trotzdem wichtige **Bedienwerte** im Inspector. Die UI darf Rotation in Grad als X/Y/Z anzeigen und bearbeiten. Diese Euler-Werte werden bei Eingabe in ein Quaternion umgerechnet und sind nicht die kanonische persistierte Rotationswahrheit.

Für die UI wird als Standard-Euler-Reihenfolge `XYZ` festgelegt. Falls später andere Rotationsmodi nötig werden, müssen diese explizit als zusätzliche Objekt-/Tool-Eigenschaft eingeführt werden; sie dürfen nicht stillschweigend die Persistenzregel ändern.

### Quaternion-Regel

Persistierte Quaternionen müssen beim Schreiben/Laden normalisiert sein. Ein Quaternion mit Länge nahe 0 ist ungültig. Die neutrale Rotation ist:

```json
{ "x": 0, "y": 0, "z": 0, "w": 1 }
```

Quaternion-Vorzeichenäquivalenz (`q` und `-q`) ist mathematisch dieselbe Orientierung. Vergleiche in Tests dürfen deshalb nicht ausschließlich auf byteidentische Quaternion-Komponenten bestehen, sondern müssen die resultierende Orientierung berücksichtigen.

### Scale

`scale` ist lokal relativ zum Parent und dimensionslos.

Standardwert:

```json
{ "x": 1, "y": 1, "z": 1 }
```

Für WD-02 gelten folgende Regeln:

- positive Werte sind vollständig unterstützt
- uniforme und nicht-uniforme Skalierung sind zulässig
- ein Wert exakt `0` ist ungültig, weil dadurch inverse Transformberechnungen und Reparenting instabil werden
- negative Skalierung/Mirroring wird im Datenmodell nicht grundsätzlich verboten, aber für WD-02 noch nicht als Bedienfunktion freigegeben; fachliche Mirror-Regeln werden später separat definiert

### Pivot / Ursprung

`pivot` ist ein lokaler Punkt im Objektkoordinatensystem und bestimmt den fachlichen Bearbeitungs-/Ursprungspunkt für Rotation und Skalierung.

Standardwert:

```json
{ "x": 0, "y": 0, "z": 0 }
```

Für parametrische Primitive bedeutet `{0,0,0}` zunächst den geometrischen Standardursprung der jeweiligen Primitive. Der Pivot ist Projektdatenbestand und darf daher nicht nur als temporärer Three.js-Gizmo-Zustand existieren.

Die genaue Benutzerfunktion „Mittelpunkt setzen“ / „Ursprung setzen“ wird später implementiert, aber das Datenmodell ist bereits vorbereitet.

### Transform-Matrix als abgeleiteter Wert

Lokale und Weltmatrizen dürfen zur Laufzeit berechnet und gecacht werden, werden aber **nicht zusätzlich persistiert**. Kanonisch gespeichert bleiben Position, Quaternion, Scale und Pivot.

Damit vermeiden wir redundante Wahrheiten wie:

- Komponenten sagen A
- Matrix sagt B

### Reparenting

WD-01.04 wird technisch auf folgende Transformregel konkretisiert:

1. Weltmatrix des Objekts vor dem Reparenting berechnen.
2. neuen Parent validieren.
3. neue lokale Matrix als `inverse(newParentWorld) * oldObjectWorld` berechnen.
4. lokale Matrix in Position, Quaternion und Scale zerlegen.
5. Quaternion normalisieren.
6. Pivot unverändert im lokalen Objektgeometrie-Bezug halten, sofern keine explizite Pivot-Operation ausgeführt wird.

Bei mathematisch nicht sauber zerlegbaren Transformkombinationen, insbesondere problematischem Shear, darf CM3D nicht stillschweigend falsche Werte erzeugen. Shear ist in WD-02 ausdrücklich **nicht Teil des Transformmodells**.

### Kein Shear im WD-01-Kern

Das CM3D-Kerntransformmodell ist TRS-basiert:

**Translation + Rotation + Scale**

Eine eigenständige Scherung/Shear-Komponente wird nicht gespeichert. Falls spätere Importformate Matrizen mit Shear liefern, muss der Importblock explizit entscheiden, ob Geometrie gebacken, angenähert oder ein erweitertes Transformmodell verwendet wird.

### Numerische Genauigkeit

Intern und in der `.cm3d`-Datei werden JavaScript-`Number`-Werte verwendet, also IEEE-754 Double Precision.

Verbindliche Regeln:

- Berechnungen nicht künstlich auf UI-Dezimalstellen runden.
- Die UI darf Werte gerundet anzeigen, ohne die intern gespeicherte Präzision zu zerstören.
- Beim Speichern darf JSON normale Dezimalzahlen enthalten; keine Umwandlung in formatierte Strings.
- `NaN`, `Infinity` und `-Infinity` sind in Projektdateien ungültig.
- Sehr kleine Rundungsreste dürfen für Anzeige/Test mit Toleranzen behandelt werden.

### Vergleichstoleranzen

Für technische Tests werden keine strikten Fließkomma-Gleichheiten für berechnete Transformwerte verlangt. Stattdessen werden angemessene Epsilon-Vergleiche verwendet.

Für WD-02 als Ausgangspunkt:

- Position/Scale: absolute oder relative Toleranz etwa `1e-9` im internen Zahlenraum
- Quaternion/Matrix: orientations-/komponentenbezogene Toleranz etwa `1e-10` bis `1e-9`

Diese Werte sind Testregeln, keine UI-Auflösung.

### Reset Transform

Der fachliche Standardtransform ist:

```json
{
  "position": { "x": 0, "y": 0, "z": 0 },
  "rotation": { "x": 0, "y": 0, "z": 0, "w": 1 },
  "scale": { "x": 1, "y": 1, "z": 1 },
  "pivot": { "x": 0, "y": 0, "z": 0 }
}
```

Eine spätere UI-Funktion `Reset Transform` setzt Position, Rotation und Scale auf diese Neutralwerte. Ob ein benutzerdefinierter Pivot ebenfalls zurückgesetzt wird, muss die konkrete Tool-Funktion explizit entscheiden; Pivot wird nicht unbeabsichtigt als Nebeneffekt anderer Transformänderungen verändert.

### WD-02/P0.1-Anwendung

Der erste Würfel muss mindestens folgende Transformkette nachweisen:

1. Würfel bei neutralem Transform erzeugen.
2. Position X/Y/Z ändern.
3. Rotation über UI-Eulerwerte verändern und intern als Quaternion speichern.
4. Scale verändern.
5. Projekt speichern.
6. Browser neu laden.
7. Projekt laden.
8. derselbe Würfel besitzt wieder dieselbe fachliche Position, Orientierung, Skalierung und denselben Pivot.

### Abnahmekriterium WD-01.05

WD-01.05 ist erfüllt, wenn das Transformmodell ohne Three.js serialisiert/validiert werden kann und folgende Fälle eindeutig lösbar sind:

- lokaler Neutraltransform
- Position/Rotation/Scale eines Root-Objekts
- Position/Rotation/Scale eines Child-Objekts
- Euler-Eingabe ↔ Quaternion-Persistenz
- Reparenting mit erhaltener Welttransformation
- Save/Load ohne sichtbaren Transformverlust
- Ablehnung ungültiger numerischer Werte und Nullskalierung

## Nicht-Scope von WD-01

- keine vollständige Implementierung der 89 Master-Funktionen
- kein Ausbau der Modellierungswerkzeuge
- keine vollständige Materialbibliothek
- kein Rendering-Ausbau
- keine komplexen Im-/Exporter
- keine Spezialfunktionen aus Priorität B/C

## Exit-Kriterien

WD-01 ist abgeschlossen, wenn für alle zwölf Punkte eine eindeutige technische Entscheidung dokumentiert ist und daraus ein konsistentes, versionierbares Datenmodell für den ersten Prototyp abgeleitet werden kann.

Erst danach beginnt WD-02.

# WD-02 – erster echter Web-Prototyp

WD-02 bildet die erste kleine, durchgängige und speicherfeste End-to-End-Kette:

1. Hauptfenster öffnen
2. 3D-Viewport anzeigen
3. Würfel erzeugen
4. Würfel im Objektbaum anzeigen
5. Würfel auswählen
6. X/Y/Z bzw. Transformwerte verändern
7. Projekt speichern
8. Browser neu laden
9. Projekt laden
10. derselbe Würfel ist mit korrekter Identität, Hierarchie und Transform wieder vorhanden
11. Icon-Paket im UI verwenden

## Meilensteinregel

WD-02 ist der erste echte technische Meilenstein. Er entspricht dem bisher als **P0.1 Minimal-Prototyp** bezeichneten Funktionskern.

**P0.1 = WD-02 End-to-End-Prototyp.**

WD-01 ist die notwendige Architekturvorstufe und wird vor P0.1/WD-02 abgeschlossen.

## Reihenfolge

`CM3D V0.1 BASELINE – FROZEN → WD-01 → WD-02 / P0.1 → weiterer V1-Ausbau`
