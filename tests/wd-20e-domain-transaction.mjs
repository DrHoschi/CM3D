import assert from 'node:assert/strict';
import { installDomainTransactionBoundary, wrapDomainMutation } from '../src/application/domain-transaction.js';

const store = {
  project:{ value:0, recomputed:0 },
  history:[],
  snapshot(){ return structuredClone(this.project); },
  pushHistory(before,label){ this.history.push({ before:structuredClone(before), after:this.snapshot(), label }); }
};

installDomainTransactionBoundary(store);

store.mutateAndRecompute = function () {
  this.project.value += 1;
  this.project.recomputed += 1;
  this.pushHistory({ ignored:true }, 'Atomare Änderung');
  this.pushHistory({ ignored:true }, 'Darf keinen zweiten Eintrag erzeugen');
  return true;
};
assert.equal(wrapDomainMutation(store, 'mutateAndRecompute'), true);
assert.equal(store.mutateAndRecompute(), true);
assert.equal(store.project.value, 1);
assert.equal(store.project.recomputed, 1);
assert.equal(store.history.length, 1);
assert.equal(store.history[0].label, 'Atomare Änderung');
assert.deepEqual(store.history[0].before, { value:0, recomputed:0 });
assert.deepEqual(store.history[0].after, { value:1, recomputed:1 });

store.noop = function () { return false; };
wrapDomainMutation(store, 'noop', 'No-op');
assert.equal(store.noop(), false);
assert.equal(store.history.length, 1);

store.failing = function () {
  this.project.value = 99;
  throw new Error('boom');
};
wrapDomainMutation(store, 'failing', 'Fehlerhafte Änderung');
assert.throws(() => store.failing(), /boom/);
assert.equal(store.project.value, 1);
assert.equal(store.history.length, 1);

console.log('WD-20E.3 Domain Transaction Boundary regression: PASS');
