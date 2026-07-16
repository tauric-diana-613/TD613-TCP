import { canonicalDigest } from './ash/canonical-json.js';
import {
  compareReturnDimensions,
  compileAnisotropyReceipt,
  compileCustodianReturnReceipt,
  verifyAnisotropyReceipt,
  verifyCustodianReturnReceipt
} from '../engine/ash-custodian-return.js';
import {
  compileReturnHoldReceipt,
  compileReturnReplayReceipt,
  verifyReturnReadyBundle
} from '../engine/ash-custodian-return-closure.js';
import { decryptAshCapsule, verifySavePoint } from '../engine/ash-keep-continuity.js';

export const ASH_CUSTODIAN_RETURN_CLOSURE_VERSION = 'td613.ash.custodian-return-closure/v0.1';

const LIVE_DB = 'td613-ash-keep';
const SANDBOX_DB = 'td613-ash-return-sandbox';
const SANDBOX_VERSION = 2;
const INSTALL_MARK = Symbol.for('td613.ash-custodian-return-closure.installed');
const SESSION_LAST = 'td613:ash:custodian-return:last:v0.1';

function el(id) { return document.getElementById(id); }
function safe(value) { return JSON.stringify(value, null, 2); }
function split(value) { return [...new Set(String(value || '').split(',').map(item => item.trim()).filter(Boolean))]; }
function randomId(prefix) { return `${prefix}${crypto.randomUUID()}`; }

function openDb(name, version = undefined) {
  return new Promise((resolve, reject) => {
    const request = version ? indexedDB.open(name, version) : indexedDB.open(name);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (name === SANDBOX_DB) {
        for (const store of ['returns', 'imports', 'holds', 'replays']) {
          if (!db.objectStoreNames.contains(store)) db.createObjectStore(store, { keyPath: 'id' });
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error(`${name} database open was blocked.`));
  });
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

async function putSandbox(store, id, value) {
  const db = await openDb(SANDBOX_DB, SANDBOX_VERSION);
  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(store, 'readwrite');
      transaction.objectStore(store).put({ id, value });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error(`${store} transaction aborted.`));
    });
  } finally { db.close(); }
}

async function getSandbox(store, id) {
  const db = await openDb(SANDBOX_DB, SANDBOX_VERSION);
  try {
    if (!db.objectStoreNames.contains(store)) return null;
    return (await requestResult(db.transaction(store).objectStore(store).get(id)))?.value || null;
  } finally { db.close(); }
}

async function getAllSandbox(store) {
  const db = await openDb(SANDBOX_DB, SANDBOX_VERSION);
  try {
    if (!db.objectStoreNames.contains(store)) return [];
    return ((await requestResult(db.transaction(store).objectStore(store).getAll())) || []).map(row => row.value).filter(Boolean);
  } finally { db.close(); }
}

async function beginImport(importId, capsule) {
  await putSandbox('imports', importId, {
    schema: 'td613.ash.custodian-return-import-journal/v0.1',
    import_id: importId,
    case_id: capsule?.case_id || null,
    capsule_digest: capsule?.capsule_digest || null,
    state: 'IMPORTING',
    started_at: new Date().toISOString(),
    live_case_mutated: false
  });
}

async function completeImport(importId, returnId, value) {
  const db = await openDb(SANDBOX_DB, SANDBOX_VERSION);
  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(['imports', 'returns'], 'readwrite');
      transaction.objectStore('returns').put({ id: returnId, value });
      transaction.objectStore('imports').put({ id: importId, value: {
        schema: 'td613.ash.custodian-return-import-journal/v0.1',
        import_id: importId,
        case_id: value.returnReadyBundle.case_id,
        capsule_digest: value.capsule.capsule_digest,
        state: 'SEALED',
        started_at: value.startedAt,
        sealed_at: new Date().toISOString(),
        return_receipt_reference: value.returnReceipt.return_id,
        live_case_mutated: false
      } });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error('Sandbox import was interrupted.'));
    });
  } finally { db.close(); }
}

