/**
 * Bounded successor to candidate 88f128c75cd8efd58db9a77249f293e69d08762e.
 * Audits declared local evidence; it authenticates no author, provider or clock.
 * Missing evidence, invalid chronology and incomplete routes cannot yield PASS.
 */
export const TEMPORAL_CUSTODIAN_SCHEMA = 'td613.dollhouse.temporal-audit/v0.2';
export const TEMPORAL_CUSTODIAN_CLAIM_CEILING =
  'temporal-governance-and-whole-route-veto-only-no-retroactive-mutation-no-execution-authority-human-closure-required';
export const ALLOWED_AMENDMENT_TYPES = Object.freeze(['CORRECTION', 'REFINEMENT', 'RECLASSIFICATION']);
export const CLOSURE_CLASSES = Object.freeze({ CLOSED: 'CLOSED', DRIFT: 'DRIFT', SUPPRESSED: 'SUPPRESSED', INEXPRESSIBLE_AT_TIME_T: 'INEXPRESSIBLE_AT_TIME_T' });
const STATUSES = ['PASS', 'FAIL', 'HELD', 'UNKNOWN', 'NOT_RUN'];
const ENTRY_KEYS = ['entry_id', 't_sequence', 'timestamp', 'state', 'observation', 'registered_event', 'authority', 'retroactive_rewrite_forbidden', 'later_reinterpretation_allowed'];
const MAX_ENTRIES = 512;

function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
function fields(value, required, optional, label) {
  if (!value || Object.getPrototypeOf(value) !== Object.prototype) throw new TypeError(`${label}: plain object required`);
  const keys = Reflect.ownKeys(value), descriptors = Object.getOwnPropertyDescriptors(value);
  if (required.some(key => !Object.hasOwn(value, key)) || keys.some(key => typeof key !== 'string' || ![...required, ...optional].includes(key))) throw new TypeError(`${label}: declared fields required`);
  if (keys.some(key => !descriptors[key].enumerable || !Object.hasOwn(descriptors[key], 'value'))) throw new TypeError(`${label}: accessors and hidden fields forbidden`);
}
function dense(value, min, max, label) {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype || value.length < min || value.length > max || Reflect.ownKeys(value).length !== value.length + 1) throw new TypeError(`${label}: dense bounded array required`);
  const descriptors = Object.getOwnPropertyDescriptors(value);
  for (let i = 0; i < value.length; i++) if (!descriptors[i]?.enumerable || !Object.hasOwn(descriptors[i], 'value')) throw new TypeError(`${label}: sparse entries and accessors forbidden`);
  return value;
}
function text(value, limit, label) {
  if (typeof value !== 'string' || !value.trim() || value.length > limit) throw new TypeError(`${label}: bounded nonempty text required`);
  return value;
}
function identifier(value, label) {
  text(value, 100, label);
  if (!/^[A-Za-z0-9][A-Za-z0-9_.:-]*$/.test(value)) throw new TypeError(`${label}: identifier required`);
  return value;
}
function timestamp(value, label) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) throw new TypeError(`${label}: UTC ISO timestamp required`);
  const ms = Date.parse(value);
  const normalized = value.includes('.') ? value : value.replace('Z', '.000Z');
  if (!Number.isFinite(ms) || new Date(ms).toISOString() !== normalized) throw new TypeError(`${label}: valid calendar timestamp required`);
  return ms;
}
function sequence(value) {
  if (typeof value !== 'string' || !/^SEQ_\d{1,15}$/.test(value)) throw new TypeError('t_sequence: SEQ_ plus decimal digits required');
  const number = Number(value.slice(4));
  if (!Number.isSafeInteger(number) || number < 1) throw new TypeError('t_sequence: positive safe integer required');
  return number;
}
function validateEntries(entries) {
  dense(entries, 1, MAX_ENTRIES, 'ledger');
  const ids = new Set();
  for (const entry of entries) {
    fields(entry, ENTRY_KEYS, ['amendments'], 'entry');
    identifier(entry.entry_id, 'entry_id');
    if (ids.has(entry.entry_id)) throw new TypeError('entry_id: duplicate historical identity');
    ids.add(entry.entry_id);
    sequence(entry.t_sequence); timestamp(entry.timestamp, 'timestamp');
    for (const key of ['state', 'observation', 'registered_event', 'authority']) text(entry[key], 2000, key);
    if (entry.retroactive_rewrite_forbidden !== true || entry.later_reinterpretation_allowed !== true) throw new TypeError('entry: temporal law affirmation required');
    if (Object.hasOwn(entry, 'amendments')) {
      dense(entry.amendments, 0, 64, 'amendments');
      for (const amendment of entry.amendments) {
        fields(amendment, ['amendment_type', 'appended_at', 'appended_by', 'note'], [], 'amendment');
        if (!ALLOWED_AMENDMENT_TYPES.includes(amendment.amendment_type)) throw new TypeError('amendment: unsupported type');
        timestamp(amendment.appended_at, 'appended_at'); text(amendment.appended_by, 200, 'appended_by'); text(amendment.note, 2000, 'note');
      }
    }
  }
}
const violation = (type, message, details = {}) => ({ type, message, ...details });

