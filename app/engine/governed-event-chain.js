import { createHash } from 'node:crypto';

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
  const canonicalBytes = Buffer.from(canonicalizeJson(event), 'utf8');
  const domainPrefix = Buffer.from(DOMAIN_SEPARATION_PREFIX, 'utf8');
  const buffer = Buffer.concat([domainPrefix, canonicalBytes]);
  return createHash('sha256').update(buffer).digest('hex');
}

/**
 * Computes the genesis anchor digest from session and commit parameters.
 * Incorporates GENESIS_DOMAIN_SEPARATION_PREFIX before RFC 8785 canonical bytes.
 */
export function computeGenesisDigest({ sessionId, initialCommitSha, routeIdentity }) {
  text(sessionId, 'sessionId');
  text(initialCommitSha, 'initialCommitSha');
  text(routeIdentity, 'routeIdentity');

  const payload = canonicalizeJson({
    initial_commit_sha: initialCommitSha,
    route_identity: routeIdentity,
    session_id: sessionId
  });
  const domainPrefix = Buffer.from(GENESIS_DOMAIN_SEPARATION_PREFIX, 'utf8');
  const buffer = Buffer.concat([domainPrefix, Buffer.from(payload, 'utf8')]);
  return createHash('sha256').update(buffer).digest('hex');
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
