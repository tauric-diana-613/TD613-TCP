import './ash-map-labels.js';

export const ASH_CASE_CONTROLS_VERSION = 'td613.ash-keep.case-controls/v1.3-case-list-coalescing';

const DB_NAME = 'td613-ash-keep';
const POINTER_KEY = 'td613.ash-keep.current-case';
const SAVED_CASES_KEY = 'td613.ash-keep.saved-cases:v1';
const PREPAINT_CLASS = 'ash-has-current-case';
const CASE_BUNDLE_STORES = ['cases', 'roomRules', 'routeMemory', 'tests', 'drafts', 'reviews', 'releases', 'savePoints', 'unexpectedDetails', 'notes'];
const CASE_STORES = [
  'cases', 'roomRules', 'routeMemory', 'tests', 'drafts', 'reviews', 'releases', 'savePoints', 'unexpectedDetails', 'notes',
  'authorityContexts', 'authorityBindings', 'invalidations', 'lifecycle', 'savedCases', 'custodyReceipts'
];
const $ = id => document.getElementById(id);
let caseListPopulation = null;
let queuedPreferredCaseId = '';

async function readSavedCases(db) {
  const records = await getAll(db, 'savedCases');
  const saved = Object.fromEntries(records.map(record => [record.id, unwrap(record)]).filter(([, value]) => value?.case_id));
  if (Object.keys(saved).length) return saved;
  try {
    const legacy = JSON.parse(localStorage.getItem(SAVED_CASES_KEY) || '{}');
    if (legacy && typeof legacy === 'object' && !Array.isArray(legacy)) {
      for (const [caseId, value] of Object.entries(legacy)) await putWrapped(db, 'savedCases', caseId, value);
      localStorage.removeItem(SAVED_CASES_KEY);
      return legacy;
    }
  } catch {
    localStorage.removeItem(SAVED_CASES_KEY);
  }
  return {};
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

function unwrap(record) {
  return record?.value ?? record;
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

async function fingerprintCase(db, caseId) {
  const bundle = await caseBundle(db, caseId);
  return bundle ? sha256(bundle) : null;
}

async function caseIsSaved(db, caseId, saved = null) {
  const records = saved || await readSavedCases(db);
  const record = records[caseId];
  return Boolean(record && await fingerprintCase(db, caseId) === record.fingerprint);
}

function setCommandAvailability(hasCase) {
  for (const id of ['saveCase', 'closeCase']) {
    const button = $(id);
    if (button) button.disabled = !hasCase;
  }
}

function setChoiceAvailability(hasChoice) {
  for (const id of ['openSelectedCase', 'deleteSelectedCase']) {
    const button = $(id);
    if (button) button.disabled = !hasChoice;
  }
}

function injectLaunchActionStyles() {
  if ($('ashLaunchActionStyles')) return;
  const style = document.createElement('style');
  style.id = 'ashLaunchActionStyles';
  style.textContent = `
    #launch .launch-actions{display:flex;justify-content:space-between;align-items:center;gap:18px}
    #launch .launch-action-group{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    #launch .launch-action-group-right{margin-left:auto;justify-content:flex-end}
    #launch .launch-case-button{min-width:76px;min-height:34px;padding:6px 10px;font-size:.61rem}
    #launch .launch-delete-button{border-color:rgba(255,139,157,.45);color:var(--rose)}
    @media(max-width:620px){#launch .launch-actions{align-items:stretch;gap:12px}#launch .launch-action-group{flex:1 1 0}#launch .launch-action-group-right{justify-content:flex-end}#launch .launch-case-button{min-width:68px}}
  `;
  document.head.append(style);
}

function ensureLaunchActions() {
  const actions = document.querySelector('#launch .actions');
  if (!actions || $('openSelectedCase')) return;
  injectLaunchActionStyles();
  actions.classList.add('launch-actions');

  const left = document.createElement('div');
  left.className = 'launch-action-group launch-action-group-left';
  for (const id of ['startDemo', 'newCase']) {
    const button = $(id);
    if (button) left.append(button);
  }

  const right = document.createElement('div');
  right.className = 'launch-action-group launch-action-group-right';

  const open = document.createElement('button');
  open.id = 'openSelectedCase';
  open.type = 'button';
  open.className = 'btn launch-case-button';
  open.textContent = 'Open';
  open.disabled = true;

  const remove = document.createElement('button');
  remove.id = 'deleteSelectedCase';
  remove.type = 'button';
  remove.className = 'btn launch-case-button launch-delete-button';
  remove.textContent = 'Delete';
  remove.disabled = true;

  right.append(open, remove);
  actions.replaceChildren(left, right);
}

async function selectableCases(db) {
  const pointer = localStorage.getItem(POINTER_KEY);
  const saved = await readSavedCases(db);
  const cases = await getAll(db, 'cases');
  const options = [];
  for (const record of cases) {
    const caseId = record?.case_id;
    if (!caseId) continue;
    const current = caseId === pointer;
    const savedRecord = saved[caseId] || null;
    const isSaved = Boolean(savedRecord && await caseIsSaved(db, caseId, saved));
    if (!isSaved && !current) continue;
    options.push({
      caseId,
      title: record.title || 'Untitled case',
      current,
      isSaved,
      label: `${record.title || 'Untitled case'} — ${current ? (isSaved ? 'current saved' : 'current unsaved') : 'saved'}`
    });
  }
  return options.sort((left, right) => Number(right.current) - Number(left.current) || left.title.localeCompare(right.title));
}

async function populateCaseSelectOnce(preferredCaseId = '') {
  const select = $('selectCase');
  if (!select) return;
  select.dataset.caseListState = 'LOADING';
  select.disabled = true;
  setChoiceAvailability(false);
  const db = await openDb();
  try {
    const options = await selectableCases(db);
    select.replaceChildren();
    const placeholder = new Option('Select a case…', '', true, true);
    select.add(placeholder);
    for (const item of options) select.add(new Option(item.label, item.caseId));
    select.disabled = options.length === 0;
    select.value = options.some(item => item.caseId === preferredCaseId) ? preferredCaseId : '';
    setChoiceAvailability(Boolean(select.value));
  } finally {
    db.close();
    select.dataset.caseListState = 'READY';
  }
}

async function populateCaseSelect(preferredCaseId = '') {
  if (preferredCaseId) queuedPreferredCaseId = preferredCaseId;
  if (caseListPopulation) return caseListPopulation;
  caseListPopulation = (async () => {
    let initialPreferredCaseId = preferredCaseId;
    do {
      const requestedCaseId = queuedPreferredCaseId || initialPreferredCaseId;
      queuedPreferredCaseId = '';
      initialPreferredCaseId = '';
      await populateCaseSelectOnce(requestedCaseId);
    } while (queuedPreferredCaseId);
  })();
  try {
    return await caseListPopulation;
  } finally {
    caseListPopulation = null;
  }
}

async function validatePointer() {
  const pointer = localStorage.getItem(POINTER_KEY);
  if (!pointer) {
    document.documentElement.classList.remove(PREPAINT_CLASS);
    setCommandAvailability(false);
    return false;
  }
  return window.TD613AshConvergence.withOperation(`pointer:${pointer}`, async () => {
    const db = await openDb();
    try {
      const record = await getRecord(db, 'cases', pointer);
      if (record) {
        setCommandAvailability(true);
        return true;
      }
    } finally {
      db.close();
    }
    localStorage.removeItem(POINTER_KEY);
    document.documentElement.classList.remove(PREPAINT_CLASS);
    $('launch')?.classList.remove('hidden');
    setCommandAvailability(false);
    return false;
  });
}

async function saveCurrentCase() {
  const caseId = localStorage.getItem(POINTER_KEY);
  if (!caseId) return;
  return window.TD613AshConvergence.withOperation(`save:${caseId}`, async () => {
    const button = $('saveCase');
    const db = await openDb();
    try {
      const bundle = await caseBundle(db, caseId);
      if (!bundle) throw new Error('Current case could not be found.');
      const fingerprint = await sha256(bundle);
      const savedRecord = {
      case_id: caseId,
      title: bundle.caseMap.title || 'Untitled case',
      fingerprint,
      saved_at: new Date().toISOString()
      };
      await putWrapped(db, 'savedCases', caseId, savedRecord);
      await window.TD613AshConvergence.transitionCase(caseId, { persisted: true, saved: true, reason: 'operator-saved-current-case' });
      if ($('storageState')) $('storageState').textContent = 'Case saved';
      if (button) {
        const label = button.textContent;
        button.textContent = 'Saved';
        setTimeout(() => { button.textContent = label; }, 900);
      }
      await populateCaseSelect();
    } finally {
      db.close();
    }
  });
}

async function closeCurrentCase() {
  const caseId = localStorage.getItem(POINTER_KEY);
  if (!caseId) return;
  await window.TD613AshConvergence.withOperation(`close:${caseId}`, async () => {
    document.documentElement.classList.remove(PREPAINT_CLASS);
    const launch = $('launch');
    launch?.classList.remove('hidden');
    document.body.dataset.ashCaseClosed = 'true';
    const db = await openDb();
    try {
      const saved = await readSavedCases(db);
      await window.TD613AshConvergence.transitionCase(caseId, { persisted: true, saved: await caseIsSaved(db, caseId, saved), closed: true, reason: 'operator-closed-current-case' });
    } finally {
      db.close();
    }
    await populateCaseSelect();
    $('selectCase')?.focus();
  });
}

async function openSelectedCase() {
  const caseId = $('selectCase')?.value || '';
  if (!caseId) return;
  await window.TD613AshConvergence.withOperation(`open:${caseId}`, async () => {
    localStorage.setItem(POINTER_KEY, caseId);
    document.documentElement.classList.add(PREPAINT_CLASS);
    document.body.dataset.ashCaseClosed = 'false';
    $('launch')?.classList.add('hidden');
    await window.__td613AshKeep?.refresh?.();
    await window.__td613AshLifecycleRefresh?.();
    const db = await openDb();
    try {
      const saved = await readSavedCases(db);
      await window.TD613AshConvergence.transitionCase(caseId, { persisted: true, saved: await caseIsSaved(db, caseId, saved), reason: 'operator-opened-selected-case' });
    } finally {
      db.close();
    }
    await window.TD613AshConvergence.reconcileAuthority('case-opened-without-reload');
  });
}

async function atomicDeleteCase(db, caseId) {
  const drafts = (await getAll(db, 'drafts')).map(unwrap).filter(item => item?.case_id === caseId);
  const draftIds = new Set(drafts.map(item => item.draft_id));
  const stores = CASE_STORES.filter(store => db.objectStoreNames.contains(store));
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(stores, 'readwrite');
    let deleted = 0;
    for (const storeName of stores) {
      const store = transaction.objectStore(storeName);
      const request = store.openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;
        const value = unwrap(cursor.value);
        const matches = storeName === 'cases'
          ? cursor.key === caseId || value?.case_id === caseId
          : storeName === 'reviews'
            ? draftIds.has(value?.draft_id)
            : cursor.key === caseId || cursor.value?.id === caseId || value?.case_id === caseId;
        if (matches) {
          cursor.delete();
          deleted += 1;
        }
        cursor.continue();
      };
      request.onerror = () => transaction.abort();
    }
    transaction.oncomplete = () => resolve(deleted);
    transaction.onerror = () => reject(transaction.error || new Error('Local case deletion failed.'));
    transaction.onabort = () => reject(transaction.error || new Error('Local case deletion was interrupted.'));
  });
}

