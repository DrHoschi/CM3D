# CyberMotion 3D – Hauptfenster / kontextbezogenes Bedienkonzept V0.2

**Stand:** 2026-08-28  
**Status:** WORKING DESIGN / REVIEW  
**Vorgänger:** `hauptfenster_v0.1.md`  
**Grundlage:** bestehender CM3D-Webprototyp bis einschließlich WD-11A sowie die am 2026-08-28 abgestimmte Verdichtung der Menü-, Kontextleisten- und Inspector-Bedienung.

## 1. Ziel

Die Oberfläche soll deutlich kompakter werden, ohne vorhandene oder geplante Funktionen zu verlieren.

Statt viele dauerhaft sichtbare Einzelbuttons in mehreren Zeilen anzuordnen, wird die Bedienung in vier klar getrennte Ebenen aufgeteilt:

1. **Hauptmenü oben:** wenige dauerhafte Funktionsgruppen.
2. **Kontextleiste darunter:** zeigt nur Werkzeuge, die zur gerade gewählten Funktion bzw. zum aktuellen Bearbeitungsmodus passen.
3. **Objektbaum links:** bestimmt, *woran* gearbeitet wird und wird bis auf bearbeitbare Unterelemente erweitert.
4. **Inspector rechts:** zeigt Eigenschaften der Auswahl und – bei aktivem Werkzeug – zusätzlich dessen genaue Parameter.

Grundregel:

> Oben wird gewählt, **was getan werden soll**.  
> In der Kontextleiste erscheinen die **dafür benötigten Werkzeuge**.  
> Im Objektbaum wird gewählt, **woran gearbeitet wird**.  
> Im Inspector werden die **exakten Werte und Optionen** eingestellt.

## 2. Oberste Menüzeile

Die oberste Zeile bleibt dauerhaft sichtbar und enthält keine große Ansammlung einzelner Modellierbefehle mehr.

```text
CYBERMOTION 3D
│
├── NEU
├── DATEI
├── BEARBEITEN
├── ANSICHT
├── TRANSFORM
├── MODELLIEREN
├── SZENE
├── MATERIAL
└── WERKZEUGE
```

Jeder Hauptpunkt erhält ein passendes Icon aus dem vorhandenen CyberMotion-Iconset.

### 2.1 NEU

```text
NEU
├── Neues Projekt
├── Neues Objekt
├── Neue Skizze
├── Neue Gruppe
├── Neue Baugruppe
├── Neue Kamera
└── Neues Licht
```

Verhalten:

- Klick auf **NEU** öffnet ein kompaktes Auswahlmenü.
- Nach der Auswahl schließt sich dieses Menü wieder.
- Die Auswahl setzt den passenden Modus.
- Die zweite Zeile wird danach automatisch mit den zum Modus gehörenden Werkzeugen belegt.

Beispiel:

```text
NEU → Neues Objekt
          ↓
Kontextleiste: Würfel | Kugel | Zylinder | Kegel | Ebene | …
```

```text
NEU → Neue Skizze
          ↓
Kontextleiste: Linie | Rechteck | Polygon | Kreis | Bogen | …
```

### 2.2 DATEI

```text
DATEI
├── Projekt öffnen / Projektdatei importieren
├── Speichern
├── Speichern unter
├── Importieren
│   ├── GLB / GLTF
│   ├── OBJ / STL
│   └── CMO / CMU                 [später]
├── Exportieren
│   ├── Ganze Szene
│   ├── Auswahl
│   ├── Baugruppe
│   └── Projektdatei / JSON
└── Projekteinstellungen
```

Die bereits in WD-11A umgesetzte native CM3D-Projektdatei bleibt funktional unverändert. V0.2 beschreibt zunächst nur die spätere UI-Einordnung dieser Funktionen.

### 2.3 BEARBEITEN

```text
BEARBEITEN
├── Rückgängig
├── Wiederholen
├── Duplizieren
├── Löschen
├── Umbenennen
├── Gruppieren
├── Baugruppe erstellen
└── Auflösen
```

Befehle werden nur aktiv angeboten, wenn sie für die aktuelle Auswahl zulässig sind.

### 2.4 ANSICHT

```text
ANSICHT
├── Top
├── Front
├── Back
├── Left
├── Right
├── Bottom
├── Perspektive
├── Isometrie
├── Fit / Fokus
├── Raster ein / aus
├── Achsen ein / aus
├── Solid
├── Wireframe
├── Material Preview
└── 1 Ansicht / 4 Ansichten        [später]
```

Für häufig verwendete Ansichtswechsel kann nach Auswahl von **ANSICHT** eine kompakte Kontextleiste erscheinen.

### 2.5 TRANSFORM

```text
TRANSFORM
├── Move
├── Rotate
├── Scale
├── WORLD
├── LOCAL
├── Snap
│   ├── Raster
│   ├── Punkt
│   └── Kante
├── Ursprung bearbeiten
├── Ursprung → Zentrum
├── Ursprung → Unterkante
├── Spiegeln                      [später]
└── Ausrichten                    [später]
```

