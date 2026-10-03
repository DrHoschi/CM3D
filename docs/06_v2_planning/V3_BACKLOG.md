# CM3D – V3 Backlog

**Stand:** 2026-10-03  
**Status:** V3 ACTIVE / IMPORTED STRUCTURE + VISIBILITY FROZEN  
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

### 2026-10-03 – Imported Element Visibility Overrides

**Status:** PASS / FROZEN / 0 BLOCKER

**Basis / vorheriger V3-Freeze:** `2ec3574dd886c401de0e3aa5a810d0b7cceac066`  
**Functional Head:** `f7fba05b8e0e6b57e4164e857cd6080a238507d2`  
**Evidence Head:** `1614bf92839544d0d117daaf51a1817b8b093169`  
**Exact-Head Evidence:** GitHub Actions Run `37157656084`

#### Scope

Dieser Block ist die erste persistente Mutation adressierter importierter Unterelemente. Das `external.gltf`-Root bleibt die einzige persistente CM3D-Objektidentität; einzelne Imported Elements werden weiterhin nicht zu `scene.objects`, Bodies oder Features.

Der eingefrorene Vertrag umfasst:

- sparse Visibility-Overrides am vorhandenen `external.gltf`-Root unter `data.importedOverrides.visibility[sourceKey]`;
- Source-Key-basierte Anwendung auf die rekonstruierte Imported Runtime Structure;
- Save → Reload / Re-Hydration stellt den Visibility-Zustand über denselben Source-Key wieder her;
- Visibility-Mutation läuft als persistente Domain-Mutation über die bestehende History und ist damit Undo-/Redo-fähig;
- GLB/glTF-/Exportprojektion respektiert den angewandten Runtime-Visibility-Zustand;
- verwaiste bzw. nicht mehr auflösbare Source-Keys bleiben non-blocking und führen nicht zu `INVALID`/`BLOCKED`-Recompute;
- keine Änderung von `SCHEMA_VERSION`;
- keine neuen `scene.objects`;
- keine Transform-, Material-, Textur-, UV- oder Mesh-Mutation.

#### Implementierter Produkt-Scope

- `src/ui/imported-structure.js`
- `tests/v3-imported-element-visibility-overrides.mjs`

Evidence-Infrastruktur:

- `.github/workflows/v3-imported-visibility-exact-head.yml`

Der erste Evidence-Lauf scheiterte ausschließlich am Runner-Schritt `npm ci`, weil das Repository keinen passenden Lockfile-Vertrag besitzt. Dieser Infrastrukturfehler erforderte keine Produktkorrektur. Der Runner wurde anschließend ausschließlich durch Entfernen dieses unnötigen Schritts korrigiert.

#### Verification / Regression

Run `37157656084` wurde gegen den Evidence Head `1614bf92839544d0d117daaf51a1817b8b093169` ausgeführt und ist vollständig erfolgreich abgeschlossen.

Bestätigte Checks:

- V3 Imported Element Visibility Override Contract – PASS;
- V3 Imported Structure Regression – PASS;
- V2 GLTF Regression – PASS;
- V2 OBJ/STL Interchange Regression – PASS;
- V2 Scene Hierarchy / Selection Regression – PASS;
- V2 Object Tree Regression – PASS.

**Freeze-Entscheidung:** PASS / 0 BLOCKER. Imported Element Visibility Overrides sind damit funktional eingefroren. Der Runner-Infrastrukturfehler ist geschlossen und stellt keinen Produktblocker dar.

#### Ausdrücklich getrennte Folgeblöcke

Folgende Erweiterungen bleiben außerhalb dieses Freeze und benötigen jeweils einen eigenen V3-Scope:

- Transform-Editing / Pivot-/Origin-Korrektur;
- Material-/Textur-Overrides;
- UV-/Materialbezug;
- Mesh-Simplification / Decimation;
- LOD- und Collision-Aufbereitung.

## Weitere V3-Kandidaten

### Game Asset Editing / Materials / Optimization

**Status:** V3-KANDIDAT / FOUNDATION + VISIBILITY BEGONNEN

CyberMotion soll langfristig die eigentliche 3D-Bearbeitungsautorität für importierte Game Assets sein. Adressierbare Imported Structure & Subselection sowie persistente Visibility-Overrides sind eingefroren. Die weiteren mutierenden Bearbeitungsfähigkeiten bleiben getrennte Folgeblöcke.

Kandidaten:

- Materialien und Texturen zuweisen, austauschen und nachkorrigieren;
- UV-/Materialbezug kontrollierbar machen;
- Pivot/Origin, Maße und Transformationsdaten feinjustieren;
- Mesh-Simplification / Decimation zur Polygonreduktion bei möglichst erhaltener sichtbarer Hülle/Silhouette;
- LOD-Stufen und optional vereinfachte Collision-Geometrie vorbereiten;
- Original und optimierte Fassung technisch/visuell vergleichbar halten;
- saubere Übergabe zwischen DevForge-Inspektion/Optimierung und CyberMotion-Bearbeitung vorsehen.

Abgrenzung: DevForge kann als Prüf-, Analyse- und Game-Asset-Aufbereitungswerkzeug dienen; CyberMotion bleibt für eigentliche Geometrie-, Material-/Textur- und Modellkorrekturen zuständig. Jeder Folgeblock benötigt eine separate Scope-/Capability-Reconciliation.
