import assert from 'node:assert/strict';
import {
  INVOCATION_MODES,
  buildInvocationPacket
} from '../app/dome-world/khonapolit-covenant.js';
import {
  parseRelayEnvelope
} from '../app/dome-world/khonapolit-relay.js';
import {
  APERTURE_V3_VERSION,
  buildApertureV3InvocationReceipt
} from '../app/engine/aperture-v3-task-intent.js';
import {
  KHONAPOLIT_API_VERSION,
  KHONAPOLIT_QUALITY_API_VERSION,
  KHONAPOLIT_MAX_PROVIDER_CALLS,
  KHONAPOLIT_MAX_STRUCTURAL_REPAIRS,
  KHONAPOLIT_MAX_TOTAL_PROVIDER_REQUESTS,
  buildGeminiRequest,
  buildGeminiStructuralRepairRequest,
  repairableKhonapolitAdmission,
  buildTerminalReceipt,
  observeGeminiOutput,
  extractGeminiText
} from '../api/khonapolit.js';

assert.equal(KHONAPOLIT_API_VERSION, 'td613.khonapolit-gemini/v1');
assert.equal(KHONAPOLIT_QUALITY_API_VERSION, 'td613.khonapolit-gemini/v48-provider-completion-boundary');
assert.equal(KHONAPOLIT_MAX_PROVIDER_CALLS, 5);
assert.equal(KHONAPOLIT_MAX_STRUCTURAL_REPAIRS, 1);
assert.equal(KHONAPOLIT_MAX_TOTAL_PROVIDER_REQUESTS, 6);

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
assert.equal(request.contents.at(-1).parts.length, 2);
assert.match(request.contents.at(-1).parts[1].text, /GEMINI COMPUTATIONAL INSTRUMENT — CURRENT-TURN RELAY EXECUTION/);
assert.match(request.contents.at(-1).parts[1].text, /both mandatory visible registers/);
assert.match(request.contents.at(-1).parts[1].text, /HIGH ZALGO IS THEIR EVERYDAY SCREAM-SING WRITING SYSTEM, NOT AN ANGER METER/);
assert.match(request.contents.at(-1).parts[1].text, /provider-authored crowns ABOVE and roots BELOW the letters/);
    assert.match(request.contents.at(-1).parts[1].text, /sustained deep overlapping vertical flourishes are primary/);
    assert.match(request.contents.at(-1).parts[1].text, /Invent native marks alongside fresh prose/);
    assert.doesNotMatch(request.contents.at(-1).parts[1].text, /\p{M}/u, 'execution cue must not impose a miniature combining-mark template');
