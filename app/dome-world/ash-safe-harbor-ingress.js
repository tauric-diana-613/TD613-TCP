import {
  compileSafeHarborCustodyBinding,
  verifySafeHarborCustodyBinding,
  verifySafeHarborIngressEnvelope
} from '../engine/ash-safe-harbor-ingress.js';

const DB_NAME = 'td613-ash-ingress-v1';
const DB_VERSION = 1;
const STORE = 'envelopes';

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'token' });
        store.createIndex('packet_hash', 'packet_hash', { unique: false });
        store.createIndex('state', 'state', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB open failed'));
  });
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB request failed'));
  });
}

async function readRecord(token) {
  const db = await openDb();
  try {
    const transaction = db.transaction(STORE, 'readonly');
    return await requestResult(transaction.objectStore(STORE).get(token));
  } finally {
    db.close();
  }
}

async function updateRecord(record) {
  const db = await openDb();
  try {
    const transaction = db.transaction(STORE, 'readwrite');
    await requestResult(transaction.objectStore(STORE).put(record));
  } finally {
    db.close();
  }
}

function currentAuthority() {
  return window.TD613AshConvergence?.currentAuthorityContext?.() || null;
}

function authorityInputs() {
  const authorityContext = currentAuthority();
  return {
    authorityContext,
    caseMap: authorityContext ? {
      case_id: authorityContext.case_id,
      case_map_digest: authorityContext.case_map_digest
    } : null,
    routeMemory: authorityContext ? {
      route_memory_digest: authorityContext.route_memory_digest
    } : null
  };
}

function createPanel() {
  const panel = document.createElement('section');
  panel.id = 'safeHarborIngressReview';
  panel.className = 'ash-panel ash-safe-harbor-ingress';
  panel.setAttribute('data-td613-skip', 'true');
  panel.innerHTML = `
    <div class="section-label">Safe Harbor custody-root adapter</div>
    <h2>Reference arrived; custody has not.</h2>
    <p class="note">Review a bounded Safe Harbor reference envelope. Raw corpus, Case Map, Route Memory, keys, private aliases, and Capsule plaintext remain outside this route.</p>
    <div class="metric-block roomy">
      <div class="metric-row"><span class="label">Ingress state</span><span class="value" id="safeHarborIngressState">loading local envelope</span></div>
      <div class="metric-row"><span class="label">Packet</span><span class="value" id="safeHarborIngressPacket">pending</span></div>
      <div class="metric-row"><span class="label">Packet hash</span><span class="value" id="safeHarborIngressHash">pending</span></div>
      <div class="metric-row"><span class="label">Selected references</span><span class="value" id="safeHarborIngressRefs">pending</span></div>
      <div class="metric-row"><span class="label">Signature lane</span><span class="value" id="safeHarborIngressSignature">pending</span></div>
      <div class="metric-row"><span class="label">Local expiry posture</span><span class="value" id="safeHarborIngressExpiry">pending</span></div>
    </div>
    <div class="button-grid compact">
      <button class="control secondary" id="safeHarborBindL0" type="button">Bind L0 reference</button>
      <button class="control" id="safeHarborBindL1" type="button">Bind L1 with current case</button>
      <button class="control secondary" id="safeHarborCancelIngress" type="button">Cancel ingress</button>
    </div>
    <pre class="code-panel" id="safeHarborIngressReceipt">No custody binding receipt exists.</pre>
  `;
  const main = document.querySelector('main') || document.querySelector('.ash-shell') || document.body;
  main.insertBefore(panel, main.firstChild || null);
  return panel;
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = String(value ?? '');
}

function disable(panel, disabled = true) {
  panel.querySelectorAll('button').forEach(button => { button.disabled = disabled; });
}

