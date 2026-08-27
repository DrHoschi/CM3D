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

### Entscheidung

CM3D verwendet ein eigenes, versioniertes Projektformat mit der Dateiendung **`.cm3d`**. Inhaltlich ist die Projektdatei ein UTF-8-JSON-Dokument mit klar getrennten Bereichen für Metadaten, Projekteinstellungen, Szene und projektbezogene Ressourcenreferenzen.

Für WD-02/P0.1 wird bewusst **keine Binärdatei und kein ZIP-Container** verwendet. Die erste Version bleibt direkt lesbar, diffbar und debugbar. Ein späterer Container darf eingeführt werden, ohne die logische Datenstruktur zu ändern.

### Verbindliche Top-Level-Struktur

```json
{
  "format": "CM3D_PROJECT",
  "schemaVersion": "0.1.0",
  "project": {},
  "settings": {},
  "scene": {},
  "materials": [],
  "assets": [],
  "extensions": {}
}
```

### Bedeutung der Bereiche

- `format`: feste Kennung zur eindeutigen Erkennung einer CM3D-Projektdatei.
- `schemaVersion`: Version des gespeicherten Datenmodells, nicht die Programmversion.
- `project`: Projekt-ID, Name, Erstellungs-/Änderungsinformationen und projektbezogene Metadaten.
- `settings`: persistierbare Projekteinstellungen wie Einheitensystem, Raster- und spätere Projekteinstellungen.
- `scene`: fachlicher SceneGraph mit allen speicherbaren Szenenobjekten.
- `materials`: projektbezogene Materialdefinitionen unabhängig von Three.js-Materialinstanzen.
- `assets`: Referenzen auf importierte oder externe Ressourcen; in WD-02 zunächst leer bzw. minimal.
- `extensions`: reservierter Erweiterungsbereich für spätere Daten, die den Kern nicht aufbrechen dürfen.

### Projekt-ID

Jedes Projekt erhält beim Erstellen eine dauerhafte eindeutige `projectId`. Diese Identität bleibt beim normalen Speichern und Laden unverändert. `Speichern unter` erzeugt nicht automatisch eine neue fachliche Identität; eine spätere Funktion „Projekt duplizieren“ kann dies ausdrücklich tun.

### Persistenzregel

Gespeichert werden ausschließlich fachliche und projektbezogene Daten, die zum reproduzierbaren Wiederaufbau des Projekts notwendig sind.

**Nicht Bestandteil der Projektdatei sind insbesondere:**

- Three.js-Objektinstanzen
- WebGL-/GPU-Ressourcen
- DOM-Elemente
- offene Menüs oder Dialoge
- Hover-Zustände
- temporäre Gizmo-Zustände
- Laufzeit-Caches
- Browser-spezifische Handles

UI-Zustände dürfen nur dann persistiert werden, wenn sie ausdrücklich als Projektzustand definiert werden. Auswahlzustand und reine Arbeitsoberflächenzustände werden in WD-01.09 separat entschieden.

### Ressourcenregel

WD-02/P0.1 muss vollständig ohne eingebettete Binärressourcen funktionieren. Der erste speicherfeste Kern benötigt nur primitive Geometrie und interne Daten.

Für spätere Importe gilt: Die Projektdatei speichert stabile Asset-Referenzen und Metadaten; die konkrete Strategie für Einbettung, externe Dateien oder Paketierung wird erst beim Import-/Asset-Block entschieden.

### Speicherort im Web-Prototyp

Die logische `.cm3d`-Datei ist das kanonische Projektformat. Der Browser darf für WD-02 zusätzlich IndexedDB oder vergleichbaren lokalen Speicher als technische Ablage verwenden, aber diese Ablage ist **nicht** das Datenmodell selbst. Save/Load muss immer über dieselbe serialisierbare CM3D-Projektstruktur laufen.

### Architekturfolgen

