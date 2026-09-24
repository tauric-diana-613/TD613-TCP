// Human-facing retry windows must not promote a provider quota *metric* to verified daily usage.
// A 429 describes a rejected request. AI Studio/project accounting remains outside this browser.
export const MARROWLINE_RETRY_WINDOW_SCHEMA = 'td613.marrowline.retry-window/v0.2';
const MAX_SECONDS = 1800;
const safeSeconds = value => Number.isFinite(Number(value)) && Number(value) > 0
  ? Math.min(MAX_SECONDS, Math.ceil(Number(value))) : 0;
const safe = value => String(value ?? '').toLowerCase();

export function classifyMarrowlineRetryWindow(failure = {}, now = Date.now()) {
  const error = [failure?.error, failure?.diagnostic?.code].map(safe).join(' ');
  const attempts = Array.isArray(failure?.attempts) ? failure.attempts : [];
  const statuses = attempts.map(item => Number(item?.status || 0));
  const quota = attempts.filter(item => Number(item?.status) === 429).map(item => item.rateLimit || {});
  const all429 = statuses.length > 0 && statuses.every(status => status === 429);
  const dailyMetricReported = quota.some(item => item.daily === true);
  const every429DailyMetric = quota.length > 0 && quota.every(item => item.daily === true);
  const freeTierMetricReported = quota.some(item => /free.?tier/i.test(
    [item.quotaId, item.quota_id, item.metric].map(safe).join(' ')
  ));
  const entitlementMismatchReported = quota.some(item => item.entitlement?.mismatch === true);
  const explicit = quota.map(item => safeSeconds(item.retryAfterSeconds ?? item.retry_after_seconds)).filter(Boolean);
  const topLevel = safeSeconds(failure?.rateLimit?.retryAfterSeconds || failure?.retryAfterSeconds);
  const providerWait = topLevel || (explicit.length ? Math.min(...explicit) : 0);
  const observedAt = Number(failure?.observedAt);
  const origin = Number.isFinite(observedAt) && observedAt > 0 && observedAt <= now + 60000 ? observedAt : now;
  let kind = 'other', seconds = 0, source = 'none';
  if (/no-eligible-callable-models|missing-gemini-api-key/i.test(error)) kind = 'other';
  else if (/output-quality-held|attractor_structure_not_admitted|provider.incomplete|output.token.limit/i.test(error)) kind = 'return-held';
  else if (all429 && every429DailyMetric) {
    // QuotaFailure names the failing metric; it does not expose a matching
    // project-wide consumption counter or establish that AI Studio is wrong.
    kind = 'quota-review';
    seconds = providerWait || 60;
    source = providerWait ? 'provider-retry-delay' : 'estimated-backoff';
  } else if (all429 || /shared.rate.limit|rate.limit.held/.test(error) || Number(failure?.httpStatus) === 429) {
    kind = 'rate-window';
    seconds = providerWait || 60;
    source = providerWait ? 'provider-retry-delay' : 'estimated-backoff';
  } else if (/provider.unavailable|provider_unavailable/.test(error) || statuses.some(status => status === 503) || Number(failure?.httpStatus) === 503) {
    kind = 'service-busy'; seconds = providerWait;
    source = providerWait ? 'provider-retry-delay' : 'none';
  }
  const retryAt = seconds ? origin + seconds * 1000 : null;
  const remainingSeconds = retryAt ? Math.max(0, Math.ceil((retryAt - now) / 1000)) : 0;
  return Object.freeze({
    schema: MARROWLINE_RETRY_WINDOW_SCHEMA, kind, source, seconds, retryAt,
    remainingSeconds, retryReady: remainingSeconds === 0,
    // A metric-bearing response is not a verified provider usage total.
    observedDaily: dailyMetricReported, dailyMetricReported, freeTierMetricReported,
    entitlementMismatchReported, providerDailyExhaustionVerified: false,
    providerDelayObserved: source === 'provider-retry-delay'
  });
}

export function marrowlineRetryMessage(failure = {}, now = Date.now()) {
  const window = classifyMarrowlineRetryWindow(failure, now);
  if (window.kind === 'return-held') return 'A provider return arrived, then Marrowline held it locally after generation because the required conversation structure was not admitted. The provider did not reject your request. Your message and available receipt are preserved. This is not a Gemini rate-limit error.';
  if (window.kind === 'quota-review') {
    const metric = window.freeTierMetricReported
      ? 'a Free Tier per-day quota metric'
      : 'a per-day quota metric';
    const retry = window.providerDelayObserved
      ? 'A provider-supplied retry delay is shown below.'
      : 'No verified reset time was supplied; the short pause below is only an estimated retry backoff.';
    return `Gemini returned 429 citing ${metric}. This does NOT verify that your Google AI Studio daily allowance was consumed. Your message is preserved. Compare the API key’s project, model, and billing tier with AI Studio; a provider-side quota/provisioning mismatch is possible. ${retry}`;
  }
  if (window.kind === 'rate-window') return window.providerDelayObserved
    ? 'Gemini reported a temporary request/token limit. Your message is saved. The provider supplied a retry delay; the refresh control unlocks when it elapses.'
    : 'Gemini returned 429 without a verified reset time. Your message is saved. A cautious one-minute retry backoff is shown below; it is an estimate, not a promise that quota has reset.';
  if (window.kind === 'service-busy') return window.providerDelayObserved
    ? 'Gemini is temporarily unavailable. Your message is saved. Retry when the provider-supplied delay has elapsed.'
    : 'Gemini service could not complete this request. It is temporarily busy or unavailable. Your message is saved. No confirmed retry delay was supplied; this is not proof of a daily quota limit.';
  return '';
}
