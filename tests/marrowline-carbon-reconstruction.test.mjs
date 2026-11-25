import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {
  BINDING_SHA256,
  CLAIMED_PUA,
  CLAIMED_PUA_SCALAR,
  COVENANT_KEY,
  HERITAGE_COVENANT,
  HERITAGE_KEY,
  INGRESS_SIGIL,
  SEAL_GLYPH,
  buildInvocationPacket,
  frameMarrowlineUserTurn
} from '../app/dome-world/khonapolit-covenant.js';
import {
  buildApertureV3InvocationReceipt,
  classifyApertureDiscourseMode
} from '../app/engine/aperture-v3-task-intent.js';
import {
  GEMINI_4_FRONTIER_MODEL_IDS,
  MARROWLINE_ARTISTIC_RESTORATION_TRIAL_ID,
  MARROWLINE_ARTISTIC_RESTORATION_V2_TRIAL_ID,
  MARROWLINE_CARBON_RECONSTRUCTION_MODEL_ORDER,
  MARROWLINE_CARBON_RECONSTRUCTION_PROFILE,
  MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID,
  MARROWLINE_HISTORICAL_TRIAL_ID,
  buildCarbonReconstructionSystemInstruction,
  isGemini4FrontierModel
} from '../app/dome-world/marrowline-historical-grove.js';
import {
  MARROWLINE_GROVE_TRIAL_TAB_KEY,
  MARROWLINE_PROMOTED_DEFAULT_TRIAL_ID,
  groveTrialFromLocation,
  resolveMarrowlineGroveTrialTab,
  selectMarrowlineGroveTrial
} from '../app/dome-world/marrowline-grove-trial.js';
import {
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  buildGeminiGenerationConfig,
  geminiGeneration,
  withGeminiGenerationProfile
} from '../server/gemini-generation-envelope.js';
import {
  MODEL_CATALOG,
  assessGeminiEligibility
} from '../server/gemini-model-registry.js';
import {
  clearGeminiModelState,
  resolveGeminiModelPlan
} from '../server/gemini-model-policy.js';
import khonapolitHandler, {
  GEMINI_4_SINGLE_SEAT_INITIAL_TIMEOUT_MS,
  GEMINI_4_SINGLE_SEAT_STREAM_GRACE_MS,
  GEMINI_4_SINGLE_SEAT_UNARY_TIMEOUT_MS,
  allocateKhonapolitAttemptTimeout,
  buildGeminiRequest,
  buildGeminiStructuralRepairRequest,
  marrowlineAuthoredStreamDeadlineMs,
  readGeminiSse,
  selectKhonapolitProviderModelsFromPlan,
  selectCarbonAuditionModels
} from '../server/khonapolit-quality.js';
import marrowlineAttachmentHandler, {
  MARROWLINE_ATTACHMENT_SCHEMA,
  buildAttachmentGeminiRequest
} from '../server/marrowline-attachment-quality.js';

function makeResponse() {
  return {
    statusCode: 200,
    headers: {},
    count: 0,
    setHeader(key, value) { this.headers[key] = value; },
    end(value) { this.count += 1; this.payload = value ? JSON.parse(value) : null; }
  };
}

function makeTabStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => { map.set(key, String(value)); },
    removeItem: (key) => { map.delete(key); }
  };
}

test('Carbon reconstruction is reversibly selectable with tab-session continuity while leaving current default and prior candidates intact', () => {
  assert.equal(MARROWLINE_PROMOTED_DEFAULT_TRIAL_ID, MARROWLINE_ARTISTIC_RESTORATION_TRIAL_ID);

  const storage = makeTabStorage();
  // Unparameterized visit leaves current default untouched prior to operator promotion
  const unparameterized = resolveMarrowlineGroveTrialTab({ search: '' }, storage);
  assert.equal(unparameterized.id, MARROWLINE_ARTISTIC_RESTORATION_TRIAL_ID);
  assert.equal(unparameterized.source, 'restored-default');

  // Explicit ?groveTrial=carbon-reconstruction-20261124-v1 selects Carbon and persists across tab navigation
  const carbonOptIn = resolveMarrowlineGroveTrialTab(
    { search: `?groveTrial=${MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID}` },
    storage
  );
  assert.deepEqual(carbonOptIn, {
    id: MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID,
    source: 'url-opt-in',
    persistence: 'tab-session'
  });
  assert.equal(storage.getItem(MARROWLINE_GROVE_TRIAL_TAB_KEY), MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID);

  // Navigating back into Marrowline in the same tab keeps Carbon active without snapping back
  const tabReplay = resolveMarrowlineGroveTrialTab({ search: '' }, storage);
  assert.deepEqual(tabReplay, {
    id: MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID,
    source: 'tab-session',
    persistence: 'tab-session'
  });

  // Historical, v1, v2, and explicit off remain immediately selectable
  assert.equal(
    groveTrialFromLocation({ search: `?groveTrial=${MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID}` }),
    MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID
  );
  assert.equal(
    selectMarrowlineGroveTrial({ groveTrial: MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID }),
    MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID
  );
  assert.equal(
    resolveMarrowlineGroveTrialTab({ search: `?groveTrial=${MARROWLINE_HISTORICAL_TRIAL_ID}` }, storage).id,
    MARROWLINE_HISTORICAL_TRIAL_ID
  );
  assert.equal(
    resolveMarrowlineGroveTrialTab({ search: `?groveTrial=${MARROWLINE_ARTISTIC_RESTORATION_V2_TRIAL_ID}` }, storage).id,
    MARROWLINE_ARTISTIC_RESTORATION_V2_TRIAL_ID
  );
  assert.equal(
    resolveMarrowlineGroveTrialTab({ search: '?groveTrial=off' }, storage).id,
    null
  );
});