1. Ein Projekt kann ohne Three.js geladen und validiert werden.
2. Three.js wird aus dem Datenmodell rekonstruiert, nicht umgekehrt als alleinige Wahrheit gespeichert.
3. Die Projektdatei bleibt für Tests und Fehlersuche menschenlesbar.
4. Schema-Migrationen sind durch `schemaVersion` vorbereitet.
5. Spätere Asset-Paketierung kann ergänzt werden, ohne SceneGraph und Objektmodell neu zu erfinden.

### Abnahmekriterium WD-01.01

WD-01.01 ist erfüllt, wenn ein leeres CM3D-Projekt als valides `.cm3d`-JSON erzeugt, gespeichert, erneut gelesen und anhand von `format` und `schemaVersion` eindeutig erkannt werden kann.

## WD-01.02 – SceneGraph und eindeutige Objekt-IDs

**Status:** DECIDED

### Entscheidung

CM3D verwendet einen fachlichen, von Three.js unabhängigen SceneGraph. Persistiert wird ein **flacher Objektbestand** in `scene.objects`, während die Hierarchie über stabile Parent-Referenzen aufgebaut wird. Die sichtbare Baumstruktur wird beim Laden daraus rekonstruiert.

Die Identität eines CM3D-Objekts wird ausschließlich durch eine eigene dauerhafte `objectId` bestimmt. Three.js-UUIDs, Arraypositionen, Objektname oder UI-Baumposition dürfen niemals als fachliche Objektidentität verwendet werden.

### Verbindliche Szenenstruktur

```json
{
  "scene": {
    "rootObjectIds": ["obj_..."],
    "objects": {
      "obj_...": {
        "objectId": "obj_...",
        "type": "primitive.box",
        "name": "Würfel",
        "parentId": null,
        "transform": {},
        "data": {},
        "materialIds": [],
        "flags": {}
      }
    }
  }
}
```

`scene.objects` ist dabei logisch eine Map `objectId -> object`. In einer konkreten JSON-Ausgabe darf sie als Objekt/Dictionary serialisiert werden. Dadurch ist jedes Objekt direkt über seine ID erreichbar und nicht von seiner Position in einem Array abhängig.

### Objekt-ID-Regel

Jedes speicherbare Szenenobjekt erhält beim Erzeugen genau einmal eine dauerhafte `objectId`.

Verbindliche Anforderungen:

- projektweit eindeutig
- unabhängig von Name, Typ und Hierarchieposition
- bleibt bei Umbenennen, Verschieben, Transformieren, Gruppieren und normalem Save/Load unverändert
- wird beim Laden nicht neu erzeugt
- Three.js erhält die CM3D-`objectId` nur als Referenz/Mapping, erzeugt aber nicht die fachliche Identität

Für die technische Erzeugung wird eine zufällige 128-Bit-UUID verwendet (`crypto.randomUUID()` bzw. RFC-4122-kompatibel). Zur besseren Lesbarkeit kann die gespeicherte Form mit `obj_` präfixiert werden, z. B. `obj_550e8400-e29b-41d4-a716-446655440000`.

### Warum keine Three.js-UUID

Three.js-Laufzeitobjekte können beim Laden vollständig neu erzeugt werden. Ihre internen UUIDs sind daher Runtime-Details. Würden Referenzen, Auswahl oder Parent-Beziehungen daran hängen, könnten sie nach Reload brechen. Die CM3D-`objectId` ist deshalb die einzige stabile Identität über Save/Load hinweg.

### SceneGraph-Regeln

