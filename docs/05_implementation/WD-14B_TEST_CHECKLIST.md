# WD-14B – Device-Testcheckliste

**Zielgerät:** iPad / Safari / GitHub Pages  
**Status:** DEVICE TEST REQUIRED

## Kernprüfung

- [ ] Build zeigt `WD-14B`.
- [ ] Mindestens zwei Objekte anlegen oder vorhandenes Projekt laden.
- [ ] Im Objektbaum besitzt jedes normale Objekt einen Sperrschalter.
- [ ] Entsperrtes Objekt zeigt `🔓`.
- [ ] Objekt auswählen und über `🔓` sperren: Anzeige wechselt auf `🔒`.
- [ ] Das gesperrte Objekt bleibt sichtbar und auswählbar.
- [ ] Beim gesperrten Objekt erscheint kein nutzbarer Transform-Gizmo.
- [ ] Move / Rotate / Scale im Viewport kann das gesperrte Objekt nicht verändern.
- [ ] Transform-, Pivot-, Name- und Geometriefelder im Inspector können das gesperrte Objekt nicht verändern.
- [ ] Löschen eines gesperrten Objekts ist blockiert.
- [ ] Sichtbarkeit `◉/○` bleibt auch bei gesperrtem Objekt bedienbar.
- [ ] `🔒` antippen: Objekt wird wieder entsperrt und ist normal bearbeitbar.
- [ ] Undo nach Sperren stellt den entsperrten Zustand wieder her.
- [ ] Redo sperrt das Objekt erneut.
- [ ] Projekt mit mindestens einem gesperrten Objekt speichern.
- [ ] Seite neu laden und Projekt laden.
- [ ] Das zuvor gesperrte Objekt bleibt gesperrt und kann im Baum entsperrt werden.
- [ ] Skizze sperren: Punkt-/Linienbearbeitung und Löschen der Skizzenelemente sind blockiert.
- [ ] Extrusion sperren: Tiefe/Richtung im WD-13B-Inspector können nicht geändert werden.
- [ ] Bestehende WD-14A-Sichtbarkeit sowie WD-13A/B-Operationsbaum/Extrusionsparameter funktionieren nach Entsperren weiterhin.

## PASS-Kriterium

Alle Kernpunkte bestanden, keine Regression in WD-13A/B oder WD-14A. Erst danach `WD-14B = PASS / FROZEN`.
