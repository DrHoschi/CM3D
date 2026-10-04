# CM3D – V3 Backlog

**Stand:** 2026-10-04  
**Status:** V3 ACTIVE / IMPORTED STRUCTURE + VISIBILITY + TRANSFORM + MATERIAL PARAMETERS + BASE-COLOR TEXTURE FROZEN  
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

Der erste V3-Produktblock etabliert eine adressierbare, abgeleitete Struktur für importierte GLB/glTF-Unterelemente, ohne importierte Nodes oder Meshes in native `scene.objects`, Bodies oder Features umzudeuten. Deterministische Imported-Element-Identität, gemeinsame Viewer-/Object-Tree-Subselection und read-only Inspector-Projektion sind eingefroren. Das persistente `external.gltf`-Root bleibt die echte CM3D-Objektidentität; `SCHEMA_VERSION` bleibt unverändert.

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

Der eingefrorene Vertrag umfasst sparse Source-Key-basierte lokale Position-/Quaternion-Rotation-/Scale-Overrides, Parent-/Child-Semantik über die vorhandene GLTF-Hierarchie, TransformControls-Anbindung, Undo/Redo, Save→Reload/Re-Hydration und Exportprojektion. Verwaiste Source-Keys bleiben non-blocking. Pivot/Origin ist ausdrücklich nicht Teil dieses Blocks.

**Freeze-Entscheidung:** PASS / 0 BLOCKER.

### 2026-10-04 – Imported Element Material Parameter Overrides

**Status:** PASS / FROZEN / 0 BLOCKER

**Basis / vorheriger V3-Freeze:** `1e851f98dda2f3175a0592079ed47ecfe3bcef0c`  
**Functional Head:** `d2c5efae6bec59d700205ba14bdfff596f137819`  
**Evidence Head:** `0a0d87e14c74b3a2fbf683f7990bd6d761a17f7f`  
**Exact-Head Evidence:** GitHub Actions Run `37184813866`

Der eingefrorene Vertrag umfasst Source-Key-basierte sparse Materialparameter-Overrides am vorhandenen `external.gltf`-Root, ausschließlich Base Color, Metallic, Roughness und Opacity, Clone-on-Override für Single-Material Imported Meshes, Undo/Redo, Save→Reload/Re-Hydration und non-blocking Behandlung verwaister Source-Keys. Multi-Material, Texture Replacement, UV und Pivot/Origin waren in diesem Block ausgeschlossen.

**Freeze-Entscheidung:** PASS / 0 BLOCKER.

### 2026-10-04 – Imported Element Base-Color Texture Replacement

**Status:** PASS / FROZEN / 0 BLOCKER

**Basis / vorheriger V3-Freeze:** `e52284c19ed6830deaed308b90a0615f18e612b3`  
**Functional Head:** `eefaa42ccf4f9b99b82dac4fb1e2a43de45ee8c1`  
**Evidence Head:** `9ce0ab18fe2df281fd251d5c85207b9f541988b1`  
**Exact-Head Evidence:** GitHub Actions Run `37197737824`

#### Scope und eingefrorener Vertrag

Dieser Block erweitert adressierbare Single-Material Imported Meshes ausschließlich um Base-Color/Albedo-Texture-Replacement. Das ursprüngliche GLB/glTF-Asset wird nicht mutiert und Imported Elements werden weiterhin weder native `scene.objects` noch Bodies, Features oder native MaterialDefinitions.

Der eingefrorene Vertrag umfasst:

- Wiederverwendung bestehender persistenter `image.texture`-Assets mit stabiler `assetId`;
- Source-Key-basierte sparse Base-Color-Texture-Referenz am vorhandenen `external.gltf`-Root;
- ausschließlich Base-Color/Albedo (`material.map`) für Single-Material Imported Meshes;
- bestehende GLTF-UV-Projektion bleibt unverändert und wird für die Ersatztextur wiederverwendet;
- sRGB-Hydration der Base-Color-Textur in den Runtime-Materialzustand;
- Wiederverwendung des eingefrorenen Clone-on-Override-Vertrags, sodass gemeinsam genutzte GLTF-Materialinstanzen nicht unbeabsichtigt gemeinsam mutiert werden;
- Koexistenz mit den eingefrorenen Base-Color-/Metallic-/Roughness-/Opacity-Materialparameter-Overrides;
- Undo/Redo und History über den bestehenden Store-Vertrag;
- Save → Reload / Re-Hydration und deterministisches Reapply über Source-Key und Texture-Asset-Referenz;
- Entfernen des Overrides stellt die ursprüngliche GLTF-Base-Color-Map wieder her, ohne bestehende Materialparameter-Overrides zu verlieren;
- unresolved Source-Keys bzw. fehlende Texture-Assets bleiben non-blocking und führen nicht zu `INVALID`/`BLOCKED` des `external.gltf`-Roots;
- GLB/glTF-Export übernimmt den vollständig hydrierten Runtime-Materialzustand;
- bestehende OBJ-/STL-Verträge bleiben unverändert; es wird kein neuer OBJ+MTL- oder STL-Texturvertrag eingeführt;
- keine Änderung an `SCHEMA_VERSION`, Persistence-Foundation oder GLTF-Interchange-Architektur.

