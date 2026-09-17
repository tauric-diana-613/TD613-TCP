export const APERTURE_V32_PROVIDER_INSTRUMENT_VERSION = 'v3.2-alpha';
export const APERTURE_V32_PROVIDER_INSTRUMENT_SCHEMA =
  'td613.aperture.v32-provider-instrument-audit/v0.1';

const LISTING = new Set(['FRESH_LISTED', 'FRESH_ABSENT', 'UNOBSERVED']);
const ENVELOPE = new Set(['VALIDATED', 'REJECTED', 'UNVALIDATED']);
const COMPLETION = new Set(['COMPLETE', 'INCOMPLETE', 'UNOBSERVED', 'NOT_REACHED']);
const BUDGET = new Set(['ADEQUATE', 'TRUNCATION_RISK', 'UNOBSERVED', 'NOT_REACHED']);
const SAMPLING = new Set(['DEFAULTS', 'COMPATIBLE_EXPLICIT', 'GENERATION_MISMATCH', 'UNOBSERVED']);
const RETRY_POLICY = new Set(['BOUNDED_TRANSIENT_ONLY', 'RETRIES_CLIENT_ERRORS', 'UNBOUNDED', 'NONE', 'UNOBSERVED']);
const HEALTH_MEMORY = new Set(['DURABLE', 'PROCESS_LOCAL', 'NONE', 'UNOBSERVED']);
const RECEIVER_IDENTITY = new Set(['SALIENT', 'RECEIPT_ONLY', 'ABSENT', 'UNOBSERVED']);
const DISPOSITION_ORDER = Object.freeze({ ASK_NOTHING: 0, PROPOSE: 1, ABSTAIN: 2, REJECT: 3 });

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

function upper(value = '') {
  return String(value ?? '').trim().toUpperCase();
}

function member(set, value, label, errors) {
  const normalized = upper(value);
  if (!set.has(normalized)) errors.push(`${label}:invalid`);
  return normalized;
}

function issue(deficit_class, disposition, reason, observation_criterion) {
  return deepFreeze({ deficit_class, disposition, reason, observation_criterion });
}

function aggregateDisposition(deficits = []) {
  return deficits.reduce((current, deficit) =>
    DISPOSITION_ORDER[deficit.disposition] > DISPOSITION_ORDER[current] ? deficit.disposition : current,
  'ASK_NOTHING');
}

export function classifyProviderHttpStatus(status, timedOut = false) {
  if (timedOut === true) return 'TRANSIENT';
  const code = Number(status);
  if (!Number.isInteger(code) || code < 100 || code > 599) return 'UNOBSERVED';
  if (code >= 200 && code < 300) return 'SUCCESS';
  if (code === 408 || code === 429 || code >= 500) return 'TRANSIENT';
  if (code === 401 || code === 403) return 'AUTHORIZATION_OR_POLICY';
  if (code >= 400 && code < 500) return 'CLIENT_REQUEST';
  return 'NONRETRYABLE_OTHER';
}

function retryDeficits(retryClass, retryPolicy) {
  const deficits = [];
  if (retryPolicy === 'UNBOUNDED') {
    deficits.push(issue(
      'UNBOUNDED_RETRY_POLICY',
      'REJECT',
      'provider retry policy is declared unbounded',
      'BOUND_ATTEMPT_COUNT_AND_BACKOFF_BEFORE_EXECUTION'
    ));
  }
  if (retryPolicy === 'RETRIES_CLIENT_ERRORS') {
    deficits.push(issue(
      'CLIENT_ERROR_RETRY_POLICY_DEFICIT',
      'REJECT',
      'client/request failures must not be treated as transient provider failures',
      'SEPARATE_CLIENT_REQUEST_REJECTION_FROM_TRANSIENT_RETRY_CLASS'
    ));
  }
  if (retryClass === 'TRANSIENT' && (retryPolicy === 'NONE' || retryPolicy === 'UNOBSERVED')) {
    deficits.push(issue(
      'TRANSIENT_RESILIENCE_DEFICIT',
      'PROPOSE',
      'a transient provider failure is observed without a declared bounded transient-only retry posture',
      'DECLARE_BOUNDED_BACKOFF_JITTER_AND_MAX_ATTEMPTS'
    ));
  }
  return deficits;
}

