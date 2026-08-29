# CM3D – V1-Restabgleich nach WD-15B

**Stand:** 2026-08-29  
**Basis:** WD-15B PASS / FROZEN (`6197371f9cbb84665819b11445b12410c9183cbe`)  
**Quelle:** `CM3D_MASTER_FUNCTIONS_V0_1.md` + tatsächlicher Repository-Stand auf `feature/wd-15b-project-settings`

## Bewertungsregel

- **ERFÜLLT** – V1-Funktion ist im aktuellen Stand praktisch vorhanden; bei bereits abgeschlossenen WD-Blöcken gilt deren PASS/FROZEN-Stand.
- **TEILWEISE** – wesentlicher Teil existiert, aber der Funktionsname der Masterliste ist noch nicht vollständig erfüllt.
- **OFFEN** – für die V1-Funktion existiert noch kein ausreichender produktiver Bedienpfad.

## V1-Matrix

| ID | Funktion | Bewertung | Kurzbegründung |
|---|---|---|---|
| F001 | Neues Projekt | ERFÜLLT | produktiver New-Project-Pfad |
| F002 | Projekt öffnen | ERFÜLLT | lokales Laden + CM3D-Projektdatei-Import |
| F004 | Speichern | ERFÜLLT | lokaler Browser-Speicher |
| F005 | Speichern unter | ERFÜLLT | WD-15A, echte `.cm3d.json`-Datei |
| F006 | Projekt-Einstellungen | ERFÜLLT | WD-15B PASS/FROZEN |
| F007 | Projekt schließen | ERFÜLLT | WD-15A PASS/FROZEN |
| F008 | Objektbaum | ERFÜLLT | Objekt-/Featurebaum vorhanden |
| F009 | Objekt auswählen | ERFÜLLT | Baum + Viewport |
| F010 | Umbenennen | ERFÜLLT | Inspector |
| F011 | Sichtbarkeit | ERFÜLLT | WD-14A PASS/FROZEN |
| F012 | Sperren/Entsperren | ERFÜLLT | WD-14B PASS/FROZEN |
| F013 | Gruppen | ERFÜLLT | bilden/auflösen |
| F014 | Baugruppen | ERFÜLLT | bilden/auflösen |
| F016 | 3D-Hauptansicht | ERFÜLLT | Three.js Hauptviewport |
| F017 | Top View | ERFÜLLT | feste Ansicht |
| F018 | Front View | ERFÜLLT | feste Ansicht |
| F019 | Side View | ERFÜLLT | feste Ansicht |
| F020 | Perspektive/Isometrie | ERFÜLLT | beide feste Ansichten vorhanden |
| F021 | Fit View / Fokus | ERFÜLLT | Fokus auf Auswahl |
| F022 | Orbit/Pan/Zoom | ERFÜLLT | OrbitControls |
| F023 | Raster und Achsen | **TEILWEISE** | GridHelper und dynamisches Raster vorhanden; keine vollständige sichtbare XYZ-Achsendarstellung nachgewiesen |
| F026 | Position X/Y/Z | ERFÜLLT | Inspector + Gizmo |
| F027 | Rotation X/Y/Z | ERFÜLLT | Inspector + Gizmo |
| F028 | Skalierung X/Y/Z | ERFÜLLT | Inspector + Gizmo |
| F029 | Weltachsen | ERFÜLLT | WORLD Transformraum |
| F030 | Objektachsen | ERFÜLLT | LOCAL Transformraum |
| F035 | Einheitenwechsel | ERFÜLLT | Werkzeuge + WD-15B-Projekteinstellungen |
| F039 | 2D-Skizzenmodus | ERFÜLLT | Skizzensitzung/Skizzenebene |
| F040 | Linien | ERFÜLLT | Erstellen + Editieren/Löschen |
| F041 | Rechteck/Polygon | ERFÜLLT | beide vorhanden |
| F044 | Extrudieren | ERFÜLLT | Feature-Operation + Parameterinspector |
| F045 | Quader/Würfel | ERFÜLLT | Primitive vorhanden |
| F046 | Zylinder | ERFÜLLT | Primitive vorhanden |
| F049 | Duplizieren | ERFÜLLT | Objekt/Unterbaum |
| F050 | Löschen | ERFÜLLT | Objekt + Skizzenelemente |
| F051 | Undo/Redo | ERFÜLLT | History-Pfad |
| F054 | Material zuweisen | ERFÜLLT | Materialauswahl/Zuordnung im Inspector |
| F055 | Farbe / Base Color | ERFÜLLT | BaseColor editierbar |
| F063 | Kameraobjekt | **OFFEN** | vorhandene Editor-Perspektivkamera ist kein modelliertes CM3D-Kameraobjekt |
| F064 | Kamera-Vorschau | **OFFEN** | kein Kameraobjekt und kein eigener Vorschaupfad |
| F072 | Import GLB/GLTF | ERFÜLLT | WD-11B-Pfad |
| F075 | Export GLB/GLTF | ERFÜLLT | Szene exportierbar |
| F077 | Export Auswahl | ERFÜLLT | Auswahl-Export vorhanden |
| F079 | Export JSON/Projektdatei | ERFÜLLT | `.cm3d.json` |
| F080 | Eigenschaftenpanel | ERFÜLLT | Inspector inkl. Featureparameter |
| F081 | Konsole / Debug / Diagnose | **OFFEN** | kein eigener produktiver Diagnosebereich; Browser-Konsole allein erfüllt die Masterfunktion nicht |
| F082 | Status / Meldungen / Warnungen / Fehler | **TEILWEISE** | Statuszeile und Alerts vorhanden, aber kein vollständiger strukturierter Meldungs-/Warnungs-/Fehlerbereich im Inspector |
| F083 | Scene JSON | **OFFEN** | Projektdatei-Export vorhanden, aber keine Scene-JSON-Ansicht im Inspector |
| F084 | Selection / Auswahlstatus | **TEILWEISE** | Selection-State intern vorhanden und Objektinspector reagiert darauf; kein eigener Auswahlstatus gemäß Inspector-Pflichtkern |
| F087 | Vertrautes Hauptlayout | ERFÜLLT | UI-01-Struktur |
| F088 | Eigene Icons / Icon-Paket V3 | ERFÜLLT | UI-01 PASS/FROZEN |
| F089 | Große Welt / kleine Objekte | ERFÜLLT ALS V1-BASIS | logarithmischer Tiefenpuffer, sehr großer Kamera-Farbereich, dynamische Near/Far-Anpassung und dynamisches Raster bilden die vorhandene V1-Technikbasis |