### 2.6 MODELLIEREN

```text
MODELLIEREN
├── Objekt bearbeiten
├── Skizze bearbeiten
├── Extrudieren
├── Boolean                       [später]
│   ├── Union
│   ├── Subtract
│   └── Intersect
└── weitere Formwerkzeuge         [später]
```

### 2.7 SZENE

```text
SZENE
├── Objektbaum
├── Sichtbarkeit
├── Sperren / Entsperren
├── Gruppe
├── Baugruppe
├── Kamera
└── Licht
```

### 2.8 MATERIAL

```text
MATERIAL
├── Material zuweisen
├── Farbe
├── Roughness
├── Metalness
├── Transparenz
├── Textur
├── Material entfernen
└── Materialbibliothek
```

Die bereits in WD-10A vorhandene Materialzuweisung/Basisfarbe wird nicht fachlich geändert; V0.2 ordnet sie nur in das kompaktere Bedienkonzept ein.

### 2.9 WERKZEUGE

```text
WERKZEUGE
├── Messen
│   ├── Abstand
│   ├── Winkel
│   └── Bemaßungen
├── Bibliothek
│   ├── Objektbibliothek
│   ├── Auswahl hinzufügen
│   └── Objekt einfügen
├── Screenshot
└── Kamera-Vorschau
```

## 3. Zweite Zeile – Kontextleiste

Die zweite Zeile ist **nicht dauerhaft mit allen Werkzeugen belegt**. Sie wird kontextabhängig aufgebaut.

### 3.1 Modus „Neues Objekt“

```text
[ Würfel ] [ Kugel ] [ Zylinder ] [ Kegel ] [ Ebene ] [ Rohr ] [ Torus ] …
```

### 3.2 Modus „Neue Skizze“

```text
[ Linie ] [ Rechteck ] [ Polygon ] [ Kreis ] [ Bogen ]
Ebene: [ Front ▼ ]
Snap:  [ Raster ] [ Punkt ] [ Kante ]
```

### 3.3 Modus „Skizze bearbeiten“

```text
[ Auswählen ] [ Linie ] [ Rechteck ] [ Polygon ] [ Kreis ]
[ Löschen ] [ Duplizieren ] [ Extrudieren ]
```

### 3.4 Objekt ausgewählt

```text
[ Move ] [ Rotate ] [ Scale ] [ WORLD / LOCAL ] [ Snap ]
[ Duplizieren ] [ Löschen ]
```

### 3.5 Gruppe ausgewählt

```text
[ Move ] [ Rotate ] [ Scale ]
[ Baugruppe erstellen ] [ Auflösen ] [ Duplizieren ]
```

### 3.6 Baugruppe ausgewählt

```text
[ Move ] [ Rotate ] [ Scale ]
[ Origin ] [ Zur Bibliothek ] [ Exportieren ]
```

## 4. Objektbaum – hierarchische Bearbeitung

Der Objektbaum wird nicht nur als Liste fertiger Objekte verstanden, sondern bildet die tatsächlich bearbeitbare Hierarchie ab.

Beispiel:

```text
Gruppe 1
├── Baugruppe 1
│   ├── Stütze 1
│   ├── Stütze 2
│   └── Balken 1
└── Skizze 1
    ├── Linie 001
    ├── Linie 002
    ├── Linie 003
    └── Linie 004
```

### 4.1 Skizzenelemente

Einzelne Elemente einer Skizze müssen auswählbar werden.

Damit wird insbesondere folgende heute noch fehlende Bedienung möglich:

```text
Skizze 1
├── Linie 001
├── Linie 002   ← ausgewählt
├── Linie 003
└── Linie 004

Aktion: Löschen
Ergebnis: nur Linie 002 wird entfernt.
```

Die Auswahl eines Skizzenelements soll zugleich dessen geometrische Daten im Inspector verfügbar machen.

## 5. Inspector – Grundmodell

Der Inspector wird kontextabhängig, aber nicht vollständig bei jeder Aktion ersetzt.

Er besteht logisch aus drei Schichten:

```text
INSPECTOR
├── AUSWAHL
│   └── dauerhaft relevante Eigenschaften des ausgewählten Elements
│
├── AKTIVES WERKZEUG
│   └── temporärer Parameterblock für die laufende Operation
│
└── WEITERE EIGENSCHAFTEN
    └── auf-/zuklappbare Bereiche wie Transform, Material, Info, Exportstatus …
```

### 5.1 Beispiel: Extrudieren

Wenn eine Skizze gewählt und **Extrudieren** gestartet wird:

```text
INSPECTOR

Auswahl
  Skizze 1

▼ EXTRUDIEREN
  Quelle
  [ Skizze 1 ]

  Tiefe
  [ 1,000 ] m

  Richtung
  ○ Vorwärts
  ○ Rückwärts
  ● Symmetrisch

  Vorschau
  ☑ aktiv

  [ Abbrechen ] [ Anwenden ]

▼ SKIZZE
  Name
  Ebene
  Sichtbar
  Gesperrt
  Elemente

▼ TRANSFORM
  …
```