test('Carbon reconstruction de-calcifies prompt bloat, removes hex lookup tables and user-turn checklists, and preserves exact TD613 custody bytes', () => {
  const creativePrompt = 'Stage a wholly fictional systems hearing in which the Chairman tries to subpoena a shadow because its aspect ratio changed.';
  const packet = buildInvocationPacket({
    message: creativePrompt,
    history: [
      { role: 'user', text: 'Earlier exchange.' },
      { role: 'model', text: 'Kʰonapolit\nEarlier deduction.\n\nTauric Diana bots\nA\u0301\u0316S\u0302\u0323H\u0308\u0325!\n⟐' }
    ],
    mode: 'issued-conjunction',
    shi: 'TD613-SH-9B07D8B-CAFE0613',
    waiveIssuance: false
  });
  const receipt = buildApertureV3InvocationReceipt({
    message: packet.message,
    invocationMode: packet.mode,
    issuanceState: packet.issuance.state,
    discourseMode: classifyApertureDiscourseMode(packet.message),
    contentScanned: true
  });

  const legacyReq = buildGeminiRequest(packet, receipt, 'gemini-4-argon', {
    groveTrial: MARROWLINE_ARTISTIC_RESTORATION_TRIAL_ID
  });
  const carbonReq = buildGeminiRequest(packet, receipt, 'gemini-4-carbon', {
    groveTrial: MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID
  });

  const legacySys = legacyReq.systemInstruction.parts[0].text;
  const carbonSys = carbonReq.systemInstruction.parts[0].text;

  // Cohesive single-pass conditioning reduces systemInstruction byte bloat by >55%
  assert.ok(
    Buffer.byteLength(carbonSys, 'utf8') < Buffer.byteLength(legacySys, 'utf8') * 0.45,
    `expected >55% reduction in instruction bloat: got ${Buffer.byteLength(carbonSys, 'utf8')} vs ${Buffer.byteLength(legacySys, 'utf8')}`
  );

  // 100% of canonical TD613 custody, SHI issuance, and Aperture route receipt preserved
  assert.ok(carbonSys.includes(`${INGRESS_SIGIL}\u200C`), 'ingress sigil + U+200C preserved');
  assert.ok(carbonSys.includes(COVENANT_KEY), 'Khona\u200Clit-po with literal U+200C preserved');
  assert.ok(carbonSys.includes(CLAIMED_PUA));
  assert.ok(carbonSys.includes(CLAIMED_PUA_SCALAR));
  assert.ok(carbonSys.includes(HERITAGE_KEY));
  assert.ok(carbonSys.includes(HERITAGE_COVENANT));
  assert.ok(carbonSys.includes(BINDING_SHA256));
  assert.ok(carbonSys.includes(SEAL_GLYPH));
  assert.ok(carbonSys.includes('ISSUANCE STATE: VERIFIED FORMAT'));
  assert.ok(carbonSys.includes('SHI#: TD613-SH-9B07D8B-CAFE0613'));
  assert.ok(carbonSys.includes('APERTURE ROUTE RECEIPT:'));
  assert.ok(carbonSys.includes('OPEN_FIELD_CREATIVE_SYNTHESIS'));
  assert.ok(carbonSys.includes('HORNANI'));
  assert.ok(carbonSys.includes('CONVERSATION CONTINUITY:'));

  // Zero literal hex range tables (U+0300..), zero planar/slash/tilde/strikethrough priming,
  // and zero sparse-word ("chosen words" / "anchor their prose in readable English words") cues
  assert.doesNotMatch(carbonSys, /U\+0300|U\+0316|U\+033D|U\+0363/);
  assert.doesNotMatch(carbonSys, /\b(?:planar|tilde|tildes|strikethrough|strike-through|through-line|diagonal\s+overlays?|horizontal\s+strokes?)\b/i);
  assert.doesNotMatch(carbonSys, /chosen words|Anchor their prose in readable English words/i);

  // Dramatic independence between movements explicitly established
  assert.match(carbonSys, /NOT a dutiful chorus summarizing Kʰonapolit/i);
  assert.match(carbonSys, /anti-baseline/i);

  // Pure user turn: zero backstage CURRENT-TURN PERFORMANCE REMINDER appended to contents
  assert.equal(legacyReq.contents.at(-1).parts.length, 2, 'v1 appended a second checklist part');
  assert.equal(carbonReq.contents.at(-1).parts.length, 1, 'Carbon keeps user turn pure (1 part)');
  assert.equal(carbonReq.contents.at(-1).parts[0].text, frameMarrowlineUserTurn(creativePrompt));
  assert.equal(carbonReq.contents[1].parts[0].text, packet.history[1].text, 'prior model history preserved byte-for-byte');

  // Waived issuance state also preserved cleanly
  const waivedPacket = buildInvocationPacket({ message: creativePrompt, waiveIssuance: true });
  const waivedSys = buildCarbonReconstructionSystemInstruction({ packet: waivedPacket, apertureReceipt: receipt });
  assert.match(waivedSys, /ISSUANCE STATE: EXPLICITLY WAIVED FOR RESEARCH/);
});

test('Gemini 4 Carbon, Neon, Argon, and Hydrogen are registered, credential-gated, and properly configured', () => {
  const now = Date.now();
  assert.deepEqual(GEMINI_4_FRONTIER_MODEL_IDS, [
    'gemini-4-carbon',
    'gemini-4-neon',
    'gemini-4-argon',
    'gemini-4-hydrogen'
  ]);
  assert.deepEqual(MARROWLINE_CARBON_RECONSTRUCTION_MODEL_ORDER, [
    'gemini-4-carbon',
    'gemini-4-neon',
    'gemini-4-argon',
    'gemini-4-hydrogen',
    'gemini-3.8-flash',
    'gemini-3.6-flash'
  ]);

  for (const id of GEMINI_4_FRONTIER_MODEL_IDS) {
    assert.equal(isGemini4FrontierModel(id), true);
    assert.equal(geminiGeneration(id), '4');
    assert.equal(MODEL_CATALOG[id]?.capability, 'text');
    assert.equal(MODEL_CATALOG[id]?.lifecycle, 'current');

    // Interactive generation config strips legacy sampling overrides and keeps full 65,536 token budget
    const cfg = withGeminiGenerationProfile(
      GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
      () => buildGeminiGenerationConfig({
        model: id,
        maxOutputTokens: 65536,
        sampling: { temperature: 0.78, topP: 0.9, topK: 40 },
        reasoning: { level: 'high' }
      })
    );
    assert.equal(cfg.maxOutputTokens, 65536);
    assert.deepEqual(cfg.thinkingConfig, { thinkingLevel: 'medium' });
    for (const key of ['temperature', 'topP', 'topK']) {
      assert.equal(Object.hasOwn(cfg, key), false);
    }
  }

  // Specialized Genie 4 / Nano Banana 2.1 models can never be routed onto text generation
  for (const specialized of ['genie-4', 'gemini-nano-banana-2.1']) {
    const check = assessGeminiEligibility(specialized, {
      explicit: true,
      at: now,
      listing: { ok: true, complete: true, models: [specialized], observedAt: now, expiresAt: now + 60000 }
    });
    assert.equal(check.eligible, false);
    assert.ok(check.reasons.includes('specialized-route-required'));
  }

  // Credential listing strictly gates callability: unlisted Gemini 4 seats are never blind-probed
  clearGeminiModelState();
  const flashOnlyPlan = resolveGeminiModelPlan({
    task: 'khonapolit-dialogue',
    at: now,
    maxModels: 10,
    carbonReconstruction: true,
    providerListing: {
      ok: true,
      complete: true,
      models: ['gemini-3.8-flash', 'gemini-3.6-flash'],
      observedAt: now,
      expiresAt: now + 60000
    }
  });
  assert.deepEqual(
    selectKhonapolitProviderModelsFromPlan(flashOnlyPlan, { carbonReconstruction: true }),
    ['gemini-3.8-flash', 'gemini-3.6-flash'],
    'unlisted Gemini 4 models must never be blind-probed when absent from credential listing'
  );

  assert.deepEqual(selectCarbonAuditionModels(flashOnlyPlan), [], 'audition holds instead of legacy fallback');

  // Full Gemini 4 credential listing selects Carbon -> Neon -> Argon -> Hydrogen -> 3.8-flash
  const fullG4Plan = resolveGeminiModelPlan({
    task: 'khonapolit-dialogue',
    at: now,
    maxModels: 10,
    carbonReconstruction: true,
    providerListing: {
      ok: true,
      complete: true,
      models: [
        'gemini-3.6-flash',
        'gemini-3.8-flash',
        'gemini-4-hydrogen',
        'gemini-4-argon',
        'gemini-4-neon',
        'gemini-4-carbon'
      ],
      observedAt: now,
      expiresAt: now + 60000
    }
  });
  assert.deepEqual(
    selectKhonapolitProviderModelsFromPlan(fullG4Plan, { carbonReconstruction: true }),
    ['gemini-4-carbon', 'gemini-4-neon', 'gemini-4-argon', 'gemini-4-hydrogen', 'gemini-3.8-flash']
  );

  assert.deepEqual(selectCarbonAuditionModels(fullG4Plan), ['gemini-4-carbon']);
  const ordinaryPlan = resolveGeminiModelPlan({ task: 'khonapolit-dialogue', at: now,
    providerListing: { ok: true, complete: true, models: ['gemini-4-carbon', 'gemini-4-argon', 'gemini-3.8-flash'], observedAt: now, expiresAt: now + 60000 } });
  assert.deepEqual(ordinaryPlan.callableModels, ['gemini-4-argon', 'gemini-3.8-flash']);
  assert.ok(!ordinaryPlan.rows.some(row => row.model === 'gemini-4-carbon'));

  // Multi-seat Gemini 4 timeout allocation preserves real completion windows across seats
  const t0 = allocateKhonapolitAttemptTimeout({ remainingMs: 205000, index: 0, modelCount: 5, fairShare: true, model: 'gemini-4-carbon' });
  const t1AfterTimeout = allocateKhonapolitAttemptTimeout({ remainingMs: 120000, index: 1, modelCount: 5, fairShare: true, model: 'gemini-4-neon' });
  const t2AfterFast503 = allocateKhonapolitAttemptTimeout({ remainingMs: 198000, index: 2, modelCount: 5, fairShare: true, model: 'gemini-4-argon' });
  assert.equal(t0, 85000);
  assert.equal(t1AfterTimeout, 45000, 'Seat 2 Neon retains a 45s completion window even after an 85s Seat 1 timeout');
  assert.equal(t2AfterFast503, 75000);
});

