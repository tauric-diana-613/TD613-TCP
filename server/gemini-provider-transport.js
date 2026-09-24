const safeStatus = (value) => Number.isInteger(Number(value)) ? Number(value) : 0;
const normalizedModel = (model = '') => String(model || '').replace(/^models\//, '');
const safeText = (value = '', max = 240) => String(value ?? '').trim().slice(0, max);
const uniq = (values = []) => [...new Set(values.map((value) => safeText(value, 160)).filter(Boolean))];

export function geminiGenerateContentUrl(model = '') {
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(normalizedModel(model))}:generateContent`;
}

export function geminiStreamGenerateContentUrl(model = '') {
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(normalizedModel(model))}:streamGenerateContent?alt=sse`;
}

export function geminiRequestHeaders(apiKey = '') {
  return Object.freeze({
    'content-type': 'application/json',
    'x-goog-api-key': String(apiKey || '')
  });
}

function retryDelaySeconds(value = '') {
  const match = String(value || '').trim().match(/^([0-9]+(?:\.[0-9]+)?)s$/i);
  if (!match) return 0;
  const seconds = Number(match[1]);
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : 0;
}

function headerRetryAfterSeconds(response) {
  const raw = response?.headers?.get?.('retry-after');
  const seconds = Number(raw || 0);
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : 0;
}

export function observeGeminiQuota(payload = {}, { model = '', response = null } = {}) {
  const error = payload?.error && typeof payload.error === 'object' ? payload.error : (payload || {});
  const status = safeText(error.status, 80);
  const code = safeStatus(error.code);
  const message = safeText(error.message, 900);
  const details = Array.isArray(error.details) ? error.details : [];
  const violations = [];
  let retryFromDetails = 0;

  for (const detail of details) {
    const type = safeText(detail?.['@type'] || detail?.type, 160);
    if (/QuotaFailure$/i.test(type)) {
      for (const violation of Array.isArray(detail?.violations) ? detail.violations : []) {
        const dimensions = violation?.quotaDimensions && typeof violation.quotaDimensions === 'object'
          ? violation.quotaDimensions
          : violation?.quota_dimensions && typeof violation.quota_dimensions === 'object'
            ? violation.quota_dimensions
            : {};
        violations.push({
          metric: safeText(violation?.quotaMetric || violation?.quota_metric, 240),
          quotaId: safeText(violation?.quotaId || violation?.quota_id, 240),
          dimensions: Object.freeze(Object.fromEntries(
            Object.entries(dimensions)
              .filter(([key, value]) => typeof key === 'string' && typeof value === 'string')
              .slice(0, 8)
              .map(([key, value]) => [safeText(key, 80), safeText(value, 160)])
          ))
        });
      }
    } else if (/RetryInfo$/i.test(type)) {
      retryFromDetails = Math.max(retryFromDetails, retryDelaySeconds(detail?.retryDelay || detail?.retry_delay));
    }
  }

  const metricFromMessage = (message.match(/Quota exceeded for metric:\s*([^,\n*]+)/i) || [])[1] || '';
  const limitFromMessage = (message.match(/limit:\s*([0-9.]+)/i) || [])[1] || '';
  // Sentence punctuation after a model ID is prose, not a second quota dimension.
  const modelFromMessage = (message.match(/model:\s*([a-z0-9_]+(?:[.-][a-z0-9_]+)*)/i) || [])[1] || '';
  const retryFromMessage = Number((message.match(/retry\s+in\s+([\d.]+)s/i) || [])[1] || 0);
  const retryAfterSeconds = Math.max(
    headerRetryAfterSeconds(response),
    retryFromDetails,
    Number.isFinite(retryFromMessage) && retryFromMessage > 0 ? Math.ceil(retryFromMessage) : 0
  );

  const metrics = uniq([
    ...violations.map((violation) => violation.metric),
    metricFromMessage
  ]);
  const quotaIds = uniq(violations.map((violation) => violation.quotaId));
  const dimensionModels = uniq(violations.map((violation) => violation.dimensions?.model));
  const observedModels = uniq([...dimensionModels, modelFromMessage]);
  const currentModel = normalizedModel(model);

  let scope = 'unknown';
  if (violations.length) {
    const everyViolationHasModel = violations.every((violation) => Boolean(violation.dimensions?.model));
    if (everyViolationHasModel && observedModels.length === 1) scope = 'model';
    else if (violations.some((violation) => !violation.dimensions?.model)) scope = 'shared';
  } else if (modelFromMessage) {
    scope = 'model';
  }

  const cadenceText = [...metrics, ...quotaIds].join(' ').toLowerCase();
  const daily = /(?:per[_ -]?day|daily|requests[_ -]?per[_ -]?day|tokens[_ -]?per[_ -]?day)/i.test(cadenceText)
    || /^quota_exceeded$/i.test(status);
  const shortMetricReported = /(?:per[_ -]?(?:minute|second)|requests[_ -]?per[_ -]?minute|tokens[_ -]?per[_ -]?minute|rate[_ -]?limit)/i.test(cadenceText)
    || /^(?:rate_limit_exceeded|too_many_requests)$/i.test(status);
  const windowClass = daily && shortMetricReported ? 'mixed' : daily ? 'daily' : shortMetricReported ? 'short' : 'unknown';
  // A 27s RetryInfo on a *daily* quota does not make the daily quota a 27s bucket.
  const burst = shortMetricReported || (retryAfterSeconds > 0 && retryAfterSeconds <= 60 && !daily);
  // An absent limit is UNKNOWN, not the numeric value zero (Number('') === 0).
  const limit = limitFromMessage !== '' ? Number(limitFromMessage) : null;

  return Object.freeze({
    observed: code === 429 || status === 'RESOURCE_EXHAUSTED' || Boolean(violations.length) || /quota|rate limit|resource exhausted/i.test(message),
    scope,
    metric: metrics[0] || null,
    quotaId: quotaIds[0] || null,
    model: observedModels[0] || currentModel || null,
    retryAfterSeconds,
    limit: limit !== null && Number.isFinite(limit) && limit >= 0 ? limit : null,
    daily,
    // Per-day is the named rejected quota metric, NOT evidence of project usage.
    dailyMetricReported: daily,
    dailyExhaustionVerified: false,
    freeTierMetricReported: /free.?tier/i.test(cadenceText),
    shortMetricReported,
    windowClass,
    // Preserve every reported quota dimension; never merge per-day and
    // per-minute violations into an imaginary single reset window.
    quotaViolations: Object.freeze(violations.map(violation => Object.freeze(violation))),
    errorStatus: status || null,
    publishedDailyResetPolicy: daily ? 'midnight America/Los_Angeles; account usage unverified' : null,
    burst,
    structured: violations.length > 0,
    violationCount: violations.length,
    messagePreview: message || null
  });
}

