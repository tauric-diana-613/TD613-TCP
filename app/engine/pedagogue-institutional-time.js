import { canonicalJson } from '../dome-world/ash/canonical-json.js';
import { freeze, noForbidden, object, text } from './flowcore-pedagogue-utils.js';

export const PEDAGOGUE_INSTITUTIONAL_TIME_AUDIT_SCHEMA = 'td613.flowcore.pedagogue-institutional-time-audit/v0.1';
export const PEDAGOGUE_DROMOLOGICAL_SEQUENCE_AUDIT_SCHEMA = 'td613.flowcore.pedagogue-dromological-sequence-audit/v0.1';
export const PEDAGOGUE_CLOSURE_CLASSES = Object.freeze(['closed', 'drift', 'suppressed', 'inexpressible']);

const PHASE_ORDER = Object.freeze(['NOTICE', 'ACT', 'WORLD_ANSWERS', 'NAME']);

function safeIntegerOrNull(value, label) {
  if (value === null || value === undefined) return null;
  if (!Number.isSafeInteger(value) || Object.is(value, -0)) throw new TypeError(`${label} must be a safe integer tick or null.`);
  return value;
}

function unitIntervalToMillipoints(value, label) {
  if (!Number.isFinite(value) || value < 0 || value > 1) throw new Error(`${label} must lie in [0,1].`);
  const millipoints = Math.round(value * 1000);
  if (!Number.isSafeInteger(millipoints)) throw new TypeError(`${label} cannot be represented as safe integer millipoints.`);
  return millipoints;
}

function closure(input = {}) {
  const value = object(input, 'closure');
  const closure_class = text(value.closure_class, 'closure.closure_class').toLowerCase();
  if (!PEDAGOGUE_CLOSURE_CLASSES.includes(closure_class)) throw new Error(`Unsupported closure class: ${closure_class}`);
  const score_millipoints = unitIntervalToMillipoints(value.score, 'closure.score');
  return freeze({ closure_class, score_millipoints, faithful: score_millipoints === 1000 });
}

function lag(later, earlier) {
  return later === null || earlier === null ? null : later - earlier;
}

function compileCompression(input) {
  if (!input) return null;
  const value = object(input, 'compression');
  if (!Array.isArray(value.source_distinctions) || value.source_distinctions.length < 2) throw new Error('compression.source_distinctions requires at least two explicitly declared distinctions.');
  if (!Array.isArray(value.registered_distinctions) || value.registered_distinctions.length < 1) throw new Error('compression.registered_distinctions requires at least one explicitly declared registered distinction.');
  const source = value.source_distinctions.map((item, index) => text(item, `compression.source_distinctions[${index}]`));
  const registered = value.registered_distinctions.map((item, index) => text(item, `compression.registered_distinctions[${index}]`));
  const lost = Array.isArray(value.explicitly_lost_distinctions)
    ? value.explicitly_lost_distinctions.map((item, index) => text(item, `compression.explicitly_lost_distinctions[${index}]`))
    : [];
  return freeze({
    source_distinctions: freeze(source),
    registered_distinctions: freeze(registered),
    explicitly_lost_distinctions: freeze(lost),
    many_to_one_declared: source.length > registered.length,
    semantic_loss_inferred_from_count: false,
    semantic_loss_requires_explicit_declaration: true
  });
}

export function compileInstitutionalTimeAudit(input = {}) {
  noForbidden(input);
  const value = object(input, 'input');
  const clocks = object(value.clocks, 'clocks');
  const t_sense = safeIntegerOrNull(clocks.t_sense, 'clocks.t_sense');
  const t_model = safeIntegerOrNull(clocks.t_model, 'clocks.t_model');
  const t_op = safeIntegerOrNull(clocks.t_op, 'clocks.t_op');
  const t_inst = safeIntegerOrNull(clocks.t_inst, 'clocks.t_inst');
  const t_pub = safeIntegerOrNull(clocks.t_pub, 'clocks.t_pub');
  const t_context = safeIntegerOrNull(clocks.t_context, 'clocks.t_context');
  if (t_op === null) throw new Error('Institutional Time audit requires clocks.t_op because preemption is defined around first materially conditioned action.');

  const closureState = closure(value.closure);
  const preemption_gap = lag(t_inst, t_op);
  const public_visibility_lag = lag(t_pub, t_inst);
  const context_preemption_gap = lag(t_context, t_op);
  const rupture = closureState.score_millipoints < 1000;
  const acts_before_counts = preemption_gap === null ? t_inst === null : preemption_gap > 0;
  const context_lags_action = context_preemption_gap !== null && context_preemption_gap > 0;

  let beacon = null;
  if (value.influence) {
    const influence = object(value.influence, 'influence');
    const integral_ticks = safeIntegerOrNull(influence.integral, 'influence.integral');
    const threshold_ticks = safeIntegerOrNull(influence.threshold, 'influence.threshold');
    if (integral_ticks === null || threshold_ticks === null) throw new Error('influence.integral and influence.threshold must be safe integer ticks.');
    beacon = freeze({
      integral_ticks,
      threshold_ticks,
      sustained_influence_above_threshold: integral_ticks > threshold_ticks,
      beacon_candidate: integral_ticks > threshold_ticks && rupture
    });
  }

  const audit = {
    schema: PEDAGOGUE_INSTITUTIONAL_TIME_AUDIT_SCHEMA,
    case_id: text(value.case_id, 'case_id'),
    clock_unit: text(value.clock_unit || 'DECLARED_INTEGER_TICK', 'clock_unit'),
    clocks: freeze({ t_sense, t_model, t_op, t_inst, t_pub, t_context }),
    closure: closureState,
    preemption: freeze({
      preemption_gap,
      acts_before_counts,
      institution_never_registered: t_inst === null,
      public_visibility_lag,
      context_preemption_gap,
      context_lags_action
    }),
    rupture: freeze({
      operational_action_present: true,
      failed_faithful_closure: rupture,
      rupture
    }),
    beacon,
    compression: compileCompression(value.compression),
    classification: acts_before_counts
      ? 'INSTITUTIONAL_PREEMPTION_PRESENT'
      : 'NO_DECLARED_INSTITUTIONAL_PREEMPTION',
    scope: freeze({
      institutional_time_only: true,
      physical_time_travel_claim: false,
      quantum_mechanism_claim: false,
      malicious_intent_inferred: false,
      psychological_diagnosis: false,
      learner_profile_created: false
    }),
    authority: freeze({
      recommendation_only: true,
      automatic_intervention: false,
      production_mutation_authorized: false,
      external_transmission_authorized: false,
      human_closure_required: true
    })
  };
  canonicalJson(audit);
  return freeze(audit);
}

