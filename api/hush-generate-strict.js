import { attachStrictReceiptMeta } from './hush-strict-receipt-meta.js';

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400'
};

const VERSION = 'strict-endpoint-pr171-upstream-retry-visibility';
const REVIEW_VERSION = 'pr171-upstream-retry-visibility/v1';
const ENDPOINT_META_VERSION = 'pr171-upstream-retry-visibility-meta/v1';

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
function asArray(value) { return Array.isArray(value) ? value : []; }
function uniqueWarnings(items = []) { return [...new Set(items.map((item) => safe(item)).filter(Boolean))]; }
function words(value = '') { return safe(value).toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || []; }
function candidateText(candidate = {}) { return typeof candidate === 'string' ? candidate : safe(candidate.text || candidate.output || candidate.candidate || candidate.rewrite || ''); }
function normalizeText(value = '') { return words(value).join(' '); }
function sourceTextFrom(contract = {}) { return safe(contract.sourceText || contract.messageDraftText || ''); }

function longestSourceRun(candidateTextValue = '', sourceTextValue = '') {
  const candidate = words(candidateTextValue), source = words(sourceTextValue);
  if (!candidate.length || !source.length) return 0;
  const positions = new Map();
  source.forEach((word, index) => { if (!positions.has(word)) positions.set(word, []); positions.get(word).push(index); });
  let best = 0;
  for (let i = 0; i < candidate.length; i += 1) {
    for (const start of positions.get(candidate[i]) || []) {
      let run = 0;
      while (candidate[i + run] && source[start + run] && candidate[i + run] === source[start + run]) run += 1;
      if (run > best) best = run;
    }
  }
  return best;
}

function copyRisk(candidateTextValue = '', sourceTextValue = '') {
  const candidateNorm = normalizeText(candidateTextValue), sourceNorm = normalizeText(sourceTextValue);
  if (!candidateNorm || !sourceNorm) return { copied: false, exact: false, wrapper: false, longRun: false, near: false, longestRun: 0, overlap: 0, lengthRatio: 1 };
  const candidateWords = words(candidateTextValue), sourceWords = words(sourceTextValue);
  const sourceSet = new Set(sourceWords.filter((word) => word.length > 2));
  const candidateSet = new Set(candidateWords.filter((word) => word.length > 2));
  let hits = 0;
  for (const word of candidateSet) if (sourceSet.has(word)) hits += 1;
  const overlap = hits / Math.max(1, Math.max(sourceSet.size, candidateSet.size));
  const longestRun = longestSourceRun(candidateTextValue, sourceTextValue);
  const lengthRatio = candidateWords.length / Math.max(1, sourceWords.length);
  const exact = candidateNorm === sourceNorm;
  const wrapper = !exact && sourceNorm.length >= 24 && candidateNorm.includes(sourceNorm);
  const longRun = longestRun >= Math.min(9, Math.max(6, Math.floor(sourceWords.length * 0.55)));
  const near = overlap >= 0.9 && lengthRatio >= 0.82 && lengthRatio <= 1.35 && longestRun >= Math.min(8, Math.max(5, Math.floor(sourceWords.length * 0.4)));
  return { copied: Boolean(exact || wrapper || longRun || near), exact, wrapper, longRun, near, longestRun, overlap: Number(overlap.toFixed(4)), lengthRatio: Number(lengthRatio.toFixed(4)) };
}

function isReviewMapRepair(payload = {}) {
  const warnings = uniqueWarnings(payload.warnings || []);
  const model = safe(payload.model);
  const candidates = asArray(payload.candidates);
  return model === 'server-repair-review-map'
    || warnings.some((warning) => /review-map|deterministic-review-map/i.test(warning))
    || candidates.some((candidate) => asArray(candidate.risk_flags).some((flag) => /review-map|deterministic-review-map/i.test(flag)));
}

function reviewMapCleared(payload = {}) {
  const warnings = uniqueWarnings(payload.warnings || []);
  const candidates = asArray(payload.candidates);
  return warnings.includes('server-repair-review-map-cleared')
    || warnings.includes('server-deterministic-review-map-used')
    || safe(payload.model) === 'server-repair-review-map'
    || candidates.some((candidate) => asArray(candidate.risk_flags).includes('server-deterministic-review-map-used'));
}

