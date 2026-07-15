import {
  ASH_CASE_STATES,
  ASH_CONVERGENCE_VERSION,
  authorizeAuthorityAction,
  compileAuthorityContext,
  compileCaseStateTransition,
  compileCompatibilityAudit,
  compileCompositionManifest,
  compileDeletionPlan,
  compileDeletionReceipt,
  compileInvalidationReceipt,
  deriveCaseState,
  verifyAuthorityContext
} from '../engine/ash-constitutional-convergence.js';

const DB_NAME = 'td613-ash-keep';
const DB_VERSION = 2;
const POINTER_KEY = 'td613.ash-keep.current-case';
const STORE_NAMES = [
  'cases', 'roomRules', 'routeMemory', 'tests', 'drafts', 'reviews', 'releases', 'savePoints', 'unexpectedDetails', 'notes',
  'authorityContexts', 'authorityBindings', 'invalidations', 'caseStates', 'operations', 'deletionPlans', 'deletionReceipts',
  'compatibilityAudits', 'lifecycle', 'savedCases', 'custodyReceipts', 'tombstones'
];
const EVENT_TYPES = [
  'core-ready', 'core-mutated', 'case-created', 'case-opened', 'custody-bound', 'rebuild-kept', 'draft-kept',
  'review-kept', 'release-kept', 'continuity-kept', 'route-memory-mutated', 'lifecycle-updated'
];
const CHANNEL_NAME = 'td613:ash-keep:constitutional-events:v1';
const ownerId = crypto.randomUUID();
const localBus = new EventTarget();
const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel(CHANNEL_NAME) : null;

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const store of STORE_NAMES) if (!db.objectStoreNames.contains(store)) db.createObjectStore(store, { keyPath: store === 'cases' ? 'case_id' : 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Ash constitutional database upgrade was blocked by another tab.'));
  });
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

async function getRecord(db, store, id) {
  if (!db.objectStoreNames.contains(store)) return null;
  return requestResult(db.transaction(store).objectStore(store).get(id));
}

async function getAll(db, store) {
  if (!db.objectStoreNames.contains(store)) return [];
  return (await requestResult(db.transaction(store).objectStore(store).getAll())) || [];
}

function unwrap(record) {
  return record?.value ?? record;
}

function putRecord(db, store, id, value) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, 'readwrite');
    const request = transaction.objectStore(store).put(store === 'cases' ? value : { id, value });
    transaction.oncomplete = () => resolve(value);
    transaction.onerror = () => reject(transaction.error || request.error);
    transaction.onabort = () => reject(transaction.error || request.error);
  });
}

function deleteRecord(db, store, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, 'readwrite');
    transaction.objectStore(store).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

function timeValue(value) {
  return Date.parse(value?.updated_at || value?.created_at || value?.observed_at || value?.compiled_at || '') || 0;
}

function latest(values, predicate = () => true) {
  return values.map(unwrap).filter(value => value && predicate(value)).sort((a, b) => timeValue(a) - timeValue(b)).at(-1) || null;
}

function eventDetail(detail = {}) {
  const allowed = [
    'case_id', 'case_map_digest', 'route_memory_digest', 'custody_root_receipt_reference', 'rebuild_receipt_reference',
    'review_reference', 'release_reference', 'continuity_reference', 'state', 'operation_id', 'reason'
  ];
  return Object.fromEntries(allowed.filter(key => detail[key] != null).map(key => [key, String(detail[key])]));
}

function publish(type, detail = {}, { remote = true } = {}) {
  const safeDetail = eventDetail(detail);
  localBus.dispatchEvent(new CustomEvent(type, { detail: safeDetail }));
  window.dispatchEvent(new CustomEvent(`td613:ash:constitutional:${type}`, { detail: safeDetail }));
  if (remote) channel?.postMessage({ type, detail: safeDetail, owner_id: ownerId });
}

channel?.addEventListener('message', event => {
  if (!event.data?.type || event.data.owner_id === ownerId) return;
  publish(event.data.type, event.data.detail, { remote: false });
  if (event.data.detail?.case_id === localStorage.getItem(POINTER_KEY)) {
    window.__td613AshKeep?.refresh?.().catch(console.error);
    window.__td613AshLifecycleRefresh?.().catch(console.error);
  }
});

