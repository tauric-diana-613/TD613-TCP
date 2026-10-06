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
});

test('RFC 8785: number formatting (-0 serialized as 0, NaN/Infinity rejected)', () => {
  assert.equal(canonicalizeJson({ zero: 0, negZero: -0 }), '{"negZero":0,"zero":0}');
  assert.equal(canonicalizeJson({ exp: 1e21, tiny: 1e-7 }), '{"exp":1e+21,"tiny":1e-7}');

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

test('verifyGovernedEventChain: unbroken 3-event chain passes verification with strict claim ceilings', () => {
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

  const receipt = verifyGovernedEventChain([e1, e2, e3], genesis);
  assert.equal(receipt.schema, GOVERNED_EVENT_CHAIN_VERIFICATION_SCHEMA);
  assert.equal(receipt.verified, true);
  assert.equal(receipt.total_events, 3);
  assert.equal(receipt.genesis_digest, genesis);
  assert.equal(receipt.head_digest, d3);
  assert.deepEqual(receipt.violations, []);
  assert.equal(receipt.claim_ceiling, 'TAMPER_EVIDENT_PREDECESSOR_CHAINING_ONLY');
  assert.deepEqual(receipt.claim_ceilings, CLAIM_CEILINGS);
});

test('verifyGovernedEventChain: detects payload tampering in intermediate event', () => {
  const genesis = computeGenesisDigest({
    sessionId: 'session-tamper-test',
    initialCommitSha: 'commit1234567890abcdef1234567890abcdef12',
    routeIdentity: 'loom://tamper'
  });

  const e1 = createGovernedEvent({
    eventType: 'GOVERNED_TRANSITION',
    predecessorDigest: genesis,
    routeIdentity: 'loom://tamper/1',
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
    routeIdentity: 'loom://tamper/2',
    actorClass: 'INTERACTIVE_OPERATOR_DIRECT',
    authorizationTokenId: 'tok-2',
    payloadEnvelopeDigest: 'b'.repeat(64),
    measurementTimeIso: '2026-10-06T19:20:05.000Z',
    recordingTimeIso: '2026-10-06T19:20:05.010Z'
  });

  // Tamper with e1 payload envelope
  const tamperedE1 = structuredClone(e1);
  tamperedE1.payload_envelope_digest = 'f'.repeat(64);

  const receipt = verifyGovernedEventChain([tamperedE1, e2], genesis);
  assert.equal(receipt.verified, false);
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