export function assessGeminiQuotaEntitlement(rateLimit = {}, { expectedDailyLimit = 0, routeModelCount = 1 } = {}) {
  const expected = Number(expectedDailyLimit || 0);
  const observed = rateLimit?.limit === null || rateLimit?.limit === undefined || rateLimit?.limit === ''
    ? null : Number(rateLimit.limit);
  const quotaId = safeText(rateLimit?.quotaId, 240);
  const metric = safeText(rateLimit?.metric, 240);
  const model = normalizedModel(rateLimit?.model || '');
  const models = Number.isFinite(Number(routeModelCount)) && Number(routeModelCount) > 0
    ? Math.max(1, Math.floor(Number(routeModelCount)))
    : 1;
  const freeTierDaily = rateLimit?.daily === true
    && /FreeTier/i.test(quotaId)
    && /PerDay|daily|free_tier_requests/i.test(`${quotaId} ${metric}`);
  const perModel = freeTierDaily && (
    /PerModel/i.test(quotaId)
    || rateLimit?.scope === 'model'
  );
  const providerReportedDailyLimit = observed !== null && Number.isFinite(observed) && observed >= 0 ? observed : null;
  // A limit reported for one named model cannot be multiplied across unobserved
  // seats. Even a complete model listing proves only discovery, not the other
  // models' quotas, usage or live generation availability. Keep aggregate capacity
  // unknown unless the provider explicitly reports a shared route/project limit.
  const routeDailyCapacity = freeTierDaily && !perModel ? providerReportedDailyLimit : null;
  const mismatch = routeDailyCapacity !== null && Number.isFinite(expected) && expected > 0
    ? routeDailyCapacity < expected
    : null;

  return Object.freeze({
    expectedDailyLimit: Number.isFinite(expected) && expected > 0 ? expected : null,
    providerReportedDailyLimit,
    limitScope: perModel ? 'per-model' : freeTierDaily ? 'route-or-project' : 'unknown',
    routeModelCount: models,
    routeDailyCapacity,
    mismatch,
    reason: mismatch ? 'provider-route-daily-capacity-below-operator-entitlement' : null,
    model: model || null,
    quotaId: quotaId || null,
    metric: metric || null
  });
}

