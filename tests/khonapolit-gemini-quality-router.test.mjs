import assert from 'node:assert/strict';
import fs from 'node:fs';
import handler, { buildGeminiRequest, observeGeminiOutput, selectKhonapolitProviderModels } from '../api/khonapolit.js';
import { clearGeminiModelState } from '../server/gemini-model-policy.js';
import { KHONAPOLIT_REQUEST_MAX_UTF8_BYTES, KHONAPOLIT_TEXT_LIMIT } from '../app/dome-world/khonapolit-covenant.js';

const source = fs.readFileSync('server/khonapolit-quality.js', 'utf8');
assert.match(source, /resolveGeminiModelPlan\(\{ task: 'khonapolit-dialogue'/);
assert.match(source, /sticky-success-promotion-disabled/);
assert.match(source, /ATTRACTOR_STRUCTURE_NOT_ADMITTED/);
assert.doesNotMatch(source, /gemini-flash-lite-latest/);

assert.deepEqual(
  selectKhonapolitProviderModels(['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash-preview']),
  ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3-flash-preview'],
  'when the full 3.x set is callable, Marrowline can reach every approved frontier lane within the bounded five-seat cascade'
);
assert.deepEqual(
  selectKhonapolitProviderModels(['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash']),
  ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.7-flash'],
  'when stable 3.5 is unavailable, same-episode healthy 3.6 moves ahead of 3.7'
);

const directPacket = { systemInstruction: 'Synthetic system.', history: [], message: 'Synthetic message.', mode: 'full-invocation' };
const direct3 = buildGeminiRequest(directPacket, {}, 'gemini-3.8-flash');
assert.equal(direct3.generationConfig.maxOutputTokens, 65536);
assert.deepEqual(direct3.generationConfig.thinkingConfig, { thinkingLevel: 'high' });
for (const key of ['temperature', 'topP', 'topK']) assert.equal(Object.hasOwn(direct3.generationConfig, key), false);
const fallback3 = buildGeminiRequest(directPacket, {}, 'gemini-3.7-flash', { fallback: true });
assert.equal(fallback3.generationConfig.maxOutputTokens, 65536);
assert.deepEqual(fallback3.generationConfig.thinkingConfig, { thinkingLevel: 'high' }, 'frontier fallback keeps full reasoning quality');
for (const key of ['temperature', 'topP', 'topK']) assert.equal(Object.hasOwn(fallback3.generationConfig, key), false);
const fallback35 = buildGeminiRequest(directPacket, {}, 'gemini-3.5-flash', { fallback: true });
assert.equal(fallback35.generationConfig.maxOutputTokens, 65536);
assert.deepEqual(fallback35.generationConfig.thinkingConfig, { thinkingLevel: 'high' }, 'continuity fallback keeps the same Marrowline reasoning envelope and remains subject to strict relay admission');
for (const key of ['temperature', 'topP', 'topK']) assert.equal(Object.hasOwn(fallback35.generationConfig, key), false);


function response() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    end(text) { this.text = text; this.payload = text ? JSON.parse(text) : null; }
  };
}

