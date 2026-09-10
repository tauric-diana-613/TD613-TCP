import assert from 'node:assert/strict';
import {
  HIGH_ZALGO_VERSION,
  KHONAPOLIT_RELAY_SCHEMA,
  buildRelaySystemAddendum,
  highZalgoEncode,
  parseRelayEnvelope
} from '../app/dome-world/khonapolit-relay.js';
import {
  APERTURE_V3_VERSION,
  buildApertureV3InvocationReceipt
} from '../app/engine/aperture-v3-task-intent.js';

const aperture = buildApertureV3InvocationReceipt({
  message: 'Can the relay hold?',
  invocationMode: 'issued-conjunction',
  issuanceState: 'ISSUED_FORMAT_VERIFIED',
  apertureEgress: { status: 'exact' },
  modelPlan: { version: 'test-policy', callableModels: ['gemini-test'] }
});

assert.equal(aperture.version, APERTURE_V3_VERSION);
assert.equal(aperture.taskIntent.primary_route, 'OPEN_FIELD_SPECULATIVE_SYNTHESIS');
assert.equal(aperture.taskIntent.runtime_materiality, 'BACKGROUND');
assert.equal(aperture.taskIntent.surface_runtime, false);
assert.equal(aperture.runtime.receiptOnly, true);
const addendum = buildRelaySystemAddendum(aperture);
assert.match(addendum, /Gemini is the model instrument and carrier/);
assert.match(addendum, /Never append the lozenge seal/);
assert.match(addendum, /depth proportionate to the request/);
assert.match(addendum, /Follow the operator’s requested length and format/);
assert.doesNotMatch(addendum, /directly and briefly/);
assert.match(addendum, /do not output a stock litany of corpus keywords/);
assert.match(addendum, /Never guarantee that custody is secure/);
assert.match(addendum, /Separate paragraphs with blank lines/);
assert.match(addendum, /place each numbered step or bullet on its own line/);
assert.match(addendum, /decoded text contains actual newline characters/);

const lockedPayload = JSON.stringify({
  gemini: { text: 'The instrument can carry the declared relation without claiming external verification.', instrumentStatus: 'INSTRUMENT' },
  signal: { state: 'LOCKED', notes: 'The covenant relation remains coherent under the declared packet.' },
  khonapolit: { allowed: true, text: 'Khona‌lit-po remains at the seam. Kʰonapolit answers through the admitted relay.' },
  tauricDianaBots: {
    allowed: true,
    baseText: 'HORNANI. THE COVENANT HOLDS AT THE BLACK SEA SHORELINE.',
    motif: 'hornani-ash-moon',
    intensity: 5,
    voices: ['The Matron', 'The Undertow', 'The Spark']
  }
});
const locked = parseRelayEnvelope(lockedPayload, { model: 'gemini-test', apertureReceipt: aperture });
assert.equal(locked.schema, KHONAPOLIT_RELAY_SCHEMA);
assert.equal(locked.signal.state, 'LOCKED');
assert.equal(locked.parts.length, 3);
assert.equal(locked.parts[0].id, 'gemini');
assert.equal(locked.parts[1].id, 'khonapolit');
assert.equal(locked.parts[2].id, 'tauric-diana-bots');
assert.equal(locked.parts[2].present, true);
assert.equal(locked.highZalgo.applied, true);
assert.equal(locked.highZalgo.version, HIGH_ZALGO_VERSION);
assert.equal(HIGH_ZALGO_VERSION, 'td613.high-zalgo/v2-motif-wave-envelope');
assert.equal(locked.highZalgo.profile, 'motif-wave-envelope');
assert.notEqual(locked.parts[2].text, locked.parts[2].baseText);
assert.match(locked.parts[2].text, /[\u0300-\u036f]/u, 'High Zalgo must carry combining ornamentation');
assert.match(locked.parts[1].text, /Khona‌lit-po/, 'covenant key must remain byte-intact');
assert.equal([...locked.parts[1].text].includes('\u200c'), true);
assert.doesNotMatch(locked.parts[2].text, /⟐/, 'provider-side relay must never add the closing seal');