async function acquireLease(name, operation, timeoutMs = 8000) {
  const db = await openDb();
  const leaseId = `lease:${name}`;
  const expiresAt = Date.now() + timeoutMs;
  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction('operations', 'readwrite');
      const store = transaction.objectStore('operations');
      const request = store.get(leaseId);
      request.onsuccess = () => {
        const current = unwrap(request.result);
        if (current && current.owner_id !== ownerId && current.expires_at > Date.now()) {
          transaction.abort();
          reject(new Error(`Ash operation is already active in another tab: ${name}`));
          return;
        }
        store.put({ id: leaseId, value: { owner_id: ownerId, name, expires_at: expiresAt } });
      };
      request.onerror = () => reject(request.error);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => {};
    });
    return await operation();
  } finally {
    const lease = unwrap(await getRecord(db, 'operations', leaseId));
    if (lease?.owner_id === ownerId) await deleteRecord(db, 'operations', leaseId);
    db.close();
  }
}

export async function withAshOperation(name, operation) {
  if (navigator.locks?.request) return navigator.locks.request(`td613:ash:${name}`, { mode: 'exclusive' }, operation);
  return acquireLease(name, operation);
}

async function collectCase(db, caseId) {
  const caseMap = await getRecord(db, 'cases', caseId);
  if (!caseMap) return null;
  const routeMemory = unwrap(await getRecord(db, 'routeMemory', caseId));
  const lifecycle = unwrap(await getRecord(db, 'lifecycle', caseId)) || {};
  const [tests, drafts, reviews, releases, savePoints] = await Promise.all(['tests', 'drafts', 'reviews', 'releases', 'savePoints'].map(store => getAll(db, store)));
  const currentTest = latest(tests, value => value.case_id === caseId && value.case_map_digest === caseMap.case_map_digest && value.review_state !== 'HELD');
  const currentDraft = latest(drafts, value => value.case_id === caseId && value.case_map_digest === caseMap.case_map_digest);
  const currentReview = latest(reviews, value => value.draft_id === currentDraft?.draft_id && value.case_map_digest === caseMap.case_map_digest);
  const currentRelease = latest(releases, value => value.case_id === caseId && value.case_map_digest === caseMap.case_map_digest && value.draft_id === currentDraft?.draft_id);
  const currentSave = latest(savePoints, value => value.case_id === caseId && value.case_map_digest === caseMap.case_map_digest && value.route_memory_digest === routeMemory?.route_memory_digest);
  return { caseMap, routeMemory, lifecycle, currentTest, currentDraft, currentReview, currentRelease, currentSave };
}

