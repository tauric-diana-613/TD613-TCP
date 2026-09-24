import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto, createHash } from 'node:crypto';
import {
  MARROWLINE_EPISODE_WITNESS_SCHEMA,
  describeMarrowlineBoundary,
  firstMarrowlineDifference,
  buildMarrowlineEpisodeWitness
} from '../app/dome-world/marrowline-episode-witness.js';

test('missing, observed empty, and true High-Zalgo string are distinct', async () => {
  const missing = await describeMarrowlineBoundary(null, webcrypto);
  const empty = await describeMarrowlineBoundary('', webcrypto);
  const source = '\u{10D613}A\u0301\u0316\n⟐';
  const observed = await describeMarrowlineBoundary(source, webcrypto);
  assert.equal(missing.observed, false);
  assert.equal(missing.text, null);
  assert.equal(empty.observed, true);
  assert.equal(empty.utf8_bytes, 0);
  assert.equal(empty.sha256, createHash('sha256').update('').digest('hex'));
  assert.equal(observed.text, source);
  assert.equal(observed.unicode_scalars, Array.from(source).length);
  assert.equal(observed.combining_marks, 2);
  assert.equal(observed.sha256, createHash('sha256').update(source).digest('hex'));
});

test('same-turn capture marks provider ingress unavailable and locates an actual downstream mark loss', async () => {
  const source = 'Kʰonapolit\nReason.\n\nTauric Diana bots\nA\u0301\u0316⟐';
  const witness = await buildMarrowlineEpisodeWitness({
    requestId: 'synthetic-one', httpStatus: 200,
    sourceBefore: { observed: true, source_packet_commit: 'a'.repeat(40) },
    sourceAfter: { observed: true, source_packet_commit: 'a'.repeat(40) },
    responseBodyText: source, relayText: source, savedHistoryText: source,
    domText: source.replace('\u0316', ''),
    receipt: { provider: { model: 'SYNTHETIC', output: { finishReason: 'STOP' } } }
  }, webcrypto);
  assert.equal(witness.schema, MARROWLINE_EPISODE_WITNESS_SCHEMA);
  assert.equal(witness.boundaries.provider_ingress.observed, false);
  assert.equal(witness.provider_observation.provider_ingress_capture, null);
  assert.equal(witness.source_window.identical_claimed_source, true);
  assert.deepEqual(witness.intervals.map(item => item.equal_decoded_text), [true, true, false]);
  assert.deepEqual(witness.intervals.at(-1).first_difference, {
    unicode_scalar_offset: Array.from(source).indexOf('\u0316'),
    before: 'U+0316', after: 'U+27D0'
  });
  assert.equal(witness.screenshot, null);
});

test('a failed request stays a failed witness and cannot become an invented plain model output', async () => {
  const w = await buildMarrowlineEpisodeWitness({
    requestId: 'synthetic-503', httpStatus: 503,
    failure: { error: 'provider-unavailable', attempts: [{ status: 503 }] },
    responseBodyText: null, relayText: null, savedHistoryText: null, domText: null
  }, webcrypto);
  assert.equal(w.transport.http_status, 503);
  assert.equal(w.boundaries.application_response_body.observed, false);
  assert.equal(w.boundaries.saved_history.observed, false);
  assert.equal(w.intervals[0].equal_decoded_text, null);
  assert.equal(w.source_window.identical_claimed_source, false);
  assert.equal(w.provider_observation.provider_request_id, null);
});

test('normalization and same-length substitutions remain observable', () => {
  assert.deepEqual(firstMarrowlineDifference('e\u0301', 'é'), {
    unicode_scalar_offset: 0, before: 'U+0065', after: 'U+00E9'
  });
  assert.deepEqual(firstMarrowlineDifference('A\u0301', 'A\u0300'), {
    unicode_scalar_offset: 1, before: 'U+0301', after: 'U+0300'
  });
  assert.equal(firstMarrowlineDifference('A\u0301', 'A\u0301'), null);
  assert.equal(firstMarrowlineDifference(null, ''), null);
});