1. Jedes Objekt existiert genau einmal in `scene.objects`.
2. Jedes Objekt besitzt genau eine `objectId`.
3. `parentId = null` bedeutet Root-Objekt.
4. Ein Parent wird ausschließlich über seine `objectId` referenziert.
5. Ein Objekt darf niemals sein eigener Parent sein.
6. Parent-Ketten dürfen keine Zyklen bilden.
7. Jede nicht-null `parentId` muss auf ein existierendes Objekt im selben Projekt zeigen.
8. `rootObjectIds` enthält nur existierende Objekte mit `parentId = null` und dient der stabilen Root-Reihenfolge im Objektbaum.
9. Child-Listen werden nicht zusätzlich als zweite Wahrheit gespeichert; sie werden aus `parentId` abgeleitet. Damit vermeiden wir widersprüchliche Parent-/Child-Doppelhaltung.
10. Die Reihenfolge von Geschwistern wird über ein separates `order`-Feld am Objekt oder eine äquivalente stabile Sortierinformation geführt; die genaue Hierarchiebearbeitung wird in WD-01.04 festgezogen.

### Mindestfelder eines SceneObjects

Jedes speicherbare Szenenobjekt besitzt mindestens:

- `objectId`
- `type`
- `name`
- `parentId`
- `transform`
- `data`
- `materialIds`
- `flags`

Die genaue Menge und Bedeutung der Objektarten wird in WD-01.03 entschieden. Transform wird in WD-01.05 präzisiert.

### Referenzregel für andere Systeme

Alle projektinternen Referenzen auf Szenenobjekte verwenden `objectId`, beispielsweise:

- Selection-State
- Parent-/Child-Beziehungen
- Gruppen/Baugruppen
- Kamera-Zielobjekte
- spätere Constraints
- spätere Verknüpfungen zwischen Sketch und erzeugtem 3D-Objekt
- Undo/Redo-Kommandos

Objektnamen sind nur Anzeige-/Benutzerdaten und niemals Schlüssel.

### Ladevalidierung

Beim Laden einer `.cm3d`-Datei muss der SceneGraph mindestens auf folgende Fehler geprüft werden:

- doppelte IDs
- fehlende referenzierte Parents
- Selbstreferenz
- Parent-Zyklen
- Root-ID zeigt auf unbekanntes Objekt
- Root-ID zeigt auf Objekt mit nicht-null `parentId`

Eine beschädigte Hierarchie darf nicht stillschweigend als gültige Szene behandelt werden.

### WD-02/P0.1-Anwendung

Der erste Würfel erhält beim Erzeugen eine `objectId`. Objektbaum, Inspector, Three.js-Mesh und Save/Load beziehen sich alle auf dieselbe CM3D-ID. Nach Browser-Reload und Projektladen muss exakt dieselbe `objectId` wieder vorhanden sein, auch wenn das Three.js-Mesh vollständig neu erzeugt wurde.

### Abnahmekriterium WD-01.02

WD-01.02 ist erfüllt, wenn eine Szene mit mehreren Objekten und mindestens einer Parent-Beziehung gespeichert und geladen werden kann und danach:

- jede `objectId` unverändert ist,
- alle Parent-Referenzen identisch wiederhergestellt sind,
- der SceneGraph zyklusfrei und vollständig validierbar ist,
- Three.js-Objekte ohne Verwendung ihrer alten Runtime-UUIDs neu aufgebaut werden können.

## WD-01.03 – Objektarten und gemeinsames Basismodell

**Status:** DECIDED

### Entscheidung

Alle speicherbaren Szenenobjekte verwenden **ein gemeinsames SceneObject-Basismodell**. Unterschiede zwischen Würfel, Sketch, Gruppe, Baugruppe, Kamera, Licht usw. werden nicht durch vollständig verschiedene Dateiformate abgebildet, sondern durch:

- ein stabiles `type`-Feld zur fachlichen Klassifikation,
- einen typabhängigen `data`-Block,
- gemeinsame Basisfelder für Identität, Hierarchie, Transform, Materialreferenzen und Flags.

Damit bleiben SceneGraph, Auswahl, Objektbaum, Undo/Redo, Save/Load und Inspector grundsätzlich für alle Objektarten gleich behandelbar.

### Verbindliches SceneObject-Basismodell

