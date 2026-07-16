import { canonicalDigest } from './ash/canonical-json.js';
import { decryptAshCapsule, verifySavePoint } from '../engine/ash-keep-continuity.js';
import { verifyCaseMap } from '../engine/ash-keep-core.js';
import {
  compareReturnDimensions,
  compileAnisotropyReceipt,
  compileCustodianReturnReceipt
} from '../engine/ash-custodian-return.js';

export const ASH_CUSTODIAN_RETURN_VERSION = 'td613.ash.custodian-return/v0.1';
const LIVE_DB = 'td613-ash-keep';
const SANDBOX_DB = 'td613-ash-return-sandbox';
const POINTER_KEY = 'td613.ash-keep.current-case';
const INSTALL_MARK = Symbol.for('td613.ash-custodian-return.installed');
const RECEIPT_STORE = 'operations';

function el(id) { return document.getElementById(id); }
function safe(value) { return JSON.stringify(value, null, 2); }
function split(value) { return [...new Set(String(value || '').split(',').map(item => item.trim()).filter(Boolean))]; }

function openDb(name, version = 2) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (name === SANDBOX_DB && !db.objectStoreNames.contains('returns')) db.createObjectStore('returns', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error(`${name} database open was blocked.`));
  });
}

async function writeSandbox(id, value) {
  const db = await openDb(SANDBOX_DB, 1);
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction('returns', 'readwrite');
      tx.objectStore('returns').put({ id, value });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('Sandbox transaction aborted.'));
    });
  } finally { db.close(); }
}