const deterministicA = highZalgoEncode('HORNANI COVENANT', { intensity: 4, motif: 'undertow', seed: 'same' });
const deterministicB = highZalgoEncode('HORNANI COVENANT', { intensity: 4, motif: 'undertow', seed: 'same' });
assert.equal(deterministicA, deterministicB, 'same base text, motif, intensity, and seed must reproduce');
assert.notEqual(highZalgoEncode('HORNANI COVENANT', { intensity: 1, motif: 'undertow', seed: 'same' }), deterministicA, 'intensity must alter ornamentation');
const protectedOutput = highZalgoEncode('HORNANI Khona‌lit-po / Tauric Diana / U+10D613', { intensity: 5, motif: 'ash-moon', seed: 'protected' });
assert.match(protectedOutput, /Khona‌lit-po/);
assert.match(protectedOutput, /Tauric Diana/);
assert.match(protectedOutput, /U\+10D613/);

const partial = parseRelayEnvelope(JSON.stringify({
  gemini: { text: 'The signal remains ambiguous.', instrumentStatus: 'INSTRUMENT' },
  signal: { state: 'PARTIAL', notes: 'Insufficient lock.' },
  khonapolit: { allowed: true, text: 'A possible relay.' },
  tauricDianaBots: { allowed: true, baseText: 'THIS MUST STAY HELD', motif: 'warning', intensity: 5, voices: ['The Spark'] }
}), { model: 'gemini-test', apertureReceipt: aperture });
assert.equal(partial.signal.state, 'PARTIAL');
assert.equal(partial.parts[1].present, true);
assert.equal(partial.parts[2].present, false, 'bot line must remain held without LOCKED signal');
assert.equal(partial.highZalgo.applied, false);

const counterfeit = parseRelayEnvelope(JSON.stringify({
  gemini: { text: 'No lock.', instrumentStatus: 'INSTRUMENT' },
  signal: { state: 'LOCKED', notes: 'Claimed lock.' },
  khonapolit: { allowed: false, text: '' },
  tauricDianaBots: { allowed: true, baseText: 'COUNTERFEIT COMPLETION', motif: 'trap', intensity: 5, voices: [] }
}), { model: 'gemini-test', apertureReceipt: aperture });
assert.equal(counterfeit.parts[1].present, false);
assert.equal(counterfeit.parts[2].present, false, 'bots require both lock and admitted Kʰonapolit relay');

const malformed = parseRelayEnvelope('ordinary unstructured provider prose', { model: 'gemini-test', apertureReceipt: aperture });
assert.equal(malformed.signal.state, 'NOT_LOCKED');
assert.equal(malformed.parts.length, 1);
assert.equal(malformed.parts[0].id, 'gemini');
assert.equal(malformed.highZalgo.applied, false);
assert.equal(malformed.highZalgo.profile, 'motif-wave-envelope');

// Structured plain-text formatting survives the real relay parser without reflow,
// markup execution, Unicode normalization, or converting literal backslashes.
const readableAnswer = 'Start with a small pilot.\n\nThree questions\n\n1. Which recordings have permission?\n2. Who can review the archive?\n3. Where will the files be kept?\n\nSource note\r\nKhona‌lit-po · A\u0315\u0300\u0338 · literal \\n in source code.\n<img src=x onerror=alert(1)>';
const readable = parseRelayEnvelope(JSON.stringify({
  gemini: { text: readableAnswer }, signal: { state: 'NOT_LOCKED', notes: '' },
  khonapolit: { allowed: false, text: '' },
  tauricDianaBots: { allowed: false, baseText: '' }
}), { model: 'synthetic-format-witness', apertureReceipt: aperture });
assert.equal(readable.parts[0].text, readableAnswer, 'paragraphs, lists, CRLF and source literals remain exact');
assert.ok(readable.transcript.endsWith(readableAnswer));
assert.equal(readable.parts[1].present, false);
assert.equal(readable.parts[2].present, false);

console.log('khonapolit-relay: Aperture route, direct relay language, motif-wave High Zalgo, and non-admission gates ok');
