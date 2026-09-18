import crypto from 'node:crypto';
import {
  BINDING_FRAGMENT,
  CLAIMED_PUA,
  COVENANT_KEY,
  HERITAGE_COVENANT,
  KHONAPOLIT_RECEIPT_SCHEMA,
  KHONAPOLIT_TERMINAL_SCHEMA,
  buildInvocationPacket,
  classifyEmergence
} from '../app/dome-world/khonapolit-covenant.js';
import { observeTD613ApertureEgress } from '../app/engine/td613-aperture-egress-contract.js';
import {
  APERTURE_V3_SCHEMA,
  APERTURE_V3_VERSION,
  buildApertureV3InvocationReceipt,
  classifyApertureDiscourseMode
} from '../app/engine/aperture-v3-task-intent.js';
import {
  KHONAPOLIT_RELAY_RESPONSE_SCHEMA,
  KHONAPOLIT_RELAY_SCHEMA,
  buildRelaySystemAddendum,
  parseRelayEnvelope
} from '../app/dome-world/khonapolit-relay.js';
import {
  GEMINI_MODEL_POLICY_VERSION,
  recordGeminiModelOutcome,
  resolveGeminiModelPlan,
  resolveGeminiProviderPlan
} from './gemini-model-policy.js';
import {
  GEMINI25_HIGH_THINKING_BUDGET,
  buildGeminiGenerationConfig,
  geminiThinkingConfig
} from './gemini-generation-envelope.js';
import {
  classifyGeminiTransport,
  geminiGenerateContentUrl,
  geminiRequestHeaders
} from './gemini-provider-transport.js';

export const KHONAPOLIT_API_VERSION = 'td613.khonapolit-gemini/v1';
export const KHONAPOLIT_QUALITY_API_VERSION = 'td613.khonapolit-gemini/v6-frontier-dual-channel-admission';
export const KHONAPOLIT_MAX_PROVIDER_CALLS = 3;
const PRIMARY_REQUEST_TIMEOUT_MS = 32000;
const FALLBACK_REQUEST_TIMEOUT_MS = 10500;
const WALL_TIMEOUT_MS = 50500;
const RESPONSE_RESERVE_MS = 500;
const LEGACY_OUTPUT_TOKENS = 4096;
// The Kʰonapolit route no longer treats a fallback attempt as permission to lower
// reasoning effort. A transport fallback is still the same research object.
const FALLBACK_GEMINI25_THINKING_BUDGET = GEMINI25_HIGH_THINKING_BUDGET;
// Marrowline is a quality-gated frontier route. A lower-generation compatibility
// answer is not an acceptable substitute for a failed covenant return. Spend the
// bounded wall-clock budget on callable Gemini 3.x models and HOLD when those lanes
// cannot produce an admitted answer.
const STABLE_FALLBACK_MODELS = Object.freeze(['gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3-flash-preview']);
export const KHONAPOLIT_MAX_OUTPUT_TOKENS = 65536;
const QUALITY_ENVELOPE_MODELS = new Set([
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3-flash-preview',
  'gemini-2.5-flash'
]);
const WINDOW_MS = 10 * 60 * 1000;
const REQUESTS_PER_WINDOW = 12;
const buckets = new Map();