async function persistReceipt(id, value) {
  const db = await openDb(LIVE_DB);
  try {
    if (!db.objectStoreNames.contains('operations')) return;
    await new Promise((resolve, reject) => {
      const transaction = db.transaction('operations', 'readwrite');
      transaction.objectStore('operations').put({ id, value });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error('Receipt persistence was interrupted.'));
    });
  } finally { db.close(); }
}

function referencesFor(bundle, dimension) {
  const caseMap = bundle.case_map || {};
  if (dimension === 'nodes') return (caseMap.nodes || []).map(value => value.id);
  if (dimension === 'relationships') return (caseMap.relationships || []).map(value => value.id);
  if (dimension === 'room_bridges') {
    const roomByNode = new Map((caseMap.nodes || []).map(node => [node.id, node.room_id]));
    return (caseMap.relationships || []).filter(edge => roomByNode.get(edge.from) !== roomByNode.get(edge.to)).map(edge => edge.id);
  }
  if (dimension === 'source_style_linkage') return [...new Set((caseMap.nodes || []).map(value => value.source_status).filter(Boolean))];
  if (dimension === 'chronology') return (caseMap.private_chronology || []).map((_, index) => `chronology_${index + 1}`);
  if (dimension === 'hypotheses') return (caseMap.nodes || []).filter(value => value.type === 'hypothesis').map(value => value.id);
  if (dimension === 'next_actions') return (caseMap.intended_actions || []).map((_, index) => `action_${index + 1}`);
  if (dimension === 'lifecycle_state') return bundle.authority_context?.lifecycle_rank ? [bundle.authority_context.lifecycle_rank] : [];
  return [];
}

function projectionReferences(projection, dimension) {
  if (dimension === 'nodes') return (projection.nodes || []).map(value => value.id);
  if (dimension === 'relationships') return (projection.relationships || []).map((value, index) => value.id || `relationship_${index + 1}`);
  if (dimension === 'room_bridges') return projection.room_bridges || [];
  if (dimension === 'source_style_linkage') return projection.source_style_linkage || [];
  if (dimension === 'chronology') return projection.chronology || [];
  if (dimension === 'hypotheses') return projection.hypotheses || [];
  if (dimension === 'next_actions') return projection.next_actions || [];
  if (dimension === 'lifecycle_state') return projection.lifecycle_state ? [projection.lifecycle_state] : [];
  return [];
}

function dimensionStatus(localRefs, externalRefs, lane) {
  if (lane === 'local') return localRefs.length ? 'RECOVERED' : 'MISSING';
  if (!localRefs.length && !externalRefs.length) return 'MISSING';
  if (!externalRefs.length) return 'MISSING';
  if (externalRefs.length >= localRefs.length) return 'RECOVERED';
  return 'PARTIAL';
}

function buildDimensions(bundle, projection, lane) {
  const result = {};
  for (const key of ['nodes','relationships','room_bridges','source_style_linkage','chronology','hypotheses','next_actions','lifecycle_state']) {
    const localRefs = referencesFor(bundle, key);
    const externalRefs = projectionReferences(projection, key);
    const recovered = lane === 'local' ? localRefs : externalRefs;
    result[key] = {
      status: dimensionStatus(localRefs, externalRefs, lane),
      recoveredReferences: recovered,
      missingReferences: lane === 'external' ? localRefs.filter(value => !externalRefs.includes(value)) : [],
      observations: [`${lane} Reader recovered ${recovered.length} declared ${key.replaceAll('_', ' ')} reference(s).`]
    };
  }
  return result;
}

function purposeProjection(bundle, purpose, refs) {
  const caseMap = bundle.case_map || {};
  const allowed = new Set(refs);
  const nodes = (caseMap.nodes || []).filter(node => allowed.has(node.id)).map(node => ({ id: node.id, type: node.type, source_status: node.source_status }));
  const nodeIds = new Set(nodes.map(node => node.id));
  return {
    schema: 'td613.ash.purpose-shaped-projection/v0.1',
    purpose,
    nodes,
    relationships: (caseMap.relationships || []).filter(edge => nodeIds.has(edge.from) && nodeIds.has(edge.to)).map(edge => ({ id: edge.id, from: edge.from, to: edge.to, type: edge.type })),
    chronology: [],
    hypotheses: nodes.filter(node => node.type === 'hypothesis').map(node => node.id),
    next_actions: [],
    room_bridges: [],
    source_style_linkage: [...new Set(nodes.map(node => node.source_status).filter(Boolean))],
    lifecycle_state: null,
    exclusions: ['Ash Capsule','Case Map','room keys','complete Route Memory','return-ready bundle']
  };
}

