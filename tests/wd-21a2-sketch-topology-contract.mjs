import assert from 'node:assert/strict';
import {
  areSketchEndpointsTopologicallyConnected,
  getSketchElement,
  getSketchElementPointIds,
  sketchElementsShareTopologyPoint,
  validateSketchTopology
} from '../src/model/sketch-topology.js';
import { ReferenceState, ReferenceTargetKind, createStableReference, resolveStableReference } from '../src/application/stable-reference.js';
import { SelectionTargetKind, createSelectionRef, resolveSelectionSketchTarget } from '../src/application/selection-ref.js';

const sketch = {
  objectId: 'obj_sketch',
  type: 'sketch',
  data: {
    plane: 'localXY',
    points: {
      pt_a: { pointId: 'pt_a', x: 0, y: 0 },
      pt_b: { pointId: 'pt_b', x: 1, y: 0 },
      pt_c: { pointId: 'pt_c', x: 1, y: 1 },
      pt_same_coords: { pointId: 'pt_same_coords', x: 1, y: 0 }
    },
    lines: {
      ln_1: { lineId: 'ln_1', startPointId: 'pt_a', endPointId: 'pt_b' },
      ln_2: { lineId: 'ln_2', startPointId: 'pt_b', endPointId: 'pt_c' },
      ln_3: { lineId: 'ln_3', startPointId: 'pt_same_coords', endPointId: 'pt_c' }
    }
  }
};

const store = { getObject: id => id === sketch.objectId ? sketch : null };

assert.equal(validateSketchTopology(sketch).valid, true);
assert.equal(getSketchElement(sketch, 'ln_1')?.kind, 'line');
assert.deepEqual(getSketchElementPointIds(sketch, 'ln_1'), ['pt_a', 'pt_b']);
assert.equal(sketchElementsShareTopologyPoint(sketch, 'ln_1', 'ln_2'), true);
assert.equal(sketchElementsShareTopologyPoint(sketch, 'ln_1', 'ln_3'), false, 'equal coordinates must not imply topology');
assert.equal(areSketchEndpointsTopologicallyConnected('pt_b', 'pt_b'), true);
assert.equal(areSketchEndpointsTopologicallyConnected('pt_b', 'pt_same_coords'), false);

const legacyElementRef = createStableReference(ReferenceTargetKind.SKETCH_ELEMENT, sketch.objectId, 'ln_1');
assert.equal(resolveStableReference(store, legacyElementRef).state, ReferenceState.RESOLVED, 'legacy element refs without subtype stay compatible');
const typedElementRef = createStableReference(ReferenceTargetKind.SKETCH_ELEMENT, sketch.objectId, 'ln_1', 'line');
assert.equal(resolveStableReference(store, typedElementRef).state, ReferenceState.RESOLVED);
const missingElementRef = createStableReference(ReferenceTargetKind.SKETCH_ELEMENT, sketch.objectId, 'ln_missing', 'line');
assert.equal(resolveStableReference(store, missingElementRef).state, ReferenceState.MISSING);

const selectionRef = createSelectionRef(SelectionTargetKind.SKETCH_ELEMENT, sketch.objectId, 'ln_2', 'line');
assert.equal(resolveSelectionSketchTarget(store, selectionRef)?.kind, 'line');
const pointSelectionRef = createSelectionRef(SelectionTargetKind.SKETCH_POINT, sketch.objectId, 'pt_b');
assert.equal(resolveSelectionSketchTarget(store, pointSelectionRef)?.kind, 'point');

const invalidSketch = structuredClone(sketch);
invalidSketch.data.lines.ln_1.endPointId = 'pt_missing';
assert.equal(validateSketchTopology(invalidSketch).valid, false);

console.log('WD-21A.2 sketch topology contract regression: PASS');