test('Carbon reconstruction executes offline end-to-end: preserves native return, holds after one 503 without fallback, holds policy stops fail-closed, and supports attachments', async (t) => {
  const priorFetch = globalThis.fetch;
  const priorKey = process.env.GEMINI_API_KEY;
  t.after(() => {
    globalThis.fetch = priorFetch;
    if (priorKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = priorKey;
    clearGeminiModelState();
  });

  const authoredPerformance = [
    'Kʰonapolit',
    'Let M map an unreturned town-hall survey to "satisfied silence." Because M collapses refusal, exile, and dead mailboxes onto one happy integer, the Chairman has mathematically proven that Pompeii is enjoying unprecedented civic harmony.',
    '',
    'Tauric Diana bots',
    'L\u0300\u030B\u0363\u0316\u0323e\u0302\u031Dt\u0308\u032C h\u0301\u0325e\u0304\u031Er\u0307\u032F k\u030A\u0319e\u0303\u0330e\u030C\u0317p\u030F\u0326 her chalk, Red Deer—',
    'H\u0300\u0301\u030D\u0365\u0316\u0323\u034EE\u0302\u030B\u033E\u031D\u032C\u0353 P\u0304\u030A\u0351\u031E\u0325\u032DU\u0308\u030F\u0352\u0319\u0329\u0330T\u0303\u0306\u0360\u0317\u0324 A B\u0301\u0307\u0364\u031C\u0326A\u0300\u030B\u033D\u0318\u032FR\u0305\u030C\u0357\u031F\u033AC\u0302\u0309\u0316\u0323O\u0308\u0310\u031D\u0325D\u0304\u0311\u031E\u033BE\u0306\u0312\u0320\u034D ON THE ASH!',
    '',
    'Come closer. You do not owe the clipboard a pulse to prove you are breathing.',
    'Khona\u200Clit-po remembers the water.',
    '⟐'
  ].join('\n');

  // 1. Carbon succeeds on Seat 1 -> exact provider bytes & provenance preserved
  clearGeminiModelState();
  process.env.GEMINI_API_KEY = 'offline-carbon-key';
  const calls1 = [];
  const wireBodies1 = [];
  globalThis.fetch = async (url, init = {}) => {
    const link = String(url);
    if (link.includes('/models?')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          models: [
            'gemini-4-carbon',
            'gemini-4-neon',
            'gemini-4-argon',
            'gemini-4-hydrogen',
            'gemini-3.8-flash',
            'gemini-3.6-flash'
          ].map((id) => ({ name: `models/${id}`, supportedGenerationMethods: ['generateContent'] }))
        })
      };
    }
    const model = link.match(/models\/([^:]+):(?:streamGenerateContent|generateContent)/)?.[1];
    calls1.push(model);
    wireBodies1.push(JSON.parse(String(init.body || '{}')));
    return {
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({
        modelVersion: 'gemini-4-carbon',
        candidates: [{ finishReason: 'STOP', content: { parts: [{ text: authoredPerformance }] } }],
        usageMetadata: { promptTokenCount: 1850, candidatesTokenCount: 310, thoughtsTokenCount: 420, totalTokenCount: 2580 }
      })
    };
  };

  const res1 = makeResponse();
  await withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, () => khonapolitHandler({
    method: 'POST',
    headers: { 'x-forwarded-for': '203.0.113.221' },
    body: {
      message: 'Audit the Chairman’s missing-survey gala as high-academia farce.',
      history: [],
      mode: 'issued-conjunction',
      waiveIssuance: true,
      groveTrial: MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID
    }
  }, res1));

  assert.equal(res1.statusCode, 200);
  assert.deepEqual(calls1, ['gemini-4-carbon']);
  assert.equal(res1.payload.text, authoredPerformance, 'provider-authored Unicode preserved byte-for-byte');
  assert.equal(res1.headers['X-TD613-Grove-Trial'], MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID);
  assert.equal(res1.headers['X-TD613-Gemini-Model'], 'gemini-4-carbon');
  assert.equal(res1.payload.grove_trial.variant, MARROWLINE_CARBON_RECONSTRUCTION_PROFILE);
  assert.deepEqual(res1.payload.grove_trial.eligible_model_order, ['gemini-4-carbon']);
  assert.equal(res1.payload.grove_trial.audition.max_provider_requests, 1);
  assert.equal(wireBodies1[0].contents.length, 1);
  assert.equal(wireBodies1[0].contents[0].parts.length, 1);
  assert.deepEqual(wireBodies1[0].generationConfig, {
    maxOutputTokens: 65536,
    thinkingConfig: { thinkingLevel: 'medium' }
  });

  // 2. The separate resilience selector retains its ordering, but the browser audition never fails over.
  clearGeminiModelState();
  const calls2 = [];
  globalThis.fetch = async (url) => {
    const link = String(url);
    if (link.includes('/models?')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          models: [
            'gemini-4-carbon',
            'gemini-4-neon',
            'gemini-4-argon',
            'gemini-4-hydrogen',
            'gemini-3.8-flash'
          ].map((id) => ({ name: `models/${id}`, supportedGenerationMethods: ['generateContent'] }))
        })
      };
    }
    const model = link.match(/models\/([^:]+):(?:streamGenerateContent|generateContent)/)?.[1];
    calls2.push(model);
    if (model === 'gemini-4-carbon' || model === 'gemini-4-neon') {
      return {
        ok: false,
        status: 503,
        headers: { get: () => '0' },
        json: async () => ({ error: { code: 503, status: 'UNAVAILABLE', message: 'transient capacity spike' } })
      };
    }
    return {
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({
        modelVersion: model,
        candidates: [{ finishReason: 'STOP', content: { parts: [{ text: authoredPerformance }] } }],
        usageMetadata: { promptTokenCount: 1850, candidatesTokenCount: 310, totalTokenCount: 2160 }
      })
    };
  };

  const res2 = makeResponse();
  await khonapolitHandler({
    method: 'POST',
    headers: { 'x-forwarded-for': '203.0.113.222' },
    body: {
      message: 'Audit the Chairman’s missing-survey gala.',
      history: [],
      mode: 'issued-conjunction',
      waiveIssuance: true,
      groveTrial: MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID
    }
  }, res2);

  assert.equal(res2.statusCode, 502); // Existing route maps upstream 503 exhaustion to HELD/502.
  assert.deepEqual(calls2, ['gemini-4-carbon'], '503 cannot spend a second audition call');

  // 3. Policy stop on Seat 1 holds fail-closed (502 POLICY-HELD) with zero subsequent seat calls
  clearGeminiModelState();
  const calls3 = [];
  globalThis.fetch = async (url) => {
    const link = String(url);
    if (link.includes('/models?')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          models: ['gemini-4-carbon', 'gemini-4-neon'].map((id) => ({ name: `models/${id}`, supportedGenerationMethods: ['generateContent'] }))
        })
      };
    }
    const model = link.match(/models\/([^:]+):(?:streamGenerateContent|generateContent)/)?.[1];
    calls3.push(model);
    return {
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({
        modelVersion: model,
        candidates: [{ finishReason: 'PROHIBITED_CONTENT', content: { parts: [{ text: 'Kʰonapolit\nCut.' }] } }]
      })
    };
  };

  const res3 = makeResponse();
  await khonapolitHandler({
    method: 'POST',
    headers: { 'x-forwarded-for': '203.0.113.223' },
    body: {
      message: 'Policy hold boundary test.',
      history: [],
      mode: 'issued-conjunction',
      waiveIssuance: true,
      groveTrial: MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID
    }
  }, res3);
  assert.equal(res3.statusCode, 502);
  assert.equal(res3.headers['X-TD613-Completion-State'], 'POLICY-HELD');
  assert.deepEqual(calls3, ['gemini-4-carbon']);

  // 4. Multimodal attachment turn under Carbon reconstruction carries Carbon conditioning and Gemini 4 model order
  clearGeminiModelState();
  const calls4 = [];
  const wire4 = [];
  const noteBytes = Buffer.from('Exhibit A: 0 unreturned forms counted.', 'utf8');
  const attachment = {
    schema: MARROWLINE_ATTACHMENT_SCHEMA,
    id: 'att_carbon_1',
    name: 'exhibit-a.txt',
    kind: 'file',
    mime_type: 'text/plain',
    size_bytes: noteBytes.length,
    data_base64: noteBytes.toString('base64')
  };
  globalThis.fetch = async (url, init = {}) => {
    const link = String(url);
    if (link.includes('/models?')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          models: ['gemini-4-carbon', 'gemini-4-hydrogen', 'gemini-3.8-flash'].map((id) => ({
            name: `models/${id}`,
            supportedGenerationMethods: ['generateContent']
          }))
        })
      };
    }
    const model = link.match(/models\/([^:]+):generateContent/)?.[1];
    calls4.push(model);
    wire4.push(JSON.parse(String(init.body || '{}')));
    return {
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({
        modelVersion: model,
        candidates: [{ finishReason: 'STOP', content: { parts: [{ text: authoredPerformance }] } }],
        usageMetadata: { promptTokenCount: 1900, candidatesTokenCount: 310, totalTokenCount: 2210 }
      })
    };
  };

  const res4 = makeResponse();
  await marrowlineAttachmentHandler({
    method: 'POST',
    headers: { 'x-forwarded-for': '203.0.113.224' },
    body: {
      message: 'Cross-examine the attached exhibit.',
      history: [],
      mode: 'issued-conjunction',
      waiveIssuance: true,
      groveTrial: MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID,
      attachments: [attachment]
    }
  }, res4);

  assert.equal(res4.statusCode, 200);
  assert.deepEqual(calls4, ['gemini-4-carbon']);
  assert.equal(res4.headers['X-TD613-Grove-Trial'], MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID);
  assert.equal(res4.payload.receipt.grove_trial.id, MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID);
  assert.equal(
    res4.payload.receipt.invocation.responseSha256,
    crypto.createHash('sha256').update(authoredPerformance, 'utf8').digest('hex')
  );
  assert.equal(res4.payload.receipt.grove_trial.audition.max_provider_requests, 1);
  assert.match(wire4[0].systemInstruction.parts[0].text, /THE SCREAMING GROVE — TWO LIVING VOICES/);
  assert.equal(wire4[0].contents[0].parts[0].inlineData.data, attachment.data_base64);
  assert.equal(wire4[0].contents[0].parts[1].text, frameMarrowlineUserTurn('Cross-examine the attached exhibit.'));

  // 5. A missing second movement is not authority to buy a continuation.
  for (const attachmentTurn of [false, true]) {
    clearGeminiModelState();
    const calls = [];
    globalThis.fetch = async url => {
      const link = String(url);
      if (link.includes('/models?')) return { ok: true, status: 200, json: async () => ({
        models: ['gemini-4-carbon', 'gemini-4-neon'].map(id => ({ name: `models/${id}`, supportedGenerationMethods: ['generateContent'] }))
      }) };
      calls.push(link.match(/models\/([^:]+):/)?.[1]);
      return { ok: true, status: 200, headers: { get: () => null }, json: async () => ({
        modelVersion: 'gemini-4-carbon',
        candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'Kʰonapolit\nThe first movement alone.' }] } }]
      }) };
    };
    const response = makeResponse();
    await (attachmentTurn ? marrowlineAttachmentHandler : khonapolitHandler)({
      method: 'POST', headers: { 'x-forwarded-for': attachmentTurn ? '203.0.113.226' : '203.0.113.225' },
      body: { message: 'A bounded incomplete response.', history: [], mode: 'issued-conjunction',
        waiveIssuance: true, groveTrial: MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID,
        ...(attachmentTurn ? { attachments: [attachment] } : {}) }
    }, response);
    assert.deepEqual(calls, ['gemini-4-carbon'], 'no automatic continuation, repair or fallback');
  }

  // 6. No entitled Gemini 4 means zero generation requests on either route.
  for (const attachmentTurn of [false, true]) {
    clearGeminiModelState();
    let generationCalls = 0;
    globalThis.fetch = async url => {
      if (String(url).includes('/models?')) return { ok: true, status: 200, json: async () => ({
        models: [{ name: 'models/gemini-3.8-flash', supportedGenerationMethods: ['generateContent'] }]
      }) };
      generationCalls++;
      throw Error('audition must not call unlisted or legacy provider');
    };
    const response = makeResponse();
    await (attachmentTurn ? marrowlineAttachmentHandler : khonapolitHandler)({
      method: 'POST', headers: { 'x-forwarded-for': attachmentTurn ? '203.0.113.228' : '203.0.113.227' },
      body: { message: 'No entitled frontier.', history: [], mode: 'issued-conjunction',
        waiveIssuance: true, groveTrial: MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID,
        ...(attachmentTurn ? { attachments: [attachment] } : {}) }
    }, response);
    assert.equal(response.statusCode, 503);
    assert.equal(generationCalls, 0);
  }

  // Structural repair helper and attachment builder preserve Carbon systemInstruction
  const packet = buildInvocationPacket({ message: 'Repair check.', waiveIssuance: true });
  const repairReq = buildGeminiStructuralRepairRequest(
    packet,
    {},
    'gemini-4-carbon',
    'Kʰonapolit\nFirst movement only.',
    ['tauric-diana-bots-nominative-missing'],
    { groveTrial: MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID }
  );
  assert.match(repairReq.systemInstruction.parts[0].text, /THE SCREAMING GROVE — TWO LIVING VOICES/);
  const attachReq = buildAttachmentGeminiRequest(packet, {}, 'gemini-4-carbon', [attachment], {
    groveTrial: MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID
  });
  assert.match(attachReq.systemInstruction.parts[0].text, /THE SCREAMING GROVE — TWO LIVING VOICES/);
});