async function recordHold({ failureClass, capsule, bundle, verification, observation }) {
  const receipt = await compileReturnHoldReceipt({
    caseId: bundle?.case_id || capsule?.case_id || null,
    failureClass,
    capsuleDigest: capsule?.capsule_digest || null,
    bundleDigest: bundle?.bundle_digest || null,
    failedChecks: verification?.holds || [],
    observations: [observation].filter(Boolean)
  });
  await putSandbox('holds', receipt.hold_id, receipt);
  el('returnFailureReceipt').textContent = safe(receipt);
  return receipt;
}

function classifyFailure(error, verification = null, bundle = null) {
  if (/authentication failed|passphrase/i.test(error?.message || '')) return 'WRONG_PASSPHRASE';
  if (verification?.state === 'STALE_RECEIPT_HOLD') return 'STALE_RECEIPT_HOLD';
  if (verification?.state === 'TAMPER_HOLD') return 'TAMPER_HOLD';
  if (!bundle || /return-ready bundle is absent/i.test(error?.message || '')) return 'PARTIAL_CAPSULE_HOLD';
  if (/interrupted/i.test(error?.message || '')) return 'INTERRUPTED_IMPORT_HOLD';
  return 'UNKNOWN_HOLD';
}

async function runReturn() {
  const status = el('returnStatus');
  const file = el('returnCapsuleFile')?.files?.[0];
  if (!file) throw new Error('Choose an Ash Capsule first.');
  const startedAt = new Date().toISOString();
  const capsule = JSON.parse(await file.text());
  const importId = randomId('return_import_');
  await beginImport(importId, capsule);
  let payload = null;
  let bundle = null;
  let verification = null;
  try {
    status.textContent = 'Authenticating Capsule and verifying return-ready continuity…';
    payload = await decryptAshCapsule(capsule, el('returnPassphrase')?.value || '');
    bundle = payload?.case_bundle?.returnReadyBundle || payload?.case_bundle?.return_ready_bundle || null;
    if (!bundle) throw new Error('Return-ready bundle is absent; partial Capsule held.');
    if (!await verifySavePoint(payload.save_point)) throw new Error('Capsule Save Point verification failed.');
    verification = await verifyReturnReadyBundle(bundle);
    if (!verification.valid) throw new Error(`Return-ready bundle verification held: ${verification.holds.join(', ')}`);
    if (payload.case_id !== bundle.case_id || payload.save_point.save_point_id !== bundle.selected.save_point_reference || payload.save_point.save_point_digest !== bundle.history.save_points.find(value => value.save_point_id === bundle.selected.save_point_reference)?.save_point_digest) {
      verification = { ...verification, valid: false, state: 'STALE_RECEIPT_HOLD', holds: [...verification.holds, 'capsule_save_point_binding'] };
      throw new Error('Capsule Save Point is stale against the return-ready bundle.');
    }
    const projection = purposeProjection(bundle, el('returnPurpose')?.value || 'reconstruct-declared-case-outline', split(el('returnRefs')?.value));
    const externalProjectionDigest = await canonicalDigest('TD613:ASH:PURPOSE-PROJECTION:v1', projection);
    const comparison = compareReturnDimensions({
      caseMap: bundle.case_map,
      routeMemory: bundle.route_memory,
      authorityContext: bundle.authority_context,
      lifecycle: bundle.lifecycle_receipt?.lifecycle
    }, projection);
    const returnReceipt = await compileCustodianReturnReceipt({
      caseId: bundle.case_id,
      sandboxDatabase: SANDBOX_DB,
      savePointReference: payload.save_point.save_point_id,
      savePointDigest: payload.save_point.save_point_digest,
      capsuleDigest: capsule.capsule_digest,
      custodyRootReference: bundle.authority_context.custody_root_receipt_reference,
      caseMapDigest: bundle.case_map.case_map_digest,
      routeMemoryDigest: bundle.route_memory.route_memory_digest,
      lifecycleRank: bundle.authority_context.lifecycle_rank,
      dimensions: buildDimensions(bundle, projection, 'local'),
      missingness: Object.entries(comparison).filter(([, value]) => value?.local === 0).map(([key]) => key),
      observations: ['Authenticated Capsule decrypted locally.', 'Return-ready history and selected receipts verified.', 'Recovery written only to isolated sandbox database.', 'Live Ash case remained untouched.']
    });
    const anisotropyReceipt = await compileAnisotropyReceipt({
      caseId: bundle.case_id,
      returnReceiptReference: returnReceipt.return_id,
      returnReceiptDigest: returnReceipt.receipt_digest,
      projectionPurpose: projection.purpose,
      externalProjectionDigest,
      externalMaterialExclusions: projection.exclusions,
      localReader: buildDimensions(bundle, projection, 'local'),
      externalReader: buildDimensions(bundle, projection, 'external'),
      observations: ['External Reader received only a declared purpose-shaped projection.', 'Null, missing, contradictory, rejected, and unresolved outcomes remain admissible.', 'No universal recovery score was emitted.']
    });
    const value = { capsule, payload, returnReadyBundle: bundle, projection, verification, returnReceipt, anisotropyReceipt, startedAt };
    await completeImport(importId, returnReceipt.return_id, value);
    await persistReceipt(`${bundle.case_id}:custodian-return:${returnReceipt.return_id}`, returnReceipt);
    await persistReceipt(`${bundle.case_id}:anisotropy:${anisotropyReceipt.anisotropy_id}`, anisotropyReceipt);
    sessionStorage.setItem(SESSION_LAST, returnReceipt.return_id);
    el('returnReceipt').textContent = safe(returnReceipt);
    el('anisotropyReceipt').textContent = safe(anisotropyReceipt);
    el('returnFailureReceipt').textContent = 'No hold receipt emitted.';
    el('replayCustodianReturn').disabled = false;
    status.textContent = 'Return-ready sandbox reconstitution sealed; live case untouched.';
    window.dispatchEvent(new CustomEvent('td613:ash:custodian-return-closed', { detail: {
      case_id: bundle.case_id,
      return_receipt_reference: returnReceipt.return_id,
      anisotropy_receipt_reference: anisotropyReceipt.anisotropy_id,
      return_ready_bundle_digest: bundle.bundle_digest
    } }));
    return value;
  } catch (error) {
    const failureClass = classifyFailure(error, verification, bundle);
    const hold = await recordHold({ failureClass, capsule, bundle, verification, observation: error.message });
    const journal = await getSandbox('imports', importId);
    await putSandbox('imports', importId, { ...journal, state: failureClass, held_at: new Date().toISOString(), hold_reference: hold.hold_id, live_case_mutated: false });
    status.textContent = error.message;
    throw error;
  } finally {
    if (el('returnPassphrase')) el('returnPassphrase').value = '';
  }
}

