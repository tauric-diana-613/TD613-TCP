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
    if (observations.model === null || (typeof observations.model === 'string' && /^[A-Za-z0-9._-]{1,120}$/.test(observations.model))) failure.observations.model = observations.model;
    if (typeof observations.model_policy === 'string' && /^[A-Za-z0-9._/-]{1,160}$/.test(observations.model_policy)) failure.observations.model_policy = observations.model_policy;
    if (Number.isInteger(observations.http_status) && observations.http_status >= 100 && observations.http_status <= 599) failure.observations.http_status = observations.http_status;
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
  if (failure?.diagnostic?.code === 'OUTPUT_TOKEN_LIMIT') return 'Gemini reached its output limit before completing a valid answer. Try a shorter task or fewer documents.';
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
