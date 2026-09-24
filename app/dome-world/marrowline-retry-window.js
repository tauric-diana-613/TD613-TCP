// Human-facing retry window from request-bound Gemini evidence, not a fabricated model reset schedule.
export const MARROWLINE_RETRY_WINDOW_SCHEMA = 'td613.marrowline.retry-window/v0.1';
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
  const daily = quota.length > 0 && quota.every(item => item.daily === true);
  const explicit = quota.map(item => safeSeconds(item.retryAfterSeconds)).filter(Boolean);
  const topLevel = safeSeconds(failure?.rateLimit?.retryAfterSeconds || failure?.retryAfterSeconds);
  const providerWait = topLevel || (explicit.length ? Math.min(...explicit) : 0);
  const observedAt = Number(failure?.observedAt);
  const origin = Number.isFinite(observedAt) && observedAt > 0 && observedAt <= now + 60000 ? observedAt : now;
  let kind = 'other', seconds = 0, source = 'none';
  if (/output-quality-held|attractor_structure_not_admitted|provider.incomplete|output.token.limit/i.test(error)) kind = 'return-held';
  else if (daily && all429) kind = 'daily-quota';
  else if (all429 || /shared.rate.limit|rate.limit.held/.test(error) || Number(failure?.httpStatus) === 429) {
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
    observedDaily: daily, providerDelayObserved: source === 'provider-retry-delay'
  });
}

export function marrowlineRetryMessage(failure = {}, now = Date.now()) {
  const window = classifyMarrowlineRetryWindow(failure, now);
  if (window.kind === 'return-held') return 'A provider return arrived, then Marrowline held it locally after generation because the required conversation structure was not admitted. The provider did not reject your request. Your message and available receipt are preserved. This is not a Gemini rate-limit error.';
  if (window.kind === 'daily-quota') return 'Gemini reported daily quota exhaustion on the attempted routes. This is not a short session cooldown. Your message is saved; retry after the provider quota resets or another eligible route becomes available.';
  if (window.kind === 'rate-window') return window.providerDelayObserved
    ? 'Gemini reported a temporary request/token limit. Your message is saved. The provider supplied a retry delay; the refresh control unlocks when it elapses.'
    : 'Gemini returned 429 without a verified reset time. Your message is saved. A cautious one-minute retry backoff is shown below; it is an estimate, not a promise that quota has reset.';
  if (window.kind === 'service-busy') return window.providerDelayObserved
    ? 'Gemini is temporarily unavailable. Your message is saved. Retry when the provider-supplied delay has elapsed.'
    : 'Gemini service could not complete this request. It is temporarily busy or unavailable. Your message is saved. No confirmed retry delay was supplied; this is not proof of a daily quota limit.';
  return '';
}
