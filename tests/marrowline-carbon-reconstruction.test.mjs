import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
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
  allocateKhonapolitAttemptTimeout,
  buildGeminiRequest,
  buildGeminiStructuralRepairRequest,
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

  assert.equal(res2.statusCode, 503);
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