export function auditProviderInstrumentState(input = {}) {
  const errors = [];
  const listing_status = member(LISTING, input.listing_status, 'listing_status', errors);
  const request_envelope = member(ENVELOPE, input.request_envelope, 'request_envelope', errors);
  const generation_completion = member(COMPLETION, input.generation_completion, 'generation_completion', errors);
  const compute_budget = member(BUDGET, input.compute_budget, 'compute_budget', errors);
  const sampling_controls = member(SAMPLING, input.sampling_controls, 'sampling_controls', errors);
  const retry_policy = member(RETRY_POLICY, input.retry_policy, 'retry_policy', errors);
  const health_memory_scope = member(HEALTH_MEMORY, input.health_memory_scope, 'health_memory_scope', errors);
  const receiver_identity = member(RECEIVER_IDENTITY, input.receiver_identity, 'receiver_identity', errors);
  const http_status = input.http_status === null || input.http_status === undefined || input.http_status === ''
    ? null
    : Number(input.http_status);
  if (http_status !== null && (!Number.isInteger(http_status) || http_status < 100 || http_status > 599)) {
    errors.push('http_status:invalid');
  }
  const timed_out = input.timed_out === true;

  if (errors.length) {
    return deepFreeze({
      schema: APERTURE_V32_PROVIDER_INSTRUMENT_SCHEMA,
      version: APERTURE_V32_PROVIDER_INSTRUMENT_VERSION,
      source_status: 'DECLARED_PROVIDER_INSTRUMENT_STATE',
      authority_class: 'A2_DERIVATIONAL',
      disposition: 'REJECT',
      deficit_classes: ['INVALID_DECLARED_PROVIDER_INSTRUMENT_STATE'],
      deficits: [issue(
        'INVALID_DECLARED_PROVIDER_INSTRUMENT_STATE',
        'REJECT',
        `provider-instrument declaration violates the audit contract: ${errors.join(',')}`,
        'REPAIR_DECLARED_STATE_BEFORE_PROVIDER_INFERENCE'
      )],
      errors,
      model_removal_authority: false,
      routing_mutation_authority: false,
      provider_health_authority: false,
      human_closure_required: true
    });
  }

  const retry_class = classifyProviderHttpStatus(http_status, timed_out);
  const deficits = [];

  if (listing_status === 'FRESH_ABSENT') {
    deficits.push(issue(
      'MODEL_METHOD_ABSENT',
      'REJECT',
      'fresh complete provider observation does not expose the declared model for the required method',
      'DO_NOT_CALL_UNTIL_FRESH_PROVIDER_OBSERVATION_ADMITS_MODEL_METHOD'
    ));
  } else if (listing_status === 'UNOBSERVED') {
    deficits.push(issue(
      'MODEL_VISIBILITY_UNRESOLVED',
      'ABSTAIN',
      'model/method visibility has not been freshly observed',
      'ACQUIRE_FRESH_COMPLETE_PROVIDER_MODEL_METHOD_OBSERVATION'
    ));
  }

  if (request_envelope === 'REJECTED') {
    deficits.push(issue(
      'REQUEST_ENVELOPE_INCOMPATIBLE',
      'REJECT',
      'the route request envelope has been rejected or shown incompatible with the selected model',
      'REPAIR_MODEL_SPECIFIC_REQUEST_PROFILE_THEN_RETEST_EXACT_TASK'
    ));
  } else if (request_envelope === 'UNVALIDATED') {
    deficits.push(issue(
      'REQUEST_ENVELOPE_UNVALIDATED',
      'ABSTAIN',
      'model visibility does not establish compatibility of the route generation controls',
      'VALIDATE_MODEL_SPECIFIC_REQUEST_PROFILE_BEFORE_HEALTH_OR_QUALITY_ATTRIBUTION'
    ));
  }

  if (sampling_controls === 'GENERATION_MISMATCH') {
    deficits.push(issue(
      'REQUEST_CONTROL_GENERATION_MISMATCH',
      'REJECT',
      'declared sampling/thinking controls do not match the selected model generation contract',
      'USE_GENERATION_COMPATIBLE_DEFAULTS_OR_DOCUMENTED_CONTROLS'
    ));
  } else if (sampling_controls === 'UNOBSERVED' && request_envelope === 'VALIDATED') {
    deficits.push(issue(
      'REQUEST_CONTROL_PROFILE_UNOBSERVED',
      'ABSTAIN',
      'request-envelope validity is asserted without an observed control profile',
      'RECORD_ALLOWLISTED_GENERATION_CONTROL_FAMILY'
    ));
  }

  if (retry_class === 'CLIENT_REQUEST') {
    deficits.push(issue(
      'CLIENT_REQUEST_REJECTION',
      'REJECT',
      'HTTP client/request rejection is not transient provider-health evidence',
      'DIAGNOSE_REQUEST_CONTRACT_WITHOUT_PROVIDER_HEALTH_PENALTY'
    ));
  } else if (retry_class === 'AUTHORIZATION_OR_POLICY') {
    deficits.push(issue(
      'AUTHORIZATION_OR_POLICY_REJECTION',
      'REJECT',
      'authorization/policy rejection is non-transient and must not be retried as provider overload',
      'REPAIR_AUTHORIZATION_OR_POLICY_CONFIGURATION_BEFORE_RETRY'
    ));
  }
  deficits.push(...retryDeficits(retry_class, retry_policy));

  if (generation_completion === 'INCOMPLETE') {
    deficits.push(issue(
      'INCOMPLETE_GENERATION',
      'REJECT',
      'provider generation reached an incomplete/token-limited terminal state',
      'HOLD_PARTIAL_OUTPUT_AND_ADJUST_THINKING_OR_OUTPUT_BUDGET_BEFORE_RETEST'
    ));
  } else if (generation_completion === 'UNOBSERVED' && retry_class === 'SUCCESS') {
    deficits.push(issue(
      'COMPLETION_OBSERVABILITY_DEFICIT',
      'ABSTAIN',
      'HTTP success is observed without a declared generation-completion state',
      'OBSERVE_FINISH_STATE_AND_BOUNDED_USAGE_BEFORE_COMPLETENESS_OR_QUALITY_INFERENCE'
    ));
  }

  if (compute_budget === 'TRUNCATION_RISK') {
    deficits.push(issue(
      'COMPUTE_BUDGET_GEOMETRY_DEFICIT',
      'PROPOSE',
      'declared output ceiling may be consumed by reasoning before useful answer completion',
      'SEPARATE_THINKING_EFFORT_FROM_OUTPUT_COMPLETION_AND_OBSERVE_USAGE'
    ));
  } else if (compute_budget === 'UNOBSERVED' && generation_completion !== 'NOT_REACHED') {
    deficits.push(issue(
      'COMPUTE_BUDGET_GEOMETRY_UNRESOLVED',
      'ABSTAIN',
      'the relation between reasoning effort, output ceiling and answer completion is unobserved',
      'OBSERVE_DECLARED_OUTPUT_LIMIT_THINKING_CONTROL_AND_USAGE'
    ));
  }

  if (health_memory_scope === 'PROCESS_LOCAL') {
    deficits.push(issue(
      'PROVIDER_HEALTH_MEMORY_NON_DURABLE',
      'PROPOSE',
      'provider outcome memory is process-local and may disappear across stateless/serverless invocations',
      'SEPARATE_REQUEST_LOCAL_RESILIENCE_FROM_OPTIONAL_PROCESS_LOCAL_COOLDOWN'
    ));
  } else if (health_memory_scope === 'UNOBSERVED') {
    deficits.push(issue(
      'PROVIDER_HEALTH_MEMORY_SCOPE_UNOBSERVED',
      'ABSTAIN',
      'the lifetime and authority of provider-health state are undeclared',
      'DECLARE_STATE_SCOPE_BEFORE_USING_IT_AS_ROUTING_EVIDENCE'
    ));
  }

  if (receiver_identity === 'RECEIPT_ONLY') {
    deficits.push(issue(
      'RECEIVER_IDENTITY_SALIENCE_DEFICIT',
      'PROPOSE',
      'selected receiver/model is recorded but not salient at the answer surface',
      'SHOW_COMPACT_SELECTED_MODEL_AND_FALLBACK_POSITION_NEAR_RETURNED_ANSWER'
    ));
  } else if (receiver_identity === 'ABSENT') {
    deficits.push(issue(
      'RECEIVER_IDENTITY_OBSERVABILITY_DEFICIT',
      'ABSTAIN',
      'the user-visible result cannot be bound to the selected provider model',
      'PRESERVE_AND_SURFACE_SELECTED_RECEIVER_IDENTITY'
    ));
  }

  const disposition = aggregateDisposition(deficits);
  const health_attribution = request_envelope === 'REJECTED' || retry_class === 'CLIENT_REQUEST'
    ? 'ROUTE_OR_REQUEST_FAULT_NOT_PROVIDER_HEALTH_EVIDENCE'
    : retry_class === 'TRANSIENT'
      ? 'TRANSIENT_PROVIDER_SIGNAL_ONLY'
      : retry_class === 'SUCCESS'
        ? 'REQUEST_SUCCESS_NOT_GLOBAL_PROVIDER_HEALTH_PROOF'
        : 'UNRESOLVED';

  return deepFreeze({
    schema: APERTURE_V32_PROVIDER_INSTRUMENT_SCHEMA,
    version: APERTURE_V32_PROVIDER_INSTRUMENT_VERSION,
    source_status: 'DECLARED_PROVIDER_INSTRUMENT_STATE',
    authority_class: 'A2_DERIVATIONAL',
    input: {
      listing_status,
      request_envelope,
      generation_completion,
      compute_budget,
      sampling_controls,
      retry_policy,
      health_memory_scope,
      receiver_identity,
      http_status,
      timed_out
    },
    retry_class,
    health_attribution,
    disposition,
    deficit_classes: deficits.map(deficit => deficit.deficit_class),
    deficits,
    anti_equivalences: [
      'MODEL_VISIBILITY!=REQUEST_ENVELOPE_COMPATIBILITY',
      'QUALITY_TIER!=THINKING_CONTROL_GRAMMAR',
      'MAX_OUTPUT_TOKENS!=ANSWER_TOKEN_BUDGET',
      'HTTP_SUCCESS!=COMPLETE_GENERATION',
      'CLIENT_REQUEST_REJECTION!=PROVIDER_HEALTH_DEGRADATION',
      'PROCESS_LOCAL_COOLDOWN!=DURABLE_PROVIDER_STATE',
      'RECEIVER_IDENTITY_RECORDED!=RECEIVER_IDENTITY_SALIENT'
    ],
    model_removal_authority: false,
    routing_mutation_authority: false,
    provider_health_authority: false,
    automatic_retry_authority: false,
    automatic_provider_call: false,
    automatic_release: false,
    no_scalar_crown: true,
    human_closure_required: true
  });
}

