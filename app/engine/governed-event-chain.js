// Isomorphic SHA-256 implementation supporting both Node.js and Browser environments
let nodeCreateHash = null;
try {
  if (typeof process !== 'undefined' && process.versions?.node) {
    const cryptoModule = await import('node:crypto');
    nodeCreateHash = cryptoModule.createHash;
  }
} catch {}

function sha256Bytes(data) {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const len = bytes.length;
  const bitLen = len * 8;
  const padLen = (len % 64 < 56) ? (56 - (len % 64)) : (120 - (len % 64));
  const totalLen = len + padLen + 8;
  const padded = new Uint8Array(totalLen);
  padded.set(bytes);
  padded[len] = 0x80;

  const view = new DataView(padded.buffer);
  view.setBigUint64(totalLen - 8, BigInt(bitLen), false);

  const W = new Uint32Array(64);

  for (let i = 0; i < totalLen; i += 64) {
    for (let t = 0; t < 16; t++) {
      W[t] = view.getUint32(i + t * 4, false);
    }
    for (let t = 16; t < 64; t++) {
      const s0 = ((W[t-15] >>> 7) | (W[t-15] << 25)) ^ ((W[t-15] >>> 18) | (W[t-15] << 14)) ^ (W[t-15] >>> 3);
      const s1 = ((W[t-2] >>> 17) | (W[t-2] << 15)) ^ ((W[t-2] >>> 19) | (W[t-2] << 13)) ^ (W[t-2] >>> 10);
      W[t] = (W[t-16] + s0 + W[t-7] + s1) | 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;

    for (let t = 0; t < 64; t++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ ((~e) & g);
      const temp1 = (h + S1 + ch + K[t] + W[t]) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  const out = new DataView(new ArrayBuffer(32));
  out.setUint32(0, h0, false);
  out.setUint32(4, h1, false);
  out.setUint32(8, h2, false);
  out.setUint32(12, h3, false);
  out.setUint32(16, h4, false);
  out.setUint32(20, h5, false);
  out.setUint32(24, h6, false);
  out.setUint32(28, h7, false);

  let hex = '';
  const u8 = new Uint8Array(out.buffer);
  for (let i = 0; i < 32; i++) {
    hex += u8[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function concatBytes(a, b) {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

function digestBytes(bytes) {
  if (nodeCreateHash) {
    return nodeCreateHash('sha256').update(bytes).digest('hex');
  }
  return sha256Bytes(bytes);
}

export const GOVERNED_EVENT_SCHEMA = 'td613.event.predecessor-chain/v1.0';
export const GOVERNED_EVENT_CHAIN_VERIFICATION_SCHEMA = 'td613.event.chain-verification/v1.0';

/**
 * Domain separation prefixes for SHA-256 digests.
 *
 * CLAIM CEILING & HONESTY NOTICE:
 * - A fixed SHA-256 domain prefix supports digest-domain separation.
 * - Canonical encoding prevents ambiguous field concatenation.
 * - Neither statement, by itself, proves elimination of SHA-256 length-extension behavior.
 * - This mechanism earns domain separation between event digests and genesis anchors;
 *   it does NOT claim elimination of general length-extension attack surfaces.
 */
export const DOMAIN_SEPARATION_PREFIX = 'TD613-EVENT-v1\x00';
export const GENESIS_DOMAIN_SEPARATION_PREFIX = 'TD613-GENESIS\x00';

const HEX64_REGEX = /^[a-f0-9]{64}$/;
const UUID_OR_TOKEN_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

const VALID_EVENT_TYPES = Object.freeze([
  'GOVERNED_TRANSITION',
  'HOLD_ASSERTION',
  'REST_RETURN'
]);

const VALID_ACTOR_CLASSES = Object.freeze([
  'INTERACTIVE_OPERATOR_DIRECT',
  'AMARI_CONNECTOR',
  'DETACHED_DELEGATED'
]);

/**
 * Claim ceilings and invariant boundaries for Tranche 1.
 */
export const CLAIM_CEILINGS = Object.freeze([
  'TAMPER_EVIDENT_PREDECESSOR_CHAINING_ONLY',
  'NOT_CUSTODY_AUTHORITY',
  'NOT_EXTERNAL_ORIGIN_PROOF',
  'MONOTONIC_EVENT_TIME_NOT_FULL_NON_RETROACTIVITY',
  'PREDECESSOR_CHAIN_VERIFIED_NOT_TERMINAL_HEAD_ANCHORED',
  'HEAD_DIGEST_COMPUTED_NOT_HEAD_DIGEST_WITNESSED',
  'ROUTE_IDENTITY_BOUND_NOT_ROUTE_TRANSITION_AUTHORIZED',
  'DETERMINISTIC_JCS_CANONICALIZATION_SUBSET_ESTABLISHED',
  'FULL_RFC_8785_CONFORMANCE_HELD'
]);

function deepFreeze(obj) {
  if (obj && typeof obj === 'object' && !Object.isFrozen(obj)) {
    Object.values(obj).forEach(deepFreeze);
    Object.freeze(obj);
  }
  return obj;
}

function exact(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(value))) {
    throw new TypeError(`${label} must be a plain object.`);
  }
  const actualKeys = Object.keys(value).sort();
  const expectedKeys = [...keys].sort();
  if (actualKeys.length !== expectedKeys.length || actualKeys.some((k, i) => k !== expectedKeys[i])) {
    throw new TypeError(`${label} requires exactly declared fields: ${keys.join(', ')}.`);
  }
  return value;
}

function text(value, label, max = 500) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) {
    throw new TypeError(`${label} must be bounded non-empty text.`);
  }
  return value;
}

function hex64(value, label) {
  if (typeof value !== 'string' || !HEX64_REGEX.test(value)) {
    throw new TypeError(`${label} must be a 64-character lowercase hex SHA-256 digest.`);
  }
  return value;
}

function isoTimestamp(value, label) {
  if (typeof value !== 'string') throw new TypeError(`${label} must be an ISO 8601 string.`);
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.toISOString() !== value) {
    throw new TypeError(`${label} must be a valid canonical ISO 8601 UTC timestamp (e.g., 2026-10-06T19:05:00.000Z).`);
  }
  return value;
}

/**
 * Validates that a string does not contain lone surrogate code units.
 * RFC 8785 Section 3.2.2.2 requires valid Unicode code points only; lone surrogates are forbidden.
 */
function assertWellFormedUnicode(str, label) {
  if (typeof str !== 'string') return;
  if (typeof str.isWellFormed === 'function') {
    if (!str.isWellFormed()) {
      throw new TypeError(`RFC 8785: ${label} must not contain lone surrogate code units (invalid Unicode).`);
    }
  } else {
    const loneSurrogateRegex = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;
    if (loneSurrogateRegex.test(str)) {
      throw new TypeError(`RFC 8785: ${label} must not contain lone surrogate code units (invalid Unicode).`);
    }
  }
}

/**
 * Deterministic JSON Canonicalization Scheme (RFC 8785 / JCS).
 *
 * Implements RFC 8785 requirements:
 * 1. Object keys sorted lexicographically by UTF-16 code units.
 * 2. Numbers formatted per ECMAScript 7.1.12.1 ToString (-0 serialized as 0, NaN/Infinity rejected).
 * 3. Zero whitespace outside quoted strings.
 * 4. Strict rejection of lone surrogates in strings and object property names.
 * 5. Strict rejection of sparse arrays with holes.
 * 6. Rejection of undefined, functions, symbols, BigInt, and non-plain objects.
 *
 * Current Claim Boundary:
 * DETERMINISTIC_JCS_CANONICALIZATION_SUBSET = ESTABLISHED
 * FULL_RFC_8785_CONFORMANCE = HELD
 */
export function canonicalizeJson(value) {
  if (value === null) {
    return 'null';
  }
  const t = typeof value;
  if (t === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (t === 'number') {
    if (!Number.isFinite(value)) {
      throw new TypeError('RFC 8785: non-finite numbers (NaN, Infinity) are not valid JSON');
    }
    return Object.is(value, -0) ? '0' : value.toString();
  }
  if (t === 'string') {
    assertWellFormedUnicode(value, 'JSON string value');
    return JSON.stringify(value);
  }
  if (t === 'undefined' || t === 'function' || t === 'symbol' || t === 'bigint') {
    throw new TypeError(`RFC 8785: unsupported type: ${t}`);
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (!(i in value)) {
        throw new TypeError('RFC 8785: sparse arrays with holes are not valid JSON');
      }
    }
    return '[' + value.map(canonicalizeJson).join(',') + ']';
  }
  if (t === 'object') {
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) {
      throw new TypeError('RFC 8785: only plain objects and arrays are canonicalizable');
    }
    const keys = Object.keys(value).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    for (const k of keys) {
      assertWellFormedUnicode(k, 'JSON object property name');
    }
    return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalizeJson(value[k])).join(',') + '}';
  }
  throw new TypeError(`RFC 8785: unhandled value: ${value}`);
}

