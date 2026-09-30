import { canonicalJson } from '../dome-world/ash/canonical-json.js';

export const PEDAGOGUE_GESTURE_CONSEQUENCE_CASE_SCHEMA = 'td613.pedagogue-gesture-consequence-case/v0.1';
export const PEDAGOGUE_GESTURE_CONSEQUENCE_AUDIT_SCHEMA = 'td613.pedagogue-gesture-consequence-audit/v0.1';
export const PEDAGOGUE_GESTURE_KINDS = Object.freeze(['OPEN', 'STAGE', 'SEND', 'WORLD_ANSWER', 'PAUSE_CUE', 'RESUME_CUE', 'EXIT']);

const STATE_KEYS = ['staged_refs', 'send_count', 'pending_attempt_id', 'latest_attempt', 'admitted_result_ref', 'cue_paused', 'exited', 'expires_at'];
const STEP_KEYS = ['step_id', 'kind', 'at', 'explicit_operator_gesture', 'notice', 'consequence_visible', 'item_refs', 'attempt_id', 'outcome', 'result_ref', 'observed_state'];
const clone = value => JSON.parse(canonicalJson(value));

function freeze(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

function exact(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) {
    throw new TypeError(`${label} must be a plain object.`);
  }
  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.length !== keys.length || ownKeys.some(key => !keys.includes(key))) throw new TypeError(`${label} requires exactly ${keys.join(', ')}.`);
  for (const key of keys) {
    if (!Object.hasOwn(value, key)) throw new TypeError(`${label}.${key} is required.`);
    if (!Object.hasOwn(Object.getOwnPropertyDescriptor(value, key), 'value')) throw new TypeError(`${label}.${key} must be a data property.`);
  }
  return value;
}

function text(value, label, nullable = false) {
  if (nullable && value === null) return null;
  if (typeof value !== 'string' || !value.trim() || value.length > 160) throw new TypeError(`${label} must be a bounded non-empty string${nullable ? ' or null' : ''}.`);
  canonicalJson(value);
  return value;
}

function bool(value, label) {
  if (typeof value !== 'boolean') throw new TypeError(`${label} must be a boolean.`);
  return value;
}

function tick(value, label) {
  if (!Number.isSafeInteger(value) || value < 0 || Object.is(value, -0)) throw new TypeError(`${label} must be a non-negative safe integer.`);
  return value;
}

function dense(value, label, max, nonEmpty = false) {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype || value.length > max || (nonEmpty && !value.length) || Reflect.ownKeys(value).length !== value.length + 1) throw new TypeError(`${label} must be a plain dense bounded array without extra keys.`);
  for (let index = 0; index < value.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !Object.hasOwn(descriptor, 'value')) throw new TypeError(`${label} must contain only own data elements.`);
  }
  return value;
}

function refs(value, label) {
  dense(value, label, 16);
  const result = value.map((item, index) => text(item, `${label}[${index}]`));
  if (new Set(result).size !== result.length) throw new TypeError(`${label} may not repeat references.`);
  return result;
}

function state(value, label) {
  exact(value, STATE_KEYS, label);
  refs(value.staged_refs, `${label}.staged_refs`);
  tick(value.send_count, `${label}.send_count`);
  text(value.pending_attempt_id, `${label}.pending_attempt_id`, true);
  text(value.admitted_result_ref, `${label}.admitted_result_ref`, true);
  bool(value.cue_paused, `${label}.cue_paused`);
  bool(value.exited, `${label}.exited`);
  tick(value.expires_at, `${label}.expires_at`);
  const latest = exact(value.latest_attempt, ['attempt_id', 'status'], `${label}.latest_attempt`);
  text(latest.attempt_id, `${label}.latest_attempt.attempt_id`, true);
  if (!['NONE', 'PENDING', 'ADMITTED', 'HELD'].includes(latest.status)) throw new TypeError(`${label}.latest_attempt.status is unsupported.`);
  if ((latest.status === 'NONE') !== (latest.attempt_id === null)) throw new TypeError(`${label}.latest_attempt requires coherent identity and status.`);
  if ((latest.status === 'PENDING') !== (value.pending_attempt_id !== null) || (value.pending_attempt_id !== null && value.pending_attempt_id !== latest.attempt_id)) {
    throw new TypeError(`${label} requires a coherent pending attempt.`);
  }
  return clone(value);
}

