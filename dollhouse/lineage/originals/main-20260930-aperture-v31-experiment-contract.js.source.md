import { canonicalDigest } from '../dome-world/ash/canonical-json.js';

export const DOME_EXPERIMENT_RUN_SCHEMA = 'td613.dome-world.experiment-run/v0.2';
export const DOME_EXPERIMENT_RUN_LEGACY_SCHEMA = 'td613.dome-world.experiment-run/v0.1';
export const APERTURE_INSTRUMENT_ADAPTER_SCHEMA = 'td613.aperture.instrument-adapter-receipt/v0.2';
export const APERTURE_INSTRUMENT_ADAPTER_LEGACY_SCHEMA = 'td613.aperture.instrument-adapter-receipt/v0.1';
export const EXPERIMENT_RUN_DIGEST_DOMAIN = 'TD613:V31:EXPERIMENT-RUN:v2';
export const EXPERIMENT_RUN_LEGACY_DIGEST_DOMAIN = 'TD613:V31:EXPERIMENT-RUN:v1';
export const ADAPTER_RECEIPT_DIGEST_DOMAIN = 'TD613:V31:INSTRUMENT-ADAPTER:v2';
export const ADAPTER_RECEIPT_LEGACY_DIGEST_DOMAIN = 'TD613:V31:INSTRUMENT-ADAPTER:v1';

const SOURCE_STATUSES = new Set(['OBSERVED', 'SUPPLIED', 'DERIVED', 'SIMULATED', 'INFERRED', 'ATTESTED', 'UNRESOLVED']);
const ADAPTER_CLASSES = new Set(['EO-RFD', 'ACEDIT', 'KIRA', 'DECLARED_INSTRUMENT']);

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

function digestSubject(value, field) {
  const subject = clone(value);
  delete subject[field];
  return subject;
}

function digestPattern(value, label, { nullable = false } = {}) {
  if (nullable && value == null) return null;
  if (!/^sha256:[0-9a-f]{64}$/.test(String(value || ''))) throw new Error(`${label} must be a SHA-256 digest.`);
  return value;
}

function reference(value, pattern, label, { nullable = false } = {}) {
  if (nullable && value == null) return null;
  if (!pattern.test(String(value || ''))) throw new Error(`${label} is missing or malformed.`);
  return value;
}

export async function compileDomeExperimentRun(
  {
    sourceReceiptReference,
    preRegistrationDigest,
    instrumentEnsembleReference,
    snapshotBatchReference = null,
    flowcoreContextSeriesReference = null,
    tomographyReceiptReference = null,
    experimentId = null,
    createdAt = null
  },
  { cryptoImpl = globalThis.crypto, TextEncoderImpl = globalThis.TextEncoder } = {}
) {
  const run = {
    schema: DOME_EXPERIMENT_RUN_SCHEMA,
    experiment_id: experimentId || randomId('atx_', cryptoImpl),
    created_at: createdAt || new Date().toISOString(),
    time_posture: 'local-clock-not-trusted-time',
    state: tomographyReceiptReference ? 'RECONSTRUCTED' : snapshotBatchReference ? 'COLLECTING' : 'DECLARED',
    source_receipt_reference: reference(sourceReceiptReference, /^ashc_[A-Za-z0-9_-]{6,128}$/, 'Source receipt reference'),
    pre_registration_digest: digestPattern(preRegistrationDigest, 'Pre-registration digest'),
    instrument_ensemble_reference: reference(instrumentEnsembleReference, /^atens_[A-Za-z0-9_-]{6,128}$/, 'Instrument ensemble reference'),
    snapshot_batch_reference: reference(snapshotBatchReference, /^ashsnap_[A-Za-z0-9_-]{6,128}$/, 'Snapshot batch reference', { nullable: true }),
    flowcore_context_series_reference: reference(flowcoreContextSeriesReference, /^flowseries_[A-Za-z0-9_-]{6,128}$/, 'Flow-Core context series reference', { nullable: true }),
    tomography_receipt_reference: reference(tomographyReceiptReference, /^attomo_[A-Za-z0-9_-]{6,128}$/, 'Tomography receipt reference', { nullable: true }),
    station_ownership: {
      source_custody: 'Ash',
      context: 'Flow-Core',
      reconstruction: 'Aperture',
      experiment_host: 'Dome-World',
      closure: 'Human'
    },
    automatic_station_advance: false,
    automatic_ash_action: false,
    prediction_authorized: false,
    server_persistence: false,
    source_status: 'SUPPLIED',
    evidence_basis: ['station-owned receipt references', 'pre-registration digest'],
    observations: ['Dome-World hosts the run while named stations retain their records.'],
    missingness: [],
    alternatives: [],
    open_questions: [],
    operator_notes: [],
    closure: { required: true, status: 'OPEN' },
    run_digest: null,
    seal: '⟐'
  };
  run.run_digest = await canonicalDigest(
    EXPERIMENT_RUN_DIGEST_DOMAIN,
    digestSubject(run, 'run_digest'),
    { cryptoImpl, TextEncoderImpl }
  );
  return freeze(run);
}