function upstreamSummary(payload = {}) {
  const receipt = payload.requestReceipt || {};
  const attempts = asArray(payload.attempts);
  const stages = [...new Set(attempts.map((attempt) => Number.isFinite(Number(attempt.stage)) ? Number(attempt.stage) : null).filter((stage) => stage !== null))].sort((a, b) => a - b);
  return {
    upstreamProvider: safe(payload.provider),
    upstreamModel: safe(payload.model),
    upstreamProviderVersion: safe(payload.version || receipt.upstreamProviderVersion || receipt.providerVersion),
    upstreamRotationVersion: safe(payload.rotationVersion || receipt.rotationVersion || receipt.reviewMapRepairVersion),
    upstreamAttemptCount: attempts.length,
    upstreamAttemptStages: stages,
    upstreamAttemptModels: uniqueWarnings(attempts.map((attempt) => attempt.model)),
    upstreamTimedOutCount: attempts.filter((attempt) => attempt.timedOut).length,
    remoteRepairRetry: Boolean(receipt.remoteRepairRetry),
    hardPacketRemoteRepairRetry: Boolean(receipt.hardPacketRemoteRepairRetry),
    stageCount: Number(receipt.stageCount || stages.length || 0),
    upstreamElapsedMs: Number(receipt.elapsedMs || 0)
  };
}

function reviewServerRepair(payload = {}, contract = {}) {
  const sourceText = sourceTextFrom(contract);
  const warnings = uniqueWarnings(payload.warnings || []);
  const candidates = asArray(payload.candidates).filter((candidate) => candidateText(candidate));
  const riskRows = candidates.map((candidate, index) => ({ index, risk: copyRisk(candidateText(candidate), sourceText), wordCount: words(candidateText(candidate)).length }));
  const hasCopyRisk = riskRows.some((row) => row.risk.copied) || warnings.some((warning) => /copy-risk-remains|exact-copy|wrapper-copy|long-verbatim|near-copy/i.test(warning));
  const reviewMapRepair = isReviewMapRepair(payload);
  const clearedReviewMap = reviewMapRepair && reviewMapCleared(payload);
  const hasCandidate = candidates.length > 0;
  const release = hasCandidate && !hasCopyRisk && !reviewMapRepair;
  const releaseClass = release ? 'server-repair-transform' : reviewMapRepair ? 'diagnostic-review-map-held' : 'held';
  return {
    version: REVIEW_VERSION,
    release,
    releaseClass,
    reviewMapRepair,
    reviewMapCleared: clearedReviewMap,
    reason: release
      ? 'server-repair-passed-strict-copy-review'
      : reviewMapRepair ? 'review-map-repair-diagnostic-held-not-output' : hasCandidate ? 'server-repair-copy-risk-or-warning' : 'server-repair-empty',
    candidateCount: candidates.length,
    sourceWordCount: words(sourceText).length,
    warnings,
    riskRows
  };
}

function strictHold(payload = {}, contract = {}, startedAt = Date.now(), review = null) {
  const warnings = uniqueWarnings([
    ...(Array.isArray(payload.warnings) ? payload.warnings : []),
    review?.reviewMapRepair ? 'review-map-repair-diagnostic-held-not-output' : '',
    'strict-api-no-usable-candidates',
    'strict-anti-compression-held',
    'server-repair-not-auto-released',
    'no-local-fallback'
  ]);
  const upstream = upstreamSummary(payload);
  return attachStrictReceiptMeta({
    ...upstream,
    ok: false,
    provider: 'gemini-strict',
    model: payload.model || 'strict-anti-compression-review',
    strict: true,
    noFallback: true,
    error: review?.reviewMapRepair ? 'review_map_repair_diagnostic_held_not_output' : 'strict_anti_compression_held',
    candidates: [],
    warnings,
    attempts: payload.attempts || [],
    rejectedCopy: payload.rejectedCopy || [],
    rejectedCompressed: payload.rejectedCompressed || [],
    rejectedMissingMoves: payload.rejectedMissingMoves || [],
    strictRepairReview: review,
    providerErrorMessage: review?.reviewMapRepair ? 'Review-map repair is diagnostic scaffolding and was not released as transformed text.' : 'Strict direct endpoint held output after anti-compression review found no releasable remote candidate. The UI should remain responsive; this is a held result, not a transport timeout.',
    requestReceipt: {
      ...(payload.requestReceipt || {}),
      ...upstream,
      strict: true,
      noFallback: true,
      providerVersion: VERSION,
      reviewVersion: REVIEW_VERSION,
      upstreamProviderVersion: upstream.upstreamProviderVersion,
      upstreamRotationVersion: upstream.upstreamRotationVersion,
      antiCompression: true,
      reviewMapRepairHeld: Boolean(review?.reviewMapRepair),
      reviewMapCleared: Boolean(review?.reviewMapCleared),
      fallbackSuppressed: payload.provider === 'server-deterministic-repair',
      fallbackSuppressionReason: review?.reason || 'strict-mode-review-required',
      endpointMetaVersion: ENDPOINT_META_VERSION,
      packetTier: safe(contract.packetTier || ''),
      maskEvidenceState: safe(contract.maskEvidenceState || ''),
      elapsedMs: Date.now() - startedAt
    }
  }, contract, startedAt);
}

