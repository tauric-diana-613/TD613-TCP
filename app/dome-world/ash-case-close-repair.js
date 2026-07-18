export const ASH_CASE_CLOSE_REPAIR_VERSION = 'td613.ash.case-close-repair/v1.0-pointer-release';

const DB_NAME = 'td613-ash-keep';
const POINTER_KEY = 'td613.ash-keep.current-case';
const LAST_CLOSED_KEY = 'td613.ash-keep.last-closed-case';
const PREPAINT_CLASS = 'ash-has-current-case';
const CASE_BUNDLE_STORES = ['cases', 'roomRules', 'routeMemory', 'tests', 'drafts', 'reviews', 'releases', 'savePoints', 'unexpectedDetails', 'notes'];
let closing = false;

const byId = id => document.getElementById(id);
const unwrap = record => record?.value ?? record;

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestValue(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

async function getRecord(db, store, id) {
  if (!db.objectStoreNames.contains(store)) return null;
  return requestValue(db.transaction(store).objectStore(store).get(id));
}

async function getAll(db, store) {
  if (!db.objectStoreNames.contains(store)) return [];
  return requestValue(db.transaction(store).objectStore(store).getAll()) || [];
}

function putWrapped(db, store, id, value) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, 'readwrite');
    transaction.objectStore(store).put({ id, value });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonicalize(value[key])]));
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(canonicalize(value)));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return `sha256:${[...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('')}`;
}

async function caseBundle(db, caseId) {
  const caseMap = await getRecord(db, 'cases', caseId);
  if (!caseMap) return null;
  const stores = Object.fromEntries(await Promise.all(CASE_BUNDLE_STORES.filter(store => store !== 'cases').map(async store => [store, await getAll(db, store)])));
  const drafts = stores.drafts.map(unwrap).filter(item => item?.case_id === caseId);
  const draftIds = new Set(drafts.map(item => item.draft_id));
  return {
    caseMap,
    roomRules: unwrap(await getRecord(db, 'roomRules', caseId)),
    routeMemory: unwrap(await getRecord(db, 'routeMemory', caseId)),
    tests: stores.tests.map(unwrap).filter(item => item?.case_id === caseId),
    drafts,
    reviews: stores.reviews.map(unwrap).filter(item => draftIds.has(item?.draft_id)),
    releases: stores.releases.map(unwrap).filter(item => item?.case_id === caseId),
    savePoints: stores.savePoints.map(unwrap).filter(item => item?.case_id === caseId),
    unexpectedDetails: stores.unexpectedDetails.map(unwrap).filter(item => item?.case_id === caseId),
    notes: unwrap(await getRecord(db, 'notes', caseId))
  };
}

async function saveBeforeClose(caseId) {
  const db = await openDb();
  try {
    const bundle = await caseBundle(db, caseId);
    if (!bundle) return null;
    const record = {
      case_id: caseId,
      title: bundle.caseMap.title || 'Untitled case',
      fingerprint: await sha256(bundle),
      saved_at: new Date().toISOString(),
      save_reason: 'automatic-close-boundary'
    };
    await putWrapped(db, 'savedCases', caseId, record);
    return record;
  } finally {
    db.close();
  }
}

function exposeMembrane(caseId) {
  localStorage.setItem(LAST_CLOSED_KEY, caseId);
  localStorage.removeItem(POINTER_KEY);
  document.documentElement.classList.remove(PREPAINT_CLASS);
  const launch = byId('launch');
  launch?.classList.remove('hidden');
  document.body.dataset.ashCaseClosed = 'true';
  for (const id of ['saveCase', 'closeCase']) {
    const button = byId(id);
    if (button) button.disabled = true;
  }
}

async function retainClosedSelection(caseId) {
  const select = byId('selectCase');
  if (!select) return;
  const deadline = performance.now() + 1800;
  while (performance.now() < deadline) {
    if ([...select.options].some(option => option.value === caseId)) {
      select.value = caseId;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      byId('openSelectedCase')?.removeAttribute('disabled');
      byId('deleteSelectedCase')?.removeAttribute('disabled');
      select.focus();
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 40));
  }
  select.focus();
}

async function closeToMembrane() {
  if (closing) return;
  closing = true;
  const caseId = localStorage.getItem(POINTER_KEY);
  try {
    if (!caseId) {
      document.documentElement.classList.remove(PREPAINT_CLASS);
      byId('launch')?.classList.remove('hidden');
      return;
    }
    const saved = await saveBeforeClose(caseId);
    try {
      await window.TD613AshConvergence?.transitionCase?.(caseId, {
        persisted: true,
        saved: Boolean(saved),
        closed: true,
        reason: 'operator-closed-current-case-pointer-released'
      });
    } catch (error) {
      console.warn('Ash close transition receipt held; membrane release continues.', error);
    }
    exposeMembrane(caseId);
    await window.__td613AshLifecycleRefresh?.().catch?.(() => {});
    window.dispatchEvent(new CustomEvent('td613:ash:case-closed', { detail: { case_id: caseId, saved_before_close: Boolean(saved) } }));
    await retainClosedSelection(caseId);
  } finally {
    closing = false;
  }
}

function install() {
  if (window.__td613AshCaseCloseRepair) return false;
  document.addEventListener('click', event => {
    const button = event.target?.closest?.('#closeCase');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    closeToMembrane().catch(error => {
      const state = byId('storageState');
      if (state) state.textContent = `Close held · ${error.message}`;
      console.error('Ash close-to-membrane repair held:', error);
    });
  }, true);
  document.addEventListener('click', event => {
    if (!event.target?.closest?.('#openSelectedCase')) return;
    localStorage.removeItem(LAST_CLOSED_KEY);
  }, true);
  document.documentElement.dataset.ashCaseCloseRepair = ASH_CASE_CLOSE_REPAIR_VERSION;
  window.__td613AshCaseCloseRepair = Object.freeze({
    version: ASH_CASE_CLOSE_REPAIR_VERSION,
    close: closeToMembrane
  });
  return true;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') install();
