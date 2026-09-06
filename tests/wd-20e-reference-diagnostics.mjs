import assert from 'node:assert/strict';
import { projectReferenceDiagnostics } from '../src/ui/inspector-diagnostics.js';

const objects = {
  extrude_ready: {
    objectId:'extrude_ready',
    type:'feature.extrude',
    name:'Ready Extrude',
    data:{ sourceSketchRef:{ targetKind:'SKETCH', ownerId:'sketch_a', targetId:'sketch_a' } },
    extensions:{
      sourceSketchReference:{ state:'RESOLVED', diagnostics:[] },
      recomputeState:{ state:'READY', upstreamState:null, diagnostics:[] }
    }
  },
  extrude_missing: {
    objectId:'extrude_missing',
    type:'feature.extrude',
    name:'Missing Extrude',
    data:{ sourceSketchRef:{ targetKind:'SKETCH', ownerId:'gone', targetId:'gone' } },
    extensions:{
      sourceSketchReference:{ state:'MISSING', diagnostics:[{code:'TARGET_MISSING',message:'Ziel fehlt.'}] },
      recomputeState:{ state:'BLOCKED', upstreamState:'MISSING', diagnostics:[{code:'UPSTREAM_MISSING',message:'Berechnung blockiert.'}] }
    }
  },
  extrude_invalid: {
    objectId:'extrude_invalid',
    type:'feature.extrude',
    data:{ sourceSketchRef:{ targetKind:'SKETCH', ownerId:'box_a', targetId:'box_a' } },
    extensions:{
      sourceSketchReference:{ state:'INVALID', diagnostics:[{code:'TARGET_KIND_INVALID',message:'Falscher Zieltyp.'}] },
      recomputeState:{ state:'BLOCKED', upstreamState:'INVALID', diagnostics:[{code:'UPSTREAM_INVALID',message:'Berechnung blockiert.'}] }
    }
  },
  extrude_unresolved: {
    objectId:'extrude_unresolved',
    type:'feature.extrude',
    data:{ sourceSketchRef:{ targetKind:'SKETCH', ownerId:'sketch_b', targetId:'sketch_b' } },
    extensions:{ sourceSketchReference:{ state:'UNRESOLVED', diagnostics:[] } }
  },
  box_a: { objectId:'box_a', type:'primitive.box', name:'Box' }
};

const store = { project:{ scene:{ objects } } };
const projection = projectReferenceDiagnostics(store);

assert.deepEqual(projection.map(item => item.objectId), [
  'extrude_invalid',
  'extrude_missing',
  'extrude_ready',
  'extrude_unresolved'
]);

const ready = projection.find(item => item.objectId === 'extrude_ready');
assert.equal(ready.referenceState, 'RESOLVED');
assert.equal(ready.recomputeState, 'READY');
assert.equal(ready.upstreamState, null);

const missing = projection.find(item => item.objectId === 'extrude_missing');
assert.equal(missing.sourceReference.targetId, 'gone');
assert.equal(missing.referenceState, 'MISSING');
assert.equal(missing.recomputeState, 'BLOCKED');
assert.equal(missing.upstreamState, 'MISSING');
assert.equal(missing.referenceDiagnostics[0].code, 'TARGET_MISSING');
assert.equal(missing.recomputeDiagnostics[0].code, 'UPSTREAM_MISSING');

const invalid = projection.find(item => item.objectId === 'extrude_invalid');
assert.equal(invalid.referenceState, 'INVALID');
assert.equal(invalid.recomputeState, 'BLOCKED');
assert.equal(invalid.upstreamState, 'INVALID');

const unresolved = projection.find(item => item.objectId === 'extrude_unresolved');
assert.equal(unresolved.referenceState, 'UNRESOLVED');
assert.equal(unresolved.recomputeState, null);

// Projection is read-only: callers cannot mutate the authoritative domain state.
projection[0].sourceReference.targetId = 'tampered';
projection[1].referenceDiagnostics[0].code = 'TAMPERED';
assert.equal(objects.extrude_invalid.data.sourceSketchRef.targetId, 'box_a');
assert.equal(objects.extrude_missing.extensions.sourceSketchReference.diagnostics[0].code, 'TARGET_MISSING');

console.log('WD-20E.4 Reference Diagnostic Projection regression: PASS');
