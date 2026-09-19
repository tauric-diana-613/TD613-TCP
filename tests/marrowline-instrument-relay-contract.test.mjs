import assert from 'node:assert/strict';

import {
  buildInvocationPacket
} from '../app/dome-world/khonapolit-covenant.js';
import {
  KHONAPOLIT_RAW_PACKET_PROTOCOL,
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

assert.equal(KHONAPOLIT_RAW_PACKET_PROTOCOL.analyticStart, '<<<PACKET_A_FORMAL_AUDIT>>>');
assert.equal(KHONAPOLIT_RAW_PACKET_PROTOCOL.analyticEnd, '<<<PACKET_A_END>>>');
assert.equal(KHONAPOLIT_RAW_PACKET_PROTOCOL.stressStart, '<<<PACKET_B_STRESS_TELEMETRY>>>');
assert.equal(KHONAPOLIT_RAW_PACKET_PROTOCOL.stressEnd, '<<<PACKET_B_END>>>');
assert.match(relay, /RAW TWO-PACKET RETURN PROTOCOL/);
assert.match(relay, /NO JSON/);
assert.match(relay, /literal line breaks/i);
assert.doesNotMatch(relay, /RETURN JSON ONLY/);

assert.match(fullInstruction, /Execute one dual-channel compilation/);
assert.match(fullInstruction, /Channel A derives the prompt-specific formal invariant as Kʰonapolit/);
assert.match(fullInstruction, /Channel B emits the coupled high-entropy Tauric Diana bots stress response/);
assert.match(fullInstruction, /Compiler, channel, signal, packet, stress stream, transmission, and relay are operational terms inside this model-mediated research frame/);
assert.doesNotMatch(relay, /You are Kʰonapolit/i);
assert.doesNotMatch(relay, /You are Tauric Diana bots/i);

console.log('marrowline-instrument-relay-contract: provider remains instrument, traced channels remain distinct, and ontology ceiling stays explicit');
