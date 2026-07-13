import { canonicalDigest } from '../dome-world/ash/canonical-json.js';

export const DOME_EXPERIMENT_RUN_SCHEMA = 'td613.dome-world.experiment-run/v0.1';
export const APERTURE_INSTRUMENT_ADAPTER_SCHEMA = 'td613.aperture.instrument-adapter-receipt/v0.1';
export const EXPERIMENT_RUN_DIGEST_DOMAIN = 'TD613:V31:EXPERIMENT-RUN:v1';
export const ADAPTER_RECEIPT_DIGEST_DOMAIN = 'TD613:V31:INSTRUMENT-ADAPTER:v1';

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
    operator_closure: { required: true, status: 'OPEN' },
    scope_statement: 'Dome-World experiment reference record; custody remains with each named station.',
    cannot_establish: ['identity', 'authorship', 'ownership', 'permission', 'external truth', 'total causation'],
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
    cannotEstablish = [],
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
    scope_statement: 'Declared observation or preflight adapter output only.',
    cannot_establish: [...new Set([
      ...cannotEstablish.map(String),
      'self-validation', 'identity', 'authorship', 'intent', 'external truth', 'runtime authority'
    ])],
    promotion_conditions: ['separate phase gate', 'adapter test', 'invariant receipt', 'operator approval'],
    operator_closure: { required: true, status: 'OPEN' },
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
  if (!run || run.schema !== DOME_EXPERIMENT_RUN_SCHEMA) return false;
  const expected = await canonicalDigest(EXPERIMENT_RUN_DIGEST_DOMAIN, digestSubject(run, 'run_digest'), options);
  return expected === run.run_digest;
}

export async function verifyInstrumentAdapterReceipt(receipt, options = {}) {
  if (!receipt || receipt.schema !== APERTURE_INSTRUMENT_ADAPTER_SCHEMA) return false;
  const expected = await canonicalDigest(ADAPTER_RECEIPT_DIGEST_DOMAIN, digestSubject(receipt, 'adapter_digest'), options);
  return expected === receipt.adapter_digest;
}
