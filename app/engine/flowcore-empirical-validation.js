import { canonicalDigest, canonicalJson } from '../dome-world/ash/canonical-json.js';

export const FLOWCORE_VALIDATION_PROTOCOL_SCHEMA = 'td613.flowcore.validation-protocol/v0.1';
export const FLOWCORE_VALIDATION_TRIAL_SCHEMA = 'td613.flowcore.validation-trial/v0.1';
export const FLOWCORE_VALIDATION_BUNDLE_SCHEMA = 'td613.flowcore.validation-bundle/v0.1';
export const FLOWCORE_ADVERSE_FINDINGS_SCHEMA = 'td613.flowcore.adverse-findings/v0.1';

export const VALIDATION_CONDITIONS = Object.freeze([
  'A_CURRENT_FORM',
  'B_COPY_ONLY',
  'C_FULL_AIA_PEDAGOGUE'
]);

export const VALIDATION_METRICS = Object.freeze([
  'next_state_prediction',
  'causal_route_explanation',
  'terminology_retention_after_consequence',
  'missingness_recognition',
  'station_ownership_recognition',
  'recovery_success',
  'abandonment',
  'transfer_to_new_scene',
  'time_to_first_meaningful_consequence_ms',
  'confidence_calibration_millipoints'
]);

export const EMPIRICAL_EVIDENCE_CLASSES = Object.freeze([
  'SYNTHETIC_PIPELINE_ONLY',
  'HUMAN_VOLUNTARY_ADULT'
]);

const FORBIDDEN_KEYS = new Set([
  'age', 'birthdate', 'biometric', 'cognition', 'developmental_rank', 'email',
  'emotional_state', 'learner_id', 'mastery', 'participant_name',
  'psychological_state', 'raw_artifact_content', 'raw_bytes', 'raw_content',
  'source_bytes', 'stable_learner_identity', 'user_id'
]);

function clone(value) {
  return value === null || typeof value !== 'object'
    ? value
    : Array.isArray(value)
      ? value.map(clone)
      : Object.fromEntries(Object.entries(value).map(([key, child]) => [key, clone(child)]));
}

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}

function rejectForbidden(value, path = '$') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) return value.forEach((item, index) => rejectForbidden(item, `${path}[${index}]`));
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) throw new Error(`${path}.${key} is forbidden in the Flow-Core validation instrument.`);
    rejectForbidden(child, `${path}.${key}`);
  }
}

function requireDeterminism(options = {}) {
  const frozenClock = String(options.frozenClock || '');
  const idSeed = String(options.idSeed || '');
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(frozenClock)) throw new Error('Validation compilation requires a frozen RFC3339 clock.');
  if (!idSeed) throw new Error('Validation compilation requires an explicit ID seed.');
  return {
    frozenClock,
    idSeed,
    cryptoImpl: options.cryptoImpl || globalThis.crypto,
    TextEncoderImpl: options.TextEncoderImpl || globalThis.TextEncoder
  };
}

function strings(values, name) {
  if (!Array.isArray(values)) throw new Error(`${name} must be an array.`);
  const output = [...new Set(values.map(value => String(value).trim()).filter(Boolean))];
  if (!output.length) throw new Error(`${name} cannot be empty.`);
  return output;
}

function boolean(value, name) {
  if (typeof value !== 'boolean') throw new Error(`${name} must be boolean.`);
  return value;
}

function safeInteger(value, name, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new Error(`${name} must be a safe integer between ${min} and ${max}.`);
  return value;
}

function metricRecord(metrics = {}) {
  const record = {
    next_state_prediction: boolean(metrics.next_state_prediction, 'next_state_prediction'),
    causal_route_explanation: boolean(metrics.causal_route_explanation, 'causal_route_explanation'),
    terminology_retention_after_consequence: boolean(metrics.terminology_retention_after_consequence, 'terminology_retention_after_consequence'),
    missingness_recognition: boolean(metrics.missingness_recognition, 'missingness_recognition'),
    station_ownership_recognition: boolean(metrics.station_ownership_recognition, 'station_ownership_recognition'),
    recovery_success: boolean(metrics.recovery_success, 'recovery_success'),
    abandonment: boolean(metrics.abandonment, 'abandonment'),
    transfer_to_new_scene: boolean(metrics.transfer_to_new_scene, 'transfer_to_new_scene'),
    time_to_first_meaningful_consequence_ms: safeInteger(metrics.time_to_first_meaningful_consequence_ms, 'time_to_first_meaning_consequence_ms', { max: 3_600_000 }),
    confidence_calibration_millipoints: safeInteger(metrics.confidence_calibration_millipoints, 'confidence_calibration_millipoints', { max: 1000 })
  };
  return record;
}