async function remainingCaseRecords(db, caseId) {
  const remaining = [];
  for (const store of CASE_STORES.filter(name => db.objectStoreNames.contains(name))) {
    for (const record of await getAll(db, store)) {
      const value = unwrap(record);
      if (record?.id === caseId || record?.case_id === caseId || value?.case_id === caseId) remaining.push({ store, reference: String(record.id || record.case_id || value.id || value.receipt_id || 'unknown') });
    }
  }
  return remaining;
}

async function deleteSelectedCase() {
  const select = $('selectCase');
  const caseId = select?.value || '';
  if (!caseId) return;
  await window.TD613AshConvergence.withOperation(`delete:${caseId}`, async () => {
    const db = await openDb();
    let plan = null;
    try {
      const record = await getRecord(db, 'cases', caseId);
      if (!record) throw new Error('Selected case could not be found.');
      const title = record.title || 'Untitled case';
      if (!window.confirm(`Delete "${title}" and its local case records from this browser? Export an Ash Capsule first if another local copy is needed. This cannot erase copies outside this browser.`)) return;
      plan = await window.TD613AshConvergence.planDeletion(caseId, title, true);
      const deletedCount = await atomicDeleteCase(db, caseId);
      const remaining = await remainingCaseRecords(db, caseId);
      const status = remaining.length ? 'DELETE_PARTIAL_HOLD' : 'DELETED_LOCAL';
      await window.TD613AshConvergence.finishDeletion(plan, { status, deletedCount, remainingOrphans: remaining });
      plan = null;
      if (status !== 'DELETED_LOCAL') throw new Error('Deletion is held because local case records remain. Recovery is available.');
      const wasCurrent = localStorage.getItem(POINTER_KEY) === caseId;
      if (wasCurrent) {
        localStorage.removeItem(POINTER_KEY);
        document.documentElement.classList.remove(PREPAINT_CLASS);
        setCommandAvailability(false);
      }
      if ($('storageState')) $('storageState').textContent = 'Case deleted locally';
    } catch (error) {
      if (plan) {
        const remaining = await remainingCaseRecords(db, caseId).catch(() => []);
        await window.TD613AshConvergence.finishDeletion(plan, { status: 'DELETE_PARTIAL_HOLD', remainingOrphans: remaining, failure: error.message }).catch(console.error);
      }
      throw error;
    } finally {
      db.close();
    }
  });
  await populateCaseSelect();
  $('selectCase')?.focus();
}

