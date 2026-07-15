export const ASH_CASE_CONTROLS_VERSION = 'td613.ash-keep.case-controls/v1.0';

const DB_NAME = 'td613-ash-keep';
const POINTER_KEY = 'td613.ash-keep.current-case';
const SAVED_CASES_KEY = 'td613.ash-keep.saved-cases:v1';
const PREPAINT_CLASS = 'ash-has-current-case';
const CASE_STORES = ['cases', 'roomRules', 'routeMemory', 'tests', 'drafts', 'reviews', 'releases', 'savePoints', 'unexpectedDetails', 'notes'];
const $ = id => document.getElementById(id);

function readSavedCases() {
  try {
    const value = JSON.parse(localStorage.getItem(SAVED_CASES_KEY) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function writeSavedCases(value) {
  localStorage.setItem(SAVED_CASES_KEY, JSON.stringify(value));
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
  const stores = Object.fromEntries(await Promise.all(CASE_STORES.filter(store => store !== 'cases').map(async store => [store, await getAll(db, store)])));
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

function setCommandAvailability(hasCase) {
  for (const id of ['saveCase', 'closeCase']) {
    const button = $(id);
    if (button) button.disabled = !hasCase;
  }
}

async function selectableCases(db) {
  const pointer = localStorage.getItem(POINTER_KEY);
  const saved = readSavedCases();
  const cases = await getAll(db, 'cases');
  const options = [];
  for (const record of cases) {
    const caseId = record?.case_id;
    if (!caseId) continue;
    const current = caseId === pointer;
    const savedRecord = saved[caseId] || null;
    const fingerprint = savedRecord ? await fingerprintCase(db, caseId) : null;
    const isSaved = Boolean(savedRecord && fingerprint === savedRecord.fingerprint);
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

async function populateCaseSelect() {
  const select = $('selectCase');
  if (!select) return;
  const db = await openDb();
  try {
    const options = await selectableCases(db);
    select.replaceChildren();
    const placeholder = new Option('Select a case…', '', true, true);
    select.add(placeholder);
    for (const item of options) select.add(new Option(item.label, item.caseId));
    select.disabled = options.length === 0;
    select.value = '';
  } finally {
    db.close();
  }
}

async function validatePointer() {
  const pointer = localStorage.getItem(POINTER_KEY);
  if (!pointer) {
    document.documentElement.classList.remove(PREPAINT_CLASS);
    setCommandAvailability(false);
    return false;
  }
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
}

async function saveCurrentCase() {
  const caseId = localStorage.getItem(POINTER_KEY);
  if (!caseId) return;
  const button = $('saveCase');
  const db = await openDb();
  try {
    const bundle = await caseBundle(db, caseId);
    if (!bundle) throw new Error('Current case could not be found.');
    const fingerprint = await sha256(bundle);
    const saved = readSavedCases();
    saved[caseId] = {
      case_id: caseId,
      title: bundle.caseMap.title || 'Untitled case',
      fingerprint,
      saved_at: new Date().toISOString()
    };
    writeSavedCases(saved);
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
}

async function closeCurrentCase() {
  if (!localStorage.getItem(POINTER_KEY)) return;
  document.documentElement.classList.remove(PREPAINT_CLASS);
  const launch = $('launch');
  launch?.classList.remove('hidden');
  document.body.dataset.ashCaseClosed = 'true';
  await populateCaseSelect();
  $('selectCase')?.focus();
}

function openSelectedCase(caseId) {
  if (!caseId) return;
  localStorage.setItem(POINTER_KEY, caseId);
  document.documentElement.classList.add(PREPAINT_CLASS);
  $('launch')?.classList.add('hidden');
  location.reload();
}

function bindControls() {
  $('saveCase')?.addEventListener('click', () => saveCurrentCase().catch(error => {
    if ($('storageState')) $('storageState').textContent = error.message;
  }));
  $('closeCase')?.addEventListener('click', () => closeCurrentCase().catch(console.error));
  $('selectCase')?.addEventListener('change', event => openSelectedCase(event.target.value));
  const launch = $('launch');
  if (launch) {
    new MutationObserver(() => {
      const hasCase = Boolean(localStorage.getItem(POINTER_KEY));
      setCommandAvailability(hasCase);
      if (!launch.classList.contains('hidden')) populateCaseSelect().catch(console.error);
    }).observe(launch, { attributes: true, attributeFilter: ['class'] });
  }
}

async function bootCaseControls() {
  document.documentElement.dataset.ashCaseControls = ASH_CASE_CONTROLS_VERSION;
  bindControls();
  const hasCase = await validatePointer();
  if (!hasCase || !$('launch')?.classList.contains('hidden')) await populateCaseSelect();
}

bootCaseControls().catch(error => {
  document.documentElement.classList.remove(PREPAINT_CLASS);
  $('launch')?.classList.remove('hidden');
  if ($('storageState')) $('storageState').textContent = 'Case controls held';
  console.error('Ash case controls held:', error);
});
