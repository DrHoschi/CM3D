# CM3D – V3 Backlog

**Stand:** 2026-10-03  
**Status:** V3 ACTIVE / FIRST PRODUCT BLOCK FROZEN  
**Basis:** CM3D-V2 / Freeze Head `10c2def74668b6b17d14c2e6d3232d1de2f71159`

## Zweck

Dieses Dokument entstand während V2 zur kontrollierten Sammlung von Post-V2-Kandidaten. Nach dem offiziellen V2-Freeze dient es als Übergangs- und Nachweisdatei für die beginnende V3-Entwicklung.

## Regel

V3-Kandidaten werden vor Implementierung gegen den tatsächlich veröffentlichten V2-Bestand reconciliiert. Der eingefrorene V2-Kern wird nicht still geöffnet. Neue Produktblöcke benötigen einen klaren Capability-/Architecture-Scope und werden erst nach PASS / 0 BLOCKER eingefroren.

## Bereits vorgemerkte bzw. noch zu entscheidende Grenzfälle

- vollständiger Sketch-Constraint-Umfang;
- erweiterte Modifier außerhalb des notwendigen V2-Kerns;
- Suche/Filter im Objektbaum;
- Skizzen auf gekrümmten Flächen;
- weitergehende parametrische Featurehistorie.

GLB/GLTF-Hierarchie-Auflösung ist mit dem ersten V3-Produktblock begonnen. Drag-and-drop-Reparenting wurde bereits in V2 als F112 umgesetzt und ist kein offener V3-Kandidat mehr.

## V3 Produktblöcke

### 2026-10-03 – Imported Structure & Subselection

**Status:** PASS / FROZEN / 0 BLOCKER

**V2-Basis:** `10c2def74668b6b17d14c2e6d3232d1de2f71159`  
**Functional Head:** `15abda32d0f676d6157f990dc0e10a9947a04534`  
**Evidence Head:** `218a80f20c5994a91aa60a73b5ef59bd0a77d2ba`  
**Exact-Head Evidence:** GitHub Actions Run `37151097743`

#### Scope

Der erste V3-Produktblock etabliert eine adressierbare, abgeleitete Struktur für importierte GLB/glTF-Unterelemente, ohne importierte Nodes oder Meshes in native `scene.objects`, Bodies oder Features umzudeuten.

Der eingefrorene Vertrag umfasst:

- deterministische Imported-Element-Identität aus dem vorhandenen GLTF-Runtime-Baum;
- das persistente `external.gltf`-Root bleibt die echte CM3D-Objektidentität;
- importierte Unterelemente bleiben Runtime-/UI-Projektion und erzeugen keine zweite Scene-/Hierarchy-Autorität;
- Viewer und Object Tree verwenden dieselbe Imported-Subselection;
- der Inspector projiziert Imported-Element-Information read-only;
- keine zusätzliche Persistenz der importierten Hierarchie;
- keine Änderung von `SCHEMA_VERSION`;
- keine Visibility-, Transform- oder Material-Overrides in diesem Block.

#### Implementierter Produkt-Scope

- `src/runtime-three/imported-structure.js`
- `src/runtime-three/gltf-interchange.js`
- `src/ui/imported-structure.js`
- `src/main.js`
- `tests/v3-imported-structure-subselection.mjs`

Die Evidence-Infrastruktur liegt separat in:

- `.github/workflows/v3-imported-structure-subselection-verification.yml`

#### Verification / Regression

Run `37151097743` wurde gegen den Evidence Head `218a80f20c5994a91aa60a73b5ef59bd0a77d2ba` ausgeführt und ist vollständig erfolgreich abgeschlossen.

Bestätigte Checks:

- V3 Imported Structure & Subselection – PASS;
- V2 Scene Hierarchy Regression (`wd-25a`) – PASS;
- V2 Object Tree Regression (`wd-25c`) – PASS;
- V2 Central Export Regression (`wd-27a`) – PASS;
- V2 OBJ/STL Interchange Regression (`wd-27b`) – PASS.

**Freeze-Entscheidung:** PASS / 0 BLOCKER. Der Scope Imported Structure & Subselection ist damit funktional eingefroren. Weitere Fähigkeiten werden nicht in diesen Block aufgenommen.

#### Ausdrücklich getrennte Folgeblöcke

Folgende Erweiterungen bleiben außerhalb dieses Freeze und benötigen jeweils einen eigenen V3-Scope:

- persistente Visibility-Overrides für importierte Unterelemente;
- Transform-Editing / Pivot-/Origin-Korrektur;
- Material-/Textur-Overrides;
- UV-/Materialbezug;
- Mesh-Simplification / Decimation;
- LOD- und Collision-Aufbereitung.

## Weitere V3-Kandidaten

### Game Asset Editing / Materials / Optimization

**Status:** V3-KANDIDAT / NUR TEILWEISE BEGONNEN

CyberMotion soll langfristig die eigentliche 3D-Bearbeitungsautorität für importierte Game Assets sein. Der erste Foundation-Schritt – adressierbare Imported Structure & Subselection – ist eingefroren. Die mutierenden Bearbeitungsfähigkeiten bleiben getrennte Folgeblöcke.

Kandidaten:

- Materialien und Texturen zuweisen, austauschen und nachkorrigieren;
- UV-/Materialbezug kontrollierbar machen;
- Pivot/Origin, Maße und Transformationsdaten feinjustieren;
- Mesh-Simplification / Decimation zur Polygonreduktion bei möglichst erhaltener sichtbarer Hülle/Silhouette;
- LOD-Stufen und optional vereinfachte Collision-Geometrie vorbereiten;
- Original und optimierte Fassung technisch/visuell vergleichbar halten;
- saubere Übergabe zwischen DevForge-Inspektion/Optimierung und CyberMotion-Bearbeitung vorsehen.

Abgrenzung: DevForge kann als Prüf-, Analyse- und Game-Asset-Aufbereitungswerkzeug dienen; CyberMotion bleibt für eigentliche Geometrie-, Material-/Textur- und Modellkorrekturen zuständig. Jeder Folgeblock benötigt eine separate Scope-/Capability-Reconciliation.
