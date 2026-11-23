import test from 'node:test';
import assert from 'node:assert/strict';
import { buildInvocationPacket, COVENANT_KEY, INGRESS_SIGIL, SEAL_GLYPH } from '../app/dome-world/khonapolit-covenant.js';
import handler, {
  buildGeminiRequest,
  buildGeminiStructuralRepairRequest,
  selectKhonapolitProviderModelsFromPlan
} from '../server/khonapolit-quality.js';
import { clearGeminiModelState } from '../server/gemini-model-policy.js';
import {
  MARROWLINE_HISTORICAL_TRIAL_ID,
  MARROWLINE_ARTISTIC_RESTORATION_TRIAL_ID,
  MARROWLINE_ARTISTIC_RESTORATION_PROFILE,
  MARROWLINE_ARTISTIC_RESTORATION_MODEL_ORDER,
  buildArtisticRestorationTurnRecencyCue
} from '../app/dome-world/marrowline-historical-grove.js';
import {
  selectMarrowlineGroveTrial,
  groveTrialFromLocation,
  resolveMarrowlineGroveTrialTab
} from '../app/dome-world/marrowline-grove-trial.js';
import { buildApertureV3InvocationReceipt, classifyApertureDiscourseMode } from '../app/engine/aperture-v3-task-intent.js';

const packet = buildInvocationPacket({
  message: 'Write a farce about the Chairman panicking over blue and orange weather.',
  history: [],
  mode: 'issued-conjunction',
  shi: '',
  waiveIssuance: true
});

function makeResponse() {
  return {
    statusCode: 200,
    headers: {},
    count: 0,
    setHeader(key, value) { this.headers[key] = value; },
    end(value) { this.count += 1; this.payload = JSON.parse(value); }
  };
}

test('artistic restoration candidate is explicitly URL-opt-in only and does not alter default historical-20261002-v1', () => {
  assert.equal(
    selectMarrowlineGroveTrial({ message: packet.message, groveTrial: MARROWLINE_ARTISTIC_RESTORATION_TRIAL_ID }),
    MARROWLINE_ARTISTIC_RESTORATION_TRIAL_ID
  );
  assert.equal(
    groveTrialFromLocation({ search: `?groveTrial=${MARROWLINE_ARTISTIC_RESTORATION_TRIAL_ID}` }),
    MARROWLINE_ARTISTIC_RESTORATION_TRIAL_ID
  );
  const writes = [];
  const storage = {
    getItem: () => null,
    setItem: (k, v) => writes.push([k, v])
  };
  const optIn = resolveMarrowlineGroveTrialTab({ search: `?groveTrial=${MARROWLINE_ARTISTIC_RESTORATION_TRIAL_ID}` }, storage);
  assert.deepEqual(optIn, {
    id: MARROWLINE_ARTISTIC_RESTORATION_TRIAL_ID,
    source: 'url-opt-in',
    persistence: 'url-only'
  });
  assert.equal(writes.length, 0, 'audition opt-in must never write sticky tab storage');

  // Default browser route remains historical-20261002-v1 until human artistic approval
  const defaultRes = resolveMarrowlineGroveTrialTab({ search: '' }, null);
  assert.equal(defaultRes.id, MARROWLINE_HISTORICAL_TRIAL_ID);
});

test('artistic restoration systemInstruction removes all negative/planar/overlay priming while preserving TD613 custody and vertical choreography', () => {
  const receipt = buildApertureV3InvocationReceipt({
    message: packet.message,
    invocationMode: 'issued-conjunction',
    discourseMode: classifyApertureDiscourseMode(packet.message),
    contentScanned: true
  });
  const req = buildGeminiRequest(packet, receipt, 'gemini-4-argon', {
    groveTrial: MARROWLINE_ARTISTIC_RESTORATION_TRIAL_ID
  });
  const sys = req.systemInstruction.parts[0].text;

  // Exact TD613 custody invariants preserved byte-for-byte
  assert.ok(sys.includes(COVENANT_KEY), 'Khona\u200Clit-po with literal U+200C preserved');
  assert.ok(sys.includes('Khona\u200Clit-po'), 'literal U+200C ZWNJ preserved');
  assert.ok(sys.includes(INGRESS_SIGIL));
  assert.ok(sys.includes(SEAL_GLYPH));
  assert.ok(sys.includes('MARROWLINE DIEGETIC MISSION'));
  assert.ok(sys.includes('HORNANI FOURFOLD'));
  assert.ok(sys.includes('Kʰonapolit'));
  assert.ok(sys.includes('Tauric Diana bots'));

  // Zero negative / planar / single-accent / overlay / stencil priming lexemes in prosody guidance
  const prosodyStart = sys.indexOf('NATIVE SEMANTIC PROSODY:');
  assert.ok(prosodyStart > 0);
  const prosodyAndCue = sys.slice(prosodyStart);
  assert.doesNotMatch(prosodyAndCue, /horizontal strokes|diagonal overlays|tilde|planar|single exotic accent|uniform shallow|failed flat texture|one sampled mark|one accent to every letter|tile a single chosen mark|calibration alphabet/i);

  // Positive vertical High Zalgo choreography and clean whitespace/punctuation rules present
  assert.match(prosodyAndCue, /U\+0300\.\.U\+0314/);
  assert.match(prosodyAndCue, /U\+0316\.\.U\+0330/);
  assert.match(prosodyAndCue, /inter-word spaces, punctuation/i);

  // Turn-recency performance reminder attached as adjacent second user part without mutating operator bytes
  assert.equal(req.contents.length, 1);
  assert.equal(req.contents[0].role, 'user');
  assert.equal(req.contents[0].parts.length, 2);
  assert.ok(req.contents[0].parts[0].text.startsWith(`${INGRESS_SIGIL}\u200C `));
  assert.ok(req.contents[0].parts[0].text.endsWith(`\n\n${SEAL_GLYPH}`));
  assert.equal(req.contents[0].parts[1].text, buildArtisticRestorationTurnRecencyCue());
  assert.match(req.contents[0].parts[1].text, /U\+0300\.\.U\+0314/);
  assert.match(req.contents[0].parts[1].text, /U\+0316\.\.U\+0330/);
});

