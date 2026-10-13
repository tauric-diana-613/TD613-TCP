const ENVELOPE_SCHEMA = 'td613.giving.encrypted-dossier/v1';
const WRAP_AAD_SCHEMA = 'td613.giving.vault-key/v1';
const PAYLOAD_AAD_SCHEMA = 'td613.giving.dossier-ciphertext/v1';
export const DEFAULT_PBKDF2_ITERATIONS = 600000;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64(bytes) {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(String(value));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

async function digestHex(value, cryptoImpl) {
  const digest = new Uint8Array(await cryptoImpl.subtle.digest('SHA-256', encoder.encode(value)));
  return [...digest].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function deriveWrappingKey(passphrase, salt, iterations, usages, cryptoImpl) {
  const material = await cryptoImpl.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return cryptoImpl.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    usages
  );
}

function assertCrypto(cryptoImpl) {
  if (!cryptoImpl?.subtle || !cryptoImpl?.getRandomValues) throw new Error('WebCrypto is required for encrypted custody.');
}

function randomBytes(length, cryptoImpl) {
  return cryptoImpl.getRandomValues(new Uint8Array(length));
}

export async function encryptDossier(dossier, passphrase, options = {}) {
  const cryptoImpl = options.cryptoImpl || globalThis.crypto;
  const iterations = Number.isSafeInteger(options.iterations) ? options.iterations : DEFAULT_PBKDF2_ITERATIONS;
  assertCrypto(cryptoImpl);
  if (String(passphrase).length < 12) throw new Error('Vault passphrase must contain at least 12 characters.');
  if (!dossier?.id || !Number.isSafeInteger(dossier?.version)) throw new TypeError('A versioned dossier is required.');
  if (iterations < 1) throw new TypeError('PBKDF2 iterations must be a positive integer.');

  const salt = randomBytes(16, cryptoImpl);
  const wrappingIv = randomBytes(12, cryptoImpl);
  const payloadIv = randomBytes(12, cryptoImpl);
  const contentKeyBytes = randomBytes(32, cryptoImpl);
  const contentKey = await cryptoImpl.subtle.importKey('raw', contentKeyBytes, { name: 'AES-GCM' }, false, ['encrypt']);
  const wrappingKey = await deriveWrappingKey(passphrase, salt, iterations, ['encrypt'], cryptoImpl);
  const wrapAad = encoder.encode(`${WRAP_AAD_SCHEMA}|${dossier.id}`);
  const payloadAad = encoder.encode(`${PAYLOAD_AAD_SCHEMA}|${dossier.id}|${dossier.version}`);
  const wrappedKey = await cryptoImpl.subtle.encrypt(
    { name: 'AES-GCM', iv: wrappingIv, additionalData: wrapAad, tagLength: 128 },
    wrappingKey,
    contentKeyBytes
  );
  const ciphertext = await cryptoImpl.subtle.encrypt(
    { name: 'AES-GCM', iv: payloadIv, additionalData: payloadAad, tagLength: 128 },
    contentKey,
    encoder.encode(JSON.stringify(dossier))
  );
  contentKeyBytes.fill(0);

  const envelope = {
    schema: ENVELOPE_SCHEMA,
    version_id: options.versionId || cryptoImpl.randomUUID?.() || `vault-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    dossier_id: dossier.id,
    dossier_version: dossier.version,
    custody: dossier.custody,
    parent_digests: Array.isArray(dossier.ancestry) ? [...dossier.ancestry] : [],
    created_at: new Date().toISOString(),
    crypto: {
      cipher: 'AES-GCM-256',
      kdf: 'PBKDF2-HMAC-SHA-256',
      iterations,
      salt: bytesToBase64(salt),
      wrapping_iv: bytesToBase64(wrappingIv),
      payload_iv: bytesToBase64(payloadIv),
      wrap_aad: `${WRAP_AAD_SCHEMA}|${dossier.id}`,
      payload_aad: `${PAYLOAD_AAD_SCHEMA}|${dossier.id}|${dossier.version}`
    },
    wrapped_key: bytesToBase64(new Uint8Array(wrappedKey)),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext))
  };
  envelope.digest = `sha256:${await digestHex(canonical(envelope), cryptoImpl)}`;
  return envelope;
}

export async function decryptDossier(envelope, passphrase, options = {}) {
  const cryptoImpl = options.cryptoImpl || globalThis.crypto;
  assertCrypto(cryptoImpl);
  if (envelope?.schema !== ENVELOPE_SCHEMA) throw new TypeError('Unsupported encrypted dossier schema.');
  const unsigned = { ...envelope };
  delete unsigned.digest;
  const expected = `sha256:${await digestHex(canonical(unsigned), cryptoImpl)}`;
  if (expected !== envelope.digest) throw new Error('Vault authentication failed: wrong passphrase or modified ciphertext.');

  try {
    const salt = base64ToBytes(envelope.crypto.salt);
    const wrappingIv = base64ToBytes(envelope.crypto.wrapping_iv);
    const payloadIv = base64ToBytes(envelope.crypto.payload_iv);
    const wrappingKey = await deriveWrappingKey(
      passphrase,
      salt,
      envelope.crypto.iterations,
      ['decrypt'],
      cryptoImpl
    );
    const rawContentKey = await cryptoImpl.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: wrappingIv,
        additionalData: encoder.encode(envelope.crypto.wrap_aad),
        tagLength: 128
      },
      wrappingKey,
      base64ToBytes(envelope.wrapped_key)
    );
    const contentKey = await cryptoImpl.subtle.importKey('raw', rawContentKey, { name: 'AES-GCM' }, false, ['decrypt']);
    const plaintext = await cryptoImpl.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: payloadIv,
        additionalData: encoder.encode(envelope.crypto.payload_aad),
        tagLength: 128
      },
      contentKey,
      base64ToBytes(envelope.ciphertext)
    );
    const dossier = JSON.parse(decoder.decode(plaintext));
    if (dossier.id !== envelope.dossier_id || dossier.version !== envelope.dossier_version) throw new Error('Envelope metadata does not match decrypted dossier.');
    return dossier;
  } catch (error) {
    if (error?.message === 'Envelope metadata does not match decrypted dossier.') throw error;
    throw new Error('Vault authentication failed: wrong passphrase or modified ciphertext.');
  }
}

export function toHostedVaultPayload(envelope, {
  parentVersionId = null,
  mergeParentVersionIds = [],
  custodyMode = 'HOSTED'
} = {}) {
  if (envelope?.schema !== ENVELOPE_SCHEMA) throw new TypeError('Unsupported encrypted dossier schema.');
  return {
    dossier_id: envelope.dossier_id,
    version_id: envelope.version_id,
    parent_version_id: parentVersionId || null,
    merge_parent_version_ids: [...new Set(mergeParentVersionIds)].filter(Boolean),
    ciphertext: envelope.ciphertext,
    wrapped_key: {
      ciphertext: envelope.wrapped_key,
      envelope_meta: {
        schema: envelope.schema,
        version_id: envelope.version_id,
        dossier_id: envelope.dossier_id,
        dossier_version: envelope.dossier_version,
        custody: envelope.custody,
        parent_digests: envelope.parent_digests,
        created_at: envelope.created_at,
        crypto: envelope.crypto,
        digest: envelope.digest
      }
    },
    crypto: {
      algorithm: 'AES-GCM-256',
      iv: envelope.crypto.payload_iv,
      schema: PAYLOAD_AAD_SCHEMA,
      aad: envelope.crypto.payload_aad,
      dossier_version: envelope.dossier_version,
      envelope_schema: envelope.schema
    },
    content_digest: String(envelope.digest).replace(/^sha256:/, ''),
    custody_mode: custodyMode
  };
}

export function fromHostedVaultRow(row) {
  let wrappedKey = row?.wrapped_key;
  if (typeof wrappedKey === 'string') {
    try { wrappedKey = JSON.parse(wrappedKey); } catch { throw new TypeError('Hosted vault wrapped-key metadata is malformed.'); }
  }
  const meta = wrappedKey?.envelope_meta;
  if (!meta || !wrappedKey?.ciphertext || !row?.ciphertext) throw new TypeError('Hosted vault row is incomplete.');
  return {
    schema: meta.schema,
    version_id: meta.version_id || row.version_id,
    dossier_id: meta.dossier_id || row.dossier_id,
    dossier_version: meta.dossier_version,
    custody: meta.custody,
    parent_digests: meta.parent_digests || [],
    created_at: meta.created_at || row.created_at,
    crypto: meta.crypto,
    wrapped_key: wrappedKey.ciphertext,
    ciphertext: row.ciphertext,
    digest: meta.digest || `sha256:${row.content_digest}`
  };
}

export function encryptedEnvelopeContract() {
  return Object.freeze({
    schema: ENVELOPE_SCHEMA,
    cipher: 'AES-GCM-256',
    default_iterations: DEFAULT_PBKDF2_ITERATIONS,
    per_version_random_content_key: true,
    unique_payload_iv_required: true,
    server_plaintext: false
  });
}