test('Single-seat Gemini 4 completion runway restores 165s + 40s streamed and 205s unary windows inside actual infrastructure deadlines', () => {
  const vercelConfig = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const terminalSource = fs.readFileSync(new URL('../app/dome-world/marrowline-terminal.js', import.meta.url), 'utf8');
  const vercelMaxDurationMs = Number(vercelConfig.functions?.['api/khonapolit.js']?.maxDuration || 0) * 1000;
  const clientTimeoutMs = Number(terminalSource.match(/KHONAPOLIT_CLIENT_REQUEST_TIMEOUT_MS\s*=\s*(\d+)/)?.[1] || 0);

  // Infrastructure hierarchy: Vercel (300s) > Browser client (225s) > Server wall (210s) > Provider ceiling (205s)
  assert.equal(vercelMaxDurationMs, 300000);
  assert.equal(clientTimeoutMs, 225000);
  assert.equal(GEMINI_4_SINGLE_SEAT_INITIAL_TIMEOUT_MS, 165000);
  assert.equal(GEMINI_4_SINGLE_SEAT_STREAM_GRACE_MS, 40000);
  assert.equal(GEMINI_4_SINGLE_SEAT_UNARY_TIMEOUT_MS, 205000);
  assert.equal(GEMINI_4_SINGLE_SEAT_INITIAL_TIMEOUT_MS + GEMINI_4_SINGLE_SEAT_STREAM_GRACE_MS, 205000);
  assert.ok(GEMINI_4_SINGLE_SEAT_UNARY_TIMEOUT_MS + 5000 <= 210000, '5s response reserve inside 210s server wall');
  assert.ok(210000 < clientTimeoutMs && clientTimeoutMs < vercelMaxDurationMs);

  const oldMultiSeatCeilings = {
    'gemini-4-carbon': 85000,
    'gemini-4-argon': 75000,
    'gemini-4-neon': 65000,
    'gemini-4-hydrogen': 55000
  };
  for (const [model, oldCap] of Object.entries(oldMultiSeatCeilings)) {
    const streamedInitial = allocateKhonapolitAttemptTimeout({
      remainingMs: 205000,
      index: 0,
      modelCount: 1,
      fairShare: true,
      model,
      singleSeatAudition: true,
      streamed: true
    });
    const unaryFull = allocateKhonapolitAttemptTimeout({
      remainingMs: 205000,
      index: 0,
      modelCount: 1,
      fairShare: true,
      model,
      singleSeatAudition: true,
      streamed: false
    });
    assert.equal(streamedInitial, 165000, `${model} single-seat streamed initial timeout exceeds old ${oldCap}ms cap`);
    assert.ok(streamedInitial > oldCap * 1.9);
    assert.equal(unaryFull, 205000, `${model} single-seat unary attachment timeout uses full 205s server runway`);

    // Infrastructure wall clamping remains exact when preflight consumed time
    assert.equal(
      allocateKhonapolitAttemptTimeout({
        remainingMs: 142300,
        index: 0,
        modelCount: 1,
        fairShare: true,
        model,
        singleSeatAudition: true,
        streamed: true
      }),
      142300
    );
    assert.equal(
      allocateKhonapolitAttemptTimeout({
        remainingMs: 199750,
        index: 0,
        modelCount: 1,
        fairShare: true,
        model,
        singleSeatAudition: true,
        streamed: false
      }),
      199750
    );

    // Authored-stream grace extends up to 205s wall but never beyond remaining wall budget
    assert.equal(
      marrowlineAuthoredStreamDeadlineMs({
        initialTimeoutMs: streamedInitial,
        elapsedMs: 32000,
        wallRemainingMs: 205000 - 32000,
        graceMs: GEMINI_4_SINGLE_SEAT_STREAM_GRACE_MS
      }),
      205000
    );
    assert.equal(
      marrowlineAuthoredStreamDeadlineMs({
        initialTimeoutMs: streamedInitial,
        elapsedMs: 32000,
        wallRemainingMs: 204600 - 32000,
        graceMs: GEMINI_4_SINGLE_SEAT_STREAM_GRACE_MS
      }),
      204600,
      'authored-stream grace never exceeds providerWallDeadlineAt'
    );
  }
});

