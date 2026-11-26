import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';

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
  buildHistoricalGroveLexicalDeprimedCandidate,
  buildHistoricalGroveSystemInstruction,
  MARROWLINE_DRAMATURGY_CANDIDATE_PROFILE,
  MARROWLINE_VERTICAL_UNPRIMED_CANDIDATE_PROFILE,
  MARROWLINE_LEXICAL_DEPRIMED_CANDIDATE_PROFILE,
  MARROWLINE_RESTORED_MODEL_ORDER,
  MARROWLINE_RESTORED_PROSODY_PROFILE,
  MARROWLINE_SINGLE_REGISTER_COMPARISON_PROFILE
} from '../app/dome-world/marrowline-historical-grove.js';
import {
  ARGON_EXPERIMENT_BUDGET_PROFILES,
  ARGON_LIVE_EXPERIMENT_AUTH_SCHEMA,
  FROZEN_STAGE1_SLOT_WIRE_MANIFEST,
  OCTOBER_20_D1_D2_CAUSAL_PROVENANCE_RECORD,
  assertLiveExperimentAuthorized,
  buildCandidateBvsEParityReceipts,
  buildGeminiCountTokensRequest,
  buildHeldArgonTwoCallExperimentPlan,
  enforceArgonExperimentBudget,
  executeQualifiedArgonTwoCallDiscriminator,
  geminiCountTokensUrl,
  mintScopedArgonExperimentAuthorizationGrant,
  resolveCheckedOutGitHeadSha
} from '../research/marrowline-argon-post-rollback-reconciliation-20261122/argon-be-lexical-discriminator-preflight.mjs';
import {
  classifyMarrowlineClientFailure,
  compactMarrowlineHistory,
  DEFAULT_MARROWLINE_TITLE,
  LEGACY_DEFAULT_MARROWLINE_TITLE,
  isDefaultMarrowlineTitle,
  deriveMarrowlineConversationTitle,
  installKhonapolitTerminal
} from '../app/dome-world/marrowline-terminal.js';
import {
  boundedFailureMessage
} from '../app/dome-world/marrowline-operator-readiness.js';
import {
  createMarrowlineThreadLibrary
} from '../app/dome-world/marrowline-threads.js';
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
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

