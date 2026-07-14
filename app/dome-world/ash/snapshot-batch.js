import { canonicalDigest } from './canonical-json.js';

export const ASH_SNAPSHOT_BATCH_SCHEMA = 'td613.ash.snapshot-batch-receipt/v0.2';
export const ASH_SNAPSHOT_BATCH_LEGACY_SCHEMA = 'td613.ash.snapshot-batch-receipt/v0.1';
export const ASH_SNAPSHOT_BATCH_DOMAIN = 'TD613:V31:ASH-SNAPSHOT-BATCH:v2';
export const ASH_SNAPSHOT_BATCH_LEGACY_DOMAIN = 'TD613:V31:ASH-SNAPSHOT-BATCH:v1';
export const SNAPSHOT_INCLUSION_STATES = Object.freeze([
  'INCLUDED', 'NULL_RESULT', 'MISSING', 'REJECTED', 'UNCAPTURED', 'ENCODER_REQUIRED'
]);

const SOURCE_STATUSES = new Set(['OBSERVED', 'SUPPLIED', 'DERIVED', 'SIMULATED', 'INFERRED', 'ATTESTED', 'UNRESOLVED']);
const INCLUSION_STATES = new Set(SNAPSHOT_INCLUSION_STATES);
const DIGEST = /^sha256:[0-9a-f]{64}$/;
const clone = value => JSON.parse(JSON.stringify(value));
const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze); return Object.freeze(value);
};
const digestSubject = value => { const subject = clone(value); delete subject.batch_digest; return subject; };
const randomId = cryptoImpl => {
  if (!cryptoImpl?.getRandomValues) throw new Error('Secure random values are unavailable.');
  const bytes = new Uint8Array(10); cryptoImpl.getRandomValues(bytes);
  return `ashsnap_${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}`;
};
const text = (value, label) => {
  const output = String(value || '').trim(); if (!output) throw new Error(`${label} is required.`); return output;
};

function normalizeSnapshot(entry) {
  const inclusion = String(entry.inclusionStatus || 'INCLUDED');
  const sourceStatus = String(entry.sourceStatus || 'UNRESOLVED');
  if (!INCLUSION_STATES.has(inclusion)) throw new Error('Unsupported snapshot inclusion status.');
  if (!SOURCE_STATUSES.has(sourceStatus)) throw new Error('Unsupported snapshot source status.');
  if (!Number.isSafeInteger(entry.trial) || entry.trial < 1) throw new Error('Snapshot trial must be a positive safe integer.');
  const observationDigest = entry.observationDigest == null ? null : String(entry.observationDigest);
  if (observationDigest && !DIGEST.test(observationDigest)) throw new Error('Observation digest must be SHA-256.');
  if (['MISSING', 'UNCAPTURED', 'ENCODER_REQUIRED'].includes(inclusion) && observationDigest) {
    throw new Error(`${inclusion} snapshots may not invent an observation digest.`);
  }
  return {
    snapshot_id: text(entry.snapshotId, 'Snapshot ID'),
    trial: entry.trial,
    temporal_coordinate: text(entry.temporalCoordinate, 'Temporal coordinate'),
    instrument_id: text(entry.instrumentId, 'Instrument ID'),
    source_status: sourceStatus,
    inclusion_status: inclusion,
    observation_reference: entry.observationReference == null ? null : text(entry.observationReference, 'Observation reference'),
    observation_digest: observationDigest,
    context_receipt_reference: entry.contextReceiptReference == null ? null : text(entry.contextReceiptReference, 'Context receipt reference'),
    missingness: [...new Set((entry.missingness || []).map(String))],
    operator_included: entry.operatorIncluded === true
  };
}

export async function compileAshSnapshotBatch({ experimentId, sourceReceiptReference, snapshots, batchId = null, createdAt = null }, options = {}) {
  if (!Array.isArray(snapshots) || snapshots.length === 0) throw new Error('Snapshot batch requires at least one declared snapshot.');
  const entries = snapshots.map(normalizeSnapshot);
  const ids = entries.map(entry => entry.snapshot_id);
  if (new Set(ids).size !== ids.length) throw new Error('Snapshot IDs must be unique.');
  const receipt = {
    schema: ASH_SNAPSHOT_BATCH_SCHEMA,
    batch_id: batchId || randomId(options.cryptoImpl || globalThis.crypto),
    created_at: createdAt || new Date().toISOString(),
    time_posture: 'local-clock-not-trusted-time',
    experiment_id: text(experimentId, 'Experiment ID'),
    source_receipt_reference: text(sourceReceiptReference, 'Source receipt reference'),
    entries,
    snapshot_count: entries.length,
    included_count: entries.filter(entry => entry.operator_included).length,
    unresolved_count: entries.filter(entry => !['INCLUDED', 'NULL_RESULT'].includes(entry.inclusion_status)).length,
    null_result_count: entries.filter(entry => entry.inclusion_status === 'NULL_RESULT').length,
    raw_observation_content_present: false,
    artifact_digest_present: false,
    server_persistence: false,
    automatic_exclusion: false,
    automatic_ash_action: false,
    source_status: 'SUPPLIED', evidence_basis: ['declared snapshot entries', 'operator inclusion states'],
    observations: [], missingness: entries.filter(entry => entry.missingness.length).map(entry => ({ snapshot_id: entry.snapshot_id, values: entry.missingness })), alternatives: [], open_questions: [], operator_notes: [], closure: { required: true, status: 'OPEN' },
    batch_digest: null
  };
  receipt.batch_digest = await canonicalDigest(ASH_SNAPSHOT_BATCH_DOMAIN, digestSubject(receipt), options);
  return freeze(receipt);
}

export async function verifyAshSnapshotBatch(receipt, options = {}) {
  if (!receipt || ![ASH_SNAPSHOT_BATCH_SCHEMA, ASH_SNAPSHOT_BATCH_LEGACY_SCHEMA].includes(receipt.schema)) return false;
  const domain = receipt.schema === ASH_SNAPSHOT_BATCH_SCHEMA ? ASH_SNAPSHOT_BATCH_DOMAIN : ASH_SNAPSHOT_BATCH_LEGACY_DOMAIN;
  return receipt.batch_digest === await canonicalDigest(domain, digestSubject(receipt), options);
}
