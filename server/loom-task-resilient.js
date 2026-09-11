import { createLoomTaskHandler, LOOM_TASK_TIMEOUT_MS } from './loom-task.js';
import { resolveGeminiProviderPlan, recordGeminiModelOutcome } from './gemini-model-policy.js';
import { consumeRateSlot } from './khonapolit-quality.js';

export const LOOM_TASK_FAILOVER_POLICY = 'td613.loom.provider-failover/v0.1';
export const LOOM_TASK_MAX_PROVIDER_CALLS = 2;

const validModel = value => typeof value === 'string' && /^[a-zA-Z0-9._-]{1,120}$/.test(value);
const safeCount = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
const transientHttp = status => status === 429 || (Number.isInteger(status) && status >= 500 && status <= 599);

function captureResponse() {
  const headers = {};
  return {
    statusCode: 200,
    headers,
    body: null,
    setHeader(name, value) { headers[name] = value; },
    end(raw) {
      try { this.body = JSON.parse(String(raw)); }
      catch { this.body = null; }
    }
  };
}

function forward(captured, res, body = captured.body) {
  res.statusCode = captured.statusCode;
  for (const [name, value] of Object.entries(captured.headers)) res.setHeader(name, value);
  return res.end(JSON.stringify(body));
}

function attemptFrom(observations = {}) {
  const attempt = {};
  if (validModel(observations.model)) attempt.model = observations.model;
  if (Number.isInteger(observations.http_status) && observations.http_status >= 100 && observations.http_status <= 599) attempt.http_status = observations.http_status;
  return attempt;
}

/**
 * One user request may cross to at most one different eligible model when the first
 * model returns a transient HTTP status. The same resolved provider plan and the same
 * total request deadline remain authoritative. Provider JSON/admission failures are
 * never retried and a third generation call is impossible here.
 */
export function createResilientLoomTaskHandler({
  env = process.env,
  fetchImpl = (...args) => fetch(...args),
  resolvePlan = resolveGeminiProviderPlan,
  recordOutcome = recordGeminiModelOutcome,
  rateSlot = consumeRateSlot,
  now = Date.now,
  timeoutMs = LOOM_TASK_TIMEOUT_MS
} = {}) {
  const totalDeadlineMs = Number.isFinite(timeoutMs) ? Math.max(1, Math.min(timeoutMs, LOOM_TASK_TIMEOUT_MS)) : LOOM_TASK_TIMEOUT_MS;
  return async function resilientLoomTaskHandler(req, res) {
    const started = now();
    let resolvedPlan = null;
    const firstHandler = createLoomTaskHandler({
      env, fetchImpl,
      resolvePlan: async options => {
        resolvedPlan = await resolvePlan(options);
        return resolvedPlan;
      },
      recordOutcome, rateSlot, now, timeoutMs: totalDeadlineMs
    });
    const first = captureResponse();
    await firstHandler(req, first);

    const firstObservations = first.body?.observations;
    const firstProviderStatus = firstObservations?.http_status;
    const firstModel = firstObservations?.model;
    const eligibleForFailover = first.statusCode === 502
      && first.body?.status === 'held'
      && first.body?.error === 'provider-request-failed'
      && first.body?.diagnostic?.code === 'PROVIDER_HTTP_ERROR'
      && first.body?.diagnostic?.stage === 'provider-transport'
      && safeCount(firstObservations?.provider_calls) === 1
      && transientHttp(firstProviderStatus)
      && validModel(firstModel);
    if (!eligibleForFailover) return forward(first, res);

    const fallbackModel = Array.isArray(resolvedPlan?.callableModels)
      ? resolvedPlan.callableModels.find(model => validModel(model) && model !== firstModel)
      : null;
    const elapsed = Math.max(0, now() - started);
    const remainingMs = totalDeadlineMs - elapsed;
    if (!fallbackModel || remainingMs <= 0) return forward(first, res);

    const remainingHeader = Number(first.headers['X-RateLimit-Remaining']);
    const secondHandler = createLoomTaskHandler({
      env, fetchImpl,
      resolvePlan: async () => ({ ...resolvedPlan, callableModels: [fallbackModel] }),
      recordOutcome,
      // One browser action consumes one rate slot even when its bounded provider route
      // needs one alternate model inside that same action.
      rateSlot: () => ({ allowed: true, remaining: Number.isSafeInteger(remainingHeader) && remainingHeader >= 0 ? remainingHeader : 0 }),
      now, timeoutMs: remainingMs
    });
    const second = captureResponse();
    await secondHandler(req, second);

    if (second.body?.observations && typeof second.body.observations === 'object' && !Array.isArray(second.body.observations)) {
      const secondObservations = second.body.observations;
      const aggregate = {
        ...secondObservations,
        elapsed_ms: Math.max(0, now() - started),
        provider_calls: Math.min(LOOM_TASK_MAX_PROVIDER_CALLS,
          safeCount(firstObservations?.provider_calls) + safeCount(secondObservations.provider_calls)),
        provider_failover: LOOM_TASK_FAILOVER_POLICY,
        provider_attempts: [attemptFrom(firstObservations), attemptFrom(secondObservations)].filter(row => Object.keys(row).length)
      };
      // A per-handler stage clock cannot truthfully describe the two-handler aggregate.
      delete aggregate.stage_elapsed_ms;
      second.body = { ...second.body, observations: aggregate };
    }
    return forward(second, res);
  };
}

export default createResilientLoomTaskHandler();
