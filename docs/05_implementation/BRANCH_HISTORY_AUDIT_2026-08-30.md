# CM3D – Branch-/PR-Historien-Audit

**Stand:** 2026-08-30  
**Status:** PASS / CLEANUP LIST APPROVED BY TECHNICAL AUDIT  
**Basis-main:** `715aae63721c277e6c3ed98c3a4bb3f5759a1147`

## 1. Ziel

Die historisch gewachsene Branchliste wird vor weiterer WD-20-Implementierung bereinigt. Dieses Dokument erhält die Zuordnung dauerhaft im Repository, sodass überholte Branch-Refs anschließend gelöscht werden können, ohne die Entwicklungsfolge unkenntlich zu machen.

## 2. Verbindlich verbleibende Branches

| Branch | Rolle | Status |
|---|---|---|
| `main` | getesteter/freigegebener Gesamtstand + konsolidierte Dokumentation | BEHALTEN |
| `feature/wd-20a-project-schema-migration` | nicht freigegebener WD-20A-Teststand | BEHALTEN / HOLD / NICHT MERGEN |

## 3. Dokumentationsbranches – nach Konsolidierung löschbar

| Branch | End-SHA | Zuordnung | Entscheidung |
|---|---|---|---|
| `bootstrap/docs-v0.1` | `7516960974cffe301e1d3705171c2860cef4ecf3` | ursprüngliche Dokumentationsbasis / PR #1 | LÖSCHBAR |
| `docs/ui-contextual-command-surface-v0.2` | `95ccf8b6daf5cb0a3dd31c666ec26166263cc784` | UI-V0.2-Zwischenstand, später durch UI-01 abgelöst | LÖSCHBAR |
| `docs/v1-freeze-v2-planning` | zuletzt über PR #37 nach main übernommen | V1-Freeze-/V2-Planung | LÖSCHBAR |
| `docs/wd-01-entrypoint` | `31223a66e11bdfe2a25a97e446449722dd7c2a3c` | WD-01 Einstieg / PR #2 | LÖSCHBAR |

## 4. V1-Implementierungsbranches – final in main enthalten / löschbar

| Branch | End-SHA | Zuordnung |
|---|---|---|
| `wd-01/01-project-file` | `417882d3d5370015484b1d0126ff214f2bf52a04` | WD-01 |
| `wd-02/p0.1-end-to-end` | `45251d130704c68f687af8cd31c7574d9fcb18ab` | WD-02 / P0.1 |
| `wd-03/interaction-projects` | `e9594109a02a3f1979ed05ca6fd32eca77231da0` | WD-03 |
| `wd-04/modeling-foundations` | `2545602d9a384f8d9515e7a49c0dddbe13dc90c7` | WD-04 |
| `wd-05/precision-structure` | `2ce760718e24dc277ab2b2b894b8497a75d10cbd` | WD-05 |
| `feature/wd-06-units-large-world` | `741d424b5d253ca8bde814c24bdfacbcb01b21a3` | WD-06 |
| `feature/wd-07-fixed-views` | `dc6152e2a1b6819a2425526cad5a8caccf7e56ea` | WD-07 |
| `feature/wd-08a-sketch-line` | `f6ecd91047f0e94fd4f2d386b95f7fe25d19f580` | WD-08A |
| `feature/wd-08b-rectangle-polygon` | `871175683ee9714842f8184f1913c0caa5a8f9bd` | WD-08B |
| `feature/wd-09-extrude-base` | `4b2784fe8a57b3d89c9436728c8f35ca523ed2e3` | WD-09 |
| `feature/wd-10-material-color` | `1fc4df28bf460bc3121f8fab1cf0787768afbe96` | WD-10 |
| `feature/wd-11a-project-file-import-export` | `6b8b61ccb8747f146244cd9fd684e41734164eab` | WD-11A |
| `feature/wd-11b-glb-gltf-import-export` | `6b4c9d1df3cfe56096f28afc510c4bfcfb08ee7d` | produktiver WD-11B |
| `feature/wd-11c-selection-partial-project-merge` | `6f7e6797ddf74d5388a71dafeaa5b0d60fb6a74f` | WD-11C |
| `feature/wd-12a-sketch-editing-v1` | `27ec0ffb4f73b3fbed60fe940d4f31783f24c36f` | WD-12A |
| `feature/wd-12b-sketch-gizmo-plane-editing` | `dcf30b7f492d5b85804bdabfe2357deaeccb4087` | WD-12B |
| `feature/wd-13a-feature-operations-tree-core` | `83d14723ef7bee786570b12ba3be33c6b54085bb` | WD-13A |
| `feature/wd-13b-feature-parameters-inspector` | `fb066fd9376f402befea3c247d6ec02e3b4f3f18` | WD-13B |
| `feature/wd-14a-visibility-core` | `468db7d1b2ddfc555b7b9602549162f606ed2411` | WD-14A |
| `feature/wd-14b-locking-core` | `e8fe400cdc1f5e1e69daa8628b18613e1d6a7ea6` | WD-14B |
| `feature/wd-15a-project-lifecycle` | `cecdca0a455f58c957f2e3c9c402cb63c24d015b` | WD-15A |
| `feature/wd-15b-project-settings` | `acf449595f7d4096405340ecccb386c24af15b7b` | WD-15B |
| `feature/wd-16-viewport-reference-system` | `ec2fd895cde21c0ec46da754e0059f2ad5bff077` | WD-16 |
| `feature/wd-17-camera-object-preview` | `7eb21e277c43a4d72d9da9129a473e620f0896de` | WD-17 |
| `feature/wd-18-inspector-diagnostics` | `c4263037408ac54a2f1ca19cd59cf54bdb44bcfe` | WD-18 |
| `feature/wd-19-object-tree-scalability` | `c43dacfb02517e554927335997e9bb30653cf9de` | WD-19 |

