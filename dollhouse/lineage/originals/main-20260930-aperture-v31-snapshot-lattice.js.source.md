import { digest, freeze, integer, randomId, ratio, recordDigest, text, uniqueStrings, verifyRecord } from './aperture-v31-core.js';

export const SNAPSHOT_LATTICE_SCHEMA = 'td613.aperture.snapshot-lattice/v0.2';
export const SNAPSHOT_LATTICE_LEGACY_SCHEMA = 'td613.aperture.snapshot-lattice/v0.1';
export const SNAPSHOT_LATTICE_DOMAIN = 'TD613:V31:SNAPSHOT-LATTICE:v2';
export const SNAPSHOT_LATTICE_LEGACY_DOMAIN = 'TD613:V31:SNAPSHOT-LATTICE:v1';
const STATES = new Set(['OBSERVED', 'NULL_RESULT', 'NOT_RUN', 'FAILED_INSTRUMENT', 'MISSING_OUTPUT', 'WITHHELD', 'INVALIDATED', 'OUTSIDE_SCOPE', 'UNKNOWN']);

function normalizeSnapshot(value, instrumentIds) {
  const state = value.state || 'OBSERVED';
  if (!STATES.has(state)) throw new Error('Unsupported snapshot state.');
  const instrumentId = text(value.instrumentId, 'Snapshot instrument ID');
  if (!instrumentIds.has(instrumentId)) throw new Error(`Snapshot references unknown instrument ${instrumentId}.`);
  const observedValue = value.observedValue == null ? null : integer(value.observedValue, 'Observed value');
  if (state === 'OBSERVED' && observedValue == null) throw new Error('Observed snapshot requires an integer observed value.');
  if (['NOT_RUN', 'FAILED_INSTRUMENT', 'MISSING_OUTPUT', 'WITHHELD', 'UNKNOWN'].includes(state) && observedValue != null) throw new Error(`${state} may not invent an observed value.`);
  return {
    snapshot_id: text(value.snapshotId, 'Snapshot ID'),
    source_commitment: value.sourceCommitment == null ? null : digest(value.sourceCommitment, 'Snapshot source commitment'),
    instrument_id: instrumentId,
    instrument_version: text(value.instrumentVersion, 'Snapshot instrument version'),
    time_index: integer(value.timeIndex, 'Time index', { min: 0 }),
    replicate: integer(value.replicate, 'Replicate', { min: 1 }),
    condition: text(value.condition, 'Condition'),
    environment: text(value.environment, 'Environment'),
    intervention_values: Object.fromEntries(Object.entries(value.interventionValues || {}).map(([key, item]) => [text(key, 'Intervention key'), integer(item, 'Intervention value')])),
    observed_value: observedValue,
    registered_event: value.registeredEvent == null ? null : String(value.registeredEvent),
    state,
    source_status: value.sourceStatus || 'OBSERVED',
    missingness: uniqueStrings(value.missingness),
    held_out: value.heldOut === true,
    benign_control: value.benignControl === true
  };
}

export async function compileSnapshotLattice({ source, ensemble, snapshots, declaredVariableCount, designRank, latticeId = null }, options = {}) {
  if (!Array.isArray(snapshots) || snapshots.length === 0) throw new Error('Snapshot lattice may not be empty.');
  const instrumentIds = new Set(ensemble.instruments.map(value => value.instrument_id));
  const entries = snapshots.map(value => normalizeSnapshot(value, instrumentIds));
  if (new Set(entries.map(value => value.snapshot_id)).size !== entries.length) throw new Error('Snapshot IDs must be unique.');
  const p = integer(declaredVariableCount, 'Declared variable count', { min: 1 });
  const rank = integer(designRank, 'Design rank', { min: 0, max: p });
  const usable = entries.filter(value => ['OBSERVED', 'NULL_RESULT'].includes(value.state));
  const groupCounts = new Map();
  usable.forEach(value => { const key = `${value.instrument_id}|${value.time_index}|${value.condition}`; groupCounts.set(key, (groupCounts.get(key) || 0) + 1); });
  const coverageState = rank === 0 ? 'COVERAGE_SINGULAR' : rank < p ? 'COVERAGE_PARTIAL' : entries.length > usable.length * 2 ? 'COVERAGE_REDUNDANT' : 'COVERAGE_BOUNDED_COMPLETE';
  const lattice = {
    schema: SNAPSHOT_LATTICE_SCHEMA,
    lattice_id: latticeId || randomId('atlattice_', options.cryptoImpl || globalThis.crypto),
    source_id: source.source_id,
    source_commitment: source.source_commitment,
    ensemble_id: ensemble.ensemble_id,
    ensemble_digest: ensemble.ensemble_digest,
    entries,
    snapshot_count: entries.length,
    usable_count: usable.length,
    missing_count: entries.length - usable.length,
    null_result_count: entries.filter(value => value.state === 'NULL_RESULT').length,
    heldout_count: entries.filter(value => value.held_out).length,
    benign_control_count: entries.filter(value => value.benign_control).length,
    time_count: new Set(entries.map(value => value.time_index)).size,
    environment_count: new Set(entries.map(value => value.environment)).size,
    replication_present: [...groupCounts.values()].some(value => value >= 2),
    coverage: { declared_variable_count: p, design_rank: rank, gamma: ratio(rank, p), state: coverageState },
    interpolation_performed: false,
    missing_states_preserved: true,
    source_status: 'SUPPLIED',
    evidence_basis: ['declared snapshot entries', 'design rank', 'preserved observation states'],
    observations: { snapshot_count: entries.length, usable_count: usable.length, coverage_state: coverageState },
    missingness: entries.filter(value => value.missingness.length).map(value => ({ snapshot_id: value.snapshot_id, values: value.missingness })),
    alternatives: [],
    open_questions: [],
    operator_notes: [],
    closure: { required: true, status: 'OPEN' },
    lattice_digest: null
  };
  lattice.lattice_digest = await recordDigest(SNAPSHOT_LATTICE_DOMAIN, lattice, 'lattice_digest', options);
  return freeze(lattice);
}

export const verifySnapshotLattice = (value, options = {}) => {
  if (value?.schema === SNAPSHOT_LATTICE_SCHEMA) return verifyRecord(SNAPSHOT_LATTICE_DOMAIN, value, 'lattice_digest', SNAPSHOT_LATTICE_SCHEMA, options);
  if (value?.schema === SNAPSHOT_LATTICE_LEGACY_SCHEMA) return verifyRecord(SNAPSHOT_LATTICE_LEGACY_DOMAIN, value, 'lattice_digest', SNAPSHOT_LATTICE_LEGACY_SCHEMA, options);
  return false;
};