// Pace already-approved *next* seats after fast upstream 503 replies. This is
// not a repeat request, quota clock, global hold, or permission to change order.
// A brief transient overload must not collapse the five-seat frontier into one
// near-simultaneous burst. Never borrow a 429 RetryInfo for this delay.
const GEMINI_503_FAILOVER_STEPS_MS = Object.freeze([1000, 2000, 4000]);
const GEMINI_503_FAILOVER_TOTAL_MS = 7000;
export function gemini503FailoverDelayMs({
  status = 0, service503Count = 0, alreadyWaitedMs = 0,
  remainingMs = 0, hasNextModel = false
} = {}) {
  if (safeStatus(status) !== 503 || hasNextModel !== true) return 0;
  const count = Math.floor(Number(service503Count));
  const remaining = Number(remainingMs);
  if (!Number.isFinite(count) || count < 1 || !Number.isFinite(remaining) || remaining <= 1000) return 0;
  const prior = Math.max(0, Math.floor(Number(alreadyWaitedMs) || 0));
  const proposed = GEMINI_503_FAILOVER_STEPS_MS[Math.min(count, GEMINI_503_FAILOVER_STEPS_MS.length) - 1];
  const delay = Math.min(proposed, Math.max(0, GEMINI_503_FAILOVER_TOTAL_MS - prior), Math.max(0, Math.floor(remaining) - 1000));
  return delay >= 250 ? delay : 0;
}

export function classifyGeminiTransport({ status = 0, timedOut = false } = {}) {
  const httpStatus = safeStatus(status);
  if (timedOut || httpStatus === 408) return Object.freeze({ class: 'timeout', mayFailOver: true, healthBearing: true });
  if (httpStatus >= 200 && httpStatus < 300) return Object.freeze({ class: 'success', mayFailOver: false, healthBearing: true });
  if (httpStatus === 404) return Object.freeze({ class: 'model-unavailable', mayFailOver: true, healthBearing: true });
  if (httpStatus === 429) return Object.freeze({ class: 'rate-limited', mayFailOver: true, healthBearing: true });
  if (httpStatus >= 500 || httpStatus === 599) return Object.freeze({ class: 'provider-transient', mayFailOver: true, healthBearing: true });
  if (httpStatus >= 400 && httpStatus < 500) return Object.freeze({ class: 'request-rejected', mayFailOver: false, healthBearing: false });
  return Object.freeze({ class: 'transport-unknown', mayFailOver: false, healthBearing: false });
}

export function geminiMayFailOver(status = 0, options = {}) {
  return classifyGeminiTransport({ status, ...options }).mayFailOver;
}

export function geminiHealthOutcome({ ok = false, status = 0, timedOut = false, retryAfterSeconds = 0, reason = '' } = {}) {
  const classification = classifyGeminiTransport({ status, timedOut });
  return Object.freeze({
    ok: Boolean(ok),
    status: safeStatus(status),
    timedOut: Boolean(timedOut),
    retryAfterSeconds: Number.isFinite(Number(retryAfterSeconds)) ? Math.max(0, Number(retryAfterSeconds)) : 0,
    reason: String(reason || classification.class),
    healthBearing: classification.healthBearing,
    transportClass: classification.class
  });
}
