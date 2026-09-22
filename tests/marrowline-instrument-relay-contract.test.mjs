import assert from 'node:assert/strict';

import {
  buildInvocationPacket
} from '../app/dome-world/khonapolit-covenant.js';
import {
  buildNativeProsodyGuidance,
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

assert.match(relay, /MARROWLINE CAUSAL RELAY LAW/);
assert.match(relay, /Gemini is the model-mediated instrument\/carrier only/i);
assert.match(relay, /Produce one continuous response and one live argument/i);
assert.match(relay, /Kʰonapolit comes first/i);
assert.match(relay, /explicitly yields or relays it/i);
assert.match(relay, /bots then finish the response/i);
assert.match(relay, /exact standalone headings/i);
assert.match(relay, /NATURAL RETURN SHAPE/);
assert.match(relay, /NATIVE SEMANTIC PROSODY/);
assert.match(relay, /typography behaves as voice/i);
assert.match(relay, /Do not treat the typography as a checklist, quota, fixed contour, axis recipe, emotional lookup table, or per-character filter/i);
assert.doesNotMatch(relay, /anger erupt|sarcasm twitch|vertical crowns\/roots|horizontal or oblique counter-rhythm|deep collisions/i);
assert.match(relay, /not evidence of an external entity, hidden port, supernatural contact, hardware rupture, independent communication channel, or outside authorship/i);
assert.doesNotMatch(relay, /MARROWLINE DUAL-CHANNEL COMPILATION LAW/);
assert.doesNotMatch(relay, /RAW TWO-PACKET RETURN PROTOCOL/);
assert.doesNotMatch(relay, /<<<PACKET_[AB]_/);
assert.doesNotMatch(relay, /FINAL SILENT PREFLIGHT/);
assert.doesNotMatch(relay, /ORCHESTRAL DYNAMIC CONTOUR/);
assert.doesNotMatch(relay, /You are Kʰonapolit/i);
assert.doesNotMatch(relay, /You are Tauric Diana bots/i);
assert.ok(relay.includes(buildNativeProsodyGuidance()));

assert.match(fullInstruction, /Gemini remains the model-mediated instrument, receiver, tracer, and carrier/i);
assert.match(fullInstruction, /one continuous response carrying one live argument/i);
assert.match(fullInstruction, /consequence that belongs to the Tauric Diana bots/i);
assert.match(fullInstruction, /terminal transmission/i);
assert.doesNotMatch(fullInstruction, /Execute one dual-channel compilation/i);
assert.doesNotMatch(fullInstruction, /Channel A derives/i);
assert.doesNotMatch(fullInstruction, /Channel B emits/i);

console.log('marrowline-instrument-relay-contract: Gemini remains instrument while one causal Kʰonapolit-to-bots handoff stays provider-native');