Alle oben genannten V1-Branches sind durch spätere getestete Stände bzw. den finalen V1-main abgelöst. Die relevante Historie bleibt über Commits, PRs und dieses Audit erhalten.

## 5. Sonstige überholte Zwischenbranches – löschbar

| Branch | End-SHA | Einordnung |
|---|---|---|
| `feature/ui-01-contextual-command-surface` | `6f5b3c0c062d2c88307e1867f37546d5be959c68` | UI-01 PASS/FROZEN, über PR #17 in main |
| `feature/v1-closure-restcheck` | `c42320462e40c47db95878b26eec6cb56fde3ee8` | V1-Abschluss-Zwischenstand, später vollständig fortgeführt |
| `fix/menu-close-after-action` | `1bfaf2198364c5abeb0c867876fbb7538ec27d3d` | V1/WD-19 Menüfix, in main enthalten |
| `fix/wd-19-extrude-parent-reveal` | `4803efe056b032f6895d6e5b554228ca058c9638` | finaler V1-Regressionsfix, über PR #34 in main |

## 6. WD-11B-Sonderpfad

Branch:

`feature/wd-11b-gltf-import-export`

End-SHA:

`7227f231af643693a48312016d451da1dc89e3ac`

Dieser Branch ist **nicht** der produktive WD-11B-Pfad. Er ist ein früher alternativer/abgebrochener Ansatz und enthält sieben eigene historische Commits mit u. a.:

- `.github/workflows/wd-11b-browser.yml`
- `src/io/gltf.js`
- `src/runtime-three/imported-mesh.js`
- `tests/wd-11b-browser.mjs`
- `tests/fixtures/wd11b_triangle.gltf`

Der später praktisch getestete und fachlich freigegebene WD-11B-Pfad ist:

`feature/wd-11b-glb-gltf-import-export`

und dessen finale Funktionalität ist Bestandteil des V1-Gesamtstands.

Entscheidung:

**`feature/wd-11b-gltf-import-export` = ABANDONED ALTERNATIVE / LÖSCHBAR.**

Die SHA und der Inhalt sind in diesem Audit dokumentiert; ein zusätzlicher permanenter Archivbranch ist nicht erforderlich.

## 7. Historische offene PRs

Die gestapelten V1-PRs #18 bis #30 wurden am 30.08.2026 geschlossen, nachdem der Audit bestätigt hat, dass ihr fachlicher Inhalt im späteren getesteten V1-Gesamtstand enthalten ist.

PR #36 bleibt offen und gehört ausschließlich zum WD-20A-Testbranch.

## 8. Manuelle Löschliste

Nach diesem Audit können **alle Branches außer `main` und `feature/wd-20a-project-schema-migration`** gelöscht werden.

Das umfasst insgesamt 35 historische/überholte Branches des vor dem Audit vorhandenen 37-Branch-Bestands.

## 9. Neue Branchregel ab V2

1. `main` enthält ausschließlich kontrolliert freigegebene Stände.
2. Pro aktivem WD grundsätzlich ein eindeutig nummerierter Branch, z. B. `feature/wd-20a-...`.
3. Separater Regression-Fix trägt immer die WD-Zuordnung, z. B. `fix/wd-20a-...`.
4. Nach PASS → Merge → FROZEN wird der Arbeitsbranch gelöscht.
5. Abgebrochene Experimente werden nicht dauerhaft als unklare Feature-Branches behalten; falls historische Relevanz besteht, werden SHA und Entscheidung in der Dokumentation festgehalten.
6. GitHub Pages bleibt standardmäßig auf `main`; für Gerätetests wird nur temporär auf den einen aktiven WD-Testbranch gewechselt.

## 10. Gate

Branch-/PR-Historie: **PASS**  
Dokumentationskonsolidierung: **PASS**  
Historische Branches zum Löschen eindeutig identifiziert: **PASS**  
WD-20A-Freigabe: **NEIN – HOLD bleibt bestehen**