export async function reconcileAuthority(reason = 'constitutional-reconcile') {
  const caseId = localStorage.getItem(POINTER_KEY);
  if (!caseId) return null;
  return withAshOperation(`authority:${caseId}`, async () => {
    const db = await openDb();
    try {
      const current = await collectCase(db, caseId);
      if (!current) return null;
      const binding = unwrap(await getRecord(db, 'authorityBindings', caseId));
      const previous = binding?.authority_context_reference ? unwrap(await getRecord(db, 'authorityContexts', binding.authority_context_reference)) : null;
      const lifecycleRank = current.lifecycle.lifecycle_state || current.lifecycle.lifecycle_receipt?.lifecycle?.state || 'ARRIVAL_UNPERSISTED';
      const context = await compileAuthorityContext({
        lifecycleRank,
        readinessReceiptReference: current.lifecycle.readiness_receipt?.receipt_id || null,
        custodyRootReceiptReference: current.lifecycle.custody_receipt_reference || null,
        caseId,
        caseMapDigest: current.caseMap.case_map_digest,
        routeMemoryDigest: current.routeMemory?.route_memory_digest || null,
        rebuildReceiptReference: current.currentTest?.test_id || null,
        currentReviewReference: current.currentReview?.review_id || null,
        currentReleaseReference: current.currentRelease?.receipt_id || null,
        currentContinuityReference: current.currentSave?.save_point_id || null,
        evidenceBasis: ['current IndexedDB case records', 'current Ash lifecycle receipt'],
        missingness: current.lifecycle.lifecycle_receipt?.lifecycle?.holds || [],
        closureStatus: current.caseMap.closure?.status || 'OPEN'
      });
      await putRecord(db, 'authorityContexts', context.receipt_id, context);
      await putRecord(db, 'authorityBindings', caseId, {
        case_id: caseId,
        authority_context_reference: context.receipt_id,
        authority_context_digest: context.authority_context_digest,
        bound_at: new Date().toISOString()
      });
      const changedDimensions = [];
      if (previous && previous.case_map_digest !== context.case_map_digest) changedDimensions.push('CASE_MAP');
      if (previous && previous.route_memory_digest !== context.route_memory_digest) changedDimensions.push('ROUTE_MEMORY');
      if (previous && previous.custody_root_receipt_reference !== context.custody_root_receipt_reference) changedDimensions.push('CUSTODY_ROOT');
      if (changedDimensions.length) {
        const receipt = await compileInvalidationReceipt({
          caseId,
          previousAuthorityContextReference: previous.receipt_id,
          successorAuthorityContextReference: context.receipt_id,
          previousCaseMapDigest: previous.case_map_digest,
          successorCaseMapDigest: context.case_map_digest,
          previousRouteMemoryDigest: previous.route_memory_digest,
          successorRouteMemoryDigest: context.route_memory_digest,
          changedDimensions
        });
        await putRecord(db, 'invalidations', receipt.receipt_id, receipt);
        publish('authority-invalidated', { case_id: caseId, case_map_digest: context.case_map_digest, reason: changedDimensions.join(',') });
      }
      publish('authority-updated', { case_id: caseId, case_map_digest: context.case_map_digest, route_memory_digest: context.route_memory_digest, state: lifecycleRank, reason });
      document.documentElement.dataset.ashAuthorityContext = context.receipt_id;
      return context;
    } finally {
      db.close();
    }
  });
}

export async function currentAuthorityContext() {
  const caseId = localStorage.getItem(POINTER_KEY);
  if (!caseId) return null;
  const db = await openDb();
  try {
    const binding = unwrap(await getRecord(db, 'authorityBindings', caseId));
    if (!binding?.authority_context_reference) return null;
    const context = unwrap(await getRecord(db, 'authorityContexts', binding.authority_context_reference));
    const current = await collectCase(db, caseId);
    return await verifyAuthorityContext(context, {
      caseId,
      caseMapDigest: current?.caseMap?.case_map_digest,
      routeMemoryDigest: current?.routeMemory?.route_memory_digest
    }) ? context : null;
  } finally {
    db.close();
  }
}

export async function authorize(action) {
  let context = await currentAuthorityContext();
  if (!context) {
    await reconcileAuthority(`runtime-permission:${action}`);
    context = await currentAuthorityContext();
  }
  const decision = authorizeAuthorityAction(context, action);
  if (!decision.authorized) {
    throw new Error(`${action.replaceAll('_', ' ').toLowerCase()} is unavailable until the current case reaches ${decision.required_rank}.`);
  }
  return decision;
}

export async function transitionCase(caseId, input = {}) {
  return withAshOperation(`case-state:${caseId || 'unbound'}`, async () => {
    const db = await openDb();
    try {
      const previous = latest(await getAll(db, 'caseStates'), value => value.case_id === caseId);
      const nextState = input.nextState || deriveCaseState(input);
      const transition = await compileCaseStateTransition({ ...input, caseId, previousState: previous?.next_state || null, nextState });
      await putRecord(db, 'caseStates', transition.receipt_id, transition);
      publish('case-state', { case_id: caseId, state: nextState, operation_id: transition.receipt_id, reason: input.reason || 'case-state-reconciled' });
      return transition;
    } finally {
      db.close();
    }
  });
}

export async function inventoryCase(caseId) {
  const db = await openDb();
  try {
    const draftIds = new Set((await getAll(db, 'drafts')).map(unwrap).filter(value => value?.case_id === caseId).map(value => value.draft_id));
    const inventory = {};
    for (const store of STORE_NAMES.filter(name => !['operations', 'compatibilityAudits'].includes(name))) {
      const records = await getAll(db, store);
      inventory[store] = records.filter(record => {
        const value = unwrap(record);
        if (store === 'cases') return value?.case_id === caseId;
        if (store === 'reviews') return draftIds.has(value?.draft_id);
        return value?.case_id === caseId || record?.id === caseId;
      }).map(record => String(record.id || record.case_id || unwrap(record)?.receipt_id || unwrap(record)?.id)).filter(Boolean);
    }
    return inventory;
  } finally {
    db.close();
  }
}

