import { compileCaseMap } from '../engine/ash-keep-core.js';
import {
  ASH_LIFECYCLE_STATES,
  buildCustodyRoot,
  compileLifecycleReceipt,
  compileReadinessReceipt,
  deriveAshLifecycle,
  workspaceGate
} from '../engine/ash-lifecycle.js';
import {
  L0_ASSURANCE,
  createLatestCommitmentCoordinator,
  generateLocalCommitment
} from './ash/local-commitment.js';
import { verifyReceiptDigests } from './ash/canonical-json.js';

const $ = id => document.getElementById(id);
const READINESS_SESSION_KEY = 'td613:ash-threshold:readiness:v0.1';
const LIFECYCLE_KEY = 'td613:ash-keep:lifecycle:v0.1';
const CUSTODY_KEY = 'td613:ash-custody:receipts:v0.8';
const CASE_POINTER_KEY = 'td613.ash-keep.current-case';
const DB_NAME = 'td613-ash-keep';
const coordinator = createLatestCommitmentCoordinator(generateLocalCommitment);

const ui = {
  readiness: null,
  custodyReceipt: null,
  custodyVerified: false,
  localCommitment: null,
  pendingHash: false,
  lifecycle: null,
  lifecycleReceipt: null,
  caseMap: null,
  latestTest: null,
  latestDraft: null,
  latestReview: null,
  latestRelease: null,
  latestSavePoint: null,
  refreshToken: 0
};

function safeJson(value) {
  return JSON.stringify(value, null, 2);
}