```json
{
  "objectId": "obj_...",
  "type": "primitive.box",
  "name": "Würfel",
  "parentId": null,
  "order": 0,
  "transform": {},
  "data": {},
  "materialIds": [],
  "flags": {
    "visible": true,
    "locked": false
  },
  "extensions": {}
}
```

### Basisfelder

- `objectId`: dauerhafte fachliche Identität gemäß WD-01.02.
- `type`: stabile Objektart; bestimmt, wie `data` interpretiert und welche Runtime-Darstellung erzeugt wird.
- `name`: frei änderbarer Anzeigename; niemals technische Identität.
- `parentId`: hierarchische Zuordnung.
- `order`: stabile Reihenfolge innerhalb derselben Hierarchieebene.
- `transform`: gemeinsamer lokaler Transformblock; Details folgen in WD-01.05.
- `data`: ausschließlich typabhängige fachliche Nutzdaten.
- `materialIds`: Referenzen auf projektbezogene Materialdefinitionen; Details folgen in WD-01.08.
- `flags`: gemeinsame objektbezogene Zustände wie Sichtbarkeit und Sperre.
- `extensions`: reservierter Erweiterungsbereich für spätere Zusatzdaten, ohne das Basismodell aufzubrechen.

### Objektarten-Namensschema

Objektarten werden als stabile, kleingeschriebene, punktseparierte Typnamen gespeichert. Dadurch ist die Hauptklasse direkt erkennbar und Untertypen können ergänzt werden.

Verbindliche Kernklassen:

- `primitive.*`
- `sketch.*`
- `group`
- `assembly`
- `camera.*`
- `light.*`
- `helper.*`
- `imported.*`

Für WD-02/P0.1 ist mindestens `primitive.box` verbindlich.

### Primitive

Primitive sind parametrisierte Grundkörper. Ihre Formparameter liegen ausschließlich im `data`-Block.

Beispiel Würfel/Quader:

```json
{
  "type": "primitive.box",
  "data": {
    "size": {
      "x": 100,
      "y": 100,
      "z": 100
    }
  }
}
```

Weitere vorgesehene Typen:

- `primitive.cylinder`
- `primitive.sphere`
- `primitive.cone`
- `primitive.plane`
- `primitive.torus`
- `primitive.pipe`

Die Aufnahme in das Typenschema bedeutet nicht, dass diese bereits in WD-02 implementiert werden müssen.

### Sketch

2D-Skizzen werden als eigene fachliche Objekte modelliert und nicht als temporäre Three.js-Linien behandelt.

Vorgesehene Typen:

- `sketch.profile`
- `sketch.line`
- `sketch.rectangle`
- `sketch.circle`

Der `data`-Block enthält später die 2D-Geometrie, Skizzenebene und zugehörige Parameter. Details werden erst beim 2D-Sketch-Block festgezogen.

### Group

`group` ist ein hierarchisches Organisationsobjekt. Eine Gruppe darf Kinder besitzen und hat einen eigenen Transform. Sie stellt primär Struktur und gemeinsame Transformation bereit.

Die Gruppenzugehörigkeit wird nicht zusätzlich in den Child-Objekten als separate Gruppen-ID gespeichert; `parentId` ist die hierarchische Wahrheit.

### Assembly

`assembly` ist **nicht nur ein anderer Name für Group**. Eine Baugruppe ist eine fachliche Einheit und darf später zusätzliche Daten besitzen, z. B. Baugruppenmetadaten, Anschlussinformationen, Exportregeln oder Bibliotheksbezug.

Sie verwendet dennoch dasselbe SceneObject-Basismodell und dieselbe Parent-/Child-Mechanik wie andere Objekte.

### Camera

Kameraobjekte sind speicherbare Szenenobjekte.

Vorgesehene Typen:

- `camera.perspective`
- `camera.orthographic`