/**
 * Computes the domain-separated SHA-256 digest of a governed event.
 * Incorporates DOMAIN_SEPARATION_PREFIX before RFC 8785 canonical bytes.
 */
export function computeEventDigest(event) {
  const encoder = new TextEncoder();
  const canonicalBytes = encoder.encode(canonicalizeJson(event));
  const domainPrefix = encoder.encode(DOMAIN_SEPARATION_PREFIX);
  const buffer = concatBytes(domainPrefix, canonicalBytes);
  return digestBytes(buffer);
}

/**
 * Computes the genesis anchor digest from session and commit parameters.
 * Incorporates GENESIS_DOMAIN_SEPARATION_PREFIX before RFC 8785 canonical bytes.
 */
export function computeGenesisDigest({ sessionId, initialCommitSha, routeIdentity }) {
  text(sessionId, 'sessionId');
  text(initialCommitSha, 'initialCommitSha');
  text(routeIdentity, 'routeIdentity');

  const encoder = new TextEncoder();
  const payload = canonicalizeJson({
    initial_commit_sha: initialCommitSha,
    route_identity: routeIdentity,
    session_id: sessionId
  });
  const domainPrefix = encoder.encode(GENESIS_DOMAIN_SEPARATION_PREFIX);
  const buffer = concatBytes(domainPrefix, encoder.encode(payload));
  return digestBytes(buffer);
}

