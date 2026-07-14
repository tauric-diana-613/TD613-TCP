import { canonicalDigest, canonicalJson } from '../dome-world/ash/canonical-json.js';
import { clone, freeze, integer, randomId, text } from './aperture-v31-core.js';

export const SAVE_POINT_SCHEMA = 'td613.ash.save-point/v0.1';
export const ASH_CAPSULE_SCHEMA = 'td613.ash.ash-capsule/v0.1';
export const MIN_PBKDF2_ITERATIONS = 600000;

const SAVE_DOMAIN = 'TD613:ASH-KEEP:SAVE-POINT:v1';
const CAPSULE_DOMAIN = 'TD613:ASH-KEEP:CAPSULE:v1';
const PAYLOAD_DOMAIN = 'TD613:ASH-KEEP:CAPSULE-PAYLOAD:v1';
const SHA256 = /^sha256:[0-9a-f]{64}$/;

function now(value) {
  return value || new Date().toISOString();
}

function unique(values = []) {
  return [...new Set(values.map(value => String(value).trim()).filter(Boolean))];
}

function without(value, field) {
  const output = clone(value);
  delete output[field];
  return output;
}

function toBase64(bytes) {
  if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64');
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value) {
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(value, 'base64'));
  const binary = atob(value);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function secureBytes(length, cryptoImpl) {
  const value = new Uint8Array(length);
  cryptoImpl.getRandomValues(value);
  return value;
}

async function deriveKey(passphrase, salt, iterations, cryptoImpl, TextEncoderImpl) {
  const material = await cryptoImpl.subtle.importKey(
    'raw',
    new TextEncoderImpl().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return cryptoImpl.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function compileSavePoint(input = {}, options = {}) {
  const record = {
    schema: SAVE_POINT_SCHEMA,
    save_point_id: input.savePointId || randomId('save_', options.cryptoImpl || globalThis.crypto),
    case_id: text(input.caseId, 'Case ID'),
    created_at: now(input.createdAt),
    case_map_digest: text(input.caseMapDigest, 'Case Map digest'),
    route_memory_digest: text(input.routeMemoryDigest, 'Route Memory digest'),
    evidence_inventory: unique(input.evidenceInventory || []),
    unanswered_questions: unique(input.unansweredQuestions || []),
    corroboration_state: clone(input.corroborationState || []),
    hypothesis_posture: clone(input.hypothesisPosture || []),
    next_step_posture: clone(input.nextStepPosture || []),
    tamper_state: String(input.tamperState || 'CLEAR').toUpperCase(),
    source_status: 'SUPPLIED',
    evidence_basis: ['Case Map digest', 'Route Memory digest', 'operator-selected continuity inventory'],
    observations: clone(input.observations || []),
    missingness: unique(input.missingness || []),
    alternatives: unique(input.alternatives || []),
    open_questions: unique(input.openQuestions || []),
    operator_notes: unique(input.operatorNotes || []),
    closure: { required: true, status: 'SEALED_LOCAL' },
    save_point_digest: null
  };
  record.save_point_digest = await canonicalDigest(SAVE_DOMAIN, without(record, 'save_point_digest'), options);
  return freeze(record);
}

export async function verifySavePoint(value, options = {}) {
  return Boolean(value && value.schema === SAVE_POINT_SCHEMA && SHA256.test(String(value.save_point_digest || '')) &&
    value.save_point_digest === await canonicalDigest(SAVE_DOMAIN, without(value, 'save_point_digest'), options));
}

export async function encryptAshCapsule(input = {}, options = {}) {
  const cryptoImpl = options.cryptoImpl || globalThis.crypto;
  const TextEncoderImpl = options.TextEncoderImpl || globalThis.TextEncoder;
  if (!cryptoImpl?.subtle || !cryptoImpl?.getRandomValues) throw new Error('WebCrypto is unavailable.');
  const passphrase = text(input.passphrase, 'Capsule passphrase');
  const iterations = integer(input.iterations ?? MIN_PBKDF2_ITERATIONS, 'PBKDF2 iterations', { min: MIN_PBKDF2_ITERATIONS });
  const salt = secureBytes(16, cryptoImpl);
  const iv = secureBytes(12, cryptoImpl);
  const createdAt = now(input.createdAt);
  const payload = {
    schema: 'td613.ash.ash-capsule-payload/v0.1',
    case_id: text(input.caseId, 'Case ID'),
    created_at: createdAt,
    save_point: clone(input.savePoint),
    case_bundle: clone(input.caseBundle),
    payload_digest: null
  };
  payload.payload_digest = await canonicalDigest(PAYLOAD_DOMAIN, without(payload, 'payload_digest'), { cryptoImpl, TextEncoderImpl });
  const metadata = {
    schema: ASH_CAPSULE_SCHEMA,
    version: 'v1.0-alpha',
    case_id: payload.case_id,
    created_at: createdAt,
    cipher: 'AES-256-GCM',
    kdf: 'PBKDF2-HMAC-SHA-256',
    iterations,
    salt_bytes: 16,
    iv_bytes: 12,
    recipient_transport: 'DEFERRED'
  };
  const encoder = new TextEncoderImpl();
  const key = await deriveKey(passphrase, salt, iterations, cryptoImpl, TextEncoderImpl);
  const encrypted = await cryptoImpl.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: encoder.encode(canonicalJson(metadata)), tagLength: 128 },
    key,
    encoder.encode(canonicalJson(payload))
  );
  const capsule = {
    ...metadata,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(encrypted)),
    capsule_digest: null
  };
  capsule.capsule_digest = await canonicalDigest(CAPSULE_DOMAIN, without(capsule, 'capsule_digest'), { cryptoImpl, TextEncoderImpl });
  return freeze(capsule);
}

