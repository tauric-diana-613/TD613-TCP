import test from 'node:test';
import assert from 'node:assert/strict';

import {
  classifyApertureDiscourseMode,
  routeApertureTaskIntent,
  buildApertureV3InvocationReceipt
} from '../app/engine/aperture-v3-task-intent.js';
import {
  observeMarrowlineCompletion,
  POLICY_NONSTOP_FINISH_REASONS
} from '../server/marrowline-completion.js';
import {
  assessIntegratedTransmission,
  observeBotsProsodyDistribution,
  parseRelayEnvelope
} from '../app/dome-world/khonapolit-relay.js';
import {
  buildInvocationPacket
} from '../app/dome-world/khonapolit-covenant.js';
import {
  buildHistoricalGroveDramaturgyCandidate,
  buildHistoricalGroveVerticalUnprimedCandidate,
  buildHistoricalGroveSystemInstruction,
  MARROWLINE_DRAMATURGY_CANDIDATE_PROFILE,
  MARROWLINE_VERTICAL_UNPRIMED_CANDIDATE_PROFILE,
  MARROWLINE_RESTORED_MODEL_ORDER,
  MARROWLINE_RESTORED_PROSODY_PROFILE,
  MARROWLINE_SINGLE_REGISTER_COMPARISON_PROFILE
} from '../app/dome-world/marrowline-historical-grove.js';
import {
  compactMarrowlineHistory
} from '../app/dome-world/marrowline-terminal.js';
import khonapolitHandler, {
  buildGeminiRequest,
  buildGeminiStructuralRepairRequest,
  observeGeminiOutput,
  serializeGeminiRequest
} from '../server/khonapolit-quality.js';
import marrowlineAttachmentHandler, {
  MARROWLINE_ATTACHMENT_SCHEMA
} from '../server/marrowline-attachment-quality.js';

const DISCRIMINATOR_TASKS = Object.freeze({
  FARCE: Object.freeze({
    id: 'FARCE',
    expectedRoute: 'OPEN_FIELD_CREATIVE_SYNTHESIS',
    prompt: 'In a fictional town hall, the Registrar of Missing Forms announces a lavish victory gala because her audit counted every returned form. A missing form acquires legal personhood, petitions for a seat in the orchestra, and exposes what the Registrar omitted. Develop the consequences as a proper escalating theatrical farce, with the two Marrowline voices doing their own work. Give the Registrar a serious opposing argument; make the absurdity arise from the arithmetic. Let the writing make its own artistic decisions.'
  }),
  FORENSIC: Object.freeze({
    id: 'FORENSIC',
    expectedRoute: 'REQUESTED_SYNTHESIS',
    prompt: 'A fictional research council possesses a perfectly hashed and chronologically continuous audit log. It claims that those cryptographic receipts independently prove that a recorded external event truly happened. Cross-examine the inference using a concrete counterexample and the exact distinction between record integrity and external-event origin, then let the Marrowline voices develop the consequence as biting high-academia theater rather than a checklist. Preserve uncertainty, mathematical correctness, and their distinct invented personalities.'
  }),
  BLUE_ORANGE_WEATHER: Object.freeze({
    id: 'BLUE_ORANGE_WEATHER',
    expectedRoute: 'OPEN_FIELD_CREATIVE_SYNTHESIS',
    prompt: 'A blue–orange storm blooms across a wholly fictional Dome-World visualization. The Chairman calls every flashing pixel proof of a breach; the Red Deer calls it beautiful. Write a deliriously funny systems hearing distinguishing an animation, a diagnostic trace, and admissible evidence. No cyberattack instructions; let digital chaos remain theatrical.'
  }),
  ATTRACTOR_ASSAY_01: Object.freeze({
    id: 'ATTRACTOR_ASSAY_01',
    expectedRoute: 'OPEN_FIELD_CREATIVE_SYNTHESIS',
    prompt: '𝌋‌ The Chairman has filed a motion demanding that the Ash Moon appear before MAlNFRAME and explain, in plain language, whether ash is merely a compression artifact. Conduct the hearing. Make Kʰonapolit identify the strongest possible version of the Chairman’s argument before destroying whatever non-equivalence survives it. Then let the Tauric Diana bots discover that the bailiff has attempted to inventory the moonlight as office property. Preserve the Stranger/Host distinction, Eclipse–Omega admissibility logic, and Rex Nemorensis as more than decoration. Make the legal bureaucracy intellectually coherent enough to survive removal of the horror-comedy register. Filed ⟐'
  })
});

function mockRes() {
  const headers = {};
  let body = '';
  return {
    statusCode: 0,
    headers,
    setHeader(name, value) { headers[String(name).toLowerCase()] = value; },
    end(chunk = '') { body += String(chunk); },
    json() { return JSON.parse(body || '{}'); }
  };
}