/**
 * Validates and freezes an individual governed event record.
 *
 * TIMESTAMP SEMANTICS:
 * - Declared measurement_time_iso <= recording_time_iso.
 * - Rejects records whose declared measurement timestamp occurs after their recording timestamp.
 * - Does NOT claim generic "rejection of future observations" because wall-clock future
 *   validation is not implemented in this tranche.
 *
 * ROUTE IDENTITY BINDING:
 * - Cryptographically binds declared route_identity.
 * - Detects tampering with a hash-bound intermediate route identity once committed by a descendant.
 * - ROUTE_IDENTITY_BOUND != ROUTE_TRANSITION_AUTHORIZED (does not establish route transition authorization policy).
 */
export function validateGovernedEvent(event, label = 'governed event') {
  exact(event, [
    '$schema',
    'event_type',
    'predecessor_digest',
    'route_identity',
    'authority_context',
    'payload_envelope_digest',
    'measurement_time_iso',
    'recording_time_iso'
  ], label);

  if (event.$schema !== GOVERNED_EVENT_SCHEMA) {
    throw new TypeError(`${label}: unsupported schema: ${event.$schema}`);
  }

  if (!VALID_EVENT_TYPES.includes(event.event_type)) {
    throw new TypeError(`${label}: invalid event_type: ${event.event_type}`);
  }

  hex64(event.predecessor_digest, `${label}.predecessor_digest`);
  text(event.route_identity, `${label}.route_identity`);

  exact(event.authority_context, ['actor_class', 'authorization_token_id'], `${label}.authority_context`);
  if (!VALID_ACTOR_CLASSES.includes(event.authority_context.actor_class)) {
    throw new TypeError(`${label}.authority_context.actor_class invalid`);
  }
  if (!UUID_OR_TOKEN_REGEX.test(event.authority_context.authorization_token_id)) {
    throw new TypeError(`${label}.authority_context.authorization_token_id invalid format`);
  }

  hex64(event.payload_envelope_digest, `${label}.payload_envelope_digest`);
  isoTimestamp(event.measurement_time_iso, `${label}.measurement_time_iso`);
  isoTimestamp(event.recording_time_iso, `${label}.recording_time_iso`);

  const tMeas = new Date(event.measurement_time_iso).getTime();
  const tRec = new Date(event.recording_time_iso).getTime();
  if (tMeas > tRec) {
    throw new RangeError(
      `${label}: declared measurement timestamp (${event.measurement_time_iso}) cannot occur after recording timestamp (${event.recording_time_iso}).`
    );
  }

  return deepFreeze(structuredClone(event));
}

/**
 * Constructs a new valid governed event object.
 */
export function createGovernedEvent({
  eventType,
  predecessorDigest,
  routeIdentity,
  actorClass,
  authorizationTokenId,
  payloadEnvelopeDigest,
  measurementTimeIso,
  recordingTimeIso
}) {
  const event = {
    $schema: GOVERNED_EVENT_SCHEMA,
    event_type: eventType,
    predecessor_digest: predecessorDigest,
    route_identity: routeIdentity,
    authority_context: {
      actor_class: actorClass,
      authorization_token_id: authorizationTokenId
    },
    payload_envelope_digest: payloadEnvelopeDigest,
    measurement_time_iso: measurementTimeIso,
    recording_time_iso: recordingTimeIso
  };

  return validateGovernedEvent(event);
}

