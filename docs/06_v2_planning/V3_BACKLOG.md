# CM3D – V3 Backlog

**Stand:** 2026-10-04  
**Status:** V3 ACTIVE / IMPORTED STRUCTURE + VISIBILITY + TRANSFORM FROZEN  
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
- keine Änderung von `SCHEMA_VERSION`.

**Freeze-Entscheidung:** PASS / 0 BLOCKER.

### 2026-10-03 – Imported Element Visibility Overrides

**Status:** PASS / FROZEN / 0 BLOCKER

**Basis / vorheriger V3-Freeze:** `2ec3574dd886c401de0e3aa5a810d0b7cceac066`  
**Functional Head:** `f7fba05b8e0e6b57e4164e857cd6080a238507d2`  
**Evidence Head:** `1614bf92839544d0d117daaf51a1817b8b093169`  
**Exact-Head Evidence:** GitHub Actions Run `37157656084`

Der eingefrorene Vertrag umfasst sparse Source-Key-basierte Visibility-Overrides am `external.gltf`-Root, Save→Reload/Re-Hydration, Undo/Redo, Exportprojektion und non-blocking Behandlung verwaister Source-Keys ohne `INVALID`/`BLOCKED`-Recompute.

**Freeze-Entscheidung:** PASS / 0 BLOCKER.

### 2026-10-04 – Imported Element Transform Overrides

**Status:** PASS / FROZEN / 0 BLOCKER

**Basis / vorheriger V3-Freeze:** `8fdf0e5551afda4953da9313c63cd06196806145`  
**Functional Head:** `621e91969a378380177ba86c890cf1f15347947b`  
**Evidence Head:** `4bf69733905717589e6db74cff66bd118ae71b1e`  
**Exact-Head Evidence:** GitHub Actions Run `37181770916`

#### Scope

Dieser Block erweitert die bereits adressierbaren und persistent sichtbarkeitssteuerbaren Imported Elements um persistente lokale Position-/Rotation-/Scale-Overrides. Das `external.gltf`-Root bleibt die einzige persistente CM3D-Objektidentität; Imported Elements werden weiterhin nicht zu nativen `scene.objects`, Bodies oder Features.

Der eingefrorene Vertrag umfasst:

- sparse Source-Key-basierte lokale Transform-Overrides am vorhandenen `external.gltf`-Root;
- Position, Quaternion-Rotation und Scale werden relativ zur vorhandenen GLTF-Parent-Hierarchie behandelt;
- Parent-Transformationen wirken über die bestehende Runtime-Hierarchie auf Children; Child-Overrides bleiben lokal und erzeugen keine persistente Transform-Kaskade;
- TransformControls können an die Imported-Subselection angebunden werden, ohne den Transform des `external.gltf`-Roots als Ersatz für den Subelement-Transform zu verändern;
- ein abgeschlossener Gizmo-Drag bildet eine persistente Mutation mit genau einem History-Vertrag und bleibt Undo-/Redo-fähig;
- Save → Reload / Re-Hydration stellt die Overrides über dieselben deterministischen Source-Keys wieder her;
- der resultierende Runtime-Transform ist die Grundlage für GLB/glTF- sowie OBJ/STL-Export; es wird kein zweiter Exportpfad eingeführt;
- verwaiste bzw. nicht mehr auflösbare Source-Keys bleiben non-blocking und führen nicht zu `INVALID`/`BLOCKED`-Recompute;
- bestehende Visibility-Overrides bleiben unverändert kompatibel;
- keine Änderung von `SCHEMA_VERSION`, Persistence-Foundation oder GLTF-Interchange-Vertrag;
- keine neuen `scene.objects`.

#### Implementierter Produkt-Scope

- `src/ui/imported-structure.js`
- `tests/v3-imported-element-transform-overrides.mjs`

Die zuvor autorisierte `src/runtime-three/runtime.js` musste nach der konkreten Integration nicht geändert werden; der vorhandene Runtime-/TransformControls-Vertrag konnte wiederverwendet werden.

Evidence-Infrastruktur:

- `.github/workflows/v3-imported-transform-exact-head.yml`

#### Verification / Regression

Run `37181770916` wurde gegen den Evidence Head `4bf69733905717589e6db74cff66bd118ae71b1e` ausgeführt und ist vollständig erfolgreich abgeschlossen.

Bestätigte Checks:

- V3 Imported Transform Override Contract – PASS;
- V3 Imported Structure Regression – PASS;
- V3 Imported Visibility Regression – PASS;
- V2 Scene Hierarchy Regression – PASS;
- V2 Object Tree Regression – PASS;
- V2 GLTF Export Regression – PASS;
- V2 OBJ/STL Interchange Regression – PASS.

**Freeze-Entscheidung:** PASS / 0 BLOCKER. Imported Element Transform Overrides sind damit funktional eingefroren.

#### Ausdrücklich ausgeschlossen / Folgeblöcke

Pivot/Origin ist ausdrücklich **nicht** Teil des Transform-Override-Blocks. Pivot-/Origin-Korrektur besitzt eine eigene Geometrie-/Bezugspunktsemantik und benötigt einen separaten V3-Scope.

Weiterhin getrennt bleiben:

- Pivot-/Origin-Korrektur;
- Material-/Textur-Overrides;
- UV-/Materialbezug;
- Mesh-Simplification / Decimation;
- LOD- und Collision-Aufbereitung.

## Weitere V3-Kandidaten

### Game Asset Editing / Materials / Optimization

**Status:** V3-KANDIDAT / FOUNDATION + VISIBILITY + TRANSFORM FROZEN

CyberMotion soll langfristig die eigentliche 3D-Bearbeitungsautorität für importierte Game Assets sein. Adressierbare Imported Structure & Subselection, persistente Visibility-Overrides und persistente Position-/Rotation-/Scale-Overrides sind eingefroren. Die weiteren mutierenden Bearbeitungsfähigkeiten bleiben getrennte Folgeblöcke.

Kandidaten:

- Materialien und Texturen zuweisen, austauschen und nachkorrigieren;
- UV-/Materialbezug kontrollierbar machen;
- Pivot/Origin und Maße feinjustieren;
- Mesh-Simplification / Decimation zur Polygonreduktion bei möglichst erhaltener sichtbarer Hülle/Silhouette;
- LOD-Stufen und optional vereinfachte Collision-Geometrie vorbereiten;
- Original und optimierte Fassung technisch/visuell vergleichbar halten;
- saubere Übergabe zwischen DevForge-Inspektion/Optimierung und CyberMotion-Bearbeitung vorsehen.

Abgrenzung: DevForge kann als Prüf-, Analyse- und Game-Asset-Aufbereitungswerkzeug dienen; CyberMotion bleibt für eigentliche Geometrie-, Material-/Textur- und Modellkorrekturen zuständig. Jeder Folgeblock benötigt eine separate Scope-/Capability-Reconciliation.
