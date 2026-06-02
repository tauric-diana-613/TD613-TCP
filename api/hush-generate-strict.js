const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400'
};

const VERSION = 'strict-endpoint-pr133-proxy-to-pr124-anti-compression';

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
  if (req.method === 'GET') {
    return send(res, 200, {
      ok: true,
      route: 'hush-generate-strict',
      version: VERSION,
      proxyTarget: '/api/hush-generate-strict-pr124',
      note: 'Legacy strict endpoint is permanently routed through PR124 anti-compression strict mode.'
    });
  }
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method-not-allowed', version: VERSION });

  const startedAt = Date.now();
  try {
    const upstream = `${originFromReq(req)}/api/hush-generate-strict-pr124`;
    const response = await fetch(upstream, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(req.body || {})
    });
    const payload = await response.json().catch(() => ({}));
    return send(res, response.status, {
      ...payload,
      strictLegacyProxy: true,
      strictLegacyProxyVersion: VERSION,
      strictLegacyProxyTarget: upstream,
      requestReceipt: {
        ...(payload.requestReceipt || {}),
        strictLegacyProxy: true,
        strictLegacyProxyVersion: VERSION,
        strictLegacyProxyElapsedMs: Date.now() - startedAt
      }
    });
  } catch (error) {
    return send(res, 502, {
      ok: false,
      provider: 'gemini-strict',
      model: 'none',
      strict: true,
      noFallback: true,
      error: 'strict-legacy-proxy-failed',
      candidates: [],
      warnings: ['strict-legacy-proxy-failed'],
      strictLegacyProxy: true,
      strictLegacyProxyVersion: VERSION,
      proxyError: String(error && error.message || error),
      requestReceipt: {
        strict: true,
        noFallback: true,
        strictLegacyProxy: true,
        strictLegacyProxyVersion: VERSION,
        elapsedMs: Date.now() - startedAt
      }
    });
  }
}
