const safeStatus = (value) => Number.isInteger(Number(value)) ? Number(value) : 0;
const normalizedModel = (model = '') => String(model || '').replace(/^models\//, '');

export function geminiGenerateContentUrl(model = '') {
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(normalizedModel(model))}:generateContent`;
}

export function geminiRequestHeaders(apiKey = '') {
  return Object.freeze({
    'content-type': 'application/json',
    'x-goog-api-key': String(apiKey || '')
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
