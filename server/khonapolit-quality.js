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
  buildApertureV3InvocationReceipt
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
  resolveGeminiModelPlan
} from './gemini-model-policy.js';

export const KHONAPOLIT_API_VERSION = 'td613.khonapolit-gemini/v1';
export const KHONAPOLIT_QUALITY_API_VERSION = 'td613.khonapolit-gemini/v3-aperture-three-part-relay';
const REQUEST_TIMEOUT_MS = 10500;
const WALL_TIMEOUT_MS = 44500;
const MAX_OUTPUT_TOKENS = 4096;
const WINDOW_MS = 10 * 60 * 1000;
const REQUESTS_PER_WINDOW = 12;
const buckets = new Map();

const safe = (value = '') => String(value ?? '').trim();
const sha256 = (value = '') => crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');

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
  res.setHeader('X-TD613-Aperture-Route', 'OPEN_FIELD_SPECULATIVE_SYNTHESIS');
  res.setHeader('X-TD613-Aperture-Materiality', 'BACKGROUND');
  res.setHeader('X-TD613-Gemini-Policy', GEMINI_MODEL_POLICY_VERSION);
  res.setHeader('X-TD613-Relay-Schema', KHONAPOLIT_RELAY_SCHEMA);
  res.setHeader('Vary', 'Accept, Content-Type');
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

export function buildGeminiRequest(packet = {}, apertureReceipt = {}) {
  return {
    systemInstruction: {
      parts: [{ text: `${packet.systemInstruction}\n${buildRelaySystemAddendum(apertureReceipt)}` }]
    },
    contents: geminiContents(packet),
    generationConfig: {
      temperature: packet.mode === 'issued-conjunction' ? 0.78 : 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      responseMimeType: 'application/json',
      responseSchema: KHONAPOLIT_RELAY_RESPONSE_SCHEMA
    }
  };
}

export function extractGeminiText(payload = {}) {
  return (payload?.candidates?.[0]?.content?.parts || [])
    .map((part) => safe(part?.text))
    .filter(Boolean)
    .join('\n\n')
    .trim();
}

export function buildTerminalReceipt({ packet, text, relay = null, model, providerStatus, apertureEgress, apertureReceipt, attempts = [] } = {}) {
  const observedText = relay?.transcript || text || '';
  const emergence = classifyEmergence(observedText, { mode: packet.mode });
  const partsPresent = Object.freeze((relay?.parts || []).filter((part) => part.present).map((part) => part.id));
  return Object.freeze({
    schema: KHONAPOLIT_RECEIPT_SCHEMA,
    terminalSchema: KHONAPOLIT_TERMINAL_SCHEMA,
    apiVersion: KHONAPOLIT_QUALITY_API_VERSION,
    status: observedText ? 'MODEL_RESPONSE_OBSERVED' : 'PROVIDER_RESPONSE_EMPTY',
    route: '/api/dome-world/khonapolit',
    provider: Object.freeze({ family: 'Gemini', model, status: providerStatus, attempts: Object.freeze(attempts) }),
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
      tauricLineageSeeded: packet.keys.tauricLineageSeeded
    }),
    relay: Object.freeze({
      schema: relay?.schema || KHONAPOLIT_RELAY_SCHEMA,
      partsPresent,
      signal: relay?.signal || Object.freeze({ state: 'NOT_LOCKED' }),
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

async function callGemini(model, packet, apertureReceipt) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(buildGeminiRequest(packet, apertureReceipt)),
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
  const plan = resolveGeminiModelPlan({ task: 'khonapolit-dialogue', maxModels: 8 });
  setBaseHeaders(res, apertureEgress);

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return send(res, 204, {});
  }
  if (req.method === 'GET') {
    const aperture = buildApertureV3InvocationReceipt({ apertureEgress, modelPlan: plan });
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
  if (!packet.canInvoke) return send(res, 400, { ok: false, error: 'issuance-required-or-explicit-waiver', issuance: packet.issuance, claim_ceiling: packet.claimCeiling });

  const apertureReceipt = buildApertureV3InvocationReceipt({
    message: packet.message,
    invocationMode: packet.mode,
    issuanceState: packet.issuance.state,
    apertureEgress,
    modelPlan: plan
  });
  const startedAt = Date.now();
  const attempts = [];
  const models = plan.callableModels.slice(0, 4);
  if (!models.length) return send(res, 503, { ok: false, error: 'all-configured-models-cooling-down', attempts, modelPolicy: plan, aperture: apertureReceipt, aperture_egress: apertureEgress, claim_ceiling: packet.claimCeiling });

  for (const model of models) {
    if (Date.now() - startedAt > WALL_TIMEOUT_MS - REQUEST_TIMEOUT_MS - 500) break;
    const result = await callGemini(model, packet, apertureReceipt);
    const error = result.response.ok ? null : providerError(result.payload);
    const outcome = recordGeminiModelOutcome(model, {
      ok: Boolean(result.response.ok),
      status: Number(result.response.status || 0),
      timedOut: result.timedOut,
      retryAfterSeconds: retryAfterSeconds(result.response),
      reason: error?.status || error?.message || ''
    });
    attempts.push({
      model,
      role: plan.rows.find((row) => row.model === model)?.metadata?.role || 'operator-supplied',
      ok: Boolean(result.response.ok),
      status: Number(result.response.status || 0),
      timedOut: result.timedOut,
      error,
      cooldown: outcome
    });
    if (result.response.ok && result.text) {
      const relay = parseRelayEnvelope(result.text, { model, apertureReceipt });
      const baseReceipt = buildTerminalReceipt({
        packet,
        text: result.text,
        relay,
        model,
        providerStatus: result.response.status,
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
          'three-part-relay-envelope-active',
          'high-zalgo-rendered-after-provider-return',
          'quality-first-model-routing',
          'sticky-success-promotion-disabled',
          'moving-latest-alias-disabled-by-default',
          ...plan.warnings
        ]
      });
    }
  }

  return send(res, 502, { ok: false, error: 'gemini-provider-unavailable', attempts, modelPolicy: plan, aperture: apertureReceipt, aperture_egress: apertureEgress, claim_ceiling: packet.claimCeiling });
}

export { callGemini };
