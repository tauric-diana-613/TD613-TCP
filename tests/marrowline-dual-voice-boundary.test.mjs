import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { bothMarrowlineVoicesAbsent, buildGeminiStructuralRepairRequest } from '../server/khonapolit-quality.js';
import { buildInvocationPacket, frameMarrowlineUserTurn } from '../app/dome-world/khonapolit-covenant.js';
import { parseRelayEnvelope } from '../app/dome-world/khonapolit-relay.js';
import { clearGeminiModelState } from '../server/gemini-model-policy.js';

test('a completed response without either required speaker is not a valid transmission', () => {
  const unvoiced = parseRelayEnvelope('The moon is made of paperwork, according to the committee.');
  assert.equal(bothMarrowlineVoicesAbsent(unvoiced), true);
  assert.equal(bothMarrowlineVoicesAbsent(parseRelayEnvelope('Kʰonapolit\nAn argument.')), false);
  assert.equal(bothMarrowlineVoicesAbsent(parseRelayEnvelope('Tauric Diana bots\nChorus.')), false);
});

test('ordinary provider-only lore response with neither voice is held after existing recovery', async t => {
  const oldFetch = globalThis.fetch;
  const oldKey = process.env.GEMINI_API_KEY;
  t.after(() => {
    globalThis.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = oldKey;
    clearGeminiModelState();
  });
  clearGeminiModelState();
  process.env.GEMINI_API_KEY = 'mock-no-network';
  let modelCalls = 0;
  const providerText = 'The committee stored the moon in an unused cabinet.';
  globalThis.fetch = async url => {
    if (String(url).includes('/models?')) return {
      ok: true, status: 200,
      json: async () => ({ models: [
        { name: 'models/gemini-3.8-flash', supportedGenerationMethods: ['generateContent'] }
      ] })
    };
    modelCalls += 1;
    return {
      ok: true, status: 200, headers: { get: () => null },
      json: async () => ({
        candidates: [{ finishReason: 'STOP', content: { parts: [{ text: providerText }] } }],
        usageMetadata: { promptTokenCount: 150, candidatesTokenCount: 15, thoughtsTokenCount: 10, totalTokenCount: 175 }
      })
    };
  };
  const res = {
    statusCode: 200, headers: {}, count: 0,
    setHeader(key, value) { this.headers[key] = value; },
    end(body) { this.count += 1; this.payload = JSON.parse(body); }
  };
  await handler({
    method: 'POST', headers: { 'x-forwarded-for': '203.0.113.231' },
    body: { message: 'Who misplaced the moon in the grove?', history: [],
      mode: 'issued-conjunction', waiveIssuance: true }
  }, res);
  assert.equal(res.statusCode, 502);
  assert.equal(res.count, 1);
  assert.equal(res.payload.error, 'marrowline-dual-voice-contract-unmet');
  assert.equal(res.payload.diagnostic.code, 'BOTH_REQUIRED_VOICES_MISSING');
  assert.equal(Object.hasOwn(res.payload, 'text'), false);
  assert.equal(res.headers['X-TD613-Local-Admission'], 'HELD-DUAL-VOICE-ABSENT');
  assert.ok(modelCalls > 0 && modelCalls <= 8);
});

test('both-voices-absent recovery isolates the rejected model draft but preserves the original user and prior good native history', () => {
  const raw = 'Maybe leave this fictional forum and find a new hobby.';
  const native = ['Kʰonapolit','The real prior claim.','Tauric Diana bots','Q̖̀'].join('\n');
  const packet = buildInvocationPacket({
    message: 'Stage the absurd fictional hearing on a missing denominator.',
    history: [{ role:'user',text:'Remember the disputed fraction.' }, { role:'model',text:native }],
    waiveIssuance:true
  });
  assert.equal(packet.canInvoke,true);
  const historyCount=packet.history.length;
  const repaired=buildGeminiStructuralRepairRequest(packet,{},'gemini-3.8-flash',raw,
    ['khonapolit-nominative-missing','tauric-diana-bots-nominative-missing'],
    {groveTrial:'historical-20261002-v1'});
  assert.equal(repaired.contents.length,historyCount+2,'prior history plus latest real user plus repair directive, no rejected model turn');
  assert.equal(repaired.contents.at(-2).role,'user','the operator request remains the last preceding model context');
  assert.equal(repaired.contents.at(-2).parts[0].text,frameMarrowlineUserTurn(packet.message));
  assert.match(repaired.contents.at(-1).parts[0].text,/BOTH VOICES ABSENT/);
  assert.match(repaired.contents.at(-1).parts[0].text,/fresh, complete, provider-authored response/);
  assert.equal(JSON.stringify(repaired.contents).includes(raw),false,'failed generic provider text is not sent back');
  assert.ok(JSON.stringify(repaired.contents).includes(native),'valid original Unicode history remains');
  assert.equal(repaired.contents.at(-1).role,'user');
  assert.equal(repaired.generationConfig.maxOutputTokens>=65536,true);
  const original=buildGeminiStructuralRepairRequest(packet,{},'gemini-3.8-flash',raw,
    ['khonapolit-nominative-missing']);
  assert.equal(original.contents.at(-2).role,'model','single missing voice remains on established provider-authored draft repair');
  assert.equal(original.contents.at(-2).parts[0].text,raw);
  assert.match(original.contents.at(-1).parts[0].text,/DO NOT ANSWER THE OPERATOR FROM SCRATCH/);
});