async function replayReturn() {
  const returnId = sessionStorage.getItem(SESSION_LAST);
  if (!returnId) throw new Error('No sealed return is available for replay.');
  const record = await getSandbox('returns', returnId);
  if (!record) throw new Error('Sandbox return record is missing.');
  const [bundleVerification, returnVerified, anisotropyVerified] = await Promise.all([
    verifyReturnReadyBundle(record.returnReadyBundle),
    verifyCustodianReturnReceipt(record.returnReceipt),
    verifyAnisotropyReceipt(record.anisotropyReceipt)
  ]);
  const verified = bundleVerification.valid && returnVerified && anisotropyVerified;
  const replay = await compileReturnReplayReceipt({
    caseId: record.returnReadyBundle.case_id,
    returnReceiptReference: record.returnReceipt.return_id,
    returnReceiptDigest: record.returnReceipt.receipt_digest,
    anisotropyReceiptReference: record.anisotropyReceipt.anisotropy_id,
    anisotropyReceiptDigest: record.anisotropyReceipt.receipt_digest,
    returnReadyBundleDigest: record.returnReadyBundle.bundle_digest,
    verificationState: verified ? 'REPLAY_VERIFIED' : 'REPLAY_HELD',
    sandboxRecordFound: true,
    observations: verified ? ['Sandbox record and all bound digests verified without reexecuting reconstruction.'] : ['Replay verification detected a stale or altered record.']
  });
  await putSandbox('replays', replay.replay_id, replay);
  el('returnReplayReceipt').textContent = safe(replay);
  el('returnStatus').textContent = replay.verification_state;
  if (!verified) {
    await recordHold({ failureClass: 'REPLAY_HOLD', bundle: record.returnReadyBundle, verification: bundleVerification, observation: 'Replay verification failed.' });
    throw new Error('Replay held because a bound record changed.');
  }
  return replay;
}

