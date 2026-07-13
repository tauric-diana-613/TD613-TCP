import { canonicalDigest } from '../dome-world/ash/canonical-json.js';

export const FLOWCORE_CONTEXT_SERIES_SCHEMA = 'td613.flowcore.context-series/v0.1';
export const FLOWCORE_CONTEXT_RECEIPT_SCHEMA = 'td613.flowcore.context-receipt/v0.1';
export const FLOWCORE_CONTEXT_SERIES_DIGEST_DOMAIN = 'TD613:V31:FLOWCORE-CONTEXT-SERIES:v1';

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}

function randomId(prefix, cryptoImpl = globalThis.crypto) {
  if (!cryptoImpl?.getRandomValues) throw new Error('Secure random values are unavailable.');
  const bytes = new Uint8Array(10);
  cryptoImpl.getRandomValues(bytes);
  return `${prefix}${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}`;
}

function digestSubject(value) {
  const subject = clone(value);
  delete subject.series_digest;
  return subject;
}

function validateContextReceipt(receipt) {
  if (!receipt || receipt.schema !== FLOWCORE_CONTEXT_RECEIPT_SCHEMA) throw new Error('Context series requires Flow-Core v0.1 receipts.');
  if (!/^flowctx_[A-Za-z0-9_-]{6,128}$/.test(String(receipt.receipt_id || ''))) throw new Error('Context receipt ID is missing or malformed.');
  if (receipt.artifact_reference !== null || receipt.artifact_blind !== true) throw new Error('Context series must remain artifact-blind.');
  if (receipt.automatic_ash_action !== false || receipt.prediction_authorized !== false) throw new Error('Context receipt exceeds Flow-Core authority.');
  if (!['OPEN', 'ABSTAIN'].includes(receipt.status)) throw new Error('Unsupported Flow-Core context status.');
}

export async function compileFlowcoreContextSeries(
  { experimentId, snapshots = [], seriesId = null, createdAt = null },
  { cryptoImpl = globalThis.crypto, TextEncoderImpl = globalThis.TextEncoder } = {}
) {
  if (!/^atx_[A-Za-z0-9_-]{6,128}$/.test(String(experimentId || ''))) throw new Error('Experiment ID is missing or malformed.');
  if (!Array.isArray(snapshots) || !snapshots.length) throw new Error('Context series requires at least one snapshot entry.');
  const seenSnapshots = new Set();
  const seenReceipts = new Set();
  const entries = snapshots.map((entry, index) => {
    const snapshotId = String(entry?.snapshot_id || '');
    if (!/^atsnap_[A-Za-z0-9_-]{6,128}$/.test(snapshotId)) throw new Error(`Snapshot ${index} ID is missing or malformed.`);
    if (seenSnapshots.has(snapshotId)) throw new Error(`Duplicate snapshot ID: ${snapshotId}`);
    seenSnapshots.add(snapshotId);
    const receipt = entry.context_receipt;
    validateContextReceipt(receipt);
    if (seenReceipts.has(receipt.receipt_id)) throw new Error(`Duplicate context receipt ID: ${receipt.receipt_id}`);
    seenReceipts.add(receipt.receipt_id);
    return {
      snapshot_id: snapshotId,
      context_receipt_reference: receipt.receipt_id,
      diagnostic_receipt_reference: receipt.diagnostic_receipt_reference || null,
      source_status: receipt.source_status || (receipt.status === 'ABSTAIN' ? 'UNRESOLVED' : 'DERIVED'),
      status: receipt.status,
      context_posture: receipt.context_posture,
      missingness: [...(receipt.missingness || [])].map(String),
      artifact_reference: null
    };
  });
  const abstentions = entries.filter(entry => entry.status === 'ABSTAIN').length;
  const series = {
    schema: FLOWCORE_CONTEXT_SERIES_SCHEMA,
    series_id: seriesId || randomId('flowseries_', cryptoImpl),
    experiment_id: experimentId,
    created_at: createdAt || new Date().toISOString(),
    time_posture: 'local-clock-not-trusted-time',
    status: abstentions === entries.length ? 'ABSTAIN' : abstentions ? 'PARTIAL' : 'OPEN',
    entries,
    snapshot_count: entries.length,
    abstention_count: abstentions,
    missing_snapshot_count: entries.filter(entry => entry.missingness.length).length,
    artifact_reference: null,
    artifact_digest_present: false,
    observation_content_present: false,
    artifact_blind: true,
    recommendation_not_command: true,
    automatic_ash_action: false,
    prediction_authorized: false,
    server_persistence: false,
    scope_statement: 'Index of artifact-blind Flow-Core context receipt references for declared snapshots.',
    cannot_establish: ['artifact identity', 'authorship', 'intent', 'external truth', 'prediction'],
    operator_closure: { required: true, status: 'OPEN' },
    series_digest: null,
    seal: '⟐'
  };
  series.series_digest = await canonicalDigest(
    FLOWCORE_CONTEXT_SERIES_DIGEST_DOMAIN,
    digestSubject(series),
    { cryptoImpl, TextEncoderImpl }
  );
  return freeze(series);
}

export async function verifyFlowcoreContextSeries(series, options = {}) {
  if (!series || series.schema !== FLOWCORE_CONTEXT_SERIES_SCHEMA) return false;
  const expected = await canonicalDigest(FLOWCORE_CONTEXT_SERIES_DIGEST_DOMAIN, digestSubject(series), options);
  return expected === series.series_digest;
}
