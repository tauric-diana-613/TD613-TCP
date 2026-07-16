import {
  compileSafeHarborIngressEnvelope,
  createSafeHarborIngressToken,
  verifySafeHarborIngressEnvelope
} from '../../engine/ash-safe-harbor-ingress.js';
import { classifyAuthoritySurface, verifyHashReplay } from './safe-harbor-authority-verifier.js';

const DB_NAME = 'td613-ash-ingress-v1';
const DB_VERSION = 1;
const STORE = 'envelopes';
const SESSION_KEY = 'td613.safe-harbor.session.v1';
const MIRROR_KEY = 'td613.safe-harbor.session.mirror.v1';
const DEFAULT_TTL_MS = 15 * 60 * 1000;

function read(storage, key) {
  try {
    const raw = storage?.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function activePacket() {
  const saved = read(window.sessionStorage, SESSION_KEY) || read(window.localStorage, MIRROR_KEY);
  return saved?.packet || saved?.sealed || null;
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      const store = db.objectStoreNames.contains(STORE)
        ? request.transaction.objectStore(STORE)
        : db.createObjectStore(STORE, { keyPath: 'token' });
      if (!store.indexNames.contains('packet_hash')) store.createIndex('packet_hash', 'packet_hash', { unique: false });
      if (!store.indexNames.contains('state')) store.createIndex('state', 'state', { unique: false });
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

async function findDuplicates(packetHash) {
  const db = await openDb();
  try {
    const transaction = db.transaction(STORE, 'readonly');
    const records = await requestResult(transaction.objectStore(STORE).index('packet_hash').getAll(packetHash));
    return records.filter(record => record.state !== 'CONSUMED' && record.state !== 'CANCELLED');
  } finally {
    db.close();
  }
}

async function storeEnvelope(envelope) {
  const db = await openDb();
  try {
    const transaction = db.transaction(STORE, 'readwrite');
    await requestResult(transaction.objectStore(STORE).put({
      token: envelope.token,
      packet_hash: envelope.packet.packet_hash_sha256,
      envelope,
      created_local_ms: Date.now(),
      origin: window.location.origin,
      state: 'STAGED',
      consumed_local_ms: null,
      cancellation_reason: null
    }));
  } finally {
    db.close();
  }
}

function addStatus(toolbar) {
  let status = document.getElementById('ashIngressStatus');
  if (status) return status;
  status = document.createElement('span');
  status.id = 'ashIngressStatus';
  status.className = 'note compact';
  status.setAttribute('role', 'status');
  status.textContent = 'Ash binding awaits a sealed, hash-verifiable packet.';
  toolbar.insertAdjacentElement('afterend', status);
  return status;
}

async function prepareBinding(button, status) {
  const packet = activePacket();
  if (!packet) {
    button.disabled = true;
    status.textContent = 'Ash binding held: no staged packet is present.';
    return;
  }
  const replay = await verifyHashReplay(packet);
  const eligible = replay.status === 'pass';
  button.disabled = !eligible;
  button.setAttribute('aria-disabled', eligible ? 'false' : 'true');
  status.textContent = eligible
    ? 'Reference-only ingress is ready. Raw corpus and private custody remain excluded.'
    : `Ash binding held: packet hash replay is ${replay.status}.`;
  button.dataset.packetHash = packet.packet_hash_sha256 || '';
}

async function bindInAsh(button, status) {
  button.disabled = true;
  status.textContent = 'Verifying packet and preparing a one-time local envelope…';
  try {
    const packet = activePacket();
    if (!packet) throw new Error('No staged Safe Harbor packet is available.');
    const replay = await verifyHashReplay(packet);
    if (replay.status !== 'pass') throw new Error(`Packet hash replay held: ${replay.status}.`);
    const duplicates = await findDuplicates(packet.packet_hash_sha256);
    const duplicateReviewed = !duplicates.length || window.confirm('An unconsumed ingress envelope already exists for this packet. Create a separate reviewable envelope?');
    if (!duplicateReviewed) {
      status.textContent = 'Duplicate ingress cancelled. Existing local envelope remains unchanged.';
      button.disabled = false;
      return;
    }
    const token = createSafeHarborIngressToken();
    const envelope = await compileSafeHarborIngressEnvelope(packet, {
      token,
      origin: window.location.origin,
      ttlMs: DEFAULT_TTL_MS,
      packetHashVerified: true,
      duplicateDetected: duplicates.length > 0,
      duplicateReviewed,
      authoritySurfaceStatus: classifyAuthoritySurface(packet).status,
      sourceStatus: 'OPERATOR_STAGED',
      operatorIntent: 'CONSIDER_SAFE_HARBOR_REFERENCE_IN_ASH',
      rawBodyIncluded: false
    });
    if (!envelope.ingress_eligible || !(await verifySafeHarborIngressEnvelope(envelope))) {
      throw new Error(`Ingress envelope held: ${envelope.state}.`);
    }
    await storeEnvelope(envelope);
    status.textContent = 'One-time reference envelope staged locally. Opening Ash Keep for explicit L0/L1 review…';
    const destination = new URL('/dome-world/ash-keep.html', window.location.origin);
    destination.searchParams.set('safe_harbor_token', token);
    window.location.assign(destination.href);
  } catch (error) {
    status.textContent = `Ash binding held: ${error?.message || 'unknown local error'}`;
    button.disabled = false;
  }
}

function installButton() {
  if (document.getElementById('bindPacketInAsh')) return;
  const anchor = document.getElementById('resetStagedPacket') || document.getElementById('exportPacketPreview');
  const toolbar = anchor?.closest('.dock-toolbar');
  if (!toolbar) return;
  const button = document.createElement('button');
  button.className = 'control secondary';
  button.id = 'bindPacketInAsh';
  button.type = 'button';
  button.disabled = true;
  button.textContent = 'Bind in Ash Keep';
  button.title = 'Stage selected packet references in local IndexedDB for explicit Ash Keep review.';
  toolbar.appendChild(button);
  const status = addStatus(toolbar);
  button.addEventListener('click', () => bindInAsh(button, status));
  ['click', 'input', 'change'].forEach(type => document.addEventListener(type, () => {
    window.setTimeout(() => prepareBinding(button, status), 30);
  }, true));
  prepareBinding(button, status);
}

function boot() {
  installButton();
  const observer = new MutationObserver(() => installButton());
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.TD613SafeHarborAshIngress = Object.freeze({
    schema: 'td613.ash.safe-harbor-ingress-browser/v0.1',
    activePacket,
    findDuplicates,
    storeEnvelope,
    prepareBinding
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