function normalizeStep(value, index) {
  const label = `steps[${index}]`;
  exact(value, STEP_KEYS, label);
  text(value.step_id, `${label}.step_id`);
  if (!PEDAGOGUE_GESTURE_KINDS.includes(value.kind)) throw new TypeError(`${label}.kind is unsupported.`);
  tick(value.at, `${label}.at`);
  bool(value.explicit_operator_gesture, `${label}.explicit_operator_gesture`);
  const notice = exact(value.notice, ['visible', 'at'], `${label}.notice`);
  bool(notice.visible, `${label}.notice.visible`);
  if (notice.at !== null) tick(notice.at, `${label}.notice.at`);
  if (notice.visible !== (notice.at !== null)) throw new TypeError(`${label}.notice requires coherent visibility and tick.`);
  bool(value.consequence_visible, `${label}.consequence_visible`);
  const itemRefs = refs(value.item_refs, `${label}.item_refs`);
  text(value.attempt_id, `${label}.attempt_id`, true);
  text(value.result_ref, `${label}.result_ref`, true);
  if (!['NONE', 'ADMITTED', 'HELD'].includes(value.outcome)) throw new TypeError(`${label}.outcome is unsupported.`);
  if ((['SEND', 'WORLD_ANSWER'].includes(value.kind)) !== (value.attempt_id !== null)) throw new TypeError(`${label} requires an attempt identity only for Send or a world answer.`);
  if (value.kind === 'WORLD_ANSWER') {
    if (value.outcome === 'NONE' || (value.outcome === 'ADMITTED') !== (value.result_ref !== null)) throw new TypeError(`${label} requires an explicit admitted or held answer.`);
  } else if (value.outcome !== 'NONE' || value.result_ref !== null) throw new TypeError(`${label} may not declare a result before the world answers.`);
  if (!['STAGE', 'SEND'].includes(value.kind) && itemRefs.length) throw new TypeError(`${label} declares item references outside staging or sending.`);
  if (value.kind === 'STAGE' && !itemRefs.length) throw new TypeError(`${label} staging requires at least one reference.`);
  state(value.observed_state, `${label}.observed_state`);
  return clone(value);
}

function expectedAfter(before, step, add) {
  const next = clone(before);
  if (before.exited && step.kind !== 'EXIT') { add('ACTION_AFTER_EXIT'); return next; }
  if (['STAGE', 'SEND'].includes(step.kind) && step.at >= before.expires_at) { add('ACTION_AFTER_EXPIRY'); return next; }
  switch (step.kind) {
    case 'STAGE':
      if (before.pending_attempt_id !== null) { add('STAGE_WHILE_PENDING'); return next; }
      next.staged_refs = clone(step.item_refs);
      break;
    case 'SEND':
      if (before.pending_attempt_id !== null) { add('SEND_WHILE_PENDING'); return next; }
      if (canonicalJson(before.staged_refs) !== canonicalJson(step.item_refs)) { add('TRANSMISSION_DIFFERS_FROM_STAGED'); return next; }
      next.staged_refs = [];
      next.send_count += 1;
      if (!Number.isSafeInteger(next.send_count)) throw new TypeError('Send count exceeds safe integer range.');
      next.pending_attempt_id = step.attempt_id;
      next.latest_attempt = { attempt_id: step.attempt_id, status: 'PENDING' };
      break;
    case 'WORLD_ANSWER':
      if (step.attempt_id !== before.pending_attempt_id) { add('ANSWER_WITHOUT_MATCHING_SEND'); return next; }
      next.pending_attempt_id = null;
      next.latest_attempt = { attempt_id: step.attempt_id, status: step.outcome };
      if (step.outcome === 'ADMITTED' && step.at >= before.expires_at) {
        add('ADMISSION_AFTER_EXPIRY');
        next.latest_attempt.status = 'HELD';
      } else if (step.outcome === 'ADMITTED') next.admitted_result_ref = step.result_ref;
      break;
    case 'PAUSE_CUE': next.cue_paused = true; break;
    case 'RESUME_CUE': next.cue_paused = false; break;
    case 'EXIT':
      next.staged_refs = [];
      next.cue_paused = true;
      next.exited = true;
      if (next.pending_attempt_id !== null) next.latest_attempt.status = 'HELD';
      next.pending_attempt_id = null;
      break;
    default: break;
  }
  return next;
}