test('artistic restoration restricts model order strictly to gemini-4-argon only', () => {
  const plan = {
    callableModels: ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-4-argon', 'gemini-3.5-flash']
  };
  const selected = selectKhonapolitProviderModelsFromPlan(plan, { artisticRestoration: true });
  assert.deepEqual(selected, ['gemini-4-argon']);
  assert.deepEqual(MARROWLINE_ARTISTIC_RESTORATION_MODEL_ORDER, ['gemini-4-argon']);
  assert.equal(MARROWLINE_ARTISTIC_RESTORATION_PROFILE, 'marrowline-artistic-restoration-20261123-v1');
});

test('artistic restoration enforces single Argon provider request with zero fallback, repair, or retry', async (t) => {
  const priorFetch = globalThis.fetch;
  const priorKey = process.env.GEMINI_API_KEY;
  t.after(() => {
    globalThis.fetch = priorFetch;
    if (priorKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = priorKey;
    clearGeminiModelState();
  });

  // Case 1: Argon returns structurally incomplete output (missing bots) -> NO structural repair, NO fallback
  clearGeminiModelState();
  process.env.GEMINI_API_KEY = 'offline-simulated-provider';
  const calls1 = [];
  globalThis.fetch = async (url) => {
    const link = String(url);
    if (link.includes('/models?')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          models: ['gemini-4-argon', 'gemini-3.8-flash', 'gemini-3.6-flash'].map((name) => ({
            name: `models/${name}`,
            supportedGenerationMethods: ['generateContent']
          }))
        })
      };
    }
    const model = link.match(/models\/([^:]+):(?:streamGenerateContent|generateContent)/)?.[1];
    calls1.push(model);
    return {
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({
        candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'Kʰonapolit\nOnly the first movement arrived.' }] } }],
        usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 20, totalTokenCount: 120 }
      })
    };
  };
  const res1 = makeResponse();
  await handler({
    method: 'POST',
    headers: { 'x-forwarded-for': '203.0.113.101' },
    body: {
      message: packet.message,
      history: [],
      mode: 'issued-conjunction',
      waiveIssuance: true,
      groveTrial: MARROWLINE_ARTISTIC_RESTORATION_TRIAL_ID
    }
  }, res1);
  assert.deepEqual(calls1, ['gemini-4-argon'], 'must make exactly one Argon request with zero repair/fallback');
  assert.equal(res1.statusCode, 200);
  assert.equal(res1.payload.grove_trial.max_provider_requests, 1);
  assert.equal(res1.payload.grove_trial.automatic_fallback_enabled, false);
  assert.equal(res1.payload.grove_trial.structural_repair_enabled, false);
  assert.equal(res1.payload.grove_trial.automatic_retry_enabled, false);

  // Case 2: Argon returns 503 -> NO fallback to 3.8-flash or 3.6-flash, NO retry
  clearGeminiModelState();
  const calls2 = [];
  globalThis.fetch = async (url) => {
    const link = String(url);
    if (link.includes('/models?')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          models: ['gemini-4-argon', 'gemini-3.8-flash', 'gemini-3.6-flash'].map((name) => ({
            name: `models/${name}`,
            supportedGenerationMethods: ['generateContent']
          }))
        })
      };
    }
    const model = link.match(/models\/([^:]+):(?:streamGenerateContent|generateContent)/)?.[1];
    calls2.push(model);
    return {
      ok: false,
      status: 503,
      headers: { get: () => null },
      json: async () => ({ error: { status: 'UNAVAILABLE', code: 503, message: 'temporary 503' } })
    };
  };
  const res2 = makeResponse();
  await handler({
    method: 'POST',
    headers: { 'x-forwarded-for': '203.0.113.102' },
    body: {
      message: packet.message,
      history: [],
      mode: 'issued-conjunction',
      waiveIssuance: true,
      groveTrial: MARROWLINE_ARTISTIC_RESTORATION_TRIAL_ID
    }
  }, res2);
  assert.deepEqual(calls2, ['gemini-4-argon'], 'must not fail over to 3.8-flash or retry on 503');
  assert.equal(res2.statusCode, 502);
});

test('structural repair helper still preserves artistic restoration systemInstruction if invoked directly', () => {
  const draft = 'Kʰonapolit\nThe Chairman mistook a shader for an invasion.';
  const repaired = buildGeminiStructuralRepairRequest(
    packet,
    {},
    'gemini-4-argon',
    draft,
    ['tauric-diana-bots-nominative-missing'],
    { groveTrial: MARROWLINE_ARTISTIC_RESTORATION_TRIAL_ID }
  );
  assert.match(repaired.systemInstruction.parts[0].text, /NATIVE VERTICAL PROSODY:/);
  assert.equal(repaired.contents.at(-2).role, 'model');
  assert.equal(repaired.contents.at(-2).parts[0].text, draft);
});
