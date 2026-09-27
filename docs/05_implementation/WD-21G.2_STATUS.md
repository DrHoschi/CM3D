# WD-21G.2 – PROFILE/PATH Consumer / Feature Binding Foundation

Stand: 2026-09-27

**PASS / FROZEN / 0 BLOCKER**

## Freeze-Baseline

Funktionaler Produkt-/Regression-Freeze:

`eb0713035f9e71fd4a85aabd72d67b617beb991d`

Branch: `feature/WD-21G.2-profile-path-consumer-binding`

Die Completion-/Evidence-Dokumentation nach diesem Commit verändert die getestete funktionale Freeze-Baseline nicht.

## Autorisierte Basis

`main = b1773a25cee7400cc4a041f61fc6b740786d3970`

WD-21G.2 wurde ausschließlich von dieser Basis aus umgesetzt.

## Scope / Vertrag

WD-21G.2 führt ausschließlich die persistente Consumer-Binding-Foundation für bereits vorhandene PROFILE-/PATH-Identitäten ein.

Kanonischer persistenter Vertrag am Consumer:

`data.sourceRef = { targetKind: "PROFILE" | "PATH", ownerId: <SketchId>, targetId: <ProfileId | PathId> }`

`sourceRef` ist die einzige persistente Binding-Autorität. Es werden keine Geometrie-Signaturen, Indizes, kopierten Source-Elemente oder Fallback-Ziele als zweite Binding-Autorität eingeführt.

Die Consumer-Bindings werden über `declaredFeatureConsumerDependencies(store)` in die bereits vorhandene WD-21F-Dependency-Foundation projiziert. WD-21F bleibt alleinige Autorität für StableReference-Auflösung, Dependency-Graph, Zustände und Traversal. Es gibt keinen zweiten Graphen, Resolver oder Recompute-Mechanismus.

Zustandsvertrag:

- RESOLVED → Consumer READY / Dependency verwendbar.
- MISSING → Consumer BLOCKED; kein Ersatz-Ziel.
- INVALID → Consumer BLOCKED; keine veraltete Geometrie als Binding-Autorität.
- UNRESOLVED → Consumer BLOCKED; keine heuristische Auswahl.
- Wird dieselbe persistente Identity wieder eindeutig RESOLVED, wird der Consumer wieder READY.

Die Projektvalidierung prüft ausschließlich die persistente Struktur des Consumer-`sourceRef`. Eine aktuell nicht auflösbare PROFILE-/PATH-Identity bleibt speicher- und ladefähig; MISSING/INVALID/UNRESOLVED sind kontrollierte Laufzeitzustände und keine Schemafehler.

## Scope-Grenze

Nicht Bestandteil von WD-21G.2 sind:

- Umbau oder Migration des bestehenden Extrude.
- neue Extrude-, Multi-Profile-, Thin-Extrude-, Sweep-, Revolve- oder Loft-Funktionalität.
- neue sichtbare Modellierfunktion oder neue Selection-UI.
- Änderungen an Profile-/Path-Derivation oder Identity Recognition.
- ein zweiter Dependency-/Reference-/Recompute-Mechanismus.
- heuristisches oder stilles Rebinding.

Insbesondere blieben `src/application/dependency-graph.js`, `src/application/extrude.js`, `src/ui/sketch-editing.js` und `src/runtime-three/extrude.js` unverändert.

## Implementation Evidence

Exact-Diff der funktionalen Freeze-Baseline gegen `main = b1773a25cee7400cc4a041f61fc6b740786d3970`:

- 5 Commits voraus.
- 0 Commits zurück.
- Änderungen ausschließlich in:
  - `src/application/feature-consumer-binding.js`
  - `src/model/project.js`
  - `tests/wd-21g2-profile-path-consumer-binding.mjs`
  - `.github/workflows/wd-21e-identity-reference-foundation.yml`

Der synthetische Regressionstest verwendet einen `feature.synthetic-profile-consumer` und einen `feature.synthetic-path-consumer`, ohne Renderer, UI oder konkrete Modellierfunktion.

Nachgewiesen werden:

1. exaktes persistentes PROFILE-Binding,
2. exaktes persistentes PATH-Binding,
3. initial RESOLVED / READY,
4. Geometrieänderung bei erhaltener Identity bleibt RESOLVED,
5. MISSING → BLOCKED,
6. INVALID → BLOCKED,
7. UNRESOLVED → BLOCKED,
8. kein Silent Rebinding auf eine andere Identity,
9. Wiederherstellung derselben Identity → RESOLVED / READY,
10. Save → Reload erhält `sourceRef` strukturell,
11. nicht auflösbare Identity bleibt projektdateiseitig valide,
12. PROFILE und PATH verwenden denselben generischen Consumer-Vertrag.

## Exact-Head CI / Regression Evidence

GitHub Actions Run `36266544639`, Attempt 1, wurde als Push-Run exakt gegen

`eb0713035f9e71fd4a85aabd72d67b617beb991d`

ausgeführt und endete:

**completed / success**

Der Job `identity-reference-foundation` war vollständig SUCCESS. Sämtliche ausgeführten Regressionen von WD-20A über WD-21G.1 blieben grün. Der neue Schritt

`Run WD-21G.2 profile path consumer binding regression`

war ebenfalls SUCCESS und protokollierte:

`WD-21G.2 PROFILE/PATH Consumer Binding Foundation regression: PASS`

Damit sind sowohl der neue WD-21G.2-Vertrag als auch der bestehende StableReference-/Dependency-/Sketch-/Derivation-/Identity-Unterbau gemeinsam gegen denselben Exact Head nachgewiesen.

## Abschluss

WD-21G.2 ist **PASS / FROZEN / 0 BLOCKER**.

Der funktionale Freeze bleibt `eb0713035f9e71fd4a85aabd72d67b617beb991d`. Der nachfolgende Dokumentationscommit ergänzt ausschließlich Completion-/Evidence-/Freeze-Dokumentation.

Eine Integration nach `main` ist durch diesen Gate ausdrücklich noch nicht autorisiert.