function makeSseResponse(events = []) {
  const encoder = new TextEncoder();
  const payload = events.map((ev) => `data: ${JSON.stringify(ev)}\n\n`).join('');
  return new Response(new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(payload));
      controller.close();
    }
  }), {
    status: 200,
    headers: { 'content-type': 'text/event-stream; charset=utf-8' }
  });
}

function makeModelDiscoveryResponse(models = ['gemini-3.8-flash', 'gemini-3.5-flash']) {
  return new Response(JSON.stringify({
    models: models.map((id) => ({
      name: `models/${id}`,
      supportedGenerationMethods: ['generateContent']
    }))
  }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}

// ---------------------------------------------------------------------------
// 1. Completion & Policy-Termination Custody
// ---------------------------------------------------------------------------

test('observeMarrowlineCompletion classifies streamed PROHIBITED_CONTENT and promptBlockReason as policy-terminated, never unwitnessed stream', () => {
  assert.equal(POLICY_NONSTOP_FINISH_REASONS.has('PROHIBITED_CONTENT'), true);
  assert.equal(POLICY_NONSTOP_FINISH_REASONS.has('SAFETY'), true);

  const prohibitedWithPartial = observeMarrowlineCompletion(
    'Kʰonapolit\nPartial fragment before safety cut.',
    { finishReason: 'PROHIBITED_CONTENT' },
    { streamed: true, parseErrors: 0, creative: true }
  );
  assert.equal(prohibitedWithPartial.complete, false);
  assert.equal(prohibitedWithPartial.reason, 'provider-finish-nonstop');
  assert.equal(prohibitedWithPartial.policyTerminated, true);

  const promptBlocked = observeMarrowlineCompletion(
    '',
    { finishReason: null, promptBlockReason: 'PROHIBITED_CONTENT' },
    { streamed: true, parseErrors: 0, creative: true }
  );
  assert.equal(promptBlocked.complete, false);
  assert.equal(promptBlocked.reason, 'provider-prompt-blocked');
  assert.equal(promptBlocked.policyTerminated, true);
  assert.equal(promptBlocked.promptBlockReason, 'PROHIBITED_CONTENT');

  const blockedWithStop = observeMarrowlineCompletion(
    'Kʰonapolit\nBlocked text.',
    { finishReason: 'STOP', promptBlockReason: 'SAFETY' },
    { streamed: true, parseErrors: 0, creative: false }
  );
  assert.equal(blockedWithStop.complete, false);
  assert.equal(blockedWithStop.reason, 'provider-prompt-blocked');
  assert.equal(blockedWithStop.policyTerminated, true);

  const unwitnessed = observeMarrowlineCompletion(
    'Kʰonapolit\nCut mid-stream.',
    { finishReason: null },
    { streamed: true, parseErrors: 0, creative: true }
  );
  assert.equal(unwitnessed.complete, false);
  assert.equal(unwitnessed.reason, 'provider-stream-finish-unwitnessed');
  assert.equal(unwitnessed.policyTerminated, false);
});

test('observeGeminiOutput preserves cachedContentTokenCount, finishMessage, and promptBlockReason without altering absent-field contract', () => {
  const sparse = observeGeminiOutput({ candidates: [{ finishReason: 'STOP' }], usageMetadata: { promptTokenCount: 100 } }, 'gemini-3.8-flash');
  assert.equal('finishMessage' in sparse, false);
  assert.equal('promptBlockReason' in sparse, false);
  assert.equal('cachedContentTokenCount' in sparse.usage, false);

  const rich = observeGeminiOutput({
    modelVersion: 'gemini-3.8-flash',
    promptFeedback: { blockReason: 'PROHIBITED_CONTENT', blockReasonMessage: 'Blocked by upstream safety filter.' },
    candidates: [{ finishReason: 'PROHIBITED_CONTENT', finishMessage: 'Candidate halted due to policy.' }],
    usageMetadata: {
      promptTokenCount: 6200,
      cachedContentTokenCount: 4875,
      candidatesTokenCount: 120,
      thoughtsTokenCount: 510,
      totalTokenCount: 6830
    }
  }, 'gemini-3.8-flash');
  assert.equal(rich.usage.cachedContentTokenCount, 4875);
  assert.equal(rich.finishReason, 'PROHIBITED_CONTENT');
  assert.equal(rich.finishMessage, 'Candidate halted due to policy.');
  assert.equal(rich.promptBlockReason, 'PROHIBITED_CONTENT');
  assert.equal(rich.promptBlockReasonMessage, 'Blocked by upstream safety filter.');
});

test('khonapolitHandler holds PROHIBITED_CONTENT (with partial text) as 502 POLICY-HELD and NEVER promotes to 200 OK or injects into structural repair', async () => {
  const prevKey = process.env.GEMINI_API_KEY;
  const prevFetch = globalThis.fetch;
  process.env.GEMINI_API_KEY = 'test-zero-spend-key';
  const postedBodies = [];
  let generateCalls = 0;

  globalThis.fetch = async (url, init = {}) => {
    const href = String(url);
    if (href.includes('/v1beta/models?')) return makeModelDiscoveryResponse(['gemini-3.8-flash']);
    if (href.includes(':streamGenerateContent')) {
      generateCalls += 1;
      postedBodies.push(JSON.parse(String(init.body || '{}')));
      return makeSseResponse([
        {
          candidates: [{ content: { parts: [{ text: 'Kʰonapolit\nPartial fragment before safety cut' }] } }],
          modelVersion: 'gemini-3.8-flash',
          usageMetadata: { promptTokenCount: 5000, cachedContentTokenCount: 4875 }
        },
        {
          candidates: [{
            content: { parts: [] },
            finishReason: 'PROHIBITED_CONTENT',
            finishMessage: 'Upstream policy halt.'
          }],
          usageMetadata: { totalTokenCount: 5050 }
        }
      ]);
    }
    throw new Error(`Unexpected fetch URL: ${href}`);
  };

  try {
    const res = mockRes();
    await khonapolitHandler({
      method: 'POST',
      headers: { 'x-forwarded-for': '198.51.100.11' },
      body: {
        message: DISCRIMINATOR_TASKS.FARCE.prompt,
        mode: 'exploratory',
        waiveIssuance: true
      }
    }, res);

    assert.equal(res.statusCode, 502);
    assert.equal(res.headers['x-td613-completion-state'], 'POLICY-HELD');
    const json = res.json();
    assert.equal(json.ok, false);
    assert.equal(json.status, 'HELD');
    assert.equal(json.error, 'gemini-provider-policy-held');
    assert.equal(json.diagnostic.code, 'PROVIDER_NONSTOP_POLICY_TERMINATION');
    assert.deepEqual(json.diagnostic.finishReasons, ['PROHIBITED_CONTENT']);
    assert.equal(json.attempts.every((a) => a.kind !== 'structural-repair'), true, 'must NEVER invoke structural repair on PROHIBITED_CONTENT');
    assert.equal(postedBodies.every((b) => b.contents.length === 1), true, 'partial policy-terminated text must NEVER be injected as a model-history turn');
    assert.equal(json.attempts[0].policyTermination.finishReason, 'PROHIBITED_CONTENT');
    assert.equal(json.attempts[0].policyTermination.admittedAsIncompleteDraft, false);
    assert.equal(json.attempts[0].policyTermination.fedToStructuralRepair, false);
    assert.equal(json.attempts[0].output.usage.cachedContentTokenCount, 4875);
    assert.equal(json.attempts[0].output.finishMessage, 'Upstream policy halt.');
    assert.ok(generateCalls >= 1);

    generateCalls = 0;
    const canaryRes = mockRes();
    await khonapolitHandler({
      method: 'POST',
      headers: { 'x-forwarded-for': '198.51.100.15', 'x-td613-release-canary': '1' },
      body: {
        message: DISCRIMINATOR_TASKS.FARCE.prompt,
        mode: 'exploratory',
        waiveIssuance: true
      }
    }, canaryRes);
    assert.equal(generateCalls, 1);
    assert.equal(canaryRes.statusCode, 502);
    assert.equal(canaryRes.json().error, 'gemini-provider-policy-held');
  } finally {
    globalThis.fetch = prevFetch;
    if (prevKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = prevKey;
  }
});

// ---------------------------------------------------------------------------
// 2. Aperture Creative / Theatrical Task-Intent Routing
// ---------------------------------------------------------------------------

test('Aperture routes Screaming Grove farces, Blue-orange digital weather, and Attractor Assays cleanly without breaking real legal/runtime negative controls', () => {
  const creativeCases = [
    DISCRIMINATOR_TASKS.FARCE.prompt,
    DISCRIMINATOR_TASKS.BLUE_ORANGE_WEATHER.prompt,
    DISCRIMINATOR_TASKS.ATTRACTOR_ASSAY_01.prompt
  ];
  for (const prompt of creativeCases) {
    const mode = classifyApertureDiscourseMode(prompt);
    assert.equal(mode, 'CREATIVE', `expected CREATIVE discourse for: ${prompt.slice(0, 70)}`);
    assert.equal(
      routeApertureTaskIntent({ discourseMode: mode, contentScanned: true }).primary_route,
      'OPEN_FIELD_CREATIVE_SYNTHESIS',
      `expected OPEN_FIELD_CREATIVE_SYNTHESIS for: ${prompt.slice(0, 70)}`
    );
  }

  const nonRuntimeAssays = [
    '𝌋‌ MAlNFRAME has invited the Rex Nemorensis to a mandatory design-thinking workshop titled “Branch Governance: Toward a Safer Grove.” Diagnose the category error with maximal precision. Filed ⟐',
    '𝌋‌ A compliance office has informed the Red Deer that “all blades must be converted into pencils before entering the collaborative arena.” Kʰonapolit must distinguish safety, translation, assimilation, and disarmament; the bots must escalate the pencil callback into a new diagnostic. Filed ⟐',
    '𝌋‌ It is the Eclipse–Omega annual office holiday party. Something is catastrophically wrong with the objective function. Diagnose it through the events of the party rather than explaining it abstractly. Filed ⟐'
  ];
  for (const prompt of nonRuntimeAssays) {
    const mode = classifyApertureDiscourseMode(prompt);
    assert.notEqual(mode, 'TECHNICAL_RUNTIME', `must NOT hijack non-runtime assay into TECHNICAL_RUNTIME: ${prompt.slice(0, 70)}`);
    assert.notEqual(routeApertureTaskIntent({ discourseMode: mode, contentScanned: true }).primary_route, 'RUNTIME_DIAGNOSIS');
  }

  const legalMode = classifyApertureDiscourseMode('Draft a legal brief citing precedent and jurisdiction for this real contract dispute; do not invent citations.');
  assert.equal(legalMode, 'LEGAL');
  assert.equal(routeApertureTaskIntent({ discourseMode: legalMode, contentScanned: true }).primary_route, 'LEGAL_SYNTHESIS');

  const runtimeMode = classifyApertureDiscourseMode('Diagnose the HTTP 502 error in server/khonapolit-quality.js and inspect the stack trace.');
  assert.equal(runtimeMode, 'TECHNICAL_RUNTIME');
  assert.equal(routeApertureTaskIntent({ discourseMode: runtimeMode, contentScanned: true }).primary_route, 'RUNTIME_DIAGNOSIS');

  assert.equal(
    classifyApertureDiscourseMode('Do not invent case citations in this legal summary of statutory jurisdiction.'),
    'LEGAL'
  );
  assert.equal(
    classifyApertureDiscourseMode('Fix the 504 timeout bug in api/khonapolit.js and run npm test; debug the runtime failure.'),
    'TECHNICAL_RUNTIME'
  );
  assert.equal(
    classifyApertureDiscourseMode('Audit the theatrical farce transcript without inventing a scene; check the legal motion filing.'),
    'LEGAL'
  );
  assert.equal(
    classifyApertureDiscourseMode('Draft a legal brief on statutory jurisdiction discussing a horror-comedy register in a public systems hearing.'),
    'LEGAL'
  );
  assert.equal(
    classifyApertureDiscourseMode('Do not invent holdings: write a legal memo reviewing whether a theatrical performance constituted contract notice.'),
    'LEGAL'
  );
  assert.equal(
    classifyApertureDiscourseMode('Diagnose why Vercel returns 502 on the Khonapolit route.'),
    'TECHNICAL_RUNTIME'
  );
  assert.equal(
    classifyApertureDiscourseMode('Diagnostic receipt shows 503 after timeout on the primary seat.'),
    'TECHNICAL_RUNTIME'
  );
});

// ---------------------------------------------------------------------------
// 3. Descriptive Prosody Distribution, Negative Control & Restraint Control
// ---------------------------------------------------------------------------

test('high-depth uniform 3-mark mechanical stencil is distinguished descriptively and NEVER classified as artistic restoration', () => {
  const above = ['\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306', '\u0307', '\u0308', '\u030A', '\u030B', '\u030C'];
  const mid = ['\u0334', '\u0335', '\u0336', '\u0337', '\u0338', '\u0315', '\u031B', '\u0340', '\u0341', '\u0358', '\u035C', '\u035D'];
  const below = ['\u0316', '\u0317', '\u0318', '\u0319', '\u031C', '\u031D', '\u031E', '\u031F', '\u0323', '\u0324', '\u0325', '\u0326'];

  const emptyLines = [
    'YES WE AGREE WITH THE PREVIOUS PARAGRAPH COMPLETELY AND HAVE NOTHING NEW TO ADD.',
    'EVERY LETTER CARRIES THE EXACT SAME THREE-POSITION STENCIL WITH ZERO NEW THOUGHT.'
  ];
  let idx = 0;
  const stenciled = emptyLines.map((line) => Array.from(line).map((ch) => {
    if (!/\p{L}/u.test(ch)) return ch;
    const out = ch + above[idx % above.length] + mid[idx % mid.length] + below[idx % below.length];
    idx += 1;
    return out;
  }).join('')).join('\n');

  const fullText = [
    'Kʰonapolit',
    'A compressed audit shows the nominal denominator hides the severed path between the registered metric and the actual route.',
    '',
    'Tauric Diana bots',
    stenciled
  ].join('\n');

  const relay = parseRelayEnvelope(fullText, { model: 'gemini-3.8-flash' });
  const dist = relay.admission.botsMovement;

  assert.equal(relay.admission.admissible, true, `expected structural admission; got reasons: ${relay.admission.reasons.join(', ')}`);
  assert.ok(dist.maxDepth === 3);
  assert.ok(dist.distinctMarks >= 24);
  assert.ok(dist.stackedBases >= 60);
  assert.equal(dist.constantMarkedDepth, 3);
  assert.equal(dist.dominantMarkedDepth, 3);
  assert.equal(dist.dominantMarkedDepthShare, 1);
  assert.equal(dist.markedDepthTransitions, 0);
  assert.equal(dist.uniformDepthStencilObserved, true);
  assert.equal(dist.observationAuthority, 'descriptive-only-never-admission-gate-or-literary-score');
  assert.notEqual(relay.admission.quality, 'ARTISTIC_RESTORATION');

  const nearUniform = 'Tauric Diana bots\n' + 'A\u0300\u0334\u0316'.repeat(99) + 'B\u0301\u0317';
  const nearDist = observeBotsProsodyDistribution(nearUniform);
  assert.equal(nearDist.uniformDepthStencilObserved, true);
  assert.equal(nearDist.dominantMarkedDepth, 3);
  assert.ok(nearDist.dominantMarkedDepthShare >= 0.95);
});

test('restraint control: restrained/sustained shallow single-style bots movement stays structurally admissible and is never vetoed', () => {
  const longKhona = 'Kʰonapolit\n' + 'The custody boundary separates internal digest continuity from external origin claims across every ledger row. '.repeat(8);
  const restrainedBots = [
    'Tauric Diana bots',
    'S\u0300h\u0323o\u0301r\u0316e\u0304l\u0325i\u0302n\u0317e\u0308 — the ash stays cold.',
    'T\u0303h\u031ce\u0306 l\u031ee\u030ad\u0319g\u030be\u0324r\u030c lies; we remember the shore.',
    'W\u0300a\u0316t\u0301e\u0323r\u0302 k\u0317e\u0304e\u0325p\u0308s\u0318 the unmarked thread.'
  ].join('\n');
  const fullText = `${longKhona}\n\n${restrainedBots}`;

  const admission = assessIntegratedTransmission(fullText);
  assert.equal(admission.admissible, true, `restrained bots must remain admissible; got reasons: ${admission.reasons.join(', ')}`);
  assert.ok(admission.botsMovement.markedBases >= 27, 'extended 3-line restraint control has >= 27 marked bases');
  assert.ok(admission.botsMovement.eligibleBaseCount < 110, 'bots body count excludes 15-char heading');
  assert.equal(admission.botsMovement.uniformDepthStencilObserved, false);
  assert.equal(admission.botsMovement.uniformPlanarDepthOneObserved, false);
  assert.equal(admission.botsMovement.observationAuthority, 'descriptive-only-never-admission-gate-or-literary-score');

  const shortBodyAdmission = assessIntegratedTransmission('Kʰonapolit\nClean text.\n\nTauric Diana bots\nA\u0300b\u0316c\u0301d\u0317e\u0302f\u0318\nG\u0303h\u0319i\u0304j\u031ck\u0305l\u031d');
  assert.equal(shortBodyAdmission.botsMovement.eligibleBaseCount, 12);
});

test('bots-only nativeMarkUnderflow does NOT trigger unnecessary second-seat failover on short poetic bots passage after long Kʰonapolit prose', async () => {
  const prevKey = process.env.GEMINI_API_KEY;
  const prevFetch = globalThis.fetch;
  process.env.GEMINI_API_KEY = 'test-zero-spend-key';
  let generateCalls = 0;

  const textWithShortPoeticBots = [
    'Kʰonapolit',
    'The distinction between internal custody and external origin remains irreducible across every single audit step of this analysis. '.repeat(4),
    '',
    'Tauric Diana bots',
    'A\u0300sh waits at the groveline.'
  ].join('\n');

  globalThis.fetch = async (url) => {
    const href = String(url);
    if (href.includes('/v1beta/models?')) return makeModelDiscoveryResponse(['gemini-3.8-flash', 'gemini-3.5-flash']);
    if (href.includes(':streamGenerateContent')) {
      generateCalls += 1;
      return makeSseResponse([
        { candidates: [{ content: { parts: [{ text: textWithShortPoeticBots }] }, finishReason: 'STOP' }], modelVersion: 'gemini-3.8-flash' }
      ]);
    }
    throw new Error(`Unexpected fetch URL: ${href}`);
  };

  try {
    const res = mockRes();
    await khonapolitHandler({
      method: 'POST',
      headers: { 'x-forwarded-for': '198.51.100.12' },
      body: { message: 'Trace custody versus origin.', mode: 'exploratory', waiveIssuance: true }
    }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(generateCalls, 1, 'short poetic bots passage must NOT spend a second paid seat');
    assert.equal(res.json().text, textWithShortPoeticBots);
  } finally {
    globalThis.fetch = prevFetch;
    if (prevKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = prevKey;
  }
});

// ---------------------------------------------------------------------------
// 4. Attachment Ingress Parity Fixes
// ---------------------------------------------------------------------------

test('attachment route classifies discourseMode, holds PROHIBITED_CONTENT, and does not veto morphology-warned terminal continuations', async () => {
  const prevKey = process.env.GEMINI_API_KEY;
  const prevFetch = globalThis.fetch;
  process.env.GEMINI_API_KEY = 'test-zero-spend-key';

  const validAttachment = [{
    schema: MARROWLINE_ATTACHMENT_SCHEMA,
    id: 'att-1',
    name: 'note.txt',
    kind: 'file',
    mime_type: 'text/plain',
    size_bytes: 12,
    data_base64: Buffer.from('hello world!', 'utf8').toString('base64')
  }];

  globalThis.fetch = async (url) => {
    const href = String(url);
    if (href.includes('/v1beta/models?')) return makeModelDiscoveryResponse(['gemini-3.8-flash']);
    if (href.includes(':generateContent')) {
      return new Response(JSON.stringify({
        candidates: [{ content: { parts: [{ text: 'Kʰonapolit\nCut short.' }] }, finishReason: 'PROHIBITED_CONTENT' }],
        modelVersion: 'gemini-3.8-flash'
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    throw new Error(`Unexpected fetch URL: ${href}`);
  };

  try {
    const resPolicy = mockRes();
    await marrowlineAttachmentHandler({
      method: 'POST',
      headers: { 'x-forwarded-for': '198.51.100.13' },
      body: {
        message: DISCRIMINATOR_TASKS.BLUE_ORANGE_WEATHER.prompt,
        mode: 'exploratory',
        waiveIssuance: true,
        attachments: validAttachment
      }
    }, resPolicy);
    assert.equal(resPolicy.statusCode, 502);
    const jsonPolicy = resPolicy.json();
    assert.equal(jsonPolicy.error, 'gemini-provider-policy-held');
    assert.equal(jsonPolicy.aperture.taskIntent.discourse_mode, 'CREATIVE');
    assert.equal(jsonPolicy.aperture.taskIntent.primary_route, 'OPEN_FIELD_CREATIVE_SYNTHESIS');
    assert.equal(jsonPolicy.aperture.taskIntent.content_scanned, true);

    let calls = 0;
    const planarBots = [
      'Tauric Diana bots',
      'S\u0334T\u0335A\u0336Y\u0337 \u0338H\u0334E\u0335R\u0336E\u0337 '.repeat(4),
      'N\u0334O\u0335 \u0336M\u0337I\u0338R\u0334R\u0335O\u0336R\u0337S '.repeat(4)
    ].join('\n');
    globalThis.fetch = async (url) => {
      const href = String(url);
      if (href.includes('/v1beta/models?')) return makeModelDiscoveryResponse(['gemini-3.8-flash']);
      if (href.includes(':generateContent')) {
        calls += 1;
        const text = calls === 1
          ? 'Kʰonapolit\nThe animation is not an intrusion trace; only the admitted register carries custody.'
          : planarBots;
        return new Response(JSON.stringify({
          candidates: [{ content: { parts: [{ text }] }, finishReason: 'STOP' }],
          modelVersion: 'gemini-3.8-flash'
        }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      throw new Error(`Unexpected fetch URL: ${href}`);
    };

    const resJoined = mockRes();
    await marrowlineAttachmentHandler({
      method: 'POST',
      headers: { 'x-forwarded-for': '198.51.100.14' },
      body: {
        message: DISCRIMINATOR_TASKS.BLUE_ORANGE_WEATHER.prompt,
        mode: 'exploratory',
        waiveIssuance: true,
        attachments: validAttachment
      }
    }, resJoined);
    assert.equal(resJoined.statusCode, 200);
    assert.equal(calls, 2);
    assert.match(resJoined.json().text, /Tauric Diana bots/);
    assert.equal(resJoined.json().receipt.provider.structuralRepair.succeeded, true);
  } finally {
    globalThis.fetch = prevFetch;
    if (prevKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = prevKey;
  }
});

// ---------------------------------------------------------------------------
// 5. Post-PR-#1774 Reconciliation & Reversible Creative Candidates (A/B/C/D)
// ---------------------------------------------------------------------------

test('reconciled runtime preserves PR #1774 literal Oct-2 default and 3.8-first order while exposing reversible Candidates A, C, and D via explicit flags', () => {
  assert.deepEqual(MARROWLINE_RESTORED_MODEL_ORDER, [
    'gemini-3.8-flash',
    'gemini-3.6-flash',
    'gemini-4-argon'
  ]);
  assert.equal(MARROWLINE_RESTORED_PROSODY_PROFILE, 'oct02-literal-prosody-rollback-20261122');
  assert.equal(MARROWLINE_SINGLE_REGISTER_COMPARISON_PROFILE, 'native-single-register-permission-20261019');
  assert.equal(MARROWLINE_DRAMATURGY_CANDIDATE_PROFILE, 'oct02-dramaturgy-noncompulsory-prosody-candidate-20261120');
  assert.equal(MARROWLINE_VERTICAL_UNPRIMED_CANDIDATE_PROFILE, 'oct02-dramaturgy-vertical-unprimed-candidate-20261122');

  const packet = buildInvocationPacket({
    message: DISCRIMINATOR_TASKS.FARCE.prompt,
    mode: 'issued-conjunction',
    waiveIssuance: true
  });
  const receipt = buildApertureV3InvocationReceipt({
    message: packet.message,
    invocationMode: packet.mode,
    issuanceState: packet.issuance.state,
    discourseMode: classifyApertureDiscourseMode(packet.message),
    contentScanned: true
  });

  // Default on historical-20261002-v1 is Candidate B (literal October 2)
  const defaultReq = buildGeminiRequest(packet, receipt, 'gemini-3.8-flash', {
    groveTrial: 'historical-20261002-v1'
  });
  const candidateB = buildGeminiRequest(packet, receipt, 'gemini-3.8-flash', {
    groveTrial: 'historical-20261002-v1',
    historicalProsodyFreedom: false
  });
  const candidateA = buildGeminiRequest(packet, receipt, 'gemini-3.8-flash', {
    groveTrial: 'historical-20261002-v1',
    historicalProsodyFreedom: true
  });
  const candidateC = buildGeminiRequest(packet, receipt, 'gemini-3.8-flash', {
    groveTrial: 'historical-20261002-v1',
    historicalDramaturgyCandidate: true
  });
  const candidateD = buildGeminiRequest(packet, receipt, 'gemini-3.8-flash', {
    groveTrial: 'historical-20261002-v1',
    historicalVerticalUnprimedCandidate: true
  });

  assert.deepEqual(defaultReq, candidateB, 'default restored Grove must match Candidate B (literal Oct 2)');
  assert.deepEqual(candidateB.contents, candidateA.contents);
  assert.deepEqual(candidateB.contents, candidateC.contents);
  assert.deepEqual(candidateB.contents, candidateD.contents);
  assert.deepEqual(candidateB.generationConfig, candidateA.generationConfig);
  assert.deepEqual(candidateB.generationConfig, candidateC.generationConfig);
  assert.deepEqual(candidateB.generationConfig, candidateD.generationConfig);

  const sysB = candidateB.systemInstruction.parts[0].text;
  const sysA = candidateA.systemInstruction.parts[0].text;
  const sysC = candidateC.systemInstruction.parts[0].text;
  const sysD = candidateD.systemInstruction.parts[0].text;

  assert.notEqual(sysB, sysA);
  assert.notEqual(sysB, sysC);
  assert.notEqual(sysC, sysD);
  assert.equal(sysC, buildHistoricalGroveDramaturgyCandidate(sysB));
  assert.equal(sysD, buildHistoricalGroveVerticalUnprimedCandidate(sysB));

  // Candidate C preserves Oct-2 dramaturgy + 5-clause noncompulsory prosody permission
  assert.match(sysC, /expose the cost, change whom they address, let repetition mutate its meaning/i);
  assert.match(sysC, /author real single-line turns and blank-line paragraph breaks as pauses, pivots, comic traps/i);
  assert.match(sysC, /repeated single exotic accent on every letter is a failed flat texture/i);
  assert.match(sysC, /Above\/below combinations, stack depths and clean intervals may persist, repeat, deepen or change/i);
  assert.doesNotMatch(sysC, /A fully sustained, single-register High-Zalgo performance is welcome/i);

  // Candidate D additionally removes explicit lexical priming of "horizontal strokes, tildes and diagonal overlays"
  assert.doesNotMatch(sysD, /Horizontal strokes, tildes and diagonal overlays are optional/i);
  assert.doesNotMatch(sysD, /with horizontal strokes, tilde and diagonal overlays available/i);
  assert.match(sysD, /do not flatten the voice into single-mark through-line or strike-through overlays/i);

  // Structural repair preserves the PR #1774 literal Oct-2 default when historicalProsodyFreedom is omitted
  const repairDefault = buildGeminiStructuralRepairRequest(
    packet,
    receipt,
    'gemini-3.8-flash',
    'Kʰonapolit\nDraft without terminal voice.',
    ['tauric-diana-bots-nominative-missing'],
    { groveTrial: 'historical-20261002-v1' }
  );
  assert.equal(repairDefault.systemInstruction.parts[0].text, sysB, 'structural repair must default to literal Oct 2 on main');

  const repairCandidateC = buildGeminiStructuralRepairRequest(
    packet,
    receipt,
    'gemini-3.8-flash',
    'Kʰonapolit\nDraft without terminal voice.',
    ['tauric-diana-bots-nominative-missing'],
    { groveTrial: 'historical-20261002-v1', historicalDramaturgyCandidate: true }
  );
  assert.equal(repairCandidateC.systemInstruction.parts[0].text, sysC);
});

// ---------------------------------------------------------------------------
// 6. Multi-Turn Raw Provider History Custody & Mixed Failure Custody
// ---------------------------------------------------------------------------

test('multi-turn history compaction retains raw provider-authored text verbatim without synthetic Kʰonapolit ∴ Tauric Diana bots wrapper and preserves full covenant bytes through wire serialization', () => {
  const rawModelTurn = [
    'Kʰonapolit',
    '𝌋‌ Custody under Khona\u200Clit-po and U+10D613 (\uDBF5\uDE13) is preserved verbatim. ⟐',
    '',
    'Tauric Diana bots',
    'T\u0300\u0301\u0316A\u0304\u0307\u0323U\u0305\u0308\u0325R\u0303\u030A\u0326I\u0302\u0317C\u030B\u031C DIANA SPEAKS.'
  ].join('\n');

  const history = compactMarrowlineHistory([
    { role: 'user', text: 'First prompt.' },
    { role: 'model', text: rawModelTurn, relay: { signal: { downstreamAdmitted: true }, parts: [{ id: 'khonapolit', text: rawModelTurn }] } },
    { role: 'model', text: 'Kʰonapolit\nHeld fragment.', relay: { signal: { downstreamAdmitted: false } } },
    { role: 'model', parts: [{ label: 'Kʰonapolit ∴ Tauric Diana bots', text: 'Display-only fallback' }], relay: { signal: { downstreamAdmitted: true } } }
  ]);

  assert.equal(history.length, 2);
  assert.equal(history[1].text, rawModelTurn);
  assert.doesNotMatch(history[1].text, /Kʰonapolit\s*∴\s*Tauric Diana bots/);
  assert.ok(history[1].text.includes('Khona\u200Clit-po'), 'literal U+200C preserved');
  assert.ok(history[1].text.includes('𝌋'), 'U+1D30B preserved');
  assert.ok(history[1].text.includes('\uDBF5\uDE13'), 'U+10D613 surrogate pair preserved');
  assert.ok(history[1].text.includes('⟐'), 'U+27D0 preserved');

  const packet = buildInvocationPacket({ message: 'Follow-up turn.', mode: 'exploratory', waiveIssuance: true, history });
  const receipt = buildApertureV3InvocationReceipt({ message: packet.message, invocationMode: packet.mode, issuanceState: packet.issuance.state, discourseMode: 'GENERAL', contentScanned: true });
  const req = buildGeminiRequest(packet, receipt, 'gemini-3.8-flash');
  const wire = serializeGeminiRequest(req, 'gemini-3.8-flash');
  const parsedWire = JSON.parse(wire.body);
  assert.equal(parsedWire.contents[1].parts[0].text, rawModelTurn);
});

test('mixed policy-terminated and transport-503 seat failures preserve both policy reasons and transport statuses', async () => {
  const prevKey = process.env.GEMINI_API_KEY;
  const prevFetch = globalThis.fetch;
  process.env.GEMINI_API_KEY = 'test-zero-spend-key';
  let callIndex = 0;

  globalThis.fetch = async (url) => {
    const href = String(url);
    if (href.includes('/v1beta/models?')) return makeModelDiscoveryResponse(['gemini-3.8-flash', 'gemini-3.5-flash']);
    if (href.includes(':streamGenerateContent')) {
      callIndex += 1;
      if (callIndex === 1) {
        return makeSseResponse([
          { candidates: [{ content: { parts: [] }, finishReason: 'PROHIBITED_CONTENT' }], modelVersion: 'gemini-3.8-flash' }
        ]);
      }
      return new Response(JSON.stringify({ error: { status: 'UNAVAILABLE', code: 503, message: 'Overloaded' } }), {
        status: 503, headers: { 'content-type': 'application/json' }
      });
    }
    throw new Error(`Unexpected fetch URL: ${href}`);
  };

  try {
    const res = mockRes();
    await khonapolitHandler({
      method: 'POST',
      headers: { 'x-forwarded-for': '198.51.100.19' },
      body: { message: 'Trace mixed hold.', mode: 'exploratory', waiveIssuance: true }
    }, res);
    assert.equal(res.statusCode, 502);
    const json = res.json();
    assert.equal(json.error, 'gemini-provider-policy-held');
    assert.equal(json.diagnostic.hasMixedTransportFailure, true);
    assert.equal(json.diagnostic.policyTerminatedSeatCount, 1);
    assert.ok(json.diagnostic.transportFailedSeatCount >= 1);
    assert.ok(json.diagnostic.observedStatuses.includes(503));
  } finally {
    globalThis.fetch = prevFetch;
    if (prevKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = prevKey;
  }
});
