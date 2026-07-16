import { compileReturnReadyBundle, verifyReturnReadyBundle } from '../engine/ash-custodian-return-closure.js';
import { compileSavePoint, encryptAshCapsule } from '../engine/ash-keep-continuity.js';

export const ASH_RETURN_READY_EXPORT_VERSION = 'td613.ash.return-ready-export/v0.1';

const DB_NAME = 'td613-ash-keep';
const DB_VERSION = 2;
const POINTER_KEY = 'td613.ash-keep.current-case';
const INSTALL_MARK = Symbol.for('td613.ash-return-ready-export.installed');

function el(id) { return document.getElementById(id); }
function unwrap(record) { return record?.value ?? record; }
function timeValue(value) { return Date.parse(value?.updated_at || value?.created_at || value?.observed_at || value?.compiled_at || '') || 0; }
function latest(values, predicate = () => true) { return values.map(unwrap).filter(value => value && predicate(value)).sort((a, b) => timeValue(a) - timeValue(b)).at(-1) || null; }

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Return-ready export was blocked by another Ash tab.'));
  });
}

function getRecord(db, store, id) {
  return new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains(store)) return resolve(null);
    const request = db.transaction(store).objectStore(store).get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

function getAll(db, store) {
  return new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains(store)) return resolve([]);
    const request = db.transaction(store).objectStore(store).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

function putWrapped(db, store, id, value) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, 'readwrite');
    transaction.objectStore(store).put({ id, value });
    transaction.oncomplete = () => resolve(value);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error(`Writing ${store} was interrupted.`));
  });
}

function downloadJson(filename, value) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function collectReturnState(caseId) {
  const db = await openDb();
  try {
    const caseMap = await getRecord(db, 'cases', caseId);
    if (!caseMap) throw new Error('The current Case Map is unavailable.');
    const roomRules = unwrap(await getRecord(db, 'roomRules', caseId));
    const routeMemory = unwrap(await getRecord(db, 'routeMemory', caseId));
    const lifecycleRecord = unwrap(await getRecord(db, 'lifecycle', caseId)) || {};
    const authorityBinding = unwrap(await getRecord(db, 'authorityBindings', caseId));
    const authorityContext = authorityBinding?.authority_context_reference
      ? unwrap(await getRecord(db, 'authorityContexts', authorityBinding.authority_context_reference))
      : null;
    const [testsRows, draftsRows, reviewsRows, releasesRows, saveRows, custodyRows] = await Promise.all(
      ['tests', 'drafts', 'reviews', 'releases', 'savePoints', 'custodyReceipts'].map(store => getAll(db, store))
    );
    const rebuildTests = testsRows.map(unwrap).filter(value => value?.case_id === caseId && value.case_map_digest === caseMap.case_map_digest);
    const drafts = draftsRows.map(unwrap).filter(value => value?.case_id === caseId && value.case_map_digest === caseMap.case_map_digest);
    const draftIds = new Set(drafts.map(value => value.draft_id));
    const reviews = reviewsRows.map(unwrap).filter(value => draftIds.has(value?.draft_id) && value.case_map_digest === caseMap.case_map_digest);
    const releases = releasesRows.map(unwrap).filter(value => value?.case_id === caseId && value.case_map_digest === caseMap.case_map_digest);
    const savePoints = saveRows.map(unwrap).filter(value => value?.case_id === caseId && value.case_map_digest === caseMap.case_map_digest && value.route_memory_digest === routeMemory?.route_memory_digest);
    const custodyReference = authorityContext?.custody_root_receipt_reference || lifecycleRecord.custody_receipt_reference || null;
    const custodyReceipt = custodyRows.map(unwrap).find(value => [value?.receipt_id, value?.receipt_digest, value?.manifest_digest].includes(custodyReference)) || null;
    const selectedRelease = latest(releases, value => value.receipt_id === authorityContext?.current_release_reference) || latest(releases);
    const selectedReview = latest(reviews, value => value.review_id === authorityContext?.current_review_reference) || latest(reviews, value => value.review_id === selectedRelease?.review_reference);
    const selectedDraft = latest(drafts, value => value.draft_id === selectedRelease?.draft_id || value.draft_id === selectedReview?.draft_id) || latest(drafts);
    const selectedRebuild = latest(rebuildTests, value => value.test_id === authorityContext?.rebuild_receipt_reference) || latest(rebuildTests);
    const selectedSave = latest(savePoints, value => value.save_point_id === authorityContext?.current_continuity_reference) || latest(savePoints);
    return {
      db,
      caseMap,
      roomRules,
      routeMemory,
      lifecycleRecord,
      authorityContext,
      custodyReceipt,
      rebuildTests,
      drafts,
      reviews,
      releases,
      savePoints,
      selectedRebuild,
      selectedDraft,
      selectedReview,
      selectedRelease,
      selectedSave
    };
  } catch (error) {
    db.close();
    throw error;
  }
}

