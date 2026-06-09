import { attachStrictReceiptMeta } from './hush-strict-receipt-meta.js';

const C = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400'
};
const VERSION = 'strict-endpoint-pr170-promise-race-watchdog';
const META = 'pr170-promise-race-watchdog/v1';
const STRICT_REVIEW_RETRY_BUDGET_MS = 15500;
const STRICT_CLIENT_SAFE_MS = 28600;
const STRICT_INITIAL_UPSTREAM_MS = 25500;
const STRICT_LATE_RETRY_MIN_MS = 5600;
const STRICT_RESPONSE_MARGIN_MS = 900;

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
function timedOutModels(payload = {}) {
  return uniq(arr(payload.attempts).filter((a) => a && (a.timedOut || a.status === 408 || a.providerStatus === 408 || a.error?.status === 'AbortError')).map((a) => a.model));
}
function retryContract(c = {}, reason = 'review-map-transform-retry', payload = {}, late = false) {
  const skipped = timedOutModels(payload);
  const requested = Number(c.candidateCount || c.flightPacket?.flight_controls?.candidate_count || 2) || 2;
  const candidateCount = late ? 2 : Math.max(2, Math.min(requested, 3));
  const n = {
    ...c,
    reroll: true,
    candidateCount,
    maskEvidenceState: 'detailed',
    strictReviewMapRetry: true,
    strictReviewMapRetryReason: reason,
    strictReviewRetrySkipModels: skipped,
    skipModels: uniq([...(arr(c.skipModels || c.avoidModels || c.strictReviewRetrySkipModels)), ...skipped]),
    strictReviewRetryAttemptBudget: late ? 1 : 3,
    strictReviewRetryStageLimit: late ? 1 : 2,
    strictReviewLateRetry: late
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
function timeoutResult(timeoutMs = 0, timeoutReason = 'strict_upstream_timeout') {
  return {
    response: { ok: false, status: 408 },
    payload: {
      ok: false,
      provider: 'gemini-strict',
      model: timeoutReason === 'strict_initial_upstream_timeout' ? 'strict-server-watchdog' : 'strict-review-map-late-retry-timeout',
      error: timeoutReason,
      reason: timeoutReason,
      warnings: [timeoutReason === 'strict_initial_upstream_timeout' ? 'strict-server-watchdog-timeout' : 'review-map-transform-retry-timeout'],
      attempts: [],
      requestReceipt: {
        strictServerTimeout: timeoutReason === 'strict_initial_upstream_timeout',
        strictReviewLateRetryTimeout: timeoutReason !== 'strict_initial_upstream_timeout',
        retryTimeoutMs: timeoutMs
      }
    }
  };
}
async function upstream(req, contract, timeoutMs = 0, timeoutReason = 'strict_upstream_timeout') {
  const controller = timeoutMs > 0 ? new AbortController() : null;
  let timer = null;
  const request = fetch(`${origin(req)}/api/hush-generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ contract }),
    signal: controller?.signal
  }).then(async (r) => {
    const p = await r.json().catch(() => ({}));
    return { response: r, payload: p };
  }).catch((error) => {
    if (controller && error?.name === 'AbortError') return timeoutResult(timeoutMs, timeoutReason);
    if (timeoutMs > 0) return timeoutResult(timeoutMs, timeoutReason);
    throw error;
  });
  if (!(timeoutMs > 0)) return request;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => {
      try { controller.abort(); } catch {}
      resolve(timeoutResult(timeoutMs, timeoutReason));
    }, timeoutMs);
  });
  try {
    return await Promise.race([request, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
function releasable(payload = {}) {
  return !reviewMap(payload) &&
    payload.provider !== 'server-deterministic-repair' &&
    !/^server-repair/.test(s(payload.model)) &&
    arr(payload.candidates).length > 0;
}
function timeoutHold(payload = {}, contract = {}, startedAt = Date.now()) {
  return attachStrictReceiptMeta({
    ok: false,
    status: 'held',
    held: true,
    released: false,
    provider: 'gemini-strict',
    model: 'strict-server-watchdog',
    strict: true,
    noFallback: true,
    fallbackReleased: false,
    outputReleased: false,
    error: 'strict_server_watchdog_timeout',
    reason: 'strict_server_watchdog_timeout',
    candidates: [],
    warnings: uniq([...(payload.warnings || []), 'strict-server-watchdog-timeout', 'strict-api-no-usable-candidates', 'no-local-fallback']),
    attempts: payload.attempts || [],
    providerErrorMessage: 'Strict endpoint stopped the upstream request inside the client-safe window before the page watchdog could fire.',
    requestReceipt: {
      ...(payload.requestReceipt || {}),
      strict: true,
      noFallback: true,
      providerVersion: VERSION,
      reviewVersion: META,
      endpointMetaVersion: META,
      strictServerWatchdog: true,
      packetTier: s(contract.packetTier || ''),
      maskEvidenceState: s(contract.maskEvidenceState || ''),
      elapsedMs: Date.now() - startedAt
    }
  }, contract, startedAt);
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
      'Review-map diagnostics are custody reports, not transformed text, and were held after the strict retry lane failed to produce releasable text inside the client-safe window.' :
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
      strictReviewMapLateRetry: extra.includes('review-map-transform-late-retry-attempted'),
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
      strictReviewMapLateRetry: extra.includes('review-map-transform-late-retry-success'),
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
    note: 'Strict endpoint uses Promise.race server watchdogs before the client watchdog and retries review-map diagnostics inside the safe window.'
  });
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method-not-allowed', version: VERSION });

  const startedAt = Date.now();
  const contract = req.body?.contract || req.body || {};
  try {
    let { response, payload } = await upstream(req, contract, STRICT_INITIAL_UPSTREAM_MS, 'strict_initial_upstream_timeout');
    let retryExtra = [];
    const elapsed = () => Date.now() - startedAt;

    if (payload.error === 'strict_initial_upstream_timeout') {
      return send(res, 504, timeoutHold(payload, contract, startedAt));
    }

    if (reviewMap(payload)) {
      const lowRich = lowSigRich(contract);
      const late = elapsed() >= STRICT_REVIEW_RETRY_BUDGET_MS;
      const remaining = STRICT_CLIENT_SAFE_MS - elapsed();
      const retryAllowed = elapsed() < STRICT_REVIEW_RETRY_BUDGET_MS || (lowRich && remaining >= STRICT_LATE_RETRY_MIN_MS);
      if (retryAllowed) {
        retryExtra = uniq([
          'review-map-transform-retry-attempted',
          late ? 'review-map-transform-late-retry-attempted' : '',
          lowRich ? 'low-signature-rich-retry-attempted' : '',
          timedOutModels(payload).length ? 'strict-retry-skipped-timedout-models' : ''
        ]);
        const timeoutMs = late ? Math.max(1200, remaining - STRICT_RESPONSE_MARGIN_MS) : 0;
        const retry = await upstream(req, retryContract(contract, lowRich ? (late ? 'low-signature-rich-review-map-late' : 'low-signature-rich-review-map') : 'review-map-only', payload, late), timeoutMs, 'strict_review_map_late_retry_timeout');
        if (releasable(retry.payload)) {
          return send(res, retry.response.status, pass(retry.payload, contract, startedAt, retry.response.status, uniq([
            ...retryExtra,
            'review-map-transform-retry-success',
            late ? 'review-map-transform-late-retry-success' : '',
            lowRich ? 'low-signature-rich-retry-success' : ''
          ])));
        }
        payload = {
          ...retry.payload,
          warnings: uniq([
            ...(retry.payload.warnings || []),
            ...retryExtra,
            late ? 'review-map-transform-late-retry-still-held' : 'review-map-transform-retry-still-held'
          ])
        };
        response = retry.response;
      }
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
