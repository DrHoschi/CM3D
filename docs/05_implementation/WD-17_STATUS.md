# WD-17 – Kameraobjekt & Kamera-Vorschau

**Stand:** 2026-08-29  
**Status:** PASS / FROZEN  
**Branch:** `feature/wd-17-camera-object-preview`  
**Basis:** WD-16 PASS / FROZEN (`ec2fd895cde21c0ec46da754e0059f2ad5bff077`)  
**Funktionen:** `CM3D-F063` – Kameraobjekt; `CM3D-F064` – Kamera-Vorschau

## Ziel

WD-17 ergänzt den V1-Pflichtkern um ein echtes Kameraobjekt innerhalb der CM3D-Szene und einen kontrollierten Vorschaupfad durch diese Kamera.

## Kameraobjekt

Über `Neu → Neue Kamera` wird ein neues Objekt vom Typ `camera.perspective` erzeugt.

Das Kameraobjekt:

- besitzt eine eigene `objectId`;
- liegt als echtes Objekt in `scene.objects` und im Objektbaum;
- besitzt die normalen CM3D-Transformdaten für Position, Rotation, Skalierung und Pivot;
- wird zunächst an der aktuellen Editor-Kameraposition und -ausrichtung erzeugt;
- kann wie andere Szenenobjekte ausgewählt, verschoben, gedreht, dupliziert, gelöscht, gesperrt und gespeichert werden;
- besitzt persistent die Perspektivparameter `fov`, `near` und `far`;
- wird im Viewport mit einer Kamera-/Frustum-Hilfsdarstellung dargestellt;
- mehrere Kameraobjekte können gleichzeitig im Projekt vorhanden sein.

Das bestehende Projektschema bleibt `0.1.0`; der Validator akzeptiert den neuen Objekttyp über die vorhandene generische Objektstruktur.

## Kamera-Inspector

Bei ausgewähltem Kameraobjekt erscheint im Inspector ein eigener Abschnitt `Kamera` mit:

- Sichtfeld / FOV in Grad;
- Near-Clipping;
- Far-Clipping.

Parameteränderungen erzeugen einen eigenen Undo/Redo-History-Schritt `Kamera-Parameter ändern`.

## Kamera-Vorschau

Im Ansichtsbereich steht bei ausgewählter Kamera `Kamera-Vorschau` zur Verfügung.

Beim Aktivieren:

- übernimmt die Editoransicht temporär Position, Rotation, FOV, Near und Far des Kameraobjekts;
- Orbit-Navigation wird während der Vorschau deaktiviert;
- das normale Raster und der Transform-Gizmo werden für die Vorschau ausgeblendet;
- das Projekt selbst wird durch das reine Aktivieren der Vorschau nicht geändert.

Mit `Vorschau beenden` wird die vorherige Editor-Kameraposition einschließlich Orbit-Ziel und Projektionswerten wiederhergestellt.

## Persistenz

Kameraobjekt und Kameraparameter liegen innerhalb der normalen Projektstruktur und werden daher mit den bestehenden Pfaden erhalten:

- normales lokales Speichern/Laden;
- WD-15A `Speichern unter…`;
- Projektdatei-Import/Export.

## Geräteabnahme

**Datum:** 2026-08-29  
**Gerät/Umgebung:** iPad / Safari / GitHub Pages  
**Ergebnis:** PASS

Im realen Gerätetest wurden Kameraobjekte in einer bestehenden größeren Szene platziert und aus unterschiedlichen Positionen verwendet. Die Kamera-Vorschau sowie die Rückkehr zur Editoransicht funktionierten. Der Test umfasste außerdem Speichern und erneutes Laden; die Kameraobjekte blieben erhalten. Im geprüften Projekt waren gleichzeitig zwei Kameraobjekte vorhanden und persistent vorhanden.

Die vom Benutzer bereitgestellten Screenshots zeigen sowohl die Kamera-/Frustum-Darstellungen innerhalb der normalen Editoransicht als auch den aktiven Vorschauzustand `Vorschau beenden`.

## Nicht Bestandteil

- mehrere parallele Vorschaufenster;
- Render-Ausgabe/Screenshot;
- orthografische Kameraobjekte;
- Kameraanimationen;
- Kamera-Bookmarks;
- Lichtobjekte;
- Render-Pipeline.

## Freeze

WD-17 ist nach bestandenem realem iPad-/Safari-Gerätetest **PASS / FROZEN**.

Neue Funktionalität oder Änderungen an diesem Block erfolgen nur über einen nachfolgenden dokumentierten Entwicklungsblock. WD-17 selbst wird nicht weiter erweitert.