export function selfTestProviderInstrumentAudit() {
  const release1103 = auditProviderInstrumentState({
    listing_status: 'FRESH_LISTED',
    request_envelope: 'REJECTED',
    generation_completion: 'NOT_REACHED',
    compute_budget: 'NOT_REACHED',
    sampling_controls: 'GENERATION_MISMATCH',
    retry_policy: 'BOUNDED_TRANSIENT_ONLY',
    health_memory_scope: 'PROCESS_LOCAL',
    receiver_identity: 'RECEIPT_ONLY',
    http_status: 400
  });
  const clean = auditProviderInstrumentState({
    listing_status: 'FRESH_LISTED',
    request_envelope: 'VALIDATED',
    generation_completion: 'COMPLETE',
    compute_budget: 'ADEQUATE',
    sampling_controls: 'DEFAULTS',
    retry_policy: 'BOUNDED_TRANSIENT_ONLY',
    health_memory_scope: 'DURABLE',
    receiver_identity: 'SALIENT',
    http_status: 200
  });
  return deepFreeze({
    schema: 'td613.aperture.v32-provider-instrument-audit-self-test/v0.1',
    status: release1103.disposition === 'REJECT'
      && release1103.health_attribution === 'ROUTE_OR_REQUEST_FAULT_NOT_PROVIDER_HEALTH_EVIDENCE'
      && release1103.model_removal_authority === false
      && clean.disposition === 'ASK_NOTHING'
      ? 'pass'
      : 'fail',
    release1103,
    clean
  });
}