function strictReviewRelease(payload = {}, contract = {}, startedAt = Date.now(), review = {}) {
  const warnings = uniqueWarnings([
    ...(Array.isArray(payload.warnings) ? payload.warnings : []),
    'strict-server-repair-reviewed-release',
    'remote-provider-no-usable-candidate',
    'server-repair-passed-copy-review'
  ]);
  const upstream = upstreamSummary(payload);
  return attachStrictReceiptMeta({
    ...payload,
    ...upstream,
    ok: true,
    provider: 'gemini-strict-reviewed-repair',
    model: 'server-repair-reviewed',
    strict: true,
    noFallback: false,
    fallbackReleased: true,
    outputReleased: true,
    strictReviewRelease: true,
    strictRepairReview: review,
    warnings,
    requestReceipt: {
      ...(payload.requestReceipt || {}),
      ...upstream,
      strict: true,
      noFallback: false,
      strictDirect: true,
      strictDirectVersion: VERSION,
      reviewVersion: REVIEW_VERSION,
      endpointMetaVersion: ENDPOINT_META_VERSION,
      fallbackReleased: true,
      fallbackReleaseReason: review.reason,
      releaseClass: review.releaseClass,
      reviewMapRepairReleased: false,
      upstreamProviderVersion: upstream.upstreamProviderVersion,
      upstreamRotationVersion: upstream.upstreamRotationVersion,
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
      reviewVersion: REVIEW_VERSION,
      upstream: '/api/hush-generate',
      legacyProxy: false,
      note: 'Strict endpoint calls the anti-compression generator directly and keeps review-map repair diagnostic-only while exposing upstream retry fields.'
    });
  }
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method-not-allowed', version: VERSION });

  const startedAt = Date.now();
  const contract = req.body?.contract || req.body || {};
  try {
    const upstreamUrl = `${originFromReq(req)}/api/hush-generate`;
    const response = await fetch(upstreamUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contract })
    });
    const payload = await response.json().catch(() => ({}));
    if (payload.provider === 'server-deterministic-repair' || /^server-repair/.test(safe(payload.model))) {
      const review = reviewServerRepair(payload, contract);
      return send(res, 200, review.release ? strictReviewRelease(payload, contract, startedAt, review) : strictHold(payload, contract, startedAt, review));
    }
    const upstream = upstreamSummary(payload);
    return send(res, response.status, attachStrictReceiptMeta({
      ...payload,
      ...upstream,
      strict: true,
      noFallback: true,
      strictDirect: true,
      strictDirectVersion: VERSION,
      requestReceipt: {
        ...(payload.requestReceipt || {}),
        ...upstream,
        strict: true,
        noFallback: true,
        strictDirect: true,
        strictDirectVersion: VERSION,
        endpointMetaVersion: ENDPOINT_META_VERSION,
        upstreamProviderVersion: upstream.upstreamProviderVersion,
        upstreamRotationVersion: upstream.upstreamRotationVersion,
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
        endpointMetaVersion: ENDPOINT_META_VERSION,
        elapsedMs: Date.now() - startedAt
      }
    }, contract, startedAt));
  }
}