function readJson(storage, key, fallback) {
  try { return JSON.parse(storage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
}

function lifecycleRecords() {
  const value = readJson(localStorage, LIFECYCLE_KEY, {});
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function writeLifecycleRecord(caseId, patch) {
  const records = lifecycleRecords();
  const key = caseId || 'unbound';
  records[key] = { ...(records[key] || {}), ...patch, updated_at: new Date().toISOString() };
  localStorage.setItem(LIFECYCLE_KEY, JSON.stringify(records));
  return records[key];
}

function custodyReceipts() {
  const value = readJson(localStorage, CUSTODY_KEY, []);
  return Array.isArray(value) ? value : [];
}

function rememberCustodyReceipt(receipt) {
  const items = custodyReceipts();
  if (!items.some(item => item.receipt_digest === receipt.receipt_digest)) items.push(receipt);
  localStorage.setItem(CUSTODY_KEY, JSON.stringify(items.slice(-120)));
}

function currentCaseId() {
  return localStorage.getItem(CASE_POINTER_KEY);
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
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

function putCase(db, caseMap) {
  return new Promise((resolve, reject) => {
    const request = db.transaction('cases', 'readwrite').objectStore('cases').put(caseMap);
    request.onsuccess = () => resolve(caseMap);
    request.onerror = () => reject(request.error);
  });
}

function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .workspace-rail{grid-template-columns:repeat(7,minmax(78px,1fr))}
    .ash-lifecycle-rail{position:sticky;top:119px;z-index:34;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:1px;padding:1px max(18px,env(safe-area-inset-left));background:#020806;border-bottom:1px solid rgba(228,198,108,.22)}
    .ash-life-step{position:relative;min-height:41px;padding:8px 7px;border:0;background:#030d0a;color:#71887e;font:700 .55rem/1.25 var(--mono);text-transform:uppercase;text-align:left;overflow:hidden}
    .ash-life-step::after{content:'';position:absolute;left:7px;right:7px;bottom:4px;height:1px;background:rgba(118,234,212,.13)}
    .ash-life-step.complete{color:var(--mint)}.ash-life-step.complete::after{background:var(--mint);box-shadow:0 0 8px rgba(118,234,212,.5)}
    .ash-life-step.current{color:var(--gold);background:#151308}.ash-life-step.current::after{height:2px;background:var(--gold)}
    .ash-life-step.held{color:var(--rose)}
    .custody-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(280px,.85fr);gap:14px}.custody-stack{display:grid;gap:14px}.custody-card{padding:18px;border:1px solid var(--line);background:rgba(4,19,15,.72);clip-path:polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)}
    .custody-card h3{margin:0 0 8px;font:500 1.3rem var(--serif)}.custody-card .receipt{max-height:330px}.lifecycle-state{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0}.life-chip{padding:6px 8px;border:1px solid var(--line);font:700 .58rem var(--mono);text-transform:uppercase}.life-chip.live{border-color:rgba(118,234,212,.55);color:var(--mint)}.life-chip.hold{border-color:rgba(255,139,157,.45);color:var(--rose)}
    .custody-index{display:grid;gap:6px}.custody-index button{width:100%;padding:9px;border:1px solid var(--line);background:#010806;color:var(--muted);text-align:left;font:600 .62rem/1.45 var(--mono)}
    .lifecycle-hold{margin:0 0 12px;padding:10px;border-left:2px solid var(--rose);background:rgba(255,139,157,.05);color:#f1bec6;font:.68rem/1.5 var(--mono)}
    body[data-ash-lifecycle='CASE_BOUND'] .status-chip::before,body[data-ash-lifecycle='REBUILD_ELIGIBLE'] .status-chip::before,body[data-ash-lifecycle='RELEASE_ELIGIBLE'] .status-chip::before,body[data-ash-lifecycle='CONTINUITY_SEALED'] .status-chip::before{background:var(--gold);box-shadow:0 0 12px var(--gold)}
    @media(max-width:900px){.ash-lifecycle-rail{top:119px;overflow-x:auto;grid-template-columns:repeat(7,minmax(112px,1fr))}.custody-grid{grid-template-columns:1fr}}
    @media(max-width:620px){.ash-lifecycle-rail{top:104px;padding:0}.ash-life-step{min-height:38px}.workspace-rail{grid-template-columns:repeat(7,minmax(92px,1fr))}}
  `;
  document.head.append(style);
}

function injectLifecycleSurface() {
  if ($('workspace-custody')) return;
  const rail = document.createElement('div');
  rail.className = 'ash-lifecycle-rail';
  rail.id = 'ashLifecycleRail';
  rail.setAttribute('aria-label', 'Ash lifecycle');
  const stages = [
    ['arrival', 'Arrival'], ['readiness', 'Quick Scan'], ['custody', 'Custody root'], ['case', 'Case bound'], ['rebuild', 'Rebuild'], ['release', 'Release'], ['continuity', 'Continuity']
  ];
  rail.innerHTML = stages.map(([id, label]) => `<button class="ash-life-step" type="button" data-life-step="${id}">${label}</button>`).join('');
  document.querySelector('.workspace-rail').before(rail);

  const tab = document.createElement('button');
  tab.className = 'work-tab';
  tab.dataset.workspace = 'custody';
  tab.dataset.glyph = '⟐';
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-selected', 'false');
  tab.textContent = 'Custody';
  document.querySelector('.workspace-rail').prepend(tab);

  const section = document.createElement('section');
  section.className = 'workspace';
  section.id = 'workspace-custody';
  section.setAttribute('role', 'tabpanel');
  section.innerHTML = `
    <div class="workspace-head"><div><h2>Ash Custody Root</h2><p>Readiness observes posture. Custody verifies a root. Binding that root changes the Case Map digest and therefore every later Rebuild Test, Draft Review, Release Receipt, Save Point, and Capsule.</p></div><span class="workspace-mark">⟐ / lifecycle root</span></div>
    <div id="lifecycleHold" class="lifecycle-hold" hidden></div>
    <div class="custody-grid">
      <div class="custody-stack">
        <section class="custody-card"><h3>1 · Quick Scan readiness</h3><p class="sub">The threshold carries metadata posture only. Admit it into the local case workflow or compile a local readiness observation here.</p><div class="field-grid"><div class="field"><label for="lifeArtifactClass">Artifact class</label><select id="lifeArtifactClass"><option value="unclassified">Unclassified</option><option value="sensitive-document">Sensitive document</option><option value="whistleblower-packet">Whistleblower packet</option><option value="legal-intake">Legal intake</option><option value="archive-fragment">Archive fragment</option><option value="private-note">Private note</option></select></div><div class="field"><label for="lifeMediaType">Media type</label><input id="lifeMediaType" value="application/octet-stream"></div></div><div class="actions"><button class="btn" id="compileQuickScan">Compile Quick Scan</button><button class="btn gold" id="openTestQuickScan">Open Reader Quick Scan</button></div><pre class="receipt" id="readinessReceipt">No readiness observation.</pre></section>
        <section class="custody-card"><h3>2 · Register the custody root</h3><p class="sub">A selected file is hashed locally. Raw bytes do not enter the request. An empty picker creates an L0 metadata-only root.</p><div class="field-grid"><div class="field full"><label for="lifeFile">Local artifact</label><input id="lifeFile" type="file"></div><div class="field"><label for="lifeSourceLabel">Human label</label><input id="lifeSourceLabel" placeholder="Custody root"></div><div class="field"><label for="lifePathRef">Path / ref / range</label><input id="lifePathRef"></div><div class="field"><label for="lifeSourceEnvironment">Source environment</label><select id="lifeSourceEnvironment"><option>local_file</option><option>repo</option><option>cloud_drive</option><option>local_drive</option><option>spreadsheet</option><option>llm_chat</option><option>manual</option></select></div><div class="field"><label for="lifeCredentialType">Credential posture</label><select id="lifeCredentialType"><option>none</option><option>local-possession</option><option>repo-access</option><option>provider-session</option><option>operator-attested</option></select></div></div><p class="status-line" id="lifeCommitmentStatus">L0_METADATA_ONLY · no artifact byte digest computed.</p><div class="actions"><button class="btn primary" id="registerCustodyRoot">Register and verify root</button><button class="btn" id="bindCustodyRoot">Bind verified root to current case</button></div><p class="status-line" id="custodyStatus"></p><pre class="receipt" id="custodyReceipt">No custody root receipt.</pre></section>
      </div>
      <aside class="custody-stack">
        <section class="custody-card"><h3>Lifecycle posture</h3><div class="lifecycle-state" id="lifecycleChips"></div><dl class="readout" id="lifecycleReadout"></dl><pre class="receipt" id="lifecycleReceipt">Lifecycle not yet derived.</pre></section>
        <section class="custody-card"><h3>Local custody index</h3><div class="custody-index" id="custodyIndex"></div></section>
      </aside>
    </div>`;
  document.querySelector('main').prepend(section);
}

function stageFlags(lifecycle) {
  const refs = lifecycle.references || {};
  return {
    arrival: true,
    readiness: Boolean(refs.readiness_receipt),
    custody: Boolean(refs.custody_receipt),
    case: Boolean(refs.case_id && ui.caseMap?.custody_reference === refs.custody_receipt),
    rebuild: Boolean(refs.rebuild_test && lifecycle.gates?.local_release !== undefined),
    release: Boolean(refs.release_receipt),
    continuity: Boolean(refs.save_point)
  };
}

function currentStage(lifecycle) {
  const action = lifecycle.next_action || '';
  if (action.includes('THRESHOLD')) return 'arrival';
  if (action.includes('CUSTODY') || action.includes('VERIFY')) return 'custody';
  if (action.includes('CREATE_CASE') || action.includes('BIND')) return 'case';
  if (action.includes('REBUILD')) return 'rebuild';
  if (action.includes('REVIEW') || action.includes('RELEASE')) return 'release';
  if (action.includes('CONTINUITY')) return 'continuity';
  return 'continuity';
}

function renderLifecycle() {
  const lifecycle = ui.lifecycle;
  if (!lifecycle) return;
  document.body.dataset.ashLifecycle = lifecycle.state;
  const flags = stageFlags(lifecycle);
  const current = currentStage(lifecycle);
  document.querySelectorAll('[data-life-step]').forEach(button => {
    const id = button.dataset.lifeStep;
    button.classList.toggle('complete', Boolean(flags[id]));
    button.classList.toggle('current', id === current);
    button.classList.toggle('held', id === current && lifecycle.holds.length > 0);
  });
  $('lifecycleChips').innerHTML = `<span class="life-chip live">${lifecycle.state}</span>${lifecycle.holds.map(hold => `<span class="life-chip hold">${hold}</span>`).join('')}`;
  const rows = [
    ['next action', lifecycle.next_action],
    ['readiness', lifecycle.references.readiness_receipt || 'none'],
    ['custody root', lifecycle.references.custody_receipt || 'none'],
    ['case map', lifecycle.references.case_map_digest || 'none'],
    ['rebuild', lifecycle.references.rebuild_test || 'none'],
    ['release', lifecycle.references.release_receipt || 'none'],
    ['continuity', lifecycle.references.save_point || 'none']
  ];
  $('lifecycleReadout').innerHTML = rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${String(value)}</dd></div>`).join('');
  $('lifecycleReceipt').textContent = safeJson(ui.lifecycleReceipt || lifecycle);
  $('readinessReceipt').textContent = ui.readiness ? safeJson(ui.readiness) : 'No readiness observation.';
  $('custodyReceipt').textContent = ui.custodyReceipt ? safeJson(ui.custodyReceipt) : 'No custody root receipt.';
  $('storageState').textContent = lifecycle.state === ASH_LIFECYCLE_STATES.CONTINUITY_SEALED ? 'Custody + continuity sealed' : lifecycle.state.replaceAll('_', ' ').toLowerCase();
  $('lifecycleHold').hidden = lifecycle.holds.length === 0;
  $('lifecycleHold').textContent = lifecycle.holds.length ? `Held: ${lifecycle.holds.join(' · ')}. Next: ${lifecycle.next_action}.` : '';
  const validCustody = document.querySelector('[data-review="validCustody"]');
  if (validCustody) {
    validCustody.checked = lifecycle.gates.test === true;
    validCustody.disabled = true;
    validCustody.parentElement.lastChild.textContent = lifecycle.gates.test ? ' Custody root verified and case-bound' : ' Custody root required';
  }
  enforceReleaseGate();
  renderCustodyIndex();
}

function enforceReleaseGate() {
  const button = $('approveRelease');
  if (!button || !ui.lifecycle) return;
  const nativeReady = ui.latestReview?.status === 'READY_FOR_LOCAL_RELEASE_APPROVAL' && ui.latestReview?.local_export_approved === true;
  const shouldDisable = !(nativeReady && ui.lifecycle.gates.local_release);
  if (button.disabled !== shouldDisable) button.disabled = shouldDisable;
  if (nativeReady && !ui.lifecycle.gates.local_release) $('reviewStatus').textContent = `Lifecycle hold: ${ui.lifecycle.next_action}.`;
}

function renderCustodyIndex() {
  const host = $('custodyIndex');
  if (!host) return;
  const items = custodyReceipts().slice().reverse();
  host.innerHTML = items.length ? items.map((receipt, index) => `<button type="button" data-custody-index="${index}">${receipt.receipt_id || receipt.receipt_digest || receipt.schema}<br>${receipt.manifest?.source_locator?.label || receipt.manifest?.sourceLocator?.label || 'unlabeled root'}</button>`).join('') : '<p class="sub">No local custody receipts.</p>';
  host.querySelectorAll('[data-custody-index]').forEach((button, index) => button.addEventListener('click', async () => {
    ui.custodyReceipt = items[index];
    const integrity = await verifyReceiptDigests(ui.custodyReceipt);
    ui.custodyVerified = integrity.valid;
    const caseId = currentCaseId();
    writeLifecycleRecord(caseId, { custody_receipt_reference: ui.custodyReceipt.receipt_id, custody_receipt_digest: ui.custodyReceipt.receipt_digest, custody_verified: ui.custodyVerified });
    await refreshLifecycle();
  }));
}

async function compileQuickScan() {
  ui.readiness = await compileReadinessReceipt({
    sourceSurface: 'ash-keep-custody-workspace',
    artifactClass: $('lifeArtifactClass').value,
    mediaType: $('lifeMediaType').value,
    byteLength: ui.localCommitment?.byte_length ?? null,
    localCommitmentReference: ui.localCommitment?.artifact_digest || null,
    arrivalAcknowledged: true,
    boundaryAcknowledged: true,
    custodyAcknowledged: false,
    missingness: ['custody digest spine not yet verified', 'case root not yet bound']
  });
  const caseId = currentCaseId();
  writeLifecycleRecord(caseId, { readiness_receipt: ui.readiness });
  sessionStorage.setItem(READINESS_SESSION_KEY, JSON.stringify(ui.readiness));
  await refreshLifecycle();
}

async function selectFile() {
  const file = $('lifeFile').files?.[0];
  coordinator.invalidate();
  ui.localCommitment = null;
  ui.pendingHash = false;
  $('lifeCommitmentStatus').textContent = `${L0_ASSURANCE} · no artifact byte digest computed.`;
  if (!file) return;
  ui.pendingHash = true;
  $('registerCustodyRoot').disabled = true;
  $('lifeCommitmentStatus').textContent = 'HASHING · exact bytes are being digested locally.';
  try {
    const result = await coordinator.commit(file);
    if (result.status !== 'CURRENT' || $('lifeFile').files?.[0] !== file) return;
    ui.localCommitment = result.commitment;
    $('lifeMediaType').value = ui.localCommitment.media_type;
    $('lifeCommitmentStatus').textContent = `${ui.localCommitment.assurance_class} · ${ui.localCommitment.artifact_digest}`;
    if (!ui.readiness) await compileQuickScan();
  } catch (error) {
    $('lifeCommitmentStatus').textContent = `LOCAL COMMITMENT HELD · ${error.message}`;
  } finally {
    ui.pendingHash = false;
    $('registerCustodyRoot').disabled = false;
  }
}

function custodyPayload() {
  if (ui.pendingHash) throw new Error('Local commitment is still running.');
  const file = $('lifeFile').files?.[0];
  if (file && !ui.localCommitment) throw new Error('Selected file lacks a current local commitment.');
  const digest = ui.localCommitment?.artifact_digest || null;
  return {
    sourceEnvironment: $('lifeSourceEnvironment').value,
    sourceLocator: {
      label: $('lifeSourceLabel').value || ui.readiness?.artifact_posture?.artifact_class || null,
      path_or_ref: $('lifePathRef').value || null,
      revision: null,
      commit_sha: null,
      blob_sha: null
    },
    artifactMetadata: {
      mediaType: ui.localCommitment?.media_type || $('lifeMediaType').value || null,
      byteLength: ui.localCommitment?.byte_length ?? null,
      lastModified: ui.localCommitment?.last_modified_claim ?? null,
      artifactDigest: digest,
      contentHash: digest,
      hashScope: ui.localCommitment ? 'local-browser' : 'unavailable',
      assuranceClass: ui.localCommitment?.assurance_class || L0_ASSURANCE,
      localCommitment: ui.localCommitment
    },
    credentialReference: { credentialType: $('lifeCredentialType').value },
    privacyBoundary: { public_weather_only: true },
    ashPosture: {
      roomRoute: 'private-sense-only',
      recommendedTending: ['bind-custody-root', 'case-map', 'rebuild-test']
    }
  };
}

async function domeRequest(operation, payload) {
  const response = await fetch(`/api/dome-world/${operation}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      operation,
      traceId: `ash_${Date.now().toString(36)}`,
      apertureContext: { version: 'v3.1-alpha', schema: 'td613-aperture/v3.1-alpha', observedRegime: 'PRCS-A' },
      payload
    })
  });
  const body = await response.json().catch(() => ({ ok: false, error: 'non-json response' }));
  if (!response.ok || body.ok === false) throw new Error(body.error || `HTTP ${response.status}`);
  return body.result || body;
}

async function registerCustodyRoot() {
  $('custodyStatus').textContent = 'Registering custody root…';
  if (!ui.readiness) await compileQuickScan();
  const receipt = await domeRequest('ash-custody-register', custodyPayload());
  const integrity = await verifyReceiptDigests(receipt);
  if (!integrity.valid) throw new Error('Browser canonical digest verification failed.');
  ui.custodyReceipt = receipt;
  ui.custodyVerified = true;
  rememberCustodyReceipt(receipt);
  const caseId = currentCaseId();
  writeLifecycleRecord(caseId, {
    readiness_receipt: ui.readiness,
    custody_receipt_reference: receipt.receipt_id,
    custody_receipt_digest: receipt.receipt_digest,
    custody_verified: true
  });
  $('custodyStatus').textContent = 'Digest spine verified. Binding custody root to the current case…';
  if (caseId) await bindCustodyRoot();
  else await refreshLifecycle();
}

function caseInput(caseMap, patch = {}) {
  return {
    profile: caseMap.profile,
    caseId: caseMap.case_id,
    title: caseMap.title,
    createdAt: caseMap.created_at,
    updatedAt: new Date().toISOString(),
    custodyReference: caseMap.custody_reference,
    tamperState: caseMap.tamper_state,
    rooms: caseMap.rooms,
    nodes: caseMap.nodes,
    relationships: caseMap.relationships,
    privateChronology: caseMap.private_chronology,
    intendedActions: caseMap.intended_actions,
    sourceStatus: caseMap.source_status,
    evidenceBasis: caseMap.evidence_basis,
    observations: caseMap.observations,
    missingness: caseMap.missingness,
    alternatives: caseMap.alternatives,
    openQuestions: caseMap.open_questions,
    operatorNotes: caseMap.operator_notes,
    closureStatus: caseMap.closure?.status,
    ...patch
  };
}

async function bindCustodyRoot() {
  const caseId = currentCaseId();
  if (!caseId) throw new Error('Create or open a case before binding the custody root.');
  if (!ui.custodyReceipt || !ui.custodyVerified) throw new Error('A verified custody receipt is required.');
  const db = await openDb();
  try {
    const caseMap = await getRecord(db, 'cases', caseId);
    if (!caseMap) throw new Error('Current case could not be loaded.');
    const binding = buildCustodyRoot({ caseMap, custodyReceipt: ui.custodyReceipt, readinessReceipt: ui.readiness });
    const next = await compileCaseMap(caseInput(caseMap, {
      custodyReference: binding.custody_reference,
      nodes: binding.nodes,
      evidenceBasis: [...caseMap.evidence_basis, ...binding.evidence_basis_additions],
      observations: [...caseMap.observations, binding.observation],
      missingness: caseMap.missingness.filter(item => !/custody|case root/i.test(item))
    }));
    await putCase(db, next);
    writeLifecycleRecord(caseId, {
      readiness_receipt: ui.readiness,
      custody_receipt_reference: ui.custodyReceipt.receipt_id,
      custody_receipt_digest: ui.custodyReceipt.receipt_digest,
      custody_verified: true,
      case_map_digest: next.case_map_digest,
      custody_root_node: binding.root_node.id
    });
    $('custodyStatus').textContent = 'Custody root bound. The Case Map digest changed; prior tests and release posture must be rebuilt.';
  } finally {
    db.close();
  }
  setTimeout(() => location.reload(), 420);
}

async function collectCaseState() {
  const caseId = currentCaseId();
  if (!caseId) return { caseMap: null, latestTest: null, latestDraft: null, latestReview: null, latestRelease: null, latestSavePoint: null };
  const db = await openDb();
  try {
    const caseMap = await getRecord(db, 'cases', caseId);
    const [tests, drafts, reviews, releases, savePoints] = await Promise.all(['tests', 'drafts', 'reviews', 'releases', 'savePoints'].map(store => getAll(db, store)));
    const values = records => records.map(item => item.value).filter(Boolean);
    const caseTests = values(tests).filter(item => item.case_id === caseId);
    const caseDrafts = values(drafts).filter(item => item.case_id === caseId);
    const latestDraft = caseDrafts.at(-1) || null;
    return {
      caseMap,
      latestTest: caseTests.at(-1) || null,
      latestDraft,
      latestReview: values(reviews).filter(item => item.draft_id === latestDraft?.draft_id).at(-1) || null,
      latestRelease: values(releases).filter(item => item.case_id === caseId).at(-1) || null,
      latestSavePoint: values(savePoints).filter(item => item.case_id === caseId).at(-1) || null
    };
  } finally {
    db.close();
  }
}

function resolveStoredReceipts(caseId) {
  const records = lifecycleRecords();
  const record = records[caseId] || records.unbound || {};
  const readiness = record.readiness_receipt || readJson(sessionStorage, READINESS_SESSION_KEY, null);
  const custody = custodyReceipts().find(item => item.receipt_id === record.custody_receipt_reference || item.receipt_digest === record.custody_receipt_digest) || null;
  return { record, readiness, custody };
}

async function refreshLifecycle() {
  const token = ++ui.refreshToken;
  const caseId = currentCaseId();
  const collected = await collectCaseState();
  if (token !== ui.refreshToken) return;
  Object.assign(ui, collected);
  const stored = resolveStoredReceipts(caseId);
  ui.readiness = stored.readiness || ui.readiness;
  ui.custodyReceipt = stored.custody || ui.custodyReceipt;
  ui.custodyVerified = stored.record.custody_verified === true || ui.custodyVerified;
  ui.lifecycle = deriveAshLifecycle({
    readinessReceipt: ui.readiness,
    custodyReceipt: ui.custodyReceipt,
    custodyVerified: ui.custodyVerified,
    caseMap: ui.caseMap,
    latestTest: ui.latestTest,
    latestDraft: ui.latestDraft,
    latestReview: ui.latestReview,
    latestRelease: ui.latestRelease,
    latestSavePoint: ui.latestSavePoint
  });
  ui.lifecycleReceipt = await compileLifecycleReceipt(ui.lifecycle);
  if (caseId) writeLifecycleRecord(caseId, { lifecycle_receipt: ui.lifecycleReceipt, lifecycle_state: ui.lifecycle.state });
  renderLifecycle();
}

function openWorkspace(name) {
  const button = document.querySelector(`.work-tab[data-workspace="${name}"]`);
  if (button) button.click();
}

function bindUiEvents() {
  $('compileQuickScan').addEventListener('click', () => compileQuickScan().catch(error => $('custodyStatus').textContent = error.message));
  $('lifeFile').addEventListener('change', () => selectFile().catch(error => $('lifeCommitmentStatus').textContent = error.message));
  $('registerCustodyRoot').addEventListener('click', () => registerCustodyRoot().catch(error => $('custodyStatus').textContent = `RECEIPT HELD · ${error.message}`));
  $('bindCustodyRoot').addEventListener('click', () => bindCustodyRoot().catch(error => $('custodyStatus').textContent = error.message));
  $('openTestQuickScan').addEventListener('click', () => {
    $('readerClass').value = 'ash-v06-quick-scan';
    openWorkspace('test');
  });
  document.querySelectorAll('[data-life-step]').forEach(button => button.addEventListener('click', () => {
    const map = { arrival: 'custody', readiness: 'custody', custody: 'custody', case: 'map', rebuild: 'test', release: 'draft', continuity: 'save' };
    openWorkspace(map[button.dataset.lifeStep] || 'custody');
  }));
  document.addEventListener('click', event => {
    const tab = event.target.closest('.work-tab');
    if (!tab || tab.dataset.workspace === 'custody' || !ui.lifecycle) return;
    const gate = workspaceGate(ui.lifecycle, tab.dataset.workspace);
    if (gate.allowed) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    $('custodyStatus').textContent = `${tab.textContent.trim()} held · ${gate.reason}.`;
    openWorkspace('custody');
  }, true);
  const releaseObserver = new MutationObserver(enforceReleaseGate);
  if ($('approveRelease')) releaseObserver.observe($('approveRelease'), { attributes: true, attributeFilter: ['disabled'] });
  const testObserver = new MutationObserver(() => setTimeout(refreshLifecycle, 120));
  if ($('testReceipt')) testObserver.observe($('testReceipt'), { childList: true, characterData: true, subtree: true });
  for (const id of ['releaseReceipt', 'saveList']) {
    if ($(id)) new MutationObserver(() => setTimeout(refreshLifecycle, 120)).observe($(id), { childList: true, characterData: true, subtree: true });
  }
}

function seedLaunchFromReadiness() {
  if (!ui.readiness) return;
  const panel = document.querySelector('.launch-panel');
  if (!panel || panel.querySelector('.arrival-readiness')) return;
  const note = document.createElement('div');
  note.className = 'arrival-readiness';
  note.innerHTML = `<p class="status-line">Quick Scan carried from the Ash threshold: ${ui.readiness.receipt_id}. Create the case, then bind a custody root.</p>`;
  panel.insertBefore(note, panel.querySelector('.field-grid'));
  const title = $('newTitle');
  if (title?.value === 'Untitled case') title.value = `${ui.readiness.artifact_posture.artifact_class.replaceAll('-', ' ')} · Ash case`;
}

async function bootLifecycle() {
  injectStyles();
  injectLifecycleSurface();
  const quickOption = document.querySelector('#readerClass option[value="ash-v06-quick-scan"]');
  if (quickOption) quickOption.textContent = 'Quick Scan · readiness receipt';
  ui.readiness = readJson(sessionStorage, READINESS_SESSION_KEY, null);
  bindUiEvents();
  seedLaunchFromReadiness();
  await refreshLifecycle();
  let lastPointer = currentCaseId();
  setInterval(async () => {
    const pointer = currentCaseId();
    if (pointer !== lastPointer) {
      lastPointer = pointer;
      if (pointer && lifecycleRecords().unbound) {
        const records = lifecycleRecords();
        records[pointer] = { ...(records[pointer] || {}), ...records.unbound };
        delete records.unbound;
        localStorage.setItem(LIFECYCLE_KEY, JSON.stringify(records));
      }
      await refreshLifecycle();
    }
  }, 650);
}

bootLifecycle().catch(error => {
  console.error('Ash lifecycle integration held:', error);
  if ($('storageState')) $('storageState').textContent = 'Lifecycle integration held';
});