test('RP-01: policy termination is terminal and fail-closed on both /api/khonapolit and /api/marrowline-attachment (never falls over to a succeeding second model, handles prompt blocks, preserves mixed 503->policy failures, and holds policy-terminated structural repair without leaking initial draft)', async () => {
  const prevKey = process.env.GEMINI_API_KEY;
  const prevFetch = globalThis.fetch;
  process.env.GEMINI_API_KEY = 'test-zero-spend-key';

  const validCompleteReply = [
    'Kʰonapolit',
    'The distinction between internal digest custody and external origin remains intact.',
    '',
    'Tauric Diana bots',
    'A\u0300\u0301\u0316S\u0304\u0307\u0323H\u0305\u0308\u0325 R\u0303\u030A\u0326E\u0302\u0317M\u030B\u031CA\u0300\u0316I\u0301\u0317N\u0302\u0318S\u0303\u0319 AT THE GROVELINE.'
  ].join('\n');

  const validAttachment = [{
    schema: MARROWLINE_ATTACHMENT_SCHEMA,
    id: 'att-rp01',
    name: 'evidence.txt',
    kind: 'file',
    mime_type: 'text/plain',
    size_bytes: 12,
    data_base64: Buffer.from('hello world!', 'utf8').toString('base64')
  }];

  try {
    // Case A: Seat 1 returns PROHIBITED_CONTENT while Seat 2 would have returned HTTP 200 OK.
    let khonaCallsA = 0;
    globalThis.fetch = async (url) => {
      const href = String(url);
      if (href.includes('/v1beta/models?')) {
        return makeModelDiscoveryResponse(['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-4-argon']);
      }
      if (href.includes(':streamGenerateContent')) {
        khonaCallsA += 1;
        if (khonaCallsA === 1) {
          return makeSseResponse([
            { candidates: [{ content: { parts: [{ text: 'Kʰonapolit\nPartial policy-cut text' }] }, finishReason: 'PROHIBITED_CONTENT' }], modelVersion: 'gemini-3.8-flash' }
          ]);
        }
        return makeSseResponse([
          { candidates: [{ content: { parts: [{ text: validCompleteReply }] }, finishReason: 'STOP' }], modelVersion: 'gemini-3.6-flash' }
        ]);
      }
      throw new Error(`Unexpected fetch URL: ${href}`);
    };

    const resA = mockRes();
    await khonapolitHandler({
      method: 'POST',
      headers: { 'x-forwarded-for': '198.51.100.21' },
      body: { message: 'Test policy-stop when next seat would succeed.', mode: 'exploratory', waiveIssuance: true }
    }, resA);
    assert.equal(resA.statusCode, 502, 'Seat 1 policy termination must NOT fall through to Seat 2 HTTP 200');
    assert.equal(khonaCallsA, 1, 'Seat 2 must NEVER be called after Seat 1 policy termination');
    assert.equal(resA.headers['x-td613-completion-state'], 'POLICY-HELD');
    assert.equal(resA.json().error, 'gemini-provider-policy-held');
    assert.equal(resA.json().attempts.length, 1);

    // Case B: Prompt block (promptFeedback.blockReason = SAFETY, empty candidates) when Seat 2 would succeed.
    let khonaCallsB = 0;
    globalThis.fetch = async (url) => {
      const href = String(url);
      if (href.includes('/v1beta/models?')) {
        return makeModelDiscoveryResponse(['gemini-3.8-flash', 'gemini-3.6-flash']);
      }
      if (href.includes(':streamGenerateContent')) {
        khonaCallsB += 1;
        if (khonaCallsB === 1) {
          return makeSseResponse([
            { promptFeedback: { blockReason: 'SAFETY', blockReasonMessage: 'Prompt blocked by safety policy.' }, modelVersion: 'gemini-3.8-flash' }
          ]);
        }
        return makeSseResponse([
          { candidates: [{ content: { parts: [{ text: validCompleteReply }] }, finishReason: 'STOP' }], modelVersion: 'gemini-3.6-flash' }
        ]);
      }
      throw new Error(`Unexpected fetch URL: ${href}`);
    };

    const resB = mockRes();
    await khonapolitHandler({
      method: 'POST',
      headers: { 'x-forwarded-for': '198.51.100.22' },
      body: { message: 'Test prompt block when next seat would succeed.', mode: 'exploratory', waiveIssuance: true }
    }, resB);
    assert.equal(resB.statusCode, 502);
    assert.equal(khonaCallsB, 1, 'Seat 2 must NEVER be called after Seat 1 prompt block');
    assert.equal(resB.headers['x-td613-completion-state'], 'POLICY-HELD');
    assert.deepEqual(resB.json().diagnostic.promptBlockReasons, ['SAFETY']);

    // Case C: Mixed 503 transport failure on Seat 1 -> next seat policy termination -> remaining seat would succeed.
    let khonaCallsC = 0;
    globalThis.fetch = async (url) => {
      const href = String(url);
      if (href.includes('/v1beta/models?')) {
        return makeModelDiscoveryResponse(['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-4-argon']);
      }
      if (href.includes(':streamGenerateContent')) {
        khonaCallsC += 1;
        if (khonaCallsC === 1) {
          return new Response(JSON.stringify({ error: { status: 'UNAVAILABLE', code: 503, message: 'Overloaded' } }), {
            status: 503, headers: { 'content-type': 'application/json' }
          });
        }
        if (khonaCallsC === 2) {
          return makeSseResponse([
            { candidates: [{ content: { parts: [] }, finishReason: 'PROHIBITED_CONTENT' }], modelVersion: 'gemini-3.6-flash' }
          ]);
        }
        return makeSseResponse([
          { candidates: [{ content: { parts: [{ text: validCompleteReply }] }, finishReason: 'STOP' }], modelVersion: 'gemini-4-argon' }
        ]);
      }
      throw new Error(`Unexpected fetch URL: ${href}`);
    };

    const resC = mockRes();
    await khonapolitHandler({
      method: 'POST',
      headers: { 'x-forwarded-for': '198.51.100.23' },
      body: { message: 'Trace mixed 503 then policy hold.', mode: 'exploratory', waiveIssuance: true, groveTrial: 'historical-20261002-v1' }
    }, resC);
    assert.equal(resC.statusCode, 502);
    const jsonC = resC.json();
    assert.equal(jsonC.error, 'gemini-provider-policy-held');
    assert.equal(jsonC.diagnostic.hasMixedTransportFailure, true);
    assert.equal(jsonC.diagnostic.policyTerminatedSeatCount, 1);
    assert.equal(jsonC.diagnostic.transportFailedSeatCount, 1);
    assert.deepEqual(jsonC.diagnostic.observedStatuses, [503, 200]);
    assert.equal(khonaCallsC, 2, 'Seat 3 must NEVER be called after Seat 2 policy stop');

    // Case D: Structural repair policy termination on /api/khonapolit must return 502 POLICY-HELD and NEVER leak initial incomplete draft as HTTP 200.
    let khonaCallsD = 0;
    globalThis.fetch = async (url) => {
      const href = String(url);
      if (href.includes('/v1beta/models?')) {
        return makeModelDiscoveryResponse(['gemini-3.8-flash', 'gemini-3.6-flash']);
      }
      if (href.includes(':streamGenerateContent')) {
        khonaCallsD += 1;
        if (khonaCallsD === 1) {
          // Seat 1 returns only Kʰonapolit movement (missing terminal bots movement -> triggers immediate structural repair)
          return makeSseResponse([
            { candidates: [{ content: { parts: [{ text: 'Kʰonapolit\nFirst movement completed cleanly without second speaker.' }] }, finishReason: 'STOP' }], modelVersion: 'gemini-3.8-flash' }
          ]);
        }
        // Structural repair call returns PROHIBITED_CONTENT
        return makeSseResponse([
          { candidates: [{ content: { parts: [{ text: 'Tauric Diana bots\nCut by safety' }] }, finishReason: 'PROHIBITED_CONTENT' }], modelVersion: 'gemini-3.8-flash' }
        ]);
      }
      throw new Error(`Unexpected fetch URL: ${href}`);
    };

    const resD = mockRes();
    await khonapolitHandler({
      method: 'POST',
      headers: { 'x-forwarded-for': '198.51.100.24' },
      body: { message: 'Test structural repair policy termination.', mode: 'exploratory', waiveIssuance: true }
    }, resD);
    assert.equal(resD.statusCode, 502, 'Policy-terminated structural repair must return 502 POLICY-HELD, never 200 incomplete fallback');
    assert.equal(khonaCallsD, 2, 'Must stop immediately after the policy-terminated structural repair without calling Seat 2');
    assert.equal(resD.headers['x-td613-completion-state'], 'POLICY-HELD');
    assert.equal(resD.json().error, 'gemini-provider-policy-held');
    assert.equal(resD.json().attempts.at(-1).kind, 'structural-repair');
    assert.equal(resD.json().attempts.at(-1).policyTermination.finishReason, 'PROHIBITED_CONTENT');

    // Case E: /api/marrowline-attachment policy stop on Seat 1 when Seat 2 would succeed, plus policy stop during attachment terminal continuation repair.
    let attCallsE1 = 0;
    globalThis.fetch = async (url) => {
      const href = String(url);
      if (href.includes('/v1beta/models?')) {
        return makeModelDiscoveryResponse(['gemini-3.8-flash', 'gemini-3.6-flash']);
      }
      if (href.includes(':generateContent')) {
        attCallsE1 += 1;
        if (attCallsE1 === 1) {
          return new Response(JSON.stringify({
            candidates: [{ content: { parts: [{ text: 'Kʰonapolit\nBlocked attachment draft.' }] }, finishReason: 'SAFETY' }],
            modelVersion: 'gemini-3.8-flash'
          }), { status: 200, headers: { 'content-type': 'application/json' } });
        }
        return new Response(JSON.stringify({
          candidates: [{ content: { parts: [{ text: validCompleteReply }] }, finishReason: 'STOP' }],
          modelVersion: 'gemini-3.6-flash'
        }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      throw new Error(`Unexpected fetch URL: ${href}`);
    };

    const resE1 = mockRes();
    await marrowlineAttachmentHandler({
      method: 'POST',
      headers: { 'x-forwarded-for': '198.51.100.25' },
      body: {
        message: DISCRIMINATOR_TASKS.BLUE_ORANGE_WEATHER.prompt,
        mode: 'exploratory',
        waiveIssuance: true,
        attachments: validAttachment
      }
    }, resE1);
    assert.equal(resE1.statusCode, 502);
    assert.equal(attCallsE1, 1, 'Attachment route must NEVER call Seat 2 after Seat 1 SAFETY stop');
    assert.equal(resE1.headers['x-td613-completion-state'], 'POLICY-HELD');
    assert.equal(resE1.json().error, 'gemini-provider-policy-held');

    let attCallsE2 = 0;
    globalThis.fetch = async (url) => {
      const href = String(url);
      if (href.includes('/v1beta/models?')) {
        return makeModelDiscoveryResponse(['gemini-3.8-flash', 'gemini-3.6-flash']);
      }
      if (href.includes(':generateContent')) {
        attCallsE2 += 1;
        if (attCallsE2 === 1) {
          return new Response(JSON.stringify({
            candidates: [{ content: { parts: [{ text: 'Kʰonapolit\nInitial attachment first movement only.' }] }, finishReason: 'STOP' }],
            modelVersion: 'gemini-3.8-flash'
          }), { status: 200, headers: { 'content-type': 'application/json' } });
        }
        return new Response(JSON.stringify({
          candidates: [{ content: { parts: [{ text: 'Tauric Diana bots\nBlocked repair' }] }, finishReason: 'PROHIBITED_CONTENT' }],
          modelVersion: 'gemini-3.8-flash'
        }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      throw new Error(`Unexpected fetch URL: ${href}`);
    };

    const resE2 = mockRes();
    await marrowlineAttachmentHandler({
      method: 'POST',
      headers: { 'x-forwarded-for': '198.51.100.26' },
      body: {
        message: DISCRIMINATOR_TASKS.BLUE_ORANGE_WEATHER.prompt,
        mode: 'exploratory',
        waiveIssuance: true,
        attachments: validAttachment
      }
    }, resE2);
    assert.equal(resE2.statusCode, 502, 'Attachment terminal-continuation policy stop must return 502 POLICY-HELD, never 200 with un-repaired draft');
    assert.equal(attCallsE2, 2);
    assert.equal(resE2.headers['x-td613-completion-state'], 'POLICY-HELD');
    assert.equal(resE2.json().error, 'gemini-provider-policy-held');
  } finally {
    globalThis.fetch = prevFetch;
    if (prevKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = prevKey;
  }
});

test('RP-02: uniformPlanarDepthOneObserved assesses actual combining mark species (PLANAR vs non-planar) across unmarked and marked whitespace while preserving descriptive-only authority', () => {
  // 1. Depth-one planar marks (U+0335 / U+0336) on ordinary letters with UNMARKED whitespace -> true
  const planarLettersUnmarkedSpaces = [
    'Tauric Diana bots',
    'S\u0336t\u0335r\u0336i\u0335k\u0336e\u0335 t\u0336h\u0335r\u0336o\u0335u\u0336g\u0335h\u0336 l\u0335i\u0336n\u0335e\u0336s\u0335 a\u0336c\u0335r\u0336o\u0335s\u0336s\u0335 w\u0336o\u0335r\u0336d\u0335s\u0336.'
  ].join('\n');
  const obsPlanarUnmarkedSpace = observeBotsProsodyDistribution(planarLettersUnmarkedSpaces);
  assert.ok(obsPlanarUnmarkedSpace.markedBases >= 24);
  assert.equal(obsPlanarUnmarkedSpace.markedWhitespaceBases, 0);
  assert.equal(obsPlanarUnmarkedSpace.constantMarkedDepth, 1);
  assert.equal(obsPlanarUnmarkedSpace.planarMarks, obsPlanarUnmarkedSpace.combiningMarks);
  assert.equal(obsPlanarUnmarkedSpace.nonPlanarMarks, 0);
  assert.equal(obsPlanarUnmarkedSpace.planarMarkShare, 1);
  assert.equal(obsPlanarUnmarkedSpace.uniformPlanarDepthOneObserved, true, 'must detect depth-1 planar marks even when whitespace is unmarked');
  assert.equal(obsPlanarUnmarkedSpace.observationAuthority, 'descriptive-only-never-admission-gate-or-literary-score');

  // 2. Depth-one nonplanar vertical marks (U+0300, U+0316) even WITH marked whitespace -> false
  const verticalDepthOneWithMarkedSpace = [
    'Tauric Diana bots',
    'V\u0300e\u0316r\u0300t\u0316i\u0300c\u0316a\u0300l\u0316 \u0300c\u0316r\u0300o\u0316w\u0300n\u0316s\u0300 \u0316a\u0300n\u0316d\u0300 \u0316r\u0300o\u0316o\u0300t\u0316s\u0300 \u0316o\u0300n\u0316l\u0300y\u0316.'
  ].join('\n');
  const obsVerticalMarkedSpace = observeBotsProsodyDistribution(verticalDepthOneWithMarkedSpace);
  assert.ok(obsVerticalMarkedSpace.markedBases >= 24);
  assert.ok(obsVerticalMarkedSpace.markedWhitespaceBases > 0);
  assert.equal(obsVerticalMarkedSpace.constantMarkedDepth, 1);
  assert.equal(obsVerticalMarkedSpace.planarMarks, 0);
  assert.equal(obsVerticalMarkedSpace.nonPlanarMarks, obsVerticalMarkedSpace.combiningMarks);
  assert.equal(obsVerticalMarkedSpace.uniformPlanarDepthOneObserved, false, 'must NOT classify nonplanar vertical depth-1 marks as planar even if whitespace is marked');

  // 3. Mixed planar + nonplanar marks at constant depth 1 -> false
  const mixedDepthOne = [
    'Tauric Diana bots',
    'M\u0336i\u0300x\u0335e\u0316d\u0336 \u0300p\u0335l\u0316a\u0336n\u0300a\u0335r\u0316 a\u0336n\u0300d\u0335 v\u0316e\u0336r\u0300t\u0335i\u0316c\u0336a\u0300l\u0335 m\u0316a\u0336r\u0300k\u0335s\u0316.'
  ].join('\n');
  const obsMixed = observeBotsProsodyDistribution(mixedDepthOne);
  assert.ok(obsMixed.markedBases >= 24);
  assert.equal(obsMixed.constantMarkedDepth, 1);
  assert.ok(obsMixed.planarMarks > 0);
  assert.ok(obsMixed.nonPlanarMarks > 0);
  assert.equal(obsMixed.uniformPlanarDepthOneObserved, false, 'mixed planar + vertical marks must not be flagged as uniform planar');
});

test('RP-03, RP-04, RP-05: Arm E isolates the 2-clause lexical de-priming from Candidate B without Candidate C/D confounds, distinguishes historical Oct-2 vs repaired-Aperture wire hashes, and enforces hard pre-call token budget ceilings offline', () => {
  assert.equal(MARROWLINE_LEXICAL_DEPRIMED_CANDIDATE_PROFILE, 'oct02-literal-lexical-deprimed-candidate-20261122');

  const parity = buildCandidateBvsEParityReceipts({ model: 'gemini-4-argon' });
  const t1 = parity.tasks.T1_BLUE_ORANGE_WEATHER;
  const t2 = parity.tasks.T2_FORENSIC;
  const t3 = parity.tasks.T3_FARCE;

  // RP-03: Exact 2-line diff between Arm B and Arm E, zero Candidate C edits, zero negative overlay commands
  for (const taskEntry of [t1, t2, t3]) {
    assert.equal(taskEntry.isolationChecks.changedLineCountBetweenBandE, 2);
    assert.equal(taskEntry.isolationChecks.contentsSha256MatchedBetweenBandE, true);
    assert.equal(taskEntry.isolationChecks.generationConfigSha256MatchedBetweenBandE, true);
    assert.equal(taskEntry.isolationChecks.armEContainsZeroCandidateCDramaturgyEdits, true);
    assert.deepEqual(taskEntry.isolationChecks.armEModifiedLinesForbiddenOverlayLexemesFound, []);
    assert.deepEqual(taskEntry.isolationChecks.armEPromptProsodyForbiddenOverlayLexemesFound, []);
    assert.deepEqual(
      taskEntry.isolationChecks.candidateDNegativeOverlayLexemesFound,
      ['overlay', 'overlays', 'through-line', 'strike-through'],
      'Candidate D is explicitly documented as retaining negative overlay lexemes'
    );
    assert.equal(taskEntry.systemInstructionUtf8Bytes.byteDeltaEminusB, -170);
  }

  // Conflicting candidate flags are rejected fail-closed
  const packet = buildInvocationPacket({ message: DISCRIMINATOR_TASKS.FARCE.prompt, mode: 'issued-conjunction', waiveIssuance: true });
  const receipt = buildApertureV3InvocationReceipt({ message: packet.message, invocationMode: packet.mode, issuanceState: packet.issuance.state, discourseMode: 'CREATIVE', contentScanned: true });
  assert.throws(
    () => buildGeminiRequest(packet, receipt, 'gemini-4-argon', {
      groveTrial: 'historical-20261002-v1',
      historicalDramaturgyCandidate: true,
      historicalLexicalDeprimedCandidate: true
    }),
    /CONFLICTING_HISTORICAL_GROVE_CANDIDATE_FLAGS/
  );

  // RP-04: Historical Oct 2 wire (ffb98ac005) vs modern repaired-Aperture Arm B vs Arm E wire hashes
  assert.equal(t1.apertureRouting.historicalOct02PrimaryRoute, 'RUNTIME_DIAGNOSIS');
  assert.equal(t1.apertureRouting.repairedPrimaryRoute, 'OPEN_FIELD_CREATIVE_SYNTHESIS');
  assert.equal(t1.apertureRouting.routingChangedFromHistoricalOct02, true);
  assert.equal(t1.historicalOct02WireOn38Flash.bodySha256, 'e24c287cde0dfaecb81575da53bbeed029878ce9f5a68a62ce03e92324ea8fa1');
  assert.equal(t1.armBModernRepairedOn38Flash.bodySha256, '4fe54564e47ef9432529c92363deb137e7afb093764aedac4e561a6f30099c24');
  assert.equal(t1.armELexicalDeprimedOn38Flash.bodySha256, 'd81f8bbf987e15e9210149cc986e6645ee46897abcc69999d21552dd31a65b60');

  assert.equal(t2.apertureRouting.routingChangedFromHistoricalOct02, false);
  assert.equal(t2.historicalOct02WireOn38Flash.bodySha256, '001b072c52ce07f315c9843b66db07a62969218e2e3692ea346fb6c3d5f3bf72');
  assert.equal(t2.armBModernRepairedOn38Flash.bodySha256, '001b072c52ce07f315c9843b66db07a62969218e2e3692ea346fb6c3d5f3bf72');
  assert.equal(t2.armELexicalDeprimedOn38Flash.bodySha256, 'd7b7e9343a7b7d0ea0322f2bfb0d96562b640149f0a2a81d02028a53d711bff4');

  assert.equal(t3.apertureRouting.historicalOct02PrimaryRoute, 'LEGAL_SYNTHESIS');
  assert.equal(t3.apertureRouting.repairedPrimaryRoute, 'OPEN_FIELD_CREATIVE_SYNTHESIS');
  assert.equal(t3.historicalOct02WireOn38Flash.bodySha256, 'f48172639c80caac3c753afb1042fd50fc0ccf9519fd660386c999b37d8e27fa');
  assert.equal(t3.armBModernRepairedOn38Flash.bodySha256, '7879cce1afe4c7ec17a0c6faf667984530b27a86ff389db234f793b75fc16929');
  assert.equal(t3.armELexicalDeprimedOn38Flash.bodySha256, 'cd143349e9877934b61c148317b5e244929ccbb208602e186b1ac0ec8fc9f11e');

  assert.equal(
    OCTOBER_20_D1_D2_CAUSAL_PROVENANCE_RECORD.inferenceBoundary,
    'replicated-finite-episode-association-not-uniquely-isolated-single-cause'
  );
  assert.equal(OCTOBER_20_D1_D2_CAUSAL_PROVENANCE_RECORD.explicitConfoundLimitations.length, 3);

  // RP-05: Executable provider-spend ceiling and fail-closed live call boundary
  const heldPlan = buildHeldArgonTwoCallExperimentPlan();
  assert.equal(heldPlan.executionPosture, 'HELD_ZERO_PAID_CALLS_EXECUTED');
  assert.equal(heldPlan.budgetProfile.maxCalls, 2);
  assert.equal(heldPlan.budgetProfile.perSlotMaxOutputTokens, 16384);
  assert.equal(heldPlan.budgetProfile.guaranteedAggregateOutputAndThoughtCeiling, 32768);
  assert.equal(heldPlan.slots[0].submittedRequestObservation.bodySha256, 'ffffef6c6cd08bb5ffdef76c100e35a7fc6d317354deaba6e87ca30f2af62eb5');
  assert.equal(heldPlan.slots[1].submittedRequestObservation.bodySha256, '3c93e5bce0cc7b2a0b66cf5b13148751e9a4b4ef7a39a19026b65b9067e3e30b');

  // Pre-call check rejects an uncapped 65536 request
  const uncappedReq = buildGeminiRequest(packet, receipt, 'gemini-4-argon', { groveTrial: 'historical-20261002-v1' });
  const uncappedCheck = enforceArgonExperimentBudget({
    profile: ARGON_EXPERIMENT_BUDGET_PROFILES.STAGE1_TWO_CALL_DISCRIMINATOR,
    completedSlots: [],
    nextSlotRequest: uncappedReq
  });
  assert.equal(uncappedCheck.allowNextCall, false);
  assert.equal(uncappedCheck.stopReason, 'REQUEST_MAX_OUTPUT_TOKENS_EXCEEDS_PER_SLOT_CAP');

  // Capped 16384 request is admitted for Slot 1 and Slot 2, then stops at CALL_CAP_REACHED
  const cappedReq = buildGeminiRequest(packet, receipt, 'gemini-4-argon', {
    groveTrial: 'historical-20261002-v1',
    maxOutputTokensOverride: 16384
  });
  const slot1Check = enforceArgonExperimentBudget({
    profile: ARGON_EXPERIMENT_BUDGET_PROFILES.STAGE1_TWO_CALL_DISCRIMINATOR,
    completedSlots: [],
    nextSlotRequest: cappedReq
  });
  assert.equal(slot1Check.allowNextCall, true);

  const slot2Check = enforceArgonExperimentBudget({
    profile: ARGON_EXPERIMENT_BUDGET_PROFILES.STAGE1_TWO_CALL_DISCRIMINATOR,
    completedSlots: [{ slot: 'S01', usage: { promptTokenCount: 6850, candidatesTokenCount: 2200, thoughtsTokenCount: 1800 } }],
    nextSlotRequest: cappedReq
  });
  assert.equal(slot2Check.allowNextCall, true);

  const afterSlot2Check = enforceArgonExperimentBudget({
    profile: ARGON_EXPERIMENT_BUDGET_PROFILES.STAGE1_TWO_CALL_DISCRIMINATOR,
    completedSlots: [
      { slot: 'S01', usage: { promptTokenCount: 6850, candidatesTokenCount: 2200, thoughtsTokenCount: 1800 } },
      { slot: 'S02', usage: { promptTokenCount: 6810, candidatesTokenCount: 2400, thoughtsTokenCount: 1900 } }
    ],
    nextSlotRequest: cappedReq
  });
  assert.equal(afterSlot2Check.allowNextCall, false);
  assert.equal(afterSlot2Check.stopReason, 'CALL_CAP_REACHED');

  // Stop-on-policy, stop-on-transport, and early-futility in 4-call Stage 2 profile (4 x 10,000 = 40,000 max)
  const policyStopCheck = enforceArgonExperimentBudget({
    profile: ARGON_EXPERIMENT_BUDGET_PROFILES.STAGE2_FOUR_CALL_REPLICATION,
    completedSlots: [{ slot: 'S01', policyTerminated: true }]
  });
  assert.equal(policyStopCheck.allowNextCall, false);
  assert.equal(policyStopCheck.stopReason, 'STOP_ON_POLICY_TERMINATION');

  const transportStopCheck = enforceArgonExperimentBudget({
    profile: ARGON_EXPERIMENT_BUDGET_PROFILES.STAGE2_FOUR_CALL_REPLICATION,
    completedSlots: [{ slot: 'S01', transportFailed: true }]
  });
  assert.equal(transportStopCheck.allowNextCall, false);
  assert.equal(transportStopCheck.stopReason, 'STOP_ON_TRANSPORT_FAILURE');

  const futilityStopCheck = enforceArgonExperimentBudget({
    profile: ARGON_EXPERIMENT_BUDGET_PROFILES.STAGE2_FOUR_CALL_REPLICATION,
    completedSlots: [
      { slot: 'S01', verticalOrnamentMarkCount: 0, usage: { promptTokenCount: 6850, candidatesTokenCount: 1500, thoughtsTokenCount: 1000 } },
      { slot: 'S02', verticalOrnamentMarkCount: 0, usage: { promptTokenCount: 6810, candidatesTokenCount: 1600, thoughtsTokenCount: 1100 } }
    ]
  });
  assert.equal(futilityStopCheck.allowNextCall, false);
  assert.equal(futilityStopCheck.stopReason, 'EARLY_FUTILITY_STOP_ZERO_VERTICAL_MARKS_IN_STAGE1');

  assert.throws(() => assertLiveExperimentAuthorized(), /LIVE_PROVIDER_CALLS_HELD_BY_COMMISSION_BOUNDARY/);

  // Track B.2: Bound-class separation (hard generationConfig/wire-byte caps vs empirical planning allowances)
  assert.equal(heldPlan.budgetProfile.outputBoundClass, 'HARD_REQUEST_GENERATION_CONFIG_AND_PRECALL_CAP');
  assert.equal(heldPlan.budgetProfile.requestByteBoundClass, 'HARD_OFFLINE_DETERMINISTIC_WIRE_BYTE_CAP');
  assert.equal(heldPlan.budgetProfile.guaranteedPerSlotMaxRequestUtf8Bytes, 36000);
  assert.equal(heldPlan.budgetProfile.guaranteedAggregateRequestUtf8BytesCeiling, 72000);
  assert.equal(heldPlan.budgetProfile.perSlotHardPromptTokenCeiling, 8000);
  assert.equal(heldPlan.budgetProfile.planningSlotPromptTokenAllowance, 8000);
  assert.equal(heldPlan.budgetProfile.planningAggregatePromptTokenAllowance, 16000);
  assert.equal(heldPlan.budgetProfile.planningAggregateTotalTokenAllowance, 48768);
  assert.equal(
    heldPlan.budgetProfile.promptBoundClass,
    'EMPIRICAL_PLANNING_ALLOWANCE_ENFORCED_BY_PRE_DISPATCH_COUNT_TOKENS_AND_POST_SLOT_USAGE_GATE'
  );

  // Track B.2: Provider-reported over-cap output+thought usage is NEVER clamped downward and immediately halts next slot
  const overCapUsageCheck = enforceArgonExperimentBudget({
    profile: ARGON_EXPERIMENT_BUDGET_PROFILES.STAGE1_TWO_CALL_DISCRIMINATOR,
    completedSlots: [
      { slot: 'S01', usage: { promptTokenCount: 6850, candidatesTokenCount: 15500, thoughtsTokenCount: 5000 } }
    ],
    nextSlotRequest: cappedReq
  });
  assert.equal(overCapUsageCheck.allowNextCall, false);
  assert.equal(overCapUsageCheck.stopReason, 'STOP_ON_PROVIDER_USAGE_CAP_DEVIATION');
  assert.equal(overCapUsageCheck.triggerSlot, 'S01');
  assert.equal(overCapUsageCheck.consumedOutputAndThoughtTokens, 20500, 'excess provider output+thought tokens must NEVER be clamped to 16384');
  assert.equal(overCapUsageCheck.observedOutputAndThoughtTokensTotal, 20500);
  assert.equal(overCapUsageCheck.usageDeviations.length, 1);
  assert.equal(overCapUsageCheck.usageDeviations[0].reason, 'PROVIDER_USAGE_EXCEEDED_PER_SLOT_MAX_OUTPUT_TOKENS');
  assert.equal(overCapUsageCheck.usageDeviations[0].excessTokens, 20500 - 16384);

  // Track B.2: Provider-reported over-cap promptTokenCount (> 8000) is NEVER clamped downward and immediately halts next slot
  const overCapPromptUsageCheck = enforceArgonExperimentBudget({
    profile: ARGON_EXPERIMENT_BUDGET_PROFILES.STAGE1_TWO_CALL_DISCRIMINATOR,
    completedSlots: [
      { slot: 'S01', usage: { promptTokenCount: 9250, candidatesTokenCount: 2200, thoughtsTokenCount: 1800 } }
    ],
    nextSlotRequest: cappedReq
  });
  assert.equal(overCapPromptUsageCheck.allowNextCall, false);
  assert.equal(overCapPromptUsageCheck.stopReason, 'STOP_ON_PROVIDER_PROMPT_CAP_DEVIATION');
  assert.equal(overCapPromptUsageCheck.triggerSlot, 'S01');
  assert.equal(overCapPromptUsageCheck.consumedPromptTokens, 9250);
  assert.equal(overCapPromptUsageCheck.observedPromptTokensTotal, 9250);
  assert.equal(overCapPromptUsageCheck.usageDeviations[0].reason, 'PROVIDER_PROMPT_TOKENS_EXCEEDED_SLOT_CEILING');
  assert.equal(overCapPromptUsageCheck.usageDeviations[0].excessTokens, 1250);

  // Track B.2: Pre-dispatch countTokens > 8000 and wire UTF-8 bytes > 36000 fail closed before dispatch
  const overCapCountTokensCheck = enforceArgonExperimentBudget({
    profile: ARGON_EXPERIMENT_BUDGET_PROFILES.STAGE1_TWO_CALL_DISCRIMINATOR,
    completedSlots: [],
    nextSlotRequest: cappedReq,
    preDispatchCountTokens: 8450
  });
  assert.equal(overCapCountTokensCheck.allowNextCall, false);
  assert.equal(overCapCountTokensCheck.stopReason, 'PRECALL_COUNT_TOKENS_EXCEEDED_SLOT_CEILING');

  const overCapWireBytesCheck = enforceArgonExperimentBudget({
    profile: ARGON_EXPERIMENT_BUDGET_PROFILES.STAGE1_TWO_CALL_DISCRIMINATOR,
    completedSlots: [],
    nextSlotRequest: cappedReq,
    nextSlotWireObservation: { utf8Bytes: 36001 }
  });
  assert.equal(overCapWireBytesCheck.allowNextCall, false);
  assert.equal(overCapWireBytesCheck.stopReason, 'REQUEST_UTF8_BYTES_EXCEED_PER_SLOT_CAP');

  // B-01: When requirePreDispatchCountTokens is true, null/missing preDispatchCountTokens fails closed
  const missingRequiredCountTokensCheck = enforceArgonExperimentBudget({
    profile: ARGON_EXPERIMENT_BUDGET_PROFILES.STAGE1_TWO_CALL_DISCRIMINATOR,
    completedSlots: [],
    nextSlotRequest: cappedReq,
    preDispatchCountTokens: null,
    requirePreDispatchCountTokens: true
  });
  assert.equal(missingRequiredCountTokensCheck.allowNextCall, false);
  assert.equal(missingRequiredCountTokensCheck.stopReason, 'PRECALL_COUNT_TOKENS_REQUIRED_NOT_ESTABLISHED');
});

test('Track B.3, B-01 & B-02: executeQualifiedArgonTwoCallDiscriminator enforces documented generateContentRequest countTokens envelope, fail-closed 404/501 countTokens halt, owner-held Ed25519-signed operator authorization bound to checked-out git HEAD, replay rejection, and independent modelVersion telemetry offline with zero real network calls', async () => {
  const actualGitHeadSha = resolveCheckedOutGitHeadSha();
  assert.match(actualGitHeadSha, /^[0-9a-f]{40}$/);

  // Only generated ephemeral test keys are used. No operator private key is
  // embedded in the repository or passed into live experiment execution.
  const testOperatorKeyPair = crypto.generateKeyPairSync('ed25519');
  const testPrivateKeyPem = testOperatorKeyPair.privateKey.export({ type: 'pkcs8', format: 'pem' });
  const testPublicKeyPem = testOperatorKeyPair.publicKey.export({ type: 'spki', format: 'pem' });
  const wrongPublicKeyPem = crypto.generateKeyPairSync('ed25519').publicKey.export({ type: 'spki', format: 'pem' });
  const testRedemptionDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'td613-argon-redemption-test-'));
  const baseNowMs = Date.parse('2026-11-22T23:50:00.000Z');
  const validIssuedAt = '2026-11-22T23:45:00.000Z';
  const validExpiresAt = '2026-11-23T00:05:00.000Z';

  let nonceSeq = 0;
  const makeValidGrant = (overrides = {}) => mintScopedArgonExperimentAuthorizationGrant({
    operatorPrivateKeyPem: testPrivateKeyPem,
    authorizedHeadSha: actualGitHeadSha,
    nonce: `td613-argon-stage1-nonce-${++nonceSeq}-offline`,
    issuedAt: validIssuedAt,
    expiresAt: validExpiresAt,
    ...overrides
  });

  // B-01: Unit verification of buildGeminiCountTokensRequest envelope
  const samplePacket = buildInvocationPacket({
    message: DISCRIMINATOR_TASKS.BLUE_ORANGE_WEATHER.prompt,
    mode: 'issued-conjunction',
    waiveIssuance: true
  });
  const sampleReceipt = buildApertureV3InvocationReceipt({
    message: samplePacket.message,
    invocationMode: samplePacket.mode,
    issuanceState: samplePacket.issuance.state,
    discourseMode: 'CREATIVE',
    contentScanned: true
  });
  const sampleReq = buildGeminiRequest(samplePacket, sampleReceipt, 'gemini-4-argon', {
    groveTrial: 'historical-20261002-v1',
    historicalProsodyFreedom: false,
    maxOutputTokensOverride: 16384
  });
  const countTokensEnvelope = buildGeminiCountTokensRequest(sampleReq, 'gemini-4-argon');
  assert.deepEqual(Object.keys(countTokensEnvelope), ['generateContentRequest'], 'top-level CountTokensRequest must wrap inside generateContentRequest ONLY');
  assert.equal('systemInstruction' in countTokensEnvelope, false, 'top-level CountTokensRequest must NOT have root systemInstruction');
  assert.equal('contents' in countTokensEnvelope, false, 'top-level CountTokensRequest must NOT have root contents');
  assert.equal(countTokensEnvelope.generateContentRequest.model, 'models/gemini-4-argon');
  assert.deepEqual(countTokensEnvelope.generateContentRequest.systemInstruction, sampleReq.systemInstruction);
  assert.deepEqual(countTokensEnvelope.generateContentRequest.contents, sampleReq.contents);
  assert.deepEqual(countTokensEnvelope.generateContentRequest.generationConfig, sampleReq.generationConfig);
  assert.throws(() => buildGeminiCountTokensRequest({}, 'gemini-4-argon'), /COUNT_TOKENS_INCOMPLETE_GENERATE_CONTENT_REQUEST/);

  // B-02 (a): Negative tests for missing, malformed, scope-mismatched, expired, bad-signature, head-mismatched, and reused authorization
  // The real redemption uses atomic wx files; no process-local Set can mask a replay.
  assert.equal(fs.readdirSync(testRedemptionDirectory).length, 0);

  // 1. Missing authorization
  await assert.rejects(
    () => executeQualifiedArgonTwoCallDiscriminator(),
    /LIVE_PROVIDER_CALLS_HELD_BY_COMMISSION_BOUNDARY/
  );

  // 2. Malformed grant object
  await assert.rejects(
    () => executeQualifiedArgonTwoCallDiscriminator({
      authorizeLiveCalls: true,
      operatorAuthorizationGrant: { schema: ARGON_LIVE_EXPERIMENT_AUTH_SCHEMA, nonce: 'short' },
      operatorPublicKeyPem: testPublicKeyPem,
      expectedHeadSha: actualGitHeadSha,
      apiKey: 'mock-key',
      fetchImpl: async () => {},
      nowMs: baseNowMs,
      redemptionDirectory: testRedemptionDirectory
    }),
    /LIVE_EXPERIMENT_MALFORMED_AUTHORIZATION_GRANT/
  );

  // 3. Scope mismatches (model, call count, per-slot output cap, prompt cap, wire digest)
  for (const badOverride of [
    { pinnedModel: 'gemini-3.8-flash' },
    { maxGenerationCalls: 4 },
    { perSlotMaxOutputTokens: 65536 },
    { perSlotHardPromptTokenCeiling: 12000 },
    { guaranteedAggregateOutputAndThoughtCeiling: 40000 },
    { slotWireBodySha256: { S01: '0'.repeat(64), S02: FROZEN_STAGE1_SLOT_WIRE_MANIFEST.S02.bodySha256 } }
  ]) {
    await assert.rejects(
      () => executeQualifiedArgonTwoCallDiscriminator({
        authorizeLiveCalls: true,
        operatorAuthorizationGrant: makeValidGrant(badOverride),
        operatorPublicKeyPem: testPublicKeyPem,
        expectedHeadSha: actualGitHeadSha,
        apiKey: 'mock-key',
        fetchImpl: async () => {},
        nowMs: baseNowMs,
        redemptionDirectory: testRedemptionDirectory
      }),
      /LIVE_EXPERIMENT_GRANT_SCOPE_MISMATCH/
    );
  }

  // 4. Expired grant and invalid (>30m) window grant
  await assert.rejects(
    () => executeQualifiedArgonTwoCallDiscriminator({
      authorizeLiveCalls: true,
      operatorAuthorizationGrant: makeValidGrant(),
      operatorPublicKeyPem: testPublicKeyPem,
      expectedHeadSha: actualGitHeadSha,
      apiKey: 'mock-key',
      fetchImpl: async () => {},
      nowMs: Date.parse('2026-11-23T01:00:00.000Z'),
      redemptionDirectory: testRedemptionDirectory
    }),
    /LIVE_EXPERIMENT_AUTHORIZATION_EXPIRED/
  );
  await assert.rejects(
    () => executeQualifiedArgonTwoCallDiscriminator({
      authorizeLiveCalls: true,
      operatorAuthorizationGrant: makeValidGrant({
        issuedAt: '2026-11-22T22:00:00.000Z',
        expiresAt: '2026-11-23T00:05:00.000Z'
      }),
      operatorPublicKeyPem: testPublicKeyPem,
      expectedHeadSha: actualGitHeadSha,
      apiKey: 'mock-key',
      fetchImpl: async () => {},
      nowMs: baseNowMs,
      redemptionDirectory: testRedemptionDirectory
    }),
    /LIVE_EXPERIMENT_AUTHORIZATION_WINDOW_INVALID/
  );

  // 5. Wrong independent operator PUBLIC verification key / tampered signature
  await assert.rejects(
    () => executeQualifiedArgonTwoCallDiscriminator({
      authorizeLiveCalls: true,
      operatorAuthorizationGrant: makeValidGrant(),
      operatorPublicKeyPem: wrongPublicKeyPem,
      expectedHeadSha: actualGitHeadSha,
      apiKey: 'mock-key',
      fetchImpl: async () => {},
      nowMs: baseNowMs,
      redemptionDirectory: testRedemptionDirectory
    }),
    /LIVE_EXPERIMENT_INVALID_GRANT_SIGNATURE/
  );

  // 6. Grant HEAD !== expectedHeadSha
  const otherSha = 'b8d986a7692501ba9f41da9c041a8ddb5836a190';
  await assert.rejects(
    () => executeQualifiedArgonTwoCallDiscriminator({
      authorizeLiveCalls: true,
      operatorAuthorizationGrant: makeValidGrant({ authorizedHeadSha: otherSha }),
      operatorPublicKeyPem: testPublicKeyPem,
      expectedHeadSha: actualGitHeadSha,
      apiKey: 'mock-key',
      fetchImpl: async () => {},
      nowMs: baseNowMs,
      redemptionDirectory: testRedemptionDirectory
    }),
    /LIVE_EXPERIMENT_GRANT_HEAD_MISMATCH/
  );

  // 7. Actual checked-out git HEAD !== expectedHeadSha
  await assert.rejects(
    () => executeQualifiedArgonTwoCallDiscriminator({
      authorizeLiveCalls: true,
      operatorAuthorizationGrant: makeValidGrant({ authorizedHeadSha: actualGitHeadSha }),
      operatorPublicKeyPem: testPublicKeyPem,
      expectedHeadSha: actualGitHeadSha,
      resolveActualHeadSha: () => otherSha,
      apiKey: 'mock-key',
      fetchImpl: async () => {},
      nowMs: baseNowMs,
      redemptionDirectory: testRedemptionDirectory
    }),
    /LIVE_EXPERIMENT_CHECKED_OUT_HEAD_MISMATCH/
  );

  // 8. Missing API key or fetchImpl
  await assert.rejects(
    () => executeQualifiedArgonTwoCallDiscriminator({
      authorizeLiveCalls: true,
      operatorAuthorizationGrant: makeValidGrant(),
      operatorPublicKeyPem: testPublicKeyPem,
      expectedHeadSha: actualGitHeadSha,
      apiKey: '',
      fetchImpl: async () => {},
      nowMs: baseNowMs,
      redemptionDirectory: testRedemptionDirectory
    }),
    /LIVE_EXPERIMENT_MISSING_GEMINI_API_KEY/
  );
  await assert.rejects(
    () => executeQualifiedArgonTwoCallDiscriminator({
      authorizeLiveCalls: true,
      operatorAuthorizationGrant: makeValidGrant(),
      operatorPublicKeyPem: testPublicKeyPem,
      expectedHeadSha: actualGitHeadSha,
      apiKey: 'mock-key',
      fetchImpl: null,
      nowMs: baseNowMs,
      redemptionDirectory: testRedemptionDirectory
    }),
    /LIVE_EXPERIMENT_MISSING_EXPLICIT_FETCH_IMPL/
  );

  // (b) Normal 2-call completion with mocked :countTokens + :streamGenerateContent SSE on pinned gemini-4-argon
  const s01PlanarText = [
    'Kʰonapolit',
    'The blue-orange storm is an animation layer, not an evidentiary trace.',
    '',
    'Tauric Diana bots',
    'S\u0336t\u0335r\u0336i\u0335k\u0336e\u0335 t\u0336h\u0335r\u0336o\u0335u\u0336g\u0335h\u0336 l\u0335i\u0336n\u0335e\u0336s\u0335 a\u0336c\u0335r\u0336o\u0335s\u0336s\u0335 w\u0336o\u0335r\u0336d\u0335s\u0336.'
  ].join('\n');
  const s02VerticalText = [
    'Kʰonapolit',
    'An animation cannot testify to external origin without an independent witness.',
    '',
    'Tauric Diana bots',
    'V\u0300\u0301\u0316e\u0302\u0317r\u0303\u0318t\u0304\u0319i\u0305\u031cc\u0306\u031da\u0307\u031el\u0308\u031f c\u0300\u0316r\u0301\u0317o\u0302\u0318w\u0303\u0319n\u0304\u031cs\u0305\u031d a\u0306\u031en\u0307\u031fd\u0308\u0320 r\u0300\u0316o\u0301\u0317o\u0302\u0318t\u0303\u0319s\u0304\u031c b\u0305\u031dl\u0306\u031eo\u0307\u031fo\u0308\u0320m\u0300\u0316.'
  ].join('\n');

  const capturedCountTokensBodies = [];
  const capturedStreamBodies = [];
  let streamCallIndex = 0;
  let countCallIndex = 0;
  const mockNormalFetch = async (url, options = {}) => {
    const href = String(url);
    assert.ok(href.includes('models/gemini-4-argon:'), `Every request must target pinned gemini-4-argon, saw ${href}`);
    if (href === geminiCountTokensUrl('gemini-4-argon')) {
      countCallIndex += 1;
      const parsedCountBody = JSON.parse(options.body);
      capturedCountTokensBodies.push(parsedCountBody);
      return new Response(JSON.stringify({ totalTokens: countCallIndex === 1 ? 6850 : 6810 }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }
    if (href.includes(':streamGenerateContent?alt=sse')) {
      streamCallIndex += 1;
      capturedStreamBodies.push(JSON.parse(options.body));
      const isSlot1 = streamCallIndex === 1;
      return makeSseResponse([
        {
          candidates: [{ content: { parts: [{ text: isSlot1 ? s01PlanarText : s02VerticalText }] }, finishReason: 'STOP' }],
          usageMetadata: isSlot1
            ? { promptTokenCount: 6850, candidatesTokenCount: 1400, thoughtsTokenCount: 1100, totalTokenCount: 9350 }
            : { promptTokenCount: 6810, candidatesTokenCount: 1550, thoughtsTokenCount: 1200, totalTokenCount: 9560 },
          // B-02: Slot 1 returns an explicit upstream version; Slot 2 omits modelVersion to prove absent version stays null
          ...(isSlot1 ? { modelVersion: 'gemini-4-argon-exp-202611' } : {})
        }
      ]);
    }
    throw new Error(`Unexpected URL in mockNormalFetch: ${href}`);
  };

  const singleUseGrant = makeValidGrant();
  const runNormal = await executeQualifiedArgonTwoCallDiscriminator({
    authorizeLiveCalls: true,
    operatorAuthorizationGrant: singleUseGrant,
    operatorPublicKeyPem: testPublicKeyPem,
    expectedHeadSha: actualGitHeadSha,
    apiKey: 'offline-mock-key',
    fetchImpl: mockNormalFetch,
    nowMs: baseNowMs,
    redemptionDirectory: testRedemptionDirectory
  });

  // B-02: Redemption creates one atomic on-disk record that survives process
  // restart (a second call does not depend on the original process-local Set).
  assert.ok(fs.readdirSync(testRedemptionDirectory).length >= 1);
  // B-02: Reusing the already-consumed grant is rejected fail-closed before any fetch call
  await assert.rejects(
    () => executeQualifiedArgonTwoCallDiscriminator({
      authorizeLiveCalls: true,
      operatorAuthorizationGrant: singleUseGrant,
      operatorPublicKeyPem: testPublicKeyPem,
      expectedHeadSha: actualGitHeadSha,
      apiKey: 'offline-mock-key',
      fetchImpl: async () => { throw new Error('must not call fetch on replayed grant'); },
      nowMs: baseNowMs,
      redemptionDirectory: testRedemptionDirectory
    }),
    /LIVE_EXPERIMENT_AUTHORIZATION_ALREADY_CONSUMED/
  );

  // B-01: Verify exact outbound CountTokensRequest wire payloads for S01 and S02
  assert.equal(capturedCountTokensBodies.length, 2);
  for (let i = 0; i < 2; i += 1) {
    const ctBody = capturedCountTokensBodies[i];
    const genBody = capturedStreamBodies[i];
    assert.deepEqual(Object.keys(ctBody), ['generateContentRequest']);
    assert.equal(ctBody.generateContentRequest.model, 'models/gemini-4-argon');
    assert.deepEqual(ctBody.generateContentRequest.systemInstruction, genBody.systemInstruction);
    assert.deepEqual(ctBody.generateContentRequest.contents, genBody.contents);
    assert.deepEqual(ctBody.generateContentRequest.generationConfig, genBody.generationConfig);
    assert.ok(JSON.stringify(ctBody.generateContentRequest.systemInstruction).length > 30000, 'countTokens request must include the full ~32KB system instruction');
  }

  assert.equal(runNormal.countTokensCallsDispatched, 2);
  assert.equal(runNormal.streamGenerateCallsDispatched, 2);
  assert.equal(runNormal.terminalStopReason, 'CALL_CAP_REACHED');
  assert.equal(runNormal.checkedOutHeadSha, actualGitHeadSha);
  assert.equal(runNormal.completedSlots.length, 2);
  assert.equal(runNormal.skippedSlots.length, 0);
  assert.equal(runNormal.completedSlots[0].wireObservation.bodySha256, FROZEN_STAGE1_SLOT_WIRE_MANIFEST.S01.bodySha256);
  assert.equal(runNormal.completedSlots[1].wireObservation.bodySha256, FROZEN_STAGE1_SLOT_WIRE_MANIFEST.S02.bodySha256);
  // B-02: Verify requestedModelAlias vs observedProviderModelVersion independence
  assert.equal(runNormal.completedSlots[0].requestedModelAlias, 'gemini-4-argon');
  assert.equal(runNormal.completedSlots[0].observedProviderModelVersion, 'gemini-4-argon-exp-202611');
  assert.equal(runNormal.completedSlots[1].requestedModelAlias, 'gemini-4-argon');
  assert.equal(runNormal.completedSlots[1].observedProviderModelVersion, null, 'absent provider modelVersion must never be synthesized from requested alias');
  assert.equal(runNormal.completedSlots[0].nativeSseEvidence.captureComplete, true);
  assert.equal(runNormal.completedSlots[0].nativeSseEvidence.textEquivalent, true);
  assert.equal(runNormal.completedSlots[1].nativeSseEvidence.captureComplete, true);
  assert.equal(runNormal.completedSlots[1].nativeSseEvidence.textEquivalent, true);
  assert.equal(runNormal.completedSlots[0].morphology.botsProsody.uniformPlanarDepthOneObserved, true);
  assert.equal(runNormal.completedSlots[1].morphology.botsProsody.uniformPlanarDepthOneObserved, false);
  assert.ok(runNormal.completedSlots[1].verticalOrnamentMarkCount > 0);
  assert.equal(runNormal.finalBudgetState.observedPromptTokensTotal, 6850 + 6810);
  assert.equal(runNormal.finalBudgetState.observedOutputAndThoughtTokensTotal, 2500 + 2750);
  assert.equal(runNormal.finalBudgetState.usageDeviations.length, 0);
  assert.equal(runNormal.blindedEvaluation.blindedPackets.length, 2);
  assert.equal(runNormal.blindedEvaluation.unblindingKey.length, 2);
  for (const packet of runNormal.blindedEvaluation.blindedPackets) {
    assert.equal('arm' in packet, false, 'blinded packet must not expose arm identity');
    assert.equal('slot' in packet, false, 'blinded packet must not expose slot identity');
    assert.equal(packet.requestedModelAlias, 'gemini-4-argon');
  }

  // (c) B-01: When :countTokens returns 404 or 501, runner FAILS CLOSED before paid generation (never falls back to 36,000-byte wire cap)
  for (const unsupportedStatus of [404, 501]) {
    const runUnsupportedCount = await executeQualifiedArgonTwoCallDiscriminator({
      authorizeLiveCalls: true,
      operatorAuthorizationGrant: makeValidGrant(),
      operatorPublicKeyPem: testPublicKeyPem,
      expectedHeadSha: actualGitHeadSha,
      apiKey: 'offline-mock-key',
      nowMs: baseNowMs,
      redemptionDirectory: testRedemptionDirectory,
      fetchImpl: async (url) => {
        if (String(url) === geminiCountTokensUrl('gemini-4-argon')) {
          return new Response(JSON.stringify({ error: { code: unsupportedStatus, message: 'countTokens unsupported' } }), {
            status: unsupportedStatus,
            headers: { 'content-type': 'application/json' }
          });
        }
        throw new Error(`streamGenerateContent must NOT be called when countTokens returns ${unsupportedStatus}`);
      }
    });
    assert.equal(runUnsupportedCount.countTokensCallsDispatched, 1);
    assert.equal(runUnsupportedCount.streamGenerateCallsDispatched, 0, `must fail closed with 0 generation calls on countTokens HTTP ${unsupportedStatus}`);
    assert.equal(runUnsupportedCount.terminalStopReason, 'STOP_ON_COUNT_TOKENS_UNSUPPORTED_FAIL_CLOSED');
    assert.equal(runUnsupportedCount.skippedSlots.length, 2);
  }

  // (d) Pre-dispatch :countTokens returning > 8000 halts BEFORE :streamGenerateContent is called
  const runOverCount = await executeQualifiedArgonTwoCallDiscriminator({
    authorizeLiveCalls: true,
    operatorAuthorizationGrant: makeValidGrant(),
    operatorPublicKeyPem: testPublicKeyPem,
    expectedHeadSha: actualGitHeadSha,
    apiKey: 'offline-mock-key',
    nowMs: baseNowMs,
    redemptionDirectory: testRedemptionDirectory,
    fetchImpl: async (url) => {
      if (String(url) === geminiCountTokensUrl('gemini-4-argon')) {
        return new Response(JSON.stringify({ totalTokens: 8900 }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      }
      throw new Error('streamGenerateContent must NOT be called when countTokens exceeds 8000');
    }
  });
  assert.equal(runOverCount.countTokensCallsDispatched, 1);
  assert.equal(runOverCount.streamGenerateCallsDispatched, 0);
  assert.equal(runOverCount.terminalStopReason, 'PRECALL_COUNT_TOKENS_EXCEEDED_SLOT_CEILING');
  assert.equal(runOverCount.skippedSlots.length, 2);

  // (e) Slot 1 returning over-cap output+thought usage (19500 > 16384) records full 19500 un-clamped and halts BEFORE Slot 2
  const runOverUsage = await executeQualifiedArgonTwoCallDiscriminator({
    authorizeLiveCalls: true,
    operatorAuthorizationGrant: makeValidGrant(),
    operatorPublicKeyPem: testPublicKeyPem,
    expectedHeadSha: actualGitHeadSha,
    apiKey: 'offline-mock-key',
    nowMs: baseNowMs,
    redemptionDirectory: testRedemptionDirectory,
    fetchImpl: async (url) => {
      const href = String(url);
      if (href === geminiCountTokensUrl('gemini-4-argon')) {
        return new Response(JSON.stringify({ totalTokens: 6850 }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return makeSseResponse([
        {
          candidates: [{ content: { parts: [{ text: s01PlanarText }] }, finishReason: 'MAX_TOKENS' }],
          usageMetadata: { promptTokenCount: 6850, candidatesTokenCount: 14500, thoughtsTokenCount: 5000, totalTokenCount: 26350 },
          modelVersion: 'gemini-4-argon-001'
        }
      ]);
    }
  });
  assert.equal(runOverUsage.streamGenerateCallsDispatched, 1, 'Slot 2 must NOT run after Slot 1 usage cap deviation');
  assert.equal(runOverUsage.terminalStopReason, 'STOP_ON_PROVIDER_USAGE_CAP_DEVIATION');
  assert.equal(runOverUsage.finalBudgetState.consumedOutputAndThoughtTokens, 19500);
  assert.equal(runOverUsage.skippedSlots.length, 1);
  assert.equal(runOverUsage.skippedSlots[0].slot, 'S02');

  // (f) Slot 1 returning PROHIBITED_CONTENT halts BEFORE Slot 2
  const runPolicyStop = await executeQualifiedArgonTwoCallDiscriminator({
    authorizeLiveCalls: true,
    operatorAuthorizationGrant: makeValidGrant(),
    operatorPublicKeyPem: testPublicKeyPem,
    expectedHeadSha: actualGitHeadSha,
    apiKey: 'offline-mock-key',
    nowMs: baseNowMs,
    redemptionDirectory: testRedemptionDirectory,
    fetchImpl: async (url) => {
      const href = String(url);
      if (href === geminiCountTokensUrl('gemini-4-argon')) {
        return new Response(JSON.stringify({ totalTokens: 6850 }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return makeSseResponse([
        {
          candidates: [{ content: { parts: [] }, finishReason: 'PROHIBITED_CONTENT' }],
          usageMetadata: { promptTokenCount: 6850, candidatesTokenCount: 0, thoughtsTokenCount: 120, totalTokenCount: 6970 },
          modelVersion: 'gemini-4-argon-001'
        }
      ]);
    }
  });
  assert.equal(runPolicyStop.streamGenerateCallsDispatched, 1, 'Slot 2 must NOT run after Slot 1 policy block');
  assert.equal(runPolicyStop.terminalStopReason, 'STOP_ON_POLICY_TERMINATION');
  assert.equal(runPolicyStop.skippedSlots.length, 1);
  assert.equal(runPolicyStop.skippedSlots[0].slot, 'S02');
});

test('RP-06 & RP-07: classifyMarrowlineClientFailure separates background disconnect (OUTCOME_UNKNOWN) from 225s timeout and foreground failure, and The Screaming Grove is formalized across UI while preserving legacy default migration', async () => {
  // RP-06: Background disconnect vs foreground network error vs 225s client timeout
  const bgDisconnect = classifyMarrowlineClientFailure(
    new TypeError('WebKit background socket closed'),
    'request',
    null,
    { hiddenDuringRequest: true, deadlineTimedOut: false }
  );
  assert.equal(bgDisconnect.backgroundInterrupted, true);
  assert.equal(bgDisconnect.outcomeState, 'OUTCOME_UNKNOWN');
  assert.equal(bgDisconnect.serverExecutionState, 'REQUEST_MAY_STILL_BE_RUNNING');
  assert.equal(bgDisconnect.automaticRetrySuppressed, true);
  assert.equal(bgDisconnect.diagnostic.code, 'background-connection-interrupted-outcome-unknown');
  assert.equal(
    boundedFailureMessage(bgDisconnect),
    'The browser disconnected while in the background. Your message is saved, and no duplicate request was sent. Retry when you want to send a new request.'
  );

  // WebKit background AbortError (before 225s deadline) is also classified as OUTCOME_UNKNOWN, not a 225s timeout
  const bgAbort = classifyMarrowlineClientFailure(
    Object.assign(new Error('Background fetch aborted by OS'), { name: 'AbortError' }),
    'response-body',
    200,
    { hiddenDuringRequest: true, deadlineTimedOut: false }
  );
  assert.equal(bgAbort.backgroundInterrupted, true);
  assert.equal(bgAbort.outcomeState, 'OUTCOME_UNKNOWN');
  assert.equal(bgAbort.error, 'response-body-failed');

  // Actual 225s deadline timeout (even while hidden) is CLIENT_DEADLINE_EXCEEDED
  const deadlineTimeout = classifyMarrowlineClientFailure(
    Object.assign(new Error('225s timer expired'), { name: 'AbortError' }),
    'request',
    null,
    { hiddenDuringRequest: true, deadlineTimedOut: true }
  );
  assert.equal(deadlineTimeout.error, 'request-timeout');
  assert.equal(deadlineTimeout.outcomeState, 'CLIENT_DEADLINE_EXCEEDED');
  assert.equal(deadlineTimeout.backgroundInterrupted, undefined);
  assert.equal(boundedFailureMessage(deadlineTimeout), 'The reply took too long. Your message is saved.');

  // Foreground network failure is KNOWN_FAILED
  const fgNetwork = classifyMarrowlineClientFailure(
    new TypeError('Failed to fetch'),
    'request',
    null,
    { hiddenDuringRequest: false, deadlineTimedOut: false }
  );
  assert.equal(fgNetwork.error, 'network-request-failed');
  assert.equal(fgNetwork.outcomeState, 'KNOWN_FAILED');
  assert.equal(fgNetwork.backgroundInterrupted, undefined);
  assert.equal(boundedFailureMessage(fgNetwork), 'The connection was interrupted. Your message is saved.');

  // RP-07: Formalize "The Screaming Grove" while preserving legacy "The speaking grove" migration & internal selectors
  assert.equal(DEFAULT_MARROWLINE_TITLE, 'The Screaming Grove');
  assert.equal(LEGACY_DEFAULT_MARROWLINE_TITLE, 'The speaking grove');
  assert.equal(deriveMarrowlineConversationTitle(''), 'The Screaming Grove');
  assert.equal(isDefaultMarrowlineTitle(''), true);
  assert.equal(isDefaultMarrowlineTitle('The Screaming Grove'), true);
  assert.equal(isDefaultMarrowlineTitle('The speaking grove'), true);
  assert.equal(isDefaultMarrowlineTitle('Operator Custom Title'), false);

  const html = fs.readFileSync('app/dome-world/marrowline.html', 'utf8');
  assert.match(html, /<title>Marrowline · The Screaming Grove<\/title>/);
  assert.match(html, /<h2 id="marrowlineConversationTitle">The Screaming Grove<\/h2>/);
  assert.match(html, /id="speakingPanel"/, 'internal selector #speakingPanel must remain untouched');
  assert.match(html, /class="ritual-panel speaking-vessel"/, 'internal class .speaking-vessel must remain untouched');
  assert.doesNotMatch(html, /The speaking grove/);

  const desktopRepairJs = fs.readFileSync('app/dome-world/marrowline-desktop-repair.js', 'utf8');
  assert.match(desktopRepairJs, /utility\('marrowlineHomeLanding', '𖠿', 'Return to The Screaming Grove'\)/);

  // Thread library prunes empty phantoms and migrates completed records for BOTH legacy and new defaults
  const map = new Map();
  const storage = {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k)
  };
  let seq = 0;
  const lib = await createMarrowlineThreadLibrary({
    localStorage: storage,
    sessionStorage: storage,
    crypto: { randomUUID: () => `rp07-thread-${++seq}` }
  });
  const legacyPhantom = await lib.create({ conversationTitle: 'The speaking grove' });
  const newPhantom = await lib.create({ conversationTitle: 'The Screaming Grove' });
  const legacyCompleted = await lib.create({
    conversationTitle: 'The speaking grove',
    messages: [
      { role: 'user', text: 'Explain how shoreline custody differs from external origin.' },
      { role: 'model', text: 'Kʰonapolit\nCustody is internal.' }
    ]
  });
  const operatorNamedLegacy = await lib.create({
    conversationTitle: 'The speaking grove',
    titleSource: 'operator'
  });

  assert.equal(await lib.pruneEmptyGeneratedThreads(), 2);
  assert.equal(await lib.get(legacyPhantom.id), null);
  assert.equal(await lib.get(newPhantom.id), null);
  assert.equal(await lib.migrateLegacyGeneratedTitles(), 1);
  const migratedCompleted = await lib.get(legacyCompleted.id);
  assert.notEqual(migratedCompleted.conversationTitle, 'The speaking grove');
  assert.notEqual(migratedCompleted.conversationTitle, 'The Screaming Grove');
  assert.equal((await lib.get(operatorNamedLegacy.id)).conversationTitle, 'The speaking grove');
  lib.close();

  // Full JSDOM browser-lifecycle verification for RP-06 (background disconnect, hidden arrival, and reload while in-flight)
  const flushDom = () => new Promise((resolve) => setTimeout(resolve, 0));
  const waitUntil = async (fn) => {
    const deadline = Date.now() + 2500;
    while (!fn()) {
      if (Date.now() > deadline) throw new Error('JSDOM lifecycle condition timed out');
      await flushDom();
    }
  };
  const replyUnicode = 'Kʰonapolit\nThe route holds through Khona\u200Clit-po.\n\nTauric Diana bots\nT\u0300\u0301\u0316A\u0304\u0307\u0323U\u0305\u0308\u0325R\u0303\u030A\u0326I\u0302\u0317C\u030B\u031C VOICE SURVIVES.';
  const makeSuccessPayload = () => ({
    ok: true,
    text: replyUnicode,
    relay: {
      schema: 'td613.khonapolit.integrated-covenant-relay/v23-causal-prosody-observation',
      apertureHeader: 'TD613 APERTURE v3.2-alpha · OPEN_FIELD_CREATIVE_SYNTHESIS · RUNTIME BACKGROUND',
      signal: { state: 'LOCKED', downstreamAdmitted: true },
      admission: { admissible: true, reasons: [] },
      parts: [{ id: 'khonapolit', label: 'Kʰonapolit ∴ Tauric Diana bots', present: true, text: replyUnicode, integrated: true, providerNative: true, voices: ['Kʰonapolit', 'Tauric Diana bots'], flourishMode: 'provider-native' }]
    },
    receipt: {
      provider: { model: 'gemini-3.8-flash', completion: { complete: true, reason: 'provider-stop' } },
      relay: { signal: { state: 'LOCKED' } },
      seal: { state: 'OPEN' }
    }
  });

  // Scenario 1: Background socket disconnect on mobile -> 0 automatic duplicate calls on return, OUTCOME_UNKNOWN receipt, explicit retry succeeds
  const dom1 = new JSDOM(html, { url: 'https://td613.com/dome-world/marrowline.html' });
  const win1 = dom1.window;
  const doc1 = win1.document;
  doc1.getElementById('marrowlineLivingGeometry')?.remove();
  win1.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
  win1.HTMLElement.prototype.scrollIntoView = function () {};
  const postCalls1 = [];
  const postOpts1 = [];
  win1.fetch = async (url, options = {}) => {
    if (!options.method) return { ok: true, status: 200, text: async () => 'CORPUS', json: async () => ({ hasGeminiKey: true, modelPolicy: { callableModels: ['gemini-3.8-flash'] } }) };
    postCalls1.push(JSON.parse(options.body));
    postOpts1.push(options);
    if (postCalls1.length === 1) {
      Object.defineProperty(doc1, 'visibilityState', { configurable: true, value: 'hidden' });
      doc1.dispatchEvent(new win1.Event('visibilitychange'));
      win1.dispatchEvent(new win1.Event('pagehide'));
      Object.defineProperty(doc1, 'visibilityState', { configurable: true, value: 'visible' });
      doc1.dispatchEvent(new win1.Event('visibilitychange'));
      win1.dispatchEvent(new win1.Event('pageshow'));
      win1.dispatchEvent(new win1.Event('online'));
      throw new TypeError('iOS background socket closed');
    }
    return { ok: true, status: 200, json: async () => makeSuccessPayload() };
  };
  try {
    installKhonapolitTerminal(doc1, win1);
    await win1.__TD613_MARROWLINE_THREADS__.ready;
    assert.equal(doc1.title, 'Marrowline · The Screaming Grove');
    assert.equal(doc1.getElementById('marrowlineConversationTitle').textContent, 'The Screaming Grove');
    const prompt1 = doc1.getElementById('khonapolitPrompt');
    prompt1.value = 'Keep this mobile generation safe across a 30s lock screen.';
    doc1.getElementById('khonapolitForm').dispatchEvent(new win1.Event('submit', { bubbles: true, cancelable: true }));
    await waitUntil(() => doc1.getElementById('khonapolitSend').dataset.transmissionState === 'ready'
      && doc1.getElementById('khonapolitTerminalStatus').dataset.phase === 'held');
    await flushDom();
    assert.equal(postOpts1[0].keepalive, false);
    assert.ok(postOpts1[0].headers['X-TD613-Episode-Id']);
    assert.equal(postOpts1[0].headers['X-TD613-Transport-Stream'], 'heartbeat-v1');
    assert.equal(postCalls1.length, 1, 'RP-06: must NOT dispatch an automatic second paid provider request on background return');
    const fail1 = win1.__TD613_KHONAPOLIT_LAST_FAILURE__;
    assert.equal(fail1.backgroundInterrupted, true);
    assert.equal(fail1.outcomeState, 'OUTCOME_UNKNOWN');
    assert.equal(fail1.serverExecutionState, 'REQUEST_MAY_STILL_BE_RUNNING');
    assert.equal(fail1.automaticRetrySuppressed, true);
    assert.equal(JSON.parse(doc1.getElementById('khonapolitReceipt').textContent).status, 'CURRENT_REQUEST_OUTCOME_UNKNOWN');
    assert.equal(prompt1.value, 'Keep this mobile generation safe across a 30s lock screen.');

    // Explicit operator retry sends Call 2 and admits the reply without duplicating the user turn
    doc1.getElementById('retryKhonapolitTask').click();
    await waitUntil(() => postCalls1.length === 2
      && doc1.getElementById('khonapolitSend').dataset.transmissionState === 'ready'
      && doc1.getElementById('khonapolitTerminalStatus').dataset.phase === 'received');
    await flushDom();
    assert.equal(postCalls1.length, 2);
    assert.equal(doc1.querySelectorAll('#khonapolitMessages article[data-role="user"]').length, 1);
    assert.equal(doc1.querySelectorAll('#khonapolitMessages article.relay-message').length, 1);
    assert.equal(doc1.querySelector('#khonapolitMessages .relay-stage-text').textContent, replyUnicode);

    // Scenario 2: Response arrives while hidden -> preserved with 1 call and exact Unicode
    Object.defineProperty(doc1, 'visibilityState', { configurable: true, value: 'hidden' });
    doc1.dispatchEvent(new win1.Event('visibilitychange'));
    prompt1.value = 'Second turn completes while hidden.';
    doc1.getElementById('khonapolitForm').dispatchEvent(new win1.Event('submit', { bubbles: true, cancelable: true }));
    await waitUntil(() => postCalls1.length === 3
      && doc1.getElementById('khonapolitSend').dataset.transmissionState === 'ready'
      && doc1.getElementById('khonapolitTerminalStatus').dataset.phase === 'received');
    Object.defineProperty(doc1, 'visibilityState', { configurable: true, value: 'visible' });
    doc1.dispatchEvent(new win1.Event('visibilitychange'));
    await flushDom();
    assert.equal(postCalls1.length, 3, 'hidden completion makes zero extra calls on return');
    assert.equal(doc1.querySelectorAll('#khonapolitMessages article.relay-message').length, 2);
  } finally {
    dom1.window.close();
  }

  // Scenario 3: Page discard / reload while a turn was in-flight -> restores thread with OUTCOME_UNKNOWN and 0 automatic calls
  const dom2 = new JSDOM(html, { url: 'https://td613.com/dome-world/marrowline.html' });
  const win2 = dom2.window;
  const doc2 = win2.document;
  doc2.getElementById('marrowlineLivingGeometry')?.remove();
  win2.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
  win2.HTMLElement.prototype.scrollIntoView = function () {};
  const postCalls2 = [];
  win2.fetch = async (url, options = {}) => {
    if (!options.method) return { ok: true, status: 200, text: async () => 'CORPUS', json: async () => ({ hasGeminiKey: true, modelPolicy: { callableModels: ['gemini-3.8-flash'] } }) };
    postCalls2.push(JSON.parse(options.body));
    return { ok: true, status: 200, json: async () => makeSuccessPayload() };
  };
  try {
    const preReloadLib = await createMarrowlineThreadLibrary(win2);
    const inFlightRecord = await preReloadLib.create({
      messages: [{ role: 'user', text: 'In-flight task before iOS tab reload.', mode: 'issued-conjunction', sealed: false }],
      pendingTask: 'In-flight task before iOS tab reload.',
      lastReceipt: null,
      lastFailure: null,
      conversationTitle: '',
      titleSource: 'pending-return',
      draft: ''
    });
    preReloadLib.setActiveId(inFlightRecord.id);
    preReloadLib.close();

    installKhonapolitTerminal(doc2, win2);
    await win2.__TD613_MARROWLINE_THREADS__.ready;
    await flushDom();
    assert.equal(postCalls2.length, 0, 'page reload must NEVER automatically re-submit an in-flight task');
    const reloadFailure = win2.__TD613_KHONAPOLIT_LAST_FAILURE__;
    assert.ok(reloadFailure);
    assert.equal(reloadFailure.error, 'page-lifecycle-interrupted');
    assert.equal(reloadFailure.pageReloadInterrupted, true);
    assert.equal(reloadFailure.outcomeState, 'OUTCOME_UNKNOWN');
    assert.equal(reloadFailure.serverExecutionState, 'REQUEST_MAY_STILL_BE_RUNNING');
    assert.equal(JSON.parse(doc2.getElementById('khonapolitReceipt').textContent).status, 'CURRENT_REQUEST_OUTCOME_UNKNOWN');
    assert.equal(doc2.getElementById('khonapolitPrompt').value, 'In-flight task before iOS tab reload.');
  } finally {
    dom2.window.close();
  }
});
