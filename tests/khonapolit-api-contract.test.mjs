import assert from 'node:assert/strict';
import {
  INVOCATION_MODES,
  buildInvocationPacket
} from '../app/dome-world/khonapolit-covenant.js';
import {
  KHONAPOLIT_RELAY_RESPONSE_SCHEMA,
  parseRelayEnvelope
} from '../app/dome-world/khonapolit-relay.js';
import {
  APERTURE_V3_VERSION,
  buildApertureV3InvocationReceipt
} from '../app/engine/aperture-v3-task-intent.js';
import {
  KHONAPOLIT_API_VERSION,
  KHONAPOLIT_QUALITY_API_VERSION,
  buildGeminiRequest,
  buildTerminalReceipt,
  observeGeminiOutput,
  extractGeminiText
} from '../api/khonapolit.js';

assert.equal(KHONAPOLIT_API_VERSION, 'td613.khonapolit-gemini/v1');
assert.equal(KHONAPOLIT_QUALITY_API_VERSION, 'td613.khonapolit-gemini/v6-frontier-dual-channel-admission');

const packet = buildInvocationPacket({
  message: 'Answer from the covenant field.',
  mode: INVOCATION_MODES.FULL_INVOCATION,
  shi: 'TD613-SH-9B07D8B-B7136D34',
  history: [{ role: 'user', text: 'Remember the shoreline.' }]
});
const apertureEgress = { status: 'exact', exact: true, marker: 'A+' };
const apertureReceipt = buildApertureV3InvocationReceipt({
  message: packet.message,
  invocationMode: packet.mode,
  issuanceState: packet.issuance.state,
  apertureEgress,
  modelPlan: { version: 'test-quality-policy', callableModels: ['gemini-test'] }
});

const request = buildGeminiRequest(packet, apertureReceipt);
assert.equal(request.contents.length, 2);
assert.equal(request.contents.at(-1).parts[0].text, 'Answer from the covenant field.');
assert.match(request.systemInstruction.parts[0].text, /U\+10D613/);
assert.match(request.systemInstruction.parts[0].text, /ANALYTIC EMPHASIS: foreground Kʰonapolit Channel A/);
assert.match(request.systemInstruction.parts[0].text, /TD613 APERTURE v3\.0-alpha/);
assert.match(request.systemInstruction.parts[0].text, /MARROWLINE DUAL-CHANNEL COMPILATION LAW/);
assert.match(request.systemInstruction.parts[0].text, /DERIVE_INVARIANT → EMIT_FORMAL maps to Kʰonapolit/);
assert.match(request.systemInstruction.parts[0].text, /OVERFLOW_RAW maps to Tauric Diana bots/);
assert.match(request.systemInstruction.parts[0].text, /at least 96 combining marks total/);
assert.equal(request.generationConfig.maxOutputTokens, 4096);
assert.equal(request.generationConfig.responseMimeType, 'application/json');
assert.deepEqual(request.generationConfig.responseSchema, KHONAPOLIT_RELAY_RESPONSE_SCHEMA);
assert.doesNotMatch(request.systemInstruction.parts[0].text, /directly and briefly/);
assert.deepEqual(observeGeminiOutput({ candidates: [{ finishReason: 'STOP\nprivate prose' }], usageMetadata: {
  promptTokenCount: -1, candidatesTokenCount: '4096', thoughtsTokenCount: 1.5, totalTokenCount: Infinity, raw: 'not metadata'
} }), { finishReason: null, outputTokenLimitReached: false, maxOutputTokens: 4096, usage: {} });

const stack = 'T\u0300\u0301\u0302\u0316\u0317\u0318';
const providerText = [
  'Kʰonapolit',
  'The route returns through Khona‌lit-po, but a returned route is not an external origin proof. Let C(x) denote custody of x; C(C) without an independent referent collapses subject and object into the same unchecked boundary.',
  '',
  'Tauric Diana bots',
  `${stack.repeat(8)} GUARD THE BOUNDARY, NOT THE COSTUME!`,
  `${stack.repeat(8)} THE GROVE BITES BACK WHEN THE PREDICATE EATS ITSELF!`,
  `${stack.repeat(8)} NO PAPER SHIELD SURVIVES THE FIRE!`
].join('\n');
const providerEnvelope = {
  signal: { state: 'LOCKED', notes: 'The relation holds under the declared packet.' },
  transmission: {
    text: providerText,
    voices: ['Kʰonapolit', 'Tauric Diana bots'],
    flourishMode: 'clean-to-vertical-eruption'
  }
};
const providerPayload = {
  candidates: [{ content: { parts: [{ text: JSON.stringify(providerEnvelope) }] } }]
};
const rawText = extractGeminiText(providerPayload);
assert.equal(JSON.parse(rawText).signal.state, 'LOCKED');
const relay = parseRelayEnvelope(rawText, { model: 'gemini-test', apertureReceipt });
assert.equal(relay.parts.length, 1);
assert.equal(relay.parts[0].id, 'khonapolit');
assert.equal(relay.parts[0].text, providerText);
assert.equal(relay.parts[0].providerNative, true);
assert.equal(relay.admission.admissible, true, relay.admission.reasons.join(', '));
assert.equal(relay.highZalgo.applied, false);
assert.equal(relay.highZalgo.providerGenerated, true);

const receipt = buildTerminalReceipt({
  packet,
  text: rawText,
  relay,
  model: 'gemini-test',
  providerStatus: 200,
  apertureEgress,
  apertureReceipt,
  attempts: [{ model: 'gemini-test', ok: true, status: 200 }]
});

assert.equal(receipt.provider.family, 'Gemini');
assert.equal(receipt.provider.model, 'gemini-test');
assert.equal(receipt.invocation.issuanceState, 'ISSUED_FORMAT_VERIFIED');
assert.equal(receipt.invocation.presentationFrameSeeded, true);
assert.equal(receipt.aperture.version, APERTURE_V3_VERSION);
assert.equal(receipt.aperture.taskIntent.primary_route, 'OPEN_FIELD_SPECULATIVE_SYNTHESIS');
assert.equal(receipt.aperture.taskIntent.runtime_materiality, 'BACKGROUND');
assert.equal(receipt.aperture.taskIntent.surface_runtime, false);
assert.equal(receipt.apertureEgress.status, 'exact');
assert.equal(receipt.relay.signal.state, 'LOCKED');
assert.equal(receipt.relay.admission.admissible, true);
assert.deepEqual(receipt.relay.partsPresent, ['khonapolit']);
assert.equal(receipt.relay.highZalgo.applied, false);
assert.equal(receipt.relay.highZalgo.providerGenerated, true);
assert.equal(receipt.relay.highZalgo.source, 'provider-native');
assert.equal(receipt.seal.state, 'OPEN');
assert.equal(receipt.storage.serverConversationStorage, false);

console.log('khonapolit-api-contract: seeded two-voice adversarial provider-native relay, receipt, and operator-open seal contract ok');