function eventMap(events) {
  if (!Array.isArray(events) || !events.length) throw new Error('cadence events must be a non-empty array.');
  const map = new Map();
  events.forEach((event, index) => {
    const value = object(event, `events[${index}]`);
    const phase = text(value.phase, `events[${index}].phase`).toUpperCase();
    const at = safeIntegerOrNull(value.at, `events[${index}].at`);
    if (at === null) throw new Error(`events[${index}].at must be a safe integer tick.`);
    if (map.has(phase)) throw new Error(`Duplicate cadence phase: ${phase}`);
    map.set(phase, at);
  });
  return map;
}

export function compileDromologicalSequenceAudit(input = {}) {
  noForbidden(input);
  const value = object(input, 'input');
  const map = eventMap(value.events);
  const violations = [];

  const notice = map.get('NOTICE');
  const act = map.get('ACT');
  const answer = map.get('WORLD_ANSWERS');
  const name = map.get('NAME');
  const assessment = map.get('ASSESSMENT');
  const rest = map.get('REST');
  const exit = map.get('EXIT');

  if (notice !== undefined && act !== undefined && act < notice) violations.push('ACTION_BEFORE_NOTICE');
  if (answer !== undefined && name !== undefined && name < answer) violations.push('PREMATURE_NAMING');
  if (assessment !== undefined && answer !== undefined && assessment < answer) violations.push('ASSESSMENT_BEFORE_CONSEQUENCE');

  const constraints = value.cadence_constraints ? object(value.cadence_constraints, 'cadence_constraints') : {};
  const minimumAnswerDwell = constraints.minimum_world_answer_dwell === undefined
    ? null
    : safeIntegerOrNull(constraints.minimum_world_answer_dwell, 'cadence_constraints.minimum_world_answer_dwell');
  let world_answer_dwell = null;
  if (minimumAnswerDwell !== null && answer !== undefined && name !== undefined) {
    world_answer_dwell = name - answer;
    if (world_answer_dwell < minimumAnswerDwell) violations.push('CADENCE_COMPRESSION');
  }

  if (constraints.rest_required === true && rest === undefined) violations.push('REST_WITHHELD');
  if (constraints.exit_required === true && exit === undefined) violations.push('EXIT_WITHHELD');

  const context = value.context_registration ? object(value.context_registration, 'context_registration') : null;
  let context_registration_lag = null;
  if (context) {
    const actionAt = safeIntegerOrNull(context.action_at, 'context_registration.action_at');
    const contextRegisteredAt = safeIntegerOrNull(context.context_registered_at, 'context_registration.context_registered_at');
    if (actionAt !== null && contextRegisteredAt !== null) {
      context_registration_lag = contextRegisteredAt - actionAt;
      if (context_registration_lag > 0) violations.push('CONTEXT_REGISTRATION_LAG');
    }
  }

  const phase_times = Object.fromEntries([...map.entries()].sort(([, a], [, b]) => a - b));
  const required_present = PHASE_ORDER.every((phase) => map.has(phase));
  const audit = {
    schema: PEDAGOGUE_DROMOLOGICAL_SEQUENCE_AUDIT_SCHEMA,
    audit_id: text(value.audit_id, 'audit_id'),
    clock_unit: text(value.clock_unit || 'DECLARED_INTEGER_TICK', 'clock_unit'),
    phase_times: freeze(phase_times),
    canonical_partial_order: PHASE_ORDER,
    canonical_phases_present: required_present,
    cadence: freeze({
      minimum_world_answer_dwell: minimumAnswerDwell,
      observed_world_answer_dwell: world_answer_dwell,
      rest_required: constraints.rest_required === true,
      exit_required: constraints.exit_required === true,
      timing_requirements_are_fixture_declared: true,
      age_inference_forbidden: true,
      developmental_rank_forbidden: true
    }),
    context_registration_lag,
    violations: freeze([...new Set(violations)]),
    classification: violations.length ? 'DROMOLOGICAL_SEQUENCE_OR_CADENCE_DEFICIT' : 'NO_DECLARED_SEQUENCE_OR_CADENCE_DEFICIT',
    compression: compileCompression(value.compression),
    scope: freeze({
      route_audit_not_person_diagnosis: true,
      learner_profile_created: false,
      developmental_rank_assigned: false,
      psychological_state_inferred: false,
      institutional_intent_inferred: false
    }),
    authority: freeze({
      recommendation_only: true,
      automatic_redesign: false,
      product_mutation_authorized: false,
      production_mutation_authorized: false,
      human_closure_required: true
    })
  };
  canonicalJson(audit);
  return freeze(audit);
}
