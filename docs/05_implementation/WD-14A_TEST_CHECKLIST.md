# WD-14A – Device-Testcheckliste

**Zielgerät:** iPad / Safari / GitHub Pages  
**Status:** DEVICE TEST REQUIRED

## Kernprüfung

- [ ] Build zeigt `WD-14A`.
- [ ] Mindestens zwei sichtbare 3D-Objekte anlegen oder vorhandenes Projekt laden.
- [ ] Im Objektbaum besitzt jedes normale Objekt einen Sichtbarkeitsschalter.
- [ ] Sichtbares Objekt zeigt `◉`.
- [ ] `◉` antippen: genau dieses Objekt verschwindet unmittelbar aus dem 3D-Viewport.
- [ ] Das ausgeblendete Objekt bleibt im Objektbaum sichtbar/erreichbar und zeigt `○`.
- [ ] `○` antippen: dasselbe Objekt erscheint wieder.
- [ ] Ein-/Ausblenden verändert nicht versehentlich die aktive Auswahl eines anderen Objekts.
- [ ] Undo nach Ausblenden stellt das Objekt wieder sichtbar her.
- [ ] Redo blendet es wieder aus.
- [ ] Projekt mit mindestens einem ausgeblendeten Objekt speichern.
- [ ] Seite neu laden und Projekt laden.
- [ ] Das zuvor ausgeblendete Objekt bleibt ausgeblendet und kann im Baum wieder eingeblendet werden.
- [ ] Skizze testen: Sichtbarkeitsschalter blendet die Skizzenvisualisierung ein/aus.
- [ ] Extrusion testen: Sichtbarkeitsschalter blendet die Extrusionsgeometrie ein/aus, ohne die Operation zu löschen.
- [ ] Bestehende WD-13A/B-Funktionen bleiben intakt: Operationsbaum, Extrusionsauswahl und Feature-Parameter funktionieren weiterhin.

## PASS-Kriterium

Alle Punkte bestanden, keine Regression in WD-13A/B. Erst danach `WD-14A = PASS / FROZEN`.