export async function decryptAshCapsule(capsule, passphrase, options = {}) {
  const cryptoImpl = options.cryptoImpl || globalThis.crypto;
  const TextEncoderImpl = options.TextEncoderImpl || globalThis.TextEncoder;
  const TextDecoderImpl = options.TextDecoderImpl || globalThis.TextDecoder;
  if (!capsule || capsule.schema !== ASH_CAPSULE_SCHEMA) throw new Error('Unsupported Ash Capsule schema.');
  if (capsule.cipher !== 'AES-256-GCM' || capsule.kdf !== 'PBKDF2-HMAC-SHA-256') throw new Error('Unsupported Ash Capsule cryptography.');
  const iterations = integer(capsule.iterations, 'PBKDF2 iterations', { min: MIN_PBKDF2_ITERATIONS });
  const salt = fromBase64(capsule.salt);
  const iv = fromBase64(capsule.iv);
  if (salt.byteLength !== 16 || iv.byteLength !== 12 || capsule.salt_bytes !== 16 || capsule.iv_bytes !== 12) throw new Error('Ash Capsule salt or IV metadata is invalid.');
  const expectedCapsuleDigest = await canonicalDigest(CAPSULE_DOMAIN, without(capsule, 'capsule_digest'), { cryptoImpl, TextEncoderImpl });
  if (expectedCapsuleDigest !== capsule.capsule_digest) throw new Error('Ash Capsule digest verification failed.');
  const metadata = without(without(without(without(capsule, 'salt'), 'iv'), 'ciphertext'), 'capsule_digest');
  const key = await deriveKey(text(passphrase, 'Capsule passphrase'), salt, iterations, cryptoImpl, TextEncoderImpl);
  let plaintext;
  try {
    plaintext = await cryptoImpl.subtle.decrypt(
      { name: 'AES-GCM', iv, additionalData: new TextEncoderImpl().encode(canonicalJson(metadata)), tagLength: 128 },
      key,
      fromBase64(capsule.ciphertext)
    );
  } catch {
    throw new Error('Ash Capsule authentication failed; nothing was imported.');
  }
  let payload;
  try {
    payload = JSON.parse(new TextDecoderImpl().decode(plaintext));
  } catch {
    throw new Error('Ash Capsule payload is invalid; nothing was imported.');
  }
  if (payload?.schema !== 'td613.ash.ash-capsule-payload/v0.1' || payload.case_id !== capsule.case_id) throw new Error('Ash Capsule payload metadata mismatch; nothing was imported.');
  const expectedPayloadDigest = await canonicalDigest(PAYLOAD_DOMAIN, without(payload, 'payload_digest'), { cryptoImpl, TextEncoderImpl });
  if (expectedPayloadDigest !== payload.payload_digest) throw new Error('Ash Capsule payload digest failed; nothing was imported.');
  return freeze(payload);
}
