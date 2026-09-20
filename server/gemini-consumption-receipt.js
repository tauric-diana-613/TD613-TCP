export const GEMINI_CONSUMPTION_SCHEMA = 'td613.gemini-consumption-receipt/v0.1';

const safe = (value = '') => String(value ?? '').trim();
const modelId = (value = '') => safe(value).replace(/^models\//, '');
const boundedStatus = (value) => {
  const status = Number(value || 0);
  return Number.isInteger(status) && status >= 100 && status <= 599 ? status : null;
};
const boundedMs = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
};
const outcomeFor = ({ status, timedOut }) => {
  if (timedOut || status === 408) return 'timeout';
  if (status === 429) return 'rate-limit';
  if (status === 503) return 'provider-unavailable';
  if (status && status >= 200 && status < 300) return 'provider-response';
  if (status && status >= 400) return 'provider-error';
  return 'unknown';
};
const boundedQuota = (attempt = {}) => {
  const quota = attempt.rateLimit || attempt.rate_limit || null;
  if (!quota || typeof quota !== 'object') return null;
  const limit = Number(quota.limit);
  return Object.freeze({
    scope: safe(quota.scope) || null,
    quota_id: safe(quota.quotaId || quota.quota_id) || null,
    metric: safe(quota.metric) || null,
    model: modelId(quota.model) || null,
    limit: Number.isFinite(limit) && limit >= 0 ? limit : null,
    retry_after_seconds: Number.isFinite(Number(quota.retryAfterSeconds ?? quota.retry_after_seconds))
      ? Number(quota.retryAfterSeconds ?? quota.retry_after_seconds)
      : null
  });
};

export function buildGeminiConsumptionReceipt({
  route = 'unknown',
  attempts = [],
  requestId = null,
  releaseWitness = false,
  observedAt = null
} = {}) {
  const events = (Array.isArray(attempts) ? attempts : []).map((attempt, index) => {
    const status = boundedStatus(attempt?.status);
    const timedOut = attempt?.timedOut === true || attempt?.timed_out === true;
    const elapsedMs = boundedMs(attempt?.elapsedMs ?? attempt?.elapsed_ms);
    const timeoutMs = boundedMs(attempt?.timeoutMs ?? attempt?.timeout_ms);
    const model = modelId(attempt?.model);
    const ordinal = index + 1;
    const eventId = [safe(route) || 'unknown', safe(requestId) || 'unbound', ordinal, model || 'unknown', status ?? 'none'].join(':');
    return Object.freeze({
      schema: GEMINI_CONSUMPTION_SCHEMA,
      event_id: eventId,
      route: safe(route) || 'unknown',
      request_id: safe(requestId) || null,
      ordinal,
      model: model || null,
      status,
      outcome: outcomeFor({ status, timedOut }),
      timed_out: timedOut,
      elapsed_ms: elapsedMs,
      timeout_ms: timeoutMs,
      repair: Boolean(attempt?.kind === 'structural-repair' || attempt?.repair_of_attempt),
      release_witness: releaseWitness === true,
      quota: boundedQuota(attempt)
    });
  });
  const byModel = {};
  for (const event of events) {
    if (!event.model) continue;
    byModel[event.model] = (byModel[event.model] || 0) + 1;
  }
  return Object.freeze({
    schema: GEMINI_CONSUMPTION_SCHEMA,
    coverage: 'request-local-provider-attempts-only',
    provider_daily_total: null,
    observed_at: safe(observedAt) || null,
    call_count: events.length,
    models: Object.freeze(byModel),
    events: Object.freeze(events)
  });
}

export function logGeminiConsumption(receipt = null) {
  if (!receipt?.events?.length) return receipt;
  for (const event of receipt.events) {
    try { console.info('[gemini-consumption]', JSON.stringify(event)); } catch {}
  }
  return receipt;
}