Kameras verwenden das gemeinsame Transformmodell. Kameraspezifische Werte wie FOV, Near/Far oder orthografische Größe liegen in `data`.

### Light

Lichtobjekte sind ebenfalls speicherbare SceneObjects.

Vorgesehene Typen:

- `light.ambient`
- `light.directional`
- `light.point`
- `light.spot`

Lichtspezifische Parameter liegen in `data`. Nicht jede Lichtart muss in V1 sofort umgesetzt werden.

### Helper

`helper.*` ist für **fachlich speicherbare Hilfsobjekte** reserviert, z. B. spätere Konstruktionsreferenzen oder definierte Hilfsebenen.

Wichtig: reine Runtime-Helfer von Three.js wie TransformControls, Auswahlrahmen, Debug-Achsen oder temporäre Gizmos sind **keine** SceneObjects und werden nicht gespeichert.

### Imported

Importierte Inhalte werden als SceneObjects eingebunden, referenzieren ihre eigentliche Ressource jedoch über `data` bzw. spätere Asset-Referenzen.

Vorgesehen:

- `imported.mesh`
- `imported.model`

Damit bleibt auch importierter Inhalt in Auswahl, Hierarchie, Transform und Save/Load nach denselben Regeln behandelbar.

### Type-Registry-Regel

Die Anwendung verwendet eine zentrale Type Registry. Für jeden unterstützten `type` können dort definiert werden:

- Validator für `data`
- Standardwerte
- Anzeigename/Icon
- Runtime-Factory für Three.js
- Inspector-Schema
- zulässige Operationen

Diese Registry ist Programmcode und wird **nicht** als vollständige Definition in jeder Projektdatei gespeichert. Eine Projektdatei enthält nur den stabilen Typnamen und seine Daten.

### Unbekannte Typen

Ein Projekt darf bei einer neueren Schema-/Programmversion Objektarten enthalten, die eine ältere Anwendung noch nicht kennt. Solche Objekte dürfen nicht stillschweigend gelöscht werden.

Grundregel:

- unbekannten `type` erkennen,
- Originaldaten erhalten,
- Objekt als nicht unterstützten/platzhalterartigen Eintrag behandeln,
- Speichern darf seine unbekannten Daten nicht zerstören, sofern keine Migration dies ausdrücklich verlangt.

Damit bereiten wir Vorwärtskompatibilität vor.

### WD-02/P0.1-Mindestobjekt

Der erste Prototyp benötigt nur ein vollständig funktionierendes `primitive.box`-Objekt mit:

- stabiler `objectId`
- `name`
- `parentId`
- `order`
- Transform
- `data.size`
- Sichtbarkeit/Sperre
- optionaler bzw. zunächst leerer Materialreferenz

Alle anderen Typen sind strukturell vorbereitet, aber nicht Teil des WD-02-Implementierungsscope.

### Abnahmekriterium WD-01.03

WD-01.03 ist erfüllt, wenn `primitive.box`, `group`, `assembly`, `camera.perspective` und `light.directional` als unterschiedliche Typen mit demselben Basismodell dargestellt werden können und Save/Load, Objekt-ID, Hierarchie und gemeinsame Basisfelder ohne typabhängige Sonderformate funktionieren.

## WD-01.04 – Parent-/Child-Hierarchie

**Status:** DECIDED

### Entscheidung

Die Hierarchie bleibt vollständig auf der in WD-01.02 festgelegten `parentId`-Beziehung aufgebaut. Reparenting verändert die fachliche Parent-Beziehung, aber standardmäßig **nicht** die sichtbare Welttransformation des verschobenen Objekts.

Das bedeutet: Wird ein Objekt von Parent A nach Parent B verschoben, bleiben seine Weltposition, Weltrotation und Weltskalierung erhalten. Anschließend werden seine **lokalen** Transformwerte relativ zu Parent B neu berechnet und gespeichert.

