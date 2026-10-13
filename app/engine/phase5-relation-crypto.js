import { canonicalJson } from '../dome-world/ash/canonical-json.js';

export const PHASE5_ASH_REFERENCE_DOMAIN = 'TD613:PHASE5:ASH-REFERENCE:v1';
export const PHASE5_NONCE_FINGERPRINT_DOMAIN = 'TD613:PHASE5:NONCE-FINGERPRINT:v1';
export const R0_RECEIPT_REFERENCES_ONLY = 'R0_RECEIPT_REFERENCES_ONLY';
export const R1_ROUTE_SCOPED_ARTIFACT_REFERENCE = 'R1_ROUTE_SCOPED_ARTIFACT_REFERENCE';

const HEX_64 = /^sha256:[0-9a-f]{64}$/;
const BASE64URL = /^[A-Za-z0-9_-]{22,}$/;

function requireCrypto(cryptoImpl = globalThis.crypto) {
  if (!cryptoImpl?.getRandomValues || !cryptoImpl?.subtle) throw new Error('Web Crypto is unavailable.');
  return cryptoImpl;
}
function bytesToBase64Url(bytes) {
  if (typeof btoa === 'function') {
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '');
  }
  if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64url');
  throw new Error('Base64url encoding is unavailable.');
}
function bytesToHex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}
function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }

export function generateContextNonce({ cryptoImpl = globalThis.crypto, byteLength = 16 } = {}) {
  const crypto = requireCrypto(cryptoImpl);
  if (!Number.isSafeInteger(byteLength) || byteLength < 16) throw new TypeError('Context nonce requires at least 128 bits.');
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}
export function validateContextNonce(nonce) {
  if (typeof nonce !== 'string' || !BASE64URL.test(nonce)) throw new TypeError('Context nonce must be base64url with at least 128 bits of encoded material.');
  return nonce;
}
export async function generateRelationKey({ cryptoImpl = globalThis.crypto } = {}) {
  return requireCrypto(cryptoImpl).subtle.generateKey(
    { name: 'HMAC', hash: 'SHA-256', length: 256 }, false, ['sign', 'verify']
  );
}
export function ashReferenceSubject({ artifactDigest, contextNonce, routeScope }) {
  if (!HEX_64.test(String(artifactDigest || ''))) throw new TypeError('R1 requires a local sha256 artifact digest.');
  validateContextNonce(contextNonce);
  if (typeof routeScope !== 'string' || !routeScope.trim()) throw new TypeError('R1 requires a non-empty route scope.');
  return Object.freeze({
    domain: PHASE5_ASH_REFERENCE_DOMAIN,
    artifact_digest: artifactDigest,
    context_nonce: contextNonce,
    route_scope: routeScope.trim()
  });
}
export async function deriveAshReference({
  key, artifactDigest, contextNonce, routeScope,
  cryptoImpl = globalThis.crypto, TextEncoderImpl = globalThis.TextEncoder
}) {
  const crypto = requireCrypto(cryptoImpl);
  if (!key) throw new Error('R1 requires a local relation key.');
  if (key.extractable !== false) throw new Error('Relation key must be non-extractable.');
  if (typeof TextEncoderImpl !== 'function') throw new Error('TextEncoder is unavailable.');
  const material = new TextEncoderImpl().encode(canonicalJson(
    ashReferenceSubject({ artifactDigest, contextNonce, routeScope })
  ));
  const signature = await crypto.subtle.sign('HMAC', key, material);
  return `hmac-sha256:${bytesToHex(new Uint8Array(signature))}`;
}
export async function verifyAshReference(options) {
  if (!/^hmac-sha256:[0-9a-f]{64}$/.test(String(options?.ashReference || ''))) return false;
  return await deriveAshReference(options) === options.ashReference;
}
async function nonceFingerprint(nonce, {
  cryptoImpl = globalThis.crypto, TextEncoderImpl = globalThis.TextEncoder
} = {}) {
  const crypto = requireCrypto(cryptoImpl);
  validateContextNonce(nonce);
  const material = new TextEncoderImpl().encode(`${PHASE5_NONCE_FINGERPRINT_DOMAIN}\n${nonce}`);
  const digest = await crypto.subtle.digest('SHA-256', material);
  return `sha256:${bytesToHex(new Uint8Array(digest))}`;
}

