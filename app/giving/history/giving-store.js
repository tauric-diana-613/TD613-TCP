const DB_NAME = 'td613-giving-history';
const DB_VERSION = 1;
const DOSSIER_STORE = 'dossiers';
const SETTING_STORE = 'settings';

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB request failed.'));
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction aborted.'));
    transaction.onerror = () => reject(transaction.error || new Error('IndexedDB transaction failed.'));
  });
}

export async function openGivingStore(indexedDBImpl = globalThis.indexedDB) {
  if (!indexedDBImpl?.open) throw new Error('IndexedDB is unavailable; use encrypted export before leaving this page.');
  const request = indexedDBImpl.open(DB_NAME, DB_VERSION);
  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains(DOSSIER_STORE)) {
      const dossiers = database.createObjectStore(DOSSIER_STORE, { keyPath: 'id' });
      dossiers.createIndex('updated_at', 'updated_at');
      dossiers.createIndex('custody', 'custody');
    }
    if (!database.objectStoreNames.contains(SETTING_STORE)) database.createObjectStore(SETTING_STORE, { keyPath: 'key' });
  };
  const database = await requestResult(request);

  return Object.freeze({
    async listDossiers() {
      const transaction = database.transaction(DOSSIER_STORE, 'readonly');
      const values = await requestResult(transaction.objectStore(DOSSIER_STORE).getAll());
      return values.sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
    },
    async readDossier(id) {
      const transaction = database.transaction(DOSSIER_STORE, 'readonly');
      return requestResult(transaction.objectStore(DOSSIER_STORE).get(id));
    },
    async writeDossier(dossier) {
      const transaction = database.transaction(DOSSIER_STORE, 'readwrite');
      transaction.objectStore(DOSSIER_STORE).put(dossier);
      await transactionDone(transaction);
      return dossier;
    },
    async deleteDossier(id) {
      const transaction = database.transaction(DOSSIER_STORE, 'readwrite');
      transaction.objectStore(DOSSIER_STORE).delete(id);
      await transactionDone(transaction);
    },
    async readSetting(key) {
      const transaction = database.transaction(SETTING_STORE, 'readonly');
      return (await requestResult(transaction.objectStore(SETTING_STORE).get(key)))?.value;
    },
    async writeSetting(key, value) {
      const transaction = database.transaction(SETTING_STORE, 'readwrite');
      transaction.objectStore(SETTING_STORE).put({ key, value, updated_at: new Date().toISOString() });
      await transactionDone(transaction);
      return value;
    },
    close() {
      database.close();
    }
  });
}

export const GIVING_STORE_CONTRACT = Object.freeze({
  database: DB_NAME,
  version: DB_VERSION,
  stores: [DOSSIER_STORE, SETTING_STORE],
  local_only: true,
  hosted_plaintext_persistence: false
});
