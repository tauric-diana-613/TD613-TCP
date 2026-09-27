// Transport-only retry evidence. A prior 429 may never loan its RetryInfo to a 503.
// A named per-day quota is not an observed usage total; short RetryInfo cannot reset it.
export const MARROWLINE_RETRY_WINDOW_SCHEMA = 'td613.marrowline.retry-window/v0.3';
const MAX_SECONDS = 1800;
const safeSeconds = value => Number.isFinite(Number(value)) && Number(value) > 0
  ? Math.min(MAX_SECONDS, Math.ceil(Number(value))) : 0;
const safe = value => String(value ?? '').toLowerCase();
// Published RPD schedule, never a claim about the current project's balance.
// The offset is measured *before* the next Pacific midnight so DST transitions
// at 02:00 cannot shift the reset by an hour.
export function nextPublishedPacificDailyReset(now = Date.now()) {
  if (!Number.isFinite(now)) return null;
  const zone = 'America/Los_Angeles';
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date(now)).map(({ type, value }) => [type, value]));
  const nextMidnightAsUtc = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) + 1);
  const offset = new Intl.DateTimeFormat('en-US', {
    timeZone: zone, timeZoneName: 'shortOffset'
  }).formatToParts(new Date(nextMidnightAsUtc + 6 * 3600000)).find(part => part.type === 'timeZoneName')?.value || '';
  const match = offset.match(/^GMT([+-])(\\d{1,2})(?::(\\d{2}))?$/);
  if (!match) return null;
  const minutes = (Number(match[2]) * 60 + Number(match[3] || 0)) * (match[1] === '+' ? 1 : -1);
  return new Date(nextMidnightAsUtc - minutes * 60000).toISOString();
}
const isDailyMetric = q => q?.daily === true || q?.dailyMetricReported === true || q?.windowClass === 'daily'
  || q?.windowClass === 'mixed' || /per[_ -]?day|daily/i.test([q?.quotaId, q?.quota_id, q?.metric].map(safe).join(' '));
const isShortMetric = q => q?.shortMetricReported === true || q?.windowClass === 'short'
  || q?.windowClass === 'mixed' || /per[_ -]?(?:minute|second)|rate[_ -]?limit/i.test([q?.quotaId, q?.quota_id, q?.metric].map(safe).join(' '));