export async function compileInstrumentAdapterReceipt(
  {
    adapterId,
    adapterClass,
    sourceStatus,
    inputContract,
    outputContract,
    transformationHistory = [],
    missingness = [],
    openQuestions = [],
    operationalState = 'interface_context',
    claimAuthority = 'design_signal',
    targetOperationalState = 'verified_runtime_installation',
    receiptId = null,
    createdAt = null
  },
  { cryptoImpl = globalThis.crypto, TextEncoderImpl = globalThis.TextEncoder } = {}
) {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{1,127}$/.test(String(adapterId || ''))) throw new Error('Adapter ID is missing or malformed.');
  if (!ADAPTER_CLASSES.has(adapterClass)) throw new Error('Unsupported adapter class.');
  if (!SOURCE_STATUSES.has(sourceStatus)) throw new Error('Unsupported adapter source status.');
  if (!String(inputContract || '').trim() || !String(outputContract || '').trim()) throw new Error('Adapter contracts are required.');
  const receipt = {
    schema: APERTURE_INSTRUMENT_ADAPTER_SCHEMA,
    receipt_id: receiptId || randomId('atadapter_', cryptoImpl),
    created_at: createdAt || new Date().toISOString(),
    time_posture: 'local-clock-not-trusted-time',
    adapter_id: adapterId,
    adapter_class: adapterClass,
    source_status: sourceStatus,
    input_contract: inputContract,
    output_contract: outputContract,
    transformation_history: [...transformationHistory].map(String),
    missingness: [...missingness].map(String),
    operational_state: operationalState,
    claim_authority: claimAuthority,
    target_operational_state: targetOperationalState,
    no_authority_transfer: true,
    automatic_model_selection: false,
    automatic_run_promotion: false,
    automatic_ash_action: false,
    evidence_basis: ['declared adapter contract', 'transformation history', 'recorded missingness'],
    observations: [],
    alternatives: [],
    open_questions: [...new Set(openQuestions.map(String))],
    operator_notes: [],
    closure: { required: true, status: 'OPEN' },
    adapter_digest: null,
    seal: '⟐'
  };
  receipt.adapter_digest = await canonicalDigest(
    ADAPTER_RECEIPT_DIGEST_DOMAIN,
    digestSubject(receipt, 'adapter_digest'),
    { cryptoImpl, TextEncoderImpl }
  );
  return freeze(receipt);
}

export async function verifyDomeExperimentRun(run, options = {}) {
  if (!run || ![DOME_EXPERIMENT_RUN_SCHEMA, DOME_EXPERIMENT_RUN_LEGACY_SCHEMA].includes(run.schema)) return false;
  const domain = run.schema === DOME_EXPERIMENT_RUN_SCHEMA ? EXPERIMENT_RUN_DIGEST_DOMAIN : EXPERIMENT_RUN_LEGACY_DIGEST_DOMAIN;
  const expected = await canonicalDigest(domain, digestSubject(run, 'run_digest'), options);
  return expected === run.run_digest;
}

export async function verifyInstrumentAdapterReceipt(receipt, options = {}) {
  if (!receipt || ![APERTURE_INSTRUMENT_ADAPTER_SCHEMA, APERTURE_INSTRUMENT_ADAPTER_LEGACY_SCHEMA].includes(receipt.schema)) return false;
  const domain = receipt.schema === APERTURE_INSTRUMENT_ADAPTER_SCHEMA ? ADAPTER_RECEIPT_DIGEST_DOMAIN : ADAPTER_RECEIPT_LEGACY_DIGEST_DOMAIN;
  const expected = await canonicalDigest(domain, digestSubject(receipt, 'adapter_digest'), options);
  return expected === receipt.adapter_digest;
}
