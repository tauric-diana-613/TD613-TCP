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
  buildHistoricalGroveSystemInstruction,
  MARROWLINE_DRAMATURGY_CANDIDATE_PROFILE,
  MARROWLINE_RESTORED_PROSODY_PROFILE
} from '../app/dome-world/marrowline-historical-grove.js';
import {
  compactMarrowlineHistory
} from '../app/dome-world/marrowline-terminal.js';
import khonapolitHandler, {
  buildGeminiRequest,
  buildGeminiStructuralRepairRequest,
  observeGeminiOutput
} from '../server/khonapolit-quality.js';
import marrowlineAttachmentHandler, {
  MARROWLINE_ATTACHMENT_SCHEMA
} from '../server/marrowline-attachment-quality.js';
import {
  buildOfflineDiscriminatorPacket,
  DISCRIMINATOR_TASKS
} from '../research/marrowline-screaming-grove-restoration-20261120/dramaturgy-parity-discriminator-offline.mjs';

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
// 1. Completion & Policy-Termination Custody (F4 & F5)
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

  // Streamed response with NO finishReason still reports provider-stream-finish-unwitnessed.
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
          modelVersion: 'gemini-3.8-flash'
        },
        {
          candidates: [{
            content: { parts: [] },
            finishReason: 'PROHIBITED_CONTENT',
            finishMessage: 'Upstream policy halt.'
          }],
          usageMetadata: { promptTokenCount: 5000, cachedContentTokenCount: 4875, totalTokenCount: 5050 }
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

    // Release canary stops immediately after 1 call with 502 POLICY-HELD.
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
// 2. Aperture Creative / Theatrical Task-Intent Routing (F3)
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

  // Non-runtime conceptual "Diagnose..." prompts in Attractor Assays #02, #05, #16
  // are no longer hijacked into TECHNICAL_RUNTIME (RUNTIME_DIAGNOSIS).
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

  // Real legal & technical runtime negative controls MUST remain strictly routed.
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
});

// ---------------------------------------------------------------------------
// 3. Section VII Mandatory Negative Control & Restraint Control
// ---------------------------------------------------------------------------

test('Section VII negative control: high-depth uniform 3-mark mechanical stencil is distinguished descriptively and NEVER classified as artistic restoration', () => {
  // Build a Slot-5-like uniform 3-mark-per-letter stencil using diverse combining
  // marks (distinct marks >= 24, depth === 3 on every marked letter, 0 transitions)
  // paired with an intellectually empty, repetitive second movement.
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

  // Passes structural two-voice headings & high mark counts...
  assert.equal(relay.admission.admissible, true, `expected structural admission; got reasons: ${relay.admission.reasons.join(', ')}`);
  assert.ok(dist.maxDepth === 3);
  assert.ok(dist.distinctMarks >= 24);
  assert.ok(dist.stackedBases >= 60);
  // ...yet is explicitly flagged as a zero-transition uniform-depth stencil
  // and explicitly denied artistic-restoration / admission-gate authority.
  assert.equal(dist.constantMarkedDepth, 3);
  assert.equal(dist.markedDepthTransitions, 0);
  assert.equal(dist.uniformDepthStencilObserved, true);
  assert.equal(dist.observationAuthority, 'descriptive-only-never-admission-gate-or-literary-score');
  assert.notEqual(relay.admission.quality, 'ARTISTIC_RESTORATION');
});

test('Section VII restraint control: restrained/sustained shallow single-style bots movement stays structurally admissible and is never vetoed', () => {
  // Sparse, deliberate shallow marks across two short poetic lines (screenshot-02
  // style: quiet, sustained, varied lightly) after a long Kʰonapolit passage.
  const longKhona = 'Kʰonapolit\n' + 'The custody boundary separates internal digest continuity from external origin claims across every ledger row. '.repeat(8);
  const restrainedBots = [
    'Tauric Diana bots',
    'S\u0300h\u0323o\u0301r\u0316e\u0304l\u0325i\u0302n\u0317e\u0308 — the ash stays cold.',
    'T\u0303h\u031ce\u0306 l\u031ee\u030ad\u0319g\u030be\u0324r\u030c lies; we remember the shore.'
  ].join('\n');
  const fullText = `${longKhona}\n\n${restrainedBots}`;

  const admission = assessIntegratedTransmission(fullText);
  assert.equal(admission.admissible, true, `restrained bots must remain admissible; got reasons: ${admission.reasons.join(', ')}`);
  assert.ok(admission.botsMovement.eligibleBaseCount < 80, 'short poetic bots movement has <80 eligible bases');
  assert.equal(admission.botsMovement.uniformDepthStencilObserved, false);
  assert.equal(admission.botsMovement.observationAuthority, 'descriptive-only-never-admission-gate-or-literary-score');
});