Diese Regel entspricht der Erwartung beim Verschieben eines Objekts im Objektbaum: Die Struktur ändert sich, das Objekt springt nicht unerwartet an eine andere Stelle.

### Verbindliche Hierarchiefelder

Jedes SceneObject verwendet:

```json
{
  "parentId": "obj_parent" | null,
  "order": 0
}
```

- `parentId` bestimmt ausschließlich die fachliche Parent-Beziehung.
- `order` bestimmt die stabile Reihenfolge unter Geschwistern mit demselben `parentId`.
- Child-Arrays werden weiterhin **nicht** als zweite Wahrheit gespeichert.

### Geschwisterreihenfolge

Für alle Objekte mit identischer `parentId` gilt `order` als Sortierschlüssel.

Verbindliche Regeln:

1. `order` ist eine ganze Zahl >= 0.
2. Innerhalb derselben Geschwistergruppe wird eine eindeutige Reihenfolge hergestellt.
3. Bei Einfügen, Verschieben oder Reparenting darf die betroffene Geschwistergruppe neu durchnummeriert werden.
4. Die konkrete Zahlenlücke ist nicht fachlich relevant; entscheidend ist nur die Reihenfolge.
5. Beim Speichern wird eine kanonische Reihenfolge `0..n-1` empfohlen, damit unnötige Lücken oder Drift vermieden werden.
6. `scene.rootObjectIds` wird aus den Root-Objekten entsprechend derselben Reihenfolge abgeleitet bzw. beim Speichern damit synchron gehalten.

Damit haben wir keine doppelte Parent-/Child-Datenhaltung, aber dennoch eine reproduzierbare Reihenfolge im Objektbaum.

### Zulässige Parents

Grundsätzlich darf jedes SceneObject Parent eines anderen SceneObjects sein, sofern sein Typ Hierarchiekinder fachlich erlaubt. Die Type Registry kann dies einschränken.

Mindestens zulässig:

- `group` als Parent
- `assembly` als Parent
- Root (`parentId = null`)

Für WD-02/P0.1 reicht Root plus `group` als vorbereitete Hierarchie. Spezifische Typbeschränkungen für Sketches, Kameras, Lichter oder importierte Modelle werden bei Bedarf über die Type Registry geprüft.

### Reparenting-Ablauf

Ein Reparent-Vorgang muss atomar als eine fachliche Operation behandelt werden:

1. Quellobjekt und neue Parent-ID bestimmen.
2. Prüfen, dass der neue Parent existiert oder `null` ist.
3. Prüfen, dass kein Zyklus entsteht.
4. Aktuelle Welttransformation des Objekts bestimmen.
5. `parentId` auf den neuen Parent setzen.
6. Lokalen Transform relativ zum neuen Parent aus der unveränderten Welttransformation neu berechnen.
7. Neue `order`-Position innerhalb der Ziel-Geschwistergruppe setzen.
8. Quell- und Ziel-Geschwistergruppen kanonisch neu ordnen.
9. SceneGraph erneut validieren.

Der Vorgang darf nicht halb durchgeführt werden. Falls eine Validierung fehlschlägt, bleibt der vorherige Zustand bestehen.

### Welttransformation erhalten

Standardmodus beim Reparenting ist `keepWorldTransform = true`.

Formal gilt:

`newLocalMatrix = inverse(newParentWorldMatrix) × oldWorldMatrix`

Bei Reparenting zum Root gilt die Root-Weltmatrix als Identität, also wird die bisherige Welttransformation zur neuen lokalen Transformation.

Die konkrete Zerlegung der Matrix in Position/Rotation/Scale wird in WD-01.05 festgelegt. Nicht sauber zerlegbare Sonderfälle dürfen später nicht stillschweigend verfälscht werden.

### Optionaler Alternativmodus

Für spätere Funktionen darf ein ausdrücklicher Modus `keepLocalTransform = true` eingeführt werden. In diesem Modus bleiben die lokalen Werte unverändert und das Objekt bewegt sich dadurch gegebenenfalls in der Welt.