export function classifyMarrowlineRetryWindow(failure = {}, now = Date.now()) {
  const error = [failure?.error, failure?.diagnostic?.code].map(safe).join(' ');
  const attempts = Array.isArray(failure?.attempts) ? failure.attempts : [];
  const statuses = attempts.map(item => Number(item?.status || 0));
  const hasServiceFailure = statuses.some(status => status >= 500)
    || (/provider.unavailable|provider_unavailable/i.test(error) && Number(failure?.httpStatus) !== 429)
    || Number(failure?.httpStatus) === 503;
  const all429 = statuses.length > 0 && statuses.every(status => status === 429);
  const quota = attempts.filter(item => Number(item?.status) === 429).map(item => item.rateLimit || {});
  if (Number(failure?.httpStatus) === 429 && failure?.rateLimit && typeof failure.rateLimit === 'object') quota.push(failure.rateLimit);
  const dailyMetricReported = quota.some(isDailyMetric);
  const shortMetricReported = quota.some(isShortMetric);
  const freeTierMetricReported = quota.some(item => /free.?tier/i.test(
    [item.quotaId, item.quota_id, item.metric].map(safe).join(' ')
  ));
  const entitlementMismatchReported = quota.some(item => item.entitlement?.mismatch === true);
  const projectSpendCapReported = /project.spend.cap|PROJECT_MONTHLY_SPEND_CAP_REACHED/i.test(error)
    || quota.some(item => item.projectSpendCapReported === true || /project[^\n]*monthly spending cap/i.test(safe(item.messagePreview)))
    || attempts.some(item => /project[^\n]*monthly spending cap/i.test(safe(item?.error?.message)));
  const observedAt = Number(failure?.observedAt);
  const origin = Number.isFinite(observedAt) && observedAt > 0 && observedAt <= now + 60000 ? observedAt : now;
  const providerHintSeconds = safeSeconds(failure?.rateLimit?.retryAfterSeconds || failure?.retryAfterSeconds)
    || Math.min(...quota.map(item => safeSeconds(item.retryAfterSeconds ?? item.retry_after_seconds)).filter(Boolean), Infinity);
  const safeHint = Number.isFinite(providerHintSeconds) ? providerHintSeconds : 0;
  let kind = 'other', seconds = 0, source = 'none';
  if (projectSpendCapReported) {
    kind = 'project-spend-cap'; // A configured project cap is not a cooldown.
  } else if (/no-eligible-callable-models|missing-gemini-api-key/i.test(error)) kind = 'other';
  else if (/output-quality-held|attractor_structure_not_admitted|provider.incomplete|output.token.limit/i.test(error)) kind = 'return-held';
  else if (hasServiceFailure) {
    // Mixed 429→503 routes are service failures; earlier 429 RetryInfo is not a
    // service cooldown. Any real 503 retry hint remains in the raw attempt receipt.
    kind = 'service-busy';
  } else if (dailyMetricReported && (all429 || Number(failure?.httpStatus) === 429)) {
    kind = 'daily-report'; // A named daily metric does not prove account usage or balance.
    // A real provider Retry-After can suggest the next attempt, but does not
    // establish that a reported daily metric resets when this short clock ends.
    if (safeHint > 0) { seconds = safeHint; source = 'provider-retry-delay'; }
  } else if (all429 || /shared.rate.limit|rate.limit.held/.test(error) || Number(failure?.httpStatus) === 429) {
    kind = shortMetricReported ? 'rate-window' : 'rate-unknown';
    if (safeHint > 0) {
      seconds = safeHint; source = 'provider-retry-delay';
    }
  }
  const reportedModels = [...new Set(attempts.filter(item => Number(item?.status) === 429)
    .map(item => String(item?.model || '').trim()).filter(Boolean))];
  const retryAt = seconds ? origin + seconds * 1000 : null;
  const remainingSeconds = retryAt ? Math.max(0, Math.ceil((retryAt - now) / 1000)) : 0;
  return Object.freeze({
    schema: MARROWLINE_RETRY_WINDOW_SCHEMA, kind, source, seconds, retryAt,
    reportedModels: Object.freeze(reportedModels),
    remainingSeconds, retryReady: remainingSeconds === 0,
    observedDaily: dailyMetricReported, dailyMetricReported, shortMetricReported, freeTierMetricReported,
    entitlementMismatchReported, projectSpendCapReported, providerDailyExhaustionVerified: false,
    providerDelayObserved: source === 'provider-retry-delay',
    shortHintDoesNotProveDailyReset: dailyMetricReported && safeHint > 0,
    // For receipts, not a universal UI clock or permission veto.
    providerHintSeconds: safeHint, publishedDailyResetPolicy: dailyMetricReported
      ? 'midnight America/Los_Angeles; calendar policy, not a verified account reset'
      : null,
    nextPublishedDailyResetAt: dailyMetricReported ? nextPublishedPacificDailyReset(now) : null,
    originalAttemptStatuses: Object.freeze(statuses)
  });
}

export function marrowlineRetryMessage(failure = {}, now = Date.now()) {
  const window = classifyMarrowlineRetryWindow(failure, now);
  if (window.kind === 'return-held') return 'The reply was unfinished. Your message is saved.';
  if (window.kind === 'project-spend-cap') return 'Google reports this API project reached its configured monthly spending cap. This is not a timed cooldown. Check the cap in AI Studio; your message is saved.';
  const models = window.reportedModels.length
    ? ` (${window.reportedModels.length} model${window.reportedModels.length === 1 ? '' : 's'} reported 429)` : '';
  if (window.kind === 'daily-report') return `Gemini reported a daily request metric${models}. Project balance and actual quota usage are unverified here; your message is saved. See Receipt for the exact provider metric.`;
  if (window.kind === 'rate-window') return `Gemini reported a short-window request limit${models}. Your message is saved; a provider delay applies to retrying that task.`;
  if (window.kind === 'rate-unknown') return `Gemini returned HTTP 429${models}. Project balance and effective quota are unverified here; your message is saved. See Receipt for the provider response.`;
  if (window.kind === 'service-busy') return 'The service could not answer just now. Your message is saved; try again.';
  return '';
}
