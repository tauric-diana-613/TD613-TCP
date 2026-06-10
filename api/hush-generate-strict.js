import { attachStrictReceiptMeta } from './hush-strict-receipt-meta.js';

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400'
};

const VERSION = 'strict-endpoint-pr188.9-conditional-fast-upstream';
const META = 'pr188.9-conditional-fast-upstream/v1';
const STRICT_FAST_UPSTREAM_MS = 14200;
const STRICT_NORMAL_UPSTREAM_MS = 25500;

function send(res, status, payload) {
  for (const [key, value] of Object.entries(CORS)) res.setHeader(key, value);
  return res.status(status).json(payload);
}

function safe(value = '') { return String(value ?? '').trim(); }
function arr(value) { return Array.isArray(value) ? value : []; }
function uniq(values = []) { return [...new Set(values.map(safe).filter(Boolean))]; }
function originFromReq(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'td613.com';
  return `${proto}://${host}`;
}
function firstTruthy(values = []) {
  for (const value of values) {
    const text = safe(value);
    if (text) return text;
  }
  return '';
}
function packetTierOf(contract = {}) {
  return safe(contract.packetTier || contract.flightPacket?.packetTier || contract.flightPacket?.packet_tier || '');
}
function maskEvidenceOf(contract = {}) {
  return safe(contract.maskEvidenceState || contract.flightPacket?.maskEvidenceState || '');
}
function internalRegisterOf(contract = {}) {
  const fp = contract.flightPacket || {};
  const vector = fp.mask_style_vector || {};
  const policy = fp.style_diversity_policy || vector.style_diversity || {};
  return firstTruthy([
    contract.internalRegister,
    contract.routeMetadata?.internalRegister,
    contract.packetHints?.internalRegister,
    contract.transformHints?.internalRegister,
    contract.mask?.internalRegister,
    contract.selectedMask?.internalRegister,
    fp.internalRegister,
    fp.routeMetadata?.internalRegister,
    fp.packetHints?.internalRegister,
    fp.transformHints?.internalRegister,
    fp.mask?.internalRegister,
    vector.internalRegister,
    policy.internalRegister
  ]);
}
function routeIdText(contract = {}) {
  const fp = contract.flightPacket || {};
  const vector = fp.mask_style_vector || {};
  const policy = fp.style_diversity_policy || vector.style_diversity || {};
  return [
    contract.maskId,
    contract.mask_id,
    contract.selectedMaskId,
    contract.selectedMask?.id,
    contract.mask?.id,
    packetTierOf(contract),
    fp.maskId,
    fp.mask_id,
    fp.selectedMaskId,
    fp.mask?.id,
    fp.packetTier,
    fp.packet_tier,
    vector.mask_id,
    vector.maskId,
    vector.id,
    policy.mask_id,
    policy.maskId,
    policy.id
  ].map(safe).join(' ');
}
function isAaveRoute(contract = {}) {
  return /\bAAVE\b/i.test(internalRegisterOf(contract)) || /phase28-transform-to-aave/i.test(routeIdText(contract));
}
function wantsFastRoute(contract = {}) {
  return isAaveRoute(contract) || contract.strictFastUpstream === true || contract.flightPacket?.flight_controls?.strict_fast_upstream === true;
}
function wordCount(contract = {}) {
  const text = safe(contract.sourceText || contract.messageDraftText || '');
  return (text.toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || []).length;
}
function clone(value = {}) {
  return JSON.parse(JSON.stringify(value || {}));
}
function reviewMap(payload = {}) {
  const model = safe(payload.model);
  const provider = safe(payload.provider);
  const warnings = uniq(payload.warnings || []);
  const candidates = arr(payload.candidates);
  return /server-repair-review-map|deterministic-review-map/i.test(model)
    || /server-deterministic-repair/i.test(provider)
    || warnings.some((warning) => /server-deterministic-review-map-used|review-map-contained|review-map-not-transform|server-repair-review-map/i.test(warning))
    || candidates.some((candidate) => /^Reviewed repair surface\./i.test(safe(candidate.text || candidate.output || candidate.candidate || '')));
}
function budgetedStrictContract(contract = {}) {
  const next = clone(contract);
  const fp = next.flightPacket ? clone(next.flightPacket) : null;
  const fast = wantsFastRoute(next);
  const sourceWords = wordCount(next);
  const candidateCount = fast ? (sourceWords >= 220 ? 1 : 2) : Number(next.candidateCount || fp?.flight_controls?.candidate_count || 2) || 2;

  next.strictDirect = true;
  next.strictNoFallback = true;
  next.strictFastUpstream = fast;
  next.strictReviewRetrySkipModels = arr(next.strictReviewRetrySkipModels);
  next.candidateCount = candidateCount;
  next.maskEvidenceState = maskEvidenceOf(next) || (fast ? 'rich' : 'detailed');

  if (fast) {
    next.strictReviewMapRetry = true;
    next.strictReviewMapRetryReason = isAaveRoute(next) ? 'strict-fast-aave-one-shot' : 'strict-fast-one-shot';
    next.strictReviewRetryAttemptBudget = 1;
    next.strictReviewRetryStageLimit = 1;
    next.strictReviewLateRetry = false;
    next.packetTier = isAaveRoute(next) ? 'register_transform_strict_fast_packet' : (packetTierOf(next) || 'strict_fast_packet');
  }

  if (isAaveRoute(next)) {
    next.internalRegister = 'AAVE';
    next.routeMetadata = { ...(next.routeMetadata || {}), internalRegister: 'AAVE', publicRegisterLabel: 'target register' };
    next.packetHints = {
      ...(next.packetHints || {}),
      internalRegister: 'AAVE',
      publicRegisterLabel: 'target register',
      routeInstruction: 'Use AAVE register features when this mask is selected; keep public UI coded. Source proposition coverage outranks phrase texture.'
    };
    next.transformHints = { ...(next.transformHints || {}), internalRegister: 'AAVE' };
  }

  if (fp) {
    fp.packetTier = next.packetTier || fp.packetTier;
    fp.packet_tier = next.packetTier || fp.packet_tier;
    fp.maskEvidenceState = next.maskEvidenceState;
    fp.internalRegister = next.internalRegister || fp.internalRegister;
    fp.routeMetadata = { ...(fp.routeMetadata || {}), ...(next.routeMetadata || {}) };
    fp.packetHints = { ...(fp.packetHints || {}), ...(next.packetHints || {}) };
    fp.transformHints = { ...(fp.transformHints || {}), ...(next.transformHints || {}) };
    fp.flight_controls = {
      ...(fp.flight_controls || {}),
      candidate_count: candidateCount,
      strict_fast_upstream: fast,
      ...(fast ? { max_model_attempts: 1, max_stage_attempts: 1 } : {})
    };
    next.flightPacket = fp;
  }

  return next;
}
function timeoutBudget(contract = {}) {
  return wantsFastRoute(contract) ? STRICT_FAST_UPSTREAM_MS : STRICT_NORMAL_UPSTREAM_MS;
}
function strictMeta(payload = {}, contract = {}, startedAt = Date.now(), extraWarnings = []) {
  const fast = wantsFastRoute(contract);
  return {
    ...(payload.requestReceipt || {}),
    strict: true,
    noFallback: true,
    strictDirect: true,
    strictFastUpstream: fast,
    strictDirectVersion: VERSION,
    providerVersion: VERSION,
    reviewVersion: META,
    endpointMetaVersion: META,
    httpUpstreamInvoke: true,
    abortableHttpUpstream: true,
    strictUpstreamBudgetMs: timeoutBudget(contract),
    strictAttemptBudget: fast ? 1 : payload.requestReceipt?.strictAttemptBudget || '',
    strictStageBudget: fast ? 1 : payload.requestReceipt?.strictStageBudget || '',
    packetTier: packetTierOf(contract),
    maskEvidenceState: maskEvidenceOf(contract),
    internalRegister: internalRegisterOf(contract),
    aaveRoute: isAaveRoute(contract),
    reviewMapIntercept: reviewMap(payload),
    fallbackReleased: false,
    elapsedMs: Date.now() - startedAt,
    warnings: uniq([...(payload.requestReceipt?.warnings || []), ...extraWarnings])
  };
}
function stamp(payload = {}, contract = {}, startedAt = Date.now(), extraWarnings = []) {
  const warnings = uniq([...(payload.warnings || []), ...extraWarnings]);
  return attachStrictReceiptMeta({
    ...payload,
    strict: true,
    noFallback: true,
    fallbackReleased: false,
    outputReleased: Boolean(arr(payload.candidates).length) && !reviewMap(payload),
    warnings,
    requestReceipt: strictMeta(payload, contract, startedAt, warnings)
  }, contract, startedAt);
}
function heldReviewMap(payload = {}, contract = {}, startedAt = Date.now()) {
  return stamp({
    ok: false,
    status: 'held',
    held: true,
    released: false,
    provider: 'gemini-strict',
    model: safe(payload.model || 'server-repair-review-map'),
    error: 'review_map_not_transform',
    reason: 'review_map_not_transform',
    message: 'Strict endpoint intercepted a server review map before it could be treated as a releasable remote candidate.',
    candidates: [],
    warnings: uniq([...(payload.warnings || []), 'review-map-contained', 'review-map-not-transform', 'strict-api-no-usable-candidates', 'no-local-fallback']),
    attempts: payload.attempts || [],
    providerErrorMessage: 'Server repair maps are diagnostics, not transformed output.'
  }, contract, startedAt, ['review-map-intercepted-at-strict-endpoint']);
}
function timeoutPayload(contract = {}, startedAt = Date.now()) {
  const fast = wantsFastRoute(contract);
  return stamp({
    ok: false,
    status: 'held',
    held: true,
    released: false,
    provider: 'gemini-strict',
    model: 'strict-server-watchdog',
    error: fast ? 'strict_fast_upstream_timeout' : 'strict_upstream_timeout',
    reason: 'provider_timeout',
    message: fast ? 'Strict endpoint stopped the fast upstream inside the client-safe window before the page watchdog could fire.' : 'Strict endpoint stopped the upstream inside the client-safe window before the page watchdog could fire.',
    candidates: [],
    warnings: uniq(['strict-server-watchdog-timeout', fast ? 'strict-fast-upstream-timeout' : 'strict-upstream-timeout', 'strict-api-no-usable-candidates', 'no-local-fallback']),
    attempts: []
  }, contract, startedAt);
}\nasync function callUpstream(req, contract = {}, startedAt = Date.now()) {
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timeoutMs = timeoutBudget(contract);
  const timeout = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const response = await fetch(`${originFromReq(req)}/api/hush-generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contract }),
      signal: controller?.signal
    });
    const payload = await response.json().catch(() => ({
      ok: false,
      provider: 'gemini-strict',
      model: 'strict-upstream-non-json',
      error: 'strict_upstream_non_json',
      candidates: [],
      warnings: ['strict-upstream-non-json']
    }));
    return { status: response.status, payload };
  } catch (error) {
    const aborted = error?.name === 'AbortError' || /abort/i.test(safe(error?.message || error));
    if (aborted) return { status: 504, payload: timeoutPayload(contract, startedAt) };
    return {
      status: 502,
      payload: stamp({
        ok: false,
        status: 'held',
        held: true,
        released: false,
        provider: 'gemini-strict',
        model: 'strict-upstream-http-error',
        error: 'strict_upstream_http_error',
        reason: 'strict_upstream_http_error',
        candidates: [],
        warnings: ['strict-upstream-http-error', 'strict-api-no-usable-candidates', 'no-local-fallback'],
        proxyError: safe(error?.message || error),
        attempts: []
      }, contract, startedAt)
    };
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 200, { ok: true });
  if (req.method === 'GET') return send(res, 200, {
    ok: true,
    route: 'hush-generate-strict',
    version: VERSION,
    reviewVersion: META,
    upstream: 'http:/api/hush-generate',
    abortableHttpUpstream: true,
    conditionalFastUpstream: true,
    fastBudgetMs: STRICT_FAST_UPSTREAM_MS,
    normalBudgetMs: STRICT_NORMAL_UPSTREAM_MS,
    reviewMapIntercept: true,
    note: 'Strict endpoint uses fast one-shot budget only for AAVE or explicit fast routes; other masks keep the normal strict window. Server repair maps are held at strict.'
  });
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method-not-allowed', version: VERSION });

  const startedAt = Date.now();
  const original = req.body?.contract || req.body || {};
  const contract = budgetedStrictContract(original);

  try {
    const { status, payload } = await callUpstream(req, contract, startedAt);
    if (reviewMap(payload)) return send(res, 504, heldReviewMap(payload, contract, startedAt));
    const stamped = payload?.requestReceipt?.endpointMetaVersion === META ? payload : stamp(payload, contract, startedAt);
    return send(res, status, stamped);
  } catch (error) {
    return send(res, 502, stamp({
      ok: false,
      status: 'held',
      held: true,
      released: false,
      provider: 'gemini-strict',
      model: 'strict-direct-failed',
      error: 'strict-direct-failed',
      reason: 'strict-direct-failed',
      candidates: [],
      warnings: ['strict-direct-failed', 'strict-api-no-usable-candidates', 'no-local-fallback'],
      proxyError: safe(error?.message || error),
      attempts: []
    }, contract, startedAt));
  }
}