## Ergebnis

Der V1-Pflichtkern ist weitgehend umgesetzt. Nach dem tatsächlichen Repository-Abgleich bleiben folgende Lücken:

1. **F023** – Raster vorhanden, Achsenabschluss fehlt.
2. **F063/F064** – Kameraobjekt und Kamera-Vorschau fehlen vollständig.
3. **F081–F084** – Inspector-Diagnosekern ist offen bzw. nur teilweise durch bestehende Status-/Selection-Mechanik abgedeckt.

Damit sind keine weiteren bislang unentdeckten V1-Funktionsgruppen im Master sichtbar.

## Verbindliche Fortsetzung

### WD-16 – Viewport-Referenzsystem abschließen (`CM3D-F023`)

WD-16 wird bewusst der kleinste noch offene V1-Abschlussblock:

- sichtbare XYZ-Achsenreferenz ergänzen;
- vorhandenes dynamisches Raster beibehalten und nicht neu bauen;
- Achsen und Raster müssen über extreme Größenbereiche lesbar/stabil bleiben;
- keine Kameraobjekte, Diagnosetools oder V1–V2-Darstellungsmodi in WD-16 hineinziehen.

**Begründung:** F023 ist bereits teilweise implementiert, im Master der früheste noch nicht vollständig geschlossene V1-Punkt und technisch klein genug für einen isolierten, sicher testbaren Freeze.

Nach WD-16 folgen in separaten Blöcken:

- Kameraobjekt + Kamera-Vorschau (`F063/F064`);
- Inspector-Diagnoseabschluss (`F081–F084`).

Die genaue Nummerierung dieser nachfolgenden Blöcke wird erst nach WD-16 PASS/FROZEN festgeschrieben.
