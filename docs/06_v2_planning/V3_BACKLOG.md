# CM3D – V3 Backlog

**Stand:** 2026-09-15  
**Status:** OPEN BACKLOG  
**Gültig während:** CM3D V2 Planung und Entwicklung

## Zweck

Dieses Dokument verhindert Scope Creep während V2. Neue Ideen, Verbesserungen und Erweiterungswünsche werden hier gesammelt, solange sie nicht zwingend erforderlich sind, um einen bereits freigegebenen V2-Block korrekt oder technisch tragfähig abzuschließen.

## Regel

Eine während V2 neu entstehende Idee wird standardmäßig als **V3-KANDIDAT** eingetragen.

Nur wenn ein dokumentierter Abhängigkeitsnachweis zeigt, dass die Funktion für einen V2-Block zwingend erforderlich ist, darf sie über eine kontrollierte Scope-Entscheidung nach V2 verschoben werden.

## Eintragsformat

Jeder neue Kandidat soll möglichst enthalten:

- Datum;
- kurzer Titel;
- Beschreibung/Nutzen;
- Bezug zu bestehender Funktion oder V2-Block;
- Grund, warum nicht unmittelbar in V2 aufgenommen;
- spätere Priorität, sobald V3 geplant wird.

## Bereits vorgemerkte bzw. noch zu entscheidende Grenzfälle

Die folgenden Punkte werden in der V2-Masterplanung noch bewertet und sind deshalb noch **nicht automatisch V3**:

- vollständiger Sketch-Constraint-Umfang;
- erweiterte Modifier außerhalb des notwendigen V2-Kerns;
- GLB/GLTF-Hierarchie-Auflösung;
- Suche/Filter im Objektbaum;
- Drag-and-drop-Reparenting;
- Skizzen auf gekrümmten Flächen;
- weitergehende parametrische Featurehistorie.

Sobald die V2-Scope-Entscheidung getroffen wurde, werden abgelehnte V2-Kandidaten hier als konkrete V3-Einträge übernommen.

## Aktuelle Einträge

### 2026-09-15 – Game Asset Editing / Materials / Optimization

**Status:** V3-KANDIDAT / IDEE / NICHT FÜR AKTUELLE IMPLEMENTIERUNG AUTORISIERT

CyberMotion soll langfristig die eigentliche 3D-Bearbeitungsautorität für importierte Game Assets sein. Kandidaten:

- GLB/glTF-Modelle und ihre Mesh-/Node-/Untergruppen gezielt bearbeiten;
- Materialien und Texturen zuweisen, austauschen und nachkorrigieren;
- UV-/Materialbezug später kontrollierbar machen;
- Pivot/Origin, Maße und Transformationsdaten feinjustieren;
- Mesh-Simplification / Decimation zur massiven Polygonreduktion bei möglichst erhaltener sichtbarer Hülle/Silhouette;
- LOD-Stufen und optional vereinfachte Collision-Geometrie vorbereiten;
- Original und optimierte Fassung technisch/visuell vergleichbar halten;
- saubere Übergabe zwischen DevForge-Inspektion/Optimierung und CyberMotion-Bearbeitung vorsehen.

Abgrenzung: DevForge kann später als Prüf-, Analyse- und Game-Asset-Aufbereitungswerkzeug dienen; CyberMotion bleibt für eigentliche Geometrie-, Material-/Textur- und Modellkorrekturen zuständig. Keine dieser Ideen darf laufende V2-Blöcke erweitern oder blockieren. Vor einer Umsetzung ist ein separater Scope-/Capability-Reconciliation-Block erforderlich.