export async function planDeletion(caseId, caseTitle, capsuleReminderPresented = true) {
  const plan = await compileDeletionPlan({ caseId, caseTitle, inventory: await inventoryCase(caseId), capsuleReminderPresented });
  const db = await openDb();
  try { await putRecord(db, 'deletionPlans', plan.receipt_id, plan); }
  finally { db.close(); }
  await transitionCase(caseId, { nextState: ASH_CASE_STATES.DELETION_PENDING, deletionPending: true, reason: 'operator-confirmed-local-deletion-plan', operationId: plan.receipt_id });
  return plan;
}

export async function finishDeletion(plan, input = {}) {
  const receipt = await compileDeletionReceipt({ plan, ...input });
  const db = await openDb();
  try {
    await putRecord(db, 'deletionReceipts', receipt.receipt_id, receipt);
    await putRecord(db, 'tombstones', plan.case_id, { case_id: plan.case_id, deletion_receipt_reference: receipt.receipt_id, status: receipt.status });
  } finally {
    db.close();
  }
  await transitionCase(plan.case_id, { nextState: receipt.status, deleted: receipt.status === ASH_CASE_STATES.DELETED_LOCAL, deletePartial: receipt.status === ASH_CASE_STATES.DELETE_PARTIAL_HOLD, reason: 'local-deletion-finished', operationId: receipt.receipt_id });
  return receipt;
}

export async function runDryCompatibilityAudit() {
  const db = await openDb();
  try {
    const values = async store => (await getAll(db, store)).map(unwrap).filter(Boolean);
    const [caseMaps, drafts, reviews, releases, savePoints, savedCases, lifecycleRows, tombstones] = await Promise.all([
      values('cases'), values('drafts'), values('reviews'), values('releases'), values('savePoints'), values('savedCases'), values('lifecycle'), values('tombstones')
    ]);
    const caseIds = new Set(caseMaps.map(value => value.case_id));
    const deletedIds = new Set(tombstones.filter(value => value.status === ASH_CASE_STATES.DELETED_LOCAL).map(value => value.case_id));
    const pointer = localStorage.getItem(POINTER_KEY);
    const audit = await compileCompatibilityAudit({
      caseMaps, drafts, reviews, releases, savePoints,
      savedCases: savedCases.map(value => ({ ...value, fingerprint_current: value.case_id ? caseIds.has(value.case_id) : false })),
      lifecycleCaseIds: lifecycleRows.map(value => value.case_id).filter(Boolean),
      deletedPointers: pointer && (!caseIds.has(pointer) || deletedIds.has(pointer)) ? [pointer] : []
    });
    await putRecord(db, 'compatibilityAudits', audit.receipt_id, audit);
    return audit;
  } finally {
    db.close();
  }
}

async function boot() {
  const db = await openDb();
  try {
    const manifest = await compileCompositionManifest();
    await putRecord(db, 'operations', 'constitutional-composition', manifest);
    document.documentElement.dataset.ashConvergence = ASH_CONVERGENCE_VERSION;
    document.documentElement.dataset.ashComposition = manifest.receipt_id;
  } finally {
    db.close();
  }
  for (const type of EVENT_TYPES) window.addEventListener(`td613:ash:${type}`, event => reconcileAuthority(type).catch(console.error));
  await reconcileAuthority('convergence-boot');
  publish('convergence-ready', { case_id: localStorage.getItem(POINTER_KEY), reason: 'canonical-composition-loaded' });
}

window.TD613AshConvergence = Object.freeze({
  version: ASH_CONVERGENCE_VERSION,
  events: localBus,
  publish,
  withOperation: withAshOperation,
  reconcileAuthority,
  currentAuthorityContext,
  authorize,
  transitionCase,
  inventoryCase,
  planDeletion,
  finishDeletion,
  runDryCompatibilityAudit
});

boot().catch(error => {
  document.documentElement.dataset.ashConvergence = 'HELD';
  console.error('Ash constitutional convergence held:', error);
});