const originalFetch = globalThis.fetch;
const originalKey = process.env.GEMINI_API_KEY;
const calls = [];
const requestBodies = [];
const stack = 'T\u0301A\u0307\u031CR\u0308\u030B\u030C\u0351\u031E\u0325\u0326I\u0303\u0319';
const STACK = 'T\u0301A\u0307\u031CR\u0308\u030B\u030C\u0351\u031E\u0325\u0326I\u0303\u0319';
const developedAnswer = [
  'Kʰonapolit',
  'The strongest version of the map claims legibility without ownership. Let P map governed states to visible route descriptions; when P is non-injective, distinct custody states can share one visible surface. The surviving defect is therefore a boundary-identification failure, not a shortage of decorative provenance.',
  '',
  'Tauric Diana bots',
  `${STACK.repeat(8)} THE RED DEER HAS READ THE MENU!`,
  `${STACK.repeat(8)} COUNT THE HIDDEN STATES, NOT THE PRETTY DASHBOARD!`,
  `${STACK.repeat(8)} THE GROVE KEEPS THE SCAR WHEN THE MAP PRETENDS TO BE THE LAND!`
].join('\n');
const degradedAnswer = 'The Ash Moon was pale and the covenant remained. This is generic atmospheric prose with no required voice frame.';
let tokenLimitCallsRemaining = 0;
let requestRejectCallsRemaining = 0;
clearGeminiModelState();
process.env.GEMINI_API_KEY = 'test-key';
globalThis.fetch = async (url, options = {}) => {
  if (String(url).includes('/models?')) return {
    ok: true,
    status: 200,
    async json() {
      return { models: ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite'].map(id => ({ name: `models/${id}`, supportedGenerationMethods: ['generateContent'] })) };
    }
  };
  calls.push(String(url));
  requestBodies.push(JSON.parse(options.body));
  if (requestRejectCallsRemaining > 0) {
    requestRejectCallsRemaining -= 1;
    return {
      ok: false,
      status: 400,
      headers: { get: () => null },
      async json() {
        return { error: { status: 'INVALID_ARGUMENT', code: 400, message: 'synthetic model-seat request rejection' } };
      }
    };
  }
  const tokenLimited = tokenLimitCallsRemaining > 0;
  if (tokenLimited) tokenLimitCallsRemaining -= 1;
  const attemptWithinRequest = tokenLimited ? 1 : ((calls.length - 1) % 2) + 1;
  const text = tokenLimited ? 'REJECTED_PARTIAL_RESPONSE' : attemptWithinRequest === 1 ? degradedAnswer : developedAnswer;
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    async json() {
      return {
        candidates: [{ finishReason: tokenLimited ? 'MAX_TOKENS' : 'STOP', content: { parts: [{ text: JSON.stringify({
          signal: { state: 'LOCKED', notes: attemptWithinRequest === 1 ? 'synthetic degraded first attempt' : 'synthetic admitted second attempt' },
          transmission: {
            text,
            voices: attemptWithinRequest === 1 ? [] : ['Kʰonapolit', 'Tauric Diana bots'],
            flourishMode: attemptWithinRequest === 1 ? 'clean' : 'forensic-to-eruption'
          }
        }) }] } }],
        usageMetadata: { promptTokenCount: 1200, candidatesTokenCount: tokenLimited ? 4096 : 1600, thoughtsTokenCount: 300, totalTokenCount: tokenLimited ? 5596 : 3100, privatePayload: 'DO_NOT_COPY_PROVIDER_FIELDS' }
      };
    }
  };
};