async function ensureContinuity(state) {
  if (state.selectedSave && state.authorityContext?.lifecycle_rank === 'CONTINUITY_SEALED') return false;
  if (!state.selectedRelease) throw new Error('A current Release Receipt is required before a return-ready Capsule can be exported.');
  const point = await compileSavePoint({
    caseId: state.caseMap.case_id,
    caseMapDigest: state.caseMap.case_map_digest,
    routeMemoryDigest: state.routeMemory.route_memory_digest,
    releaseReceiptReference: state.selectedRelease.receipt_id,
    releaseReceiptDigest: state.selectedRelease.receipt_digest,
    releaseCreatedAt: state.selectedRelease.created_at,
    evidenceInventory: state.caseMap.nodes.filter(node => ['artifact', 'source'].includes(node.type)).map(node => node.id),
    unansweredQuestions: state.caseMap.open_questions || [],
    corroborationState: state.caseMap.nodes.filter(node => node.type === 'claim').map(node => ({ node_id: node.id, posture: node.confidence_posture })),
    hypothesisPosture: state.caseMap.nodes.filter(node => node.type === 'hypothesis').map(node => ({ node_id: node.id, posture: node.confidence_posture })),
    nextStepPosture: state.caseMap.intended_actions || [],
    tamperState: state.caseMap.tamper_state,
    evidenceBasis: ['return-ready export continuity seal']
  });
  await putWrapped(state.db, 'savePoints', point.save_point_id, point);
  window.dispatchEvent(new CustomEvent('td613:ash:continuity-kept', { detail: { case_id: state.caseMap.case_id, continuity_reference: point.save_point_id } }));
  return true;
}

async function buildAndExport() {
  await window.TD613AshConvergence?.authorize?.('EXPORT_CAPSULE');
  const caseId = localStorage.getItem(POINTER_KEY);
  if (!caseId) throw new Error('Open a case before exporting a return-ready Capsule.');
  let state = await collectReturnState(caseId);
  const continuityCreated = await ensureContinuity(state);
  state.db.close();
  if (continuityCreated || state.authorityContext?.lifecycle_rank !== 'CONTINUITY_SEALED') {
    await window.TD613AshConvergence?.reconcileAuthority?.('return-ready-capsule-export');
    state = await collectReturnState(caseId);
  }
  try {
    if (!state.authorityContext || state.authorityContext.lifecycle_rank !== 'CONTINUITY_SEALED') {
      throw new Error('Return-ready export requires a current CONTINUITY_SEALED Authority Context.');
    }
    const returnReadyBundle = await compileReturnReadyBundle({
      caseId,
      readinessReceipt: state.lifecycleRecord.readiness_receipt,
      custodyReceipt: state.custodyReceipt,
      authorityContext: state.authorityContext,
      lifecycleReceipt: state.lifecycleRecord.lifecycle_receipt,
      caseMap: state.caseMap,
      roomRules: state.roomRules,
      routeMemory: state.routeMemory,
      rebuildTests: state.rebuildTests,
      drafts: state.drafts,
      reviews: state.reviews,
      releases: state.releases,
      savePoints: state.savePoints,
      selected: {
        rebuildTestReference: state.selectedRebuild?.test_id,
        draftReference: state.selectedDraft?.draft_id,
        reviewReference: state.selectedReview?.review_id,
        releaseReference: state.selectedRelease?.receipt_id,
        savePointReference: state.selectedSave?.save_point_id
      }
    });
    const verification = await verifyReturnReadyBundle(returnReadyBundle);
    if (!verification.valid) throw new Error(`Return-ready bundle held: ${verification.holds.join(', ')}`);
    const passphrase = el('capsulePassphrase')?.value || '';
    const capsule = await encryptAshCapsule({
      passphrase,
      caseId,
      savePoint: state.selectedSave,
      caseBundle: {
        caseMap: state.caseMap,
        roomRules: state.roomRules,
        routeMemory: state.routeMemory,
        returnReadyBundle
      }
    });
    downloadJson(`td613-ash-return-ready-${caseId}.json`, capsule);
    if (el('capsulePassphrase')) el('capsulePassphrase').value = '';
    if (el('capsuleStatus')) el('capsuleStatus').textContent = 'Return-ready encrypted copy exported. Passphrase and key were not stored.';
    window.dispatchEvent(new CustomEvent('td613:ash:return-ready-capsule-exported', { detail: { case_id: caseId, return_ready_bundle_digest: returnReadyBundle.bundle_digest } }));
  } finally {
    state.db.close();
  }
}

export function installAshReturnReadyExport(doc = document, host = window) {
  if (!doc?.documentElement || host[INSTALL_MARK]) return false;
  const button = el('exportCapsule');
  if (!button) return false;
  host[INSTALL_MARK] = true;
  button.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (el('capsuleStatus')) el('capsuleStatus').textContent = 'Compiling return-ready continuity bundle…';
    buildAndExport().catch(error => {
      if (el('capsuleStatus')) el('capsuleStatus').textContent = error.message;
    });
  }, true);
  doc.documentElement.dataset.ashReturnReadyExport = ASH_RETURN_READY_EXPORT_VERSION;
  return true;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') installAshReturnReadyExport(document, window);