function bindControls() {
  $('saveCase')?.addEventListener('click', () => saveCurrentCase().catch(error => {
    if ($('storageState')) $('storageState').textContent = error.message;
  }));
  $('closeCase')?.addEventListener('click', () => closeCurrentCase().catch(console.error));
  $('selectCase')?.addEventListener('change', event => {
    const caseId = event.target.value;
    setChoiceAvailability(Boolean(caseId));
    if (caseId) window.TD613AshConvergence.transitionCase(caseId, { nextState: 'SELECTED_NOT_OPEN', reason: 'operator-selected-case' }).catch(console.error);
  });
  $('openSelectedCase')?.addEventListener('click', () => openSelectedCase().catch(error => {
    if ($('storageState')) $('storageState').textContent = error.message;
  }));
  $('deleteSelectedCase')?.addEventListener('click', () => deleteSelectedCase().catch(error => {
    if ($('storageState')) $('storageState').textContent = error.message;
  }));
  const launch = $('launch');
  if (launch) {
    new MutationObserver(() => {
      const hasCase = Boolean(localStorage.getItem(POINTER_KEY));
      setCommandAvailability(hasCase);
      if (!launch.classList.contains('hidden')) populateCaseSelect().catch(console.error);
    }).observe(launch, { attributes: true, attributeFilter: ['class'] });
  }
}

