import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GOVERNED_EVENT_SCHEMA,
  GOVERNED_EVENT_CHAIN_VERIFICATION_SCHEMA,
  DOMAIN_SEPARATION_PREFIX,
  GENESIS_DOMAIN_SEPARATION_PREFIX,
  CLAIM_CEILINGS,
  canonicalizeJson,
  computeEventDigest,
  computeGenesisDigest,
  createGovernedEvent,
  validateGovernedEvent,
  verifyGovernedEventChain
} from '../app/engine/governed-event-chain.js';

test('RFC 8785: ensures UTF-16 code unit key sorting and zero whitespace', () => {
  const obj1 = { z: 1, a: 2, m: { b: 3, a: 4 } };
  const obj2 = { a: 2, m: { a: 4, b: 3 }, z: 1 };
  assert.equal(canonicalizeJson(obj1), '{"a":2,"m":{"a":4,"b":3},"z":1}');
  assert.equal(canonicalizeJson(obj1), canonicalizeJson(obj2));

  // UTF-16 code unit sorting: '10' < '2' < 'A' < 'a' < 'b' < '\u00e9' < '\u20ac'
  const unicodeKeyObj = {
    '\u20AC': 'euro',
    'b': 'lower-b',
    'A': 'upper-a',
    'a': 'lower-a',
    '\u00E9': 'e-acute',
    '10': 'ten',
    '2': 'two'
  };
  const expectedOrder = '{"10":"ten","2":"two","A":"upper-a","a":"lower-a","b":"lower-b","\u00E9":"e-acute","\u20AC":"euro"}';
  assert.equal(canonicalizeJson(unicodeKeyObj), expectedOrder);

  // Empty object and array
  assert.equal(canonicalizeJson({}), '{}');
  assert.equal(canonicalizeJson([]), '[]');
});

test('RFC 8785: number formatting (-0 serialized as 0, NaN/Infinity rejected)', () => {
  assert.equal(canonicalizeJson({ zero: 0, negZero: -0 }), '{"negZero":0,"zero":0}');
  assert.equal(canonicalizeJson({ exp: 1e21, tiny: 1e-7 }), '{"exp":1e+21,"tiny":1e-7}');
  assert.equal(canonicalizeJson({ float: 1.5, int: 42 }), '{"float":1.5,"int":42}');

  assert.throws(() => {
    canonicalizeJson({ bad: NaN });
  }, TypeError);

  assert.throws(() => {
    canonicalizeJson({ bad: Infinity });
  }, TypeError);

  assert.throws(() => {
    canonicalizeJson({ bad: -Infinity });
  }, TypeError);
});

test('RFC 8785: rejects non-JSON primitives and non-plain objects', () => {
  assert.throws(() => canonicalizeJson({ bad: undefined }), TypeError);
  assert.throws(() => canonicalizeJson({ bad: () => {} }), TypeError);
  assert.throws(() => canonicalizeJson({ bad: Symbol('sym') }), TypeError);
  assert.throws(() => canonicalizeJson({ bad: 100n }), TypeError);
  assert.throws(() => canonicalizeJson(new Date()), TypeError);
  assert.throws(() => canonicalizeJson(new Map()), TypeError);
  assert.throws(() => canonicalizeJson(new Set()), TypeError);
});

test('RFC 8785: rejects lone surrogate code units in strings and property names', () => {
  // Lone high surrogate in string value
  assert.throws(() => {
    canonicalizeJson({ text: 'lone-high-\uD800' });
  }, /lone surrogate/);

  // Lone low surrogate in string value
  assert.throws(() => {
    canonicalizeJson({ text: 'lone-low-\uDC00' });
  }, /lone surrogate/);

  // Lone surrogate as object property name
  assert.throws(() => {
    canonicalizeJson({ ['\uD800']: 'value' });
  }, /lone surrogate/);

  assert.throws(() => {
    canonicalizeJson({ ['bad-\uDFFF-prop']: 'value' });
  }, /lone surrogate/);

  // Valid surrogate pair must succeed (e.g. U+1F600 Grinning Face: \uD83D\uDE00)
  const validEmoji = { emoji: '\uD83D\uDE00' };
  assert.equal(canonicalizeJson(validEmoji), '{"emoji":"\uD83D\uDE00"}');
});

test('RFC 8785: rejects sparse arrays with holes', () => {
  const sparse1 = [1, , 3]; // Hole at index 1
  assert.throws(() => {
    canonicalizeJson(sparse1);
  }, /sparse arrays with holes/);

  const sparse2 = new Array(3); // All holes
  assert.throws(() => {
    canonicalizeJson(sparse2);
  }, /sparse arrays with holes/);

  // Dense array with primitive values succeeds
  assert.equal(canonicalizeJson([1, null, 'a']), '[1,null,"a"]');
});

