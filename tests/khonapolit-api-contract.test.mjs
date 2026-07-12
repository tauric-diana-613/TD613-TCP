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
  extractGeminiText
} from '../api/khonapolit.js';

assert.equal(KHONAPOLIT_API_VERSION, 'td613.khonapolit-gemini/v1');
assert.equal(KHONAPOLIT_QUALITY_API_VERSION, 'td613.khonapolit-gemini/v3-aperture-three-part-relay');

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
assert.match(request.systemInstruction.parts[0].text, /ADDRESS: Kʰonapolit/);
assert.match(request.systemInstruction.parts[0].text, /TD613 APERTURE v3\.0-alpha/);
assert.match(request.systemInstruction.parts[0].text, /THREE-PART RELAY CONTRACT/);
assert.equal(request.generationConfig.maxOutputTokens, 4096);
assert.equal(request.generationConfig.responseMimeType, 'application/json');
assert.deepEqual(request.generationConfig.responseSchema, KHONAPOLIT_RELAY_RESPONSE_SCHEMA);

const providerEnvelope = {
  gemini: { text: 'The instrument can carry the response.', instrumentStatus: 'INSTRUMENT' },
  signal: { state: 'LOCKED', notes: 'The relation holds under the declared packet.' },
  khonapolit: { allowed: true, text: 'Kʰonapolit returns through Khona‌lit-po.' },
  tauricDianaBots: {
    allowed: true,
    baseText: 'HORNANI. THE COVENANT HOLDS.',
    motif: 'hornani-covenant',
    intensity: 4,
    voices: ['The Matron', 'The Undertow', 'The Spark']
  }
};
const providerPayload = {
  candidates: [{ content: { parts: [{ text: JSON.stringify(providerEnvelope) }] } }]
};
const rawText = extractGeminiText(providerPayload);
assert.equal(JSON.parse(rawText).signal.state, 'LOCKED');
const relay = parseRelayEnvelope(rawText, { model: 'gemini-test', apertureReceipt });
assert.equal(relay.parts.length, 3);
assert.equal(relay.parts[2].present, true);
assert.equal(relay.highZalgo.applied, true);

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
assert.equal(receipt.aperture.version, APERTURE_V3_VERSION);
assert.equal(receipt.aperture.taskIntent.primary_route, 'OPEN_FIELD_SPECULATIVE_SYNTHESIS');
assert.equal(receipt.aperture.taskIntent.runtime_materiality, 'BACKGROUND');
assert.equal(receipt.aperture.taskIntent.surface_runtime, false);
assert.equal(receipt.apertureEgress.status, 'exact');
assert.equal(receipt.relay.signal.state, 'LOCKED');
assert.deepEqual(receipt.relay.partsPresent, ['gemini', 'khonapolit', 'tauric-diana-bots']);
assert.equal(receipt.relay.highZalgo.applied, true);
assert.equal(receipt.seal.state, 'OPEN');
assert.equal(receipt.storage.serverConversationStorage, false);

console.log('khonapolit-api-contract: Aperture v3 request, structured relay, receipt, and operator-open seal contract ok');
