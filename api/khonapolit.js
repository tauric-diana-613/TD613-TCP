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

export const KHONAPOLIT_API_VERSION = 'td613.khonapolit-gemini/v1';
const DEFAULT_MODELS = ['gemini-flash-lite-latest', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'];
const REQUEST_TIMEOUT_MS = 24000;
const MAX_OUTPUT_TOKENS = 4096;
const WINDOW_MS = 10 * 60 * 1000;
const REQUESTS_PER_WINDOW = 12;
const buckets = new Map();

function safe(value = '') {
  return String(value ?? '').trim();
}

function sha256(value = '') {
  return crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
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

function configuredModels() {
  const preferred = safe(process.env.KHONAPOLIT_GEMINI_MODEL || process.env.GEMINI_MODEL).replace(/^models\//, '');
  const fallbacks = safe(process.env.KHONAPOLIT_GEMINI_FALLBACKS || process.env.GEMINI_MODEL_FALLBACKS)
    .split(',')
    .map((value) => value.trim().replace(/^models\//, ''))
    .filter(Boolean);
  return [...new Set([preferred, ...DEFAULT_MODELS, ...fallbacks].filter(Boolean))].slice(0, 4);
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
  res.setHeader('X-TD613-Khonapolit-Terminal', KHONAPOLIT_API_VERSION);
  res.setHeader('X-TD613-Aperture-Egress', aperture.status || 'absent');
  res.setHeader('Vary', 'Accept, Content-Type');
}

function send(res, status, payload, extraHeaders = {}) {
  res.statusCode = status;
  for (const [name, value] of Object.entries(extraHeaders)) res.setHeader(name, value);
  res.end(JSON.stringify(payload));
}

function geminiContents(packet = {}) {
  const history = packet.history.map((entry) => ({ role: entry.role, parts: [{ text: entry.text }] }));
  return [...history, { role: 'user', parts: [{ text: packet.message }] }];
}

export function buildGeminiRequest(packet = {}) {
  return {
    systemInstruction: { parts: [{ text: packet.systemInstruction }] },
    contents: geminiContents(packet),
    generationConfig: {
      temperature: packet.mode === 'issued-conjunction' ? 0.78 : 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: MAX_OUTPUT_TOKENS
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

async function callGemini(model, packet) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(buildGeminiRequest(packet)),
        signal: controller.signal
      }
    );
    const payload = await response.json().catch(() => ({}));
    return { response, payload, text: extractGeminiText(payload), timedOut: false };
  } catch (error) {
    return {
      response: { ok: false, status: error?.name === 'AbortError' ? 408 : 599 },
      payload: { error: { status: error?.name || 'FETCH_ERROR', message: safe(error?.message || error) } },
      text: '',
      timedOut: error?.name === 'AbortError'
    };
  } finally {
    clearTimeout(timer);
  }
}

function providerError(payload = {}) {
  const error = payload?.error || payload || {};
  return {
    status: safe(error.status),
    code: error.code ?? null,
    message: safe(error.message).slice(0, 800)
  };
}

export function buildTerminalReceipt({ packet, text, model, providerStatus, aperture, attempts = [] } = {}) {
  const emergence = classifyEmergence(text, { mode: packet.mode });
  return Object.freeze({
    schema: KHONAPOLIT_RECEIPT_SCHEMA,
    terminalSchema: KHONAPOLIT_TERMINAL_SCHEMA,
    apiVersion: KHONAPOLIT_API_VERSION,
    status: text ? 'MODEL_RESPONSE_OBSERVED' : 'PROVIDER_RESPONSE_EMPTY',
    route: '/api/dome-world/khonapolit',
    provider: Object.freeze({
      family: 'Gemini',
      model,
      status: providerStatus,
      attempts: Object.freeze(attempts)
    }),
    invocation: Object.freeze({
      mode: packet.mode,
      promptSha256: sha256(packet.systemInstruction + '\n\n' + packet.message),
      responseSha256: text ? sha256(text) : null,
      issuanceState: packet.issuance.state,
      issuanceSuffix: packet.issuance.suffix,
      namespace: CLAIMED_PUA,
      heritageKey: HERITAGE_COVENANT,
      covenantKey: COVENANT_KEY,
      bindingFragment: BINDING_FRAGMENT,
      emergenceNameSeeded: packet.keys.emergenceNameSeeded,
      tauricLineageSeeded: packet.keys.tauricLineageSeeded
    }),
    emergence,
    apertureEgress: aperture,
    corpus: packet.corpus,
    seal: Object.freeze({ state: 'OPEN', glyph: '⟐', suppliedBy: null }),
    storage: Object.freeze({ serverConversationStorage: false, browserSessionStorage: 'operator-controlled' }),
    recommendationNotCommand: true,
    claimCeiling: packet.claimCeiling
  });
}

export default async function handler(req, res) {
  const aperture = observeTD613ApertureEgress(req?.headers || {});
  setBaseHeaders(res, aperture);

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return send(res, 204, {});
  }

  if (req.method === 'GET') {
    return send(res, 200, {
      ok: true,
      route: '/api/dome-world/khonapolit',
      version: KHONAPOLIT_API_VERSION,
      provider: 'Gemini',
      configuredModels: configuredModels(),
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      namespace: CLAIMED_PUA,
      aperture_egress: aperture,
      claim_ceiling: 'readiness-only-not-provider-response-or-entity-proof'
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return send(res, 405, { ok: false, error: 'method-not-allowed', allowed: ['GET', 'POST', 'OPTIONS'] });
  }

  if (!process.env.GEMINI_API_KEY) {
    return send(res, 503, { ok: false, error: 'missing-gemini-api-key', version: KHONAPOLIT_API_VERSION });
  }

  const rate = consumeRateSlot(clientKey(req));
  res.setHeader('X-RateLimit-Remaining', String(rate.remaining));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(rate.resetAt / 1000)));
  if (!rate.allowed) {
    return send(res, 429, { ok: false, error: 'terminal-rate-limit', resetAt: rate.resetAt });
  }

  const body = parseBody(req);
  const packet = buildInvocationPacket({
    message: body.message,
    history: body.history,
    mode: body.mode,
    shi: body.shi,
    waiveIssuance: body.waiveIssuance === true
  });

  if (!packet.message) return send(res, 400, { ok: false, error: 'message-required' });
  if (!packet.canInvoke) {
    return send(res, 400, {
      ok: false,
      error: 'issuance-required-or-explicit-waiver',
      issuance: packet.issuance,
      claim_ceiling: packet.claimCeiling
    });
  }

  const models = configuredModels();
  const attempts = [];
  for (const model of models.slice(0, 3)) {
    const result = await callGemini(model, packet);
    attempts.push({
      model,
      ok: Boolean(result.response.ok),
      status: result.response.status,
      timedOut: result.timedOut,
      error: result.response.ok ? null : providerError(result.payload)
    });
    if (result.response.ok && result.text) {
      const receipt = buildTerminalReceipt({
        packet,
        text: result.text,
        model,
        providerStatus: result.response.status,
        aperture,
        attempts
      });
      res.setHeader('X-TD613-Emergence-Class', receipt.emergence.classification);
      res.setHeader('X-TD613-Seal-State', 'OPEN');
      return send(res, 200, { ok: true, text: result.text, receipt });
    }
  }

  return send(res, 502, {
    ok: false,
    error: 'gemini-provider-unavailable',
    attempts,
    aperture_egress: aperture,
    claim_ceiling: packet.claimCeiling
  });
}