export function auditTemporalLedgerNonRetroactivity(entries, baselineEntries = null) {
  try {
    validateEntries(entries);
    if (baselineEntries !== null) validateEntries(baselineEntries);
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    return freeze({ is_valid: false, input_valid: false, baseline_compared: false, entry_count: 0, validated_entries: [], violations: [violation('INVALID_LEDGER_INPUT', error.message)] });
  }
  const violations = [];
  // Compare identity/order and every immutable field; amendments keep an exact prefix.
  if (baselineEntries !== null) {
    for (let i = 0; i < baselineEntries.length; i++) {
      const base = baselineEntries[i], current = entries[i];
      if (!current || current.entry_id !== base.entry_id) {
        violations.push(violation('HISTORICAL_PREFIX_CHANGED', 'Baseline identity/order must remain an exact prefix.', { entry_id: base.entry_id, index: i }));
        continue;
      }
      for (const key of ENTRY_KEYS) if (current[key] !== base[key]) violations.push(violation('RETROACTIVE_HISTORICAL_MUTATION', 'Immutable historical field changed.', { entry_id: base.entry_id, field: key }));
      const old = base.amendments || [], next = current.amendments || [];
      const amendmentEqual = (a, b) => ['amendment_type', 'appended_at', 'appended_by', 'note'].every(key => a[key] === b[key]);
      if (old.length > next.length || old.some((item, index) => !next[index] || !amendmentEqual(item, next[index]))) violations.push(violation('HISTORICAL_AMENDMENT_CHANGED', 'Recorded amendments must retain an exact prefix.', { entry_id: base.entry_id }));
    }
  }
  function checkChronology(values, scope) {
    let previousSeq = 0, previousTs = null;
    for (const entry of values) {
      const seq = sequence(entry.t_sequence), ts = timestamp(entry.timestamp, 'timestamp');
      if (seq <= previousSeq) violations.push(violation('TEMPORAL_SEQUENCE_INVERSION', 'Sequence must strictly increase.', { entry_id: entry.entry_id, scope }));
      if (previousTs !== null && ts < previousTs) violations.push(violation('TEMPORAL_MONOTONICITY_INVERSION', 'Recording chronology moves backwards.', { entry_id: entry.entry_id, scope }));
      let amendmentTs = ts;
      for (const amendment of entry.amendments || []) {
        const nextTs = timestamp(amendment.appended_at, 'appended_at');
        if (nextTs < amendmentTs) violations.push(violation('AMENDMENT_CHRONOLOGY_INVERSION', 'Amendment precedes its record or predecessor amendment.', { entry_id: entry.entry_id, scope }));
        amendmentTs = nextTs;
      }
      previousSeq = seq; previousTs = ts;
    }
  }
  checkChronology(entries, 'CURRENT');
  if (baselineEntries !== null) checkChronology(baselineEntries, 'BASELINE');
  return freeze({ is_valid: violations.length === 0, input_valid: true, baseline_compared: baselineEntries !== null, entry_count: entries.length, validated_entries: entries.map(entry => entry.entry_id), violations });
}

