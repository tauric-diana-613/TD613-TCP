import { attachStrictReceiptMeta } from './hush-strict-receipt-meta.js';

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400'
};

const VERSION = 'pr124-strict-anti-compression-proxy';

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

function strictifyNoFallback(payload = {}, contract = {}, startedAt = Date.now()) {
  const warnings = [
    ...new Set([
      ...(Array.isArray(payload.warnings) ? payload.warnings : []),
      'strict-api-no-usable-candidates',
      'strict-anti-compression-held',
      'no-server-repair',
      'no-local-fallback'
    ])
  ];
  return attachStrictReceiptMeta({
    ok: false,
    provider: 'gemini-strict',
    model: payload.model || 'none',
    strict: true,
    noFallback: true,
    error: 'strict-anti-compression-no-usable-api-candidates',
    candidates: [],
    warnings,
    attempts: payload.attempts || [],
    rejectedCopy: payload.rejectedCopy || [],
    rejectedCompressed: payload.rejectedCompressed || [],
    providerErrorMessage: 'Strict PR124 blocked fallback release after anti-compression provider path found no usable remote candidate.',
    requestReceipt: {
      ...(payload.requestReceipt || {}),
      strict: true,
      noFallback: true,
      providerVersion: VERSION,
      upstreamProviderVersion: payload.version || '',
      antiCompression: true,
      fallbackSuppressed: payload.provider === 'server-deterministic-repair',
      packetTier: safe(contract.packetTier || ''),
      maskEvidenceState: safe(contract.maskEvidenceState || ''),
      elapsedMs: Date.now() - startedAt
    }
  }, contract, startedAt);
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 200, { ok: true });
  if (req.method === 'GET') return send(res, 200, { ok: true, route: 'hush-generate-strict-pr124', upstream: 'hush-generate', version: VERSION });
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method-not-allowed' });
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
      return send(res, 504, strictifyNoFallback(payload, contract, startedAt));
    }
    return send(res, response.status, attachStrictReceiptMeta({ ...payload, strict: true, noFallback: true, pr124Proxy: true, pr124ProxyVersion: VERSION }, contract, startedAt));
  } catch (error) {
    return send(res, 502, attachStrictReceiptMeta({ ok: false, provider: 'gemini-strict', model: 'none', strict: true, noFallback: true, error: 'strict-pr124-proxy-failed', candidates: [], warnings: ['strict-pr124-proxy-failed'], pr124Proxy: true, pr124ProxyVersion: VERSION, proxyError: String(error?.message || error) }, contract, startedAt));
  }
}