#### Implementierungs- und Evidence-Scope

Produkt/Test:

- `src/ui/imported-structure.js`
- `tests/v3-imported-element-base-color-texture-replacement.mjs`

Notwendige Regression-Contract-Korrektur:

- `tests/v3-imported-element-material-overrides.mjs` – ausschließlich die obsolete Assertion entfernt, die jeglichen Texture-Austausch verbot; der Materialparameter-Vertrag bleibt weiterhin auf `baseColor`, `metallic`, `roughness`, `opacity` begrenzt.

Evidence-Infrastruktur:

- `.github/workflows/v3-imported-base-color-texture-exact-head.yml`

#### Verification / Regression

Run `37197737824` wurde gegen Evidence Head `9ce0ab18fe2df281fd251d5c85207b9f541988b1` ausgeführt und vollständig erfolgreich abgeschlossen.

Bestätigte Checks:

- V3 Imported Base-Color Texture Replacement Contract – PASS;
- V3 Imported Structure Regression – PASS;
- V3 Imported Visibility Regression – PASS;
- V3 Imported Transform Regression – PASS;
- V3 Imported Material Parameter Regression – PASS;
- V2 Base-Color Texture Foundation Regression – PASS;
- V2 GLTF Export Regression – PASS.

Die vorherigen Evidence-Fehler waren ausschließlich Runner-/Regression-Contract-Probleme: zuerst eine veraltete Material-Test-Assertion, anschließend ein nicht existierender V2-Texture-Testname. Die Produktimplementation musste dafür nicht korrigiert werden. Der finale Exact-Head-Lauf ist vollständig grün.

**Freeze-Entscheidung:** PASS / 0 BLOCKER. Imported Element Base-Color Texture Replacement ist damit funktional eingefroren.

#### Ausdrücklich ausgeschlossen / deferred

Nicht Teil dieses Blocks sind:

- Multi-Material-/Material-Slot-Editing;
- Normal-, Roughness-, Metalness-, AO- oder Emissive-Texture-Replacement;
- UV-Editing oder UV-Reprojektion;
- Sampler-/Wrap-/Filter-Editing;
- Pivot-/Origin-Korrektur;
- Meshbearbeitung, Decimation oder LOD;
- neue OBJ+MTL- oder STL-Material-/Textursemantik.

## Weitere V3-Kandidaten

### Game Asset Editing / Materials / Optimization

**Status:** V3-KANDIDAT / STRUCTURE + VISIBILITY + TRANSFORM + MATERIAL PARAMETERS + BASE-COLOR TEXTURE FROZEN

CyberMotion soll langfristig die eigentliche 3D-Bearbeitungsautorität für importierte Game Assets sein. Adressierbare Imported Structure & Subselection, persistente Visibility-, Position-/Rotation-/Scale-, Single-Material-PBR-Parameter- und Base-Color-Texture-Overrides sind eingefroren.

Offene Kandidaten:

- weitere Texture-Slots (Normal/Roughness/Metalness/AO/Emissive);
- UV-/Materialbezug;
- Multi-Material-/Material-Slot-Editing;
- Pivot/Origin und Maße feinjustieren;
- Mesh-Simplification / Decimation zur Polygonreduktion bei möglichst erhaltener sichtbarer Hülle/Silhouette;
- LOD-Stufen und optional vereinfachte Collision-Geometrie vorbereiten;
- Original und optimierte Fassung technisch/visuell vergleichbar halten;
- saubere Übergabe zwischen DevForge-Inspektion/Optimierung und CyberMotion-Bearbeitung vorsehen.

Abgrenzung: DevForge kann als Prüf-, Analyse- und Game-Asset-Aufbereitungswerkzeug dienen; CyberMotion bleibt für eigentliche Geometrie-, Material-/Textur- und Modellkorrekturen zuständig. Jeder Folgeblock benötigt eine separate Scope-/Capability-Reconciliation.
