/** Spending authority and physical input/output limits are separate from scientific validity. */
export function validatePolicy(p) {
  if (!p || !Number.isSafeInteger(p.maxEpisodeAttempts) || p.maxEpisodeAttempts < 1 || !Number.isSafeInteger(p.maxWindowAttempts) || p.maxWindowAttempts < 1 || !Number.isSafeInteger(p.reservationTokens) || p.reservationTokens < 1 || !Number.isSafeInteger(p.maxAccountedTokens) || p.maxAccountedTokens < 1 || !Number.isSafeInteger(p.maxRejectedRetries) || p.maxRejectedRetries < 0) throw Error('FINITE_OPERATOR_RESOURCE_POLICY_REQUIRED');
  if (!['subscription-only', 'api'].includes(p.accountClass) || !Number.isFinite(p.reservationUSD) || p.reservationUSD < 0 || !Number.isFinite(p.maxUSD) || p.maxUSD < 0 || (p.accountClass === 'api' && p.reservationUSD <= 0)) throw Error('FINITE_FINANCIAL_POLICY_REQUIRED');
  if (!['reported-input-output-proxy', 'conservative-reservation','administrative-context-reservation'].includes(p.accountingBasis)) throw Error('EXPLICIT_ACCOUNTING_BASIS_REQUIRED');
  return p;
}
const numberOrNull = n => Number.isSafeInteger(n) && n >= 0 ? n : null;
export function usageRecord(result) {
  const u = result.usage ?? {};
  const input = numberOrNull(u.input_tokens), output = numberOrNull(u.output_tokens);
  return {
    input_tokens: input, output_tokens: output,
    cached_input_tokens: numberOrNull(u.cached_input_tokens),
    reasoning_tokens: numberOrNull(u.reasoning_tokens),
    reasoning_inclusion_semantics: result.reasoningInclusionSemantics ?? 'UNAVAILABLE',
    // Cache is a subset of input; reasoning is never added without verified inclusion semantics.
    reported_input_plus_output: input === null || output === null || !Number.isSafeInteger(input+output) ? null : input + output,
    billable_usd: Number.isFinite(result.billableUSD) && result.billableUSD >= 0 ? result.billableUSD : null,
    subscription_quota_units: numberOrNull(result.subscriptionQuotaUnits),
    quota_units_are_tokens: false,
    raw_provider_usage: result.usage ?? null
  };
}
export function resourceState(events, policy, windowId) {
  const intents = events.filter(e => e.type === 'DISPATCH_INTENT');
  let tokens = 0, usd = 0;
  for (const i of intents) {
    const accepted = events.find(e => e.type === 'TURN_ACCEPTED' && e.payload.attempt === i.payload.attempt);
    const rejected = events.find(e => e.type === 'REJECTED_NO_EXECUTION' && e.payload.attempt === i.payload.attempt);
    const usage = accepted?.payload.usage;
    tokens += rejected ? 0 : policy.accountingBasis==='administrative-context-reservation'?i.payload.reservation.tokens:Math.max(policy.accountingBasis === 'reported-input-output-proxy' ? usage?.reported_input_plus_output ?? i.payload.reservation.tokens : Math.max(usage?.reported_input_plus_output ?? 0, i.payload.reservation.tokens), 0);
    usd += rejected ? 0 : usage?.billable_usd ?? i.payload.reservation.usd;
  }
  if(!Number.isSafeInteger(tokens))throw Error('ACCOUNTING_OVERFLOW_HOLD');
  return { attempts: intents.length, window_attempts: intents.filter(e => e.payload.window === windowId).length, accounted_tokens: tokens,
    accounted_unit_class:policy.accountingBasis==='administrative-context-reservation'?'ADMINISTRATIVE_PROXY_NOT_PROVIDER_TOKENS':'TOKEN_ACCOUNTING_POLICY',accounted_usd: usd,
    unknown_usage_attempts: intents.filter(i => !events.some(e => e.type === 'TURN_ACCEPTED' && e.payload.attempt === i.payload.attempt && e.payload.usage.reported_input_plus_output !== null) && !events.some(e => e.type === 'REJECTED_NO_EXECUTION' && e.payload.attempt === i.payload.attempt)).length };
}
export function canReserve(events, policy, windowId) {
  validatePolicy(policy);
  const s = resourceState(events, policy, windowId);
  if (s.attempts + 1 > policy.maxEpisodeAttempts || s.window_attempts + 1 > policy.maxWindowAttempts || s.accounted_tokens + policy.reservationTokens > policy.maxAccountedTokens || s.accounted_usd + policy.reservationUSD > policy.maxUSD) return { permitted: false, reason: 'RESOURCE_AUTHORITY_PAUSE', ...s };
  return { permitted: true, reservation: { tokens: policy.reservationTokens, usd: policy.reservationUSD,
    unit_class:policy.accountingBasis==='administrative-context-reservation'?'ADMINISTRATIVE_PROXY_NOT_PROVIDER_TOKENS':'TOKEN_ACCOUNTING_POLICY' }, ...s };
}