function conditionCounts(trials, condition) {
  const selected = trials.filter(trial => trial.condition === condition);
  const countTrue = key => selected.filter(trial => trial.metrics[key] === true).length;
  const sum = key => selected.reduce((total, trial) => total + trial.metrics[key], 0);
  return {
    condition,
    trial_count: selected.length,
    next_state_prediction_successes: countTrue('next_state_prediction'),
    causal_route_explanation_successes: countTrue('causal_route_explanation'),
    terminology_retention_successes: countTrue('terminology_retention_after_consequence'),
    missingness_recognition_successes: countTrue('missingness_recognition'),
    station_ownership_recognition_successes: countTrue('station_ownership_recognition'),
    recovery_successes: countTrue('recovery_success'),
    abandonment_count: countTrue('abandonment'),
    transfer_successes: countTrue('transfer_to_new_scene'),
    mean_time_to_first_consequence_ms: selected.length ? Math.round(sum('time_to_first_meaningful_consequence_ms') / selected.length) : null,
    mean_confidence_calibration_millipoints: selected.length ? Math.round(sum('confidence_calibration_millipoints') / selected.length) : null
  };
}

function trialSubject(trial) {
  const copy = clone(trial);
  delete copy.trial_digest;
  return copy;
}

export async function compileValidationProtocol(input = {}, options = {}) {
  rejectForbidden(input);
  const d = requireDeterminism(options);
  const conditions = strings(input.conditions || VALIDATION_CONDITIONS, 'conditions');
  if (canonicalJson([...conditions].sort()) !== canonicalJson([...VALIDATION_CONDITIONS].sort())) throw new Error('Validation protocol requires all three canonical conditions exactly once.');
  if (input.baseline_cohort !== 'ADULT_OPERATORS_FIRST') throw new Error('P9 baseline cohort must be adult operators first.');
  const protocol = {
    schema: FLOWCORE_VALIDATION_PROTOCOL_SCHEMA,
    protocol_id: null,
    created_at: d.frozenClock,
    baseline_cohort: 'ADULT_OPERATORS_FIRST',
    conditions,
    tasks: strings(input.tasks, 'tasks'),
    metrics: clone(VALIDATION_METRICS),
    qualitative_prompts: strings(input.qualitative_prompts, 'qualitative_prompts'),
    consent: {
      voluntary_participation_required: true,
      withdrawal_without_penalty: true,
      quoted_language_included: false,
      covert_telemetry: false,
      hidden_ranking: false,
      stable_participant_identity: false
    },
    data_boundary: {
      raw_case_content_allowed: false,
      artifact_bytes_allowed: false,
      local_summary_only: true,
      network_transport_required: false,
      server_persistence_required: false
    },
    child_pilot: {
      initially_allowed: false,
      requires_adult_safety_and_clarity_evidence: true,
      low_stakes_synthetic_or_physical_scenes_only: true,
      vulnerable_ash_cases_allowed: false,
      essential_resource_dependency_allowed: false
    },
    claim_ceiling: {
      allowed_claims: [
        'the protocol can compare declared interaction outcomes across three conditions',
        'human adult evidence may support or contradict a bounded design hypothesis',
        'synthetic fixtures can validate pipeline behavior only'
      ],
      forbidden_claims: [
        'synthetic trials prove human learning',
        'interaction outcomes diagnose cognition, identity, mastery, or psychological state',
        'correlation establishes causation',
        'merge or deployment completes an empirical study',
        'child participation may begin without adult safety and clarity evidence'
      ]
    },
    authority: {
      protocol_assigns_people: false,
      protocol_profiles_people: false,
      automatic_redesign_command: false,
      child_pilot_authorized: false,
      release_authorized: false,
      human_closure_required: true
    },
    closure: { status: 'OPEN', closed_by: null }
  };
  const digest = await canonicalDigest('TD613:FLOWCORE:VALIDATION-PROTOCOL:v1', { ...protocol, protocol_id: null, id_seed: d.idSeed }, d);
  protocol.protocol_id = `flowcore_validation_protocol_${digest.slice(-24)}`;
  canonicalJson(protocol);
  return freeze(protocol);
}

