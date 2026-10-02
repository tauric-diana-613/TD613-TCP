import { inspectPortableLoomReceiverAssurance } from '../dome-world/holonomy-loom/ai-handoff.js';
import { runFadtStageAudit } from './dollhouse-continuity-audit.js';
import { createLoomPortableGovernor } from './loom-portable-governor.js';
import { compileLoomDemoScene } from '../dome-world/holonomy-loom/semantic-field.js';
import { compileDollhousePortableProjection, operateDollhousePortableProjection } from './dollhouse-portable-aia-roundtrip.js';

// The installed #1133/#1135 receiver and occupied-fibre FADT engines remain the
// authorities for those computations. #1147 supplies the reversible vocabulary
// encoding and explicit effort split; this wrapper carries the WHOLE JSON object.
// #1145 supplies the local close/fresh-instance/recovery/defeat benchmark below.
// None of these instruments supplies an external executor or an SHI capability.
export const LOOM_INSTRUMENT_GOVERNANCE_SCHEMA = 'td613.loom.instrument-governance/v0.1';
export const LOOM_INSTRUMENT_PROFILE_SCHEMA = 'td613.loom.instrument-profile/v0.1';
export const LOOM_FIRE_GATE_PLAN_SCHEMA = 'td613.loom.fire-gate-plan/v0.1';
export const LOOM_FIRE_GATE_WITNESS_SCHEMA = 'td613.loom.fire-gate-witness-intake/v0.1';

function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

const MAX_CHARACTERS = 512000;
// Literal tildes may double the carried encoding. Give projections enough room
// for that worst case plus fixed metadata, while expanded JSON keeps its budget.
const MAX_PROFILE_CHARACTERS = MAX_CHARACTERS * 2 + 8192;
// Inspect descriptors before reading values. JSON.stringify alone would invoke
// caller-supplied getters and silently erase undefined, sparse slots and symbols.
function copyJson(value, depth = 0, budget = { nodes: 20000, characters: MAX_CHARACTERS }, ancestors = new Set()) {
  if (--budget.nodes < 0 || depth > 40) throw new TypeError('Instrument input exceeds the bounded JSON budget.');
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    budget.characters -= value.length;
    if (budget.characters < 0) throw new TypeError('Instrument input exceeds the character budget.');
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value) && !Object.is(value, -0)) return value;
  if (!value || typeof value !== 'object') throw new TypeError('Instrument input must contain lossless JSON data only.');
  if (ancestors.has(value)) throw new TypeError('Instrument input cannot contain cycles.');
  const isArray = Array.isArray(value);
  const prototype = Object.getPrototypeOf(value);
  if (isArray ? prototype !== Array.prototype : ![Object.prototype, null].includes(prototype)) {
    throw new TypeError('Instrument input requires plain JSON data.');
  }
  const keys = Reflect.ownKeys(value);
  if (isArray && (keys.length !== value.length + 1 || keys.at(-1) !== 'length'
    || keys.slice(0, -1).some((key, index) => key !== String(index)))) {
    throw new TypeError('Instrument arrays must be dense and contain no extra fields.');
  }
  ancestors.add(value);
  try {
    const entries = keys.filter(key => !(isArray && key === 'length')).map(key => {
      if (typeof key !== 'string') throw new TypeError('Instrument input cannot contain symbol keys.');
      budget.characters -= key.length;
      if (budget.characters < 0) throw new TypeError('Instrument input exceeds the character budget.');
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!Object.hasOwn(descriptor, 'value') || !descriptor.enumerable) {
        throw new TypeError('Instrument input cannot contain accessors or hidden fields.');
      }
      return [key, copyJson(descriptor.value, depth + 1, budget, ancestors)];
    });
    return isArray ? entries.map(([, item]) => item) : Object.fromEntries(entries);
  } finally { ancestors.delete(value); }
}

