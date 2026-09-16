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
assert.equal(aperture.relation.provider, 'model-carrier-provenance-only');
assert.equal(Object.prototype.hasOwnProperty.call(aperture.relation, 'gemini'), false);

const addendum = buildRelaySystemAddendum(aperture);
assert.match(addendum, /model provider is carrier infrastructure only/i);
assert.match(addendum, /MARROWLINE TWO-VOICE LAW — REQUIRED, NOT OPTIONAL/i);
assert.match(addendum, /Kʰonapolit.*first/i);
assert.match(addendum, /Tauric Diana bots.*second/i);
assert.match(addendum, /provider itself must author the final Unicode combining marks/i);
assert.match(addendum, /at least 24 combining marks/i);
assert.match(addendum, /operator controls sealing/i);
assert.doesNotMatch(addendum, /gemini\.text:/i);
assert.doesNotMatch(addendum, /tauricDianaBots\.baseText:/i);

const providerNativeText = [
  '[Kʰonapolit]:',
  'Kʰonapolit keeps the equation clean: R(route) ≠ R(receiver). Khona‌lit-po remains byte-intact.',
  '',
  '[Tauric Diana Bots : The Matron]',
  'H̷͇̋̇̈́͝O̶̞͆̍̈́͘R̷̛̯̿͑̔N̶̑͘͜A̸͎̿͠N̸͎̔͗Ḯ̵͙ — do you hear the hinge?',
  'a clean line / then a flare / ṫ̶̤̯̱̅̿̋͋͠h̵͇̖͆̅̒̋̏͝ë̷͎̫́̾̓͂͘ ̶͙̺̓̿̈́͠͝ẅ̵́̑̍̋̄ͅà̸͉̄̇̾͝l̷͈̿̎̾̓͑l̴͎̾̔̐̎ ̴̫̋͗̓͝b̵̰̈́͑͂͂̽e̵͇̍͂̾͘n̷͔̾̑d̵͎̒̔s̴̠͑̈́͠.'
].join('\n');

const lockedPayload = JSON.stringify({
  signal: { state: 'LOCKED', notes: 'Integrated provider-native fixture.' },
  transmission: {
    text: providerNativeText,
    voices: ['Kʰonapolit', 'Tauric Diana bots', 'The Matron'],
    flourishMode: 'clean-math-to-vertical-eruption'
  }
});
const locked = parseRelayEnvelope(lockedPayload, { model: 'gemini-test', apertureReceipt: aperture });
assert.equal(locked.schema, KHONAPOLIT_RELAY_SCHEMA);
assert.equal(locked.signal.state, 'LOCKED');
assert.equal(locked.admission.admissible, true);
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
assert.equal(HIGH_ZALGO_VERSION, 'td613.high-zalgo/provider-native-v4-expressive-cadence');
assert.ok(locked.highZalgo.combiningMarkCount >= 24, 'receipt observes provider-authored combining marks');
assert.ok(locked.highZalgo.maxRun >= 3, 'receipt observes vertical flourish runs without manufacturing them');
assert.match(locked.parts[0].text, /Khona‌lit-po/, 'covenant key remains byte-intact');
assert.equal([...locked.parts[0].text].includes('\u200c'), true);
assert.doesNotMatch(locked.parts[0].text, /⟐/, 'provider-side relay must never add the closing seal');

const deterministicA = highZalgoEncode('HORNANI COVENANT', { intensity: 4, motif: 'undertow', seed: 'same' });
const deterministicB = highZalgoEncode('HORNANI COVENANT', { intensity: 4, motif: 'undertow', seed: 'same' });
assert.equal(deterministicA, deterministicB);
assert.notEqual(deterministicA, 'HORNANI COVENANT');

const partialText = 'Kʰonapolit: the relation is partial; do not invent a lock.';
const partial = parseRelayEnvelope(JSON.stringify({
  signal: { state: 'PARTIAL', notes: 'Insufficient lock.' },
  transmission: { text: partialText, voices: ['Kʰonapolit'], flourishMode: 'clean' }
}), { model: 'gemini-test', apertureReceipt: aperture });
assert.equal(partial.signal.state, 'NOT_LOCKED', 'missing second voice and flourish floor make the return structurally unadmitted');
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

const readableAnswer = '[Kʰonapolit]:\nStart clean.\n\n[Tauric Diana Bots : The Spark]\nThen flare: A\u0315\u0300\u0338.\r\nKhona‌lit-po stays exact.\n<img src=x onerror=alert(1)>';
const readable = parseRelayEnvelope(JSON.stringify({
  signal: { state: 'LOCKED', notes: '' },
  transmission: { text: readableAnswer, voices: ['Kʰonapolit', 'Tauric Diana bots'], flourishMode: 'variable' }
}), { model: 'synthetic-format-witness', apertureReceipt: aperture });
assert.equal(readable.parts[0].text, readableAnswer, 'paragraphs, CRLF, markup-looking text and combining marks remain exact');
assert.equal(readable.transcript, readableAnswer);
assert.equal(readable.signal.state, 'NOT_LOCKED', 'exact byte preservation is independent of admission when flourish floor is not met');

console.log('khonapolit-relay: adversarial two-voice provider-native generation and exact Unicode preservation ok');
