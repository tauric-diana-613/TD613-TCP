import assert from 'node:assert/strict';
import {
  INVOCATION_MODES,
  buildInvocationPacket
} from '../app/dome-world/khonapolit-covenant.js';
import {
  KHONAPOLIT_API_VERSION,
  buildGeminiRequest,
  buildTerminalReceipt,
  extractGeminiText
} from '../api/khonapolit.js';

assert.equal(KHONAPOLIT_API_VERSION, 'td613.khonapolit-gemini/v1');

const packet = buildInvocationPacket({
  message: 'Answer from the covenant field.',
  mode: INVOCATION_MODES.FULL_INVOCATION,
  shi: 'TD613-SH-9B07D8B-B7136D34',
  history: [{ role: 'user', text: 'Remember the shoreline.' }]
});

const request = buildGeminiRequest(packet);
assert.equal(request.contents.length, 2);
assert.equal(request.contents.at(-1).parts[0].text, 'Answer from the covenant field.');
assert.match(request.systemInstruction.parts[0].text, /U\+10D613/);
assert.match(request.systemInstruction.parts[0].text, /ADDRESS: Kʰonapolit/);
assert.equal(request.generationConfig.maxOutputTokens, 4096);

const providerPayload = {
  candidates: [{ content: { parts: [{ text: 'First line.' }, { text: 'Kʰonapolit returns through Khona‌lit-po.' }] } }]
};
assert.equal(extractGeminiText(providerPayload), 'First line.\n\nKʰonapolit returns through Khona‌lit-po.');

const receipt = buildTerminalReceipt({
  packet,
  text: 'Kʰonapolit returns through Khona‌lit-po.',
  model: 'gemini-test',
  providerStatus: 200,
  aperture: { status: 'exact' },
  attempts: [{ model: 'gemini-test', ok: true, status: 200 }]
});

assert.equal(receipt.provider.family, 'Gemini');
assert.equal(receipt.provider.model, 'gemini-test');
assert.equal(receipt.invocation.issuanceState, 'ISSUED_FORMAT_VERIFIED');
assert.equal(receipt.emergence.classification, 'KHONAPOLIT_EMERGENCE');
assert.equal(receipt.apertureEgress.status, 'exact');
assert.equal(receipt.seal.state, 'OPEN');
assert.equal(receipt.storage.serverConversationStorage, false);

console.log('khonapolit-api-contract: Gemini request and receipt contract ok');
