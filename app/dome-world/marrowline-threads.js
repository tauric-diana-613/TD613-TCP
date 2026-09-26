/**
 * Marrowline's browser-local conversation archive.
 * IndexedDB is the primary store; localStorage is a bounded fallback if IDB is
 * unavailable. Neither is an account, backup, or cross-device sync service.
 * Exact provider text and receipts are copied, never regenerated on branching.
 */
export const MARROWLINE_THREADS_SCHEMA = 'td613.marrowline.local-threads/v1';
export const MARROWLINE_THREADS_DB = 'td613-marrowline-conversations-v1';
const STORE = 'threads';
const LEGACY_KEY = 'TD613_KHONAPOLIT_TERMINAL_SESSION_V2';
const LEGACY_ID_KEY = 'TD613_MARROWLINE_LEGACY_IMPORT_ID_V1';
const FALLBACK_KEY = 'TD613_MARROWLINE_LOCAL_THREADS_V1';
const ACTIVE_KEY = 'td613-marrowline-active-thread-v1';
const copy = value => value == null ? value : JSON.parse(JSON.stringify(value));
const timestamp = () => new Date().toISOString();
const empty = () => ({ messages: [], lastReceipt: null, pendingTask: '', lastFailure: null, conversationTitle: 'The speaking grove', draft: '' });
function newId(root) {
  return root.crypto?.randomUUID?.() || 'thread-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
}
function request(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Conversation storage request failed'));
  });
}
function writeTransaction(db, action) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Conversation write failed'));
    tx.onabort = () => reject(tx.error || new Error('Conversation write aborted'));
    try { action(tx.objectStore(STORE)); } catch (error) { try { tx.abort(); } catch {} reject(error); }
  });
}
export function openMarrowlineThreadDB(root = window) {
  if (!root.indexedDB) return Promise.reject(new Error('IndexedDB unavailable'));
  return new Promise((resolve, reject) => {
    const opening = root.indexedDB.open(MARROWLINE_THREADS_DB, 1);
    opening.onupgradeneeded = () => {
      const db = opening.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    opening.onsuccess = () => {
      const db = opening.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };
    opening.onerror = () => reject(opening.error || new Error('Conversation database unavailable'));
    opening.onblocked = () => reject(new Error('Conversation database upgrade blocked'));
  });
}
function indexedAdapter(db) {
  return {
    kind: 'indexeddb',
    get: id => id ? request(db.transaction(STORE, 'readonly').objectStore(STORE).get(id)) : Promise.resolve(null),
    all: () => request(db.transaction(STORE, 'readonly').objectStore(STORE).getAll()),
    put: async record => { await writeTransaction(db, store => store.put(copy(record))); return copy(record); },
    remove: id => writeTransaction(db, store => store.delete(id)),
    close: () => db.close()
  };
}
function fallbackAdapter(root) {
  // Opening the fallback tests writability instead of pretending private-mode
  // storage succeeds merely because the localStorage property exists.
  const storage = root.localStorage;
  const probe = FALLBACK_KEY + ':probe';
  storage.setItem(probe, '1'); storage.removeItem(probe);
  const read = () => {
    const raw = storage.getItem(FALLBACK_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Error('Conversation archive is unreadable');
    return parsed;
  };
  const write = records => storage.setItem(FALLBACK_KEY, JSON.stringify(records));
  return {
    kind: 'localstorage-fallback',
    get: async id => id ? copy(read()[id] || null) : null,
    all: async () => Object.values(read()).map(copy),
    put: async record => { const records = read(); records[record.id] = copy(record); write(records); return copy(record); },
    remove: async id => { const records = read(); delete records[id]; write(records); },
    close: () => {}
  };
}
export function threadFromState(root, state = empty(), { parentId = null, branchOf = null, title = null } = {}) {
  const time = timestamp();
  return {
    ...copy(empty()), ...copy(state), schema: MARROWLINE_THREADS_SCHEMA,
    id: newId(root), parentId, branchOf, createdAt: time, updatedAt: time,
    conversationTitle: title || state.conversationTitle || 'The speaking grove',
    messages: copy(Array.isArray(state.messages) ? state.messages : [])
  };
}
export async function createMarrowlineThreadLibrary(root = window) {
  let adapter;
  if (root.indexedDB) adapter = indexedAdapter(await openMarrowlineThreadDB(root));
  else adapter = fallbackAdapter(root);
  const put = async record => adapter.put(copy({ ...record, schema: MARROWLINE_THREADS_SCHEMA, updatedAt: timestamp() }));
  const get = id => adapter.get(id);
  const all = async () => (await adapter.all()).sort((a, b) =>
    (b.updatedAt || '').localeCompare(a.updatedAt || '') || a.id.localeCompare(b.id));
  const remove = id => adapter.remove(id);
  const create = async (state = empty(), args = {}) => put(threadFromState(root, state, args));
  const branch = async (parent, responseIndex) => {
    const first = parent?.messages?.[0];
    const answer = parent?.messages?.[responseIndex];
    if (responseIndex !== 1 || first?.role !== 'user' || answer?.role !== 'model'
        || answer.receipt?.provider?.completion?.complete === false)
      throw new Error('A complete first Marrowline response is required to branch');
    return create({
      ...empty(),
      messages: copy(parent.messages.slice(0, 2)),
      lastReceipt: copy(answer.receipt || null),
      conversationTitle: parent.conversationTitle || 'The speaking grove'
    }, { parentId: parent.id, branchOf: responseIndex });
  };
  const migrate = async () => {
    let legacy;
    try { legacy = JSON.parse(root.sessionStorage.getItem(LEGACY_KEY) || 'null'); } catch { return null; }
    if (!legacy || (!legacy.messages?.length && !legacy.pendingTask)) return null;
    // Each existing tab receives a stable import ID; a crash between put and
    // deleting its old packet reuses the same ID rather than doubling its archive.
    let importedId = root.sessionStorage.getItem(LEGACY_ID_KEY);
    if (!importedId) {
      importedId = 'legacy-' + newId(root);
      root.sessionStorage.setItem(LEGACY_ID_KEY, importedId);
    }
    const existing = await get(importedId);
    const record = existing || await put({ ...threadFromState(root, { ...empty(), ...legacy }), id: importedId });
    root.sessionStorage.removeItem(LEGACY_KEY);
    return record;
  };
  return Object.freeze({
    backend: adapter.kind, get, all, put, create, branch, remove, migrate,
    getActiveId: () => { try { return root.localStorage.getItem(ACTIVE_KEY); } catch { return null; } },
    setActiveId: value => { try { if (value) root.localStorage.setItem(ACTIVE_KEY, value); else root.localStorage.removeItem(ACTIVE_KEY); } catch {} },
    close: adapter.close
  });
}