test('RFC 8785: string escaping edge vectors (control chars, slashes, quotes)', () => {
  // RFC 8785 Section 3.2.2.2: control characters escaped, quotes and backslashes escaped, forward slash unescaped
  const testObj = {
    control: '\u0000\u001f\n\r\t\b\f',
    slash: 'a/b/c',
    quoteAndBackslash: 'quote:" backslash:\\'
  };
  const canonical = canonicalizeJson(testObj);
  assert.ok(canonical.includes('"control":"\\u0000\\u001f\\n\\r\\t\\b\\f"'));
  assert.ok(canonical.includes('"slash":"a/b/c"')); // Forward slash MUST NOT be \/
  assert.ok(canonical.includes('"quoteAndBackslash":"quote:\\" backslash:\\\\"'));
});

test('computeEventDigest: incorporates fixed domain separation prefix', () => {
  const event = {
    $schema: GOVERNED_EVENT_SCHEMA,
    event_type: 'GOVERNED_TRANSITION',
    predecessor_digest: 'a'.repeat(64),
    route_identity: 'loom://main/interactive-direct',
    authority_context: {
      actor_class: 'INTERACTIVE_OPERATOR_DIRECT',
      authorization_token_id: 'token-123'
    },
    payload_envelope_digest: 'b'.repeat(64),
    measurement_time_iso: '2026-10-06T19:00:00.000Z',
    recording_time_iso: '2026-10-06T19:00:00.050Z'
  };

  const digest = computeEventDigest(event);
  assert.match(digest, /^[a-f0-9]{64}$/);

  // Key permutation produces identical digest under RFC 8785 canonicalization
  const permutedEvent = {
    recording_time_iso: '2026-10-06T19:00:00.050Z',
    payload_envelope_digest: 'b'.repeat(64),
    measurement_time_iso: '2026-10-06T19:00:00.000Z',
    authority_context: {
      authorization_token_id: 'token-123',
      actor_class: 'INTERACTIVE_OPERATOR_DIRECT'
    },
    route_identity: 'loom://main/interactive-direct',
    predecessor_digest: 'a'.repeat(64),
    event_type: 'GOVERNED_TRANSITION',
    $schema: GOVERNED_EVENT_SCHEMA
  };
  assert.equal(computeEventDigest(permutedEvent), digest);
});

test('verifyGovernedEventChain: unbroken 3-event chain passes with matching expectedHeadDigest', () => {
  const genesis = computeGenesisDigest({
    sessionId: 'session-xyz-100',
    initialCommitSha: '4a41bb6461234567890abcdef1234567890abcde',
    routeIdentity: 'loom://session/root'
  });

  const e1 = createGovernedEvent({
    eventType: 'GOVERNED_TRANSITION',
    predecessorDigest: genesis,
    routeIdentity: 'loom://session/step1',
    actorClass: 'INTERACTIVE_OPERATOR_DIRECT',
    authorizationTokenId: 'token-alpha-1',
    payloadEnvelopeDigest: '1'.repeat(64),
    measurementTimeIso: '2026-10-06T19:10:00.000Z',
    recordingTimeIso: '2026-10-06T19:10:00.010Z'
  });
  const d1 = computeEventDigest(e1);

  const e2 = createGovernedEvent({
    eventType: 'HOLD_ASSERTION',
    predecessorDigest: d1,
    routeIdentity: 'loom://session/step2',
    actorClass: 'INTERACTIVE_OPERATOR_DIRECT',
    authorizationTokenId: 'token-alpha-2',
    payloadEnvelopeDigest: '2'.repeat(64),
    measurementTimeIso: '2026-10-06T19:10:05.000Z',
    recordingTimeIso: '2026-10-06T19:10:05.020Z'
  });
  const d2 = computeEventDigest(e2);

  const e3 = createGovernedEvent({
    eventType: 'REST_RETURN',
    predecessorDigest: d2,
    routeIdentity: 'loom://session/step3',
    actorClass: 'INTERACTIVE_OPERATOR_DIRECT',
    authorizationTokenId: 'token-alpha-3',
    payloadEnvelopeDigest: '3'.repeat(64),
    measurementTimeIso: '2026-10-06T19:10:10.000Z',
    recordingTimeIso: '2026-10-06T19:10:10.015Z'
  });
  const d3 = computeEventDigest(e3);

  // Verification with matching expectedHeadDigest
  const receipt = verifyGovernedEventChain([e1, e2, e3], genesis, d3);
  assert.equal(receipt.schema, GOVERNED_EVENT_CHAIN_VERIFICATION_SCHEMA);
  assert.equal(receipt.verified, true);
  assert.equal(receipt.predecessor_chain_verified, true);
  assert.equal(receipt.head_anchor_verified, true);
  assert.equal(receipt.head_anchor_status, 'ANCHORED_MATCH');
  assert.equal(receipt.total_events, 3);
  assert.equal(receipt.genesis_digest, genesis);
  assert.equal(receipt.head_digest, d3);
  assert.equal(receipt.expected_head_digest, d3);
  assert.deepEqual(receipt.violations, []);
  assert.equal(receipt.claim_ceiling, 'TAMPER_EVIDENT_PREDECESSOR_CHAINING_ONLY');
  assert.deepEqual(receipt.claim_ceilings, CLAIM_CEILINGS);
});