/**
 * Verifies an unbroken chain of governed events against an expected genesis anchor and
 * an optional expected terminal head digest anchor.
 *
 * ENFORCES:
 * - INV-05: predecessor binding (tamper evidence for all committed predecessor events).
 * - INV-11 (Chronology): monotonic recording timestamps establish ordered chronology.
 *   (MONOTONIC_EVENT_TIME != FULL_NON_RETROACTIVITY; epistemic-state preservation is deferred).
 * - Terminal Head Anchor: protects against terminal-event mutation when expectedHeadDigest is provided.
 *   (PREDECESSOR_CHAIN_VERIFIED != TERMINAL_HEAD_ANCHORED; HEAD_DIGEST_COMPUTED != HEAD_DIGEST_WITNESSED).
 * - Route Identity Binding: detects tampering with a hash-bound intermediate route identity once
 *   committed by a descendant (ROUTE_IDENTITY_BOUND != ROUTE_TRANSITION_AUTHORIZED).
 *
 * @param {Array<object>} events - Dense array of governed event objects.
 * @param {string} expectedGenesisDigest - 64-char lowercase hex SHA-256 genesis anchor.
 * @param {string|object|null} expectedHeadOrOptions - Optional expected terminal head digest or options object.
 */
export function verifyGovernedEventChain(events, expectedGenesisDigest, expectedHeadOrOptions = null) {
  if (!Array.isArray(events)) {
    throw new TypeError('events must be a dense array');
  }
  hex64(expectedGenesisDigest, 'expectedGenesisDigest');

  let expectedHead = null;
  if (typeof expectedHeadOrOptions === 'string') {
    expectedHead = hex64(expectedHeadOrOptions, 'expectedHeadDigest');
  } else if (expectedHeadOrOptions && typeof expectedHeadOrOptions === 'object') {
    if (expectedHeadOrOptions.expectedHeadDigest) {
      expectedHead = hex64(expectedHeadOrOptions.expectedHeadDigest, 'expectedHeadDigest');
    }
  }

  const violations = [];
  let currentExpectedPredecessor = expectedGenesisDigest;
  let lastRecordingTime = 0;

  for (let i = 0; i < events.length; i++) {
    const rawEvent = events[i];
    let event;
    try {
      event = validateGovernedEvent(rawEvent, `event[${i}]`);
    } catch (err) {
      violations.push({
        index: i,
        code: 'MALFORMED_EVENT_SCHEMA',
        message: err.message
      });
      break;
    }

    // Check predecessor linkage (INV-05)
    if (event.predecessor_digest !== currentExpectedPredecessor) {
      violations.push({
        index: i,
        code: 'PREDECESSOR_DIGEST_MISMATCH',
        expected: currentExpectedPredecessor,
        actual: event.predecessor_digest
      });
    }

    // Check monotonic recording chronology (ordered chronology)
    const recTime = new Date(event.recording_time_iso).getTime();
    if (recTime < lastRecordingTime) {
      violations.push({
        index: i,
        code: 'CHRONOLOGY_NON_MONOTONIC',
        message: `event[${i}] recording time precedes event[${i - 1}]. (Monotonic recording timestamps establish ordered chronology; MONOTONIC_EVENT_TIME != FULL_NON_RETROACTIVITY).`
      });
    }
    lastRecordingTime = recTime;

    // Advance expected predecessor to this event's digest
    currentExpectedPredecessor = computeEventDigest(event);
  }

  const finalComputedHead = events.length > 0 ? currentExpectedPredecessor : expectedGenesisDigest;
  const predecessor_chain_verified = violations.length === 0;

  let head_anchor_verified = false;
  let head_anchor_status = 'UNANCHORED';

  if (expectedHead !== null) {
    if (finalComputedHead === expectedHead) {
      head_anchor_verified = true;
      head_anchor_status = 'ANCHORED_MATCH';
    } else {
      head_anchor_verified = false;
      head_anchor_status = 'ANCHOR_MISMATCH';
      violations.push({
        code: 'TERMINAL_HEAD_MISMATCH',
        expected: expectedHead,
        actual: finalComputedHead,
        message: 'Terminal event digest does not match expectedHeadDigest witness anchor.'
      });
    }
  } else {
    head_anchor_verified = false;
    head_anchor_status = 'UNANCHORED';
  }

  const verified = predecessor_chain_verified && (expectedHead !== null ? head_anchor_verified : true);

  return deepFreeze({
    schema: GOVERNED_EVENT_CHAIN_VERIFICATION_SCHEMA,
    verified,
    predecessor_chain_verified,
    head_anchor_verified,
    head_anchor_status,
    total_events: events.length,
    head_digest: finalComputedHead,
    expected_head_digest: expectedHead,
    genesis_digest: expectedGenesisDigest,
    violations,
    claim_ceiling: 'TAMPER_EVIDENT_PREDECESSOR_CHAINING_ONLY',
    claim_ceilings: CLAIM_CEILINGS
  });
}
