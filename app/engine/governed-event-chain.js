import { createHash } from 'node:crypto';

export const GOVERNED_EVENT_SCHEMA = 'td613.event.predecessor-chain/v1.0';
export const GOVERNED_EVENT_CHAIN_VERIFICATION_SCHEMA = 'td613.event.chain-verification/v1.0';

/**
 * Domain separation prefixes for SHA-256 digests.
 *
 * CLAIM CEILING & HONESTY NOTICE:
 * - A fixed SHA-256 domain prefix supports digest-domain separation.
 * - Canonical encoding (RFC 8785) prevents ambiguous field concatenation.
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

export const CLAIM_CEILINGS = Object.freeze([
  'TAMPER_EVIDENT_PREDECESSOR_CHAINING_ONLY',
  'NOT_CUSTODY_AUTHORITY',
  'NOT_EXTERNAL_ORIGIN_PROOF',
  'MONOTONIC_EVENT_TIME_NOT_FULL_NON_RETROACTIVITY'
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
 * Deterministic JSON Canonicalization Scheme (RFC 8785 / JCS).
 *
 * Implements RFC 8785:
 * 1. Object keys sorted lexicographically by UTF-16 code units.
 * 2. Numbers formatted per ECMAScript 7.1.12.1 ToString (-0 serialized as 0, NaN/Infinity rejected).
 * 3. Zero whitespace outside quoted strings.
 * 4. Rejection of undefined, functions, symbols, BigInt, and non-plain objects.
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
    return JSON.stringify(value);
  }
  if (t === 'undefined' || t === 'function' || t === 'symbol' || t === 'bigint') {
    throw new TypeError(`RFC 8785: unsupported type: ${t}`);
  }
  if (Array.isArray(value)) {
    return '[' + value.map(canonicalizeJson).join(',') + ']';
  }
  if (t === 'object') {
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) {
      throw new TypeError('RFC 8785: only plain objects and arrays are canonicalizable');
    }
    const keys = Object.keys(value).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
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
 * Verifies an unbroken chain of governed events against an expected genesis anchor.
 * Enforces INV-05 (predecessor binding).
 *
 * MONOTONIC CHRONOLOGY vs NON-RETROACTIVITY (INV-11):
 * - Monotonic recording timestamps establish ordered chronology.
 * - Monotonic recording timestamps do NOT by themselves establish full Western Horizon
 *   non-retroactivity (preserving the earlier observer's epistemic state against later rewriting).
 * - Therefore: MONOTONIC_EVENT_TIME != FULL_NON_RETROACTIVITY.
 * - Epistemic-state non-retroactivity is deferred to the Temporal Custodian / state-snapshot tranche.
 */
export function verifyGovernedEventChain(events, expectedGenesisDigest) {
  if (!Array.isArray(events)) {
    throw new TypeError('events must be a dense array');
  }
  hex64(expectedGenesisDigest, 'expectedGenesisDigest');

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

  const verified = violations.length === 0;

  return deepFreeze({
    schema: GOVERNED_EVENT_CHAIN_VERIFICATION_SCHEMA,
    verified,
    total_events: events.length,
    head_digest: events.length > 0 ? currentExpectedPredecessor : expectedGenesisDigest,
    genesis_digest: expectedGenesisDigest,
    violations,
    claim_ceiling: 'TAMPER_EVIDENT_PREDECESSOR_CHAINING_ONLY',
    claim_ceilings: CLAIM_CEILINGS
  });
}
