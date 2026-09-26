/**
 * Browser-local Marrowline conversation library.
 * IndexedDB retains full threads and exact provider-authored message records.
 * SessionStorage is only a one-time migration source, not ongoing authority.
 */
export const MARROWLINE_THREADS_SCHEMA = 'td613.marrowline.local-threads/v1';
export const MARROWLINE_THREADS_DB = 'td613-marrowline-conversations-v1';
const STORE = 'threads';
const META = 'meta';
const LEGACY_KEY = 'TD613_KHONAPOLIT_TERMINAL_SESSION_V2';
const MIGRATION_KEY = 'legacy-session-migrated';
const activeKey = 'td613-marrowline-active-thread-v1';
const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
const iso = () => new Date().toISOString();
const initial = () => ({ messages: [], lastReceipt: null, pendingTask: '', lastFailure: null, conversationTitle: 'The speaking grove', draft: '' });
function id(root) {
  return root.crypto?.randomUUID?.() || 'thread-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
}
function transaction(db, names, mode, work) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(names, mode);
    let output;
    tx.oncomplete = () => resolve(output);
    tx.onerror = () => reject(tx.error || new Error('Conversation storage failed'));
    tx.onabort = () => reject(tx.error || new Error('Conversation storage aborted'));
    try { output = work(tx); } catch (error) { tx.abort(); reject(error); }
  });
}
function request(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Conversation request failed'));
  });
}
export function openMarrowlineThreadDB(root = window) {
  if (!root.indexedDB) return Promise.reject(new Error('IndexedDB is unavailable'));
  return new Promise((resolve, reject) => {
    const opening = root.indexedDB.open(MARROWLINE_THREADS_DB, 1);
    opening.onupgradeneeded = () => {
      const db = opening.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(META)) db.createObjectStore(META);
    };
    opening.onsuccess = () => resolve(opening.result);
    opening.onerror = () => reject(opening.error || new Error('Conversation database unavailable'));
    opening.onblocked = () => reject(new Error('Conversation database upgrade blocked'));
  });
}
export function threadFromState(root, state, { parentId = null, branchOf = null, title = null } = {}) {
  const time = iso();
  return {
    schema: MARROWLINE_THREADS_SCHEMA, id: id(root), parentId, branchOf,
    createdAt: time, updatedAt: time,
    ...clone(initial()), ...clone(state),
    conversationTitle: title || state.conversationTitle || 'The speaking grove',
    messages: clone(state.messages || [])
  };
}
export async function createMarrowlineThreadLibrary(root = window) {
  const db = await openMarrowlineThreadDB(root);
  const put = async record => {
    const value = clone({ ...record, schema: MARROWLINE_THREADS_SCHEMA, updatedAt: iso() });
    await transaction(db, STORE, 'readwrite', tx => tx.objectStore(STORE).put(value));
    return value;
  };
  const get = threadId => request(db.transaction(STORE, 'readonly').objectStore(STORE).get(threadId));
  const all = async () => {
    const values = await request(db.transaction(STORE, 'readonly').objectStore(STORE).getAll());
    return values.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  };
  const remove = async threadId => {
    await transaction(db, STORE, 'readwrite', tx => tx.objectStore(STORE).delete(threadId));
  };
  const getMeta = key => request(db.transaction(META, 'readonly').objectStore(META).get(key));
  const setMeta = (key, value) => transaction(db, META, 'readwrite', tx => tx.objectStore(META).put(value, key));
  const create = async (state = initial(), args = {}) => put(threadFromState(root, state, args));
  const branch = async (parent, responseIndex) => {
    if (!parent || !Array.isArray(parent.messages)) throw new Error('Original conversation unavailable');
    const model = parent.messages[responseIndex];
    if (responseIndex !== 1 || parent.messages[0]?.role !== 'user' || model?.role !== 'model'
      || model.receipt?.provider?.completion?.complete === false)
      throw new Error('A complete first Marrowline response is required to branch');
    return create({
      ...initial(),
      messages: clone(parent.messages.slice(0, responseIndex + 1)),
      lastReceipt: clone(model.receipt || null),
      conversationTitle: parent.conversationTitle + ' · Branch'
    }, { parentId: parent.id, branchOf: responseIndex });
  };
  const migrate = async () => {
    const migrated = await getMeta(MIGRATION_KEY);
    if (migrated) return null;
    let legacy;
    try { legacy = JSON.parse(root.sessionStorage.getItem(LEGACY_KEY) || 'null'); } catch {}
    let record = null;
    if (legacy && (legacy.messages?.length || legacy.pendingTask)) {
      record = await create({ ...initial(), ...legacy });
    }
    await setMeta(MIGRATION_KEY, true);
    if (record) {
      try { root.sessionStorage.removeItem(LEGACY_KEY); } catch {}
    }
    return record;
  };
  return Object.freeze({
    get, all, put, create, branch, remove, migrate,
    getActiveId: () => { try { return root.localStorage.getItem(activeKey); } catch { return null; } },
    setActiveId: value => { try { if (value) root.localStorage.setItem(activeKey, value); else root.localStorage.removeItem(activeKey); } catch {} },
    close: () => db.close()
  });
}
