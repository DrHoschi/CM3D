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

Der persistierte `transform` eines `SceneObject` beschreibt immer die lokale Transformation relativ zum Parent. Gespeichert werden `position`, `rotation` als normalisiertes Quaternion, `scale` und `pivot`. Weltmatrizen werden nur abgeleitet bzw. zur Laufzeit gecacht und nicht als zweite Wahrheit persistiert.

Euler-Winkel bleiben Bedienwerte für die UI, während das Quaternion die kanonische Rotationsrepräsentation ist. Das Transformmodell ist TRS-basiert; Shear ist im WD-01-Kern nicht vorgesehen. Numerische Werte werden als JavaScript-`Number`/Double Precision behandelt und intern nicht auf UI-Anzeigegenauigkeit gerundet.

## WD-01.06 – Welt- gegenüber Objektkoordinaten

**Status:** DECIDED

### Grundentscheidung

CM3D unterscheidet fachlich klar zwischen **lokalen/Objektkoordinaten** und **Weltkoordinaten**:

- **Lokale/Objektkoordinaten** sind die im Projekt persistierten Transformwerte eines Objekts relativ zu seinem direkten Parent.
- **Weltkoordinaten** sind abgeleitete Werte, die aus der vollständigen Parent-Kette berechnet werden.

Weltwerte werden nicht als zweite persistierte Transformwahrheit gespeichert.

### Lokales Koordinatensystem

Das lokale Koordinatensystem eines Objekts wird durch dessen Parent-Beziehung, lokalen Transform und Pivot bestimmt.

Für Root-Objekte gilt:

- lokales Koordinatensystem = Weltkoordinatensystem bezüglich des globalen Ursprungs, solange kein zusätzlicher späterer Szenen-/Weltanker eingeführt wird.

Für Child-Objekte gilt:

- `position`, `rotation` und `scale` werden relativ zum direkten Parent interpretiert.

### Weltkoordinatensystem

CM3D besitzt für den WD-01-Kern genau ein globales Weltkoordinatensystem.

Verbindliche Achsenkonvention:

- **X** = rechts
- **Y** = oben
- **Z** = räumliche Tiefe

CM3D folgt damit einer rechtshändigen 3D-Konvention, kompatibel mit der verwendeten Three.js-Runtime.

Die genaue semantische Nutzung von +Z/-Z für Kamera-/Ansichtsrichtungen ist eine Viewport-/Kamerafrage und ändert nicht das gespeicherte Koordinatensystem.

### Berechnung Welttransform

Die Weltmatrix eines Objekts wird rekursiv aus der Parent-Kette berechnet:

```text
worldMatrix(object) = worldMatrix(parent) * localMatrix(object)
```

Für Root-Objekte:

```text
worldMatrix(root) = localMatrix(root)
```

`localMatrix` wird aus dem in WD-01.05 festgelegten lokalen Transformmodell erzeugt.

### Weltposition, Weltrotation und Weltskalierung

Weltposition, Weltrotation und Weltskalierung sind abgeleitete Runtime-/Inspector-Werte. Sie dürfen angezeigt, für Werkzeuge benutzt und für Reparenting berechnet werden, werden aber nicht zusätzlich dauerhaft gespeichert.

Damit gilt weiterhin:

- lokale Transformkomponenten = kanonische Persistenz
- Welttransform = berechnete Sicht auf dieselben Daten

### Transform-Gizmo-Modi

Der Transform-Gizmo unterstützt mindestens zwei Achsensysteme:

- `WORLD`
- `LOCAL`

#### WORLD

Die Gizmo-Achsen bleiben an den globalen Weltachsen X/Y/Z ausgerichtet.

Beispiel: Eine Verschiebung entlang Welt-X bewegt ein Objekt horizontal entlang der globalen X-Achse, unabhängig von seiner eigenen Rotation.

#### LOCAL

Die Gizmo-Achsen folgen der aktuellen lokalen Objektorientierung.

Beispiel: Ein um 90° gedrehtes Objekt wird entlang seiner eigenen lokalen X-Achse bewegt, auch wenn diese nicht mehr mit Welt-X übereinstimmt.

### Gizmo-Modus ist kein Persistenzmodus

Der aktive Gizmo-Modus verändert **nicht** das Dateiformat und nicht die Bedeutung des gespeicherten `transform`.

Eine Benutzeraktion wird immer in eine neue gültige lokale Transformation des SceneObjects umgerechnet.

