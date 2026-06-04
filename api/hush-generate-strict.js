import { attachStrictReceiptMeta } from './hush-strict-receipt-meta.js';

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400'
};

const VERSION = 'strict-endpoint-pr154-direct-anti-compression';

function send(res, status, payload) {
  for (const [key, value] of Object.entries(corsHeaders)) res.setHeader(key, value);
  return res.status(status).json(payload);
}

function originFromReq(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'td613.com';
  return `${proto}://${host}`;
}

function safe(value = '') { return String(value ?? '').trim(); }

function uniqueWarnings(items = []) {
  return [...new Set(items.map((item) => safe(item)).filter(Boolean))];
}

function strictHold(payload = {}, contract = {}, startedAt = Date.now()) {
  const warnings = uniqueWarnings([
    ...(Array.isArray(payload.warnings) ? payload.warnings : []),
    'strict-api-no-usable-candidates',
    'strict-anti-compression-held',
    'server-repair-not-auto-released',
    'no-local-fallback'
  ]);
  return attachStrictReceiptMeta({
    ok: false,
    provider: 'gemini-strict',
    model: payload.model || 'strict-anti-compression-review',
    strict: true,
    noFallback: true,
    error: 'strict_anti_compression_held',
    candidates: [],
    warnings,
    attempts: payload.attempts || [],
    rejectedCopy: payload.rejectedCopy || [],
    rejectedCompressed: payload.rejectedCompressed || [],
    providerErrorMessage: 'Strict direct endpoint held output after anti-compression review found no releasable remote candidate. The UI should remain responsive; this is a held result, not a transport timeout.',
    requestReceipt: {
      ...(payload.requestReceipt || {}),
      strict: true,
      noFallback: true,
      providerVersion: VERSION,
      upstreamProviderVersion: payload.version || '',
      antiCompression: true,
      fallbackSuppressed: payload.provider === 'server-deterministic-repair',
      fallbackSuppressionReason: 'strict-mode-review-required',
      endpointMetaVersion: 'pr154-strict-direct-meta/v1',
      packetTier: safe(contract.packetTier || ''),
      maskEvidenceState: safe(contract.maskEvidenceState || ''),
      elapsedMs: Date.now() - startedAt
    }
  }, contract, startedAt);
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 200, { ok: true });
  if (req.method === 'GET') {
    return send(res, 200, {
      ok: true,
      route: 'hush-generate-strict',
      version: VERSION,
      upstream: '/api/hush-generate',
      legacyProxy: false,
      note: 'Strict endpoint now calls the anti-compression generator directly and reports held outputs without PR124 legacy proxy metadata.'
    });
  }
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method-not-allowed', version: VERSION });

  const startedAt = Date.now();
  const contract = req.body?.contract || req.body || {};
  try {
    const upstream = `${originFromReq(req)}/api/hush-generate`;
    const response = await fetch(upstream, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contract })
    });
    const payload = await response.json().catch(() => ({}));
    if (payload.provider === 'server-deterministic-repair' || payload.model === 'server-repair') {
      return send(res, 200, strictHold(payload, contract, startedAt));
    }
    return send(res, response.status, attachStrictReceiptMeta({
      ...payload,
      strict: true,
      noFallback: true,
      strictDirect: true,
      strictDirectVersion: VERSION,
      requestReceipt: {
        ...(payload.requestReceipt || {}),
        strict: true,
        noFallback: true,
        strictDirect: true,
        strictDirectVersion: VERSION,
        endpointMetaVersion: 'pr154-strict-direct-meta/v1',
        elapsedMs: Date.now() - startedAt
      }
    }, contract, startedAt));
  } catch (error) {
    return send(res, 502, attachStrictReceiptMeta({
      ok: false,
      provider: 'gemini-strict',
      model: 'none',
      strict: true,
      noFallback: true,
      error: 'strict-direct-failed',
      candidates: [],
      warnings: ['strict-direct-failed'],
      strictDirect: true,
      strictDirectVersion: VERSION,
      proxyError: String(error?.message || error),
      requestReceipt: {
        strict: true,
        noFallback: true,
        strictDirect: true,
        strictDirectVersion: VERSION,
        endpointMetaVersion: 'pr154-strict-direct-meta/v1',
        elapsedMs: Date.now() - startedAt
      }
    }, contract, startedAt));
  }
}