function record(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${label} must be a JSON object.`);
  return value;
}
function fields(value, allowed, label) {
  record(value, label);
  if (Object.keys(value).some(key => !allowed.includes(key))) throw new TypeError(`${label} contains an unsupported field.`);
  return value;
}
function text(value, label, maximum = 512) {
  if (typeof value !== 'string' || !value.trim() || value.length > maximum) throw new TypeError(`${label} must be nonempty text of at most ${maximum} characters.`);
  return value;
}
function rows(value, label) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 128) throw new TypeError(`${label} requires 1 to 128 entries.`);
  return value;
}
function uniqueIds(values, label) {
  if (new Set(values.map(value => value.id)).size !== values.length) throw new TypeError(`${label} ids must be unique.`);
  return values.sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0);
}
function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
function boundary() {
  return {
    source_authenticated: false,
    source_revision_authenticated: false,
    loom_admission_verified: false,
    external_execution_verified: false,
    independent_human_witness_verified: false,
    actions_executed: false,
    authority_transferred: false,
    human_closure_required: true
  };
}

/** Recompute the installed portable receiver contract; this is a Lab finding. */
export async function inspectLoomInstrumentReceiver(packet, environment = globalThis) {
  let assay;
  try { assay = await inspectPortableLoomReceiverAssurance(copyJson(packet), environment); }
  catch {
    assay = { outcome: 'HELD', reason: 'PORTABLE_PACKET_INVALID', action_executed: false, external_host_enforced: false };
  }
  return freeze({
    schema: LOOM_INSTRUMENT_GOVERNANCE_SCHEMA,
    instrument: 'RECEIVER_RECOMPUTATION',
    evidence_class: 'LOCAL_RECEIVER_RECOMPUTATION',
    outcome: assay.outcome === 'ADMITTED' ? 'CONSISTENT_REPRESENTATION' : 'HELD',
    assay,
    evidence_boundary: boundary(),
    claim_ceiling: [
      'Selected input binding and assurance representation are recomputed by the installed receiver contract.',
      'A recomputable digest does not authenticate upstream origin, source revision, or continuation admission.',
      'This local result does not establish foreign receiver compliance, destination enforcement, or Loom custody admission.'
    ]
  });
}

/** Preserve the exact union/intersection/gap report for occupied declared states. */
export function auditLoomInstrumentCompression(input) {
  const audit = runFadtStageAudit(copyJson(input));
  return freeze({
    ...audit,
    schema: LOOM_INSTRUMENT_GOVERNANCE_SCHEMA,
    audit_schema: audit.schema,
    instrument: 'EVIDENCE_PRESERVING_COMPRESSION',
    evidence_class: 'DECLARED_OCCUPIED_FINITE_STATES'
  });
}

const VOCABULARY = freeze({
  sp: 'source provenance', pp: 'path provenance', sb: 'system boundary',
  ob: 'observation boundary', dp: 'data plane', cp: 'control plane',
  os: 'observed state', es: 'estimated state', us: 'unknown state',
  rr: 'recovery and revalidation'
});
const TERMS = Object.entries(VOCABULARY).sort((left, right) => right[1].length - left[1].length);
export const LOOM_INSTRUMENT_PROFILES = freeze({
  quick: { reasoning_effort: 'low', presentation_density: 'compact' },
  deep: { reasoning_effort: 'high', presentation_density: 'expanded' }
});
function profileAt(name) {
  if (typeof name !== 'string' || !Object.hasOwn(LOOM_INSTRUMENT_PROFILES, name)) throw new TypeError('Explicit quick or deep profile is required.');
  return LOOM_INSTRUMENT_PROFILES[name];
}
function encode(value) {
  let result = value.replaceAll('~', '~~');
  for (const [code, term] of TERMS) result = result.replaceAll(term, `~${code}`);
  return result;
}
function decode(value) {
  let result = '';
  for (let index = 0; index < value.length;) {
    if (value[index] !== '~') { result += value[index++]; }
    else if (value[index + 1] === '~') { result += '~'; index += 2; }
    else {
      const code = value.slice(index + 1, index + 3);
      if (!Object.hasOwn(VOCABULARY, code)) throw new TypeError('Unknown or truncated profile vocabulary escape.');
      result += VOCABULARY[code]; index += 3;
    }
    if (result.length > MAX_CHARACTERS) throw new TypeError('Expanded profile exceeds the character budget.');
  }
  return result;
}

/** Quick/Deep changes effort and presentation metadata, never selected content. */
export function compileLoomInstrumentProfile(canonical, options = {}) {
  const selected = record(copyJson(canonical), 'canonical payload');
  const settings = fields(copyJson(options), ['profile'], 'profile options');
  const profile = profileAt(settings.profile);
  const serialized = JSON.stringify(selected);
  if (serialized.length > MAX_CHARACTERS) throw new TypeError('Canonical profile exceeds the serialized character budget.');
  return freeze({
    schema: LOOM_INSTRUMENT_PROFILE_SCHEMA,
    profile: settings.profile,
    ...profile,
    encoding: 'WHOLE_JSON_WITH_REVERSIBLE_VOCABULARY_V1',
    payload: encode(serialized),
    canonical_characters: serialized.length,
    evidence_boundary: boundary(),
    claim_ceiling: [
      'The whole canonical JSON payload survives either profile, including governance and continuation fields.',
      'Reasoning effort is a requested profile property, not evidence of provider execution or wall-clock speedup.',
      'Reversible representation does not authenticate supplied content or grant execution authority.'
    ]
  });
}

/** Validate the profile contract and return the full carried canonical JSON data. */
export function expandLoomInstrumentProfile(projection) {
  const value = fields(copyJson(projection, 0, { nodes: 20000, characters: MAX_PROFILE_CHARACTERS }), [
    'schema', 'profile', 'reasoning_effort', 'presentation_density', 'encoding',
    'payload', 'canonical_characters', 'evidence_boundary', 'claim_ceiling'
  ], 'instrument profile');
  const profile = profileAt(value.profile);
  if (value.schema !== LOOM_INSTRUMENT_PROFILE_SCHEMA || value.encoding !== 'WHOLE_JSON_WITH_REVERSIBLE_VOCABULARY_V1'
    || value.reasoning_effort !== profile.reasoning_effort || value.presentation_density !== profile.presentation_density
    || typeof value.payload !== 'string') throw new TypeError('Instrument profile contract changed.');
  const serialized = decode(value.payload);
  if (serialized.length > MAX_CHARACTERS || serialized.length !== value.canonical_characters) throw new TypeError('Instrument profile character declaration changed.');
  const canonical = record(copyJson(JSON.parse(serialized)), 'expanded canonical payload');
  // Normal form prevents alternative escapes or altered authority metadata from
  // passing as this representation. It still supplies no byte authentication.
  const expected = compileLoomInstrumentProfile(canonical, { profile: value.profile });
  if (stableJson(expected) !== stableJson(value)) throw new TypeError('Instrument profile representation changed.');
  return freeze(canonical);
}

export const LOOM_FIRE_GATE_ROUTE_KINDS = freeze([
  'LOCAL_MACHINE', 'LOCAL_SYNTHETIC', 'EXTERNAL_MEASUREMENT', 'INDEPENDENT_RECEIVER', 'PROVIDER_EXPERIMENT'
]);
const ROUTE_EVIDENCE = freeze({
  LOCAL_MACHINE: ['LOCAL_MACHINE'], LOCAL_SYNTHETIC: ['SYNTHETIC'],
  EXTERNAL_MEASUREMENT: ['EXTERNAL_OBSERVATION'],
  INDEPENDENT_RECEIVER: ['LOCAL_MACHINE', 'INDEPENDENT_HUMAN'],
  PROVIDER_EXPERIMENT: ['PROVIDER_OBSERVATION']
});

/** Prepare an acquisition specification. There is deliberately no executor. */
export function prepareLoomFireGate(input) {
  const value = fields(copyJson(input), ['episode_id', 'source_revision', 'question', 'routes', 'measurements', 'shi_reference'], 'Fire Gate input');
  const routes = uniqueIds(rows(value.routes, 'routes').map((route, index) => {
    fields(route, ['id', 'kind'], `routes[${index}]`);
    const id = text(route.id, `routes[${index}].id`);
    if (!LOOM_FIRE_GATE_ROUTE_KINDS.includes(route.kind)) throw new TypeError('Unsupported Fire Gate route kind.');
    return { id, kind: route.kind };
  }), 'route');
  const routeIds = new Set(routes.map(route => route.id));
  const measurements = uniqueIds(rows(value.measurements, 'measurements').map((measurement, index) => {
    fields(measurement, ['id', 'route_id', 'observable'], `measurements[${index}]`);
    const id = text(measurement.id, `measurements[${index}].id`);
    const route_id = text(measurement.route_id, `measurements[${index}].route_id`);
    if (!routeIds.has(route_id)) throw new TypeError('Every measurement must refer to a declared route.');
    return { id, route_id, observable: text(measurement.observable, `measurements[${index}].observable`, 4000) };
  }), 'measurement');
  return freeze({
    schema: LOOM_FIRE_GATE_PLAN_SCHEMA,
    state: 'PREPARED', execution_state: 'EXECUTION_HELD',
    episode_id: text(value.episode_id, 'episode_id'),
    source_revision: text(value.source_revision, 'source_revision'),
    source_revision_state: 'DECLARED_UNAUTHENTICATED',
    question: text(value.question, 'question', 4000), routes, measurements,
    shi_reference: value.shi_reference === undefined ? null : text(value.shi_reference, 'shi_reference'),
    shi_reference_state: value.shi_reference === undefined ? 'ABSENT' : 'DECLARED_UNAUTHENTICATED',
    execution_capability: 'NOT_INSTALLED',
    missing_witnesses: ['REVIEWED_EXTERNAL_EXECUTOR_CAPABILITY', 'AUTHENTICATED_SHI_MEMBRANE', 'INDEPENDENT_EXTERNAL_OBSERVATION'],
    evidence_boundary: boundary(),
    claim_ceiling: [
      'Preparation records a declared question, source revision, routes, and observable measurements.',
      'An owner-shaped declaration or SHI reference does not authenticate a contemporaneous gesture or supply execution capability.',
      'A Lab result is not Loom admission; admission is not executed measurement; execution is not an earned empirical claim.'
    ]
  });
}

function inspectPlan(plan) {
  record(plan, 'Fire Gate plan');
  const input = {
    episode_id: plan.episode_id, source_revision: plan.source_revision,
    question: plan.question, routes: plan.routes, measurements: plan.measurements,
    ...(plan.shi_reference === null ? {} : { shi_reference: plan.shi_reference })
  };
  const expected = prepareLoomFireGate(input);
  if (stableJson(expected) !== stableJson(plan)) throw new TypeError('Fire Gate plan declaration changed.');
  return expected;
}

/** Consistency intake only: opaque references and observation text are unverified. */
export function inspectLoomFireGateWitness(input) {
  let plan, witness;
  const reasons = [];
  try {
    const value = fields(copyJson(input), ['plan', 'witness'], 'Fire Gate witness input');
    plan = inspectPlan(value.plan);
    witness = fields(value.witness, ['episode_id', 'source_revision', 'route_id', 'measurement_id', 'evidence_class', 'observed_at', 'source_reference', 'observation'], 'witness');
    for (const key of ['episode_id', 'source_revision', 'route_id', 'measurement_id', 'evidence_class', 'source_reference']) text(witness[key], `witness.${key}`);
    text(witness.observation, 'witness.observation', 8000);
    text(witness.observed_at, 'witness.observed_at');
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(witness.observed_at)
      || !Number.isFinite(Date.parse(witness.observed_at)) || new Date(witness.observed_at).toISOString() !== witness.observed_at) {
      throw new TypeError('Witness observation time must be a valid canonical UTC ISO timestamp.');
    }
    if (witness.episode_id !== plan.episode_id) reasons.push('EPISODE_MISMATCH');
    if (witness.source_revision !== plan.source_revision) reasons.push('SOURCE_REVISION_MISMATCH');
    const route = plan.routes.find(item => item.id === witness.route_id);
    const measurement = plan.measurements.find(item => item.id === witness.measurement_id);
    if (!route) reasons.push('ROUTE_NOT_IN_PLAN');
    if (!measurement) reasons.push('MEASUREMENT_NOT_IN_PLAN');
    if (measurement && measurement.route_id !== witness.route_id) reasons.push('MEASUREMENT_ROUTE_MISMATCH');
    if (route && !ROUTE_EVIDENCE[route.kind].includes(witness.evidence_class)) reasons.push('EVIDENCE_CLASS_ROUTE_MISMATCH');
  } catch { reasons.push('FIRE_GATE_INPUT_INVALID'); witness = null; }
  return freeze({
    schema: LOOM_FIRE_GATE_WITNESS_SCHEMA,
    scope: 'DECLARED_WITNESS_CONSISTENCY_ONLY',
    state: reasons.length ? 'HELD' : 'CONSISTENT_DECLARATIONS',
    execution_state: 'EXECUTION_HELD', reasons,
    episode_id: plan?.episode_id ?? null, witness,
    witness_authentication: 'NOT_PERFORMED',
    independent_external_witness_verified: false,
    evidence_boundary: boundary(),
    claim_ceiling: [
      'Matching episode, route, measurement, revision, and timestamp fields establish declaration consistency only.',
      'A supplied external or independent-human evidence class remains an unauthenticated declaration.',
      'Referenced source bytes, source ownership, execution, and observer independence have not been verified.'
    ]
  });
}

/** Actual bounded local calls over the existing fictional canonical substrate. */
export function runLoomLocalExecutionBenchmark(options = {}) {
  const value = fields(copyJson(options), ['sourceRevision'], 'local benchmark options');
  const sourceRevision = value.sourceRevision ?? 'working-tree';
  const origin = compileLoomDemoScene(0, { sourceRevision });
  const projection = compileDollhousePortableProjection(origin, { receiver: 'companion' });
  const validReturn = operateDollhousePortableProjection(projection, { operation: 'EXPLAIN_STATE' });
  const requireCondition = (condition, code) => { if (!condition) throw new Error(code); };
  requireCondition(Object.isFrozen(origin), 'ORIGIN_NOT_FROZEN');

  const first = createLoomPortableGovernor(origin);
  const originControl = first.inspect().origin_control;
  const participation = first.receive(validReturn);
  requireCondition(participation.outcome === 'ADMITTED', 'LOCAL_PARTICIPATION_NOT_ADMITTED');
  const close = first.close().latest_event;
  requireCondition(close.kind === 'CLOSE' && close.outcome === 'CLOSED', 'LOCAL_CLOSE_RECEIPT_MISSING');
  const closedProbe = first.receive(validReturn);
  requireCondition(closedProbe.outcome === 'HELD' && closedProbe.reasons.includes('SESSION_CLOSED'), 'LOCAL_CLOSED_SESSION_ADMITS');
  requireCondition(stableJson(originControl) === stableJson(first.inspect().origin_control), 'CLOSED_ORIGIN_CONTROL_CHANGED');

  // New instance from the frozen origin, never from the first receiver's state.
  const second = createLoomPortableGovernor(origin);
  const continuation = second.receive(validReturn);
  requireCondition(second !== first && continuation.outcome === 'ADMITTED', 'LOCAL_FRESH_INSTANCE_CONTINUATION_FAILED');
  requireCondition(stableJson(originControl) === stableJson(second.inspect().origin_control), 'FRESH_ORIGIN_CONTROL_CHANGED');

  const recovery = createLoomPortableGovernor(origin);
  const drifted = copyJson(validReturn);
  drifted.returned_control.scene_id += ':SEEDED_DRIFT';
  const seeded = recovery.receive(drifted);
  requireCondition(seeded.outcome === 'HELD' && seeded.reasons.includes('CONTROL_PLANE_DRIFT'), 'LOCAL_DRIFT_ESCAPES_HOLD');
  requireCondition(stableJson(originControl) === stableJson(recovery.inspect().origin_control), 'HELD_ORIGIN_CONTROL_CHANGED');
  const recovered = recovery.receive(validReturn);
  const recoveredState = recovery.inspect();
  requireCondition(recovered.outcome === 'ADMITTED' && recovered.recovered === true && recoveredState.status === 'ACTIVE', 'LOCAL_RECOVERY_FAILED');
  requireCondition(stableJson(originControl) === stableJson(recoveredState.origin_control), 'RECOVERY_ORIGIN_CONTROL_CHANGED');
  const defeat = recovery.receive(drifted);
  requireCondition(defeat.outcome === 'HELD' && recovery.inspect().status === 'HELD', 'LOCAL_POST_RECOVERY_DRIFT_ESCAPES');
  requireCondition(stableJson(originControl) === stableJson(recovery.inspect().origin_control), 'DEFEAT_ORIGIN_CONTROL_CHANGED');

  return freeze({
    schema: LOOM_INSTRUMENT_GOVERNANCE_SCHEMA,
    instrument: 'LOCAL_EXIT_RECOVERY_BENCHMARK',
    outcome: 'BOUNDED_LOCAL_MACHINE_EXECUTION_WITNESSES_ACQUIRED',
    evidence_class: 'BOUNDED_LOCAL_MACHINE_EXECUTION',
    input_class: 'CANONICAL_FICTIONAL_SCENE', synthetic_origin: true,
    episode_state: 'CANDIDATE', witness_acquired: true,
    product_mutated: false, live_loom_mutated: false,
    right_of_resignation_established: false, safe_return_established: false,
    return_promoted: false, human_replication_promoted: false,
    external_host_enforcement_promoted: false, empirical_exteriority_promoted: false,
    source_revision: sourceRevision, source_revision_state: 'DECLARED_UNAUTHENTICATED',
    local_governor_calls_executed: true,
    instances: 3, fresh_instance_from_frozen_origin: true,
    first_session_state_used_to_construct_second: false,
    episodes: {
      exit: { participation, close, closed_probe: closedProbe, fresh_continuation: continuation },
      recovery: { seeded_drift: seeded, recovery_receipt: recovered, recovered_state: recoveredState, defeat_probe: defeat }
    },
    origin_control_preserved: true,
    missing_witnesses: ['INDEPENDENT_HUMAN_EXECUTION', 'EXTERNAL_HOST_ENFORCEMENT'],
    evidence_boundary: boundary(),
    claim_ceiling: [
      'The existing local governor executed close, closed refusal, fresh-instance continuation, recovery, and a defeat probe over fictional input.',
      'Fresh-instance continuation is local instance/state separation, not custodian independence or an independent human receiver.',
      'Local session close does not establish universal revocation, Safe Return, Return, or empirical exteriority.',
      'No external host, provider, user material, or consequential action was executed.'
    ]
  });
}