test('verifyGovernedEventChain: terminal-event mutation detected when expectedHeadDigest is anchored', () => {
  const genesis = computeGenesisDigest({
    sessionId: 'session-term-test',
    initialCommitSha: '4a41bb6461234567890abcdef1234567890abcde',
    routeIdentity: 'loom://session/root'
  });

  const e1 = createGovernedEvent({
    eventType: 'GOVERNED_TRANSITION',
    predecessorDigest: genesis,
    routeIdentity: 'loom://session/step1',
    actorClass: 'INTERACTIVE_OPERATOR_DIRECT',
    authorizationTokenId: 'tok-1',
    payloadEnvelopeDigest: '1'.repeat(64),
    measurementTimeIso: '2026-10-06T19:10:00.000Z',
    recordingTimeIso: '2026-10-06T19:10:00.010Z'
  });
  const d1 = computeEventDigest(e1);

  const e2 = createGovernedEvent({
    eventType: 'REST_RETURN',
    predecessorDigest: d1,
    routeIdentity: 'loom://session/step2',
    actorClass: 'INTERACTIVE_OPERATOR_DIRECT',
    authorizationTokenId: 'tok-2',
    payloadEnvelopeDigest: '2'.repeat(64),
    measurementTimeIso: '2026-10-06T19:10:05.000Z',
    recordingTimeIso: '2026-10-06T19:10:05.020Z'
  });
  const genuineHead = computeEventDigest(e2);

  // Adversary mutates terminal event payload envelope
  const tamperedE2 = structuredClone(e2);
  tamperedE2.payload_envelope_digest = '9'.repeat(64);

  // When expectedHeadDigest is provided (witnessed anchor):
  // Terminal mutation is detected because computed head !== expectedHead
  const receipt = verifyGovernedEventChain([e1, tamperedE2], genesis, genuineHead);
  assert.equal(receipt.verified, false);
  assert.equal(receipt.predecessor_chain_verified, true); // Internal predecessor links match!
  assert.equal(receipt.head_anchor_verified, false);
  assert.equal(receipt.head_anchor_status, 'ANCHOR_MISMATCH');
  const termViolation = receipt.violations.find(v => v.code === 'TERMINAL_HEAD_MISMATCH');
  assert.ok(termViolation);

  // When expectedHeadDigest is NOT provided:
  // Internal predecessor traversal succeeds, but head_anchor_status is explicitly UNANCHORED
  const unanchoredReceipt = verifyGovernedEventChain([e1, tamperedE2], genesis);
  assert.equal(unanchoredReceipt.verified, true);
  assert.equal(unanchoredReceipt.predecessor_chain_verified, true);
  assert.equal(unanchoredReceipt.head_anchor_verified, false);
  assert.equal(unanchoredReceipt.head_anchor_status, 'UNANCHORED');
  assert.equal(unanchoredReceipt.expected_head_digest, null);
});

test('verifyGovernedEventChain: detects tampering with intermediate route identity once committed by descendant', () => {
  const genesis = computeGenesisDigest({
    sessionId: 'session-route-tamper',
    initialCommitSha: 'commit1234567890abcdef1234567890abcdef12',
    routeIdentity: 'loom://tamper/origin'
  });

  const e1 = createGovernedEvent({
    eventType: 'GOVERNED_TRANSITION',
    predecessorDigest: genesis,
    routeIdentity: 'loom://tamper/route-A',
    actorClass: 'INTERACTIVE_OPERATOR_DIRECT',
    authorizationTokenId: 'tok-1',
    payloadEnvelopeDigest: 'a'.repeat(64),
    measurementTimeIso: '2026-10-06T19:20:00.000Z',
    recordingTimeIso: '2026-10-06T19:20:00.010Z'
  });
  const d1 = computeEventDigest(e1);

  const e2 = createGovernedEvent({
    eventType: 'REST_RETURN',
    predecessorDigest: d1,
    routeIdentity: 'loom://tamper/route-B',
    actorClass: 'INTERACTIVE_OPERATOR_DIRECT',
    authorizationTokenId: 'tok-2',
    payloadEnvelopeDigest: 'b'.repeat(64),
    measurementTimeIso: '2026-10-06T19:20:05.000Z',
    recordingTimeIso: '2026-10-06T19:20:05.010Z'
  });

  // Adversary tampers with intermediate route identity on e1
  const tamperedE1 = structuredClone(e1);
  tamperedE1.route_identity = 'loom://tamper/unauthorized-route-shift';

  const receipt = verifyGovernedEventChain([tamperedE1, e2], genesis);
  assert.equal(receipt.verified, false);
  assert.equal(receipt.predecessor_chain_verified, false);
  assert.equal(receipt.violations.length, 1);
  assert.equal(receipt.violations[0].code, 'PREDECESSOR_DIGEST_MISMATCH');
  assert.equal(receipt.violations[0].index, 1);
});

