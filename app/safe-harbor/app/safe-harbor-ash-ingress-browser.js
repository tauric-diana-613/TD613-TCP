import {
  compileSafeHarborIngressEnvelope,
  compileSafeHarborIngressToken,
  verifySafeHarborIngressEnvelope,
  verifySafeHarborIngressToken
} from '../../engine/ash-safe-harbor-ingress.js';

const DB_NAME = 'td613-ash-safe-harbor-ingress';
const DB_VERSION = 1;
const SESSION_KEY = 'td613.safe-harbor.session.v1';
const MIRROR_KEY = 'td613.safe-harbor.session.mirror.v1';
const TOKEN_POINTER_KEY = 'td613.ash.safe-harbor-ingress-token.v0.1';

function parse(raw) {
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function savedPacket() {
  const saved = parse(sessionStorage.getItem(SESSION_KEY)) || parse(localStorage.getItem(MIRROR_KEY));
  return saved?.packet || null;
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('envelopes')) db.createObjectStore('envelopes', { keyPath: 'envelope_id' });
      if (!db.objectStoreNames.contains('tokens')) db.createObjectStore('tokens', { keyPath: 'token_id' });
      if (!db.objectStoreNames.contains('considerations')) db.createObjectStore('considerations', { keyPath: 'consideration_id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Safe Harbor ingress storage is blocked by another tab.'));
  });
}

function storePair(db, envelope, token) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['envelopes', 'tokens'], 'readwrite');
    tx.objectStore('envelopes').put(envelope);
    tx.objectStore('tokens').put({ ...token, consumed: false, local_created_ms: Date.now() });
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function ensureSurface() {
  if (document.getElementById('bindPacketInAshKeep')) return document.getElementById('bindPacketInAshKeep');
  const anchor = document.getElementById('mintStagedPacket');
  if (!anchor) return null;
  const button = document.createElement('button');
  button.className = 'control secondary';
  button.id = 'bindPacketInAshKeep';
  button.type = 'button';
  button.textContent = 'Bind in Ash Keep';
  button.disabled = !savedPacket();
  button.title = 'Stage selected Safe Harbor references for local Ash custody-root consideration.';
  const note = document.createElement('div');
  note.id = 'ashIngressNote';
  note.className = 'note compact';
  note.textContent = 'Reference-only local handoff. Arrival creates no custody, case, relation, identity, authenticity, truth, release, transport, or Cinder authority.';
  anchor.parentElement?.append(button);
  anchor.parentElement?.after(note);
  return button;
}

async function stageForAsh() {
  const button = ensureSurface();
  const note = document.getElementById('ashIngressNote');
  const packet = savedPacket();
  if (!packet) {
    if (note) note.textContent = 'Mint or reopen a governed Safe Harbor packet before staging an Ash reference.';
    return null;
  }
  if (button) button.disabled = true;
  try {
    const origin = location.origin;
    const envelope = await compileSafeHarborIngressEnvelope({
      packet,
      origin,
      ttlMs: 5 * 60 * 1000,
      operatorIntent: 'CONSIDER_REFERENCE_FOR_LOCAL_CUSTODY_ROOT'
    });
    if (!await verifySafeHarborIngressEnvelope(envelope) || !envelope.ingress_eligible) {
      throw new Error(`Ingress envelope held: ${envelope.state}`);
    }
    const token = await compileSafeHarborIngressToken(envelope, { origin });
    if (!await verifySafeHarborIngressToken(token, envelope)) throw new Error('Ingress token verification failed.');
    const db = await openDb();
    try { await storePair(db, envelope, token); } finally { db.close(); }
    sessionStorage.setItem(TOKEN_POINTER_KEY, token.token_id);
    if (note) note.textContent = 'Reference envelope staged locally. Opening Ash Keep for an explicit L0/L1 consideration choice.';
    const target = new URL('../dome-world/ash-keep.html', location.href);
    target.searchParams.set('safe_harbor_ingress', token.token_id);
    location.assign(target.href);
    return { envelope, token };
  } catch (error) {
    if (note) note.textContent = `Ash ingress held: ${error.message}`;
    if (button) button.disabled = false;
    return null;
  }
}

export function installSafeHarborAshIngress() {
  const button = ensureSurface();
  if (!button || button.dataset.ashIngressBound === 'true') return button;
  button.dataset.ashIngressBound = 'true';
  button.addEventListener('click', () => void stageForAsh());
  window.addEventListener('td613:safe-harbor-packet', () => { button.disabled = !savedPacket(); });
  return button;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.TD613_SAFE_HARBOR_ASH_INGRESS = Object.freeze({ installSafeHarborAshIngress, stageForAsh });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installSafeHarborAshIngress, { once: true });
  else installSafeHarborAshIngress();
}