export async function compileValidationTrial(protocol, observation = {}, options = {}) {
  rejectForbidden(observation);
  const d = requireDeterminism(options);
  if (!protocol || protocol.schema !== FLOWCORE_VALIDATION_PROTOCOL_SCHEMA) throw new Error('A canonical validation protocol is required.');
  if (!VALIDATION_CONDITIONS.includes(observation.condition)) throw new Error('Unknown validation condition.');
  if (!EMPIRICAL_EVIDENCE_CLASSES.includes(observation.evidence_class)) throw new Error('Unknown validation evidence class.');
  if (observation.cohort !== 'ADULT_OPERATOR') throw new Error('P9 trial compiler accepts adult operator trials only.');
  const sessionReference = String(observation.session_reference || '');
  if (!/^session_[a-z0-9_-]{6,64}$/i.test(sessionReference)) throw new Error('An ephemeral non-identifying session reference is required.');
  const trial = {
    schema: FLOWCORE_VALIDATION_TRIAL_SCHEMA,
    trial_id: null,
    trial_digest: null,
    protocol_reference: protocol.protocol_id,
    recorded_at: d.frozenClock,
    evidence_class: observation.evidence_class,
    synthetic_pipeline_only: observation.evidence_class === 'SYNTHETIC_PIPELINE_ONLY',
    cohort: 'ADULT_OPERATOR',
    session_reference: sessionReference,
    session_reference_is_stable_identity: false,
    condition: observation.condition,
    task_reference: String(observation.task_reference || ''),
    metrics: metricRecord(observation.metrics),
    qualitative: {
      voluntary_language_recorded: observation.qualitative?.voluntary_language_recorded === true,
      quoted_language_included: false,
      summary_codes: strings(observation.qualitative?.summary_codes || ['no qualitative code supplied'], 'qualitative.summary_codes'),
      confusing_elements: clone(observation.qualitative?.confusing_elements || []),
      helpful_elements: clone(observation.qualitative?.helpful_elements || []),
      coercive_route_reported: observation.qualitative?.coercive_route_reported === true,
      difference_flattened_reported: observation.qualitative?.difference_flattened_reported === true
    },
    adverse_observations: clone(observation.adverse_observations || []),
    source_boundary: {
      raw_case_content_included: false,
      artifact_bytes_included: false,
      quoted_participant_language_included: false
    },
    empirical_authority: {
      counts_as_human_evidence: observation.evidence_class === 'HUMAN_VOLUNTARY_ADULT',
      counts_as_child_pilot_evidence: false,
      establishes_causation: false,
      automatic_redesign_command: false
    },
    closure: { status: 'OPEN', closed_by: null }
  };
  const digest = await canonicalDigest('TD613:FLOWCORE:VALIDATION-TRIAL:v1', { ...trial, trial_id: null, trial_digest: null, id_seed: d.idSeed }, d);
  trial.trial_id = `flowcore_trial_${digest.slice(-24)}`;
  trial.trial_digest = await canonicalDigest('TD613:FLOWCORE:VALIDATION-TRIAL-RECEIPT:v1', trialSubject(trial), d);
  canonicalJson(trial);
  return freeze(trial);
}

export function compareValidationConditions(trials = []) {
  if (!Array.isArray(trials) || !trials.length) throw new Error('At least one validation trial is required.');
  const conditions = VALIDATION_CONDITIONS.map(condition => conditionCounts(trials, condition));
  const evidenceClasses = [...new Set(trials.map(trial => trial.evidence_class))].sort();
  const comparison = {
    schema: 'td613.flowcore.validation-comparison/v0.1',
    conditions,
    evidence_classes: evidenceClasses,
    all_conditions_present: conditions.every(item => item.trial_count > 0),
    human_adult_trial_count: trials.filter(trial => trial.evidence_class === 'HUMAN_VOLUNTARY_ADULT').length,
    synthetic_trial_count: trials.filter(trial => trial.evidence_class === 'SYNTHETIC_PIPELINE_ONLY').length,
    causal_claim_allowed: false,
    user_level_score_emitted: false,
    automatic_winner_selected: false,
    interpretation: 'Report correlations, differences, and mismatches without causal promotion or participant ranking.'
  };
  canonicalJson(comparison);
  return freeze(comparison);
}

export function compileAdverseFindings(trials = []) {
  const findings = [];
  for (const trial of trials) {
    if (trial.metrics.abandonment) findings.push({ kind: 'ABANDONMENT', condition: trial.condition, trial_reference: trial.trial_id });
    if (!trial.metrics.missingness_recognition) findings.push({ kind: 'MISSINGNESS_NOT_RECOGNIZED', condition: trial.condition, trial_reference: trial.trial_id });
    if (!trial.metrics.station_ownership_recognition) findings.push({ kind: 'STATION_OWNERSHIP_NOT_RECOGNIZED', condition: trial.condition, trial_reference: trial.trial_id });
    if (!trial.metrics.recovery_success) findings.push({ kind: 'RECOVERY_FAILED', condition: trial.condition, trial_reference: trial.trial_id });
    if (trial.qualitative.coercive_route_reported) findings.push({ kind: 'ROUTE_REPORTED_COERCIVE', condition: trial.condition, trial_reference: trial.trial_id });
    if (trial.qualitative.difference_flattened_reported) findings.push({ kind: 'DIFFERENCE_REPORTED_FLATTENED', condition: trial.condition, trial_reference: trial.trial_id });
    for (const observation of trial.adverse_observations) findings.push({ kind: 'DECLARED_ADVERSE_OBSERVATION', condition: trial.condition, trial_reference: trial.trial_id, summary: String(observation) });
  }
  const output = {
    schema: FLOWCORE_ADVERSE_FINDINGS_SCHEMA,
    finding_count: findings.length,
    findings,
    publication_required: true,
    suppress_unfavorable_results: false,
    automatic_redesign_command: false,
    human_review_required: true
  };
  canonicalJson(output);
  return freeze(output);
}