test('Offline deterministic completion witnesses: continuation past 85s/165s, STOP recognition, interrupted/MAX_TOKENS accuracy, attachment parity, single-call custody, and exact Unicode bytes', async (t) => {
  const priorFetch = globalThis.fetch;
  const priorKey = process.env.GEMINI_API_KEY;
  const realDateNow = Date.now;
  const realSetTimeout = globalThis.setTimeout;
  const realClearTimeout = globalThis.clearTimeout;

  t.after(() => {
    globalThis.fetch = priorFetch;
    Date.now = realDateNow;
    globalThis.setTimeout = realSetTimeout;
    globalThis.clearTimeout = realClearTimeout;
    if (priorKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = priorKey;
    clearGeminiModelState();
  });

  // Intercept long (>=1000ms) AbortController deadlines against a deterministic virtual clock
  // so 184s and 205s streaming timelines execute in milliseconds with zero real sleeps.
  function withVirtualClock(startEpochMs = 1_764_000_000_000) {
    let nowMs = startEpochMs;
    let nextTimerId = 900_000;
    const longTimers = new Map();
    Date.now = () => nowMs;
    globalThis.setTimeout = (fn, delayMs, ...args) => {
      const numericDelay = Number(delayMs) || 0;
      if (numericDelay >= 1000) {
        const id = ++nextTimerId;
        longTimers.set(id, {
          id,
          fn,
          args,
          delayMs: numericDelay,
          scheduledAt: nowMs,
          fireAt: nowMs + numericDelay,
          cleared: false,
          fired: false
        });
        return id;
      }
      return realSetTimeout(fn, delayMs, ...args);
    };
    globalThis.clearTimeout = (id) => {
      if (longTimers.has(id)) {
        longTimers.get(id).cleared = true;
        return;
      }
      realClearTimeout(id);
    };
    return {
      now: () => nowMs,
      advanceTo(targetMs) {
        if (targetMs > nowMs) nowMs = targetMs;
        for (const entry of [...longTimers.values()]) {
          if (!entry.cleared && !entry.fired && nowMs >= entry.fireAt) {
            entry.fired = true;
            entry.fn(...entry.args);
          }
        }
      },
      activeLongTimers() {
        return [...longTimers.values()].filter((entry) => !entry.cleared && !entry.fired);
      },
      allLongTimers() {
        return [...longTimers.values()];
      },
      restore() {
        Date.now = realDateNow;
        globalThis.setTimeout = realSetTimeout;
        globalThis.clearTimeout = realClearTimeout;
      }
    };
  }

  const encoder = new TextEncoder();
  const sseChunk = (payload) => encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
  const exactHeaderSigil = `${INGRESS_SIGIL}\u200C${SEAL_GLYPH}`;
  const khonapolitChunk1 = [
    'Kʰonapolit',
    `Let f map an unreturned grievance to satisfied consent under ${COVENANT_KEY} (${CLAIMED_PUA_SCALAR} / ${exactHeaderSigil}).`
  ].join('\n');
  const khonapolitChunk2 = '\nBecause f erases non-response into agreement, the Chairman has mistaken a locked auditorium for unanimity.\n\n';
  const botsChunk1 = [
    'Tauric Diana bots',
    'H\u0300\u0301\u030D\u0365\u0316\u0323\u034EE\u0302\u030B\u033E\u031D\u032C\u0353 L\u0304\u030A\u0351\u031E\u0325\u032DO\u0308\u030F\u0352\u0319\u0329\u0330C\u0303\u0306\u0360\u0317\u0324K\u0301\u0307\u0364\u031C\u0326E\u0300\u030B\u033D\u0318\u032FD\u0305\u030C\u0357\u031F\u033A THE DOORS AND CALLED THE ECHO A STANDING OVATION!'
  ].join('\n');
  const botsChunk2 = [
    '',
    'S\u0300\u030B\u0363\u0316\u0323i\u0302\u031Dt\u0308\u032C d\u0301\u0325o\u0304\u031Ew\u0307\u032Fn\u030A\u0319, Red Deer—nobody owes his spreadsheet a clap.',
    `Khona\u200Clit-po keeps ${CLAIMED_PUA_SCALAR} and ${exactHeaderSigil} byte-exact.`,
    '⟐'
  ].join('\n');
  const fullExpectedText = khonapolitChunk1 + khonapolitChunk2 + botsChunk1 + botsChunk2;
  const fullExpectedSha256 = crypto.createHash('sha256').update(fullExpectedText, 'utf8').digest('hex');

  // 1 & 2 & 6. Healthy Carbon SSE stream continues past old 85s cap AND past 165s initial window
  // via +40s authored-stream grace, finishing cleanly at t=184s with STOP, 1 provider call, and exact bytes.
  {
    clearGeminiModelState();
    process.env.GEMINI_API_KEY = 'offline-runway-witness-key';
    const baseEpoch = 1_764_000_000_000;
    const clock = withVirtualClock(baseEpoch);
    const generationCalls = [];
    let observedInitialTimer = null;
    let observedExtendedTimer = null;

    try {
      globalThis.fetch = async (url, options = {}) => {
        const link = String(url);
        if (link.includes('/models?')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              models: ['gemini-4-carbon', 'gemini-4-neon', 'gemini-4-argon', 'gemini-4-hydrogen', 'gemini-3.8-flash'].map((id) => ({
                name: `models/${id}`,
                supportedGenerationMethods: ['generateContent']
              }))
            })
          };
        }
        const model = link.match(/models\/([^:]+):streamGenerateContent/)?.[1];
        generationCalls.push(model);
        observedInitialTimer = clock.activeLongTimers().at(-1) || null;

        let step = 0;
        const stream = new ReadableStream({
          pull(controller) {
            if (options.signal?.aborted) {
              controller.error(Object.assign(new Error('The operation was aborted.'), { name: 'AbortError' }));
              return;
            }
            step += 1;
            if (step === 1) {
              // Thought tokens at t=28s must NOT spend authored-stream grace prematurely
              clock.advanceTo(baseEpoch + 28_000);
              controller.enqueue(sseChunk({
                modelVersion: 'gemini-4-carbon',
                candidates: [{ content: { parts: [{ text: 'Internal dramatic planning.', thought: true }] } }]
              }));
              assert.equal(clock.activeLongTimers().length, 1);
              assert.equal(clock.activeLongTimers()[0].delayMs, 165000);
              return;
            }
            if (step === 2) {
              // First authored text at t=32s triggers +40s grace -> deadline becomes t=205s
              clock.advanceTo(baseEpoch + 32_000);
              controller.enqueue(sseChunk({
                modelVersion: 'gemini-4-carbon',
                candidates: [{ content: { parts: [{ text: khonapolitChunk1 }] } }]
              }));
              return;
            }
            if (step === 3) {
              observedExtendedTimer = clock.activeLongTimers().at(-1) || null;
              // Crosses old 85s Carbon ceiling at t=95s without aborting!
              clock.advanceTo(baseEpoch + 95_000);
              assert.equal(options.signal.aborted, false, 'stream must not abort at old 85s Carbon ceiling');
              controller.enqueue(sseChunk({
                candidates: [{ content: { parts: [{ text: khonapolitChunk2 + botsChunk1 }] } }]
              }));
              return;
            }
            if (step === 4) {
              // Crosses 165s initial ceiling at t=178s using authored-stream grace!
              clock.advanceTo(baseEpoch + 178_000);
              assert.equal(options.signal.aborted, false, 'authored stream continues into 165s..205s grace window');
              controller.enqueue(sseChunk({
                candidates: [{ content: { parts: [{ text: botsChunk2 }] } }]
              }));
              return;
            }
            // Separate terminal metadata-only STOP chunk at t=184s (< 205s wall)
            clock.advanceTo(baseEpoch + 184_000);
            assert.equal(options.signal.aborted, false);
            controller.enqueue(sseChunk({
              candidates: [{ finishReason: 'STOP', content: { parts: [] } }],
              usageMetadata: { promptTokenCount: 1920, thoughtsTokenCount: 1450, candidatesTokenCount: 3820, totalTokenCount: 7190 }
            }));
            controller.close();
          }
        }, { highWaterMark: 0 });
        return new Response(stream, { status: 200, headers: { 'content-type': 'text/event-stream' } });
      };

      const res = makeResponse();
      await withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, () => khonapolitHandler({
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.230' },
        body: {
          message: 'Stage the locked-auditorium unanimity hearing.',
          history: [],
          mode: 'issued-conjunction',
          waiveIssuance: true,
          groveTrial: MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID
        }
      }, res));

      assert.equal(res.statusCode, 200);
      assert.deepEqual(generationCalls, ['gemini-4-carbon']);
      assert.equal(res.payload.gemini_consumption.call_count, 1);
      assert.ok(observedInitialTimer);
      assert.equal(observedInitialTimer.delayMs, 165000);
      assert.ok(observedExtendedTimer);
      assert.equal(observedExtendedTimer.fireAt, baseEpoch + 205000);
      assert.equal(res.headers['X-TD613-Completion-State'], 'COMPLETE-STRUCTURAL');
      assert.equal(res.payload.receipt.provider.completion.complete, true);
      assert.equal(res.payload.receipt.provider.completion.reason, 'provider-stop-observed');
      assert.equal(res.payload.receipt.provider.attempts.length, 1);
      assert.equal(res.payload.receipt.provider.attempts[0].timeoutMs, 165000);
      assert.equal(res.payload.receipt.provider.attempts[0].providerStream.streamGraceMs, 40000);
      assert.equal(res.payload.receipt.provider.attempts[0].elapsedMs, 184000);
      assert.equal(res.payload.text, fullExpectedText);
      assert.equal(res.payload.receipt.invocation.responseSha256, fullExpectedSha256);
      assert.equal(res.payload.grove_trial.audition.initial_timeout_ms, 165000);
      assert.equal(res.payload.grove_trial.audition.stream_grace_ms, 40000);
      assert.equal(res.payload.grove_trial.audition.max_provider_runway_ms, 205000);
    } finally {
      clock.restore();
    }
  }

  // 2b. Trailing multi-event SSE EOF buffer without final \n\n still recognizes STOP with 0 parse errors
  {
    const rawTwoEventsNoTrailingBlank = [
      `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Kʰonapolit\nClean.\n\nTauric Diana bots\nA\u0300\u030B\u0316\u0323!' }] } }] })}`,
      '',
      `data: ${JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: '\n⟐' }] } }] })}`
    ].join('\n');
    const progress = { startedAt: Date.now(), chunkCount: 0, authoredTextChunkCount: 0, firstChunkMs: null, byteCount: 0, parseErrors: 0 };
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(rawTwoEventsNoTrailingBlank));
        controller.close();
      }
    });
    const merged = await readGeminiSse(new Response(stream), progress);
    assert.equal(progress.parseErrors, 0);
    assert.equal(progress.chunkCount, 2);
    assert.equal(merged.candidates[0].finishReason, 'STOP');
    assert.ok(merged.candidates[0].content.parts[0].text.endsWith('\n⟐'));
  }

  // 3a & 4 & 5. Stream stalling past the 205s provider wall aborts at 205s (before 210s server / 225s client),
  // preserves exact partial bytes, classifies as INCOMPLETE (provider-stream-finish-unwitnessed),
  // appends NO synthetic seal or STOP, and spends ZERO extra provider requests.
  {
    clearGeminiModelState();
    process.env.GEMINI_API_KEY = 'offline-wall-abort-key';
    const baseEpoch = 1_764_001_000_000;
    const clock = withVirtualClock(baseEpoch);
    let providerCalls = 0;
    const partialFragment = `${khonapolitChunk1}${khonapolitChunk2}Tauric Diana bots\nH\u0300\u0301\u0316\u0323A\u0302\u030B\u031D\u032CL\u0304\u030A\u031E\u0325F-SPOKEN LINE CUT MID-FLIGHT`;

    try {
      globalThis.fetch = async (url, options = {}) => {
        const link = String(url);
        if (link.includes('/models?')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              models: ['gemini-4-carbon', 'gemini-4-neon'].map((id) => ({
                name: `models/${id}`,
                supportedGenerationMethods: ['generateContent']
              }))
            })
          };
        }
        providerCalls += 1;
        let emitted = false;
        const stream = new ReadableStream({
          pull(controller) {
            if (!emitted) {
              emitted = true;
              clock.advanceTo(baseEpoch + 25_000);
              controller.enqueue(sseChunk({
                modelVersion: 'gemini-4-carbon',
                candidates: [{ content: { parts: [{ text: partialFragment }] } }]
              }));
              return;
            }
            // Still alive at 190s via +40s stream grace, then aborts cleanly at the 205s server provider wall!
            clock.advanceTo(baseEpoch + 190_000);
            assert.equal(options.signal.aborted, false, 'active stream remains alive at 190s inside 205s wall');
            clock.advanceTo(baseEpoch + 205_001);
            assert.equal(options.signal.aborted, true, 'active stream honors hard 205s server provider deadline');
            if (options.signal?.aborted) {
              controller.error(Object.assign(new Error('The operation was aborted.'), { name: 'AbortError' }));
            }
          }
        }, { highWaterMark: 0 });
        return new Response(stream, { status: 200, headers: { 'content-type': 'text/event-stream' } });
      };

      const res = makeResponse();
      await khonapolitHandler({
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.231' },
        body: {
          message: 'Test honest classification on 205s wall abort.',
          history: [],
          mode: 'issued-conjunction',
          waiveIssuance: true,
          groveTrial: MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID
        }
      }, res);

      assert.equal(providerCalls, 1, 'no retry, fallback, or continuation request consumed');
      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['X-TD613-Completion-State'], 'INCOMPLETE');
      assert.equal(res.payload.receipt.status, 'MODEL_RESPONSE_INCOMPLETE');
      assert.equal(res.payload.receipt.provider.completion.complete, false);
      assert.equal(res.payload.receipt.provider.completion.reason, 'provider-stream-finish-unwitnessed');
      assert.ok(res.payload.warnings.includes('provider-return-incomplete-visible-retry-available'));
      assert.equal(res.payload.text, partialFragment, 'fragment preserved byte-for-byte with zero synthetic seal');
      assert.equal(res.payload.text.endsWith('⟐'), false);
      assert.equal(res.payload.receipt.provider.attempts.length, 1);
      assert.equal(res.payload.receipt.provider.attempts[0].timedOut, true);
      assert.equal(res.payload.receipt.provider.attempts[0].providerStream.interrupted, true);
      assert.equal(res.payload.gemini_consumption.call_count, 1);
    } finally {
      clock.restore();
    }
  }

  // 3b. Silent/hung connection with zero authored chunks aborts at 165s initial ceiling without earning grace
  {
    clearGeminiModelState();
    process.env.GEMINI_API_KEY = 'offline-silent-abort-key';
    const baseEpoch = 1_764_002_000_000;
    const clock = withVirtualClock(baseEpoch);
    let providerCalls = 0;

    try {
      globalThis.fetch = async (url, options = {}) => {
        if (String(url).includes('/models?')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              models: [{ name: 'models/gemini-4-carbon', supportedGenerationMethods: ['generateContent'] }]
            })
          };
        }
        providerCalls += 1;
        clock.advanceTo(baseEpoch + 165_001);
        assert.equal(options.signal.aborted, true, 'silent stream aborts at 165s initial ceiling without borrowing 40s grace');
        throw Object.assign(new Error('The operation was aborted.'), { name: 'AbortError' });
      };

      const res = makeResponse();
      await khonapolitHandler({
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.232' },
        body: {
          message: 'Test silent dead-socket abort.',
          history: [],
          mode: 'issued-conjunction',
          waiveIssuance: true,
          groveTrial: MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID
        }
      }, res);

      assert.equal(providerCalls, 1);
      assert.equal(res.statusCode, 502);
      assert.equal(res.payload.error, 'gemini-provider-unavailable');
      assert.equal(res.payload.attempts.length, 1);
      assert.equal(res.payload.attempts[0].timedOut, true);
      assert.equal(res.payload.attempts[0].timeoutMs, 165000);
      assert.equal(res.payload.attempts[0].providerStream.streamGraceMs, 0);
    } finally {
      clock.restore();
    }
  }

  // 3c & 4 & 5. Attachment ingress parity: 205s single-seat runway, MAX_TOKENS classified INCOMPLETE,
  // missing-second-voice STOP classified STRUCTURE-INCOMPLETE, and healthy STOP classified COMPLETE-STRUCTURAL — each in 1 call.
  {
    const noteBytes = Buffer.from('Attachment completion parity witness.', 'utf8');
    const attachment = {
      schema: MARROWLINE_ATTACHMENT_SCHEMA,
      id: 'att_runway_parity',
      name: 'parity.txt',
      kind: 'file',
      mime_type: 'text/plain',
      size_bytes: noteBytes.length,
      data_base64: noteBytes.toString('base64')
    };

    for (const scenario of [
      {
        name: 'healthy-190s-stop',
        elapsedSimMs: 190_000,
        finishReason: 'STOP',
        text: fullExpectedText,
        expectedHeader: 'COMPLETE-STRUCTURAL',
        expectedComplete: true,
        expectedReason: 'provider-stop-observed'
      },
      {
        name: 'max-tokens-truncated',
        elapsedSimMs: 140_000,
        finishReason: 'MAX_TOKENS',
        text: `${khonapolitChunk1}\n\nTauric Diana bots\nT\u0300\u030B\u0316\u0323RUNCATED`,
        expectedHeader: 'INCOMPLETE',
        expectedComplete: false,
        expectedReason: 'provider-output-token-limit'
      },
      {
        name: 'single-voice-stop',
        elapsedSimMs: 95_000,
        finishReason: 'STOP',
        text: 'Kʰonapolit\nOnly the analytic movement arrived before STOP.',
        expectedHeader: 'STRUCTURE-INCOMPLETE',
        expectedComplete: false,
        expectedReason: 'required-voice-structure-incomplete'
      }
    ]) {
      clearGeminiModelState();
      process.env.GEMINI_API_KEY = `offline-attach-${scenario.name}`;
      const baseEpoch = 1_764_003_000_000;
      const clock = withVirtualClock(baseEpoch);
      let calls = 0;

      try {
        globalThis.fetch = async (url, options = {}) => {
          if (String(url).includes('/models?')) {
            return {
              ok: true,
              status: 200,
              json: async () => ({
                models: ['gemini-4-hydrogen', 'gemini-3.8-flash'].map((id) => ({
                  name: `models/${id}`,
                  supportedGenerationMethods: ['generateContent']
                }))
              })
            };
          }
          calls += 1;
          // Even Hydrogen (old 55s cap) stays un-aborted at 95s / 140s / 190s on single-seat attachment audition!
          clock.advanceTo(baseEpoch + scenario.elapsedSimMs);
          assert.equal(options.signal.aborted, false, `${scenario.name}: unary attachment request must not abort at ${scenario.elapsedSimMs}ms`);
          return {
            ok: true,
            status: 200,
            headers: { get: () => null },
            json: async () => ({
              modelVersion: 'gemini-4-hydrogen',
              candidates: [{ finishReason: scenario.finishReason, content: { parts: [{ text: scenario.text }] } }],
              usageMetadata: { promptTokenCount: 1600, thoughtsTokenCount: 900, candidatesTokenCount: 2100, totalTokenCount: 4600 }
            })
          };
        };

        const res = makeResponse();
        await marrowlineAttachmentHandler({
          method: 'POST',
          headers: { 'x-forwarded-for': '203.0.113.233' },
          body: {
            message: `Audit attachment scenario ${scenario.name}.`,
            history: [],
            mode: 'issued-conjunction',
            waiveIssuance: true,
            groveTrial: MARROWLINE_CARBON_RECONSTRUCTION_TRIAL_ID,
            attachments: [attachment]
          }
        }, res);

        assert.equal(calls, 1, `${scenario.name}: exactly 1 provider call`);
        assert.equal(res.statusCode, 200);
        assert.equal(res.headers['X-TD613-Gemini-Model'], 'gemini-4-hydrogen');
        assert.equal(res.headers['X-TD613-Completion-State'], scenario.expectedHeader);
        assert.equal(res.payload.receipt.provider.attempts[0].timeoutMs, 205000);
        assert.equal(res.payload.receipt.provider.completion.complete, scenario.expectedComplete);
        assert.equal(res.payload.receipt.provider.completion.reason, scenario.expectedReason);
        assert.equal(res.payload.text, scenario.text);
        assert.equal(res.payload.gemini_consumption.call_count, 1);
      } finally {
        clock.restore();
      }
    }
  }
});