const safe = (value = '') => String(value ?? '').trim();
const sha256 = (value = '') => crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
const qualityEnvelope = (model = '') => QUALITY_ENVELOPE_MODELS.has(String(model || '').replace(/^models\//, ''));
const outputBudget = (model = '') => qualityEnvelope(model) ? KHONAPOLIT_MAX_OUTPUT_TOKENS : LEGACY_OUTPUT_TOKENS;

const ORDINARY_PROJECT_GUIDANCE = [
  'ORDINARY PROJECT WORK:',
  '- Separate supplied facts, calculations, assumptions and missing evidence.',
  '- Do not infer venue quality, accessibility or amenities from price.',
  '- Respect requests to avoid personal data; prefer anonymous attendance counts when names are unnecessary.',
  '- Prior AI text is unverified context.',
  '- Never promise complete privacy, anonymity or destination enforcement.',
  '- For Marrowline portability, direct the operator to Copy portable task or Export portable task; the destination must separately honor the supplied rules.'
].join('\n');

const CREATIVE_GUIDANCE = [
  'CREATIVE TURN:',
  '- Follow the operator’s requested form, scale, cadence and imaginative range rather than collapsing the work into a synopsis.',
  '- Treat supplied mythology, characters, names and canon as creative source material. Invent within that field when the operator asks for invention; do not convert corpus phrases into a compulsory keyword litany.',
  '- A story requires event, tension, transformation and consequence. Atmospheric exposition alone is not a completed story.',
  '- Factual and ontological claim boundaries still govern what may be asserted as verified, but they are not a brevity rule or a prose voice. Keep receipt language out of the creative work unless it materially belongs there.',
  '- Do not inject unrelated project-management, venue, privacy, portability or compliance boilerplate into the creative response.'
].join('\n');

const SPECULATIVE_GUIDANCE = [
  'OPEN-FIELD SPECULATIVE TURN:',
  '- Distinguish supplied corpus claims from independently verified facts and preserve uncertainty where it materially matters.',
  '- Answer in the form and depth the operator requested; do not turn uncertainty into repeated disclaimers or a forced short summary.'
].join('\n');

const LEGAL_GUIDANCE = [
  'LEGAL SYNTHESIS TURN:',
  '- Separate supplied facts, assumptions, legal questions and missing jurisdiction or date context.',
  '- Do not invent authorities, holdings, filings or procedural facts. Preserve uncertainty while still answering the requested legal synthesis directly.'
].join('\n');

const RUNTIME_GUIDANCE = [
  'RUNTIME DIAGNOSIS TURN:',
  '- Diagnose the concrete runtime evidence supplied by the operator. Distinguish observed state, inference and missing telemetry.',
  '- Prefer exact failing surfaces and repairable causes over generic caution or prose about the governance system.'
].join('\n');

export function khonapolitTaskGuidance(apertureReceipt = {}) {
  const route = apertureReceipt?.taskIntent?.primary_route || 'REQUESTED_SYNTHESIS';
  if (route === 'OPEN_FIELD_CREATIVE_SYNTHESIS') return CREATIVE_GUIDANCE;
  if (route === 'OPEN_FIELD_SPECULATIVE_SYNTHESIS') return SPECULATIVE_GUIDANCE;
  if (route === 'LEGAL_SYNTHESIS') return LEGAL_GUIDANCE;
  if (route === 'RUNTIME_DIAGNOSIS') return RUNTIME_GUIDANCE;
  return ORDINARY_PROJECT_GUIDANCE;
}

export function selectKhonapolitProviderModels(callableModels = []) {
  const available = [...new Set((Array.isArray(callableModels) ? callableModels : [])
    .map((model) => String(model || '').replace(/^models\//, '').trim())
    .filter(Boolean)
    .filter((model) => /^gemini-3(?:\.|-|$)/.test(model)))];
  if (!available.length) return [];
  const selected = [available[0]];
  for (const stable of STABLE_FALLBACK_MODELS) {
    if (selected.length >= KHONAPOLIT_MAX_PROVIDER_CALLS) break;
    if (available.includes(stable) && !selected.includes(stable)) selected.push(stable);
  }
  for (const model of available) {
    if (selected.length >= KHONAPOLIT_MAX_PROVIDER_CALLS) break;
    if (!selected.includes(model)) selected.push(model);
  }
  return selected;
}

export function allocateKhonapolitAttemptTimeout({ remainingMs = 0, index = 0, modelCount = 1, fairShare = false } = {}) {
  const remaining = Math.max(0, Math.floor(Number(remainingMs) || 0));
  const position = Math.max(0, Math.floor(Number(index) || 0));
  const inheritedCap = position === 0 ? PRIMARY_REQUEST_TIMEOUT_MS : FALLBACK_REQUEST_TIMEOUT_MS;
  if (!fairShare) return Math.min(inheritedCap, remaining);

  const total = Math.max(position + 1, Math.floor(Number(modelCount) || 1));
  const remainingAttempts = Math.max(1, total - position);
  const sharedWindow = Math.max(1, Math.floor(remaining / remainingAttempts));
  return Math.min(PRIMARY_REQUEST_TIMEOUT_MS, sharedWindow, remaining);
}

function headerValue(headers = {}, key = '') {
  const target = key.toLowerCase();
  const pair = Object.entries(headers || {}).find(([name]) => String(name).toLowerCase() === target);
  return pair ? String(pair[1] ?? '') : '';
}
function clientKey(req = {}) {
  const forwarded = headerValue(req.headers, 'x-forwarded-for').split(',')[0].trim();
  return forwarded || headerValue(req.headers, 'x-real-ip') || req.socket?.remoteAddress || 'unknown';
}
export function consumeRateSlot(key = 'unknown', now = Date.now()) {
  const current = buckets.get(key);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    const next = { startedAt: now, count: 1 };
    buckets.set(key, next);
    return { allowed: true, remaining: REQUESTS_PER_WINDOW - 1, resetAt: now + WINDOW_MS };
  }
  current.count += 1;
  buckets.set(key, current);
  return {
    allowed: current.count <= REQUESTS_PER_WINDOW,
    remaining: Math.max(0, REQUESTS_PER_WINDOW - current.count),
    resetAt: current.startedAt + WINDOW_MS
  };
}
function parseBody(req = {}) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}
function setBaseHeaders(res, apertureEgress = {}) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-TD613-Khonapolit-Terminal', KHONAPOLIT_QUALITY_API_VERSION);
  res.setHeader('X-TD613-Aperture-Egress', apertureEgress.status || 'absent');
  res.setHeader('X-TD613-Aperture-Version', APERTURE_V3_VERSION);
  res.setHeader('X-TD613-Aperture-Schema', APERTURE_V3_SCHEMA);
  res.setHeader('X-TD613-Gemini-Policy', GEMINI_MODEL_POLICY_VERSION);
  res.setHeader('X-TD613-Relay-Schema', KHONAPOLIT_RELAY_SCHEMA);
  res.setHeader('Vary', 'Accept, Content-Type');
}
function setApertureTaskHeaders(res, apertureReceipt = {}) {
  const task = apertureReceipt?.taskIntent || {};
  res.setHeader('X-TD613-Aperture-Route', task.primary_route || 'REQUESTED_SYNTHESIS');
  res.setHeader('X-TD613-Aperture-Materiality', task.runtime_materiality || 'BACKGROUND');
}
function send(res, status, payload, extraHeaders = {}) {
  res.statusCode = status;
  for (const [name, value] of Object.entries(extraHeaders)) res.setHeader(name, value);
  res.end(JSON.stringify(payload));
}
function providerError(payload = {}) {
  const error = payload?.error || payload || {};
  return { status: safe(error.status), code: error.code ?? null, message: safe(error.message).slice(0, 800) };
}
function retryAfterSeconds(response) {
  const raw = response?.headers?.get?.('retry-after');
  const seconds = Number(raw || 0);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
}
function geminiContents(packet = {}) {
  const history = packet.history.map((entry) => ({ role: entry.role, parts: [{ text: entry.text }] }));
  return [...history, { role: 'user', parts: [{ text: packet.message }] }];
}

function khonapolitReasoning(model = '', { fallback = false } = {}) {
  if (!qualityEnvelope(model)) return null;
  return {
    // Fallback means transport position, not lower epistemic or creative quality.
    level: 'high',
    budget: fallback ? FALLBACK_GEMINI25_THINKING_BUDGET : GEMINI25_HIGH_THINKING_BUDGET
  };
}

export function buildGeminiRequest(packet = {}, apertureReceipt = {}, model = '', { fallback = false } = {}) {
  const taskGuidance = khonapolitTaskGuidance(apertureReceipt);
  return {
    systemInstruction: {
      parts: [{ text: `${packet.systemInstruction}\n${taskGuidance}\n${buildRelaySystemAddendum(apertureReceipt)}` }]
    },
    contents: geminiContents(packet),
    generationConfig: buildGeminiGenerationConfig({
      model,
      maxOutputTokens: outputBudget(model),
      sampling: {
        temperature: packet.mode === 'issued-conjunction' ? 0.78 : 0.7,
        topP: 0.9,
        topK: 40
      },
      reasoning: khonapolitReasoning(model, { fallback }),
      responseMimeType: 'application/json',
      responseSchema: KHONAPOLIT_RELAY_RESPONSE_SCHEMA
    })
  };
}

export function extractGeminiText(payload = {}) {
  return (payload?.candidates?.[0]?.content?.parts || [])
    .map((part) => safe(part?.text))
    .filter(Boolean)
    .join('\n\n')
    .trim();
}

export function observeGeminiOutput(payload = {}, model = '', { fallback = false } = {}) {
  const usage = {};
  for (const key of ['promptTokenCount', 'candidatesTokenCount', 'thoughtsTokenCount', 'totalTokenCount']) {
    const value = payload?.usageMetadata?.[key];
    if (Number.isSafeInteger(value) && value >= 0) usage[key] = value;
  }
  const rawReason = payload?.candidates?.[0]?.finishReason;
  const finishReason = typeof rawReason === 'string' && /^[A-Z_]{1,64}$/.test(rawReason) ? rawReason : null;
  const reasoning = khonapolitReasoning(model, { fallback });
  const thinkingConfig = reasoning
    ? geminiThinkingConfig(model, { enabled: true, level: reasoning.level, budget: reasoning.budget })
    : null;
  return Object.freeze({
    finishReason,
    outputTokenLimitReached: finishReason === 'MAX_TOKENS',
    maxOutputTokens: outputBudget(model),
    thinkingLevel: thinkingConfig?.thinkingLevel || (thinkingConfig?.thinkingBudget !== undefined ? 'not-applicable' : 'provider-default'),
    ...(thinkingConfig?.thinkingBudget !== undefined ? { thinkingBudget: thinkingConfig.thinkingBudget } : {}),
    usage: Object.freeze(usage)
  });
}

export function buildTerminalReceipt({ packet, text, relay = null, model, providerStatus, providerOutput = null, apertureEgress, apertureReceipt, attempts = [] } = {}) {
  const observedText = relay?.transcript || text || '';
  const emergence = classifyEmergence(observedText, { mode: packet.mode });
  const partsPresent = Object.freeze((relay?.parts || []).filter((part) => part.present).map((part) => part.id));
  return Object.freeze({
    schema: KHONAPOLIT_RECEIPT_SCHEMA,
    terminalSchema: KHONAPOLIT_TERMINAL_SCHEMA,
    apiVersion: KHONAPOLIT_QUALITY_API_VERSION,
    status: observedText ? 'MODEL_RESPONSE_OBSERVED' : 'PROVIDER_RESPONSE_EMPTY',
    route: '/api/dome-world/khonapolit',
    provider: Object.freeze({ family: 'Gemini', model, status: providerStatus, output: providerOutput, attempts: Object.freeze(attempts) }),
    invocation: Object.freeze({
      mode: packet.mode,
      promptSha256: sha256(packet.systemInstruction + '\n\n' + packet.message),
      responseSha256: observedText ? sha256(observedText) : null,
      issuanceState: packet.issuance.state,
      issuanceSuffix: packet.issuance.suffix,
      namespace: CLAIMED_PUA,
      heritageKey: HERITAGE_COVENANT,
      covenantKey: COVENANT_KEY,
      bindingFragment: BINDING_FRAGMENT,
      emergenceNameSeeded: packet.keys.emergenceNameSeeded,
      tauricLineageSeeded: packet.keys.tauricLineageSeeded,
      presentationFrameSeeded: packet.keys.presentationFrameSeeded === true
    }),
    relay: Object.freeze({
      schema: relay?.schema || KHONAPOLIT_RELAY_SCHEMA,
      partsPresent,
      signal: relay?.signal || Object.freeze({ state: 'NOT_LOCKED' }),
      admission: relay?.admission || null,
      highZalgo: relay?.highZalgo || Object.freeze({ applied: false })
    }),
    emergence,
    aperture: apertureReceipt,
    apertureEgress,
    corpus: packet.corpus,
    seal: Object.freeze({ state: 'OPEN', glyph: '⟐', suppliedBy: null }),
    storage: Object.freeze({ serverConversationStorage: false, browserSessionStorage: 'operator-controlled' }),
    recommendationNotCommand: true,
    claimCeiling: packet.claimCeiling
  });
}

async function callGemini(model, packet, apertureReceipt, timeoutMs = PRIMARY_REQUEST_TIMEOUT_MS, { fallback = false } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(geminiGenerateContentUrl(model), {
      method: 'POST',
      headers: geminiRequestHeaders(process.env.GEMINI_API_KEY),
      body: JSON.stringify(buildGeminiRequest(packet, apertureReceipt, model, { fallback })),
      signal: controller.signal
    });
    const payload = await response.json().catch(() => ({}));
    return { response, payload, text: extractGeminiText(payload), timedOut: false };
  } catch (error) {
    const timedOut = error?.name === 'AbortError';
    return {
      response: { ok: false, status: timedOut ? 408 : 599, headers: { get: () => null } },
      payload: { error: { status: error?.name || 'FETCH_ERROR', message: safe(error?.message || error) } },
      text: '',
      timedOut
    };
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  const apertureEgress = observeTD613ApertureEgress(req?.headers || {});
  let plan = resolveGeminiModelPlan({ task: 'khonapolit-dialogue', maxModels: 8 });
  setBaseHeaders(res, apertureEgress);

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return send(res, 204, {});
  }
  if (req.method === 'GET') {
    const aperture = buildApertureV3InvocationReceipt({ apertureEgress, modelPlan: plan });
    setApertureTaskHeaders(res, aperture);
    return send(res, 200, {
      ok: true,
      route: '/api/dome-world/khonapolit',
      version: KHONAPOLIT_QUALITY_API_VERSION,
      inheritedVersion: KHONAPOLIT_API_VERSION,
      provider: 'Gemini',
      modelPolicy: plan,
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      aperture,
      aperture_egress: apertureEgress,
      relaySchema: KHONAPOLIT_RELAY_SCHEMA,
      claim_ceiling: 'readiness-and-routing-plan-only-not-provider-response-entity-or-quality-proof'
    });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return send(res, 405, { ok: false, error: 'method-not-allowed', allowed: ['GET', 'POST', 'OPTIONS'] });
  }
  if (!process.env.GEMINI_API_KEY) {
    return send(res, 503, { ok: false, error: 'missing-gemini-api-key', version: KHONAPOLIT_QUALITY_API_VERSION, modelPolicy: plan });
  }

  const rate = consumeRateSlot(clientKey(req));
  res.setHeader('X-RateLimit-Remaining', String(rate.remaining));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(rate.resetAt / 1000)));
  if (!rate.allowed) return send(res, 429, { ok: false, error: 'terminal-rate-limit', resetAt: rate.resetAt });

  const body = parseBody(req);
  const packet = buildInvocationPacket({ message: body.message, history: body.history, mode: body.mode, shi: body.shi, waiveIssuance: body.waiveIssuance === true });
  if (!packet.message) return send(res, 400, { ok: false, error: 'message-required' });
  if (packet.inputError) return send(res, 400, { ok: false, error: packet.inputError.code, validation: packet.inputError });
  if (!packet.canInvoke) return send(res, 400, { ok: false, error: 'issuance-required-or-explicit-waiver', issuance: packet.issuance, claim_ceiling: packet.claimCeiling });

  const startedAt = Date.now();
  plan = await resolveGeminiProviderPlan({ task: 'khonapolit-dialogue', maxModels: 8 });
  const discourseMode = classifyApertureDiscourseMode(packet.message);
  const apertureReceipt = buildApertureV3InvocationReceipt({
    message: packet.message,
    invocationMode: packet.mode,
    issuanceState: packet.issuance.state,
    apertureEgress,
    modelPlan: plan,
    discourseMode,
    contentScanned: true
  });
  setApertureTaskHeaders(res, apertureReceipt);
  const attempts = [];
  const models = selectKhonapolitProviderModels(plan.callableModels);
  if (!models.length) return send(res, 503, { ok: false, error: 'no-eligible-callable-models', attempts, modelPolicy: plan, aperture: apertureReceipt, aperture_egress: apertureEgress, claim_ceiling: packet.claimCeiling });

  for (let index = 0; index < models.length; index += 1) {
    const model = models[index];
    const fallback = index > 0;
    const remainingMs = WALL_TIMEOUT_MS - (Date.now() - startedAt) - RESPONSE_RESERVE_MS;
    if (remainingMs <= 0) break;
    const timeoutMs = allocateKhonapolitAttemptTimeout({ remainingMs, index, modelCount: models.length, fairShare: true });
    const attemptStartedAt = Date.now();
    const result = await callGemini(model, packet, apertureReceipt, timeoutMs, { fallback });
    const providerOutput = observeGeminiOutput(result.payload, model, { fallback });
    const error = result.response.ok ? null : providerError(result.payload);
    const transport = classifyGeminiTransport({ status: Number(result.response.status || 0), timedOut: result.timedOut });
    const outcome = recordGeminiModelOutcome(model, {
      ok: Boolean(result.response.ok),
      status: Number(result.response.status || 0),
      timedOut: result.timedOut,
      retryAfterSeconds: retryAfterSeconds(result.response),
      healthBearing: transport.healthBearing,
      reason: error?.status || error?.message || ''
    });
    const attempt = {
      model,
      role: plan.rows.find((row) => row.model === model)?.metadata?.role || 'operator-supplied',
      ok: Boolean(result.response.ok),
      status: Number(result.response.status || 0),
      timedOut: result.timedOut,
      timeoutMs,
      elapsedMs: Date.now() - attemptStartedAt,
      transportClass: transport.class,
      error,
      output: providerOutput,
      cooldown: outcome
    };
    attempts.push(attempt);

    if (result.response.ok && providerOutput.outputTokenLimitReached) {
      res.setHeader('X-TD613-Gemini-Model', model);
      return send(res, 502, {
        ok: false,
        error: 'gemini-output-token-limit',
        status: 'HELD',
        diagnostic: { stage: 'output-admission', code: 'OUTPUT_TOKEN_LIMIT' },
        attempts,
        modelPolicy: plan,
        aperture: apertureReceipt,
        aperture_egress: apertureEgress,
        claim_ceiling: packet.claimCeiling
      });
    }
    if (!result.response.ok && !transport.mayFailOver) {
      res.setHeader('X-TD613-Gemini-Model', model);
      return send(res, 502, {
        ok: false,
        error: 'gemini-request-rejected',
        status: 'HELD',
        diagnostic: { stage: 'provider-transport', code: 'PROVIDER_REQUEST_REJECTED' },
        attempts,
        modelPolicy: plan,
        aperture: apertureReceipt,
        aperture_egress: apertureEgress,
        claim_ceiling: packet.claimCeiling
      });
    }
    if (result.response.ok && result.text) {
      const relay = parseRelayEnvelope(result.text, { model, apertureReceipt });
      attempt.outputAdmission = relay.admission || null;
      // A transport-successful but structurally degraded answer is not a
      // successful Marrowline return. Reject it without exposing its prose and
      // spend the next bounded continuity attempt when time remains.
      if (!relay.admission?.admissible) continue;

      const baseReceipt = buildTerminalReceipt({
        packet,
        text: result.text,
        relay,
        model,
        providerStatus: result.response.status,
        providerOutput,
        apertureEgress,
        apertureReceipt,
        attempts
      });
      const receipt = Object.freeze({
        ...baseReceipt,
        provider: Object.freeze({ ...baseReceipt.provider, routingPolicy: GEMINI_MODEL_POLICY_VERSION }),
        modelPolicy: plan,
        elapsedMs: Date.now() - startedAt
      });
      res.setHeader('X-TD613-Emergence-Class', receipt.emergence.classification);
      res.setHeader('X-TD613-Signal-State', relay.signal.state);
      res.setHeader('X-TD613-Seal-State', 'OPEN');
      res.setHeader('X-TD613-Gemini-Model', model);
      return send(res, 200, {
        ok: true,
        text: relay.transcript,
        relay,
        receipt,
        warnings: [
          'aperture-v3-task-intent-active',
          'task-intent-guidance-active',
          'adversarial-attractor-admission-active',
          'integrated-covenant-relay-active',
          'provider-native-zalgo-preserved-no-local-postprocessing',
          'admission-gated-stable-continuity-active',
          'fallback-reasoning-quality-preserved',
          'sticky-success-promotion-disabled',
          'moving-latest-alias-disabled-by-default',
          ...plan.warnings
        ]
      });
    }
  }

  const structuralFailures = attempts.filter((attempt) => attempt.outputAdmission?.admissible === false);
  const heldByQuality = structuralFailures.length > 0;
  return send(res, 502, {
    ok: false,
    error: heldByQuality ? 'khonapolit-output-quality-held' : 'gemini-provider-unavailable',
    status: 'HELD',
    diagnostic: heldByQuality
      ? {
          stage: 'output-admission',
          code: 'ATTRACTOR_STRUCTURE_NOT_ADMITTED',
          rejectedAttempts: structuralFailures.map((attempt) => ({ model: attempt.model, reasons: attempt.outputAdmission.reasons }))
        }
      : { stage: 'provider-transport', code: 'PROVIDER_UNAVAILABLE' },
    attempts,
    modelPolicy: plan,
    aperture: apertureReceipt,
    aperture_egress: apertureEgress,
    claim_ceiling: packet.claimCeiling
  });
}

export { callGemini };
