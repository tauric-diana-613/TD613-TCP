export const ASH_OPERATION_COORDINATOR_VERSION = 'td613.ash-keep.operation-coordinator/v0.1';

const DB_NAME = 'td613-ash-keep';
const DB_VERSION = 2;
const STORE_NAME = 'operations';
const PATCH_MARK = Symbol.for('td613.ash-operation-coordinator.patched');
const LEASE_MS = 30_000;
const RENEW_MS = 5_000;
const WAIT_MS = 35;
const ownerId = crypto.randomUUID();
const activeNames = new Set();

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Ash operation coordinator database upgrade was blocked.'));
  });
}

async function tryAcquire(name, operationId) {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const leaseId = `coordinator:${name}`;
      let acquired = false;
      const request = store.get(leaseId);
      request.onsuccess = () => {
        const current = request.result?.value || request.result || null;
        if (!current || current.owner_id === ownerId || Number(current.expires_at || 0) <= Date.now()) {
          acquired = true;
          store.put({
            id: leaseId,
            value: {
              owner_id: ownerId,
              operation_id: operationId,
              name,
              acquired_at: new Date().toISOString(),
              expires_at: Date.now() + LEASE_MS
            }
          });
        }
      };
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => resolve(acquired);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error(`Ash operation lease aborted: ${name}`));
    });
  } finally {
    db.close();
  }
}

async function acquire(name, operationId, timeoutMs = LEASE_MS) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() <= deadline) {
    if (await tryAcquire(name, operationId)) return;
    await wait(WAIT_MS);
  }
  throw new Error(`Ash operation remained active in another tab: ${name}`);
}

async function renew(name, operationId) {
  const db = await openDb();
  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const leaseId = `coordinator:${name}`;
      const request = store.get(leaseId);
      request.onsuccess = () => {
        const current = request.result?.value || request.result || null;
        if (current?.owner_id === ownerId && current?.operation_id === operationId) {
          store.put({ id: leaseId, value: { ...current, expires_at: Date.now() + LEASE_MS } });
        }
      };
      request.onerror = () => reject(request.error);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error(`Ash operation lease renewal aborted: ${name}`));
    });
  } finally {
    db.close();
  }
}

async function release(name, operationId) {
  const db = await openDb();
  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const leaseId = `coordinator:${name}`;
      const request = store.get(leaseId);
      request.onsuccess = () => {
        const current = request.result?.value || request.result || null;
        if (current?.owner_id === ownerId && current?.operation_id === operationId) store.delete(leaseId);
      };
      request.onerror = () => reject(request.error);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error(`Ash operation lease release aborted: ${name}`));
    });
  } finally {
    db.close();
  }
}

async function runWithLease(name, callback, lock) {
  if (activeNames.has(name)) return callback(lock);
  const operationId = `ashop_${crypto.randomUUID()}`;
  await acquire(name, operationId);
  activeNames.add(name);
  const renewal = setInterval(() => renew(name, operationId).catch(console.error), RENEW_MS);
  try {
    return await callback(lock);
  } finally {
    clearInterval(renewal);
    activeNames.delete(name);
    await release(name, operationId);
  }
}

export function installAshOperationCoordinator(doc = globalThis.document, host = globalThis.window) {
  const manager = host?.navigator?.locks;
  if (!doc?.documentElement || !manager?.request || manager[PATCH_MARK]) return false;
  const nativeRequest = manager.request.bind(manager);
  const coordinatedRequest = function (name, options, callback) {
    const hasOptions = typeof options !== 'function';
    const actualOptions = hasOptions ? options : {};
    const actualCallback = hasOptions ? callback : options;
    if (typeof actualCallback !== 'function') throw new TypeError('Ash operation callback is required.');
    if (!String(name).startsWith('td613:ash:')) return nativeRequest(name, actualOptions, actualCallback);
    return nativeRequest(name, actualOptions, lock => runWithLease(String(name), actualCallback, lock));
  };
  Object.defineProperty(manager, 'request', {
    configurable: true,
    writable: true,
    value: coordinatedRequest
  });
  Object.defineProperty(manager, PATCH_MARK, { value: true });
  doc.documentElement.dataset.ashOperationCoordinator = ASH_OPERATION_COORDINATOR_VERSION;
  host.__td613AshOperationCoordinator = Object.freeze({
    version: ASH_OPERATION_COORDINATOR_VERSION,
    owner_id: ownerId,
    lease_ms: LEASE_MS,
    reentrant_names: activeNames
  });
  return true;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  installAshOperationCoordinator(document, window);
}