async function persistReceipt(id, value) {
  const db = await openDb(LIVE_DB, 2);
  try {
    if (!db.objectStoreNames.contains(RECEIPT_STORE)) return;
    await new Promise((resolve, reject) => {
      const tx = db.transaction(RECEIPT_STORE, 'readwrite');
      tx.objectStore(RECEIPT_STORE).put({ id, value });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } finally { db.close(); }
}

function statusFor(localCount, externalCount) {
  if (!localCount && !externalCount) return 'MISSING';
  if (localCount && !externalCount) return 'MISSING';
  if (externalCount >= localCount) return 'RECOVERED';
  return 'PARTIAL';
}

function buildDimensions(comparison, lane) {
  const result = {};
  for (const key of ['nodes','relationships','room_bridges','source_style_linkage','chronology','hypotheses','next_actions','lifecycle_state']) {
    const item = comparison[key] || { local: 0, external: 0 };
    const count = lane === 'local' ? item.local : item.external;
    result[key] = {
      status: lane === 'local' ? (item.local ? 'RECOVERED' : 'MISSING') : statusFor(item.local, item.external),
      observations: [`${lane} Reader recovered ${count} declared component item(s).`]
    };
  }
  return result;
}

function purposeProjection(payload, purpose, refs) {
  const bundle = payload.case_bundle || {};
  const caseMap = bundle.caseMap || bundle.case_map || bundle.case || {};
  const allowed = new Set(refs);
  const nodes = (caseMap.nodes || []).filter(node => allowed.has(node.id)).map(node => ({ id: node.id, type: node.type, source_status: node.source_status }));
  const nodeIds = new Set(nodes.map(node => node.id));
  return {
    schema: 'td613.ash.purpose-shaped-projection/v0.1',
    purpose,
    nodes,
    relationships: (caseMap.relationships || []).filter(edge => nodeIds.has(edge.from) && nodeIds.has(edge.to)).map(edge => ({ from: edge.from, to: edge.to, type: edge.type })),
    chronology: [],
    hypotheses: nodes.filter(node => node.type === 'hypothesis').map(node => node.id),
    next_actions: [],
    room_bridges: [],
    source_style_linkage: nodes.map(node => node.source_status).filter(Boolean),
    lifecycle_state: null,
    exclusions: ['Ash Capsule','Case Map','room keys','complete Route Memory']
  };
}

function injectSurface() {
  const save = el('workspace-save');
  if (!save || el('ashReturnPanel')) return;
  const panel = document.createElement('section');
  panel.className = 'tool-section wide';
  panel.id = 'ashReturnPanel';
  panel.innerHTML = `
    <h3>Custodian Return · isolated recovery</h3>
    <p class="sub">Reconstitute an authenticated Ash Capsule inside a separate sandbox database. The live case remains untouched. External comparison receives only a declared purpose-shaped projection.</p>
    <div class="field-grid">
      <div class="field full"><label for="returnCapsuleFile">Ash Capsule</label><input id="returnCapsuleFile" type="file" accept="application/json,.json"></div>
      <div class="field"><label for="returnPassphrase">Passphrase</label><input id="returnPassphrase" type="password" autocomplete="current-password"></div>
      <div class="field"><label for="returnPurpose">External Reader purpose</label><input id="returnPurpose" value="reconstruct-declared-case-outline"></div>
      <div class="field full"><label for="returnRefs">Opaque references permitted in external projection</label><input id="returnRefs" placeholder="node_claim, node_source"></div>
    </div>
    <div class="actions"><button class="btn primary" id="runCustodianReturn">Run isolated return</button><button class="btn" id="replayCustodianReturn" disabled>Replay last receipt</button></div>
    <p class="status-line" id="returnStatus">No return run yet.</p>
    <pre class="receipt" id="returnReceipt">No Custodian Return Receipt yet.</pre>
    <pre class="receipt" id="anisotropyReceipt">No Anisotropy Receipt yet.</pre>`;
  save.querySelector('.tools-grid')?.append(panel);
}

export function installAshCustodianReturn(doc = document, host = window) {
  if (!doc?.documentElement || host[INSTALL_MARK]) return false;
  host[INSTALL_MARK] = true;
  injectSurface();
  let last = null;
  el('runCustodianReturn')?.addEventListener('click', async () => {
    const status = el('returnStatus');
    try {
      const file = el('returnCapsuleFile')?.files?.[0];
      if (!file) throw new Error('Choose an Ash Capsule first.');
      status.textContent = 'Verifying Capsule and opening isolated sandbox…';
      const capsule = JSON.parse(await file.text());
      const payload = await decryptAshCapsule(capsule, el('returnPassphrase').value);
      if (!await verifySavePoint(payload.save_point)) throw new Error('Save Point verification failed; nothing was imported.');
      const bundle = payload.case_bundle || {};
      const caseMap = bundle.caseMap || bundle.case_map || bundle.case;
      if (!caseMap || !await verifyCaseMap(caseMap)) throw new Error('Case Map verification failed; nothing was imported.');
      if (payload.save_point.case_map_digest !== caseMap.case_map_digest) throw new Error('Save Point and Case Map digest mismatch; nothing was imported.');
      const projection = purposeProjection(payload, el('returnPurpose').value, split(el('returnRefs').value));
      const externalProjectionDigest = await canonicalDigest('TD613:ASH:PURPOSE-PROJECTION:v1', projection);
      const comparison = compareReturnDimensions(bundle, projection);
      const returnReceipt = await compileCustodianReturnReceipt({
        caseId: payload.case_id,
        sandboxDatabase: SANDBOX_DB,
        savePointReference: payload.save_point.save_point_id,
        savePointDigest: payload.save_point.save_point_digest,
        capsuleDigest: capsule.capsule_digest,
        custodyRootReference: bundle.authorityContext?.custody_root_receipt_reference || bundle.authority_context?.custody_root_receipt_reference || null,
        caseMapDigest: caseMap.case_map_digest,
        routeMemoryDigest: bundle.routeMemory?.route_memory_digest || bundle.route_memory?.route_memory_digest || payload.save_point.route_memory_digest,
        lifecycleRank: bundle.authorityContext?.lifecycle_rank || bundle.authority_context?.lifecycle_rank || null,
        dimensions: buildDimensions(comparison, 'local'),
        missingness: Object.entries(comparison).filter(([, value]) => value?.local === 0).map(([key]) => key),
        observations: ['Authenticated Capsule decrypted locally.', 'Recovery written only to isolated sandbox database.', 'Live Ash case remained untouched.']
      });
      const anisotropyReceipt = await compileAnisotropyReceipt({
        caseId: payload.case_id,
        returnReceiptReference: returnReceipt.return_id,
        returnReceiptDigest: returnReceipt.receipt_digest,
        projectionPurpose: projection.purpose,
        externalProjectionDigest,
        localReader: buildDimensions(comparison, 'local'),
        externalReader: buildDimensions(comparison, 'external'),
        observations: ['External Reader received only a purpose-shaped projection.', 'No universal recovery score was emitted.']
      });
      await writeSandbox(returnReceipt.return_id, { payload, projection, returnReceipt, anisotropyReceipt });
      await persistReceipt(`${payload.case_id}:custodian-return:${returnReceipt.return_id}`, returnReceipt);
      await persistReceipt(`${payload.case_id}:anisotropy:${anisotropyReceipt.anisotropy_id}`, anisotropyReceipt);
      last = { returnReceipt, anisotropyReceipt };
      el('returnReceipt').textContent = safe(returnReceipt);
      el('anisotropyReceipt').textContent = safe(anisotropyReceipt);
      el('replayCustodianReturn').disabled = false;
      status.textContent = 'Sandbox return sealed; live case untouched.';
      host.dispatchEvent(new CustomEvent('td613:ash:custodian-return', { detail: { case_id: payload.case_id, return_receipt_reference: returnReceipt.return_id, anisotropy_receipt_reference: anisotropyReceipt.anisotropy_id } }));
    } catch (error) {
      status.textContent = error.message;
    }
  });
  el('replayCustodianReturn')?.addEventListener('click', () => {
    if (!last) return;
    el('returnReceipt').textContent = safe(last.returnReceipt);
    el('anisotropyReceipt').textContent = safe(last.anisotropyReceipt);
    el('returnStatus').textContent = 'Last sealed receipt replayed from current session.';
  });
  doc.documentElement.dataset.ashCustodianReturn = ASH_CUSTODIAN_RETURN_VERSION;
  return true;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') installAshCustodianReturn(document, window);
