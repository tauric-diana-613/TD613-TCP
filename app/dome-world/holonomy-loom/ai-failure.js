/** Bounded client projection of a request-bound server failure. Never retain rejected model text. */
const ERRORS = new Set(['method-not-allowed', 'same-origin-required', 'json-required', 'task-too-large', 'invalid-task-envelope', 'provider-not-configured', 'task-rate-limit', 'no-eligible-provider-model', 'provider-request-failed', 'task-aborted-or-timed-out', 'provider-response-not-admitted']);
const STAGES = new Set(['provider-plan', 'provider-transport', 'provider-json', 'output-admission']);
const CODES = new Set(['PROVIDER_PLAN_FAILED', 'NO_ELIGIBLE_MODEL', 'PROVIDER_TRANSPORT_FAILED', 'PROVIDER_HTTP_ERROR', 'PROVIDER_JSON_INVALID', 'OUTPUT_JSON_INVALID', 'OUTPUT_FIELDS_INVALID', 'ANSWER_INVALID', 'NEXT_STEP_INVALID', 'MISSING_INFORMATION_INVALID', 'SOURCE_IDS_INVALID', 'SOURCE_ID_DUPLICATE', 'SOURCE_ID_NOT_SELECTED', 'PROMPT_BLOCKED', 'FINISH_REASON_NOT_STOP', 'OUTPUT_TOKEN_LIMIT', 'RESPONSE_PARTS_INVALID', 'RESPONSE_TEXT_TOO_LARGE', 'CREDENTIAL_OUTPUT_REJECTED', 'REQUEST_CANCELLED', 'DEADLINE_EXCEEDED']);
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const count = value => Number.isSafeInteger(value) && value >= 0;

export function readLoomAiFailure(payload, requestId) {
  if (!object(payload) || payload.schema !== 'td613.loom.ai-task-result/v0.1' || payload.status !== 'held' || typeof requestId !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(requestId) || payload.request_id !== requestId || !ERRORS.has(payload.error)) return null;
  const failure = { error: payload.error, observations: {} };
  const diagnostic = payload.diagnostic;
  if (object(diagnostic) && diagnostic.schema === 'td613.loom.ai-task-diagnostic/v0.1' && STAGES.has(diagnostic.stage) && CODES.has(diagnostic.code)) failure.diagnostic = { schema: diagnostic.schema, stage: diagnostic.stage, code: diagnostic.code };
  const observations = payload.observations;
  if (object(observations)) {
    for (const name of ['elapsed_ms', 'provider_calls', 'document_count', 'rule_count', 'input_characters']) if (count(observations[name])) failure.observations[name] = observations[name];
    if (count(observations.deadline_ms) && observations.deadline_ms > 0 && observations.deadline_ms <= 60000) failure.observations.deadline_ms = observations.deadline_ms;
    if (count(observations.output_token_budget) && observations.output_token_budget > 0 && observations.output_token_budget <= 65536) failure.observations.output_token_budget = observations.output_token_budget;
    if (object(observations.stage_elapsed_ms)) {
      const timings = {};
      for (const stage of STAGES) if (count(observations.stage_elapsed_ms[stage])) timings[stage] = observations.stage_elapsed_ms[stage];
      if (Object.keys(timings).length) failure.observations.stage_elapsed_ms = timings;
    }
    if (observations.model === null || (typeof observations.model === 'string' && /^[A-Za-z0-9._-]{1,120}$/.test(observations.model))) failure.observations.model = observations.model;
    if (typeof observations.model_policy === 'string' && /^[A-Za-z0-9._/-]{1,160}$/.test(observations.model_policy)) failure.observations.model_policy = observations.model_policy;
    if (Number.isInteger(observations.http_status) && observations.http_status >= 100 && observations.http_status <= 599) failure.observations.http_status = observations.http_status;
    if (Array.isArray(observations.provider_attempts) && observations.provider_attempts.length <= 2 && Object.keys(observations.provider_attempts).length === observations.provider_attempts.length) {
      const attempts = observations.provider_attempts.filter(attempt => object(attempt)
        && Object.keys(attempt).length === 2
        && typeof attempt.model === 'string' && /^[A-Za-z0-9._-]{1,120}$/.test(attempt.model)
        && Number.isInteger(attempt.status) && attempt.status >= 100 && attempt.status <= 599)
        .map(attempt => ({ model: attempt.model, status: attempt.status }));
      if (attempts.length === observations.provider_attempts.length && attempts.length) failure.observations.provider_attempts = attempts;
    }
    if (observations.source_claims === 'model-reported-unverified') failure.observations.source_claims = observations.source_claims;
    if (object(observations.usage)) {
      const usage = {};
      for (const key of ['promptTokenCount', 'candidatesTokenCount', 'totalTokenCount', 'thoughtsTokenCount', 'cachedContentTokenCount']) if (count(observations.usage[key])) usage[key] = observations.usage[key];
      if (Object.keys(usage).length) failure.observations.usage = usage;
    }
  }
  return failure;
}

export function describeLoomAiFailure(failure, httpStatus) {
  if (failure?.diagnostic?.code === 'DEADLINE_EXCEEDED') {
    const milliseconds = failure.observations?.deadline_ms;
    const limit = count(milliseconds) && milliseconds > 0 && milliseconds <= 60000 ? `${milliseconds / 1000}-second ` : '';
    return `The AI request reached its ${limit}time limit before returning a complete answer. Your task remains available; the receipt records where the wait ended.`;
  }
  if (failure?.diagnostic?.code === 'REQUEST_CANCELLED') return 'The AI request was cancelled before a complete answer returned. Your task remains available.';
  if (failure?.diagnostic?.code === 'OUTPUT_TOKEN_LIMIT') return 'The AI reached its generation limit before completing a valid answer. Your task remains available; the receipt records the token usage.';
  if (failure?.diagnostic?.code === 'SOURCE_ID_NOT_SELECTED') return 'Gemini cited a document outside the selected set. The response was held for review.';
  if (failure?.diagnostic?.code === 'PROMPT_BLOCKED') return 'Gemini declined the submitted task. Its response remains held.';
  const labels = {
    'provider-not-configured': 'Gemini is unavailable because this environment has no configured provider key.',
    'no-eligible-provider-model': 'The configured Gemini route has no eligible model available.',
    'provider-request-failed': 'The Gemini request failed. Inspect the receipt for the recorded provider status.',
    'provider-response-not-admitted': 'Gemini returned a response that failed validation. Inspect the receipt for the recorded reason.',
    'task-aborted-or-timed-out': 'The Gemini task was interrupted or exceeded its time limit.',
    'task-rate-limit': 'The task request limit was reached. Wait before trying again.',
    'task-too-large': 'The shared task exceeds the allowed size. Select fewer documents or shorter excerpts.',
    'invalid-task-envelope': 'The shared task could not pass input validation.',
    'same-origin-required': 'Open this task directly in the TD613 workspace before submitting.',
    'method-not-allowed': 'The task endpoint rejected the request method.',
    'json-required': 'The task endpoint requires a structured JSON request.'
  };
  if (failure && Object.hasOwn(labels, failure.error)) return labels[failure.error];
  return Number.isInteger(httpStatus) && httpStatus >= 400 && httpStatus <= 599 ? `The task request failed (HTTP ${httpStatus}). A matching diagnostic receipt was unavailable.` : 'The task could not complete. A matching diagnostic receipt was unavailable.';
}
