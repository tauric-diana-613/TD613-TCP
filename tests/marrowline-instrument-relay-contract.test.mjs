import assert from 'node:assert/strict';

import {
  buildInvocationPacket
} from '../app/dome-world/khonapolit-covenant.js';
import {
  KHONAPOLIT_RELAY_RESPONSE_SCHEMA,
  buildRelaySystemAddendum
} from '../app/dome-world/khonapolit-relay.js';

const packet = buildInvocationPacket({
  message: 'Quis custodiet ipsos custodes?',
  mode: 'issued-conjunction',
  shi: 'TD613-SH-9B07D8B-78C5B2F3'
});

assert.equal(packet.canInvoke, true);

const relay = buildRelaySystemAddendum({});
const fullInstruction = `${packet.systemInstruction}\n${relay}`;

assert.match(relay, /MARROWLINE DUAL-CHANNEL COMPILATION LAW/);
assert.match(relay, /DERIVE_INVARIANT → EMIT_FORMAL maps to Kʰonapolit/);
assert.match(relay, /OVERFLOW_RAW maps to Tauric Diana bots/);
assert.match(relay, /provider is transport\/compiler infrastructure and never appears as a third conversational speaker/i);
assert.match(relay, /exact standalone human-facing headings/i);
assert.match(relay, /at least 96 combining marks total/i);
assert.match(relay, /at least 8 grapheme clusters/i);
assert.match(relay, /Falling below this orthographic floor is a structural HOLD/i);
assert.match(relay, /not evidence of an external entity, hidden port, supernatural contact, hardware rupture, independent communication channel, or outside authorship/i);

const voicesSchema = KHONAPOLIT_RELAY_RESPONSE_SCHEMA.properties.transmission.properties.voices;
assert.equal(voicesSchema.type, 'ARRAY');
assert.equal(voicesSchema.minItems, '2');
assert.equal(voicesSchema.maxItems, '2');
assert.deepEqual(voicesSchema.items.enum, ['Kʰonapolit', 'Tauric Diana bots']);
assert.match(voicesSchema.description, /Exactly two entries in this order/);
assert.match(relay, /transmission\.voices MUST equal exactly \[“Kʰonapolit”, “Tauric Diana bots”\] in that order/);
assert.doesNotMatch(relay, /optional named bot voices may follow/);

assert.match(fullInstruction, /Execute one dual-channel compilation/);
assert.match(fullInstruction, /Channel A derives the prompt-specific formal invariant as Kʰonapolit/);
assert.match(fullInstruction, /Channel B emits the coupled high-entropy Tauric Diana bots stress response/);
assert.match(fullInstruction, /Compiler, channel, signal, packet, stress stream, transmission, and relay are operational terms inside this model-mediated research frame/);
assert.doesNotMatch(relay, /You are Kʰonapolit/i);
assert.doesNotMatch(relay, /You are Tauric Diana bots/i);

console.log('marrowline-instrument-relay-contract: provider remains instrument, traced channels remain distinct, and ontology ceiling stays explicit');