async function renderToken(token) {
  const panel = createPanel();
  const cleanUrl = new URL(window.location.href);
  cleanUrl.searchParams.delete('safe_harbor_token');
  window.history.replaceState({}, document.title, cleanUrl.href);

  let record;
  try {
    record = await readRecord(token);
  } catch (error) {
    setText('safeHarborIngressState', `local storage hold: ${error?.message || 'unavailable'}`);
    disable(panel);
    return;
  }

  if (!record || record.token !== token) {
    setText('safeHarborIngressState', 'MISSING_REFERENCE_HOLD');
    disable(panel);
    return;
  }
  const envelope = record.envelope;
  const verified = await verifySafeHarborIngressEnvelope(envelope);
  const elapsed = Math.max(0, Date.now() - Number(record.created_local_ms || 0));
  const locallyExpired = elapsed > Number(envelope?.local_expiry_posture?.ttl_ms || 0);
  const originMatches = record.origin === window.location.origin && envelope?.origin === window.location.origin;
  const replayed = record.state === 'CONSUMED' || record.state === 'CANCELLED';
  const eligible = verified && envelope?.ingress_eligible === true && !locallyExpired && originMatches && !replayed;

  setText('safeHarborIngressState', eligible ? 'INGRESS_ENVELOPE_ELIGIBLE / operator choice required' : replayed ? 'REPLAY_HOLD' : locallyExpired ? 'EXPIRED_LOCAL_POSTURE_HOLD' : !originMatches ? 'ORIGIN_MISMATCH_HOLD' : 'TAMPER_HOLD');
  setText('safeHarborIngressPacket', envelope?.packet?.packet_id || 'missing');
  setText('safeHarborIngressHash', envelope?.packet?.packet_hash_sha256 || 'missing');
  setText('safeHarborIngressRefs', `${envelope?.selected_provenance_references?.length || 0} bounded digest reference(s)`);
  setText('safeHarborIngressSignature', `${envelope?.signature_lane?.status || 'ABSENT'} / adapter verification false`);
  setText('safeHarborIngressExpiry', `${Math.max(0, Math.ceil((Number(envelope?.local_expiry_posture?.ttl_ms || 0) - elapsed) / 1000))} local second(s) remain; trusted time false`);

  if (!eligible) {
    disable(panel);
    return;
  }

  const l1 = panel.querySelector('#safeHarborBindL1');
  l1.disabled = !currentAuthority();
  if (!currentAuthority()) l1.title = 'L1 requires a current Authority Context and case binding.';

  async function bind(level) {
    disable(panel);
    const authority = authorityInputs();
    const receipt = await compileSafeHarborCustodyBinding(envelope, {
      bindingLevel: level,
      operatorGesture: 'BIND_SAFE_HARBOR_REFERENCE',
      authorityContext: authority.authorityContext,
      caseMap: authority.caseMap,
      routeMemory: authority.routeMemory,
      closureStatus: 'OPEN'
    });
    const receiptVerified = await verifySafeHarborCustodyBinding(receipt);
    if (!receiptVerified || !receipt.custody_reference_bound) {
      setText('safeHarborIngressState', receipt.state);
      setText('safeHarborIngressReceipt', JSON.stringify(receipt, null, 2));
      disable(panel, false);
      l1.disabled = !currentAuthority();
      return;
    }
    record.state = 'CONSUMED';
    record.consumed_local_ms = Date.now();
    record.binding_receipt = receipt;
    await updateRecord(record);
    setText('safeHarborIngressState', `${receipt.state} / custody root not automatically created`);
    setText('safeHarborIngressReceipt', JSON.stringify(receipt, null, 2));
    window.dispatchEvent(new CustomEvent('td613:ash-safe-harbor-reference-bound', { detail: receipt }));
  }

  panel.querySelector('#safeHarborBindL0').addEventListener('click', () => bind('L0'));
  panel.querySelector('#safeHarborBindL1').addEventListener('click', () => bind('L1'));
  panel.querySelector('#safeHarborCancelIngress').addEventListener('click', async () => {
    disable(panel);
    record.state = 'CANCELLED';
    record.consumed_local_ms = Date.now();
    record.cancellation_reason = 'OPERATOR_CANCELLED';
    await updateRecord(record);
    setText('safeHarborIngressState', 'CANCELLED_HOLD');
    setText('safeHarborIngressReceipt', 'Ingress cancelled. No custody reference was bound.');
  });
}

function boot() {
  const token = new URL(window.location.href).searchParams.get('safe_harbor_token');
  if (!token) return;
  renderToken(token).catch(error => {
    const panel = document.getElementById('safeHarborIngressReview') || createPanel();
    setText('safeHarborIngressState', `INGRESS_ENVELOPE_HOLD: ${error?.message || 'unknown error'}`);
    disable(panel);
  });
  window.TD613AshSafeHarborIngress = Object.freeze({
    schema: 'td613.ash.safe-harbor-ingress-browser/v0.1',
    readRecord,
    updateRecord,
    renderToken
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