export function assessChildPilotEligibility(bundle) {
  if (!bundle || bundle.schema !== FLOWCORE_VALIDATION_BUNDLE_SCHEMA) throw new Error('A validation bundle is required.');
  const humanTrials = bundle.trials.filter(trial => trial.evidence_class === 'HUMAN_VOLUNTARY_ADULT');
  const adultEvidenceComplete = VALIDATION_CONDITIONS.every(condition => humanTrials.some(trial => trial.condition === condition));
  const safetyClear = humanTrials.length > 0 && humanTrials.every(trial => !trial.qualitative.coercive_route_reported && !trial.qualitative.difference_flattened_reported);
  const clarityClear = humanTrials.length > 0 && humanTrials.every(trial => trial.metrics.causal_route_explanation && trial.metrics.missingness_recognition && trial.metrics.station_ownership_recognition && trial.metrics.recovery_success);
  return freeze({
    schema: 'td613.flowcore.child-pilot-eligibility/v0.1',
    eligible: adultEvidenceComplete && safetyClear && clarityClear,
    adult_evidence_complete: adultEvidenceComplete,
    safety_clear: safetyClear,
    clarity_clear: clarityClear,
    synthetic_trials_count_as_adult_evidence: false,
    vulnerable_ash_cases_allowed: false,
    low_stakes_synthetic_or_physical_scenes_only: true,
    human_authorization_still_required: true
  });
}

export async function compileValidationBundle(protocol, trials = [], options = {}) {
  const d = requireDeterminism(options);
  if (!protocol || protocol.schema !== FLOWCORE_VALIDATION_PROTOCOL_SCHEMA) throw new Error('A canonical validation protocol is required.');
  if (!Array.isArray(trials) || !trials.length) throw new Error('Validation bundle requires trials.');
  for (const trial of trials) {
    if (trial.schema !== FLOWCORE_VALIDATION_TRIAL_SCHEMA || trial.protocol_reference !== protocol.protocol_id) throw new Error('Trial protocol mismatch.');
  }
  const comparison = compareValidationConditions(trials);
  const adverseFindings = compileAdverseFindings(trials);
  const subject = {
    protocol_reference: protocol.protocol_id,
    trial_digests: trials.map(trial => trial.trial_digest),
    comparison,
    adverse_findings: adverseFindings,
    serverless_delta: 0,
    persistence_delta: 0
  };
  const digest = await canonicalDigest('TD613:FLOWCORE:VALIDATION-BUNDLE:v1', { ...subject, id_seed: d.idSeed }, d);
  const bundle = {
    schema: FLOWCORE_VALIDATION_BUNDLE_SCHEMA,
    bundle_id: `flowcore_validation_${digest.slice(-24)}`,
    bundle_digest: digest,
    created_at: d.frozenClock,
    protocol,
    trials: trials.map(clone),
    comparison,
    adverse_findings: adverseFindings,
    evidence_posture: {
      human_adult_evidence_present: comparison.human_adult_trial_count > 0,
      synthetic_pipeline_only: comparison.human_adult_trial_count === 0,
      empirical_promotion_evidence_complete: false
    },
    child_pilot: null,
    promotion: {
      empirical_exit_gate_passed: false,
      reason: comparison.human_adult_trial_count === 0
        ? 'HUMAN_VOLUNTARY_ADULT_EVIDENCE_ABSENT'
        : 'HUMAN_REVIEW_AND_COMPARATIVE_THRESHOLD_REQUIRED',
      merge_may_satisfy_empirical_gate: false,
      deployment_may_satisfy_empirical_gate: false
    },
    serverless_delta: 0,
    persistence_delta: 0,
    authority: {
      participant_ranking_authorized: false,
      automatic_redesign_authorized: false,
      child_pilot_authorized: false,
      release_authorized: false,
      human_closure_required: true
    },
    closure: { status: 'OPEN', closed_by: null }
  };
  bundle.child_pilot = assessChildPilotEligibility(bundle);
  canonicalJson(bundle);
  return freeze(bundle);
}