// This audits explicit declarations and instrumented snapshots. It cannot read
// a person's understanding, authenticate result admission, or operate a UI.
export function compilePedagogueGestureConsequenceAudit(input) {
  exact(input, ['schema', 'case_id', 'observation', 'rest_exit', 'initial_state', 'steps'], 'input');
  if (input.schema !== PEDAGOGUE_GESTURE_CONSEQUENCE_CASE_SCHEMA) throw new TypeError(`Expected ${PEDAGOGUE_GESTURE_CONSEQUENCE_CASE_SCHEMA}.`);
  text(input.case_id, 'case_id');
  exact(input.observation, ['kind', 'source_revision'], 'observation');
  if (!['SYNTHETIC_FIXTURE', 'BROWSER_WITNESS', 'AUTOMATED_INSTRUMENT', 'DECLARED_ONLY'].includes(input.observation.kind)) throw new TypeError('Unsupported observation kind.');
  text(input.observation.source_revision, 'observation.source_revision', true);
  exact(input.rest_exit, ['cue_pause_available', 'exit_available'], 'rest_exit');
  bool(input.rest_exit.cue_pause_available, 'rest_exit.cue_pause_available');
  bool(input.rest_exit.exit_available, 'rest_exit.exit_available');
  const initial = state(input.initial_state, 'initial_state');
  dense(input.steps, 'steps', 64, true);
  const steps = input.steps.map(normalizeStep);
  if (new Set(steps.map(step => step.step_id)).size !== steps.length) throw new TypeError('Step identities must be distinct.');
  const findings = [];
  if (!input.rest_exit.cue_pause_available) findings.push({ step_id: null, code: 'CUE_PAUSE_WITHHELD' });
  if (!input.rest_exit.exit_available) findings.push({ step_id: null, code: 'EXIT_WITHHELD' });
  let before = initial;
  let priorTick = null;
  const attemptedIds = new Set(initial.latest_attempt.attempt_id === null ? [] : [initial.latest_attempt.attempt_id]);
  const comparisons = steps.map(step => {
    const add = code => findings.push({ step_id: step.step_id, code });
    if (priorTick !== null && step.at < priorTick) add('OBSERVATION_TICK_REVERSED');
    priorTick = step.at;
    if (step.kind === 'WORLD_ANSWER') {
      if (step.explicit_operator_gesture) add('WORLD_ANSWER_MISLABELED_AS_GESTURE');
    } else {
      if (!step.explicit_operator_gesture) add('EXPLICIT_GESTURE_MISSING');
      if (!step.notice.visible) add('CONSEQUENCE_NOTICE_MISSING');
      else if (step.notice.at > step.at) add('ACTION_BEFORE_NOTICE');
    }
    if (!step.consequence_visible) add('CONSEQUENCE_ACKNOWLEDGMENT_MISSING');
    if (step.kind === 'SEND') {
      if (attemptedIds.has(step.attempt_id)) add('ATTEMPT_ID_REUSED');
      attemptedIds.add(step.attempt_id);
    }
    const expected = expectedAfter(before, step, add);
    const observed = step.observed_state;
    const mismatched = STATE_KEYS.filter(key => canonicalJson(expected[key]) !== canonicalJson(observed[key]));
    if (mismatched.length) add('DECLARED_CONSEQUENCE_MISMATCH');
    if (observed.expires_at !== before.expires_at) add(step.kind === 'PAUSE_CUE' ? 'CUE_PAUSE_CHANGED_EXPIRY' : 'CUSTODY_EXPIRY_CHANGED');
    if (step.kind !== 'SEND' && observed.send_count !== before.send_count) add('TRANSMISSION_WITHOUT_SEND');
    if (step.kind !== 'WORLD_ANSWER' && observed.admitted_result_ref !== before.admitted_result_ref) add('RESULT_CHANGED_BEFORE_WORLD_ANSWER');
    if (step.kind === 'WORLD_ANSWER' && step.outcome === 'HELD' && observed.admitted_result_ref !== before.admitted_result_ref) add('HELD_ATTEMPT_REPLACED_ADMITTED_RESULT');
    const comparison = { step_id: step.step_id, kind: step.kind, expected_state: expected, observed_state: observed, mismatched_fields: mismatched };
    before = observed;
    return comparison;
  });
  return freeze({
    schema: PEDAGOGUE_GESTURE_CONSEQUENCE_AUDIT_SCHEMA,
    case_id: input.case_id,
    observation: clone(input.observation),
    classification: findings.length ? 'GESTURE_CONSEQUENCE_DEFICIT' : 'DECLARED_GESTURE_CONSEQUENCES_PRESERVED',
    comparisons,
    findings,
    final_state: clone(before),
    scope: {
      explicit_snapshots_only: true, notice_visibility_declared_only: true,
      natural_language_comprehension_measured: false, user_level_score_created: false,
      result_admission_authenticated: false, source_observation_authenticated: false,
      synthetic_fixture_establishes_production_behavior: false, cue_pause_extends_custody: false
    },
    authority: { recommendation_only: true, automatic_redesign: false, product_mutation_authorized: false, automatic_release: false, human_closure_required: true }
  });
}
