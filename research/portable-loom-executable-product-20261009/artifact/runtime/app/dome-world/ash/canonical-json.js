/**
 * TD613 canonical JSON and digest profile for Ash Phase 2.
 *
 * TD613-CJ-1 accepts null, booleans, Unicode scalar strings, safe integers,
 * arrays, and objects with printable ASCII keys. Object keys sort
 * lexicographically; arrays preserve order; strings receive no Unicode
 * normalization; floating-point numbers, negative zero, unpaired surrogates,
 * undefined values, and non-plain objects are rejected.
 */

export const CANONICAL_JSON_PROFILE = "td613.ash.canonical-json/v0.1";
export const MANIFEST_DIGEST_DOMAIN = "td613.ash.manifest-digest/v0.1";
export const RECEIPT_DIGEST_DOMAIN = "td613.ash.receipt-digest/v0.1";
export const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

const ASCII_KEY_RE = /^[\x20-\x7e]+$/;

function assertUnicodeScalarString(value, path) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        throw new TypeError(`${path} contains an unpaired Unicode surrogate.`);
      }
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      throw new TypeError(`${path} contains an unpaired Unicode surrogate.`);
    }
  }
}

function normalizeCanonical(value, path = "$") {
  if (value === null || typeof value === "boolean") return value;

  if (typeof value === "string") {
    assertUnicodeScalarString(value, path);
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || Object.is(value, -0)) {
      throw new TypeError(
        `${path} must be a safe integer and may not be negative zero.`,
      );
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item, index) =>
      normalizeCanonical(item, `${path}[${index}]`),
    );
  }

  if (typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError(`${path} must be a plain object.`);
    }
    const out = {};
    for (const key of Object.keys(value).sort()) {
      if (!ASCII_KEY_RE.test(key)) {
        throw new TypeError(
          `${path} contains a non-ASCII object key: ${JSON.stringify(key)}.`,
        );
      }
      assertUnicodeScalarString(key, `${path}.<key>`);
      const item = value[key];
      if (typeof item === "undefined") {
        throw new TypeError(`${path}.${key} contains undefined.`);
      }
      out[key] = normalizeCanonical(item, `${path}.${key}`);
    }
    return out;
  }

  throw new TypeError(`${path} contains unsupported canonical JSON type.`);
}

export function canonicalJson(value) {
  return JSON.stringify(normalizeCanonical(value));
}

export function canonicalBytes(
  value,
  { TextEncoderImpl = globalThis.TextEncoder } = {},
) {
  if (typeof TextEncoderImpl !== "function") {
    throw new Error("TextEncoder is unavailable.");
  }
  return new TextEncoderImpl().encode(canonicalJson(value));
}

function bytesToHex(buffer) {
  return Array.from(new Uint8Array(buffer), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function canonicalDigest(
  domain,
  value,
  {
    cryptoImpl = globalThis.crypto,
    TextEncoderImpl = globalThis.TextEncoder,
  } = {},
) {
  if (typeof domain !== "string" || !ASCII_KEY_RE.test(domain)) {
    throw new TypeError("Digest domain must be a printable ASCII string.");
  }
  if (!cryptoImpl?.subtle?.digest) {
    throw new Error("Web Crypto SHA-256 is unavailable.");
  }
  const encoder = new TextEncoderImpl();
  const material = encoder.encode(`${domain}\n${canonicalJson(value)}`);
  const digest = await cryptoImpl.subtle.digest("SHA-256", material);
  return `sha256:${bytesToHex(digest)}`;
}

export function manifestDigestSubject(manifest) {
  const subject = {};
  for (const [key, value] of Object.entries(manifest || {})) {
    if (key !== "manifest_digest" && key !== "aperture") subject[key] = value;
  }
  return subject;
}

export function receiptDigestSubject(receipt) {
  const subject = {};
  for (const [key, value] of Object.entries(receipt || {})) {
    if (key !== "receipt_digest" && key !== "receipt_id") subject[key] = value;
  }
  return subject;
}

export function computeManifestDigest(manifest, options = {}) {
  return canonicalDigest(
    MANIFEST_DIGEST_DOMAIN,
    manifestDigestSubject(manifest),
    options,
  );
}

export function computeReceiptDigest(receipt, options = {}) {
  return canonicalDigest(
    RECEIPT_DIGEST_DOMAIN,
    receiptDigestSubject(receipt),
    options,
  );
}

export async function verifyReceiptDigests(receipt, options = {}) {
  if (!receipt || typeof receipt !== "object") {
    throw new TypeError("Receipt must be an object.");
  }
  const manifest = receipt.manifest;
  if (!manifest || typeof manifest !== "object") {
    throw new TypeError("Receipt must contain a manifest object.");
  }
  const expectedManifest = await computeManifestDigest(manifest, options);
  const expectedReceipt = await computeReceiptDigest(receipt, options);
  return Object.freeze({
    valid:
      expectedManifest === manifest.manifest_digest &&
      expectedManifest === receipt.manifest_digest &&
      expectedReceipt === receipt.receipt_digest,
    manifest_valid:
      expectedManifest === manifest.manifest_digest &&
      expectedManifest === receipt.manifest_digest,
    receipt_valid: expectedReceipt === receipt.receipt_digest,
    expected_manifest_digest: expectedManifest,
    expected_receipt_digest: expectedReceipt,
  });
}
