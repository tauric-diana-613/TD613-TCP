import { canonicalBytes } from '../dome-world/ash/canonical-json.js';
import { freeze, integer, randomId, recordDigest, text, verifyRecord } from './aperture-v31-core.js';

export const STRETCH12_LIVE_STATE_SCHEMA = 'td613.ash.live-state-encryption-manifest/v0.1';
const LIVE_STATE_DOMAIN = 'TD613:ASH:S12:LIVE-STATE-ENCRYPTION:v1';
const DEFAULT_ITERATIONS = 600000;

function toBase64(bytes) {
  const value = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (typeof Buffer !== 'undefined') return Buffer.from(value).toString('base64');
  let binary = '';
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value) {
  if (typeof value !== 'string' || !value) throw new Error('Base64 value is required.');
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(value, 'base64'));
  const binary = atob(value);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function randomBytes(length, cryptoImpl) {
  const bytes = new Uint8Array(length);
  cryptoImpl.getRandomValues(bytes);
  return bytes;
}

async function deriveWrapKey(passphrase, salt, iterations, cryptoImpl, TextEncoderImpl) {
  const passphraseBytes = new TextEncoderImpl().encode(text(passphrase, 'Passphrase'));
  const material = await cryptoImpl.subtle.importKey('raw', passphraseBytes, 'PBKDF2', false, ['deriveKey']);
  return cryptoImpl.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function recordAad({ caseId, recordId, recordClass, sequence, databaseVersion, originManifestRoot, custodyRootReference }) {
  return {
    case_id: caseId,
    custody_root_reference: custodyRootReference || null,
    database_version: databaseVersion,
    origin_manifest_root: originManifestRoot,
    record_class: recordClass,
    record_id: recordId,
    schema: STRETCH12_LIVE_STATE_SCHEMA,
    sequence
  };
}

export async function createEncryptedCaseEnvelope(input = {}, options = {}) {
  const cryptoImpl = options.cryptoImpl || globalThis.crypto;
  const TextEncoderImpl = options.TextEncoderImpl || globalThis.TextEncoder;
  if (!cryptoImpl?.subtle || !cryptoImpl?.getRandomValues) throw new Error('Web Crypto is unavailable.');
  const caseId = text(input.caseId, 'Case ID');
  const records = Array.isArray(input.records) ? input.records : [];
  if (!records.length) throw new Error('At least one live-state record is required.');
  const iterations = integer(input.iterations ?? DEFAULT_ITERATIONS, 'PBKDF2 iterations', { min: DEFAULT_ITERATIONS });
  const databaseVersion = integer(input.databaseVersion ?? 1, 'Database version', { min: 1 });
  const originManifestRoot = text(input.originManifestRoot, 'Origin Manifest root');
  const custodyRootReference = input.custodyRootReference || null;

  const rawCaseKey = randomBytes(32, cryptoImpl);
  const caseKey = await cryptoImpl.subtle.importKey('raw', rawCaseKey, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  const salt = randomBytes(16, cryptoImpl);
  const wrapIv = randomBytes(12, cryptoImpl);
  const wrapKey = await deriveWrapKey(input.passphrase, salt, iterations, cryptoImpl, TextEncoderImpl);
  const wrapAad = canonicalBytes({ case_id: caseId, origin_manifest_root: originManifestRoot, schema: STRETCH12_LIVE_STATE_SCHEMA }, { TextEncoderImpl });
  const wrappedCaseKey = await cryptoImpl.subtle.encrypt({ name: 'AES-GCM', iv: wrapIv, additionalData: wrapAad, tagLength: 128 }, wrapKey, rawCaseKey);

  const encryptedRecords = [];
  for (let index = 0; index < records.length; index += 1) {
    const source = records[index] || {};
    const recordId = text(source.recordId || source.record_id, `Record ${index + 1} ID`);
    const recordClass = text(source.recordClass || source.record_class || 'CASE_RECORD', `Record ${index + 1} class`).toUpperCase();
    const sequence = integer(source.sequence ?? index + 1, `Record ${index + 1} sequence`, { min: 1 });
    const aadObject = recordAad({ caseId, recordId, recordClass, sequence, databaseVersion, originManifestRoot, custodyRootReference });
    const iv = randomBytes(12, cryptoImpl);
    const plaintext = canonicalBytes(source.body, { TextEncoderImpl });
    const ciphertext = await cryptoImpl.subtle.encrypt(
      { name: 'AES-GCM', iv, additionalData: canonicalBytes(aadObject, { TextEncoderImpl }), tagLength: 128 },
      caseKey,
      plaintext
    );
    encryptedRecords.push({
      record_id: recordId,
      record_class: recordClass,
      sequence,
      iv_b64: toBase64(iv),
      aad: aadObject,
      ciphertext_b64: toBase64(ciphertext)
    });
  }

  const envelope = {
    schema: STRETCH12_LIVE_STATE_SCHEMA,
    envelope_id: input.envelopeId || randomId('live_', cryptoImpl),
    case_id: caseId,
    created_at: input.createdAt || new Date().toISOString(),
    origin_manifest_root: originManifestRoot,
    custody_root_reference: custodyRootReference,
    database_version: databaseVersion,
    cipher: { name: 'AES-GCM', key_bits: 256, iv_bits: 96, tag_bits: 128 },
    kdf: { name: 'PBKDF2-HMAC-SHA-256', iterations, salt_bits: 128 },
    salt_b64: toBase64(salt),
    wrapped_case_key: {
      iv_b64: toBase64(wrapIv),
      aad: { case_id: caseId, origin_manifest_root: originManifestRoot, schema: STRETCH12_LIVE_STATE_SCHEMA },
      ciphertext_b64: toBase64(wrappedCaseKey)
    },
    records: encryptedRecords,
    plaintext_persisted: false,
    passphrase_persisted: false,
    derived_key_persisted: false,
    physical_erasure_proven: false,
    cannot_establish: [
      'endpoint integrity',
      'JavaScript memory zeroization',
      'absence of operating-system swap or snapshots',
      'absence of extension access during an unlocked session'
    ],
    envelope_digest: null
  };
  envelope.envelope_digest = await recordDigest(LIVE_STATE_DOMAIN, envelope, 'envelope_digest', options);
  rawCaseKey.fill(0);
  return freeze(envelope);
}

export const verifyEncryptedCaseEnvelope = (value, options = {}) => verifyRecord(LIVE_STATE_DOMAIN, value, 'envelope_digest', STRETCH12_LIVE_STATE_SCHEMA, options);

export async function openEncryptedCaseEnvelope(envelope, passphrase, options = {}) {
  const cryptoImpl = options.cryptoImpl || globalThis.crypto;
  const TextEncoderImpl = options.TextEncoderImpl || globalThis.TextEncoder;
  const TextDecoderImpl = options.TextDecoderImpl || globalThis.TextDecoder;
  if (!(await verifyEncryptedCaseEnvelope(envelope, options))) throw new Error('LIVE_STATE_TAMPER_HOLD');
  const salt = fromBase64(envelope.salt_b64);
  const wrapKey = await deriveWrapKey(passphrase, salt, envelope.kdf.iterations, cryptoImpl, TextEncoderImpl);
  const wrapIv = fromBase64(envelope.wrapped_case_key.iv_b64);
  const wrapAad = canonicalBytes(envelope.wrapped_case_key.aad, { TextEncoderImpl });
  let rawCaseKey;
  try {
    rawCaseKey = new Uint8Array(await cryptoImpl.subtle.decrypt(
      { name: 'AES-GCM', iv: wrapIv, additionalData: wrapAad, tagLength: 128 },
      wrapKey,
      fromBase64(envelope.wrapped_case_key.ciphertext_b64)
    ));
  } catch {
    throw new Error('LIVE_STATE_PASSPHRASE_OR_WRAP_HOLD');
  }
  const caseKey = await cryptoImpl.subtle.importKey('raw', rawCaseKey, { name: 'AES-GCM' }, false, ['decrypt']);
  const decoder = new TextDecoderImpl();
  const records = [];
  try {
    for (const record of envelope.records) {
      const plaintext = await cryptoImpl.subtle.decrypt(
        { name: 'AES-GCM', iv: fromBase64(record.iv_b64), additionalData: canonicalBytes(record.aad, { TextEncoderImpl }), tagLength: 128 },
        caseKey,
        fromBase64(record.ciphertext_b64)
      );
      records.push(freeze({
        record_id: record.record_id,
        record_class: record.record_class,
        sequence: record.sequence,
        body: JSON.parse(decoder.decode(plaintext))
      }));
    }
  } catch {
    throw new Error('LIVE_STATE_RECORD_TAMPER_HOLD');
  } finally {
    rawCaseKey.fill(0);
  }
  return freeze({
    schema: 'td613.ash.live-state-open-result/v0.1',
    case_id: envelope.case_id,
    envelope_digest: envelope.envelope_digest,
    records,
    live_case_mutated: false,
    physical_erasure_proven: false
  });
}