Dieser Modus ist **nicht** der Standard und gehört nicht zum WD-02/P0.1-Pflichtumfang.

### Hierarchie und Gruppen/Baugruppen

Beim Gruppieren mehrerer Objekte wird ein neues `group`- oder `assembly`-Objekt erzeugt. Die ausgewählten Objekte werden auf dieses neue Parent-Objekt reparented, jeweils mit `keepWorldTransform = true`.

Beim Auflösen einer Gruppe werden deren direkten Kinder zum Parent der Gruppe bzw. zum Root reparented, ebenfalls mit Erhalt ihrer Welttransformation. Die Gruppe selbst kann danach gelöscht werden, sofern keine fachlichen Daten ihre Erhaltung verlangen.

Für `assembly` gilt dieselbe Hierarchiemechanik, aber ein Auflösen kann später zusätzlichen fachlichen Regeln unterliegen.

### Löschen eines Parent-Objekts

Die Löschsemantik wird später beim eigentlichen Bearbeitungsblock detailliert festgelegt. Für das Datenmodell gilt jedoch bereits:

- Ein Parent mit Kindern darf nicht einfach gelöscht werden, solange dadurch verwaiste `parentId`-Referenzen entstehen würden.
- Eine Löschoperation muss ausdrücklich definieren, ob Kinder mitgelöscht oder vorher reparented werden.
- Save/Load akzeptiert keine verwaisten Parent-Referenzen.

### Sichtbarkeit und Sperre in der Hierarchie

`visible` und `locked` bleiben als eigene Objektflags gespeichert. Eine spätere effektive Vererbung über Parent-Objekte kann zur Laufzeit berechnet werden, ohne die Child-Objekte umzuschreiben.

Beispiel: Ist eine Gruppe unsichtbar, können ihre Kinder effektiv unsichtbar sein, obwohl deren gespeichertes `flags.visible` weiterhin `true` bleibt.

Damit bleibt der eigene Zustand eines Kindes erhalten, wenn der Parent später wieder sichtbar wird.

### WD-02/P0.1-Anwendung

WD-02 muss mindestens nachweisen können:

- ein Root-Objekt und eine Gruppe existieren,
- ein Würfel kann von Root in die Gruppe und wieder zurück verschoben werden,
- seine `objectId` bleibt gleich,
- seine Weltposition/-rotation/-skalierung bleibt beim Standard-Reparenting gleich,
- seine lokalen Transformwerte ändern sich korrekt relativ zum neuen Parent,
- die Reihenfolge im Objektbaum bleibt nach Save/Load identisch.

### Abnahmekriterium WD-01.04

WD-01.04 ist erfüllt, wenn eine Szene mit mindestens zwei Parent-Ebenen und mehreren Geschwistern gespeichert und geladen werden kann und anschließend:

- alle `parentId`-Beziehungen identisch sind,
- die Geschwisterreihenfolge identisch ist,
- kein Zyklus oder verwaister Parent existiert,
- ein Reparenting mit `keepWorldTransform = true` die Welttransformation numerisch innerhalb definierter Toleranzen erhält,
- die lokalen Transformwerte korrekt an den neuen Parent angepasst werden.

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

WD-02 ist der erste echte technische Meilenstein. Er entspricht dem bisher als **P0.1 Minimal-Prototyp** bezeichneten Funktionskern. Zur Vermeidung konkurrierender Bezeichnungen wird ab diesem Punkt folgende Zuordnung verwendet:

**P0.1 = WD-02 End-to-End-Prototyp.**

WD-01 ist die notwendige Architekturvorstufe und wird vor P0.1/WD-02 abgeschlossen.

## Reihenfolge

`CM3D V0.1 BASELINE – FROZEN → WD-01 → WD-02 / P0.1 → weiterer V1-Ausbau`
