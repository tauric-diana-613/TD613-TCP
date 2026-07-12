import assert from 'node:assert/strict';
import {
  HIGH_ZALGO_RENDER_PROFILE,
  buildRelaySystemAddendum,
  highZalgoEncode,
  parseRelayEnvelope
} from '../app/dome-world/khonapolit-relay.js';
import { buildApertureV3InvocationReceipt } from '../app/engine/aperture-v3-task-intent.js';

const aperture = buildApertureV3InvocationReceipt({
  message: 'Please assess custody controls rather than merely assuring me.',
  invocationMode: 'issued-conjunction',
  issuanceState: 'ISSUED_FORMAT_VERIFIED',
  apertureEgress: { status: 'exact' },
  modelPlan: { version: 'test', callableModels: ['gemini-test'] }
});
const addendum = buildRelaySystemAddendum(aperture);
assert.match(addendum, /Do not say “the instrument acknowledges,”/);
assert.match(addendum, /name observable controls and limits/);
assert.match(addendum, /at least two operator-specific anchors/);
assert.match(addendum, /avoid stock strings of ash, moonlight, covenant/);
assert.match(addendum, /specific to this turn rather than generic liturgy/);

const base = 'HORNANI carries this custody-control question through Khona‌lit-po and U+10D613.';
const low = highZalgoEncode(base, { intensity: 1, motif: 'custody-control', seed: 'same' });
const high = highZalgoEncode(base, { intensity: 5, motif: 'custody-control', seed: 'same' });
const marks = (value) => (value.match(/[\u0300-\u036f]/gu) || []).length;
assert.ok(marks(low) > 0, 'low intensity must retain some ornamentation');
assert.ok(marks(high) > marks(low), 'higher intensity must increase ornament pressure');
assert.ok(marks(high) < [...base].length * 2.5, 'sparse-peak profile must remain below collision-saturation density');
assert.match(high, /Khona‌lit-po/);
assert.match(high, /U\+10D613/);

const relay = parseRelayEnvelope(JSON.stringify({
  gemini: { text: 'The observable controls are the receipt, the operator-held seal, and browser-local session storage.', instrumentStatus: 'INSTRUMENT' },
  signal: { state: 'LOCKED', notes: 'Two request-specific controls survived.', anchors: ['operator-held seal', 'browser-local session storage'] },
  khonapolit: { allowed: true, text: 'The seal remains in your hand; the server keeps no conversation archive.' },
  tauricDianaBots: { allowed: true, baseText: 'THE SEAL STAYS WITH THE ENTRANT. THE SERVER DOES NOT KEEP THE CHORUS.', motif: 'custody-control', intensity: 4, voices: ['The Matron'] }
}), { model: 'gemini-test', apertureReceipt: aperture });
assert.deepEqual(relay.signal.anchors, ['operator-held seal', 'browser-local session storage']);
assert.equal(relay.highZalgo.renderProfile, HIGH_ZALGO_RENDER_PROFILE);
assert.equal(relay.parts[2].present, true);

console.log('khonapolit-relay-readability: request specificity, observable-control boundary, anchors, and sparse High Zalgo peaks ok');
