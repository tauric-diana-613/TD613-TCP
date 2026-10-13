import assert from 'node:assert/strict';
import {
  HIGH_ZALGO_VERSION,
  KHONAPOLIT_RAW_PACKET_PROTOCOL,
  KHONAPOLIT_RELAY_SCHEMA,
  assessIntegratedTransmission,
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
assert.equal(aperture.relation.provider, 'model-carrier-provenance-only');
assert.equal(Object.prototype.hasOwnProperty.call(aperture.relation, 'gemini'), false);

const addendum = buildRelaySystemAddendum(aperture);
assert.match(addendum, /MARROWLINE CAUSAL RELAY LAW/i);
assert.match(addendum, /Gemini is the model-mediated instrument\/carrier only/i);
assert.match(addendum, /one continuous response and one live argument/i);
assert.match(addendum, /explicitly yields or relays it/i);
assert.match(addendum, /NATURAL RETURN SHAPE/i);
assert.match(addendum, /NATIVE SEMANTIC PROSODY/i);
assert.match(addendum, /typography behaves as voice/i);
assert.match(addendum, /Do not treat typography as a checklist, quota, fixed contour, axis recipe, emotional lookup table, or per-character filter/i);
assert.doesNotMatch(addendum, /anger erupt|sarcasm twitch|vertical crowns\/roots|horizontal or oblique counter-rhythm|deep collisions/i);
assert.doesNotMatch(addendum, /RAW TWO-PACKET RETURN PROTOCOL/i);
assert.doesNotMatch(addendum, /<<<PACKET_[AB]_/i);
assert.doesNotMatch(addendum, /FINAL SILENT PREFLIGHT BEFORE EMIT/i);
assert.match(addendum, /operator controls sealing/i);
assert.doesNotMatch(addendum, /gemini\.text:/i);
assert.doesNotMatch(addendum, /tauricDianaBots\.baseText:/i);

const stack = 'T\u0300\u0301\u0302\u0316\u0317\u0318A\u0304\u0307\u030B\u031C\u0323\u032DR\u0305\u0308\u030C\u031E\u0325\u0331I\u0303\u0306\u030A\u0319\u0326\u0330\u0334';
const providerNativeText = [
  'Kʰonapolit',
  'Kʰonapolit keeps the equation clean: R(route) ≠ R(receiver). Khona‌lit-po remains byte-intact.',
  '',
  'Tauric Diana bots',
  `${stack.repeat(8)} BREAK THE FALSE CLOSURE!`,
  `${stack.repeat(8)} THE GROVE KEEPS THE SCAR!`,
  `${stack.repeat(8)} NO PAPER SHIELD SURVIVES THE FIRE!`
].join('\n');

const naturalLocked = parseRelayEnvelope(providerNativeText, { model: 'gemini-test', apertureReceipt: aperture });
assert.equal(naturalLocked.schema, KHONAPOLIT_RELAY_SCHEMA);
assert.equal(naturalLocked.signal.source, 'provider-natural-causal-handoff-plus-local-observation');
assert.equal(naturalLocked.admission.admissible, true);
assert.deepEqual(naturalLocked.parts[0].voices, ['Kʰonapolit', 'Tauric Diana bots']);
assert.equal(naturalLocked.parts[0].text, providerNativeText);
assert.equal(naturalLocked.parts[0].flourishMode, 'provider-native-causal-handoff');
assert.equal(naturalLocked.highZalgo.providerGenerated, true);

const lockedPayload = [
  KHONAPOLIT_RAW_PACKET_PROTOCOL.analyticStart,
  'Kʰonapolit',
  'Kʰonapolit keeps the equation clean: R(route) ≠ R(receiver). Khona‌lit-po remains byte-intact.',
  KHONAPOLIT_RAW_PACKET_PROTOCOL.analyticEnd,
  KHONAPOLIT_RAW_PACKET_PROTOCOL.stressStart,
  'Tauric Diana bots',
  `${stack.repeat(8)} BREAK THE FALSE CLOSURE!`,
  `${stack.repeat(8)} THE GROVE KEEPS THE SCAR!`,
  `${stack.repeat(8)} NO PAPER SHIELD SURVIVES THE FIRE!`,
  KHONAPOLIT_RAW_PACKET_PROTOCOL.stressEnd
].join('\n');
const locked = parseRelayEnvelope(lockedPayload, { model: 'gemini-test', apertureReceipt: aperture });
assert.equal(locked.schema, KHONAPOLIT_RELAY_SCHEMA);
assert.equal(locked.signal.state, locked.admission.quality === 'PARTIAL' ? 'PARTIAL' : 'LOCKED');
assert.equal(locked.admission.admissible, true);
assert.equal(locked.admission.voiceEvidence, 'text-nominative-fallback');
assert.deepEqual(locked.parts[0].voices, ['Kʰonapolit', 'Tauric Diana bots']);
assert.equal(locked.parts.length, 1, 'one provider generation must remain one human-visible relay part');
assert.equal(locked.parts[0].id, 'khonapolit', 'existing terminal renderer receives the integrated generation through its primary covenant slot');
assert.equal(locked.parts[0].label, 'Kʰonapolit ∴ Tauric Diana bots');
assert.equal(locked.parts[0].integrated, true);
assert.equal(locked.parts[0].providerNative, true);
assert.equal(locked.parts[0].text, providerNativeText, 'provider-authored Unicode bytes must not be rewritten');
assert.equal(locked.highZalgo.applied, false, 'Marrowline must not apply a local ornamentation filter');
assert.equal(locked.highZalgo.providerGenerated, true);
assert.equal(locked.highZalgo.source, 'provider-native');
assert.equal(locked.highZalgo.version, HIGH_ZALGO_VERSION);
assert.match(HIGH_ZALGO_VERSION, /^td613\.high-zalgo\/provider-native-/);
assert.ok(locked.highZalgo.combiningMarkCount >= 96, 'receipt observes provider-authored combining marks');
assert.ok(locked.highZalgo.maxRun >= 6, 'receipt observes vertical flourish runs without manufacturing them');
assert.ok(locked.admission.tallVerticalOrnamentClusterCount >= 8, 'telemetry observes true multi-tier vertical ornament instead of counting bars as height');
assert.match(locked.parts[0].text, /Khona‌lit-po/, 'covenant key remains byte-intact');
assert.equal([...locked.parts[0].text].includes('\u200c'), true);
assert.doesNotMatch(locked.parts[0].text, /⟐/, 'provider-side relay must never add the closing seal');

// Visible headings and the hard orthographic split are now part of live admission.
const naturalText = [
  'A route can preserve a task without turning that task into the architecture that carries it.',
  '',
  'The distinction survives the crossing: custody remembers what was asked; governance still decides what may become system authority.'
].join('\n');
const natural = parseRelayEnvelope(JSON.stringify({
  signal: { state: 'LOCKED', notes: 'Natural prose without visible channel boundaries.' },
  transmission: {
    text: naturalText,
    voices: ['Kʰonapolit', 'Tauric Diana bots'],
    flourishMode: 'clean'
  }
}), { model: 'gemini-test', apertureReceipt: aperture });
assert.equal(natural.admission.admissible, false, 'structured metadata cannot replace the visible two-channel boundary');
assert.equal(natural.signal.state, 'NOT_LOCKED');
assert.ok(natural.admission.reasons.includes('khonapolit-nominative-missing'));
assert.ok(natural.admission.reasons.includes('tauric-diana-bots-nominative-missing'));

const reversed = assessIntegratedTransmission(naturalText, ['Tauric Diana bots', 'Kʰonapolit']);
assert.equal(reversed.admissible, false, 'structured voice order remains a hard admission boundary');
assert.match(reversed.reasons.join(' '), /structured-voice-missing-or-out-of-order/);

const deterministicA = highZalgoEncode('HORNANI COVENANT', { intensity: 4, motif: 'undertow', seed: 'same' });
const deterministicB = highZalgoEncode('HORNANI COVENANT', { intensity: 4, motif: 'undertow', seed: 'same' });
assert.equal(deterministicA, deterministicB);
assert.notEqual(deterministicA, 'HORNANI COVENANT');

const partialText = 'Kʰonapolit: the relation is partial; do not invent a lock.';
const partial = parseRelayEnvelope(JSON.stringify({
  signal: { state: 'PARTIAL', notes: 'Insufficient lock.' },
  transmission: { text: partialText, voices: ['Kʰonapolit'], flourishMode: 'clean' }
}), { model: 'gemini-test', apertureReceipt: aperture });
assert.equal(partial.signal.state, 'NOT_LOCKED', 'missing second structured voice keeps the return inadmissible');
assert.equal(partial.admission.admissible, false);
assert.equal(partial.parts.length, 1);
assert.equal(partial.parts[0].text, partialText);
assert.equal(partial.highZalgo.providerGenerated, false);

const legacy = parseRelayEnvelope(JSON.stringify({
  gemini: { text: 'Old instrument prose.', instrumentStatus: 'INSTRUMENT' },
  signal: { state: 'LOCKED', notes: 'archived' },
  khonapolit: { allowed: true, text: 'Old Kʰonapolit text.' },
  tauricDianaBots: { allowed: true, baseText: 'OLD BOT BASE TEXT', motif: 'legacy', intensity: 5, voices: ['The Spark'] }
}), { model: 'archived-model', apertureReceipt: aperture });
assert.equal(legacy.parts.length, 1);
assert.equal(legacy.parts[0].providerNative, false);
assert.match(legacy.parts[0].text, /Old Kʰonapolit text/);
assert.match(legacy.parts[0].text, /OLD BOT BASE TEXT/);
assert.doesNotMatch(legacy.parts[0].text, /[\u0300-\u036f]/u, 'legacy plain base text is preserved without local Zalgo injection');
assert.equal(legacy.highZalgo.applied, false);
assert.equal(legacy.admission.admissible, false, 'legacy three-part envelopes are readable archive input, not live v3 admission');

const malformed = parseRelayEnvelope('ordinary unstructured provider prose', { model: 'gemini-test', apertureReceipt: aperture });
assert.equal(malformed.signal.state, 'NOT_LOCKED');
assert.equal(malformed.parts.length, 1);
assert.equal(malformed.parts[0].id, 'khonapolit');
assert.equal(malformed.parts[0].text, 'ordinary unstructured provider prose');
assert.equal(malformed.highZalgo.applied, false);
assert.equal(malformed.admission.admissible, false);
assert.equal(malformed.admission.voiceEvidence, 'text-nominative-fallback');

const readableAnswer = '[Kʰonapolit]:\nStart clean.\n\n[Tauric Diana Bots : The Spark]\nThen flare: A\u0315\u0300\u0338.\r\nKhona‌lit-po stays exact.\n<img src=x onerror=alert(1)>';
const readable = parseRelayEnvelope(JSON.stringify({
  signal: { state: 'LOCKED', notes: '' },
  transmission: { text: readableAnswer, voices: ['Kʰonapolit', 'Tauric Diana bots'], flourishMode: 'variable' }
}), { model: 'synthetic-format-witness', apertureReceipt: aperture });
assert.equal(readable.parts[0].text, readableAnswer, 'paragraphs, CRLF, markup-looking text and combining marks remain exact');
assert.equal(readable.transcript, readableAnswer);
assert.equal(readable.signal.state, 'NOT_LOCKED', 'weak ornament no longer masquerades as an admitted High-Zalgo field');
assert.equal(readable.admission.admissible, false);
assert.equal(readable.admission.quality, 'HELD');
assert.equal(readable.admission.reasons.includes('tauric-diana-zalgo-absent'), false);
assert.ok(readable.admission.reasons.includes('tauric-diana-zalgo-underflow'));
assert.ok(readable.admission.qualityWarnings.includes('tauric-diana-zalgo-field-thin'));
assert.ok(readable.admission.qualityWarnings.includes('tauric-diana-zalgo-sparse-keyword-targeting'));

console.log('khonapolit-relay: natural causal handoff primary, legacy raw packet compatible, and exact Unicode preservation ok');