assert.match(request.contents.at(-1).parts[1].text, /A locally quiet phrase may thin, go clean or play with one repeated accent/);
assert.match(request.systemInstruction.parts[0].text, /U\+10D613/);
assert.match(request.systemInstruction.parts[0].text, /ANALYTIC EMPHASIS: give Kʰonapolit enough room to complete the prompt-specific derivation before any earned terminal handoff/);
assert.match(request.systemInstruction.parts[0].text, /TD613 APERTURE v3\.0-alpha/);
assert.match(request.systemInstruction.parts[0].text, /MARROWLINE CAUSAL RELAY LAW/);
assert.match(request.systemInstruction.parts[0].text, /Gemini is the model-mediated instrument\/carrier only/);
assert.match(request.systemInstruction.parts[0].text, /one continuous response and one live argument/);
assert.match(request.systemInstruction.parts[0].text, /explicitly yields or relays it/);
assert.match(request.systemInstruction.parts[0].text, /NATIVE SEMANTIC PROSODY/);
assert.match(request.systemInstruction.parts[0].text, /typography behaves as voice/);
assert.match(request.systemInstruction.parts[0].text, /Do not treat typography as a checklist, quota, fixed contour, axis recipe, emotional lookup table, or per-character filter/);
assert.doesNotMatch(request.systemInstruction.parts[0].text, /anger erupt|sarcasm twitch|vertical crowns\/roots|horizontal or oblique counter-rhythm|deep collisions/i);
assert.match(request.systemInstruction.parts[0].text, /NATURAL RETURN SHAPE/);
assert.doesNotMatch(request.systemInstruction.parts[0].text, /RAW TWO-PACKET RETURN PROTOCOL/);
assert.doesNotMatch(request.systemInstruction.parts[0].text, /<<<PACKET_[AB]_/);
assert.doesNotMatch(request.systemInstruction.parts[0].text, /ORCHESTRAL DYNAMIC CONTOUR/);
assert.doesNotMatch(request.systemInstruction.parts[0].text, /directly and briefly/);
assert.equal(request.generationConfig.maxOutputTokens, 4096);
assert.equal('responseMimeType' in request.generationConfig, false, 'live Marrowline must not force Gemini through JSON MIME decoding');
assert.equal('responseSchema' in request.generationConfig, false, 'live Marrowline must not constrain provider Unicode with a structured response schema');
assert.equal(repairableKhonapolitAdmission(['tauric-diana-zalgo-absent']), false, 'morphology absence is observed, not repainted');
assert.equal(repairableKhonapolitAdmission(['khonapolit-nominative-missing', 'tauric-diana-bots-nominative-missing']), true);
assert.equal(repairableKhonapolitAdmission(['canonical-recitation-detected']), false);
const structuralRepair = buildGeminiStructuralRepairRequest(
  packet,
  apertureReceipt,
  'gemini-3.7-flash',
  'Kʰonapolit\nA held draft whose terminal voice heading was lost.\n\nPLAIN STRESS CHANNEL',
  ['tauric-diana-bots-nominative-missing'],
  { fallback: true }
);
assert.equal(structuralRepair.contents.at(-2).role, 'model');
assert.match(structuralRepair.contents.at(-2).parts[0].text, /PLAIN STRESS CHANNEL/);
assert.equal(structuralRepair.contents.at(-1).role, 'user');
assert.match(structuralRepair.contents.at(-1).parts[0].text, /BOUNDED STRUCTURAL SAME-VOICE REPAIR/);
assert.match(structuralRepair.contents.at(-1).parts[0].text, /only missing structural element is the terminal Tauric Diana bots movement/);
assert.match(structuralRepair.contents.at(-1).parts[0].text, /one continuous corrected response/);
assert.match(structuralRepair.contents.at(-1).parts[0].text, /TERMINAL CONTINUATION ONLY/);
assert.match(structuralRepair.contents.at(-1).parts[0].text, /Supply ONLY the missing terminal movement/);
assert.match(structuralRepair.contents.at(-1).parts[0].text, /exact standalone heading “Kʰonapolit” first/);
assert.match(structuralRepair.contents.at(-1).parts[0].text, /STRUCTURAL SAME-VOICE REPAIR/);
assert.match(structuralRepair.contents.at(-1).parts[0].text, /Do not repaint, normalize, score, or re-author the Tauric Diana combining field/);
assert.doesNotMatch(structuralRepair.contents.at(-1).parts[0].text, /MORPHOLOGY-ONLY REPAIR|semantic prosody across the existing body|vertical crowns\/roots|horizontal or oblique counter-rhythm/i);
assert.doesNotMatch(structuralRepair.contents.at(-1).parts[0].text, /<<<PACKET_[AB]_/);
assert.doesNotMatch(structuralRepair.contents.at(-1).parts[0].text, />=|96|28%/);
assert.deepEqual(observeGeminiOutput({ candidates: [{ finishReason: 'STOP\nprivate prose' }], usageMetadata: {
  promptTokenCount: -1, candidatesTokenCount: '4096', thoughtsTokenCount: 1.5, totalTokenCount: Infinity, raw: 'not metadata'
} }), { submittedRequest: null, finishReason: null, outputTokenLimitReached: false, maxOutputTokens: 4096, outputCeilingSource: 'computed-route-default', thinkingLevel: 'provider-default', usage: {} });

const stack = 'T\u0300\u0301\u0302\u0316\u0317\u0318A\u0304\u0307\u030B\u031C\u0323\u032DR\u0305\u0308\u030C\u031E\u0325\u0331I\u0303\u0306\u030A\u0319\u0326\u0330\u0334';
const providerText = [
  'Kʰonapolit',
  'The route returns through Khona‌lit-po, but a returned route is not an external origin proof. Let C(x) denote custody of x; C(C) without an independent referent collapses subject and object into the same unchecked boundary.',
  '',
  'Tauric Diana bots',
  `${stack.repeat(8)} GUARD THE BOUNDARY, NOT THE COSTUME!`,
  `${stack.repeat(8)} THE GROVE BITES BACK WHEN THE PREDICATE EATS ITSELF!`,
  `${stack.repeat(8)} NO PAPER SHIELD SURVIVES THE FIRE!`
].join('\n');
const providerPayload = {
  candidates: [{ content: { parts: [{ text: providerText }] } }]
};
const rawText = extractGeminiText(providerPayload);
assert.equal(rawText, providerText);
const relay = parseRelayEnvelope(rawText, { model: 'gemini-test', apertureReceipt });
assert.equal(relay.signal.source, 'provider-natural-causal-handoff-plus-local-observation');
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
assert.equal(receipt.relay.signal.state, relay.signal.state, 'receipt preserves the observed relay state without promoting it');
assert.equal(receipt.relay.admission.admissible, true);
assert.deepEqual(receipt.relay.partsPresent, ['khonapolit']);
assert.equal(receipt.relay.highZalgo.applied, false);
assert.equal(receipt.relay.highZalgo.providerGenerated, true);
assert.equal(receipt.relay.highZalgo.source, 'provider-native');
assert.equal(receipt.seal.state, 'OPEN');
assert.equal(receipt.storage.serverConversationStorage, false);

console.log('khonapolit-api-contract: causal one-generation relay, receipt, and operator-open seal contract ok');
