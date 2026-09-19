# WD-21E – Repository Continuity / Handoff

**Stand:** 2026-09-19  
**Repository:** DrHoschi/CM3D  
**Arbeitsbranch:** `feature/wd-21d-profile-open-path-derivation`  
**Status:** IMPLEMENTED / VERIFICATION PENDING / EXACT-HEAD CI NOT EXECUTED  
**Completion / Freeze:** NOT AUTHORIZED  
**RB-03:** BLOCKED until RB-02/WD-21E closure

## 1. Zweck

Dieses Dokument ist die verbindliche Repository-Übergabe für WD-21E. Ein neuer Chat darf den WD-21E-Stand aus diesem Dokument und dem Repository rekonstruieren, ohne den bisherigen Chatverlauf als Wissensquelle zu benötigen.

WD-21D ist bereits PASS / FROZEN. WD-21E schließt innerhalb RB-02 die noch fehlende stabile logische Identität und Referenzierbarkeit abgeleiteter Profile und offener Pfade.

## 2. Verbindlicher WD-21E-Vertrag

- `ProfileId` und `PathId` sind stabile logische Identitäten, nicht Geometrie.
- Die D.1→D.5-Ableitung bleibt alleinige Geometrieautorität.
- Wiedererkennung erfolgt ausschließlich über persistente Sketch-Element-/Punktidentitäten und Topologie, niemals über geometrische Ähnlichkeit, Position oder Toleranz.
- Profile repräsentieren vollständige Regionen: Außenkontur plus Löcher.
- Offene Pfade werden aus den beteiligten stabilen Sketch-Elementidentitäten erkannt.
- Zustände: `RESOLVED`, `UNRESOLVED`, `MISSING`, `INVALID`, bestehendes `BLOCKED`.
- Kein stilles Rebinding auf geometrisch ähnliche Nachfolger.
- `StableReference`-Mapping:
  - `PROFILE`: `ownerId = sketchId`, `targetId = ProfileId`
  - `PATH`: `ownerId = sketchId`, `targetId = PathId`

Persistenz ausschließlich unter:

```
sketch.data.profileIdentities
sketch.data.pathIdentities
```

ProfileIdentity:

```js
{
  profileId: "profile_<uuid>",
  source: {
    outerElementIds: ["..."],
    holeElementIdSets: [["..."]]
  }
}
```

PathIdentity:

```js
{
  pathId: "path_<uuid>",
  source: {
    elementIds: ["..."]
  }
}
```

Element-ID-Listen sind kanonisch sortiert. Es werden keine Koordinaten, Tessellationspunkte, Flächen, Winkel, Bounding Boxes, `profileKey`, `componentKey` oder sonstige abgeleitete Geometrie persistiert.

## 3. Autorisierter Implementierungs-Scope

Produktdateien:

- `src/model/project.js`
- `src/model/sketch-topology.js`
- `src/model/sketch-profile-path-identity.js` (neu)
- `src/application/stable-reference.js`

Test-/CI-Dateien:

- `tests/wd-21e-profile-path-reference.mjs`
- `.github/workflows/wd-21e-identity-reference-foundation.yml`

Explizit außerhalb WD-21E Foundation:

- `src/application/selection-ref.js`
- `src/application/extrude.js`
- `src/application/dependency-graph.js`
- D.1–D.5-Derivationsimplementierungen
- Viewer / Object Tree / Inspector
- Sketch-Editing
- PROFILE/PATH-SelectionRef und sichtbare Profil-/Pfadselektion
- Extrude-Migration auf ProfileId/PathId
- RB-03

`SCHEMA_VERSION` bleibt `0.2.0`; kein Versionssprung ist autorisiert.

## 4. Implementierter Stand

Implementierungsbasis / vorheriger Roadmap-Handoff:
`b9f11562101f6b5a654cf07a63193535b7bed6d5`

WD-21E Implementation Head:
`85eeaa047d6787440b7e376ad3e3e13c1ec51889`