test('bots-only nativeMarkUnderflow does NOT trigger unnecessary second-seat failover on short poetic bots passage after long Kʰonapolit prose', async () => {
  const prevKey = process.env.GEMINI_API_KEY;
  const prevFetch = globalThis.fetch;
  process.env.GEMINI_API_KEY = 'test-zero-spend-key';
  let generateCalls = 0;

  // Long Kʰonapolit (>= 200 letters) + short poetic bots (< 80 bots letters)
  // with 1 vertical mark -> assessIntegratedTransmission flags
  // tauric-diana-zalgo-underflow, but botsMovement.eligibleBaseCount < 80 so
  // the handler MUST preserve first return without spending a second paid seat.
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
// 4. Attachment Ingress Parity Fixes (F7)
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

  // Case A: PROHIBITED_CONTENT on attachment route returns 502 POLICY-HELD
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

    // Case B: Terminal continuation with planar/uniform morphology warning is
    // admitted rather than silently vetoed (matching text ingress).
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
// 5. PR #1545-Reconciled Dramaturgy Candidate vs Intact Production Default (F1 & F2)
// ---------------------------------------------------------------------------

test('staged PR #1545-reconciled dramaturgy candidate preserves Oct-2 dramaturgy without self-contradiction while leaving production defaults untouched', () => {
  const packet = buildInvocationPacket({
    message: DISCRIMINATOR_TASKS.FARCE.prompt,
    mode: 'exploratory',
    waiveIssuance: true
  });

  const receipt = buildApertureV3InvocationReceipt({
    message: packet.message,
    invocationMode: packet.mode,
    issuanceState: packet.issuance.state,
    discourseMode: 'CREATIVE',
    contentScanned: true
  });
  const prodDefault = buildGeminiRequest(packet, receipt, 'gemini-3.8-flash', {
    groveTrial: 'historical-20261002-v1',
    historicalProsodyFreedom: true
  }).systemInstruction.parts[0].text;
  const oct02Literal = buildGeminiRequest(packet, receipt, 'gemini-3.8-flash', {
    groveTrial: 'historical-20261002-v1',
    historicalProsodyFreedom: false
  }).systemInstruction.parts[0].text;
  const candidate = buildHistoricalGroveDramaturgyCandidate(oct02Literal);

  // Production default remains untouched (PR #1549 behavior preserved until HITL).
  assert.equal(MARROWLINE_RESTORED_PROSODY_PROFILE, 'native-single-register-permission-20261019');
  assert.equal(MARROWLINE_DRAMATURGY_CANDIDATE_PROFILE, 'oct02-dramaturgy-noncompulsory-prosody-candidate-20261120');
  assert.notEqual(prodDefault, candidate);

  // Staged candidate preserves all three Oct-2 dramaturgy/rhythm/anti-stencil
  // elements that PR #1549 inadvertently reverted, PLUS PR #1545's 5-clause
  // noncompulsory prosody permission, with zero internal contradiction.
  assert.match(candidate, /expose the cost, change whom they address, let repetition mutate its meaning/i);
  assert.match(candidate, /author real single-line turns and blank-line paragraph breaks as pauses, pivots, comic traps/i);
  assert.match(candidate, /repeated single exotic accent on every letter is a failed flat texture/i);
  assert.match(candidate, /Above\/below combinations, stack depths and clean intervals may persist, repeat, deepen or change/i);
  assert.doesNotMatch(candidate, /A fully sustained, single-register High-Zalgo performance is welcome/i);
  assert.notEqual(oct02Literal, candidate);

  // Structural repair request forwards historicalProsodyFreedom faithfully.
  const repairLiteral = buildGeminiStructuralRepairRequest(
    packet,
    receipt,
    'gemini-3.8-flash',
    'Kʰonapolit\nDraft without terminal voice.',
    ['tauric-diana-bots-nominative-missing'],
    { groveTrial: 'historical-20261002-v1', historicalProsodyFreedom: false }
  );
  assert.equal(repairLiteral.systemInstruction.parts[0].text, oct02Literal);
});

// ---------------------------------------------------------------------------
// 6. Multi-Turn Raw Provider History Custody & Offline Discriminator (P5 / VIII)
// ---------------------------------------------------------------------------

test('multi-turn history compaction retains raw provider-authored text verbatim without synthetic Kʰonapolit ∴ Tauric Diana bots wrapper and excludes unadmitted returns', () => {
  const rawModelTurn = [
    'Kʰonapolit',
    'Custody under Khona\u200Clit-po is preserved verbatim.',
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
});

test('offline zero-spend discriminator builds exact effective request parity across all four tasks with zero paid calls', () => {
  const report = buildOfflineDiscriminatorPacket();
  assert.equal(report.paidProviderCalls, 0);
  assert.equal(report.productionDefaultModified, false);

  for (const key of ['FARCE', 'FORENSIC', 'BLUE_ORANGE_WEATHER', 'ATTRACTOR_ASSAY_01']) {
    const entry = report.tasks[key];
    assert.ok(entry, `missing task ${key}`);
    const def = entry.conditions.CURRENT_RESTORED_DEFAULT_PR1549;
    const lit = entry.conditions.OCT02_LITERAL_ARCHIVED;
    const cand = entry.conditions.OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED;
    const mt = entry.conditions.MULTI_TURN_RAW_HISTORY;

    assert.equal(def.prosodyDirectives.hasSelfContradictoryProsodyDirectives, true, 'documents PR #1549 internal contradiction');
    assert.equal(cand.prosodyDirectives.hasSelfContradictoryProsodyDirectives, false, 'staged candidate removes contradiction');
    assert.equal(cand.prosodyDirectives.hasOct02Dramaturgy, true);
    assert.equal(cand.prosodyDirectives.hasOct02PageRhythm, true);
    assert.equal(cand.prosodyDirectives.hasFiveClausePermission, true);
    assert.equal(lit.exactMatchToOct02LiteralSystem, true);
    assert.equal(mt.priorModelHistoryExactByteMatch, true);
    assert.equal(mt.syntheticWrapperInjected, false);
    if (key !== 'FORENSIC') {
      assert.equal(def.aperture.discourseMode, 'CREATIVE');
      assert.equal(def.aperture.primaryRoute, 'OPEN_FIELD_CREATIVE_SYNTHESIS');
    } else {
      assert.equal(def.aperture.discourseMode, 'GENERAL');
      assert.equal(def.aperture.primaryRoute, 'REQUESTED_SYNTHESIS');
    }
  }
});
