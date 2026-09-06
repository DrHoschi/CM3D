export function installDomainTransactionBoundary(store) {
  if (!store || typeof store.snapshot !== 'function' || typeof store.pushHistory !== 'function') {
    throw new Error('DomainTransaction requires a compatible store.');
  }
  if (typeof store.runDomainTransaction === 'function') return store.runDomainTransaction;

  let active = false;
  store.runDomainTransaction = (label, operation) => {
    if (typeof operation !== 'function') throw new Error('DomainTransaction requires an operation.');
    if (active) return operation();

    const before = store.snapshot();
    const originalPushHistory = store.pushHistory;
    let historyCommitted = false;
    let effectiveLabel = label || null;
    active = true;

    store.pushHistory = (_innerBefore, innerLabel) => {
      if (historyCommitted) return false;
      historyCommitted = true;
      effectiveLabel ||= innerLabel || 'Änderung';
      originalPushHistory.call(store, before, effectiveLabel);
      return true;
    };

    try {
      const result = operation();
      if (result === false && !historyCommitted) return false;
      if (!historyCommitted) {
        historyCommitted = true;
        originalPushHistory.call(store, before, effectiveLabel || 'Änderung');
      }
      return result;
    } catch (error) {
      store.project = structuredClone(before);
      throw error;
    } finally {
      store.pushHistory = originalPushHistory;
      active = false;
    }
  };

  return store.runDomainTransaction;
}

export function wrapDomainMutation(store, methodName, label = null) {
  if (!store || typeof store.runDomainTransaction !== 'function') {
    throw new Error('DomainTransaction boundary must be installed before wrapping mutations.');
  }
  const original = store[methodName];
  if (typeof original !== 'function') return false;
  if (original.__cm3dDomainTransactionWrapped) return true;

  const wrapped = function (...args) {
    return store.runDomainTransaction(label, () => original.apply(store, args));
  };
  Object.defineProperty(wrapped, '__cm3dDomainTransactionWrapped', { value: true });
  store[methodName] = wrapped;
  return true;
}