Damit ist ausgeschlossen, dass ein Objekt je nach Werkzeugmodus einmal in Welt- und einmal in Objektkoordinaten gespeichert würde.

### Bearbeitung im WORLD-Modus

Wird ein Child-Objekt im WORLD-Modus verändert, erfolgt logisch:

1. aktuelle Welttransformation berechnen,
2. Benutzeränderung im Weltkoordinatensystem anwenden,
3. resultierende Welttransformation bestimmen,
4. über `inverse(parentWorld)` wieder in einen lokalen Transform relativ zum Parent zurückrechnen,
5. lokale Position/Quaternion/Scale speichern.

Der Datenbestand bleibt dadurch konsistent zum Parent-System.

### Bearbeitung im LOCAL-Modus

Im LOCAL-Modus wird die Änderung entlang der lokalen Objektachsen interpretiert. Auch hier ist das Ergebnis am Ende ausschließlich ein aktualisierter lokaler Transformblock.

### Inspector-Anzeige

Für WD-02 ist der primäre Transform-Inspector auf **lokale Werte** ausgelegt, weil diese der persistierten Wahrheit entsprechen.

Eine spätere zusätzliche Weltwert-Anzeige ist erlaubt und bereits architektonisch vorbereitet, muss aber klar als abgeleitet gekennzeichnet sein.

Weltwerte dürfen nie scheinbar unabhängige editierbare Felder werden, ohne dass die Eingabe wieder sauber in lokale Werte zurückgerechnet wird.

### Parent-/Child-Folge

Ändert sich der Transform eines Parents, ändern sich die Weltwerte aller Nachfahren automatisch, während deren gespeicherte lokale Transformwerte unverändert bleiben.

Das ist ausdrücklich gewünschtes Hierarchieverhalten.

Beispiel:

- Gruppe bewegt sich +100 auf X.
- Child besitzt lokal `position.x = 20`.
- Child-Weltposition verschiebt sich ebenfalls +100.
- `position.x = 20` des Childs bleibt unverändert gespeichert.

### Reparenting-Verknüpfung

WD-01.04 wird bestätigt:

Beim Standard-Reparenting mit `keepWorldTransform = true` wird die alte Welttransformation beibehalten und daraus der neue lokale Transform gegenüber dem neuen Parent berechnet.

Damit ist die Trennung Welt ↔ Lokal direkt Grundlage des stabilen Objektbaum-Verhaltens.

### Pivot-Bezug

Der Pivot bleibt Teil des lokalen Objektkoordinatensystems. Weltpositionen eines Pivots werden aus Objekt-Welttransform und lokalem Pivot abgeleitet.

Ein Wechsel zwischen WORLD- und LOCAL-Gizmo-Modus verändert den gespeicherten Pivot nicht.

### Runtime-/Three.js-Regel

Three.js darf seine Weltmatrizen und Objektmatrizen zur Laufzeit verwenden, aber CM3D behandelt diese nur als Rendering-/Berechnungsschicht.

Die fachliche Quelle bleibt:

`SceneObject.transform + Parent-Kette`.

Three.js-Weltmatrizen dürfen daher jederzeit verworfen und aus den CM3D-Daten neu aufgebaut werden.

### WD-02/P0.1-Anwendung

WD-02 muss mindestens nachweisen:

1. Root-Würfel mit lokalen Werten = Weltwerten.
2. Würfel unter einer Gruppe, bei dem lokale und Weltposition unterschiedlich sind.
3. Änderung des Parents verändert die Weltposition des Childs, nicht dessen gespeicherte Lokalposition.
4. WORLD-Gizmo-Änderung wird korrekt in lokalen Transform zurückgerechnet.
5. LOCAL-Gizmo-Änderung folgt der Objektorientierung.
6. Speichern/Laden reproduziert dieselben lokalen Daten und daraus dieselben Weltwerte.

### Abnahmekriterium WD-01.06

WD-01.06 ist erfüllt, wenn für beliebige gültige Parent-Ketten eindeutig berechnet werden kann:

- lokale Transformwerte eines Objekts,
- seine Welttransformation,
- Rückrechnung Welt → Lokal gegenüber einem Parent,
- WORLD- und LOCAL-Gizmo-Verhalten,
- Reparenting mit unveränderter Weltlage,

ohne Welttransformdaten zusätzlich in der `.cm3d`-Datei persistieren zu müssen.

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
