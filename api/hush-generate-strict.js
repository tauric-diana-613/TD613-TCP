import { attachStrictReceiptMeta } from './hush-strict-receipt-meta.js';

const C = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400'
};
const VERSION = 'strict-endpoint-pr167-low-signature-rich-retry';
const META = 'pr167-low-signature-rich-retry/v1';
const STRICT_REVIEW_RETRY_BUDGET_MS = 15500;

function send(res, status, payload) {
  for (const [k, v] of Object.entries(C)) res.setHeader(k, v);
  return res.status(status).json(payload);
}
function origin(req) {
  const p = req.headers['x-forwarded-proto'] || 'https';
  const h = req.headers['x-forwarded-host'] || req.headers.host || 'td613.com';
  return `${p}://${h}`;
}
function s(v = '') { return String(v ?? '').trim(); }
function arr(v) { return Array.isArray(v) ? v : []; }
function uniq(v = []) { return [...new Set(v.map(s).filter(Boolean))]; }
function ctext(c = {}) { return typeof c === 'string' ? c : s(c.text || c.output || c.candidate || c.rewrite || ''); }
function leakText(v = '') {
  v = s(v);
  return /^Reviewed repair surface:/i.test(v) ||
    /^Architecture:/im.test(v) ||
    /^P\d+\s+(keeps|carries|holds|marks|routes|does not drop)/im.test(v) ||
    /^Global custody bank:/im.test(v) ||
    /proposition custody remains intact/i.test(v) ||
    /contrast remains active/i.test(v) ||
    /review-map structure/i.test(v);
}
function reviewMap(payload = {}) {
  const w = uniq(payload.warnings || []).join(' ');
  const m = s(payload.model);
  return /review-map|deterministic-review-map|server-repair-review-map/i.test(`${m} ${w}`) ||
    arr(payload.candidates).some((c) => leakText(ctext(c)) || arr(c.risk_flags).some((f) => /review-map|deterministic-review-map/i.test(s(f))));
}
function words(v = '') { return s(v).toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || []; }
function source(contract = {}) { return s(contract.sourceText || contract.messageDraftText || ''); }
function lowSigRich(c = {}) {
  const tier = s(c.packetTier || c.flightPacket?.packetTier || c.flightPacket?.packet_tier);
  const st = s(c.maskEvidenceState || c.flightPacket?.maskEvidenceState);
  return /low_signature/i.test(tier) && /rich/i.test(st);
}
function retryContract(c = {}, reason = 'review-map-transform-retry') {
  const requested = Number(c.candidateCount || c.flightPacket?.flight_controls?.candidate_count || 2) || 2;
  const candidateCount = Math.max(2, Math.min(requested, 3));
  const n = {
    ...c,
    reroll: true,
    candidateCount,
    maskEvidenceState: 'detailed',
    strictReviewMapRetry: true,
    strictReviewMapRetryReason: reason
  };
  if (c.flightPacket) {
    n.flightPacket = {
      ...c.flightPacket,
      maskEvidenceState: 'detailed',
      flight_controls: {
        ...(c.flightPacket.flight_controls || {}),
        candidate_count: candidateCount
      }
    };
  }
  return n;
}
async function upstream(req, contract) {
  const r = await fetch(`${origin(req)}/api/hush-generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ contract })
  });
  const p = await r.json().catch(() => ({}));
  return { response: r, payload: p };
}
function releasable(payload = {}) {
  return !reviewMap(payload) &&
    payload.provider !== 'server-deterministic-repair' &&
    !/^server-repair/.test(s(payload.model)) &&
    arr(payload.candidates).length > 0;
}
function hold(payload = {}, contract = {}, startedAt = Date.now(), reason = 'strict_anti_compression_held', extra = []) {
  const isMap = reason === 'review_map_not_transform';
  return attachStrictReceiptMeta({
    ok: false,
    status: 'held',
    held: true,
    released: false,
    provider: 'gemini-strict',
    model: payload.model || 'strict-anti-compression-review',
    strict: true,
    noFallback: true,
    fallbackReleased: false,
    outputReleased: false,
    error: reason,
    reason,
    candidates: [],
    warnings: uniq([
      ...(payload.warnings || []),
      ...extra,
      isMap ? 'review-map-contained' : '',
      isMap ? 'review-map-not-transform' : '',
      'strict-api-no-usable-candidates',
      'strict-anti-compression-held',
      'no-local-fallback'
    ]),
    attempts: payload.attempts || [],
    rejectedCopy: payload.rejectedCopy || [],
    rejectedCompressed: payload.rejectedCompressed || [],
    strictRepairReview: {
      version: META,
      release: false,
      reason,
      candidateCount: arr(payload.candidates).length,
      reviewMapRepair: isMap,
      sourceWordCount: words(source(contract)).length
    },
    providerErrorMessage: isMap ?
      'Review-map diagnostics are custody reports, not transformed text, and were held after a strict transform retry failed to produce releasable text.' :
      'Strict endpoint held output after anti-compression review found no releasable remote candidate.',
    requestReceipt: {
      ...(payload.requestReceipt || {}),
      strict: true,
      noFallback: true,
      providerVersion: VERSION,
      reviewVersion: META,
      endpointMetaVersion: META,
      antiCompression: true,
      reviewMapRepairHeld: isMap,
      strictReviewMapTransformRetry: extra.includes('review-map-transform-retry-attempted'),
      lowSignatureRichRetry: extra.includes('low-signature-rich-retry-attempted'),
      fallbackSuppressed: payload.provider === 'server-deterministic-repair',
      fallbackSuppressionReason: reason,
      packetTier: s(contract.packetTier || ''),
      maskEvidenceState: s(contract.maskEvidenceState || ''),
      elapsedMs: Date.now() - startedAt
    }
  }, contract, startedAt);
}
function pass(payload = {}, contract = {}, startedAt = Date.now(), status = 200, extra = []) {
  return attachStrictReceiptMeta({
    ...payload,
    warnings: uniq([...(payload.warnings || []), ...extra]),
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
      endpointMetaVersion: META,
      strictReviewMapTransformRetry: extra.includes('review-map-transform-retry-success'),
      lowSignatureRichRetry: extra.includes('low-signature-rich-retry-success'),
      elapsedMs: Date.now() - startedAt
    }
  }, contract, startedAt);
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 200, { ok: true });
  if (req.method === 'GET') return send(res, 200, {
    ok: true,
    route: 'hush-generate-strict',
    version: VERSION,
    reviewVersion: META,
    upstream: '/api/hush-generate',
    note: 'Strict endpoint retries review-map-only diagnostics once before final anti-compression hold.'
  });
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method-not-allowed', version: VERSION });

  const startedAt = Date.now();
  const contract = req.body?.contract || req.body || {};
  try {
    let { response, payload } = await upstream(req, contract);
    let retryExtra = [];

    if (reviewMap(payload) && Date.now() - startedAt < STRICT_REVIEW_RETRY_BUDGET_MS) {
      const lowRich = lowSigRich(contract);
      retryExtra = uniq([
        'review-map-transform-retry-attempted',
        lowRich ? 'low-signature-rich-retry-attempted' : ''
      ]);
      const retry = await upstream(req, retryContract(contract, lowRich ? 'low-signature-rich-review-map' : 'review-map-only'));
      if (releasable(retry.payload)) {
        return send(res, retry.response.status, pass(retry.payload, contract, startedAt, retry.response.status, uniq([
          ...retryExtra,
          'review-map-transform-retry-success',
          lowRich ? 'low-signature-rich-retry-success' : ''
        ])));
      }
      payload = {
        ...retry.payload,
        warnings: uniq([
          ...(retry.payload.warnings || []),
          ...retryExtra,
          'review-map-transform-retry-still-held'
        ])
      };
      response = retry.response;
    }

    if (reviewMap(payload)) return send(res, 504, hold(payload, contract, startedAt, 'review_map_not_transform', retryExtra));
    if (payload.provider === 'server-deterministic-repair' || /^server-repair/.test(s(payload.model))) {
      return send(res, 504, hold(payload, contract, startedAt, 'strict_anti_compression_held', retryExtra));
    }
    return send(res, response.status, pass(payload, contract, startedAt, response.status));
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
        endpointMetaVersion: META,
        elapsedMs: Date.now() - startedAt
      }
    }, contract, startedAt));
  }
}