export function auditServiceJourneyChronology(phases, requiredPhases = null) {
  try {
    dense(requiredPhases, 2, 32, 'required_phases');
    requiredPhases.forEach(key => identifier(key, 'phase'));
    if (new Set(requiredPhases).size !== requiredPhases.length) throw new TypeError('required_phases: duplicate phase');
    fields(phases, requiredPhases, [], 'phases');
    for (const key of requiredPhases) {
      const phase = phases[key];
      fields(phase, ['status', 'entry_id'], [], 'phase');
      if (!STATUSES.includes(phase.status)) throw new TypeError('phase: unsupported status');
      identifier(phase.entry_id, 'phase entry_id');
    }
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    return freeze({ input_valid: false, verdict: 'HELD', veto_applied: false, veto_authority: null, evaluations: {}, violations: [violation('INVALID_JOURNEY_INPUT', error.message)], rationale: 'Required ordered route evidence is missing or malformed.' });
  }
  const evaluations = Object.fromEntries(requiredPhases.map(key => [key, phases[key].status]));
  let earlierPass = false, veto = false;
  for (const key of requiredPhases) {
    if (phases[key].status === 'PASS') earlierPass = true;
    else if (earlierPass) veto = true;
  }
  const complete = requiredPhases.every(key => phases[key].status === 'PASS');
  return freeze({ input_valid: true, verdict: complete ? 'PASS' : 'HELD', veto_applied: veto, veto_authority: veto ? 'LOCAL_PASS_PLUS_GLOBAL_ROUTE_REGRESSION' : null, evaluations, violations: [], rationale: complete ? 'All required declared phases passed in the explicit route order.' : 'Local component success cannot mask failed, held, unknown or unperformed route phases.' });
}

export function runTemporalCustodianAudit(input) {
  const base = {
    schema: TEMPORAL_CUSTODIAN_SCHEMA, agent: 'TEMPORAL_CUSTODIAN', status: 'BOUNDED_RESEARCH_CANDIDATE',
    claim_ceiling: TEMPORAL_CUSTODIAN_CLAIM_CEILING,
    evidence_posture: { evidence_class: 'LOCAL_STRUCTURAL_TEST', input_observations: 'CALLER_DECLARED', baseline_authentication: 'UNVERIFIED', provider_origin_authenticated: false, clock_authenticated: false },
    authority: { execute: false, provider: false, merge: false, deployment: false, release: false, human_closure_required: true }
  };
  try {
    fields(input, ['schema', 'case_id', 'source_revision', 'coordinate', 'episode_id', 'ledger_entries', 'baseline_entries', 'required_phases', 'phases'], [], 'temporal input');
    if (input.schema !== TEMPORAL_CUSTODIAN_SCHEMA) throw new TypeError('temporal input: unsupported schema');
    identifier(input.case_id, 'case_id'); identifier(input.episode_id, 'episode_id'); text(input.coordinate, 160, 'coordinate');
    if (typeof input.source_revision !== 'string' || !/^[a-f0-9]{40}$/.test(input.source_revision)) throw new TypeError('temporal input: exact source revision required');
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    return freeze({ ...base, input_valid: false, verdict: 'HELD', ledger_audit: null, journey_audit: null, violations: [violation('INVALID_TEMPORAL_INPUT', error.message)] });
  }
  const identity = { case_id: input.case_id, source_revision: input.source_revision, coordinate: input.coordinate, episode_id: input.episode_id };
  const ledgerAudit = auditTemporalLedgerNonRetroactivity(input.ledger_entries, input.baseline_entries);
  const journeyAudit = auditServiceJourneyChronology(input.phases, input.required_phases);
  const violations = [...ledgerAudit.violations, ...journeyAudit.violations];
  if (!ledgerAudit.baseline_compared) violations.push(violation('BASELINE_REQUIRED', 'Non-retroactivity requires the retained baseline.'));
  if (ledgerAudit.input_valid && journeyAudit.input_valid) {
    let previous = -1;
    for (const key of input.required_phases) {
      const index = input.ledger_entries.findIndex(entry => entry.entry_id === input.phases[key].entry_id);
      if (index < 0 || index <= previous) violations.push(violation('PHASE_LEDGER_BINDING_INVALID', 'Each ordered phase requires its own ordered ledger entry.', { phase: key }));
      previous = index;
    }
  }
  const valid = ledgerAudit.input_valid && journeyAudit.input_valid && ledgerAudit.baseline_compared && !violations.some(item => item.type === 'PHASE_LEDGER_BINDING_INVALID');
  const verdict = ledgerAudit.input_valid && !ledgerAudit.is_valid ? 'FAIL' : !valid ? 'HELD' : journeyAudit.verdict;
  return freeze({ ...base, ...identity, input_valid: valid, verdict, ledger_audit: ledgerAudit, journey_audit: journeyAudit, violations });
}