export class NonceRegistry {
  #entries = new Map(); #limit; #cryptoImpl; #TextEncoderImpl;
  constructor({ limit = 512, cryptoImpl = globalThis.crypto, TextEncoderImpl = globalThis.TextEncoder } = {}) {
    if (!Number.isSafeInteger(limit) || limit < 1) throw new TypeError('Nonce registry limit is invalid.');
    this.#limit = limit; this.#cryptoImpl = cryptoImpl; this.#TextEncoderImpl = TextEncoderImpl;
  }
  async fingerprint(nonce) { return nonceFingerprint(nonce, { cryptoImpl: this.#cryptoImpl, TextEncoderImpl: this.#TextEncoderImpl }); }
  async has(nonce) { return this.#entries.has(await this.fingerprint(nonce)); }
  async claim(nonce, { relationId, state = 'CONFIRMED', createdAt = new Date().toISOString() } = {}) {
    const fingerprint = await this.fingerprint(nonce);
    if (this.#entries.has(fingerprint)) return false;
    this.#entries.set(fingerprint, Object.freeze({ nonce_fingerprint: fingerprint, relation_id: relationId || null, state, created_at: createdAt }));
    while (this.#entries.size > this.#limit) this.#entries.delete(this.#entries.keys().next().value);
    return true;
  }
  snapshot() { return Object.freeze(Array.from(this.#entries.values(), clone)); }
}

function openKeyDatabase({ indexedDBImpl = globalThis.indexedDB, databaseName = 'td613-phase5-relation-keys', storeName = 'relation-keys' } = {}) {
  if (!indexedDBImpl?.open) return Promise.reject(new Error('IndexedDB is unavailable.'));
  return new Promise((resolve, reject) => {
    const request = indexedDBImpl.open(databaseName, 1);
    request.onerror = () => reject(request.error || new Error('IndexedDB open failed.'));
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(storeName)) database.createObjectStore(storeName);
    };
    request.onsuccess = () => resolve({ database: request.result, storeName });
  });
}
export async function persistRelationKey(relationId, key, options = {}) {
  if (!relationId || !key) throw new TypeError('Relation ID and key are required.');
  if (key.extractable !== false) throw new Error('Only a non-extractable relation key may be persisted.');
  const { database, storeName } = await openKeyDatabase(options);
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    transaction.onerror = () => reject(transaction.error || new Error('Relation key persistence failed.'));
    transaction.oncomplete = () => { database.close(); resolve(relationId); };
    transaction.objectStore(storeName).put(key, relationId);
  });
}
export async function loadRelationKey(relationId, options = {}) {
  const { database, storeName } = await openKeyDatabase(options);
  return new Promise((resolve, reject) => {
    const request = database.transaction(storeName, 'readonly').objectStore(storeName).get(relationId);
    request.onerror = () => reject(request.error || new Error('Relation key lookup failed.'));
    request.onsuccess = () => { database.close(); resolve(request.result || null); };
  });
}
export async function deleteRelationKey(relationId, options = {}) {
  const { database, storeName } = await openKeyDatabase(options);
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    transaction.onerror = () => reject(transaction.error || new Error('Relation key deletion failed.'));
    transaction.oncomplete = () => { database.close(); resolve(true); };
    transaction.objectStore(storeName).delete(relationId);
  });
}

export async function createRouteScopedReference({
  assuranceClass, ashAssuranceClass, artifactDigest = null, contextNonce = null,
  routeScope, key = null, cryptoImpl = globalThis.crypto, TextEncoderImpl = globalThis.TextEncoder
}) {
  const nonce = contextNonce == null
    ? generateContextNonce({ cryptoImpl })
    : validateContextNonce(contextNonce);
  if (assuranceClass === R0_RECEIPT_REFERENCES_ONLY) {
    return Object.freeze({
      assurance_class: R0_RECEIPT_REFERENCES_ONLY,
      context_nonce: nonce,
      ash_reference: null, key: null, key_extractable: null
    });
  }
  if (assuranceClass !== R1_ROUTE_SCOPED_ARTIFACT_REFERENCE) throw new Error('Unsupported relation assurance class.');
  if (ashAssuranceClass !== 'L1_BROWSER_LOCAL_ARTIFACT_DIGEST') throw new Error('R1 requires an L1 Ash receipt.');
  const relationKey = key || await generateRelationKey({ cryptoImpl });
  const ashReference = await deriveAshReference({ key: relationKey, artifactDigest, contextNonce: nonce, routeScope, cryptoImpl, TextEncoderImpl });
  return Object.freeze({
    assurance_class: R1_ROUTE_SCOPED_ARTIFACT_REFERENCE,
    context_nonce: nonce,
    ash_reference: ashReference,
    key: relationKey,
    key_extractable: relationKey.extractable
  });
}