Enthaltene Implementierungscommits:

- `ac6d56143028e94fd594207352a2910621c37ed7` – Profile-/Path-Identity-Collections im Projektschema/Normalizer.
- `c1a6ce173ac6a882757d5b09e1973618d8e125f6` – strukturelle Validierung der Identity-Maps.
- `8e4f08178dfb12148ae8479f22ea3423944b5eaf` – Profile-/Path-Identity-Erzeugung und Wiedererkennung.
- `0ea9c60c229fec9a954fa92ca32af63c53caa3ac` – `PROFILE`/`PATH` in StableReference.
- `fba84b2b7b17607b36e4f213acdd4adfcd7d879b` – zentraler WD-21E-Vertragstest.
- `85eeaa047d6787440b7e376ad3e3e13c1ec51889` – erster WD-21E-CI-Gate.

Scope-Diff gegen `b9f1156…`: ausschließlich die vier autorisierten Produktdateien plus WD-21E-Test und WD-21E-Workflow. Keine festgestellte Produkt-Scope-Verletzung.

## 5. Verification / CI Evidence

Das Implementation Verification / Contract / Regression Gate ist **noch nicht PASS**.

Der erste WD-21E-Workflow enthielt nur WD-20A, WD-20C und WD-21E. Deshalb wurde innerhalb desselben Verification Gates ausschließlich die CI-Evidence erweitert.

CI-Evidence-Correction Head:

`18e1536b9f6f6ef7edd3fc1527176fef1870ffb8`

Dieser reine CI-Commit erweitert den WD-21E-Gate um die vollständige eingefrorene Regressionskette:

`WD-20A → WD-20C → A.2 → A.3 → B.2 → B.3 → C.2 → C.3 → C.4 → C.5 → C.6 → C.7 → C.8 → C.8-R1 → C.8-R2 → D.1 → D.2 → D.3 → D.4 → D.5 → D.6 → WD-21E`

Für exakt `18e1536…` wurden bei der letzten Prüfung **0 Workflow-Runs und 0 Combined-Status-Checks** geliefert. Damit fehlt weiterhin die tatsächliche Exact-Head-CI-Evidence.

Aktueller Gate-Status:

**WD-21E – Implementation Verification / Contract / Regression Gate: PENDING / EXACT-HEAD CI NOT EXECUTED / 1 BLOCKER**

Der Blocker ist derzeit ausschließlich die fehlende CI-Ausführung/Evidence. Das ist kein bestätigter Produktfehler.

## 6. Nächster ausschließlich zulässiger Schritt

**WD-21E – Automatic CI Trigger Correction**

Ziel:

`Push → automatische CI → vollständige Regression → auswertbares Ergebnis`

Dabei ausschließlich GitHub-Actions-Trigger/CI-Infrastruktur prüfen und korrigieren. `workflow_dispatch` darf als manueller Notfallpfad bestehen bleiben, darf aber nicht der normale Entwicklungsweg sein.

Danach ist ein kleiner reiner CI-Commit als automatischer Trigger-Test zulässig. Der dadurch entstehende neue Exact Head wird vollständig ausgewertet.

Nicht zulässig in diesem Schritt:

- Produktcodeänderungen
- Änderung des fachlichen WD-21E-Vertrags
- Selection-/Viewer-/Inspector-/Extrude-Arbeit
- RB-03
- Completion / Evidence / Freeze

## 7. Abschlussregel

Erst wenn der automatisch gestartete Exact-Head-Run die vollständige oben definierte Kette erfolgreich ausführt und die Contract-/Scope-Prüfung weiterhin 0 Blocker ergibt, darf WD-21E als **PASS / 0 BLOCKER** bewertet werden.

Erst danach darf separat **WD-21E – Completion / Evidence / Freeze Gate** autorisiert werden.

Bis dahin gilt:

**WD-21E NOT FROZEN. RB-03 NOT AUTHORIZED.**