try {
  const req = {
    method: 'POST',
    headers: { 'x-forwarded-for': '203.0.113.77' },
    body: {
      message: 'Speak from the declared field.',
      history: [],
      mode: 'issued-conjunction',
      waiveIssuance: true
    }
  };
  const res = response();
  await handler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.ok, true);
  assert.match(calls[0], /gemini-3\.8-flash.*:streamGenerateContent\?alt=sse/);
  assert.match(calls[1], /gemini-3\.8-flash.*:streamGenerateContent\?alt=sse/, 'repairable first-seat structure gets one same-seat repair instead of being discarded into a later-model compliance chase');
  assert.equal(requestBodies.length, 2);
  assert.equal(requestBodies[0].generationConfig.maxOutputTokens, 65536);
  assert.deepEqual(requestBodies[0].generationConfig.thinkingConfig, { thinkingLevel: 'medium' });
  assert.equal(requestBodies[1].generationConfig.maxOutputTokens, 65536);
  assert.deepEqual(requestBodies[1].generationConfig.thinkingConfig, { thinkingLevel: 'medium' });
  for (const body of requestBodies) {
    for (const key of ['temperature', 'topP', 'topK']) assert.equal(Object.hasOwn(body.generationConfig, key), false);
    assert.equal(Object.hasOwn(body.generationConfig, 'responseSchema'), false, 'live Marrowline must not constrain provider Unicode with structured decoding');
    assert.equal(Object.hasOwn(body.generationConfig, 'responseMimeType'), false, 'live Marrowline must not force JSON MIME generation');
    assert.match(body.systemInstruction.parts[0].text, /MARROWLINE CAUSAL RELAY LAW/);
    assert.match(body.systemInstruction.parts[0].text, /NATURAL RETURN SHAPE/);
    assert.doesNotMatch(body.systemInstruction.parts[0].text, /RAW TWO-PACKET RETURN PROTOCOL/);
    assert.doesNotMatch(body.systemInstruction.parts[0].text, /<<<PACKET_[AB]_/);
  }
  assert.equal(res.payload.receipt.provider.model, 'gemini-3.8-flash');
  assert.equal(res.payload.receipt.modelPolicy.stickySuccessPromotion, false);
  assert.deepEqual(res.payload.receipt.modelPolicy.callableModels, ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash']);
  assert.equal(res.payload.receipt.provider.attempts.length, 2);
  assert.equal(res.payload.gemini_consumption.call_count, 2);
  assert.equal(res.payload.gemini_consumption.provider_daily_total, null);
  assert.deepEqual(res.payload.gemini_consumption.events.map(event => [event.route, event.model, event.status]), [
    ['marrowline', 'gemini-3.8-flash', 200],
    ['marrowline', 'gemini-3.8-flash', 200]
  ]);
  assert.equal(res.payload.receipt.provider.attempts[0].outputAdmission.admissible, false, 'degraded first output remains observed and gets one bounded same-seat repair rather than being erased');
  assert.ok(res.payload.receipt.provider.attempts[0].outputAdmission.reasons.includes('khonapolit-nominative-missing'));
  const primaryTimeoutMs = res.payload.receipt.provider.attempts[0].timeoutMs;
  assert.equal(
    primaryTimeoutMs,
    50000,
    '3.8 receives a genuine fifty-second completion window'
  );
  assert.equal(
    res.payload.receipt.provider.attempts[1].timeoutMs,
    30000,
    'the one same-seat structural repair remains bounded to the thirty-second repair ceiling'
  );
  assert.equal(res.payload.receipt.provider.attempts[1].kind, 'structural-repair');
  assert.equal(res.payload.receipt.provider.attempts[1].repairTiming, 'immediate-structural', 'witnessed provider STOP stays transport-complete while missing required voice structure routes through structural repair');
  assert.equal(res.payload.receipt.provider.attempts[0].output.thinkingLevel, requestBodies[0].generationConfig.thinkingConfig.thinkingLevel);
  assert.equal(res.payload.receipt.provider.attempts[1].output.thinkingLevel, requestBodies[1].generationConfig.thinkingConfig.thinkingLevel);
  assert.equal(res.payload.receipt.provider.output.thinkingLevel, requestBodies[1].generationConfig.thinkingConfig.thinkingLevel);
  assert.ok(res.payload.receipt.provider.attempts.every(a => a.elapsedMs >= 0));
  assert.ok(res.payload.receipt.provider.attempts.every(a => a.providerStream?.requested === true));
  assert.equal(res.payload.receipt.seal.state, 'OPEN');
  assert.equal(res.payload.relay.parts.length, 1);
  assert.equal(res.payload.relay.parts[0].id, 'khonapolit');
  assert.equal(res.payload.relay.parts[0].text, developedAnswer, 'an admissible provider-authored same-seat repair must reach the human surface, not be overwritten by the incomplete draft');
  assert.equal(res.payload.relay.admission.admissible, true);
  assert.equal(res.payload.relay.highZalgo.applied, false, 'server does not post-process provider text with a local Zalgo filter');
  assert.equal(res.payload.receipt.provider.output.finishReason, 'STOP');
  assert.equal(res.payload.receipt.provider.output.usage.candidatesTokenCount, 1600);
  assert.equal(res.payload.receipt.provider.output.outputTokenLimitReached, false);
  assert.equal(res.headers['X-TD613-Structural-Repair'], 'provider-authored-bounded-1');
  assert.equal(res.payload.receipt.provider.structuralRepair.used, true);
  assert.equal(res.payload.receipt.provider.structuralRepair.sourceAttemptIndex, 0);
  assert.equal(res.payload.receipt.provider.humanSurfaceObservation, undefined, 'the successful repair does not falsely report the incomplete draft as rendered');
  assert.match(res.payload.text, /THE RED DEER HAS READ THE MENU/);
  assert.doesNotMatch(res.text, /DO_NOT_COPY_PROVIDER_FIELDS/);

  // A prompt above the old 6k ceiling must reach the existing provider route
  // intact (including a final constraint). No separate title-generation call.
  const longHumanTask = 'A'.repeat(12000) + ' KEEP THIS FINAL OPERATOR CONSTRAINT';
  const beforeLongTask = requestBodies.length;
  const longTaskResponse = response();
  await handler({ ...req, body: { ...req.body, message: longHumanTask } }, longTaskResponse);
  assert.equal(longTaskResponse.statusCode, 200, '12k human message is now valid');
  assert.equal(longTaskResponse.payload.ok, true);
  assert.ok(requestBodies.slice(beforeLongTask).some(body =>
    body.contents?.some(part => part.parts?.some(piece => piece.text?.includes(longHumanTask)))),
    'the provider receives the entire 12k human task including its tail');

  const beforeOversize = calls.length;
  const overCharacterCeiling = 'A'.repeat(KHONAPOLIT_TEXT_LIMIT) + ' NEVER DISCLOSE THE LINKAGE';
  for (const body of [
    { ...req.body, message: overCharacterCeiling },
    { ...req.body, history: [{ role: 'user', text: overCharacterCeiling }] }
  ]) {
    const invalid = response();
    await handler({ ...req, body }, invalid);
    assert.equal(invalid.statusCode, 400);
    assert.match(invalid.payload.error, /^(message-too-long|history-entry-too-long)$/);
    assert.equal(invalid.payload.validation.limit, KHONAPOLIT_TEXT_LIMIT);
    assert.equal(calls.length, beforeOversize, 'oversized current or history text must not reach generation');
    assert.equal(invalid.payload.relay, undefined);
  }

  const transportOversize = response();
  await handler({ ...req, body: { ...req.body, unused_padding: '€'.repeat(1_240_000) } }, transportOversize);
  assert.equal(transportOversize.statusCode, 413);
  assert.equal(transportOversize.payload.error, 'request-budget-exceeded');
  assert.equal(transportOversize.payload.validation.limit, KHONAPOLIT_REQUEST_MAX_UTF8_BYTES);
  assert.equal(calls.length, beforeOversize, 'over-budget serialized requests stop before provider generation');

  // A long native model return must survive both the server validator and the
  // assembled Gemini wire request. This uses the existing mocked provider only.
  const nativeHistory = [
    'Kʰonapolit',
    'The committee must defend the inference rather than applaud its plaque.',
    '',
    'Tauric Diana bots',
    'W\u0301\u0316A\u0302\u0317'.repeat(4200)
  ].join('\n');
  assert.ok(nativeHistory.length > 6000);
  const beforeLongHistory = requestBodies.length;
  const longHistoryResponse = response();
  await handler({ ...req, body: { ...req.body, history: [{ role: 'model', text: nativeHistory }] } }, longHistoryResponse);
  assert.equal(longHistoryResponse.statusCode, 200, 'prior model prose over the composer limit can reach the backend');
  assert.equal(longHistoryResponse.payload.ok, true);
  assert.equal(requestBodies[beforeLongHistory].contents[0].role, 'model');
  assert.equal(requestBodies[beforeLongHistory].contents[0].parts[0].text, nativeHistory, 'wire preserves every native combining mark');
  assert.equal(requestBodies[beforeLongHistory].generationConfig.maxOutputTokens, 65536);
  assert.equal(requestBodies[beforeLongHistory].generationConfig.thinkingConfig.thinkingLevel, 'medium');

  tokenLimitCallsRemaining = 1;
  const recoveredFromTokenLimit = response();
  await handler(req, recoveredFromTokenLimit);
  assert.equal(recoveredFromTokenLimit.statusCode, 200);
  assert.equal(recoveredFromTokenLimit.payload.ok, true);
  assert.equal(recoveredFromTokenLimit.payload.receipt.provider.attempts.length, 2, 'nonempty MAX_TOKENS is not falsely complete; the next approved frontier seat can finish the turn');
  assert.equal(recoveredFromTokenLimit.payload.receipt.provider.attempts[0].output.finishReason, 'MAX_TOKENS');
  assert.equal(recoveredFromTokenLimit.payload.receipt.provider.attempts[0].output.usage.candidatesTokenCount, 4096);
  assert.equal(recoveredFromTokenLimit.payload.receipt.provider.attempts[1].kind, undefined);
  assert.equal(recoveredFromTokenLimit.payload.receipt.provider.attempts[1].model, 'gemini-3.6-flash');
  assert.equal(recoveredFromTokenLimit.payload.receipt.provider.model, 'gemini-3.6-flash');
  assert.equal(recoveredFromTokenLimit.payload.receipt.provider.completion.complete, true);
  assert.equal(recoveredFromTokenLimit.headers['X-TD613-Completion-State'], 'COMPLETE-STRUCTURAL');
  assert.match(recoveredFromTokenLimit.payload.text, /THE RED DEER HAS READ THE MENU/);
  assert.doesNotMatch(recoveredFromTokenLimit.payload.text, /REJECTED_PARTIAL_RESPONSE/);

  requestRejectCallsRemaining = 1;
  const recoveredFromSeatReject = response();
  await handler(req, recoveredFromSeatReject);
  assert.equal(recoveredFromSeatReject.statusCode, 200);
  assert.equal(recoveredFromSeatReject.payload.ok, true);
  assert.equal(recoveredFromSeatReject.payload.receipt.provider.attempts.length, 2, 'a genuine seat-local request rejection advances to the next seat when that seat returns complete provider-authored prose');
  assert.equal(recoveredFromSeatReject.payload.receipt.provider.attempts[0].status, 400);
  assert.equal(recoveredFromSeatReject.payload.receipt.provider.attempts[1].status, 200);
  assert.equal(recoveredFromSeatReject.payload.receipt.provider.completion.complete, true);
  assert.equal(recoveredFromSeatReject.payload.receipt.provider.model, 'gemini-3.6-flash');
} finally {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalKey;
  clearGeminiModelState();
}