async function recoverInterruptedDeletions() {
  const db = await openDb();
  try {
    const plans = (await getAll(db, 'deletionPlans')).map(unwrap).filter(Boolean);
    const receipts = (await getAll(db, 'deletionReceipts')).map(unwrap).filter(Boolean);
    const completed = new Set(receipts.map(receipt => receipt.deletion_plan_reference));
    for (const plan of plans.filter(item => !completed.has(item.receipt_id))) {
      const remaining = await remainingCaseRecords(db, plan.case_id);
      await window.TD613AshConvergence.finishDeletion(plan, {
        status: 'DELETE_PARTIAL_HOLD',
        remainingOrphans: remaining,
        failure: 'Interrupted local deletion was recovered at startup.'
      });
    }
  } finally {
    db.close();
  }
}

async function bootCaseControls() {
  document.documentElement.dataset.ashCaseControls = ASH_CASE_CONTROLS_VERSION;
  ensureLaunchActions();
  bindControls();
  await recoverInterruptedDeletions();
  const hasCase = await validatePointer();
  if (!hasCase || !$('launch')?.classList.contains('hidden')) await populateCaseSelect();
  if (hasCase) {
    const caseId = localStorage.getItem(POINTER_KEY);
    const db = await openDb();
    try {
      const saved = await readSavedCases(db);
      await window.TD613AshConvergence.transitionCase(caseId, { persisted: true, saved: await caseIsSaved(db, caseId, saved), reason: 'case-controls-boot' });
    } finally {
      db.close();
    }
  }
  const auditDb = await openDb();
  let hasAuditMaterial = false;
  try {
    const auditStores = ['cases', 'savedCases', 'lifecycle', 'reviews', 'releases', 'tombstones'];
    hasAuditMaterial = (await Promise.all(auditStores.map(store => getAll(auditDb, store)))).some(records => records.length > 0);
  } finally {
    auditDb.close();
  }
  if (hasAuditMaterial) {
    const audit = await window.TD613AshConvergence.runDryCompatibilityAudit();
    if (audit.findings.length && $('storageState')) $('storageState').textContent = `${audit.findings.length} compatibility finding(s) held for review`;
  }
}

bootCaseControls().catch(error => {
  document.documentElement.classList.remove(PREPAINT_CLASS);
  $('launch')?.classList.remove('hidden');
  if ($('storageState')) $('storageState').textContent = 'Case controls held';
  console.error('Ash case controls held:', error);
});