export async function recoverInterruptedImports() {
  const rows = await getAllSandbox('imports');
  const interrupted = rows.filter(value => value.state === 'IMPORTING');
  for (const journal of interrupted) {
    const hold = await compileReturnHoldReceipt({
      caseId: journal.case_id,
      failureClass: 'INTERRUPTED_IMPORT_HOLD',
      capsuleDigest: journal.capsule_digest,
      observations: ['An unsealed sandbox import journal was recovered and held without touching the live case.']
    });
    await putSandbox('holds', hold.hold_id, hold);
    await putSandbox('imports', journal.import_id, { ...journal, state: 'INTERRUPTED_IMPORT_HOLD', recovered_at: new Date().toISOString(), hold_reference: hold.hold_id, live_case_mutated: false });
  }
  return interrupted.length;
}

export async function seedInterruptedImportForProbe(caseId = 'case_synthetic_return') {
  const importId = randomId('return_import_interrupted_');
  await putSandbox('imports', importId, {
    schema: 'td613.ash.custodian-return-import-journal/v0.1',
    import_id: importId,
    case_id: caseId,
    capsule_digest: `sha256:${'0'.repeat(64)}`,
    state: 'IMPORTING',
    started_at: new Date().toISOString(),
    live_case_mutated: false
  });
  return importId;
}

function enhanceSurface() {
  const status = el('returnStatus');
  if (status) {
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
  }
  const panel = el('ashReturnPanel');
  if (!panel || el('returnFailureReceipt')) return;
  const failure = document.createElement('pre');
  failure.className = 'receipt';
  failure.id = 'returnFailureReceipt';
  failure.textContent = 'No hold receipt emitted.';
  const replay = document.createElement('pre');
  replay.className = 'receipt';
  replay.id = 'returnReplayReceipt';
  replay.textContent = 'No Return Replay Receipt yet.';
  panel.append(failure, replay);
  panel.setAttribute('aria-label', 'Custodian Return and Anisotropy');
}

export function installAshCustodianReturnClosure(doc = document, host = window) {
  if (!doc?.documentElement || host[INSTALL_MARK]) return false;
  const run = el('runCustodianReturn');
  const replay = el('replayCustodianReturn');
  if (!run || !replay) return false;
  host[INSTALL_MARK] = true;
  enhanceSurface();
  run.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    run.disabled = true;
    runReturn().catch(() => {}).finally(() => { run.disabled = false; });
  }, true);
  replay.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    replay.disabled = true;
    replayReturn().catch(error => { el('returnStatus').textContent = error.message; }).finally(() => { replay.disabled = false; });
  }, true);
  recoverInterruptedImports().catch(console.error);
  doc.documentElement.dataset.ashCustodianReturnClosure = ASH_CUSTODIAN_RETURN_CLOSURE_VERSION;
  host.TD613AshCustodianReturnClosure = Object.freeze({
    version: ASH_CUSTODIAN_RETURN_CLOSURE_VERSION,
    runReturn,
    replayReturn,
    recoverInterruptedImports,
    seedInterruptedImportForProbe
  });
  return true;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') installAshCustodianReturnClosure(document, window);
