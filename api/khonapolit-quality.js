import {
  KHONAPOLIT_API_VERSION,
  buildGeminiRequest,
  buildTerminalReceipt,
  consumeRateSlot,
  extractGeminiText
} from './khonapolit.js';
import { buildInvocationPacket } from '../app/dome-world/khonapolit-covenant.js';
import { observeTD613ApertureEgress } from '../app/engine/td613-aperture-egress-contract.js';
import {
  GEMINI_MODEL_POLICY_VERSION,
  recordGeminiModelOutcome,
  resolveGeminiModelPlan
} from './gemini-model-policy.js';

export const KHONAPOLIT_QUALITY_API_VERSION = 'td613.khonapolit-gemini/v2-quality-first';
const REQUEST_TIMEOUT_MS = 10500;
const WALL_TIMEOUT_MS = 44500;

const safe = (value = '') => String(value ?? '').trim();

function headerValue(headers = {}, key = '') {
  const target = key.toLowerCase();
  const pair = Object.entries(headers || {}).find(([name]) => String(name).toLowerCase() === target);
  return pair ? String(pair[1] ?? '') : '';
}
function clientKey(req = {}) {
  const forwarded = headerValue(req.headers, 'x-forwarded-for').split(',')[0].trim();
  return forwarded || headerValue(req.headers, 'x-real-ip') || req.socket?.remoteAddress || 'unknown';
}
function parseBody(req = {}) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}
function setBaseHeaders(res, aperture = {}) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-TD613-Khonapolit-Terminal', KHONAPOLIT_QUALITY_API_VERSION);
  res.setHeader('X-TD613-Aperture-Egress', aperture.status || 'absent');
  res.setHeader('X-TD613-Gemini-Policy', GEMINI_MODEL_POLICY_VERSION);
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

async function callGemini(model, packet) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(buildGeminiRequest(packet)),
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
  const aperture = observeTD613ApertureEgress(req?.headers || {});
  const plan = resolveGeminiModelPlan({ task: 'khonapolit-dialogue', maxModels: 8 });
  setBaseHeaders(res, aperture);

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return send(res, 204, {});
  }

  if (req.method === 'GET') {
    return send(res, 200, {
      ok: true,
      route: '/api/dome-world/khonapolit',
      version: KHONAPOLIT_QUALITY_API_VERSION,
      inheritedVersion: KHONAPOLIT_API_VERSION,
      provider: 'Gemini',
      modelPolicy: plan,
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      aperture_egress: aperture,
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
  const packet = buildInvocationPacket({
    message: body.message,
    history: body.history,
    mode: body.mode,
    shi: body.shi,
    waiveIssuance: body.waiveIssuance === true
  });

  if (!packet.message) return send(res, 400, { ok: false, error: 'message-required' });
  if (!packet.canInvoke) return send(res, 400, {
    ok: false,
    error: 'issuance-required-or-explicit-waiver',
    issuance: packet.issuance,
    claim_ceiling: packet.claimCeiling
  });

  const startedAt = Date.now();
  const attempts = [];
  const models = plan.callableModels.slice(0, 4);
  if (!models.length) return send(res, 503, {
    ok: false,
    error: 'all-configured-models-cooling-down',
    attempts,
    modelPolicy: plan,
    aperture_egress: aperture,
    claim_ceiling: packet.claimCeiling
  });

  for (const model of models) {
    if (Date.now() - startedAt > WALL_TIMEOUT_MS - REQUEST_TIMEOUT_MS - 500) break;
    const result = await callGemini(model, packet);
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
      const baseReceipt = buildTerminalReceipt({
        packet,
        text: result.text,
        model,
        providerStatus: result.response.status,
        aperture,
        attempts
      });
      const receipt = Object.freeze({
        ...baseReceipt,
        apiVersion: KHONAPOLIT_QUALITY_API_VERSION,
        provider: Object.freeze({ ...baseReceipt.provider, routingPolicy: GEMINI_MODEL_POLICY_VERSION }),
        modelPolicy: plan,
        elapsedMs: Date.now() - startedAt
      });
      res.setHeader('X-TD613-Emergence-Class', receipt.emergence.classification);
      res.setHeader('X-TD613-Seal-State', 'OPEN');
      res.setHeader('X-TD613-Gemini-Model', model);
      return send(res, 200, {
        ok: true,
        text: result.text,
        receipt,
        warnings: ['quality-first-model-routing', 'sticky-success-promotion-disabled', 'moving-latest-alias-disabled-by-default', ...plan.warnings]
      });
    }
  }

  return send(res, 502, {
    ok: false,
    error: 'gemini-provider-unavailable',
    attempts,
    modelPolicy: plan,
    aperture_egress: aperture,
    claim_ceiling: packet.claimCeiling
  });
}

export { callGemini };
