import { attachStrictReceiptMeta } from './hush-strict-receipt-meta.js';

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400'
};

function send(res, status, payload) {
  for (const [key, value] of Object.entries(corsHeaders)) res.setHeader(key, value);
  return res.status(status).json(payload);
}

function originFromReq(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'td613.com';
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 200, { ok: true });
  if (req.method === 'GET') return send(res, 200, { ok: true, route: 'hush-generate-strict-pr124', upstream: 'hush-generate-strict', version: 'pr124-strict-endpoint-meta-proxy' });
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method-not-allowed' });
  const startedAt = Date.now();
  const contract = req.body?.contract || req.body || {};
  try {
    const upstream = `${originFromReq(req)}/api/hush-generate-strict`;
    const response = await fetch(upstream, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contract })
    });
    const payload = await response.json().catch(() => ({}));
    return send(res, response.status, attachStrictReceiptMeta({ ...payload, pr124Proxy: true }, contract, startedAt));
  } catch (error) {
    return send(res, 502, attachStrictReceiptMeta({ ok: false, provider: 'gemini-strict', model: 'none', strict: true, noFallback: true, error: 'strict-pr124-proxy-failed', candidates: [], warnings: ['strict-pr124-proxy-failed'], pr124Proxy: true, proxyError: String(error?.message || error) }, contract, startedAt));
  }
}