Wesentliche Regel:

**Extrudieren ist kein dauerhaft sichtbarer Block mit allen Eingabefeldern.**  
Der Parameterblock erscheint erst, wenn das Werkzeug aktiv ist.

### 5.2 Beispiel: Exportieren

Wenn eine Baugruppe ausgewählt und **Exportieren** gestartet wird:

```text
INSPECTOR

Auswahl
  Baugruppe 1

▼ EXPORTIEREN
  Exportieren
  ● Auswahl
  ○ Ganze Szene

  Format
  [ GLB ▼ ]

  Dateiname
  [ Baugruppe_1 ]

  Einheit
  [ m ▼ ]

  Ursprung
  ● Baugruppen-Ursprung
  ○ Weltursprung

  Materialien
  ☑ einschließen

  Texturen
  ☑ einschließen

  Transformationen
  ☑ übernehmen

  [ Abbrechen ] [ Exportieren ]

▼ BAUGRUPPE
  Name
  Parent
  Abmessungen
  Origin
  …
```

Die dargestellten Exportparameter sind UI-Zielbild. Funktionen, die fachlich noch nicht implementiert sind, werden dadurch nicht vorgezogen.

### 5.3 Beispiel: einzelne Linie einer Skizze

```text
INSPECTOR

LINIE 002

Startpunkt
X [ 0,000 ]
Y [ 0,000 ]

Endpunkt
X [ 2,400 ]
Y [ 0,000 ]

Länge
  2,400 m

Winkel
  0°

[ Duplizieren ]
[ Löschen ]
```

## 6. Trennung Auswahl / Modus / Werkzeug

Die Bedienlogik soll technisch und visuell drei Zustände unterscheiden:

- **Selection Context:** Was ist aktuell ausgewählt?
- **Mode Context:** In welchem Arbeitsmodus befindet sich der Benutzer? Beispiel Objekt, Skizze, Szene.
- **Active Tool Context:** Welches Werkzeug wird gerade ausgeführt? Beispiel Extrudieren, Exportieren, Move.

Dadurch darf dieselbe Auswahl unterschiedliche sinnvolle Bedienmöglichkeiten erhalten, ohne dass alle gleichzeitig sichtbar sein müssen.

## 7. UI-Konsistenzregeln

1. Funktionen verschwinden nicht; sie werden sinnvoll gruppiert.
2. Die oberste Menüzeile bleibt klein und stabil.
3. Die Kontextleiste enthält nur zum aktuellen Modus passende Direktwerkzeuge.
4. Detailparameter gehören grundsätzlich in den Inspector, nicht in die Hauptleiste.
5. Der Objektbaum bildet bearbeitbare Hierarchien ab.
6. Nicht verfügbare Funktionen werden deaktiviert oder nicht angeboten.
7. Bestehende CM3D-Daten- und Funktionssemantik wird durch die UI-Neustrukturierung nicht still verändert.
8. Bereits PASS/FROZEN gesetzte Blöcke bleiben fachlich unverändert, solange ihre Funktion nicht ausdrücklich in einem neuen Implementierungsblock erweitert wird.
9. Das vorhandene Icon-Paket V3 bleibt UI-Grundlage.
10. Bedienung muss auf iPad/iPhone Safari weiterhin praktisch nutzbar bleiben; große permanente Buttonteppiche sind deshalb zu vermeiden.

## 8. Verhältnis zu V0.1

`hauptfenster_v0.1.md` bleibt als historischer Ausgangsstand erhalten und wird nicht überschrieben.

V0.2 konkretisiert und verändert insbesondere die Bedienorganisation:

- klassische, breite Button-/Menüansammlung → kompakte Hauptgruppen;
- dauerhaft sichtbare Werkzeugmengen → kontextabhängige zweite Zeile;
- statischer Inspector → Auswahl + temporärer Werkzeugblock + Eigenschaften;
- Objektbaum nur auf Objektebene → perspektivisch bis zu bearbeitbaren Skizzenelementen.

Die grundsätzliche Fensteraufteilung bleibt erhalten:

- oben Bedienung;
- links Objektbaum/Struktur;
- Mitte 3D-Viewport;
- rechts Inspector;
- unten Statusinformationen.

## 9. Implementierungsregel

Dieses Dokument ist zunächst eine **UI-/UX-Festlegung**, keine automatische Freigabe zur vollständigen Implementierung aller genannten Funktionen.

Die Umstellung soll später als eigener kontrollierter Implementierungsblock erfolgen. Dabei werden zuerst bereits vorhandene Funktionen in das neue Bedienkonzept überführt. Neue fachliche Funktionen – insbesondere Skizzenelement-Löschen, zusätzliche Primitive, Boolean, erweiterter Export oder Bibliotheksfunktionen – erhalten weiterhin ihren eigenen Scope und ihre eigenen Tests.
