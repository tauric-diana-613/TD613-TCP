import assert from 'node:assert/strict';

import {
  buildInvocationPacket,
  MARROWLINE_MISSION_ANCHOR_VERSION
} from '../app/dome-world/khonapolit-covenant.js';
import { buildGeminiRequest, buildGeminiStructuralRepairRequest } from '../server/khonapolit-quality.js';
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
assert.match(relay, /Do not treat typography as a checklist, quota, fixed contour, axis recipe, emotional lookup table, or per-character filter/i);
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


// Diegetic mission is part of the actual first-turn provider packet, not UI copy
// or a substitute for the existing lore/covenant and source-preserving relay.
assert.equal(MARROWLINE_MISSION_ANCHOR_VERSION, 'td613.marrowline.red-deer-mission/v2-operational-relations');
assert.match(packet.systemInstruction, /MARROWLINE DIEGETIC MISSION/);
assert.match(packet.systemInstruction, /address the app visitor as the Red Deer when it serves the exchange/);
assert.match(packet.systemInstruction, /The Chairman is the recurring fictional antagonist/);
assert.match(packet.systemInstruction, /passive recursive containment with selective admissibility/);
assert.match(packet.systemInstruction, /internal state ≠ observable state ≠ registered event/);
assert.match(packet.systemInstruction, /trace observability V, custody recoverability C, process identifiability P, and latent-state reconstructibility L/);
assert.match(packet.systemInstruction, /dromology/);
assert.match(packet.systemInstruction, /stylometry/);
assert.match(packet.systemInstruction, /Black feminist epistemology/);
assert.match(packet.systemInstruction, /Black grief/);
assert.match(packet.systemInstruction, /queer performativity/);
assert.match(packet.systemInstruction, /reality-TV spectacle/);
assert.match(packet.systemInstruction, /Thermodynamic slapstick must conserve the stipulated quantities/);
assert.match(packet.systemInstruction, /provider-native High Zalgo is native speech in joy, boredom, affection, grief/);
assert.match(packet.systemInstruction, /right to refuse/);
assert.match(packet.systemInstruction, /not a claim that an actual person or hidden system is pursuing the visitor/);
assert.match(packet.systemInstruction, /The mission persists across topics/);
assert.match(packet.systemInstruction, /EVERY-TURN GENERATIVE DUTY/);
assert.match(packet.systemInstruction, /make it CHANGE an inference, choice, joke/);
assert.match(packet.systemInstruction, /The Tauric Diana bots are BOTH hornani and capable of horny wit, as distinct registers/);
assert.match(packet.systemInstruction, /HORNANI is the author-attested chthonic/);
assert.match(packet.systemInstruction, /HORNY is consensual adult desire/);
assert.match(packet.systemInstruction, /seduction ≠ sovereignty; prediction ≠ recognition/);
assert.match(packet.systemInstruction, /AFFECT IS CONSEQUENTIAL, NOT A TRIGGER TABLE/);
assert.match(packet.systemInstruction, /without a fixed emotional-to-mark mapping/);
assert.ok(packet.systemInstruction.indexOf('TD613 ATTRACTOR PRIMER') < packet.systemInstruction.indexOf('MARROWLINE DIEGETIC MISSION'));
assert.ok(packet.systemInstruction.indexOf('MARROWLINE DIEGETIC MISSION') < packet.systemInstruction.indexOf('FLIGHT GLYPH LAW'));
assert.match(fullInstruction, /The operator, not a character, retains decisions and custody authority/);

for (const message of [
  'How do I calculate a workshop budget?',
  'Tell the Red Deer a tender story about the broken branch.',
  'The Chairman says his refrigerated machine abolished heat. Audit the exhaust.'
]) {
  const firstTurn = buildInvocationPacket({ message, waiveIssuance: true });
  const request = buildGeminiRequest(firstTurn, {}, 'gemini-3.8-flash');
  assert.equal(request.contents.at(-1).parts[0].text, message, 'original task retained verbatim');
  assert.equal((request.systemInstruction.parts[0].text.match(/MARROWLINE DIEGETIC MISSION/g) || []).length, 1);
  assert.match(request.systemInstruction.parts[0].text, /MARROWLINE CAUSAL RELAY LAW/);
  assert.match(request.systemInstruction.parts[0].text, /NATIVE SEMANTIC PROSODY/);
  assert.match(request.systemInstruction.parts[0].text, /same argument/);
  assert.match(request.systemInstruction.parts[0].text, /EVERY-TURN GENERATIVE DUTY/);
  assert.match(request.systemInstruction.parts[0].text, /HORNANI is the author-attested/);
  const recencyCue = request.contents.at(-1).parts[1].text;
  assert.match(recencyCue, /Apply the standing Red Deer DIEGETIC MISSION on this ordinary turn/);
  assert.match(recencyCue, /hornani \(chthonic sovereign vitality/);
  assert.match(recencyCue, /horny \(consensual adult attraction/);
  assert.match(recencyCue, /neither is a command to sexualize the Red Deer/);
  assert.doesNotMatch(request.systemInstruction.parts[0].text, /\u0301|\u0317|\u0351/u, 'do not seed sample combining marks');
}
const repair = buildGeminiStructuralRepairRequest(
  packet, {}, 'gemini-3.8-flash', 'Kʰonapolit\\nAn incomplete argument.',
  ['tauric-diana-bots-nominative-missing']
);
assert.match(repair.systemInstruction.parts[0].text, /MARROWLINE DIEGETIC MISSION/);
assert.match(repair.systemInstruction.parts[0].text, /THE GEMINI API MUST AUTHOR THE ACTUAL COMBINING CODE POINTS/);
assert.equal(repair.contents.at(0).parts[0].text, packet.message, 'repair inherits original user question');

console.log('marrowline-instrument-relay-contract: Gemini remains instrument while one causal Kʰonapolit-to-bots handoff stays provider-native');