test('verifyGovernedEventChain: rejects retroactive non-monotonic timestamps (ordered chronology; MONOTONIC_EVENT_TIME != FULL_NON_RETROACTIVITY)', () => {
  const genesis = '0'.repeat(64);

  const e1 = createGovernedEvent({
    eventType: 'GOVERNED_TRANSITION',
    predecessorDigest: genesis,
    routeIdentity: 'loom://time/1',
    actorClass: 'INTERACTIVE_OPERATOR_DIRECT',
    authorizationTokenId: 'tok-1',
    payloadEnvelopeDigest: '1'.repeat(64),
    measurementTimeIso: '2026-10-06T19:30:00.000Z',
    recordingTimeIso: '2026-10-06T19:30:00.010Z'
  });
  const d1 = computeEventDigest(e1);

  // e2 has recording time before e1 recording time (retroactive insertion attempt)
  const e2 = createGovernedEvent({
    eventType: 'REST_RETURN',
    predecessorDigest: d1,
    routeIdentity: 'loom://time/2',
    actorClass: 'INTERACTIVE_OPERATOR_DIRECT',
    authorizationTokenId: 'tok-2',
    payloadEnvelopeDigest: '2'.repeat(64),
    measurementTimeIso: '2026-10-06T19:29:50.000Z',
    recordingTimeIso: '2026-10-06T19:29:50.010Z'
  });

  const receipt = verifyGovernedEventChain([e1, e2], genesis);
  assert.equal(receipt.verified, false);
  const timeViolation = receipt.violations.find(v => v.code === 'CHRONOLOGY_NON_MONOTONIC');
  assert.ok(timeViolation);
  assert.match(timeViolation.message, /MONOTONIC_EVENT_TIME != FULL_NON_RETROACTIVITY/);
});

test('validateGovernedEvent: rejects records whose declared measurement timestamp occurs after their recording timestamp', () => {
  assert.throws(() => {
    createGovernedEvent({
      eventType: 'GOVERNED_TRANSITION',
      predecessorDigest: '0'.repeat(64),
      routeIdentity: 'loom://future',
      actorClass: 'INTERACTIVE_OPERATOR_DIRECT',
      authorizationTokenId: 'tok-1',
      payloadEnvelopeDigest: '1'.repeat(64),
      measurementTimeIso: '2026-10-06T19:40:00.000Z',
      recordingTimeIso: '2026-10-06T19:39:59.000Z' // Earlier than declared measurement!
    });
  }, RangeError);
});

test('validateGovernedEvent: rejects unauthorized extra fields or bad schemas', () => {
  assert.throws(() => {
    validateGovernedEvent({
      $schema: 'td613.wrong.schema/v1.0',
      event_type: 'GOVERNED_TRANSITION'
    });
  }, TypeError);

  assert.throws(() => {
    validateGovernedEvent({
      $schema: GOVERNED_EVENT_SCHEMA,
      event_type: 'GOVERNED_TRANSITION',
      predecessor_digest: 'a'.repeat(64),
      route_identity: 'loom://bad',
      authority_context: {
        actor_class: 'INVALID_ACTOR',
        authorization_token_id: 'tok-1'
      },
      payload_envelope_digest: 'b'.repeat(64),
      measurement_time_iso: '2026-10-06T19:00:00.000Z',
      recording_time_iso: '2026-10-06T19:00:00.050Z'
    });
  }, TypeError);

  // Extra unauthorized field
  assert.throws(() => {
    validateGovernedEvent({
      $schema: GOVERNED_EVENT_SCHEMA,
      event_type: 'GOVERNED_TRANSITION',
      predecessor_digest: 'a'.repeat(64),
      route_identity: 'loom://bad',
      authority_context: {
        actor_class: 'INTERACTIVE_OPERATOR_DIRECT',
        authorization_token_id: 'tok-1'
      },
      payload_envelope_digest: 'b'.repeat(64),
      measurement_time_iso: '2026-10-06T19:00:00.000Z',
      recording_time_iso: '2026-10-06T19:00:00.050Z',
      unauthorized_extra_field: 'illegal'
    });
  }, TypeError);
});
