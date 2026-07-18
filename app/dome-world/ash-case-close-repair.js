export const ASH_CASE_CLOSE_REPAIR_VERSION = 'td613.ash.case-close-repair/v1.2-session-logout';

const DB_NAME = 'td613-ash-keep';
const POINTER_KEY = 'td613.ash-keep.current-case';
const SESSION_EPOCH_KEY = 'td613.ash.session.epoch';
const PREPAINT_CLASS = 'ash-has-current-case';
const CASE_BUNDLE_STORES = ['cases', 'roomRules', 'routeMemory', 'tests', 'drafts', 'reviews', 'releases', 'savePoints', 'unexpectedDetails', 'notes'];
const QUERY_KEYS = ['arrival', 'ash_flush', 'asset_epoch', 'cache_nonce', 'case', 'demo'];
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
  if (!caseId) return null;
  const db = await openDb();
  try {
    const bundle = await caseBundle(db, caseId);
    if (!bundle) return null;
    const record = {
      case_id:caseId,
      title:bundle.caseMap.title || 'Untitled case',
      fingerprint:await sha256(bundle),
      saved_at:new Date().toISOString(),
      save_reason:'automatic-close-boundary'
    };
    await putWrapped(db, 'savedCases', caseId, record);
    return record;
  } finally {
    db.close();
  }
}

function clearAshSessionStorage() {
  const removed = [];
  try {
    for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = sessionStorage.key(index);
      if (key && /^td613(?::|\.)ash/i.test(key)) {
        sessionStorage.removeItem(key);
        removed.push(key);
      }
    }
  } catch {}
  return removed;
}

function cleanUrl() {
  try {
    const url = new URL(location.href);
    let changed = false;
    for (const key of QUERY_KEYS) {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    }
    if (changed) history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  } catch {}
}

function resetTransientUi() {
  for (const dialog of document.querySelectorAll('dialog[open]')) {
    try { dialog.close(); } catch { dialog.removeAttribute('open'); }
  }
  document.querySelectorAll('.guided-map-focus').forEach(node => node.classList.remove('guided-map-focus'));
  document.querySelectorAll('[aria-pressed="true"]').forEach(node => {
    if (node.id === 'guidedMapFocus') node.setAttribute('aria-pressed', 'false');
  });
  byId('premiumCommandSearch')?.setAttribute('value', '');
}

function exposeMembrane() {
  try {
    localStorage.removeItem(POINTER_KEY);
    localStorage.removeItem(SESSION_EPOCH_KEY);
  } catch {}
  clearAshSessionStorage();
  cleanUrl();
  resetTransientUi();
  document.documentElement.classList.remove(PREPAINT_CLASS);
  document.documentElement.dataset.ashSessionOpen = 'false';
  document.documentElement.dataset.ashMembraneReady = 'true';
  const launch = byId('launch');
  launch?.classList.remove('hidden');
  launch?.scrollTo?.({ top:0, behavior:'auto' });
  document.querySelector('#launch .launch-panel')?.scrollTo?.({ top:0, behavior:'auto' });
  document.body.dataset.ashCaseClosed = 'true';
  for (const id of ['saveCase', 'closeCase']) {
    const button = byId(id);
    if (button) button.disabled = true;
  }
}

async function resetCaseSelection() {
  await window.__td613AshCaseControls?.refreshCases?.();
  const select = byId('selectCase');
  if (select) {
    select.value = '';
    select.dispatchEvent(new Event('change', { bubbles:true }));
  }
  byId('openSelectedCase')?.setAttribute('disabled', '');
  byId('deleteSelectedCase')?.setAttribute('disabled', '');
  byId('newTitle')?.focus?.();
}

async function closeToMembrane() {
  if (closing) return;
  closing = true;
  const caseId = localStorage.getItem(POINTER_KEY);
  try {
    const saved = await saveBeforeClose(caseId);
    if (caseId) {
      try {
        await window.TD613AshConvergence?.transitionCase?.(caseId, {
          persisted:true,
          saved:Boolean(saved),
          closed:true,
          nextState:'SELECTED_NOT_OPEN',
          reason:'operator-closed-current-case-session-logout'
        });
      } catch (error) {
        console.warn('Ash close transition receipt held; session logout continues.', error);
      }
    }
    exposeMembrane();
    window.dispatchEvent(new CustomEvent('td613:ash:case-closed', {
      detail:{ case_id:caseId || null, saved_before_close:Boolean(saved), session_logged_out:true }
    }));
    try { await window.__td613AshLifecycleRefresh?.(); } catch {}
    await resetCaseSelection();
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
  if (!localStorage.getItem(POINTER_KEY)) exposeMembrane();
  document.documentElement.dataset.ashCaseCloseRepair = ASH_CASE_CLOSE_REPAIR_VERSION;
  window.__td613AshCaseCloseRepair = Object.freeze({
    version:ASH_CASE_CLOSE_REPAIR_VERSION,
    close:closeToMembrane,
    logout:closeToMembrane
  });
  return true;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') install();