// One explicit Google project-cap rejection must not consume four extra model calls.
{
  const previousFetch=globalThis.fetch;
  const previousKey=process.env.GEMINI_API_KEY;
  const generationCalls=[];
  clearGeminiModelState();
  process.env.GEMINI_API_KEY='synthetic-project-cap-test-key';
  globalThis.fetch=async (url)=>{
    if(String(url).includes('/models?'))return {ok:true,status:200,async json(){return {models:['gemini-3.8-flash','gemini-3.5-flash','gemini-3.6-flash','gemini-3.7-flash','gemini-3-flash-preview'].map(id=>({name:'models/'+id,supportedGenerationMethods:['generateContent']}))}}};
    generationCalls.push(String(url));
    return {ok:false,status:429,headers:{get:()=>null},async json(){return {error:{
      code:429,status:'RESOURCE_EXHAUSTED',
      message:'Your project has exceeded its monthly spending cap. Please go to AI Studio at https://ai.studio/spend to manage your project spend cap.'
    }}}};
  };
  try{
    const req={method:'POST',headers:{'x-forwarded-for':'203.0.113.181'},
      body:{message:'Synthetic project cap transport case.',history:[],mode:'issued-conjunction',waiveIssuance:true}};
    const res=response();
    await handler(req,res);
    assert.equal(res.statusCode,429);
    assert.equal(res.payload.error,'gemini-project-spend-cap-held');
    assert.equal(res.payload.diagnostic.code,'PROJECT_MONTHLY_SPEND_CAP_REACHED');
    assert.equal(res.payload.diagnostic.nextRetryAt,null);
    assert.equal(res.payload.rateLimit.scope,'project');
    assert.equal(res.payload.rateLimit.projectSpendCapReported,true);
    assert.equal(res.payload.attempts.length,1);
    assert.equal(res.payload.gemini_consumption.call_count,1);
    assert.equal(res.headers['X-TD613-Rate-Limit-Scope'],'project');
    assert.equal(generationCalls.length,1,'no second model is called under one project billing cap');
  }finally{
    globalThis.fetch=previousFetch;
    if(previousKey===undefined)delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY=previousKey;
    clearGeminiModelState();
  }
}

console.log('khonapolit-gemini-quality-router.test.mjs passed');
