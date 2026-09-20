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
  const modelFromMessage = (message.match(/model:\s*([a-z0-9_.-]+)/i) || [])[1] || '';
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
  const daily = /(?:per[_ -]?day|daily|requests[_ -]?per[_ -]?day|tokens[_ -]?per[_ -]?day)/i.test(cadenceText);
  const burst = /(?:per[_ -]?(?:minute|second)|requests[_ -]?per[_ -]?minute|tokens[_ -]?per[_ -]?minute|rate)/i.test(cadenceText)
    || (retryAfterSeconds > 0 && retryAfterSeconds <= 60 && !daily);
  const limit = Number(limitFromMessage);

  return Object.freeze({
    observed: code === 429 || status === 'RESOURCE_EXHAUSTED' || Boolean(violations.length) || /quota|rate limit|resource exhausted/i.test(message),
    scope,
    metric: metrics[0] || null,
    quotaId: quotaIds[0] || null,
    model: observedModels[0] || currentModel || null,
    retryAfterSeconds,
    limit: Number.isFinite(limit) && limit >= 0 ? limit : null,
    daily,
    burst,
    structured: violations.length > 0,
    violationCount: violations.length,
    messagePreview: message || null
  });
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
